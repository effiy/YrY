"""One-shot cleanup + backfill for BRD topic collections.

What this does:
  1. DELETE generic placeholder entries — tags contain seed/sample/reference, OR
     key matches `*_seed_NNN`, OR title contains "Sample" / "Reference Seed".
     Also deletes the corresponding markdown file under YiKnowledge/brd/.
  2. BACKFILL markdown bodies for real (project-specific) entries whose
     `contentPath` points to a file that doesn't exist on disk. The body is
     generated from the entry's title + meta fields, with placeholder
     sections appropriate to the topic.

Idempotent. Run from YiAi/:
    python scripts/cleanup_and_backfill_brd.py
"""
from __future__ import annotations

import asyncio
import sys
import os
import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from data.database import db  # type: ignore
from domain.knowledge.writer import write_entry_markdown  # type: ignore

KB = ROOT.parent / "YiKnowledge"

_SEED_KEY_RE = re.compile(r"_seed_\d+$")


def _is_generic(doc: dict) -> bool:
    tags = [str(t).lower() for t in (doc.get("tags") or [])]
    if "seed" in tags or "sample" in tags or "reference" in tags:
        return True
    key = str(doc.get("key") or "")
    if _SEED_KEY_RE.search(key):
        return True
    title = str(doc.get("title") or "")
    if "Reference Seed" in title or "Sample " in title:
        return True
    return False


def _md_for(topic: str, doc: dict) -> str:
    """Generate a markdown body from an entry's meta fields."""
    title = doc.get("title") or "(untitled)"
    meta = doc.get("meta") or {}
    tags = doc.get("tags") or []

    lines: list[str] = [f"# {title}", ""]
    if tags:
        lines.append(f"**Tags**: {', '.join(str(t) for t in tags)}")
        lines.append("")

    # Topic-specific intro
    topic_intros = {
        "brd-documents": "Business Requirements Document — problem statement, scope, stakeholders, success metrics.",
        "brd-objectives": "Measurable business objective — KPI, baseline, target, verification method.",
        "brd-risks": "Risk register entry — likelihood, impact, mitigation, contingency, trigger.",
        "brd-stakeholders": "Stakeholder / user persona — role, influence, usage frequency, pain points.",
        "brd-rules": "Business rule — MoSCoW priority, constraint type, validation, compliance.",
        "brd-acceptance": "Acceptance criterion — BDD Given/When/Then, functional / non-functional.",
        "brd-milestones": "Milestone — phase gate, target date, deliverables, dependencies, blockers.",
        "brd-approvals": "Approval record — sign-off role, status, decision, conditions.",
        "brd-domains": "Domain knowledge entry — subdomain, typical systems, terminology.",
        "brd-scenarios": "Scenario pattern — trigger, actors, flow, acceptance samples.",
        "brd-terminology": "Terminology entry — definition, source authority, related terms.",
        "brd-reference": "Reference data — list / lookup table, source, coverage.",
        "brd-examples": "BRD example — worked fragment, reusable pattern.",
        "brd-competitors": "Competitor / vendor profile — positioning, strengths, weaknesses.",
        "brd-use-cases": "AI deployment use case — industry, capability, scale, outcomes.",
        "brd-prompts": "Prompt library entry — system / user template, variables, few-shot.",
    }
    intro = topic_intros.get(topic, "BRD registry entry — see meta fields for structured data.")
    lines.append(f"> {intro}")
    lines.append("")

    # Metadata table from meta dict
    if meta:
        lines.append("## Metadata")
        lines.append("")
        lines.append("| Field | Value |")
        lines.append("|---|---|")
        for k, v in meta.items():
            if v is None or v == "":
                continue
            sv = ", ".join(str(x) for x in v) if isinstance(v, list) else str(v)
            if len(sv) > 200:
                sv = sv[:200] + "…"
            lines.append(f"| **{k}** | {sv} |")
        lines.append("")

    # Placeholder sections
    lines.append("## Context")
    lines.append("")
    lines.append("_Describe the business context, problem, and motivation. Replace this placeholder with project-specific narrative._")
    lines.append("")
    lines.append("## Acceptance Criteria")
    lines.append("")
    lines.append("_List verifiable success conditions — BDD-style Given/When/Then preferred._")
    lines.append("")
    lines.append("## Open Questions")
    lines.append("")
    lines.append("_Track unresolved questions, owners, and due dates._")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"_Body backfilled by `scripts/cleanup_and_backfill_brd.py` from meta fields. Edit this file to replace placeholders with real content._")
    lines.append("")
    return "\n".join(lines)


async def main() -> int:
    await db.initialize()
    cols = await db.db.list_collection_names()
    brd_cols = sorted(c for c in cols if c.startswith("brd_"))

    deleted_docs = 0
    deleted_files = 0
    backfilled = 0
    backfill_skipped_existing = 0
    real_kept = 0
    collection_cleanup: list[tuple[str, int, int]] = []  # (coll, deleted, backfilled)

    for c in brd_cols:
        c_deleted = 0
        c_backfilled = 0
        cur = db.db[c].find({}, {"_id": 0})
        async for d in cur:
            cp = d.get("contentPath")
            if _is_generic(d):
                # delete markdown file if exists
                if cp:
                    full = KB / cp
                    if full.is_file():
                        try:
                            full.unlink()
                            deleted_files += 1
                        except OSError:
                            pass
                # delete mongo doc
                await db.db[c].delete_one({"key": d.get("key")})
                deleted_docs += 1
                c_deleted += 1
                continue
            # real entry — backfill markdown if missing
            real_kept += 1
            cp = d.get("contentPath")
            if not cp:
                # generate a contentPath for legacy entries lacking one
                topic = c.removeprefix("brd_")
                key = d.get("key") or f"brd_{topic}_{int(time.time() * 1000)}"
                cp = f"brd/{topic}/{key}.md"
                await db.db[c].update_one({"key": d.get("key")}, {"$set": {"contentPath": cp}})
                d["contentPath"] = cp
            full = KB / cp
            if not full.is_file():
                try:
                    body = _md_for(c.removeprefix("brd_"), d)
                    write_entry_markdown(cp, body, {
                        "title": d.get("title") or "",
                        "key": d.get("key") or "",
                        "topic": c.removeprefix("brd_"),
                        "tags": d.get("tags") or [],
                        **(d.get("meta") or {}),
                    })
                    backfilled += 1
                    c_backfilled += 1
                except Exception as e:  # noqa: BLE001
                    print(f"  backfill FAIL {c} {d.get('key')}: {e}")
            else:
                backfill_skipped_existing += 1
        collection_cleanup.append((c, c_deleted, c_backfilled))

    print(f"\nCleanup summary:")
    print(f"  collections scanned     : {len(brd_cols)}")
    print(f"  generic docs deleted    : {deleted_docs}")
    print(f"  generic md files deleted: {deleted_files}")
    print(f"  real entries kept       : {real_kept}")
    print(f"  md bodies backfilled    : {backfilled}")
    print(f"  md already present      : {backfill_skipped_existing}")

    # print top-10 collections by deletion count
    print("\nTop collections by deletions:")
    for c, d, b in sorted(collection_cleanup, key=lambda x: -x[1])[:10]:
        print(f"  {c:<45} deleted={d} backfilled={b}")

    await db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
