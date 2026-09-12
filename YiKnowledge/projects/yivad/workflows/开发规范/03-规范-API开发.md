---
title: API 开发
tags: [yivad, api, rpc, service-modules]
category: projects/yivad/workflows
created: 2026-09-11
updated: 2026-09-11
source: YiVad
type: conventions
status: active
---

# API 开发

> RPC 信封协议、服务模块规范、参数命名契约 —— 前后端通信的唯一方式。

## RPC 信封

所有 API 调用使用统一信封，通过 `RequestHttp` 发送：

```typescript
POST /
body: {
  module_name: "services.<domain>.<service>",
  method_name: "<method>",
  parameters: { ... }
}
// 响应: { code: 0, message: "ok", data: <any> }
```

## 参数命名契约

| 正确 | 错误 | 场景 |
|------|------|------|
| `filter` | `query` | 数据查询 |
| `target_file` | `path` | 文件读写 |
| `cname` | `collection_name` | 集合名称 |

**曾导致线上 bug** —— 后端静默忽略错误参数名。

## API 模块规范

```
src/api/modules/<domain>Service.ts
```

每个模块是一个领域服务函数集合：

```typescript
import { callService } from "@/api";

export async function queryDocuments(params: QueryParams) {
  return callService("services.database.data_service", "query_documents", params);
}
```

**规则：**
- 模块文件以 `Service` 后缀命名
- 每个函数封装一个 RPC 调用
- 请求/响应类型定义在 `src/api/interface/`
- API 模块不包含业务逻辑，仅做参数转发和类型定义