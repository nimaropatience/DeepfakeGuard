"""
Model registry: loads ONNX models at startup,
falls back to demo mode when weights are missing.
"""

import os
from typing import Optional

from app.models.schemas import ModelInfo


class ModelRegistry:
    """Singleton that holds loaded ONNX sessions and model metadata."""

    def __init__(self):
        self.models: dict[str, dict] = {}
        self.demo_mode: bool = True
        self._sessions: dict = {}

    # All three models with their metadata
    MODEL_CATALOG: list[ModelInfo] = [
        ModelInfo(
            id="hybrid_fusion",
            name="Hybrid Fusion",
            description="EfficientNet-B4 spatial + Eye LSTM temporal, joined in a fusion head. The default and most robust model.",
            architecture="EfficientNet-B4 + LSTM",
            input_size="256x256",
            param_count="~19.5M",
            file_size="~75 MB",
            dfdc_auc="TBD",
            celeb_df_auc="TBD",
            is_default=True,
        ),
        ModelInfo(
            id="efficientnet_b4",
            name="EfficientNet-B4",
            description="Spatial-only baseline. Analyzes individual face crops without temporal information.",
            architecture="EfficientNet-B4",
            input_size="256x256",
            param_count="~19.3M",
            file_size="~74 MB",
            dfdc_auc="~0.95",
            celeb_df_auc="~0.70",
            is_default=False,
        ),
        ModelInfo(
            id="mesonet4",
            name="MesoNet-4",
            description="Lightweight 4-layer meso-scale detector. Fast but less accurate, especially cross-dataset.",
            architecture="MesoNet-4",
            input_size="256x256",
            param_count="~28K",
            file_size="~0.2 MB",
            dfdc_auc="~0.71",
            celeb_df_auc="~0.33",
            is_default=False,
        ),
    ]

    # Expected weight filenames per model
    WEIGHT_FILES = {
        "hybrid_fusion": ["hybrid_fusion.onnx"],
        "efficientnet_b4": ["efficientnet_b4_spatial.onnx"],
        "mesonet4": ["mesonet4_baseline.onnx"],
    }

    def load_models(self, model_dir: str) -> None:
        """Try to load ONNX weights. If none found, enable demo mode."""
        found_any = False
        for model_id, filenames in self.WEIGHT_FILES.items():
            paths = [os.path.join(model_dir, f) for f in filenames]
            if all(os.path.exists(p) for p in paths):
                try:
                    import onnxruntime as ort

                    sessions = {}
                    for p in paths:
                        name = os.path.splitext(os.path.basename(p))[0]
                        sessions[name] = ort.InferenceSession(
                            p, providers=["CPUExecutionProvider"]
                        )
                    self._sessions[model_id] = sessions
                    self.models[model_id] = {"loaded": True}
                    found_any = True
                    print(f"  Loaded model: {model_id}")
                except Exception as e:
                    print(f"  Failed to load {model_id}: {e}")
                    self.models[model_id] = {"loaded": False, "error": str(e)}

        self.demo_mode = not found_any

        # In demo mode, register all models as available (with mock inference)
        if self.demo_mode:
            for info in self.MODEL_CATALOG:
                self.models[info.id] = {"loaded": False, "demo": True}

    def get_session(self, model_id: str) -> Optional[dict]:
        """Get ONNX sessions for a model. Returns None in demo mode."""
        return self._sessions.get(model_id)

    def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        """Get metadata for a model."""
        for info in self.MODEL_CATALOG:
            if info.id == model_id:
                return info
        return None

    def list_models(self) -> list[ModelInfo]:
        """Return metadata for all registered models."""
        return self.MODEL_CATALOG

    def unload_all(self) -> None:
        self._sessions.clear()
        self.models.clear()


# Singleton instance
model_registry = ModelRegistry()
