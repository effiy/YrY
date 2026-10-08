---

doc_type: test
title: "YA-09-30: API 版本管理策略 — URL 路径版本控制与向后兼容协议 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-30"
source_prds: ["34-需求-API版本管理"]
source_modules: []
source_okr: [yiai-002]

type: test
---

# YA-09-30: API 版本管理策略 — 测试规格

> **文档职责**：本文档定义 API 版本管理模块的**怎么验证**（VERIFY），覆盖版本路由、废弃参数管理、版本协商和渐进迁移。

> 来源 PRD：[34-需求-API版本管理.md](../../prds/2026-09/34-需求-API版本管理.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 版本路由表、DeprecatedParam 声明、版本枚举 | pytest | ApiVersion 枚举、路由注册、参数映射 |
| L2 集成 | FastAPI 端点 + 不同版本 RPC 请求 | pytest + httpx | v1/v2 路由分发、参数兼容、废弃告警 |
| L3 手动回归 | 前端 YiVad/YiPet 版本声明兼容性 | 手动 + curl | 部署不同步场景、前端版本升级验证 |

### 1.2 测试数据

```python
# tests/versioning/conftest.py

from enum import Enum

class ApiVersion(str, Enum):
    V1 = "v1"
    V2 = "v2"

# 废弃参数声明
DEPRECATED_PARAMS = {
    "services.database.data_service.query_documents": {
        "v1": {"query": "filter", "collection_name": "cname"},
        "v2": {},
    },
    "services.file.file_service.write_file": {
        "v1": {"path": "target_file"},
        "v2": {},
    },
}

@pytest.fixture
def v1_request():
    """v1 版本 RPC 请求（使用新的参数名 + 可能含废弃名）。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "version": "v1",
        "parameters": {"cname": "projects", "filter": {}}
    }

@pytest.fixture
def v1_request_with_deprecated():
    """v1 版本——故意使用废弃参数名。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "version": "v1",
        "parameters": {"collection_name": "projects", "query": {"status": "active"}}
    }

@pytest.fixture
def v2_request():
    """v2 版本 RPC 请求（仅新参数名）。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "version": "v2",
        "parameters": {"cname": "projects", "filter": {}}
    }

@pytest.fixture
def v2_request_with_deprecated():
    """v2 版本——使用废弃参数名（应拒绝）。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "version": "v2",
        "parameters": {"query": {"status": "active"}}
    }

@pytest.fixture
def no_version_request():
    """无 version 字段的请求——应默认 v1。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {"cname": "projects", "filter": {}}
    }
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 版本路由

---

#### TC-VER-001: 无 version 字段默认使用 v1

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `no_version_request` fixture |
| **步骤** | 1. 发送 RPC 请求（不含 `version` 字段）<br/>2. 检查路由到哪个版本处理器<br/>3. 检查日志 |
| **预期结果** | - 使用 v1 处理器<br/>- INFO 日志: "No version specified, defaulting to v1"<br/>- 响应正常返回 |

---

#### TC-VER-002: v1 版本参数兼容——废弃参数自动映射

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `v1_request_with_deprecated` fixture |
| **步骤** | 1. 发送 v1 请求使用 `query` 和 `collection_name`<br/>2. 检查实际调用的参数<br/>3. 检查日志中的警告 |
| **预期结果** | - 请求正常处理<br/>- `query` 自动映射为 `filter`<br/>- `collection_name` 自动映射为 `cname`<br/>- WARNING 日志: "v1: deprecated param 'query', use 'filter' instead" |

---

#### TC-VER-003: v2 版本拒绝废弃参数

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `v2_request_with_deprecated` fixture |
| **步骤** | 1. 发送 v2 请求使用 `query` 参数<br/>2. 检查响应 |
| **预期结果** | - HTTP 400 返回<br/>- 响应: `{code: 1001, message: "v2: unknown parameter 'query'. Did you mean 'filter'?"}`<br/>- `data` 为 null |

---

#### TC-VER-004: 相同端点 v1/v2 路由到不同处理器

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `RPC_VERSION_HANDLERS` 中 v1 和 v2 注册了不同的处理函数 |
| **步骤** | 1. 从路由表获取 v1 和 v2 的处理函数<br/>2. 对比两者的 id |
| **预期结果** | - v1 和 v2 处理器是不同的函数对象<br/>- 两者各自注册到正确的路由键 |

---

#### TC-VER-005: 端点不存在于指定版本时应降级

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 端点仅在 v1 中定义，v2 中不存在 |
| **步骤** | 1. 对一个仅在 v1 中定义的端点使用 `version: "v2"`<br/>2. 发送请求 |
| **预期结果** | - 回退到 v1 处理器<br/>- WARNING 日志: "Endpoint not found in v2, falling back to v1" |

---

### 2.2 废弃参数管理

---

#### TC-VER-006: 所有已知废弃参数有正确映射

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-006 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `DEPRECATED_PARAMS` 字典 |
| **步骤** | 1. 遍历 `DEPRECATED_PARAMS`<br/>2. 验证每个废弃参数的映射目标存在<br/>3. 验证没有循环映射 |
| **预期结果** | - 所有废弃参数映射到有效的新参数名<br/>- 无 `query -> filter -> query` 循环<br/>- 覆盖 `query->filter`, `path->target_file`, `collection_name->cname` |

---

#### TC-VER-007: v1 同时传入新旧参数——优先使用新参数

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-007 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 请求同时包含 `filter` 和 `query` |
| **步骤** | 1. 构造请求: `parameters: {cname: "p", filter: {a:1}, query: {b:2}}`<br/>2. 发送 v1 版本请求 |
| **预期结果** | - 使用 `filter` (新参数) 的值<br/>- 忽略 `query` (废弃参数) 的值<br/>- WARNING: "v1: deprecated param 'query' ignored (new param 'filter' present)" |

---

### 2.3 版本生命周期与迁移

---

#### TC-VER-008: 版本列表 API 返回可用版本

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-008 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 存在 `/api/versions` 端点 |
| **步骤** | 1. GET `/api/versions`<br/>2. 验证响应 |
| **预期结果** | - 返回支持的版本列表: `["v1", "v2"]`<br/>- 包含 `current_stable` 字段: `"v1"`<br/>- 包含 `preview` 字段: `"v2"` |

---

#### TC-VER-009: v1 永久兼容——不包含破坏性变更

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-009 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 所有现有前端使用 v1（无 version 字段） |
| **步骤** | 1. 运行完整 YiVad 测试套件（默认无 version 字段）<br/>2. 运行完整 YiPet 测试套件 |
| **预期结果** | - 所有 YiVad API 调用成功<br/>- 所有 YiPet API 调用成功<br/>- 无 v1 相关 WARNING（使用正确参数名时） |

---

#### TC-VER-010: v2 Preview 状态正确标记

| 字段 | 内容 |
|------|------|
| **ID** | TC-VER-010 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **前提** | `ApiVersion` 枚举包含 `status` 属性 |
| **步骤** | 1. 检查 v1.status<br/>2. 检查 v2.status |
| **预期结果** | - v1 status 为 `"stable"`<br/>- v2 status 为 `"preview"`<br/>- v1 永远不会被移除 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 无效的 version 值处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送 `version: "v999"` 的请求 |
| **预期结果** | - HTTP 400: `{code: 1001, message: "Unknown API version 'v999'. Available: v1, v2"}` |

### TC-EDGE-002: 所有参数都是废弃参数时仍能处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. v1 请求: `parameters: {query: {}, collection_name: "p"}`（全部废弃参数）<br/>2. 发送请求 |
| **预期结果** | - v1: 全部映射为新参数名，正常处理<br/>- v2: 返回错误，提示所有可用参数名 |

### TC-EDGE-003: version 字段大小写不敏感

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 传入 `version: "V1"` (大写)<br/>2. 传入 `version: "V2"` (大写) |
| **预期结果** | - 两种都正确路由<br/>- 日志记录规范化后的版本名 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 现有前端（无 version 字段）全部正常工作

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 运行 YiVad 全部 API 测试（不传 version 字段）<br/>2. 运行 YiPet 全部 API 测试 |
| **预期结果** | - 100% 测试通过<br/>- 无 4xx 错误<br/>- 默认 v1 路由行为与改造前一致 |

### TC-REG-002: 废弃参数 WARNING 不导致响应异常

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. v1 版本使用所有已知废弃参数名<br/>2. 验证 HTTP 状态码仍为 200 |
| **预期结果** | - HTTP 200，响应正确<br/>- 日志有 WARNING（但不影响功能） |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-版本字段解析 | 路由层 | TC-VER-001, TC-VER-005 | L2 |
| FR-v1 向后兼容 | 版本处理器 | TC-VER-002, TC-VER-009 | L2 |
| FR-v2 拒绝废弃参数 | 版本处理器 | TC-VER-003~004 | L1+L2 |
| FR-废弃参数管理 | DeprecatedParam | TC-VER-006~007 | L1+L2 |
| FR-版本 API | 端点 | TC-VER-008 | L2 |
| FR-版本生命周期 | ApiVersion | TC-VER-010 | L1 |
| FR-容错 | 异常处理 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 前端 YiVad/YiPet 版本升级 | 需跨仓库修改 | 在跨项目桥接测试中补充 |
| v1 参数映射性能开销 | 映射为 O(n) 字典查找 | 在性能剖析测试中补充 |
| v2 稳定后的 v1 废弃公告 | 需真实环境通知前端团队 | 上线前手动通知 + 监控 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [34-需求-API版本管理.md](../../prds/2026-09/34-需求-API版本管理.md) |
| RPC 契约测试 | [../2026-09/0014-prd-test-RPC契约测试与类型同步.md](../2026-09/014-prd-test-RPC契约测试与类型同步.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/34-需求-API版本管理.md`*