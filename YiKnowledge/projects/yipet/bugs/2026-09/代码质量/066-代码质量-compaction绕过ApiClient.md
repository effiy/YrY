---
title: 会话压缩(compact)绕过ApiClient直接使用fetch('/')导致请求发送到错误地址
tags: [yipet, bug, api, critical]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: critical
priority: p0
---

# 会话压缩绕过 ApiClient 直接使用 fetch('/') 导致请求发送到错误地址

## 现象

当聊天会话消息数超过 token 阈值（~6000）时，自动触发的会话压缩（compact）功能完全无效。压缩请求发送到当前页面的 `/` 路径，而非 YiAi 后端。

## 复现

1. 打开任意非 localhost 页面（如 `https://example.com`）
2. 进行长时间聊天，积累超过 6000 token 的消息
3. 触发自动压缩 → 请求发送到 `https://example.com/`（而非 `http://localhost:10086`）
4. 压缩失败，消息未被压缩，会话继续增长

## 根因分析

`src/chat/composables/useConversationCompact.ts` 的 `callCompactApi` 函数直接使用 `fetch('/')` ，完全绕过 API 客户端层：

```typescript
// 修复前
const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
});
```

三个问题叠加：
1. **无 base URL**：`fetch('/')` 使用当前页面源，而非配置的 `API_BASE`（`http://localhost:10086`）
2. **无认证头**：不携带 `X-Token` / `Authorization` 头
3. **无错误处理**：不经过 `ApiClient` 的 `unwrapEnvelope` 解码，依赖直接解析 `data?.result ?? data?.data`

在聊天窗口运行于 MAIN 世界 + 第三方页面时，此 bug 100% 复现。

## 涉及文件

- `YiPet/src/chat/composables/useConversationCompact.ts` — `callCompactApi` 函数（第 27-58 行，修复前）
- `YiPet/src/chat/stores/chat.ts` — `useConversationCompact` 初始化（第 237-246 行）
- `YiPet/src/chat/stores/services.ts` — 缺少 `client` 导出
- `YiPet/src/chat/index.ts` — `injectServices` 调用缺少 `client` 字段

## 修复方案

**1. 扩展 `ConversationCompactDeps`** — 添加 `rpcCall` 函数类型，允许外部注入 API 调用能力

**2. 重构 `callCompactApi`** — 接受 `rpcCall` 参数，优先使用注入的 RPC 函数

**3. 暴露 `ApiClient`** — `services.ts` 新增 `_client` 引用 + `getClient()` 导出

**4. 连接依赖** — chat store 初始化 `useConversationCompact` 时传入 `rpcCall`，通过 `getClient().rpc()` 走标准 API 路径

修复后数据流：
```
maybeCompact → callCompactApi(messages, rpcCall)
  → getClient().rpc('services.ai.chat_service', 'compactConversation', params)
  → ApiClient → POST http://localhost:10086/ → unwrapEnvelope → 压缩结果
```

## 验证

- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓