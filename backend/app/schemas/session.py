from __future__ import annotations

from datetime import date, datetime, time
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Slot(str, Enum):
    am = "am"
    pm = "pm"


class ContactOut(BaseModel):
    label: str
    phone: str
    hours: str = ""
    note: str = ""


class ProtocolSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    prep_agent: str
    prep_agent_label: str
    listed: bool = True
    reporting_from: Optional[time] = None
    reporting_until: Optional[time] = None


StoolReady = Literal["not", "almost", "ready"]


class StoolScaleStageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    n: int
    name: str
    look: Optional[str] = None
    ready: Optional[StoolReady] = None
    color: Optional[str] = None
    photo: Optional[str] = None


class StoolScaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    show_ready_badges: bool
    not_ready_action: Optional[str] = None
    stages: list[StoolScaleStageOut] = Field(default_factory=list)


class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    short_name: str
    name: str
    cluster: str
    contacts: list[ContactOut] = Field(default_factory=list)
    protocols: list[ProtocolSummary] = Field(default_factory=list)
    stool_scale: StoolScaleOut


class SessionCreate(BaseModel):
    hospital_code: str = Field(..., examples=["ttsh", "skh"])
    procedure_date: date
    slot: Slot
    reporting_time: Optional[time] = None
    protocol_name: Optional[str] = Field(
        default=None,
        description="Optional. Pass the listed chip name from GET /hospitals. "
        "The server remaps to the sheet whose reporting_from/until contains "
        "reporting_time among protocols that share the same prep_agent. "
        "Auto-picked when the hospital has one listed protocol.",
    )
    first_name: Optional[str] = Field(default=None, max_length=24)

    @field_validator("hospital_code")
    @classmethod
    def normalize_hospital_code(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("first_name")
    @classmethod
    def clean_first_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned[:24] or None


class SessionUpdate(BaseModel):
    procedure_date: Optional[date] = None
    slot: Optional[Slot] = None
    reporting_time: Optional[time] = None
    first_name: Optional[str] = Field(default=None, max_length=24)

    @field_validator("first_name")
    @classmethod
    def clean_first_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned[:24] or None


class ReminderPlanItem(BaseModel):
    key: str
    title: str
    copy_key: str
    delay_label: str
    body: str = ""
    at: Optional[datetime] = None
    sent: bool = False


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    public_code: str
    hospital_code: str
    hospital_short_name: str
    protocol_name: str
    procedure_date: date
    slot: Slot
    reporting_time: time
    first_name: Optional[str] = None
    push_opt_in: bool = False
    telegram_linked: bool = False
    reminder_mode: str = "live"
    reminder_plan: list[ReminderPlanItem] = Field(default_factory=list)
    created_at: datetime
