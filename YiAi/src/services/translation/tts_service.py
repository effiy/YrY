"""TTS service — text-to-speech synthesis via RPC."""

import logging

from services.translation.providers import (
    TTS_PROVIDERS,
    _init_tts_providers,
)

logger = logging.getLogger(__name__)


async def tts(
    text: str,
    language: str = "en",
    provider: str = "lingva",
    config: dict | None = None,
) -> dict:
    """Text-to-speech synthesis.

    Args:
        text: Text to synthesize.
        language: Language code.
        provider: Provider name (default "lingva").
        config: Provider-specific configuration.

    Returns:
        Dict with audio data and format.
    """
    _init_tts_providers()
    config = config or {}
    p = TTS_PROVIDERS.get(provider)
    if p is None:
        return {"audio": "", "format": "", "error": f"Unknown TTS provider: {provider}"}

    try:
        result = await p.tts(text, language, **config)
        return {"provider": provider, **result}
    except Exception as e:
        logger.warning(f"TTS provider {provider} failed: {e!s}")
        return {"provider": provider, "audio": "", "error": str(e)}
