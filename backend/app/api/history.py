"""Analysis history endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, desc

from app.db.database import get_session
from app.db.models import AnalysisRecord

router = APIRouter()


@router.get("/history")
async def list_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    verdict: str = Query(None),
    model_id: str = Query(None),
    session: Session = Depends(get_session),
):
    """List past analyses with pagination and filters."""
    query = select(AnalysisRecord).order_by(desc(AnalysisRecord.id))

    if verdict:
        query = query.where(AnalysisRecord.verdict == verdict)
    if model_id:
        query = query.where(AnalysisRecord.model_id == model_id)

    # Count total
    all_records = session.exec(query).all()
    total = len(all_records)

    # Paginate
    offset = (page - 1) * per_page
    records = all_records[offset : offset + per_page]

    return {
        "items": [
            {
                "id": r.id,
                "job_id": r.job_id,
                "filename": r.filename,
                "verdict": r.verdict,
                "probability": r.probability,
                "model_id": r.model_id,
                "processing_time": r.processing_time,
                "timestamp": r.timestamp,
            }
            for r in records
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/history/{record_id}")
async def get_history_item(
    record_id: int,
    session: Session = Depends(get_session),
):
    """Get one stored analysis result."""
    record = session.get(AnalysisRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record.get_result()


@router.get("/history/{record_id}/report")
async def download_report(
    record_id: int,
    session: Session = Depends(get_session),
):
    """Generate and download a PDF forensic report."""
    record = session.get(AnalysisRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # PDF generation would go here using reportlab
    # For now, return a placeholder response
    return {
        "message": "PDF report generation not yet implemented",
        "record_id": record_id,
        "verdict": record.verdict,
        "probability": record.probability,
    }
