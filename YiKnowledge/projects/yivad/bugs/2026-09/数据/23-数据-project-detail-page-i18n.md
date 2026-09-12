---
title: '项目详情页: 国际化未生效——Tab 标题硬编码 + 多处组件文本未国际化'
key: project-detail-page-i18n-20260910
tags:
- i18n
- hardcoded-string
- project-detail
category: projects/yivad/bugs/data
created: '2026-09-09'
updated: 2026-09-10
source: internal
type: bug
status: closed
severity: medium
priority: p2
project: YiVad
project_key: yivad
module: views/project/
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-10)
frequency: always
---

## Description
访问 `http://localhost:8848/#/project/yivad` 时，页面整体国际化未生效。根因为 `useDetailTabs` hook 中 Tab 标签全部硬编码为中文，导致语言切换后 Tab 标题不变。此外 `DetailDocs`、`DetailOverview`、`DetailMembers` 三个组件中存在多处硬编码英文/中文字符串和缺失的 locale 键。

### 涉及问题

**A. useDetailTabs — Tab 标签硬编码中文（根因）**
- 8 个 Tab 标签全部硬编码，locale 文件中的 `project.detail.tabs.*` 键未被使用
- 缺失 `milestones`、`tags` 两个 Tab 的 locale 键

**B. DetailDocs — 文档 Tab**
- `project.docs.columns.updated`、`searchPlaceholder`、`filterAll`、`countLabel`、`noMatch` 5 个 locale 键缺失
- 文档计数和空状态描述为硬编码英文字符串

**C. DetailOverview — 概览 Tab**
- Activity 动态操作名（Completed/Started/Created/Planned/Resolved/Reported）硬编码英文
- 时间分组标签（Today/Yesterday/Unknown）硬编码英文
- 模块 kindLabel "Epic" 硬编码英文
- 缺失 `today`、`yesterday`、`unknownDate`、`epic` 4 个 locale 键

**D. DetailMembers — 成员 Tab**
- 缺失 `project.members.remove` locale 键（移除按钮 title 属性）

## Steps to Reproduce
1. 访问 `http://localhost:8848/#/project/yivad`
2. 切换语言为英文 → Tab 标题仍显示中文
3. 切换到文档 Tab → 表头 "更新时间" 列显示原始 key
4. 切换到概览 Tab → 动态时间线显示英文 "Today"/"Yesterday"/"Completed"
5. 切换到成员 Tab → 移除按钮 title 显示原始 key

## Expected Result
_Not specified._

## Actual Result
_Not specified._

## Cause
_Root cause not yet recorded._

## Solution
_Solution not yet recorded._

## 影响范围

- **影响组件/页面**：views/project/ 目录下所有组件
- **影响用户**：所有用户（语言切换功能失效）
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 所有面向用户的文本字符串必须通过 `$t()` 或 `i18n.t()` 调用；CI 中添加硬编码中文字符串检查 |
| 测试 | 添加国际化覆盖测试，验证语言切换后所有 Tab 标题和关键文本正确切换 |
| 流程 | 新增 Tab 或组件时，国际化检查作为代码审查的必要项 |

## 经验教训

- 国际化是跨模块的系统性问题，不仅涉及 `$t()` 调用，还包括 locale 文件的键值完整性
- Tab 标题这类跨组件共享的文本，应作为国际化优先检查项
- 语言切换的手动回归测试应覆盖所有主要页面，不能仅测试单一页面

