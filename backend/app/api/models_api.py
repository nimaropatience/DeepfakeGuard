"""Model listing endpoint."""

from fastapi import APIRouter

from app.models.registry import model_registry

router = APIRouter()


@router.get("/models")
async def list_models():
    """List available models with metadata and benchmark AUCs."""
    return {
        "models": [m.model_dump() for m in model_registry.list_models()],
        "demo_mode": model_registry.demo_mode,
    }
