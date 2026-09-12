---
title: "code-quality: Story Scenario 类型缺少 trigger/prerequisites/expectedResult 字段"
tags: [yivad, bug, code-quality, type-safety]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: closed
severity: minor
priority: p2
project: YiVad
module: src/api/modules/story.ts
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: Story Scenario 类型缺少 trigger/prerequisites/expectedResult 字段

## 现象

`vue-tsc --noEmit` 报 5 个类型错误：
```
src/stores/modules/story.ts(159,5): error TS2353: 'trigger' does not exist in type 'Scenario'
src/stores/modules/story.ts(427,7): error TS2353: 'trigger' does not exist in type 'Scenario'
src/stores/modules/story.ts(443,18): error TS2339: Property 'trigger' does not exist
src/stores/modules/story.ts(444,24): error TS2339: Property 'prerequisites' does not exist
src/stores/modules/story.ts(445,25): error TS2339: Property 'expectedResult' does not exist
```

## 复现步骤

1. 运行 `cd YiVad && npx vue-tsc --noEmit`
2. 观察 `src/stores/modules/story.ts` 中的 5 个类型错误

## 预期行为

`Scenario` 接口应包含 `trigger`、`prerequisites`、`expectedResult` 字段，与 `storyStore` 的使用保持一致

## 实际行为

`Scenario` 接口（`src/api/modules/story.ts:42-54`）缺少这三个字段，而 `storyStore` 多处使用它们

## 根因分析

`Scenario` 接口定义了场景的数据结构，`storyStore` 在初始化场景表单（`scenarioForm`）和更新场景时使用了 `trigger`、`prerequisites`、`expectedResult` 字段。这些字段在接口定义中遗漏，导致类型不匹配。

## 修复方案

在 `src/api/modules/story.ts` 的 `Scenario` 接口中添加三个字段：

```diff
 export interface Scenario {
   key: string;
   name: string;
   description: string;
   priority: ScenarioPriority;
   status: ScenarioStatus;
   steps: ScenarioStep[];
   tags: string[];
   files: ScenarioFile[];
+  trigger: string;
+  prerequisites: string;
+  expectedResult: string;
   aiCodingHistory?: AiCodingEntry[];
   createdAt: number;
   updatedAt: number;
 }
```

## 影响范围

- **影响模块**：src/api/modules/story.ts、src/stores/modules/story.ts
- **是否影响 API 契约**：否（仅类型级别）
- **是否影响其他前端项目**：否

## 验证方法

- [x] `vue-tsc --noEmit` 通过
- [x] `pnpm test` 通过

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 接口定义应与 store 使用保持同步 |
| 测试 | 添加 story store 类型测试确保接口完整性 |
| 流程 | CI 中 `vue-tsc --noEmit` 阻断构建 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

