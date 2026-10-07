"""Code health analysis — main entrypoint."""

import logging
from pathlib import Path
import time
from typing import Any

from data.database import db
from shared.config import settings

from .alerts import _generate_alerts
from .constants import (
    CACHE_COLLECTION,
    CACHE_TTL_SECONDS,
    DEFAULT_COMMENT_RATE_DANGER,
    DEFAULT_COMMENT_RATE_WARN,
    DEFAULT_DUPLICATE_MIN_LINES,
    DEFAULT_DUPLICATE_RATE_DANGER,
    DEFAULT_DUPLICATE_RATE_WARN,
    DEFAULT_EXTENSIONS,
    DEFAULT_MAX_FILE_DANGER,
    DEFAULT_MAX_FILE_WARN,
    DEFAULT_REUSE_RATE_DANGER,
    DEFAULT_REUSE_RATE_WARN,
)
from .duplication import _detect_duplicates
from .line_counter import _collect_files, _count_lines
from .vue_analyzer import _analyze_vue_reuse

logger = logging.getLogger(__name__)


async def analyze(parameters: dict[str, Any]) -> dict[str, Any]:
    project_key = parameters.get("project_key", "")
    target_subdir = parameters.get("target_dir", "src")
    extensions = set(parameters.get("file_extensions", DEFAULT_EXTENSIONS))
    dup_min_lines = parameters.get("duplicate_min_lines", DEFAULT_DUPLICATE_MIN_LINES)
    max_file_warn = parameters.get("max_file_lines_warn", DEFAULT_MAX_FILE_WARN)
    max_file_danger = parameters.get("max_file_lines_danger", DEFAULT_MAX_FILE_DANGER)

    if not project_key:
        return {"error": "project_key is required"}

    cache_key = f"{project_key}:{target_subdir}"
    try:
        cached = await db.db[CACHE_COLLECTION].find_one({"key": cache_key})
        if cached and (time.time() - cached.get("timestamp", 0)) < CACHE_TTL_SECONDS:
            logger.info(f"Code health cache hit for {cache_key}")
            return cached["data"]
    except Exception:
        logger.debug("Code health cache miss or MongoDB unavailable", exc_info=True)

    projects_root = Path(settings.projects_root).resolve()
    project_dir = None
    for candidate in projects_root.iterdir():
        if candidate.is_dir() and candidate.name.lower() == project_key.lower():
            project_dir = candidate
            break
    if project_dir is None:
        return {"error": f"Project directory not found for key: {project_key}"}

    target_dir = project_dir / target_subdir
    if not target_dir.exists():
        return {"error": f"Target directory not found: {target_dir}"}

    logger.info(f"Analyzing code health for {project_key} at {target_dir}")

    all_files = _collect_files(target_dir, extensions)
    if not all_files:
        return {"error": f"No source files found in {target_dir}"}

    file_stats: list[dict[str, Any]] = []
    total_lines = total_comment = total_blank = total_code = 0
    for fpath in all_files:
        counts = _count_lines(fpath)
        rel_path = str(fpath.relative_to(project_dir))
        file_stats.append({"path": rel_path, "total_lines": counts["total"], "code_lines": counts["code"]})
        total_lines += counts["total"]
        total_comment += counts["comment"]
        total_blank += counts["blank"]
        total_code += counts["code"]

    file_stats.sort(key=lambda x: x["total_lines"], reverse=True)
    max_file = file_stats[0] if file_stats else {"path": "", "total_lines": 0, "code_lines": 0}

    scale = {
        "total_lines": total_lines, "file_count": len(all_files),
        "max_file": {"path": max_file["path"], "lines": max_file["total_lines"]},
        "avg_lines": round(total_lines / max(len(all_files), 1), 1),
        "top_files": file_stats[:10],
    }
    density = {
        "comment_lines": total_comment, "blank_lines": total_blank, "code_lines": total_code,
        "comment_rate": round(total_comment / max(total_lines, 1), 3),
        "blank_rate": round(total_blank / max(total_lines, 1), 3),
    }
    reuse = _analyze_vue_reuse(all_files, project_dir)
    dup_result = _detect_duplicates(all_files, dup_min_lines, project_dir)
    duplication = {
        "duplicate_blocks": dup_result["duplicate_blocks"],
        "duplicate_lines": dup_result["duplicate_lines"],
        "duplicate_rate": round(dup_result["duplicate_lines"] / max(total_lines, 1), 3),
        "max_block_size": dup_result["max_block_size"],
        "top_duplicates": dup_result["top_duplicates"],
    }
    alerts = _generate_alerts(
        scale, density, reuse, duplication,
        max_file_warn, max_file_danger,
        DEFAULT_COMMENT_RATE_WARN, DEFAULT_COMMENT_RATE_DANGER,
        DEFAULT_REUSE_RATE_WARN, DEFAULT_REUSE_RATE_DANGER,
        DEFAULT_DUPLICATE_RATE_WARN, DEFAULT_DUPLICATE_RATE_DANGER,
    )

    report = {
        "scale": scale, "density": density, "reuse": reuse, "duplication": duplication,
        "alerts": alerts, "analyzed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "project_key": project_key, "target_dir": str(target_dir.relative_to(project_dir)),
    }

    try:
        await db.db[CACHE_COLLECTION].replace_one(
            {"key": cache_key}, {"key": cache_key, "data": report, "timestamp": time.time()}, upsert=True,
        )
    except Exception as e:
        logger.warning(f"Failed to cache code health result: {e}")

    return report
