"""Job status polling endpoint."""

from fastapi import APIRouter, HTTPException

from app.api.analyze import jobs
from app.models.schemas import JobStatus

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Poll the status of an analysis job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]
