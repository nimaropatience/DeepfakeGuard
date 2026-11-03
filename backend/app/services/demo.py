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


def generate_demo_gradcam_images(job_id: str, num_frames: int = 5) -> None:
    """Create simple placeholder heatmap images for demo mode."""
    gradcam_dir = os.path.join("outputs", "gradcam", job_id)
    os.makedirs(gradcam_dir, exist_ok=True)

    try:
        from PIL import Image, ImageDraw

        for i in range(num_frames):
            # Original: grey placeholder with face outline
            orig = Image.new("RGB", (256, 256), (200, 196, 188))
            draw = ImageDraw.Draw(orig)
            draw.ellipse([64, 48, 192, 208], outline=(120, 120, 120), width=2)
            draw.text((90, 240), f"Frame {i+1}", fill=(100, 100, 100))
            orig.save(os.path.join(gradcam_dir, f"frame_{i}_original.jpg"))

            # Heatmap: warm overlay simulating Grad-CAM
            heatmap = Image.new("RGB", (256, 256), (200, 196, 188))
            draw_h = ImageDraw.Draw(heatmap)
            draw_h.ellipse([64, 48, 192, 208], outline=(120, 120, 120), width=2)
            # Red hotspot around nose/mouth area (typical Grad-CAM region)
            for r in range(40, 0, -2):
                alpha = int(180 * (r / 40))
                color = (min(255, 180 + alpha // 3), max(0, 80 - alpha // 2), 24)
                draw_h.ellipse(
                    [128 - r, 140 - r, 128 + r, 140 + r],
                    fill=color,
                )
            heatmap.save(os.path.join(gradcam_dir, f"frame_{i}_heatmap.jpg"))
    except ImportError:
        # If Pillow is not installed, just create empty files
        for i in range(num_frames):
            open(os.path.join(gradcam_dir, f"frame_{i}_original.jpg"), "w").close()
            open(os.path.join(gradcam_dir, f"frame_{i}_heatmap.jpg"), "w").close()


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
