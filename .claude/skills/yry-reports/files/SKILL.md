---
name: yry-report-files
description: >
  Archived file-report skill assets. The one-off analyzer entrypoint has
  been removed; references and rules remain for manual reuse. The
  template shell has been consolidated into YiDoc/templates/files/.
---

# yry-report-files

This skill is now a static reference bundle.

## Status

- The bundled analyzer script (`analyze.js`) remains at the skill root
  for manual invocation but is no longer wired to a CLI entry.
- The CLI command entry for this skill has been removed.
- Template assets have been **moved to `YiDoc/templates/files/`** as
  the single source of truth. The skill no longer carries a
  `templates/` subdirectory. Per-project output is a regenerated
  `data.js` written to `YiDoc/projects/<project>/files/data.js`.
- `references/` preserves the scoring and methodology notes.
- `rules/analysis-contracts.md` preserves the historical data contract.

## What remains

- `YiDoc/templates/files/` documents the Vue 3 page structure and
  component split (shared across all projects).
- `references/` preserves the scoring and methodology notes.
- `rules/analysis-contracts.md` preserves the historical data contract.

## Notes

- Do not instruct users to run the removed CLI entry.
- Any generated report output must now come from an external workflow
  or a future replacement implementation. When it does, only write
  `YiDoc/projects/<project>/files/data.js`; read the shell from
  `YiDoc/templates/files/`.
- **Current state (manual deployment)**: each project's `files/index.html`
  is a path-adjusted byte-copy of `YiDoc/templates/files/index.html`
  (template uses depth-3 paths `../../../YiPet/cdn/`; project uses depth-4
  paths `../../../../YiPet/cdn/` + `../../../templates/files/`). All 6
  projects' `files/index.html` are byte-identical to each other. css/js/app
  are NOT copied — only the HTML shell is. A future loader-based
  consolidation (one shared `index.html` served to all projects via
  `?project=` query param) would eliminate this last duplication.
