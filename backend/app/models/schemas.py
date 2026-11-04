"""Pydantic response schemas for the DeepfakeGuard API."""

from typing import Optional
from pydantic import BaseModel


class FrameScore(BaseModel):
    frame_index: int
    timestamp: float
    score: float


class GradCamFrame(BaseModel):
    frame_index: int
    timestamp: float
    score: float
    original_url: str
    heatmap_url: str


class EyeMetrics(BaseModel):
    ear_left: list[float]
    ear_right: list[float]
    lr_difference: list[float]
    ear_std_dev: float
    ear_range: float
    blink_count: int
    eye_verdict: str


class AnalysisResult(BaseModel):
    id: Optional[str] = None
    verdict: str
    probability: float
    threshold: float
    raw_logit: float
    device: str
    model_id: str
    total_frames: int
    fps: float
    frames_sampled: int
    faces_detected: str
    duration: float
    resolution: str
    processing_time: float
    timestamp: str
    file_sha256: str
    per_frame_scores: list[FrameScore]
    gradcam_frames: list[GradCamFrame]
    eye_metrics: EyeMetrics
    demo_mode: bool = False


class JobStatus(BaseModel):
    job_id: str
    status: str  # queued, processing, complete, failed
    stage: Optional[str] = None
    progress: float = 0.0
    result: Optional[AnalysisResult] = None
    error: Optional[str] = None


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    architecture: str
    input_size: str
    param_count: str
    file_size: str
    dfdc_auc: Optional[str] = None
    celeb_df_auc: Optional[str] = None
    is_default: bool = False
