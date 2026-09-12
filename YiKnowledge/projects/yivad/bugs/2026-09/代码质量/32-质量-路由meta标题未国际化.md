---
title: staticRouter 中路由 title 与 i18n 键不一致
tags: [yivad, code-quality, i18n]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# staticRouter 中路由 title 与 i18n 键不一致

## 现象

`routers/modules/staticRouter.ts` 中 20+ 个静态路由的 `meta.title` 使用英文硬编码字符串，而页面组件中使用 `$t()` 显示中文标题：

```typescript
// staticRouter.ts — 硬编码英文 title
{ meta: { title: "Pipeline", icon: "Guide", isKeepAlive: true } }
{ meta: { title: "Skills", icon: "MagicStick", isKeepAlive: true } }
{ meta: { title: "AI Engineer", icon: "Cpu", isKeepAlive: true } }
{ meta: { title: "Bugs", icon: "Warning", isKeepAlive: true } }
```

但文档标题（`document.title`）和面包屑导航使用的是 `meta.title`，导致在中文语言环境下这些位置显示英文。

## 根因分析

- 静态路由的 `meta.title` 未接入 i18n 系统
- 与动态路由（从后端加载的菜单）的标题来源不一致——动态路由的 title 来自后端 API（已包含中英文）
- 已有 bug #24、#25、#33、#35 覆盖了 i18n 问题，本缺陷聚焦于路由元信息层面

## 涉及文件

- `src/routers/modules/staticRouter.ts` — 20+ 处硬编码 `meta.title`

## 修复方案

1. 将 `meta.title` 改为 i18n 键：`meta: { titleKey: 'menu.pipeline' }`
2. 在面包屑组件中使用 `$t(route.meta.titleKey)` 显示
3. 或保留 `meta.title` 但初始化为 `$t('menu.pipeline')` 的形式

## 预防措施

- 新增路由时必须使用 i18n 键作为 title

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

