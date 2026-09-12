---
doc_type: module
prd_task_id: "YV-09-23"
title: "错误边界与全局异常处理 — 开发任务"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "07-prd-错误边界与全局异常处理.md"
---

# 错误边界与全局异常处理 — 开发任务

> 来源 PRD：[07-prd-错误边界与全局异常处理.md](../prds/2026-09/07-prd-错误边界与全局异常处理.md)
> 需求编号：YV-09-23 · 优先级：高 · 人天：1.0d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 创建 ErrorCard 组件 | `ErrorCard.vue` | 独立渲染 5 种错误类型 | 0.15 |
| 2 | 创建 ErrorBoundary 组件 | `ErrorBoundary.vue` | 包裹故意崩溃的组件，显示降级 UI | 0.15 |
| 3 | 创建 ErrorEmpty 和 ErrorFallback | `ErrorEmpty.vue`, `ErrorFallback.vue` | 空状态和全局降级页渲染正常 | 0.1 |
| 4 | 实现全局错误处理器 | `errorHandler.ts` | 触发错误后控制台输出分类信息 | 0.15 |
| 5 | 实现错误上报服务 | `errorReporter.ts` | 开发环境打印错误，生产环境排队上报 | 0.15 |
| 6 | 增强 API 错误拦截 | `request.ts` 修改 | 模拟 500/网络断开，验证友好提示 | 0.1 |
| 7 | 实现优雅降级 Composable | `useGracefulDegradation.ts`（`src/hooks/`） | 子组件崩溃后父组件正常显示降级 UI | 0.1 |
| 8 | 在 main.ts 注册全局处理器 | `main.ts` 修改 | 全局错误被捕获，不白屏 | 0.05 |
| 9 | 集成测试 + 端到端验证 | 测试用例 | 所有错误场景 UI 正确显示 | 0.05 |

**总计：** 1.0d

---
