---
prd_task_id: "YV-09-85"
title: "YV-09-85: 知识管理面板 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "38-prd-知识管理面板.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 知识管理面板]
roles: [engineer]
benefit: "开发方案：task-知识管理面板"
lifecycle: active
---

# YV-09-85: 知识管理面板 — 开发方案

> 需求编号：YV-09-85 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `KnowledgeDashboard.vue` | 仪表盘主页（概览卡片+图表+指标） | `src/views/knowledge/` |
| `KnowledgeEditor.vue` | 在线 Markdown 编辑器 | `src/views/knowledge/` |
| `KnowledgeOverview.vue` | 概览卡片组件 | `src/components/knowledge/` |
| `HealthMetrics.vue` | 健康指标面板 | `src/components/knowledge/` |
| `ContributionLeaderboard.vue` | 贡献排行榜 | `src/components/knowledge/` |
| `KnowledgeGapChart.vue` | 知识缺口可视化 | `src/components/knowledge/` |
| `SyncStatus.vue` | 同步状态指示器 | `src/components/knowledge/` |
| `RAGPerformanceLink.vue` | RAG 性能关联卡片 | `src/components/knowledge/` |
| `knowledge.ts` | 知识管理 API 模块 | `src/api/` |

---

<a id="sec-1"></a>
## 一、方案概述

增强知识库管理界面：批量操作（移动/删除/标签）、知识生命周期状态可视化、健康检查面板。

### 架构方案

**技术路线**：知识管理面板为独立路由页面（`/knowledge/dashboard`），数据通过 YiAi RPC 调用获取，前端负责可视化渲染。仪表盘各子模块（概览/健康/贡献/缺口/同步/RAG）均为独立组件，通过 props 接收数据。

**数据模型**：
```
KnowledgeDashboardData (前端聚合类型)
├── overview: { totalFiles, totalCategories, totalWords, lastSyncTime, syncStatus }
├── categoryDistribution: [{ category, count, percentage }]
├── healthMetrics: { score, issues[{ type, count }], trend }
├── topContributors: [{ author, fileCount, lastContribution }]
├── knowledgeGaps: [{ expectedPath, reason, priority }]
└── ragPerformance: { avgRecall, avgPrecision, topQueriedFiles[] }
```

**数据流**：
```
KnowledgeDashboard.vue (数据宿主)
  → onMounted: fetchDashboardData()
    → YiAi knowledge_service.get_dashboard (聚合查询)
    → YiAi health_service.get_health_metrics (健康计算)
    → YiAi knowledge_service.get_contributions (贡献统计)
  → props 下发各子组件
  → 子组件纯渲染（ECharts 图表 + 列表 + 卡片）
```

**组件树**：
```
KnowledgeDashboard.vue (数据加载 + 布局编排)
├── KnowledgeOverview.vue (概览卡片: 文件数/分类/字数/同步时间)
├── HealthMetrics.vue (健康评分仪表盘 + 问题分类列表)
├── ContributionLeaderboard.vue (贡献者排名表)
├── KnowledgeGapChart.vue (知识缺口列表 + 优先级标签)
├── SyncStatus.vue (同步状态指示器: 绿/黄/红)
├── RAGPerformanceLink.vue (RAG 指标卡片)
└── KnowledgeEditor.vue (独立路由 /knowledge/editor, 非仪表盘子组件)
    ├── FrontmatterForm.vue (表单: title/tags/category/type/status)
    ├── MarkdownEditor.vue (左右分栏: 编辑 + 预览)
    └── SaveStatus.vue (保存状态 + 同步反馈)
```

**关键决策**：
- 健康指标计算：按需计算 + 5min 缓存（MongoDB 聚合管道，避免每次请求遍历 800+ 文件）
- 在线编辑器：混合模式——提供 Web 编辑器的同时保留文件系统编辑能力（YiAi `/write-file` API 回写）
- 知识缺口识别：手动定义期望文档结构 + 基于搜索日志自动建议（混合策略）
- 同步状态展示：详细进度模式——显示最近同步时间、变更数、耗时、错误列表
- 仪表盘缓存：5min TTL，数据变化不频繁，平衡实时性与性能
- 编辑器草稿：localStorage 自动保存，避免意外关闭丢失内容

### 批量操作

| 操作 | 实现方式 | 说明 |
|------|----------|------|
| 批量移动 | ProTable 多选 + API 批量更新 `file_path` | 目标目录通过树选择器指定 |
| 批量标签 | ProTable 多选 + el-dialog 标签编辑器 | 支持添加/移除标签 |
| 批量删除 | ProTable 多选 + ElMessageBox 二次确认 | 支持撤销（软删除→恢复） |
| 批量导出 | 选定文件 → YiAi 打包 → `useDownload` 下载 | Markdown 压缩包 |

### 健康面板

| 指标 | 计算方式 | 阈值 |
|------|----------|------|
| 缺 frontmatter 文件 | MongoDB 聚合：`{ $match: { frontmatter: { $exists: false } } }` | 0 |
| stale 文件 (>90 天未更新) | `updated` 字段与当前时间差 | < 10% |
| 命名不规范 | 正则匹配 kebab-case | 0 |

### 实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | 后端聚合查询 + 健康指标服务 | API 返回正确数据结构 | 0.10 |
| 2 | 仪表盘主页面 + 概览卡片 | 数据加载 + 卡片渲染 | 0.10 |
| 3 | 健康面板 + 贡献排行榜 | 指标计算 + 排序 | 0.08 |
| 4 | 知识缺口 + 同步状态 + RAG 关联 | 各子组件独立渲染 | 0.08 |
| 5 | 在线编辑器 (Frontmatter 表单 + Markdown) | 创建/编辑/保存流程 | 0.08 |
| 6 | 批量操作工具栏 | 4 项操作全流程 | 0.06 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 仪表盘正确展示文件数/分类/字数概览
- [ ] 健康评分计算逻辑合理（完整性 40% + 新鲜度 30% + 链接 20% + 标签 10%）
- [ ] 健康问题列表可点击跳转到对应文件
- [ ] 贡献排行榜按文件数降序排列
- [ ] 同步状态指示器实时反映 KnowledgeWatcher 状态
- [ ] 在线编辑器 frontmatter 表单校验 + 自动保存草稿
- [ ] 批量操作 4 项功能（移动/标签/删除/导出）
- [ ] 聚合查询有 5min 缓存
- [ ] 无数据时显示合理的空状态
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成 · **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 2 | KnowledgeDashboard.vue + KnowledgeEditor.vue |
| 组件 | 6 | Overview, HealthMetrics, Leaderboard, GapChart, SyncStatus, RAGLink |
| API | 1 | knowledge.ts (6 个 RPC 端点) |
| 测试 | 1 | 见测试方案 |

### 测试覆盖

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 组件测试 | 待补 | 仪表盘子组件测试 |
| 集成测试 | 待补 | 仪表盘数据加载 + 编辑器保存流程 |

---

## 代码审查检查清单

- [x] 数据展示与后端接口契约一致
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] 健康评分公式与 PRD 一致
- [x] 批量操作有二次确认
- [x] 编辑器自动保存草稿到 localStorage
- [x] 聚合查询有 5min 缓存
- [x] `vue-tsc --noEmit` 通过