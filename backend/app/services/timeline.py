from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session as DbSession

from app.db.models import Protocol, ProtocolStep, ProtocolVersion, Session
from app.schemas.timeline import TimelineEventOut, TimelineOut

SG = ZoneInfo("Asia/Singapore")


def _resolve_at(
    *,
    procedure_date,
    reporting_time,
    timing_mode: str,
    day_offset: int | None,
    clock_time,
    hours_before_report: Decimal | float | None,
) -> datetime:
    if timing_mode == "day_clock":
        if day_offset is None or clock_time is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid day_clock step: missing day_offset or clock_time",
            )
        day = procedure_date + timedelta(days=int(day_offset))
        return datetime.combine(day, clock_time, tzinfo=SG)

    if timing_mode == "report_relative":
        if hours_before_report is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid report_relative step: missing hours_before_report",
            )
        report = datetime.combine(procedure_date, reporting_time, tzinfo=SG)
        hours = float(hours_before_report)
        return report - timedelta(hours=hours)

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Unknown timing_mode '{timing_mode}'",
    )


def latest_protocol_version(db: DbSession, protocol_id: int) -> ProtocolVersion | None:
    return db.scalar(
        select(ProtocolVersion)
        .where(ProtocolVersion.protocol_id == protocol_id)
        .order_by(ProtocolVersion.version_id.desc())
        .limit(1)
    )


def get_timeline(db: DbSession, public_code: str) -> TimelineOut:
    row = db.scalar(select(Session).where(Session.public_code == public_code.upper()))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    protocol = db.get(Protocol, row.protocol_id)
    if protocol is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session references missing protocol",
        )

    version = latest_protocol_version(db, row.protocol_id)
    if version is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No protocol_versions for protocol '{protocol.name}'",
        )

    steps = list(
        db.scalars(
            select(ProtocolStep)
            .where(ProtocolStep.protocol_version_id == version.id)
            .where(or_(ProtocolStep.slot == "any", ProtocolStep.slot == row.slot))
            .order_by(ProtocolStep.sort_order, ProtocolStep.id)
        ).all()
    )

    events: list[TimelineEventOut] = []
    for step in steps:
        kind = step.kind
        at = _resolve_at(
            procedure_date=row.procedure_date,
            reporting_time=row.reporting_time,
            timing_mode=step.timing_mode,
            day_offset=step.day_offset,
            clock_time=step.clock_time,
            hours_before_report=step.hours_before_report,
        )
        events.append(
            TimelineEventOut(
                id=step.step_key,
                at=at,
                kind=kind,  # type: ignore[arg-type]
                title=step.title,
                detail=step.detail,
                tentative=step.tentative,
                agent=step.agent,
                prep_image_label=step.prep_image_label,
                sort_order=step.sort_order,
            )
        )

    events.sort(key=lambda e: (e.at, e.sort_order, e.id))

    return TimelineOut(
        public_code=row.public_code,
        protocol_name=protocol.name,
        source_label=protocol.source_label,
        version_id=version.version_id,
        version_label=version.version_label,
        procedure_date=row.procedure_date,
        slot=row.slot,
        reporting_time=row.reporting_time,
        events=events,
    )


def dose_reminders_for(db: DbSession, row: Session) -> list[dict]:
    """Hospital/protocol dose times (Picoprep, PEG) for this session's slot."""
    version = latest_protocol_version(db, row.protocol_id)
    if version is None:
        return []
    steps = list(
        db.scalars(
            select(ProtocolStep)
            .where(ProtocolStep.protocol_version_id == version.id)
            .where(ProtocolStep.kind == "dose")
            .where(or_(ProtocolStep.slot == "any", ProtocolStep.slot == row.slot))
            .order_by(ProtocolStep.sort_order, ProtocolStep.id)
        ).all()
    )
    doses: list[dict] = []
    for step in steps:
        try:
            at = _resolve_at(
                procedure_date=row.procedure_date,
                reporting_time=row.reporting_time,
                timing_mode=step.timing_mode,
                day_offset=step.day_offset,
                clock_time=step.clock_time,
                hours_before_report=step.hours_before_report,
            )
        except HTTPException:
            continue
        doses.append(
            {
                "key": step.step_key,
                "at": at,
                "title": step.title,
                "agent": step.agent or "picoprep",
            }
        )
    doses.sort(key=lambda item: item["at"])
    return doses
