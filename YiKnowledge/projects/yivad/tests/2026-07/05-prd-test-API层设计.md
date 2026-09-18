---
doc_type: test
title: "YV-07-05: API 层设计 — RequestHttp RPC 拦截器 + 错误处理 + 认证集成 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-05"
source_prds: ["05-prd-API层设计"]
source_modules: ["05-prd-task-API层设计"]
---

# YV-07-05: API 层设计 — 测试用例

> 来源 PRD：[05-prd-API层设计.md](../../prds/2026-07/05-prd-API层设计.md)
> 开发方案：[05-prd-task-API层设计.md](../../devs/2026-07/05-prd-task-API层设计.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 覆盖目标 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | Vitest + jsdom | 拦截器判定逻辑、类型定义 | 每次提交 |
| L2 集成 | Vitest + mock axios | 拦截器链完整流程、API 模块调用 | 每次提交 |
| L3 端到端 | Playwright | 真实 API 调用 + 错误场景 | 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | RequestHttp 拦截器链（请求/响应） | L1/L2 |
| COV-2 | API 模块（dataService/chatService 等） | L2 |
| COV-3 | 类型定义（RpcRequest/RpcResponse） | L1 |

---

## 二、测试用例

### 2.1 RequestHttp 拦截器（COV-1 · L1/L2）

> 自动化落点：`tests/api/requestHttp.test.ts`

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-RPC-001 | 正常 RPC 调用返回数据 | `code: 0` → 拦截器解包返回 `data` | P0 |
| TC-RPC-002 | Token 自动附加 | 有 token 时请求头含 `X-Token` | P0 |
| TC-RPC-003 | 无 Token 不附加头 | 无 token 时请求头不含 `X-Token` | P1 |
| TC-RPC-004 | 业务错误码拦截 | `code: 1001` → `ElMessage.error` + reject | P0 |
| TC-RPC-005 | 401 连锁清理 | 清 token + 清持久化 + 跳 `/login` | P0 |
| TC-RPC-006 | 401 防重入 | 5 并发 401 → 仅触发一次重定向 | P0 |
| TC-RPC-007 | 网络错误提示 | fetch 失败 → `ElMessage.error("网络错误")` | P0 |
| TC-RPC-008 | 超时处理 | 30s 超时 → `ElMessage.error` + reject | P1 |
| TC-RPC-009 | Loading 自动注入 | 默认请求触发全局 loading | P1 |
| TC-RPC-010 | Loading 抑制 | `{ loading: false }` → 不触发 loading | P0 |
| TC-RPC-011 | 请求取消 | AbortController → `CanceledError`，不弹错误提示 | P1 |
| TC-RPC-012 | 类型安全泛型 | `rpcCall<Project>(...)` → 返回类型为 Project | P1 |

### 2.2 API 模块（COV-2 · L2）

| 编号 | 用例 | 预期结果 | 优先级 |
|------|------|---------|--------|
| TC-API-001 | dataService.queryDocuments | 返回 `{ list, total, pageNum, pageSize }` | P0 |
| TC-API-002 | dataService.createDocument | 返回 `{ _id }` | P0 |
| TC-API-003 | 参数名 filter（非 query） | 使用 `filter` → 正常返回；`query` → TypeScript 报错 | P0 |
| TC-API-004 | chatService SSE 流式 | `stream: true` → SSE 解析 → Token 累积 | P1 |

---

## 三、边缘场景

| 编号 | 场景 | 处理策略 | 优先级 |
|------|------|---------|--------|
| TC-EDGE-001 | 并发请求都返回 401 | `_redirecting` 锁防重入 | P0 |
| TC-EDGE-002 | Token 手动清除后请求 | 401 → 连锁清理 | P1 |
| TC-EDGE-003 | 请求参数含 undefined | JSON.stringify 自动过滤 | P1 |
| TC-EDGE-004 | baseURL HMR 变为 undefined | fallback 到默认值 | P2 |
| TC-EDGE-005 | SSE 响应被拦截器误处理 | 跳过 RPC 信封解包 | P1 |
| TC-EDGE-006 | 组件卸载后请求回调 | `onUnmounted` 中 `isActive = false` | P1 |
| TC-EDGE-007 | 大响应体内存溢出 | `maxContentLength` 限制 | P2 |

---

## 四、关键参数名契约测试

| 编号 | 参数名 | 正确 | 错误（导致静默失败） | 优先级 |
|------|--------|------|---------------------|--------|
| TC-CONTRACT-001 | 数据查询 | `filter` | `query` | P0 |
| TC-CONTRACT-002 | 文件路径 | `target_file` | `path` | P0 |
| TC-CONTRACT-003 | 集合名 | `cname` | `collection_name` | P0 |
| TC-CONTRACT-004 | 页码 | `pageNum` | `page` | P1 |
| TC-CONTRACT-005 | 每页条数 | `pageSize` | `limit` | P1 |

---

## 五、追溯矩阵

| 需求项 | 验收标准 | 覆盖用例 |
|--------|---------|---------|
| RPC 信封调用 | 正常返回解包数据 | TC-RPC-001 |
| Token 管理 | 自动附加 + 401 清理 | TC-RPC-002~006 |
| 错误处理 | 业务错误/网络错误提示 | TC-RPC-004,007,008 |
| Loading 管理 | 自动注入 + 可抑制 | TC-RPC-009,010 |
| 参数名契约 | filter/target_file/cname | TC-CONTRACT-001~005 |
| API 模块 | CRUD + SSE | TC-API-001~004 |

---

## 六、出口准则

- [ ] P0 用例 100% 通过
- [ ] 401 防重入（TC-RPC-006）通过
- [ ] 5 个参数名契约用例通过
- [ ] 拦截器链关键路径覆盖