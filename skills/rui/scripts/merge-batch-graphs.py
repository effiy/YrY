#!/usr/bin/env python3
"""
merge-batch-graphs.py — Merge and normalize batch analysis results.

Combines batch-*.json files from the intermediate directory into a single
assembled graph with normalized IDs, complexity values, and cleaned edges.

Called at the end of Phase 2 of /understand. Phase 3 (ASSEMBLE REVIEW)
then reviews the output for semantic issues the script cannot catch.

Usage:
    python merge-batch-graphs.py <project-root>

Input:
    <project-root>/.understand-anything/intermediate/batch-*.json

Output:
    <project-root>/.understand-anything/intermediate/assembled-graph.json
"""

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

try:
    from .lib.normalize import classify_id_fix, normalize_node_id, normalize_complexity, normalize_direction, _num
    from .lib.tested_by import link_tests
    from .lib.import_recovery import recover_imports_from_scan
    from .lib.config import TYPE_TO_PREFIX
except ImportError:
    from lib.normalize import classify_id_fix, normalize_node_id, normalize_complexity, normalize_direction, _num
    from lib.tested_by import link_tests
    from lib.import_recovery import recover_imports_from_scan
    from lib.config import TYPE_TO_PREFIX


# ── Batch loading ─────────────────────────────────────────────────────────

def load_batch(path: Path) -> dict[str, Any] | None:
    """Load a batch JSON file, tolerating malformed files."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"  Warning: skipping {path.name}: {e}", file=sys.stderr)
        return None

    if not isinstance(data.get("nodes"), list):
        print(f"  Warning: skipping {path.name}: missing or invalid 'nodes' array", file=sys.stderr)
        return None
    if not isinstance(data.get("edges"), list):
        print(f"  Warning: skipping {path.name}: missing or invalid 'edges' array", file=sys.stderr)
        return None

    return data


# ── Main merge + normalize ────────────────────────────────────────────────

def merge_and_normalize(batches: list[dict[str, Any]]) -> tuple[dict[str, Any], list[str]]:
    """Merge batch results and normalize. Returns (assembled_graph, report_lines)."""

    id_fix_patterns: Counter[str] = Counter()
    complexity_fix_patterns: Counter[str] = Counter()
    unfixable: list[str] = []

    # Step 1: Combine all nodes and edges
    all_nodes: list[dict] = []
    all_edges: list[dict] = []
    for batch in batches:
        all_nodes.extend(batch.get("nodes", []))
        all_edges.extend(batch.get("edges", []))

    total_input_nodes = len(all_nodes)
    total_input_edges = len(all_edges)

    # Step 2: Normalize node IDs and build ID mapping
    id_mapping: dict[str, str] = {}
    nodes_with_ids: list[dict] = []
    unknown_node_types: Counter[str] = Counter()

    for i, node in enumerate(all_nodes):
        original_id = node.get("id")
        if not original_id:
            unfixable.append(f"Node[{i}] has no 'id' field (name={node.get('name', '?')}, type={node.get('type', '?')})")
            continue

        node_type = node.get("type", "")
        if node_type and node_type not in TYPE_TO_PREFIX:
            unknown_node_types[node_type] += 1

        nodes_with_ids.append(node)
        corrected_id = normalize_node_id(original_id, node)
        if corrected_id != original_id:
            pattern = classify_id_fix(original_id, corrected_id)
            id_fix_patterns[pattern] += 1
            id_mapping[original_id] = corrected_id
            node["id"] = corrected_id

    # Step 3: Normalize complexity
    complexity_unknown_patterns: Counter[str] = Counter()

    for node in nodes_with_ids:
        original = node.get("complexity")
        normalized, status = normalize_complexity(original)

        if status == "mapped":
            orig_repr = repr(original) if not isinstance(original, str) else f'"{original}"'
            complexity_fix_patterns[f"{orig_repr} → \"{normalized}\""] += 1
        elif status == "unknown":
            orig_repr = repr(original) if not isinstance(original, str) else f'"{original}"'
            complexity_unknown_patterns[f"complexity {orig_repr} → defaulted to \"moderate\""] += 1

        node["complexity"] = normalized

    # Step 4: Rewrite edge references
    edges_rewritten = 0
    for edge in all_edges:
        src = edge.get("source", "")
        tgt = edge.get("target", "")
        new_src = id_mapping.get(src, src)
        new_tgt = id_mapping.get(tgt, tgt)
        if new_src != src or new_tgt != tgt:
            edges_rewritten += 1
            edge["source"] = new_src
            edge["target"] = new_tgt

    # Step 5: Deduplicate nodes by ID (keep last)
    duplicate_count = 0
    nodes_by_id: dict[str, dict] = {}
    for node in nodes_with_ids:
        nid = node.get("id", "")
        if nid in nodes_by_id:
            duplicate_count += 1
        nodes_by_id[nid] = node

    # Step 5b: Deterministic tested_by linker
    tested_by_added, tested_by_dropped, tested_by_tagged, tested_by_swapped = link_tests(
        nodes_by_id, all_edges
    )

    # Step 6: Deduplicate edges, drop dangling
    node_ids = set(nodes_by_id.keys())
    edges_by_key: dict[tuple[str, str, str, str], dict] = {}
    for edge in all_edges:
        src = edge.get("source", "")
        tgt = edge.get("target", "")
        etype = edge.get("type", "")
        direction = normalize_direction(edge.get("direction"))
        edge["direction"] = direction

        if src not in node_ids or tgt not in node_ids:
            missing = []
            if src not in node_ids:
                missing.append(f"source '{src}'")
            if tgt not in node_ids:
                missing.append(f"target '{tgt}'")
            unfixable.append(f"Edge {src} → {tgt} ({etype}): dropped, missing {', '.join(missing)}")
            continue

        key = (src, tgt, etype, direction)
        existing = edges_by_key.get(key)
        if existing is None or _num(edge.get("weight", 0)) > _num(existing.get("weight", 0)):
            edges_by_key[key] = edge

    # ── Build report ─────────────────────────────────────────────────
    report: list[str] = []
    report.append(f"Input: {total_input_nodes} nodes, {total_input_edges} edges")

    fixed_lines: list[str] = []
    if id_fix_patterns:
        for pattern, count in id_fix_patterns.most_common():
            fixed_lines.append(f"  {count:>4} × {pattern}")
    if complexity_fix_patterns:
        for pattern, count in complexity_fix_patterns.most_common():
            fixed_lines.append(f"  {count:>4} × complexity {pattern}")
    if edges_rewritten:
        fixed_lines.append(f"  {edges_rewritten:>4} × edge references rewritten after ID normalization")
    if duplicate_count:
        fixed_lines.append(f"  {duplicate_count:>4} × duplicate node IDs removed (kept last)")
    if tested_by_swapped:
        fixed_lines.append(f"  {tested_by_swapped:>4} × tested_by edges flipped (test → production became production → test)")
    if tested_by_dropped:
        fixed_lines.append(f"  {tested_by_dropped:>4} × tested_by edges dropped (orphan endpoint or test↔test / prod↔prod pair)")

    if fixed_lines:
        report.append("")
        total_fixes = (
            sum(id_fix_patterns.values())
            + sum(complexity_fix_patterns.values())
            + edges_rewritten
            + duplicate_count
            + tested_by_swapped
            + tested_by_dropped
        )
        report.append(f"Fixed ({total_fixes} corrections):")
        report.extend(fixed_lines)

    if tested_by_added or tested_by_tagged:
        report.append("")
        report.append("Tested-by linker:")
        report.append(f"  {tested_by_added:>4} × tested_by edges produced (path-convention supplement, production → test)")
        report.append(f"  {tested_by_tagged:>4} × production nodes tagged \"tested\"")

    unfixable_total = (
        len(unfixable)
        + sum(complexity_unknown_patterns.values())
        + sum(unknown_node_types.values())
    )
    if unfixable_total:
        report.append("")
        report.append(f"Could not fix ({unfixable_total} issues — needs agent review):")
        for ntype, count in unknown_node_types.most_common():
            report.append(f"  {count:>4} × unknown node type \"{ntype}\" (not in schema, kept as-is)")
        for pattern, count in complexity_unknown_patterns.most_common():
            report.append(f"  {count:>4} × {pattern}")
        for detail in unfixable:
            report.append(f"  - {detail}")

    report.append("")
    report.append(f"Output: {len(nodes_by_id)} nodes, {len(edges_by_key)} edges")

    assembled = {
        "nodes": list(nodes_by_id.values()),
        "edges": list(edges_by_key.values()),
    }

    return assembled, report


# ── Main ──────────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python merge-batch-graphs.py <project-root>", file=sys.stderr)
        sys.exit(1)

    project_root = Path(sys.argv[1]).resolve()
    intermediate_dir = project_root / ".understand-anything" / "intermediate"

    if not intermediate_dir.is_dir():
        print(f"Error: {intermediate_dir} does not exist", file=sys.stderr)
        sys.exit(1)

    batch_files = sorted(
        intermediate_dir.glob("batch-*.json"),
        key=lambda p: int(re.search(r"batch-(\d+)", p.stem).group(1))
        if re.search(r"batch-(\d+)", p.stem)
        else 0,
    )
    if not batch_files:
        print("Error: no batch-*.json files found in intermediate/", file=sys.stderr)
        sys.exit(1)

    by_batch = defaultdict(list)
    unrecognized_batch_files: list[str] = []
    for f in batch_files:
        m = re.match(r"batch-(\d+)(?:-part-(\d+))?\.json", f.name)
        if m:
            by_batch[int(m.group(1))].append((f.name, int(m.group(2)) if m.group(2) else None))
        else:
            unrecognized_batch_files.append(f.name)

    if unrecognized_batch_files:
        preview = ", ".join(unrecognized_batch_files[:5])
        suffix = (
            f" (+{len(unrecognized_batch_files) - 5} more)"
            if len(unrecognized_batch_files) > 5
            else ""
        )
        print(
            f"Warning: merge-batch-graphs: {len(unrecognized_batch_files)} "
            f"batch file(s) with unrecognized filenames will be DROPPED — "
            f"files: {preview}{suffix} — fix the file-analyzer agent to use "
            f"only batch-<N>.json or batch-<N>-part-<K>.json patterns",
            file=sys.stderr,
        )

    logical_count = len(by_batch)
    multi_part = sum(1 for entries in by_batch.values() if len(entries) > 1)
    print(
        f"Found {len(batch_files)} batch files "
        f"({logical_count} logical batches, {multi_part} multi-part):",
        file=sys.stderr,
    )

    missing_part_warnings: list[str] = []
    for idx, entries in by_batch.items():
        part_nums = [p for (_n, p) in entries if p is not None]
        if not part_nums:
            continue
        present = set(part_nums)
        expected = set(range(1, max(part_nums) + 1))
        missing = sorted(expected - present)
        if missing:
            msg = (
                f"batch {idx} has parts {sorted(present)} but "
                f"missing part {missing} — possible truncated write — "
                f"affected nodes/edges may be lost"
            )
            print(f"Warning: merge: {msg}", file=sys.stderr)
            missing_part_warnings.append(msg)

    unrecognized_set = set(unrecognized_batch_files)
    batches: list[dict[str, Any]] = []
    for f in batch_files:
        if f.name in unrecognized_set:
            continue
        batch = load_batch(f)
        if batch is not None:
            batches.append(batch)
            n = len(batch.get("nodes", []))
            e = len(batch.get("edges", []))
            print(f"  {f.name}: {n} nodes, {e} edges", file=sys.stderr)

    if not batches:
        print("Error: no valid batch files loaded", file=sys.stderr)
        sys.exit(1)

    assembled, report = merge_and_normalize(batches)

    if missing_part_warnings:
        report.append("")
        report.append(
            f"Warning: {len(missing_part_warnings)} batch(es) with missing parts "
            f"— some nodes/edges silently dropped:"
        )
        for w in missing_part_warnings:
            report.append(f"  - {w}")

    if unrecognized_batch_files:
        preview = ", ".join(unrecognized_batch_files[:5])
        suffix = (
            f" (+{len(unrecognized_batch_files) - 5} more)"
            if len(unrecognized_batch_files) > 5
            else ""
        )
        report.append("")
        report.append(
            f"Warning: dropped {len(unrecognized_batch_files)} batch file(s) "
            f"with unrecognized filenames — files: {preview}{suffix} — "
            f"fix the file-analyzer agent to use only batch-<N>.json or "
            f"batch-<N>-part-<K>.json patterns (every node/edge in these "
            f"files was excluded from the final graph)"
        )

    scan_result_path = intermediate_dir / "scan-result.json"
    recovered, recovery_report = recover_imports_from_scan(assembled, scan_result_path)
    if recovery_report:
        report.append("")
        report.append("Imports edge recovery:")
        report.extend(recovery_report)

    print("", file=sys.stderr)
    for line in report:
        print(line, file=sys.stderr)

    output_path = intermediate_dir / "assembled-graph.json"
    output_path.write_text(json.dumps(assembled, indent=2, ensure_ascii=False), encoding="utf-8")

    size_kb = output_path.stat().st_size / 1024
    print(f"\nWritten to {output_path} ({size_kb:.0f} KB)", file=sys.stderr)


if __name__ == "__main__":
    main()
