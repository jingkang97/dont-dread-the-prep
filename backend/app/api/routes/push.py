from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services import push as push_service

router = APIRouter(tags=["push"])


class PushSubscribeIn(BaseModel):
    endpoint: str = Field(..., min_length=8)
    keys: dict[str, str]


class PushLateNotice(BaseModel):
    title: str
    body: str
    url: str


class PushSubscribeOut(BaseModel):
    late_notice: PushLateNotice | None = None


class VapidOut(BaseModel):
    public_key: str


@router.get("/push/vapid-public-key", response_model=VapidOut)
def get_vapid_public_key() -> VapidOut:
    if not push_service.vapid_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Phone notifications are not configured",
        )
    return VapidOut(public_key=push_service.vapid_public_key())


@router.post("/sessions/{public_code}/push", response_model=PushSubscribeOut)
def subscribe_push(public_code: str, body: PushSubscribeIn) -> PushSubscribeOut:
    p256dh = (body.keys.get("p256dh") or "").strip()
    auth = (body.keys.get("auth") or "").strip()
    if not p256dh or not auth:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Push subscription keys are required",
        )
    result = push_service.save_subscription(public_code, body.endpoint, p256dh, auth)
    if result is False:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    notice = result if isinstance(result, dict) else None
    return PushSubscribeOut(late_notice=PushLateNotice(**notice) if notice else None)


@router.delete("/sessions/{public_code}/push", status_code=204)
def unsubscribe_push(public_code: str) -> None:
    if not push_service.clear_subscription(public_code):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
