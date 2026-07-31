---
title: aicr ChatToolbar's "Page context" and "Knowledge RAG" switches rendered as bare
  toggle switches with no visible label — users saw two mystery toggles with only
  hover tooltips to explain them
key: bug_2026_07_31_aicr_chatbar_switches_missing_labels
tags:
- frontend
- yivad
- aicr
- ui
- parity
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/aicr/components/ChatToolbar.vue:ct-context-switch
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiVad Vue 3.5 + Rsbuild 1, Element Plus 2.14)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_aicr_chatbar_switches_missing_labels.md
resolvedAt: 1759395600000
closedAt: null
---

## Description
`YiVad/src/views/aicr/components/ChatToolbar.vue` renders two `el-switch` toggles inside `div.ct-context-switch` wrappers — one for **Page context** (toggle attaching the active session's page content as system context) and one for **Knowledge RAG** (toggle grounding answers in YiKnowledge / the current file via llama_index). The wrappers carry `:title` attributes so a hover tooltip describes what the switch does, but the visible label `<span class="ct-context-label">…</span>` that the sibling `views/aiChat/components/ChatToolbar.vue` renders next to each switch is missing.

So in the aicr sidebar users see two bare toggle switches with no on-screen text. The only way to tell what they toggle is to hover and read the tooltip — a slow discoverability path. Worse, the two switches sit next to each other with no visual distinction, so users很容易 toggle the wrong one (e.g. turning off RAG when they meant to turn off page context).

The sibling `aiChat/ChatToolbar.vue` has the labels: `<span class="ct-context-label">Page context</span>` and `<span class="ct-context-label">Knowledge RAG</span>`. The aicr port never added them — and its scoped SCSS doesn't define `.ct-context-label` either, confirming the omission was complete, not just a CSS class missing.

## Steps to Reproduce
1. Open the aicr page (`/aicr`).
2. Look at the right-hand side of the toolbar (`.ct-right`).
3. Two `el-switch` toggles appear side-by-side inside pill-shaped `.ct-context-switch` containers — no visible text in either container.
4. Hover over one — a tooltip appears describing the switch's effect. Move the mouse away — the tooltip disappears, leaving the bare toggle again.
5. Compare with the aiChat page (`/aiChat`) — the same two switches render with "Page context" and "Knowledge RAG" labels next to them.

## Expected Result
Each switch container renders a `<span class="ct-context-label">{label}</span>` before the `el-switch`, matching the aiChat toolbar. The scoped SCSS defines `.ct-context-label { line-height: 1; }` so the label vertically centres with the switch.

## Actual Result
The aicr toolbar omitted the label spans and the `.ct-context-label` CSS class entirely. Users saw two bare switches and had to hover to learn what they did — slow discoverability, plus risk of toggling the wrong switch when both look identical.

## Cause
When the aicr ChatToolbar was ported from the aiChat ChatToolbar (or authored in parallel), the `<span class="ct-context-label">` markup was dropped from each `.ct-context-switch` wrapper. The `:title` attribute was kept, so the hover-tooltip contract was preserved, but the always-visible label was not. The scoped SCSS correspondingly never grew a `.ct-context-label` rule, so the omission was self-consistent — which is exactly why it escaped review: the file looks "complete" in isolation, and only by diffing against the sibling does the gap appear.

The aiChat port (2026-07-27 per memory) added labels; the aicr port (also 2026-07-27) didn't. Two parallel ports of the same toolbar pattern diverged on one detail. Code review at the time likely compared each against the YiWeb original (which had its own label pattern) rather than against each other, so the divergence wasn't caught.

## Solution
Added the `<span class="ct-context-label">` label before each `el-switch` in `views/aicr/components/ChatToolbar.vue`, mirroring the aiChat toolbar, and added the matching `.ct-context-label` CSS rule:

```diff
       :title="contextEnabled ? 'On: page context attached to requests' : 'Off: page context not attached to requests'"
       @click="emit('toggle-context')"
     >
+      <span class="ct-context-label">context</span>
       <el-switch :model-value="contextEnabled" size="small" @click.stop @update:model-value="emit('toggle-context')" />
     </div>
     <div
       class="ct-context-switch"
       :class="{ 'is-active': ragEnabled }"
       :title="ragEnabled ? 'On: answers grounded in YiKnowledge / current file via llama_index' : 'Off: plain Ollama chat'"
       @click="emit('toggle-rag')"
     >
+      <span class="ct-context-label">RAG</span>
       <el-switch :model-value="ragEnabled" size="small" @click.stop @update:model-value="emit('toggle-rag')" />
     </div>
```

```diff
 .ct-context-switch.is-active {
   color: var(--el-color-primary);
   background: var(--el-color-primary-light-9);
   border-color: var(--el-color-primary-light-5);
 }
+.ct-context-label {
+  line-height: 1;
+}
```

Process follow-up: when porting a component from a sibling page, diff the new file against the sibling after the port — not just against the upstream original. The sibling is the source of truth for *this project's* conventions (label patterns, class names, CSS structure), and a divergence between two ports of the same pattern won't show up if each is reviewed only against the upstream. The cost of a bare-switch-with-no-label is low per instance, but the class of bug — "parallel ports diverged on a detail" — repeats across the codebase (see also the fetch-services auth-header bug, where each service was self-consistent but diverged from the sibling that prompted the fix). Run `git diff` between sibling files after a port, or maintain a checklist of "things every toolbar must have" that the reviewer ticks off per port.
