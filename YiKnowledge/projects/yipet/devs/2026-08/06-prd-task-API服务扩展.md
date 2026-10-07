---

doc_type: module
prd_task_id: "YP-08-07"
title: "YP-08-07: API 服务扩展 — KnowledgeService / RagService / BugService / SessionService 扩展 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 2.0
source_prd: "06-基础设施-API服务扩展.md"
source_okr: [yipet-002]

type: task
---

# YP-08-07: API 服务扩展 — 开发方案

> 来源 PRD：[06-基础设施-API服务扩展.md](../../prds/2026-08/06-基础设施-API服务扩展.md)
> 需求编号：YP-08-07 · 优先级：P1 · 人天：2.0d

---

## 一、方案概述

将 4-Tier API 层从 4 个基础 Service 扩展至 8 个，覆盖知识库浏览、RAG 检索、Bug 报告、会话分支、通知管理等新功能。所有 Service 遵循统一的 4-Tier 架构模式：`Component → Store → Service → ApiClient → fetch`。

### 1.1 扩展前后对比

```
扩展前（七月）:                    扩展后（八月）:
┌──────────────────┐              ┌──────────────────────────┐
│ ChatService      │              │ ChatService              │
│ SessionService   │              │ SessionService (+branch) │
│ DataService      │              │ DataService              │
│ FileService      │              │ FileService              │
│                  │              │ KnowledgeService  ← NEW  │
│                  │              │ RagService        ← NEW  │
│                  │              │ BugService        ← NEW  │
│                  │              │ NotificationService←NEW  │
└──────────────────┘              └──────────────────────────┘
```

### 1.2 Service 架构约定

每个 Service 必须：
1. **构造函数接受 ApiClient 实例**（依赖注入，非单例 import）
2. **所有 HTTP 调用经 `this.apiClient.call(moduleName, methodName, parameters)`**
3. **参数名遵循 RPC 契约**（`filter`/`target_file`/`cname`，非 `query`/`path`/`collection_name`）
4. **错误统一经 ApiClient 处理**（不各自 try-catch 吞没）

```typescript
// 标准 Service 模板
export class BaseService {
  constructor(protected apiClient: ApiClient) {}

  protected async call<T>(moduleName: string, methodName: string, parameters: Record<string, any>): Promise<T> {
    const res = await this.apiClient.call(moduleName, methodName, parameters);
    if (res.code !== 0) {
      throw new ServiceError(res.code, res.message);
    }
    return res.data as T;
  }
}
```

---

## 二、模块设计

### 2.1 KnowledgeService

```typescript
// src/api/services/knowledgeService.ts
export class KnowledgeService extends BaseService {
  // 获取知识库目录树，可选按 role 过滤
  async getTree(role?: string): Promise<KnowledgeTreeNode> {
    return this.call("services.ai.knowledge_service", "get_tree", { role });
  }

  // 读取单个知识文件（含 frontmatter 元数据）
  async getFile(target_file: string): Promise<KnowledgeFile | null> {
    try {
      return await this.call("services.ai.knowledge_service", "get_file", { target_file });
    } catch (e) {
      if (e instanceof ServiceError && e.code === 1002) return null;
      throw e;
    }
  }

  // 写入知识文件（Bug 报告双写路径）
  async writeFile(target_file: string, content: string): Promise<void> {
    await this.call("services.ai.knowledge_service", "write_file", { target_file, content });
  }
}
```

**RPC 方法映射**：
| 方法 | RPC module_name | RPC method_name | 关键参数 |
|------|----------------|-----------------|----------|
| getTree | `services.ai.knowledge_service` | `get_tree` | `role?` |
| getFile | `services.ai.knowledge_service` | `get_file` | `target_file` |
| writeFile | `services.ai.knowledge_service` | `write_file` | `target_file`, `content` |

### 2.2 RagService

```typescript
// src/api/services/ragService.ts
export class RagService extends BaseService {
  async search(query: string, scope?: RagScope): Promise<RagSearchResult> {
    return this.call("services.ai.rag_service", "search", { query, scope });
  }

  async previewSources(scope: RagScope): Promise<SourcePreview> {
    return this.call("services.ai.rag_service", "preview_sources", { scope });
  }

  async decompose(question: string): Promise<DecomposeResult> {
    return this.call("services.ai.rag_service", "decompose", { question });
  }

  async rebuildIndex(): Promise<void> {
    await this.call("services.ai.rag_service", "rebuild_index", {});
  }

  async getStatus(): Promise<RagStatus> {
    return this.call("services.ai.rag_service", "get_status", {});
  }
}
```

### 2.3 BugService

```typescript
// src/api/services/bugService.ts
export class BugService extends BaseService {
  async submit(data: BugReportData): Promise<{ key: string }> {
    this.validateBugReport(data);
    // 1. MongoDB bugs 集合
    const result = await this.call<{ key: string }>(
      "services.database.data_service", "create_document",
      {
        cname: "bugs",
        document: { ...data, status: "open", createdAt: Date.now() },
      }
    );
    // 2. YiKnowledge 双写
    const bugMd = this.formatBugMarkdown(data);
    await this.apiClient.call(
      "services.ai.knowledge_service", "write_file",
      {
        target_file: `projects/${data.project.toLowerCase()}/bugs/${result.key}-bug.md`,
        content: bugMd,
      }
    );
    return result;
  }

  async list(filter: Record<string, any>): Promise<{ documents: BugDocument[] }> {
    return this.call("services.database.data_service", "query_documents", {
      cname: "bugs",
      filter,
    });
  }

  private validateBugReport(data: BugReportData): void {
    if (!data.title?.trim()) throw new ServiceError(1001, "title is required");
    if (!data.description?.trim()) throw new ServiceError(1001, "description is required");
    if (!["P0", "P1", "P2", "P3"].includes(data.severity)) throw new ServiceError(1001, "invalid severity");
  }
}
```

### 2.4 SessionService 扩展（分支 + 导出）

```typescript
// src/api/services/sessionService.ts 追加
export class SessionService extends BaseService {
  // ... 已有方法 ...

  async branchFromMessage(sessionKey: string, messageIndex: number): Promise<SessionDocument> {
    return this.call("services.ai.session_service", "branch", {
      session_key: sessionKey,
      message_index: messageIndex,
    });
  }

  async exportSession(sessionKey: string, format: "markdown" | "json"): Promise<string> {
    return this.call("services.ai.session_service", "export", {
      session_key: sessionKey,
      format,
    });
  }
}
```

---

## 三、Service 注册与依赖注入

```typescript
// src/api/index.ts — 统一 Service 注册
import { ApiClient } from "./client";
import { ChatService } from "./services/chatService";
import { SessionService } from "./services/sessionService";
import { DataService } from "./services/dataService";
import { FileService } from "./services/fileService";
import { KnowledgeService } from "./services/knowledgeService";
import { RagService } from "./services/ragService";
import { BugService } from "./services/bugService";
import { NotificationService } from "./services/notificationService";

const apiClient = new ApiClient(import.meta.env.RSBUILD_API_BASE || "http://localhost:10086");

export const chatService = new ChatService(apiClient);
export const sessionService = new SessionService(apiClient);
export const dataService = new DataService(apiClient);
export const fileService = new FileService(apiClient);
export const knowledgeService = new KnowledgeService(apiClient);
export const ragService = new RagService(apiClient);
export const bugService = new BugService(apiClient);
export const notificationService = new NotificationService(apiClient);
```

---

## 四、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | BaseService 提取 + ServiceError 类 | `baseService.ts` | 所有 Service 继承 BaseService | 0.25 |
| 2 | KnowledgeService + getTree/getFile/writeFile | `knowledgeService.ts` | `getTree()` 返回目录树 | 0.5 |
| 3 | RagService + search/preview/decompose/rebuild | `ragService.ts` | `search("q", scope)` 返回结果 | 0.5 |
| 4 | BugService + submit(list 双写)/list | `bugService.ts` | `submit()` → MongoDB + YiKnowledge | 0.5 |
| 5 | SessionService 扩展 (branch/export) | `sessionService.ts` | `branchFromMessage()` 创建分支 | 0.25 |
| 6 | 集成 + 回归测试 | `tests/` | 全量通过 | 0.5 |

**合计：2.5d**（估时从 2.0 调整为 2.5，BugService 双写逻辑超出预期）

---

## 五、边缘场景

| 场景 | 处理 |
|------|------|
| Service 调用时 ApiClient 未初始化 | BaseService 构造函数检查 apiClient 非 null |
| YiAi 返回非 0 code | BaseService.call → throw ServiceError(code, message) |
| Bug 提交双写一半失败 | MongoDB 写入成功但 YiKnowledge 失败 → rollback MongoDB |
| RAG 检索超时 | RagService.search 设置 10s 超时 → throw timeout error |
| KnowledgeService getFile 目标不存在 | 返回 null（不抛异常） |
| 并发调用同一 Service | ApiClient 无状态，天然支持并发 |

---

## 六、RPC 参数名契约检查

```bash
# 上线前必检
grep -r '"query"' src/api/services/       # 必须零匹配
grep -r '"path"' src/api/services/        # 文件操作上下文必须零匹配
grep -r 'collection_name' src/api/        # 必须零匹配
grep -r 'fetch(' src/ --include="*.vue"   # 组件层必须零匹配
```

---

## 七、完成定义

- [ ] 4 个新 Service 按 §2 设计落地
- [ ] 所有 Service 构造函数接受 ApiClient 实例（依赖注入）
- [ ] 所有 HTTP 调用经 `this.apiClient.call()`
- [ ] `grep -r '"query"' src/api/services/` 零匹配
- [ ] `grep -r 'fetch(' src/ --include="*.vue"` 零匹配
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过