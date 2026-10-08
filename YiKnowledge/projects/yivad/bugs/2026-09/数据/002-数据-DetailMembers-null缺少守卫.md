---
title: "DetailMembers project 可能为 null 缺少守卫"
tags: [yivad, bug, null-safety]
category: projects/yivad/bugs/data
created: 2026-09-08
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/project/components/DetailMembers.vue
benefit: "缺陷记录：数据-DetailMembers-null缺少守卫"
lifecycle: active
---

# DetailMembers project 可能为 null 缺少守卫

## Description

`DetailMembers.vue` 模板中直接访问 `project.members` 而 `project` 类型为 `Project | null`，缺少空值守卫。`handleRemove` 函数中 `project.value.members` 和 `project.value.key` 同样缺少空值检查。

```
error TS18047: '__VLS_ctx.project' is possibly 'null'.
error TS18047: 'project.value' is possibly 'null'.
```

## Steps to Reproduce

1. 运行 `npx vue-tsc --noEmit`
2. 查看 `DetailMembers.vue` 第 4、7、8、100、101 行

## Expected Result

空值守卫后类型检查通过

## Actual Result

5 处 `possibly 'null'` 类型错误

## Cause

`project` 通过 `inject(PROJECT_DETAIL_KEY)` 获取，类型为 `Ref<Project | null>`。模板和脚本中未对 `null` 情况进行守卫。

## Solution

1. 模板外层添加 `v-if="project"` 守卫
2. `handleRemove` 函数开头添加 `if (!project.value) return;` 守卫

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | `inject` 返回值类型包含 `| null` 时，模板首层必须 `v-if` 守卫，函数入口必须 early return |
| 测试 | 为 `inject` 返回 null 的场景编写组件测试（provide 空值 → 验证不崩溃） |
| 流程 | `vue-tsc --noEmit` 报告的 `possibly 'null'` 错误必须归零，不可通过 `!` 非空断言绕过 |

## 经验教训

- **inject 的默认值陷阱**：`inject(key, defaultValue)` 仅在 key 未被 provide 时返回默认值，但如果 provide 的值本身就是 `null`，默认值不会生效。对外部注入的响应式数据（特别是 `Ref<T | null>`），消费方必须自行守卫
- **`vue-tsc` 类型错误是真实的运行时风险**：`possibly 'null'` 不只是类型体操——`project` 在某些生命周期（组件挂载但父组件数据未就绪）确实可能为 null

