---
title: Business Scenario Patterns
tags: [brd, scenarios, index]
category: brd/scenarios
created: 2026-08-01
type: index
status: active
---

# Business Scenario Patterns

> 可复用的业务场景模式，每个场景包含 As-Is 流程（含痛点和量化影响）和 To-Be 流程（含预期收益和关键规则），供 `yry-gen-brd` skill 参考。

## 场景索引

| 场景 ID | 名称 | 领域 | 复杂度 | 描述 |
|---------|------|------|:------:|------|
| SCN-001 | 统一工单管理平台 | After-Sales | 高 | 多系统合并、多市场、智能路由 |
| SCN-002 | 保修自动化与反欺诈 | After-Sales | 中 | 数字索赔、规则审核、异常检测 |
| SCN-003 | 配件全局库存优化 | Supply Chain | 中 | 多级库存可视化、需求预测、智能调拨 |
| SCN-004 | CRM 统一客户视图 | Sales | 中 | 多渠道数据整合、360 画像、线索评分 |
| SCN-005 | 营销活动自动化 | Marketing | 中 | 客户分群、多渠道触达、归因分析 |
| SCN-006 | 合规自动化平台 | Legal/Security | 中 | 法规追踪、证据收集、自动报告 |
| SCN-007 | 数据治理与目录平台 | Data | 中 | 元数据管理、质量规则、血缘分析 |

---

## 场景文件结构

每个场景文件遵循以下模板：

```markdown
## 场景概述
- 行业背景、市场数据、业务驱动力

## As-Is 现状分析
- 当前流程步骤（按角色）
- 关键痛点与量化影响
- 当前使用的系统/工具

## To-Be 目标状态
- 目标流程步骤（按角色）
- 预期收益与量化目标
- 目标技术方案

## 关键业务规则
- MoSCoW 优先级
- 核心规则定义

## 集成与依赖
- 上下游系统
- 外部依赖

## 验收标准示例
- BDD 格式 (Given/When/Then)

## 风险与缓解
- Top 3 风险及缓解措施
```
