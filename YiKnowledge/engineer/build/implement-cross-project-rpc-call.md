---
title: "Implement Cross-Project RPC Call"
aliases: [add-rpc-call, new-rpc-endpoint, cross-project-implementation]
tags: [rpc, implementation, guide, cross-project, build]
category: engineer/build
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Step-by-step guide for adding new RPC calls — prevent parameter-name bugs from the start"
acceptance_criteria:
  - "Backend implementation steps complete"
  - "YiVad frontend integration steps complete"
  - "YiPet frontend integration steps complete"
  - "Verification checklist included"
related:
  - ./cross-project-rpc-protocol.md
  - ../learn/lessons/gotchas/02-陷阱-RPC参数名不匹配.md
---

# 实施跨项目 RPC 调用

> 在 YrY 中添加新的跨项目 API 调用的完整实施指南。**适用场景**：需要从 YiVad 或 YiPet 调用 YiAi 的新功能。

## 实施总览

```
1. YiAi 后端：创建 Service 方法
2. YiAi 后端：在 __init__.py 中导出
3. YiVad 前端：创建 API 模块函数
4. YiPet 前端：创建 API 端点函数
5. 两端参数名交叉验证
6. 端到端测试
```

## 第一步：后端实现 Service 方法

在 `YiAi/src/services/<domain>/<service>.py` 中添加方法：

```python
# YiAi/src/services/database/data_service.py

async def query_documents(self, parameters: dict) -> StandardResponse:
    """查询文档（分页 + 过滤 + 排序 + 投影）。

    parameters:
        cname: str       — 集合名称（必需）
        filter: dict     — Mongo 过滤条件（可选，默认 {}）
        pageNum: int     — 页码（可选，默认 1）
        pageSize: int    — 每页条数（可选，默认 20）
        sortField: str   — 排序字段（可选）
        sortOrder: str   — 排序方向 asc/desc（可选，默认 desc）
        projection: dict — 字段投影（可选）
    """
    cname = parameters.get("cname")
    if not cname:
        return error(ErrorCode.PARAM_VALIDATION_FAILED, "cname is required")

    filter_query = parameters.get("filter") or {}
    page_num = parameters.get("pageNum", 1)
    page_size = parameters.get("pageSize", 20)

    # 从 repository 获取数据
    result = await self.repo.query_documents(
        cname=cname,
        filter_query=filter_query,
        page_num=page_num,
        page_size=page_size,
    )
    return success(result)
```

### 关键原则

- **从 `parameters` 字典中取值**，使用 `.get()` 提供默认值
- **参数名必须与 RPC 协议规范一致**（`filter` 不是 `query`，`cname` 不是 `collection_name`）
- **始终验证必填参数**，返回明确的错误信息
- **返回 `StandardResponse`**（`success()` / `error()`），不要返回裸字典

## 第二步：导出 Service 方法

确保方法在模块的 `__init__.py` 中可访问：

```python
# YiAi/src/services/database/__init__.py
from .data_service import DataService

# YiAi/src/services/database/data_service.py
class DataService:
    async def query_documents(self, parameters: dict): ...
    async def create_document(self, parameters: dict): ...

# 路由通过 module_name 动态导入：
# "services.database.data_service" → DataService().query_documents
```

RPC 分发器（`src/server/routes/` 的根路由）通过 `importlib` 动态加载 `module_name` 指向的模块，然后调用 `method_name` 指向的方法。

## 第三步：YiVad 前端集成

### 3.1 创建 API 模块函数

```typescript
// YiVad/src/api/modules/dataService.ts
import http from '@/api';

interface QueryParams {
  cname: string;
  filter?: Record<string, unknown>;
  pageNum?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  projection?: Record<string, number>;
}

interface PaginatedResponse<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export const queryDocuments = <T = Record<string, unknown>>(
  params: QueryParams,
) =>
  http.post<ApiResponse<PaginatedResponse<T>>>('', {
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: params,
  });

export const createDocument = (cname: string, document: Record<string, unknown>) =>
  http.post<ApiResponse<{ insertedId: string }>>('', {
    module_name: 'services.database.data_service',
    method_name: 'create_document',
    parameters: { cname, document },
  });

export const updateDocument = (
  cname: string,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
) =>
  http.post<ApiResponse<{ modifiedCount: number }>>('', {
    module_name: 'services.database.data_service',
    method_name: 'update_document',
    parameters: { cname, filter, update },
  });

export const deleteDocument = (cname: string, filter: Record<string, unknown>) =>
  http.post<ApiResponse<{ deletedCount: number }>>('', {
    module_name: 'services.database.data_service',
    method_name: 'delete_document',
    parameters: { cname, filter },
  });
```

### 3.2 在 View/Store 中使用

```typescript
// YiVad/src/views/project/index.vue
import { queryDocuments } from '@/api/modules/dataService';

const { tableData, loading, pagination, search } = useTable({
  requestApi: (params: { pageNum: number; pageSize: number }) =>
    queryDocuments<Project>({
      cname: 'projects',
      filter: searchFilter.value,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    }),
});
```

## 第四步：YiPet 前端集成

### 4.1 创建 API 端点函数

```typescript
// YiPet/src/api/endpoints/data.ts
import { apiClient } from '../client';

interface RpcRequest {
  module_name: string;
  method_name: string;
  parameters: Record<string, unknown>;
}

export const queryDocuments = <T = Record<string, unknown>>(
  cname: string,
  filter: Record<string, unknown> = {},
  pageNum = 1,
  pageSize = 20,
) =>
  apiClient.post<RpcResponse<PaginatedData<T>>>('/', {
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: { cname, filter, pageNum, pageSize },
  });

export const createDocument = (cname: string, document: Record<string, unknown>) =>
  apiClient.post<RpcResponse<{ insertedId: string }>>('/', {
    module_name: 'services.database.data_service',
    method_name: 'create_document',
    parameters: { cname, document },
  });
```

### 4.2 在 Service 层调用

```typescript
// YiPet/src/services/dataService.ts
import { queryDocuments } from '../api/endpoints/data';

export async function getProjects() {
  const response = await queryDocuments<Project>('projects', { status: 'active' });
  if (response.code !== 0) {
    throw new Error(response.message);
  }
  return response.data;
}
```

## 第五步：参数名交叉验证

> **这是最容易出错的环节。** 前后端必须使用完全相同的参数名。

验证方法：在前后端代码中逐字段比对：

| 检查项 | 后端取值 | 前端传值 | 一致？ |
|--------|---------|---------|--------|
| 集合名称 | `parameters.get("cname")` | `{ cname: "..." }` | ✓ |
| 过滤条件 | `parameters.get("filter")` | `{ filter: {...} }` | ✓ |
| 页码 | `parameters.get("pageNum")` | `{ pageNum: 1 }` | ✓ |
| 每页条数 | `parameters.get("pageSize")` | `{ pageSize: 20 }` | ✓ |

**常见错误**：
- 前端传 `{ query: {...} }`，后端取 `parameters.get("filter")` → 静默返回全量数据
- 前端传 `{ collection_name: "projects" }`，后端取 `parameters.get("cname")` → 参数验证失败

## 第六步：端到端测试

```bash
# 1. 用 curl 测试原始端点
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {
      "cname": "projects",
      "filter": {"status": "active"},
      "pageNum": 1,
      "pageSize": 5
    }
  }'

# 2. 验证响应格式
# {"code": 0, "message": "ok", "data": {"list": [...], "total": N}}

# 3. 在 YiVad 中启动前端，验证 UI
cd YiVad && pnpm dev

# 4. 测试错误情况
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {}}'
# 预期: {"code": 1001, "message": "cname is required", "data": null}
```

## 常见场景速查

### 场景 A：创建新集合的 CRUD

如果新集合只需要标准 CRUD，直接使用 `data_service`，无需新建 Service：

```typescript
// 前端直接调用
createDocument('new_collection', { name: 'test' });
queryDocuments('new_collection', { status: 'active' });
updateDocument('new_collection', { _id: '...' }, { $set: { name: 'updated' } });
deleteDocument('new_collection', { _id: '...' });
```

### 场景 B：需要自定义业务逻辑

当操作包含业务规则（如创建项目时自动创建默认模块），需要新建 Service：

```python
# YiAi/src/services/project/project_service.py
class ProjectService:
    async def create_project(self, parameters: dict) -> StandardResponse:
        # 1. 创建项目文档
        project = await self.repo.create_document("projects", parameters["document"])
        # 2. 自动创建默认模块
        await self.repo.create_document("modules", {
            "name": "默认模块",
            "project_id": project["insertedId"],
        })
        return success(project)
```

### 场景 C：文件读写

不走 RPC 信封，使用专用端点：

```typescript
// YiVad
import { readFile, writeFile } from '@/api/modules/fileService';

const content = await readFile('path/to/file.md');
await writeFile('path/to/file.md', '# New Content');
```

参数名必须是 `target_file`（不是 `path`）。

## 实施检查清单

完成后逐项确认：

- [ ] 后端 Service 方法参数名与 RPC 规范一致
- [ ] 方法在 `__init__.py` 中可访问
- [ ] 返回 `StandardResponse`（不是裸字典）
- [ ] YiVad API 模块函数中参数名与后端一致
- [ ] YiPet API 端点函数中参数名与后端一致
- [ ] curl 测试通过（正常情况 + 错误情况）
- [ ] 前端 UI 端到端验证通过
- [ ] 没有使用禁止的参数名（`query`, `path`, `collection_name` 等）

## 反模式

| 反模式 | 正确做法 |
|---|---|
| 后端和前端各自定义参数名，不沟通 | 以 RPC 协议规范文档为准，实施前确认参数名 |
| 直接在 View 组件中写 fetch 调用 | 所有 API 调用通过 `api/modules/` 封装 |
| 复制粘贴其他 API 函数但忘了改参数名 | 每次复制后对照检查清单验证参数名 |
| 不测试错误情况 | 至少测试：缺少必填参数、无效 module_name、无效 method_name |