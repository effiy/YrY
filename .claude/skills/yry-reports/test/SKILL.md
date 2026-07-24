---
name: yry-report-test
description: >
  Archived test report assets. The one-off analyzer entrypoint has
  been removed; scene references and rules remain for manual reuse.
  The template shell has been consolidated into YiDoc/templates/test/.
lifecycle: default-pipeline
user_invocable: false
---

# yry-report-test

This skill is now a static reference bundle.

## Status

- The bundled analyzer script has been removed.
- The CLI command entry for this skill has been removed.
- The skill is no longer intended to be invoked as an executable
  report generator.
- Template assets have been **moved to `YiDoc/templates/test/`** as
  the single source of truth. The skill no longer carries a
  `templates/` subdirectory. Per-project output is a regenerated
  `data.js` written to `YiDoc/projects/<project>/test/data.js`.

## What remains

- `YiDoc/templates/test/` keeps the Vue 3 report shell and scene
  presentation assets (shared across all projects).
- `references/` preserves the scene catalog and methodology notes.
- `rules/` preserves the historical payload contract.

## Notes

- Do not instruct users to run the removed analyzer entrypoint.
- Any future report generation must come from a replacement workflow
  that reads the shell from `YiDoc/templates/test/` and writes only
  `YiDoc/projects/<project>/test/data.js`.
