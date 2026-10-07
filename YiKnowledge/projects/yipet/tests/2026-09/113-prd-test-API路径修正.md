---

doc_type: test
prd_test_id: "YP-09-113"
title: "YP-09-113: API 路径修正 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "113-基础设施-API路径修正.md"
tags: [api, rpc, compaction, relay, testing]

type: test
---

# YP-09-113: API 路径修正 — 测试方案

> **版本**：v1.0 · **PRD**：[113-基础设施-API路径修正.md](../../prds/2026-09/113-基础设施-API路径修正.md)

---

## 1. 测试策略

| 层级 | 方法 | 覆盖目标 |
|------|------|----------|
| 静态分析 | `vue-tsc --noEmit` | 零类型错误 |
| 代码审查 | grep | 确认无裸 `fetch` 调用 |
| API 路径验证 | 代码审查 | 确认 apiBase 值 |
| DI 完整性 | 代码审查 | 确认 rpcCall 注入链完整 |
| 回归测试 | Vitest 138 tests | 零回归 |

## 2. 测试用例

### TC-01: Compaction — 无裸 fetch 调用

```bash
grep -n "fetch(" src/chat/composables/useConversationCompact.ts
```

**预期**: 无 `fetch(` 调用（函数签名中的 `fetch` 参数名除外，需人工核实）

### TC-02: Compaction — rpcCall 注入链完整性

```
验证链路:
  chat/index.ts:
    store.injectServices({ client: api.client, ... })  ✅

  chat/stores/services.ts:
    injectServices({ client: ApiClient, ... }) → _client = services.client  ✅
    getClient() → _client  ✅

  chat/stores/chat.ts:
    useConversationCompact({ rpcCall: getClient().rpc, ... })  ✅

  useConversationCompact.ts:
    callCompactApi(messages, deps.rpcCall, signal)  ✅
```

### TC-03: relay.ts apiBase 值验证

```bash
grep "apiBase" src/content/ipc/relay.ts
```

**预期**: `chatEl.dataset.apiBase = 'http://localhost:10086'`

### TC-04: chat/index.ts apiBase 回退值验证

```bash
grep "API_BASE" src/chat/index.ts
```

**预期**: `const API_BASE = dataset.apiBase || 'http://localhost:10086'`

两个源（relay.ts 注入和 chat/index.ts 回退）现在一致。

### TC-05: Compaction — _callCompactApi 路径验证

```
前置: YiAi 后端未运行
步骤:
  1. 模拟长会话触发压缩
  2. 检查控制台是否有 fetch 到错误域名的请求

预期:
  - 请求发送到 http://localhost:10086/（非当前页面 origin）
  - 请求携带 RPC 信封格式的 body
  - 错误为连接拒绝（ECONNREFUSED）而非 404/CORS
```

### TC-06: getClient() 可用性

```typescript
// 代码审查验证
import { getClient } from '@/chat/stores/services';

// getClient 应在 injectServices 后返回非 null 值
```

### TC-07: 类型检查 — 所有新增接口类型安全

```bash
npm run typecheck
```

**预期**: 零错误。重点验证：
- `ConversationCompactDeps.rpcCall` 类型
- `injectServices` 签名含 `client: ApiClient`
- `getClient()` 返回类型 `ApiClient | null`

## 3. API 调用链验证矩阵

| 调用路径 | 修复前 | 修复后 | 状态 |
|----------|--------|--------|------|
| Compaction → YiAi | `fetch('/')` 到页面 origin | `getClient().rpc()` 到 localhost:10086 | ✅ |
| relay.ts → chat apiBase | `localhost:8848/api` | `localhost:10086` | ✅ |
| chat/index.ts default apiBase | `localhost:10086` | `localhost:10086` | ✅ |
| services.ts → client 暴露 | 不存在 | `getClient()` | ✅ |

## 4. 自动化验证

```
npm run typecheck    # ✓
npm test             # ✓ 138/138
npm run build        # ✓
```

## 5. 测试结果

```
=== 代码审查 ===
TC-01 无裸 fetch          ✓ (useConversationCompact.ts 中 0 个 fetch 调用)
TC-02 rpcCall 注入链      ✓ (5 节点完整)
TC-03 relay.ts apiBase     ✓ (localhost:10086)
TC-04 chat/index.ts 回退   ✓ (一致)
TC-06 getClient() 可用     ✓

=== 自动化 ===
vue-tsc    ✓ 零错误
vitest     ✓ 138/138
build      ✓
```