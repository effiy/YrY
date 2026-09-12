---
doc_type: test
title: "YV-09-68: 全局搜索命令面板 — Ctrl+K 全局操作、模糊搜索、快速导航、计算器、AI 查询 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-68"
source_prds: ["34-prd-全局搜索命令面板"]
source_modules: []
---
# YV-09-68: 全局搜索命令面板 — Ctrl+K 全局操作、模糊搜索、快速导航、计算器、AI 查询 — 测试规格

> 来源 PRD：[34-prd-全局搜索命令面板.md](../../prds/2026-09/34-prd-全局搜索命令面板.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：打开命令面板

**GIVEN** 用户在任意页面
**WHEN** 用户按下 Ctrl+K（或 Cmd+K）
**THEN** 应显示命令面板 overlay
**AND** 搜索输入框应自动聚焦
**AND** 应展示最近使用的命令

### 场景 2：搜索并执行命令

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "创建 Issue"
**THEN** 应过滤出包含"创建 Issue"的命令
**AND** 用户按 Enter 后应导航到创建 Issue 页面

### 场景 3：搜索实体

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "BUG-001"
**THEN** 应展示匹配的 Bug 实体结果
**AND** 点击后应导航到 Bug 详情页面

### 场景 4：计算器

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "100 * 1.5 + 20"
**THEN** 应识别为数学表达式
**AND** 应展示计算结果 "170"
**AND** 按 Enter 应复制结果到剪贴板

### 场景 5：单位转换

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "100 km to mi"
**THEN** 应识别为单位转换
**AND** 应展示转换结果 "62.1371 mi"

### 场景 6：AI 查询

**GIVEN** 命令面板已打开
**WHEN** 用户输入 "? 如何优化 MongoDB 查询性能"
**THEN** 应识别为 AI 查询
**AND** 应通过 SSE 流式展示 AI 回答
**AND** 回答完成后用户可复制到剪贴板

---

