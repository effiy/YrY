---

doc_type: test
title: "YA-07-03: RPC 信封协议设计 — 统一跨项目通信契约 — 测试规格"
status: 待开始
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YA-07-03"
source_prds: ["03-需求-RPC信封协议"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-07-03: RPC 信封协议 — 统一跨项目通信契约 — 测试规格

> **文档职责**：本文档定义 RPC 信封协议的**怎么验证**（VERIFY），覆盖单一入口路由、错误码体系、响应信封、参数契约和白名单安全。

> 来源 PRD：[03-需求-RPC信封协议.md](../../prds/2026-07/03-需求-RPC信封协议.md)
> 来源 Dev：[03-prd-task-RPC信封协议.md](../../devs/2026-07/03-prd-task-RPC信封协议.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级，无外部依赖 | pytest | ErrorCode 枚举、RpcResponse 序列化、ErrorInfo 数据类 |
| L2 集成测试 | POST / 单一入口 + 真实 Service 调用 | pytest-asyncio + httpx | 动态路由、白名单校验、异常处理、响应信封一致性 |
| L3 跨项目 | YiVad + YiPet 前端适配验证 | 手动 + curl | RequestHttp/ApiClient 统一封装、参数名契约 |
| L4 性能 | 路由延迟测量 | pytest + time.perf_counter | importlib 首次 vs 缓存导入延迟 |

### 1.2 测试数据

```python
# tests/conftest.py 新增 fixtures

@pytest.fixture
def valid_rpc_request():
    """有效的 RPC 请求体。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {"cname": "menus", "filter": {}}
    }

@pytest.fixture
def rpc_request_no_params():
    """parameters 字段缺失的请求（应默认 {}）。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents"
    }

@pytest.fixture
def rpc_request_private_method():
    """尝试调用私有方法的请求。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "_internal_cleanup",
        "parameters": {}
    }

@pytest.fixture
def rpc_request_forbidden_module():
    """尝试调用非白名单模块的请求。"""
    return {
        "module_name": "os",
        "method_name": "system",
        "parameters": {"command": "ls"}
    }

@pytest.fixture
def rpc_request_nonexistent_module():
    """尝试调用不存在的模块。"""
    return {
        "module_name": "services.nonexistent.fake_service",
        "method_name": "do_something",
        "parameters": {}
    }

@pytest.fixture
def rpc_request_nonexistent_method():
    """尝试调用不存在的方法。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "this_method_does_not_exist",
        "parameters": {}
    }

@pytest.fixture
def rpc_request_wrong_param_name():
    """使用错误的参数名（应为 filter 而非 query）。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {"cname": "menus", "query": {}}  # 错误：应为 filter
    }

@pytest.fixture
def all_error_codes():
    """返回所有 ErrorCode 枚举值的列表。"""
    from shared.error_codes import ErrorCode
    return list(ErrorCode)

@pytest.fixture
async def test_rpc_client():
    """httpx AsyncClient for testing RPC endpoint."""
    from httpx import AsyncClient, ASGITransport
    from main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 ErrorCode 枚举与 RpcResponse 封装

---

#### TC-RPC-001: ErrorCode 枚举完整性

| 字段 | 内容 |
|------|------|
| **ID** | TC-RPC-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 遍历 `ErrorCode` 枚举的所有值<br/>2. 检查每个枚举值的 `code` 和 `message` |
| **预期结果** | - 12 个错误码完整定义：`OK(0)`, `PARAM_VALIDATION_ERROR(1001)`, `RESOURCE_NOT_FOUND(1002)`, `RESOURCE_ALREADY_EXISTS(1003)`, `AI_SERVICE_UNAVAILABLE(2001)`, `AI_INFERENCE_TIMEOUT(2002)`, `FILE_IO_ERROR(3001)`, `FILE_NOT_FOUND(3002)`, `AUTH_FAILED(4001)`, `PERMISSION_DENIED(4002)`, `DATABASE_ERROR(5001)`, `UNKNOWN_ERROR(9999)`<br/>- 每个错误码的 `code` 值唯一 |

---

#### TC-RPC-002: RpcResponse.ok() 序列化

| 字段 | 内容 |
|------|------|
| **ID** | TC-RPC-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `RpcResponse.ok(data={"list": [1, 2, 3]})`<br/>2. 序列化为 JSON |
| **预期结果** | - `{"code": 0, "message": "ok", "data": {"list": [1, 2, 3]}}`<br/>- `code` 为整数 0<br/>- `message` 为字符串 "ok" |

---

#### TC-RPC-003: RpcResponse.error() 序列化

| 字段 | 内容 |
|------|------|
| **ID** | TC-RPC-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `RpcResponse.error(ErrorCode.RESOURCE_NOT_FOUND, "Document not found")`<br/>2. 序列化为 JSON |
| **预期结果** | - `{"code": 1002, "message": "Document not found", "data": null}`<br/>- `code` 为整数 1002<br/>- `data` 为 null |

---

#### TC-RPC-004: datetime 序列化为 ISO 8601

| 字段 | 内容 |
|------|------|
| **ID** | TC-RPC-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. 创建包含 `datetime` 对象的响应数据<br/>2. 调用 `RpcResponse.ok(data={"created_at": datetime(2026, 9, 23, 10, 0, 0)})`<br/>3. 序列化为 JSON |
| **预期结果** | - `created_at` 序列化为 `"2026-09-23T10:00:00"` (ISO 8601)<br/>- 不是 `"2026-09-23 10:00:00"` (空格分隔)<br/>- JavaScript `new Date()` 可以正确解析 |

---

### 2.2 路由分发

---

#### TC-ROUTE-001: 正常 RPC 调用完整链路

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行，MongoDB 可用，menus 集合有数据 |
| **步骤** | 1. `POST /` body=`valid_rpc_request`<br/>2. 检查 HTTP 状态码<br/>3. 检查响应信封格式<br/>4. 检查 `data` 字段结构 |
| **预期结果** | - HTTP 200<br/>- `{"code": 0, "message": "ok", "data": {"list": [...], "pagination": {...}}}`<br/>- `data.list` 为数组<br/>- 日志包含 `RPC dispatch: module=services.database.data_service function=query_documents` |

---

#### TC-ROUTE-002: parameters 缺失时默认空对象

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. `POST /` body=`rpc_request_no_params` (缺少 `parameters` 字段)<br/>2. 检查响应 |
| **预期结果** | - HTTP 200<br/>- 方法以 `**{}` 调用<br/>- 不返回 1001 参数验证错误（parameters 本身不是必填） |

---

#### TC-ROUTE-003: 模块不在白名单中

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `module_allowlist` 不包含 `os` |
| **步骤** | 1. `POST /` body=`rpc_request_forbidden_module` |
| **预期结果** | - HTTP 200（业务错误统一返回 200）<br/>- `{"code": 4002, "message": "Execution forbidden: os:system", "data": null}`<br/>- 日志记录拒绝信息 |

---

#### TC-ROUTE-004: 私有方法被拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. `POST /` body=`rpc_request_private_method` |
| **预期结果** | - `{"code": 1001, "message": "Method '_internal_cleanup' is private", "data": null}`<br/>- `method_name.startswith("_")` 检查生效 |

---

#### TC-ROUTE-005: 模块不存在

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. `POST /` body=`rpc_request_nonexistent_module` |
| **预期结果** | - `{"code": 1002, "message": "Module 'services.nonexistent.fake_service' not found", "data": null}`<br/>- `importlib.import_module` 失败被正确捕获 |

---

#### TC-ROUTE-006: 方法不存在

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. `POST /` body=`rpc_request_nonexistent_method` |
| **预期结果** | - `{"code": 1002, "message": "Method 'this_method_does_not_exist' not found in module 'services.database.data_service'", "data": null}`<br/>- `getattr` 失败被正确捕获，不返回 500 和 traceback |

---

#### TC-ROUTE-007: JSON Body 格式错误

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-007 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. `POST /` body=`"invalid json string"` (非合法 JSON) |
| **预期结果** | - HTTP 400 或 422<br/>- 错误信息明确（非 500） |

---

#### TC-ROUTE-008: module_name 路径遍历防护

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-008 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. `POST /` body=`{module_name: "services.ai.chat_service.subprocess", ...}`<br/>2. `POST /` body=`{module_name: "services.ai.chat_service/../../os", ...}` |
| **预期结果** | - 精确匹配 + 前缀匹配后检查下一字符<br/>- `"services.ai.chat_service.subprocess"` 不被 `startswith("services.ai.chat_service")` 误放行<br/>- `module_name` 仅允许 `[a-zA-Z0-9_.]` 字符检测 |

---

#### TC-ROUTE-009: 所有已注册 Service 可通过 RPC 调用

| 字段 | 内容 |
|------|------|
| **ID** | TC-ROUTE-009 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. 遍历白名单中所有模块，对每个模块发送至少一个测试请求<br/>2. 检查每个响应 |
| **预期结果** | - 所有白名单模块返回 `{code: 0}` 或合理的业务错误<br/>- 无模块返回 `code: 1002` (模块/方法不存在)<br/>- 白名单与实际可用的 Service 完全匹配 |

---

### 2.3 参数名契约

---

#### TC-CONTRACT-001: 正确参数名 filter 生效

| 字段 | 内容 |
|------|------|
| **ID** | TC-CONTRACT-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. 使用正确参数名 `filter` 调用 `data_service.query_documents`<br/>2. 检查 MongoDB 查询是否按 filter 过滤 |
| **预期结果** | - 返回过滤后的文档列表<br/>- `filter` 参数被正确传递给 MongoDB 查询 |

---

#### TC-CONTRACT-002: 错误参数名 query 被 WARNING

| 字段 | 内容 |
|------|------|
| **ID** | TC-CONTRACT-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行 |
| **步骤** | 1. 使用错误参数名 `query` (应为 `filter`) 调用<br/>2. 检查日志 |
| **预期结果** | - WARNING 日志: "Unknown parameter 'query' in data_service.query_documents"<br/>- 请求不中断，返回所有文档（filter 为空）<br/>- 不返回 422 |

---

#### TC-CONTRACT-003: target_file vs path

| 字段 | 内容 |
|------|------|
| **ID** | TC-CONTRACT-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `POST /read-file` body=`{target_file: "CLAUDE.md"}` <br/>2. `POST /read-file` body=`{path: "CLAUDE.md"}` |
| **预期结果** | - `target_file` 请求正常返回文件内容<br/>- `path` 请求返回 422 (FastAPI 参数校验) |

---

#### TC-CONTRACT-004: cname vs collection_name

| 字段 | 内容 |
|------|------|
| **ID** | TC-CONTRACT-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 使用正确参数名 `cname` 调用<br/>2. 使用错误参数名 `collection_name` 调用 |
| **预期结果** | - `cname` 正常执行<br/>- `collection_name` 被静默忽略，WARNING 日志 |

---

### 2.4 错误码流转

---

#### TC-ERROR-001: BusinessException 到 RpcResponse 转换

| 字段 | 内容 |
|------|------|
| **ID** | TC-ERROR-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 在 Service 中 raise `BusinessException(ErrorCode.DATABASE_ERROR, "Mongo timeout")`<br/>2. 检查异常处理器输出 |
| **预期结果** | - 响应 `{"code": 5001, "message": "Mongo timeout", "data": null}`<br/>- HTTP 200 (业务错误不改变 HTTP 状态) |

---

#### TC-ERROR-002: 未捕获异常到 ErrorCode.UNKNOWN_ERROR

| 字段 | 内容 |
|------|------|
| **ID** | TC-ERROR-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 触发一个未被 `except` 捕获的 `RuntimeError`<br/>2. 检查响应 |
| **预期结果** | - `{"code": 9999, "message": "Internal server error", "data": null}`<br/>- 生产环境不暴露 traceback<br/>- 日志包含完整异常信息 |

---

#### TC-ERROR-003: 生产环境错误信息脱敏

| 字段 | 内容 |
|------|------|
| **ID** | TC-ERROR-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `ENV=production` |
| **步骤** | 1. 触发异常<br/>2. 检查响应 message 字段 |
| **预期结果** | - message 不包含文件路径 (`/path/to/server.py`)<br/>- message 不包含 traceback<br/>- message 不包含数据库连接字符串 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: importlib 缓存污染 — 热重载后使用旧代码

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 修改 Service 方法签名（新增必填参数）<br/>2. 不重启服务<br/>3. 用旧参数列表调用 |
| **预期结果** | - 开发环境下 `importlib.reload` 刷新模块缓存<br/>- 生产环境下 `sys.modules` 缓存行为正常<br/>- 参数不匹配时抛出可理解的错误 |

### TC-EDGE-002: 并发 RPC 调用 ContextVar 不串扰

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 `asyncio.gather` 同时发送 20 个不同 module_name 的 RPC 请求<br/>2. 检查每个请求的响应独立性 |
| **预期结果** | - 20 个请求全部正确路由<br/>- 不同请求不串扰（A 的响应不包含在 B 中）<br/>- 日志中每个请求的模块和方法正确 |

### TC-EDGE-003: 大请求体 (> 10MB) 拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送 body 超过 10MB 的 POST / 请求 |
| **预期结果** | - HTTP 413 Payload Too Large<br/>- 不尝试解析 body |

### TC-EDGE-004: parameters 为 JSON 字符串而非 dict

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `parse_parameters` 支持 dict 和 JSON 字符串 |
| **步骤** | 1. `POST /` body=`{parameters: '{"cname":"menus","filter":{}}'}` (JSON 字符串)<br/>2. 检查是否被正确解析为 dict |
| **预期结果** | - `parse_parameters` 将字符串解析为 dict<br/>- 方法以正确的 `**kwargs` 执行<br/>- 返回正常结果 |

### TC-EDGE-005: Content-Type 非 application/json

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. `POST /` header=`Content-Type: text/plain` body=`raw text` |
| **预期结果** | - HTTP 415 Unsupported Media Type<br/>- 或 HTTP 400 错误信息 |

### TC-EDGE-006: functools.partial 包装的异步方法

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | Service 方法使用 `functools.partial` 预绑定参数 |
| **步骤** | 1. 调用使用 `partial` 包装的方法<br/>2. 检查 `asyncio.iscoroutinefunction` 是否正确判断 |
| **预期结果** | - `partial` 对象被解包：`func = method.func if isinstance(method, partial) else method`<br/>- 异步方法被正确 `await`<br/>- 不报 `coroutine was never awaited` 警告 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 已有 REST 端点仍可独立访问

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 直接访问 `/read-file`, `/write-file`, `/health/live`（不使用 RPC 信封）<br/>2. 检查响应 |
| **预期结果** | - 已有 REST 端点不受 RPC 信封影响<br/>- 响应格式与之前一致 |

### TC-REG-002: POST / 端点在其他路径正常

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 访问不存在的路径 `POST /nonexistent`<br/>2. 检查响应 |
| **预期结果** | - HTTP 404<br/>- 不被 RPC 信封拦截 |

### TC-REG-003: 参数名契约在 CLAUDE.md 中一致

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 检查根 CLAUDE.md 中的参数名契约表<br/>2. 与实际代码中的参数名对照 |
| **预期结果** | - `filter` / `target_file` / `cname` / `session_key` / `rag_type` 契约一致 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-ErrorCode 枚举 | shared/error_codes.py | TC-RPC-001 | L1 |
| FR-RpcResponse 封装 | shared/response.py | TC-RPC-002~004 | L1 |
| FR-单一入口 + 动态路由 | rpc_router.py | TC-ROUTE-001~009 | L2 |
| FR-模块白名单 | rpc_router.py | TC-ROUTE-003, TC-ROUTE-008 | L2 |
| FR-方法安全校验 | rpc_router.py | TC-ROUTE-004 | L2 |
| FR-参数名契约 | 跨项目 | TC-CONTRACT-001~004 | L2 |
| FR-业务异常转换 | rpc_router.py + exceptions | TC-ERROR-001~003 | L1+L2 |
| FR-边缘场景 | rpc_router.py | TC-EDGE-001~006 | L2 |
| — | — | TC-REG-001~003 (回归) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 前端 RequestHttp/ApiClient 适配 | 前端的 RPC 封装测试属于 YiVad/YiPet 项目 | 在各前端项目的测试中覆盖 |
| RPC 契约编译时校验 | 当前仅为运行时 WARNING | 九月迭代 (YA-09-14) 补充 CI 契约测试 |
| 版本化协议支持 | 协议尚无 `version` 字段 | 后续迭代引入协议版本协商 |
| RPC 调用审计日志持久化 | 当前无持久化审计 | 在可观测性迭代中补充 |
| 方法自动发现 API (`/rpc/methods`) | 尚未实现 | 技术债务，P3 优先级 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [03-需求-RPC信封协议.md](../../prds/2026-07/03-需求-RPC信封协议.md) |
| 源 Dev Module | [03-prd-task-RPC信封协议.md](../../devs/2026-07/03-prd-task-RPC信封协议.md) |
| RPC 契约测试 (九月) | [../2026-09/14-prd-test-RPC契约测试.md](../2026-09/14-prd-test-RPC契约测试.md) |
| 模块执行沙箱测试 | [0005-prd-test-模块执行沙箱.md](./005-prd-test-模块执行沙箱.md) |
| 认证与授权测试 | [0006-prd-test-认证与授权系统.md](./006-prd-test-认证与授权系统.md) |
| 根 CLAUDE.md (参数名契约) | [../../../../../../CLAUDE.md](../../../../../../CLAUDE.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-07/03-需求-RPC信封协议.md`*