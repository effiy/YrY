---

doc_type: test
title: "YA-09-35: 服务端请求重放保护 — Idempotency-Key 机制与幂等写入 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-35"
source_prds: ["39-需求-幂等写入保护"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-35: 服务端请求重放保护 — 测试规格

> **文档职责**：本文档定义幂等写入保护的**怎么验证**（VERIFY），覆盖 Idempotency-Key 生成、重复检测、状态缓存和并发安全。

> 来源 PRD：[39-需求-幂等写入保护.md](../../prds/2026-09/39-需求-幂等写入保护.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | IdempotencyKey 生成、缓存存储、TTL 清理 | pytest | 键生成算法、去重逻辑 |
| L2 集成 | HTTP 中间件 + MongoDB 实际写入 | pytest + httpx | 重复请求拦截、幂等响应一致性 |

### 1.2 测试数据

```python
# tests/idempotency/conftest.py

import uuid
import hashlib

@pytest.fixture
def idempotency_store():
    """内存幂等存储（测试用）。"""
    return {}

@pytest.fixture
def idempotent_request():
    """带 Idempotency-Key 的 RPC 写入请求。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "insert_document",
        "parameters": {
            "cname": "projects",
            "document": {"name": "test-project", "status": "active"},
        },
    }

@pytest.fixture
def generate_key():
    """生成幂等键。"""
    def _gen(body: dict) -> str:
        # 基于请求体哈希 + 操作名
        raw = f"{body['module_name']}.{body['method_name']}:{body['parameters']}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]
    return _gen
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 基本幂等

---

#### TC-IDEM-001: 相同 Idempotency-Key 重复请求返回相同结果

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `idempotent_request`，设置 `X-Idempotency-Key: key-001` |
| **步骤** | 1. 第一次发送写入请求 -> 返回 `{inserted_id: "abc123"}`<br/>2. 第二次发送相同请求（相同 key）<br/>3. 对比两次返回 |
| **预期结果** | - 第二次不执行实际写入<br/>- 返回与第一次相同的 `{inserted_id: "abc123"}`<br/>- HTTP 200（非 201） |

---

#### TC-IDEM-002: 不同 Key 的相同内容请求两次写入

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 相同请求体但不同 Key |
| **步骤** | 1. Key A: 发送写入请求<br/>2. Key B: 发送完全相同的请求内容 |
| **预期结果** | - 两次都写入<br/>- 产生两条不同的记录<br/>- HTTP 201（创建成功） |

---

#### TC-IDEM-003: 首次写入失败时幂等键不缓存

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 首次写入时 MongoDB 返回错误 |
| **步骤** | 1. Mock MongoDB 写入失败（连接超时）<br/>2. 发送写入请求 key-003<br/>3. 修复连接后再次发送 key-003 |
| **预期结果** | - 第一次: 错误返回<br/>- 第二次: 正常写入（不返回幂等缓存结果）<br/>- 失败操作不缓存 |

---

### 2.2 键管理

---

#### TC-IDEM-004: 幂等键 TTL 过期后允许重复

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 幂等缓存 TTL = 24 小时 |
| **步骤** | 1. 发送请求 key-004 并缓存结果<br/>2. 模拟 25 小时后再次发送 key-004 |
| **预期结果** | - 24 小时后缓存过期<br/>- 第 25 小时重新执行写入<br/>- 产生新记录 |

---

#### TC-IDEM-005: 客户端不提供 Key 时跳过幂等检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 请求不含 `X-Idempotency-Key` header |
| **步骤** | 1. 发送两次相同的写入请求（无 Key） |
| **预期结果** | - 两次都正常写入<br/>- 无幂等拦截<br/>- 产生两条记录 |

---

#### TC-IDEM-006: 幂等键只对写操作（POST/PUT/PATCH）生效

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | GET 类型的 RPC 请求（如 `query_documents`） |
| **步骤** | 1. 发送 GET 类型的 RPC 请求带 Key<br/>2. 然后再次发送 |
| **预期结果** | - 幂等中间件仅处理写入操作<br/>- GET 操作不检查幂等键<br/>- 不缓存 GET 结果 |

---

### 2.3 并发安全

---

#### TC-IDEM-007: 并发相同 Key 请求只执行一次

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-007 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 两个并发请求使用相同的 `X-Idempotency-Key` |
| **步骤** | 1. 使用 `asyncio.gather` 同时发送两个相同 Key 的请求<br/>2. 检查数据库中的记录数 |
| **预期结果** | - 仅 1 条记录<br/>- 两个请求返回相同结果<br/>- 无竞态条件 |

---

#### TC-IDEM-008: 锁机制——高并发下幂等检测性能

| 字段 | 内容 |
|------|------|
| **ID** | TC-IDEM-008 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 100 个并发请求，50 个不同 Key |
| **步骤** | 1. 发送 100 个请求（50 对相同 Key）<br/>2. 检查数据库记录数 |
| **预期结果** | - 精确 50 条记录<br/>- 每个 Key 仅执行一次<br/>- P99 延迟 < 50ms |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 极长 Idempotency-Key（> 256 字符）截断

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 发送 Key 为 1000 字符的请求<br/>2. 再次发送相同的超长 Key |
| **预期结果** | - Key 截断到 256 字符<br/>- 幂等检测正常 |

### TC-EDGE-002: 幂等缓存存储满时的 LRU 淘汰

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 缓存 10,000 个幂等键（达到上限）<br/>2. 创建第 10,001 个键 |
| **预期结果** | - 最早未使用的键被淘汰<br/>- 新键缓存成功<br/>- 被淘汰键的后续请求重新写入 |

### TC-EDGE-003: MongoDB 写入成功但幂等缓存保存失败

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. Mock 缓存保存失败（Redis 不可达或内存满）<br/>2. 发送写入请求 |
| **预期结果** | - MongoDB 写入正常<br/>- WARNING: "Idempotency cache save failed"<br/>- 后续相同 Key 请求可能重复写入 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 幂等中间件不影响现有端点性能

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 对无 Key 的请求测量延迟<br/>2. 对比启用中间件前后的延迟 |
| **预期结果** | - 额外开销 < 0.1ms<br/>- 无 Key 时仅做空检查 |

### TC-REG-002: 现有 RPC 端点全部正常工作

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 运行全部现有测试<br/>2. 无幂等键时所有端点正常 |
| **预期结果** | - 100% 通过<br/>- 无额外 header 要求 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-基本幂等 | Middleware | TC-IDEM-001~003 | L2 |
| FR-TTL 管理 | Cache | TC-IDEM-004~006 | L1+L2 |
| FR-并发安全 | Lock/Atomic | TC-IDEM-007~008 | L2 |
| FR-边界处理 | 异常处理 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| Redis 分布式幂等缓存 | 当前实现为内存缓存 | 在 Redis 集成测试中补充 |
| 跨服务幂等（YiVad -> YiAi） | 前端可能不传 Key | 前端幂等规范文档 |
| 幂等键清理定时任务 | 需长期运行验证 | soak test 验证 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [39-需求-幂等写入保护.md](../../prds/2026-09/39-需求-幂等写入保护.md) |
| 请求重放检测 | [../2026-09/102-prd-test-请求重放检测.md](../2026-09/102-prd-test-请求重放检测.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/39-需求-幂等写入保护.md`*