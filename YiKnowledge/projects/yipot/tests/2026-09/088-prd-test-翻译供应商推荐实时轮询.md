---
prd_task_id: "YT-09-88"
title: "YT-09-88: 翻译供应商推荐实时轮询 — YiPot 测试用例"
status: 已完成
priority: P1
owner: Chengliang.Yi
source_prds: ["YA-09-122"]
source_modules: ["YT-09-88"]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
type: test
tags: [测试用例, 翻译引擎, 实时轮询, 供应商推荐]
category: 项目/桌面翻译/测试
roles: [engineer]
test_coverage: "L1+L4 6 用例通过"
test_execution_date: 2026-09-23
source: YiPot
benefit: "测试用例：翻译供应商推荐实时轮询 — YiPot TargetArea"
lifecycle: active
---

# YT-09-88: 翻译供应商推荐实时轮询 — 测试用例

> 开发方案：[YT-09-88 开发方案](../../devs/2026-09/88-prd-task-翻译供应商推荐实时轮询.md)

| 用例 | 层级 | 结果 |
|------|------|------|
| TC-01 Vite 构建通过（pnpm build） | L1 | ✅ |
| TC-02 语言切换时立即 fetch 供应商推荐 | L4 | ✅ |
| TC-03 60s 后自动刷新推荐数据 | L4 | ✅ |
| TC-04 语言切换时旧 timer 清理，新 timer 启动 | L4 | ✅ |
| TC-05 下拉菜单显示健康圆点 + 成功率百分比 | L4 | ✅ |
| TC-06 无 API 时跳过 fetch（不崩溃） | L4 | ✅ |

**结论**：全部 6 项通过。

## L4 验证步骤

1. 启动 YiAi 后端 + YiPot 开发模式
2. 打开翻译窗口，选择源/目标语言
3. 点击引擎下拉 → 验证显示健康圆点（绿/黄/红/灰）+ 成功率百分比 + "Best" 标记
4. 等待 60s → 验证成功率数据刷新（无页面闪烁）
5. 切换语言对 → 验证立即获取新推荐 + 旧轮询停止
6. 关闭 YiAi 后端 → 验证下拉菜单无崩溃（健康圆点变灰）