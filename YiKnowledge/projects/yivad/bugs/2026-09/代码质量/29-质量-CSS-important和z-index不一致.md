---
title: CSS 中大量使用 !important 和 z-index 值不统一
tags: [yivad, code-quality, css]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# CSS 中大量使用 !important 和 z-index 值不统一

## 现象

### !important 滥用

布局文件和组件中使用 15+ 处 `!important` 覆盖样式，主要集中在：

```scss
// LayoutTransverse — 布局强制颜色覆盖
color: #ffffff !important;
background-color: var(--el-color-primary) !important;
border-bottom-color: var(--el-color-primary) !important;

// LayoutColumns — 列布局强制隐藏
width: 0 !important;
border-right: none !important;

// iconfont — 字体强制
font-family: iconfont !important;
```

### z-index 混乱

z-index 值在一个项目中分散在 100 到 9999 之间，无统一层级管理：

| 组件 | z-index |
|------|---------|
| KeyboardShortcuts | 9999 |
| CommandPalette | 9999 |
| Roadmap context menu | 9999 |
| KanbanContextMenu | 9999 |
| Issue detail overlay | 9999 |
| MermaidViewer fullscreen | 3000 |
| Maximize button | 999 |
| Scroll-driven模块 | 100 |

多个元素竞相使用 9999，无层叠上下文管理，难以预测堆叠顺序。

## 根因分析

- `!important` 用于覆盖 Element Plus 默认样式但滥用会破坏可维护性
- z-index 没有设计系统——开发者随意选择"足够大"的值
- 没有 `z-index` 的 SCSS 变量或映射表
- 新增覆盖层时，开发者只需"比之前所有的都大"

## 涉及文件

- `layouts/LayoutTransverse/index.scss` — 6 处 `!important`
- `layouts/LayoutColumns/index.scss` — 4 处 `!important`
- `assets/iconfont/iconfont.scss` — 1 处 `!important`
- 10+ 个组件 — z-index 硬编码

## 修复方案

1. 创建 `z-index` SCSS 变量体系：`$z-dropdown: 100; $z-modal: 200; $z-toast: 300; $z-tooltip: 400`
2. 用 CSS 变量或更高特异性的选择器替代 `!important`
3. 创建 `$z-max: 9999` 变量，避免直接写死最大值的竞争

## 预防措施

- Stylelint 规则限制 `!important` 使用
- 新增 z-index 需参考已有的层级体系

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

