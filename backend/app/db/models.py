from __future__ import annotations

from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Identity,
    Integer,
    Numeric,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, ENUM, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


slot_enum = ENUM("am", "pm", name="slot", create_type=False)
timing_mode_enum = ENUM(
    "day_clock",
    "report_relative",
    name="timing_mode",
    create_type=False,
)
step_slot_enum = ENUM("any", "am", "pm", name="step_slot", create_type=False)
food_classification_enum = ENUM(
    "can", "cannot", "review", name="food_classification", create_type=False
)
food_source_enum = ENUM("SGH", "TTSH", "CGH", "DIETICIAN", name="food_source", create_type=False)
dish_meal_type_enum = ENUM(
    "breakfast", "lunch", "dinner", "snack", "drink", name="dish_meal_type", create_type=False
)


class Protocol(Base):
    __tablename__ = "protocols"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    prep_agent: Mapped[str] = mapped_column(Text, nullable=False)
    prep_agent_label: Mapped[str] = mapped_column(Text, nullable=False)
    listed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    reporting_from: Mapped[Optional[time]] = mapped_column(Time)
    reporting_until: Mapped[Optional[time]] = mapped_column(Time)
    source_label: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    versions: Mapped[list["ProtocolVersion"]] = relationship(
        "ProtocolVersion",
        back_populates="protocol",
        viewonly=True,
    )


class StoolScale(Base):
    __tablename__ = "stool_scales"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    key: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    show_ready_badges: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    not_ready_action: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    stages: Mapped[list["StoolScaleStage"]] = relationship(
        "StoolScaleStage",
        back_populates="scale",
        viewonly=True,
        order_by="StoolScaleStage.n",
    )


class StoolScaleStage(Base):
    __tablename__ = "stool_scale_stages"
    __table_args__ = (
        UniqueConstraint("scale_id", "n", name="stool_scale_stages_scale_id_n_key"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    scale_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("stool_scales.id", ondelete="CASCADE"), nullable=False
    )
    n: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    look: Mapped[Optional[str]] = mapped_column(Text)
    ready: Mapped[Optional[str]] = mapped_column(Text)
    color: Mapped[Optional[str]] = mapped_column(Text)
    photo: Mapped[Optional[str]] = mapped_column(Text)

    scale: Mapped[StoolScale] = relationship(StoolScale, back_populates="stages")


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    short_name: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    cluster: Mapped[str] = mapped_column(Text, nullable=False)
    contacts: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    stool_scale_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("stool_scales.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    protocols: Mapped[list[Protocol]] = relationship(
        Protocol,
        secondary="hospital_protocols",
        viewonly=True,
        order_by=Protocol.id,
    )
    stool_scale: Mapped[Optional[StoolScale]] = relationship(StoolScale, viewonly=True)
    med_stops: Mapped[list["HospitalMedStop"]] = relationship(
        "HospitalMedStop",
        back_populates="hospital",
        viewonly=True,
        order_by="HospitalMedStop.sort_order",
    )


class HospitalProtocol(Base):
    __tablename__ = "hospital_protocols"

    hospital_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("hospitals.id", ondelete="CASCADE"), primary_key=True
    )
    protocol_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("protocols.id", ondelete="RESTRICT"), primary_key=True
    )


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        ForeignKeyConstraint(
            ["hospital_id", "protocol_id"],
            ["hospital_protocols.hospital_id", "hospital_protocols.protocol_id"],
            name="sessions_hospital_protocol_fk",
        ),
        UniqueConstraint("public_code", name="sessions_public_code_key"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_code: Mapped[str] = mapped_column(Text, nullable=False)
    hospital_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("hospitals.id"), nullable=False
    )
    protocol_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("protocols.id"), nullable=False
    )
    procedure_date: Mapped[date] = mapped_column(Date, nullable=False)
    slot: Mapped[str] = mapped_column(slot_enum, nullable=False)
    reporting_time: Mapped[time] = mapped_column(Time, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(Text)
    telegram_chat_id: Mapped[Optional[int]] = mapped_column(BigInteger)
    push_endpoint: Mapped[Optional[str]] = mapped_column(Text)
    push_p256dh: Mapped[Optional[str]] = mapped_column(Text)
    push_auth: Mapped[Optional[str]] = mapped_column(Text)
    reminder_t72_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    reminder_t24_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    reminder_t6_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    reminder_anchor_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    reminder_demo_sent: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    reminder_demo_push_sent: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    reminder_late_notice_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    reminder_doses_sent: Mapped[list] = mapped_column(JSONB, nullable=False, default=list, server_default="[]")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class ProtocolVersion(Base):
    __tablename__ = "protocol_versions"
    __table_args__ = (
        UniqueConstraint("protocol_id", "version_id", name="protocol_versions_protocol_id_version_id_key"),
        UniqueConstraint(
            "protocol_id", "version_label", name="protocol_versions_protocol_id_version_label_key"
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    protocol_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("protocols.id", ondelete="CASCADE"), nullable=False
    )
    version_id: Mapped[int] = mapped_column(Integer, nullable=False)
    version_label: Mapped[str] = mapped_column(Text, nullable=False)
    effective_from: Mapped[Optional[date]] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    protocol: Mapped[Protocol] = relationship(Protocol, back_populates="versions")
    steps: Mapped[list["ProtocolStep"]] = relationship(
        "ProtocolStep",
        back_populates="version",
        viewonly=True,
        order_by="ProtocolStep.sort_order",
    )


class ProtocolStep(Base):
    __tablename__ = "protocol_steps"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    protocol_version_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("protocol_versions.id", ondelete="CASCADE"), nullable=False
    )
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    slot: Mapped[str] = mapped_column(step_slot_enum, nullable=False, default="any")
    timing_mode: Mapped[str] = mapped_column(timing_mode_enum, nullable=False)
    day_offset: Mapped[Optional[int]] = mapped_column(Integer)
    clock_time: Mapped[Optional[time]] = mapped_column(Time)
    hours_before_report: Mapped[Optional[float]] = mapped_column(Numeric(4, 1))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tentative: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    agent: Mapped[Optional[str]] = mapped_column(Text)
    prep_image_label: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    version: Mapped[ProtocolVersion] = relationship(
        ProtocolVersion, back_populates="steps"
    )


class HospitalMedStop(Base):
    __tablename__ = "hospital_med_stops"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    hospital_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    day_offset: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False, default="")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    hospital: Mapped[Hospital] = relationship(Hospital, back_populates="med_stops")
class Ingredient(Base):
    __tablename__ = "ingredient_tab"
    __table_args__ = (
        UniqueConstraint("name", "source_hospital", name="ingredient_tab_name_source_hospital_key"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    classification: Mapped[str] = mapped_column(food_classification_enum, nullable=False)
    classification_reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    source_hospital: Mapped[str] = mapped_column(food_source_enum, nullable=False)
    source_document: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

class Dish(Base):
    __tablename__ = "dishes_tab"
    __table_args__ = (
        UniqueConstraint("name", "source_hospital", name="dishes_tab_name_source_hospital_key"),
    )

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    meal_type: Mapped[list[str]] = mapped_column(ARRAY(dish_meal_type_enum), nullable=False, default=list)
    source_hospital: Mapped[str] = mapped_column(food_source_enum, nullable=False)
    ingredient_list: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
