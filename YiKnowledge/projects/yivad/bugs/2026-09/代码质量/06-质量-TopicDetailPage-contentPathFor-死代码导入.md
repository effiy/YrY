---
title: "code-quality: TopicDetailPage 导入了不存在的 contentPathFor"
tags: [yivad, bug, code-quality]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: closed
severity: minor
priority: p3
project: YiVad
module: src/components/TopicDetailPage/index.vue
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: TopicDetailPage 导入了不存在的 contentPathFor

## 现象

`vue-tsc --noEmit` 报错：
```
src/components/TopicDetailPage/index.vue(273,3): error TS2305: Module '"@/api/modules/topic"' has no exported member 'contentPathFor'.
```

## 复现步骤

1. 运行 `cd YiVad && npx vue-tsc --noEmit`
2. 观察类型错误

## 预期行为

`vue-tsc --noEmit` 通过，无类型错误

## 实际行为

导入 `contentPathFor` 来自 `@/api/modules/topic`，但该模块只导出 `cnameFor`（不是 `contentPathFor`）。此外，`contentPathFor` 在组件中从未被使用——是死代码。

## 根因分析

`contentPathFor` 函数存在于 `@/api/modules/bug.ts`（用于 bug 模块），被错误地从 `@/api/modules/topic` 导入。由于该函数在 `TopicDetailPage` 组件中从未被调用，这是一个死导入。

## 修复方案

从 import 中移除 `contentPathFor`：

```diff
 import {
   getTopicEntry,
   createTopicEntry,
   updateTopicEntry,
   deleteTopicEntry,
-  contentPathFor,
   makeKey,
   type TopicEntryDocument,
   type TopicTree
 } from "@/api/modules/topic";
```

## 影响范围

- **影响模块**：src/components/TopicDetailPage/index.vue
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否

## 验证方法

- [x] `vue-tsc --noEmit` 通过
- [x] `pnpm test` 通过

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 确保 CI 中 `vue-tsc --noEmit` 阻断构建 |
| 测试 | 已存在——类型检查已捕获此问题 |
| 流程 | 每次修改后运行 `vue-tsc --noEmit` |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

