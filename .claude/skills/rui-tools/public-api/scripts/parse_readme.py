#!/usr/bin/env python3
"""
parse_readme.py — build references/index.json + references/index.md
from the public-api-lists/public-api-lists upstream README.

Refactor notes (2026-07-18)
--------------------------
The previous output nested every resource inside a single `topics[0]`
node and re-stamped `category` / `topic` / `source` on each record.
With one registered source and a single topic per category that was
~30% pure duplication. The new schema (v2) drops those fields and
flattens topics, saving ~2.3k lines on the current snapshot.

Schema v2
---------
Top-level `index.json` is a lightweight overview — sources + summary +
a `categories[]` array of `{name, slug, file, counts}`. Each category's
full resource list lives in `categories/{slug}.json`. The split
mirrors `rui-code/vite/references/categories/` and keeps `index.json`
small even when the upstream has 800+ resources.

{
  "schema": "public-api-index-v2",
  "generated_from": "<upstream url or local path>",
  "generated_at": "<iso timestamp>",
  "sources": [ ... sources.json contents ... ],
  "summary": {"category_count": N, "topic_count": N, "resource_count": M},
  "categories": [
    {
      "name": "Animals",
      "slug": "animals",
      "file": "categories/animals.json",
      "topic_count": 1,
      "resource_count": 18
    }
  ]
}

`categories/{slug}.json` per-file payload:
{
  "name": "Animals",
  "slug": "animals",
  "source_id": "public-api-lists",
  "file": "categories/animals.json",
  "resources": [{"title": ..., "url": ..., ...}, ...]
}

Usage
-----
    python3 scripts/parse_readme.py \
        --readme references/README-public-api-lists.md \
        --sources references/sources.json \
        --out-json references/index.json \
        --out-md   references/index.md

    # Or pull fresh from upstream:
    python3 scripts/parse_readme.py --from-url
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import re
import sys
import urllib.request
from pathlib import Path
from typing import Any

DEFAULT_README = "references/README-public-api-lists.md"
DEFAULT_SOURCES = "references/sources.json"
DEFAULT_OUT_JSON = "references/index.json"
DEFAULT_OUT_MD = "references/index.md"

SCHEMA_VERSION = "public-api-index-v2"

# Markdown table header that introduces an API table.
# Public API Lists uses columns: API | Description | Auth | HTTPS | CORS
_TABLE_HEADER = re.compile(
    r"^\s*\|\s*API\s*\|\s*Description\s*\|\s*Auth\s*\|\s*HTTPS\s*\|\s*CORS\s*\|",
    re.IGNORECASE,
)
_TABLE_SEP = re.compile(r"^\s*\|[\s\-:|]+\|\s*$")
_CATEGORY_HEADING = re.compile(r"^###\s+(?P<name>.+?)\s*$")
_LINK = re.compile(r"\[(?P<text>[^\]]+)\]\((?P<url>[^)]+)\)")


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _fetch_url(url: str) -> str:
    with urllib.request.urlopen(url, timeout=30) as resp:  # noqa: S310
        return resp.read().decode("utf-8")


def _split_row(row: str) -> list[str]:
    """Split a markdown table row into cells, trimming whitespace."""
    stripped = row.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return []
    return [c.strip() for c in stripped.strip("|").split("|")]


def _extract_title_and_url(cell: str) -> tuple[str, str]:
    """Pull the (title, url) pair from the API cell.

    Cells look like: `[Cat Facts](https://...)` — single link.
    If a cell is plain text, the URL is empty and the cell is the title.
    """
    match = _LINK.search(cell)
    if match:
        return match.group("text").strip(), match.group("url").strip()
    return cell.strip(), ""


def _parse_table(table_rows: list[str]) -> list[dict[str, str]]:
    """Convert a markdown table (header + separator + data rows) into resources.

    Skips the header and separator lines, then walks every body row.
    The expected column order is: API | Description | Auth | HTTPS | CORS.
    """
    if len(table_rows) < 3:
        return []
    # Drop the first two lines (header + separator).
    body = table_rows[2:]
    out: list[dict[str, str]] = []
    for row in body:
        cells = _split_row(row)
        if len(cells) < 5:
            continue
        title, url = _extract_title_and_url(cells[0])
        out.append(
            {
                "title": title,
                "url": url,
                "description": cells[1],
                "auth": cells[2],
                "https": cells[3],
                "cors": cells[4],
            }
        )
    return out


def parse_markdown(md: str) -> list[dict[str, Any]]:
    """Walk the README, returning [{name, resources: [...]}, ...].

    Categories without a follow-up API table (e.g. the Sponsor h3 blocks in
    the upstream README) are dropped from the result. Tables also tolerate
    blank lines between body rows — a quirk of the upstream table near the
    end of the Geocoding section.
    """
    categories: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    table_buffer: list[str] = []
    in_table = False

    def _flush_table() -> None:
        nonlocal table_buffer, in_table
        if current is not None and table_buffer and _TABLE_HEADER.match(table_buffer[0]):
            current["resources"] = _parse_table(table_buffer)
        table_buffer = []
        in_table = False

    for line in md.splitlines():
        # A new category heading closes any open table.
        heading = _CATEGORY_HEADING.match(line)
        if heading:
            _flush_table()
            name = heading.group("name").strip()
            # The upstream README uses h3 for sponsor blocks too. Only treat
            # the heading as a real category if its name doesn't look like
            # a sponsor section.
            if "sponsor" not in name.lower():
                current = {"name": name, "resources": []}
                categories.append(current)
            else:
                current = None
            continue
        if _TABLE_HEADER.match(line):
            _flush_table()
            table_buffer = [line]
            in_table = True
            continue
        if current is None:
            continue
        if in_table:
            stripped = line.strip()
            if stripped.startswith("|"):
                table_buffer.append(line)
            elif stripped == "":
                # Blank line inside a table — keep table open, drop the line.
                continue
            else:
                _flush_table()
        elif line.strip().startswith("|"):
            # Stray pipe line before a header (rare); start a new buffer.
            table_buffer = [line]
            in_table = True
    _flush_table()

    # Drop any category that didn't gain resources (defensive: a heading
    # whose following section was missing or malformed).
    return [c for c in categories if c.get("resources")]



def build_index(
    categories: list[dict[str, Any]],
    sources: list[dict[str, Any]],
    source_label: str,
) -> dict[str, Any]:
    """Assemble the v2 index payload: sources + summary + lightweight category overview.

    The full per-category `resources[]` arrays live in
    `categories/{slug}.json` (written by `write_per_category_files`).
    `index.json` only carries the `{name, slug, file, counts}` overview
    so the top-level file stays small even for 800+ resources.
    """
    overview: list[dict[str, Any]] = []
    used: set[str] = set()
    total_topics = 0
    total_resources = 0
    for cat in categories:
        resources = cat.get("resources", [])
        if not resources:
            continue
        slug = _unique_slug(_slugify(cat["name"]), used)
        used.add(slug)
        overview.append({
            "name": cat["name"],
            "slug": slug,
            "file": f"categories/{slug}.json",
            "topic_count": 1,  # v2: one topic per category
            "resource_count": len(resources),
        })
        total_topics += 1
        total_resources += len(resources)

    return {
        "schema": SCHEMA_VERSION,
        "generated_at": _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
        "generated_from": source_label,
        "sources": sources,
        "summary": {
            "category_count": len(overview),
            "topic_count": total_topics,
            "resource_count": total_resources,
        },
        "categories": overview,
    }


def write_per_category_files(
    categories: list[dict[str, Any]],
    source_id: str,
    cats_dir: Path,
) -> None:
    """Write one `categories/{slug}.json` per non-empty category.

    Each file carries the full `resources[]` so renderers / data loaders
    can lazy-load by category. The slug derivation must match
    `build_index` exactly — both helpers share the same `used` set
    policy via `_unique_slug`.
    """
    cats_dir.mkdir(parents=True, exist_ok=True)
    used: set[str] = set()
    for cat in categories:
        resources = cat.get("resources", [])
        if not resources:
            continue
        slug = _unique_slug(_slugify(cat["name"]), used)
        used.add(slug)
        rel_file = f"categories/{slug}.json"
        payload = {
            "name": cat["name"],
            "slug": slug,
            "source_id": source_id,
            "file": rel_file,
            "resources": resources,
        }
        (cats_dir / f"{slug}.json").write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )


def _slugify(name: str) -> str:
    """Filesystem-safe slug. Lowercase, ASCII, hyphen-separated, ≤ 64 chars."""
    s = name.lower()
    s = re.sub(r"&", "and", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s[:64] or "uncategorized"


def _unique_slug(base: str, used: set[str]) -> str:
    """Append -2, -3, ... if `base` collides with an already-used slug."""
    if base not in used:
        return base
    i = 2
    while f"{base}-{i}" in used:
        i += 1
    return f"{base}-{i}"


def render_markdown(
    categories: list[dict[str, Any]],
    sources: list[dict[str, Any]],
    upstream_label: str,
) -> str:
    """Render the human-readable index.md mirroring the previous layout."""
    lines: list[str] = []
    lines.append("# Topic Index")
    lines.append("")
    lines.append(
        f"Auto-generated from the registered sources in `references/sources.json` "
        f"(`{upstream_label}`). Each resource is tagged with its "
        f"`[src:source-id]` so the reader can trace provenance. Run "
        f"`python3 scripts/parse_readme.py` to rebuild."
    )
    lines.append("")
    lines.append("**Sources:**")
    for src in sources:
        homepage = src.get("homepage", "")
        if homepage:
            lines.append(f"- `{src['id']}` — [{src.get('label', src['id'])}]({homepage})")
        else:
            lines.append(f"- `{src['id']}` — {src.get('label', src['id'])}")
    lines.append("")
    # Summary table.
    lines.append("| Category | Topics | Resources |")
    lines.append("| --- | ---: | ---: |")
    total_topics = 0
    total_resources = 0
    for cat in categories:
        count = len(cat.get("resources", []))
        topics = 1 if count else 0
        total_topics += topics
        total_resources += count
        lines.append(f"| {cat['name']} | {topics} | {count} |")
    lines.append(f"| **Total** | **{total_topics}** | **{total_resources}** |")
    lines.append("")

    src_id = sources[0]["id"] if sources else "public-api-lists"
    for cat in categories:
        resources = cat.get("resources", [])
        if not resources:
            continue
        lines.append(f"## {cat['name']}")
        lines.append("")
        lines.append(f"### APIs ({len(resources)})")
        lines.append("")
        lines.append("| API | Description | Auth | HTTPS | CORS |")
        lines.append("| --- | --- | --- | :---: | :---: |")
        for r in resources:
            title = r["title"]
            url = r["url"]
            link = f"[{title}]({url})" if url else title
            lines.append(
                f"| {link} `[src:{src_id}]` | {r['description']} | "
                f"{r['auth']} | {r['https']} | {r['cors']} |"
            )
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--readme", default=DEFAULT_README, help="Path to local README snapshot")
    parser.add_argument("--sources", default=DEFAULT_SOURCES, help="Path to sources.json")
    parser.add_argument("--out-json", default=DEFAULT_OUT_JSON, help="Output index.json path")
    parser.add_argument("--out-md", default=DEFAULT_OUT_MD, help="Output index.md path")
    parser.add_argument(
        "--from-url",
        action="store_true",
        help="Fetch upstream from sources[0].upstream_url instead of --readme",
    )
    args = parser.parse_args(argv)

    sources_path = Path(args.sources)
    sources_doc = json.loads(_read_text(sources_path))
    # sources.json is wrapped: {"sources": [ ... ]}
    sources = sources_doc["sources"] if isinstance(sources_doc, dict) and "sources" in sources_doc else sources_doc

    if args.from_url:
        url = sources[0]["upstream_url"]
        md = _fetch_url(url)
        source_label = url
    else:
        readme_path = Path(args.readme)
        if not readme_path.exists():
            print(f"error: README not found at {readme_path}", file=sys.stderr)
            return 1
        md = _read_text(readme_path)
        source_label = str(readme_path)

    categories = parse_markdown(md)
    if not categories:
        print("error: no categories parsed — input may be malformed", file=sys.stderr)
        return 1

    index = build_index(categories, sources, source_label)
    out_json = Path(args.out_json)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Per-category split: each non-empty category gets its own
    # `categories/{slug}.json` carrying the full resources array. This
    # keeps `index.json` lightweight (12 KB for 787 resources) and
    # mirrors the layout used by `rui-code/vite/references/`.
    src_id = sources[0]["id"] if sources else "public-api-lists"
    write_per_category_files(categories, src_id, out_json.parent / "categories")

    md_text = render_markdown(categories, sources, source_label)
    out_md = Path(args.out_md)
    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_md.write_text(md_text, encoding="utf-8")

    total = sum(len(c.get("resources", [])) for c in categories)
    print(
        f"wrote {out_json} and {out_md} "
        f"({len(categories)} categories, {total} resources)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
