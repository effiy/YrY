import logging
from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse
import inspect
import types
from typing import Any
from models.schemas import ExecuteRequest
from shared.response import success
from shared.sse_utils import format_sse as _format_sse, stream_async as _stream_async, stream_sync as _stream_sync
from domain.execution import execute_module
from domain.audit.decorator import set_audit_context

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", operation_id="execute_module_get")
async def execute_module_via_get(
    module_name: str = "",
    method_name: str = "",
    parameters: str = Query(default='{}')
):
    """
    Execute specified module method via GET
    """
    result = await execute_module(module_name, method_name, parameters)
    if inspect.isasyncgen(result) or hasattr(result, "__aiter__"):
        return StreamingResponse(
            _stream_async(result),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )
    if isinstance(result, types.GeneratorType):
        return StreamingResponse(
            _stream_sync(result),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )
    return success(data=result)

@router.post("/", operation_id="execute_module_post")
async def execute_module_via_post(http_request: Request, request: ExecuteRequest):
    """
    Execute specified module method via POST
    """
    logger.info(f"Execute module: {request.module_name}, method: {request.method_name}")
    logger.debug(f"Parameters: {str(request.parameters)[:500]}")
    actor = http_request.headers.get("X-User", "")
    ip = http_request.client.host if http_request.client else ""
    user_agent = http_request.headers.get("User-Agent", "")
    set_audit_context(actor=actor, ip=ip, user_agent=user_agent)
    result = await execute_module(request.module_name, request.method_name, request.parameters)
    if inspect.isasyncgen(result) or hasattr(result, "__aiter__"):
        return StreamingResponse(
            _stream_async(result),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )
    if isinstance(result, types.GeneratorType):
        return StreamingResponse(
            _stream_sync(result),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
        )
    return success(data=result)
