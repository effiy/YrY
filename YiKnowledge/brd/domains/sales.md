---
title: Sales & CRM Domain
tags: [brd, domain, sales, crm, customer-relationship]
category: brd/domains
created: 2026-08-01
type: domain-knowledge
status: active
---

# Sales / CRM Domain

> 销售与客户关系管理领域知识 — 涵盖线索管理、销售漏斗、客户 360、渠道管理、销售预测等核心场景。

---

## 1. 领域概述

Sales/CRM 域是企业的收入引擎。在汽车行业，这包括整车销售（新车/二手车）、配件销售、金融服务交叉销售等。典型的销售组织按区域/品牌划分，采用 B2B（经销商网络）和 B2C（直销/DTC）混合模式。

### 典型业务子域

| 子域 | 描述 | 典型系统 |
|------|------|---------|
| 线索管理 | 市场线索 → 资格验证 → 分配 → 跟进 → 转化的全生命周期 | Salesforce Sales Cloud, HubSpot, 自研 LMS |
| 销售漏斗管理 | 多阶段漏斗追踪、赢率分析、停滞预警 | Salesforce, Pipedrive, Zoho CRM |
| 客户 360 | 客户画像、购买历史、互动记录、偏好标签 | Salesforce Customer 360, Microsoft Dynamics 365 |
| 渠道/经销商管理 | 经销商绩效、激励政策、培训认证、销售报表 | DMS, SAP Hybris |
| 合同与报价 | CPQ（配置-定价-报价）、合同生成、审批流 | Salesforce CPQ, Oracle CPQ |
| 销售预测 | 基于管道+历史的滚动预测、偏差分析 | Clari, Anaplan, 自研 BI |

---

## 2. 关键指标体系 (KPI)

| KPI | 行业基准 | 优秀目标 |
|-----|---------|---------|
| 线索转化率 (Lead-to-Opportunity) | 5–15% | > 20% |
| 机会赢率 (Win Rate) | 20–35% | > 40% |
| 平均销售周期 | 30–90 天 | < 45 天 |
| 客户获取成本 (CAC) | €200–800 (B2B) | < €400 |
| 客户生命周期价值 (CLV) | CAC 的 3–5× | > 5× |
| CRM 数据完整率 | 60–80% | > 95% |
| 销售预测准确率 | ±15–25% | ±10% |

---

## 3. 常见痛点

| 痛点 | 量化影响 | 改进方向 |
|------|---------|---------|
| CRM 数据碎片化 | 销售每天 30–60 分钟做数据录入 | 统一 CRM + 自动化采集 |
| 线索响应慢 | 5 分钟内联系线索的转化率是 30 分钟后的 21× | 自动分配 + SLA 提醒 |
| 报价流程慢 | 从询价到报价平均 2–5 天 | CPQ 自动化 + 预审批矩阵 |
| 预测靠 Excel | 每周 4–8 小时手工汇总；±30% 偏差 | 统一预测工具 + ML 辅助 |
| 渠道数据不及时 | 经销商月度报表延迟 2–4 周 | DMS 实时集成 + API 拉取 |

---

## 4. 典型用户角色

| 角色 | 使用频率 | 关键需求 | 影响级别 |
|------|---------|---------|---------|
| 销售代表 | 每日 | 线索管理、客户视图、报价/下单 | End User |
| 销售经理 | 每日 | 团队管道、预测、审批 | Decision Maker |
| CRM 管理员 | 每日 | 字段配置、流程自动化、数据质量 | Key Influencer |
| 渠道经理 | 每周 | 经销商绩效、激励计算、培训追踪 | Key Influencer |
| 销售运营 | 每周/每月 | 报告、预测、区域规划、佣金计算 | Key Influencer |
| 销售 VP | 每周/每月 | 全局管道、预测 vs 实际、市场分析 | Decision Maker |

---

## 5. 领域术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| Lead | 线索 | 潜在客户的初始联系信息 |
| Opportunity | 商机 | 经过资格验证的有购买意向的潜在交易 |
| Sales Funnel / Pipeline | 销售漏斗/管道 | 从线索到成交的阶段化追踪视图 |
| Win Rate | 赢率 | 已赢单商机 / 已关闭商机总量 |
| CPQ (Configure-Price-Quote) | 配置定价报价 | 按规则自动生成产品配置和报价 |
| CAC (Customer Acquisition Cost) | 客户获取成本 | 营销+销售总投入 / 新客户数量 |
| CLV (Customer Lifetime Value) | 客户生命周期价值 | 客户全生命周期贡献的毛利 |
| Churn Rate | 流失率 | 周期内停止交易的客户占比 |
| Territory | 销售区域 | 按地理/行业划分的销售责任区 |
| Quota | 销售配额 | 销售个人/团队的目标值 |
| DTC (Direct-to-Consumer) | 直销 | 品牌直接面向终端客户的销售模式 |
| Channel Sales | 渠道销售 | 通过经销商/合作伙伴的间接销售 |
