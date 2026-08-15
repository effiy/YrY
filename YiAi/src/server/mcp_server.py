"""
YiAi MCP Server — exposes YiAi's core capabilities as MCP tools.

Mounted to the FastAPI app at /mcp, this enables Claude (via Claude Code)
to interact with YiAi's backend services when working on YiPet or YiVad.
"""
import logging
import functools
import asyncio

from mcp.server.fastmcp import FastMCP

logger = logging.getLogger(__name__)

# Lazy references to avoid import-time side effects
_ollama_service = None
_settings = None

# ---------------------------------------------------------------------------
# Singleton FastMCP instance
# ---------------------------------------------------------------------------
mcp = FastMCP(
    name="YiAi",
    instructions="YiAi backend services — chat, state, database, RSS, and health.",
)


def _get_ollama():
    global _ollama_service
    if _ollama_service is None:
        from domain.ai.chat import OllamaService

        _ollama_service = OllamaService()
    return _ollama_service


def _get_settings():
    global _settings
    if _settings is None:
        from shared.config import settings as s

        _settings = s
    return _settings


# ---------------------------------------------------------------------------
# MCP Tools
# ---------------------------------------------------------------------------


@mcp.tool(
    name="chat_with_ollama",
    description="Send a prompt to the Ollama LLM via YiAi and get a response.",
)
async def chat_with_ollama(
    prompt: str,
    model: str = "qwen3.5:4b",
    system_prompt: str = "You are a helpful AI assistant.",
) -> str:
    """Chat with an Ollama model through YiAi."""
    service = _get_ollama()
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(
        None,
        functools.partial(
            service.generate_response,
            system_prompt=system_prompt,
            user_content=prompt,
            model_name=model,
        ),
    )
    if result.get("success"):
        return result.get("message", "")
    return f"[Error] {result.get('error', 'Unknown error')}"


@mcp.tool(
    name="list_ollama_models",
    description="List all available models on the Ollama server configured in YiAi.",
)
async def list_ollama_models() -> list[str]:
    """Return model names available in Ollama."""
    service = _get_ollama()
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, service.list_models)
    if not result.get("success"):
        return [f"Error: {result.get('error', 'Unknown')}"]
    return [m.get("name", "?") for m in result.get("models", [])]


@mcp.tool(
    name="health_check",
    description="Check YiAi server health status — uptime, DB status, RSS scheduler, etc.",
)
async def health_check() -> str:
    """Return a quick health summary of the YiAi server."""
    s = _get_settings()
    parts = [
        f"Server: {s.server_host}:{s.server_port}",
        f"Reload: {s.server_reload}",
        f"DB: {s.mongodb_url}/{s.mongodb_db_name}",
        f"Ollama: {s.ollama_url}",
        f"RSS scheduler: {s.rss_scheduler_enabled}",
        f"Auth middleware: {s.middleware_auth_enabled}",
        f"CORS origins: {s.get_cors_origins()}",
    ]
    return "\n".join(parts)


@mcp.tool(
    name="list_collections",
    description="List MongoDB collection names available in YiAi.",
)
async def list_collections() -> list[str]:
    """Return configured MongoDB collection names."""
    s = _get_settings()
    return [
        s.collection_sessions,
        s.collection_rss,
        s.collection_chat_records,
        s.collection_pet_data_sync,
        s.collection_seeds,
        s.collection_oss_file_tags,
        s.collection_oss_file_info,
        s.collection_static_files,
        s.collection_state_records,
    ]


@mcp.tool(
    name="query_collection",
    description="Query documents from a MongoDB collection. "
    "Pass a JSON filter string and optional limit (default 20).",
)
async def query_collection(
    collection_name: str,
    filter_json: str = "{}",
    limit: int = 20,
) -> str:
    """Query a MongoDB collection and return results as formatted JSON string."""
    import json
    from data.database import db

    try:
        filter_dict = json.loads(filter_json)
    except json.JSONDecodeError as e:
        return f"Invalid filter JSON: {e}"

    try:
        collection = db._db[collection_name]
        cursor = collection.find(filter_dict).limit(min(limit, 100))
        docs = await cursor.to_list(length=min(limit, 100))
        # Convert ObjectId to string for JSON serialization
        for doc in docs:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        return json.dumps(docs, ensure_ascii=False, indent=2, default=str)
    except Exception as e:
        return f"Query failed: {e}"


# ---------------------------------------------------------------------------
# FastAPI mount helper
# ---------------------------------------------------------------------------

def mount_to_app(app):
    """Mount the MCP streamable-HTTP server onto a FastAPI/Starlette app.

    Usage inside create_app()::

        from server.mcp_server import mount_to_app
        mount_to_app(app)

    This exposes the MCP endpoint at ``/mcp``.
    """
    mcp_app = mcp.streamable_http_app()
    app.mount("/mcp", mcp_app)
    logger.info("MCP server mounted at /mcp")
