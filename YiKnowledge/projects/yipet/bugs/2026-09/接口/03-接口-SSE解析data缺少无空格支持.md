---
title: "SSE 帧解析器 data 前缀未处理无空格格式"
tags: [bug, sse, parser, data-prefix, spec-compliance]
category: projects/yipet/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: yipet
module: api/client.ts
reporter: Claude
environment: all
affected_version: 1.2.0
fixed_version: 1.2.1
frequency: rare
roles: [engineer]
---

# SSE 帧解析器 data 前缀未处理无空格格式

---

## 一、现象

> **一句话描述**：`parseSSEFrame` 仅匹配 `data: `（带空格），不匹配 `data:`（无空格）。某些 SSE 实现（包括标准合规的实现）发送 `data:value` 格式时，数据被静默丢弃。

---

## 二、复现步骤

1. 后端发送 SSE 帧 `data:{"message":"hello"}\n\n`（无空格）
2. YiPet `parseSSEFrame` 不匹配 → `dataStr` 保持空字符串
3. 该帧被丢弃 → 聊天流式传输卡住或丢失内容

---

## 三、根因分析

**问题代码**：`src/api/client.ts:189`

```ts
if (t.startsWith('data: ')) { dataStr += t.slice(6); continue; }
```

**根因**：SSE 规范（[WHATWG](https://html.spec.whatwg.org/multipage/server-sent-events.html)）允许冒号后有可选空格：
- `data: hello` — 值 `hello`（空格后）
- `data:hello` — 值 `hello`（紧接冒号）

当前代码仅处理第一种格式。

同样，`event: error` 也固定了 `event: ` 前缀 + `error`，未处理 `event:error` 格式。

---

## 四、修复方案

同时处理带空格和无空格两种格式：

```ts
// Before
if (t.startsWith('data: ')) { dataStr += t.slice(6); continue; }
if (t.startsWith('event: error')) ...;

// After
if (t.startsWith('data:')) { dataStr += t[5] === ' ' ? t.slice(6) : t.slice(5); continue; }
if (t.startsWith('event:') && t.slice(6).trim() === 'error') ...;
```

---

## 五、验证方法

- [ ] `npm test` 138 passed
- [ ] Mock SSE 流发送 `data:hello\n\n` → 正确解析为 `{done: false, data: "hello"}`

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `api/client.ts` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | SSE 流式内容丢失 |
| 用户感知 | 聊天消息可能不完整 |
| 数据完整性 | 不涉及 |