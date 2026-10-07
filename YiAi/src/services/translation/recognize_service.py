"""OCR recognition service — text recognition from images via RPC."""

import asyncio
import logging

from services.translation.providers import (
    RECOGNIZE_PROVIDERS,
    _init_recognize_providers,
)

logger = logging.getLogger(__name__)


async def recognize(
    image_base64: str,
    language: str = "auto",
    providers: list[str] | None = None,
    provider_config: dict | None = None,
) -> list[dict]:
    """OCR text recognition from base64-encoded image.

    Args:
        image_base64: Base64-encoded image data.
        language: Language code for recognition.
        providers: List of provider names. Defaults to all available.
        provider_config: Dict mapping provider name -> config dict.

    Returns:
        List of {provider, text, error?} results.
    """
    _init_recognize_providers()
    provider_config = provider_config or {}
    selected = providers or list(RECOGNIZE_PROVIDERS.keys())

    tasks = []
    for name in selected:
        p = RECOGNIZE_PROVIDERS.get(name)
        if p is None:
            logger.warning(f"Unknown recognize provider: {name}")
            continue
        config = provider_config.get(name, {})
        tasks.append(_recognize_one(p, image_base64, language, config))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    output = []
    for i, result in enumerate(results):
        name = selected[i] if i < len(selected) else "unknown"
        if isinstance(result, Exception):
            output.append({"provider": name, "text": "", "error": str(result)})
        else:
            output.append({"provider": name, "text": result, "error": None})
    return output


async def _recognize_one(provider, image_base64: str, language: str, config: dict) -> str:
    try:
        return await provider.recognize(image_base64, language, **config)
    except Exception as e:
        logger.warning(f"OCR provider {provider.name} failed: {e!s}")
        raise
