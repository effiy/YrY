---
title: "YV-09-103-TASK: 代码质量审计执行计划"
tags: [开发方案, 审计, 代码质量]
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
prd_task_id: YV-09-103-TASK
prd_ref: YV-09-103
estimate: 1.25
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-103-TASK: 代码质量审计执行计划

> 完整审计计划：14 轮 × 4 维度 × 18 bug → 15 文档

---

## 审计维度

| 维度 | 检查项 | 轮次 |
|------|--------|------|
| **类型安全** | vue-tsc 错误、v-model 路径、模板函数名、导入位置 | R1-R2 |
| **运行时稳定** | 竞态条件、事件监听器、计时器管理 | R4-R7 |
| **基础设施** | KeepAlive 守卫、SSE 连接、跨项目 RPC | R8-R13 |
| **代码卫生** | console.log、死代码、CSS、import 位置 | R3-R6 |

## 执行步骤

1. `vue-tsc --noEmit` 扫描全部错误 → 逐一追踪根因 → 修复
2. 搜索 `addEventListener` → 验证 removeEventListener 配对
3. 搜索 `let XXXTimer` → 检查 onUnmounted 清理
4. 提取全部 `callService(module, method)` → 验证后端方法存在
5. 搜索 `console.log` → 检查 DEV 守卫
6. 搜索 `void export` → 清理死代码
7. 搜索 `JSON.parse(localStorage` → 验证 key 一致性

## 变更统计

| 文件 | 变更数 |
|------|--------|
| `src/views/reports/ReportBuilder.vue` | 5 |
| `src/views/issue/index.vue` | 3 |
| `src/views/bug/index.vue` | 1 |
| `src/views/dashboard/analytics/FileAlertsDashboard.vue` | 3 |
| `src/components/Grid/index.vue` | 1 |
| `src/hooks/useTable.ts` | 1 |
| `src/hooks/useNotificationSSE.ts` | 1 |
| `src/stores/modules/aiChat.ts` | 1 |
| `src/stores/modules/aiChat/useStreaming.ts` | 1 |
| `src/api/modules/chatService.ts` | 1 |
| `src/api/modules/feedbackService.ts` | 1 |
| `src/views/reports/composables/useReportData.ts` | 1 |
| `src/views/knowledge/sre/composables/useSreDashboard.ts` | 1 |
| `YiAi/src/server/routes/dashboard/live.py` | 1 |
| **合计 14 文件** | **22 处变更** |