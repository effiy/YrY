"""MCP server tools exposed as agent tools."""
from __future__ import annotations

from typing import Any, Dict

from domain.ai.tools.core import ToolRegistry, ToolDefinition

def _register_mcp_tools(registry: ToolRegistry) -> None:
    """Register YiAi MCP server tools as agent tools.

    These wrap the FastMCP tools defined in server/mcp_server.py so the agent
    can call YiAi's own capabilities (chat, DB queries, health checks, etc.).
    """

    async def _mcp_chat(args: Dict[str, Any]) -> Dict[str, Any]:
        from server.mcp_server import mcp
        prompt = str(args.get("prompt", ""))
        model = str(args.get("model", "qwen3.5:4b"))
        system = str(args.get("system_prompt", "You are a helpful AI assistant."))
        try:
            result = await mcp.call_tool("chat_with_ollama", {
                "prompt": prompt, "model": model, "system_prompt": system,
            })
            content = _extract_mcp_text(result)
            return {"content": content, "details": {"model": model}}
        except Exception as e:
            return {"content": "", "error": f"MCP chat failed: {e}"}

    registry.register(ToolDefinition(
        name="mcp_chat",
        description="Send a prompt to the Ollama LLM via YiAi's MCP server. Use for quick LLM queries without streaming.",
        parameters={
            "type": "object",
            "properties": {
                "prompt": {"type": "string", "description": "The prompt to send to the LLM"},
                "model": {"type": "string", "description": "Model name (default: qwen3.5:4b)"},
                "system_prompt": {"type": "string", "description": "System prompt for the LLM"},
            },
            "required": ["prompt"],
        },
        execute=_mcp_chat,
    ))

    async def _mcp_list_models(args: Dict[str, Any]) -> Dict[str, Any]:
        from server.mcp_server import mcp
        try:
            result = await mcp.call_tool("list_ollama_models", {})
            content = _extract_mcp_text(result)
            return {"content": content, "details": {}}
        except Exception as e:
            return {"content": "", "error": f"MCP list_models failed: {e}"}

    registry.register(ToolDefinition(
        name="mcp_list_models",
        description="List all available Ollama models on the YiAi server.",
        parameters={"type": "object", "properties": {}, "required": []},
        execute=_mcp_list_models,
    ))

    async def _mcp_health(args: Dict[str, Any]) -> Dict[str, Any]:
        from server.mcp_server import mcp
        try:
            result = await mcp.call_tool("health_check", {})
            content = _extract_mcp_text(result)
            return {"content": content, "details": {}}
        except Exception as e:
            return {"content": "", "error": f"MCP health_check failed: {e}"}

    registry.register(ToolDefinition(
        name="mcp_health",
        description="Check the YiAi server health status — uptime, DB, Ollama, RSS scheduler.",
        parameters={"type": "object", "properties": {}, "required": []},
        execute=_mcp_health,
    ))

    async def _mcp_query_db(args: Dict[str, Any]) -> Dict[str, Any]:
        from server.mcp_server import mcp
        collection = str(args.get("collection", ""))
        filter_json = str(args.get("filter", "{}"))
        limit = min(int(args.get("limit", 20)), 100)
        try:
            result = await mcp.call_tool("query_collection", {
                "collection_name": collection,
                "filter_json": filter_json,
                "limit": limit,
            })
            content = _extract_mcp_text(result)
            return {"content": content, "details": {"collection": collection}}
        except Exception as e:
            return {"content": "", "error": f"MCP query failed: {e}"}

    registry.register(ToolDefinition(
        name="mcp_query_db",
        description="Query documents from a MongoDB collection via YiAi. Pass collection name and optional JSON filter.",
        parameters={
            "type": "object",
            "properties": {
                "collection": {"type": "string", "description": "MongoDB collection name (e.g. sessions, chat_records, seeds)"},
                "filter": {"type": "string", "description": "JSON filter string (default: '{}')"},
                "limit": {"type": "integer", "description": "Max results (default: 20, max: 100)"},
            },
            "required": ["collection"],
        },
        execute=_mcp_query_db,
    ))


def _extract_mcp_text(result) -> str:
    """Extract text content from an MCP call_tool result across SDK versions."""
    if result is None:
        return ""
    if isinstance(result, str):
        return result
    if isinstance(result, (list, tuple)):
        parts: list[str] = []
        for item in result:
            text = _extract_mcp_text(item)
            if text:
                parts.append(text)
        return "\n".join(parts)
    # pydantic model or object with content/text attributes
    for attr in ("content", "text", "data"):
        v = getattr(result, attr, None)
        if isinstance(v, str):
            return v
        if isinstance(v, list):
            parts = [_extract_mcp_text(i) for i in v]
            return "\n".join(filter(None, parts))
    try:
        if hasattr(result, "model_dump"):
            import json
            return json.dumps(result.model_dump(), ensure_ascii=False, default=str)
    except Exception:
        logger.debug("Failed to serialize result as JSON, falling back to str", exc_info=True)
    return str(result)