---

doc_type: task
prd_task_id: "YA-09-105"
title: "YA-09-105: 熔断器 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "105-需求-熔断器.md"

type: task
---

# YA-09-105: 熔断器 — 技术设计

## 架构

```
CircuitBreaker(window_seconds, failure_threshold, cooldown_seconds)
  States: CLOSED → (failures ≥ threshold) → OPEN → (cooldown elapsed) → HALF_OPEN → (success) → CLOSED
  Integration: LLMProviderRouter.chat_with_fallback() / embed_with_fallback()
  Monitoring: /debug/performance 端点暴露状态
```

## 实现

**文件**：`shared/circuit_breaker.py`

**核心逻辑**：滑动窗口计数失败次数 → 阈值触发 OPEN → 冷却期内快速抛出 CircuitBreakerOpenError → 冷却后 HALF_OPEN 放行少量请求探测

## 非功能需求

| 维度 | 实现 |
|------|------|
| 可观测 | /debug/performance + inflight 计数 |
| 性能 | O(1) 状态检查 |