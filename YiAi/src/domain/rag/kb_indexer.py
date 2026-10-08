"""Knowledge base index: build, load, refresh, status checks.

FILE READER OPTIMISATION
========================
llama-index ``SimpleDirectoryReader`` (aka ``llama-index-readers-file``) is
*extremely* wasteful when called repeatedly:

* it walks the entire ``YiKnowledge`` tree every time, even when only a
  handful of files changed;
* it re-opens and re-parses every ``.md`` file (frontmatter, Unicode
  decoding, llama-index internal ``Document`` construction) on every
  invocation regardless of whether the bytes on disk actually moved;
* it has no in-process caching layer, so the 300+ small markdown files in
  ``projects/*/tests/2026-09/`` alone get re-read from scratch each time a
  caller hits ``_load_kb_documents`` (e.g. ``POST /rag-build`` followed by
  ``/rag-status`` followed by ``/rag-categories`` …).

We solve it by replacing SimpleDirectoryReader *for our single use-case*
(``required_exts=[".md"]``, recursive, no fancy parsers) with a tiny custom
reader in :func:`_read_all_markdown_documents` that:

1. Walks the directory tree once per process lifetime (memoised on
   ``(base_dir, exclude_dirs)``).
2. For every candidate ``.md`` file consults a process-level
   ``_FILE_READ_CACHE`` keyed by ``(absolute_path, mtime_ns, size_bytes)`` —
   if the triple matches a previous read, reuses the cached
   ``(text, frontmatter_meta)``; only when the file actually mutated do we
   hit disk again.
3. Constructs llama-index ``Document`` objects directly from the
   (cached) raw bytes/strings, skipping SimpleDirectoryReader's
   registry-lookup, extension-route-to-plugin dance.

RSS MONTHLY SCOPE
=================
``YiKnowledge/rss`` is append-only and grows without bound.  By default we
now **exclude** it entirely from RAG indexing (it is already listed in
``rag_exclude_dirs`` out of the box).  The small ``rss/<current-month>/``
window that callers *do* want searchable is optionally re-included via
``settings.rag_include_rss_current_month`` — when enabled we only walk
``rss/YYYY-MM-DD/`` directories whose YYYY-MM matches the current calendar
month (no more pulling in every historical RSS day).  The inclusion is
opt-in and off by default — the conservative choice for battery and CPU.
"""
from __future__ import annotations

import asyncio
from collections import deque
from datetime import datetime, timezone
import hashlib
import json
import logging
import os
import re
import shutil
import threading
import time
from typing import Any
import urllib.request

import yaml

from domain.rag.settings import ensure_settings_configured
from services.ai.provider_ollama import allow_embed_scope
from shared import metrics as _metrics
from shared.config import settings

logger = logging.getLogger(__name__)

# ── custom md reader cache ──────────────────────────────────────────────────

# Maximum number of unique (path, mtime_ns, size) file-read entries kept in
# the process-level LRU.  200k ≈ 40-60 MB of raw strings for a ~10k-doc
# knowledge base; we evict FIFO once over this bound.
_FILE_READ_CACHE_MAX_ENTRIES: int = 200_000
# (abs_path, mtime_ns, size_bytes) -> (text_content, frontmatter_dict_or_None)
# Insertion order = FIFO eviction order (CPython 3.7+ dicts are ordered).
_FILE_READ_CACHE: dict[tuple[str, int, int], tuple[str, dict[str, Any] | None]] = {}
_CACHE_LOCK = threading.Lock()
# In-flight read de-duplication: abs_path -> threading.Event.  When two
# callers race to read the same (path, mtime, size) the first one does the
# I/O and the second just waits on the event then hits cache.  Avoids the
# thundering herd on startup when build_kb_index + refresh + /rag-categories
# all fire in parallel.
_INFLIGHT_READS: dict[str, threading.Event] = {}
_INFLIGHT_LOCK = threading.Lock()

# (base_dir_abs, frozenset(exclude_dirs_abs), month_prefix_or_None) -> cached list[dict]
# Each cached entry is a lightweight list of per-file result dicts (see
# _walk_markdown_files).  We intentionally do NOT store llama-index Document
# objects in the memo because they're mutable and get mutated downstream.
_WALK_MEMO_MAX_ENTRIES: int = 16
_WALK_MEMO: dict[tuple[str, frozenset, str | None], list[dict[str, Any]]] = {}
_WALK_MEMO_ORDER: "deque[tuple[str, frozenset, str | None]]" = deque()
_WALK_LOCK = threading.Lock()

_MD_FRONTMATTER_RE = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.DOTALL)
# RFC 3339 style date dirs: rss/YYYY-MM-DD  (YMD_RE matches dirnames)
_YMD_DIR_RE = re.compile(r"^(?P<ym>\d{4}-\d{2})-\d{2}$")

# Observation counters (module-level so unit tests can assert on them even
# when prometheus_client is missing — the shared.metrics wrappers stay as
# the primary authoritative counter, these are just local mirrors).
_STATS_LOCK = threading.Lock()
_STATS: dict[str, int] = {
    "file_read_cache_hit": 0,
    "file_read_cache_miss": 0,
    "file_read_inflight_wait": 0,
    "file_read_disk_error": 0,
    "file_read_decode_error": 0,
    "file_read_frontmatter_bad": 0,
    "walk_cache_hit": 0,
    "walk_cache_miss": 0,
    "walk_rss_month_pruned_dirs": 0,
    "walk_excluded_dirs": 0,
    "docs_built_total": 0,
    "docs_built_skipped_empty": 0,
    "docs_meta_field_dropped_whitelist": 0,
    "docs_meta_reserved_dropped": 0,
    "rss_current_month_enabled": 0,
}

_kb_index: Any | None = None
_kb_index_built_at: str | None = None
_kb_doc_count: int = 0
_index_lock = asyncio.Lock()
_build_lock = threading.Lock()
_build_in_progress: bool = False
_FRONTMATTER_RE = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.DOTALL)
_RESERVED_META_KEYS = {"file_path", "filename", "page_label", "category"}
_MAX_META_VALUE_LEN = 100

# Frontmatter fields we willingly propagate into llama-index metadata.  Any
# FM key outside this set is dropped and counted in STATS.  Keeps arbitrary
# YAML keys written by collaborators out of the persisted vector index.
_FM_ALLOW_FIELDS: frozenset[str] = frozenset([
    "title", "description", "summary", "author", "tags", "keywords",
    "status", "priority", "project", "source", "published",
    "created", "updated", "date", "benefit", "risk", "category",
    "audience", "scope", "owner", "reviewer",
])
# llama-index forbids these from ever appearing in Document.metadata; if
# they appear in frontmatter we drop them unconditionally.
_LLAMA_RESERVED_META: frozenset[str] = frozenset([
    "id", "doc_id", "embedding", "text", "start_char_idx", "end_char_idx",
    "hash", "extra_info",
])
# Metadata keys that SDR's default MarkdownReader writes which we want to
# keep producing so downstream retrievers/rerankers that look for e.g.
# "last_modified_date" continue to work as before.
_SDR_COMPAT_META: tuple[str, ...] = (
    "file_path", "file_name", "file_size", "last_modified_date", "category",
)


def _persist_dir() -> str:
    return os.path.realpath(os.path.abspath(settings.rag_persist_dir))


def _extract_frontmatter(doc: Any) -> None:
    text = doc.get_content() or ""
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return
    raw_yaml, body = m.group(1), m.group(2)
    try:
        parsed = yaml.safe_load(raw_yaml) or {}
    except yaml.YAMLError:
        return
    if not isinstance(parsed, dict):
        return
    for k, v in parsed.items():
        if k in _RESERVED_META_KEYS:
            continue
        if isinstance(v, str | int | float | bool | list):
            if isinstance(v, str) and len(v) > _MAX_META_VALUE_LEN:
                v = v[:_MAX_META_VALUE_LEN]
            doc.metadata[k] = v
    if "category" in parsed and isinstance(parsed["category"], str):
        doc.metadata["category"] = parsed["category"]
    doc.set_content(body)


_UNNEEDED_META_KEYS = {"file_name", "filename"}


def _trim_metadata(doc: Any, max_total: int = 700) -> None:
    """Truncate metadata values so total serialized length stays under max_total."""
    meta = doc.metadata
    for key in list(meta.keys()):
        if key in _UNNEEDED_META_KEYS:
            del meta[key]
    for k, v in list(meta.items()):
        if isinstance(v, list):
            meta[k] = ", ".join(str(x) for x in v)
    total = sum(len(f"{k}:{v}") for k, v in meta.items())
    if total <= max_total:
        return
    excess = total - max_total
    str_keys = [(k, len(str(v))) for k, v in meta.items() if isinstance(v, str)]
    str_keys.sort(key=lambda x: x[1], reverse=True)
    for k, _length in str_keys:
        if excess <= 0:
            break
        v = meta[k]
        cut = min(len(v), excess + 10)
        meta[k] = v[:-cut] if cut < len(v) else ""
        excess -= cut


def _bump_stat(key: str, amount: int = 1) -> None:
    """Thread-safe increment of the local mirror counter + prometheus label."""
    with _STATS_LOCK:
        _STATS[key] = _STATS.get(key, 0) + amount
    if key == "file_read_cache_hit":
        _metrics.cache_hit_total.labels(backend="kb_file_read").inc(amount)
    elif key == "file_read_cache_miss":
        _metrics.cache_miss_total.labels(backend="kb_file_read").inc(amount)
    elif key == "walk_cache_hit":
        _metrics.cache_hit_total.labels(backend="kb_walk").inc(amount)
    elif key == "walk_cache_miss":
        _metrics.cache_miss_total.labels(backend="kb_walk").inc(amount)


def get_reader_stats_snapshot() -> dict[str, int]:
    """Return a copy of the local observation counters (for /metrics or tests)."""
    with _STATS_LOCK:
        snap = dict(_STATS)
    with _CACHE_LOCK:
        snap["file_read_cache_entries"] = len(_FILE_READ_CACHE)
    with _WALK_LOCK:
        snap["walk_memo_entries"] = len(_WALK_MEMO)
        snap["walk_memo_order_entries"] = len(_WALK_MEMO_ORDER)
    return snap


def _parse_frontmatter(text: str) -> tuple[str, dict[str, Any] | None]:
    """Split markdown text into (body, frontmatter_dict).

    Returns ``(body, None)`` if no frontmatter block is present.  Silently
    swallows YAML parse errors but counts them in STATS so operators can
    spot files with malformed FM from /metrics.
    """
    m = _MD_FRONTMATTER_RE.match(text or "")
    if not m:
        return text, None
    raw_yaml, body = m.group(1), m.group(2)
    try:
        parsed = yaml.safe_load(raw_yaml) or {}
    except yaml.YAMLError as exc:
        _bump_stat("file_read_frontmatter_bad")
        logger.debug("kb_indexer._parse_frontmatter: bad YAML block: %s", exc)
        return text, None
    if not isinstance(parsed, dict):
        _bump_stat("file_read_frontmatter_bad")
        return text, None
    return body, parsed


def _read_markdown_file(abs_path: str) -> tuple[str, dict[str, Any] | None, Any]:
    """Read a single .md file with mtime/size based in-process cache + in-flight dedup.

    Returns a 3-tuple ``(text_body, frontmatter_dict_or_None, os.stat_result)``.
    The stat_result is returned to the caller so it can build SDR-compatible
    metadata (``file_size``, ``last_modified_date``) without a second stat
    call (which on some macOS APFS volumes is surprisingly expensive under
    contention).
    """
    try:
        st = os.stat(abs_path)
    except OSError as exc:
        _bump_stat("file_read_disk_error")
        logger.warning("kb_indexer._read_markdown_file: stat failed: %s err=%s", abs_path, exc)
        return "", None, None
    key = (abs_path, st.st_mtime_ns, st.st_size)

    with _CACHE_LOCK:
        cached = _FILE_READ_CACHE.get(key)
        if cached is not None:
            _bump_stat("file_read_cache_hit")
            body, fm = cached
            return body, fm, st

    acquired_event: threading.Event | None = None
    waiter: threading.Event | None = None
    with _INFLIGHT_LOCK:
        existing = _INFLIGHT_READS.get(abs_path)
        if existing is None:
            acquired_event = threading.Event()
            _INFLIGHT_READS[abs_path] = acquired_event
        else:
            waiter = existing
    if acquired_event is None and waiter is not None:
        _bump_stat("file_read_inflight_wait")
        waiter.wait(timeout=30.0)
        with _CACHE_LOCK:
            cached = _FILE_READ_CACHE.get(key)
        if cached is not None:
            _bump_stat("file_read_cache_hit")
            body, fm = cached
            return body, fm, st

    _bump_stat("file_read_cache_miss")
    started = time.perf_counter()
    try:
        with open(abs_path, "rb") as f:
            raw_bytes = f.read()
    except OSError as exc:
        _bump_stat("file_read_disk_error")
        logger.warning("kb_indexer._read_markdown_file: read failed: %s err=%s", abs_path, exc)
        if acquired_event is not None:
            acquired_event.set()
            with _INFLIGHT_LOCK:
                if _INFLIGHT_READS.get(abs_path) is acquired_event:
                    _INFLIGHT_READS.pop(abs_path, None)
        return "", None, st
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        _bump_stat("file_read_decode_error")
        logger.warning("kb_indexer._read_markdown_file: utf-8 decode failed, replacing: %s", abs_path)
        try:
            text = raw_bytes.decode("utf-8", errors="replace")
        except Exception as exc:
            _bump_stat("file_read_decode_error")
            logger.error("kb_indexer._read_markdown_file: decode fallback failed: %s err=%s", abs_path, exc)
            text = ""
    body, fm = _parse_frontmatter(text)
    elapsed = time.perf_counter() - started
    _metrics.cache_operation_duration_seconds.labels(backend="kb_file_read", operation="fill").observe(elapsed)

    with _CACHE_LOCK:
        _FILE_READ_CACHE[key] = (body, fm)
        while len(_FILE_READ_CACHE) > _FILE_READ_CACHE_MAX_ENTRIES:
            oldest_key = next(iter(_FILE_READ_CACHE))
            _FILE_READ_CACHE.pop(oldest_key, None)
    if acquired_event is not None:
        acquired_event.set()
        with _INFLIGHT_LOCK:
            if _INFLIGHT_READS.get(abs_path) is acquired_event:
                _INFLIGHT_READS.pop(abs_path, None)
    return body, fm, st


def _current_rss_month_prefix() -> str:
    """Return the ``YYYY-MM`` dirname prefix we still want searchable inside rss/."""
    now_local = datetime.now()
    return f"{now_local.year:04d}-{now_local.month:02d}"


def _walk_markdown_files(
    base: str,
    exclude_dirs: list[str],
    *,
    include_rss_current_month: bool,
) -> list[dict[str, Any]]:
    """Recursively walk ``base`` collecting every in-scope ``.md`` file.

    Returns lightweight per-file dicts with abs_path/rel_path/category and
    cheap stat data (mtime_ns, file_size, last_modified_s) so the downstream
    builder can produce SDR-compatible metadata without a second syscall.
    """
    t0 = time.perf_counter()
    base_abs = os.path.realpath(os.path.abspath(base))
    exclude_abs = frozenset(
        os.path.realpath(os.path.join(base_abs, ed)) for ed in (exclude_dirs or [])
    )
    if include_rss_current_month:
        month_key: str | None = _current_rss_month_prefix()
        _bump_stat("rss_current_month_enabled")
    else:
        month_key = None
    memo_key = (base_abs, exclude_abs, month_key)
    with _WALK_LOCK:
        cached = _WALK_MEMO.get(memo_key)
        if cached is not None:
            _bump_stat("walk_cache_hit")
            _metrics.cache_operation_duration_seconds.labels(backend="kb_walk", operation="hit").observe(
                time.perf_counter() - t0
            )
            return [dict(entry) for entry in cached]
    _bump_stat("walk_cache_miss")

    results: list[dict[str, Any]] = []
    rss_root = os.path.join(base_abs, "rss")
    rss_root_real = os.path.realpath(rss_root) if os.path.isdir(rss_root) else None
    effective_exclude = set(exclude_abs)
    if include_rss_current_month and rss_root_real and rss_root_real in effective_exclude:
        effective_exclude.discard(rss_root_real)

    for dirpath, dirnames, filenames in os.walk(base_abs):
        dirpath_real = os.path.realpath(dirpath)
        pruned: list[str] = []
        for d in list(dirnames):
            d_abs = os.path.realpath(os.path.join(dirpath_real, d))
            if d_abs in effective_exclude:
                pruned.append(d)
                _bump_stat("walk_excluded_dirs")
                continue
            if (
                include_rss_current_month
                and rss_root_real is not None
                and dirpath_real == rss_root_real
            ):
                m = _YMD_DIR_RE.match(d)
                if m is not None and m.group("ym") != month_key:
                    pruned.append(d)
                    _bump_stat("walk_rss_month_pruned_dirs")
                    continue
        for p in pruned:
            dirnames.remove(p)

        for fn in filenames:
            if not fn.lower().endswith(".md"):
                continue
            abs_path = os.path.realpath(os.path.join(dirpath_real, fn))
            try:
                rel = os.path.relpath(abs_path, base_abs).replace(os.sep, "/")
            except ValueError:
                rel = abs_path
            parts = rel.split("/")
            category = parts[0] if len(parts) >= 1 else ""
            try:
                st_quick = os.stat(abs_path)
            except OSError:
                _bump_stat("file_read_disk_error")
                continue
            results.append({
                "abs_path": abs_path,
                "rel_path": rel,
                "category": category,
                "file_name": fn,
                "mtime_ns": st_quick.st_mtime_ns,
                "file_size": st_quick.st_size,
                "last_modified_s": int(st_quick.st_mtime),
            })

    with _WALK_LOCK:
        if memo_key not in _WALK_MEMO and len(_WALK_MEMO) >= _WALK_MEMO_MAX_ENTRIES:
            try:
                victim = _WALK_MEMO_ORDER.popleft()
            except IndexError:
                victim = None
            if victim is not None:
                _WALK_MEMO.pop(victim, None)
        if memo_key not in _WALK_MEMO:
            _WALK_MEMO_ORDER.append(memo_key)
        _WALK_MEMO[memo_key] = [dict(entry) for entry in results]
    elapsed = time.perf_counter() - t0
    _metrics.cache_operation_duration_seconds.labels(backend="kb_walk", operation="fill").observe(elapsed)
    return [dict(entry) for entry in results]


def _build_llama_document(entry: dict[str, Any], *, base_abs: str) -> Any:
    """Turn one walk-entry from :func:`_walk_markdown_files` into a llama-index
    :class:`Document`, reusing cached file content via :func:`_read_markdown_file`.
    """
    from llama_index.core import Document

    abs_path = entry["abs_path"]
    body, fm, st = _read_markdown_file(abs_path)
    if not body:
        _bump_stat("docs_built_skipped_empty")
    metadata: dict[str, Any] = {
        "file_path": entry["rel_path"],
        "file_name": entry["file_name"],
        "category": entry.get("category") or "",
        "file_size": int(entry.get("file_size") or (st.st_size if st else 0) or 0),
    }
    last_mod_s = int(
        entry.get("last_modified_s")
        or (int(st.st_mtime) if st else 0)
        or 0
    )
    if last_mod_s:
        try:
            metadata["last_modified_date"] = datetime.fromtimestamp(last_mod_s, tz=timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
        except (OSError, OverflowError, ValueError):
            metadata["last_modified_date"] = ""
    if fm:
        for k, v in fm.items():
            if k in _LLAMA_RESERVED_META:
                _bump_stat("docs_meta_reserved_dropped")
                continue
            if k not in _FM_ALLOW_FIELDS:
                _bump_stat("docs_meta_field_dropped_whitelist")
                continue
            if isinstance(v, str):
                metadata[k] = v[:200]
            elif isinstance(v, bool | int | float):
                metadata[k] = v
            elif isinstance(v, list):
                flat: list[str] = []
                for item in v:
                    if isinstance(item, str):
                        flat.append(item[:80])
                    elif isinstance(item, bool | int | float):
                        flat.append(str(item))
                metadata[k] = ",".join(flat[:20])
    for reserved in list(_LLAMA_RESERVED_META):
        if metadata.pop(reserved, None) is not None:
            _bump_stat("docs_meta_reserved_dropped")
    doc = Document(text=body or "", metadata=metadata)
    doc.id_ = entry["rel_path"]
    _bump_stat("docs_built_total")
    return doc


def _load_kb_documents() -> list:
    """Load every in-scope markdown document as llama-index Documents.

    This is the function that used to be the biggest ``llama-index-readers-file``
    hot-spot.  It no longer imports or uses ``SimpleDirectoryReader``.
    """
    from llama_index.core import Document

    base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
    if not os.path.isdir(base):
        raise FileNotFoundError(f"Knowledge base dir not found: {base}")

    exclude = list(getattr(settings, "rag_exclude_dirs", None) or [])
    include_rss = bool(getattr(settings, "rag_include_rss_current_month", False))

    t0 = time.perf_counter()
    entries = _walk_markdown_files(base, exclude, include_rss_current_month=include_rss)
    docs: list = []
    seen_ids: set[str] = set()
    for entry in entries:
        rel = entry.get("rel_path") or ""
        if not rel or rel in seen_ids:
            continue
        seen_ids.add(rel)
        doc = _build_llama_document(entry, base_abs=base)
        if not isinstance(doc, Document):
            continue
        docs.append(doc)
    elapsed = time.perf_counter() - t0
    snap = get_reader_stats_snapshot()
    pruned = snap.get("walk_rss_month_pruned_dirs", 0)
    excluded = snap.get("walk_excluded_dirs", 0)
    hr = snap.get("file_read_cache_hit", 0)
    mr = snap.get("file_read_cache_miss", 0)
    hr_pct = (hr / max(1, hr + mr)) * 100.0 if (hr + mr) else 0.0
    logger.info(
        "_load_kb_documents: scanned %d .md files under %s in %.2fs "
        "(exclude=%s, include_rss_current_month=%s, excluded_dirs=%d, "
        "rss_pruned_dirs=%d, read_cache_hit=%d, read_cache_miss=%d, hit_ratio=%.1f%%)",
        len(entries),
        base,
        elapsed,
        exclude,
        include_rss,
        excluded,
        pruned,
        hr,
        mr,
        hr_pct,
    )
    _metrics.rag_index_document_count.set(len(docs))
    return docs


def _to_rel_file_path(doc: Any) -> str:
    base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
    fp = doc.metadata.get("file_path") or doc.metadata.get("filename") or ""
    if not fp:
        return ""
    try:
        rel = os.path.relpath(fp, base).replace(os.sep, "/")
    except ValueError:
        return fp
    doc.metadata["file_path"] = rel
    return rel


def _load_specific_documents(base: str, rel_paths: list) -> list:
    """Load a targeted subset of markdown documents (e.g. for incremental
    refresh).  Also bypasses SimpleDirectoryReader — each file goes
    straight through :func:`_read_markdown_file` so unchanged files hit
    the mtime/size cache.
    """
    from llama_index.core import Document

    base_abs = os.path.realpath(os.path.abspath(base))
    docs: list = []
    seen: set[str] = set()
    for rel in (rel_paths or []):
        if not rel:
            continue
        abs_path = os.path.realpath(os.path.join(base_abs, rel))
        if abs_path in seen:
            continue
        seen.add(abs_path)
        if not os.path.isfile(abs_path):
            continue
        rel_norm = os.path.relpath(abs_path, base_abs).replace(os.sep, "/")
        category = rel_norm.split("/", 1)[0] if "/" in rel_norm else ""
        entry = {
            "abs_path": abs_path,
            "rel_path": rel_norm,
            "category": category,
            "file_name": os.path.basename(abs_path),
        }
        doc = _build_llama_document(entry, base_abs=base_abs)
        if isinstance(doc, Document):
            _trim_metadata(doc)
            docs.append(doc)
    return docs


def _count_ref_docs(persist_dir: str) -> int:
    docstore = os.path.join(persist_dir, "docstore.json")
    if not os.path.isfile(docstore):
        return 0
    try:
        with open(docstore, encoding="utf-8") as f:
            data = json.load(f)
        return len(data.get("docstore/data", {})) if isinstance(data, dict) else 0
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, TypeError, AttributeError):
        return 0


def build_kb_index() -> Any:
    """(Re)build the full RAG index from disk.

    This function wraps the embedding work in ``allow_embed_scope`` so the
    kill-switch in ``provider_ollama.py`` gets temporarily lifted for this
    single controlled batch.  Every other call path that tries to embed
    raises ``EmbedDisabledError`` by design.
    """
    global _kb_index, _kb_index_built_at, _kb_doc_count, _build_in_progress

    with _build_lock:
        if _build_in_progress:
            logger.info("build_kb_index: another build already in progress, returning existing index")
            return _kb_index
        _build_in_progress = True

    try:
        with allow_embed_scope(reason="kb_indexer.build_kb_index"):
            ensure_settings_configured()
            from llama_index.core import StorageContext, VectorStoreIndex
            from llama_index.core.node_parser import SentenceSplitter, SentenceWindowNodeParser

            persist = _persist_dir()
            if os.path.isdir(persist):
                shutil.rmtree(persist, ignore_errors=True)
            os.makedirs(persist, exist_ok=True)

            docs = _load_kb_documents()
            exclude = getattr(settings, "rag_exclude_dirs", None) or []
            if exclude:
                before = len(docs)
                base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
                docs = [d for d in docs if not any(
                    os.path.relpath(d.metadata.get("file_path", ""), base).startswith(f"{ed}{os.sep}")
                    for ed in exclude
                )]
                logger.info(f"RAG index: excluded {before - len(docs)} docs in {exclude}, kept {len(docs)}")
            for d in docs:
                rel = _to_rel_file_path(d)
                if rel:
                    d.id_ = rel
                _trim_metadata(d)

            if settings.rag_sentence_window_enabled:
                node_parser = SentenceWindowNodeParser.from_defaults(
                    window_size=settings.rag_sentence_window_size,
                    window_metadata_key="window", original_text_metadata_key="original_text",
                )
                logger.info(f"RAG index using SentenceWindowNodeParser (window={settings.rag_sentence_window_size})")
            else:
                node_parser = SentenceSplitter(chunk_size=settings.rag_chunk_size, chunk_overlap=settings.rag_chunk_overlap)
                logger.info(f"RAG index using SentenceSplitter (chunk={settings.rag_chunk_size}, overlap={settings.rag_chunk_overlap})")

            nodes = node_parser.get_nodes_from_documents(docs)
            storage_context = StorageContext.from_defaults()
            index = VectorStoreIndex(nodes, storage_context=storage_context, show_progress=False)
            storage_context.persist(persist_dir=persist)
            _kb_index = index
            _kb_index_built_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
            _kb_doc_count = len(docs)
            logger.info(f"RAG index rebuilt: {_kb_doc_count} docs → {persist}")

            _invalidate_rag_caches()
            return index
    finally:
        with _build_lock:
            _build_in_progress = False


def _build_failed() -> None:
    global _build_in_progress
    _build_in_progress = False


def _run_build_thread() -> None:
    try:
        build_kb_index()
    except Exception:
        _build_failed()
        logger.exception("RAG index background build failed")


def load_kb_index() -> Any:
    global _kb_index, _kb_index_built_at, _kb_doc_count
    if _kb_index is not None:
        return _kb_index
    from llama_index.core import StorageContext, load_index_from_storage

    ensure_settings_configured()
    persist = _persist_dir()
    if not os.path.isdir(persist) or not any(os.scandir(persist)):
        if not settings.rag_auto_rebuild_enabled:
            logger.warning(
                f"RAG index not found at {persist} and auto_rebuild is disabled. "
                "Call POST /rag-build manually to build the index on demand."
            )
            return None
        return build_kb_index()
    try:
        storage_context = StorageContext.from_defaults(persist_dir=persist)
        _kb_index = load_index_from_storage(storage_context)
    except Exception:
        logger.warning("Failed to load KB index from %s, rebuilding", persist, exc_info=True)
        shutil.rmtree(persist, ignore_errors=True)
        if not settings.rag_auto_rebuild_enabled:
            logger.warning(
                "RAG index load failed and auto_rebuild is disabled. "
                "Call POST /rag-build manually."
            )
            return None
        return build_kb_index()
    _kb_doc_count = _count_ref_docs(persist)
    if not _kb_index_built_at:
        mtime = os.path.getmtime(persist)
        _kb_index_built_at = datetime.fromtimestamp(mtime, timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"RAG index loaded from {persist} ({_kb_doc_count} docs)")
    return _kb_index


def refresh_index_for_changes(added: list, removed: list, changed: list) -> dict[str, Any]:
    """Incrementally refresh the index for a set of added/removed/changed files.

    Wraps embedding in ``allow_embed_scope`` — see :func:`build_kb_index` for
    the design rationale.
    """
    global _kb_doc_count, _kb_index_built_at
    ensure_settings_configured()
    from domain.rag.paths import base_dir
    base = base_dir()
    persist = _persist_dir()

    with _build_lock:
        if _build_in_progress:
            return {
                "inserted": 0, "deleted": 0, "errors": [],
                "skipped": "build_in_progress",
            }
        _build_in_progress = True

    try:
        with allow_embed_scope(reason="kb_indexer.refresh_index_for_changes"):
            if not os.path.isdir(persist) or not any(os.scandir(persist)):
                build_kb_index()
                return {"inserted": _kb_doc_count, "deleted": 0, "errors": [], "fallback": "full_build"}

            index = load_kb_index()
            errors: list = []
            deleted = 0

            for rel in list(set(removed + changed)):
                try:
                    index.delete_ref_doc(rel, delete_from_docstore=True)
                    deleted += 1
                except Exception as e:
                    errors.append(f"delete {rel}: {e}")

            to_load = sorted(set(added + changed))
            inserted = 0
            if to_load:
                try:
                    docs = _load_specific_documents(base, to_load)
                    for d in docs:
                        rel = _to_rel_file_path(d)
                        if rel:
                            d.id_ = rel
                    if docs:
                        for doc in docs:
                            index.insert(doc)
                        inserted = len(docs)
                except Exception as e:
                    errors.append(f"insert: {e}")

            try:
                index.storage_context.persist(persist_dir=persist)
            except Exception as e:
                errors.append(f"persist: {e}")

            _kb_doc_count = _count_ref_docs(persist)
            _kb_index_built_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
            logger.info(f"RAG incremental refresh: +{inserted} -{deleted} (total {_kb_doc_count})")
            _invalidate_rag_caches()
            return {"inserted": inserted, "deleted": deleted, "errors": errors}
    finally:
        with _build_lock:
            _build_in_progress = False


async def refresh_index_async(added: list, removed: list, changed: list) -> Any:
    async with _index_lock:
        return await asyncio.to_thread(refresh_index_for_changes, added, removed, changed)


def is_index_available() -> bool:
    persist = _persist_dir()
    return os.path.isdir(persist) and bool(_kb_index is not None or any(os.scandir(persist)))


def get_kb_index() -> Any:
    return load_kb_index()


def is_index_building() -> bool:
    return _build_in_progress


def ensure_kb_index() -> Any | None:
    """Get the KB index, triggering a background build when needed.

    When ``auto_rebuild_enabled`` is true and the index doesn't exist yet,
    starts a background thread build and returns None immediately.  Callers
    should check ``is_index_building()`` to distinguish "building" from
    "unavailable" so they can tell the client to retry instead of showing
    an error.

    Returns the index if already available, None otherwise.
    """
    if is_index_available():
        return get_kb_index()
    if settings.rag_auto_rebuild_enabled:
        global _build_in_progress
        with _build_lock:
            if _build_in_progress:
                logger.info("RAG index build already in progress")
                return None
            _build_in_progress = True
        logger.info("RAG index not found — starting background build (auto_rebuild enabled)")
        threading.Thread(target=_run_build_thread, daemon=True).start()
    return None


def trigger_background_build() -> None:
    """Explicitly trigger a background index build if not already running."""
    global _build_in_progress
    if is_index_available() or _build_in_progress:
        return
    if settings.rag_auto_rebuild_enabled:
        with _build_lock:
            if _build_in_progress:
                return
            _build_in_progress = True
        logger.info("RAG index background build triggered")
        threading.Thread(target=_run_build_thread, daemon=True).start()


def rebuild_index() -> Any:
    return build_kb_index()


async def rebuild_index_async() -> Any:
    async with _index_lock:
        _dbg_trace = f"knowledge-sync-rag-{int(time.time() * 1000)}"
        _dbg_started = time.perf_counter()
        # #region debug-point E:rag-rebuild-start
        try:
            urllib.request.urlopen(urllib.request.Request(
                "http://127.0.0.1:7777/event",
                data=json.dumps({
                    "sessionId": "knowledge-sync-slow",
                    "runId": "post-fix",
                    "hypothesisId": "E",
                    "location": "src/domain/rag/kb_indexer.py:rebuild_index_async:start",
                    "traceId": _dbg_trace,
                    "msg": "[DEBUG] rag rebuild start",
                    "data": {"buildInProgress": _build_in_progress},
                    "ts": int(time.time() * 1000),
                }).encode(),
                headers={"Content-Type": "application/json"},
            ), timeout=0.8).read()
        except Exception:
            pass
        # #endregion
        _result = await asyncio.to_thread(rebuild_index)
        # #region debug-point E:rag-rebuild-finish
        try:
            urllib.request.urlopen(urllib.request.Request(
                "http://127.0.0.1:7777/event",
                data=json.dumps({
                    "sessionId": "knowledge-sync-slow",
                    "runId": "post-fix",
                    "hypothesisId": "E",
                    "location": "src/domain/rag/kb_indexer.py:rebuild_index_async:finish",
                    "traceId": _dbg_trace,
                    "msg": "[DEBUG] rag rebuild finish",
                    "data": {
                        "durationMs": int((time.perf_counter() - _dbg_started) * 1000),
                        "resultType": type(_result).__name__ if _result is not None else None,
                    },
                    "ts": int(time.time() * 1000),
                }).encode(),
                headers={"Content-Type": "application/json"},
            ), timeout=0.8).read()
        except Exception:
            pass
        # #endregion
        return _result


async def preload_kb_index() -> None:
    await asyncio.to_thread(load_kb_index)


def _invalidate_rag_caches() -> None:
    """Invalidate RAG-related caches after index rebuild or refresh."""
    try:
        from shared.cache import cache
        loop = asyncio.get_event_loop_policy().get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(cache.delete("rag:status"))
            asyncio.ensure_future(cache.delete("rag:categories"))
        else:
            loop.run_until_complete(cache.delete("rag:status"))
            loop.run_until_complete(cache.delete("rag:categories"))
    except Exception:
        logger.debug("Failed to invalidate RAG caches", exc_info=True)
    # Reset categories scan timestamp so next /rag-categories re-scans
    try:
        import domain.rag.file_indexer as fi
        fi._last_categories_scan = None
    except Exception:
        pass


def _check_ollama_sync() -> dict[str, Any]:
    try:
        import requests
        r = requests.get(f"{settings.ollama_url}/api/tags", timeout=5)
        r.raise_for_status()
        models = [m.get("name", "") for m in (r.json().get("models", []) or [])]
        model = settings.rag_llm_model
        base = model.split(":")[0]
        for m in models:
            if m == model or m.startswith(f"{base}:"):
                return {"available": True, "model": m, "all_models": models}
        return {"available": False, "error": f"model {model} not found", "all_models": models}
    except Exception as e:
        return {"available": False, "error": str(e)}


def rag_status() -> dict[str, Any]:
    persist = _persist_dir()
    built = _kb_index is not None or (os.path.isdir(persist) and any(os.scandir(persist)))
    persist_dir_size = 0
    if built and os.path.isdir(persist):
        try:
            for dirpath, _dirs, filenames in os.walk(persist):
                for f in filenames:
                    try:
                        persist_dir_size += os.path.getsize(os.path.join(dirpath, f))
                    except OSError:
                        pass
        except OSError:
            logger.debug("Failed to get persist dir size", exc_info=True)

    return {
        "built": built,
        "building": _build_in_progress,
        "num_docs": _kb_doc_count if _kb_index is not None else _count_ref_docs(persist),
        "last_built_at": _kb_index_built_at,
        "persist_dir": persist,
        "persist_dir_size": persist_dir_size,
        "config": {
            "embed_model": settings.rag_embed_model,
            "llm_model": settings.rag_llm_model,
            "chunk_size": settings.rag_chunk_size,
            "chunk_overlap": settings.rag_chunk_overlap,
            "top_k": settings.rag_top_k,
            "hybrid_retrieval": settings.rag_hybrid_retrieval_enabled,
            "rerank_enabled": settings.rag_rerank_enabled,
            "inline_citations": settings.rag_inline_citations_enabled,
            "auto_rebuild": settings.rag_auto_rebuild_enabled,
            "knowledge_base_dir": settings.knowledge_base_dir,
            "context_chunks": settings.rag_context_chunks,
            "snippet_chars": settings.rag_snippet_chars,
            "sentence_window": settings.rag_sentence_window_enabled,
            "sentence_window_size": settings.rag_sentence_window_size,
            "hyde_enabled": settings.rag_hyde_enabled,
            "query_embed_enabled": settings.rag_query_embed_enabled,
            "embed_cache_enabled": settings.rag_embed_cache_enabled,
            "embed_cache_persist": settings.rag_embed_cache_persist,
        },
        "ollama": _check_ollama_sync(),
    }
