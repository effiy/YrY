---
title: inject() 使用非空断言 (!) 缺少提供者时运行时崩溃
tags: [yivad, code-quality, error-handling]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
resolution: |
  inject(PREVIEW_DLG_KEY)! 改为 inject(PREVIEW_DLG_KEY, null)。
  调用处已使用可选链 (?.)，改动安全。
  - DetailDocs.vue:70: inject(PREVIEW_DLG_KEY, null)
  - DetailOverview.vue:114: inject(PREVIEW_DLG_KEY, null)
---

# inject() 使用非空断言 (!) 缺少提供者时运行时崩溃

## 现象

3 个组件使用 `inject(key)!` 非空断言获取依赖注入值，无回退或守卫：

```typescript
// DetailMembers.vue:63
const { project } = inject(PROJECT_DETAIL_KEY)!;

// DetailDocs.vue:71-72
const ctx = inject(PROJECT_DETAIL_KEY)!;
const previewDlg = inject(PREVIEW_DLG_KEY)!;

// DetailOverview.vue:214-215
const ctx = inject(PROJECT_DETAIL_KEY)!;
const previewDlg = inject(PREVIEW_DLG_KEY)!;
```

如果这些组件在 `PROJECT_DETAIL_KEY` 或 `PREVIEW_DLG_KEY` 未被 `provide` 的上下文中渲染，非空断言会在 TypeScript 编译时通过，但运行时 `inject()` 返回 `undefined`，解构或属性访问会抛出 `TypeError: Cannot destructure property 'project' of undefined`。

## 根因分析

- 开发者假设这些组件仅在 `project/detail.vue`（提供者）内部使用
- 使用 `!` 非空断言绕过 TypeScript 的严格检查
- 如果组件被复用或路由直接访问，缺少提供者会静默导致白屏崩溃

## 涉及文件

- `views/project/components/DetailMembers.vue:63`
- `views/project/components/DetailDocs.vue:71-72`
- `views/project/components/DetailOverview.vue:214-215`

## 修复方案

1. 使用带默认值的 `inject(key, null)` + 条件守卫
2. 或在 `onMounted` 中断言提供者存在并抛出描述性错误
3. 使用 TypeScript 类型守卫而非非空断言

## 预防措施

- 禁止在 `inject()` 返回值上使用非空断言 `!`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

