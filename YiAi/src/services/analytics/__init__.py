"""Analytics service layer — efficiency/quality metrics, snapshots, aggregation queries, and project dashboard."""

from services.analytics.aggregator import get_efficiency_metrics, get_quality_metrics
from services.analytics.file_alerts import get_file_alerts
from services.analytics.collector import collect_efficiency_snapshot, collect_quality_snapshot
from services.analytics.module_dashboard import get_module_dashboard
from services.analytics.project_dashboard import get_project_dashboard
from services.analytics.query_engine import get_available_fields, run_aggregation

__all__ = [
    "collect_efficiency_snapshot",
    "collect_quality_snapshot",
    "get_available_fields",
    "get_efficiency_metrics",
    "get_file_alerts",
    "get_module_dashboard",
    "get_project_dashboard",
    "get_quality_metrics",
    "run_aggregation",
]
