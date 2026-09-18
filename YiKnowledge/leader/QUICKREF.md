---
title: "Tech Lead Quick Reference — Scenario-to-File Navigation"
aliases: [quick-ref, navigation,速查]
tags: [index, leader, quick-reference]
category: leader
created: 2026-09-15
updated: 2026-09-15
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "86 个文件中快速定位——按场景而非按目录结构查找"
related:
  - ./INDEX.md
  - ./README.md
---

# 技术负责人速查卡

> 你在做 X，需要找对应的文件。按场景检索，不走目录树。

## 我在做架构决策

| 场景 | 去这里 |
|---|---|
| 写一篇 ADR | [architecture/01](architecture/01-架构-架构决策设计.md) → 复制 12 节模板 |
| 技术选型（评估方案） | [roadmap/07](roadmap/07-路线图-技术选型.md) → 加权矩阵 |
| 技术选型（LLM 提供商） | [architecture/06](architecture/06-架构-技术选型-LLM提供商.md) |
| 技术选型（React 状态管理） | [architecture/07](architecture/07-架构-技术选型-React状态管理.md) |
| 避免决策错误 | [architecture/11](architecture/11-架构-决策反模式.md) → 12 个反模式 |
| 自研还是采购 | [capacity/04](capacity/04-容量-自研还是采购.md) → 3 年 TCO |
| 主持架构审查会议 | [architecture/13](architecture/13-架构-架构审查会议.md) → 议程 + 决策框架 |

## 我在设计系统

| 场景 | 去这里 |
|---|---|
| 设计新 API 端点 | [architecture/14](architecture/14-架构-API设计指南.md) → RPC 信封 + 参数契约 |
| 设计 MongoDB schema | [architecture/12](architecture/12-架构-数据模型设计原则.md) → 嵌入 vs 引用 |
| 变更 MongoDB schema | [architecture/17](architecture/17-架构-数据库迁移指南.md) → 三阶段迁移 |
| 用 Feature Flag 安全上线 | [architecture/18](architecture/18-架构-Feature-Flag指南.md) → 部署 ≠ 发布 |
| 异步/后台任务处理 | [architecture/22](architecture/22-架构-异步与后台任务.md) → 4 种模式 |
| 保护 API 端点 | [architecture/24](architecture/24-架构-API限流指南.md) → 限流策略 |
| 记录小决策 | [architecture/25](architecture/25-架构-轻量决策记录.md) → 4 字段 LDR |
| 快速决策参考 | [architecture/26](architecture/26-架构-决策矩阵合集.md) → 10 个常见矩阵 |

## 我在规划路线图

| 场景 | 去这里 |
|---|---|
| 季度路线图规划 | [roadmap/09](roadmap/09-路线图-规划技术路线图.md) → 4 类分解 |
| 检查当前进度 | [roadmap/01](roadmap/01-路线图-进度看板.md) → 5 部分仪表盘 |
| 季度审查 | [roadmap/11](roadmap/11-路线图-季度审查流程.md) → 4 阶段 |
| Q4 预览 | [roadmap/10](roadmap/10-路线图-审查-2026-Q4预览.md) |
| 估算工作量 | [roadmap/14](roadmap/14-路线图-估算指南.md) → 不确定性乘数 |
| 容量规划 | [roadmap/05](roadmap/05-路线图-容量规划.md) → 人周计算 |
| 量化技术债成本 | [roadmap/20](roadmap/20-路线图-技术债量化.md) → 三类成本公式 |

## 我在管理团队

| 场景 | 去这里 |
|---|---|
| 有效委托 | [roadmap/15](roadmap/15-路线图-委托指南.md) → 5 个层次 |
| 新成员入职 | [roadmap/16](roadmap/16-路线图-入职指南.md) → 30 天计划 |
| 给反馈 | [roadmap/17](roadmap/17-路线图-反馈指南.md) → SBI 模型 |
| 建立工作节奏 | [roadmap/13](roadmap/13-路线图-运营节奏.md) → 周/月/季度 |
| 说服非技术方 | [roadmap/18](roadmap/18-路线图-获得支持.md) → 翻译对照表 |
| 检查团队健康度 | [roadmap/21](roadmap/21-路线图-团队健康检查.md) → 10 维度评分 |

## 我在沟通

| 场景 | 去这里 |
|---|---|
| 向上/向外/向内沟通 | [roadmap/12](roadmap/12-路线图-利益相关者沟通.md) → 三种受众 |
| 写周报/月报 | [roadmap/19](roadmap/19-路线图-状态报告模板.md) |
| 写技术文档 | [architecture/16](architecture/16-架构-技术写作指南.md) → ADR/提案/README |
| 提案模板 | [architecture/01](architecture/01-架构-架构决策设计.md) → ADR 模板 |

## 我在管理风险

| 场景 | 去这里 |
|---|---|
| 上线前风险评估 | [risk/01](risk/01-风险-上线风险评估.md) → 5 类别 + 上线/不上线 |
| 事故后复盘 | [risk/02](risk/02-风险-事后复盘.md) → 5-Why + 无指责 |
| 追踪风险清单 | [risk/03](risk/03-风险-风险登记册模板.md) → 活跃风险表 |
| 评估依赖风险 | [risk/04](risk/04-风险-依赖风险管理.md) → 6 维度评分 |
| 事故中指挥 | [risk/05](risk/05-风险-事故指挥指南.md) → 三角色 + 决策框架 |
| 安全检查 | [risk/06](risk/06-风险-安全审查清单.md) → 15 项 |
| 写运维 Runbook | [risk/07](risk/07-风险-Runbook模板.md) → 模板 + 3 示例 |
| 备份与灾难恢复 | [risk/08](risk/08-风险-备份与灾难恢复.md) → RPO/RTO + 恢复流程 |

## 我在管容量和成本

| 场景 | 去这里 |
|---|---|
| 月度成本审查 | [capacity/01](capacity/01-容量-FinOps审查.md) → 5 步流程 |
| 追踪月度成本 | [capacity/02](capacity/02-容量-成本追踪模板.md) |
| 季度依赖审计 | [capacity/03](capacity/03-容量-依赖审计清单.md) |
| 估算服务器规模 | [capacity/05](capacity/05-容量-基础设施规模估算.md) → CPU/内存/存储 |
| 年度预算规划 | [capacity/06](capacity/06-容量-预算规划指南.md) |

## 我在提升质量

| 场景 | 去这里 |
|---|---|
| 代码审查 | [architecture/10](architecture/10-架构-代码审查标准.md) → 各项目检查清单 |
| 测试策略 | [architecture/15](architecture/15-架构-测试策略.md) → 3 项目对照 |
| 性能优化 | [architecture/19](architecture/19-架构-性能优化指南.md) → 4 步法 |
| MongoDB 查询优化 | [architecture/23](architecture/23-架构-MongoDB查询优化.md) → 6 集合模式 |
| 可观测性建设 | [architecture/20](architecture/20-架构-可观测性策略.md) → 日志+指标+告警 |
| 配置管理 | [architecture/21](architecture/21-架构-配置管理策略.md) → 环境+密钥 |

## 我在了解全局

| 场景 | 去这里 |
|---|---|
| 4 个项目如何协作 | [architecture/09](architecture/09-架构-架构全景图.md) → 架构图 + 数据流 |
| 当前架构水平 | [architecture/03](architecture/03-架构-架构成熟度模型-2026-08.md) |
| 文档体系水平 | [architecture/04](architecture/04-架构-文档成熟度模型-2026-08.md) |
| 交付能力基线 | [architecture/02](architecture/02-架构-DORA指标-2026-Q2基线.md) |
| 技术战略方向 | [architecture/08](architecture/08-架构-技术战略-2026-Q4方向.md) |
| 过去的技术决策 | [decisions/README](decisions/README.md) → 14 篇 ADR |

## 我在做 OKR

| 场景 | 去这里 |
|---|---|
| 如何写 OKR | [okr/README](okr/README.md) → 撰写指南 |
| Q4 目标 | [okr/2026-Q4](okr/2026-Q4/lead-002-testing-safety-net/goal.md) |
| 关键结果追踪 | [okr/2026-Q4](okr/2026-Q4/lead-002-testing-safety-net/) → 2 个 KR 追踪文档 |