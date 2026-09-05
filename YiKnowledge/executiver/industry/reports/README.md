---
title: 行业报告目录
aliases: [reports-leaf-readme, reports-readme]
tags: [leaf, industry, reports]
category: executiver/industry/reports
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [executiver]
benefit: "高管可以定位第三方行业报告摘要 — Gartner、McKinsey、a16z、CAICT、IDC — 包含已验证的来源链接和最后验证日期"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
  - ../../../engineer/run/understand-competitors.md
  - ../competitors/README.md
  - ../market-trends/README.md
---

# 行业报告目录

> **作为**高管，**我想要**追踪竞争对手、市场趋势和行业报告，**以便**战略决策立足于市场现实。

> 第三方行业报告摘要和原文存档。外部内容必须包含 `last_verified`；超过半年未验证的，转为 `status: deprecated`。

## 范围

- 咨询公司 / 投资银行 / 研究机构的行业报告
- 政府和监管部门白皮书
- 行业联盟和媒体年度汇总
- 供应商技术白皮书

## 文件类型与命名

- `{year}-{topic}-summary.md`：报告摘要
- `{year}-{topic}-original.md`：原文存档（PDF / MD）
- 英文 kebab-case 命名，四位数字年份

## 已收录

| File | Content | Status |
|---|---|---|
| [ai-industry-report-summary.md](./ai-industry-report.md) | 2026 AI 行业趋势报告摘要 | active |
| [gartner-ai-hype-cycle.md](./gartner-ai-hype-cycle.md) | Gartner AI 技术成熟度曲线 2026 — 5 个阶段、AI 技术定位、时机框架 | active |
| [mckinsey-ai-report.md](./mckinsey-ai-report.md) | McKinsey AI 报告 — $13-22T 经济影响、各行业采用情况、AI 领导者特征 | active |
| [idc-customer-service.md](./idc-customer-service.md) | IDC 客服报告 — $45-55B 市场、供应商格局、技术采用曲线 | active |
| [caict-ai-whitepaper.md](./caict-ai-whitepaper.md) | CAICT AI 白皮书 — 中国 AI 市场 600-800B 人民币、国内模型格局、政策时间线 | active |
| [a16z-ai-outlook.md](./a16z-ai-outlook.md) | a16z AI 展望 — LLM OS 框架、基础设施 vs 应用层、垂直 AI 护城河 | active |

## 推荐结构（摘要）

1. 报告基本信息（机构、作者、发布日期、页数）
2. 核心观点（3-5 条）
3. 关键数据（市场规模、增长率、渗透率）
4. 行业判断与预测
5. 对本产品 / 业务的影响
6. 原文引用

## 相关叶子目录

- [../competitors/](../competitors/) — 竞争对手供应商
- [../market-trends/](../market-trends/) — 市场趋势
- [../../../producter/industry-cases](../../../producter/strategy) — 落地案例
- [../../../engineer/run/understand-competitors.md](../../../engineer/run/understand-competitors.md) — 场景入口
- [../../../curator/diagrams/knowledge-map.md](../../../curator/diagrams/knowledge-map.md) — 知识地图