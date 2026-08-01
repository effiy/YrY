---
title: Business Domain Index
tags: [brd, domain, index]
category: brd/domains
created: 2026-08-01
type: index
status: active
---

# Business Domain Index

> 10 个业务领域的知识索引，每个领域文件提供统一的参考结构供 `yry-gen-brd` skill 使用。

## 领域速查表

| 领域 | 文件 | 关键 KPI 数 | 痛点数 | 角色数 | 术语数 |
|------|------|:---------:|:-----:|:-----:|:-----:|
| After-Sales / Customer Service | [after_sales.md](after_sales.md) | 15 | 10 | 8 | 20 |
| Sales / CRM | [sales.md](sales.md) | 7 | 5 | 6 | 12 |
| Marketing / Campaign | [marketing.md](marketing.md) | 7 | 5 | 5 | 10 |
| Supply Chain / Logistics | [supply_chain.md](supply_chain.md) | 7 | 5 | 6 | 12 |
| Finance / Accounting | [finance.md](finance.md) | 7 | 5 | 5 | 12 |
| Human Resources | [hr.md](hr.md) | 7 | 5 | 5 | 10 |
| Data Platform / Analytics | [data.md](data.md) | 7 | 5 | 5 | 10 |
| IT Infrastructure | [infra.md](infra.md) | 7 | 5 | 5 | 12 |
| Security / Compliance | [security.md](security.md) | 7 | 5 | 5 | 12 |
| Legal / Regulatory | [legal.md](legal.md) | 7 | 5 | 4 | 10 |

## 领域文件结构

每个领域文件遵循统一的模板结构：

```
1. 领域概述 — 行业定位、业务子域、典型系统
2. 关键指标体系 (KPI) — 行业基准 vs 优秀目标
3. 常见痛点与改进机会 — 量化影响 + 改进方向
4. 典型用户角色/画像 — 使用频率、需求、影响级别
5. 适用法规框架 — 法规名称、适用范围、对 BRD 的影响
6. 常见系统集成 — 源系统、方向、数据、协议
7. 领域术语 — EN/ZH 双语，含定义
```

## 使用方式

`yry-gen-brd` skill 根据 `--domain` 参数自动加载对应领域文件：

```
--domain after_sales  → 读取 domains/after_sales.md
--domain sales        → 读取 domains/sales.md
...
```

领域文件提供的上下文用于：
- 生成真实的业务背景和当前状态描述
- 填充量化指标（KPI 基准值 → 改善目标）
- 匹配合适的用户角色和关键需求
- 引用正确的法规框架和约束条件
- 使用准确的领域术语
