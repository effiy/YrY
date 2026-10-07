"""Knowledge file watcher — disk → MongoDB metadata sync.

Walks ``settings.knowledge_base_dir`` periodically and reconciles the
``knowledge_files`` collection against disk: upserts every on-disk file by
relative ``path``, deletes DB docs whose path no longer exists.

Why polling instead of FSEvents/inotify: macOS FSEvents is unreliable for
this dev box (both ``watchfiles`` and ``watchdog`` silently miss events),
so we use periodic polling via ``apscheduler`` — same library the RSS
scheduler uses, works everywhere, and the walk is cheap (≈ tens of ms
for a few hundred files).
"""
from __future__ import annotations

from datetime import datetime, timezone
import logging
import os

logger = logging.getLogger(__name__)


def _now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def _rel_from_abs(abs_path: str, base: str) -> str:
    return os.path.relpath(abs_path, base).replace(os.sep, "/")


def _should_skip(filename: str) -> bool:
    """Skip hidden files and other artifacts that don't belong in the DB."""
    return filename.startswith(".")


def _build_md_snapshot(base: str) -> dict[str, tuple[int, int]]:
    """Walk ``base`` and return ``{rel_path: (size_bytes, mtime_ms)}`` for .md only.

    Used by the watcher to detect changes that warrant a RAG rebuild — non-md
    files don't enter the llama_index store, so their changes are ignored.
    """
    snap: dict[str, tuple[int, int]] = {}
    for dirpath, _dirs, filenames in os.walk(base):
        for fn in filenames:
            if _should_skip(fn):
                continue
            if not fn.lower().endswith(".md"):
                continue
            abs_path = os.path.join(dirpath, fn)
            try:
                st = os.stat(abs_path)
            except OSError:
                continue
            rel = _rel_from_abs(abs_path, base)
            snap[rel] = (st.st_size, int(st.st_mtime * 1000))
    return snap


def _snapshot_diff(prev: dict[str, tuple[int, int]], curr: dict[str, tuple[int, int]]) -> dict[str, list[str]]:
    """Compute added/removed/changed .md paths between two snapshots."""
    prev_keys = set(prev.keys())
    curr_keys = set(curr.keys())
    added = sorted(curr_keys - prev_keys)
    removed = sorted(prev_keys - curr_keys)
    changed = sorted(k for k in (prev_keys & curr_keys) if prev[k] != curr[k])
    return {"added": added, "removed": removed, "changed": changed}


_BULK_CHUNK = 1000  # cap ops per bulk_write round-trip


def _build_all_snapshot(base: str) -> tuple[dict[str, str], dict[str, tuple[int, int]]]:
    """Walk ``base`` and return (rel→abs, rel→(size, mtime_ms)) for all files."""
    abs_paths: dict[str, str] = {}
    snapshot: dict[str, tuple[int, int]] = {}
    for dirpath, _dirs, filenames in os.walk(base):
        for fn in filenames:
            if _should_skip(fn):
                continue
            abs_path = os.path.join(dirpath, fn)
            rel = _rel_from_abs(abs_path, base)
            try:
                st = os.stat(abs_path)
            except OSError:
                continue
            abs_paths[rel] = abs_path
            snapshot[rel] = (st.st_size, int(st.st_mtime * 1000))
    return abs_paths, snapshot


