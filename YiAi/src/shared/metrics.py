"""Prometheus metrics definitions for YiAi observability.

When prometheus_client is not installed, all metrics become no-op stubs
so the application can still start without the dependency.
"""

import logging
import time

logger = logging.getLogger(__name__)

try:
    from prometheus_client import Counter, Histogram, Gauge, Info, generate_latest, REGISTRY
    _METRICS_ENABLED = True
except ImportError:
    _METRICS_ENABLED = False

    class _NoopMetric:
        """No-op metric that silently accepts all calls."""
        def labels(self, **kwargs): return self
        def inc(self, amount=1): pass
        def dec(self, amount=1): pass
        def set(self, value): pass
        def observe(self, value): pass
        def info(self, val): pass

    def _NoopMetricFactory(*args, **kwargs):
        return _NoopMetric()

    Counter = Histogram = Gauge = _NoopMetricFactory
    Info = _NoopMetricFactory
    generate_latest = lambda registry=None: b""
    REGISTRY = None


# ── RPC request metrics ──

rpc_request_total = Counter(
    "yiai_rpc_requests_total",
    "Total RPC requests",
    ["module_name", "method_name", "status"],
)

rpc_request_duration_seconds = Histogram(
    "yiai_rpc_request_duration_seconds",
    "RPC request latency (seconds)",
    ["module_name", "method_name"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0],
)

rpc_request_in_flight = Gauge(
    "yiai_rpc_requests_in_flight",
    "Currently in-flight RPC requests",
)

# ── Database metrics ──

mongodb_pool_size = Gauge("yiai_mongodb_pool_size", "MongoDB connection pool size")
mongodb_active_connections = Gauge("yiai_mongodb_active_connections", "MongoDB active connections")
mongodb_query_duration_seconds = Histogram(
    "yiai_mongodb_query_duration_seconds",
    "MongoDB query latency (seconds)",
    ["operation", "collection"],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 5.0],
)

# ── RAG metrics ──

rag_query_total = Counter("yiai_rag_queries_total", "Total RAG queries", ["status"])
rag_query_duration_seconds = Histogram(
    "yiai_rag_query_duration_seconds",
    "RAG query latency (seconds)",
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
)
rag_index_document_count = Gauge("yiai_rag_index_document_count", "RAG index document count")

# ── LLM metrics ──

ollama_request_total = Counter(
    "yiai_ollama_requests_total", "Total Ollama requests", ["model", "status"]
)
ollama_request_duration_seconds = Histogram(
    "yiai_ollama_request_duration_seconds",
    "Ollama request latency (seconds)",
    ["model"],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0, 120.0],
)

# ── Cache metrics ──

cache_hit_total = Counter("yiai_cache_hits_total", "Total cache hits")
cache_miss_total = Counter("yiai_cache_misses_total", "Total cache misses")
cache_operation_duration_seconds = Histogram(
    "yiai_cache_operation_duration_seconds",
    "Cache operation latency (seconds)",
    ["backend", "operation"],
    buckets=[0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1],
)

# ── Agent metrics ──

agent_active_count = Gauge("yiai_agent_active_count", "Active agent instances")
agent_step_total = Counter("yiai_agent_steps_total", "Agent steps executed", ["status"])
agent_duration_seconds = Histogram(
    "yiai_agent_duration_seconds",
    "Agent execution duration (seconds)",
    buckets=[5, 10, 30, 60, 120, 300, 600],
)

# ── App info ──

_START_TIME = time.time()
app_info = Info("yiai_app", "YiAi application info")
app_uptime_seconds = Gauge("yiai_app_uptime_seconds", "Application uptime (seconds)")


def set_uptime():
    app_uptime_seconds.set(int(time.time() - _START_TIME))


def get_metrics() -> bytes:
    """Generate Prometheus text format metrics."""
    set_uptime()
    if _METRICS_ENABLED:
        return generate_latest(REGISTRY)
    return b"# prometheus_client not installed\n"