"""Deterministic tested_by linker extracted from merge-batch-graphs.py for single-responsibility.

Two-pass linker. Both passes produce canonical `production → test` edges.

Pass 1 — preserve LLM semantics, fix direction.
  The LLM sees the relationship only when analyzing a *test* file
  (production files don't import their tests), so its emitted direction
  is systematically wrong: source = the file it was analyzing = a test.
  We do NOT strip these edges — the *pairing* is real evidence (the LLM
  saw an import / using / same-package call). We just flip direction
  when source is test + target is production. Edges that are
  semantically broken (test↔test, production↔production, orphan endpoints)
  are dropped.

Pass 2 — supplement with path-convention pairings.
  For test files the LLM didn't link to anything, fall back to filename
  conventions (sibling `_test.go`, JS/TS `__tests__/`, Maven `src/test/`,
  etc.) to find a production counterpart. Pairs already covered by
  Pass 1 are skipped.
"""

import os
from typing import Any

from .config import (
    _JS_TS_EXTS,
    _JS_TS_TEST_EXTS,
    _MIRROR_PRODUCTION_ROOTS,
    _TEST_NAME_PATTERNS,
)
from .normalize import _num


# ── Path helpers ─────────────────────────────────────────────────────────────

def _path_segments(path: str) -> list[str]:
    return [seg for seg in path.split("/") if seg]


def _basename(path: str) -> str:
    return path.rsplit("/", 1)[-1] if "/" in path else path


def _strip_test_infix(stem: str) -> str | None:
    for infix in (".test", ".spec"):
        if stem.endswith(infix):
            return stem[: -len(infix)]
    return None


def _join(dir_path: str, name: str) -> str:
    return f"{dir_path}/{name}" if dir_path else name


def _add_unique(out: list[str], path: str) -> None:
    if path and path not in out:
        out.append(path)


def _js_ts_sibling_candidates(dir_path: str, base_stem: str) -> list[str]:
    return [_join(dir_path, f"{base_stem}{e}") for e in _JS_TS_EXTS]


def _file_node_path(node: dict[str, Any]) -> str | None:
    nid = node.get("id", "")
    if not isinstance(nid, str) or not nid.startswith("file:"):
        return None
    fp = node.get("filePath")
    if isinstance(fp, str) and fp:
        return fp
    return nid[len("file:"):]


def _swap_tested_by_in_place(
    edge: dict[str, Any], original_src: str, original_tgt: str
) -> None:
    edge["source"] = original_tgt
    edge["target"] = original_src
    edge["direction"] = "forward"
    prev = edge.get("description")
    edge["description"] = (
        "Direction corrected (was test → production)"
        if not prev
        else f"{prev} [direction corrected]"
    )


def _ensure_tested_tag(node: dict[str, Any]) -> bool:
    tags = node.get("tags")
    if not isinstance(tags, list):
        tags = []
        node["tags"] = tags
    if "tested" in tags:
        return False
    tags.append("tested")
    return True


# ── Public API ───────────────────────────────────────────────────────────────

def is_test_path(path: str) -> bool:
    """Return True if `path` looks like a test file by basename convention."""
    stem, ext = os.path.splitext(_basename(path))

    if ext in _JS_TS_TEST_EXTS:
        return stem.endswith(".test") or stem.endswith(".spec")

    patterns = _TEST_NAME_PATTERNS.get(ext)
    if patterns is None:
        return False
    prefixes, suffixes = patterns
    return any(stem.startswith(p) for p in prefixes) or any(
        stem.endswith(s) for s in suffixes
    )


def production_candidates(test_path: str) -> list[str]:
    """For a test file path, return ordered candidate production paths."""
    stem, ext = os.path.splitext(_basename(test_path))
    segs = _path_segments(test_path)
    dir_segs = segs[:-1]
    dir_path = "/".join(dir_segs)

    candidates: list[str] = []

    # ── JS/TS family ──────────────────────────────────────────────────
    if ext in _JS_TS_TEST_EXTS:
        base_stem = _strip_test_infix(stem)
        if base_stem is not None:
            _add_unique(candidates, _join(dir_path, f"{base_stem}{ext}"))
            for c in _js_ts_sibling_candidates(dir_path, base_stem):
                _add_unique(candidates, c)

            if dir_segs and dir_segs[-1] in ("__tests__", "test", "spec", "tests"):
                parent_dir = "/".join(dir_segs[:-1])
                _add_unique(candidates, _join(parent_dir, f"{base_stem}{ext}"))
                for c in _js_ts_sibling_candidates(parent_dir, base_stem):
                    _add_unique(candidates, c)

            if dir_segs and dir_segs[0] in ("tests", "test", "__tests__"):
                tail_path = "/".join(dir_segs[1:])
                for root in _MIRROR_PRODUCTION_ROOTS:
                    new_dir = "/".join(p for p in (root, tail_path) if p)
                    _add_unique(candidates, _join(new_dir, f"{base_stem}{ext}"))
                    for c in _js_ts_sibling_candidates(new_dir, base_stem):
                        _add_unique(candidates, c)

    # ── Go ────────────────────────────────────────────────────────────
    elif ext == ".go" and stem.endswith("_test"):
        base_stem = stem[: -len("_test")]
        _add_unique(candidates, _join(dir_path, f"{base_stem}.go"))

    # ── Python ────────────────────────────────────────────────────────
    elif ext == ".py" and (stem.startswith("test_") or stem.endswith("_test")):
        if stem.startswith("test_"):
            base_stem = stem[len("test_"):]
        else:
            base_stem = stem[: -len("_test")]

        _add_unique(candidates, _join(dir_path, f"{base_stem}.py"))

        if dir_segs and dir_segs[-1] in ("tests", "test"):
            parent_dir = "/".join(dir_segs[:-1])
            _add_unique(candidates, _join(parent_dir, f"{base_stem}.py"))

        if dir_segs and dir_segs[0] in ("tests", "test"):
            tail_path = "/".join(dir_segs[1:])
            for root in _MIRROR_PRODUCTION_ROOTS:
                new_dir = "/".join(p for p in (root, tail_path) if p)
                _add_unique(candidates, _join(new_dir, f"{base_stem}.py"))

    # ── Java ──────────────────────────────────────────────────────────
    elif ext == ".java":
        for suffix in ("Tests", "Test", "IT"):
            if stem.endswith(suffix):
                base_stem = stem[: -len(suffix)]
                if (
                    len(dir_segs) >= 3
                    and dir_segs[0] == "src"
                    and dir_segs[1] == "test"
                    and dir_segs[2] == "java"
                ):
                    new_dir = "/".join(["src", "main", "java"] + list(dir_segs[3:]))
                    _add_unique(candidates, f"{new_dir}/{base_stem}.java")
                _add_unique(candidates, _join(dir_path, f"{base_stem}.java"))
                break

    # ── Kotlin ────────────────────────────────────────────────────────
    elif ext == ".kt":
        for suffix in ("Tests", "Test"):
            if stem.endswith(suffix):
                base_stem = stem[: -len(suffix)]
                if (
                    len(dir_segs) >= 3
                    and dir_segs[0] == "src"
                    and dir_segs[1] == "test"
                    and dir_segs[2] == "kotlin"
                ):
                    new_dir = "/".join(["src", "main", "kotlin"] + list(dir_segs[3:]))
                    _add_unique(candidates, f"{new_dir}/{base_stem}.kt")
                _add_unique(candidates, _join(dir_path, f"{base_stem}.kt"))
                break

    # ── C# ────────────────────────────────────────────────────────────
    elif ext == ".cs":
        for suffix in ("Tests", "Test"):
            if stem.endswith(suffix):
                base_stem = stem[: -len(suffix)]
                _add_unique(candidates, _join(dir_path, f"{base_stem}.cs"))

                tests_idx = None
                for i in range(len(dir_segs) - 1, -1, -1):
                    if dir_segs[i].lower() in ("tests", "test"):
                        tests_idx = i
                        break
                if tests_idx is not None:
                    parent_segs = dir_segs[:tests_idx]
                    tail_segs = dir_segs[tests_idx + 1 :]
                    parent_dir = "/".join(parent_segs)
                    _add_unique(candidates, _join(parent_dir, f"{base_stem}.cs"))
                    src_dir = "/".join([*parent_segs, "src", *tail_segs])
                    _add_unique(candidates, _join(src_dir, f"{base_stem}.cs"))

                if dir_segs:
                    top = dir_segs[0]
                    if top.endswith(".Tests") or top.endswith(".Test"):
                        sibling = top[: -len(".Tests")] if top.endswith(".Tests") else top[: -len(".Test")]
                        if sibling:
                            mirror_dir = "/".join([sibling, *dir_segs[1:]])
                            _add_unique(candidates, _join(mirror_dir, f"{base_stem}.cs"))
                break

    # ── C/C++ ─────────────────────────────────────────────────────────
    elif ext in {".c", ".cpp", ".cc"}:
        if stem.startswith("test_"):
            base_stem = stem[len("test_"):]
        elif stem.endswith("_test"):
            base_stem = stem[: -len("_test")]
        else:
            base_stem = None
        if base_stem is not None:
            _add_unique(candidates, _join(dir_path, f"{base_stem}{ext}"))

    return candidates


def link_tests(
    nodes_by_id: dict[str, dict[str, Any]],
    edges: list[dict[str, Any]],
) -> tuple[int, int, int, int]:
    """Canonicalize `tested_by` edges and link unmatched test files.

    Returns (added, dropped, tagged, swapped):
      added:   path-convention supplemental edges appended in Pass 2
      dropped: pre-existing `tested_by` edges removed (unsalvageable)
      tagged:  production nodes newly tagged "tested"
      swapped: pre-existing `tested_by` edges flipped (test → production
               became production → test)
    """
    file_paths_to_nodes: dict[str, dict[str, Any]] = {}
    node_id_to_classification: dict[str, str] = {}
    test_nodes: list[tuple[str, dict[str, Any]]] = []
    for node in nodes_by_id.values():
        path = _file_node_path(node)
        if path is None:
            continue
        file_paths_to_nodes[path] = node
        if is_test_path(path):
            node_id_to_classification[node["id"]] = "test"
            test_nodes.append((path, node))
        else:
            node_id_to_classification[node["id"]] = "prod"

    # ── Pass 1: walk existing tested_by edges, canonicalize or drop.
    covered: set[tuple[str, str]] = set()
    pair_to_idx: dict[tuple[str, str], int] = {}
    swapped_pairs: set[tuple[str, str]] = set()
    dropped = 0
    write_idx = 0
    for edge in edges:
        if edge.get("type") != "tested_by":
            edges[write_idx] = edge
            write_idx += 1
            continue

        src = edge.get("source", "")
        tgt = edge.get("target", "")
        src_class = node_id_to_classification.get(src)
        tgt_class = node_id_to_classification.get(tgt)

        if (src_class, tgt_class) == ("prod", "test"):
            pair = (src, tgt)
            needs_swap = False
        elif (src_class, tgt_class) == ("test", "prod"):
            pair = (tgt, src)
            needs_swap = True
        else:
            dropped += 1
            continue

        if pair in covered:
            existing_idx = pair_to_idx[pair]
            existing = edges[existing_idx]
            if _num(edge.get("weight", 0)) > _num(existing.get("weight", 0)):
                if needs_swap:
                    _swap_tested_by_in_place(edge, src, tgt)
                    swapped_pairs.add(pair)
                else:
                    swapped_pairs.discard(pair)
                edges[existing_idx] = edge
            dropped += 1
            continue

        if needs_swap:
            _swap_tested_by_in_place(edge, src, tgt)
            swapped_pairs.add(pair)
        covered.add(pair)
        pair_to_idx[pair] = write_idx
        edges[write_idx] = edge
        write_idx += 1
    del edges[write_idx:]
    swapped = len(swapped_pairs)

    # ── Pass 2: path-convention supplement for tests not yet paired.
    paired_test_ids = {test_id for (_prod_id, test_id) in covered}
    added = 0
    for test_path, test_node in test_nodes:
        if test_node["id"] in paired_test_ids:
            continue
        for cand_path in production_candidates(test_path):
            prod_node = file_paths_to_nodes.get(cand_path)
            if prod_node is None:
                continue
            if is_test_path(cand_path):
                continue
            pair = (prod_node["id"], test_node["id"])
            if pair in covered:
                continue
            edges.append({
                "source": prod_node["id"],
                "target": test_node["id"],
                "type": "tested_by",
                "direction": "forward",
                "weight": 0.5,
                "description": "Path-based pairing (deterministic)",
            })
            covered.add(pair)
            added += 1
            break

    # ── Tag every production node that ends up sourcing a tested_by edge.
    tagged = 0
    for prod_id, _test_id in covered:
        prod_node = nodes_by_id.get(prod_id)
        if prod_node is None:
            continue
        if _ensure_tested_tag(prod_node):
            tagged += 1

    return added, dropped, tagged, swapped
