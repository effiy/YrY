---
title: "YV-09-100-TASK: YiVad 代码质量全面优化 — 开发实施方案"
tags:
  - 开发方案
  - 代码质量
  - bug修复
  - 实施步骤
category: 项目/管理后台/开发
created: "2026-09-23"
updated: "2026-09-23"
source: 内部
type: task
status: 已完成
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-100-TASK
prd_ref: YV-09-100
estimate: 1.25
review_status: 已评审
roles:
  - engineer
related_modules:
  - "100-prd-YiVad代码质量全面优化"
  - "100-prd-test-YiVad代码质量全面优化"
benefit: "17 个 bug 的开发实施细节，按模块分步修复"
lifecycle: active
---

# YV-09-100-TASK: YiVad 代码质量全面优化 — 开发实施方案

> 实施步骤按优先级排序，每个步骤包含文件清单、关键代码变更和验证方法。

---

## 模块一：类型安全修复（7 项）

### Step 1.1: ReportBuilder 运行时函数名修复

**文件**: `src/views/reports/ReportBuilder.vue`

**问题**: 模板调用 `fmtTime()` 但脚本定义 `formatTime()`

**修改**:
1. 将函数重命名为 `fmtTime`，添加 `Date | null` 参数支持
2. 模板调用从 `fmtTime(lastUpdated \|\| "")` 改为 `fmtTime(lastUpdated)`
3. `openConfig` 添加 `clone.config = clone.config \|\| {}` 确保 config 初始化
4. 模板 `v-if` 增加 `&& configComponent.config` 守卫

**验证**: 打开 ReportBuilder → 数据加载完成 → 时间戳显示 "Updated Xm ago"

### Step 1.2: bug/index.vue confirm hook 导入

**文件**: `src/views/bug/index.vue`

**修改**: 添加 `import { confirm } from "@/hooks/useConfirmAction";`

**验证**: 批量删除 bug → 确认对话框显示正确标题

### Step 1.3: issue/index.vue submitForm 引用修复

**文件**: `src/views/issue/index.vue`

**修改**: `@keyup.enter="actions.submitForm"` → `@keyup.enter="submit"`（使用 useIssueDialog 的 submit 方法）

**验证**: issue 编辑对话框中按 Enter → 表单正常提交

### Step 1.4: v-model 可选链替代

**文件**: `src/views/reports/ReportBuilder.vue`

**修改**: 创建 `kpiMetricValue` computed（getter/setter），替代 `v-model="configComponent.data_source?.metrics?.[0]"`

**验证**: KPI Card 配置 → 选择 KPI Metric 下拉 → 无 Vue 警告

### Step 1.5: useSreDashboard readonly 移除

**文件**: `src/views/knowledge/sre/composables/useSreDashboard.ts`

**修改**: 移除 `import { ..., readonly }` 和 return 中的 `readonly()` 包装

**验证**: SRE Dashboard 页面 → vue-tsc 不报类型错误

### Step 1.6: useReportData import 位置修复

**文件**: `src/views/reports/composables/useReportData.ts`

**修改**: 将文件底部 `import { runAggregation }` 移至顶部 analyticsService import 块

**验证**: ESLint `import/first` 无警告

---

## 模块二：运行时稳定性修复（3 项）

### Step 2.1: FileAlertsDashboard timer 遮蔽修复

**文件**: `src/views/dashboard/analytics/FileAlertsDashboard.vue`

**修改**:
1. `let pollTimer` → `const pollTimer = ref<...>(null)`
2. 内联 `@change` 处理器提取为 `onPollIntervalChange()` 方法
3. `togglePolling` 和 `onUnmounted` 中 `pollTimer` → `pollTimer.value`

**验证**: vue-tsc 通过；轮询间隔切换正常

### Step 2.2: Grid KeepAlive 监听器泄漏修复

**文件**: `src/components/Grid/index.vue`

**修改**: 添加 `_resizeListener` 守卫标志，在 `addResizeListener`/`removeResizeListener` 中保护

**验证**: KeepAlive 页面切换 10 次后 → `window.resize` 监听器数 = 1

### Step 2.3: 死 CSS 移除

**文件**: `src/views/reports/ReportBuilder.vue`

**修改**: 移除 `.rb-canvas-add` 闭合后的 6 行孤立 CSS（display: flex 等）

**验证**: SCSS 编译无警告

---

## 模块三：竞态条件修复（1 项）

### Step 3.1: useTable 竞态保护

**文件**: `src/hooks/useTable.ts`

**修改**: 在 `getTableList` 中添加 `_reqSeq` 单调序列号。每次调用前 `++_reqSeq`，`await` 后检查 `seq === _reqSeq`，不匹配则丢弃响应。

```typescript
let _reqSeq = 0;
const getTableList = async () => {
  const seq = ++_reqSeq;
  // ... await api(...) ...
  if (seq !== _reqSeq) return; // 丢弃陈旧响应
  // ... update state ...
};
```

**验证**: 快速翻页 3 次 → 表格仅显示第 3 次请求的数据（非第 1 次或第 2 次）

**影响范围**: 全部 19 个 ProTable 页面的 `useTable` 调用者

---

## 模块四：认证安全修复（1 项）

### Step 4.1: SSE localStorage key 修复

**文件**: `src/hooks/useNotificationSSE.ts`

**修改**: `localStorage.getItem("user-store")` → `localStorage.getItem("yivad-user")`

**验证**: 启用认证模式下 SSE 连接携带有效 token

---

## 模块五：代码卫生修复（5 项）

### Step 5.1: 死代码清理

**文件**: `src/views/issue/index.vue`

**修改**: 删除 `useIssueExport` 导入、`exportCSV`/`exportJSON` 解构和 `void` 表达式

### Step 5.2-5.4: console.log DEV 守卫

| 文件 | 行 | 修改 |
|------|----|------|
| `src/stores/modules/aiChat.ts` | 146 | 添加 `if (import.meta.env.DEV)` |
| `src/stores/modules/aiChat/useStreaming.ts` | 299 | 同上 |
| `src/api/modules/chatService.ts` | 77 | 同上 |

---

## 变更文件总清单

| 文件 | 变更类型 | 轮次 |
|------|----------|------|
| `src/views/reports/ReportBuilder.vue` | fmtTime, v-model, config, 死CSS | 1,2 |
| `src/views/reports/composables/useReportData.ts` | import 位置 | 1 |
| `src/views/knowledge/sre/composables/useSreDashboard.ts` | readonly 移除 | 1 |
| `src/views/bug/index.vue` | confirm import | 2 |
| `src/views/issue/index.vue` | submitForm, 死代码 | 2,3 |
| `src/views/dashboard/analytics/FileAlertsDashboard.vue` | pollTimer ref | 2 |
| `src/components/Grid/index.vue` | KeepAlive 守卫 | 4 |
| `src/hooks/useNotificationSSE.ts` | localStorage key | 4 |
| `src/hooks/useTable.ts` | 竞态保护 | 7 |
| `src/stores/modules/aiChat.ts` | console.log DEV | 6 |
| `src/stores/modules/aiChat/useStreaming.ts` | console.log DEV | 6 |
| `src/api/modules/chatService.ts` | console.log DEV | 6 |
| `YiAi/src/server/routes/dashboard/live.py` | 时间戳类型修复 | 8 |

---

## 风险与回滚

| 风险 | 缓解措施 |
|------|----------|
| 竞态保护导致数据永不更新 | 仅当 `seq !== _reqSeq` 时丢弃，逻辑简单验证容易 |
| readonly 移除导致意外 mutation | 遵循 Pinia 约定，调用方不直接修改返回值 |
| DEV 守卫移除必要的调试信息 | 使用 Vue DevTools 替代 console.log 调试 |