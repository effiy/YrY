---
doc_type: test
title: "YK-09-06: 知识生命周期自动化 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-06"
source_prds: ["09-自动化-知识生命周期"]
source_modules: ["09-prd-task-知识生命周期"]
source_okr: [yiknowledge-001]
---

# YK-09-06: 知识生命周期自动化 — 测试用例

> 来源 PRD：[09-自动化-知识生命周期.md](../../prds/2026-09/09-自动化-知识生命周期.md)
> 开发方案：[09-prd-task-知识生命周期.md](../../devs/2026-09/09-prd-task-知识生命周期.md)
> 需求编号：YK-09-06 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 overdue 计算、权重降级、自动 deprecated、企微通知。

---

## 一、测试范围

| 组件 | 测试重点 |
|------|---------|
| overdue_ratio | 各 review_cycle × 天数组合的倍数计算 |
| weight_decay | 权重降级阈值（1×/2×/3×）|
| 自动 deprecated | 3× overdue → lifecycle 和 weight 更新 |
| 企微通知 | 通知格式、去重、最多 20 条 |

---

## 二、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-LC-01 | weekly / 7 天 overdue | review_cycle=weekly, updated=8 天前 | ratio ≈ 1.14, action=degrade_weight, weight=0.8 |
| UT-LC-02 | monthly / 30 天刚好 | review_cycle=monthly, updated=30 天前 | ratio=1.0, action=degrade_weight |
| UT-LC-03 | monthly / 60 天 | review_cycle=monthly, updated=60 天前 | ratio=2.0, action=notify_curator, weight=0.5 |
| UT-LC-04 | monthly / 90 天 | review_cycle=monthly, updated=90 天前 | ratio=3.0, action=deprecate, weight=0.2 |
| UT-LC-05 | quarterly / 180 天 | review_cycle=quarterly, updated=180 天前 | ratio=2.0, weight=0.5 |
| UT-LC-06 | quarterly / 270 天 | review_cycle=quarterly, updated=270 天前 | ratio=3.0, action=deprecate |
| UT-LC-07 | annual / 365 天刚好 | review_cycle=annual, updated=365 天前 | ratio=1.0, action=degrade_weight |
| UT-LC-08 | 未过期（ratio < 1） | updated=5 天前, quarterly | ratio < 1, action=none, weight=1.0 |
| UT-LC-09 | 缺少 review_cycle（默认 quarterly） | 无 review_cycle 字段, updated=95 天前 | ratio≈1.06, 按 quarterly 处理 |
| UT-LC-10 | weight 不降至 0 | ratio=10（极度过期） | weight=0.2（最低 0.2） |

---

## 三、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-LC-01 | 定时扫描 → 权重降级 | 插入 5 条不同 overdue 状态的文档 → 执行扫描 → weight 按预期更新 |
| IT-LC-02 | 3× overdue → deprecated | MDB status 更新为 deprecated, lifecycle=deprecated |
| IT-LC-03 | RAG 检索权重生效 | 过期文档（weight=0.2）排名低于新鲜文档（weight=1.0） |
| IT-LC-04 | 企微通知（有告警） | 扫描发现 3 条过度过期 → 企微收到通知 |
| IT-LC-05 | 企微通知（无告警） | 无过期文档 → 不发送通知 |
| IT-LC-06 | 通知最多 20 条 | 50 条过期文档 → 仅发送前 20 条 + "..." 截断提示 |

---

## 四、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 扫描任务导致 MDB 写入异常 | daily_lifecycle_scan 抛未捕获异常中断 all tasks |
| S1 — 严重 | 权重降级错误 | 新鲜文档被降权、过期文档权重未更新 |
| S2 — 一般 | 通知格式问题 | 企微消息缺少文件路径 |
| S3 — 轻微 | 默认 review_cycle 不合理 | quarterly 对高频更新文档太宽松 |

---

## 五、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| overdue_ratio | 待实施 | 纯函数 |
| weight_decay | 待实施 | 纯函数 |
| 定时扫描 | 待实施 | mock apscheduler + MDB |
| 企微通知 | 待实施 | mock 企微 Webhook |

---