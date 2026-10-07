"""Pre-computed analytics metrics — efficiency, quality, and team performance.

RPC methods:
  - get_efficiency_metrics(params) → { cycle_time, lead_time, throughput, cfd, wip_aging, bottlenecks, trends }
  - get_quality_metrics(params)     → { bugRate, reworkRate, defectDensity, score, trends, distributions }
  - get_file_alerts(params)         → { alerts, summary } — knowledge file health warnings
"""

from services.analytics.aggregator.efficiency import get_efficiency_metrics
from services.analytics.aggregator.file_alerts import get_file_alerts
from services.analytics.aggregator.quality import get_quality_metrics

__all__ = ["get_efficiency_metrics", "get_file_alerts", "get_quality_metrics"]
