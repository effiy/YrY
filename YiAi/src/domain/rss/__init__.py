"""RSS 订阅与调度。"""
from domain.rss.feed import fetch_rss_feed, process_feed_from_url, parse_feed
from domain.rss.scheduler import (
    RSSSchedulerManager,
    get_enabled_rss_sources,
    parse_rss_source_safe,
    parse_all_enabled_rss_sources,
    rss_scheduler_job,
    get_scheduler,
    start_rss_scheduler,
    stop_rss_scheduler,
    set_scheduler_config,
    get_scheduler_status_info,
    init_rss_system,
    shutdown_rss_system,
)

__all__ = [
    "fetch_rss_feed",
    "process_feed_from_url",
    "parse_feed",
    "RSSSchedulerManager",
    "get_enabled_rss_sources",
    "parse_rss_source_safe",
    "parse_all_enabled_rss_sources",
    "rss_scheduler_job",
    "get_scheduler",
    "start_rss_scheduler",
    "stop_rss_scheduler",
    "set_scheduler_config",
    "get_scheduler_status_info",
    "init_rss_system",
    "shutdown_rss_system",
]
