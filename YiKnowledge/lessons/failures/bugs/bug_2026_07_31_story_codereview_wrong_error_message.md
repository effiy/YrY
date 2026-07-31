---
title: story/index.vue handleCodeReview catch block showed the success message
  ("Files added to aicr sidebar") as a red error toast — users saw a misleading
  success-flavored message when the operation actually failed
key: bug_2026_07_31_story_codereview_wrong_error_message
tags:
- frontend
- yivad
- i18n
- error-handling
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
module: views/story/index.vue:handleCodeReview
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiVad Vue 3.5 + Rsbuild 1, Element Plus 2.14, vue-i18n 11)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_story_codereview_wrong_error_message.md
resolvedAt: 1759305600000
closedAt: null
---

## Description
`YiVad/src/views/story/index.vue:handleCodeReview` wraps the "Send files to aicr sidebar" flow in a `try { ... } catch (err) { ElMessage.error(t("story.codeReviewAdded")); }`. The catch block reuses the **success** i18n key (`story.codeReviewAdded` — `"Files added to aicr sidebar"`) for the **error** toast.

So when `ensureFilesInTree` or `router.push("/aicr")` throws, the user sees a RED ERROR toast saying `"Files added to aicr sidebar"` — a success-flavored message with an error-styled background. The user has no way to tell from the toast that nothing was actually added. The `console.error` log carries the real signal, but the visible toast misleads.

The success branch (line 132) uses the same key with `ElMessage.success(...)` — that's the intended use. The catch branch (line 136) should have used a separate failure key.

## Steps to Reproduce
1. Open the story page (`/story`).
2. Trigger a code-review send where the underlying `aicrFileTreeStore.ensureFilesInTree(paths)` throws — e.g. the YiAi backend is down, or the path list contains a path that fails the `fileService.readFile` validation.
3. The catch block fires with `ElMessage.error(t("story.codeReviewAdded"))`.
4. User sees a red error toast reading `"Files added to aicr sidebar"` — implying success, in error styling.
5. Navigation to `/aicr` never happens, but the toast claims the files were added.

## Expected Result
The catch block shows a failure-specific message — e.g. `t("story.codeReviewFailed")` → `"Failed to add files to aicr sidebar"`. The success key (`codeReviewAdded`) is only used in the success branch.

## Actual Result
Both success and error branches used the same i18n key. On failure the user saw `"Files added to aicr sidebar"` painted as a red error toast, with no way to distinguish failure from success without reading the dev console.

## Cause
The catch block was likely copy-pasted from the success block and the i18n key was never swapped to a failure-specific one. The `ElMessage.error(...)` wrapper changed the toast's visual styling but the underlying string still described the success outcome. This is the same class as bug_2026_07_30_i18n_or_fallback_trap — an i18n key chosen for one path (success) and reused in another path (error) without updating the semantic.

## Solution
1. Added a new i18n key `story.codeReviewFailed` to both `en.ts` and `zh.ts`:
   - `en.ts`: `codeReviewFailed: "Failed to add files to aicr sidebar"`
   - `zh.ts`: `codeReviewFailed: "添加文件到 aicr 侧栏失败"`
2. Swapped the catch block's toast to use the new key:
   ```ts
   } catch (err) {
     console.error("Code Review navigation failed:", err);
     ElMessage.error(t("story.codeReviewFailed"));
   }
   ```

Process follow-up: when copy-pasting a try/catch where the success branch already uses an i18n key, the catch branch must use a *different* key that describes the failure outcome — never the same key. A red toast with a success message is worse than a generic "Failed" toast because it actively misleads. Pairs of `codeReviewAdded` / `codeReviewFailed`, `saveSuccess` / `saveFailed`, etc. should be the convention. When reviewing a PR that adds a catch block, check that its i18n key is failure-flavored — if it's the same key as the success branch, that's a smell.
