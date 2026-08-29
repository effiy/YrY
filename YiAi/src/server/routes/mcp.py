"""
MCP tool proxy routes — lets the aiChat web UI list and invoke the tools
registered on YiAi's own MCP server (server/mcp_server.py).

Browsers can't easily do the MCP streamable-HTTP JSON-RPC handshake (SSE +
session init), so this thin proxy wraps the FastMCP instance's
list_tools / call_tool methods directly. The same envelope {code, message, data}
is returned.

Endpoints:
  GET  /mcp/tools          → list tools on the yiai MCP server
  POST /mcp/call           → invoke a tool by name with JSON arguments
"""
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from shared.response import success, fail
from shared.error_codes import ErrorCode

logger = logging.getLogger(__name__)
router = APIRouter()

def _serialize_tool(t):
    """Best-effort serialization of an MCP Tool object across SDK versions."""
    # mcp 1.x Tool is a pydantic BaseModel with name/description/inputSchema.
    try:
        if hasattr(t, "model_dump"):
            d = t.model_dump()
            # Normalize the JSON-Schema field name across versions
            if "inputSchema" in d and "input_schema" not in d:
                d["input_schema"] = d.pop("inputSchema")
            return d
    except Exception:
        pass
    out = {}
    for attr in ("name", "description", "input_schema", "inputSchema", "annotations"):
        v = getattr(t, attr, None)
        if v is not None:
            out[attr if attr != "inputSchema" else "input_schema"] = v
    return out or str(t)


@router.get("/mcp/tools", tags=["MCP"], operation_id="list_mcp_tools")
async def list_mcp_tools():
    """List all tools registered on the YiAi MCP server."""
    try:
        from server.mcp_server import mcp
        tools = await mcp.list_tools()
        return success(data=[_serialize_tool(t) for t in tools])
    except Exception as e:
        logger.exception("list_mcp_tools failed")
        return fail(ErrorCode.INTERNAL_ERROR, message=f"list_mcp_tools failed: {e}")


class McpCallRequest(BaseModel):
    name: str
    arguments: dict = {}


@router.post("/mcp/call", tags=["MCP"], operation_id="call_mcp_tool")
async def call_mcp_tool(req: McpCallRequest):
    """Invoke a tool on the YiAi MCP server by name with JSON arguments."""
    try:
        from server.mcp_server import mcp
        result = await mcp.call_tool(req.name, req.arguments)
        # FastMCP call_tool may return (result, content_blocks) or just a
        # result object depending on version. Normalize to a JSON-serializable
        # dict with a `content` string.
        text_parts: list[str] = []
        structured = None
        if isinstance(result, tuple):
            # (ToolResult with content blocks, ...)
            for item in result:
                _extract_content(item, text_parts)
        else:
            _extract_content(result, text_parts)
        try:
            structured = _jsonable(result)
        except Exception:
            structured = None
        return success(data={
            "content": "\n".join(text_parts) if text_parts else "",
            "structured": structured,
            "raw": repr(result),
        })
    except Exception as e:
        logger.exception("call_mcp_tool failed")
        return fail(ErrorCode.INTERNAL_ERROR, message=f"call_mcp_tool failed: {e}")


def _extract_content(item, out: list[str]) -> None:
    """Pull text out of MCP content blocks (TextContent, etc.)."""
    if item is None:
        return
    if isinstance(item, list):
        for sub in item:
            _extract_content(sub, out)
        return
    if isinstance(item, str):
        out.append(item)
        return
    # pydantic content blocks: TextContent has .text, ImageContent has .data
    for attr in ("text", "data", "content"):
        v = getattr(item, attr, None)
        if isinstance(v, str):
            out.append(v)
            return
    # Fall back to model_dump if it's a pydantic model
    try:
        d = item.model_dump() if hasattr(item, "model_dump") else None
        if d:
            out.append(str(d))
            return
    except Exception:
        pass
    out.append(str(item))


def _jsonable(obj):
    """Best-effort JSON serialization for arbitrary MCP result objects."""
    import json
    try:
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        if isinstance(obj, (list, dict, str, int, float, bool)) or obj is None:
            return obj
        return json.loads(json.dumps(obj, default=str))
    except Exception:
        return None
