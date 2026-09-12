---
doc_type: test
title: "YV-07-05: API 层设计 — RequestHttp RPC 拦截器 + 错误处理 + 认证集成 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-05"
source_prds: ["05-prd-API层设计"]
source_modules: []
---
# YV-07-05: API 层设计 — RequestHttp RPC 拦截器 + 错误处理 + 认证集成 — 测试规格

> 来源 PRD：[05-prd-API层设计.md](../../prds/2026-07/05-prd-API层设计.md)
> 提取日期：2026-09-11

---

### 4.4 边缘场景处理

| # | 场景 | 描述 | 处理策略 | 实现细节 |
|---|------|------|---------|---------|
| 1 | 网络断开后重连 | 用户网络断开期间发起 API 请求，重连后请求仍在等待 | axios 默认 `timeout: 30000`，30s 后自动超时；可通过 `options.timeout` 覆盖 | `axios.create({ timeout: 30000 })` |
| 2 | 并发请求都返回 401 | 页面加载时 5 个并发 API 同时返回 401，每个都触发重定向 | `_redirecting` 防重入锁：仅第一次 401 触发 `router.push('/login')`，后续 401 静默丢弃 | `if (code === 4001 && !_redirecting) { _redirecting = true; router.push('/login'); }` |
| 3 | 请求超时后重试 | 网络波动导致请求超时，自动重试可能创建重复资源 | 仅 GET/HEAD/OPTIONS 等幂等方法自动重试；POST/PUT/DELETE 需 `Idempotency-Key` 头部 | `withRetry` 检查 `config.method` 是否为幂等方法 |
| 4 | Token 临近过期 | Token 在请求发送后、响应返回前过期，后端返回 401 | 响应拦截器捕获 401 → 清除 Token → 重定向；建议在 Token 过期前 5min 自动刷新 | `refreshToken()` 在 401 前主动调用 |
| 5 | 大文件上传无进度反馈 | 上传 > 10MB 文件时用户无进度条，体验差 | 使用 `axios.onUploadProgress` 回调，组件通过 `options.onUploadProgress` 传入进度处理函数 | `config.onUploadProgress = options.onUploadProgress` |
| 6 | RPC 参数中包含 `undefined` | 参数 `{ filter: { status: undefined } }` 被 JSON.stringify 忽略 | 在 `rpcCall` 中过滤 `undefined` 值：`JSON.parse(JSON.stringify(params))` 或使用 `replacer` | `JSON.stringify(params, (_, v) => v === undefined ? null : v)` |
| 7 | `baseURL` HMR 变为 `undefined` | Rsbuild HMR 热更新时 `import.meta.env` 变量丢失 | 添加 fallback：`baseURL: import.meta.env.RS_BUILD_API_BASE \|\| 'http://localhost:10086'` | 构造函数中 `console.debug('[RequestHttp] baseURL:', baseURL)` |
| 8 | SSE 流式响应被 axios 拦截器误处理 | 聊天 SSE 响应没有 `code/message/data` 信封结构 | 通过 `config.responseType` 或自定义 `Accept` 头区分 SSE 请求，跳过 RPC 信封解包 | `if (config.headers.Accept === 'text/event-stream') return response;` |
| 9 | 请求取消后 `finally` 中状态更新 | 组件卸载时取消请求，`finally` 中更新已卸载组件的状态 | 使用 `AbortController` + `onUnmounted` 取消请求；`finally` 中检查 `isUnmounted` | `const controller = new AbortController(); onUnmounted(() => controller.abort());` |
| 10 | `localStorage` 中 Token 被手动清除 | 用户在 DevTools 中手动删除 Token，但 Pinia store 中仍有 Token | 响应拦截器 401 处理清除 store；路由守卫中检查 `localStorage` 和 store 一致性 | `router.beforeEach` 中 `if (!authStore.token) { ... }` |
| 11 | 多个 API 模块同时导入 RequestHttp 实例 | 多个模块导入同一个 `http` 单例，拦截器只注册一次 | `RequestHttp` 使用单例模式：`export const http = new RequestHttp()`，构造函数中 `setupInterceptors()` 只执行一次 | 单例确保拦截器不重复注册 |
| 12 | 请求重试时 Token 已刷新 | 重试请求使用旧 Token，后端返回 401 → 刷新 Token → 重试 | 响应拦截器 401 处理中先尝试刷新 Token（`refreshToken()`），成功后再重试原请求 | `if (code === 4001) { await refreshToken(); return http.request(config); }` |

---


## 六、测试规格

### Requirement: RPC 调用

#### Scenario: TC-RPC-01 正常 RPC 调用返回数据
- **Given** 后端正常运行
- **When** 调用 `http.rpcCall("services.database.data_service", "query_documents", {cname: "projects"})`
- **Then** 返回 `QueryResult<Project>` 类型数据
- **And** 响应拦截器自动解包 `{code: 0, message: "ok", data: {...}}` → 直接返回 `data`

#### Scenario: TC-RPC-02 业务错误码被拦截
- **Given** 后端返回 `{code: 4001, message: "认证失败", data: null}`
- **When** 调用任意 RPC 方法
- **Then** 响应拦截器清除 Token → 重定向 `/login`
- **And** 抛出 `RpcError(4001, "认证失败")`

#### Scenario: TC-RPC-03 Token 自动附加
- **Given** Pinia authStore 中有 Token
- **When** 调用任意 RPC 方法
- **Then** 请求头包含 `X-Token: <token>`

#### Scenario: TC-RPC-04 跳过错误处理
- **Given** 调用时传入 `{skipErrorHandler: true}`
- **When** 后端返回业务错误码
- **Then** 不弹出 ElMessage 错误提示
- **And** 仍然抛出 `RpcError`

#### Scenario: TC-RPC-05 网络错误处理
- **Given** 后端不可达
- **When** 调用任意 RPC 方法
- **Then** 30s 超时后弹出"网络请求失败"
- **And** 抛出 axios 错误

#### Scenario: TC-RPC-06 并发请求 401 防重入
- **Given** Token 已过期，页面同时发起 5 个 API 请求
- **When** 5 个请求同时返回 401
- **Then** 仅触发一次重定向 `/login`
- **And** 浏览器历史记录中仅添加一条 `/login` 记录

#### Scenario: TC-RPC-07 GET 请求豁免 Token
- **Given** 调用时传入 `{skipAuth: true}`
- **When** 调用任意 RPC 方法
- **Then** 请求头不包含 `X-Token`

#### Scenario: TC-RPC-08 自定义超时
- **Given** 调用时传入 `{timeout: 60000}`
- **When** 后端响应时间超过 30s 但小于 60s
- **Then** 请求正常返回，不触发超时

#### Scenario: TC-RPC-09 类型安全泛型
- **Given** 调用 `dataApi.queryDocuments<Project>({cname: "projects"})`
- **When** 访问返回值 `result.docs[0].name`
- **Then** TypeScript 提供 `name` 属性的智能提示
- **And** `vue-tsc --noEmit` 通过，无类型错误

#### Scenario: TC-RPC-10 请求取消
- **Given** 组件中使用 `AbortController` 发起请求
- **When** 组件卸载时调用 `controller.abort()`
- **Then** 请求被取消，`catch` 中捕获 `CanceledError`
- **And** 不触发 `ElMessage.error` 错误提示

---


## 边缘场景处理

| # | 场景 | 触发条件 | 处理策略 | 优先级 |
|---|------|---------|---------|--------|
| 1 | 并发请求 Token 同时过期 | 页面加载时 5+ 个 API 同时返回 401 | 使用 `_redirecting` 锁，仅第一个 401 触发重定向，后续请求静默等待 | P0 |
| 2 | 请求超时后重试导致重复操作 | POST 请求超时，自动重试 | 仅 GET/HEAD/OPTIONS 幂等请求自动重试，POST/PUT/DELETE 需确认幂等键 | P0 |
| 3 | 大文件上传时 Token 过期 | 上传持续时间超过 Token 有效期 | 上传前检查 Token 剩余有效期，< 5min 时先刷新 Token | P1 |
| 4 | SSE 流式响应中 401 错误 | SSE 连接中 Token 过期 | SSE 连接建立时锁定 Token 快照，连接期间不检查 Token 过期 | P1 |
| 5 | 网络恢复后积压请求同时发出 | 离线期间积累的请求在网络恢复时同时发送 | 使用请求队列，网络恢复后按优先级和时序逐批发送 | P2 |
| 6 | `localStorage` 满导致 Token 写入失败 | 浏览器存储配额耗尽 | Token 写入失败时降级到 sessionStorage 或内存存储，提示用户清理存储 | P2 |
| 7 | 多个标签页同时刷新 Token | 标签页 A 和 B 同时检测到 Token 过期并尝试刷新 | 使用 `BroadcastChannel` 广播 Token 刷新结果，其他标签页监听更新 | P2 |
| 8 | 请求参数包含循环引用导致 JSON.stringify 失败 | 参数对象中存在循环引用 | `JSON.stringify` 前使用 `JSON.decycle` 或自定义序列化，检测循环引用并截断 | P2 |
| 9 | 请求响应体过大导致内存溢出 | 后端返回 > 50MB 的响应体 | 设置 `maxContentLength` 限制，超过限制时使用流式下载或分页 | P2 |
| 10 | 用户快速切换页面时组件卸载，请求回调执行 | 组件已卸载但请求回调中的 `ref` 赋值仍执行 | 使用 `onUnmounted` 中设置 `isActive = false` 标志，回调中检查 | P1 |
| 11 | `qs.stringify` 对数组参数的序列化格式不一致 | 不同后端对 `a[]=1&a[]=2` vs `a=1&a=2` 的解释不同 | 在 `qs.stringify` 中统一配置 `arrayFormat: 'brackets'`，全项目一致 | P2 |
| 12 | 请求被浏览器插件拦截（广告拦截器、隐私插件） | 浏览器插件误将 API 请求识别为追踪请求 | 请求路径避免使用 `analytics`、`track`、`collect` 等敏感词，使用 `/api/rpc` 替代 `/` | P3 |

---

