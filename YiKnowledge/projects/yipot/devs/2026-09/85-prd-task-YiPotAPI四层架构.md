---

doc_type: module
prd_task_id: "YP-09-53-5"
title: "YiPot API 四层架构 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "53-prd-YiAi后端集成.md"
parent_module: "YP-09-53"
related_tests: ["YP-09-53"]

type: task
---

# YiPot API 四层架构 — 开发方案

> 来源 PRD：[53-prd-YiAi后端集成.md](../../prds/2026-09/53-prd-YiAi后端集成.md) · 父模块：[80-prd-task-YiAi后端集成.md](./80-prd-task-YiAi后端集成.md)
> **参照项目**：[YiPet `src/api/`](../../../../yipet/../../yipet/src/api/) — 四层架构的原始参考实现

---

## 源码索引

| 文件 | 说明 | 行数 | 参照 |
|------|------|------|------|
| `YiPot/src/api/client.ts` | Layer 1: fetch 封装 + RPC 信封 + SSE 流式 | 205 | `YiPet/src/api/client.ts` |
| `YiPot/src/api/endpoints.ts` | Layer 2: 路径常量 | 55 | `YiPet/src/api/endpoints.ts` |
| `YiPot/src/api/types.ts` | Layer 3: 类型定义 | 100 | `YiPet/src/api/types.ts` |
| `YiPot/src/api/index.ts` | 桶导出 | 20 | `YiPet/src/api/index.ts` |
| `YiPot/src/api/init.ts` | API 客户端初始化 + window 全局存储 | 35 | — |
| `YiPot/src/api/services/translation.ts` | Layer 4: 翻译服务封装 | 95 | `YiPet/src/api/services/chat.ts` |
| `YiPot/src/api/services/knowledge.ts` | Layer 4: 知识库/RAG 服务封装 | 55 | `YiPet/src/api/services/knowledge.ts` |
| `YiPot/src/api/services/index.ts` | createApiServices 工厂 | 30 | `YiPet/src/api/services/index.ts` |

---

## 一、架构分层

```
┌──────────────────────────────────────────────────┐
│  Window Components (Translate/Recognize/Config)   │
│  调用: api.translation.translate(params)          │
├──────────────────────────────────────────────────┤
│  Layer 4: Services (translation.ts, knowledge.ts) │
│  类型安全的领域函数，封装 RPC 调用细节              │
├──────────────────────────────────────────────────┤
│  Layer 3: Types (types.ts)                        │
│  请求/响应接口定义，匹配 YiAi RPC 契约              │
├──────────────────────────────────────────────────┤
│  Layer 2: Endpoints (endpoints.ts)                │
│  路径常量，按域组织                                  │
├──────────────────────────────────────────────────┤
│  Layer 1: Client (client.ts)                      │
│  fetch 封装 + RPC 信封 + SSE 流式 + 信封解包        │
├──────────────────────────────────────────────────┤
│  YiAi FastAPI :10086 (RPC 协议)                   │
└──────────────────────────────────────────────────┘
```

**硬约束**：
- 窗口组件 **禁止** 直接调用 `fetch()`——必须通过 Layer 4 服务
- Layer 4 服务 **禁止** 直接调用 `fetch()`——必须通过 `client.rpc()` / `client.get()` / `client.post()`
- Layer 1 `client.ts` 是唯一允许调用 `fetch()` 的模块

---

## 二、Layer 1: Client — RPC 信封

### 核心接口

```typescript
export function createApiClient(config: ApiClientConfig): {
  rpc<T>(moduleName, methodName, parameters?, signal?): Promise<ApiResponse<T>>;
  get<T>(path, signal?): Promise<ApiResponse<T>>;
  post<T>(path, body?, signal?): Promise<ApiResponse<T>>;
  stream(path, body?, signal?): AsyncGenerator<StreamChunk>;
  url(path): string;
}
```

### RPC 调用实现

```typescript
async function rpc<T>(moduleName, methodName, parameters = {}, signal?) {
  const response = await fetch(resolveUrl('/'), {
    method: 'POST',
    headers: { ...authHeaders(), Accept: 'application/json' },
    body: JSON.stringify({ module_name: moduleName, method_name: methodName, parameters }),
    signal: controller.signal,
  });
  const json = await response.json();
  return unwrapEnvelope<T>(json, response.status);
}
```

### 信封解包

```typescript
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
  // 非 YiAi 信封 → 透传
  return { ok: httpStatus >= 200 && httpStatus < 300, status: httpStatus, data: json as T };
}
```

**关键设计**：
- `code === 0` 判断成功，非 0 的 `message` 填充到 `error`
- 非 YiAi 信封（非 JSON 或无 `code` 字段）透传，不报错
- 30 秒超时 + AbortController 取消支持

### SSE 流式

```typescript
async function* stream(path, body?, signal?): AsyncGenerator<StreamChunk> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...authHeaders(), Accept: 'text/event-stream' },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const reader = response.body.getReader();
  // 逐帧解析 SSE: data: {...}\n\n
  // yield { done: false, data: parsed } 或 { done: true }
}
```

---

## 三、Layer 2: Endpoints — 路径常量

```typescript
export const TRANSLATION = { RPC: '/' } as const;  // RPC 调用统一走 POST /
export const KNOWLEDGE = {
  SCAN: '/knowledge-scan', READ: '/knowledge-read', WRITE: '/knowledge-write',
  STORIES: '/knowledge-stories', ...
} as const;
export const RAG = {
  QUERY: '/rag-query', STATUS: '/rag-status', BUILD: '/rag-build',
  CHAT: '/rag-chat', FILE_QUERY: '/rag-file-query', ...
} as const;
```

---

## 四、Layer 4: Services — 领域服务

### TranslationService

```typescript
export function createTranslationService(client: ApiClient) {
  return {
    async translate(params: TranslateRequest): Promise<TranslateResult[]> {
      const res = await client.rpc<TranslateResult[]>(
        'services.translation.translate_service', 'translate', {
          text: params.text, from_lang: params.from_lang ?? 'auto',
          to_lang: params.to_lang ?? 'zh', providers: params.providers ?? null,
          provider_config: params.provider_config ?? null,
        });
      if (!res.ok) throw new Error(res.error || 'Translation failed');
      return res.data;
    },

    async recognize(params: RecognizeRequest): Promise<RecognizeResult[]> { ... },
    async tts(params: TtsRequest): Promise<TtsResult> { ... },
    async collect(params: CollectRequest): Promise<{ success: boolean }> { ... },
    async queryHistory(params: QueryDocumentsParams) { ... },
  };
}
```

### KnowledgeService

```typescript
export function createKnowledgeService(client: ApiClient) {
  return {
    async scan(category?: string): Promise<KnowledgeTreeNode[]> { ... },
    async read(path: string): Promise<KnowledgeReadResponse> { ... },
    async ragStatus(): Promise<RagStatusResponse> { ... },
    async rebuildRag(): Promise<void> { ... },
    async ragQuery(question: string, scope?: string): Promise<RagSource[]> { ... },
  };
}
```

---

## 五、与 YiPet API 层的对比

| 维度 | YiPet | YiPot |
|------|-------|-------|
| 运行时 | Chrome Extension (MV3) | Tauri Desktop (WebView) |
| fetch 来源 | 浏览器原生 `fetch` | WebView `fetch`（与 Tauri HTTP plugin 兼容） |
| 认证方式 | `chrome.storage.local` JWT | 配置中的 API Token |
| SSE 超时 | 600s（10min） | 120s（2min，翻译对话更短） |
| RPC 端点 | `POST /` | `POST /`（完全一致） |
| 错误处理 | 开发模式日志 | 静默 + 降级 |
| 服务层文件数 | 6 | 2（translation + knowledge） |

**设计差异原因**：
- YiPet 是 Chrome 扩展，需要 `chrome.storage` 持久化 Token 和跨标签页通信
- YiPot 是桌面应用，Token 通过 Tauri Plugin Store 持久化，全局通过 `window.__yipot_api` 访问
- YiPet 的服务层更丰富（chat/session/knowledge/rag/bug），YiPot 当前仅需翻译和知识库

---

## 六、实施进度

| 子任务 | 内容 | 状态 |
|--------|------|------|
| API-01 | `client.ts` — fetch 封装 + RPC + SSE | ✅ |
| API-02 | `endpoints.ts` — 路径常量 | ✅ |
| API-03 | `types.ts` — 类型定义 | ✅ |
| API-04 | `services/translation.ts` — 翻译服务 | ✅ |
| API-05 | `services/knowledge.ts` — 知识库服务 | ✅ |
| API-06 | `init.ts` — 客户端初始化 | ✅ |
| API-07 | `hooks/useApi.ts` — React Hook | ✅ |