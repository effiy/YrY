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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

