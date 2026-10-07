---

doc_type: test
prd_test_id: "YP-09-117"
title: "YP-09-117: Chat Store 模块化拆分 — 测试方案"
status: planned
priority: P2
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "117-架构-ChatStore模块化拆分.md"
tags: [architecture, refactoring, testing, planned]

type: test
---

# YP-09-117: Chat Store 模块化拆分 — 测试方案

## 1. 测试用例

| ID | 用例 | 验证 |
|----|------|------|
| TC-01 | chat.ts 行数 <400 | `wc -l src/chat/stores/chat.ts` |
| TC-02 | `sendMessage()` 签名不变 | `useChatStore().sendMessage('test')` |
| TC-03 | 会话 CRUD 正常 | create → select → update → delete |
| TC-04 | RAG 操作正常 | loadKnowledgeTree → setRagScope → toggleRag |
| TC-05 | 子 Store 独立测试 | `useSessionStore()` 可单独实例化 |
| TC-06 | 跨 Store 交互 | sessionStore.create → ragStore.loadTree 正常 |
| TC-07 | typecheck | `vue-tsc --noEmit` |
| TC-08 | 回归测试 | 138/138 |

## 2. 自动化

```bash
npm run typecheck && npm test && npm run build
```