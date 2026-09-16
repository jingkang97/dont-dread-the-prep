from __future__ import annotations

import secrets
from datetime import time

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DbSession, selectinload

from app.db.models import Hospital, Protocol, Session, StoolScale
from app.schemas.session import (
    HospitalOut,
    ProtocolSummary,
    SessionCreate,
    SessionOut,
    SessionUpdate,
    Slot,
    StoolScaleOut,
)
from app.services.reminder_schedule import demo_mode, reminder_plan, reset_reminder_clock
from app.services.timeline import live_reminder_events_for

PUBLIC_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
PUBLIC_CODE_LENGTH = 4

# Older clients / seeds used un-windowed names → map to the listed sheet.
PROTOCOL_NAME_ALIASES: dict[str, str] = {
    "ttsh-picoprep": "ttsh-picoprep (8am-2pm)",
    "ttsh-picoprep-peg": "ttsh-picoprep-peg (8am-2pm)",
    "ttsh-peg-2l": "ttsh-peg-2l (8am-2pm)",
    "ttsh-peg": "ttsh-peg-2l (8am-2pm)",
    "ttsh-peg-3l": "ttsh-peg-3l (8am-2pm)",
}


def canonical_protocol_name(name: str) -> str:
    return PROTOCOL_NAME_ALIASES.get(name, name)


def reporting_in_window(protocol: Protocol, reporting: time) -> bool:
    """reporting_from inclusive, reporting_until exclusive; both null = any time."""
    if protocol.reporting_from is not None and reporting < protocol.reporting_from:
        return False
    if protocol.reporting_until is not None and reporting >= protocol.reporting_until:
        return False
    return True


def apply_reporting_window(
    hospital: Hospital, protocol: Protocol, reporting: time
) -> Protocol:
    """Pick the sheet for this prep_agent whose reporting window contains reporting."""
    siblings = [p for p in hospital.protocols if p.prep_agent == protocol.prep_agent]
    if len(siblings) <= 1:
        return protocol
    for candidate in siblings:
        if reporting_in_window(candidate, reporting):
            return candidate
    return protocol


def default_reporting_time(slot: Slot) -> time:
    return time(8, 0) if slot is Slot.am else time(13, 30)


def new_public_code() -> str:
    return "".join(secrets.choice(PUBLIC_CODE_ALPHABET) for _ in range(PUBLIC_CODE_LENGTH))


def session_to_out(row: Session, hospital: Hospital, protocol: Protocol, db: DbSession) -> SessionOut:
    return SessionOut(
        public_code=row.public_code,
        hospital_code=hospital.code,
        hospital_short_name=hospital.short_name,
        protocol_name=protocol.name,
        procedure_date=row.procedure_date,
        slot=Slot(row.slot),
        reporting_time=row.reporting_time,
        first_name=row.first_name,
        push_opt_in=bool(row.push_endpoint),
        telegram_linked=row.telegram_chat_id is not None,
        reminder_mode="demo" if demo_mode() else "live",
        reminder_plan=reminder_plan(row, live_reminder_events_for(db, row)),
        created_at=row.created_at,
    )


BRISTOL_SCALE_KEY = "bristol"


def list_hospitals(db: DbSession) -> list[Hospital]:
    stmt = (
        select(Hospital)
        .options(
            selectinload(Hospital.protocols),
            selectinload(Hospital.stool_scale).selectinload(StoolScale.stages),
        )
        .order_by(Hospital.id)
    )
    return list(db.scalars(stmt).unique().all())


def load_bristol_scale(db: DbSession) -> StoolScale:
    row = db.scalar(
        select(StoolScale)
        .options(selectinload(StoolScale.stages))
        .where(StoolScale.key == BRISTOL_SCALE_KEY)
    )
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bristol stool scale is not seeded",
        )
    return row


def hospital_to_out(hospital: Hospital, bristol: StoolScale) -> HospitalOut:
    """Picker payload: only listed protocol chips (AM/PM sheets stay server-side).

    stool_scale is always resolved: the hospital FK, or Bristol when the FK is null.
    """
    return HospitalOut(
        code=hospital.code,
        short_name=hospital.short_name,
        name=hospital.name,
        cluster=hospital.cluster,
        contacts=hospital.contacts,
        protocols=[ProtocolSummary.model_validate(p) for p in hospital.protocols if p.listed],
        stool_scale=StoolScaleOut.model_validate(hospital.stool_scale or bristol),
    )


def list_hospitals_out(db: DbSession) -> list[HospitalOut]:
    bristol = load_bristol_scale(db)
    return [hospital_to_out(row, bristol) for row in list_hospitals(db)]


def listed_protocols(hospital: Hospital) -> list[Protocol]:
    return [p for p in hospital.protocols if p.listed]


def resolve_protocol(
    hospital: Hospital,
    protocol_name: str | None,
    reporting: time | None = None,
) -> Protocol:
    protocols = list(hospital.protocols)
    if not protocols:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Hospital '{hospital.code}' has no protocols configured",
        )

    chosen: Protocol | None = None
    if protocol_name:
        want = canonical_protocol_name(protocol_name)
        for protocol in protocols:
            if protocol.name == want:
                chosen = protocol
                break
        if chosen is None:
            names = ", ".join(p.name for p in protocols)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Protocol '{protocol_name}' is not offered by {hospital.code}. "
                f"Choose one of: {names}",
            )
    else:
        options = listed_protocols(hospital) or protocols
        if len(options) == 1:
            chosen = options[0]
        else:
            # Prefer the first listed row (stable by Protocol.id order from relationship).
            chosen = options[0] if options else None
        if chosen is None:
            names = ", ".join(p.name for p in protocols)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Hospital '{hospital.code}' offers multiple protocols. "
                f"Pass protocol_name. Options: {names}",
            )

    if reporting is not None:
        return apply_reporting_window(hospital, chosen, reporting)
    return chosen


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

    reporting = body.reporting_time or default_reporting_time(body.slot)
    protocol = resolve_protocol(hospital, body.protocol_name, reporting)

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

    return session_to_out(row, hospital, protocol, db)


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
    return session_to_out(row, hospital, protocol, db)


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

    reset_reminders = bool({"procedure_date", "slot", "reporting_time"} & data.keys())
    for key, value in data.items():
        setattr(row, key, value)
    if reset_reminders:
        reset_reminder_clock(row)

    hospital = db.scalar(
        select(Hospital)
        .options(selectinload(Hospital.protocols))
        .where(Hospital.id == row.hospital_id)
    )
    protocol = db.get(Protocol, row.protocol_id)
    assert hospital is not None and protocol is not None
    remapped = apply_reporting_window(hospital, protocol, row.reporting_time)
    row.protocol_id = remapped.id

    db.commit()
    db.refresh(row)
    return session_to_out(row, hospital, remapped, db)
