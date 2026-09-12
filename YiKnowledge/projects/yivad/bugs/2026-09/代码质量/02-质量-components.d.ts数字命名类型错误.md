---
title: "components.d.ts 数字命名组件类型错误"
tags: [yivad, bug, build, type-error]
category: projects/yivad/bugs/code-quality
created: 2026-09-08
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: typings/components.d.ts
---

# components.d.ts 数字命名组件类型错误

## Description

`unplugin-vue-components` 自动生成的 `src/typings/components.d.ts` 中，组件文件 `403.vue`、`404.vue`、`500.vue` 以数字开头，导致生成的 `const 403`、`const 404`、`const 500` 是无效的 TypeScript 标识符，`vue-tsc --noEmit` 报错：

```
error TS1134: Variable declaration expected.
error TS1005: ';' expected.
```

## Steps to Reproduce

1. 运行 `npx vue-tsc --noEmit`
2. 查看 `src/typings/components.d.ts` 第 132-134 行

## Expected Result

`const Error403`、`const Error404`、`const Error500` 为有效标识符

## Actual Result

`const 403`、`const 404`、`const 500` 为无效标识符，类型检查失败

## Cause

组件文件名以数字开头（`403.vue`），`unplugin-vue-components` 直接使用文件名作为组件名，生成无效的 TypeScript 声明。

## Solution

1. 重命名文件：`403.vue` → `Error403.vue`，`404.vue` → `Error404.vue`，`500.vue` → `Error500.vue`
2. 更新 `src/routers/modules/staticRouter.ts` 中的 import 路径
3. 更新 `src/components/index.ts` 中的 export 路径
4. 更新 `src/typings/components.d.ts` 中的类型声明
5. 更新组件 `name` 选项：`name="403"` → `name="Error403"` 等

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

