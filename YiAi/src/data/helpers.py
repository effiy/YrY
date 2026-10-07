"""Repository helpers: constants, validation, markdown path resolution."""

from datetime import datetime, timezone
from typing import Any

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = __import__("logging").getLogger(__name__)

_QUERY_MAX_TIME_MS: int = getattr(settings, "mongodb_query_timeout_ms", 30000)

_BUG_TYPE_DIR: dict[str, str] = {
    "functional": "logic",
    "performance": "performance",
    "ui": "style",
    "security": "security",
    "compatibility": "compatibility",
    "regression": "regression",
    "data": "data",
    "other": "other",
}

_ISSUE_TYPE_DIR: dict[str, str] = {
    "bug": "bug",
    "task": "task",
    "feature": "feature",
    "improvement": "improvement",
    "requirement": "requirement",
    "other": "other",
}


def _validate_collection_name(collection_name: str | None) -> str:
    if not collection_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Collection name (collection_name/cname) is required")
    return collection_name


def _resolve_bug_markdown_path(doc: dict[str, Any], doc_id: str) -> str | None:
    """Resolve the YiKnowledge markdown path for a bug document."""
    content_path = doc.get("contentPath") or doc.get("content_path") or ""
    if content_path:
        return content_path
    project_key = (doc.get("project_key") or doc.get("project") or "unknown").lower()
    bug_type = doc.get("type") or "other"
    type_dir = _BUG_TYPE_DIR.get(bug_type, "other")
    created_at_ms = doc.get("createdAt") or doc.get("created_time") or doc.get("createdTime")
    if created_at_ms:
        try:
            date_str = datetime.fromtimestamp(int(created_at_ms) / 1000).strftime("%Y-%m-%d")
        except (ValueError, OSError):
            date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    else:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"projects/{project_key}/bugs/{date_str}/{type_dir}/{doc_id}.md"


def _resolve_issue_markdown_path(doc: dict[str, Any], doc_id: str) -> str | None:
    """Resolve the YiKnowledge markdown path for an issue document."""
    content_path = doc.get("contentPath") or doc.get("content_path") or doc.get("file_path") or ""
    if content_path:
        return content_path
    project_key = (doc.get("project_key") or doc.get("project") or "unknown").lower()
    issue_type = doc.get("issue_type") or "other"
    type_dir = _ISSUE_TYPE_DIR.get(issue_type, "other")
    date_source = (
        doc.get("created")
        or doc.get("start_date")
        or doc.get("created_at")
        or doc.get("createdAt")
    )
    date_str = None
    if date_source:
        ds_str = str(date_source)[:10]
        if len(ds_str) == 10 and ds_str[4] == "-" and ds_str[7] == "-":
            date_str = ds_str
        elif isinstance(date_source, int | float) or (isinstance(date_source, str) and date_source.isdigit()):
            try:
                date_str = datetime.fromtimestamp(int(date_source) / 1000).strftime("%Y-%m-%d")
            except (ValueError, OSError):
                pass
    if not date_str:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"projects/{project_key}/issues/{date_str}/{type_dir}/{doc_id}.md"
