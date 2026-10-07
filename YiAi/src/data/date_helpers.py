"""Date parsing and RSS timestamp normalisation helpers.

Extracted from repository.py — handles the historic schema drift in the RSS
corpus where ``published_parsed`` / ``createdTime`` / ``published`` fields
may be int, float, str, or ISO-format strings.
"""

from datetime import datetime, timezone
from typing import Any


def parse_ms_ts(value: Any) -> int | None:
    """Best-effort conversion to a millisecond-precision epoch timestamp.

    The RSS corpus has historically used a mix of second-precision numeric
    timestamps, millisecond-precision numeric timestamps, numeric strings,
    ISO date strings, and ``createdTime``/``published`` free-form fields.
    Normalising at the repository layer lets callers pass plain ``int``
    ranges (e.g. from YiVad's date-nav component) without worrying about
    the per-document schema drift.
    """
    if value is None:
        return None
    if isinstance(value, int | float):
        i = int(value)
        # Treat <= 10 digits as epoch seconds, >= 13 as epoch ms. 11/12-digit
        # values (millennia / 10k years) are extremely unlikely and treated
        # as milliseconds to match the dominant pipeline output.
        return i * 1000 if len(str(abs(i))) <= 10 else i
    ts_str = str(value).strip()
    if not ts_str:
        return None
    if ts_str.isdigit():
        i = int(ts_str)
        return i * 1000 if len(ts_str) <= 10 else i
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return int(datetime.strptime(ts_str, fmt).replace(tzinfo=timezone.utc).timestamp() * 1000)
        except ValueError:
            continue
    try:
        return int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
    except (ValueError, OverflowError, OSError):
        return None


def apply_rss_date_filters(query_params: dict[str, Any]) -> dict[str, Any] | None:
    """Extract RSS-specific ``publishedStart`` / ``publishedEnd`` params and
    return ``{"start_ms": Optional[int], "end_ms": Optional[int]}`` so the
    caller can apply Python-level filtering after the Mongo read.

    The generic Mongo filter path cannot be used here because the RSS corpus
    has a mix of ``int`` / ``str`` / ISO-date values in
    ``published_parsed`` / ``createdTime`` / ``published``, and MongoDB
    compares strings and numbers as distinct types (e.g. the document
    ``{"published_parsed": "1724900000000"}`` would never match the query
    ``{"published_parsed": {"$gte": 1724800000000}}``). Doing the comparison
    in Python with :func:`parse_ms_ts` normalises every document first.
    """
    if "publishedStart" not in query_params and "publishedEnd" not in query_params:
        return None
    start_ms = parse_ms_ts(query_params.get("publishedStart"))
    end_ms = parse_ms_ts(query_params.get("publishedEnd"))
    return {"start_ms": start_ms, "end_ms": end_ms}


def rss_doc_published_ms(doc: dict[str, Any]) -> int | None:
    """Normalise a single RSS document to its epoch-ms published timestamp,
    trying the same fields and fallbacks as the dashboard stats endpoint.
    """
    for key in ("published_parsed", "createdTime", "published"):
        ts = parse_ms_ts(doc.get(key))
        if ts is not None:
            return ts
    return None
