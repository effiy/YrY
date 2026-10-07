---
prd_task_id: "YV-09-98"
title: "YV-09-98: 项目详情页文档目录文件预览弹框 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.15
source_prd: "98-prd-项目详情页文档目录文件预览弹框.md"
tags: [开发方案, 体验优化, 文档目录, 组件复用]
type: task
category: 项目/管理后台/开发
source: YiVad
benefit: "开发方案：task-项目详情页文档目录文件预览弹框"
lifecycle: active
---

# YV-09-98: 项目详情页文档目录文件预览弹框 — 开发方案

> 关联 PRD: [98-prd-项目详情页文档目录文件预览弹框](../prds/2026-09/98-prd-项目详情页文档目录文件预览弹框.md)
> 前置任务: [97-prd-task-项目详情页文档目录重构](./97-prd-task-项目详情页文档目录重构.md)

## 修改清单

| # | 文件 | 变更 | 行数 |
|---|------|------|------|
| 1 | `DetailOverview.vue` | 模板+脚本 | +2/-45 |
| 2 | `DetailOverview.scss` | CSS 移除 | +0/-38 |

## 核心变更

**模板变更**：

- `@click="toggleDocPreview(item)"` → `@click="openFile(item.path)"`
- 移除 `:class="{ 'is-expanded': expandedPath === item.path }"` 动态类
- 移除 `<el-icon>` chevron 图标
- 移除 `v-if="expandedPath === item.path"` 内联预览 div（含 loading/渲染内容）

**脚本变更**：

删除以下声明（共 ~40 行）：

| 删除项 | 类型 | 说明 |
|--------|------|------|
| `expandedPath` | `ref<string>` | 当前展开的文件路径 |
| `docContentCache` | `reactive<Record>` | 已加载内容缓存 |
| `docContentLoading` | `ref<boolean>` | 加载状态 |
| `stripMdFrontmatter()` | function | frontmatter 剥离 |
| `excerpt()` | function | 正文前 600 字符截取 |
| `toggleDocPreview()` | async function | 展开/收起 + 加载逻辑 |
| `renderMd()` | function | markdown → HTML |

`reactive` 从 Vue import 中移除（不再使用）。

**复用逻辑**：`openFile(path)` 函数已存在于组件中（line 694），原用于 OKR 卡片点击，直接复用于 Documents 文件行。

**SCSS 变更**：

删除以下样式块：
- `.do-docs-item__chevron` — chevron 图标样式（含 `.is-expanded` 旋转）
- `.do-docs-item.is-expanded .do-docs-item__row` — 展开态底部边框
- `.do-docs-item__preview` — 预览区域排版
- `.do-docs-item__preview-loading` — 加载提示
- `.do-docs-item__preview-text` — 预览文本滚动容器

## 数据流

```
Documents 文件行 click
  → openFile(item.path)
    → previewDlg?.value?.open(path)  // 已有注入的 KnowledgePreviewDialog ref
      → KnowledgePreviewDialog.loadDoc(path)
        → readKnowledgeFile(path)    // POST /knowledge-read
          → 弹框渲染 markdown + metadata + TOC
```

与 README 编辑、Activity 条目、Todo 条目使用相同的 `previewDlg` 注入引用。

## 影响面

- 复用已有 `KnowledgePreviewDialog` 组件，零新增文件
- 复用已有 `openFile()` 函数，零新增逻辑
- 净减少 ~80 行代码（模板 16 行 + 脚本 40 行 + SCSS 38 行）
- 无 API 变更
- `vue-tsc` 零错误