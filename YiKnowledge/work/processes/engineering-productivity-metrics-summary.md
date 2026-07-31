---
title: 工程效能指标（DORA + 人均吞吐）摘要
tags: [DORA, 工程效能, 指标, 摘要]
category: work/processes
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# 工程效能指标（DORA + 人均吞吐）摘要

> 本摘要说明指标体系与解读方法；空白可填表单见 [engineering-productivity-metrics-template.md](./engineering-productivity-metrics-template.md)。

## 1. 是什么

DORA 四指标 + 人均吞吐 = 工程效能的核心度量。由 Nicole Forsgren 等（DevOps Research & Assessment）经多年研究提出，是业界共识最强的研发效能基线。

### DORA 四指标

| 指标 | 含义 | Elite 阈值 |
|---|---|---|
| Deployment Frequency 部署频率 | 多久能发布一次 | On-demand（多次 / 日） |
| Lead Time for Changes 交付周期 | 从 commit 到上线 | < 1 小时 |
| Change Failure Rate 变更失败率 | 发布后回滚 / 故障比例 | < 15% |
| Mean Time to Restore (MTTR) 平均恢复时长 | 故障从发生到恢复 | < 1 小时 |

### 第五指标（2021 加入）

- **Reliability**：SRE 视角的可靠性（SLO 达成率、错误预算消耗）

### 人均吞吐

- 人均合并 PR 数 / 周
- 人均代码行数（参考，不能单独用）
- 人均 story point / 周

> 代码行数不能单独用作效能指标，会诱导刷量。与上述指标配合看。

## 2. 为什么用

工程效能难度量：直接看代码行数误导、看 JIRA ticket 完成率会刷、看工时会鼓励磨洋工。DORA 经验数据驱动，与业务结果（生产力、市场份额、盈利能力）相关性最强。

四个指标必须**一起看**：

- 高部署频率 + 低失败率 = 真效能
- 高部署频率 + 高失败率 = 火车上甩锅
- 低部署频率 + 低失败率 = 保守稳定但慢
- 低部署频率 + 高失败率 = 危险且慢

## 3. 关键解读

### Lead Time 拆解

```
Lead Time = 头部时间 + 中部时间 + 尾部时间

头部：从需求提出到开始开发（待办积压）
中部：从开发到 PR 合并（开发 + 评审）
尾部：从合并到上线（CI / CD + 灰度）
```

每段提升靠不同手段：

- 头部：需求评审、PM 拉通
- 中部：PR 小批量、CI 加速、自动化测试
- 尾部：灰度发布、回滚演练

### 失败率与 MTTR

- 低失败率靠测试覆盖 + 灰度
- 低 MTTR 靠监控告警 + 回滚预案 + oncall 响应
- 失败率与 MTTR 是"安全"维度，比"快"更重要

## 4. 采集方式

| 指标 | 数据源 |
|---|---|
| Deployment Frequency | CI / CD 系统（GitHub Actions、Jenkins） |
| Lead Time | git commit timestamp × deploy timestamp |
| Change Failure率 | 部署后 1 小时内的回滚 / P1/P2 事件数 |
| MTTR | 告警系统 + 事件记录 |
| 人均 PR 数 | Git provider API |
| 人均代码行 | git shortlog（仅供参考） |

## 5. 归因维度

效能数据必须能下钻：

- 按团队
- 按服务 / 模块
- 按变更类型（feature / bugfix / hotfix）
- 按 PR 大小（小 PR lead time 短）
- 按个人（慎用，避免刷量）

## 6. 阈值与目标

| 指标 | Elite | High | Medium | Low |
|---|---|---|---|---|
| Deployment Frequency | 多次 / 日 | 每日 - 每周 | 每周 - 每月 | 每月 - 每半年 |
| Lead Time | < 1h | 1d - 1w | 1w - 1m | > 1m |
| Change Failure率 | 0-15% | 16-30% | 16-30% | > 30% |
| MTTR | < 1h | < 1d | 1d - 1w | > 1w |

## 7. 反模式

| 反模式 | 现象 | 修复 |
|---|---|---|
| 只看部署频率 | 频繁上线但常出事 | 必须四指标一起看 |
| 代码行当 KPI | 刷量 | 与失败率、PR 数配合 |
| 个人排名 | 内卷 | 团队级而非个人级 |
| 不看尾部时间 | 误判瓶颈 | Lead Time 拆三段 |
| 不分变更类型 | feature 与 hotfix 混 | 按类型分组 |
| 不看下游影响 | 快但下游投诉 | 加跨团队满意度 |

## 8. 与其他指标关系

- **DORA**：研发效能
- **HEART**：用户体验
- **北极星**：用户价值
- **OKR**：战略目标
- **SLO**：可靠性

DORA 是"研发侧的健康度"，与"用户侧"与"战略侧"互补。

## 9. 落地节奏

- 每周自动出仪表盘（不靠人手填）
- 每月团队级 review
- 每季度公司级 review
- 异常（如失败率突增）触发 root cause 分析

## 10. 关联

- 模板：[engineering-productivity-metrics-template.md](./engineering-productivity-metrics-template.md)
- 相关：[tech-roadmap-review-summary.md](./tech-roadmap-review-summary.md)
- 论文：Forsgren, N. et al. — *Accelerate*（DORA 出处）
