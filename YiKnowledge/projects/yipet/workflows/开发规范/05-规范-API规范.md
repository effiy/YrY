---
title: API 规范
tags: [yipet, api, rpc, sse, apiclient, fetch, retry, error-handling]
category: projects/yipet/specs
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: architecture
status: active
---

# API 规范

> YiPet 4-Tier API 架构完整规范：ApiClient 封装、RPC 协议、SSE 流式解析、错误处理与重试策略、请求取消、超时控制、参数契约、类型安全、Service 工厂模式。

## 一、4-Tier API 架构

```
Layer 1: ApiClient（src/api/client.ts）
  ├── fetch 封装：统一请求/响应拦截
  ├── Token 注入：构造时注入 Token，通过 X-Token 头传递
  ├── RPC 信封：自动组装 { module_name, method_name, parameters }
  ├── SSE 解析：逐行解析 text/event-stream
  ├── 错误处理：状态码映射 + 指数退避重试
  ├── 请求取消：AbortController + AbortSignal
  ├── 超时控制：AbortSignal.timeout 或手动计时器
  └── 响应解析：StandardResponse → 业务数据

Layer 2: Endpoints（src/api/endpoints.ts）
  ├── EXECUTION.ROOT：RPC 分发器路径 "/"
  ├── AUTH：认证端点（/auth/login, /auth/logout）
  ├── FILES：文件操作端点（/read-file, /write-file, /delete-file, /upload-image-to-oss 等）
  ├── STATE：状态存储端点（/state/records, /state/records/<key>）
  ├── WEWORK：企业微信端点（/wework/send-message）
  ├── KNOWLEDGE：知识库端点（/knowledge-scan, /knowledge-read, /knowledge-write 等）
  └── RAG：RAG 端点（/rag-query, /rag-chat, /rag-file-chat, /rag-build 等）

Layer 3: Types（src/api/types.ts）
  ├── RpcRequest：请求类型 { module_name, method_name, parameters }
  ├── QueryResult<T>：查询结果 { list?, documents?, result?, total, pageNum, pageSize, totalPages }
  ├── MutationResult：变更结果 { key?, updated?, deleted? }
  ├── ChatParams / ChatMessage：聊天参数与消息类型
  ├── QueryParams / CreateParams / UpdateParams / DeleteParams：CRUD 参数
  └── 各服务请求/响应接口（40+ 接口）

Layer 4: Services（src/api/services/）
  ├── AuthService：认证与 Token 管理
  ├── BugService：缺陷报告（CRUD + 知识库写入）
  ├── ChatService：AI 聊天（SSE 流式 + 多模式）
  ├── DatabaseService：通用 CRUD（RPC 信封）
  ├── KnowledgeService：知识库读写
  ├── RagService：RAG 检索（文件级 + 目录级）
  ├── SessionService：会话管理（CRUD + 消息历史）
  └── WeWorkService：企业微信消息推送
```

### 分层职责

| 层 | 职责 | 禁止 |
|----|------|------|
| ApiClient | HTTP 通信、拦截、重试、Token 管理 | 包含业务逻辑 |
| Endpoints | 路径常量定义 | 包含请求逻辑 |
| Types | 类型定义、接口声明 | 包含运行时逻辑 |
| Services | 业务接口封装、参数组装 | 直接使用 fetch |

---

## 二、ApiClient 详解

### 工厂函数模式

```typescript
// src/api/client.ts — 扩展 CDN base client，增加 rpc + stream
export function createApiClient(config: ApiClientConfig & { token?: string }): ApiClient {
  const base = createBaseClient({ ...config, logger });
  const { token: configToken } = config;

  // Token 注入头部
  const authHeaders: Record<string, string> = {};
  const token = (configToken || '').trim();
  if (token) authHeaders['X-Token'] = token;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, application/json',
    ...authHeaders,
    ...config.headers,
  };

  // RPC 调用 — 组装 YiAi 信封 + 解包响应
  async function rpc<T>(
    moduleName: string,
    methodName: string,
    parameters: Record<string, unknown> = {},
    signal?: AbortSignal,
  ): Promise<ApiResponse<T>> {
    const url = resolveUrl('/');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? 30000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...defaultHeaders, Accept: 'application/json' },
        body: JSON.stringify({ module_name: moduleName, method_name: methodName, parameters }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await response.json();
      return unwrapEnvelope<T>(json, response.status);
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === 'AbortError') {
        return { ok: false, status: 0, data: null as T, error: 'Request timed out or was aborted' };
      }
      return { ok: false, status: 0, data: null as T, error: (err as Error).message || 'Network error' };
    }
  }

  return { ...base, get, post, put, delete, rpc, stream, url: resolveUrl };
}
```

### 响应信封解包

```typescript
// YiAi 标准响应信封 { code, message, data } → ApiResponse
function unwrapEnvelope<T>(json: unknown, httpStatus: number): ApiResponse<T> {
  if (json && typeof json === 'object' && 'code' in json) {
    const envelope = json as YiAiEnvelope<T>;
    return {
      ok: envelope.code === 0,
      status: httpStatus,
      data: envelope.data as T,
      error: envelope.code !== 0 ? envelope.message : undefined,
    };
  }
  return { ok: httpStatus >= 200 && httpStatus < 300, status: httpStatus, data: json as T };
}

// ApiResponse 格式
interface ApiResponse<T> {
  ok: boolean;       // true = 成功
  status: number;    // HTTP 状态码
  data: T;           // 业务数据
  error?: string;    // 错误消息（ok=false 时）
}
```

### 重试策略

重试逻辑在 base client（`public/cdn/utils/api-client.ts`）中实现，extension client 不重复实现：

```typescript
// public/cdn/utils/api-client.ts — 基础 HTTP 客户端
async function request<T>(method, path, body?, signal?, attempt = 0): Promise<ApiResponse<T>> {
  // ... fetch with timeout ...
  try {
    const response = await fetch(url, init);
    // 成功或 HTTP 错误均直接返回，不重试
    return { ok: response.ok, status: response.status, data, error: ... };
  } catch (err) {
    // 仅网络错误（fetch 抛出）触发重试
    if (retry && attempt < retry.maxRetries) {
      await new Promise((r) => setTimeout(r, retry.baseMs * (attempt + 1)));
      return request<T>(method, path, body, signal, attempt + 1);
    }
    return { ok: false, status: 0, data: null, error: (err as Error).message };
  }
}
```

**重试策略要点**：
- **仅重试网络错误**（fetch 抛出异常），不重试 HTTP 错误状态码（4xx/5xx）
- **线性退避**：`baseMs * (attempt + 1)`，非指数退避
- **默认不启用**：仅当 `config.retry` 传入时才重试（`maxRetries` + `baseMs`）
- Extension client 的 `rpc` 方法不额外重试，直接返回 `ApiResponse`

---

## 三、SSE 流式解析

### 完整流式解析器

```typescript
// src/api/client.ts — stream 方法
const STREAM_TIMEOUT_MS = 600_000;  // 10 min
const READ_TIMEOUT_MS = 30_000;     // 30s per-read

async function* stream(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): AsyncGenerator<StreamChunk> {
  const url = resolveUrl(path);
  const controller = new AbortController();
  if (signal) signal.addEventListener('abort', () => controller.abort());

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, STREAM_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...defaultHeaders, Accept: 'text/event-stream' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok || !response.body) {
      yield { done: true, error: `HTTP ${response.status}` };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      // 每读超时检测（防止连接停滞）
      const readResult = await Promise.race([
        reader.read(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('SSE read timeout')), READ_TIMEOUT_MS),
        ),
      ]);

      const { done, value } = readResult;
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split('\n\n');  // SSE 消息分隔符
      buffer = messages.pop() || '';

      for (const message of messages) {
        const lines = message.split('\n');
        let dataStr = '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;  // 跳过注释/心跳
          if (trimmed.startsWith('data: ')) {
            dataStr += trimmed.slice(6);
          } else if (trimmed.startsWith('event: error')) {
            yield { done: true, error: 'Stream error' };
            return;
          }
        }
        if (!dataStr) continue;
        if (dataStr === '[DONE]') { yield { done: true }; return; }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) { yield { done: true, error: String(parsed.error) }; return; }
          if (parsed.done) { yield { done: true }; return; }
          yield { done: false, data: parsed.data ?? parsed };
        } catch {
          yield { done: false, data: dataStr };
        }
      }
    }
    yield { done: true };
  } catch (err) {
    clearTimeout(timeoutId);
    // 保留 AbortError 身份 — 调用方据此区分用户取消 vs 错误
    if ((err as Error)?.name === 'AbortError') {
      if (timedOut) {
        yield { done: true, error: `Stream timed out after ${STREAM_TIMEOUT_MS / 1000}s` };
        return;
      }
      throw err;  // 用户取消 — 向上传播 AbortError
    }
    yield { done: true, error: (err as Error).message || 'Stream error' };
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}
```

### StreamChunk 类型

```typescript
interface StreamChunk<T = unknown> {
  done: boolean;      // true = 流结束
  data?: T;           // 流数据（done=false 时）
  error?: string;     // 错误消息（done=true 时）
}
```

### 调用方使用模式

```typescript
// Chat Store 中消费流式响应
async function _runStream(params: ChatParams, signal: AbortSignal): Promise<void> {
  const stream = api.client.stream('/rag-chat', {
    messages: params.messages,
    scope: ragScope,
  }, signal);

  for await (const chunk of stream) {
    if (chunk.done) {
      if (chunk.error) handleError(chunk.error);
      break;
    }
    appendToken(chunk.data);  // 增量追加到消息内容
  }
}
```

---

## 四、请求取消与超时

### AbortController 管理

```typescript
// ApiClient 内部 — rpc 方法自带超时
async function rpc<T>(...): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? 30000);
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener('abort', onAbort);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    // ...
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

// Chat Store 中 — 通过 AbortController 管理流式请求
let streamAbort: AbortController | null = null;

async function sendMessage(text: string): Promise<void> {
  // 取消前一个请求
  streamAbort?.abort();
  streamAbort = new AbortController();

  try {
    const stream = api.client.stream('/rag-chat', body, streamAbort.signal);
    for await (const chunk of stream) {
      if (chunk.done) break;
      appendToken(chunk.data);
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;  // 用户取消，静默
    handleError(err);
  }
}

function stopSending(): void {
  streamAbort?.abort();
  streamAbort = null;
}
```

---

## 五、RPC 协议

### 请求格式

```typescript
interface RpcRequest {
  module_name: string;   // "services.database.data_service"
  method_name: string;   // "query_documents"
  parameters: Record<string, unknown>;
}

// 通用 CRUD 查询
const response = await apiClient.rpc<QueryResult<Project>>(
  "services.database.data_service",
  "query_documents",
  {
    cname: "projects",
    filter: { status: "active" },
    pageNum: 1,
    pageSize: 20,
    sort: { created_at: -1 },
  },
);

// 文件写入
await apiClient.rpc<void>(
  "services.knowledge.knowledge_service",
  "write_entry_markdown",
  {
    target_file: "engineer/learn/lessons/failures/bugs/login-loop.md",
    content: markdownContent,
  },
);

// 文件读取
const content = await apiClient.rpc<string>(
  "services.knowledge.knowledge_service",
  "read_entry_markdown",
  {
    target_file: "engineer/learn/architecture/microservices.md",
  },
);
```

### 响应格式

```typescript
// YiAi 标准响应信封
interface RpcResponse<T> {
  code: number;    // 0 = 成功，非 0 = 业务错误
  message: string; // "ok" 或错误描述
  data: T | null;  // 业务数据，错误时为 null
}

// 实际查询结果类型（src/api/types.ts）
interface QueryResult<T = unknown> {
  list?: T[];
  documents?: T[];
  result?: T[];
  total?: number;
  pageNum?: number;
  pageSize?: number;
  totalPages?: number;
}
```

> `QueryResult` 兼容多种后端返回格式（`list`/`documents`/`result`），Service 层负责统一提取。

---

## 六、关键参数约定

| 正确 | 错误 | 上下文 |
|------|------|--------|
| `filter` | `query` | `data_service.query_documents` 参数 |
| `target_file` | `path` | `/read-file`, `/write-file` 接口 |
| `cname` | `collection_name` | `data_service` 集合名称参数 |
| `module_name` | `moduleName` | RPC 信封（snake_case） |
| `method_name` | `methodName` | RPC 信封（snake_case） |
| `pageNum` | `page` | 分页参数（驼峰） |
| `pageSize` | `page_size` / `limit` | 分页参数（驼峰） |

> 这些参数名不匹配曾导致真实 Bug — 后端静默忽略 `query`，对 `path` 返回 422。

---

## 七、Service 层示例

### DatabaseService

```typescript
// src/api/services/database.ts
const DB_MODULE = 'services.database.data_service';

export class DatabaseService {
  constructor(private client: ApiClient) {}

  async query(params: Partial<QueryParams>): Promise<ApiResponse<QueryResult>> {
    return this.client.rpc<QueryResult>(DB_MODULE, 'query_documents', params as Record<string, unknown>);
  }

  async create(params: Partial<CreateParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'create_document', params as Record<string, unknown>);
  }

  async update(params: Partial<UpdateParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'update_document', params as Record<string, unknown>);
  }

  async delete(params: Partial<DeleteParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'delete_document', params as Record<string, unknown>);
  }
}
```

### Service 工厂

```typescript
// src/api/services/index.ts
export interface ApiServices {
  client: ApiClient;
  auth: AuthService;
  sessions: SessionService;
  chat: ChatService;
  database: DatabaseService;
  knowledge: KnowledgeService;
  rag: RagService;
  bug: BugService;
  wework: WeWorkService;
}

export function createApiServices(config: ApiClientConfig & { token?: string }): ApiServices {
  const client = createApiClient(config);
  return {
    client,
    auth: new AuthService(client),
    sessions: new SessionService(client),
    chat: new ChatService(client),
    database: new DatabaseService(client),
    knowledge: new KnowledgeService(client),
    rag: new RagService(client),
    bug: new BugService(client),
    wework: new WeWorkService(client),
  };
}
```

---

## 八、错误处理

### 错误模型

YiPet 不使用自定义 Error 类。所有错误通过 `ApiResponse<T>` 统一表示：

```typescript
interface ApiResponse<T> {
  ok: boolean;       // true = 成功
  status: number;    // HTTP 状态码（0 = 网络错误/超时）
  data: T;           // 业务数据（ok=false 时为 null）
  error?: string;    // 错误消息（ok=false 时）
}
```

### 错误来源与处理

| 错误来源 | 触发条件 | `status` | `error` | 处理方式 |
|----------|----------|----------|---------|----------|
| 网络错误 | fetch 抛出异常 | `0` | `(err).message` | Base client 线性退避重试（若配置了 `retry`） |
| 请求超时 | `AbortController` 超时 | `0` | `"Request timed out or was aborted"` | 不重试，直接返回 |
| HTTP 4xx | 服务端返回 400/401/403/404 | 实际状态码 | 响应体 `detail` 或 `HTTP ${status}` | 不重试，调用方根据 status 判断 |
| HTTP 5xx | 服务端返回 500/502/503 | 实际状态码 | 同上 | 不重试（base client 不区分 4xx/5xx） |
| 业务错误 | `code !== 0`（RPC 信封） | HTTP 200 | `envelope.message` | 不重试，`unwrapEnvelope` 提取消息 |
| 用户取消 | `AbortSignal.abort()` | — | — | `AbortError` 向上传播，调用方静默处理 |

### 调用方错误处理模式

```typescript
// Service 层 — 检查 ApiResponse.ok
const res = await api.database.query({ cname: 'bugs', filter: { status: 'open' } });
if (!res.ok) {
  console.error(`Query failed: ${res.error}`);
  return;
}
const bugs = res.data.list ?? [];

// Chat Store — 区分 AbortError（用户取消）vs 真实错误
try {
  for await (const chunk of stream) { ... }
} catch (err) {
  if ((err as Error).name === 'AbortError') return;  // 用户取消，静默
  handleError((err as Error).message);
}
```

### 错误日志

Extension client 在 `rpc` 失败时通过 logger 输出警告：

```typescript
// src/api/client.ts — rpc 方法
if (!result.ok) {
  logger?.warn?.(`RPC ${moduleName}:${methodName} → ${result.error}`);
}
```

Base client 在 HTTP 错误时输出警告：

```typescript
// public/cdn/utils/api-client.ts — request 方法
if (!response.ok) {
  logger?.warn?.(`API ${method} ${path} → ${response.status}`, result.error);
}
```

---

## 九、反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 绕过 ApiClient | `fetch(url, ...)` 在组件中 | 使用 `apiClient.rpc()` 或 Service 方法 | 失去 Token 注入、重试、错误处理 |
| 参数名使用 `query` | `parameters: { query: {...} }` | `parameters: { filter: {...} }` | 后端静默忽略，返回全部数据 |
| 参数名使用 `path` | `parameters: { path: "..." }` | `parameters: { target_file: "..." }` | 后端返回 422 |
| 驼峰 RPC 字段 | `{ moduleName, methodName }` | `{ module_name, method_name }` | RPC 分发器解析失败 |
| 不处理 SSE 中断 | 用户关闭页面后连接未断开 | 使用 AbortSignal 取消 | 资源泄漏 |
| 硬编码 API 地址 | `fetch("http://localhost:10086")` | 使用 `RSBUILD_API_BASE` 环境变量 | 不可配置 |
| 吞没 AbortError | `catch(e) { handleError(e) }` 不区分 AbortError | 检查 `e.name === 'AbortError'` 后静默返回 | 用户取消被误报为错误 |
| 在 Service 中直接 fetch | Service 方法中调用 `fetch()` | 通过 `this.client.rpc()` 或 `this.client.get()` | 绕过 Token 注入和错误处理 |

---

## 十、约束

### 必须遵守
- 所有 API 调用通过 ApiClient，不直接使用 fetch
- 使用 `apiClient.rpc(moduleName, methodName, params)` 调用 RPC 接口
- 参数名使用 `filter`（非 `query`）、`target_file`（非 `path`）
- 使用 RPC 信封格式 `{ module_name, method_name, parameters }`（snake_case 字段名）
- SSE 流式响应使用 `text/event-stream` 解析，处理 `[DONE]` 结束标记
- 每个流式请求创建独立的 AbortController，组件销毁时取消
- 请求超时设置合理默认值（普通请求 30s，流式请求 600s/10min，每读超时 30s）

### 禁止
- 不绕过 ApiClient 直接调用 fetch
- 不在 Service 层之外组装 RPC 信封
- 不在 RPC 参数中使用驼峰命名（`moduleName`、`methodName`）
- 不忽略 SSE 请求的取消清理（AbortSignal）
- 不硬编码 API 地址和端点路径
- 不在组件中直接处理 API 错误（统一在 Service 层处理）