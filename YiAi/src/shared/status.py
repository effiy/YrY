"""Canonical status constants for issues and bugs.

Central source of truth for status values. All services and queries
should use these constants instead of raw strings to ensure consistency
across the codebase.

Usage:
    from shared.status import Status, is_closed, normalize_status

    # In MongoDB queries, use normalize_status() for legacy mixed-case data:
    filter = {"status": {"$in": normalize_status([Status.DONE])}}
    # → {"status": {"$in": ["done", "Done"]}}

    # In new writes, always use the canonical lowercase form:
    data = {"status": Status.DONE}
"""

from __future__ import annotations

# ── Issue Statuses ──────────────────────────────────────────────────


class Status:
    """Canonical (lowercase) status values for issues."""

    DONE = "done"
    IN_PROGRESS = "in_progress"
    TODO = "todo"
    BACKLOG = "backlog"
    IN_REVIEW = "in_review"
    CANCELLED = "cancelled"
    BLOCKED = "blocked"

    # Bug-specific
    OPEN = "open"
    REOPENED = "reopened"
    RESOLVED = "resolved"
    CLOSED = "closed"

    # Project
    ACTIVE = "active"


# ── Status Groups ───────────────────────────────────────────────────

CLOSED_STATUSES: frozenset[str] = frozenset({
    Status.DONE, Status.CLOSED, Status.RESOLVED, Status.CANCELLED,
})

ACTIVE_STATUSES: frozenset[str] = frozenset({
    Status.TODO, Status.IN_PROGRESS, Status.IN_REVIEW,
})

NOT_DONE_STATUSES: frozenset[str] = frozenset({
    Status.DONE, Status.CANCELLED, Status.BACKLOG,
})

OPEN_BUG_STATUSES: frozenset[str] = frozenset({
    Status.OPEN, Status.REOPENED,
})

# ── Legacy mixed-case variants (for read-side compatibility) ────────

_LEGACY_VARIANTS: dict[str, str] = {
    # Title-case → canonical
    "Done": Status.DONE,
    "In Progress": Status.IN_PROGRESS,
    "To Do": Status.TODO,
    "Backlog": Status.BACKLOG,
    "Review": Status.IN_REVIEW,
    "Cancelled": Status.CANCELLED,
    "Blocked": Status.BLOCKED,
    # Capitalized variants
    "Closed": Status.CLOSED,
    "Resolved": Status.RESOLVED,
    "Open": Status.OPEN,
    "Reopened": Status.REOPENED,
    "Completed": Status.DONE,
    # Aliases
    "active": Status.ACTIVE,
    "completed": Status.DONE,
    "to_do": Status.TODO,
}


def normalize_status(status: str) -> str:
    """Normalize a status value to its canonical lowercase form."""
    return _LEGACY_VARIANTS.get(status, status.lower())


def normalize_status_list(statuses: list[str] | frozenset[str]) -> list[str]:
    """Return a list suitable for MongoDB $in queries covering both
    canonical and legacy variants of each status."""
    seen: set[str] = set()
    for s in statuses:
        canonical = normalize_status(s)
        if canonical not in seen:
            seen.add(canonical)
        for legacy, canon in _LEGACY_VARIANTS.items():
            if canon == canonical and legacy not in seen:
                seen.add(legacy)
    return list(seen)


def is_closed(status: str) -> bool:
    """Check if the given status represents a closed/done state."""
    return normalize_status(status) in CLOSED_STATUSES


def is_active(status: str) -> bool:
    """Check if the given status represents an active (not closed, not backlog) state."""
    return normalize_status(status) in ACTIVE_STATUSES
