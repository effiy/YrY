---
title: relay.ts中chat注入的apiBase硬编码指向错误端口
tags: [yipet, bug, api, configuration]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: medium
priority: p1
---

# relay.ts 中 chat 注入的 apiBase 硬编码指向错误端口

## 现象

`src/content/ipc/relay.ts` 注入聊天脚本时，将 `apiBase` 硬编码为 `http://localhost:8848/api`（YiVad 前端端口），而非 `http://localhost:10086`（YiAi 后端端口）。

## 复现

1. 在任何页面加载 YiPet 扩展
2. 打开聊天窗口
3. 发送消息 → API 请求发送到 `localhost:8848/api`（YiVad 前端），而非 `localhost:10086`（YiAi 后端）
4. 如果 YiVad 未运行，聊天完全无法使用

## 根因分析

```typescript
// relay.ts:132（修复前）
chatEl.dataset.apiBase = 'http://localhost:8848/api';
```

`chatEl.dataset.apiBase` 被 `chat/index.ts` 读取为 `API_BASE`，并传递给 `createApiServices({ baseUrl: API_BASE })`：

```typescript
// chat/index.ts:19
const API_BASE = dataset.apiBase || 'http://localhost:10086';
```

`8848` 是 YiVad Vue 前端端口，`/api` 路径依赖 Rsbuild dev server 的反向代理。正确端口应为 `10086`（YiAi FastAPI 后端）。

**影响**：如果 YiVad Rsbuild 开发服务器配置了 `/api` → `http://localhost:10086` 的代理，则错误被掩盖。一旦 Rsbuild 未运行，或代理配置变更，聊天功能立即失效。

## 涉及文件

- `YiPet/src/content/ipc/relay.ts:132` — `apiBase` 硬编码值

## 修复方案

将 `apiBase` 直接指向 YiAi 后端端口：

```diff
- chatEl.dataset.apiBase = 'http://localhost:8848/api';
+ chatEl.dataset.apiBase = 'http://localhost:10086';
```

`chat/index.ts` 的回退默认值也是 `http://localhost:10086`，两者现在一致。

## 验证

- `npx tsc --noEmit` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓