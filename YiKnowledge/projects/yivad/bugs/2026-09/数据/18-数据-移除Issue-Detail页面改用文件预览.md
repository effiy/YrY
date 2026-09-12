---
title: "项目详情页: 移除 Issue Detail 页面，改用文件预览组件"
key: remove-issue-detail-page-20260910
tags:
- ui-refinement
- issue-detail
- preview-dialog
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: medium
priority: p2
project: YiVad
module: routers/staticRouter.ts, views/issue/index.vue, views/project/components/DetailOverview.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
---

## Description

移除 Issue Detail 独立页面（`/issue/:key` 路由），点击 Issue 相关链接改为使用 `KnowledgePreviewDialog` 文件预览组件直接打开对应的 markdown 文件。

同时 Modules 卡片点击改为直接预览域内首个 md 文件。

### 变更内容

| 变更 | 文件 | 说明 |
|------|------|------|
| 移除路由 | `routers/modules/staticRouter.ts` | 删除 `/issue/:key` → `issueDetail` 路由 |
| issue/index.vue goDetail | `views/issue/index.vue:720` | `router.push` → `openPreview(issue)` |
| DetailOverview openIssueInline | `DetailOverview.vue:499` | `router.push` → `previewDlg.value?.open(filePath)` |
| DetailOverview handleActivityClick | `DetailOverview.vue:468` | Issue 类型点击 → `previewDlg.value?.open(filePath)` |
| bug/index.vue goIssue | `views/bug/index.vue:706` | `router.push` → `titlePreviewRef.open(filePath)` |
| Modules openDomain | `views/module/index.vue` | 改为直接打开域内首个 md 文件 |

## Verification

- [ ] 点击 Issue 列表 View 按钮 → 弹出文件预览，不再跳转页面
- [ ] 点击 Overview 模块中的 Issue 行 → 弹出文件预览
- [ ] 点击 Overview 时间线中的 Issue 项 → 弹出文件预览
- [ ] 点击 Modules 知识域卡片 → 弹出该域首个 md 文件
- [ ] 直接访问 `/issue/:key` → 404（预期行为）

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

