---
title: "API: ApiClient 绕过导致 RPC 参数名使用 query 而非 filter"
tags: [api-client, rpc-contract, parameter-name, architecture-violation, eslint, fetch-bypass]
category: projects/yipet/bugs/api
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
project: YiPet
module: src/api/client.ts, src/chat/controller.ts
reporter: Claude
environment: Chrome 130+ / macOS 15
affectedVersion: 1.2.0
fixedVersion: 1.2.1
frequency: always
execution_world: MAIN World
---

# API: ApiClient 绕过导致 RPC 参数名使用 query 而非 filter

## 现象

用户在聊天窗口中查看会话列表时，发现显示了所有用户的会话而非仅当前用户的会话。后端返回了全量数据，前端过滤条件完全失效。

**用户感知**：会话列表显示了不属于自己的会话，隐私泄露风险。

## 复现步骤

1. Chrome 中加载 YiPet 扩展，打开聊天窗口
2. 打开 DevTools → Network 面板
3. 切换到会话侧边栏，观察 `POST /` 请求
4. 请求体中的 `parameters` 包含 `query` 字段：

```json
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": {
    "cname": "sessions",
    "query": { "user_id": "xxx" },
    "pageSize": 100
  }
}
```

5. 响应返回**全量**会话数据（`filter` 被静默忽略，后端未报错）

## 预期行为

请求体参数名使用 `filter`（符合 RPC 契约），后端按用户过滤会话数据：

```json
{
  "parameters": {
    "cname": "sessions",
    "filter": { "user_id": "xxx" },
    "pageSize": 100
  }
}
```

## 实际行为

参数名使用了 `query`，后端 `_build_filter` 方法未识别该字段，静默忽略过滤条件，返回全量数据。

## 影响评估

| 维度 | 评估 |
|------|------|
| 用户影响 | **中** — 会话列表显示其他用户数据，隐私泄露 |
| 影响范围 | 所有使用 `query` 参数名的 API 调用 |
| 数据损失 | 无（数据未被修改，仅过滤失效） |
| 安全影响 | **中** — 会话数据跨用户泄露 |
| 架构影响 | **高** — 暴露了绕过 ApiClient 的架构违规模式 |

## 根因分析

### 直接原因

`controller.ts` 在快速原型开发阶段直接使用了 `fetch` 调用 YiAi 端点，后续归档时未重构为 `ApiClient` 调用。参数名使用了 `query`（非标准名称）而非 RPC 契约规定的 `filter`：

```typescript
// src/chat/controller.ts — 修复前
async loadSessions(): Promise<void> {
  const response = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": this.token || "",
    },
    body: JSON.stringify({
      module_name: "services.database.data_service",
      method_name: "query_documents",
      parameters: {
        cname: "sessions",
        query: { user_id: this.userId },  // ❌ 应为 filter
        pageSize: 100,
      },
    }),
  });
  const data = await response.json();
  this.setState({ sessions: data.data?.list || [] });
}
```

### 深层原因

1. **架构违规**：绕过了 4-Tier API 架构（Component → ChatController → ApiClient → fetch），直接从 ChatController 调用 `fetch`
2. **缺少编译时检查**：无 ESLint 规则禁止直接使用 `fetch` 调用 YiAi 端点
3. **缺少运行时校验**：`ApiClient` 的参数校验逻辑（`validateParams`）未被触发
4. **后端静默忽略**：YiAi 后端 `_build_filter` 方法对未知参数名静默忽略而非报错，导致问题隐蔽

### 失败链路

```
ChatController.loadSessions()
  → fetch(POST /, { parameters: { query: {...} } })
  → YiAi data_service.query_documents
  → _build_filter(params) → 查找 params.filter → undefined
  → 未找到 filter，跳过过滤 → 返回全量数据
  → 前端未校验返回数据是否过滤 → 直接展示
  → 用户看到其他用户的会话
```

### 为什么后端静默忽略

YiAi 的 `_build_filter` 方法在未找到 `filter` 参数时返回空对象 `{}`，MongoDB 查询 `find({})` 返回全量文档。这是设计行为（允许无过滤查询），但前端未意识到此行为，导致数据泄露。

## 修复方案

### 1. 重构为 ApiClient 调用

```typescript
// src/chat/controller.ts — 修复后
async loadSessions(): Promise<void> {
  const result = await this.api.data.queryDocuments<Session>({
    collection: "sessions",
    filter: { user_id: this.userId },  // ✅ 正确参数名
    pageSize: 100,
    orderBy: "updated_at",
    orderType: "desc",
  });
  this.setState({ sessions: result.list });
}
```

### 2. 添加 ESLint 规则禁止绕过 ApiClient

```javascript
// .eslintrc.js — 新增规则
rules: {
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['**/fetch'],
      message: '禁止直接使用 fetch 调用 YiAi 端点，请使用 ApiClient 四层封装',
    }],
  }],
  'no-restricted-syntax': ['error', {
    selector: 'CallExpression[callee.name="fetch"]',
    message: '禁止直接使用 fetch，请使用 ApiClient.request() 或 Service 方法',
  }],
}
```

### 3. ApiClient 添加参数名校验

```typescript
// src/api/client.ts — 新增方法
const KNOWN_PARAM_ALIASES: Record<string, string> = {
  "query": "filter",       // query → filter（常见错误）
  "path": "target_file",   // path → target_file（常见错误）
  "collection_name": "cname", // collection_name → cname
  "moduleName": "module_name", // 驼峰 → 蛇形
  "methodName": "method_name", // 驼峰 → 蛇形
};

function validateParams(
  moduleName: string,
  methodName: string,
  params: Record<string, unknown>
): void {
  const key = `${moduleName}.${methodName}`;

  for (const [param, correctParam] of Object.entries(KNOWN_PARAM_ALIASES)) {
    if (param in params) {
      console.error(
        `[ApiClient] 参数名错误: ${key} 中使用了 "${param}"，应为 "${correctParam}"。` +
        `后端已静默忽略此参数，过滤条件未生效。`
      );
    }
  }
}
```

### 4. 后端添加未识别参数警告

```python
# YiAi services/database/data_service.py — 建议修改
def _build_filter(params: dict) -> dict:
    """构建 MongoDB 查询过滤条件"""
    recognized = {"cname", "filter", "sort", "pageNum", "pageSize", "orderBy", "orderType", "fields", "excludeFields"}
    unknown = set(params.keys()) - recognized
    if unknown:
        logger.warning(f"data_service.query_documents 收到未识别参数: {unknown}，已忽略")
    return params.get("filter", {})
```

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| ESLint 规则 | `no-restricted-imports` + `no-restricted-syntax` | 双重防护：禁止导入 fetch + 禁止直接调用 |
| 参数校验时机 | 开发阶段 WARNING | 不阻塞生产环境，但开发阶段即可发现 |
| 后端策略 | 警告 + 继续执行 | 不破坏现有功能，逐步引导修复 |
| 重构范围 | 仅 `controller.ts` 中 1 处 | 使用 `grep -r "fetch.*buildYiAiUrl" src/` 确认仅此一处 |

## 时间线

| 时间 | 事件 |
|------|------|
| 2026-09-07 09:00 | 代码审查发现：`controller.ts` 中直接使用 `fetch` |
| 2026-09-07 09:30 | 确认影响：会话列表过滤失效，数据泄露 |
| 2026-09-07 10:00 | 定位根因：架构违规 + 参数名错误 + 后端静默忽略 |
| 2026-09-07 11:00 | 实现修复：重构为 ApiClient + ESLint 规则 + 参数校验 |
| 2026-09-07 12:00 | 验证通过：全仓库 `fetch` 调用仅 ApiClient 内部 |

## 验证方法

- [x] Network 面板中请求体参数名为 `filter`（非 `query`）
- [x] 会话列表按用户正确过滤
- [x] `grep -r "fetch.*10086" src/` 无匹配结果（除 `ApiClient` 内部）
- [x] ESLint 检查通过：`no-restricted-imports` 规则生效
- [x] 手动构造 `query` 参数 → 控制台输出 `[ApiClient] 参数名错误` 警告
- [x] 其他 API 调用（知识库、RAG、文件）均使用 ApiClient

## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | ESLint `no-restricted-imports` + `no-restricted-syntax` 禁止直接 `fetch` | DevOps |
| 代码 | `ApiClient.validateParams` 检测已知参数名错误并输出 WARNING | 开发者 |
| 后端 | YiAi `_build_filter` 对未识别参数输出 WARNING（记录为技术债 #YP-BE-002） | 后端 |
| 流程 | Code Review 时检查所有 API 调用是否通过 `ApiClient` | Reviewer |
| 文档 | 在 [API 规范](../specs/api.md) 中强调 "MUST use ApiClient" 规则 | 开发者 |
| 文档 | 在 [API 规范 #关键参数约定](../specs/api.md) 中记录常见参数名错误 | 开发者 |

## 相关资源

- PR：#144
- Commit：`171eda8`
- 后端技术债：YP-BE-002（YiAi `_build_filter` 添加未识别参数警告）
- 相关缺陷：无
- 参考：[API 规范 #关键参数约定](../specs/api.md)