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
benefit: "缺陷记录：质量-components.d.ts数字命名类型错误"
lifecycle: active
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
| 代码 | 组件文件命名禁止以数字开头，ESLint `vue/component-name` 规则可配置正则验证 |
| 测试 | `vue-tsc --noEmit` 必须在 CI 中阻断，此类错误在构建阶段即可发现 |

## 经验教训

- **自动生成代码的工具假设**：`unplugin-vue-components` 假设文件名即为组件名，当文件名以数字开头时生成无效 TypeScript。使用代码生成工具时，输入必须符合输出语言的标识符规则
- **文件名约束的传导效应**：`403.vue` 这种命名在 Vue SFC 中完全合法，但向下游工具（unplugin-vue-components → TypeScript）传导时暴露了不兼容

