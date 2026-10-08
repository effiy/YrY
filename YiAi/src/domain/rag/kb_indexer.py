"""Knowledge base index: build, load, refresh, status checks."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import json
import logging
import os
import re
import shutil
import threading
from typing import Any

import yaml

from domain.rag.settings import ensure_settings_configured
from shared.config import settings

logger = logging.getLogger(__name__)

_kb_index: Any | None = None
_kb_index_built_at: str | None = None
_kb_doc_count: int = 0
_index_lock = asyncio.Lock()
_build_lock = threading.Lock()
_build_in_progress: bool = False
_FRONTMATTER_RE = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.DOTALL)
_RESERVED_META_KEYS = {"file_path", "filename", "page_label", "category"}
_MAX_META_VALUE_LEN = 100


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


def _load_kb_documents() -> list:
    from llama_index.core import SimpleDirectoryReader
    base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
    if not os.path.isdir(base):
        raise FileNotFoundError(f"Knowledge base dir not found: {base}")
    reader = SimpleDirectoryReader(input_dir=base, required_exts=[".md"], recursive=True, exclude_hidden=False)
    docs = reader.load_data()
    for d in docs:
        _extract_frontmatter(d)
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
    from llama_index.core import SimpleDirectoryReader
    abs_paths = [os.path.join(base, p) for p in rel_paths if p]
    if not abs_paths:
        return []
    reader = SimpleDirectoryReader(input_files=abs_paths)
    docs = reader.load_data()
    for d in docs:
        _extract_frontmatter(d)
        _trim_metadata(d)
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
    global _kb_index, _kb_index_built_at, _kb_doc_count, _build_in_progress
    _build_in_progress = True
    from llama_index.core import StorageContext, VectorStoreIndex
    from llama_index.core.node_parser import SentenceSplitter, SentenceWindowNodeParser

    ensure_settings_configured()
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
    _build_in_progress = False
    logger.info(f"RAG index rebuilt: {_kb_doc_count} docs → {persist}")

    # Invalidate caches so next /rag-status and /rag-categories return fresh data
    _invalidate_rag_caches()

    return index


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
        return build_kb_index()
    try:
        storage_context = StorageContext.from_defaults(persist_dir=persist)
        _kb_index = load_index_from_storage(storage_context)
    except Exception:
        logger.warning("Failed to load KB index from %s, rebuilding", persist, exc_info=True)
        shutil.rmtree(persist, ignore_errors=True)
        return build_kb_index()
    _kb_doc_count = _count_ref_docs(persist)
    if not _kb_index_built_at:
        mtime = os.path.getmtime(persist)
        _kb_index_built_at = datetime.fromtimestamp(mtime, timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"RAG index loaded from {persist} ({_kb_doc_count} docs)")
    return _kb_index


def refresh_index_for_changes(added: list, removed: list, changed: list) -> dict[str, Any]:
    global _kb_doc_count, _kb_index_built_at
    ensure_settings_configured()
    from domain.rag.paths import base_dir
    base = base_dir()
    persist = _persist_dir()
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
        return await asyncio.to_thread(rebuild_index)


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
