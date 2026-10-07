---
prd_task_id: "YT-09-87"
title: "YT-09-87: 翻译引擎健康实时轮询 — YiPot 测试用例"
status: 已完成
priority: P1
owner: Chengliang.Yi
source_prds: ["YA-09-122"]
source_modules: ["YT-09-87"]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
type: test
tags: [测试用例, 跨项目, 翻译引擎, 实时轮询, 供应商健康]
category: 项目/桌面翻译/测试
roles: [engineer]
test_coverage: "L1+L4 6 用例通过"
test_execution_date: 2026-09-23
source: YiPot
benefit: "测试用例：翻译引擎健康实时轮询 — YiPot 侧"
lifecycle: active
---

# YT-09-87: 翻译引擎健康实时轮询 — YiPot 测试用例

> 来源 PRD：[YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)
> 开发方案：[YT-09-87 开发方案](../../devs/2026-09/87-prd-task-翻译引擎健康实时轮询.md)

| 用例 | 覆盖 AC | 层级 | 结果 |
|------|---------|------|------|
| TC-01 Vite 构建通过（pnpm build） | AC-10 | L1 | ✅ |
| TC-02 `useProviderHealth()` hook 正常返回 `{ health, loading, error }` | AC-6 | L4 | ✅ |
| TC-03 首次挂载后立即 fetch 健康数据 | AC-6 | L4 | ✅ |
| TC-04 60s 后自动刷新健康数据 | AC-6 | L4 | ✅ |
| TC-05 组件卸载时 clearInterval 被调用（无内存泄漏） | AC-6 | L4 | ✅ |
| TC-06 health 数据格式与 YiVad/YiPet 一致（ProviderHealthData 类型） | AC-6 | L4 | ✅ |

**结论**：全部 6 项通过。

## L4 验证步骤

1. 启动 YiAi 后端（`python main.py`）
2. 在 Translate 组件中调用 `const { health } = useProviderHealth()`
3. 验证首次挂载后 health 数据立即填充
4. 等待 60s → 验证 health 数据自动更新
5. 在 React DevTools profiler 中验证 hook 清理（组件卸载后无 pending timer）
6. 对比 health 数据格式与 YiVad TranslationAnalytics 和 YiPet ProviderHealth 显示的数据一致