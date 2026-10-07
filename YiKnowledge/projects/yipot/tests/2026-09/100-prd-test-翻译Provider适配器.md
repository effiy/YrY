---

doc_type: test
title: "翻译 Provider 适配器 — 测试方案"
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
source_modules: ["81-prd-task-翻译Provider适配器"]

type: test
---

# 翻译 Provider 适配器 — 测试方案

> 来源模块：[81-prd-task-翻译Provider适配器](../../devs/2026-09/81-prd-task-翻译Provider适配器.md)

---

## TC-TP-001: OpenAI Provider 基本翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `translate` → `providers: ["openai"]` | HTTP 200 |
| 2 | 检查 `data[0].provider` | `"openai"` |
| 3 | 检查 `data[0].text` | 非空中文字符串 |
| 4 | 检查 `data[0].from_lang` | `"en"` |
| 5 | 检查 `data[0].to_lang` | `"zh"` |

## TC-TP-002: OpenAI Provider 流式翻译

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `translate_stream` → `provider: "openai"` | `text/event-stream` |
| 2 | 读取第一个 SSE 帧 | `data: {"data": "..."}` |
| 3 | 读取直到 `[DONE]` | 流正常结束 |
| 4 | 拼接所有 chunks | 完整的中文翻译 |

## TC-TP-003: Google 文本翻译模式

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译 `text: "hello"` → Google | `data[0].text` 为 "你好" |
| 2 | 检查请求 URL | 包含 `translate_a/single` |
| 3 | 检查请求参数 | `client=gtx, sl=en, tl=zh` |

## TC-TP-004: Google 词典模式

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译单词 `"software"` → Google | 返回 object（非 string） |
| 2 | 检查 `explanations` 字段 | 非空数组 |
| 3 | 检查 `pronunciations` 字段 | 包含音标 |

## TC-TP-005: DeepL Free 模式

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置 `type: "free"` | — |
| 2 | 翻译文本 | 返回翻译结果 |
| 3 | 检查请求 Body | `jsonrpc: "2.0"` JSON-RPC 格式 |
| 4 | 检查时间戳计算 | `_getTimestamp(iCount)` 正确 |

## TC-TP-006: DeepL API Key 模式

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置 `type: "api", auth_key: "...:fx"` | — |
| 2 | 检查端点 | `api-free.deepl.com` |
| 3 | 检查 Auth Header | `DeepL-Auth-Key` |

## TC-TP-007: Baidu MD5 签名

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置 `appid, secret` | — |
| 2 | 翻译 | 检查 `sign = md5(appid+text+salt+secret)` |
| 3 | 检查响应 | `trans_result[0].dst` 非空 |

## TC-TP-008: Tencent TC3 签名

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 配置 `secret_id, secret_key` | — |
| 2 | 翻译 | 检查 `Authorization` Header 包含 `TC3-HMAC-SHA256` |
| 3 | 检查 `X-TC-Action` | `TextTranslate` |
| 4 | 检查 `X-TC-Version` | `2018-03-21` |

## TC-TP-009: 多引擎并行

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `providers: ["google", "baidu"]` | — |
| 2 | 检查 `data` 长度 | `2` |
| 3 | 两个结果独立 | 不同 `provider` 各自返回 `text` |

## TC-TP-010: Provider 失败隔离

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `providers: ["google", "unknown_xxx"]` | — |
| 2 | `data[0]` (google) | 正常结果 |
| 3 | `data[1]` (unknown) | `error` 字段非空，`text: ""` |