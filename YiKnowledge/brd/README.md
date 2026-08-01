---
title: BRD Knowledge Base
tags: [brd, knowledge-base, business-analysis, requirements]
category: brd
created: 2026-08-01
type: index
status: active
---

# BRD Knowledge Base

> 业务需求文档（BRD）生成知识库 — 为 `yry-gen-brd` skill 和 YiAi BRD Agent 提供结构化的领域知识、业务场景、术语表和参考数据。

## 目录结构

```
brd/
├── README.md                  ← 本文件 — 知识库总览与使用指南
├── domains/                   ← 业务领域知识（10 个领域）
├── scenarios/                 ← 典型业务场景模式
├── terminology/               ← 术语表与行业词汇
├── reference/                 ← 参考数据（国家、法规、品牌、系统）
├── examples/                  ← 完整 BRD 示例
└── brd-documents/             ← 已生成的 BRD 数据文件
```

## 知识库用途

| 使用者 | 用途 |
|--------|------|
| **yry-gen-brd skill** | 读取领域知识生成高质量 BRD meta 字段和正文内容 |
| **YiAi BRD Agent** | 单章节生成时参考领域术语、场景模式、KPI 基准 |
| **人工 BRD 编写** | 参考模板、示例、术语表快速起草 BRD |

## 各目录说明

### domains/ — 业务领域知识

每个领域文件包含：
- 领域概述与典型业务场景
- 关键指标体系（KPI）
- 常见痛点与改进机会
- 典型用户角色/画像
- 适用法规框架
- 常见系统集成
- 领域术语

涵盖 10 个业务领域（对齐 `meta-schemas.ts` 中的 `DOMAIN_OPTIONS`）：

| 领域 | 文件 | 典型场景 |
|------|------|---------|
| After-Sales / Customer Service | `after_sales.md` | 工单管理、保修索赔、配件物流、客服中心 |
| Sales / CRM | `sales.md` | 线索管理、销售漏斗、客户 360、渠道管理 |
| Marketing / Campaign | `marketing.md` | 活动编排、客户分群、多渠道营销、ROI 分析 |
| Supply Chain / Logistics | `supply_chain.md` | 库存优化、需求预测、供应商管理、物流追踪 |
| Finance / Accounting | `finance.md` | 财务报告、预算编制、费用管理、收入确认 |
| Human Resources | `hr.md` | 员工生命周期、绩效管理、学习发展、编制规划 |
| Data Platform / Analytics | `data.md` | 数据管道、BI 仪表盘、ML 模型服务、数据治理 |
| IT Infrastructure | `infra.md` | 服务台、事件管理、变更管理、资产管理 |
| Security / Compliance | `security.md` | 访问控制、审计日志、漏洞管理、策略执行 |
| Legal / Regulatory | `legal.md` | 合同管理、法规追踪、案件管理、电子发现 |

### scenarios/ — 业务场景模式

可复用的业务场景模板，每个场景包含：
- 行业背景与市场数据
- As-Is 流程（含量化痛点）
- To-Be 流程（含预期收益）
- 关键业务规则
- 验收标准示例
- 风险与缓解措施

### terminology/ — 术语表

- `general.md` — 通用 BRD/项目管理术语（中英双语）
- `after-sales.md` — 售后服务领域术语
- `automotive.md` — 汽车行业专用术语

### reference/ — 参考数据

- `countries.md` — 目标国家/地区业务画像（GDPR 适用性、市场特征、语言）
- `regulations.md` — 按国家和领域的法规框架
- `brands.md` — 品牌信息与市场分布
- `systems.md` — 常见企业系统模块及集成模式

### examples/ — BRD 示例

完整的 BRD 文档示例，展示从元数据到正文的标准输出。

## 与 yry-gen-brd Skill 的集成

`yry-gen-brd` skill 按以下顺序读取知识库：

```
1. 读取 brd/domains/{domain}.md     → 获取领域 KPI、痛点、角色、术语
2. 读取 brd/scenarios/{scenario}.md  → 参考 As-Is/To-Be 流程模式
3. 读取 brd/terminology/{domain}.md  → 准确使用领域术语
4. 读取 brd/reference/countries.md   → 匹配目标市场特征
5. 读取 brd/reference/regulations.md → 匹配适用法规
6. 读取 brd/examples/                → 参考示例的输出格式和详细程度
```

## 维护规则

| # | 规则 |
|---|------|
| 1 | 领域文件使用统一的模板结构（概述 → KPI → 痛点 → 角色 → 法规 → 系统 → 术语） |
| 2 | 所有度量指标包含基准值（baseline）和目标值（target），供 skill 参考 |
| 3 | 术语表保持中英双语，新增术语同步到各领域文件 |
| 4 | 场景文件聚焦可复用模式，不包含具体客户/项目信息 |
| 5 | 参考数据每年至少审核一次（法规变化、市场数据更新） |
