---
key: bug_2026_07_31_yivad_error_interceptor_decrements_loading_counter_unconditionally
title: Error interceptor decremented loading counter even for loading:false requests
  — spinner disappeared prematurely
project: YiVad
module: api/index.ts
severity: medium
priority: medium
status: fixed
type: logic
iteration: loop-2026-07-31
assignee: claude
---

## Description

`YiVad/src/api/index.ts`'s response interceptor has two branches:

- **Success path** (line 68): `config.loading && tryHideFullScreenLoading()` — only decrements if THIS request incremented the counter (i.e., `config.loading === true`).
- **Error path** (line 86, before fix): `tryHideFullScreenLoading()` — unconditional, no `config.loading` check.

The full-screen loading indicator uses a counter (`needLoadingRequestCount` in `components/Loading/fullScreen.ts`):
- `showFullScreenLoading()` increments, starts the spinner when count goes 0→1.
- `tryHideFullScreenLoading()` decrements, ends the spinner when count goes 1→0. Guarded against negative.

The success path honors `config.loading` — a `{ loading: false }` request never increments, so it never decrements. The error path ignored this: it decremented on every error, regardless of whether the request had shown loading.

This corruption has two visible symptoms:

1. **Premature spinner hide.** Request A (`{ loading: true }`) starts → count=1, spinner shown. Request B (`{ loading: false }`) errors → unconditional `tryHideFullScreenLoading()` → count=0 → spinner hidden. Request A is still pending, but the spinner is gone. The user thinks the app is done loading.
2. **Counter underflow (clamped).** If B errors while no `loading:true` request is in flight, the `<= 0` guard catches the underflow, so the spinner doesn't un-hide. But the log is now "off by one" until a future `showFullScreenLoading` evens it out.

## Steps to Reproduce

1. User opens a page that triggers a slow `loading:true` request (e.g., ProTable fetch).
2. While the spinner is visible, a background `{ loading: false }` request fires (e.g., aicr's auto-save, WeCom auto-forward, a heartbeat, a tag universe refresh).
3. The background request fails (e.g., 500 from the backend, network blip).
4. Error interceptor runs: `tryHideFullScreenLoading()` — count 1→0 → `endLoading()` called → spinner hidden.
5. The `loading:true` request is still in flight. User sees no spinner. When it completes, the success path's `config.loading && tryHideFullScreenLoading()` runs, but the guard `if (count <= 0) return` short-circuits — count stays at 0, no double-close.
6. The user sat through the rest of the slow request with no spinner, and any "loading-dependent" UI (e.g., disable-during-loading buttons) re-enabled prematurely.

## Expected Result

The error path mirrors the success path: only decrements the loading counter if `config.loading === true`. A `{ loading: false }` request that errors must not touch the counter.

## Actual Result

The error path called `tryHideFullScreenLoading()` unconditionally. Any `{ loading: false }` request failure corrupted the counter — most visibly, prematurely hiding the spinner while other `loading:true` requests were still in flight. The success path's symmetric guard made the bug asymmetric: success was safe, error was not.

## Cause

The author wrote the error path as a "just clean up everything" branch — but `tryHideFullScreenLoading` is counter-based, not flag-based. Unconditionally decrementing is NOT safe just because the request errored: the counter reflects "how many in-flight requests asked for a spinner," and an erroring request that never asked still decremented.

The success path was written with the correct guard (`config.loading && tryHideFullScreenLoading()`). The error path was likely copy-pasted from an earlier version before the guard was added, or the author assumed "if we're erroring, just hide the spinner regardless" — which is wrong when multiple concurrent requests share the counter.

Also missing on the error path: `axiosCanceler.removePending(config)`. The success path calls it to free the pending-map entry; the error path relied on the next identical request's `addPending` to call `removePending` first. That's a self-correcting leak, not a correctness bug — but it leaves stale entries in `pendingMap` between failures and the next retry.

## Solution

Mirror the success path in the error interceptor: extract `config` from the error (or `response.config`), call `removePending`, and guard the `tryHideFullScreenLoading` call with `config.loading`:

```diff
       async (error: AxiosError) => {
         const { response } = error;
-        tryHideFullScreenLoading();
+        // Mirror the success path: only decrement the loading counter if THIS
+        // request actually incremented it (config.loading === true). The
+        // previous unconditional call corrupted the counter when a
+        // `{ loading: false }` request (e.g. background poll, auto-save,
+        // WeCom auto-forward) errored while a `loading:true` request was
+        // still in flight — the spinner would disappear prematurely.
+        const config = (error.config ?? response?.config) as CustomAxiosRequestConfig | undefined;
+        if (config) {
+          axiosCanceler.removePending(config);
+          if (config.loading) tryHideFullScreenLoading();
+        } else {
+          tryHideFullScreenLoading();
+        }
         // Request timeout && network error judged separately, no response
         if (error.message.indexOf("timeout") !== -1) ElMessage.error("Request timed out! Please try again later");
         if (error.message.indexOf("Network Error") !== -1) ElMessage.error("Network error! Please try again later");
```

Process follow-up: when an HTTP client uses a counter-based loading indicator (show/hide must be balanced per-request), the error path MUST mirror the success path's "did this request show loading?" check. `tryHideFullScreenLoading()` is NOT idempotent — it decrements, and decrementing without a matching increment corrupts the count. The smell: an interceptor that says "always clean up on error" is wrong when the cleanup operation is a decrement rather than a force-close. The correct pattern is `if (config.loading) tryHideFullScreenLoading()` on BOTH branches, paired with `removePending(config)` to free the canceler map entry.