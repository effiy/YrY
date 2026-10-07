"""Knowledge base endpoints — route layer.

Wraps ``domain.knowledge`` scanning + reading + watcher behind six flat POST
routes mirroring the file routes' style:
  - /knowledge-scan          → full or per-category tree with frontmatter (disk)
  - /knowledge-read          → single file body + parsed frontmatter
  - /knowledge-stories       → list story.md entries under engineer/learn/projects/
  - /knowledge-story-read    → read a specific story's story.md
  - /knowledge-bugs          → list bug markdowns under projects/*/bugs/{date}/{type}/
  - /knowledge-bug-read      → read a single bug's BugDocument + BugContent
  - /knowledge-sync          → trigger a full disk → DB reconciliation
  - /knowledge-files         → read metadata from DB mirror (no disk scan)
  - /knowledge-export        → zip a knowledge directory and stream the download
"""

import asyncio
import io
import logging
import os
from typing import Any
import zipfile

import aiofiles
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from domain.knowledge import (
    delete_entry_markdown,
    get_project_knowledge_stats,
    issue_stats,
    list_bugs,
    list_goals,
    list_issues,
    list_knowledge_files,
    list_stories,
    read_bug_markdown,
    read_knowledge_file,
    read_story_markdown,
    resolve_safe,
    scan_knowledge,
    sync_knowledge_full,
    write_entry_markdown,
)
from models.schemas import (
    KnowledgeBugReadRequest,
    KnowledgeBugsRequest,
    KnowledgeDeleteRequest,
    KnowledgeExportRequest,
    KnowledgeFilesRequest,
    KnowledgeGoalsRequest,
    KnowledgeIssuesRequest,
    KnowledgeIssuesStatsRequest,
    KnowledgeProjectsStatsRequest,
    KnowledgeReadRequest,
    KnowledgeScanRequest,
    KnowledgeSearchRequest,
    KnowledgeStoriesRequest,
    KnowledgeStoryReadRequest,
    KnowledgeWriteRequest,
)
from shared.cache import cache
from shared.cache_keys import CACHE_TTL
from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/knowledge-scan", operation_id="knowledge_scan")
async def knowledge_scan_route(request: KnowledgeScanRequest):
    cache_key = f"knowledge:scan:{request.category or 'all'}"

    async def _factory():
        return await asyncio.to_thread(scan_knowledge, category=request.category)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:scan"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:scan"])


@router.post("/knowledge-read", operation_id="knowledge_read")
async def knowledge_read_route(request: KnowledgeReadRequest):
    data = await asyncio.to_thread(read_knowledge_file, request.target_file)
    return success(data=data, cache_ttl=30)


@router.post("/knowledge-stories", operation_id="knowledge_stories")
async def knowledge_stories_route(request: KnowledgeStoriesRequest):
    cache_key = f"knowledge:stories:{request.project or 'all'}"

    async def _factory():
        return await asyncio.to_thread(list_stories, project=request.project)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:scan"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:scan"])


@router.post("/knowledge-story-read", operation_id="knowledge_story_read")
async def knowledge_story_read_route(request: KnowledgeStoryReadRequest):
    data = await asyncio.to_thread(read_story_markdown, request.project, request.story_name)
    return success(data=data, cache_ttl=30)


@router.post("/knowledge-bugs", operation_id="knowledge_bugs")
async def knowledge_bugs_route(request: KnowledgeBugsRequest):
    cache_key = f"knowledge:bugs:{request.project or 'all'}"

    async def _factory():
        return await asyncio.to_thread(list_bugs, project=request.project)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:scan"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:scan"])


@router.post("/knowledge-bug-read", operation_id="knowledge_bug_read")
async def knowledge_bug_read_route(request: KnowledgeBugReadRequest):
    data = await asyncio.to_thread(read_bug_markdown, request.content_path)
    return success(data=data, cache_ttl=30)


@router.post("/knowledge-issues", operation_id="knowledge_issues")
async def knowledge_issues_route(request: KnowledgeIssuesRequest):
    """Return YiKnowledge project files (bugs/devs/prds/tests/requires) as Issue records.

    Queries the knowledge_files DB mirror (kept real-time by the watcher) for
    fast, accurate metadata without disk I/O. Skips template directories.
    Results cached for 30s.
    """
    cache_key = (
        f"knowledge:issues:{request.project or 'all'}:{request.issue_type or 'all'}:"
        f"{request.status or 'all'}:{request.priority or 'all'}:"
        f"{request.search or 'none'}:{request.pageNum}:{request.pageSize}"
    )

    async def _factory():
        return await list_issues(
            project=request.project,
            issue_type=request.issue_type,
            status=request.status,
            priority=request.priority,
            search=request.search,
            page_num=request.pageNum,
            page_size=request.pageSize,
        )

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:issues"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:issues"])


@router.post("/knowledge-issues-stats", operation_id="knowledge_issues_stats")
async def knowledge_issues_stats_route(request: KnowledgeIssuesStatsRequest):
    """Return pre-aggregated stats for the issue list.

    Same filters as /knowledge-issues but returns distributions, completeness
    scores, and attention flags instead of paginated records. Cached for 30s.
    """
    cache_key = (
        f"knowledge:issues-stats:{request.project or 'all'}:{request.issue_type or 'all'}:"
        f"{request.status or 'all'}:{request.priority or 'all'}:{request.search or 'none'}"
    )

    async def _factory():
        return await issue_stats(
            project=request.project,
            issue_type=request.issue_type,
            status=request.status,
            priority=request.priority,
            search=request.search,
        )

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:issues-stats"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:issues-stats"])


@router.post("/knowledge-projects-stats", operation_id="knowledge_projects_stats")
async def knowledge_projects_stats_route(request: KnowledgeProjectsStatsRequest):
    """Count .md files per project under YiKnowledge/projects/.

    Returns ``{ projects: { project_key: { category: count } } }``
    for each project's subdirectories (okrs/prds/devs/tests/bugs/workflows/requires).
    Template directories (``/模板/``) are excluded from counts.
    """
    cache_key = f"knowledge:projects-stats:{request.project or 'all'}"

    async def _factory():
        return await asyncio.to_thread(get_project_knowledge_stats, project=request.project)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:projects-stats"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:projects-stats"])


@router.post("/knowledge-goals", operation_id="knowledge_goals")
async def knowledge_goals_route(request: KnowledgeGoalsRequest):
    """Return live OKR goals with progress derived from knowledge_files.

    Queries the knowledge_files DB mirror for OKR goal and KR-evidence files,
    reading frontmatter ``progress`` fields to compute accurate, timely goal
    progress. Results cached for 30s (aligned with watcher poll interval).
    """
    cache_key = f"knowledge:goals:{request.year or 'current'}:{request.period or 'all'}"

    async def _factory():
        return await list_goals(year=request.year, period=request.period)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:goals"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:goals"])


@router.post("/knowledge-sync", operation_id="knowledge_sync")
async def knowledge_sync_route():
    data = await sync_knowledge_full()
    # Best-effort RAG rebuild — failures must not fail the sync itself.
    try:
        from domain.rag import rag_status, rebuild_index_async

        await rebuild_index_async()
        data["rag"] = rag_status()
    except Exception as e:
        logger.warning(f"RAG rebuild after knowledge-sync failed: {e}", exc_info=True)
        data["rag"] = {"error": str(e)}
    # Invalidate all knowledge caches after sync
    await cache.delete_pattern("knowledge:*")
    await cache.delete("rag:categories")
    await cache.delete("rag:status")
    return success(data=data)


@router.post("/knowledge-files", operation_id="knowledge_files")
async def knowledge_files_route(request: KnowledgeFilesRequest):
    cache_key = f"knowledge:files:{request.category or 'all'}:{request.page}:{request.page_size}"

    async def _factory():
        return await list_knowledge_files(category=request.category, page=request.page, page_size=request.page_size)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:files"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:files"])


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
        logger.debug("Knowledge sync failed during write operation", exc_info=True)
    await cache.delete_pattern("knowledge:*")
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
        logger.debug("Knowledge sync failed during delete operation", exc_info=True)
    await cache.delete_pattern("knowledge:*")
    return success(data={"deleted": deleted})


@router.post("/knowledge-search", operation_id="knowledge_search")
async def knowledge_search_route(request: KnowledgeSearchRequest):
    """Search content within knowledge base markdown files.

    Results are cached by (query, category) with a 60s TTL to avoid
    repeated full-disk scans for the same search terms.
    """
    import hashlib
    import os

    from shared.config import settings

    query = request.query.strip().lower()
    if not query:
        return success(data={"results": [], "total": 0})

    cat = request.category or "all"
    cache_key = f"knowledge:search:{hashlib.md5(f'{query}:{cat}'.encode()).hexdigest()[:16]}"

    async def _do_search():
        base_dir = settings.knowledge_base_dir
        results = []

        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if not d.startswith(".")]
            for fname in files:
                if not fname.endswith(".md"):
                    continue
                full_path = os.path.join(root, fname)
                rel_path = os.path.relpath(full_path, base_dir)

                if request.category:
                    cat = rel_path.split("/")[0] if "/" in rel_path else "__root__"
                    if cat != request.category:
                        continue

                try:
                    async with aiofiles.open(full_path, encoding="utf-8") as fh:
                        content = await fh.read()
                except (OSError, UnicodeDecodeError):
                    logger.debug("Failed to read file during search, skipping", exc_info=True)
                    continue

                if query not in content.lower():
                    continue

                idx = content.lower().find(query)
                start = max(0, idx - 80)
                end = min(len(content), idx + len(query) + 120)
                snippet = content[start:end].replace("\n", " ").strip()
                if start > 0:
                    snippet = "..." + snippet
                if end < len(content):
                    snippet += "..."

                title = fname
                if content.startswith("---"):
                    parts = content.split("---", 2)
                    if len(parts) >= 3:
                        fm = parts[1]
                        for line in fm.split("\n"):
                            if line.startswith("title:"):
                                title = line.split(":", 1)[1].strip().strip('"').strip("'")
                                break

                results.append(
                    {
                        "path": rel_path,
                        "title": title,
                        "snippet": snippet,
                        "size": os.path.getsize(full_path),
                    }
                )

                if len(results) >= request.max_results:
                    break

            if len(results) >= request.max_results:
                break

        return {"results": results, "total": len(results)}

    data = await cache.get_or_set(cache_key, _do_search, ttl=60)
    return success(data=data)


@router.post("/knowledge-orphaned-issues", operation_id="knowledge_orphaned_issues")
async def knowledge_orphaned_issues_route():
    """Detect issues in MongoDB that lack a corresponding YiKnowledge file.

    Queries the ``issues`` collection and checks whether each issue's
    ``kb_file_path`` points to an existing file on disk. Returns the list
    of orphaned issue keys with their titles and (missing) file paths.
    """
    from data.database import db
    from data.helpers import _validate_collection_name

    await db.initialize()
    collection = db.db[_validate_collection_name("issues")]
    base_dir = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))

    orphaned: list[dict[str, Any]] = []
    async for doc in collection.find({}):
        kb_path = (doc.get("kb_file_path") or "").strip()
        if not kb_path:
            orphaned.append(
                {
                    "key": doc.get("key", ""),
                    "title": doc.get("title", ""),
                    "kb_file_path": "",
                    "reason": "no_kb_file_path",
                }
            )
            continue
        full_path = os.path.join(base_dir, kb_path)
        if not os.path.isfile(full_path):
            orphaned.append(
                {
                    "key": doc.get("key", ""),
                    "title": doc.get("title", ""),
                    "kb_file_path": kb_path,
                    "reason": "file_not_found",
                }
            )

    return success(data={"orphaned": orphaned, "count": len(orphaned)})


@router.post("/knowledge-cleanup-orphaned", operation_id="knowledge_cleanup_orphaned")
async def knowledge_cleanup_orphaned_route():
    """Delete issues from MongoDB that lack a corresponding YiKnowledge file.

    Performs the same check as ``/knowledge-orphaned-issues`` and deletes
    matching documents from the ``issues`` collection. Returns the count
    of deleted documents.
    """
    from data.database import db
    from data.helpers import _validate_collection_name

    await db.initialize()
    collection = db.db[_validate_collection_name("issues")]
    base_dir = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))

    to_delete: list[str] = []
    async for doc in collection.find({}):
        kb_path = (doc.get("kb_file_path") or "").strip()
        key = doc.get("key", "")
        if not kb_path:
            to_delete.append(key)
            continue
        full_path = os.path.join(base_dir, kb_path)
        if not os.path.isfile(full_path):
            to_delete.append(key)

    deleted = 0
    for key in to_delete:
        result = await collection.delete_one({"key": key})
        deleted += result.deleted_count

    logger.info(f"Cleaned up {deleted} orphaned issues from MongoDB")
    return success(data={"deleted": deleted})


@router.post("/knowledge-export", operation_id="knowledge_export")
async def knowledge_export_route(request: KnowledgeExportRequest):
    """Export a knowledge directory as a zip archive."""
    dir_path = resolve_safe(request.target_dir)
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
