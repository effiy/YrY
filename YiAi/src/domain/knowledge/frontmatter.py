"""Frontmatter parsing utilities for YiKnowledge markdown files.

Parses YAML frontmatter blocks from markdown files, with a robust
line-by-line fallback for malformed YAML.
"""
from __future__ import annotations

from datetime import datetime
import logging
import re
from typing import Any

import yaml

logger = logging.getLogger(__name__)

FRONTMATTER_RE = re.compile(
    r"^---\s*\n(?P<yaml>.*?)\n---\s*(?P<rest>.*)$",
    re.DOTALL,
)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split a markdown file into (frontmatter_dict, body_text).

    Some historical markdown frontmatters contain unescaped double quotes
    inside double-quoted strings, which cause ``yaml.safe_load`` to raise
    ``YAMLError``. When that happens we fall back to a line-oriented
    ``key: value`` parser that still recovers ~95 % of fields (strings,
    numbers, booleans, and flat YAML lists).
    """
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    raw_yaml = match.group("yaml")
    body = match.group("rest").lstrip("\n")
    meta: dict = {}
    if raw_yaml.strip():
        try:
            loaded = yaml.safe_load(raw_yaml)
            if isinstance(loaded, dict):
                meta = loaded
        except yaml.YAMLError:
            # Common with unquoted colons in title values, e.g. "title: a: b".
            # Fall back to line-by-line parser without logging a traceback.
            meta = parse_frontmatter_lines(raw_yaml)
    if not isinstance(meta, dict):
        meta = {}
    return meta, body


def parse_frontmatter_lines(raw_yaml: str) -> dict:
    """Robust line-by-line fallback for when the strict YAML parser fails.

    Handles the patterns that appear in existing bug markdowns:
      ``key: "value with possible unescaped "quotes" inside"``
      ``key: value``
      ``key: 123``
      ``key: true``
      ``tags: ['a', 'b', "c's"]``
    Values that cannot be determined are kept as strings.
    """
    import ast as _ast
    import re as _re

    out: dict = {}
    list_re = _re.compile(r"^\s*\[.*\]\s*$")
    quoted_re = _re.compile(r'^\s*(["\'])(.*)\1\s*$', _re.DOTALL)
    int_re = _re.compile(r"^-?\d+$")
    float_re = _re.compile(r"^-?\d+\.\d+$")
    for raw_line in raw_yaml.splitlines():
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key_part, _, val_part = line.partition(":")
        key = key_part.strip()
        if not key:
            continue
        value = val_part.strip()
        if value == "":
            out[key] = ""
            continue
        if list_re.match(value):
            try:
                parsed = _ast.literal_eval(value)
                if isinstance(parsed, list):
                    out[key] = [str(x) for x in parsed]
                    continue
            except (ValueError, SyntaxError):
                pass
        if value in {"true", "True"}:
            out[key] = True
            continue
        if value in {"false", "False"}:
            out[key] = False
            continue
        if value in {"null", "Null", "~"}:
            continue
        qm = quoted_re.match(value)
        if qm:
            out[key] = qm.group(2)
            continue
        # Only attempt int/float conversion when the value looks numeric —
        # avoids noisy ValueError tracebacks for strings like dates or paths.
        if int_re.match(value):
            out[key] = int(value)
            continue
        if float_re.match(value):
            out[key] = float(value)
            continue
        out[key] = value
    return out


def normalize_meta(meta: dict) -> dict:
    """Coerce frontmatter values to JSON-friendly primitives."""
    out: dict[str, Any] = {}
    for k, v in (meta or {}).items():
        if v is None:
            continue
        if isinstance(v, str | int | float | bool):
            out[k] = v
        elif isinstance(v, list):
            out[k] = [str(x) if not isinstance(x, str | int | float | bool) else x for x in v]
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = str(v)
    return out
