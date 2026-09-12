import json
import logging
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from functools import wraps
from typing import Callable, Dict, Any, Optional

from data.database import db
from domain.audit.logger import AuditLogger
from domain.audit.models import AuditLog
from shared.config import settings

logger = logging.getLogger(__name__)

_audit_actor: ContextVar[str] = ContextVar("audit_actor", default="anonymous")
_audit_ip: ContextVar[str] = ContextVar("audit_ip", default="")
_audit_user_agent: ContextVar[str] = ContextVar("audit_user_agent", default="")


def set_audit_context(actor: str = "", ip: str = "", user_agent: str = "") -> None:
    _audit_actor.set(actor or "anonymous")
    _audit_ip.set(ip)
    _audit_user_agent.set(user_agent)


def _truncate_large_fields(data: Optional[Dict[str, Any]], max_chars: int) -> Optional[Dict[str, Any]]:
    if data is None:
        return None
    result: Dict[str, Any] = {}
    for k, v in data.items():
        if isinstance(v, str) and len(v) > max_chars:
            result[k] = v[:max_chars] + "[truncated]"
        else:
            result[k] = v
    return result


def _compute_changes(before: Dict[str, Any], after: Dict[str, Any]) -> Dict[str, Any]:
    changes: Dict[str, Any] = {}
    all_keys = set(before.keys()) | set(after.keys())
    for key in all_keys:
        old = before.get(key)
        new = after.get(key)
        if old != new:
            changes[key] = {"old": old, "new": new}
    return changes


def _resolve_params(args, kwargs) -> Dict[str, Any]:
    """Extract params dict from decorated function arguments."""
    params = kwargs.get("parameters")
    if params is None and args:
        params = args[0]
    if isinstance(params, str):
        try:
            params = json.loads(params)
        except json.JSONDecodeError:
            logger.warning("Failed to parse audit params as JSON, using raw string")
            return {}
    if not isinstance(params, dict):
        return {}
    return params


def audit_write(operation: str):
    """Decorator: intercept write operations and record an audit log entry."""

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not settings.audit_enabled:
                return await func(*args, **kwargs)

            params = _resolve_params(args, kwargs)
            collection_name = params.get("collection_name") or params.get("cname", "")
            doc_key = params.get("key") or params.get("id", "")
            max_chars = settings.audit_large_field_max_chars

            await db.initialize()

            # Fetch before-data (for UPDATE / DELETE)
            before_data: Optional[Dict[str, Any]] = None
            if operation in ("UPDATE", "DELETE") and collection_name and doc_key:
                try:
                    existing = await db.db[collection_name].find_one({"key": doc_key})
                    if existing:
                        existing.pop("_id", None)
                        before_data = _truncate_large_fields(existing, max_chars)
                except Exception as e:
                    logger.warning("Failed to fetch before-data for audit: %s", e)

            # Execute the actual write
            result = await func(*args, **kwargs)

            # Fetch after-data (for CREATE / UPDATE)
            after_data: Optional[Dict[str, Any]] = None
            resolved_key = doc_key or str(result.get("key", ""))
            if operation in ("CREATE", "UPDATE") and collection_name and resolved_key:
                try:
                    after = await db.db[collection_name].find_one({"key": resolved_key})
                    if after:
                        after.pop("_id", None)
                        after_data = _truncate_large_fields(after, max_chars)
                except Exception as e:
                    logger.warning("Failed to fetch after-data for audit: %s", e)

            # Compute field-level diff for UPDATE
            changes: Optional[Dict[str, Any]] = None
            if operation == "UPDATE" and before_data and after_data:
                changes = _compute_changes(before_data, after_data)

            entry = AuditLog(
                log_id=str(uuid.uuid4()),
                timestamp=datetime.now(timezone.utc),
                actor=_audit_actor.get(),
                operation=operation,
                collection=collection_name,
                document_key=resolved_key,
                before=before_data,
                after=after_data,
                changes=changes,
                ip_address=_audit_ip.get(),
                user_agent=_audit_user_agent.get(),
            )
            AuditLogger.write_async(entry.to_dict())

            return result

        return wrapper

    return decorator
