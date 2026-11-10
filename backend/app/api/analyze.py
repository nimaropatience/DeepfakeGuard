"""Video and image analysis endpoints."""

import hashlib
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from app.models.registry import model_registry
from app.models.schemas import AnalysisResult, JobStatus
from app.services.demo import generate_demo_result

router = APIRouter()

# In-memory job store (replace with Redis for production)
jobs: dict[str, JobStatus] = {}


def run_video_analysis(
    job_id: str, filepath: str, filename: str, model_id: str, threshold: float
):
    """Background task: run the full video analysis pipeline."""
    try:
        # Update stages as processing progresses
        stages = [
            ("Extracting frames", 0.1),
            ("Detecting faces (MTCNN)", 0.25),
            ("Computing eye features", 0.4),
            ("Running hybrid CNN", 0.6),
            ("Generating Grad-CAM", 0.8),
            ("Preparing results", 0.95),
        ]

        if model_registry.demo_mode:
            # Simulate processing stages with short delays
            import time

            for stage_name, progress in stages:
                jobs[job_id] = JobStatus(
                    job_id=job_id,
                    status="processing",
                    stage=stage_name,
                    progress=progress,
                )
                time.sleep(0.5)

            result = generate_demo_result(filename, model_id, threshold, job_id)
            result.id = job_id

            # Save to database
            _save_to_history(job_id, filename, result)

            jobs[job_id] = JobStatus(
                job_id=job_id,
                status="complete",
                stage="Complete",
                progress=1.0,
                result=result,
            )
        else:
            from app.services.pipeline import analyze_frames
            from app.services.video import get_video_metadata, sample_frames_indexed

            def on_stage(stage_name: str, progress: float):
                jobs[job_id] = JobStatus(
                    job_id=job_id, status="processing", stage=stage_name, progress=progress
                )

            on_stage("Extracting frames", 0.1)
            meta = get_video_metadata(filepath)
            frames, indices = sample_frames_indexed(filepath, num_frames=16)
            fps = meta["fps"] if meta["fps"] > 0 else 0.0
            timestamps = [round(i / fps, 2) if fps else 0.0 for i in indices]

            result = analyze_frames(
                frames, timestamps, meta, model_id, threshold, job_id,
                _sha256_file(filepath), on_stage=on_stage,
            )
            _save_to_history(job_id, filename, result)
            jobs[job_id] = JobStatus(
                job_id=job_id, status="complete", stage="Complete", progress=1.0, result=result
            )

    except Exception as e:
        jobs[job_id] = JobStatus(
            job_id=job_id,
            status="failed",
            error=str(e),
        )
    finally:
        # Clean up uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)


def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _save_to_history(job_id: str, filename: str, result: AnalysisResult):
    """Save a completed analysis to the SQLite database."""
    from sqlmodel import Session
    from app.db.database import engine
    from app.db.models import AnalysisRecord

    record = AnalysisRecord(
        job_id=job_id,
        filename=filename,
        verdict=result.verdict,
        probability=result.probability,
        threshold=result.threshold,
        model_id=result.model_id,
        processing_time=result.processing_time,
        duration=result.duration,
        resolution=result.resolution,
        timestamp=result.timestamp,
        file_sha256=result.file_sha256,
    )
    record.set_result(result.model_dump())

    with Session(engine) as session:
        session.add(record)
        session.commit()


@router.post("/analyze/video")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model_id: str = Form("hybrid_fusion"),
    threshold: float = Form(0.5),
):
    """Upload a video for analysis. Returns a job_id for polling."""
    # Validate file type
    allowed = {".mp4", ".mov", ".avi", ".webm", ".mkv"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        return {"error": f"Unsupported format. Allowed: {', '.join(allowed)}"}

    # Save uploaded file temporarily
    job_id = str(uuid.uuid4())
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, f"{job_id}{ext}")

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    # Create initial job status
    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="queued",
        stage="Queued",
        progress=0.0,
    )

    # Start background processing
    background_tasks.add_task(
        run_video_analysis,
        job_id,
        filepath,
        file.filename or "unknown",
        model_id,
        threshold,
    )

    return {"job_id": job_id}


@router.post("/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    model_id: str = Form("hybrid_fusion"),
    threshold: float = Form(0.5),
):
    """Upload a single image for synchronous analysis (spatial branch only)."""
    allowed = {".jpg", ".jpeg", ".png", ".webp"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        return {"error": f"Unsupported format. Allowed: {', '.join(allowed)}"}

    job_id = str(uuid.uuid4())

    if model_registry.demo_mode:
        result = generate_demo_result(
            file.filename or "image", model_id, threshold, job_id
        )
        result.id = job_id
        # Override video-specific fields for an image
        result.total_frames = 1
        result.fps = 0.0
        result.frames_sampled = 1
        result.duration = 0.0
        result.eye_metrics.eye_verdict = "N/A (single image)"
        return result.model_dump()

    import cv2
    import numpy as np

    from app.services.pipeline import NoFaceError, analyze_frames

    content = await file.read()
    image = cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not read this image file")

    h, w = image.shape[:2]
    meta = {"total_frames": 1, "fps": 0.0, "duration": 0.0, "resolution": f"{w}x{h}"}
    try:
        result = await run_in_threadpool(
            analyze_frames,
            [image], [0.0], meta, model_id, threshold, job_id,
            hashlib.sha256(content).hexdigest(), None, True,
        )
    except NoFaceError as e:
        raise HTTPException(status_code=422, detail=str(e))

    _save_to_history(job_id, file.filename or "image", result)
    return result.model_dump()
