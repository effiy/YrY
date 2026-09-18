---
title: TypeScript 类型规范
tags: [yipet, typescript, strict, type-organization, type-narrowing]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-15
source: YiPet
type: spec
roles: [engineer]
benefit: "strict 配置、IPC 判别联合类型、chrome.storage 类型安全封装"
status: active
---

# TypeScript 类型规范

> YiPet TypeScript 类型系统：strict 配置、类型文件组织、命名约定、IPC 判别联合、chrome.storage 类型封装、反模式。

## 一、配置

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["chrome"],
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

类型检查命令：`npm run typecheck`（`tsc --noEmit`），CI 质量门禁。

## 二、类型文件组织

| 用途 | 位置 | 说明 |
|------|------|------|
| 全局声明 | `src/types/globals.d.ts` | Window 扩展、CDN 库类型 |
| API 类型 | `src/api/types.ts` | RpcRequest, QueryResult, MutationResult, StreamChunk |
| Chat 类型 | `src/chat/types.ts` | ChatState, Message, Session |
| Popup 配置 | `src/popup/data.ts` | RoleDef, ColorOption, ModelOption |
| IPC 消息 | `src/shared/ipc/messages.ts` | PopupToContent 判别联合 |

**组织原则**：全局类型放 `src/types/`，领域类型放模块内就近定义，API 类型集中管理。

## 三、命名约定

| 后缀 | 用途 | 示例 |
|------|------|------|
| `Props` | 组件 Props | `ChatWindowProps`, `MessageBubbleProps` |
| `Params` | 请求参数 | `ChatParams`, `QueryParams` |
| `State` | 状态类型 | `ChatState` |
| `Options` | 配置选项 | `StreamOptions`, `RetryOptions` |

**接口 vs 类型别名**：接口用于对象形状（支持 extends），类型别名用于联合/交叉/映射类型。

## 四、IPC 判别联合（关键模式）

```typescript
// Popup → Content Script 消息（action 字段作为判别键）
type PopupToContent =
  | { action: 'ping' }
  | { action: 'setRole'; role: string }
  | { action: 'setVisibility'; visible: boolean }
  | { action: 'toggleChat' }
  // ...

// switch 收窄（exhaustiveness check）
function handleMessage(msg: PopupToContent) {
  switch (msg.action) {
    case 'ping': /* msg 收窄为 { action: 'ping' } */ break;
    case 'setRole': /* msg.role 有完整 string 类型 */ break;
    // default: const _: never = msg; // 确保所有 action 已覆盖
  }
}
```

## 五、chrome.storage 类型封装

```typescript
interface StorageSchema {
  role: string; color: string; model: string;
  petVisible: boolean; language: string;
  sessions: Session[]; currentSessionId: string;
  knowledgeGrounded: boolean; ragScope: string;
  promptHistory: string[]; chatVisible: boolean;
}

async function getStorage<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]>
async function setStorage<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void>
```

## 六、API 类型体系

| 类型 | 用途 |
|------|------|
| `RpcRequest` | `{ module_name, method_name, parameters }` |
| `QueryResult<T>` | 兼容 `list`/`documents`/`result` 多种后端格式 |
| `MutationResult` | `{ key?, updated?, deleted? }` |
| `ApiResponse<T>` | `{ ok, status, data, error? }` — 不抛异常 |
| `StreamChunk<T>` | `{ done, data?, error? }` |

## 七、反模式

| 反模式 | 正确做法 | 原因 |
|--------|----------|------|
| `any` | `unknown` + 类型收窄 | 关闭类型检查 |
| `as` 断言 | 类型收窄 | 绕过检查 |
| 跨世界类型不匹配 | 统一定义 IPC 消息类型 | 运行时错误 |
| 不声明 Window 扩展 | `globals.d.ts` 中扩展 | 编译错误 |
| 枚举用于简单字符串 | `type Role = "cat" \| "dog"` | 减少生成代码 |

## 八、约束

**必须遵守**：strict 模式、`tsc --noEmit` 通过、所有 API 请求/响应明确类型、IPC 消息类型统一定义、chrome.storage 键值对 `StorageSchema` 约束。

**禁止**：`any`（除非注释说明）、`as` 断言绕过检查、未声明的 Window 扩展、未在 `StorageSchema` 中声明的 storage 键。