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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

