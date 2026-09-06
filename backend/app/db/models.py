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
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


slot_enum = ENUM("am", "pm", name="slot", create_type=False)
prep_agent_enum = ENUM(
    "picoprep",
    "picoprep-peg",
    "peg",
    name="prep_agent",
    create_type=False,
)
three_way_enum = ENUM("yes", "no", "ask", name="three_way", create_type=False)


class Protocol(Base):
    __tablename__ = "protocols"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    prep_agent: Mapped[str] = mapped_column(prep_agent_enum, nullable=False)
    prep_agent_label: Mapped[str] = mapped_column(Text, nullable=False)
    diet_days: Mapped[int] = mapped_column(nullable=False)
    last_meal: Mapped[str] = mapped_column(Text, nullable=False)
    last_meal_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    fluid_stop_hours: Mapped[int] = mapped_column(nullable=False)
    milk_in_coffee: Mapped[str] = mapped_column(three_way_enum, nullable=False)
    fruit_juice: Mapped[str] = mapped_column(three_way_enum, nullable=False)
    rice_cereal: Mapped[str] = mapped_column(three_way_enum, nullable=False)
    coffee_tea: Mapped[str] = mapped_column(three_way_enum, nullable=False)
    form_gap: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    short_name: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    cluster: Mapped[str] = mapped_column(Text, nullable=False)
    contacts: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    protocols: Mapped[list[Protocol]] = relationship(
        Protocol,
        secondary="hospital_protocols",
        viewonly=True,
        order_by=Protocol.id,
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
    wa_opt_in: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
