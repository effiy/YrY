---
doc_type: test
title: "YA-09-03: 检索高级技术 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-03"
source_prds: ["03-需求-检索高级技术"]
source_modules: ["03-prd-task-检索高级技术"]
source_okr: [yiai-002]
---

# YA-09-03: 检索高级技术 — 测试规格

> 来源 PRD：[03-需求-检索高级技术.md](../../prds/2026-09/03-需求-检索高级技术.md)
> 开发方案：[03-prd-task-检索高级技术.md](../../devs/2026-09/03-prd-task-检索高级技术.md)
> 需求编号：YA-09-03 · 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖语义哈希、对比学习、蒸馏、多模态、索引管理。

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SH-01 | LSH 哈希码一致性 | 同一向量两次哈希 → 相同 hash |
| UT-SH-02 | LSH 召回率 > 90% | 暴力 Top-20 验证 LSH Top-20 重叠率 |
| UT-CL-01 | SimCSE 正样本相似度 > 负样本 | Sim(u_drop1, u_drop2) > Sim(u, v) |
| UT-KD-01 | 学生模型推理速度 ≥ 3× 教师 | 100 次推理计时对比 |
| UT-MM-01 | CLIP 图片向量化 | 图片 → 512-d 向量 |
| UT-IX-01 | 索引热插拔不中断检索 | 新旧索引切换期间 `rag_query` 正常返回 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 索引热插拔导致检索 500 |
| S2 — 一般 | LSH 召回率 < 80% |

---