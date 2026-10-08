---
title: "useProjectDetail 返回类型推断错误"
tags: [yivad, bug, type-error]
category: projects/yivad/bugs/code-quality
created: 2026-09-08
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: hooks/useProjectDetail.ts
benefit: "缺陷记录：质量-useProjectDetail返回类型推断错误"
lifecycle: active
---

# useProjectDetail 返回类型推断错误

## Description

`useProjectDetail` 的 `ProjectDetailData` 接口中 `project` 字段类型为 `ReturnType<typeof useProjectStore>["currentProject"]`，但 Pinia store 的 `currentProject` 在 setup store 中返回时类型推断为 `ComputedRef` 而非 `Ref`，导致类型不匹配。同时 Pinia 自动解包 ref 导致调用方获取的是解包后的值（`Project | null`）而非 `Ref<Project | null>`，造成 `project/detail.vue` 中多处类型错误。

```
error TS2740: Type 'ComputedRef<...>' is missing the following properties...
error TS2345: Argument of type '... | null' is not assignable to parameter of type 'Ref<Project | null>'.
```

## Steps to Reproduce

1. 运行 `npx vue-tsc --noEmit`
2. 查看 `useProjectDetail.ts` 第 91 行和 `project/detail.vue` 多处

## Expected Result

类型正确推断，`project` 作为 `Ref<Project | null>` 传递

## Actual Result

`ComputedRef` 与 `Ref` 类型不匹配，`project/detail.vue` 中多处参数类型错误

## Cause

`ReturnType<typeof useProjectStore>["currentProject"]` 在 Pinia 的复杂类型系统中无法正确解析为 `Ref<Project | null>`。

## Solution

将 `project` 字段类型显式声明为 `Ref<Project | null>`，并导入 `Project` 类型。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 不要使用 `ReturnType<typeof useXxxStore>["field"]` 引用 Pinia store 的字段类型，应显式声明类型（`Ref<Project | null>`） |
| 测试 | `vue-tsc --noEmit` CI 阻断 |

## 经验教训

- **Pinia 的类型推断边界**：`ReturnType<typeof useProjectStore>["currentProject"]` 在 Pinia 的复杂类型系统中无法正确解析，因为 Pinia 会自动解包 ref。显式类型声明比依赖类型推断更可靠
- **Setup Store 的 ref 解包行为**：Pinia 在返回 setup store 的返回值时会自动解包 ref，导致消费方获取的是 `Project | null` 而非 `Ref<Project | null>`。这是 Pinia 的设计特性，不是 bug——在接口定义时必须考虑这个差异

