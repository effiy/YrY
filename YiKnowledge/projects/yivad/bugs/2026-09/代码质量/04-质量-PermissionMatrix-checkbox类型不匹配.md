---
title: "PermissionMatrix el-checkbox 类型不匹配"
tags: [yivad, bug, type-error]
category: projects/yivad/bugs/code-quality
created: 2026-09-08
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/system/roleManage/components/PermissionMatrix.vue
benefit: "缺陷记录：质量-PermissionMatrix-checkbox类型不匹配"
lifecycle: active
---

# PermissionMatrix el-checkbox 类型不匹配

## Description

`PermissionMatrix.vue` 中 `el-checkbox` 的 `@change` 事件处理器参数类型为 `boolean`，但 Element Plus 的 `CheckboxValueType` 是 `string | number | boolean`，导致类型不匹配错误：

```
error TS2322: Type '(val: boolean) => void' is not assignable to type '(val: CheckboxValueType) => any'.
```

## Steps to Reproduce

1. 运行 `npx vue-tsc --noEmit`
2. 查看 `PermissionMatrix.vue` 第 31 行

## Expected Result

类型检查通过

## Actual Result

`(val: boolean) => void` 无法赋值给 `(val: CheckboxValueType) => any`

## Cause

`el-checkbox` 的 `change` 事件类型为 `(val: CheckboxValueType) => any`，但内联箭头函数声明参数为 `boolean`。

## Solution

将内联参数类型从 `boolean` 改为 `any`：`@change="(val: any) => toggle(perm.code, val)"`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 组件库事件的回调参数类型应与库的类型定义一致，`el-checkbox` 的 change 事件类型为 `CheckboxValueType`（非 `boolean`） |
| 测试 | `vue-tsc --noEmit` CI 阻断后此类错误会在提交阶段暴露 |

## 经验教训

- **组件库事件类型 ≠ 直觉类型**：`el-checkbox` 的 `change` 事件直观上返回 `boolean`，但 Element Plus 的类型定义是 `CheckboxValueType = string | number | boolean`，因为 checkbox-group 模式下会返回数组。内联事件处理器的参数类型必须与库定义一致
- **`vue-tsc` 的类型检查覆盖面**：不仅是 Props/Emits 类型，模板中的事件处理器参数类型也会被检查

