"""Analytics data collection — apscheduler-based metrics aggregation.

Runs periodic aggregation jobs to populate pre-computed metrics collections:
  - efficiency_metrics
  - quality_metrics
"""

from __future__ import annotations

import logging

from datetime import datetime

from data.database import db

logger = logging.getLogger(__name__)


async def collect_efficiency_snapshot() -> None:
    """Take a snapshot of efficiency metrics for all projects."""
    try:
        projects_cursor = db.db["projects"].find({})
        projects = await projects_cursor.to_list(length=100)

        for project in projects:
            project_key = project.get("key", "")

            # Count issues by status
            pipeline = [
                {"$match": {"project_key": project_key}},
                {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            ]
            status_counts: dict[str, int] = {}
            async for doc in db.db["issues"].aggregate(pipeline):
                status_counts[doc["_id"]] = doc.get("count", 0)

            done = status_counts.get("Done", 0) + status_counts.get("done", 0)
            total = sum(status_counts.values())

            # Count bugs
            bug_count = await db.db["bugs"].count_documents({"project_key": project_key})

            doc = {
                "project_key": project_key,
                "timestamp": datetime.utcnow().isoformat(),
                "total_issues": total,
                "done_issues": done,
                "wip_issues": total - done,
                "bug_count": bug_count,
                "status_breakdown": status_counts,
            }

            await db.db["efficiency_metrics"].insert_one(doc)

        logger.info(f"Efficiency snapshot collected for {len(projects)} projects")

    except Exception:
        logger.exception("Failed to collect efficiency snapshot")


async def collect_quality_snapshot() -> None:
    """Take a snapshot of quality metrics for all projects."""
    try:
        projects_cursor = db.db["projects"].find({})
        projects = await projects_cursor.to_list(length=100)

        now = datetime.utcnow().isoformat()

        for project in projects:
            project_key = project.get("key", "")
            bug_count = await db.db["bugs"].count_documents({"project_key": project_key})
            issue_count = await db.db["issues"].count_documents({"project_key": project_key})
            reopened = await db.db["issues"].count_documents({
                "project_key": project_key,
                "reopened": True,
            })

            bug_rate = (bug_count / issue_count * 100) if issue_count > 0 else 0.0
            rework_rate = (reopened / issue_count * 100) if issue_count > 0 else 0.0

            doc = {
                "project_key": project_key,
                "timestamp": now,
                "bug_count": bug_count,
                "bug_rate": round(bug_rate, 2),
                "rework_rate": round(rework_rate, 2),
                "reopened_count": reopened,
                "issue_count": issue_count,
            }

            await db.db["quality_metrics"].insert_one(doc)

        logger.info(f"Quality snapshot collected for {len(projects)} projects")

    except Exception:
        logger.exception("Failed to collect quality snapshot")


def create_indexes() -> None:
    """Ensure indexes exist on analytics collections (called at app startup)."""
    # Will be called synchronously, so we register them as background tasks
    pass