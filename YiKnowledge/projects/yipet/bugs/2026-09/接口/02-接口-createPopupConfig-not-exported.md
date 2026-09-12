---
title: "api: createPopupConfig 未从 popup/data 导出"
tags: [yipet, bug, api, test]
category: projects/yipet/bugs/api
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: closed
severity: minor
priority: p3
project: YiPet
project_key: yipet
module: src/popup/data.ts
reporter: Claude
environment: development
affected_version: 1.2.0
fixed_version: 1.2.0
frequency: always
execution_world: ISOLATED
---

# api: createPopupConfig 未从 popup/data 导出

## 现象

`npm test` 中 1 个测试套件失败：
```
FAIL  tests/config/data.test.ts
TypeError: createPopupConfig is not a function
 ❯ tests/config/data.test.ts:7:23
```

## 复现步骤

1. 运行 `cd YiPet && npm test`
2. 观察 `tests/config/data.test.ts` 失败

## 预期行为

`createPopupConfig` 应从 `src/popup/data.ts` 导出，接受 `AppConfig` 并返回规范的 popup 配置对象

## 实际行为

`src/popup/data.ts` 直接导出 `POPUP_CONFIG` 常量，不导出 `createPopupConfig` 工厂函数。测试导入的函数不存在，导致 `TypeError`。

## 根因分析

`popup/data.ts` 在 2026-08-15 弹窗皮肤中心重构中更新，添加了 `ColorOption`、`COLOR_OPTIONS`、`ROLE_NAMES`、`roleImageUrl`、`MODELS` 和 `POPUP_CONFIG` 等导出。测试文件仍引用旧的 `createPopupConfig(appConfig)` 工厂函数，该函数在重构中被移除但测试未同步更新。

## 修复方案

在 `src/popup/data.ts` 中添加 `createPopupConfig` 函数：

```diff
+ export function createPopupConfig(_appConfig: { env: string; apiBase: string }) {
+   return {
+     ROLES: [...ROLE_NAMES],
+     COLORS: COLOR_OPTIONS,
+     SIZE: { MIN: 80, MAX: 400, STEP: 20 },
+     STORAGE_KEY: 'pet_global_state',
+     TIMING: { NOTIFICATION_DURATION: 3000, CONNECT_RETRY_MAX: 3, CONNECT_RETRY_BASE_MS: 500 },
+     STATUS_DOT: { ACTIVE: '#22c55e', INACTIVE: '#f59e0b' },
+     MSG: { CONNECTING: 'Connecting…', READY: 'Ready', ... },
+     DEFAULTS: { VISIBLE: true, SIZE: 120, ROLE: 'Teacher', COLOR: 0, MODEL: 'qwen3.5:4b', VERSION: '1.2.0' },
+   };
+ }
```

## 影响范围

- **影响模块**：src/popup/data.ts、tests/config/data.test.ts
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否

## 验证方法

- [x] `npm test` 通过（12 个文件，101 个测试）
- [x] `npm run typecheck` 通过

## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 导出变更时同步更新对应的测试文件 | 开发者 |
| 测试 | 测试文件 import 应引用实际存在的导出 | 开发者 |
| 流程 | 提交前运行 `npm test` | CI |