"""Dashboard AI chat stats — usage metrics and session history."""
import logging
from collections import Counter, defaultdict
from datetime import datetime, timezone as tz

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


class AiModelUsage(BaseModel):
    model: str
    count: int


class AiDailyStats(BaseModel):
    date: str
    sessions: int
    messages: int


class AiRecentSession(BaseModel):
    title: str
    key: str = ""
    message_count: int = 0
    updated: str = ""


class AiStatsResponse(BaseModel):
    total_sessions: int
    total_messages: int
    avg_messages_per_session: float
    active_sessions_today: int
    messages_today: int
    model_usage: list[AiModelUsage]
    daily: list[AiDailyStats]
    recent: list[AiRecentSession]


def _safe_ts(val) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0


@router.get("/ai-stats", operation_id="dashboard_ai_stats")
async def ai_stats():
    """Return AI chat usage statistics."""
    try:
        from data.database import db

        await db.initialize()
        collection = db.db[settings.collection_sessions]
        cursor = collection.find({}, {"_id": 0})
        sessions = await cursor.to_list(length=None)

        now = datetime.now(tz.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        total_messages = 0
        messages_today = 0
        active_sessions_today = 0
        models = Counter()
        daily_sessions: dict[str, int] = defaultdict(int)
        daily_messages: dict[str, int] = defaultdict(int)

        for s in sessions:
            msgs = s.get("messages", []) or []
            msg_count = len(msgs)
            total_messages += msg_count

            for m in msgs:
                model = m.get("model", "")
                if model:
                    models[model] += 1

            updated = _safe_ts(s.get("updatedAt", s.get("createdAt", 0)))
            if updated:
                dt = (
                    datetime.fromtimestamp(updated / 1000, tz=tz.utc)
                    if updated > 1e12
                    else datetime.fromtimestamp(updated, tz=tz.utc)
                )
                day_key = dt.strftime("%Y-%m-%d")
                daily_sessions[day_key] += 1
                daily_messages[day_key] += msg_count
                if dt >= today_start:
                    active_sessions_today += 1
                    messages_today += msg_count

        sorted_days = sorted(daily_sessions.keys())[-30:]
        daily = [
            AiDailyStats(date=d, sessions=daily_sessions[d], messages=daily_messages.get(d, 0))
            for d in sorted_days
        ]

        model_usage = [AiModelUsage(model=k, count=v) for k, v in models.most_common(10)]

        avg = round(total_messages / len(sessions), 1) if sessions else 0.0

        def _sort_key(s: dict) -> float:
            return _safe_ts(s.get("updatedAt", s.get("createdAt", 0)))

        sorted_sessions = sorted(sessions, key=_sort_key, reverse=True)
        recent = [
            AiRecentSession(
                title=s.get("title", "Untitled"),
                key=s.get("key", ""),
                message_count=len(s.get("messages", []) or []),
                updated=str(s.get("updatedAt", s.get("createdAt", ""))),
            )
            for s in sorted_sessions[:10]
        ]

        return success(data=AiStatsResponse(
            total_sessions=len(sessions),
            total_messages=total_messages,
            avg_messages_per_session=avg,
            active_sessions_today=active_sessions_today,
            messages_today=messages_today,
            model_usage=model_usage,
            daily=daily,
            recent=recent,
        ).model_dump())
    except Exception as e:
        logger.warning(f"AI stats failed: {e}")
        return success(data=AiStatsResponse(
            total_sessions=0, total_messages=0, avg_messages_per_session=0.0,
            active_sessions_today=0, messages_today=0,
            model_usage=[], daily=[], recent=[],
        ).model_dump())