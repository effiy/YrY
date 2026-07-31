---
title: 敏捷产品管理框架摘要
tags: [敏捷, 产品管理, 框架, Scrum, Kanban, DORA, RICE]
category: methodology/pm-frameworks
created: 2024-03-10
updated: 2026-07-30
source: https://example.com/agile-pm-framework
type: summary
---

# 敏捷产品管理框架摘要

## 1. 核心原则

1. **用户导向**：一切决策以用户价值为出发点
2. **迭代交付**：小步快跑，持续交付可验证的产品增量
3. **数据驱动**：用数据验证假设，而非依赖直觉
4. **跨职能协作**：产品、设计、开发紧密配合
5. **拥抱变化**：响应变化高于遵循计划，但要有节奏地拥抱

## 2. 关键实践

### 2.1 需求管理
- **用户故事（User Story）**：作为 X，我希望 Y，以便 Z
- **INVEST 原则**：Independent / Negotiable / Valuable / Estimable / Small / Testable
- **优先级排序**：RICE（Reach × Impact × Confidence / Effort）
- **健康 Backlog**：DEEP 原则 — Detailed appropriately / Emergent / Estimated / Prioritized

### 2.2 迭代节奏
- **Sprint Planning**（计划会）：明确目标 + 拆分任务 + 容量评估
- **Daily Standup**（每日站会）：昨日 / 今日 / 阻塞，15 分钟内
- **Sprint Review**（评审会）：演示可工作软件，收集反馈
- **Sprint Retrospective**（回顾会）：Start / Stop / Continue，产出可执行改进行动

### 2.3 看板（Kanban）
- WIP 限制：每个状态列限制并发数
- CFD（Cumulative Flow Diagram）：可视化交付节奏与瓶颈
- 适合运维、支持类工作；Scrum 适合产品迭代

## 3. 优先级框架

| 框架 | 适用场景 | 公式 |
|------|---------|------|
| RICE | 量化排序功能 | Reach × Impact × Confidence / Effort |
| Kano | 用户满意度分析 | 基础 / 期望 / 兴奋 |
| MoSCoW | 版本范围控制 | Must / Should / Could / Won't |
| ICE | 快速轻量评估 | Impact × Confidence × Ease |
| WSJF | 加权最短作业优先 | Cost of Delay / Job Size |

## 4. 速度与质量指标

### 4.1 速度（Velocity）
- 滚动平均 3 个 Sprint，避免单点波动
- 不作为考核指标，仅用于容量规划

### 4.2 DORA 指标（研发效能）
- **部署频率**：高绩效 > 每日
- **变更前置时间**：< 1 天
- **变更失败率**：< 15%
- **服务恢复时长（MTTR）**：< 1 小时
- 2024 后补充：Reliability（可靠性）作为第五维

### 4.3 流动效率（Flow Efficiency）
实际工作时间 / 总周期时间，低于 20% 说明大量等待。

## 5. Definition of Done（DoD）

「完成」的统一标准，避免「90% 完成，永远 90%」：
- 代码评审通过
- 单元测试覆盖达标
- 文档更新
- 部署到 staging 并通过验收
- 监控告警就位
- 业务方验收签字

## 6. 反模式（Anti-patterns）

- **Spillover**：Sprint 结束任务未完成 > 20%，说明估算或容量有问题
- **僵尸故事**：Backlog 中长期不动的项，定期清理
- ** Daily 站会变成汇报会**：15 分钟内，只讲三个问题
- **PO 翻译官**：PO 只做需求传递，不做决策 → 应该有决策权
- **速度崇拜**：把 velocity 当 KPI → 团队会注水估点
- **回顾会无产出**：只有讨论没有 action item → 必须有 owner 与截止日期
- **平行 Sprint**：团队同时支持多个 Sprint 目标 → 焦点散，质量降

## 7. 常用工具

- **Jira / Linear**（项目管理）
- **Notion / Confluence**（文档协作）
- **Miro / FigJam**（白板协作）
- **GitHub Projects / GitLab**（研发集成）
- **Figma**（设计与协作）

## 8. 规模化敏捷

- **SAFe**：企业级规模化，适合大型传统企业
- **LeSS**：精简版规模化，强调产品组而非项目组
- **Spotify Model**：部落 / 小队 / 分会 / 协会，影响大于实操
- 趋势：从重型框架转向轻量 OKR + 双披萨团队

## 9. AI 时代敏捷

- AI 编码助手让单工程师产出提升 30-50%，但 review 与测试成为瓶颈
- PR 量增长 → 强制 lint + AI review 前置
- Story 拆分粒度更小（< 2 天），更快进入 Done
- 使用 AI Agent 自动化 Sprint 报告、风险识别、回顾会摘要
