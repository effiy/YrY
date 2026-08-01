---
title: Data Platform & Analytics Domain
tags: [brd, domain, data, analytics, BI, governance]
category: brd/domains
created: 2026-08-01
type: domain-knowledge
status: active
---

# Data Platform / Analytics Domain

> 数据平台与分析领域知识 — 涵盖数据管道、BI 仪表盘、ML 模型服务、数据治理、数据质量等核心场景。

---

## 1. 领域概述

Data 域是现代企业的决策引擎。在汽车行业，数据来源包括车辆遥测（车联网）、经销商 DMS、客户 CRM、生产 MES 等。典型架构为湖仓一体（Lakehouse）+ ELT 管道 + BI 层 + ML 平台。

### 典型业务子域

| 子域 | 描述 | 典型系统 |
|------|------|---------|
| 数据摄取与管道 | 多源数据接入 → 清洗 → 转换 → 入库 (ELT/ETL) | Airflow, dbt, Fivetran, Kafka Connect |
| 数据仓库/湖仓 | 存储、分区、索引、查询引擎 | Snowflake, Databricks, BigQuery, Redshift |
| BI 与可视化 | 语义层建模 → 仪表盘 → 自助分析 | Power BI, Tableau, Looker, Metabase |
| ML 平台 | 特征工程 → 训练 → 部署 → 监控 (MLOps) | MLflow, SageMaker, Vertex AI |
| 数据治理 | 元数据管理、数据目录、血缘分析、质量规则 | Collibra, Alation, Atlan, Monte Carlo |
| 主数据管理 (MDM) | 客户/车辆/配件/供应商黄金记录 | SAP MDG, Informatica MDM, Reltio |

---

## 2. 关键指标体系 (KPI)

| KPI | 行业基准 | 优秀目标 |
|-----|---------|---------|
| 数据管道成功率 | 95–98% | > 99.5% |
| 数据新鲜度（端到端延迟） | T+1 天 (批处理) | < 15 分钟 (实时) |
| BI 报告的查询响应时间 | 5–30 秒 | < 3 秒 |
| 数据质量问题率 | 2–5% | < 0.5% |
| 自助分析覆盖率 | 20–40% 用户 | > 70% |
| ML 模型投入生产比例 | 20–35% | > 50% |
| 数据目录覆盖率 | 40–60% | > 90% |

---

## 3. 常见痛点

| 痛点 | 量化影响 | 改进方向 |
|------|---------|---------|
| 数据孤岛 | 跨域分析需手动整合 5–10 个源 | 统一湖仓 + 语义层 |
| 数据质量差 | 分析师 40–60% 时间花在数据清洗 | 自动化质量规则 + 源头治理 |
| 报表口径不一致 | 同一 KPI 不同部门报出不同数值 | 统一语义层 + 认证数据集 |
| 数据发现难 | 分析人员找不到所需数据，重复建表 | 数据目录 + 搜索 + 血缘 |
| ML 落地慢 | 从实验到上线平均 6–12 个月 | MLOps 平台 + 特征存储 |

---

## 4. 典型用户角色

| 角色 | 使用频率 | 关键需求 | 影响级别 |
|------|---------|---------|---------|
| 数据工程师 | 每日 | 管道开发、调度管理、错误排查 | End User |
| 数据分析师 | 每日 | SQL 查询、仪表盘制作、自助取数 | End User |
| BI 开发 | 每周 | 语义模型、报表开发、性能优化 | End User |
| 数据科学家 | 每日 | 数据探索、特征工程、模型训练 | Key Influencer |
| 数据治理经理 | 每周 | 目录维护、质量规则、合规审查 | Key Influencer |
| CDO / 数据 VP | 每月 | 数据资产健康度、ROI、战略规划 | Decision Maker |

---

## 5. 领域术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| ETL / ELT | 抽取-转换-加载 / 抽取-加载-转换 | 数据从源到目标的管道模式 |
| Data Lake / Lakehouse | 数据湖/湖仓 | 同一平台支持结构化+非结构化+ML 负载 |
| Data Mesh | 数据网格 | 按业务域划分数据所有权的去中心化架构 |
| Data Catalog | 数据目录 | 可发现的企业数据资产清单 |
| Data Lineage | 数据血缘 | 数据从源到目标的端到端追溯 |
| Semantic Layer | 语义层 | 定义业务指标和维度的统一抽象 |
| Feature Store | 特征存储 | 机器学习特征的中心化管理和复用 |
| MLOps | 机器学习运维 | ML 模型持续集成/部署/监控的实践 |
| SLI / SLO / SLA | 服务水平指标/目标/协议 | 数据服务可靠性的度量体系 |
| GDPR Art. 22 | GDPR 第22条 | 自动化决策（含画像）的权利 |
