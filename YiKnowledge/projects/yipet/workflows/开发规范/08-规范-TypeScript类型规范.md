---
title: TypeScript 类型规范
tags: [yipet, typescript, strict, type-organization, generics, type-narrowing]
category: projects/yipet/specs
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: spec
status: active
---

# TypeScript 类型规范

> YiPet TypeScript 类型系统完整规范：strict 模式配置、类型文件组织、命名约定、泛型模式、类型收窄、跨世界类型安全、chrome.storage 类型封装、常见反模式。

## 一、TypeScript 配置

### tsconfig.json 核心配置

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["chrome"],
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `strict` | `true` | 启用所有严格类型检查 |
| `types` | `["chrome"]` | 引入 `@types/chrome` 全局类型 |
| `noUnusedLocals` | `true` | 禁止未使用的局部变量 |
| `noUnusedParameters` | `true` | 禁止未使用的函数参数 |
| `noEmit` | `true` | 仅类型检查，不生成输出（Rsbuild 负责构建） |

### 类型检查命令

```bash
npm run typecheck    # tsc --noEmit，CI 质量门禁
```

---

## 二、类型文件组织

### 文件位置

| 类型用途 | 文件位置 | 说明 |
|----------|----------|------|
| 全局类型声明 | `src/types/globals.d.ts` | 全局模块声明、Window 扩展、CDN 库类型 |
| API 类型 | `src/api/types.ts` | RpcRequest、QueryResult、MutationResult、ChatParams、StreamChunk |
| Chat 类型 | `src/chat/types.ts` | ChatState、Message、Session、Conversation |
| Popup 类型 | `src/popup/data.ts` | RoleDef、ColorOption、ModelOption 配置类型 |
| Content Script 类型 | `src/content/` 各模块内 | 页面上下文、IPC 消息、CDN 资源类型 |
| Shared 类型 | `src/shared/` 各模块内 | 存储键值类型、i18n 类型、工具函数类型 |

### 组织原则

- **全局类型**放 `src/types/`：跨模块共享的类型声明
- **领域类型**放模块内：与模块强相关的类型就近定义（如 `src/chat/types.ts`）
- **API 类型**集中管理：所有 RPC 请求/响应类型在 `src/api/types.ts`
- **配置类型**与数据放一起：`src/popup/data.ts` 中角色/颜色定义含类型

---

## 三、类型命名规范

### 基础命名模式

| 后缀 | 用途 | 示例 |
|------|------|------|
| `Props` | 组件 Props 类型 | `ChatWindowProps`、`MessageBubbleProps` |
| `Params` | 请求参数类型 | `ChatParams`、`QueryParams` |
| `Data` | 响应数据类型 | `QueryResult<T>`、`SessionData` |
| `State` | 状态类型 | `ChatState`、`PopupState` |
| `Options` | 配置选项类型 | `StreamOptions`、`RetryOptions` |
| `Event` | 事件类型 | `StreamChunk`、`IpcMessageEvent` |

### 接口 vs 类型别名

```typescript
// 接口：用于对象形状定义，支持 extends
interface Message {
  id: string;
  role: "user" | "pet" | "system";
  content: string;
  timestamp: number;
}

// 类型别名：用于联合类型、交叉类型、映射类型
type MessageRole = "user" | "pet" | "system";
type ChatMode = "normal" | "rag" | "agent";
type Listener = () => void;
```

### 泛型命名

```typescript
// 单字母泛型仅在简单场景使用
function identity<T>(value: T): T { return value; }

// 有意义的泛型名用于复杂场景
interface QueryResult<TItem> {
  list?: TItem[];
  total?: number;
  pageNum?: number;
  pageSize?: number;
  totalPages?: number;
}

// 多个泛型参数
interface ApiResponse<TData> {
  ok: boolean;
  status: number;
  data: TData;
  error?: string;
}
```

---

## 四、API 类型体系

### RPC 协议类型

```typescript
// src/api/types.ts — 实际定义
interface RpcRequest {
  module_name: string;
  method_name: string;
  parameters: Record<string, unknown>;
}

interface QueryResult<T = unknown> {
  list?: T[];
  documents?: T[];
  result?: T[];
  total?: number;
  pageNum?: number;
  pageSize?: number;
  totalPages?: number;
}

interface MutationResult {
  key?: string;
  query?: Record<string, unknown>;
  updated?: boolean;
  deleted?: boolean;
}
```

### SSE 流式类型

```typescript
// src/api/client.ts — StreamChunk
interface StreamChunk<T = unknown> {
  done: boolean;      // true = 流结束
  data?: T;           // 流数据（done=false 时）
  error?: string;     // 错误消息（done=true 时）
}
```

### CRUD 参数类型

```typescript
interface QueryParams {
  cname: string;                          // 集合名称
  filter?: Record<string, unknown>;       // MongoDB 查询过滤器
  sort?: Record<string, number>;          // 排序
  pageNum?: number;                       // 页码（1-indexed）
  pageSize?: number;                      // 每页大小
  projection?: Record<string, number>;    // 字段投影
}

interface CreateParams {
  cname: string;
  data: Record<string, unknown>;
}

interface UpdateParams {
  cname: string;
  key: string;
  data: Record<string, unknown>;
}

interface DeleteParams {
  cname: string;
  key: string;
}
```

---

## 五、状态类型

### ChatState（核心状态类型）

```typescript
// src/chat/types.ts
interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  streamingType: "" | "send" | "regenerate" | "resend";
  streamingPhase: "" | "thinking" | "retrieving" | "streaming";

  sessions: Session[];
  currentSessionId: string | null;
  title: string;

  knowledgeGrounded: boolean;
  ragScope: string;
  ragScopeIsFile: boolean;
  ragSources: RagSource[];

  pageInfo: PageInfo;
  contextEnabled: boolean;
  contextEditorDraft: string;

  sidebarCollapsed: boolean;
  sidebarView: "sessions" | "knowledge" | "stories" | "bugs";
  chatVisible: boolean;
}

interface Message {
  id: string;
  role: "user" | "pet" | "system";
  content: string;
  timestamp: number;
  model?: string;
  sources?: RagSource[];
  toolCalls?: ToolCall[];
  error?: string;
  aborted?: boolean;
}

interface Session {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}
```

### chrome.storage 类型封装

```typescript
// src/shared/storage.ts
interface StorageSchema {
  token: string;
  role: string;
  color: string;
  model: string;
  petVisible: boolean;
  language: string;
  sessions: Session[];
  currentSessionId: string;
  knowledgeGrounded: boolean;
  ragScope: string;
  promptHistory: string[];
  petPosition: PetPosition;
  sidebarWidth: number;
  chatVisible: boolean;
}

// 类型安全的存储读写
async function getStorage<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

async function setStorage<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}
```

---

## 六、跨世界类型安全

### IPC 消息类型（Popup → Content Script）

```typescript
// src/shared/ipc/messages.ts — Popup → Content Script 消息
// 使用 action 字段作为判别键（discriminated union）

export type PopupToContent =
  | { action: 'ping' }
  | { action: 'toggleVisibility' }
  | { action: 'setVisibility'; visible: boolean }
  | { action: 'changeSize'; size: number }
  | { action: 'setRole'; role: string }
  | { action: 'setColor'; color: number }
  | { action: 'toggleChat' }
  | { action: 'extensionUpdated'; previousVersion: string; currentVersion: string }
  | { action: 'extensionUpdatePending' };

// Content Script → Popup 响应
export type ContentToPopup =
  | { success: true; visible?: boolean; size?: number; role?: string }
  | { success: false };
```

### IPC 安全事件（ISOLATED → MAIN World）

```typescript
// content/ipc/relay.ts — dispatchSecureEvent 安全事件
// 通过 CustomEvent + IPC_SECRET 签名跨世界传递

const IPC_SECRET = crypto.randomUUID();  // 每次扩展启动重新生成

interface SecureEventDetail<T> {
  __yipet: boolean;        // 来源标记
  __signature: string;     // IPC_SECRET 签名
  __timestamp: number;     // 时间戳（5 秒过期防重放）
  data: T;                 // 实际载荷
}

function dispatchSecureEvent<T>(name: string, detail: T): void {
  window.dispatchEvent(new CustomEvent(name, {
    detail: {
      __yipet: true,
      __signature: IPC_SECRET,
      __timestamp: Date.now(),
      data: detail,
    },
  }));
}

// 安全事件名称（CustomEvent type）
type SecureEventName =
  | 'yipet:visibilityChanged'   // { visible: boolean }
  | 'yipet:chatToggled';        // {}
```

### 类型收窄（Discriminated Union）

```typescript
// 根据 action 字段收窄消息类型（chrome.runtime.onMessage 监听器）
import type { PopupToContent } from '@/shared/ipc/messages';

function handlePopupMessage(msg: PopupToContent, sendResponse: (r: ContentToPopup) => void): boolean {
  switch (msg.action) {
    case 'ping':
      // msg 类型收窄为 { action: 'ping' }
      sendResponse({ success: true, visible: true, size: 120, role: 'Teacher' });
      break;
    case 'setRole':
      // msg 类型收窄为 { action: 'setRole'; role: string }
      // msg.role 有完整的 string 类型
      applyRole(msg.role);
      sendResponse({ success: true });
      break;
    case 'setVisibility':
      // msg 类型收窄为 { action: 'setVisibility'; visible: boolean }
      applyVisibility(msg.visible);
      sendResponse({ success: true, visible: msg.visible });
      break;
    case 'toggleChat':
      // msg 类型收窄为 { action: 'toggleChat' }
      dispatchSecureEvent('yipet:chatToggled', {});
      sendResponse({ success: true });
      break;
    default:
      // exhaustiveness check — 所有 action 已覆盖
      const _exhaustive: never = msg;
      sendResponse({ success: false });
  }
  return true;  // 保持消息通道开放（异步响应）
}

// 在 MAIN World 侧验证安全事件
window.addEventListener('yipet:visibilityChanged', ((e: CustomEvent) => {
  const { __yipet, __signature, __timestamp, data } = e.detail || {};
  // 1. 验证来源标记
  if (!__yipet) return;
  // 2. 验证签名
  if (__signature !== IPC_SECRET) return;
  // 3. 验证时间戳（5 秒过期）
  if (Date.now() - __timestamp > 5000) return;
  // data 类型收窄为 { visible: boolean }
  updateVisibility(data.visible);
}) as EventListener);
```

---

## 七、Service 类型模式

### 构造函数注入 + 工厂函数

```typescript
// src/api/services/index.ts — 实际定义
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

### Service 类模式

```typescript
// src/api/services/database.ts — 实际实现
const DB_MODULE = 'services.database.data_service';

class DatabaseService {
  constructor(private client: ApiClient) {}

  async query(params: Partial<QueryParams>): Promise<ApiResponse<QueryResult>> {
    return this.client.rpc<QueryResult>(DB_MODULE, 'query_documents', params as Record<string, unknown>);
  }

  async create(params: Partial<CreateParams>): Promise<ApiResponse<MutationResult>> {
    return this.client.rpc<MutationResult>(DB_MODULE, 'create_document', params as Record<string, unknown>);
  }
}
```

**关键点**：
- 所有 Service 通过构造函数注入 `ApiClient`，不直接使用 `fetch`
- RPC 调用使用 `this.client.rpc<T>(module, method, params)` 模式
- 返回 `ApiResponse<T>`，调用方通过 `ok` 字段判断成功/失败
- 模块名使用常量（如 `DB_MODULE`），避免硬编码字符串

---

## 九、工具类型

### 常用泛型工具

```typescript
// 使特定字段可选
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 使特定字段必填
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 非空断言类型（用于 filter 后收窄）
function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// 提取 Promise 泛型
type Awaited<T> = T extends Promise<infer U> ? U : T;
```

---

## 十、CDN 全局类型声明

```typescript
// src/types/globals.d.ts
declare global {
  interface Window {
    __YIPET_LOADED__?: boolean;
    __YIPET_CHAT_STORE__?: ReturnType<typeof useChatStore>;
  }
}

// CDN 注入的第三方库类型声明
declare module "*.css" {
  const content: string;
  export default content;
}
```

---

## 十一、反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 使用 `any` | `function process(data: any)` | `function process<T extends Record<string, unknown>>(data: T)` | 失去类型安全 |
| 类型断言过度 | `(data as any).list` | 定义正确的泛型类型 | 运行时类型错误 |
| 跨世界类型不匹配 | ISOLATED 和 MAIN 用不同接口定义同一消息 | 在 `src/types/` 中统一定义 IPC 消息类型 | 类型不一致导致运行时错误 |
| 忽略 chrome API 回调类型 | `chrome.storage.local.get("key", (result) => {...})` | 使用 Promisified 封装 + 泛型 | 回调参数无类型 |
| 不声明 Window 扩展 | `window.__YIPET_LOADED__ = true` 无类型声明 | 在 `globals.d.ts` 中扩展 Window 接口 | 编译错误 |
| 枚举 vs 联合类型混用 | 简单字符串常量使用 `enum` | 使用 `type Role = "cat" \| "dog"` | 减少生成代码 |

---

## 十二、约束

### 必须遵守
- TypeScript strict 模式，`tsc --noEmit` 必须通过
- 所有 API 请求/响应定义明确类型
- IPC 消息类型在 `src/types/` 中统一定义
- chrome.storage 键值对使用 `StorageSchema` 类型约束
- 组件 Props 使用泛型形式：`defineProps<{ ... }>()`
- 错误类型使用类层次而非字符串枚举

### 禁止
- 不使用 `any` 类型（除非有充分理由并注释说明）
- 不在跨世界通信中使用 `unknown` 载荷（应使用明确类型）
- 不导出未使用的类型
- 不使用 `as` 类型断言绕过类型检查
- 不在 `chrome.storage` 中存储未在 `StorageSchema` 中声明的键