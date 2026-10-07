---
title: useKnowledgeBase composable 达 1693 行需拆分
tags: [yivad, code-quality, composable-size]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
benefit: "缺陷记录：质量-useKnowledgeBase组合式函数过大"
lifecycle: active
---

# useKnowledgeBase composable 达 1693 行需拆分

## 现象

`src/views/dashboard/knowledgeBase/composables/useKnowledgeBase.ts` 达到 **1693 行**，是所有 composable 中最大的，远超 300 行的合理上限。

该 composable 混合了多种职责：
- 数据加载（文件、目录、统计）
- 筛选/排序/分页
- 展开/折叠（模块行）
- 内容搜索（全文本搜索 + 防抖）
- 图表下钻/高亮
- 文件删除
- 键盘快捷键处理
- 缓存管理

## 根因分析

- 知识库 Dashboard 是最复杂的页面，所有状态和逻辑被集中到一个 composable
- 没有按功能域拆分（数据获取 vs. 交互 vs. 缓存）
- 与 bug #26（组件过大）是配对问题——页面组件 1369 行 + composable 1693 行 = 3000+ 行逻辑集中在一页

## 涉及文件

- `src/views/dashboard/knowledgeBase/composables/useKnowledgeBase.ts` — 1693 行

## 修复方案

按关注点拆分为独立 composable：
1. `useKnowledgeData` — 数据获取（文件列表、统计、RAG 状态）
2. `useKnowledgeFilters` — 筛选/排序/分页
3. `useKnowledgeSearch` — 内容搜索 + 防抖
4. `useKnowledgeDrilldown` — 图表点击下钻、高亮
5. `useKnowledgeKeyboard` — 键盘快捷键

主 composable 组合以上各模块。

## 预防措施

- Composable 超过 200 行需 code review 讨论拆分方案

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **God Composable 与 God Component 是共生问题**：1693 行的 composable + 1369 行的组件 = 3000+ 行逻辑集中在一个页面。两者必须同步拆分，否则拆了组件但 composable 仍是单体，只是把复杂度从一个文件移到另一个
- **按功能域拆分 composable 的启发式**：当一个 composable 同时处理数据加载、过滤排序、图表交互、键盘快捷键时，这些功能域有清晰的边界——它们共享数据但操作独立，天然适合拆分为独立 composable

