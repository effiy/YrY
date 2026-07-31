---
key: bug_2026_07_31_yiai_read_file_dead_branch
title: read_file had an unreachable isfile check, masking the directory-path semantic
  gap
project: YiAi
module: domain/files/local.py
severity: low
priority: low
status: fixed
type: dead-code
iteration: loop-2026-07-31
assignee: claude
---

---
key: bug_2026_07_31_yiai_read_file_dead_branch
title: read_file had an unreachable isfile check, masking the directory-path semantic gap
project: YiAi
module: domain/files/local.py
severity: low
priority: low
status: fixed
type: dead-code
iteration: loop-2026-07-31
assignee: claude
---

## Description

`YiAi/src/domain/files/local.py:read_file` had two consecutive `not os.path.isfile(found_path)` checks. The first (line 51) was combined with the `not os.path.exists` check and returned early to the MongoDB fallback. The second (line 54) was supposed to raise `BusinessException(DATA_NOT_FOUND, "Path is not a file: ...")`, but because line 51 already returned on the same condition, line 54 was unreachable dead code.

The dead branch masked a semantic gap: when `target_file` points at a directory on disk, the function silently falls back to a MongoDB lookup instead of raising a clear "not a file" error. After removing the dead branch, the behavior is unchanged (the first check still routes directory paths to MongoDB), but the misleading unreachable `raise` no longer hides the actual contract.

## Steps to Reproduce

1. Pre-fix code path: call `read_file` with `target_file = "static/some_existing_directory/"`.
2. Line 51: `os.path.exists(found_path)` is True (the directory exists), `os.path.isfile(found_path)` is False (it's a directory), so the `or` is True → returns `_read_from_database`.
3. Line 54's `if not os.path.isfile(found_path)` is never evaluated because the function already returned at line 52.

## Expected Result

Dead code should not exist. Either the second check should be removed, or the first check should be narrowed to `not os.path.exists` only so that directory paths fall through and raise the explicit "Path is not a file" error.

## Actual Result

The second `if not os.path.isfile(found_path)` branch was unreachable. It gave the false impression that directory paths would raise `BusinessException(DATA_NOT_FOUND)`, but in reality they silently fell back to MongoDB (which would also miss, returning a "not found" error but with a different code and message).

## Cause

Likely a leftover from an earlier draft: the author probably wrote the explicit `raise` first, then added the disk-first/Mongo-fallback behavior on top without removing the now-redundant guard.

## Solution

Removed the unreachable `if not os.path.isfile(found_path): raise BusinessException(...)` block. The disk-first/Mongo-fallback behavior at line 51 is preserved unchanged; the only change is that no dead code remains to mislead future maintainers about the directory-path contract.

```diff
     if not os.path.exists(found_path) or not os.path.isfile(found_path):
         return await _read_from_database(target_file, db_key)

-    if not os.path.isfile(found_path):
-        raise BusinessException(
-            ErrorCode.DATA_NOT_FOUND,
-            message=f"Path is not a file: {target_file}",
-        )
-
     filename = os.path.basename(target_file)
```

Future direction (out of scope for this fix): if callers want directory paths to raise an explicit error rather than silently fall through to MongoDB, the first check should be split — `not os.path.exists` returns to MongoDB, `not os.path.isfile` (i.e. exists but is a dir) raises. That's a behavior change requiring caller review.
