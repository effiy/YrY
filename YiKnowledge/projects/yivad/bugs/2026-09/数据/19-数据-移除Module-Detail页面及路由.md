---
title: "项目详情页: 移除 Module Detail 页面及路由"
key: remove-module-detail-page-20260910
tags:
- ui-refinement
- module-detail
- routing
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
module: routers/staticRouter.ts, views/project/components/DetailOverview.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
benefit: "缺陷记录：数据-移除Module-Detail页面及路由"
lifecycle: active
---

## Description

移除 Module Detail 独立页面（`/module/:key` 路由）。项目详情页中 Modules Tab 的知识域卡片点击已改为文件预览组件打开对应 md 文件。

### 变更内容

| 变更 | 文件 | 说明 |
|------|------|------|
| 移除路由 | `routers/modules/staticRouter.ts` | 删除 `/module/:key` → `moduleDetail` 路由 |
| 移除跳转 | `DetailOverview.vue:100` | Overview 模块卡片移除 `@click="router.push(m.link)"` |

> Modules 卡片点击已在前期改为 `previewDlgRef.value?.open(filePath)`，无需额外修改。

## Verification

- [ ] Modules Tab 知识域卡片点击 → 文件预览弹窗
- [ ] Overview 模块列表不可点击（无跳转行为）
- [ ] 直接访问 `/module/:key` → 404（预期行为）

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 路由配置中删除路由时，需用 `grep -r "router.push.*module"` 审计所有跳转引用 |
| 流程 | 两个关联变更（Module Detail 路由移除 + 知识域卡片点击改为预览）应在同一 PR 中提交，避免中间状态 |

## 经验教训

- **相关联的两个变更需原子提交**：Module Detail 路由移除和知识域卡片点击行为变更是强耦合的——如果只移除路由而不改卡片点击，用户点击卡片会得到 404

