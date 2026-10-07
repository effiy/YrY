---
title: "YV-09-109-TEST: 测试覆盖改进验证"
tags: [测试, 验证]
category: 项目/管理后台/测试
created: "2026-09-23"
source: 内部
type: test
status: 待开始
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-109-TEST
prd_ref: YV-09-109
estimate: 0.5
review_status: 已评审
lifecycle: active
---

# YV-09-109-TEST: 测试覆盖改进验证

| TC | 验证 | 期望 |
|----|------|------|
| 1 | `pnpm test` 全量通过 | 0 failures |
| 2 | `pnpm test -- --coverage` | Store ≥ 60%, Hooks ≥ 80% |
| 3 | 新增 useTable 竞态测试 | 2 个场景 (快速翻页 + 弱网) |
| 4 | 新增 SSE mock 测试 | onChunk/onDone/onError 三态 |
| 5 | 新增 Grid KeepAlive 测试 | mount→unmount→mount → 监听器=1 |

**度量**: 目标覆盖率 Store 60% · Hooks 80% · Utils 90%