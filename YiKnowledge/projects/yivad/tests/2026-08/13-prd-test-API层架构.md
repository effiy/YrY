---
doc_type: test
title: "YV-08-18: API 层架构 — RequestHttp 拦截器链 + 请求取消 + 指数退避重试 + 并发批处理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
prd_task_id: "YV-08-18"
source_prds: ["13-prd-API层架构"]
source_modules: []
---
# YV-08-18: API 层架构 — RequestHttp 拦截器链 + 请求取消 + 指数退避重试 + 并发批处理 — 测试规格

> 来源 PRD：[13-prd-API层架构.md](../../prds/2026-08/13-prd-API层架构.md)
> 提取日期：2026-09-11

---

### 5.3 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| 重复请求去重 | 用户快速点击"保存"按钮 3 次，触发 3 个相同请求 | `AxiosCanceler.addPending` 生成唯一 key（method + url + params + data），检测到相同 key 时 `controller.abort()` 取消旧请求 | `getPendingUrl(config)` → `"post&/&module_name=...&method_name=...&..."` |
| Loading 计数器为负 | `{ loading: false }` 的静默请求失败时错误递减计数器 | 仅当 `config.loading === true` 时才调用 `tryHideFullScreenLoading()` | 错误分支 `if (config.loading ?? true) tryHideFullScreenLoading()` |
| Token 并发刷新 | 5 个标签页同时 Token 过期，触发 5 次 `refreshToken` 请求 | 添加 `isRefreshing` 全局锁：首个 401 刷新时设置锁，后续 401 等待 `refreshPromise` 完成后重试 | `if (isRefreshing) { await refreshPromise; retry(originalRequest) }` |
| FormData 序列化 | `addPending` 的 `qs.stringify(config.data)` 对 `FormData` 实例返回 `"[object FormData]"` | 检测 `config.data instanceof FormData`，跳过序列化，使用 `config.url + config.method` 作为 pending key | `getPendingUrl` 中 `if (config.data instanceof FormData) { return config.method + '&' + config.url }` |
| 属性顺序导致去重失败 | `{a: 1, b: 2}` 和 `{b: 2, a: 1}` 序列化后不同 | `qs.stringify` 传入 `sort: (a, b) => a.localeCompare(b)` 确保属性按字母序排列 | `qs.stringify(config.data, { sort: (a, b) => a.localeCompare(b) })` |
| 路由切换后残留 pending | 从页面 A 跳到 B，A 的 pending 请求在 B 页面触发时被误取消 | 路由守卫中调用 `axiosCanceler.removeAllPending()` 清空 pendingMap | `router.beforeEach((to, from) => { if (to.path !== from.path) axiosCanceler.removeAllPending() })` |
| withRetry 非幂等写操作 | `withRetry` 对 POST 写操作重试导致重复创建 | 添加 `retry.methods: ['GET', 'HEAD', 'OPTIONS']` 白名单，仅对读操作重试 | `if (!retryOnMethods.includes(config.method)) return Promise.reject(error)` |
| baseURL 为空 | 生产环境 `import.meta.env.VITE_API_BASE_URL` 未定义 | 运行时校验空 baseURL，warn + fallback 到 `/` | `if (!baseURL) { console.warn('[RequestHttp] baseURL empty, using relative path') }` |
| 网络断开 (offline) | 浏览器 `navigator.onLine === false` 时请求失败 | 显示专门的离线提示页面 `/500`，而非通用错误提示 | `if (!navigator.onLine) router.replace('/500')` |
| checkStatus 未知状态码 | 后端返回文档外状态码（如 418 I'm a teapot） | `switch` 的 `default` 分支统一处理："服务异常 (HTTP ${status})" | `default: message = `服务异常 (HTTP ${status})`; break` |
| 并发 Loading 销毁 | 页面有 3 个并发请求，Loading 计数器 = 3，第 1 个完成，计数器 = 2，Loading 仍显示 | 计数器确保所有请求完成后才隐藏，行为正确 | `loadingCount++` on request, `loadingCount--` on response, hide when `loadingCount === 0` |
| 请求被 AbortController 取消 | 被取消的请求进入 `catch` 分支，不应显示错误提示 | `axios.isCancel(error)` 检测取消错误，静默处理 | `if (axios.isCancel(error)) { return } // 不显示错误` |

---


## 八、测试规格

### 8.1 单元测试

| # | 测试用例 | 输入 | 预期输出 |
|----|---------|------|----------|
| 1 | `getPendingUrl` 相同请求生成相同标识 | `{method: "post", url: "/", data: {a: 1}, params: {b: 2}}` | 两次调用返回相同字符串 |
| 2 | `getPendingUrl` 不同参数生成不同标识 | `{data: {a: 1}}` vs `{data: {a: 2}}` | 两次调用返回不同字符串 |
| 3 | `addPending` 取消旧请求 | 同一 URL 调用两次 `addPending` | 第一次的 controller 被 abort |
| 4 | `removePending` 清理 | `addPending` 后 `removePending` | pendingMap 中无该 URL |
| 5 | `withRetry` 成功不重试 | 请求成功 | 仅调用 1 次 requestFn |
| 6 | `withRetry` 502 重试成功 | 第 1 次 502，第 2 次成功 | 调用 2 次，返回成功结果 |
| 7 | `withRetry` 3 次全失败 | 3 次均 502 | 抛出最后一次错误，总延迟 7s |
| 8 | `withRetry` 400 不重试 | 400 Bad Request | 立即抛出错误，不重试 |
| 9 | `checkStatus` 各状态码 | 400/401/403/404/500/502/503/504 | 对应中文提示 |

### 8.2 集成测试

| # | 测试用例 | 操作 | 预期结果 |
|----|---------|------|----------|
| 1 | 请求拦截器添加 Auth header | 已登录状态发送请求 | 请求头包含 `Authorization: Bearer <token>` |
| 2 | 响应拦截器处理 401 | 后端返回 `code === OVERDUE` | 清除 token + 重定向登录页 |
| 3 | 请求取消去重 | 快速连续点击同一按钮 3 次 | 仅最后一个请求到达后端 |
| 4 | Loading 计数器并发 | 同时发起 3 个请求 | Loading 在第 3 个请求完成后才隐藏 |
| 5 | Loading 计数器非 loading 请求 | `{ loading: false }` 请求失败 | Loading 计数器不受影响 |

### 8.3 BDD 场景

#### Requirement: 重复请求自动取消

**Scenario: 快速连续点击触发请求去重**
- **GIVEN** 用户在网络较慢的环境下（延迟 > 500ms）
- **WHEN** 用户快速连续点击"保存"按钮 3 次，每次触发 `updateDocument` API
- **THEN** 第 1 次请求正常发出，`addPending` 记录该请求的 `pendingUrl`
- **AND** 第 2 次请求检测到相同 `pendingUrl`，取消第 1 次请求的 `AbortController`
- **AND** 第 3 次请求检测到相同 `pendingUrl`，取消第 2 次请求的 `AbortController`
- **AND** 仅第 3 次请求到达后端并成功执行
- **AND** 后端数据库仅有一条更新记录

#### Requirement: Token 过期自动重定向

**Scenario: 401 响应触发登录页重定向**
- **GIVEN** 用户 token 已过期（后端返回 `{ code: OVERDUE }`）
- **WHEN** 前端发起任何 API 请求
- **THEN** 响应拦截器检测到 `code === OVERDUE`
- **AND** 清除 Pinia store 中的 token 和用户信息
- **AND** 清除 `localStorage` 中的持久化 token
- **AND** 调用 `router.replace('/login')` 重定向到登录页
- **AND** 取消所有待处理的请求（`removeAllPending()`）
- **AND** 登录页显示"登录已过期，请重新登录"提示

**Scenario: 有效 token 正常通过**
- **GIVEN** 用户 token 有效且未过期
- **WHEN** 前端发起 API 请求
- **THEN** 请求拦截器添加 `Authorization: Bearer <token>` 头部
- **AND** 响应拦截器检测到 `code === 0`，正常返回数据
- **AND** 不触发 token 清除或重定向

#### Requirement: 请求重试机制

**Scenario: 网络抖动触发指数退避重试**
- **GIVEN** 后端服务临时不可用（返回 502）
- **WHEN** 前端发起 `query_documents` 请求
- **THEN** `withRetry` 检测到 502 状态码（可重试错误）
- **AND** 第 1 次重试在 1s 后执行（仍 502）
- **AND** 第 2 次重试在 2s 后执行（仍 502）
- **AND** 第 3 次重试在 4s 后执行（成功）
- **AND** 总共 3 次重试，总延迟 7s（1+2+4），最终返回成功结果

**Scenario: 客户端错误不重试**
- **GIVEN** 请求参数错误（后端返回 400）
- **WHEN** 前端发起请求
- **THEN** `withRetry` 检测到 400 状态码（不可重试的错误）
- **AND** 立即抛出错误，不执行任何重试
- **AND** 前端显示错误提示，而非等待超时

---

