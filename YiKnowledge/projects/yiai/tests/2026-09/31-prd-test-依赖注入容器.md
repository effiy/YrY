---

doc_type: test
title: "YA-09-27: 服务依赖注入容器 — 基于 FastAPI Depends 的模块解耦方案 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-27"
source_prds: ["31-需求-依赖注入容器"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-27: 服务依赖注入容器 — 测试规格

> **文档职责**：本文档定义 DI 容器模块的**怎么验证**（VERIFY），覆盖依赖注册、依赖解析、生命周期管理、循环依赖检测和模块替换。

> 来源 PRD：[31-需求-依赖注入容器.md](../../prds/2026-09/31-需求-依赖注入容器.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | DI 容器纯函数/类级，无外部依赖 | pytest | 注册表操作、接口绑定、循环检测算法、生命周期工厂 |
| L2 集成测试 | FastAPI Depends 集成 + 真实 Service 替换 | pytest + httpx | 端点注入、Scoped 生命周期、请求级解析 |
| L3 手动回归 | 真实 RPC 请求 + 检查服务启动 | 手动 + curl | 启动时依赖校验、Singleton 实例一致性 |

### 1.2 测试数据

```python
# tests/test_di/conftest.py

from abc import ABC, abstractmethod
from dataclasses import dataclass

# ----- 接口定义 -----
class IDatabase(ABC):
    @abstractmethod
    async def query(self, cname: str, filter: dict) -> list: ...

class IEmbedder(ABC):
    @abstractmethod
    async def embed(self, text: str) -> list[float]: ...

class IChatSession(ABC):
    @abstractmethod
    def get_messages(self) -> list: ...

# ----- 真实实现 -----
class MongoDatabase(IDatabase):
    async def query(self, cname: str, filter: dict) -> list:
        return [{"id": 1, "name": "test"}]

class OllamaEmbedder(IEmbedder):
    async def embed(self, text: str) -> list[float]:
        return [0.1, 0.2, 0.3]

# ----- Mock 实现 -----
class MockDatabase(IDatabase):
    def __init__(self):
        self.query_calls = []
    async def query(self, cname: str, filter: dict) -> list:
        self.query_calls.append((cname, filter))
        return [{"mock": True}]

class MockEmbedder(IEmbedder):
    async def embed(self, text: str) -> list[float]:
        return [0.0] * 768


@pytest.fixture
def empty_container():
    """返回一个空的 DI 容器实例。"""
    from domain.di import DIContainer
    return DIContainer()

@pytest.fixture
def populated_container():
    """返回预注册了 3 个接口的容器。"""
    from domain.di import DIContainer, Lifecycle
    c = DIContainer()
    c.register(IDatabase, MongoDatabase, Lifecycle.SINGLETON)
    c.register(IEmbedder, OllamaEmbedder, Lifecycle.SINGLETON)
    c.register(IChatSession, "tests.test_di.conftest.StubChatSession", Lifecycle.TRANSIENT)
    return c

@pytest.fixture
def container_with_mocks():
    """返回用 Mock 替换真实实现的容器。"""
    from domain.di import DIContainer, Lifecycle
    c = DIContainer()
    c.register(IDatabase, MockDatabase, Lifecycle.SINGLETON)
    c.register(IEmbedder, MockEmbedder, Lifecycle.SINGLETON)
    return c
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 依赖注册

---

#### TC-DI-001: 接口→实现绑定注册成功

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `empty_container` fixture |
| **步骤** | 1. 调用 `container.register(IDatabase, MongoDatabase, Lifecycle.SINGLETON)`<br/>2. 检查 `_registry` 字典<br/>3. 验证注册信息完整性 |
| **预期结果** | - `_registry[IDatabase]` 存在<br/>- `impl` 指向 `MongoDatabase` 类<br/>- `lifecycle` 值为 `Lifecycle.SINGLETON`<br/>- `instance` 为 `None`（尚未实例化） |

---

#### TC-DI-002: 重复注册覆盖行为

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 容器已注册 `IDatabase → MongoDatabase` |
| **步骤** | 1. 再次调用 `container.register(IDatabase, MockDatabase, Lifecycle.SINGLETON)`<br/>2. 覆盖已有的 `IDatabase` 注册 |
| **预期结果** | - 旧注册被覆盖<br/>- WARNING 日志: "Overriding existing registration for interface IDatabase"<br/>- 新解析返回 `MockDatabase` 实例<br/>- 旧 Singleton 实例被丢弃 |

---

#### TC-DI-003: 注册不实现接口的类应抛出异常

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `empty_container` fixture，存在一个不实现 `IDatabase` 的普通类 |
| **步骤** | 1. 定义一个 `class NotADatabase: pass`<br/>2. 调用 `container.register(IDatabase, NotADatabase, Lifecycle.SINGLETON)` |
| **预期结果** | - 抛出 `TypeError`： "NotADatabase does not implement IDatabase"<br/>- 容器状态不变 |

---

### 2.2 依赖解析与生命周期

---

#### TC-DI-004: Singleton 生命周期——多次解析返回同一实例

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `populated_container` fixture（IDatabase 为 Singleton） |
| **步骤** | 1. 调用 `container.resolve(IDatabase)` 获取实例 A<br/>2. 再次调用 `container.resolve(IDatabase)` 获取实例 B<br/>3. 对比 `id(A)` 与 `id(B)` |
| **预期结果** | - `A is B` 为 `True`<br/>- 实例仅创建一次<br/>- `_registry[IDatabase].instance` 非 None |

---

#### TC-DI-005: Transient 生命周期——每次解析创建新实例

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `populated_container` fixture（IChatSession 为 Transient） |
| **步骤** | 1. 调用 `container.resolve(IChatSession)` 获取实例 A<br/>2. 再次调用 `container.resolve(IChatSession)` 获取实例 B<br/>3. 对比 `id(A)` 与 `id(B)` |
| **预期结果** | - `A is not B` 为 `True`<br/>- 每次解析都创建新实例<br/>- Transient 实例不缓存在 `_registry` 中 |

---

#### TC-DI-006: Scoped 生命周期——同一请求内复用实例

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | FastAPI 端点使用 `Depends(get_db)` 注入 Scoped 实例 |
| **步骤** | 1. 在同一个 HTTP 请求中多次调用 `get_db`<br/>2. 验证两次获取的实例是否为同一个 |
| **预期结果** | - 同一请求内返回同一实例<br/>- 不同请求返回不同实例<br/>- 请求结束时 Scoped 实例被释放 |

---

#### TC-DI-007: 解析未注册的接口抛出异常

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-007 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `empty_container` fixture，接口 `IUnknownService` 未注册 |
| **步骤** | 1. 调用 `container.resolve(IUnknownService)` |
| **预期结果** | - 抛出 `KeyError`: "No implementation registered for IUnknownService"<br/>- 错误信息包含所有已注册接口列表 |

---

### 2.3 循环依赖检测

---

#### TC-DI-008: 启动时检测简单循环依赖 (A→B→A)

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-008 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 注册 ServiceA 依赖 ServiceB，ServiceB 依赖 ServiceA |
| **步骤** | 1. 注册 `IServiceA → ServiceA(IServiceB)`<br/>2. 注册 `IServiceB → ServiceB(IServiceA)`<br/>3. 调用 `container.validate()` |
| **预期结果** | - 启动时检测到循环: `ServiceA → ServiceB → ServiceA`<br/>- 抛出 `CircularDependencyError`<br/>- 错误信息包含完整循环路径 |

---

#### TC-DI-009: 无循环依赖的合法依赖图通过校验

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-009 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `populated_container` fixture（所有注册无循环依赖） |
| **步骤** | 1. 调用 `container.validate()` |
| **预期结果** | - 校验通过，无异常<br/>- 日志: "Dependency graph validated: 0 circular dependencies found" |

---

### 2.4 FastAPI Depends 集成

---

#### TC-DI-010: RPC 端点通过 Depends 注入 Service

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-010 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | FastAPI app 已注册 DI 容器，端点使用 `Depends` |
| **步骤** | 1. 发送 RPC 请求到 `services.rag.rag_service.rag_query`<br/>2. 验证端点正确注入了 `RagService` 实例<br/>3. 检查 `RagService` 内部的 `IEmbedder` 是 Singleton |
| **预期结果** | - RPC 请求正常处理<br/>- `RagService` 实例正确注入<br/>- 多次请求共享同一个 `IEmbedder` 实例 |

---

#### TC-DI-011: 测试中使用 container.register Mock 替换真实实现

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-011 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `container_with_mocks` fixture（MockDatabase + MockEmbedder） |
| **步骤** | 1. 在测试中解析 `IDatabase`<br/>2. 调用 `query("test_collection", {"name": "x"})`<br/>3. 验证返回 Mock 数据<br/>4. 检查 `query_calls` 记录 |
| **预期结果** | - 返回 `[{"mock": True}]`<br/>- `query_calls` 包含完整的调用参数<br/>- 无真实 MongoDB 连接 |

---

### 2.5 模块解耦验证

---

#### TC-DI-012: 模块重命名仅需修改注册处

| 字段 | 内容 |
|------|------|
| **ID** | TC-DI-012 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | `RagService` 通过 DI 获取 `IEmbedder`，而非 `import` |
| **步骤** | 1. 将 `OllamaEmbedder` 从 `domain/rag/embedder.py` 移动到 `domain/rag/core.py`<br/>2. 仅修改 `container.register(IEmbedder, new_path, ...)`<br/>3. 运行所有测试 |
| **预期结果** | - 仅 1 处代码变更（注册处）<br/>- 所有 `resolve(IEmbedder)` 调用无需修改<br/>- 全部测试通过 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 容器未初始化时调用 resolve

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 创建容器但不调用任何 `register`<br/>2. 直接调用 `container.resolve(IDatabase)` |
| **预期结果** | - 抛出 `RuntimeError`: "Container not initialized, no registrations found"<br/>- 列出已知接口列表（空） |

### TC-EDGE-002: Singleton 实例初始化失败时的重试行为

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 注册一个构造函数会抛出异常的 Singleton<br/>2. 第一次调用 `resolve()` 抛出 `InitializationError`<br/>3. 修复构造函数后再次调用 `resolve()` |
| **预期结果** | - 第一次: `InitializationError` 被抛出，`instance` 仍为 `None`<br/>- 第二次: 正常创建实例（不缓存失败结果）|

### TC-EDGE-003: Singleton 实例在测试间不共享（状态隔离）

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. Test A: 注册 `IDatabase → MockDatabase` Singleton<br/>2. Test B: 注册 `IDatabase → AnotherMock` Singleton<br/>3. 验证两个测试的容器状态隔离 |
| **预期结果** | - 每个测试有独立的容器实例<br/>- Test A 不受 Test B 的注册影响<br/>- 全局 Singleton 在测试间不泄漏 |

### TC-EDGE-004: 大量注册的性能测试（100 个接口）

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 注册 100 个随机接口到容器<br/>2. 测量 `validate()` 的执行时间<br/>3. 测量 `resolve()` 的平均延迟 |
| **预期结果** | - `validate()` < 10ms（100 个节点）<br/>- `resolve()` < 1ms（Singleton 缓存命中）<br/>- `resolve()` < 5ms（Transient 新建） |

### TC-EDGE-005: 字符串类路径引用（延迟 import）

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 用字符串 `"domain.rag.engine.RagEngine"` 注册实现<br/>2. 调用 `container.resolve()` 触发延迟 import |
| **预期结果** | - 延迟 import 正确加载类<br/>- 无效路径抛出 `ImportError`<br/>- 字符串引用在首次 `resolve()` 时才 import |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 现有 RPC 端点功能不受影响

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 运行全部现有 76 个测试<br/>2. 验证 DI 容器引入后无退化 |
| **预期结果** | - 全部 76 个测试通过<br/>- RPC 响应格式不变<br/>- `resolver_id` 正确记录 Originator ID |

### TC-REG-002: 原有 import 方式仍可用（渐进迁移）

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 保留 `direct_import` 方式的 Service<br/>2. 新增 DI 方式的 Service<br/>3. 两者同时运行 |
| **预期结果** | - 新旧方式不冲突<br/>- 不强制所有模块立即迁移到 DI |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-依赖绑定 | 注册器 | TC-DI-001~003 | L1 |
| FR-Singleton 生命周期 | 解析器 | TC-DI-004 | L1+L2 |
| FR-Transient 生命周期 | 解析器 | TC-DI-005 | L1 |
| FR-Scoped 生命周期 | FastAPI 集成 | TC-DI-006 | L2 |
| FR-解析失败提示 | 解析器 | TC-DI-007 | L1 |
| FR-循环依赖检测 | 校验器 | TC-DI-008~009 | L1 |
| FR-FastAPI Depends 集成 | 端点层 | TC-DI-010~011 | L2 |
| FR-模块解耦验证 | 端到端 | TC-DI-012 | L1 |
| FR-边界处理 | 容器 | TC-EDGE-001~005 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| FastAPI `Depends()` 缓存机制 | 需完整 FastAPI app 运行 | 在 API 网关测试中补充 |
| 高并发下 Singleton 线程安全 | Python GIL 保护单线程，但需验证 | 使用 `threading` 并发测试 |
| `dependency-injector` 兼容性 | 明确未采用，不需要 | — |
| Scoped 请求结束时资源释放 | 需 FastAPI `lifespan` 事件 | 在事件生命周期测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [31-需求-依赖注入容器.md](../../prds/2026-09/31-需求-依赖注入容器.md) |
| RPC 契约测试 | [../2026-09/14-prd-test-RPC契约测试与类型同步.md](../2026-09/14-prd-test-RPC契约测试与类型同步.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/31-需求-依赖注入容器.md`*