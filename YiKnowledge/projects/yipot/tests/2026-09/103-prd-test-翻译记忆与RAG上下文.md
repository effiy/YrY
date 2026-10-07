---

doc_type: test
title: "翻译记忆 + RAG 上下文增强 — 测试方案"
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
source_modules: ["84-prd-task-翻译记忆与RAG上下文"]

type: test
---

# 翻译记忆 + RAG 上下文增强 — 测试方案

> 来源模块：[84-prd-task-翻译记忆与RAG上下文](../../devs/2026-09/84-prd-task-翻译记忆与RAG上下文.md)

---

## TC-ME-001: 缓存写入

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | RPC `translate` → `text: "test memory"` | 正常返回 |
| 2 | 检查 MongoDB `translation_memory` | 存在 `text_hash` 匹配文档 |
| 3 | 检查文档字段 | `source, target, from_lang, to_lang, provider` 完整 |

## TC-ME-002: 缓存命中

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 第一次翻译 `"cache test"` | `cached` 不存在 |
| 2 | 第二次翻译相同文本+语言 | `data[0].cached: true` |
| 3 | 检查 `data[0].text` | 与第一次结果一致 |
| 4 | 检查日志 | 无第三方 API HTTP 请求 |

## TC-ME-003: 不同语言独立缓存

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译 `"hello"` → `to_lang: "zh"` | 缓存键 = hash("hello"+"en"+"zh") |
| 2 | 翻译 `"hello"` → `to_lang: "ja"` | 缓存键 = hash("hello"+"en"+"ja") |
| 3 | 两个缓存独立 | 不同 `text_hash` 值 |

## TC-ME-004: 跳过缓存

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 先正常翻译 `"skip test"` | 缓存写入 |
| 2 | 再翻译 `use_memory: false` | `cached` 不存在（跳过缓存） |
| 3 | 检查结果可能不同 | LLM 输出非确定性 |

## TC-ME-005: 前缀搜索

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 先缓存 `"software engineering"` 和 `"software design"` | — |
| 2 | 调用 `search_by_prefix("soft", "en", "zh")` | 返回 2 条匹配 |
| 3 | 调用 `search_by_prefix("zzz", "en", "zh")` | 返回 `[]` |

## TC-ME-006: 缓存统计

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译 5 条不同文本（3 en→zh, 2 en→ja） | — |
| 2 | 调用 `memory_service.stats()` | `total: 5` |
| 3 | 检查语言分布 | 2 个源语言→目标语言组 |

---

## TC-RA-001: Domain 上下文注入

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 调用 `translate_with_context(domain="yiai")` | — |
| 2 | 检查发送给 Provider 的 system prompt | 包含 YiKnowledge 术语片段 |
| 3 | 翻译结果 | 领域相关的准确翻译 |

## TC-RA-002: RAG 查询失败降级

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 调用 `translate_with_context(domain="nonexistent")` | — |
| 2 | RAG 返回空 | 不 crash |
| 3 | 翻译正常返回 | 降级为普通翻译（无上下文） |

## TC-RA-003: 手动上下文注入

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 调用 `translate_with_context(context="React hooks")` | — |
| 2 | 检查 system prompt | 包含手动注入的 "React hooks" |
| 3 | 翻译 "useState" | 不会直译为 "使用状态" |

## TC-RA-004: 翻译记录写入

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 翻译任意文本 | — |
| 2 | 检查 MongoDB `translation_records` | 存在新文档 |
| 3 | 检查字段 | `source, from_lang, to_lang, results[], source_length, created_at` |