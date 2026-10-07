"""RSS domain — feed parsing, classification, and scheduled ingestion.

Public API:
- ``init_rss_system`` / ``shutdown_rss_system`` — lifecycle hooks for FastAPI lifespan.
- ``start_rss_scheduler`` / ``stop_rss_scheduler`` — control the polling job.
- ``set_scheduler_config`` — change interval/cron/enabled at runtime.
- ``get_scheduler_status_info`` — read current state (used by ``/system/scheduler``).
- ``parse_all_enabled_rss_sources`` — one-shot manual fetch of all enabled feeds.

Pure helpers (no I/O) live in ``persistence.py``; they are intentionally
module-private (underscore-prefixed) because external callers should go
through the service layer instead.
"""

from domain.rss.persistence import (  # noqa: F401
    _build_entry_metadata,
    _build_meta,
    _classify_entry,
    _entry_body,
    _entry_date_dir,
    _keyword_matches,
    _slugify,
)
from domain.rss.scheduler import (  # noqa: F401
    _scheduler_manager,
    get_scheduler_status_info,
    init_rss_system,
    parse_all_enabled_rss_sources,
    set_scheduler_config,
    shutdown_rss_system,
    start_rss_scheduler,
    stop_rss_scheduler,
)

__all__ = [
    "get_scheduler_status_info",
    "init_rss_system",
    "parse_all_enabled_rss_sources",
    "set_scheduler_config",
    "shutdown_rss_system",
    "start_rss_scheduler",
    "stop_rss_scheduler",
]
