---
title: "项目详情页: 需求 Issue 编辑状态后 Save 按钮无效果"
key: requirement-issue-edit-save-no-effect-20260908
tags:
- issue-edit
- requirement
- knowledge-file
- save-no-effect
category: projects/yivad/bugs/data
created: "2026-09-08"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/issue/composables/useIssueDialog.ts
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-08)
frequency: always
---

## Description

在项目详情页 (`/project/yivad`) 的需求 Tab 中，表格操作编辑需求 Issue 的状态后点击 Save 按钮，对话框关闭但表格数据未更新，状态修改无效。

**补充说明**：此问题在常规开发和测试流程中未被及时发现，建议加强对应模块的自动化测试覆盖。
## Root Cause

`useIssueDialog.ts` 的 `submit()` 函数对需求类型 Issue（`issue_type === "requirement"`）的处理存在两个问题：

1. **不必要的数据库调用**：`submit()` 无条件调用 `store.editIssue()`，对需求 Issue 而言 key 是月份字符串（如 `"2026-08"`，由 `formatReqMonth` 生成）。后端 `update_document` 在找不到文档时会 upsert 一条新记录，在 `issues` 集合中创建了无意义的虚假文档。

2. **`syncKnowledgeFileIfNeeded()` 依赖 `allIssues` 查找**：该函数通过 `allIssues.value.find(i => i.key === dialog.editKey)` 查找被编辑的 Issue。但需求 Issue 的 key 是月份字符串，同一月份可能有多个需求项，`find()` 返回第一个匹配项而非实际编辑的项。此外，`allIssues` 由 `useIssueStats` 中的 watcher 异步填充，存在时序不确定性。

需求 Issue 的真正数据源是 YiKnowledge markdown 文件，而非 MongoDB。状态更新应直接写入 markdown 文件的 frontmatter。

## Fix

1. 在 `openEdit()` 中将 `issue.kb_file_path` 存储到 `dialog.kbFilePath`
2. 在 `submit()` 中检查 `dialog.kbFilePath`：若存在（需求 Issue），跳过 `store.editIssue()` 调用，直接通过 `syncKnowledgeFileIfNeeded()` 更新 markdown 文件
3. 在 `syncKnowledgeFileIfNeeded()` 中优先使用 `dialog.kbFilePath` 而非从 `allIssues` 查找，避免 key 冲突和时序问题

## Steps to Reproduce

1. 打开 `http://localhost:8848/#/project/yivad`
2. 切换到「需求」Tab
3. 点击任意需求行的编辑按钮
4. 修改 Status 字段
5. 点击 Save 按钮
6. 观察：对话框关闭但表格中该需求的状态未更新

## Expected Behavior

点击 Save 后，对话框关闭，表格中对应需求的状态立即更新，且 YiKnowledge 中对应的 markdown 文件 frontmatter 被同步更新。

## Actual Behavior

点击 Save 后，对话框关闭，表格中该需求的状态保持不变。数据库 `issues` 集合中被错误地插入了一条 key 为月份字符串的虚假文档。

## Related Files

- `YiVad/src/views/issue/composables/useIssueDialog.ts` — 主要修复文件
- `YiVad/src/views/project/composables/useRequirements.ts` — 需求数据源
- `YiVad/src/views/issue/composables/useIssueStats.ts` — `buildReqIssues` 将需求项映射为 Issue 对象

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

