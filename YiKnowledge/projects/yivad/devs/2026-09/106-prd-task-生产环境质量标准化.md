---
title: "YV-09-106-TASK: 生产环境质量标准化 — 实施"
tags: [开发方案, 生产质量, 代码卫生]
category: 项目/管理后台/开发
created: "2026-09-23"
source: 内部
type: task
status: 已完成
priority: P2
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-106-TASK
prd_ref: YV-09-106
estimate: 0.25
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-106-TASK: 生产环境质量标准化 — 实施

## Step 1: console.log DEV 守卫

| 文件 | 行 | 修改 |
|------|----|------|
| `stores/modules/aiChat.ts` | 146 | `if (import.meta.env.DEV) console.log(...)` |
| `stores/modules/aiChat/useStreaming.ts` | 299 | 同上 |
| `api/modules/chatService.ts` | 77 | 同上 |

## Step 2: 死代码清理

| 文件 | 删除内容 |
|------|----------|
| `views/issue/index.vue` | `import { useIssueExport }` 行 |
| 同上 | `const { exportCSV, exportJSON } = useIssueExport(...)` |
| 同上 | `void exportCSV; void exportJSON;` |

## 验证

```bash
pnpm build:pro
grep -r "console.log(" dist/ | wc -l  # → 0
npx vue-tsc --noEmit                   # → 0
```

## ESLint 建议

```js
rules: { "no-console": ["warn", { allow: ["warn", "error"] }] }
```