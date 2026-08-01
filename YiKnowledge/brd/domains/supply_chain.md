---
title: Supply Chain & Logistics Domain
tags: [brd, domain, supply-chain, logistics, inventory]
category: brd/domains
created: 2026-08-01
type: domain-knowledge
status: active
---

# Supply Chain / Logistics Domain

> 供应链与物流领域知识 — 涵盖库存优化、需求预测、供应商管理、物流追踪、仓储管理等核心场景。

---

## 1. 领域概述

Supply Chain 域是制造和零售企业的运营命脉。在汽车行业，供应链覆盖整车物流（OTD）、配件供应（Aftermarket Parts）、供应商协同等，复杂度极高：单一车型涉及 20,000–30,000 个零件、500–1,000 家供应商。

### 典型业务子域

| 子域 | 描述 | 典型系统 |
|------|------|---------|
| 需求预测与计划 | 历史数据 + 市场信号 → 需求预测 → 补货计划 | SAP IBP, Kinaxis, Blue Yonder |
| 库存优化 | 安全库存计算、EOQ、ABC 分类、多级库存 | SAP MM, Oracle Inventory |
| 供应商管理 | 供应商准入、绩效评估、合同管理、协同平台 | SAP Ariba, Coupa, Jaggaer |
| 仓储管理 (WMS) | 入库 → 上架 → 拣货 → 包装 → 出库 | Manhattan, Blue Yonder WMS |
| 运输管理 (TMS) | 运输计划 → 执行 → 追踪 → 结算 | SAP TM, Oracle TMS, BluJay |
| 全球贸易合规 | HS 编码分类、关税计算、进出口申报 | SAP GTS, Amber Road |

---

## 2. 关键指标体系 (KPI)

| KPI | 行业基准 | 优秀目标 |
|-----|---------|---------|
| 库存周转率 | 4–8 次/年 | > 10 次/年 |
| 订单完美履行率 (OTIF) | 90–95% | > 98% |
| 呆滞库存占比 | 10–20% | < 5% |
| 供应商准时交付率 | 85–95% | > 95% |
| 需求预测准确率 (MAPE) | 15–25% | < 12% |
| 运输准时率 | 90–95% | > 97% |
| 供应链总成本率 | 8–15% 营收 | < 8% |

---

## 3. 常见痛点

| 痛点 | 量化影响 | 改进方向 |
|------|---------|---------|
| 牛鞭效应 | 需求波动向上游逐级放大 3–5× | 需求信息共享 + VMI |
| 库存不透明 | 安全库存偏高 15–30% 以应对不确定性 | 全局库存可视化 + 实时同步 |
| Excel 计划 | 计划员每周 12–20 小时手工更新 | 自动计划系统 + 异常管理 |
| 供应商可见性差 | 30–50% 订单状态需人工确认 | 供应商门户 + EDI/API 集成 |
| 运输成本失控 | 紧急运费占运输总成本 15–25% | 运输优化 + 池分配送 |

---

## 4. 典型用户角色

| 角色 | 使用频率 | 关键需求 | 影响级别 |
|------|---------|---------|---------|
| 需求计划员 | 每周/每月 | 预测模型、历史分析、异常标记 | End User |
| 库存分析师 | 每日 | 库存仪表盘、补货建议、ABC 分析 | End User |
| 采购经理 | 每日/每周 | 供应商绩效、合同管理、寻源 | Decision Maker |
| 仓库经理 | 每日 | 入库/出库计划、拣货效率、人力调配 | Decision Maker |
| 物流协调员 | 每日 | 运输追踪、异常处理、运费审核 | End User |
| 供应链 VP | 每周/每月 | 全局指标、成本分析、风险管理 | Decision Maker |

---

## 5. 领域术语

| 术语 (EN) | 术语 (ZH) | 定义 |
|-----------|-----------|------|
| OTIF (On-Time In-Full) | 准时足量交付 | 按时+足量完成的订单占比 |
| EOQ (Economic Order Quantity) | 经济订货批量 | 平衡订货成本和持有成本的最优订货量 |
| VMI (Vendor-Managed Inventory) | 供应商管理库存 | 供应商监控并自动补充客户库存 |
| ABC Classification | ABC 分类 | 按价值将库存分为 A(高)/B(中)/C(低) 类管理 |
| Bullwhip Effect | 牛鞭效应 | 需求波动沿供应链逐级放大的现象 |
| Lead Time | 提前期 | 下达订单到收货的总时间 |
| Safety Stock | 安全库存 | 应对需求和供应波动的缓冲库存 |
| MAPE (Mean Absolute Percentage Error) | 平均绝对百分比误差 | 衡量预测准确率的常用指标 |
| 3PL / 4PL | 第三方/第四方物流 | 外包物流服务商的不同层级 |
| SKU (Stock Keeping Unit) | 库存单位 | 最小库存管理单元 |
| BOM (Bill of Materials) | 物料清单 | 制造一个成品所需的所有组件 |
| S&OP (Sales & Operations Planning) | 销售与运营计划 | 跨职能的供需平衡规划流程 |
