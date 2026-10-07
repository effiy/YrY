"""Collection service — vocabulary/wordbook export via RPC."""

import logging

from services.translation.providers import (
    COLLECTION_PROVIDERS,
    _init_collection_providers,
)

logger = logging.getLogger(__name__)


async def collect(
    source: str,
    target: str,
    provider: str = "anki",
    config: dict | None = None,
) -> dict:
    """Export translation result to vocabulary collection.

    Args:
        source: Source text (original word/phrase).
        target: Target text (translation).
        provider: Collection provider name (default "anki").
        config: Provider-specific configuration.

    Returns:
        Dict with success status.
    """
    _init_collection_providers()
    config = config or {}
    p = COLLECTION_PROVIDERS.get(provider)
    if p is None:
        return {"success": False, "error": f"Unknown collection provider: {provider}"}

    try:
        await p.collect(source, target, **config)
        return {"success": True, "provider": provider}
    except Exception as e:
        logger.warning(f"Collection provider {provider} failed: {e!s}")
        return {"success": False, "provider": provider, "error": str(e)}
