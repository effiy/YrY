---
name: diagram-create
description: >
  Create a polished dark-themed architecture diagram as a self-contained HTML+SVG
  file from a written brief.
---

# Architecture Diagram — Create

Create a self-contained architecture-diagram page from requirements.

## Scope

- This command now supports requirements-driven authoring only.
- The previous codebase-analysis workflow and bundled helper scripts have been removed.

## Options

- `$ARGUMENTS` may contain:
  - `--out <path>` — Output file path. Defaults to `./index.html` in CWD.
  - `--language <lang>` — Generate textual content in the requested language. Defaults to `en`.

## Workflow

1. Gather the system brief if the user has not provided one.
2. Read the 4 template files in `YiDoc/templates/diagram/` before editing output.
3. Plan component groups, boundaries, and connection flow.
4. Build the SVG and summary cards.
5. Save the final self-contained page and report the output path.

## Brief Checklist

Ask for the missing pieces when necessary:

- system name or architecture subject
- major components and data stores
- connection types or protocols
- deployment or security boundaries
- desired detail level

## Output Rules

1. Keep the page self-contained and avoid public CDNs.
2. Draw SVG elements in this order: defs, grid, arrows, masks, boxes, boundaries, legend.
3. Use exactly 3 summary cards with concrete technical language.
4. Label every arrow with protocol, data type, or action.
5. Omit empty sections instead of adding placeholders.

## Deliver

- Save one browser-viewable HTML artifact.
- Report the output path and a one-line architecture summary.
