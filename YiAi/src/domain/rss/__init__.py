"""RSS feed management — public API."""
from domain.rss.scheduler import init_rss_system, shutdown_rss_system

__all__ = ["init_rss_system", "shutdown_rss_system"]
