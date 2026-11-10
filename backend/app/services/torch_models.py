"""
PyTorch model definitions and helpers for the trained checkpoints.

The classes mirror models.py in the training notebook exactly, so a best.pt
saved by train.py loads here without conversion. Inputs are 256x256 RGB face
crops scaled to [0, 1] with NO mean/std normalisation, the same as in training.
"""

import threading

import numpy as np
import torch
import torch.nn as nn


class Meso4(nn.Module):
    def __init__(self, dropout: float = 0.5):
        super().__init__()

        def block(c_in, c_out, k, pool):
            return nn.Sequential(
                nn.Conv2d(c_in, c_out, k, padding=k // 2, bias=False),
                nn.BatchNorm2d(c_out),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(pool),
            )

        self.features = nn.Sequential(
            block(3, 8, 3, 2), block(8, 8, 5, 2), block(8, 16, 5, 2), block(16, 16, 5, 4)
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(dropout),
            nn.Linear(16 * 8 * 8, 16),
            nn.LeakyReLU(0.1, inplace=True),
            nn.Dropout(dropout),
            nn.Linear(16, 1),
        )

    def forward(self, x):
        return self.classifier(self.features(x)).squeeze(1)


class EfficientB4(nn.Module):
    def __init__(self, dropout: float = 0.3):
        super().__init__()
        from torchvision import models

        # weights=None: the checkpoint supplies every weight, so nothing is downloaded
        backbone = models.efficientnet_b4(weights=None)
        self.features = backbone.features
        self.n_features = backbone.classifier[1].in_features
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(dropout),
            nn.Linear(self.n_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout / 2),
            nn.Linear(256, 1),
        )

    def forward(self, x):
        return self.classifier(self.pool(self.features(x))).squeeze(1)


# "model_name" values written into best.pt by the notebook's train.py
_BUILDERS = {"meso4": Meso4, "efficientb4": EfficientB4}


def load_checkpoint(path: str) -> nn.Module:
    """Load a best.pt produced by the training notebook. Returns the model in eval mode."""
    state = torch.load(path, map_location="cpu", weights_only=True)
    name = state.get("model_name", "meso4")
    if name not in _BUILDERS:
        raise ValueError(f"Unsupported checkpoint type '{name}' in {path}")
    model = _BUILDERS[name]()
    model.load_state_dict(state["model"])
    model.eval()
    return model


def _to_tensor(crops: list[np.ndarray]) -> torch.Tensor:
    """List of HxWx3 uint8 RGB crops -> (N, 3, H, W) float tensor in [0, 1]."""
    batch = np.stack(crops).astype(np.float32) / 255.0
    return torch.from_numpy(batch).permute(0, 3, 1, 2).contiguous()


@torch.no_grad()
def predict_logits(model: nn.Module, crops: list[np.ndarray], batch_size: int = 8) -> np.ndarray:
    """One raw logit per face crop (fake = positive)."""
    out = []
    for i in range(0, len(crops), batch_size):
        out.append(model(_to_tensor(crops[i : i + batch_size])).float())
    return torch.cat(out).numpy()


_cam_lock = threading.Lock()


def gradcam(model: nn.Module, crop: np.ndarray) -> np.ndarray:
    """
    Grad-CAM for the 'fake' logit on the model's last feature block.
    Returns an HxW float map in [0, 1] at the crop's resolution.
    Same method as gradcam.py in the notebook, run on the loaded (trained) model.
    """
    import torch.nn.functional as F

    target = model.features[-1]
    store = {}
    with _cam_lock:  # hooks are per-model state; keep concurrent jobs apart
        fh = target.register_forward_hook(lambda m, i, o: store.update(act=o))
        bh = target.register_full_backward_hook(lambda m, gi, go: store.update(grad=go[0]))
        try:
            with torch.enable_grad():
                x = _to_tensor([crop]).requires_grad_(True)
                model.zero_grad()
                model(x).sum().backward()
            act, grad = store["act"].detach(), store["grad"].detach()
        finally:
            fh.remove()
            bh.remove()
            model.zero_grad()

    weights = grad.mean(dim=(2, 3), keepdim=True)
    cam = F.relu((weights * act).sum(dim=1, keepdim=True))
    cam = F.interpolate(cam, size=crop.shape[:2], mode="bilinear", align_corners=False)[0, 0]
    if cam.max() > 0:
        cam = cam / cam.max()
    return cam.numpy()
