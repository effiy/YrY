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
benefit: "缺陷记录：数据-移除Issue-Detail页面改用文件预览"
lifecycle: active
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
| 代码 | 路由移除时必须审计所有 `router.push('/issue/:key')` 引用点，确保已替换为预览弹窗或替代导航 |
| 测试 | 回归测试覆盖：所有原本跳转 Issue Detail 的入口（列表/Overview/时间线/Bug 关联）→ 验证预览弹窗正常 |
| 流程 | 移除页面级路由的 PR 需附「受影响入口点清单」，逐项验证替代方案的可用性 |

## 经验教训

- **页面级路由是一组入口点的契约**：移除 `/issue/:key` 不是简单删除路由配置，而是改变了 5 个组件中的用户交互模式（页面跳转 → 弹窗预览）。每个入口点的替代方案需逐一验证
- **弹窗预览 vs 页面跳转的 UX 差异**：弹窗预览在当前页面上下文中展示内容，避免了页面切换的上下文丢失，但也意味着用户无法通过 URL 直接访问某个 Issue 的内容（深层链接能力丧失）

