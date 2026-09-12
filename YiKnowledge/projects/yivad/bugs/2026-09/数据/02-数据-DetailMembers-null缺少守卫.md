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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

