"""ImportMap edge recovery extracted from merge-batch-graphs.py for single-responsibility."""

import json
from pathlib import Path
from typing import Any


def recover_imports_from_scan(
    assembled: dict[str, Any],
    scan_result_path: Path,
) -> tuple[int, list[str]]:
    """Re-emit `imports` edges from `scan-result.json#importMap` missing from batches.

    Returns (recovered_count, report_lines).
    """
    if not scan_result_path.is_file():
        return 0, [f"  importMap recovery skipped — {scan_result_path.name} not found"]

    try:
        scan = json.loads(scan_result_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        return 0, [f"  importMap recovery skipped — could not parse {scan_result_path.name}: {e}"]

    import_map = scan.get("importMap")
    if not isinstance(import_map, dict):
        return 0, [f"  importMap recovery skipped — no importMap field in {scan_result_path.name}"]

    file_node_ids: set[str] = set()
    for node in assembled["nodes"]:
        if node.get("type") == "file":
            file_node_ids.add(node.get("id", ""))

    existing: set[tuple[str, str]] = set()
    for edge in assembled["edges"]:
        if edge.get("type") == "imports":
            existing.add((edge.get("source", ""), edge.get("target", "")))

    recovered = 0
    skipped_no_src_node = 0
    skipped_no_tgt_node = 0
    for src_path, targets in import_map.items():
        if not isinstance(targets, list):
            continue
        src_id = f"file:{src_path}"
        if src_id not in file_node_ids:
            if targets:
                skipped_no_src_node += 1
            continue
        for tgt_path in targets:
            if not isinstance(tgt_path, str) or not tgt_path:
                continue
            tgt_id = f"file:{tgt_path}"
            if tgt_id not in file_node_ids:
                skipped_no_tgt_node += 1
                continue
            if src_id == tgt_id:
                continue
            if (src_id, tgt_id) in existing:
                continue
            assembled["edges"].append({
                "source": src_id,
                "target": tgt_id,
                "type": "imports",
                "direction": "forward",
                "weight": 0.7,
                "recoveredFromImportMap": True,
            })
            existing.add((src_id, tgt_id))
            recovered += 1

    lines: list[str] = []
    lines.append(
        f"  Recovered {recovered} `imports` edges from importMap "
        f"({len(import_map)} entries scanned)"
    )
    if skipped_no_src_node:
        lines.append(
            f"  Skipped {skipped_no_src_node} importMap source files "
            f"with no `file:` node in graph"
        )
    if skipped_no_tgt_node:
        lines.append(
            f"  Skipped {skipped_no_tgt_node} importMap target paths "
            f"with no `file:` node in graph"
        )
    return recovered, lines
