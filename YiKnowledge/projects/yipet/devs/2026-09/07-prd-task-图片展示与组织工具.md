---
doc_type: module
prd_task_id: "YP-M07"
title: "YP-M07: 图片展示与组织工具 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 1.2
source_prd: "07-功能实现-图片展示与组织工具.md"
source_okr: [yipet-004]
related_tests: ["07-prd-test-图片展示与组织工具"]
---

# YP-M07: 图片展示与组织工具 — 开发方案

> 来源 PRD：[07-功能实现-图片展示与组织工具.md](../../prds/2026-09/07-功能实现-图片展示与组织工具.md)
> 需求编号：M07 · 人天：1.2d · 状态：已完成
> 测试方案：[07-prd-test-图片展示与组织工具.md](../../tests/2026-09/07-prd-test-图片展示与组织工具.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

图片展示与组织系统：网格/瀑布流/列表三视图、标签管理、全文搜索、多字段排序、全屏预览（键盘导航+缩放）。

### 文件清单

```
YiPet/src/imageEditor/
├── gallery/
│   ├── viewManager.ts         # 三视图切换（网格/瀑布流/列表）
│   ├── tagManager.ts          # 标签 CRUD + 筛选
│   ├── searchEngine.ts        # 文件名/标签/日期搜索
│   ├── sortController.ts      # 名称/日期/大小/类型排序
│   └── fullscreenViewer.ts    # 全屏预览（键盘导航 + 缩放）
├── components/
│   ├── GalleryView.vue        # 主视图容器
│   ├── TagFilter.vue          # 标签筛选栏
│   ├── SearchBar.vue          # 搜索栏
│   └── FullscreenOverlay.vue  # 全屏叠加层
```

## 二、关键技术决策

### D-01：瀑布流 — CSS Grid + masonry 而非 JS 计算

纯 JS 瀑布流在图片加载时需持续重算位置（图片高度未知）。CSS `grid-template-rows: masonry`（Chrome 实验性）或 `column-count` 实现原生瀑布流，性能优于 JS 计算。降级方案：`column-count: 4` + `break-inside: avoid`。

### D-02：全屏预览 — 虚拟化图片列表

全屏模式下左右键切换图片，预加载相邻 2 张（当前 ± 2），避免切换时白屏。缩放手势使用 CSS `transform: scale()` + `touch-action: pinch-zoom`。

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 三视图 + 视图切换 | 0.3 |
| 2 | 标签管理 + 筛选 | 0.2 |
| 3 | 搜索引擎 | 0.2 |
| 4 | 排序控制器 | 0.1 |
| 5 | 全屏预览（键盘+缩放+预加载） | 0.2 |
| 6 | 组件 + 集成 | 0.2 |

**总计：1.2d**

## 四、实现完成记录

> **完成日期**：2026-09-10 · **状态**：已完成

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| 展示引擎 | 5 | viewManager/tagManager/searchEngine/sortController/fullscreenViewer |
| 组件 | 4 | GalleryView/TagFilter/SearchBar/FullscreenOverlay |
| **合计** | **9** | |

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 瀑布流 CSS masonry 兼容性 | P3 | Chrome 实验性，其他浏览器降级 column-count | 待跟踪 |
| 2 | 图片懒加载 | P3 | 大量图片时首屏全量渲染 | 待实施（IntersectionObserver） |

---