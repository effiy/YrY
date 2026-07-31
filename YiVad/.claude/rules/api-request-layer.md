---
description: Axios HTTP request layer — interceptors, error handling, cancellation
globs: src/api/**/*.ts,src/utils/**/*.ts
---

# HTTP Request Layer (Axios)

All HTTP requests go through the `RequestHttp` class in `src/api/index.ts`.

## Architecture

```
RequestHttp (src/api/index.ts)
  ├── Axios interceptors (request/response)
  ├── Error handling (src/api/helper/checkStatus.ts)
  ├── Request cancellation (src/api/helper/axiosCancel.ts)
  └── API modules (src/api/modules/*.ts)
```

## Rules

1. **Base URL** → `RSBUILD_ENV_API_URL` env var; configured in `RequestHttp` constructor
2. **API modules** → `src/api/modules/*.ts` — each exports a function that calls `RequestHttp` methods. Current modules: `login.ts`, `user.ts`, `upload.ts`, `sessions.ts`, `chatService.ts`, `dataService.ts`, `fileService.ts`, `faqService.ts`, `weChatService.ts`, `knowledgeService.ts`, `ragService.ts`.
3. **Never use raw axios** — import and call API modules, not `axios.get()` directly
4. **Error handling** → `checkStatus.ts` maps HTTP status codes to user-facing messages; 401 → redirect to login
5. **Token** → attached in request interceptor from Pinia user store
6. **Cancellation** → `axiosCancel.ts` manages `AbortController` map by request key; cancel duplicate requests
7. **Response types** → define interfaces for API responses; use the unified `{ code, message, data }` envelope
