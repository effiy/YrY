---

doc_type: test
prd_test_id: "YA-09-105"
title: "YA-09-105: 熔断器 — 测试方案"
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

# YA-09-105: 熔断器 — 测试方案

| 场景 | 期望 |
|------|------|
| 正常请求 | CLOSED 状态通过 |
| 连续失败达阈值 | OPEN，快速失败 |
| OPEN 冷却期内 | 抛 CircuitBreakerOpenError |
| 冷却期后探测成功 | HALF_OPEN → CLOSED |
| 冷却期后探测失败 | HALF_OPEN → OPEN |
| 窗口过期 | 计数重置 |