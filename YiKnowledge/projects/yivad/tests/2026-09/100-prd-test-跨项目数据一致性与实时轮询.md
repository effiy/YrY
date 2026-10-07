---
prd_task_id: "YV-09-100"
title: "YV-09-100: 跨项目数据一致性与实时轮询 — YiVad 测试用例"
status: 已完成
priority: P1
owner: Chengliang.Yi
source_prds: ["YA-09-122"]
source_modules: ["YV-09-100"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 跨项目, 数据一致性, 实时轮询]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L1+L4 12 用例通过"
test_execution_date: 2026-09-23
source: YiVad
benefit: "测试用例：跨项目数据一致性与实时轮询 — YiVad 侧"
lifecycle: active
---

# YV-09-100: 跨项目数据一致性与实时轮询 — YiVad 测试用例

> 来源 PRD：[YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)
> 开发方案：[YV-09-100 开发方案](../../devs/2026-09/100-prd-task-跨项目数据一致性与实时轮询.md)

| 用例 | 覆盖 AC | 层级 | 结果 |
|------|---------|------|------|
| TC-01 编译零错误（vue-tsc --noEmit） | AC-10 | L1 | ✅ |
| TC-02 ActivityTimeline 摘要栏始终渲染（无数据时显示 emptySummary） | AC-9 | L4 | ✅ |
| TC-03 周环比趋势指示器显示 ↑/↓/→ + 百分比 | AC-9 | L4 | ✅ |
| TC-04 56 天热力图 popover 以 8 列 grid 渲染 | AC-9 | L4 | ✅ |
| TC-05 Todo List dev 过滤器显示 YiKnowledge devs/ 任务 | AC-9 | L4 | ✅ |
| TC-06 Todo List test 过滤器显示 YiKnowledge tests/ 任务 | AC-9 | L4 | ✅ |
| TC-07 Todo 进度条显示三色堆叠段（done/in-progress/pending） | AC-9 | L4 | ✅ |
| TC-08 逾期项显示红色 pill 徽章（Warning 图标 + 计数） | AC-9 | L4 | ✅ |
| TC-09 TranslationAnalytics 显示数据时效标签（绿色新鲜/灰色过期） | AC-7 | L4 | ✅ |
| TC-10 RAG 概览 60s 后自动刷新状态数据 | AC-8 | L4 | ✅ |
| TC-11 RAG 查询历史时间戳使用 useNow 实时更新 | AC-8 | L4 | ✅ |
| TC-12 Todo 项显示 PRD 引用链接（source_prd → ← 标签） | AC-9 | L4 | ✅ |

**结论**：全部 12 项通过。

## L4 验证步骤

1. 打开 `http://localhost:8848/#/project/yipot` → Overview Tab
2. 验证 Recent Activity 摘要栏始终可见（加载中/空数据时显示 "暂无活动数据"）
3. 验证有数据时显示周环比趋势（如 "↑ 25% vs last week"）
4. 悬停热力图触发区 → 验证 56 天网格 popover（8 列 × 7 行）
5. Todo List 切换到 "开发" 过滤器 → 验证显示 YiKnowledge devs/ 任务
6. Todo List 切换到 "测试" 过滤器 → 验证显示 YiKnowledge tests/ 任务
7. 观察进度条 → 验证三色段（绿色 done + 橙色 active + 灰色 pending）
8. 有逾期项时验证红色 pill 徽章出现
9. 打开 `http://localhost:8848/#/dashboard/analytics/translation` → 验证时效标签
10. 打开 `http://localhost:8848/#/rag` → 等待 60s 验证状态自动刷新
11. 观察查询历史中的时间戳 → 验证随时间更新（非静态）
12. 验证 Todo 项的 PRD 引用链接可点击跳转