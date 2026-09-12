---
title: "RPC: data_service.query_documents 使用 query 参数导致后端静默忽略过滤条件"
tags:
- rpc
- parameter-contract
- data-service
- silent-failure
category: projects/yiai/bugs/api
created: 2026-09-05
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: domain/data/data_service.py, YiVad RequestHttp, YiPet ApiClient
reporter: Claude
environment: macOS / Python 3.10+
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-05)
frequency: intermittent
---

## Description

前端调用 `data_service.query_documents` 时，部分请求使用了参数名 `query` 而非契约规定的 `filter`。后端 `data_service.query_documents` 方法仅检查 `parameters.get("filter")`，对 `query` 参数静默忽略——不报错、不警告，直接返回未过滤的全量数据。

**影响范围：** YiVad 的 Issue 列表页和 Bug 列表页在特定过滤条件下返回了未过滤的全量数据，前端分页和排序逻辑基于全量数据运行，导致：
- 分页总数显示错误（显示全量数据的总页数）
- 排序在客户端执行而非服务端，性能下降
- 用户看到的过滤结果与实际数据不一致

## Steps to Reproduce

1. 调用 `POST /` with body:
   ```json
   {
     "module_name": "services.data.data_service",
     "method_name": "query_documents",
     "parameters": {
       "cname": "issues",
       "query": { "status": "in_progress" },
       "pageNum": 1,
       "pageSize": 20
     }
   }
   ```
2. 观察返回的 `data.items`——包含所有状态的 Issue，而非仅 `in_progress`
3. 使用正确参数名 `filter` 重新调用，返回结果正确过滤

## Expected Result

后端应对未知参数名返回 422 错误，或至少记录 WARNING 日志，提示调用方参数名不符合契约。

## Actual Result

后端静默忽略 `query` 参数，`filter` 取默认值 `{}`，返回未过滤的全量数据。HTTP 状态码 200，RPC 响应 `code: 0`——调用方完全无感知。

## Root Cause

`data_service.query_documents` 的参数提取逻辑仅检查 `filter` 键：

```python
# domain/data/data_service.py:142
filter_dict = parameters.get("filter", {})
```

调用方传入 `query` 时，`filter_dict` 始终为 `{}`，过滤条件被丢弃。未对未知参数键做任何校验或告警。

**根本原因：** RPC 信封协议缺乏参数 schema 校验层。`module_name` 和 `method_name` 有路由校验，但 `parameters` 内部键名无 schema 约束。

## Fix

### 短期修复（已实施）

在 `data_service.query_documents` 中添加参数名校验：

```python
# domain/data/data_service.py
ALLOWED_PARAMS = {"cname", "filter", "sort", "pageNum", "pageSize", "projection"}

def query_documents(self, parameters: dict) -> dict:
    unknown = set(parameters.keys()) - ALLOWED_PARAMS
    if unknown:
        logger.warning(f"query_documents: unknown parameters ignored: {unknown}")
    filter_dict = parameters.get("filter", {})
    # ...
```

### 长期方案（记录为技术债）

在 RPC 路由层添加参数 schema 校验中间件，每个 service method 声明其接受的参数名白名单，未知参数自动返回 422 错误。

## Verification

- 使用 `query` 参数调用 → 日志输出 WARNING，数据仍返回但不过滤
- 使用 `filter` 参数调用 → 正常过滤
- 使用其他未知参数（如 `where`）→ 同样 WARNING

## Prevention

- **契约层面：** 在 [API 规范](../specs/api.md) 中明确标注 "关键参数名契约" 表，所有调用方 MUST 遵守
- **代码层面：** 新增 RPC method 时，必须声明参数白名单
- **测试层面：** 添加契约测试：使用错误参数名调用 → 期望 422 或 WARNING 日志
- **流程层面：** Code Review 时检查前端 RPC 调用中的参数名是否与后端契约一致

## Related

- 跨项目协议表中的 "关键参数名称契约" 条目
- YiVad: `RequestHttp` 调用 `data_service.query_documents` 的所有位置
- YiPet: `ApiClient` 调用 `data_service.query_documents` 的所有位置

## 影响范围

- **影响模块**：domain/data/data_service.py, YiVad RequestHttp, YiPet ApiClient
- **涉及文件**：
- domain/data/data_service.py, YiVad RequestHttp, YiPet ApiClient
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
