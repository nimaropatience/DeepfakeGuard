"""WebSocket endpoint for live webcam analysis."""

import json
import random
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.concurrency import run_in_threadpool

from app.models.registry import model_registry

router = APIRouter()

NO_BOX = {"x": 0, "y": 0, "width": 0, "height": 0}


def _score_frame(data: bytes) -> dict:
    """Decode one JPEG frame, find the face, and score it with the loaded model."""
    import cv2
    import numpy as np

    from app.services.faces import crop_face, detect_face_box
    from app.services.torch_models import predict_logits

    t0 = time.time()
    frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return {"score": 0.0, "verdict": "Unreadable frame", "face_box": NO_BOX, "fps": 0.0}

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    box = detect_face_box(rgb)
    if box is None:
        fps = round(1.0 / max(time.time() - t0, 1e-3), 1)
        return {"score": 0.0, "verdict": "No face", "face_box": NO_BOX, "fps": fps}

    used_id, model = model_registry.get_torch_model("efficientnet_b4")
    logit = float(predict_logits(model, [crop_face(rgb, box)])[0])
    score = 1.0 / (1.0 + np.exp(-logit))
    x1, y1, x2, y2 = box
    return {
        "score": round(float(score), 3),
        "verdict": "Likely Fake" if score > 0.5 else "Likely Real",
        "face_box": {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1},
        "fps": round(1.0 / max(time.time() - t0, 1e-3), 1),
        "model_id": used_id,
        "demo_mode": False,
    }


@router.websocket("/ws/live")
async def live_analysis(websocket: WebSocket):
    """
    Receive JPEG frames from the browser webcam.
    Return per-frame score and face bounding box.
    """
    await websocket.accept()

    try:
        while True:
            # Receive a JPEG frame as bytes
            data = await websocket.receive_bytes()

            if model_registry.demo_mode:
                # Simulate inference with random scores
                score = round(random.uniform(0.1, 0.9), 3)
                result = {
                    "score": score,
                    "verdict": "Likely Fake" if score > 0.5 else "Likely Real",
                    "face_box": {
                        "x": 120 + random.randint(-10, 10),
                        "y": 80 + random.randint(-10, 10),
                        "width": 200 + random.randint(-5, 5),
                        "height": 240 + random.randint(-5, 5),
                    },
                    "fps": round(random.uniform(8, 15), 1),
                    "demo_mode": True,
                }
            else:
                try:
                    result = await run_in_threadpool(_score_frame, data)
                except Exception as e:
                    result = {"score": 0.0, "verdict": "Error", "face_box": NO_BOX,
                              "fps": 0.0, "error": str(e)}

            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        pass
