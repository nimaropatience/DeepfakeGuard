
"""Video decoding and uniform frame sampling."""

import cv2
import numpy as np


def sample_frames(video_path: str, num_frames: int = 16) -> list[np.ndarray]:
    """
    Decode a video and uniformly sample num_frames across its duration.
    Returns a list of BGR numpy arrays.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    if total_frames <= 0:
        raise ValueError("Video has no frames")

    # Calculate uniform sample indices
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)

    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(frame)

    cap.release()

    if len(frames) == 0:
        raise ValueError("No frames could be read from video")

    return frames


def get_video_metadata(video_path: str) -> dict:
    """Extract video metadata: total frames, FPS, duration, resolution."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    metadata = {
        "total_frames": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "fps": round(cap.get(cv2.CAP_PROP_FPS), 2),
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
    }
    metadata["duration"] = round(
        metadata["total_frames"] / metadata["fps"], 2
    ) if metadata["fps"] > 0 else 0.0
    metadata["resolution"] = f"{metadata['width']}x{metadata['height']}"

    cap.release()
    return metadata


