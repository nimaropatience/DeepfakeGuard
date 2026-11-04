"""
Demo mode: generates realistic mock results when ONNX weights are not available.
Includes simulated EAR data with blink patterns and placeholder Grad-CAM paths.
"""

import hashlib
import math
import os
import random
import time
from datetime import datetime

from app.models.schemas import (
    AnalysisResult,
    FrameScore,
    GradCamFrame,
    EyeMetrics,
)


def _hex(c: str) -> tuple:
    return tuple(int(c[i : i + 2], 16) for i in (1, 3, 5))


# Diagonal colour stops (position 0-1, colour) matching the frontend design
_ORIGINAL_STOPS = [(0.0, _hex("#D6D2CA")), (0.5, _hex("#C9C5BC")), (1.0, _hex("#B9B5AB"))]
_HEATMAP_STOPS = [
    (0.0, _hex("#D8D4CC")),
    (0.35, _hex("#E4CBC6")),
    (0.62, _hex("#D9827A")),
    (0.82, _hex("#E6C9C3")),
    (1.0, _hex("#D6D6CB")),
]


def _gradient_image(stops: list, size: int = 256, shift: float = 0.0):
    """Top-left to bottom-right gradient through the given colour stops."""
    from PIL import Image

    def colour_at(t: float) -> tuple:
        t = min(1.0, max(0.0, t))
        for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
            if t <= p1:
                k = (t - p0) / (p1 - p0) if p1 > p0 else 0.0
                return tuple(round(a + (b - a) * k) for a, b in zip(c0, c1))
        return stops[-1][1]

    # Precompute one colour per diagonal, then fill pixels from it
    diagonal = [colour_at(d / (2 * (size - 1)) + shift) for d in range(2 * size - 1)]
    img = Image.new("RGB", (size, size))
    img.putdata([diagonal[x + y] for y in range(size) for x in range(size)])
    return img


def generate_demo_gradcam_images(job_id: str, num_frames: int = 5) -> None:
    """Create placeholder frame and heatmap images for demo mode."""
    gradcam_dir = os.path.join("outputs", "gradcam", job_id)
    os.makedirs(gradcam_dir, exist_ok=True)

    try:
        for i in range(num_frames):
            # Shift the hotspot slightly per frame so they are not identical
            shift = random.uniform(-0.06, 0.06)
            _gradient_image(_ORIGINAL_STOPS).save(
                os.path.join(gradcam_dir, f"frame_{i}_original.jpg"), quality=90
            )
            _gradient_image(_HEATMAP_STOPS, shift=shift).save(
                os.path.join(gradcam_dir, f"frame_{i}_heatmap.jpg"), quality=90
            )
    except ImportError:
        # Without Pillow no files are written; the frontend shows
        # gradient placeholders when the images fail to load.
        pass


def generate_demo_result(
    filename: str,
    model_id: str = "hybrid_fusion",
    threshold: float = 0.5,
    job_id: str = "demo",
) -> AnalysisResult:
    """Generate a realistic mock analysis result."""

    # Simulate a FAKE verdict with high probability
    is_fake = random.random() > 0.3
    if is_fake:
        probability = round(random.uniform(0.72, 0.95), 4)
    else:
        probability = round(random.uniform(0.08, 0.35), 4)

    raw_logit = round(math.log(probability / (1 - probability)), 3)
    verdict = (
        "Likely Fake"
        if probability > threshold + 0.1
        else "Likely Real"
        if probability < threshold - 0.1
        else "Inconclusive"
    )

    # Simulated video metadata
    total_frames = random.choice([240, 300, 360, 450, 600])
    fps = random.choice([24.0, 25.0, 29.97, 30.0])
    duration = round(total_frames / fps, 2)
    frames_sampled = 16
    faces_found = random.randint(14, 16)
    width, height = random.choice([(1920, 1080), (1280, 720), (640, 480)])

    # Per-frame scores
    per_frame_scores = []
    for i in range(frames_sampled):
        t = round(i * duration / frames_sampled, 2)
        # Scores cluster around the overall probability with some variation
        score = round(
            max(0.0, min(1.0, probability + random.gauss(0, 0.06))), 4
        )
        per_frame_scores.append(
            FrameScore(frame_index=i, timestamp=t, score=score)
        )

    # Sort by score descending for Grad-CAM selection
    top_frames = sorted(per_frame_scores, key=lambda f: f.score, reverse=True)[:5]

    # Generate placeholder Grad-CAM images
    generate_demo_gradcam_images(job_id, num_frames=5)

    gradcam_frames = []
    for idx, frame in enumerate(top_frames):
        gradcam_frames.append(
            GradCamFrame(
                frame_index=frame.frame_index,
                timestamp=frame.timestamp,
                score=frame.score,
                original_url=f"/outputs/gradcam/{job_id}/frame_{idx}_original.jpg",
                heatmap_url=f"/outputs/gradcam/{job_id}/frame_{idx}_heatmap.jpg",
            )
        )

    # Simulated EAR data for 16 frames
    # Deepfakes tend to have very low variability (no real blinks)
    if is_fake:
        base_ear = random.uniform(0.22, 0.28)
        ear_left = [round(base_ear + random.gauss(0, 0.008), 4) for _ in range(16)]
        ear_right = [round(base_ear + random.gauss(0, 0.008), 4) for _ in range(16)]
        blink_count = 0
        eye_verdict = "Suspicious: very low eye-movement variability"
    else:
        base_ear = random.uniform(0.25, 0.32)
        ear_left = [round(base_ear + random.gauss(0, 0.025), 4) for _ in range(16)]
        ear_right = [round(base_ear + random.gauss(0, 0.025), 4) for _ in range(16)]
        # Insert 1-2 blinks (EAR drops below 0.15)
        blink_frames = random.sample(range(3, 14), random.randint(1, 2))
        for bf in blink_frames:
            ear_left[bf] = round(random.uniform(0.08, 0.14), 4)
            ear_right[bf] = round(random.uniform(0.08, 0.14), 4)
        blink_count = len(blink_frames)
        eye_verdict = "Normal"

    lr_difference = [round(abs(l - r), 4) for l, r in zip(ear_left, ear_right)]

    import numpy as np

    all_ears = ear_left + ear_right
    ear_std = round(float(np.std(all_ears)), 4)
    ear_range_val = round(float(max(all_ears) - min(all_ears)), 4)

    eye_metrics = EyeMetrics(
        ear_left=ear_left,
        ear_right=ear_right,
        lr_difference=lr_difference,
        ear_std_dev=ear_std,
        ear_range=ear_range_val,
        blink_count=blink_count,
        eye_verdict=eye_verdict,
    )

    # File hash (simulated)
    file_hash = hashlib.sha256(
        f"{filename}-{time.time()}".encode()
    ).hexdigest()

    processing_time = round(random.uniform(1.8, 4.2), 2)

    return AnalysisResult(
        verdict=verdict,
        probability=probability,
        threshold=threshold,
        raw_logit=raw_logit,
        device="CPU",
        model_id=model_id,
        total_frames=total_frames,
        fps=fps,
        frames_sampled=frames_sampled,
        faces_detected=f"{faces_found}/{frames_sampled}",
        duration=duration,
        resolution=f"{width}x{height}",
        processing_time=processing_time,
        timestamp=datetime.utcnow().isoformat(),
        file_sha256=file_hash,
        per_frame_scores=per_frame_scores,
        gradcam_frames=gradcam_frames,
        eye_metrics=eye_metrics,
        demo_mode=True,
    )
