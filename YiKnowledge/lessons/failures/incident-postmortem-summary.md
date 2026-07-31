---
title: 事件复盘（Incident Postmortem）摘要
tags: [事件复盘, postmortem, 无指责, 摘要]
category: lessons/failures
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 事件复盘（Incident Postmortem）摘要

> 本摘要说明复盘文化与流程；空白可填表单见 [incident-postmortem-template.md](./incident-postmortem-template.md)。

## 1. 是什么

事件复盘（postmortem）：在 P0/P1 事件后做结构化复盘，找出根因并制定改进措施。核心原则：**无指责式**（blameless）。

Google SRE 推广的"无指责文化"——只问"系统为何允许人犯错"，不问"谁犯了错"。

## 2. 为什么做

事件是组织最贵的学习机会。但只有复盘才能把单点事件变成系统改进：

- 不复盘：同类事件重复发生
- 指责式复盘：员工掩盖问题、找替罪羊
- 无指责复盘：根因暴露、系统改进

复盘目标：让同样的事不再发生，不是惩罚个人。

## 3. 核心元素

| 元素 | 含义 |
|---|---|
| Severity | P0 / P1 / P2 |
| Impact scope | 影响用户数、收入、数据 |
| Timeline | 时间线（发现 → 响应 → 缓解 → 恢复） |
| Root cause chain | 根因链（5-Why 或鱼骨图） |
| Contributing factors | 促发因素（监控缺失、流程缺失、人为失误、外部依赖） |
| What went well | 处理中做得好的（保留） |
| What went wrong | 处理中不足的（改进） |
| Where we got lucky | 运气成分（消除依赖） |
| Action items | 改进措施（责任人 + 截止 + 验证） |

## 4. 无指责原则

### 为什么不指责个人

> 90% 的事件根因在系统，10% 在个人。

- 系统允许个人犯错（部署无灰度、监控缺失、权限过大）
- 指责后员工下次会掩盖问题
- 无指责让员工愿意主动报告

### 何时问责个人

只有以下情况才考虑个人责任：

- 故意破坏
- 反复同类错误（培训 / 转岗）
- 严重违反合规（如泄露密码）

日常失误不属此类。

## 5. 流程

```
事件发生 → 响应（修复为主）→ 缓解 → 恢复 → 48 小时内启动复盘 → 资料收集 → 复盘会 → 写文档 → 改进跟踪 → 归档
```

### 复盘会

- 时长：60-90 分钟
- 参与者：on-call 响应人 + 受影响方 + 相关 TL + 1 名 SRE / 平台代表
- 主持：1 人负责流程，1 人负责记录
- 不主持也不评判：让所有参与者发言

### 资料收集

- 告警记录（时间戳）
- 部署记录（commit、PR、CI 日志）
- 聊天记录（Slack / 飞书）
- 监控图表（受影响时段）
- 用户反馈

## 6. 根因分析工具

### 5-Why

```
事件：用户登录失败
1. 为什么？→ 鉴权服务 5xx
2. 为什么 5xx？→ CPU 满
3. 为什么 CPU 满？→ 大量重试
4. 为什么重试？→ 下游超时无熔断
5. 为什么无熔断？→ 熔断配置在配置中心丢失
```

### 鱼骨图

按维度分类根因：

- People：人员误操作
- Process：流程缺失
- Technology：技术栈问题
- Environment：环境（部署、网络）
- Materials：依赖（上游、第三方）

## 7. 改进措施

每条 Action Item 必须：

- 具体可执行（不是"加强监控"，而是"给鉴权服务加 CPU 告警阈值 80%"）
- 责任人（不是"团队"，而是具体人名）
- 截止日
- 验证方式（如何确认改进生效）

### 优先级

| 优先级 | 含义 | 时限 |
|---|---|---|
| P0 | 防止同类事件再发生 | 1 周内 |
| P1 | 改进响应速度 | 1 月内 |
| P2 | 长期改进 | 1 季度内 |

## 8. 跟踪机制

- 所有 Action Item 进任务系统（JIRA / Linear）
- 每周看未完成项
- 季度看完成率
- 完成率 < 70% → 升级到管理层

## 9. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 找替罪羊 | 个人被点名 | 无指责原则 |
| 根因停在"人为失误" | 系统问题没改 | 5-Why 问到底 |
| Action Item 无责任人 | 半年后没改 | 必填责任人与截止 |
| 文档写了不公开 | 团队学不到 | 全公司可查 |
| 不跟踪 | 改进不落地 | 每周追未完成 |
| 复盘走形式 | 同类事件再发 | 强制参与质量 |
| 重大事件不复盘 | 文化失灵 | P0/P1 必复盘 |

## 10. 文化建设

- 高层支持：复盘不与绩效挂钩
- 公开表扬：好复盘要奖励
- 模拟演练：定期跑 game day，练习复盘
- 持续教育：复盘模板与案例库

## 11. 与其他流程关系

- 触发：[incident-response-process](../../work/processes/incident-response-process.md)
- 输入：监控告警、部署日志、聊天记录
- 输出：Action Item、技术债、ADR（重大架构调整）
- 联动：[rollback-drill-process](../../work/processes/rollback-drill-process.md)、[chaos-engineering-process](../../work/processes/chaos-engineering-process.md)

## 12. 关联

- 模板：[incident-postmortem-template.md](./incident-postmortem-template.md)
- 流程：[incident-response-process.md](../../work/processes/incident-response-process.md)
- 参考：Google SRE Book — *Postmortem Culture*
