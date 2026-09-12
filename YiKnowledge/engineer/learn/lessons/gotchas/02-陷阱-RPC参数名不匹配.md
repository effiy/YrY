---
title: RPC Parameter Name Mismatch — Silent Cross-Project Bugs
tags: [gotcha, rpc, cross-project, api, contract]
category: engineer/learn/lessons/gotchas
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers avoid the most common cross-project bug pattern: silent RPC parameter name mismatches between YiVad/YiPet and YiAi"
acceptance_criteria:
  - "Two concrete bug examples with root cause and fix"
  - "Prevention strategy documented"
  - "Cross-reference to all affected codebases"
related:
  - ./README.md
  - ../INDEX.md
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiAi/CLAUDE.md
  - ../../../../YiPet/CLAUDE.md
  - ../../../../projects/yivad/bugs/2026-08-21/data/protable-search-param-mismatch.md
  - ../../../build/cross-project-rpc-protocol.md
---

# RPC 参数名不匹配 —— 跨项目静默 Bug

> **同一个 Bug 模式在不同的领域反复出现。** 根本原因是前端和后端代码库之间缺少自动化的契约测试。

## 问题模式

YrY 中 YiVad 和 YiPet 通过统一的 RPC 信封与 YiAi 通信：

```json
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "menus", "filter": {}, "pageNum": 1 }
}
```

`parameters` 字典被原样传递为后端方法的 `**kwargs`。**关键问题**：如果参数名与后端期望的不匹配，这种不匹配是**完全静默**的——没有类型错误、没有 lint 警告、没有构建失败。后端要么静默忽略该参数（对于 `filter`/`query` 类问题），要么返回 HTTP 422（对于 Pydantic 模型要求的字段）。

### 为什么 TypeScript 和 Python 的类型系统都检测不到这个问题

根本原因是两端的技术栈差异：

- **前端（TypeScript）**：代码中使用 `query` 或 `path` 等字段名，TypeScript 只能检查前端的类型定义——它不知道后端 Pydantic 模型要求的是 `filter` 还是 `target_file`
- **后端（Python）**：Pydantic 模型定义了期望的字段名，但前端通过 RPC 信封发送的是一个自由格式的 JSON 对象——在到达 Pydantic 验证之前，参数名不匹配不会触发任何错误

**唯一的解决办法**：在协议文档中明确定义参数名契约，并在两端进行人工或自动化验证。

## Bug 1：`filter` 与 `query` 的混淆（2026-07-28）

### 发生了什么

YiPet 的 `SessionService.list()` 和 `SessionService.get()` 在 parameters 中发送 `query: {...}`。YiAi 的 `data/repository.py` 中 `_build_filter` 函数读取的是 `filter` 键，不是 `query`。`query` 键被静默忽略，后端返回了**所有**文档（或为空）而非过滤后的子集。

### 影响

- **严重程度**：高——列表和详情请求静默返回错误结果
- **用户可感知症状**：会话列表显示的是全部数据而非当前页面的会话；会话搜索功能完全不工作
- **影响范围**：YiPet 的所有会话管理功能

### 修复

将 `query` 改为 `filter`：

**受影响文件**：
- `YiPet/src/api/services/sessions.ts`：`SessionService.list()` 和 `SessionService.get()` 的参数键
- `YiPet/src/api/types.ts`：`QueryParams.query` 重命名为 `QueryParams.filter`，添加了 JSDoc 注释标注后端契约

```typescript
// 修复前（错误）
parameters: { cname: "sessions", query: { pageUrl: currentUrl } }

// 修复后（正确）
parameters: { cname: "sessions", filter: { pageUrl: currentUrl } }
```

## Bug 2：`target_file` 与 `path` 的混淆（2026-07-28）

### 发生了什么

YiVad 的 `fileService.readFile()` 和 `fileService.writeFile()` 在请求体中发送 `{ path }`。YiAi 的 `/read-file` 和 `/write-file` 端点使用 Pydantic 模型（`FileReadRequest`、`FileWriteRequest`），这些模型要求字段名为 `target_file`，不是 `path`。每次调用都返回 HTTP 422。

### 影响

- **严重程度**：高——所有文件读写操作完全失败
- **用户可感知症状**：无法读取任何知识文件、无法保存编辑后的内容
- **可检测性**：相比 Bug 1 更容易检测——HTTP 422 是可见的错误状态码。但根因不明显，因为 `path` 看起来是很自然的参数名

### 修复

将 `path` 改为 `target_file`：

**受影响文件**：
- `YiVad/src/api/modules/fileService.ts`：所有 `readFile()` 和 `writeFile()` 调用的参数键

```typescript
// 修复前（错误）
body: { path: "/engineer/build/rpc-protocol.md" }

// 修复后（正确）
body: { target_file: "/engineer/build/rpc-protocol.md" }
```

## 为什么这种模式反复发生

这不是个别工程师的失误，而是一个系统性的契约缺失：

1. **前后端使用不同语言**：TypeScript vs Python，各自的类型系统互不可见
2. **RPC 信封是动态类型的**：`parameters` 是一个自由格式的 JSON 对象，在到达后端方法之前没有结构验证（对于非 Pydantic 模型的参数）
3. **没有自动化契约测试**：没有测试验证前端的请求形状是否与后端的期望一致
4. **参数名看起来都很"自然"**：`query` 和 `filter` 都是合理的过滤参数名，`path` 和 `target_file` 都是合理的文件路径参数名。直觉不能替代协议定义

## 完整的参数名契约表

| 正确 | 错误 | 上下文 | 检查方式 |
|---|---|---|---|
| `filter` | `query` | `data_service.query_documents` 的过滤参数 | 检查 `YiAi/src/data/repository.py` 中 `_build_filter` 的键名 |
| `target_file` | `path` | `/read-file`、`/write-file` 端点的文件路径参数 | 检查 `YiAi/src/server/routes/files.py` 中 Pydantic 模型字段名 |
| `cname` | `collection_name` | `data_service` 的集合名称参数 | 检查 `YiAi/src/data/repository.py` 中 `query_documents` 的签名 |

## 预防措施

### 1. 实施前查阅协议文档

在添加新的 API 调用之前，查阅项目 CLAUDE.md 中的"关键参数名称契约"表。每个参数名都记录在那里。这是成本最低的预防措施——只需 30 秒即可避免数小时的调试。

### 2. 添加契约测试（推荐，尚未实施）

一个简单的测试即可在 CI 中捕获参数名回归：

```python
# 伪代码：跨项目契约测试
def test_rpc_parameter_names():
    # 测试前端请求形状是否匹配后端 Pydantic 模型
    frontend_call = {"module_name": "services.database.data_service",
                      "method_name": "query_documents",
                      "parameters": {"cname": "sessions", "filter": {}}}
    response = client.post("/", json=frontend_call)
    assert response.json()["code"] == 0  # filter 被正确识别
```

### 3. 每月跨项目契约对齐检查

建议建立每月 15 分钟的例行检查：
- 一名 YiVad 工程师和一名 YiAi 工程师共同审查协议表
- 检查是否有新的参数或变更的字段名
- 更新 CLAUDE.md 和本知识文档

### 4. 代码审查检查清单

在审查涉及 RPC 调用的 PR 时，明确检查：
- [ ] 所有 `query` 键是否应该是 `filter`？
- [ ] 所有 `path` 键是否应该是 `target_file`？
- [ ] 参数名是否与协议文档中的一致？

## 检测方法

| 类型 | 症状 | 检测方式 |
|---|---|---|
| `filter`/`query` 类 | 难检测——后端静默忽略未知键 | 查找意外的空结果或全表返回。在 YiVad/YiPet 的 Network 面板中检查请求 payload |
| `target_file`/`path` 类 | 较易检测——后端返回 422 | 检查 Network 面板中是否有 422 响应。在 YiAi 日志中搜索 "validation error" |

### 通用排查方法

当跨项目调用行为异常时，按以下顺序排查：

1. 在 Network 面板中检查请求 payload——参数名是否与协议一致？
2. 对照 CLAUDE.md 或本文档中的参数名契约表验证
3. 检查 YiAi 后端对应的 Pydantic 模型字段名
4. 检查 `_build_filter` 函数读取的键名（针对 `filter`/`query` 类问题）

## 跨项目影响

这个模式影响所有使用 RPC 信封的三个项目：

- **YiVad**: 18 个 API 模块，所有模块的 `filter`/`target_file`/`cname` 参数必须正确
- **YiPet**: 9 个 API 服务，SessionService 和 BugService 尤其容易出错
- **YiAi**: `data/repository.py` 和 `server/routes/files.py` 定义了参数名的"真理"