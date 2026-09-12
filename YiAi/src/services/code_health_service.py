"""
Code Health Analysis Service — analyzes project source code for health metrics.

Provides file-scale analysis, code density, component reuse (Vue SFC),
and code duplication detection with configurable thresholds.

RPC entry: services.code_health_service.analyze
"""
import hashlib
import logging
import os
import re
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────

CACHE_COLLECTION = "code_health_cache"
CACHE_TTL_SECONDS = 3600  # 1 hour

DEFAULT_EXTENSIONS = {".vue", ".ts", ".tsx", ".js", ".jsx", ".scss", ".css", ".py"}
DEFAULT_DUPLICATE_MIN_LINES = 6
DEFAULT_MAX_FILE_WARN = 300
DEFAULT_MAX_FILE_DANGER = 600
DEFAULT_COMMENT_RATE_WARN = 0.10
DEFAULT_COMMENT_RATE_DANGER = 0.05
DEFAULT_REUSE_RATE_WARN = 2.0
DEFAULT_REUSE_RATE_DANGER = 1.0
DEFAULT_DUPLICATE_RATE_WARN = 0.05
DEFAULT_DUPLICATE_RATE_DANGER = 0.15

# Comment patterns per language
_COMMENT_PATTERNS: dict[str, list[tuple[str, str | None]]] = {
    ".vue": [("//", None), ("/*", "*/"), ("<!--", "-->")],
    ".ts": [("//", None), ("/*", "*/")],
    ".tsx": [("//", None), ("/*", "*/"), ("<!--", "-->")],
    ".js": [("//", None), ("/*", "*/")],
    ".jsx": [("//", None), ("/*", "*/")],
    ".scss": [("//", None), ("/*", "*/")],
    ".css": [("/*", "*/")],
    ".py": [("#", None), ('"""', '"""'), ("'''", "'''")],
}

# Vue SFC import patterns
_VUE_IMPORT_RE = re.compile(
    r"""import\s+(?:(?:\{[^}]*\}|[\w*]+)\s*,?\s*)*\s*"""
    r"""from\s+['"]([^'"]+\.vue)['"]""",
    re.MULTILINE,
)
_VUE_COMPONENT_RE = re.compile(
    r"""import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]""",
    re.MULTILINE,
)


# ── Helpers ──────────────────────────────────────────────────────────────────


def _norm_line(line: str) -> str:
    """Normalize a line for duplicate detection."""
    return line.strip()


def _is_blank(line: str) -> bool:
    return not line.strip()


def _is_comment(line: str, ext: str, in_block_comment: bool) -> tuple[bool, bool]:
    """Check if a line is a comment. Returns (is_comment, still_in_block)."""
    stripped = line.strip()
    patterns = _COMMENT_PATTERNS.get(ext, [("//", None), ("/*", "*/")])

    if in_block_comment:
        for _open, close in patterns:
            if close and close in stripped:
                return True, False
        return True, True

    for _open, close in patterns:
        if close is not None:
            if stripped.startswith(_open) and stripped.endswith(close):
                return True, False
            if stripped.startswith(_open):
                return True, True
        elif stripped.startswith(_open):
            return True, False

    # inline block comments
    for _open, close in patterns:
        if close and _open in stripped and stripped.index(_open) < len(stripped) - len(_open):
            return True, False

    return False, False


def _count_lines(path: Path) -> dict[str, int]:
    """Count total, comment, blank, and code lines in a file."""
    ext = path.suffix.lower()
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return {"total": 0, "comment": 0, "blank": 0, "code": 0}

    lines = content.split("\n")
    total = len(lines)
    comment = 0
    blank = 0
    in_block = False

    for line in lines:
        if _is_blank(line):
            blank += 1
            continue
        is_c, in_block = _is_comment(line, ext, in_block)
        if is_c:
            comment += 1

    code = total - comment - blank
    return {"total": total, "comment": comment, "blank": blank, "code": code}


def _collect_files(target_dir: Path, extensions: set[str]) -> list[Path]:
    """Recursively collect source files with given extensions, skipping node_modules and .git."""
    files: list[Path] = []
    if not target_dir.exists():
        return files
    for root, dirs, filenames in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "dist", ".turbo", "__pycache__", ".venv")]
        for fname in filenames:
            p = Path(root) / fname
            if p.suffix.lower() in extensions:
                files.append(p)
    return files


def _detect_duplicates(files: list[Path], min_lines: int, project_dir: Path) -> dict[str, Any]:
    """Detect duplicate code blocks using sliding-window + hash, then merge adjacent blocks."""
    # Map: (file, start_line) -> hash
    file_hashes: dict[tuple[str, int], str] = {}
    # Map: hash -> list of (file, start_line)
    hash_to_locations: dict[str, list[tuple[str, int]]] = defaultdict(list)

    for fpath in files:
        try:
            raw = fpath.read_text(encoding="utf-8", errors="replace")
        except Exception:
            logger.debug("Failed to read file for duplicate detection, skipping", exc_info=True)
            continue
        lines = raw.split("\n")
        for i in range(len(lines) - min_lines + 1):
            window = lines[i : i + min_lines]
            non_blank = sum(1 for line in window if line.strip())
            if non_blank < min_lines * 0.5:
                continue
            normalized = "\n".join(_norm_line(line) for line in window)
            h = hashlib.sha256(normalized.encode()).hexdigest()
            loc = (str(fpath.relative_to(project_dir)), i + 1)
            file_hashes[loc] = h
            hash_to_locations[h].append(loc)

    # Find hashes that appear in at least 2 different files
    cross_file_hashes: set[str] = set()
    for h, locs in hash_to_locations.items():
        unique_files = {f for f, _ in locs}
        if len(unique_files) >= 2:
            cross_file_hashes.add(h)

    # For each file, find consecutive lines with cross-file hashes and merge them
    # Group by file
    file_matches: dict[str, list[int]] = defaultdict(list)
    for (fname, start), h in file_hashes.items():
        if h in cross_file_hashes:
            file_matches[fname].append(start)
    for fname in file_matches:
        file_matches[fname].sort()

    # Merge consecutive start lines into blocks
    merged_blocks: list[dict[str, Any]] = []
    for fname, starts in file_matches.items():
        if not starts:
            continue
        block_start = starts[0]
        block_end = block_start + min_lines
        for i in range(1, len(starts)):
            if starts[i] <= block_end:  # overlapping or adjacent
                block_end = max(block_end, starts[i] + min_lines)
            else:
                merged_blocks.append({"file": fname, "start": block_start, "end": block_end})
                block_start = starts[i]
                block_end = block_start + min_lines
        merged_blocks.append({"file": fname, "start": block_start, "end": block_end})

    # Group blocks by (start, end) to find cross-file duplicates
    blocks_by_span: dict[tuple[int, int], list[str]] = defaultdict(list)
    for b in merged_blocks:
        span = (b["start"], b["end"])
        if b["file"] not in blocks_by_span[span]:
            blocks_by_span[span].append(b["file"])

    # Build result
    duplicate_blocks: list[dict[str, Any]] = []
    total_dup_lines = 0
    max_block = 0
    seen_pairs: set[tuple[str, str, int, int]] = set()

    for (start, end), file_list in blocks_by_span.items():
        block_lines = end - start
        if len(file_list) < 2:
            continue
        for i in range(len(file_list)):
            for j in range(i + 1, len(file_list)):
                pair = (file_list[i], file_list[j], start, end)
                if pair in seen_pairs:
                    continue
                seen_pairs.add(pair)
                duplicate_blocks.append({
                    "lines": block_lines,
                    "files": [file_list[i], file_list[j]],
                    "snippet": _read_snippet(file_list[i], project_dir, start, end),
                })
                total_dup_lines += block_lines
                max_block = max(max_block, block_lines)

    # Sort by block size descending
    duplicate_blocks.sort(key=lambda x: x["lines"], reverse=True)

    return {
        "duplicate_blocks": len(duplicate_blocks),
        "duplicate_lines": total_dup_lines,
        "max_block_size": max_block,
        "top_duplicates": duplicate_blocks[:10],
    }


def _read_snippet(file_path: str, project_dir: Path, start: int, end: int) -> str:
    """Read a snippet of lines from a file."""
    try:
        content = (project_dir / file_path).read_text(encoding="utf-8", errors="replace")
        lines = content.split("\n")
        snippet = lines[start - 1 : end - 1]
        return "\n".join(snippet)[:200]
    except Exception:
        return ""


def _analyze_vue_reuse(files: list[Path], project_dir: Path) -> dict[str, Any]:
    """Analyze Vue SFC component reuse."""
    vue_files = [f for f in files if f.suffix.lower() == ".vue"]
    if not vue_files:
        return {
            "component_defs": 0,
            "component_usages": 0,
            "reuse_rate": 0,
            "unused_components": [],
        }

    # Collect all component definitions
    component_names: set[str] = set()
    component_paths: dict[str, str] = {}
    for vf in vue_files:
        name = vf.stem  # PascalCase filename
        component_names.add(name)
        component_paths[name] = str(vf.relative_to(project_dir))

    # Collect all component imports
    usage_counts: dict[str, int] = defaultdict(int)
    all_imported: set[str] = set()

    for fpath in files:
        if fpath.suffix.lower() not in (".vue", ".ts", ".tsx", ".js", ".jsx"):
            continue
        try:
            content = fpath.read_text(encoding="utf-8", errors="replace")
        except Exception:
            logger.debug("Failed to read file for component analysis, skipping", exc_info=True)
            continue
        for m in _VUE_COMPONENT_RE.finditer(content):
            imported_name = m.group(1)
            all_imported.add(imported_name)
            usage_counts[imported_name] += 1
        unused = component_names - all_imported

    return {
        "component_defs": len(component_names),
        "component_usages": sum(usage_counts.get(n, 0) for n in component_names),
        "reuse_rate": round(sum(usage_counts.get(n, 0) for n in component_names) / max(len(component_names), 1), 2),
        "unused_components": [
            {"path": component_paths[n], "lines": _count_lines(project_dir / component_paths[n])["total"]}
            for n in sorted(unused)
        ],
    }


def _generate_alerts(
    scale: dict, density: dict, reuse: dict, duplication: dict,
    max_file_warn: int, max_file_danger: int,
    comment_rate_warn: float, comment_rate_danger: float,
    reuse_rate_warn: float, reuse_rate_danger: float,
    dup_rate_warn: float, dup_rate_danger: float,
) -> list[dict[str, Any]]:
    """Generate human-readable alerts from metric thresholds."""
    alerts: list[dict[str, Any]] = []

    # Max file lines
    if scale["max_file"]["lines"] > max_file_danger:
        msg = f"{scale['max_file']['path']} {scale['max_file']['lines']} 行，超过 {max_file_danger} 行危险阈值"
        alerts.append({"level": "danger", "metric": "max_file_lines", "message": msg, "suggestion": "建议拆分为多个子组件或模块", "file": scale["max_file"]["path"]})
    elif scale["max_file"]["lines"] > max_file_warn:
        msg = f"{scale['max_file']['path']} {scale['max_file']['lines']} 行，超过 {max_file_warn} 行警告阈值"
        alerts.append({"level": "warn", "metric": "max_file_lines", "message": msg, "suggestion": "考虑拆分为多个子组件或模块", "file": scale["max_file"]["path"]})

    # Comment rate
    if density["comment_rate"] < comment_rate_danger:
        msg = f"注释率 {density['comment_rate']:.1%}，低于 {comment_rate_danger:.0%} 危险阈值"
        alerts.append({"level": "danger", "metric": "comment_rate", "message": msg, "suggestion": "建议为核心模块补充文档注释", "file": None})
    elif density["comment_rate"] < comment_rate_warn:
        msg = f"注释率 {density['comment_rate']:.1%}，低于 {comment_rate_warn:.0%} 警告阈值"
        alerts.append({"level": "warn", "metric": "comment_rate", "message": msg, "suggestion": "建议为核心模块补充文档注释", "file": None})

    # Reuse rate (only for Vue projects)
    if reuse["component_defs"] > 0:
        if reuse["reuse_rate"] < reuse_rate_danger:
            msg = f"组件复用率 {reuse['reuse_rate']:.1f}x，低于 {reuse_rate_danger:.0f}x 危险阈值"
            alerts.append({"level": "danger", "metric": "reuse_rate", "message": msg, "suggestion": "提取公共逻辑为可复用组件", "file": None})
        elif reuse["reuse_rate"] < reuse_rate_warn:
            msg = f"组件复用率 {reuse['reuse_rate']:.1f}x，低于 {reuse_rate_warn:.0f}x 警告阈值"
            alerts.append({"level": "warn", "metric": "reuse_rate", "message": msg, "suggestion": "检查是否有可提取的公共组件", "file": None})

        if len(reuse["unused_components"]) > 3:
            msg = f"{len(reuse['unused_components'])} 个组件未被使用"
            alerts.append({"level": "warn", "metric": "unused_components", "message": msg, "suggestion": "检查是否为废弃组件，可考虑删除以减少维护成本", "file": None})
        elif 0 < len(reuse["unused_components"]) <= 3:
            names = ", ".join(c["path"].split("/")[-1] for c in reuse["unused_components"])
            msg = f"未使用组件: {names}"
            alerts.append({"level": "warn", "metric": "unused_components", "message": msg, "suggestion": "检查是否为废弃组件，可考虑删除", "file": None})

    # Duplication rate
    if duplication["duplicate_rate"] > dup_rate_danger:
        msg = f"代码重复率 {duplication['duplicate_rate']:.1%}，超过 {dup_rate_danger:.0%} 危险阈值（{duplication['duplicate_blocks']} 个重复块）"
        alerts.append({"level": "danger", "metric": "duplicate_rate", "message": msg, "suggestion": "提取重复代码为公共函数或组件，降低维护成本", "file": None})
    elif duplication["duplicate_rate"] > dup_rate_warn:
        msg = f"代码重复率 {duplication['duplicate_rate']:.1%}，超过 {dup_rate_warn:.0%} 警告阈值（{duplication['duplicate_blocks']} 个重复块）"
        alerts.append({"level": "warn", "metric": "duplicate_rate", "message": msg, "suggestion": "关注重复代码，考虑提取公共逻辑", "file": None})

    return alerts


# ── Main Service ─────────────────────────────────────────────────────────────


async def analyze(parameters: dict[str, Any]) -> dict[str, Any]:
    """
    Analyze project source code health metrics.

    Parameters:
        project_key: str — project identifier (e.g. "PLANE")
        target_dir: str | None — relative path within project, defaults to "src"
        file_extensions: list[str] | None — file extensions to analyze
        duplicate_min_lines: int | None — minimum lines for duplicate detection (default 6)
        max_file_lines_warn: int | None — large file warning threshold (default 300)
        max_file_lines_danger: int | None — large file danger threshold (default 600)

    Returns:
        CodeHealthReport with scale, density, reuse, duplication, and alerts.
    """
    project_key = parameters.get("project_key", "")
    target_subdir = parameters.get("target_dir", "src")
    extensions = set(parameters.get("file_extensions", DEFAULT_EXTENSIONS))
    dup_min_lines = parameters.get("duplicate_min_lines", DEFAULT_DUPLICATE_MIN_LINES)
    max_file_warn = parameters.get("max_file_lines_warn", DEFAULT_MAX_FILE_WARN)
    max_file_danger = parameters.get("max_file_lines_danger", DEFAULT_MAX_FILE_DANGER)

    if not project_key:
        return {"error": "project_key is required"}

    # ── Check cache ──
    cache_key = f"{project_key}:{target_subdir}"
    try:
        cached = await db.db[CACHE_COLLECTION].find_one({"key": cache_key})
        if cached and (time.time() - cached.get("timestamp", 0)) < CACHE_TTL_SECONDS:
            logger.info(f"Code health cache hit for {cache_key}")
            return cached["data"]
    except Exception:
        logger.debug("Code health cache miss or MongoDB unavailable", exc_info=True)

    # ── Resolve project directory ──
    projects_root = Path(settings.projects_root).resolve()

    # Try to find the project directory by project_key
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

    # ── Collect files ──
    all_files = _collect_files(target_dir, extensions)
    if not all_files:
        return {"error": f"No source files found in {target_dir}"}

    # ── Analyze scale ──
    file_stats: list[dict[str, Any]] = []
    total_lines = 0
    total_comment = 0
    total_blank = 0
    total_code = 0

    for fpath in all_files:
        counts = _count_lines(fpath)
        rel_path = str(fpath.relative_to(project_dir))
        file_stats.append({
            "path": rel_path,
            "total_lines": counts["total"],
            "code_lines": counts["code"],
        })
        total_lines += counts["total"]
        total_comment += counts["comment"]
        total_blank += counts["blank"]
        total_code += counts["code"]

    file_stats.sort(key=lambda x: x["total_lines"], reverse=True)
    max_file = file_stats[0] if file_stats else {"path": "", "total_lines": 0, "code_lines": 0}

    scale = {
        "total_lines": total_lines,
        "file_count": len(all_files),
        "max_file": {"path": max_file["path"], "lines": max_file["total_lines"]},
        "avg_lines": round(total_lines / max(len(all_files), 1), 1),
        "top_files": file_stats[:10],
    }

    # ── Analyze density ──
    density = {
        "comment_lines": total_comment,
        "blank_lines": total_blank,
        "code_lines": total_code,
        "comment_rate": round(total_comment / max(total_lines, 1), 3),
        "blank_rate": round(total_blank / max(total_lines, 1), 3),
    }

    # ── Analyze reuse (Vue projects only) ──
    reuse = _analyze_vue_reuse(all_files, project_dir)

    # ── Detect duplicates ──
    dup_result = _detect_duplicates(all_files, dup_min_lines, project_dir)
    duplication = {
        "duplicate_blocks": dup_result["duplicate_blocks"],
        "duplicate_lines": dup_result["duplicate_lines"],
        "duplicate_rate": round(dup_result["duplicate_lines"] / max(total_lines, 1), 3),
        "max_block_size": dup_result["max_block_size"],
        "top_duplicates": dup_result["top_duplicates"],
    }

    # ── Generate alerts ──
    alerts = _generate_alerts(
        scale, density, reuse, duplication,
        max_file_warn, max_file_danger,
        DEFAULT_COMMENT_RATE_WARN, DEFAULT_COMMENT_RATE_DANGER,
        DEFAULT_REUSE_RATE_WARN, DEFAULT_REUSE_RATE_DANGER,
        DEFAULT_DUPLICATE_RATE_WARN, DEFAULT_DUPLICATE_RATE_DANGER,
    )

    report = {
        "scale": scale,
        "density": density,
        "reuse": reuse,
        "duplication": duplication,
        "alerts": alerts,
        "analyzed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "project_key": project_key,
        "target_dir": str(target_dir.relative_to(project_dir)),
    }

    # ── Cache result ──
    try:
        await db.db[CACHE_COLLECTION].replace_one(
            {"key": cache_key},
            {"key": cache_key, "data": report, "timestamp": time.time()},
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"Failed to cache code health result: {e}")

    return report
