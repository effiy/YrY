---

doc_type: task
prd_task_id: "YP-09-113"
title: "YP-09-113: API 路径修正 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "113-基础设施-API路径修正.md"
tags: [api, rpc, compaction, relay]

type: task
---

# YP-09-113: API 路径修正 — 技术设计

> **版本**：v1.0 · **人天**：0.5d · **PRD**：[113-基础设施-API路径修正.md](../../prds/2026-09/113-基础设施-API路径修正.md)

---

## 1. 业务上下文

两处代码绕过了四层 API 架构，直接使用裸 `fetch` 或错误的基础 URL。需要修复以恢复 ApiClient 的认证头注入、RPC 信封解包、重试和错误处理能力。

**PRD**：[YP-09-113](../../prds/2026-09/113-基础设施-API路径修正.md)

## 2. 架构

### Compaction DI 重构

```mermaid
graph TD
    subgraph "修复前"
        A1[chatStore] -->|maybeCompact| B1[useConversationCompact]
        B1 -->|callCompactApi| C1["fetch('/') ❌"]
        C1 -->|无认证头| D1[当前页面 origin]
    end

    subgraph "修复后"
        A2[chatStore] -->|rpcCall 注入| B2[useConversationCompact]
        A2 -->|injectServices| E2[services.ts]
        E2 -->|_client| F2[ApiClient]
        B2 -->|callCompactApi + rpcCall| G2[getClient().rpc()]
        G2 -->|X-Token + RPC envelope| H2[YiAi :10086 ✅]
    end
```

### 新增接口

```typescript
// ConversationCompactDeps — 新增 rpcCall
export interface ConversationCompactDeps {
  activeConversation: Ref<SessionItem | null>;
  setActiveMessages: (msgs: Message[]) => void;
  persistActive: () => Promise<void> | void;
  rpcCall?: <T>(module: string, method: string, params?: Record<string, unknown>)
    => Promise<{ ok: boolean; data: T; error?: string }>;
}

// services.ts — 新增 client 引用 + getClient()
let _client: ApiClient | null = null;
export function getClient(): ApiClient | null { return _client; }
```

### Compaction 请求路径修复

```typescript
// 修复前: callCompactApi 使用裸 fetch
const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module_name: '...', method_name: '...', parameters }),
    signal,
});

// 修复后: 优先使用注入的 rpcCall
if (rpcCall) {
    const res = await rpcCall<{ messages?: Array<...> }>(
        'services.ai.chat_service', 'compactConversation', params
    );
}
```

## 3. 变更清单

### A. chat/composables/useConversationCompact.ts

| 行号 | 变更 | 说明 |
|------|------|------|
| 8-11 | `ConversationCompactDeps` 新增 `rpcCall` | 依赖注入接口 |
| 23-50 | `callCompactApi` 重构 | 优先走 `rpcCall` 参数 |
| 80 | `maybeCompact` 传递 `deps.rpcCall` | 连接依赖 |

### B. content/ipc/relay.ts

| 行号 | 变更 | 说明 |
|------|------|------|
| 132 | `apiBase` 从 `localhost:8848/api` → `localhost:10086` | 直接指向 YiAi |

### C. chat/stores/services.ts

| 行号 | 变更 | 说明 |
|------|------|------|
| 6-7 | 导入 `ApiClient` 类型 | — |
| 9 | 新增 `_client` 变量 | 存储 client 引用 |
| 30-34 | `injectServices` 签名补 `client: ApiClient` | 注入 client |
| 43 | `_client = services.client` | 存储引用 |
| 45 | 新增 `getClient()` 导出 | 暴露访问 |

### D. chat/stores/chat.ts

| 行号 | 变更 | 说明 |
|------|------|------|
| 19 | 导入 `getClient` | — |
| 238-246 | `useConversationCompact` deps 新增 `rpcCall` | 注入 RPC 函数 |
| 271-274 | `injectServices` 签名补 `client` | 类型完整 |

### E. chat/index.ts

| 行号 | 变更 | 说明 |
|------|------|------|
| 77 | `injectServices` 调用补 `client: api.client` | 传递 client |

## 4. 关键决策

| 决策 | 理由 |
|------|------|
| 注入 `rpcCall` 函数而非直接导入 ApiClient | 遵循现有 DI 模式，避免循环依赖，可测试性更好 |
| `rpcCall` 设为可选参数 | `callCompactApi` 仍可独立使用（降级到裸 fetch 的旧路径保留但不推荐） |
| `relay.ts` apiBase 直接改为 `10086` | 与 `chat/index.ts` 默认值一致，消除 YiVad 代理依赖 |
| 在 `services.ts` 暴露 `getClient()` | 最小必要接口——仅 `useConversationCompact` 一个调用点 |

## 5. 验证

```bash
npm run typecheck    # ✓ 零类型错误
npm test             # ✓ 138/138 测试通过
npm run build        # ✓ 4 入口构建成功
```

手工验证：
- [ ] 聊天窗口在非 localhost 页面正常连接 YiAi
- [ ] 长聊自动压缩正常触发（需 YiAi 后端运行）