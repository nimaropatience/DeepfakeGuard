"""WebSocket endpoint for live webcam analysis."""

import json
import random
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.registry import model_registry

router = APIRouter()


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
                # Real inference would decode the JPEG, detect faces,
                # run spatial branch, and return score + bounding box
                result = {"error": "Real inference not implemented"}

            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        pass
