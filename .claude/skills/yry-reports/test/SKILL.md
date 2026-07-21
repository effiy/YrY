---
name: yry-report-test
description: >
  Archived test report assets. The one-off analyzer entrypoint has
  been removed; templates, scene references, and rules remain for manual reuse.
lifecycle: default-pipeline
user_invocable: false
---

# yry-report-test

This skill is now a static reference bundle.

## Status

- The bundled analyzer script has been removed.
- The CLI command entry for this skill has been removed.
- The skill is no longer intended to be invoked as an executable report generator.

## What remains

- `templates/` keeps the Vue 3 report shell and scene presentation assets.
- `references/` preserves the scene catalog and methodology notes.
- `rules/` preserve the historical payload contract.

## Notes

- Do not instruct users to run the removed analyzer entrypoint.
- Any future report generation must come from a replacement workflow that
  reuses the retained templates and references.
