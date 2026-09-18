---
doc_type: test
title: "YA-08-14: ModelRuntime 抽象层 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-14"
source_prds: ["14-需求-ModelRuntime抽象层"]
source_modules: ["14-prd-task-ModelRuntime抽象层"]
source_okr: [yiai-002]
---

# YA-08-14: ModelRuntime 抽象层 — 测试规格

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MR-01 | stream_chat Ollama | 流式返回 token |
| UT-MR-02 | stream_chat DeepSeek | OpenAI 格式 SSE 正确解析 |
| UT-MR-03 | primary 故障→fallback | Ollama 不可用 → 自动切换 DeepSeek |
| UT-MR-04 | 双 Provider 均不可用→错误 | 无可用 Provider → ProviderError |

---