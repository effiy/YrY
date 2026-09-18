---
doc_type: test
title: "YA-09-11: ModelRuntime 性能基准 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-11"
source_prds: ["15-需求-ModelRuntime抽象层性能基准"]
source_modules: ["15-prd-task-ModelRuntime抽象层性能基准"]
source_okr: [yiai-002]
---

# YA-09-11: ModelRuntime 性能基准 — 测试规格

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-BM-01 | Ollama TTFT < 1s | 首 token 延迟 < 1000ms |
| UT-BM-02 | DeepSeek TPS > 20 | 流式速率 > 20 tokens/s |
| UT-BM-03 | 模型选择：简单任务→轻量模型 | "hello" → 选择 qwen2.5:0.5b |
| UT-BM-04 | 模型选择：复杂任务→重量模型 | "分析微服务架构" → 选择 qwen2.5:7b |

---