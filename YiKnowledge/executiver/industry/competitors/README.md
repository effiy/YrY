---
title: 竞争对手分析目录
aliases:
- competitors-leaf-readme
- competitors-readme
tags:
- leaf
- industry
- competitors
category: executiver/industry/competitors
created: '2026-08-03'
updated: '2026-08-18'
last_verified: '2026-08-18'
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles:
- executiver
- producter
benefit: "高管和产品经理可以找到竞争对手档案、产品对比、分析模板、LLM 供应商格局和区域竞争对手地图 — 包含清晰的分类框架、情报来源和维护工作流"
acceptance_criteria:
- 叶子目录范围边界清晰，有明确的排除项
- 文件清单表完整，包含一句话描述和状态
- 竞争对手分类框架（直接/间接/相邻/潜在）已记录
- 情报收集来源已列出
- 推荐结构覆盖所有文件类型（档案、对比、摘要）
- 维护工作流已定义，含审查频率
- 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
- ../../../engineer/run/understand-competitors.md
- ../reports/README.md
- ../market-trends/README.md
- ../../strategy/README.md
- ../../roadmap/README.md
---

# 竞争对手分析目录

> **作为**高管，**我想要**追踪竞争对手、市场趋势和行业报告，**以便**战略决策立足于市场现实。
> 竞争对手公司档案、产品对比、竞争对手分析模板和方法论。每月刷新；外部内容必须包含 `last_verified`；超过半年未验证的条目必须标记 `status: deprecated`。

## 范围

**包含：**

- 同赛道竞争对手公司档案（直接竞争对手）
- 竞争对手功能 / 定价 / 渠道对比
- 竞争对手公开事件追踪（产品发布、融资、合作、收购）
- 竞争对手分析模板和方法论
- LLM 供应商和技术提供商格局
- 区域竞争对手地图及监管背景

**不包含：**

- 第三方行业报告 → [../reports/](../reports/)
- 市场规模、增长率、趋势预测 → [../market-trends/](../market-trends/)
- 内部产品战略或路线图决策 → [../../strategy/](../../strategy/), [../../roadmap/](../../roadmap/)
- 客户赢单/丢单分析 → [../../../producter/](../../../producter/)
- 技术深度研究或架构审查 → [../../../engineer/](../../../engineer/)

## 竞争对手分类

使用此四层框架对每个竞争对手在档案 frontmatter 中分类（`tier` 字段）：

| Tier | Label | Definition | Analysis depth |
|---|---|---|---|
| 1 | **直接** | 相同产品类别、相同目标客户、相同价值主张 | 完整 8 节档案，每季度刷新 |
| 2 | **间接** | 不同产品类别但解决相同客户任务 | 4 节对比，每半年刷新 |
| 3 | **相邻** | 相同产品类别但不同客户群体或区域 | 3 节快照，每年刷新 |
| 4 | **潜在** | 可能在 12-18 个月内进入市场（相邻扩展、资金充足的初创公司） | 雷达观察清单，每半年审查 |

## 情报收集来源

| Source type | Examples | Use for |
|---|---|---|
| **官方渠道** | 公司博客、产品更新日志、新闻稿、财报电话会 | 产品更新、战略转变、财务健康 |
| **第三方评测** | G2、Capterra、TrustRadius、Product Hunt | 用户情绪、功能差距、定价认知 |
| **行业媒体** | TechCrunch、VentureBeat、36Kr、LatePost | 融资、合作、领导层变动 |
| **社交聆听** | Twitter/X、LinkedIn、Reddit、Hacker News | 开发者情绪、社区热度、招聘信号 |
| **招聘信息** | LinkedIn Jobs、公司招聘页面 | 技术栈、扩张方向、团队规模 |
| **监管文件** | SEC、CSRC、GDPR/CCPA 通知 | 合规姿态、市场进入壁垒 |
| **会议演讲** | KubeCon、re:Invent、Google Cloud Next、本地技术聚会 | 技术路线图、思想领导力 |

## 如何使用本目录

1. **添加新竞争对手**：复制 `competitor-analysis.md` 模板，填写 8 个部分，在下方"已收录"表中添加一行
2. **更新现有档案**：编辑文件，更新 frontmatter 中的 `updated` 和 `last_verified`
3. **对比竞争对手**：参考 `saas-top-players.md` 了解多供应商对比模式
4. **查看区域格局**：从 `regional-competitors.md` 开始了解特定区域的背景
5. **了解 LLM 供应商格局**：`llm-vendor-landscape.md` 了解模型供应商定位

## 文件类型与命名

- `{company-english-name}-profile.md`：竞争对手公司档案（Tier 1，完整 8 节）
- `{company-english-name}-{product-name}-comparison.md`：对比分析（Tier 2，4 节）
- `{company-english-name}-snapshot.md`：简要快照（Tier 3，3 节）
- `competitor-analysis-template.md`：新档案的通用模板
- `*-summary.md`：竞争对手动态摘要（季度汇总）
- `*-landscape.md`：多供应商格局概述

所有文件名使用 kebab-case 英文。

## 已收录

| File | Content | Tier | Status |
|---|---|---|---|
| [llm-vendor-landscape.md](./llm-vendor-landscape.md) | 大模型供应商竞争格局（Anthropic / OpenAI / Google / Meta / DeepSeek）— 模型能力、定价、生态 | 2 | planned |
| [competitor-analysis.md](./competitor-analysis.md) | Tier 1 档案的通用竞争对手分析模板（八节） | — | planned |
| [saas-top-players.md](./saas-top-players.md) | SaaS 客服头部玩家（Zendesk、Freshdesk、Intercom、Salesforce、HubSpot）— 功能对比、定价、定位 | 1 | planned |
| [ai-brd-competitors.md](./ai-brd-competitors.md) | AI BRD / 业务需求自动化赛道玩家 — AI 写作工具、PM 平台、企业需求工具 | 1 | planned |
| [regional-competitors.md](./regional-competitors.md) | 区域竞争对手 — 欧洲、东南亚、中东 — 本地玩家、监管格局、进入策略 | 3 | planned |

## 推荐结构

### Tier 1 — 竞争对手公司档案（8 节）

1. **公司概览** — 成立时间、规模、区域、融资阶段、关键人物、年收入（估算）
2. **核心产品矩阵** — 产品线、旗舰功能、技术差异化
3. **商业模式与定价** — 收入模型、定价层级、折扣策略、合同条款
4. **渠道与生态** — 销售渠道、合作伙伴网络、开发者生态、应用市场
5. **技术栈与公开能力** — 推断的技术栈、API/SDK 成熟度、可扩展性信号
6. **对标维度** — 功能覆盖差距、价格差距、UX 差距、性能差距、生态差距
7. **近期动态与公开事件** — 过去 6 个月：产品发布、融资、合作、收购、领导层变动
8. **我方应对策略** — 威胁等级、差异化定位、反制措施、时间线

### Tier 2 — 产品对比（4 节）

1. **对比范围** — 哪些产品、哪些维度、对比日期
2. **功能矩阵** — 并排功能表，含覆盖评级（完整/部分/无）
3. **定价对比** — 各方案价格分解、隐藏成本、TCO 估算
4. **定位地图** — 2x2 定位、我方相对优势、待弥补差距

### Tier 3 — 区域快照（3 节）

1. **区域市场概览** — 市场规模、本地玩家、监管环境
2. **关键本地竞争对手** — 前 3-5 个本地玩家及简要档案
3. **进入评估** — 壁垒、本地化需求、推荐方法

### 格局概述（多供应商）

1. **格局范围** — 供应商类别、时间周期、数据来源
2. **定位矩阵** — 能力 vs 成熟度，或能力 vs 定价，2x2
3. **供应商档案** — 每个供应商一段话，含关键差异化
4. **趋势与影响** — 市场方向、对我方定位的影响

## 维护工作流

| Cadence | Action | Owner |
|---|---|---|
| **每周** | 扫描竞争对手官方渠道，关注产品更新、定价变化 | executiver |
| **每月** | 审查所有文件的 `last_verified`；更新或标记为 deprecated | executiver |
| **每季度** | 完整 Tier 1 档案刷新；Tier 4 雷达审查 | executiver + producter |
| **每半年** | Tier 2 对比刷新；Tier 4 潜在进入者重新评估 | producter |
| **每年** | Tier 3 区域快照刷新；分类层级审查 | executiver |

> **弃用规则**：任何 `last_verified` 超过 6 个月的文件必须移至 `archive/` 并标记 `status: deprecated`。

## 相关叶子目录

- [../reports/](../reports/) — 第三方行业报告（Gartner、McKinsey、a16z、CAICT、IDC）
- [../market-trends/](../market-trends/) — 市场规模、增长率、趋势预测
- [../../strategy/](../../strategy/) — 内部战略工具和框架
- [../../roadmap/](../../roadmap/) — 产品路线图和规划
- [../../../engineer/run/understand-competitors.md](../../../engineer/run/understand-competitors.md) — 场景入口：工程师研究竞争对手
- [../../../producter/](../../../producter/) — 客户赢单/丢单、落地案例研究