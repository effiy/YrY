"""Analytics service layer — efficiency/quality metrics, snapshots, aggregation queries."""

from services.analytics.aggregator import get_efficiency_metrics, get_quality_metrics
from services.analytics.collector import collect_efficiency_snapshot, collect_quality_snapshot
from services.analytics.query_engine import get_available_fields, run_aggregation

__all__ = [
    "collect_efficiency_snapshot",
    "collect_quality_snapshot",
    "get_available_fields",
    "get_efficiency_metrics",
    "get_quality_metrics",
    "run_aggregation",
]
