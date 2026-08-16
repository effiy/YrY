"""Knowledge base endpoints — route layer.

Wraps ``domain.knowledge`` scanning + reading + watcher behind six flat POST
routes mirroring the file routes' style:
  - /knowledge-scan          → full or per-category tree with frontmatter (disk)
  - /knowledge-read          → single file body + parsed frontmatter
  - /knowledge-stories       → list story.md entries under engineer/learn/projects/
  - /knowledge-story-read    → read a specific story's story.md
  - /knowledge-sync          → trigger a full disk → DB reconciliation
  - /knowledge-files         → read metadata from DB mirror (no disk scan)
  - /knowledge-export        → zip a knowledge directory and stream the download
"""
import io
import logging
import os
import zipfile

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from domain.knowledge import (
    scan_knowledge,
    read_knowledge_file,
    list_stories,
    read_story_markdown,
    sync_knowledge_full,
    list_knowledge_files,
    write_entry_markdown,
    delete_entry_markdown,
)
from domain.knowledge.scanner import _resolve_safe
from models.schemas import (
    KnowledgeReadRequest,
    KnowledgeScanRequest,
    KnowledgeStoryReadRequest,
    KnowledgeStoriesRequest,
    KnowledgeFilesRequest,
    KnowledgeWriteRequest,
    KnowledgeDeleteRequest,
    KnowledgeSearchRequest,
    KnowledgeExportRequest,
)
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/knowledge-scan", operation_id="knowledge_scan")
async def knowledge_scan_route(request: KnowledgeScanRequest):
    data = scan_knowledge(category=request.category)
    return success(data=data)


@router.post("/knowledge-read", operation_id="knowledge_read")
async def knowledge_read_route(request: KnowledgeReadRequest):
    data = read_knowledge_file(request.target_file)
    return success(data=data)


@router.post("/knowledge-stories", operation_id="knowledge_stories")
async def knowledge_stories_route(request: KnowledgeStoriesRequest):
    data = list_stories(project=request.project)
    return success(data=data)


@router.post("/knowledge-story-read", operation_id="knowledge_story_read")
async def knowledge_story_read_route(request: KnowledgeStoryReadRequest):
    data = read_story_markdown(request.project, request.story_name)
    return success(data=data)


@router.post("/knowledge-sync", operation_id="knowledge_sync")
async def knowledge_sync_route():
    data = await sync_knowledge_full()
    # Best-effort RAG rebuild — failures must not fail the sync itself.
    try:
        from domain.rag import rebuild_index_async, rag_status
        await rebuild_index_async()
        data["rag"] = rag_status()
    except Exception as e:
        logger.warning(f"RAG rebuild after knowledge-sync failed: {e}", exc_info=True)
        data["rag"] = {"error": str(e)}
    return success(data=data)


@router.post("/knowledge-files", operation_id="knowledge_files")
async def knowledge_files_route(request: KnowledgeFilesRequest):
    data = await list_knowledge_files(category=request.category)
    return success(data=data)


@router.post("/knowledge-write", operation_id="knowledge_write")
async def knowledge_write_route(request: KnowledgeWriteRequest):
    """Write a markdown file to the YiKnowledge directory.

    Uses ``write_entry_markdown`` which generates YAML frontmatter from
    the optional ``metadata`` dict and then appends ``content`` as the
    markdown body. Idempotent — overwrites the file if it already exists.
    """
    meta = request.metadata or {}
    # Auto-set title from filename if not provided
    if "title" not in meta:
        filename = request.target_file.rsplit("/", 1)[-1]
        name_part = filename.rsplit(".", 1)[0] if "." in filename else filename
        meta["title"] = name_part.replace("-", " ").replace("_", " ").title()
    written_path = write_entry_markdown(
        rel_path=request.target_file,
        content=request.content,
        meta=meta,
    )
    # Best-effort: sync to MongoDB so the new file appears in scans/RAG
    try:
        await sync_knowledge_full()
    except Exception:
        pass
    return success(data={"path": written_path})

@router.post("/knowledge-delete", operation_id="knowledge_delete")
async def knowledge_delete_route(request: KnowledgeDeleteRequest):
    """Delete a knowledge markdown file from disk.

    Delegates to ``delete_entry_markdown`` which removes the file and
    returns True if it existed, False otherwise. A best-effort sync to
    MongoDB follows so the mirror stays in sync.
    """
    deleted = delete_entry_markdown(rel_path=request.target_file)
    # Best-effort: sync to MongoDB so the deletion is reflected in scans/RAG
    try:
        await sync_knowledge_full()
    except Exception:
        pass
    return success(data={"deleted": deleted})

@router.post("/knowledge-search", operation_id="knowledge_search")
async def knowledge_search_route(request: KnowledgeSearchRequest):
    """Search content within knowledge base markdown files."""
    import os
    import re
    from shared.config import settings

    base_dir = settings.knowledge_base_dir
    if not os.path.isdir(base_dir):
        return success(data={"results": [], "total": 0})

    query = request.query.lower()
    results = []

    for root, dirs, files in os.walk(base_dir):
        # Skip hidden dirs
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for fname in files:
            if not fname.endswith(".md"):
                continue
            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, base_dir)

            # Category filter
            if request.category:
                cat = rel_path.split("/")[0] if "/" in rel_path else "__root__"
                if cat != request.category:
                    continue

            try:
                with open(full_path, "r", encoding="utf-8") as fh:
                    content = fh.read()
            except Exception:
                continue

            if query not in content.lower():
                continue

            # Extract a snippet around the first match
            idx = content.lower().find(query)
            start = max(0, idx - 80)
            end = min(len(content), idx + len(query) + 120)
            snippet = content[start:end].replace("\n", " ").strip()
            if start > 0:
                snippet = "..." + snippet
            if end < len(content):
                snippet += "..."

            # Extract title from YAML frontmatter
            title = fname
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    fm = parts[1]
                    for line in fm.split("\n"):
                        if line.startswith("title:"):
                            title = line.split(":", 1)[1].strip().strip('"').strip("'")
                            break

            results.append({
                "path": rel_path,
                "title": title,
                "snippet": snippet,
                "size": os.path.getsize(full_path),
            })

            if len(results) >= request.max_results:
                break

        if len(results) >= request.max_results:
            break

    return success(data={"results": results, "total": len(results)})


@router.post("/knowledge-export", operation_id="knowledge_export")
async def knowledge_export_route(request: KnowledgeExportRequest):
    """Export a knowledge directory as a zip archive."""
    dir_path = _resolve_safe(request.target_dir)
    if not os.path.isdir(dir_path):
        from shared.error_codes import ErrorCode
        from shared.exceptions import BusinessException
        raise BusinessException(ErrorCode.KNOWLEDGE_FILE_NOT_FOUND, message="Directory not found")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dir_path):
            dirs[:] = [d for d in dirs if not d.startswith(".")]
            for fname in files:
                if fname.startswith("."):
                    continue
                full = os.path.join(root, fname)
                arcname = os.path.relpath(full, os.path.dirname(dir_path))
                zf.write(full, arcname)

    buf.seek(0)
    dir_name = request.target_dir.rstrip("/").split("/")[-1] or "export"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{dir_name}.zip"'},
    )
