---
doc_type: test
title: "YV-09-85: 知识管理面板 — 知识库管理仪表盘、内容创建工作流、健康指标、贡献排行榜、知识缺口可视化、RAG 性能关联、YiKnowledge 同步状态 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-85"
source_prds: ["38-prd-知识管理面板"]
source_modules: []
---
# YV-09-85: 知识管理面板 — 知识库管理仪表盘、内容创建工作流、健康指标、贡献排行榜、知识缺口可视化、RAG 性能关联、YiKnowledge 同步状态 — 测试规格

> 来源 PRD：[38-prd-知识管理面板.md](../../prds/2026-09/38-prd-知识管理面板.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：仪表盘数据加载

**GIVEN** 知识库有 800+ 文件
**WHEN** 策展人打开知识管理仪表盘
**THEN** 应显示总文件数、分类数、字数概览
**AND** 分类分布饼图应正确渲染
**AND** 健康评分应介于 0-100 之间

### 场景 2：健康指标检测

**GIVEN** 知识库中有 10 个过期的文件、5 个 frontmatter 不完整的文件
**WHEN** 策展人查看健康指标
**THEN** 应显示过期文件数 10、不完整文件数 5
**AND** 点击每种问题类型应跳转到对应的文件列表

### 场景 3：在线创建知识文件

**GIVEN** 策展人在知识编辑器中填写 frontmatter 和 Markdown 内容
**WHEN** 点击保存
**THEN** 文件应通过 `/write-file` API 写入 YiKnowledge 文件系统
**AND** KnowledgeWatcher 应检测到变更并同步到 MongoDB
**AND** 应显示保存成功 + 同步完成的提示

### 场景 4：贡献排行榜

**GIVEN** 3 个作者分别贡献了 50/30/20 个文件
**WHEN** 策展人查看贡献排行榜
**THEN** 应按照文件数降序排列
**AND** 应显示每个作者的最近贡献日期

### 场景 5：知识缺口可视化

**GIVEN** 策展人定义了期望文档结构，但缺 3 个文件
**WHEN** 查看知识缺口图表
**THEN** 应高亮显示缺失的文件路径
**AND** 应显示缺失原因和优先级

### 场景 6：同步状态监控

**GIVEN** KnowledgeWatcher 最近一次同步失败
**WHEN** 策展人查看同步状态
**THEN** 应显示红色错误状态
**AND** 应显示错误详情（失败原因、失败文件数）

---

