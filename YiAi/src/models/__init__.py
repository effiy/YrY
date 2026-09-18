"""Models package — pre-compiles Pydantic v2 schemas on import.

Pydantic v2 uses Rust-based core schema compilation which is lazy by default.
The first request that validates a model pays the compilation cost (~5-50ms
depending on complexity). By calling ``model_rebuild()`` at import time, all
31 models are pre-compiled and ready before the first request arrives.

This module should be imported by ``app.py`` early in the startup sequence.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def _precompile_all() -> None:
    """Call ``model_rebuild()`` on every Pydantic v2 model in schemas.py."""
    from models import schemas
    import inspect

    count = 0
    for name, obj in inspect.getmembers(schemas, inspect.isclass):
        if not hasattr(obj, "model_rebuild"):
            continue
        try:
            obj.model_rebuild()
            count += 1
        except Exception:
            logger.debug("model_rebuild skipped for %s", name, exc_info=True)

    if count:
        logger.info("Pydantic models pre-compiled: %d", count)


# Run on import
_precompile_all()
