---
doc_type: module
prd_task_id: "YV-07-04"
title: "YV-07-04: 知识库集成与基础页面 — 知识浏览 + RAG 聊天 + 数据/文件管理 — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
estimate_frontend: 4.0
source_prd: "04-prd-知识库集成与基础页面.md"
---

# YV-07-04: 知识库集成与基础页面 — 知识浏览 + RAG 聊天 + 数据/文件管理 — 开发任务

> 来源 PRD：[04-prd-知识库集成与基础页面.md](../prds/2026-07/04-prd-知识库集成与基础页面.md)
> 需求编号：YV-07-04 · 优先级：P0 · 人天：4.0d

## 4.2 实施步骤

| 步骤 | 内容 | 验证方式 | 人天 |
|------|------|---------|------|
| 1 | ProTable 通用列表组件开发（types + composables + 主组件） | 配置驱动渲染列表，筛选/排序/分页/CRUD 正常，空状态/加载态/错误态 UI 覆盖完整 | 1.0 |
| 2 | 知识库浏览页面（知识树 + 文件列表 + 预览） | 知识树 7 角色目录完整渲染，文件列表 200+ 条可搜索可排序，点击预览正确解析 Markdown frontmatter + 正文 | 1.0 |
| 3 | RAG 聊天页面（知识库选择 + 检索 + 流式聊天） | 选择知识库范围 → 检索返回 5 条引用 + 相似度分数 → 流式 AI 回复中引用自动标注来源 | 1.0 |
| 4 | 数据管理 + 文件管理页面 | 4 个 ProTable 配置（issue/bug/module/user）CRUD 正常，文件树浏览 + CodeMirror 编辑器支持 Markdown/JSON/YAML/Python 语法高亮 | 1.0 |
| 5 | 集成测试 + 性能优化 | 知识树 1000 节点 < 500ms，ProTable 10000 条分页 < 1s，CodeMirror 懒加载 < 200ms | 0（含在前 4 步中） |

**总计：4.0d**
