---

doc_type: test
title: "YA-09-34: 服务冷启动优化 — 懒加载模块与预热缓存策略 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-34"
source_prds: ["38-需求-冷启动优化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-34: 服务冷启动优化 — 测试规格

> **文档职责**：本文档定义冷启动优化的**怎么验证**（VERIFY），覆盖懒加载模块、预热缓存、启动时间度量和健康检查就绪。

> 来源 PRD：[38-需求-冷启动优化.md](../../prds/2026-09/38-需求-冷启动优化.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | LazyLoader 机制、模块加载时序 | pytest | 延迟 import、缓存预热策略 |
| L2 集成 | 完整启动流程 + 健康检查 | pytest + subprocess | 启动时间、首请求延迟、预热效果 |
| L4 性能基准 | 冷启动 vs 热启动对比 | time.perf_counter | 启动时间 < 8s (目标) |

### 1.2 测试数据

```python
# tests/startup/conftest.py

import time
import subprocess
import pytest

@pytest.fixture
def measure_startup_time():
    """测量 YiAi 启动时间。"""
    start = time.perf_counter()
    # 启动 YiAi 进程
    proc = subprocess.Popen(
        ["python", "main.py"],
        cwd="/path/to/YiAi",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    # 等待健康检查通过
    _wait_for_health("http://localhost:10086/health")
    elapsed = time.perf_counter() - start
    yield elapsed
    proc.terminate()
    proc.wait()

@pytest.fixture
def lazy_loaded_modules():
    """需要懒加载的模块列表。"""
    return [
        "domain.rag.engine",
        "domain.knowledge.watcher",
        "services.ai.agent_service",
        "services.rss.rss_service",
    ]

@pytest.fixture
def pre_warmed_modules():
    """启动时预加载的模块列表。"""
    return [
        "server.rpc_router",
        "services.database.data_service",
        "shared.response",
    ]
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 启动时间

---

#### TC-START-001: 冷启动时间 < 8 秒

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-001 |
| **层级** | L4 性能 |
| **优先级** | P0 |
| **前提** | 全新环境，无缓存 |
| **步骤** | 1. 清除所有 `__pycache__` 目录<br/>2. 启动 YiAi<br/>3. 测量从 `python main.py` 到 `/health` 返回 200 的时间 |
| **预期结果** | - 启动时间 < 8s<br/>- 日志记录各阶段耗时<br/>- import 阶段 < 3s |

---

#### TC-START-002: 热启动时间 < 3 秒

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-002 |
| **层级** | L4 性能 |
| **优先级** | P1 |
| **前提** | `.pyc` 缓存已存在（第二次启动） |
| **步骤** | 1. 重启 YiAi（保留 `__pycache__`）<br/>2. 测量启动时间 |
| **预期结果** | - 启动时间 < 3s<br/>- Python import 耗时显著减少 |

---

### 2.2 懒加载

---

#### TC-START-003: 懒加载模块在首次访问时才 import

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `lazy_loaded_modules` fixture |
| **步骤** | 1. 启动时记录 `sys.modules`<br/>2. 检查懒加载模块是否已导入<br/>3. 发送首次 RAG 请求触发 `domain.rag.engine` |
| **预期结果** | - 启动时懒加载模块不在 `sys.modules` 中<br/>- 首次 RAG 请求后 `domain.rag.engine` 被导入<br/>- 首次请求延迟额外 100-500ms |

---

#### TC-START-004: LazyLoader 代理对象透明代理

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `LazyLoader("domain.rag.engine", "RagEngine")` |
| **步骤** | 1. 获取 LazyLoader 代理对象<br/>2. 调用 `proxy.query("test")`<br/>3. 检查实际调用 |
| **预期结果** | - 代理对象透明转发调用<br/>- `isinstance` 检查通过<br/>- 属性访问触发 import |

---

#### TC-START-005: 懒加载模块 import 失败时抛出延迟异常

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-005 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | LazyLoader 引用不存在的模块 |
| **步骤** | 1. 创建 `LazyLoader("nonexistent.module")`<br/>2. 访问代理对象 |
| **预期结果** | - 启动时不报错<br/>- 首次访问时抛出 `ImportError`<br/>- 错误信息明确: "Failed to lazily load nonexistent.module" |

---

### 2.3 预热缓存

---

#### TC-START-006: 启动时预热 MongoDB 连接池

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | MongoDB 可用 |
| **步骤** | 1. 启动 YiAi<br/>2. 检查 Motor 连接池状态<br/>3. 发送首请求测量延迟 |
| **预期结果** | - 启动时预先创建 `minPoolSize` 个连接<br/>- 首请求无连接建立延迟<br/>- 首请求延迟与非首请求一致 |

---

#### TC-START-007: 预热 RAG 索引（可选配置）

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-007 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **前提** | `startup.preload_rag_index=true` |
| **步骤** | 1. 启动 YiAi<br/>2. 检查内存中 RAG 索引是否已加载 |
| **预期结果** | - RAG 索引在启动时加载到内存<br/>- 首个 RAG 查询延迟 < 500ms<br/>- 预热增加启动时间但改善首请求体验 |

---

### 2.4 健康检查就绪

---

#### TC-START-008: `/health` 就绪前拒绝流量

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-008 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 正在启动 |
| **步骤** | 1. 在 `/health` 返回 200 之前<br/>2. 发送 RPC 请求 |
| **预期结果** | - 返回 HTTP 503<br/>- 响应: `{code: 503, message: "Service starting, please retry"}`<br/>- `Retry-After` header 设置 |

---

#### TC-START-009: 全部模块就绪后 `/health` 返回 200

| 字段 | 内容 |
|------|------|
| **ID** | TC-START-009 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 所有关键模块（MongoDB、RPC Router）已初始化 |
| **步骤** | 1. 等待 YiAi 启动完成<br/>2. GET `/health` |
| **预期结果** | - HTTP 200<br/>- 响应: `{status: "healthy", uptime: Ns, modules: {mongodb: "ok", rpc: "ok"}}` |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: MongoDB 不可达时不阻塞启动（降级模式）

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 停止 MongoDB<br/>2. 启动 YiAi |
| **预期结果** | - YiAi 正常启动<br/>- `/health` 返回 `mongodb: "unavailable"`<br/>- 无 MongoDB 的端点返回 503 |

### TC-EDGE-002: 启动超时自动退出

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. Mock 某个模块初始化永久阻塞<br/>2. 设置 `startup.timeout_seconds=30` |
| **预期结果** | - 30 秒后进程退出<br/>- 退出码非 0<br/>- 日志: "Startup timeout exceeded, shutting down" |

### TC-EDGE-003: 模块初始化顺序依赖正确

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 检查模块初始化顺序<br/>2. 验证 RPC Router 在 Service 之前<br/>3. 验证 MongoDB 连接在 Repository 之前 |
| **预期结果** | - 有向无环图（DAG）布局的初始化顺序<br/>- 违反依赖时启动报错 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 懒加载不改变模块行为

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 运行全部 76 个现有测试<br/>2. 验证懒加载模式下的测试通过率 |
| **预期结果** | - 100% 测试通过<br/>- 无懒加载代理导致的类型不匹配<br/>- 模块功能不变 |

### TC-REG-002: 启动时间回归检测——每次 PR 对比基线

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L4 性能 |
| **优先级** | P1 |
| **步骤** | 1. 记录当前基线启动时间<br/>2. 每次 PR 运行启动时间测试<br/>3. 与基线对比 |
| **预期结果** | - 启动时间增加 > 20% 时 CI 告警<br/>- 启动时间增加 > 50% 时 CI 失败 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-启动时间 | Benchmark | TC-START-001~002 | L4 |
| FR-懒加载 | LazyLoader | TC-START-003~005 | L1 |
| FR-预热缓存 | PreWarmer | TC-START-006~007 | L2 |
| FR-健康检查 | HealthRoute | TC-START-008~009 | L2 |
| FR-降级启动 | Degradation | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001~002 | L2+L4 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 生产环境 K8s 启动 | 无 K8s 环境 | 在容器化测试中补充 |
| Cython/PyPy 预热 | 当前仅 CPython | 后续版本评估 |
| 启动 Profile 对比 | 需 py-spy 集成 | 在性能剖析测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [38-需求-冷启动优化.md](../../prds/2026-09/38-需求-冷启动优化.md) |
| 性能剖析 | [../2026-09/37-prd-test-性能剖析火焰图.md](../2026-09/37-prd-test-性能剖析火焰图.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/38-需求-冷启动优化.md`*