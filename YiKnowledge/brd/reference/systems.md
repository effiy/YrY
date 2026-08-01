---
title: Reference Brands & Systems
tags: [brd, reference, brands, systems]
category: brd/reference
created: 2026-08-01
type: reference-data
status: active
---

# Brands & Systems Reference

> 品牌信息和常见企业系统模块参考，供 `yry-gen-brd` skill 在生成 BRD 时使用。

---

## 品牌信息

| 品牌 | 定位 | 主要市场 | 售后特征 |
|------|------|---------|---------|
| Brand A | 主流乘用车 | EU 全域 + CN + US | 授权经销商网络 ~500 家；配件 SKU ~25,000 |
| Brand B | 高端/豪华乘用车 | EU 全域 + CN + JP | 授权经销商 ~300 家；高服务标准；配件 SKU ~18,000 |
| All Brands | 多品牌统一运营 | EU 全域 | 需支持品牌间差异化的 SLA、配件目录、保修政策 |

---

## 常见企业系统模块

### ERP & 核心系统

| 系统 | 模块 | 功能 | 集成协议 |
|------|------|------|---------|
| SAP ECC / S/4HANA | FI (Financial Accounting) | 总账、应收、应付、资产 | RFC, OData, IDoc |
| SAP ECC / S/4HANA | CO (Controlling) | 成本中心、利润中心、内部订单 | RFC, OData |
| SAP ECC / S/4HANA | MM (Materials Management) | 采购、库存管理、物料主数据 | RFC, OData, IDoc |
| SAP ECC / S/4HANA | SD (Sales & Distribution) | 销售订单、定价、发货、开票 | RFC, OData, IDoc |
| SAP ECC / S/4HANA | CS (Customer Service) | 服务工单、保修处理、维修 BOM | RFC, OData |

### CRM & 客户

| 系统 | 用途 | 集成协议 |
|------|------|---------|
| Salesforce Sales Cloud | 销售线索、商机、客户管理 | REST API |
| Salesforce Service Cloud | 客服工单、知识库、自助门户 | REST API |
| Microsoft Dynamics 365 | CRM + ERP 一体化 | REST API, OData |
| Zendesk | 客服工单系统（DE+FR 当前使用） | REST API |

### 汽车行业专用

| 系统 | 用途 | 集成协议 |
|------|------|---------|
| Dealer Portal | 经销商入口：车辆档案、保修查询、配件订购 | REST API |
| TecDoc | 标准化配件目录数据 | REST API |
| DMS (Dealer Management System) | 经销商运营管理 | REST / SFTP |
| Telematics Platform | 车联网数据采集与分析 | MQTT, REST API |

### 基础设施 & 安全

| 系统 | 用途 | 集成协议 |
|------|------|---------|
| Azure AD / Entra ID | 企业 SSO + 条件访问 + MFA | SAML 2.0, OIDC, SCIM |
| Okta | 身份与访问管理 | SAML 2.0, OIDC |
| ServiceNow | IT 服务管理 (ITSM) | REST API |
| Splunk / Datadog | 日志聚合与监控 | REST API, Agent |

### BI & 分析

| 系统 | 用途 | 集成协议 |
|------|------|---------|
| Power BI | 仪表盘与报告 | ODBC, REST API |
| Tableau | 自助分析与可视化 | ODBC, REST API |
| Snowflake / Databricks | 数据仓库/湖仓 | JDBC, REST API |

### 通信与协作

| 系统 | 用途 | 集成协议 |
|------|------|---------|
| Microsoft 365 / Teams | 邮件、协作、通知 | Graph API, SMTP |
| Twilio / SendGrid | SMS + Email 通知 | REST API, SMTP |
| Slack | 团队沟通与告警 | Webhook, REST API |
