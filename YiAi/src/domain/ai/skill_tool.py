"""Skill capability tool — Pi/dsh ``skill/`` parity.

Exposes the YiKnowledge skill suite (``<knowledge_base>/skills/*/SKILL.md``) to
the agent as two read-only tools: ``skill_list`` (catalog with parsed frontmatter)
and ``skill_load`` (full body + listed auxiliary resources). Path traversal is
rejected by resolving against the skills directory. Read-only — never gated by
the confirmation flow.
"""

from __future__ import annotations

import logging
import os
from typing import Any, Dict, List, Optional

from domain.ai.tools import ToolDefinition

logger = logging.getLogger(__name__)


def _skills_dir() -> str:
    from shared.config import settings
    return os.path.realpath(os.path.abspath(os.path.join(settings.knowledge_base_dir, "skills")))


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split ``SKILL.md`` into (frontmatter_dict, body_text)."""
    import re
    import yaml
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.DOTALL)
    if not m:
        return {}, text
    try:
        meta = yaml.safe_load(m.group(1)) if m.group(1).strip() else {}
    except Exception:
        meta = {}
    if not isinstance(meta, dict):
        meta = {}
    return meta, m.group(2).lstrip("\n")


def _list_skills() -> List[Dict[str, Any]]:
    base = _skills_dir()
    out: List[Dict[str, Any]] = []
    if not os.path.isdir(base):
        return out
    for entry in sorted(os.listdir(base)):
        skill_dir = os.path.join(base, entry)
        skill_file = os.path.join(skill_dir, "SKILL.md")
        if not os.path.isdir(skill_dir) or not os.path.isfile(skill_file):
            continue
        try:
            with open(skill_file, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
        except OSError:
            continue
        meta, _ = _parse_frontmatter(text)
        out.append({
            "name": str(meta.get("name", entry)),
            "description": str(meta.get("description", "")),
            "tags": meta.get("tags", []) if isinstance(meta.get("tags"), list) else [],
            "chip": str(meta.get("chip", "")),
            "category": str(meta.get("category", "")),
        })
    return out


def list_skills() -> List[Dict[str, Any]]:
    """Return the skill catalog (name/description/tags/chip/category) for discovery UIs."""
    return _list_skills()


def _resolve_skill(name: str) -> Optional[str]:
    """Resolve a skill name to its SKILL.md path, rejecting traversal."""
    base = _skills_dir()
    if not name or not isinstance(name, str):
        return None
    # Reject any path-like input — names are directory names only.
    if "/" in name or "\\" in name or name in (".", ".."):
        return None
    skill_file = os.path.join(base, name, "SKILL.md")
    real = os.path.realpath(os.path.abspath(skill_file))
    if os.path.commonpath([base, real]) != base or not os.path.isfile(real):
        return None
    return real


async def _skill_list(args: Dict[str, Any]) -> Dict[str, Any]:
    skills = _list_skills()
    if not skills:
        return {"content": "No skills found under the knowledge base skills/ directory."}
    lines = [f"{len(skills)} skills available:"]
    for s in skills:
        desc = (s["description"] or "").strip()
        lines.append(f"- **{s['name']}**: {desc}" + (f" [tags: {', '.join(s['tags'])}]" if s["tags"] else ""))
    return {"content": "\n".join(lines)}


async def _skill_load(args: Dict[str, Any]) -> Dict[str, Any]:
    name = str(args.get("name", "")).strip()
    skill_file = _resolve_skill(name)
    if not skill_file:
        return {"content": "", "error": f"Unknown skill: {name!r}. Use skill_list to see available skills."}
    try:
        with open(skill_file, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
    except OSError as e:
        return {"content": "", "error": f"Failed to read skill {name!r}: {e}"}

    _meta, body = _parse_frontmatter(text)

    # List auxiliary resources (steps/, rules/, references/, assets/) so the
    # model can request them by path if needed.
    skill_dir = os.path.dirname(skill_file)
    resources: List[str] = []
    for sub in ("steps", "rules", "references", "assets", "examples"):
        sub_path = os.path.join(skill_dir, sub)
        if os.path.isdir(sub_path):
            for root, _dirs, files in os.walk(sub_path):
                for fn in sorted(files):
                    rel = os.path.relpath(os.path.join(root, fn), skill_dir)
                    resources.append(rel.replace(os.sep, "/"))

    content = body.strip() or "(empty body)"
    if resources:
        content += "\n\nAuxiliary resources:\n" + "\n".join(f"- {r}" for r in resources[:50])
    return {"content": f"# Skill: {name}\n\n{content}"}


def register_skill_tool(registry) -> None:
    registry.register(ToolDefinition(
        name="skill_list",
        description=(
            "List the available reusable skills (from the YiKnowledge skills/ suite), "
            "each with its name and one-line description. Call this to discover whether "
            "a skill exists for a task before loading it."
        ),
        parameters={"type": "object", "properties": {}},
        execute=_skill_list,
        requires_confirmation=False,
    ))
    registry.register(ToolDefinition(
        name="skill_load",
        description=(
            "Load a skill's full instructions by name (the name returned by skill_list). "
            "Returns the SKILL.md body plus any auxiliary resources. Use it to follow a "
            "proven procedure for a task instead of improvising."
        ),
        parameters={
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "The skill name to load."},
            },
            "required": ["name"],
        },
        execute=_skill_load,
        requires_confirmation=False,
    ))
