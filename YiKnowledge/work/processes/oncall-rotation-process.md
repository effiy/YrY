---
title: Oncall 轮值与交接流程
tags: [流程, oncall, 轮值]
category: work/processes
created: 2026-07-31
updated: 2026-07-31
source: internal
type: process
status: stable
---

# Oncall 轮值与交接流程

## 1. 流程目的

确保 7×24 响应覆盖，同时避免个人过劳与责任错位。

## 2. 角色与职责（RACI）

| 角色 | 职责 |
|---|---|
| Primary oncall | 第一响应，接收告警 |
| Secondary oncall | Primary 处不过来时升级 |
| Manager | 资源调配、跨团队协调 |
| Service owner | 复杂事件技术决策 |
| Comms | 对外沟通（用户、客户） |

## 3. 轮值结构

### 一线 / 二线

- Primary（一线）：第一接警，处理简单事件
- Secondary（二线）：升级时介入，更深技术能力

### 轮值周期

| 模式 | 周期 | 适合 |
|---|---|---|
| 1 周一轮 | 7 天 | 中等规模 |
| 2 周一轮 | 14 天 | 大团队，避免频繁切换 |
| 跟随太阳 | 每时区 8h | 跨时区团队 |

### 反模式

- 一人轮 1 个月 → 精神崩溃
- 同一人反复轮 → 失衡
- 没有二线 → Primary 跑路

## 4. 交接流程

### 交接时间

- 每周固定时间（如周一 10:00）
- 时长 30 分钟
- 必须同步交接，不留文档无响应

### 交接内容

1. **当前未解决事件**：状态、下一步
2. **近期高频告警**：是否有趋势
3. **未完成改进项**：上周 Action 进度
4. **重要变更**：上周部署、配置变更
5. **季节性因素**：大促、合规审计期

### 交接文档

```
Week of YYYY-MM-DD
Primary: {name} → {next name}

Open incidents:
- INC-123: {状态} | 当前阻塞 | 下一步

Recent alerts trend:
- {告警} 频率 X/天，原因

Pending action items:
- {action} 责任人 进度

Recent changes:
- {部署} {时间}
```

## 5. 告警响应 SLA

| 严重度 | 响应时限 | 解决时限 | 升级 |
|---|---|---|---|
| P0 | 5 分钟 | 1 小时 | 立即 Secondary + Manager |
| P1 | 15 分钟 | 4 小时 | 30 分钟无响应升级 Secondary |
| P2 | 1 小时 | 24 小时 | 工作时间响应 |
| P3 | 4 小时 | 一周 | 工作时间响应 |

## 6. Oncall 工作内容

### 响应期

- 接告警 → 评估 → 缓解 → 修复 → 复盘
- 持续监控告警群
- 升级路径清晰

### 非响应期

- 复盘上周事件（[incident-postmortem-summary](../../lessons/failures/incident-postmortem-summary.md)）
- 推进 Action items
- 监控告警治理（[monitoring-governance-process](./monitoring-governance-process.md)）
- 容量与成本审查（[capacity-and-cost-summary](../../tech/infra/capacity-and-cost-summary.md)）

## 7. 工具栈

| 用途 | 工具 |
|---|---|
| 告警路由 | PagerDuty / Opsgenie |
| 通讯 | Slack / 飞书 oncall 频道 |
| 事件记录 | JIRA / Linear oncall 项目 |
| 文档 | 交接文档模板 |
| 监控 | Grafana / Datadog |

## 8. 输入 / 输出

- 输入：告警、监控、上周交接文档
- 输出：本周交接文档、事件复盘、Action items

## 9. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 一人 long oncall | 精神崩溃 | 1-2 周一轮 |
| 无 Secondary | Primary 跑路 | 必有二线 |
| 交接无文档 | 信息丢失 | 必填交接文档 |
| 告警泛滥 | 疲劳 | 治理告警 |
| 响应不及时 | SLA 不达标 | 监控 + 升级路径 |
| Oncall 无产出 | 只救火不改进 | 非响应期做改进 |

## 10. 文化建设

- Oncall 不是惩罚，是责任与学习
- 高层尊重 oncall 时间（不让 oncall 兼任其他任务）
- 公开表扬好响应
- 复盘不指责 oncall 个人

## 11. 落地节奏

| 时点 | 事项 |
|---|---|
| 每周固定 | 交接 30 分钟 |
| 每日 | Primary 监控告警 |
| 每事件 | 必填事件记录 |
| 每月 | Oncall 工作量与质量评估 |
| 每季 | 轮值表复审 + 团队满意度 |

## 12. 关联

- 流程：[incident-response-process](./incident-response-process.md)、[rollback-drill-process](./rollback-drill-process.md)
- 治理：[monitoring-governance-process](./monitoring-governance-process.md)
