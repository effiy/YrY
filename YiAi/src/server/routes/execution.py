import asyncio
import inspect
import logging
import types
from typing import Any

from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from domain.audit.decorator import set_audit_context
from domain.execution import execute_module
from models.schemas import ExecuteRequest
from shared.response import success
from shared.sse_utils import format_sse as _format_sse
from shared.sse_utils import stream_async as _stream_async
from shared.sse_utils import stream_sync as _stream_sync

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


# ── Batch RPC ──────────────────────────────────────────────────────────────


class BatchCallItem(BaseModel):
    module_name: str
    method_name: str
    parameters: dict[str, Any] = {}


class BatchExecuteRequest(BaseModel):
    calls: list[BatchCallItem]


async def _execute_single(module_name: str, method_name: str, parameters: dict[str, Any]) -> dict[str, Any]:
    """Execute a single RPC call and return its result envelope — catches all
    exceptions so one failed call doesn't fail the entire batch."""
    try:
        result = await execute_module(module_name, method_name, parameters)
        if inspect.isasyncgen(result) or hasattr(result, "__aiter__") or isinstance(result, types.GeneratorType):
            return {"code": 1001, "message": "Streaming endpoints are not supported in batch mode", "data": None}
        return {"code": 0, "message": "ok", "data": result}
    except Exception as e:
        return {"code": 9999, "message": str(e), "data": None}


@router.post("/batch", operation_id="execute_module_batch")
async def execute_module_batch(http_request: Request, request: BatchExecuteRequest):
    """Execute multiple RPC calls concurrently in a single HTTP request.

    Each call is executed independently — one failure does not affect others.
    Results are returned in the same order as the input ``calls`` array.
    Streaming endpoints (SSE) are not supported in batch mode.

    Request::

        POST /batch
        {
          "calls": [
            {"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {"cname": "menus"}},
            {"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {"cname": "users"}}
          ]
        }

    Response::

        {
          "code": 0,
          "message": "ok",
          "data": {
            "results": [
              {"code": 0, "message": "ok", "data": {...}},
              {"code": 0, "message": "ok", "data": {...}}
            ]
          }
        }
    """
    if not request.calls:
        return success(data={"results": []})

    actor = http_request.headers.get("X-User", "")
    ip = http_request.client.host if http_request.client else ""
    user_agent = http_request.headers.get("User-Agent", "")
    set_audit_context(actor=actor, ip=ip, user_agent=user_agent)

    tasks = [
        _execute_single(call.module_name, call.method_name, call.parameters)
        for call in request.calls
    ]
    results = await asyncio.gather(*tasks, return_exceptions=False)
    return success(data={"results": results})
