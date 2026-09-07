from __future__ import annotations

import secrets
from datetime import time

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DbSession, selectinload

from app.db.models import Hospital, Protocol, Session
from app.schemas.session import SessionCreate, SessionOut, SessionUpdate, Slot

PUBLIC_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
PUBLIC_CODE_LENGTH = 4

# Prefer Picoprep-only when TTSH (or any hospital) has multiple protocols and
# the client has not chosen yet — matches the current frontend default path.
DEFAULT_MULTI_PROTOCOL: dict[str, str] = {
    "ttsh": "ttsh-picoprep",
}


def default_reporting_time(slot: Slot) -> time:
    return time(8, 0) if slot is Slot.am else time(13, 30)


def new_public_code() -> str:
    return "".join(secrets.choice(PUBLIC_CODE_ALPHABET) for _ in range(PUBLIC_CODE_LENGTH))


def session_to_out(row: Session, hospital: Hospital, protocol: Protocol) -> SessionOut:
    return SessionOut(
        public_code=row.public_code,
        hospital_code=hospital.code,
        hospital_short_name=hospital.short_name,
        protocol_name=protocol.name,
        procedure_date=row.procedure_date,
        slot=Slot(row.slot),
        reporting_time=row.reporting_time,
        first_name=row.first_name,
        wa_opt_in=row.wa_opt_in,
        push_opt_in=bool(row.push_endpoint),
        created_at=row.created_at,
    )


def list_hospitals(db: DbSession) -> list[Hospital]:
    stmt = (
        select(Hospital)
        .options(selectinload(Hospital.protocols))
        .order_by(Hospital.id)
    )
    return list(db.scalars(stmt).unique().all())


def resolve_protocol(hospital: Hospital, protocol_name: str | None) -> Protocol:
    protocols = list(hospital.protocols)
    if not protocols:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Hospital '{hospital.code}' has no protocols configured",
        )

    if protocol_name:
        for protocol in protocols:
            if protocol.name == protocol_name:
                return protocol
        names = ", ".join(p.name for p in protocols)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Protocol '{protocol_name}' is not offered by {hospital.code}. "
            f"Choose one of: {names}",
        )

    if len(protocols) == 1:
        return protocols[0]

    preferred = DEFAULT_MULTI_PROTOCOL.get(hospital.code)
    if preferred:
        for protocol in protocols:
            if protocol.name == preferred:
                return protocol

    names = ", ".join(p.name for p in protocols)
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Hospital '{hospital.code}' offers multiple protocols. "
        f"Pass protocol_name. Options: {names}",
    )


def create_session(db: DbSession, body: SessionCreate) -> SessionOut:
    hospital = db.scalar(
        select(Hospital)
        .options(selectinload(Hospital.protocols))
        .where(Hospital.code == body.hospital_code)
    )
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown hospital_code '{body.hospital_code}'",
        )

    protocol = resolve_protocol(hospital, body.protocol_name)
    reporting = body.reporting_time or default_reporting_time(body.slot)

    row: Session | None = None
    for _ in range(8):
        candidate = Session(
            public_code=new_public_code(),
            hospital_id=hospital.id,
            protocol_id=protocol.id,
            procedure_date=body.procedure_date,
            slot=body.slot.value,
            reporting_time=reporting,
            first_name=body.first_name,
            wa_opt_in=False,
        )
        db.add(candidate)
        try:
            db.commit()
            db.refresh(candidate)
            row = candidate
            break
        except IntegrityError:
            db.rollback()
            continue

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not allocate a unique session public_code",
        )

    return session_to_out(row, hospital, protocol)


def get_session(db: DbSession, public_code: str) -> SessionOut:
    row = db.scalar(select(Session).where(Session.public_code == public_code.upper()))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    hospital = db.get(Hospital, row.hospital_id)
    protocol = db.get(Protocol, row.protocol_id)
    if hospital is None or protocol is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session references missing hospital or protocol",
        )
    return session_to_out(row, hospital, protocol)


def update_session(db: DbSession, public_code: str, body: SessionUpdate) -> SessionOut:
    row = db.scalar(select(Session).where(Session.public_code == public_code.upper()))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields to update",
        )

    if "slot" in data and data["slot"] is not None:
        data["slot"] = data["slot"].value
        if "reporting_time" not in data:
            data["reporting_time"] = default_reporting_time(Slot(data["slot"]))

    for key, value in data.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)

    hospital = db.get(Hospital, row.hospital_id)
    protocol = db.get(Protocol, row.protocol_id)
    assert hospital is not None and protocol is not None
    return session_to_out(row, hospital, protocol)
