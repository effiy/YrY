"""Filter construction helpers for MongoDB queries.

Extracted from repository.py to keep the module focused on data access.
"""

from functools import lru_cache
import logging
import re
from typing import Any

from shared.utils import is_number, is_valid_date

logger = logging.getLogger(__name__)

# Security: operators that must never be passed through
_DENIED_OPERATORS = frozenset({"$where", "$function", "$accumulator", "$query"})

# Cache compiled regex patterns — string search is the hottest path in query_documents
@lru_cache(maxsize=512)
def _compile_regex(pattern: str) -> re.Pattern:
    return re.compile(pattern, re.IGNORECASE)


def _handle_iso_date_filter(key: str, value: Any, filter_dict: dict[str, Any]) -> bool:
    """Handle isoDate special filter logic."""
    if key != 'isoDate' or not isinstance(value, str):
        return False

    if ',' in value:
        date_parts = [term.strip() for term in value.split(',') if term.strip()]
        if len(date_parts) == 2:
            start_date, end_date = date_parts
            if is_valid_date(start_date) and is_valid_date(end_date):
                published_filter = _build_published_date_filter(start_date, end_date)
                if not published_filter:
                    return False
                filter_dict.update(published_filter)
                return True
    elif is_valid_date(value):
        published_filter = _build_published_date_filter(value, value)
        if not published_filter:
            return False
        filter_dict.update(published_filter)
        return True
    return False


def _build_published_date_filter(start_date: str, end_date: str) -> dict[str, Any]:
    """Build a regex-based filter for RSS published dates."""
    from datetime import datetime, timedelta

    try:
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        date_patterns = []
        iso_date_values = []
        current_dt = start_dt

        while current_dt <= end_dt:
            year, month, day = current_dt.year, current_dt.month, current_dt.day
            month_name = month_names[month - 1]
            date_patterns.extend([
                f'{year}-{month:02d}-{day:02d}',
                f'{day:02d} {month_name} {year}',
                f'{day} {month_name} {year}',
            ])
            iso_date_values.append(f'{year}-{month:02d}-{day:02d}')
            current_dt += timedelta(days=1)

        date_patterns = list(set(date_patterns))
        iso_date_values = list(set(iso_date_values))

        if not date_patterns:
            return {}

        or_conditions = []
        for pattern in date_patterns:
            or_conditions.append({'pubDate': {'$regex': pattern, '$options': 'i'}})
            or_conditions.append({'published': {'$regex': pattern, '$options': 'i'}})

        if iso_date_values:
            or_conditions.append({'isoDate': {'$in': iso_date_values}})
            for iso_date in iso_date_values:
                or_conditions.append({'isoDate': {'$regex': iso_date, '$options': 'i'}})

        return {'$or': or_conditions}
    except ValueError:
        return {}


def _handle_range_or_list_filter(key: str, value: Any, filter_dict: dict[str, Any]) -> bool:
    """Handle range query or list query."""
    if not (hasattr(value, '__iter__') and not isinstance(value, str | bytes | dict)):
        return False

    value_list = list(value) if not isinstance(value, list) else value
    if not value_list:
        return True

    if len(value_list) == 2:
        start, end = value_list
        if is_valid_date(start) and is_valid_date(end):
            filter_dict[key] = {'$gte': start, '$lt': end}
        elif is_number(start) and is_number(end):
            filter_dict[key] = {'$gte': float(start), '$lt': float(end)}
        else:
            filter_dict[key] = {'$in': value_list}
    else:
        filter_dict[key] = {'$in': value_list}
    return True


def _handle_string_search_filter(key: str, value: Any, filter_dict: dict[str, Any]) -> bool:
    """Handle string fuzzy search."""
    if not isinstance(value, str):
        return False

    if ',' in value:
        search_terms = [term.strip() for term in value.split(',') if term.strip()]
        if search_terms:
            if '$or' in filter_dict:
                filter_dict['$or'].extend([
                    {key: _compile_regex(f'.*{re.escape(term)}.*')}
                    for term in search_terms
                ])
            else:
                filter_dict['$or'] = [
                    {key: _compile_regex(f'.*{re.escape(term)}.*')}
                    for term in search_terms
                ]
    else:
        filter_dict[key] = _compile_regex(f'.*{re.escape(value)}.*')
    return True


def build_filter(query_params: dict[str, Any]) -> dict[str, Any]:
    """Build a MongoDB filter dict from query parameters."""
    filter_dict: dict[str, Any] = {}

    for key, value in query_params.items():
        if value is None or value == "":
            continue

        # Mongo logical operators and field-level operator dicts pass through
        if key.startswith('$'):
            if key in _DENIED_OPERATORS:
                logger.warning(f"Blocked dangerous operator: {key}")
                continue
            filter_dict[key] = value
            continue
        if isinstance(value, dict):
            filter_dict[key] = value
            continue

        # key field uses exact match
        if key == 'key' and isinstance(value, str):
            filter_dict[key] = value
            continue

        if _handle_iso_date_filter(key, value, filter_dict):
            continue

        if _handle_range_or_list_filter(key, value, filter_dict):
            continue

        if _handle_string_search_filter(key, value, filter_dict):
            continue

        if isinstance(value, int | float | bool):
            filter_dict[key] = value

    return filter_dict
