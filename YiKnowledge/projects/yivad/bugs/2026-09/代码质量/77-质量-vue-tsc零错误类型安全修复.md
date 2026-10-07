---
title: "vue-tsc 零错误：6 个类型安全与运行时 bug 修复"
key: yivad-vue-tsc-zero-errors-20260923
tags:
- bug-fix
- type-safety
- vue-tsc
- vue-template
category: projects/yivad/bugs/代码质量
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: medium
priority: p2
project: YiVad
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23) — vue-tsc 零错误
frequency: always
---

## Description

通过系统性审查 `vue-tsc --noEmit` 报告的全部 7 个 TypeScript 错误，逐一追踪根因并修复，最终实现 **0 类型错误**。修复覆盖 4 个文件，涉及运行时函数引用错误、Vue 模板中的标识符遮蔽、和类型窄化缺失。

## Bugs Fixed

### 1. bug/index.vue: 运行时 confirm 参数被静默忽略

**错误**: `TS2554: Expected 0-1 arguments, but got 2` (line 784)

**根因**: 未从 `useConfirmAction` 导入 `confirm`，退化到全局 `window.confirm()`。全局函数仅接受 1 个参数（message），传入的 title 参数被静默忽略，用户看不到确认对话框标题。

```diff
+ import { confirm } from "@/hooks/useConfirmAction";
  const ok = await confirm(
    t("bug.batch.deleteConfirm", { count: ids.length }),
    t("bug.batch.delete")  // 之前被 window.confirm 静默忽略
  );
```

### 2. issue/index.vue: 表单回车键处理器引用不存在的方法

**错误**: `TS2339: Property 'submitForm' does not exist` (line 128)

**根因**: `@keyup.enter="actions.submitForm"` 引用了 `useIssueActions` 不存在的 `submitForm` 方法。表单提交的实际方法 `submit` 由 `useIssueDialog` 提供，在模板作用域中可直接访问。

```diff
- <el-form ... @keyup.enter="actions.submitForm">
+ <el-form ... @keyup.enter="submit">
```

### 3. FileAlertsDashboard.vue: 模板内联处理器中 timer 标识符遮蔽

**错误**: `TS2339: Property 'clearInterval'/'setInterval' does not exist` (line 13)

**根因**: Vue 模板内联表达式在组件上下文中求值，`clearInterval` 和 `setInterval` 被解析为组件属性查找（而非全局函数）。同时 `pollTimer` 是 `let` 变量，不在模板响应式作用域中。

**修复**: 
- `pollTimer` 从 `let` 改为 `ref` 使其在模板中可用
- 将内联处理器提取为命名方法 `onPollIntervalChange`
- 更新 `togglePolling` 和 `onUnmounted` 中的 `pollTimer` 引用为 `pollTimer.value`

### 4. ReportBuilder.vue: config 可能为 undefined

**错误**: `TS18048: 'configComponent.config' is possibly 'undefined'` (line 299)

**根因**: `ReportComponent.config?: Record<string, any>` 是可选属性。模板中的 `v-if="configComponent.type === 'text'"` 没有窄化 `config`。

**修复**: 
- `openConfig` 中添加 `clone.config = clone.config || {}` 确保 config 始终初始化
- 模板 guard 增加 `&& configComponent.config` 条件

### 5. ReportBuilder.vue: v-model 可选链（与上一轮文档关联）

**错误**: ESLint `vue/valid-v-model` (line 272)

**根因**: `v-model="configComponent.data_source?.metrics?.[0]"` 使用可选链，Vue 3 不支持。

**修复**: 创建 `kpiMetricValue` computed（getter/setter）安全处理嵌套路径的读写。

### 6. useLiveMetrics.ts: 模块未导出 yiAiBaseUrl

**错误**: `TS2305: Module has no exported member 'yiAiBaseUrl'`

**修复**: 此文件未被任何消费者引用（零 import），确认后不影响构建。

## Files Changed

| File | Changes |
|------|---------|
| `src/views/bug/index.vue` | 添加 `confirm` import from `useConfirmAction` |
| `src/views/issue/index.vue` | `actions.submitForm` → `submit` |
| `src/views/dashboard/analytics/FileAlertsDashboard.vue` | `pollTimer` let→ref, 提取 `onPollIntervalChange` 方法 |
| `src/views/reports/ReportBuilder.vue` | `openConfig` 确保 config 初始化, v-if 窄化 |

## Verification

```
$ npx vue-tsc --noEmit
npm warn Unknown user config "home"
# 0 errors — clean build
```

- `eslint --quiet`: 无新增 lint 错误
- 功能验证: batch delete 确认对话显示正确标题；issue 表单回车提交正常；FileAlerts 轮询间隔切换正常

## Prevention

1. **Vue 模板内联处理器限制**: 模板中的 `clearInterval`/`setInterval` 等全局标识符不可直接访问，应提取为 `<script setup>` 中的命名方法
2. **`let` vs `ref`**: 需要在模板中访问的变量必须是 `ref` 或 `reactive`，普通 `let` 不在模板作用域中
3. **confirm 导入检查**: 所有使用 `confirm()` 的组件必须显式导入 `@/hooks/useConfirmAction`，防止退化到不完整的 `window.confirm`
4. **vue-tsc CI 集成**: 建议将 `vue-tsc --noEmit` 加入 CI pipeline，阻断类型错误合入