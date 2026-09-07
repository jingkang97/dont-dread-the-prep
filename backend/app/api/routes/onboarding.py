from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.session import HospitalOut, SessionCreate, SessionOut, SessionUpdate
from app.services import sessions as sessions_service

router = APIRouter(tags=["onboarding"])


@router.get("/hospitals", response_model=list[HospitalOut])
def get_hospitals(db: Session = Depends(get_db)) -> list[HospitalOut]:
    """Step 1: pick SGH, NCCS, or TTSH (with offered protocols)."""
    rows = sessions_service.list_hospitals(db)
    return [HospitalOut.model_validate(row) for row in rows]


@router.post("/sessions", response_model=SessionOut, status_code=201)
def create_session(body: SessionCreate, db: Session = Depends(get_db)) -> SessionOut:
    """Finish onboarding: hospital + date + AM/PM → persisted prep session."""
    return sessions_service.create_session(db, body)


@router.get("/sessions/{public_code}", response_model=SessionOut)
def get_session(public_code: str, db: Session = Depends(get_db)) -> SessionOut:
    return sessions_service.get_session(db, public_code)


@router.patch("/sessions/{public_code}", response_model=SessionOut)
def patch_session(
    public_code: str,
    body: SessionUpdate,
    db: Session = Depends(get_db),
) -> SessionOut:
    """Change date / slot / reporting time. TTSH Picoprep-only may switch 8am–2pm vs 2pm–5pm."""
    return sessions_service.update_session(db, public_code, body)
