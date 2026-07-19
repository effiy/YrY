window.REPORT_DATA = {
  "meta": {
    "pageTitle": "beautiful-mermaid footprint",
    "subtitle": "Docs-only dependency · docs-only · 2 hit files across .claude/skills",
    "upstream": "https://www.npmjs.com/package/beautiful-mermaid",
    "footer": "Generated for .claude/docs/deps/beautiful-mermaid/index.html · package beautiful-mermaid · 2 hit files · 1 skill roots · rebuilt 2026-07-19"
  },
  "metrics": [
    {
      "label": "Version",
      "value": "docs-only",
      "sub": "Docs-only dependency",
      "tone": "cyan"
    },
    {
      "label": "Skill roots",
      "value": "1",
      "sub": "top rui-tools/mermaid",
      "tone": "cyan"
    },
    {
      "label": "Direct files",
      "value": "1",
      "sub": "manifest + lockfile + source",
      "tone": "violet"
    },
    {
      "label": "Hit files",
      "value": "2",
      "sub": "literal matches in catalog",
      "tone": "amber"
    },
    {
      "label": "Occurrences",
      "value": "8",
      "sub": "all matches combined",
      "tone": "rose"
    }
  ],
  "summaryCards": [
    {
      "tone": "cyan",
      "title": "Adoption footprint",
      "items": [
        "Docs-only dependency at version docs-only.",
        "1 skill roots mention it; top consumer is rui-tools/mermaid.",
        "1 direct files and 1 reference-only files currently match the package string."
      ]
    },
    {
      "tone": "violet",
      "title": "Where to review first",
      "items": [
        ".claude/skills/rui-tools/mermaid/SKILL.md (5 matches, reference)",
        ".claude/skills/rui-tools/mermaid/evals/evals.json (3 matches, direct)"
      ]
    },
    {
      "tone": "cyan",
      "title": "Change risk",
      "items": [
        "No active manifest declaration; treat this as a docs-only or reference footprint.",
        "No lockfile hotspot detected for this package in the current catalog.",
        "Upstream reference is www.npmjs.com."
      ]
    }
  ],
  "ownership": [
    {
      "skillRoot": "rui-tools/mermaid",
      "fileCount": 2,
      "occurrences": 8,
      "primaryFile": ".claude/skills/rui-tools/mermaid/SKILL.md",
      "usageType": "reference"
    }
  ],
  "reviewNotes": [
    "Scanned 874 text files under .claude/skills for literal matches.",
    "Literal matching is intentionally conservative: it catches manifest declarations, lockfile entries, source imports, and documentation mentions.",
    "This package is not in the active diagram package.json; it stays in the report set because the skills catalog still references it."
  ],
  "hitFiles": [
    {
      "path": ".claude/skills/rui-tools/mermaid/SKILL.md",
      "occurrences": 5,
      "skillRoot": "rui-tools/mermaid",
      "fileKind": "docs",
      "usageType": "reference"
    },
    {
      "path": ".claude/skills/rui-tools/mermaid/evals/evals.json",
      "occurrences": 3,
      "skillRoot": "rui-tools/mermaid",
      "fileKind": "config",
      "usageType": "direct"
    }
  ],
  "diagram": {
    "mode": "footprint",
    "package": {
      "title": "beautiful-mermaid",
      "desc": [
        "Mermaid rendering helper referenced by the rui-tools/merma",
        "id skill docs and eval guidance."
      ],
      "stats": [
        "2 hit files · 1 direct touchpoints · 1 skill roots",
        "upstream www.npmjs.com"
      ]
    },
    "dashboard": {
      "title": "Docs Dashboard",
      "sub": "dependency entry",
      "hint": "Docs-only dependency"
    },
    "anchor": {
      "title": "Source",
      "lines": [
        "docs-only references",
        ""
      ],
      "hint": "docs-only"
    },
    "context": {
      "title": "rui-tools/mermaid",
      "sub": "2 hit files"
    },
    "evidence": {
      "title": "Primary file hotspot",
      "sub": "skills/rui-tools/mermaid/SKILL.md",
      "hint": "5 literal matches"
    },
    "report": {
      "title": "Report page",
      "sub": "docs/deps/beautiful-mermaid/index.html",
      "hint": "static report rebuilt on 2026-07-19"
    }
  }
};
