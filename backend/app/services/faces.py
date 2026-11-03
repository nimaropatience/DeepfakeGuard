"""MTCNN face detection and cropping to 256x256."""

import cv2
import numpy as np


def detect_and_crop_faces(
    frames: list[np.ndarray],
    crop_size: int = 256,
    margin: float = 0.3,
) -> list[np.ndarray]:
    """
    Detect faces in each frame using MTCNN, crop with margin,
    and resize to crop_size x crop_size.
    Returns list of cropped face images (RGB).
    """
    try:
        from facenet_pytorch import MTCNN
        import torch

        device = torch.device("cpu")
        mtcnn = MTCNN(
            keep_all=False,
            device=device,
            select_largest=True,
            post_process=False,
        )
    except ImportError:
        raise RuntimeError("facenet-pytorch is required: pip install facenet-pytorch")

    crops = []
    for frame in frames:
        # Convert BGR to RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detect face bounding box
        boxes, probs = mtcnn.detect(rgb)

        if boxes is not None and len(boxes) > 0:
            # Take the highest-confidence face
            box = boxes[0].astype(int)
            x1, y1, x2, y2 = box

            # Add margin
            w = x2 - x1
            h = y2 - y1
            mx = int(w * margin)
            my = int(h * margin)
            x1 = max(0, x1 - mx)
            y1 = max(0, y1 - my)
            x2 = min(rgb.shape[1], x2 + mx)
            y2 = min(rgb.shape[0], y2 + my)

            face = rgb[y1:y2, x1:x2]
            face = cv2.resize(face, (crop_size, crop_size))
            crops.append(face)
        else:
            # No face detected in this frame; skip it
            crops.append(None)

    return crops
