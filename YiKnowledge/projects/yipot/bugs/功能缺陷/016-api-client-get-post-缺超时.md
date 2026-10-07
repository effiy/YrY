---
title: "api/client.ts get()/post() 缺少超时和信号清理"
tags: [bug, frontend, api, timeout, signal-cleanup, fetch]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/api/client.ts
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# api/client.ts get()/post() 缺少超时和信号清理

---

## 一、现象

> `get()` 和 `post()` 方法无超时控制，网络异常时请求可能无限挂起。且 `AbortSignal` 事件监听器未在 finally 中清理，存在微小内存泄漏。

## 二、根因

`rpc()` 方法有完善的 `AbortController` + `timeout` + `finally` 清理模式，但 `get()`/`post()` 是简化版实现：

```ts
// Before: get()/post() — 无超时，无 signal 清理
async function get(path, signal?) {
    try {
        const r = await fetch(url, { headers: authHeaders(), signal });
        // ... no timeout, no signal cleanup
    } catch(err) { ... }
}
```

## 三、修复

为 `get()`/`post()` 补充与 `rpc()` 一致的超时 + 信号管理模式：

```ts
async function get(path, signal?) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const onAbort = () => controller.abort();
    if (signal) signal.addEventListener('abort', onAbort);
    try {
        const r = await fetch(url, { headers: authHeaders(), signal: controller.signal });
        clearTimeout(timeoutId);
        // ... response handling
    } catch(err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') return { ok: false, error: 'Request timed out' };
        // ...
    } finally {
        if (signal) signal.removeEventListener('abort', onAbort);
    }
}
```

同时补充了 `get()`/`post()` 的非 JSON 响应处理（与 `rpc()` 对齐）。

## 四、验证

- [x] `pnpm build` 通过
- [ ] `get()`/`post()` 请求超时后正确返回错误
- [ ] YiAi 健康检查（`/health`）超时后正常降级