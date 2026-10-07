"""Analytics HTTP routes — expose pre-computed and on-demand analytics to the frontend.

Endpoints:
  POST /analytics/dashboard        → get_project_dashboard(params)
  POST /analytics/efficiency       → get_efficiency_metrics(params)
  POST /analytics/quality          → get_quality_metrics(params)
  POST /analytics/console          → combined efficiency + quality in one call
  POST /analytics/module-dashboard → get_module_dashboard(params)
  POST /analytics/file-alerts      → get_file_alerts(params)
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import logging
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from services.analytics import (
    get_efficiency_metrics,
    get_file_alerts,
    get_module_dashboard,
    get_project_dashboard,
    get_quality_metrics,
)
from shared.error_codes import ErrorCode
from shared.response import fail, success

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyticsRequest(BaseModel):
    project_key: str | None = None
    dateRange: dict[str, str] | None = None
    date: str | None = None

    class Config:
        extra = "allow"  # pass through _nocache and future params


class FileAlertsRequest(BaseModel):
    project_key: str | None = None


def _build_params(body: AnalyticsRequest) -> dict[str, Any]:
    params: dict[str, Any] = {}
    if body.project_key:
        params["project_key"] = body.project_key
    if body.dateRange:
        params["dateRange"] = body.dateRange
    if body.date:
        params["date"] = body.date
    # Pass through extra fields (e.g. _nocache)
    if hasattr(body, "model_extra"):
        params.update(body.model_extra or {})
    return params


@router.post("/analytics/dashboard", operation_id="analytics_dashboard")
async def dashboard(request: Request, body: AnalyticsRequest):
    """Return unified project dashboard: basic stats + efficiency + quality."""
    try:
        data = await get_project_dashboard(_build_params(body))
        return success(data=data)
    except Exception as e:
        logger.exception("analytics/dashboard failed")
        return fail(ErrorCode.INTERNAL_ERROR, str(e)[:200])


@router.post("/analytics/efficiency", operation_id="analytics_efficiency")
async def efficiency(request: Request, body: AnalyticsRequest):
    """Return efficiency metrics: cycle time, lead time, throughput, CFD, WIP aging."""
    try:
        data = await get_efficiency_metrics(_build_params(body))
        return success(data=data)
    except Exception:
        logger.exception("analytics/efficiency failed")
        return fail(ErrorCode.INTERNAL_ERROR, "Failed to compute efficiency metrics")


@router.post("/analytics/quality", operation_id="analytics_quality")
async def quality(request: Request, body: AnalyticsRequest):
    """Return quality metrics: bug rate, rework rate, MTTR, SLA compliance, quality score."""
    try:
        data = await get_quality_metrics(_build_params(body))
        return success(data=data)
    except Exception:
        logger.exception("analytics/quality failed")
        return fail(ErrorCode.INTERNAL_ERROR, "Failed to compute quality metrics")


@router.post("/analytics/console", operation_id="analytics_console")
async def console(request: Request, body: AnalyticsRequest):
    """Return combined efficiency + quality metrics in a single request for the analytics console."""
    try:
        params = _build_params(body)
        efficiency_data, quality_data = await asyncio.gather(
            get_efficiency_metrics(params),
            get_quality_metrics(params),
            return_exceptions=True,
        )
        efficiency_data = efficiency_data if not isinstance(efficiency_data, BaseException) else {}
        quality_data = quality_data if not isinstance(quality_data, BaseException) else {}
        return success(data={
            "efficiency": efficiency_data,
            "quality": quality_data,
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        })
    except Exception:
        logger.exception("analytics/console failed")
        return fail(ErrorCode.INTERNAL_ERROR, "Failed to compute console metrics")


@router.post("/analytics/module-dashboard", operation_id="analytics_module_dashboard")
async def module_dashboard(request: Request, body: AnalyticsRequest):
    """Return module dashboard: weighted progress, burndown, velocity, quality signals."""
    try:
        data = await get_module_dashboard(_build_params(body))
        return success(data=data)
    except Exception:
        logger.exception("analytics/module-dashboard failed")
        return fail(ErrorCode.INTERNAL_ERROR, "Failed to compute module dashboard")


@router.post("/analytics/file-alerts", operation_id="analytics_file_alerts")
async def file_alerts(request: Request, body: FileAlertsRequest):
    """Return file health alerts: stale, missing metadata, orphan, unmaintained files."""
    try:
        params: dict[str, Any] = {}
        if body.project_key:
            params["project_key"] = body.project_key
        data = await get_file_alerts(params)
        return success(data=data)
    except Exception:
        logger.exception("analytics/file-alerts failed")
        return fail(ErrorCode.INTERNAL_ERROR, "Failed to compute file alerts")
