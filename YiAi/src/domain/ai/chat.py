import logging
import asyncio
import functools
import base64
from typing import Dict, Any, Optional, List
import aiohttp
from ollama import Client
from shared.config import settings

logger = logging.getLogger(__name__)

_IMAGE_FETCH_CHUNK = 256 * 1024       # 256KB read chunks
_IMAGE_FETCH_MAX_BYTES = 10 * 1024 * 1024  # 10MB max per image
_IMAGE_FETCH_SEMAPHORE = 4            # concurrent HTTP fetches


def _extract_user_only_text(user_content: str) -> str:
    text = (user_content or "").strip()
    if not text:
        return ""
    if "## Current Message" in text:
        after = text.split("## Current Message", 1)[1].strip()
        if after.startswith("#"):
            after = after.lstrip("#").strip()
        if after.startswith("Current Message"):
            after = after[len("Current Message") :].strip()
        return after
    return text

def _is_http_url(v: str) -> bool:
    s = (v or "").strip().lower()
    return s.startswith("http://") or s.startswith("https://")

async def _fetch_image_bytes(url: str, *, timeout_seconds: float = 15.0, max_bytes: int = _IMAGE_FETCH_MAX_BYTES) -> Optional[bytes]:
    u = (url or "").strip()
    if not u:
        return None
    timeout = aiohttp.ClientTimeout(total=timeout_seconds)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.get(u) as resp:
            if resp.status < 200 or resp.status >= 300:
                return None
            ct = (resp.headers.get("Content-Type") or "").lower()
            if ct and not ct.startswith("image/"):
                return None
            buf = bytearray()
            async for chunk in resp.content.iter_chunked(_IMAGE_FETCH_CHUNK):
                if not chunk:
                    continue
                buf.extend(chunk)
                if len(buf) > max_bytes:
                    return None
            return bytes(buf)

async def _resolve_images(images: Any) -> List[bytes]:
    if not isinstance(images, list):
        return []
    out: List[bytes] = []
    http_urls: List[str] = []
    for item in images:
        raw = (item or "").strip() if isinstance(item, str) else ""
        if not raw:
            continue
        if _is_http_url(raw):
            http_urls.append(raw)
            continue
        if raw.startswith("data:"):
            comma = raw.find(",")
            if comma >= 0:
                raw = raw[comma + 1 :].strip()
        try:
            out.append(base64.b64decode(raw, validate=True))
        except Exception:
            continue

    if http_urls:
        sem = asyncio.Semaphore(_IMAGE_FETCH_SEMAPHORE)

        async def _task(u: str) -> Optional[bytes]:
            async with sem:
                try:
                    return await _fetch_image_bytes(u)
                except Exception:
                    return None

        fetched = await asyncio.gather(*[_task(u) for u in http_urls], return_exceptions=False)
        out.extend([b for b in fetched if isinstance(b, (bytes, bytearray)) and b])
    return out

class OllamaService:
    """Ollama service client wrapper"""
    def __init__(self, host: Optional[str] = None, auth: Optional[str] = None):
        """
        Initialize Ollama service client

        Args:
            host: Ollama service address, defaults from config
            auth: Authentication info, defaults from config
        """
        self.ollama_url = host or settings.ollama_url
        self.ollama_auth = auth or settings.ollama_auth

    def _get_client(self) -> Client:
        """Get Ollama client instance"""
        if self.ollama_auth:
            if ':' in self.ollama_auth:
                username, password = self.ollama_auth.split(':', 1)
            else:
                username = self.ollama_auth
                password = ""
            return Client(host=self.ollama_url, auth=(username, password))
        else:
            return Client(host=self.ollama_url)

    def generate_response(self,
                          system_prompt: str = "You are a helpful AI assistant.",
                          user_content: str = "",
                          model_name: str = "qwen3.5:4b",
                          images: Optional[List[bytes]] = None,
                          messages: Optional[List[Dict[str, Any]]] = None,
                          max_retries: int = 2) -> Dict[str, Any]:
        """
        Generate AI response

        Args:
            system_prompt: System prompt (used when `messages` is None)
            user_content: User input content (used when `messages` is None)
            model_name: Model name
            images: Optional image bytes attached to the last user message
            messages: Full conversation history in Ollama format
                [{role: "system"|"user"|"assistant", content: str}]; when provided,
                overrides `system_prompt` + `user_content`.
            max_retries: Maximum retry attempts
        """
        client = self._get_client()
        images = images or []
        if messages is not None:
            ollama_messages = list(messages)
            if images and ollama_messages:
                last = dict(ollama_messages[-1])
                last["images"] = images
                ollama_messages[-1] = last
        else:
            ollama_messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content, **({"images": images} if images else {})}
            ]
        attempt = 0
        last_error: Optional[str] = None
        while attempt <= max_retries:
            try:
                response = client.chat(model=model_name, messages=ollama_messages)
                if isinstance(response, dict):
                    msg = response.get("message", {}) or {}
                    result = msg.get("content") or msg.get("thinking") or ""
                else:
                    msg = getattr(response, "message", {}) or {}
                    result = getattr(msg, "content", "") or getattr(msg, "thinking", "") or ""
                return {
                    "success": True,
                    "model": model_name,
                    "message": result
                }
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Ollama call failed: {last_error}, attempt={attempt}")
                attempt += 1
        logger.error(f"Ollama call ultimately failed: {last_error}")
        return {
            "success": False,
            "error": last_error or "unknown error",
            "model": model_name
        }

    def list_models(self) -> Dict[str, Any]:
        """
        Get list of available models from the Ollama server

        Returns:
            Dict[str, Any]: Dictionary containing model list
                - success: bool - Whether the operation succeeded
                - models: List[Dict] - List of models (on success)
                - error: str - Error message (on failure)
        """
        client = self._get_client()
        try:
            logger.debug("Calling Ollama list models API")
            response = client.list()

            # Compatible with both dict and object response formats
            models = []
            if isinstance(response, dict):
                models = response.get('models', [])
            elif hasattr(response, 'models'):
                models = response.models

            logger.info(f"Successfully retrieved Ollama model list, {len(models)} models total")
            return {
                "success": True,
                "models": models
            }
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to get Ollama model list: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

async def chat(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Structured chat interface — delegates to ModelRuntime (Pi-inspired).

    Supports multiple AI providers via ``ai_provider`` config: ollama, openai, anthropic.
    Provider-specific config (api_key, base_url, model) is read from config.yaml.

    Args:
        params: Parameter dictionary
            - system (str): System prompt (optional)
            - user (str): User input (used when `messages` is absent)
            - model (str): Model name (optional, overrides provider default)
            - messages (list): Full conversation history
                [{role, content}]; when provided, overrides `system`+`user`.
            - stream (bool): Enable SSE streaming
            - images (list): Optional image refs (URL/data-URL/base64) for VL models
            - provider (str): Override ai_provider for this request (ollama|openai|anthropic)

    Returns:
        Dict[str, Any]: Chat response (non-stream) or async generator (stream)
    """
    from services.ai.model_runtime import OllamaRuntime, OpenAIRuntime, AnthropicRuntime, get_runtime

    provider = params.get("provider") or settings.ai_provider or "ollama"
    system_prompt = params.get("system", "You are a helpful AI assistant.")
    user_content = params.get("user", "")
    model_name = params.get("model") or ""
    stream = params.get("stream") is True
    images_param = params.get("images")
    has_images_param = isinstance(images_param, list) and any(isinstance(x, str) and x.strip() for x in images_param)
    images = await _resolve_images(images_param)
    raw_messages = params.get("messages")
    use_messages = isinstance(raw_messages, list) and len(raw_messages) > 0

    if has_images_param:
        model_name = model_name or "qwen3-vl"
        if use_messages:
            last = dict(raw_messages[-1])
            if last.get("role") == "user":
                last["content"] = _extract_user_only_text(last.get("content", ""))
                raw_messages = list(raw_messages)
                raw_messages[-1] = last
        else:
            user_content = _extract_user_only_text(user_content)

    def _build_ollama_messages() -> List[Dict[str, Any]]:
        if use_messages:
            msgs = list(raw_messages)
            if system_prompt:
                msgs.insert(0, {"role": "system", "content": system_prompt})
            return msgs
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

    runtime = get_runtime(provider)
    if not model_name:
        model_name = runtime.model_name()

    if not stream:
        return await runtime.complete(
            messages=_build_ollama_messages(),
            model=model_name,
            images=images,
        )

    return runtime.stream_chat(
        messages=_build_ollama_messages(),
        model=model_name,
        images=images,
    )


async def list_ollama_models(params: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Get available Ollama model list (async module function)

    Call this function through the module execution engine to get the list of
    models installed on the Ollama server.

    Args:
        params: Parameter dictionary (optional, not used in current version)

    Returns:
        Dict[str, Any]: Model list response, same format as OllamaService.list_models()

    Example:
        GET /?module_name=services.ai.chat_service&method_name=list_ollama_models&parameters=%7B%7D
    """
    logger.debug("Executing list_ollama_models")
    service = OllamaService()
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, service.list_models)


# ── Error classification (Pi-inspired) ────────────────────────────────────

_ERROR_PATTERNS = {
    "connection_refused": (
        "Cannot connect to the AI service. Please check that the LLM server "
        "is running and reachable."
    ),
    "connection_error": (
        "Connection to AI service lost. The server may be restarting or "
        "unreachable. Please try again in a moment."
    ),
    "timeout": (
        "The AI service took too long to respond. This may be due to high "
        "load or a complex query. Please try again with a shorter message."
    ),
    "model_not_found": (
        "The requested model is not available. Please check the model name "
        "or install it on the server."
    ),
    "context_overflow": (
        "The conversation is too long for the model's context window. "
        "Please start a new conversation or summarize the previous discussion."
    ),
    "rate_limit": (
        "Too many requests. Please wait a moment before sending another message."
    ),
    "unknown": "An unexpected error occurred. Please try again.",
}


def classify_error(error: str) -> Dict[str, str]:
    """Classify a raw error string into a user-friendly message.

    Pi-inspired: maps raw provider errors to readable messages so the
    frontend can show actionable feedback instead of stack traces.
    """
    error_lower = (error or "").lower()
    if any(kw in error_lower for kw in ("connection refused", "connect", "econnrefused")):
        return {"type": "connection_refused", "message": _ERROR_PATTERNS["connection_refused"]}
    if any(kw in error_lower for kw in ("timeout", "timed out")):
        return {"type": "timeout", "message": _ERROR_PATTERNS["timeout"]}
    if any(kw in error_lower for kw in ("not found", "not_found", "no such model")):
        return {"type": "model_not_found", "message": _ERROR_PATTERNS["model_not_found"]}
    if any(kw in error_lower for kw in ("context", "overflow", "token limit", "too long")):
        return {"type": "context_overflow", "message": _ERROR_PATTERNS["context_overflow"]}
    if any(kw in error_lower for kw in ("rate", "throttl", "too many")):
        return {"type": "rate_limit", "message": _ERROR_PATTERNS["rate_limit"]}
    if any(kw in error_lower for kw in ("connection", "network", "unreachable", "dns")):
        return {"type": "connection_error", "message": _ERROR_PATTERNS["connection_error"]}
    return {"type": "unknown", "message": _ERROR_PATTERNS["unknown"]}


async def get_model_info(params: Dict[str, Any] = None) -> Dict[str, Any]:
    """Return available models and provider status for the frontend model selector.

    Queries the configured provider for available models and returns their
    capabilities (vision, tool calling, context window). Pi-inspired: the
    model picker shows what each model can do before the user selects it.
    """
    provider = (params or {}).get("provider") or settings.ai_provider or "ollama"
    info: Dict[str, Any] = {
        "provider": provider,
        "default_model": "",
        "models": [],
        "status": "unknown",
    }

    if provider == "ollama":
        info["default_model"] = settings.rag_llm_model
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{settings.ollama_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        info["status"] = "connected"
                        for m in data.get("models", []) or []:
                            name = m.get("name", "") if isinstance(m, dict) else str(m)
                            details = m.get("details", {}) if isinstance(m, dict) else {}
                            info["models"].append({
                                "name": name,
                                "size": details.get("parameter_size", ""),
                                "family": details.get("family", ""),
                                "format": details.get("format", ""),
                            })
                    else:
                        info["status"] = "error"
                        info["error"] = f"HTTP {resp.status}"
        except Exception as e:
            info["status"] = "disconnected"
            info["error"] = str(e)
    elif provider == "openai":
        info["default_model"] = settings.openai_default_model
        info["models"].append({"name": settings.openai_default_model})
        info["status"] = "configured"
    elif provider == "anthropic":
        info["default_model"] = settings.anthropic_default_model
        info["models"].append({"name": settings.anthropic_default_model})
        info["status"] = "configured"

    return info
