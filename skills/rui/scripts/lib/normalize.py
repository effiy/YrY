"""ID, complexity, and direction normalization extracted from merge-batch-graphs.py for single-responsibility."""

import re
from typing import Any

from .config import (
    VALID_NODE_PREFIXES,
    TYPE_TO_PREFIX,
    COMPLEXITY_MAP,
    VALID_COMPLEXITY,
    _DIRECTION_ALIASES,
    _VALID_DIRECTIONS,
)


def _num(v: Any) -> float:
    """Coerce a value to float for safe comparison (handles string weights)."""
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def normalize_direction(value: Any) -> str:
    """Canonicalize an edge `direction` value to one of the schema enum members."""
    candidate = value.lower() if isinstance(value, str) else ""
    candidate = _DIRECTION_ALIASES.get(candidate, candidate)
    if candidate not in _VALID_DIRECTIONS:
        return "forward"
    return candidate


def classify_id_fix(original: str, corrected: str) -> str:
    """Return a human-readable pattern label for an ID correction."""
    for prefix in VALID_NODE_PREFIXES:
        if original.startswith(f"{prefix}:{prefix}:"):
            return f"{prefix}:{prefix}: → {prefix}: (double prefix)"

    parts = original.split(":")
    if len(parts) >= 3 and parts[0] not in VALID_NODE_PREFIXES and parts[1] in VALID_NODE_PREFIXES:
        return f"<project>:{parts[1]}: → {parts[1]}: (project-name prefix)"

    if original.startswith("func:") and corrected.startswith("function:"):
        return "func: → function: (prefix canonicalization)"

    if not any(original.startswith(f"{p}:") for p in VALID_NODE_PREFIXES):
        prefix = corrected.split(":")[0]
        return f"bare path → {prefix}: (missing prefix)"

    return f"{original} → {corrected}"


def normalize_node_id(node_id: str, node: dict[str, Any]) -> str:
    """Normalize a node ID, returning the corrected version."""
    nid = node_id

    for prefix in VALID_NODE_PREFIXES:
        double = f"{prefix}:{prefix}:"
        if nid.startswith(double):
            nid = nid[len(prefix) + 1:]
            break

    match = re.match(r"^[^:]+:(" + "|".join(re.escape(p) for p in VALID_NODE_PREFIXES) + r"):(.+)$", nid)
    if match:
        first_seg = nid.split(":")[0]
        if first_seg not in VALID_NODE_PREFIXES:
            nid = f"{match.group(1)}:{match.group(2)}"

    if nid.startswith("func:") and not nid.startswith("function:"):
        nid = "function:" + nid[5:]

    has_prefix = any(nid.startswith(f"{p}:") for p in VALID_NODE_PREFIXES)
    if not has_prefix:
        node_type = node.get("type", "file")
        prefix = TYPE_TO_PREFIX.get(node_type, "file")
        if node_type in ("function", "class"):
            file_path = node.get("filePath", "")
            name = node.get("name", nid)
            if file_path:
                nid = f"{prefix}:{file_path}:{name}"
            else:
                nid = f"{prefix}:__nofilepath__:{name}"
        else:
            nid = f"{prefix}:{nid}"

    return nid


def normalize_complexity(value: Any) -> tuple[str, str]:
    """Normalize a complexity value. Returns (normalized, status).

    status is one of:
      "valid"    — already a valid value, no change needed
      "mapped"   — known alias, confidently mapped (goes to Fixed report)
      "unknown"  — unrecognized value, defaulted to moderate (goes to Could-not-fix report)
    """
    if isinstance(value, str):
        lower = value.strip().lower()
        if lower in VALID_COMPLEXITY:
            return lower, "valid"
        if lower in COMPLEXITY_MAP:
            return COMPLEXITY_MAP[lower], "mapped"
        return "moderate", "unknown"
    elif isinstance(value, (int, float)):
        n = int(value)
        if n <= 3:
            return "simple", "mapped"
        elif n <= 6:
            return "moderate", "mapped"
        else:
            return "complex", "mapped"
    return "moderate", "unknown"
