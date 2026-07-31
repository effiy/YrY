---
title: Direct-fetch services read X-Token from "YiWeb.apiToken.v1" — a localStorage
  key that is never written; every chat/RAG/file/knowledge/weChat request sent an
  empty token
key: bug_2026_07_30_fetch_services_wrong_token_key
tags:
- frontend
- auth
- token
- regression
- fetch
- pinia
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: api/modules/chatService, api/modules/fileService, api/modules/knowledgeService, api/modules/ragService, api/modules/weChatService
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (browser runtime, YiAi backend on localhost:10086)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
Five direct-fetch service modules in `YiVad/src/api/modules/` attached the JWT to outgoing requests by reading `localStorage.getItem("YiWeb.apiToken.v1")`:

- `chatService.ts:streamChat` — SSE chat (every AI message)
- `ragService.ts:postJson` + `runStream` — RAG query / status / build / chat-stream / file-chat-stream
- `knowledgeService.ts:postJson` — knowledge scan / read / stories / files
- `fileService.ts:readFile/writeFile/deleteFile/deleteFolder/renameFile/renameFolder/uploadImageToOss` — file I/O
- `weChatService.ts:sendWeChatMessage` — WeCom bot dispatch

**The `"YiWeb.apiToken.v1"` key is never written anywhere in the codebase.** The login flow (`views/login/components/LoginForm.vue`) calls `userStore.setToken(data.access_token)`, which writes into the Pinia user store (`defineStore("yivad-user", ...)`). `pinia-plugin-persistedstate` then serializes the entire user state (`{ token, userInfo }`) to `localStorage` under the key `"yivad-user"` (per `persist: piniaPersistConfig("yivad-user")`). There is no code path that copies the token out into a separate `"YiWeb.apiToken.v1"` key — every `localStorage.getItem("YiWeb.apiToken.v1")` call returned `null`, and the `?? ""` fallback sent `X-Token: ""` on every direct-fetch request.

This was invisible only because YiAi's auth middleware is **disabled by default** (`shared.config.settings.auth_enabled = False`), so the backend accepted the empty-token requests anyway. The moment auth is enabled, every chat, RAG, knowledge, file, and WeCom request would 401.

The Axios-based RPC calls (`api/index.ts:RequestHttp`) are unaffected — the request interceptor reads `userStore.token` from the live Pinia store and sets `Authorization: Bearer ${token}`. Only the direct-fetch services (which bypass Axios because they need `ReadableStream` for SSE or large payloads) were broken.

## Steps to Reproduce
1. Log in at `/#/login` with admin/123456.
2. Open DevTools → Application → Local Storage. Observe: only `yivad-user` (and other Pinia keys) exist — no `YiWeb.apiToken.v1`.
3. Send a chat message in `/aiChat` or `/aicr`. Network tab shows the SSE request to `http://localhost:10086/` carries `X-Token: ""`.
4. Click "Read" on any knowledge file in aicr's Knowledge tab. The `/knowledge-read` request also carries `X-Token: ""`.
5. Toggle `settings.auth_enabled = True` on the YiAi backend and restart — every chat/RAG/file/knowledge request now returns 401.

## Expected Result
Direct-fetch services read the JWT from the same source the Axios interceptor uses: the Pinia `userStore.token` (persisted under `localStorage["yivad-user"]` as `JSON.stringify({token, userInfo})`). The `X-Token` header on every fetch-based request carries the actual JWT, so the requests survive auth being enabled.

## Actual Result
Five services read from a localStorage key that was never written. Every outgoing direct-fetch request carried `X-Token: ""`. Worked only because auth was disabled.

## Cause
The fetch-based services were ported from YiWeb (an older sibling project) verbatim, including the `YiWeb.apiToken.v1` token-key constant. YiWeb had its own separate login flow that wrote to that exact key; YiVad's port replaced the login flow with a Pinia user store (`yivad-user`) but did not update the direct-fetch services' token-reading code to match. The Axios path was updated (the interceptor reads from `userStore.token`), but the fetch path was missed.

Two things hid the bug:
1. Auth disabled by default — backend accepted empty tokens silently.
2. The `?? ""` fallback turned a missing-key null into an empty string without throwing, so no console error surfaced the mismatch.

## Solution
Added a single source-of-truth helper to `src/config/yiweb.ts`:

```ts
export function getYiAiToken(): string {
  try {
    const raw = localStorage.getItem("yivad-user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.token ?? "";
  } catch {
    return "";
  }
}
```

Updated all five fetch-based services to call `getYiAiToken()` instead of `localStorage.getItem("YiWeb.apiToken.v1")`. Removed the dead `TOKEN_KEY` constant and `getToken()` wrapper from each module. The Axios path is unchanged — it already read from the live Pinia store.

`vue-tsc --noEmit` passes.

Process follow-up: when porting code from a sibling project, audit every localStorage key reference against the new project's persistence layout — especially keys touched at module load / request issue time, which silently corrupt the request rather than failing loud. A `localStorage.getItem(k) ?? ""` fallback is a smell: it converts "missing key" (a real bug) into "empty string sent" (a silent bug). Prefer a helper that knows the persistence shape.
