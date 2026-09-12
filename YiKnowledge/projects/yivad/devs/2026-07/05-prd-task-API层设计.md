---
doc_type: module
prd_task_id: "YV-07-05"
title: "YV-07-05: API 层设计 — RequestHttp RPC 拦截器 + 错误处理 + 认证集成 — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
estimate_frontend: 2.0
source_prd: "05-prd-API层设计.md"
---

# YV-07-05: API 层设计 — RequestHttp RPC 拦截器 + 错误处理 + 认证集成 — 开发任务

> 来源 PRD：[05-prd-API层设计.md](../prds/2026-07/05-prd-API层设计.md)
> 需求编号：YV-07-05 · 优先级：P0 · 人天：2.0d

## 五、实施步骤

按依赖顺序排列，每步可独立验证和提交：

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 新增 `RequestHttp` 类（axios 封装 + 拦截器） | `src/api/RequestHttp.ts` | 调用 `rpcCall` 返回正确数据 | 0.5 |
| 2 | 新增错误码映射（4001/4002/5001） | `src/api/RequestHttp.ts` | 模拟各错误码，确认拦截器正确响应 | 0.25 |
| 3 | 新增 API 服务模块（data/chat/knowledge/rag/auth） | `src/api/modules/*.ts` | 每个模块的 API 调用返回正确类型 | 0.5 |
| 4 | 迁移现有 axios 调用到 `rpcCall` | 所有组件 | `grep -r "axios" src/` 返回 0 结果 | 0.5 |
| 5 | 新增 TypeScript 类型定义（RpcEnvelope, RpcRequest） | `src/api/types.ts` | `vue-tsc --noEmit` 通过 | 0.25 |

**总计：2.0d**

---
