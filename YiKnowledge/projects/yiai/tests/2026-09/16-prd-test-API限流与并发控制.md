---
doc_type: test
title: "YA-09-16: API 限流与并发控制 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-16"
source_prds: ["16-需求-API限流与并发控制"]
source_modules: ["16-prd-task-API限流与并发控制"]
source_okr: [yiai-001]
---

# YA-09-16: API 限流与并发控制 — 测试规格

> 来源 PRD：[16-需求-API限流与并发控制.md](../../prds/2026-09/16-需求-API限流与并发控制.md)
> 开发方案：[16-prd-task-API限流与并发控制.md](../../devs/2026-09/16-prd-task-API限流与并发控制.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-RL-01 | 令牌桶速率 10/s | 1s 内 10 请求通过，第 11 返回 429 |
| UT-RL-02 | 令牌补充 | 等待 1s → 令牌恢复 → 请求通过 |
| UT-RL-03 | 429 含 Retry-After | 响应头 `Retry-After: 1` |
| UT-RL-04 | 分级配额 | admin 100/s, user 10/s, guest 1/s |
| UT-RL-05 | Redis 不可用→内存回退 | 无 Redis → 内存令牌桶继续工作 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 限流未生效（超配额请求未被拦截） |
| S2 — 一般 | Redis 回退后令牌状态不一致 |

---