from __future__ import annotations

from datetime import date, datetime, time
from enum import Enum
from typing import Optional

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
    diet_days: int
    milk_in_coffee: str
    fruit_juice: str


class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    short_name: str
    name: str
    cluster: str
    contacts: list[ContactOut] = Field(default_factory=list)
    protocols: list[ProtocolSummary] = Field(default_factory=list)


class SessionCreate(BaseModel):
    hospital_code: str = Field(..., examples=["sgh", "nccs", "ttsh"])
    procedure_date: date
    slot: Slot
    reporting_time: Optional[time] = None
    protocol_name: Optional[str] = Field(
        default=None,
        description="Optional. Auto-picked when the hospital has one protocol "
        "(SGH/NCCS). For TTSH Picoprep-only and Picoprep+PEG, 8am–2pm vs 2pm–5pm "
        "is chosen from reporting_time (14:00+ uses the afternoon sheet). Pass "
        "ttsh-picoprep-peg for Picoprep+PEG, ttsh-peg-2l for PEG 2L, or "
        "ttsh-peg-3l for PEG 3L (8am–2pm sheets).",
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
    wa_opt_in: Optional[bool] = None

    @field_validator("first_name")
    @classmethod
    def clean_first_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        cleaned = " ".join(value.strip().split())
        return cleaned[:24] or None


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
    wa_opt_in: bool
    push_opt_in: bool = False
    created_at: datetime
