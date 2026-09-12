"""Prometheus metrics endpoint."""

from fastapi import APIRouter, Response
from shared.metrics import get_metrics

router = APIRouter(tags=["Metrics"])


@router.get("/metrics")
async def metrics():
    """Expose Prometheus metrics."""
    return Response(
        content=get_metrics(),
        media_type="text/plain; version=0.0.4",
    )