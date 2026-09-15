from __future__ import annotations

from datetime import date, datetime, time
from typing import Literal, Optional

from pydantic import BaseModel, Field


EventKind = Literal["diet", "prep", "med", "meal", "fast", "arrive", "stool"]


class TimelineEventOut(BaseModel):
    id: str
    at: datetime
    kind: EventKind
    title: str
    detail: str = ""
    tentative: bool = False
    agent: Optional[str] = None
    prep_image_label: Optional[str] = None
    sort_order: int = 0


class TimelineOut(BaseModel):
    public_code: str
    protocol_name: str
    source_label: str = ""
    version_id: int
    version_label: str
    procedure_date: date
    slot: str
    reporting_time: time
    events: list[TimelineEventOut] = Field(default_factory=list)
