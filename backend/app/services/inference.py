"""ONNX Runtime inference for the model registry."""

import numpy as np

from app.models.registry import model_registry


def run_inference(
    face_crops: list[np.ndarray],
    ear_sequence: dict,
    model_id: str = "hybrid_fusion",
) -> dict:
    """
    Run inference on face crops and EAR sequence.
    Returns probability, raw logit, and per-frame scores.
    """
    sessions = model_registry.get_session(model_id)
    if sessions is None:
        raise RuntimeError(f"Model {model_id} not loaded")

    # Preprocess face crops into batch tensor
    # Expected input: (N, 3, 256, 256) float32, ImageNet-normalized
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    batch = []
    for crop in face_crops:
        if crop is None:
            continue
        img = crop.astype(np.float32) / 255.0
        img = (img - mean) / std
        img = np.transpose(img, (2, 0, 1))  # HWC -> CHW
        batch.append(img)

    if len(batch) == 0:
        return {"error": "No valid face crops to process"}

    batch_array = np.stack(batch).astype(np.float32)

    if model_id == "hybrid_fusion" and "hybrid_fusion" in sessions:
        # Single-file hybrid model
        session = sessions["hybrid_fusion"]
        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: batch_array})
        logits = outputs[0]

    elif model_id == "hybrid_fusion":
        # Split model: spatial + temporal + fusion
        spatial_session = sessions.get("efficientnet_b4_spatial")
        temporal_session = sessions.get("eye_lstm_temporal")
        fusion_session = sessions.get("fusion_head")

        if not all([spatial_session, temporal_session, fusion_session]):
            raise RuntimeError("Missing split model components")

        # Spatial branch: (N, 3, 256, 256) -> (N, 1792)
        spatial_in = spatial_session.get_inputs()[0].name
        spatial_out = spatial_session.run(None, {spatial_in: batch_array})[0]

        # Temporal branch: EAR sequence -> (1, 32)
        ear_input = np.array(
            [ear_sequence["ear_left"], ear_sequence["ear_right"]],
            dtype=np.float32,
        ).T  # (16, 2)
        ear_input = ear_input[np.newaxis, ...]  # (1, 16, 2)
        temporal_in = temporal_session.get_inputs()[0].name
        temporal_out = temporal_session.run(None, {temporal_in: ear_input})[0]

        # Pool spatial across frames: mean pooling -> (1, 1792)
        spatial_pooled = np.mean(spatial_out, axis=0, keepdims=True)

        # Concatenate: (1, 1824)
        fused = np.concatenate([spatial_pooled, temporal_out], axis=1)

        # Fusion head: (1, 1824) -> (1, 1)
        fusion_in = fusion_session.get_inputs()[0].name
        logits = fusion_session.run(None, {fusion_in: fused})[0]

    elif "efficientnet_b4_spatial" in sessions:
        # Spatial-only baseline
        session = sessions["efficientnet_b4_spatial"]
        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: batch_array})
        logits = outputs[0]

    elif "mesonet4_baseline" in sessions:
        # MesoNet-4 baseline
        session = sessions["mesonet4_baseline"]
        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: batch_array})
        logits = outputs[0]

    else:
        raise RuntimeError(f"No session found for model {model_id}")

    # Sigmoid to get probability
    def sigmoid(x):
        return 1.0 / (1.0 + np.exp(-x))

    prob = float(sigmoid(np.mean(logits)))
    raw_logit = float(np.mean(logits))

    # Per-frame scores
    per_frame = []
    for i, logit in enumerate(logits.flatten()):
        per_frame.append({
            "frame_index": i,
            "score": float(sigmoid(logit)),
        })

    return {
        "probability": round(prob, 4),
        "raw_logit": round(raw_logit, 3),
        "per_frame_scores": per_frame,
    }
