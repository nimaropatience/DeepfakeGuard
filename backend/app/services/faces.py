"""MTCNN face detection and cropping to 256x256."""

import threading
from typing import Optional

import cv2
import numpy as np
from PIL import Image

_mtcnn = None
_lock = threading.Lock()


def _get_mtcnn():
    """Create the detector once and reuse it (building it per request is slow)."""
    global _mtcnn
    if _mtcnn is None:
        try:
            from facenet_pytorch import MTCNN
            import torch
        except ImportError:
            raise RuntimeError("facenet-pytorch is required: pip install facenet-pytorch")
        _mtcnn = MTCNN(
            keep_all=False,
            device=torch.device("cpu"),
            select_largest=True,
            post_process=False,
        )
    return _mtcnn


def detect_face_box(rgb: np.ndarray) -> Optional[tuple[int, int, int, int]]:
    """Return (x1, y1, x2, y2) of the main face in an RGB frame, or None."""
    with _lock:
        boxes, _ = _get_mtcnn().detect(Image.fromarray(rgb))
    if boxes is None or len(boxes) == 0:
        return None
    x1, y1, x2, y2 = boxes[0].astype(int)
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(rgb.shape[1], x2), min(rgb.shape[0], y2)
    if (x2 - x1) < 10 or (y2 - y1) < 10:
        return None
    return int(x1), int(y1), int(x2), int(y2)


def crop_face(rgb: np.ndarray, box, crop_size: int = 256, margin: float = 0.0) -> np.ndarray:
    """Crop a detected box (optionally enlarged by `margin`) and resize to crop_size."""
    x1, y1, x2, y2 = box
    if margin > 0:
        mx, my = int((x2 - x1) * margin), int((y2 - y1) * margin)
        x1, y1 = max(0, x1 - mx), max(0, y1 - my)
        x2, y2 = min(rgb.shape[1], x2 + mx), min(rgb.shape[0], y2 + my)
    face = Image.fromarray(rgb[y1:y2, x1:x2]).resize((crop_size, crop_size))
    return np.asarray(face)


def detect_and_crop_faces(
    frames: list[np.ndarray],
    crop_size: int = 256,
    margin: float = 0.0,
) -> list[Optional[np.ndarray]]:
    """
    Detect the main face in each BGR frame and return RGB crops resized to
    crop_size x crop_size. A frame with no face gives None.

    margin defaults to 0 because the training notebook cropped the raw MTCNN
    box with no margin; a different crop here would shift the model's scores.
    """
    crops = []
    for frame in frames:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        box = detect_face_box(rgb)
        crops.append(crop_face(rgb, box, crop_size, margin) if box else None)
    return crops
