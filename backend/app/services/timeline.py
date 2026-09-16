from __future__ import annotations

from datetime import datetime, time, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session as DbSession

from app.db.models import Hospital, HospitalMedStop, Protocol, ProtocolStep, ProtocolVersion, Session
from app.schemas.timeline import TimelineEventOut, TimelineOut
from app.services.reminder_copy import (
    classify_med_stop,
    diet_copy,
    dose_copy,
    fast_copy,
    med7_copy,
    prep_start_copy,
    sglt2_copy,
    stool_copy,
    t14_copy,
)

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
                id=str(step.id),
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

    stops = list(
        db.scalars(
            select(HospitalMedStop)
            .where(HospitalMedStop.hospital_id == row.hospital_id)
            .order_by(HospitalMedStop.sort_order, HospitalMedStop.id)
        ).all()
    )
    for stop in stops:
        day = row.procedure_date + timedelta(days=int(stop.day_offset))
        events.append(
            TimelineEventOut(
                id=str(stop.id),
                at=datetime.combine(day, time(0, 0), tzinfo=SG),
                kind="med",
                title=stop.title,
                detail=stop.detail,
                all_day=True,
                sort_order=stop.sort_order,
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
            .where(ProtocolStep.kind == "prep")
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
                "key": str(step.id),
                "at": at,
                "title": step.title,
                "agent": step.agent or "picoprep",
            }
        )
    doses.sort(key=lambda item: item["at"])
    return doses


PING_KINDS = {"diet", "prep", "stool", "fast"}


def _hours_before(report: datetime, at: datetime) -> float:
    return max(0.0, (report - at).total_seconds() / 3600)


def live_reminder_events_for(db: DbSession, row: Session) -> list[dict]:
    """Table reminders plus each hospital prep dose. Meals and arrive are skipped."""
    hospital = db.get(Hospital, row.hospital_id)
    hospital_name = hospital.short_name if hospital else "your hospital"
    report = datetime.combine(row.procedure_date, row.reporting_time, tzinfo=SG)
    events: list[dict] = []

    t14_at = datetime.combine(row.procedure_date - timedelta(days=14), time(0, 0), tzinfo=SG)
    events.append(
        {
            "key": "t14",
            "at": t14_at,
            **t14_copy(hospital_name, row.procedure_date, row.reporting_time),
        }
    )

    stops = list(
        db.scalars(
            select(HospitalMedStop)
            .where(HospitalMedStop.hospital_id == row.hospital_id)
            .order_by(HospitalMedStop.sort_order, HospitalMedStop.id)
        ).all()
    )
    for stop in stops:
        at = datetime.combine(row.procedure_date + timedelta(days=int(stop.day_offset)), time(0, 0), tzinfo=SG)
        kind = classify_med_stop(stop.title, stop.detail, stop.day_offset)
        days = abs(int(stop.day_offset))
        copy = (
            sglt2_copy(hospital_name, row.procedure_date, row.reporting_time, days=days)
            if kind == "sglt2"
            else med7_copy(hospital_name, row.procedure_date, row.reporting_time, days=days)
        )
        events.append({"key": f"med:{stop.id}", "at": at, **copy})

    version = latest_protocol_version(db, row.protocol_id)
    steps: list[ProtocolStep] = []
    if version is not None:
        steps = list(
            db.scalars(
                select(ProtocolStep)
                .where(ProtocolStep.protocol_version_id == version.id)
                .where(or_(ProtocolStep.slot == "any", ProtocolStep.slot == row.slot))
                .order_by(ProtocolStep.sort_order, ProtocolStep.id)
            ).all()
        )

    has_prep = False
    for step in steps:
        if step.kind not in PING_KINDS:
            continue
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
        if step.kind == "diet":
            days = abs(int(step.day_offset)) if step.day_offset is not None else 3
            copy = diet_copy(hospital_name, row.procedure_date, row.reporting_time, days=days)
            events.append({"key": f"step:{step.id}", "at": at, **copy})
        elif step.kind == "prep":
            has_prep = True
            agent = step.agent or "picoprep"
            copy = dose_copy(step.title, agent=agent, detail=step.detail or "")
            events.append({"key": f"dose:{step.id}", "at": at, **copy})
        elif step.kind == "stool":
            copy = stool_copy(hours=_hours_before(report, at))
            events.append({"key": f"step:{step.id}", "at": at, **copy})
        elif step.kind == "fast":
            copy = fast_copy(hours=_hours_before(report, at))
            events.append({"key": f"step:{step.id}", "at": at, **copy})

    if has_prep:
        start_at = datetime.combine(row.procedure_date - timedelta(days=1), time(0, 0), tzinfo=SG)
        events.append(
            {
                "key": "prep-start",
                "at": start_at,
                **prep_start_copy(hospital_name, row.procedure_date, row.reporting_time),
            }
        )

    events.sort(key=lambda item: (item["at"], item["key"]))
    return events
