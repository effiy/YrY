"""Lingva TTS provider."""

import logging

from services.translation.providers.base import BaseTTSProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class LingvaTTSProvider(BaseTTSProvider):
    name = "lingva"
    label = "Lingva TTS"

    async def _tts(self, text: str, language: str, **config) -> dict:
        request_path = config.get("request_path", "https://lingva.pot-app.com")
        if not request_path.startswith("http"):
            request_path = f"https://{request_path}"

        client = get_shared_client()
        resp = await client.get(
            f"{request_path}/api/v1/audio/{language}/{text}",
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        audio_b64 = data.get("audio", "")
        if audio_b64:
            return {"audio": audio_b64, "format": "mp3"}
        return {"audio": "", "error": "No audio returned"}
