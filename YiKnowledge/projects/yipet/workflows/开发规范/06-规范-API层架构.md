---
title: API 层架构
tags: [yipet, api, architecture, client, endpoints, types, services, sse]
category: projects/yipet/specs
created: 2026-09-08
updated: 2026-09-10
source: YiPet
type: spec
status: active
---

# API 层架构

> YiPet 四层 API 架构：Client → Endpoints → Types → Services。所有 HTTP 通信的单一入口，支持 RPC 信封调用、SSE 流式传输、请求重试、错误映射。

## 一、四层架构

```
┌──────────────────────────────────────────────────────┐
│  Services（域服务类，8 个）                            │
│  构造函数注入 ApiClient                               │
│  职责：业务语义方法，组装 RPC 信封                     │
│  示例：chatService.sendMessage(), ragService.query()  │
├──────────────────────────────────────────────────────┤
│  Types（请求/响应接口）                                │
│  职责：所有 API 形状的单一数据源                       │
│  被 Services 和调用方消费                              │
│  禁止：导入 Services 或 Client                        │
├──────────────────────────────────────────────────────┤
│  Endpoints（路径常量）                                 │
│  职责：按域组织的端点路径                              │
│  被 Services 消费                                     │
├──────────────────────────────────────────────────────┤
│  Client（fetch 包装器）                                │
│  ApiClient：POST/RPC 调用 + 重试 + 错误提取           │
│  StreamClient：SSE 流式传输 + 解析 data: 帧           │
│  禁止：其他层直接调用 fetch                            │
├──────────────────────────────────────────────────────┤
│  Base Client（public/cdn/utils/api-client.js）        │
│  职责：与 MAIN World CDN 注入共享的轻量 fetch 封装    │
│  位置：public/cdn/utils/，通过 chrome.runtime.getURL 加载│
└──────────────────────────────────────────────────────┘
```

## 二、硬约束

| 规则 | 说明 |
|------|------|
| 不可跨层调用 | Services → Client（通过注入），Store/Component → Services（通过导入） |
| Types 零依赖 | Types 文件不导入任何 Services/Client/Store |
| Client 不导入 Services | Client 是纯 HTTP 层，不感知业务 |
| 禁止直接 fetch | 所有 HTTP 调用必须通过 ApiClient |

## 三、Client 层

### 3.1 ApiClient 实现

```typescript
// src/api/client.ts
interface ApiClientConfig {
  baseUrl: string;
  token?: string;
  timeout?: number;        // 默认 30_000
  retries?: number;        // 默认 2
  retryDelay?: number;     // 默认 1000ms
}

class ApiClient {
  constructor(private config: ApiClientConfig) {}

  /** RPC 信封调用 — 标准 POST */
  async rpcCall<T>(
    moduleName: string,
    methodName: string,
    parameters: Record<string, unknown>,
    options?: { signal?: AbortSignal }
  ): Promise<T> {
    const url = `${this.config.baseUrl}/`;

    const body = {
      module_name: moduleName,
      method_name: methodName,
      parameters,
    };

    return this._withRetry(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify(body),
        signal: options?.signal,
      });

      if (!response.ok) {
        throw await this._handleHttpError(response);
      }

      const envelope = await response.json();

      // RPC 业务错误码处理
      if (envelope.code !== 0) {
        throw new ApiError(envelope.code, envelope.message);
      }

      return envelope.data as T;
    });
  }

  /** SSE 流式调用 */
  async streamCall(
    moduleName: string,
    methodName: string,
    parameters: Record<string, unknown>,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/`, {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({
        module_name: moduleName,
        method_name: methodName,
        parameters: { ...parameters, stream: true },
      }),
      signal,
    });

    if (!response.ok) {
      throw await this._handleHttpError(response);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE data: 帧
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保留未完成的行

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6);
            try {
              const parsed = JSON.parse(json);
              if (parsed.done) {
                callbacks.onDone?.(parsed);
              } else if (parsed.error) {
                callbacks.onError?.(new Error(parsed.error));
              } else {
                callbacks.onChunk?.(parsed);
              }
            } catch {
              // 跳过非 JSON 行
            }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        callbacks.onDone?.({ aborted: true });
      } else {
        callbacks.onError?.(e as Error);
      }
    } finally {
      reader.releaseLock();
    }
  }

  // 重试逻辑（指数退避）
  private async _withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= (this.config.retries ?? 2)) throw e;
      if (e instanceof ApiError && e.code >= 4000) throw e; // 认证错误不重试
      if (e instanceof ApiError && e.code >= 1001 && e.code <= 1004) throw e; // 参数错误不重试

      const delay = (this.config.retryDelay ?? 1000) * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      return this._withRetry(fn, attempt + 1);
    }
  }

  private _headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.token) {
      headers["X-Token"] = this.config.token;
    }
    return headers;
  }

  private async _handleHttpError(response: Response): Promise<ApiError> {
    const text = await response.text();
    if (response.status === 401) {
      return new ApiError(4001, "Token 已过期");
    }
    return new ApiError(9999, `HTTP ${response.status}: ${text}`);
  }
}
```

### 3.2 重试策略

| 错误类型 | 是否重试 | 原因 |
|----------|----------|------|
| 网络错误（`TypeError: Failed to fetch`） | ✓ 重试 | 临时网络问题 |
| HTTP 5xx | ✓ 重试 | 服务器临时故障 |
| HTTP 429（限流） | ✓ 重试 | 等待后重试 |
| HTTP 4xx（401/403/404/422） | ✗ 不重试 | 客户端错误，重试无效 |
| RPC 错误 1xxx | ✗ 不重试 | 参数/资源错误 |
| RPC 错误 4xxx | ✗ 不重试 | 认证/权限错误 |
| `AbortError` | ✗ 不重试 | 用户主动取消 |

## 四、Service 层

### 4.1 标准 Service 类

```typescript
// src/api/services/myFeatureService.ts
import { ApiClient } from "../client";
import type { MyFeatureQueryParams, MyFeatureItem } from "../types";

export class MyFeatureService {
  constructor(private client: ApiClient) {}

  async queryFeatures(params: MyFeatureQueryParams) {
    return this.client.rpcCall<{ list: MyFeatureItem[]; total: number }>(
      "services.my_feature.my_feature_service",
      "query_my_features",
      {
        cname: "my_features",
        filter: params.filter ?? {},   // ← filter，非 query
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
      }
    );
  }

  async createFeature(payload: Record<string, unknown>) {
    return this.client.rpcCall<MyFeatureItem>(
      "services.my_feature.my_feature_service",
      "create_my_feature",
      { cname: "my_features", document: payload }
    );
  }
}
```

### 4.2 复用 dataService 的通用模式

大多数 CRUD 无需新建 Service 类——直接复用 `DatabaseService`：

```typescript
// src/api/services/database.ts
export class DatabaseService {
  constructor(private client: ApiClient) {}

  async queryDocuments<T>(cname: string, filter?: Record<string, unknown>, pagination?: { page?: number; page_size?: number }) {
    return this.client.rpcCall<{ list: T[]; total: number }>(
      "services.database.data_service",
      "query_documents",
      { cname, filter, ...pagination }
    );
  }
}
```

### 4.3 服务聚合工厂

```typescript
// src/api/index.ts
export interface ApiServices {
  client: ApiClient;
  auth: AuthService;
  bug: BugService;
  chat: ChatService;
  database: DatabaseService;
  knowledge: KnowledgeService;
  rag: RagService;
  sessions: SessionService;
  wework: WeWorkService;
}

export function createApiServices(
  config: ApiClientConfig & { token?: string }
): ApiServices {
  const client = new ApiClient(config);

  return {
    client,
    auth: new AuthService(client),
    bug: new BugService(client),
    chat: new ChatService(client),
    database: new DatabaseService(client),
    knowledge: new KnowledgeService(client),
    rag: new RagService(client),
    sessions: new SessionService(client),
    wework: new WeWorkService(client),
  };
}
```

## 五、测试模式

```typescript
// tests/api/client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "@/api/client";

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({ baseUrl: "http://localhost:10086" });
    globalThis.fetch = vi.fn();
  });

  it("应组装正确的 RPC 信封", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ code: 0, message: "ok", data: { list: [], total: 0 } }),
    } as Response);

    await client.rpcCall("services.test", "test_method", { cname: "test" });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:10086/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          module_name: "services.test",
          method_name: "test_method",
          parameters: { cname: "test" },
        }),
      })
    );
  });

  it("网络错误应重试（最多 2 次）", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 0, message: "ok", data: {} }),
      } as Response);

    const result = await client.rpcCall("test", "test", {});
    expect(fetch).toHaveBeenCalledTimes(3); // 原始 + 2 次重试
  });
});
```

## 六、跨项目协议契约

| 操作 | RPC 路径 | 关键参数约束 |
|------|----------|-------------|
| 通用 CRUD | `services.database.data_service` | `filter`（非 `query`）、`cname`（非 `collection_name`） |
| 聊天 SSE | `services.ai.chat_service.chat` | `stream: true` 时返回 SSE |
| RAG 查询 | `services.rag.rag_service.query` | `question`、`scope?`、`category?` |
| 知识文件读写 | `/knowledge/read`、`/knowledge/write`（REST） | `target_file`（非 `path`） |

## 七、反模式

| 反模式 | 正确做法 | 原因 |
|--------|----------|------|
| 组件中直接 `fetch()` | 通过 `ApiClient` → Service 调用 | 绕过重试、错误处理、Token 注入 |
| Service 中手动拼接 `module_name` 字符串 | 使用常量或 Service 内部封装 | 拼写错误难以发现 |
| 不处理 `AbortError` | SSE 流中 catch `AbortError` 并调用 `onDone({ aborted: true })` | 用户取消操作被误报为错误 |
| 所有操作新建 Service | 优先复用 `DatabaseService` 通用方法 | 代码膨胀 |
| 参数名使用 `query` 或 `collection_name` | 使用 `filter` 和 `cname` | 后端静默忽略 |