---
doc_type: test
title: "YA-09-12: 代码健康分析服务 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-12"
source_prds: ["12-需求-代码健康分析服务"]
source_modules: ["12-prd-task-代码健康分析服务"]
source_okr: [yiai-001]
---

# YA-09-12: 代码健康分析服务 — 测试规格

> 来源 PRD：[12-需求-代码健康分析服务.md](../../prds/2026-09/12-需求-代码健康分析服务.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CH-01 | 代码规模统计 | 文件数/行数/注释率 |
| UT-CH-02 | 圈复杂度扫描 | 每个函数返回复杂度值 |
| UT-CH-03 | 重复代码检测 | 相似度 > 0.8 → 标记 |
| UT-CH-04 | 覆盖率数据聚合 | 行覆盖率/分支覆盖率 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S2 — 一般 | 大文件扫描超时 |

---