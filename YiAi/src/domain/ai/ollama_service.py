"""Ollama service client wrapper."""

import logging
from typing import Any

from ollama import Client

from shared.config import settings

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self, host: str | None = None, auth: str | None = None):
        self.ollama_url = host or settings.ollama_url
        self.ollama_auth = auth or settings.ollama_auth

    def _get_client(self) -> Client:
        if self.ollama_auth:
            if ":" in self.ollama_auth:
                username, password = self.ollama_auth.split(":", 1)
            else:
                username = self.ollama_auth
                password = ""
            return Client(host=self.ollama_url, auth=(username, password))
        return Client(host=self.ollama_url)

    def generate_response(self, system_prompt: str = "You are a helpful AI assistant.", user_content: str = "", model_name: str = "qwen3.5:4b", images: list[bytes] | None = None, messages: list[dict[str, Any]] | None = None, max_retries: int = 2) -> dict[str, Any]:
        client = self._get_client()
        images = images or []
        if messages is not None:
            ollama_messages = list(messages)
            if images and ollama_messages:
                last = dict(ollama_messages[-1])
                last["images"] = images
                ollama_messages[-1] = last
        else:
            ollama_messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_content, **({"images": images} if images else {})}]
        attempt = 0
        last_error: str | None = None
        while attempt <= max_retries:
            try:
                response = client.chat(model=model_name, messages=ollama_messages)
                if isinstance(response, dict):
                    msg = response.get("message", {}) or {}
                    result = msg.get("content") or msg.get("thinking") or ""
                else:
                    msg = getattr(response, "message", {}) or {}
                    result = getattr(msg, "content", "") or getattr(msg, "thinking", "") or ""
                return {"success": True, "model": model_name, "message": result}
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Ollama call failed: {last_error}, attempt={attempt}")
                attempt += 1
        logger.error(f"Ollama call ultimately failed: {last_error}")
        return {"success": False, "error": last_error or "unknown error", "model": model_name}

    def list_models(self) -> dict[str, Any]:
        client = self._get_client()
        try:
            logger.debug("Calling Ollama list models API")
            response = client.list()
            models = []
            if isinstance(response, dict):
                models = response.get("models", [])
            elif hasattr(response, "models"):
                models = response.models
            logger.info(f"Successfully retrieved Ollama model list, {len(models)} models total")
            return {"success": True, "models": models}
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to get Ollama model list: {error_msg}")
            return {"success": False, "error": error_msg}
