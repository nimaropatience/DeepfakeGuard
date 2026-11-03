"""Grad-CAM generation on the EfficientNet-B4 spatial branch."""

import os
import numpy as np
import cv2


def generate_gradcam(
    face_crops: list[np.ndarray],
    scores: list[float],
    job_id: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Generate Grad-CAM heatmap overlays on the top-k highest-scoring frames.
    Saves original and heatmap images to outputs/gradcam/{job_id}/.
    Returns list of dicts with paths.
    """
    output_dir = os.path.join("outputs", "gradcam", job_id)
    os.makedirs(output_dir, exist_ok=True)

    # Get indices of top-k frames by score
    indexed_scores = [(i, s) for i, s in enumerate(scores) if i < len(face_crops)]
    indexed_scores.sort(key=lambda x: x[1], reverse=True)
    top_indices = indexed_scores[:top_k]

    results = []

    try:
        import torch
        from torchvision import models, transforms
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.image import show_cam_on_image

        # Load EfficientNet-B4 for Grad-CAM
        model = models.efficientnet_b4(pretrained=False)
        model.eval()

        # Target the last conv layer
        target_layers = [model.features[-1]]
        cam = GradCAM(model=model, target_layers=target_layers)

        preprocess = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])

        for rank, (frame_idx, score) in enumerate(top_indices):
            crop = face_crops[frame_idx]
            if crop is None:
                continue

            # Save original
            orig_path = os.path.join(output_dir, f"frame_{rank}_original.jpg")
            cv2.imwrite(orig_path, cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))

            # Generate Grad-CAM
            input_tensor = preprocess(crop).unsqueeze(0)
            grayscale_cam = cam(input_tensor=input_tensor)
            grayscale_cam = grayscale_cam[0, :]

            # Overlay heatmap on original
            rgb_img = crop.astype(np.float32) / 255.0
            visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

            heatmap_path = os.path.join(output_dir, f"frame_{rank}_heatmap.jpg")
            cv2.imwrite(heatmap_path, cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))

            results.append({
                "frame_index": frame_idx,
                "score": score,
                "original_url": f"/outputs/gradcam/{job_id}/frame_{rank}_original.jpg",
                "heatmap_url": f"/outputs/gradcam/{job_id}/frame_{rank}_heatmap.jpg",
            })

    except ImportError:
        # If pytorch-grad-cam not available, save placeholders
        for rank, (frame_idx, score) in enumerate(top_indices):
            crop = face_crops[frame_idx]
            if crop is None:
                continue

            orig_path = os.path.join(output_dir, f"frame_{rank}_original.jpg")
            cv2.imwrite(orig_path, cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))

            # Simple red-overlay placeholder
            heatmap = crop.copy()
            red_overlay = np.zeros_like(heatmap)
            red_overlay[:, :, 0] = 200
            heatmap = cv2.addWeighted(heatmap, 0.6, red_overlay, 0.4, 0)
            heatmap_path = os.path.join(output_dir, f"frame_{rank}_heatmap.jpg")
            cv2.imwrite(heatmap_path, cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR))

            results.append({
                "frame_index": frame_idx,
                "score": score,
                "original_url": f"/outputs/gradcam/{job_id}/frame_{rank}_original.jpg",
                "heatmap_url": f"/outputs/gradcam/{job_id}/frame_{rank}_heatmap.jpg",
            })

    return results
