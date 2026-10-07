"""Vue SFC component reuse analysis."""

from collections import defaultdict
import logging
from pathlib import Path
from typing import Any

from .constants import _VUE_COMPONENT_RE
from .line_counter import _count_lines

logger = logging.getLogger(__name__)


def _analyze_vue_reuse(files: list[Path], project_dir: Path) -> dict[str, Any]:
    vue_files = [f for f in files if f.suffix.lower() == ".vue"]
    if not vue_files:
        return {"component_defs": 0, "component_usages": 0, "reuse_rate": 0, "unused_components": []}

    component_names: set[str] = set()
    component_paths: dict[str, str] = {}
    for vf in vue_files:
        name = vf.stem
        component_names.add(name)
        component_paths[name] = str(vf.relative_to(project_dir))

    usage_counts: dict[str, int] = defaultdict(int)
    all_imported: set[str] = set()

    for fpath in files:
        if fpath.suffix.lower() not in (".vue", ".ts", ".tsx", ".js", ".jsx"):
            continue
        try:
            content = fpath.read_text(encoding="utf-8", errors="replace")
        except (OSError, UnicodeDecodeError):
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
