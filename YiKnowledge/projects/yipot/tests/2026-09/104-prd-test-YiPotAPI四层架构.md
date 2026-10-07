---

doc_type: test
title: "YiPot API 四层架构 — 测试方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prds: ["53-prd-YiAi后端集成"]
source_modules: ["85-prd-task-YiPotAPI四层架构"]

type: test
---

# YiPot API 四层架构 — 测试方案

> 来源模块：[85-prd-task-YiPotAPI四层架构](../../devs/2026-09/85-prd-task-YiPotAPI四层架构.md)

---

## TC-AP-001: API 客户端初始化

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 启动 YiPot 应用 | `main.jsx` 执行 `initApi()` |
| 2 | 检查 `window.__yipot_api` | 非 null |
| 3 | 调用 `getApi()` | 返回 `ApiClient` 实例 |
| 4 | 调用 `hasApi()` | `true` |

## TC-AP-002: RPC 调用格式

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `client.rpc("services.test", "echo", {msg: "hello"})` | — |
| 2 | 检查 Network 面板 | `POST http://localhost:10086/` |
| 3 | 检查 Request Body | `{module_name: "services.test", method_name: "echo", parameters: {msg: "hello"}}` |
| 4 | 检查 Content-Type | `application/json` |

## TC-AP-003: 信封解包 — 成功

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | YiAi 返回 `{code: 0, message: "ok", data: [...]}` | — |
| 2 | `ApiResponse.ok` | `true` |
| 3 | `ApiResponse.data` | `[...]`（原始 data） |
| 4 | `ApiResponse.error` | `undefined` |

## TC-AP-004: 信封解包 — 业务错误

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | YiAi 返回 `{code: 1001, message: "参数错误", data: null}` | — |
| 2 | `ApiResponse.ok` | `false` |
| 3 | `ApiResponse.error` | `"参数错误"` |
| 4 | `ApiResponse.data` | `null` |

## TC-AP-005: 信封解包 — 非 YiAi 响应

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 某端点返回 `{result: "ok"}`（无 code 字段） | — |
| 2 | `ApiResponse.ok` | `true` (HTTP 200) |
| 3 | `ApiResponse.data` | `{result: "ok"}` 透传 |

## TC-AP-006: 请求超时

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | YiAi 不响应（模拟） | — |
| 2 | 30 秒后 | `ApiResponse.ok: false` |
| 3 | `ApiResponse.error` | `"Request timed out"` |

## TC-AP-007: SSE 流式

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `client.stream("/rag-chat", {messages: [...]})` | — |
| 2 | 检查 Accept Header | `text/event-stream` |
| 3 | 迭代 `AsyncGenerator` | 收到多个 `{done: false, data: ...}` |
| 4 | 最终 chunk | `{done: true}` |

## TC-AP-008: Token 认证

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `createApiClient({baseUrl, token: "jwt-token"})` | — |
| 2 | 检查 HTTP Headers | `Authorization: Bearer jwt-token` |
| 3 | 检查 HTTP Headers | `X-Token: jwt-token` |

## TC-AP-009: TranslationService 封装

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `api.translation.translate({text: "hello"})` | — |
| 2 | 检查 RPC module_name | `services.translation.translate_service` |
| 3 | 检查 RPC method_name | `translate` |
| 4 | 检查 parameters | `{text: "hello", from_lang: "auto", to_lang: "zh"}` |
| 5 | 返回类型 | `TranslateResult[]` |

## TC-AP-010: KnowledgeService 封装

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | `api.knowledge.scan()` | HTTP 200 |
| 2 | 返回类型 | `KnowledgeTreeNode[]` |
| 3 | `api.knowledge.ragStatus()` | `RagStatusResponse` |