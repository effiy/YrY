"""Code duplication detection via sliding-window hashing."""

from collections import defaultdict
import hashlib
import logging
from pathlib import Path
from typing import Any

from .line_counter import _norm_line

logger = logging.getLogger(__name__)


def _read_snippet(file_path: str, project_dir: Path, start: int, end: int) -> str:
    try:
        content = (project_dir / file_path).read_text(encoding="utf-8", errors="replace")
        lines = content.split("\n")
        snippet = lines[start - 1 : end - 1]
        return "\n".join(snippet)[:200]
    except (OSError, UnicodeDecodeError):
        return ""


def _detect_duplicates(files: list[Path], min_lines: int, project_dir: Path) -> dict[str, Any]:
    file_hashes: dict[tuple[str, int], str] = {}
    hash_to_locations: dict[str, list[tuple[str, int]]] = defaultdict(list)

    for fpath in files:
        try:
            raw = fpath.read_text(encoding="utf-8", errors="replace")
        except (OSError, UnicodeDecodeError):
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

    cross_file_hashes: set[str] = set()
    for h, locs in hash_to_locations.items():
        unique_files = {f for f, _ in locs}
        if len(unique_files) >= 2:
            cross_file_hashes.add(h)

    file_matches: dict[str, list[int]] = defaultdict(list)
    for (fname, start), h in file_hashes.items():
        if h in cross_file_hashes:
            file_matches[fname].append(start)
    for fname in file_matches:
        file_matches[fname].sort()

    merged_blocks: list[dict[str, Any]] = []
    for fname, starts in file_matches.items():
        if not starts:
            continue
        block_start = starts[0]
        block_end = block_start + min_lines
        for i in range(1, len(starts)):
            if starts[i] <= block_end:
                block_end = max(block_end, starts[i] + min_lines)
            else:
                merged_blocks.append({"file": fname, "start": block_start, "end": block_end})
                block_start = starts[i]
                block_end = block_start + min_lines
        merged_blocks.append({"file": fname, "start": block_start, "end": block_end})

    blocks_by_span: dict[tuple[int, int], list[str]] = defaultdict(list)
    for b in merged_blocks:
        span = (b["start"], b["end"])
        if b["file"] not in blocks_by_span[span]:
            blocks_by_span[span].append(b["file"])

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

    duplicate_blocks.sort(key=lambda x: x["lines"], reverse=True)
    return {
        "duplicate_blocks": len(duplicate_blocks),
        "duplicate_lines": total_dup_lines,
        "max_block_size": max_block,
        "top_duplicates": duplicate_blocks[:10],
    }
