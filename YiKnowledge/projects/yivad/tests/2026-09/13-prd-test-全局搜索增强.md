---
doc_type: test
title: "全局搜索增强 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-36"
source_prds: ["13-prd-全局搜索增强"]
source_modules: []
---
# 全局搜索增强 — 测试规格

> 来源 PRD：[13-prd-全局搜索增强.md](../../prds/2026-09/13-prd-全局搜索增强.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：CommandPalette

#### Scenario: Ctrl+K 打开命令面板
- **GIVEN** 用户在任意页面
- **WHEN** 按下 Ctrl+K（Mac 为 Cmd+K）
- **THEN** 命令面板可见，搜索输入框自动聚焦

#### Scenario: Esc 关闭命令面板
- **GIVEN** 命令面板打开
- **WHEN** 按下 Esc 键
- **THEN** 命令面板关闭，搜索内容清空

#### Scenario: 输入搜索词后显示结果
- **GIVEN** 命令面板打开，搜索索引包含 "PLANE" 项目
- **WHEN** 输入 "PLANE"
- **THEN** 搜索结果中显示 "PLANE" 项目，按实体类型分组

### 单元测试：搜索语法解析

#### Scenario: 解析 type 过滤器
- **GIVEN** 输入字符串 `type:issue 登录`
- **WHEN** 调用 `parseSearchSyntax`
- **THEN** `keyword` 为 `"登录"`，`filters.type` 为 `"issue"`

#### Scenario: 解析多个过滤器
- **GIVEN** 输入字符串 `type:bug status:open project:PLANE`
- **WHEN** 调用 `parseSearchSyntax`
- **THEN** `filters` 包含 `{ type: "bug", status: "open", project: "PLANE" }`，`keyword` 为 `""`

#### Scenario: 搜索历史持久化
- **GIVEN** 搜索历史为空
- **WHEN** 搜索 "PLANE" 后关闭面板，再次打开面板
- **THEN** 搜索历史中显示 "PLANE"

---


## 补充：单元测试用例

### UT-GS01: Fuse.js 搜索集成

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 模糊搜索 | keyword='projct'(typo) | 匹配 'project' |
| 2 | 多字段搜索 | 搜索词匹配 title + description | 返回合并排序结果 |
| 3 | 阈值配置 | threshold=0.4 | 仅返回相似度 >= 0.4 的结果 |
| 4 | 实体类型过滤 | type:issue keyword | 仅搜索 Issue 实体 |

### UT-GS02: 命令面板

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 打开面板 | Ctrl+K | 命令面板显示 |
| 2 | 搜索导航 | 输入 '项目' | 显示相关页面/操作 |
| 3 | 键盘选择 | ↓↑ 选择 + Enter 确认 | 执行选中操作 |

