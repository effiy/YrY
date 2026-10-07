"""Single-file index building and category scanning."""

from __future__ import annotations

import logging
import os
import re
import time
from typing import Any

import yaml

from domain.rag.kb_indexer import _extract_frontmatter
from domain.rag.settings import ensure_settings_configured
from shared.config import settings

logger = logging.getLogger(__name__)

_last_categories_scan: float | None = None
_cached_categories: dict[str, Any] | None = None


def build_file_index(abs_path: str) -> Any:
    from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
    ensure_settings_configured()
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(f"Not a file: {abs_path}")
    parent = os.path.dirname(abs_path)
    fname = os.path.basename(abs_path)
    reader = SimpleDirectoryReader(
        input_dir=parent, required_exts=[os.path.splitext(fname)[1] or ".md"], recursive=False,
    )
    docs = [d for d in reader.load_data() if os.path.basename(d.metadata.get("file_path", "")) == fname]
    if not docs:
        docs = reader.load_data()
    for d in docs:
        _extract_frontmatter(d)
    return VectorStoreIndex.from_documents(docs, show_progress=False)


def rag_categories() -> dict[str, Any]:
    global _last_categories_scan, _cached_categories

    now = time.time()
    if _last_categories_scan is not None and now - _last_categories_scan < 60:
        return _cached_categories or {"categories": [], "tags": {}, "total_files": 0}

    base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
    cats: list = []
    tag_counts: dict = {}
    total_files = 0

    if os.path.isdir(base):
        for entry in sorted(os.listdir(base)):
            full = os.path.join(base, entry)
            if os.path.isdir(full) and not entry.startswith("."):
                file_count = sum(
                    1 for _root, _dirs, files in os.walk(full)
                    for f in files if f.endswith(".md") and not f.startswith(".")
                )
                cats.append({"name": entry, "file_count": file_count})

        frontmatter_re = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
        for cat in cats[:8]:
            cat_dir = os.path.join(base, cat["name"])
            sampled = 0
            for root, _dirs, files in os.walk(cat_dir):
                for f in files:
                    if not f.endswith(".md") or sampled >= 50:
                        break
                    try:
                        with open(os.path.join(root, f)) as fh:
                            content = fh.read(4096)
                        m = frontmatter_re.match(content)
                        if m:
                            fm = yaml.safe_load(m.group(1)) or {}
                            tags = fm.get("tags") or []
                            if isinstance(tags, str):
                                tags = [t.strip() for t in tags.split(",")]
                            for t in tags:
                                t = str(t).strip().lower()
                                if t:
                                    tag_counts[t] = tag_counts.get(t, 0) + 1
                    except Exception:
                        logger.debug("Failed to parse tag", exc_info=True)
                    sampled += 1

        total_files = sum(c["file_count"] for c in cats)

    result = {
        "categories": cats,
        "tags": dict(sorted(tag_counts.items(), key=lambda x: -x[1])[:50]),
        "total_files": total_files,
    }
    _cached_categories = result
    _last_categories_scan = now
    return result
