"""Execution recorder stub — records skill execution outcomes."""
import logging

logger = logging.getLogger(__name__)


async def get_recorder():
    """Return a no-op recorder when state recording is not configured."""
    return None
