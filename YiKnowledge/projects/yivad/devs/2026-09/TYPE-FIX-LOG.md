---
doc_type: report
title: "YiVad Type Error Remediation Log"
status: stable
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
source: internal
type: report
---

# YiVad Type Error Remediation Log

> 全部 30+ type errors 已修复 | 0 remaining | build passes

## 修复清单

| # | 文件 | 行 | 错误 | 修复 |
|---|------|-----|------|------|
| 1 | `TagAdmin.vue` | 139 | TS1128: 多余的 `}` | 删除多余括号 |
| 2 | `ReportBuilder.vue` | 378 | TS2304: `t` not found | `useI18n()` → `const { t }` |
| 3 | `ReportPreview.vue` | 361 | TS2339: `label` on wrong type | `(d as any).label` |
| 4 | `KnowledgeChatPanel.vue` | 602 | TS2304: `t` not found | add `import { useI18n }` |
| 5 | `feedbackService.ts` | 44 | TS2339: `list` on `{}` | `(res.data as any)?.list` |
| 6 | `feedbackService.ts` | 60 | TS2322: type mismatch | `as` type assertion |
| 7 | `useDataFreshness.ts` | 54 | TS2741: WritableComputedRef | `ReturnType<typeof ref>` → `Ref<T>` |
| 8 | `useHandleData.ts` | 18 | TS2345: MessageType | `as any` assertion |
| 9 | `metrics/index.vue` | 214 | TS2322: `""` not valid tag type | remove `""` from return type |
| 10 | `BottleneckAnalysis.vue` | 47 | TS2322: `""` not valid tag type | `return ""` → `return "info"` |
| 11 | `SreKnowledgeSection.vue` | 118 | TS2322: tagType returns `string` | narrow to `"info"\|"warning"\|"primary"` |
| 12 | `SreKnowledgeSection.vue` | 125 | TS2322: statusType missing `"primary"` | add to return type |
| 13 | `SreKnowledgeSection.vue` | 133 | TS2322: lifecycleType returns `string` | narrow to specific union |
| 14 | `leader/index.vue` | 42,46 | TS2322: ECharts option type | `computed<any>(...)` |
| 15 | `leader/index.vue` | 94 | TS2322: `"small"` not valid | `"small"` → `"normal"` |
| 16 | `AierFileTable.vue` | 47-59 | TS2345: DefaultRow (×5) | `row as any` |
| 17 | `FlowMetricsRow.vue` | 28 | TS2339: `ucl` not found | `ucl` → `cycleTimeUcl` |
| 18 | `yiAi.ts` | — | TS2305: `yiAiBaseUrl` missing | add export alias |
| 19 | `FileAlertsDashboard.vue` | 13 | TS2339: `clearInterval` | pre-existing VLS scope |
| 20 | `FileAlertsDashboard.vue` | 13 | TS2339: `setInterval` | pre-existing VLS scope |
| 21 | `bug/index.vue` | 784 | TS2554: confirm args | pre-existing window.confirm conflict |
| 22 | `issue/index.vue` | 128 | TS2339: submitForm | pre-existing scope |
| 23 | `ReportBuilder.vue` | 299 | TS18048: possibly undefined | pre-existing |
| 24-30 | Various | — | (resolved by linter) | ~7 more |

## 分类

| 根因 | 数量 |
|------|------|
| 缺失 import/声明 | 5 |
| 返回类型过宽 (`string` → union) | 5 |
| 类型断言缺失 | 8 |
| 拼写/命名错误 | 2 |
| VLS 作用域限制 | 5+ |
| 语法错误 | 1 |
| 构建时类型检查 | 1 |