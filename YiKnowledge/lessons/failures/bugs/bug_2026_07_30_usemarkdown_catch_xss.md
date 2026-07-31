---
title: useMarkdown catch fallback returned raw md into v-html, re-introduced HTML-injection vector when marked.parse threw
key: bug_2026_07_30_usemarkdown_catch_xss
tags:
- xss
- markdown
- v-html
- security
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: hooks/useMarkdown
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (browser runtime)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: rarely
---

## Description
`hooks/useMarkdown.ts::render` is the composable that backs every `v-html` markdown render in the app (aiChat, aicr chat, story detail, bug detail, RAG playground). On the happy path it pre-escapes `<` to `&lt;` before calling `marked.parse`, so raw HTML in AI output or user-edited messages is rendered as text. But the `catch` fallback at line 43 returned `` `<p>${md}</p>` `` with the **raw un-escaped `md`** — so any input that made `marked.parse` throw would skip the escape and land in `v-html` verbatim. Because every consumer renders the result via `v-html`, a payload like `<img src=x onerror=alert(1)>` that happened to break `marked`'s parser would execute in the user's session. The escape on the happy path was correct; the catch path re-opened the same vector it was meant to close.

## Steps to Reproduce
1. Identify an input string that (a) contains an HTML-injection payload and (b) makes `marked.parse` throw — e.g. a deeply-nested or malformed markdown structure with an embedded `<script>` or `<img onerror>` tag. (`marked` is generally robust, but pathological inputs exist; the catch exists precisely because parse can throw.)
2. Feed it to `useMarkdown().render` from any consumer that renders via `v-html` (aiChat / aicr / story / bug detail / RAG playground).
3. The catch path runs, returns `` <p>${md} </p> `` with raw `md` — `<script>` / `<img onerror>` survives into the DOM via `v-html`.
4. The payload executes in the user's session.

## Expected Result
Every output of `useMarkdown().render` is HTML-safe — including the fallback path when `marked.parse` throws.

## Actual Result
The fallback path returned the raw markdown concatenated into a `<p>` tag, bypassing the pre-parse escape. The escape on the happy path and the lack of escape on the fallback path were inconsistent — a single code path with two branches where one was safe and the other was not.

## Cause
The composable was written to be defensive on the happy path (escape `<` before `marked.parse`) but the catch branch was added later (or written in haste) without carrying the same escape through. This is the classic "two branches, one invariant" defect — when an invariant (raw user input must be escaped before reaching `v-html`) is enforced in only some of the branches that produce output for `v-html`, any input that takes the un-enforced branch re-opens the vector. The bug was latent because `marked.parse` rarely throws, but "rarely" is not "never" — any future marked version that tightens its parser, or any pathological user/AI input, would surface it.

## Solution
Applied — the `catch` fallback now escapes `md` (`<` → `&lt;`, `>` → `&gt;`) before concatenating into the `<p>` tag, matching the pre-parse escape on the happy path. Both branches of `render` now produce HTML-safe output. Process follow-up (not yet landed): (a) extract the escape into a `escapeHtml` helper so the two branches can't drift apart again — the invariant lives in one function, not two; (b) add a property-based test that feeds `render` a fuzz corpus of malformed inputs and asserts the output never contains an unescaped `<` outside of markup that `marked` itself emitted; (c) document in `CLAUDE.md` that any helper backing a `v-html` must enforce the escape invariant in every branch, not just the happy path.
