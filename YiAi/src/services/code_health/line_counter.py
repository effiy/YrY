"""Line counting and file collection for code health analysis."""

import logging
import os
from pathlib import Path

from .constants import _COMMENT_PATTERNS

logger = logging.getLogger(__name__)


def _norm_line(line: str) -> str:
    return line.strip()


def _is_blank(line: str) -> bool:
    return not line.strip()


def _is_comment(line: str, ext: str, in_block_comment: bool) -> tuple[bool, bool]:
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

    for _open, close in patterns:
        if close and _open in stripped:
            open_idx = stripped.index(_open)
            close_idx = stripped.find(close, open_idx + len(_open))
            if close_idx != -1:
                return True, False

    return False, False


def _count_lines(path: Path) -> dict[str, int]:
    ext = path.suffix.lower()
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
    except (OSError, UnicodeDecodeError):
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
