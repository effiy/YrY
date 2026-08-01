---
title: Finance & Accounting Domain
tags: [brd, domain, finance, accounting, controlling]
category: brd/domains
created: 2026-08-01
type: domain-knowledge
status: active
---

# Finance / Accounting Domain

> 财务与会计领域知识 — 涵盖财务报告、预算编制、费用管理、收入确认、成本核算等核心场景。

---

## 1. 领域概述

Finance 域是企业的管控核心。在汽车行业，财务涉及整车/配件销售收入核算、保修准备金计提、经销商返利结算、多币种多实体合并报表等复杂场景。典型架构包含 ERP 财务模块（FI/CO）为核心的记录到报告（R2R）、采购到付款（P2P）、订单到收款（O2C）三大流程。

### 典型业务子域

| 子域 | 描述 | 典型系统 |
|------|------|---------|
| 总账与合并 | 多实体凭证、跨币种折算、合并抵消、附注生成 | SAP FI-GL, Oracle GL, Hyperion |
| 应收账款 (AR) | 客户发票 → 收款 → 核销 → 账龄分析 | SAP FI-AR, Oracle Receivables |
| 应付账款 (AP) | 供应商发票 → 三单匹配 → 付款 → 对账 | SAP FI-AP, Oracle Payables |
| 管理会计 (CO) | 成本中心、利润中心、内部订单、产品成本 | SAP CO, Oracle Cost Management |
| 预算与预测 | 年度预算编制 → 滚动预测 → 偏差分析 | SAP BPC, Anaplan, Adaptive Insights |
| 资金管理 | 现金流预测、银行对账、外汇管理、支付工厂 | SAP TRM, Kyriba, FIS Quantum |
| 税务管理 | 增值税/销售税计算、转让定价、税务申报 | SAP Tax, Vertex, OneSource |

---

## 2. 关键指标体系 (KPI)

| KPI | 行业基准 | 优秀目标 |
|-----|---------|---------|
| 月度关账周期 | 5–10 个工作日 | < 3 个工作日 |
| 发票处理成本（每张） | €8–20 | < €5 |
| 应收周转天数 (DSO) | 45–60 天 | < 35 天 |
| 应付周转天数 (DPO) | 30–50 天 | 45–60 天（最优现金管理） |
| 预算偏差率 | ±8–15% | ±5% |
| 自动匹配率（AP 三单匹配） | 60–80% | > 90% |
| 审计调整项数 | 10–25 项/年 | < 5 项 |

---

## 3. 常见痛点

| 痛点 | 量化影响 | 改进方向 |
|------|---------|---------|
| 手工凭证多 | 关账期每天 4–6 小时做手工分录 | 自动化凭证模板 + 接口对接 |
| 对账耗时长 | 银行/供应商对账每周 5–10 小时 | 自动对账 + AI 异常标记 |
| 多系统数据不一致 | 每月 2–3 天调整差异 | 单一数据源 + 实时同步 |
| 报销流程慢 | 从提交到付款平均 15–25 天 | 移动报销 + 自动审批规则 |
| 跨币种折算复杂 | 汇率差异每月波动 1–3% | 自动汇率更新 + 套期保值追踪 |

---

## 4. 典型用户角色

| 角色 | 使用频率 | 关键需求 | 影响级别 |
|------|---------|---------|---------|
| 财务会计 | 每日 | 凭证录入、发票处理、银行对账 | End User |
| 管理会计 | 每周/每月 | 成本分析、利润分析、内部结算 | Key Influencer |
| 财务经理 | 每周/每月 | 关账管理、审核审批、合并报表 | Decision Maker |
| 财务总监/CFO | 每月/每季 | 财务报告、预算审批、现金流分析 | Decision Maker |
| 内部审计 | 每季/每年 | 流程合规、抽样检查、控制测试 | Key Influencer |

---

## 5. 适用法规框架

| 法规 | 适用范围 | 对 BRD 的影响 |
|------|---------|--------------|
| IFRS 15 / ASC 606 | 收入确认 | 收入拆分、履约义务识别、合同成本 |
| IFRS 16 / ASC 842 | 租赁会计 | 使用权资产、租赁负债计算 |
| IAS 37 | 准备金 | 保修准备金计提方法和参数 |
| German GAAP (HGB) | 德国法定报告 | 双重会计准则（IFRS + HGB） |
| EU VAT Directive | 增值税 | 跨境交易税率、Intrastat 申报 |
| SOX (US listed) | 内控 | IT 控制、职责分离、变更管理 |
| Transfer Pricing (OECD BEPS) | 转让定价 | 关联交易定价、文档要求 |

---

## 6. 领域术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| GL (General Ledger) | 总账 | 所有财务交易的中心记录 |
| AP/AR (Accounts Payable/Receivable) | 应付/应收账款 | 对供应商的欠款/客户欠款 |
| R2R (Record-to-Report) | 记录到报告 | 从交易记录到财务报告的全流程 |
| P2P (Procure-to-Pay) | 采购到付款 | 从请购到供应商付款的全流程 |
| O2C (Order-to-Cash) | 订单到收款 | 从客户订单到资金回笼的全流程 |
| DSO (Days Sales Outstanding) | 应收周转天数 | AR 余额 / 日均销售额 |
| DPO (Days Payable Outstanding) | 应付周转天数 | AP 余额 / 日均采购额 |
| Chart of Accounts (CoA) | 会计科目表 | 账户编码结构和分类体系 |
| Three-Way Match | 三单匹配 | 采购订单-收货单-发票三方核对 |
| Cost Center / Profit Center | 成本中心/利润中心 | 管理会计中的责任单元 |
| Accrual | 预提/应计 | 已发生但尚未支付/收取的费用/收入 |
| Fiscal Year | 财年 | 会计年度的起止期间 |
