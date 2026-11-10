"""
Real analysis pipeline: sampled frames -> face crops -> trained CNN -> Grad-CAM.

Used for both video uploads (16 sampled frames) and single images (1 frame).
The verdict comes from the CNN alone. Eye-aspect-ratio values are measured and
returned for the chart, but they do not influence the verdict.
"""

import math
import os
import time
from datetime import datetime
from typing import Callable, Optional

import cv2
import numpy as np

from app.models.registry import model_registry
from app.models.schemas import AnalysisResult, EyeMetrics, FrameScore, GradCamFrame
from app.services.faces import detect_and_crop_faces
from app.services.torch_models import gradcam, predict_logits

StageFn = Optional[Callable[[str, float], None]]


class NoFaceError(ValueError):
    """Raised when no face can be found in the uploaded media."""


def verdict_for(probability: float, threshold: float) -> str:
    if probability > threshold + 0.1:
        return "Likely Fake"
    if probability < threshold - 0.1:
        return "Likely Real"
    return "Inconclusive"


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def _eye_metrics(crops: list, is_image: bool) -> EyeMetrics:
    n = len(crops)
    try:
        from app.services.eye import extract_ear_sequence

        m = extract_ear_sequence(crops)
        m["eye_verdict"] = (
            "N/A (single image)" if is_image else "Reference only (not used in the verdict)"
        )
        return EyeMetrics(**m)
    except Exception as e:  # the eye chart is optional; never fail the analysis over it
        print(f"  [eye] skipped: {e}")
        zeros = [0.0] * n
        return EyeMetrics(
            ear_left=zeros, ear_right=zeros, lr_difference=zeros,
            ear_std_dev=0.0, ear_range=0.0, blink_count=0, eye_verdict="Unavailable",
        )


def _save_gradcam(model, crops, scored, job_id: str, timestamps, top_k: int = 5) -> list[GradCamFrame]:
    """Heatmaps for the top_k highest-scoring frames. scored = [(frame_pos, prob), ...]."""
    out_dir = os.path.join("outputs", "gradcam", job_id)
    os.makedirs(out_dir, exist_ok=True)
    frames = []
    for rank, (pos, prob) in enumerate(sorted(scored, key=lambda s: s[1], reverse=True)[:top_k]):
        crop = crops[pos]
        cam = gradcam(model, crop)
        heat = cv2.applyColorMap((cam * 255).astype(np.uint8), cv2.COLORMAP_JET)  # BGR
        bgr = cv2.cvtColor(crop, cv2.COLOR_RGB2BGR)
        overlay = cv2.addWeighted(bgr, 0.6, heat, 0.4, 0)
        cv2.imwrite(os.path.join(out_dir, f"frame_{rank}_original.jpg"), bgr)
        cv2.imwrite(os.path.join(out_dir, f"frame_{rank}_heatmap.jpg"), overlay)
        frames.append(
            GradCamFrame(
                frame_index=pos,
                timestamp=timestamps[pos],
                score=round(prob, 4),
                original_url=f"/outputs/gradcam/{job_id}/frame_{rank}_original.jpg",
                heatmap_url=f"/outputs/gradcam/{job_id}/frame_{rank}_heatmap.jpg",
            )
        )
    return frames


def analyze_frames(
    frames_bgr: list[np.ndarray],
    timestamps: list[float],
    meta: dict,
    model_id: str,
    threshold: float,
    job_id: str,
    file_sha256: str,
    on_stage: StageFn = None,
    is_image: bool = False,
) -> AnalysisResult:
    """Run the full pipeline on already-decoded frames and build the API result."""
    t0 = time.time()
    stage = on_stage or (lambda name, progress: None)

    used_id, model = model_registry.get_torch_model(model_id)
    info = model_registry.get_model_info(used_id)

    stage("Detecting faces (MTCNN)", 0.25)
    crops = detect_and_crop_faces(frames_bgr)
    valid = [i for i, c in enumerate(crops) if c is not None]
    if not valid:
        raise NoFaceError(
            "No face was detected in this file. Use a clip or image where one face is clearly visible."
        )

    stage("Computing eye features", 0.4)
    eye = _eye_metrics(crops, is_image)

    stage(f"Running {info.name if info else used_id}", 0.6)
    logits = predict_logits(model, [crops[i] for i in valid])
    probs = _sigmoid(logits.astype(np.float64))
    if not np.all(np.isfinite(probs)):
        raise RuntimeError("The model produced a non-finite score for this file.")

    # Video score = mean of frame probabilities, the same rule the notebook evaluates with
    probability = float(probs.mean())
    p = min(max(probability, 1e-6), 1 - 1e-6)
    scored = [(pos, float(pr)) for pos, pr in zip(valid, probs)]

    stage("Generating Grad-CAM", 0.8)
    gradcam_frames = _save_gradcam(model, crops, scored, job_id, timestamps)

    stage("Preparing results", 0.95)
    return AnalysisResult(
        id=job_id,
        verdict=verdict_for(probability, threshold),
        probability=round(probability, 4),
        threshold=threshold,
        raw_logit=round(math.log(p / (1 - p)), 3),
        device="CPU",
        model_id=used_id,
        total_frames=meta["total_frames"],
        fps=meta["fps"],
        frames_sampled=len(frames_bgr),
        faces_detected=f"{len(valid)}/{len(frames_bgr)}",
        duration=meta["duration"],
        resolution=meta["resolution"],
        processing_time=round(time.time() - t0, 2),
        timestamp=datetime.utcnow().isoformat(),
        file_sha256=file_sha256,
        per_frame_scores=[
            FrameScore(frame_index=pos, timestamp=timestamps[pos], score=round(pr, 4))
            for pos, pr in scored
        ],
        gradcam_frames=gradcam_frames,
        eye_metrics=eye,
        demo_mode=False,
    )
