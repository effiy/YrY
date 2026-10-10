"""AI chat — public API re-exports.

All logic lives in sub-modules:
- image_helpers.py: Image fetching/resolution for multimodal chat
- ollama_service.py: OllamaService client wrapper
- error_classifier.py: Error classification for user-friendly messages

External callers should continue to import from domain.ai.chat.
"""

import asyncio
import logging
from typing import Any

import aiohttp

from domain.ai.image_helpers import _extract_user_only_text, _resolve_images
from domain.ai.ollama_service import OllamaService
# ⚠ IMPORTANT: These symbols must be explicitly re-exported here so that
# `from domain.ai.chat import classify_error` works. Python does NOT
# automatically expose sub-module attributes through a parent namespace — the
# package `import X` statements above only bind the _modules_; attributes
# need explicit re-exports. This is the root cause of
# "cannot import name 'classify_error' from 'domain.ai.chat'"
# whenever services/ai/chat_service.py re-imports these symbols.
from domain.ai.error_classifier import classify_error  # noqa: F401
from shared.config import settings

logger = logging.getLogger(__name__)


async def chat(params: dict[str, Any]) -> dict[str, Any]:
    from services.ai.model_runtime import get_runtime

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

    def _build_ollama_messages() -> list[dict[str, Any]]:
        if use_messages:
            msgs = list(raw_messages)
            if system_prompt:
                msgs.insert(0, {"role": "system", "content": system_prompt})
            return msgs
        return [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_content}]

    runtime = get_runtime(provider)
    if not model_name:
        model_name = runtime.model_name()

    if not stream:
        return await runtime.complete(messages=_build_ollama_messages(), model=model_name, images=images)
    return runtime.stream_chat(messages=_build_ollama_messages(), model=model_name, images=images)


async def list_ollama_models(params: dict[str, Any] = None) -> dict[str, Any]:
    logger.debug("Executing list_ollama_models")
    service = OllamaService()
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, service.list_models)


async def get_model_info(params: dict[str, Any] = None) -> dict[str, Any]:
    provider = (params or {}).get("provider") or settings.ai_provider or "ollama"
    info: dict[str, Any] = {"provider": provider, "default_model": "", "models": [], "status": "unknown"}

    if provider == "ollama":
        info["default_model"] = settings.rag_llm_model
        try:
            async with aiohttp.ClientSession() as session, session.get(f"{settings.ollama_url}/api/tags", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    info["status"] = "connected"
                    for m in data.get("models", []) or []:
                        name = m.get("name", "") if isinstance(m, dict) else str(m)
                        details = m.get("details", {}) if isinstance(m, dict) else {}
                        info["models"].append({"name": name, "size": details.get("parameter_size", ""), "family": details.get("family", ""), "format": details.get("format", "")})
                else:
                    info["status"] = "error"
                    info["error"] = f"HTTP {resp.status}"
        except Exception as e:
            info["status"] = "disconnected"
            info["error"] = str(e)
    elif provider in ("deepseek", "openai"):
        info["default_model"] = settings.deepseek_default_model
        info["models"].append({"name": settings.deepseek_default_model})
        info["status"] = "configured"

    return info


# ── Explicit symbol re-exports (for `from domain.ai.chat import X` callers) ─
# These re-bind the symbols into this module's namespace at runtime. The
# import statement above already binds classify_error; we add the remaining
# names that chat_service.py (and others) rely on via wildcard / named
# re-imports so future Python/linter upgrades do not silently break them.
__all__ = [
    "OllamaService",
    "chat",
    "classify_error",
    "get_model_info",
    "list_ollama_models",
]
