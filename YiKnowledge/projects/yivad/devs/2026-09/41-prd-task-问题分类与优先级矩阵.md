---
doc_type: module
prd_task_id: "YV-09-91"
title: "YV-09-91: 问题分类与优先级矩阵 — 艾森豪威尔矩阵视图(紧急/重要)、象限间拖拽问题、按优先级+截止日期自动分类、象限容量限制、优先级热力图、批量重排优先级 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "41-prd-问题分类与优先级矩阵.md"
---

# YV-09-91: 问题分类与优先级矩阵 — 艾森豪威尔矩阵视图(紧急/重要)、象限间拖拽问题、按优先级+截止日期自动分类、象限容量限制、优先级热力图、批量重排优先级 — 开发任务

> 来源 PRD：[41-prd-问题分类与优先级矩阵.md](../prds/2026-09/41-prd-问题分类与优先级矩阵.md)
> 需求编号：YV-09-91 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现分类规则引擎 | `src/composables/useClassificationEngine.ts` | 规则匹配和批量分类正确 | 0.04 |
| 2 | 实现优先级矩阵 store | `src/stores/priorityMatrix.ts` | 数据加载和象限分布计算 | 0.03 |
| 3 | 创建矩阵视图（4 个象限） | `MatrixView.vue` + 象限组件 | 象限渲染和容量显示 | 0.06 |
| 4 | 实现拖拽交互 | `src/composables/useMatrixDrag.ts` + `IssueCard.vue` | 拖拽跨象限和更新确认 | 0.05 |
| 5 | 实现热力图视图 | `HeatmapView.vue` + `ColorMatrix.vue` | 颜色矩阵渲染和时间筛选 | 0.04 |
| 6 | 实现批量操作和规则配置 | `BatchActions.vue` + `ClassificationRules.vue` | 批量移动和规则编辑 | 0.04 |
| 7 | 路由集成和测试 | 修改路由 + 测试 | 页面可访问，功能完整 | 0.04 |

**总人天：0.3d**

---
