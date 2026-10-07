---
title: "ReportBuilder + SRE Dashboard: 运行时函数名不匹配与类型安全修复"
key: yivad-code-quality-bugfixes-20260923
tags:
- bug-fix
- type-safety
- vue-template
- report-builder
- sre-dashboard
category: projects/yivad/bugs/代码质量
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: medium
priority: p2
project: YiVad
module: views/reports/ReportBuilder.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23)
frequency: always
---

## Description

对 YiVad 项目的 ReportBuilder 和 SRE Dashboard 模块进行代码质量审查，发现并修复了 5 个 bug：

1. **ReportBuilder.vue: `fmtTime` 函数名不匹配（Critical）** — 模板调用 `fmtTime()` 但脚本中定义的是 `formatTime()`，导致运行时 `undefined` 错误
2. **ReportBuilder.vue: v-model 使用可选链** — `v-model="configComponent.data_source?.metrics?.[0]"` 违反 Vue 规则
3. **ReportBuilder.vue: 死代码 CSS 块** — 选择器外的孤立 CSS 属性导致 SCSS 解析警告
4. **useSreDashboard.ts: `readonly()` 导致组件 props 类型不匹配** — 移除 `@ts-ignore` 的根因
5. **useReportData.ts: 底部 import 反模式** — `runAggregation` 的 import 语句在文件末尾而非顶部

## Steps to Reproduce

**Bug 1**: 打开 Report Builder 页面并等待数据加载完成，查看页面顶部"Updated"时间戳 — 显示空白而非时间文本（`fmtTime` 为 `undefined`）

**Bug 2**: 在 Report Builder 中添加 KPI Card 组件，打开配置抽屉并选择 KPI Metric 下拉框 — 选择值后控制台出现 Vue 警告

**Bug 3**: 运行 `pnpm build:pro` — SCSS 编译可能因孤立 CSS 块而报错或产生警告

**Bug 4**: 打开 SRE Dashboard 页面 — TypeScript 编译器报告 props 类型不兼容（`DeepReadonly<QualityMetrics>` ≠ `QualityMetrics`）

**Bug 5**: ESLint `import/first` 规则或代码审查发现 import 位置不当

## Cause

**Bug 1**: 其他组件（`NotificationBell.vue`、`NotificationItem.vue`、`goals/index.vue`）均使用 `fmtTime` 命名，但 `ReportBuilder.vue` 中误命名为 `formatTime`，模板与脚本函数名不一致。此外，`lastUpdated` 为 `ref<Date | null>`，却没有 null 保护。

**Bug 2**: Vue 3 的 `v-model` 指令不支持可选链（optional chaining），因为 v-model 需要写入路径。

**Bug 3**: `.rb-canvas-add` 样式块关闭后多了一组重复的 CSS 属性，没有外层选择器包裹，属于复制粘贴残留。

**Bug 4**: `useSreDashboard()` 返回 `readonly(quality)` 创建 `DeepReadonly<Ref<QualityMetrics | null>>`，模板自动解包 ref 后为 `DeepReadonly<QualityMetrics | null>`，与子组件 props 类型 `QualityMetrics | null` 不兼容。

**Bug 5**: `import { runAggregation }` 放在文件末尾（第 683 行），不符合 ES Module import 必须在顶部的规范。

## Solution

### Bug 1: 函数重命名 + null 守卫

```diff
- function formatTime(d: Date): string {
-   const now = new Date();
-   const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
+ function fmtTime(d: Date | null): string {
+   if (!d) return "";
+   const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return d.toLocaleTimeString();
  }
```

### Bug 2: 用 computed 属性替代可选链

```ts
const kpiMetricValue = computed({
  get: () => configComponent.value?.data_source?.metrics?.[0],
  set: (val) => {
    const c = configComponent.value;
    if (!c) return;
    if (!c.data_source) c.data_source = { cname: "" };
    if (!c.data_source.metrics) c.data_source.metrics = [];
    c.data_source.metrics[0] = val;
  }
});
```

模板：`v-model="kpiMetricValue"`

### Bug 3: 删除孤立 CSS 块

移除 `.rb-canvas-add` 规则后的 6 行重复 CSS。

### Bug 4: 移除 `readonly()` 包装

```diff
- import { ref, onMounted, onBeforeUnmount, readonly } from "vue";
+ import { ref, onMounted, onBeforeUnmount } from "vue";

- loading: readonly(loading),
- quality: readonly(quality),
+ loading,
+ quality,
```

### Bug 5: 移动 import 到文件顶部

```diff
  import {
    getProjectDashboard,
    getFileAlerts,
    getModuleDashboard,
+   runAggregation
  } from "@/api/modules/analyticsService";
  
- // file bottom
- import { runAggregation } from "@/api/modules/analyticsService";
```

## Files Changed

| File | Change |
|------|--------|
| `src/views/reports/ReportBuilder.vue` | 重命名 `formatTime` → `fmtTime` + null 守卫；替换 v-model 可选链为 computed；删除死 CSS |
| `src/views/knowledge/sre/composables/useSreDashboard.ts` | 移除 `readonly()` 包装，修复组件 props 类型兼容性 |
| `src/views/reports/composables/useReportData.ts` | 移动 `runAggregation` import 到文件顶部 |

## Verification

- `vue-tsc --noEmit`: ReportBuilder.vue 中仅剩的 TS 错误为预存的 `configComponent.config` 可选属性问题（line 299）
- `eslint --quiet`: 无新增 lint 错误
- 功能验证: `fmtTime` 正常渲染相对时间；KPI Metric 下拉选择动作正常；SRE Dashboard props 传递无类型错误

## Prevention

1. **模板函数引用检查**：添加新函数时确保模板中的调用名称与脚本定义完全一致
2. **v-model 规则**：v-model 必须绑定到简单属性路径，不能用可选链或复杂表达式——需要安全路径时使用 computed getter/setter
3. **CSS 审查**：PR review 时检查是否存在选择器外的孤立 CSS 属性
4. **import 位置**：ESLint `import/first` 规则可自动捕获底部 import
5. **readonly 谨慎使用**：仅在 store 场景需要防止外部直接赋值时使用 `readonly()`，普通 composable 返回值通过约定约束即可