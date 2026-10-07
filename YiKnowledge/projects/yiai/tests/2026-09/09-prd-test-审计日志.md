---

doc_type: test
title: "YA-09-09: 审计日志完善 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-09"
source_prds: ["09-需求-审计日志"]
source_modules: ["09-prd-task-审计日志"]
source_okr: [yiai-001]

type: test
---

# YA-09-09: 审计日志完善 — 测试规格

> 来源 PRD：[09-需求-审计日志.md](../../prds/2026-09/09-需求-审计日志.md)
> 开发方案：[09-prd-task-审计日志.md](../../devs/2026-09/09-prd-task-审计日志.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 `@audit_log` 装饰器集成、异步写入不阻塞业务、MongoDB `audit_logs` 持久化、查询 API、TTL 索引自动清理。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 装饰器逻辑 + mock MongoDB | pytest + AsyncMock | 装饰器包装、参数提取、敏感度分级、异步写入 |
| L2 集成测试 | 真实 MongoDB audit_logs 集合 | pytest-asyncio + motor | 持久化读写、查询 API、TTL 索引、数据一致性 |

### 1.2 需要审计的操作

| Service | 方法 | 敏感度 | 审计关键字段 |
|---------|------|--------|-------------|
| `data_service` | `create_document` | medium | 集合名、文档 ID、操作人 |
| `data_service` | `update_document` | medium | 集合名、文档 ID、变更字段 |
| `data_service` | `delete_document` | **high** | 集合名、文档 ID、操作人 |
| `knowledge_service` | `write_file` | medium | 文件路径、操作人 |
| `ai/chat_service` | `chat` | low | 模型名、会话 ID、消息长度 |
| `ai/agent_service` | `run_agent` | medium | Agent 类型、输入摘要 |

### 1.3 设计决策回顾

```
写入方式: 异步 (asyncio.create_task) ——不阻塞主流程
集成方式: @audit_log 装饰器 ——无侵入，一行装饰器
存储: MongoDB audit_logs 集合 ——TTL 索引 90 天自动清理
敏感度: low/medium/high ——分级处理（记录/定期审查/WARNING+告警）
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def audit_log_entry():
    """标准审计日志条目。"""
    return {
        "timestamp": datetime(2026, 9, 23, 10, 30, 0),
        "service": "data_service",
        "method": "delete_document",
        "operator": "admin",
        "sensitivity": "high",
        "parameters_summary": {"cname": "bugs", "doc_id": "bug_001"},
        "result": "success",
        "duration_ms": 15,
        "ip_address": "127.0.0.1",
    }

@pytest.fixture
def mock_audit_service_method():
    """模拟被 @audit_log 装饰的 Service 方法。"""
    async def create_document(cname, data):
        return {"code": 0, "data": {"id": "doc_123"}}
    return create_document

@pytest.fixture
def mock_audit_service_method_failing():
    """模拟会抛出异常的 Service 方法。"""
    async def delete_document(cname, doc_id):
        raise ValueError("Document not found")
    return delete_document

@pytest_asyncio.fixture
async def audit_collection(test_db):
    """audit_logs 集合——预清理。"""
    coll = test_db.audit_logs
    await coll.delete_many({})
    # 创建 TTL 索引
    await coll.create_index("timestamp", expireAfterSeconds=90 * 24 * 3600)
    yield coll
    await coll.delete_many({})

@pytest.fixture
def audit_query_filters():
    """审计日志查询过滤条件 fixture。"""
    return {
        "by_time": {"from": "2026-09-01", "to": "2026-09-30"},
        "by_operator": {"operator": "admin"},
        "by_module": {"module": "data_service"},
        "by_sensitivity": {"sensitivity": "high"},
        "combined": {
            "from": "2026-09-01", "to": "2026-09-30",
            "operator": "admin", "module": "data_service",
        },
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 装饰器基本功能

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AL-01 | `@audit_log` 装饰器集成 | 装饰 Service 方法 | 1. 调用被装饰方法<br>2. 检查 audit_logs 集合 | MongoDB audit_logs 中有 1 条记录 | P0 |
| TC-AL-02 | 审计记录包含完整字段 | 方法调用成功 | 1. 检查 audit_logs 中新记录<br>2. 验证字段完整性 | 含 timestamp/service/method/operator/sensitivity/parameters_summary/result/duration_ms | P0 |
| TC-AL-03 | 审计记录 duration_ms 准确性 | 模拟方法耗时 100ms | 1. `await asyncio.sleep(0.1)` 在方法中<br>2. 检查 duration_ms | duration_ms 在 90-110ms 之间 | P1 |
| TC-AL-04 | 敏感度 high 触发 WARNING 日志 | delete_document 调用 | 1. @audit_log(sensitivity="high")<br>2. 检查日志 | WARNING 日志 + audit_logs 记录 | P1 |
| TC-AL-05 | 敏感度 low 仅记录 | chat 调用 | 1. @audit_log(sensitivity="low")<br>2. 检查日志级别 | INFO 日志，无 WARNING | P2 |

### 3.2 异步写入与业务不阻塞

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AL-06 | 审计写入不阻塞业务响应 | 正常方法调用 | 1. 记录方法调用前时间<br>2. 方法返回（审计写入异步进行） | 方法返回时间 < 审计写入完成时间 + 5ms | P0 |
| TC-AL-07 | 审计写入失败不影响业务 | MongoDB 写入失败 | 1. mock audit_logs.insert_one 抛异常<br>2. 方法正常调用 | 方法返回 code=0，ERROR 日志记录审计写入失败 | P0 |
| TC-AL-08 | 方法异常时仍记录审计 | 方法抛 ValueError | 1. 调用方法<br>2. 异常被方法自身处理<br>3. 检查审计记录 | audit_logs 中仍有一条 result="error" 的记录 | P1 |
| TC-AL-09 | 高并发审计写入 | 50 个并发调用 | 1. 50 个并发 create_document<br>2. 检查 audit_logs 数量 | 50 条记录全部写入，无丢失 | P1 |

### 3.3 查询 API

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AL-10 | 按时间范围查询 | audit_logs 中有 30 天数据 | 1. `from=2026-09-01, to=2026-09-15`<br>2. 检查结果 | 仅返回 9.1-9.15 之间的记录 | P1 |
| TC-AL-11 | 按操作人查询 | `operator="admin"` | 1. 仅 admin 的记录<br>2. 不包含其他用户 | 正确过滤 | P1 |
| TC-AL-12 | 按模块查询 | `module="data_service"` | 1. 仅 data_service 的记录<br>2. 不包含 knowledge 等 | 正确过滤 | P1 |
| TC-AL-13 | 按敏感度查询 | `sensitivity="high"` | 1. 仅 high 级别记录 | 正确过滤 | P2 |
| TC-AL-14 | 组合条件查询 | time + operator + module | 1. 三个条件同时应用<br>2. 检查结果 | AND 逻辑，三个条件全部满足 | P2 |
| TC-AL-15 | 分页查询 | pageNum=2, pageSize=10 | 1. 共 25 条记录<br>2. 请求第 2 页 | 返回 10 条（第 11-20 条），total=25 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-AL-01 | 空查询条件 | 查询 API 无过滤参数 | 返回所有审计记录（受限分页） | P2 |
| EG-AL-02 | 查询时间范围无数据 | from=2020-01-01, to=2020-01-02 | 返回空列表，total=0 | P2 |
| EG-AL-03 | 零操作员的审计记录 | 系统自动操作，operator 为空 | 正常记录，operator 显示 "system" | P2 |
| EG-AL-04 | 超大参数摘要 | parameters 含 10MB 数据 | 截断至 1KB，标记 `[truncated]` | P2 |
| EG-AL-05 | TTL 索引过期清理 | 插入 100 天前的审计记录 | 记录自动被 MongoDB 清理 | P2 |
| EG-AL-06 | 方法极快（< 1ms）| 空方法耗时 0ms | duration_ms 记为 0，不抛异常 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-AL-01 | 添加装饰器后方法行为不变 | 已有 Service 方法添加 @audit_log | 方法返回值、异常行为与添加前一致 | P0 |
| RG-AL-02 | 审计日志不影响 API 契约 | 审计模块运行中 | RPC 响应格式不变（code/data/message） | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: @audit_log 装饰器集成 | TC-AL-01 ~ TC-AL-05 | 基本功能 + 敏感度分级 |
| FR2: 异步写入不阻塞 | TC-AL-06 ~ TC-AL-09 | 响应延迟 + 失败隔离 + 异常记录 |
| FR3: MongoDB 持久化 | TC-AL-01, TC-AL-02 | 写入 + 字段完整性 |
| FR4: 查询 API | TC-AL-10 ~ TC-AL-15 | 时间/操作人/模块/敏感度/组合/分页 |
| FR5: TTL 索引 | EG-AL-05 | 自动清理 |
| 决策1: 异步写入 | TC-AL-06, TC-AL-07 | 不阻塞 + 失败隔离 |
| 决策2: @audit_log 装饰器 | TC-AL-01, RG-AL-01 | 无侵入 + 行为不变 |
| 决策3: 敏感度分级 | TC-AL-04, TC-AL-05 | high → WARNING, low → INFO |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 操作人信息获取 | operator 依赖 X-Token 鉴权头，未登录场景未测 | 添加匿名操作审计行为测试 |
| 审计日志导出 | 无 CSV/JSON 导出 API 测试 | 添加日志导出功能测试 |
| 审计日志数据量大时的查询性能 | 100K+ 记录时查询延迟 | 添加大数据量查询性能基准测试 |
| 多实例审计日志一致性 | 多 YiAi 实例同时写入 audit_logs | 添加分布式审计一致性测试 |
| IP 地址获取 | 反向代理环境下真实 IP 获取 | 添加 X-Forwarded-For 头解析测试 |