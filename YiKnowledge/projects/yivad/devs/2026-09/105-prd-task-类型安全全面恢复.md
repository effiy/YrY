---
title: "YV-09-105-TASK: TypeScript 类型安全恢复 — 实施"
tags: [开发方案, TypeScript, 类型安全]
category: 项目/管理后台/开发
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: task
status: 已完成
priority: P0
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-105-TASK
prd_ref: YV-09-105
estimate: 0.75
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-105-TASK: TypeScript 类型安全恢复 — 实施

---

## 修复 1: bug/index.vue — confirm 参数类型

**根因**: 使用全局 `window.confirm(message?: string)` 而非 hook 的 `confirm(message, title, type)`

**修改**: 
```diff
+ import { confirm } from "@/hooks/useConfirmAction";
  const ok = await confirm(t("bug.batch.deleteConfirm", ...), t("bug.batch.delete"));
```

## 修复 2: issue/index.vue — submitForm 引用

**根因**: `useIssueActions` 无 `submitForm`，改用 `useIssueDialog` 的 `submit`

**修改**: `@keyup.enter="actions.submitForm"` → `@keyup.enter="submit"`

## 修复 3-4: FileAlertsDashboard — 模板遮蔽

**根因**: `let pollTimer` 在模板中不可访问；`clearInterval`/`setInterval` 在模板中被组件属性遮蔽

**修改**:
```diff
- let pollTimer: ... = null;
+ const pollTimer = ref<ReturnType<typeof setInterval> | null>(null);

+ function onPollIntervalChange() {
+   if (pollTimer.value) { clearInterval(pollTimer.value); pollTimer.value = setInterval(...); }
+ }
```

## 修复 5: ReportBuilder — config 窄化

**根因**: `configComponent.config` 可选属性，`v-if` 未窄化

**修改**: `v-if="configComponent.type === 'text'"` → `v-if="configComponent.type === 'text' && configComponent.config"`

## 修复 6: useSreDashboard — readonly 移除

**根因**: `readonly(ref)` 产生 `DeepReadonly` 类型，与子组件 props 不兼容

**修改**: 移除 `readonly()` 包装，依赖约定保护不可变性

## 修复 7: useReportData — import 位置

**修改**: 底部 `import { runAggregation }` 移至顶部

---

## 验证

```bash
npx vue-tsc --noEmit  # → 0 errors
npx eslint --quiet     # → clean
pnpm build:pro         # → success
```