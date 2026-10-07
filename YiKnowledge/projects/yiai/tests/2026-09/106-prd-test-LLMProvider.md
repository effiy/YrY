---

doc_type: test
prd_test_id: "YA-09-106"
title: "YA-09-106: LLM Provider 抽象 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-106: LLM Provider 抽象 — 测试方案

| 场景 | 期望 |
|------|------|
| OllamaProvider.chat | streaming response |
| DeepSeekProvider.chat | AsyncOpenAI 调用 |
| Ollama 不可用 → fallback | DeepSeek 接管 |
| 两者都不可用 | raise AI_UNAVAILABLE |
| 连接池复用 | 同一 client 实例 |