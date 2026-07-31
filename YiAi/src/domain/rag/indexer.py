"""llama_index indexer over ``~/YiKnowledge``.

Builds a persisted ``VectorStoreIndex`` over every Markdown file under
``settings.knowledge_base_dir`` using Ollama embeddings (``nomic-embed-text``
by default). The index is cached in-process as a module-level singleton so
repeat queries don't re-load from disk.

Public surface:
    - ``build_kb_index()``     → fresh build + persist
    - ``load_kb_index()``      → lazy load from persist dir, auto-rebuild if missing
    - ``get_kb_index()``       → cached accessor
    - ``rebuild_index()``      → wipe persist dir and rebuild (sync; use ``rebuild_index_async`` from routes)
    - ``rag_status()``         → ``{built, num_docs, last_built_at}``
    - ``build_file_index(abs_path)`` → throwaway in-memory index for the
      aicr "ask this file" path
"""
from __future__ import annotations

import logging
import os
import re
import shutil
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import yaml

from shared.config import settings

from domain.rag.settings import ensure_settings_configured

logger = logging.getLogger(__name__)

_kb_index: Optional[Any] = None           # VectorStoreIndex singleton
_kb_index_built_at: Optional[str] = None  # ISO-ish timestamp string
_kb_doc_count: int = 0

# Matches leading YAML frontmatter delimited by `---` lines. CRLF tolerant.
_FRONTMATTER_RE = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.DOTALL)
# Reserved keys SimpleDirectoryReader stamps in metadata — never overwrite.
_RESERVED_META_KEYS = {"file_path", "filename", "page_label", "category"}


def _persist_dir() -> str:
    return os.path.realpath(os.path.abspath(settings.rag_persist_dir))


def _extract_frontmatter(doc: Any) -> None:
    """Parse a leading YAML frontmatter block from ``doc.text``.

    Merges non-reserved keys into ``doc.metadata`` (so MetadataFilters can
    target ``category`` / ``tags`` / ``source`` / ``type`` / ``status``),
    and strips the block from the text so it doesn't pollute embeddings or
    retrieved snippets. No-op when no frontmatter is present.
    """
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
        if isinstance(v, (str, int, float, bool, list)):
            doc.metadata[k] = v
    if "category" in parsed and isinstance(parsed["category"], str):
        doc.metadata["category"] = parsed["category"]
    doc.set_content(body)


def _load_kb_documents() -> list:
    """Read all .md files under the knowledge base dir as llama_index Documents.

    YAML frontmatter is extracted into ``doc.metadata`` (``category``,
    ``tags``, ``source``, ``type``, ``status`` ...) so MetadataFilters can
    target it; the raw block is stripped from the chunk text.
    """
    from llama_index.core import SimpleDirectoryReader
    base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
    if not os.path.isdir(base):
        raise FileNotFoundError(f"Knowledge base dir not found: {base}")
    reader = SimpleDirectoryReader(
        input_dir=base,
        required_exts=[".md"],
        recursive=True,
        exclude_hidden=False,
    )
    docs = reader.load_data()
    for d in docs:
        _extract_frontmatter(d)
    return docs


def _to_rel_file_path(doc: Any) -> str:
    """Rewrite ``file_path`` metadata to a path relative to the knowledge base.

    SimpleDirectoryReader stamps absolute ``file_path`` into metadata by
    default. We want relative paths so the UI can pass them to
    ``/knowledge-read`` and so ``MetadataFilter(file_path CONTAINS scope)``
    works with ``projects/YiVad/`` style scopes.
    """
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


def build_kb_index() -> Any:
    """Fresh-build the VectorStoreIndex and persist to disk."""
    global _kb_index, _kb_index_built_at, _kb_doc_count
    from llama_index.core import VectorStoreIndex, StorageContext

    ensure_settings_configured()
    persist = _persist_dir()
    if os.path.isdir(persist):
        shutil.rmtree(persist, ignore_errors=True)
    os.makedirs(persist, exist_ok=True)

    docs = _load_kb_documents()
    for d in docs:
        rel = _to_rel_file_path(d)
        if rel:
            # Stable doc id keyed on file_path so incremental delete_ref_doc
            # works on file change/remove — otherwise llama_index assigns a
            # random UUID per build and we'd never be able to remove a doc.
            d.id_ = rel

    storage_context = StorageContext.from_defaults(persist_dir=persist)
    index = VectorStoreIndex.from_documents(
        docs,
        storage_context=storage_context,
        show_progress=False,
    )
    storage_context.persist(persist_dir=persist)
    _kb_index = index
    _kb_index_built_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    _kb_doc_count = len(docs)
    logger.info(f"RAG index rebuilt: {_kb_doc_count} docs → {persist}")
    return index


def load_kb_index() -> Any:
    """Lazy-load from the persist dir. Auto-rebuild if the dir is missing/empty."""
    global _kb_index, _kb_index_built_at, _kb_doc_count
    if _kb_index is not None:
        return _kb_index
    from llama_index.core import StorageContext, load_index_from_storage

    ensure_settings_configured()
    persist = _persist_dir()
    if not os.path.isdir(persist) or not any(os.scandir(persist)):
        return build_kb_index()
    storage_context = StorageContext.from_defaults(persist_dir=persist)
    _kb_index = load_index_from_storage(storage_context)
    _kb_doc_count = _count_ref_docs(persist)
    if not _kb_index_built_at:
        mtime = os.path.getmtime(persist)
        _kb_index_built_at = datetime.fromtimestamp(mtime, timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"RAG index loaded from {persist} ({_kb_doc_count} docs)")
    return _kb_index


def _load_specific_documents(base: str, rel_paths: list) -> list:
    """Load a specific set of files as llama_index Documents.

    Used by ``refresh_index_for_changes`` for the incremental add/change path
    — avoids re-walking the whole KB. YAML frontmatter is extracted and the
    raw block stripped, same as ``_load_kb_documents``.
    """
    from llama_index.core import SimpleDirectoryReader
    abs_paths = [os.path.join(base, p) for p in rel_paths if p]
    if not abs_paths:
        return []
    reader = SimpleDirectoryReader(input_files=abs_paths)
    docs = reader.load_data()
    for d in docs:
        _extract_frontmatter(d)
    return docs


def refresh_index_for_changes(added: list, removed: list, changed: list) -> Dict[str, Any]:
    """Apply incremental file-level updates to the existing KB index.

    ``added`` / ``removed`` / ``changed`` are lists of relative paths under
    the knowledge base dir. Changed files are deleted then re-inserted so
    their chunks don't accumulate stale text. Docs are keyed by ``id_=rel_path``
    so ``delete_ref_doc`` reliably removes a file's chunks.

    Falls back to ``build_kb_index`` (full wipe + rebuild) if the persist dir
    is missing — e.g. first-ever run, or user wiped ``data/rag_store``.
    """
    global _kb_doc_count, _kb_index_built_at
    ensure_settings_configured()
    from domain.rag.paths import base_dir
    base = base_dir()
    persist = _persist_dir()
    if not os.path.isdir(persist) or not any(os.scandir(persist)):
        # No prior index — full build handles the initial population.
        build_kb_index()
        return {"inserted": _kb_doc_count, "deleted": 0, "errors": [], "fallback": "full_build"}

    index = load_kb_index()
    errors: list = []
    deleted = 0

    # Delete removed + changed first (changed must drop old chunks before re-insert).
    for rel in list(set(removed + changed)):
        try:
            index.delete_ref_doc(rel, delete_from_docstore=True)
            deleted += 1
        except Exception as e:
            errors.append(f"delete {rel}: {e}")

    # Insert added + changed.
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
                index.insert_documents(docs, show_progress=False)
                inserted = len(docs)
        except Exception as e:
            errors.append(f"insert: {e}")

    # Persist back to disk so the next process load sees the changes.
    try:
        index.storage_context.persist(persist_dir=persist)
    except Exception as e:
        errors.append(f"persist: {e}")

    _kb_doc_count = _count_ref_docs(persist)
    _kb_index_built_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"RAG incremental refresh: +{inserted} -{deleted} (total {_kb_doc_count})")
    return {"inserted": inserted, "deleted": deleted, "errors": errors}


async def refresh_index_async(added: list, removed: list, changed: list) -> Any:
    """Async wrapper — runs the sync refresh in a worker thread."""
    import asyncio
    return await asyncio.to_thread(refresh_index_for_changes, added, removed, changed)


def _count_ref_docs(persist_dir: str) -> int:
    """Count persisted docstore entries — best-effort metadata for status."""
    docstore = os.path.join(persist_dir, "docstore.json")
    if not os.path.isfile(docstore):
        return 0
    try:
        import json
        with open(docstore, "r", encoding="utf-8") as f:
            data = json.load(f)
        return len(data.get("docstore/data", {})) if isinstance(data, dict) else 0
    except Exception:
        return 0


def get_kb_index() -> Any:
    return load_kb_index()


def rebuild_index() -> Any:
    """Synchronous rebuild — caller should run via ``asyncio.to_thread``."""
    return build_kb_index()


async def rebuild_index_async() -> Any:
    import asyncio
    return await asyncio.to_thread(rebuild_index)


def rag_status() -> Dict[str, Any]:
    persist = _persist_dir()
    built = _kb_index is not None or (
        os.path.isdir(persist) and any(os.scandir(persist))
    )
    return {
        "built": built,
        "num_docs": _kb_doc_count if _kb_index is not None else _count_ref_docs(persist),
        "last_built_at": _kb_index_built_at,
        "persist_dir": persist,
    }


def build_file_index(abs_path: str) -> Any:
    """Throwaway in-memory VectorStoreIndex for a single file.

    Used by the aicr "ask this file" path — the caller passes an already
    resolved absolute path (use ``paths.resolve_safe`` first). Not persisted.
    """
    from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
    ensure_settings_configured()
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(f"Not a file: {abs_path}")
    parent = os.path.dirname(abs_path)
    fname = os.path.basename(abs_path)
    reader = SimpleDirectoryReader(input_dir=parent, required_exts=[os.path.splitext(fname)[1] or ".md"], recursive=False)
    docs = [d for d in reader.load_data() if os.path.basename(d.metadata.get("file_path", "")) == fname]
    if not docs:
        docs = reader.load_data()
    for d in docs:
        _extract_frontmatter(d)
    return VectorStoreIndex.from_documents(docs, show_progress=False)
