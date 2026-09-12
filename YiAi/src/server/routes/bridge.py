"""Bridge token endpoints — YiPet → YiVad cross-project session transfer.

Exposes the one-time bridge token mechanism from services/bridge_service.py
as REST endpoints for YiPet and YiVad to call.
"""
from fastapi import APIRouter, Body
from services.bridge_service import get_bridge_service
from shared.response import success, fail
from shared.error_codes import ErrorCode

router = APIRouter(prefix="/bridge", tags=["Bridge"])


@router.post("/create-token")
async def create_bridge_token(body: dict = Body(...)):
    """Create a one-time bridge token for session transfer."""
    session_id = body.get("session_id", "")
    origin = body.get("origin", "unknown")
    if not session_id:
        return fail(ErrorCode.INVALID_PARAMS, message="session_id is required")
    bs = get_bridge_service()
    token = bs.create_token(session_id, origin)
    return success(data={"token": token})


@router.post("/exchange-token")
async def exchange_bridge_token(body: dict = Body(...)):
    """Exchange a one-time bridge token for session data."""
    token = body.get("token", "")
    origin = body.get("origin", "yivad")
    if not token:
        return fail(ErrorCode.INVALID_PARAMS, message="token is required")
    bs = get_bridge_service()
    result = bs.exchange_token(token, origin)
    if result is None:
        return fail(ErrorCode.DATA_NOT_FOUND, message="Invalid or expired token")
    return success(data=result)