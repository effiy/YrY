---
key: bug_2026_07_31_yiai_is_number_accepts_bool_nan_inf
title: is_number accepted bool/nan/inf, misclassifying list filters as numeric ranges
project: YiAi
module: shared/utils.py
severity: medium
priority: medium
status: fixed
type: logic
iteration: loop-2026-07-31
assignee: claude
---

---
key: bug_2026_07_31_yiai_is_number_accepts_bool_nan_inf
title: is_number accepted bool/nan/inf, misclassifying list filters as numeric ranges
project: YiAi
module: shared/utils.py
severity: medium
priority: medium
status: fixed
type: logic
iteration: loop-2026-07-31
assignee: claude
---

## Description

`YiAi/src/shared/utils.py:is_number` used `float(value)` directly to validate numeric values, with only `ValueError`/`TypeError` caught. Because Python's `bool` is a subclass of `int`, `float(True)` returns `1.0` and `float(False)` returns `0.0` — so `is_number(True)` and `is_number(False)` both returned `True`. The same was true for `float("nan")`, `float("inf")`, `float("Infinity")`, which all parse successfully but are not valid numbers for business logic.

## Steps to Reproduce

1. Call `data_service.query_documents` with a 2-element list filter whose elements are not dates and not plain numbers, e.g. `tags: [True, False]` or `priority: ["NaN", "Infinity"]`.
2. `_build_filter` in `data/repository.py` dispatches the 2-element list to `_handle_range_or_list_filter`.
3. `_handle_range_or_list_filter` calls `is_valid_date(start)` (False for both), then `is_number(start) and is_number(end)`.
4. With `[True, False]`, both pass `is_number`, so the filter becomes `{'$gte': 1.0, '$lt': 0.0}` — a backwards numeric range that matches nothing.
5. With `["NaN", "Infinity"]`, both pass `is_number`, so the filter becomes `{'$gte': NaN, '$lt': Infinity}` — semantically broken.

## Expected Result

For non-numeric values like booleans, NaN, or Infinity strings, `is_number` should return `False`, and `_handle_range_or_list_filter` should fall through to the `{'$in': value_list}` branch at line 107.

## Actual Result

`is_number` returned `True` for booleans and NaN/Infinity strings. The repository built a numeric range filter that returned empty or wrong results, silently breaking list-filter queries whose values happened to look numeric-ish.

## Cause

`float(value)` in Python accepts booleans (subclass of int) and the special strings `"nan"` / `"inf"` / `"infinity"` (case-insensitive). `is_number` did not exclude these, so it reported them as valid numbers.

## Solution

Reject `bool` and `nan`/`inf` in `is_number`:

```python
def is_number(value: Any) -> bool:
    # bool 是 int 子类，但语义上不是数字；nan/inf 会破坏 Mongo 数值范围查询
    if value is None or isinstance(value, bool):
        return False
    try:
        result = float(value)
    except (ValueError, TypeError):
        return False
    if math.isnan(result) or math.isinf(result):
        return False
    return True
```

This keeps the numeric range branch (`{'$gte', '$lt'}`) reserved for real numbers, so list filters with booleans or NaN/Infinity strings correctly fall through to `{'$in': value_list}`.
