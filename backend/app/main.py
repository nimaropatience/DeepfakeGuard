"""
DeepfakeGuard Backend - FastAPI application entry point.
Starts in demo mode if no ONNX weights are found.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import analyze, jobs, history, models_api, live
from app.db.database import create_db_and_tables
from app.models.registry import model_registry


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, clean up on shutdown."""
    create_db_and_tables()
    model_dir = os.getenv("MODEL_DIR", "models")
    model_registry.load_models(model_dir)
    if model_registry.demo_mode:
        print("\n  DeepfakeGuard running in DEMO MODE")
        print("  No model weights (efficientnet_b4.pt / mesonet4.pt) found in:", model_dir)
        print("  Returning realistic mock results.\n")
    else:
        print(f"\n  DeepfakeGuard loaded {len(model_registry.models)} model(s)\n")
    yield
    model_registry.unload_all()


app = FastAPI(
    title="DeepfakeGuard API",
    description="Explainable Hybrid CNN Framework for Deepfake Detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow the Vite dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(analyze.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(models_api.router, prefix="/api")
app.include_router(live.router)

# Serve Grad-CAM output images
os.makedirs("outputs/gradcam", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "demo_mode": model_registry.demo_mode,
        "models_loaded": list(model_registry.models.keys()),
    }
