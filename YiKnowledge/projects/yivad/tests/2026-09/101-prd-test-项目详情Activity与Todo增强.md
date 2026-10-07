---
prd_task_id: "YV-09-101"
title: "YV-09-101: 项目详情 Activity 摘要栏趋势 + Todo 列表 Bug 修复 — 测试用例"
status: 已完成
priority: P1
owner: Chengliang.Yi
source_prds: ["YA-09-122"]
source_modules: ["YV-09-101"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 项目详情, 活动时间轴, 待办列表, Bug修复, 数据趋势]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L1+L4 10 用例通过"
test_execution_date: 2026-09-23
source: YiVad
benefit: "测试用例：Activity 摘要栏趋势 + Todo 列表 Bug 修复"
lifecycle: active
---

# YV-09-101: Activity 摘要栏趋势 + Todo Bug 修复 — 测试用例

> 开发方案：[YV-09-101 开发方案](../../devs/2026-09/101-prd-task-项目详情Activity与Todo增强.md)

| 用例 | 层级 | 结果 |
|------|------|------|
| TC-01 编译零错误（vue-tsc --noEmit） | L1 | ✅ |
| TC-02 Activity 摘要栏在空数据时显示 emptySummary 文本 | L4 | ✅ |
| TC-03 有数据时显示周环比趋势 ↑/↓/→ + 百分比 | L4 | ✅ |
| TC-04 56 天热力图 popover 以 8 列 grid 正确渲染 | L4 | ✅ |
| TC-05 Todo "开发" 过滤器显示 YiKnowledge devs/ 任务（此前为空） | L4 | ✅ |
| TC-06 Todo "测试" 过滤器显示 YiKnowledge tests/ 任务（此前为空） | L4 | ✅ |
| TC-07 进度条三色段比例正确（done 绿 + active 橙 + pending 灰） | L4 | ✅ |
| TC-08 逾期项显示红色 pill + Warning 图标 + 计数 | L4 | ✅ |
| TC-09 Todo 项显示 PRD 引用 ← 标签（可点击跳转） | L4 | ✅ |
| TC-10 数据加载时摘要栏不产生 Layout Shift | L4 | ✅ |

**结论**：全部 10 项通过。

## L4 验证步骤

1. 打开 `http://localhost:8848/#/project/yipot` → Overview Tab
2. 数据加载前验证摘要栏已渲染（显示 "暂无活动数据" 或 i18n 文本）
3. 数据加载后验证摘要栏不变形（无 Layout Shift）
4. 验证周环比趋势指示器（有足够历史数据时显示 ↑/↓ + 百分比）
5. 悬停 mini 热力图触发区 → 验证 56 天 grid popover
6. Todo 列表切换到 "开发" → 验证显示 YiKnowledge devs/ 任务
7. Todo 列表切换到 "测试" → 验证显示 YiKnowledge tests/ 任务
8. 观察进度条三色段（绿色 done + 橙色 in-progress + 灰色 pending）
9. 查找有 source_prd 的 dev 任务 → 验证 ← PRD 引用标签可点击
10. 有逾期项时验证红色 pill 徽章