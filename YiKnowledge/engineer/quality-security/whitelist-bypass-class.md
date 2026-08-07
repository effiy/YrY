---
title: Whitelist bypass class — HTTP paths and inline-replication strategy that bypass the central axios interceptor
tags:
- security
- whitelist
- axios-interceptor
- upload
- hmac
- xss
category: engineer/quality-security
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- security-engineer
- engineer
- oncall-sre
benefit: When new components integrate external uploads / third-party APIs, you can find in one place the class of paths that bypass the central axios and the inline-replication strategy, and stop repeating the same pitfalls
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../YiVad/src/api/index.ts
- ../README.md
tacit: false
---

# Whitelist bypass class — HTTP paths and inline-replication strategy that bypass the central axios interceptor

> **As a** security-engineer,**I want to** a record of "the class of HTTP paths that bypass the central axios interceptor" and "the inline-replication auth strategy",**so that** when new components integrate external uploads / third-party APIs they do not repeat the same pitfalls of upload components bypassing the whitelist.

> The central axios instance (`service`) interceptor handles BASE_API concatenation, attaching X-Token header, HMAC signing, and whitelist-domain switching. But any HTTP path that bypasses `service` does not enjoy these protections. This document abstracts that class of pitfalls and the inline-replication strategy.

## Summary

- **Class**: Element Upload `:action` + `:headers` / native fetch / native XHR / secondary axios instance / SSE EventSource / WebRTC / WebSocket / `<img>` / `<script>` loading external resources
- **Common pitfall**: bypasses the `service` axios interceptor → no token header, no HMAC signature, no whitelist-domain switch
- **Common fix strategy**: **inline-replicate** the auth strategy on every bypass path — fetch the token, query the whitelist for the domain + key pair, sign per domain
- **YiAi RPC case**: SSE / `/read-file` / `/upload-image-to-oss` and other large-file scenarios bypass axios; the token must be manually fetched from the user store and attached to headers

## Core viewpoints

- **The central interceptor coverage is limited** — the axios interceptor only covers requests issued by the `service` instance; Element Upload `:action`, native fetch, SSE EventSource, WebRTC, `<img>` / `<script>` etc. all bypass it, so you must manually replicate the auth strategy on every bypass path
- **YiVad's useMarkdown XSS is a same-origin variant** — `marked.parse()` output goes through `v-html`; marked v15+ removed its sanitizer; raw HTML in AI output or in edited user messages will execute. Fix: escape `<` before parse + neutralize `javascript:` / `vbscript:` URIs. The same-origin essence is "a path that bypasses the central sanitizer" (marked rendering directly)
- **Token handling outside the interceptor must be explicit** — the `RequestHttp` interceptor automatically attaches `X-Token`; bypass paths (SSE / large files / OSS direct upload) must manually fetch the token from the user store and attach it to headers / query params
- **HMAC key pair and domain are bound together** — the whitelist mechanism switches not just the domain but also the key pair; static `hmacConfig.accessKey` and the whitelist mechanism are a conflicting design, you must use a whitelist-aware getter (`getUploadUrlByPath(path)` returning the domain + key pair for that path)

## Key information

### Bypass path class (relevant to this project)

| Class | Mechanism | Auth status | Fix strategy |
|---|---|---|---|
| Element Upload `:action` + `:headers` | direct XHR + FormData, skips axios | ❌ none | change `:action` to a whitelist-aware computed; change `:headers` to use whitelist-aware signing |
| native fetch (large file / SSE / OSS direct upload) | direct fetch API | ❌ none | manually fetch token from user store and attach to headers; switch domain + key pair per whitelist |
| secondary axios instance | `axios.create()` not reusing `service` | ❌ none | reuse the `service` instance; if it must be independent, replicate the interceptor |
| SSE EventSource | browser-native EventSource | ❌ none | token goes via query params (EventSource does not support headers); or use fetch + ReadableStream as a replacement |
| WebRTC / WebSocket | browser-native API | ❌ none | token via query params; domain via whitelist |
| `<img>` / `<script>` loading external resources | browser-native | ❌ none | add token query to the resource URL; domain via whitelist; CORS config |
| marked `v-html` rendering | direct innerHTML | ❌ none | escape `<` before parse; neutralize `javascript:` / `vbscript:` URIs |

### Inline-replication strategy (universal checklist)

When a new component integrates external uploads / third-party APIs / WebRTC / SSE, verify against this checklist:

1. **Path confirmation**: grep whether it goes through the `service` axios instance (`http.post` / `http.get` etc.); if not, add inline auth on that path
2. **Token header**: fetch the token from the user store, attach it to headers (fetch / XHR) or query params (EventSource / WebSocket / WebRTC, since they do not support headers)
3. **BASE_API switching**: when not going through `service`, BASE_API is not concatenated by the axios interceptor; manually query the whitelist for the domain matching that path
4. **HMAC signing**: use a whitelist-aware getter to fetch the key pair for that path, switch to the corresponding key when signing; do not use the static defaults `hmacConfig.accessKey` / `secretKey`
5. **Domain switching**: when the whitelist domain switches, switch URL and signature together; switching only the URL → rejected by backend; switching only the signature → goes to the wrong domain
6. **CORS config**: external domains must be in the whitelist + CORS allowlist; missing either one fails
7. **Error handling**: do not silently swallow 401 / 403; when the user's token expires, the 401 interceptor should redirect to login

### YiVad useMarkdown XSS fix sample

Source facts: [engineer/quality-security/bug-logging-protocol.md](../quality-security/bug-logging-protocol.md) recurring bug pattern

Before fix:
```ts
const html = marked.parse(msg.message);
// v-html="render(msg.message)" direct innerHTML, raw HTML executes
```

After fix (escape `<` + neutralize URIs):
```ts
function render(content: string) {
  const escaped = content.replace(/</g, "&lt;");
  let html = marked.parse(escaped);
  // neutralize javascript: / vbscript: URIs
  html = html.replace(/(javascript|vbscript):/gi, "#");
  return html;
}
```

Mermaid code-block wrapping preserved: the decoder still `unescape`s `&lt;` / `&gt;` etc., so mermaid syntax renders correctly.



- **Do not assume the axios interceptor covers all HTTP requests** — Element Upload `:action` / native fetch / SSE / WebRTC etc. all bypass it; every bypass path needs its own checklist
- **Do not use static URL helpers (`getFileUploadUrl()`)** — they do not query the whitelist, always returning the default domain; the whitelist mechanism is defeated
- **Do not use `hmacConfig.accessKey` / `secretKey` static key pairs** — when the whitelist domain switches, the key pair also switches; static keys always sign the default domain and get rejected by the whitelist-domain backend
- **Do not `v-html="marked.parse(...)"` without sanitization** — marked v15+ has no sanitizer; raw HTML in AI output / edited user messages will execute
- **Do not rely on EventSource headers for the token** — EventSource does not support headers; the token goes via query params, or use fetch + ReadableStream instead
- **Do not silently swallow 401/403** — when upload fails / SSE connection is rejected, the user should know whether the token expired or something else happened; silence makes the user think the upload succeeded

## Action recommendations

When a new component integrates external uploads / third-party APIs / WebRTC / SSE:

1. grep the component's HTTP calls and confirm whether they go through the `service` axios instance
2. If not, fill in the 7 items of the "inline-replication strategy checklist"
3. Run type:check / build, manually test the whitelist-domain switching path
4. Append the new case to `engineer/quality-security/whitelist-bypass-class.md` (this file)

When upgrading existing components:

1. grep `getFileUploadUrl` / `getMouldUploadUrl` / `getImgUploadUrl` and other static URL helpers to confirm no new bypass paths
2. grep `hmacConfig.accessKey` / `hmacConfig.secretKey` static key-pair references to confirm no new ones
3. grep `marked.parse` + `v-html` to confirm all render paths go through escape + URI neutralization
4. grep `fetch(` / `EventSource` / `new WebSocket` to confirm every bypass path has token header attached

## Anti-patterns

- **Adding a new third-party integration by copying the inline-replication code from an existing bypass path without adjusting the whitelist domain and key pair.** The upload component copied from the OSS direct-upload path uses the OSS domain and OSS key pair. The new component integrates with a different third-party service that has a different domain and a different key pair. The copied code authenticates successfully against the wrong service, and the error -- "signature invalid" -- is attributed to the third-party API rather than to the copied domain.
- **Testing the whitelist bypass path only against the default domain and not testing the whitelist-domain switching path.** The developer tests the upload against the default domain, it works, and the code is merged. In production, the whitelist routes the request to a different domain, and the upload fails because the signature was computed with the default domain's key pair but the request went to the whitelist domain. The test must cover all domains in the whitelist configuration, not just the default.
- **Using `marked.parse()` with `v-html` and then adding a sanitization step as an afterthought rather than as a wrapper function that is impossible to bypass.** A developer adds a new Markdown rendering path and calls `marked.parse()` directly, forgetting the sanitization wrapper. The code review does not catch it because the sanitization is not enforced by the module structure. The only defense is to export a single `renderMarkdown()` function that always applies sanitization, and to forbid direct calls to `marked.parse()` via an ESLint rule.
- **Attaching the token to SSE query parameters without encrypting the token in transit.** The token in the query string is logged by the reverse proxy, the CDN, and the backend application server. Every log file that contains the URL now contains a valid authentication token. The token must be encrypted or, better, the SSE connection must be upgraded to use `fetch` + `ReadableStream` which supports custom headers, eliminating the need for query-parameter-based authentication entirely.
- **Adding a new bypass path to the codebase but not appending it to this document (`whitelist-bypass-class.md`).** The document is the single source of truth for all bypass paths. When a new bypass path is added without updating this document, the next security audit will miss it, and the checklist for future integrations will be incomplete. Every PR that introduces a new HTTP path outside the `service` axios instance must include an update to this document.

## Related

- [security-engineer/README.md](../README.md) — Security Engineer working directory
- [engineer/quality-security/bug-logging-protocol.md](./bug-logging-protocol.md) — recurring bug pattern class 5 (stale computed / XSS-style pitfalls); source of the XSS fix facts
- [YiVad/src/api/index.ts](../../../YiVad/src/api/index.ts) — `RequestHttp` central axios instance, interceptor implementation
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template
