"""SQLModel ORM models for analysis history."""

import json
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class AnalysisRecord(SQLModel, table=True):
    """Stores one completed analysis in the database."""

    __tablename__ = "analyses"

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: str = Field(index=True)
    filename: str
    verdict: str
    probability: float
    threshold: float
    model_id: str
    processing_time: float
    duration: float
    resolution: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    file_sha256: str = ""
    # Store full result JSON for retrieval
    result_json: str = ""

    def set_result(self, result_dict: dict):
        self.result_json = json.dumps(result_dict)

    def get_result(self) -> dict:
        if self.result_json:
            return json.loads(self.result_json)
        return {}
