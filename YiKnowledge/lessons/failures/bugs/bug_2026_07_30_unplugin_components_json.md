---
title: unplugin-vue-components include regex matched .json files, prepended comment prefix broke rspack JSON parser
key: bug_2026_07_30_unplugin_components_json
tags:
- rsbuild
- unplugin
- json-loader
- build-blocker
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: rsbuild.config
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (rsbuild build:dev)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
After the RAG view was added, `pnpm build:dev` proceeded further but failed on `src/views/dataScreen/assets/china.json` with `Module parse failed: JSON parse error: Unexpected character /`. The first byte of the file, as seen by the parser, was a `/` — but `china.json` on disk begins with `{`. Inspecting the loader chain showed `unplugin-vue-components`'s `transform.mjs` loader had matched the JSON file (because its `include` was `/src\/views\//` — no file-extension anchor) and prepended its `/* unplugin-vue-components disabled */` marker to the file's content. The JSON parser then saw `/* un...` before the leading `{` and aborted. So this was not a malformed JSON file; the file itself was fine — it was the SFC components plugin writing into a file type it shouldn't have touched.

## Steps to Reproduce
1. With `unplugin-vue-components` configured with `include: [/src\/views\//, /src\/components\//, /src\/layouts\//]` and a `.json` file imported from a `.vue` file under `src/views/` (e.g. `ChinaMapChart.vue` importing `../assets/china.json`).
2. `pnpm build:dev`.
3. Rsbuild fails: `File: ./src/views/dataScreen/assets/china.json:1:1 × Module parse failed: JSON parse error: Unexpected character /`.
4. The full loader chain shown in the error includes `unplugin-vue-components/dist/rspack/loaders/transform.mjs`.
5. Inspecting the first line shown back to the user: `1 │ /* unplugin-vue-components disabled */{` — the comment prefix is the cause.

## Expected Result
`unplugin-vue-components` should only transform `.vue` files (its actual scope — registering components used in templates). JSON, TS, and other assets imported by views should be left alone so rspack's native JSON loader can handle them.

## Actual Result
The plugin's `include` regex was too broad — `/src\/views\//` matches any file under `src/views/`, not just `.vue` files. JSON imports originating from view SFCs got hijacked, the plugin prepended its sentinel comment, and rspack's JSON parser rejected the file.

## Cause
The regex was copied from a typical Vite-era config where `unplugin-vue-components` was implicitly scoped to Vue SFCs by the Vite plugin pipeline. Under rspack, the `include` is passed to a raw rspack loader rule that matches on path substring without a file-type anchor, so it sweeps every file under the matched directory — `.json`, `.ts`, `.css`, etc. The plugin itself runs its transform, finds no SFC content to act on, and writes its "disabled" sentinel comment as the entire output. For non-JSON file types this is harmless (the comment is valid JS/TS/CSS), but for JSON the comment is not valid JSON, so the JSON parser aborts at byte 0.

## Solution
Applied — tightened the `include` regexes in `rsbuild.config.ts` to anchor on `.vue` only: `[/src\/views\/.*\.vue$/, /src\/components\/.*\.vue$/, /src\/layouts\/.*\.vue$/]`. The plugin now skips `china.json` (and any other non-Vue file under those directories), letting rspack's native JSON loader handle the import without the sentinel prefix. `ChinaMapChart.vue` now compiles and the build completes. Process follow-up (not yet landed): add a smoke build to CI so this class of loader-misconfiguration surfaces before merge, and document in `rsbuild.config.ts` that `unplugin-vue-components` `include` regexes must be extension-anchored under rspack (Vite's implicit SFC scoping does not apply).
