---
name: yry-report-files
description: >
  Archived file-report skill assets. The one-off analyzer entrypoint has
  been removed; templates, rules, and references remain for manual reuse.
---

# yry-report-files

This skill is now a static reference bundle.

## Status

- The bundled analyzer script has been removed.
- The CLI command entry for this skill has been removed.
- `templates/`, `references/`, and `rules/` are kept as source material
  for manual report assembly or future replacement work.

## What remains

- `templates/` documents the Vue 3 page structure and component split.
- `references/` preserves the scoring and methodology notes.
- `rules/analysis-contracts.md` preserves the historical data contract.

## Notes

- Do not instruct users to run the removed analyzer entrypoint.
- Any generated report output must now come from an external workflow or
  a future replacement implementation.
