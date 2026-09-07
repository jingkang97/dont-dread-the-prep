from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.timeline import TimelineOut
from app.services import timeline as timeline_service

router = APIRouter(tags=["timeline"])


@router.get("/sessions/{public_code}/timeline", response_model=TimelineOut)
def get_session_timeline(public_code: str, db: Session = Depends(get_db)) -> TimelineOut:
    """Resolve protocol_steps for this session into timed timeline events."""
    return timeline_service.get_timeline(db, public_code)
