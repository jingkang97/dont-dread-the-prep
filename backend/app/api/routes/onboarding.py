from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.session import HospitalOut, SessionCreate, SessionOut, SessionUpdate
from app.services import sessions as sessions_service

router = APIRouter(tags=["onboarding"])


@router.get("/hospitals", response_model=list[HospitalOut])
def get_hospitals(db: Session = Depends(get_db)) -> list[HospitalOut]:
    """Step 1: pick a hospital. Protocols are listed chips only."""
    return sessions_service.list_hospitals_out(db)


@router.get("/hospitals/{code}", response_model=HospitalOut)
def get_hospital(code: str, db: Session = Depends(get_db)) -> HospitalOut:
    return sessions_service.get_hospital_out(db, code)


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
    """Change date / slot / reporting time. May remap to another sheet via reporting windows."""
    return sessions_service.update_session(db, public_code, body)
