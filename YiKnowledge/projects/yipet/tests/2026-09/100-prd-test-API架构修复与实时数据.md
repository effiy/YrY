---
prd_task_id: "YP-09-100"
title: "YP-09-100: API 架构修复与实时数据轮询 — YiPet 测试用例"
status: 已完成
priority: P0
owner: Chengliang.Yi
source_prds: ["YA-09-122"]
source_modules: ["YP-09-100"]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
type: test
tags: [测试用例, 跨项目, API架构, 实时轮询, 数据一致性]
category: 项目/Chrome扩展/测试
roles: [engineer]
test_coverage: "L1+L4 10 用例通过"
test_execution_date: 2026-09-23
source: YiPet
benefit: "测试用例：API架构修复与实时数据轮询 — YiPet 侧"
lifecycle: active
---

# YP-09-100: API 架构修复与实时数据轮询 — YiPet 测试用例

> 来源 PRD：[YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)
> 开发方案：[YP-09-100 开发方案](../../devs/2026-09/100-prd-task-API架构修复与实时数据.md)

| 用例 | 覆盖 AC | 层级 | 结果 |
|------|---------|------|------|
| TC-01 编译零错误（npm run typecheck） | AC-10 | L1 | ✅ |
| TC-02 4 入口构建通过（npm run build） | AC-10 | L1 | ✅ |
| TC-03 DashboardSummary 使用 ApiClient 而非 raw fetch() | AC-1 | L4 | ✅ |
| TC-04 ProviderHealth 使用 ApiClient 而非 raw fetch() | AC-1, AC-4 | L4 | ✅ |
| TC-05 DashboardSummary 显示 6 项 KPI（含 Chat Sessions/Knowledge Files） | AC-3 | L4 | ✅ |
| TC-06 DashboardSummary 项目列表可点击跳转 YiVad 项目详情页 | AC-3 | L4 | ✅ |
| TC-07 DashboardSummary "Open YiVad Dashboard →" 链接可用 | AC-3 | L4 | ✅ |
| TC-08 所有 3 个组件显示数据年龄计时器（绿色 <60s / 灰色 >60s） | AC-2 | L4 | ✅ |
| TC-09 ProjectHealthCard 在项目页面上 60s 后自动刷新数据 | AC-5 | L4 | ✅ |
| TC-10 popup 关闭后定时器正确清理（无内存泄漏） | AC-2 | L4 | ✅ |

**结论**：全部 10 项通过。

## L4 验证步骤

1. 加载扩展 → 打开 popup
2. 验证 DashboardSummary 显示 6 项统计（Open Issues/Bugs/Done Today/Overdue/Chat Sessions/Knowledge Files）
3. 验证每个统计旁有数据年龄计时器（绿色秒数）
4. 等待 60s → 验证数据自动刷新（年龄重置为 0s）
5. 等待 >60s → 验证年龄变为灰色
6. 点击项目行 → 验证在新标签页打开 `http://localhost:8848/#/project/<key>`
7. 点击 "Open YiVad Dashboard →" → 验证跳转 YiVad 首页
8. 验证 ProviderHealth 显示供应商列表 + 数据年龄
9. 打开 `http://localhost:8848/#/project/yipot` → 验证 ProjectHealthCard 出现
10. 关闭 popup → 验证无控制台错误（定时器清理）