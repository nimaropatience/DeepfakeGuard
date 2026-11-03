"""
Eye Aspect Ratio (EAR) extraction using MediaPipe Face Mesh.
The 468-landmark mesh provides left and right eye landmarks
used to compute EAR per frame.
"""

import numpy as np


# MediaPipe Face Mesh landmark indices for eyes
# Left eye: [362, 385, 387, 263, 373, 380]
# Right eye: [33, 160, 158, 133, 153, 144]
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]


def compute_ear(landmarks: np.ndarray, eye_indices: list[int]) -> float:
    """
    Compute Eye Aspect Ratio from 6 landmark points.
    EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
    """
    p = landmarks[eye_indices]
    # Vertical distances
    v1 = np.linalg.norm(p[1] - p[5])
    v2 = np.linalg.norm(p[2] - p[4])
    # Horizontal distance
    h = np.linalg.norm(p[0] - p[3])

    if h == 0:
        return 0.0
    return float((v1 + v2) / (2.0 * h))


def extract_ear_sequence(frames: list[np.ndarray]) -> dict:
    """
    Extract EAR for left and right eye across all frames.
    Frames should be RGB numpy arrays.

    Returns dict with ear_left, ear_right, lr_difference lists,
    plus summary stats (std_dev, range, blink_count, eye_verdict).
    """
    try:
        import mediapipe as mp
    except ImportError:
        raise RuntimeError("mediapipe is required: pip install mediapipe")

    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    )

    ear_left_list = []
    ear_right_list = []

    for frame in frames:
        if frame is None:
            ear_left_list.append(0.0)
            ear_right_list.append(0.0)
            continue

        results = face_mesh.process(frame)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0]
            h, w = frame.shape[:2]
            pts = np.array(
                [(lm.x * w, lm.y * h, lm.z * w) for lm in landmarks.landmark]
            )

            ear_l = compute_ear(pts, LEFT_EYE)
            ear_r = compute_ear(pts, RIGHT_EYE)
            ear_left_list.append(round(ear_l, 4))
            ear_right_list.append(round(ear_r, 4))
        else:
            ear_left_list.append(0.0)
            ear_right_list.append(0.0)

    face_mesh.close()

    # Compute summary metrics
    lr_diff = [round(abs(l - r), 4) for l, r in zip(ear_left_list, ear_right_list)]
    all_ears = ear_left_list + ear_right_list
    non_zero = [e for e in all_ears if e > 0]

    if non_zero:
        std_dev = round(float(np.std(non_zero)), 4)
        ear_range = round(float(max(non_zero) - min(non_zero)), 4)
    else:
        std_dev = 0.0
        ear_range = 0.0

    # Count blinks: frames where EAR drops below 0.15
    blink_threshold = 0.15
    blink_count = sum(
        1 for l, r in zip(ear_left_list, ear_right_list)
        if l > 0 and l < blink_threshold and r > 0 and r < blink_threshold
    )

    # Eye verdict based on variability
    if std_dev < 0.015:
        eye_verdict = "Suspicious: very low eye-movement variability"
    elif std_dev < 0.03:
        eye_verdict = "Borderline"
    else:
        eye_verdict = "Normal"

    return {
        "ear_left": ear_left_list,
        "ear_right": ear_right_list,
        "lr_difference": lr_diff,
        "ear_std_dev": std_dev,
        "ear_range": ear_range,
        "blink_count": blink_count,
        "eye_verdict": eye_verdict,
    }
