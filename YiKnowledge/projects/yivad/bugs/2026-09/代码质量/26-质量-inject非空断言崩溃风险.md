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
benefit: "缺陷记录：质量-inject非空断言崩溃风险"
lifecycle: active
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

- **`!` 非空断言在 inject 上是危险模式**：`inject(key)!` 假设 provide 一定存在，但组件在单元测试、路由直接访问、或被非预期父组件包裹时，provide 缺失会导致难以调试的白屏崩溃。`inject(key, null)` + 可选链是零成本的防护
- **隐式依赖的脆弱性**：组件设计上依赖父组件提供 `PROJECT_DETAIL_KEY`，但这个约束仅存在于开发者的心智模型中，没有任何编译器或运行时强制。提供者缺失时的错误信息（`Cannot destructure property of undefined`）对调试毫无帮助

