---

doc_type: test
title: "YA-09-44: 服务端数据库查询结果流式处理 — 大结果集的分批传输与背压应用 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-44"
source_prds: ["48-需求-查询结果流式处理"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-44: 服务端数据库查询结果流式处理 — 测试规格

> **文档职责**：本文档定义查询结果流式处理的**怎么验证**（VERIFY），覆盖 Motor Cursor 流式读取、分批传输、背压和内存控制。

> 来源 PRD：[48-需求-查询结果流式处理.md](../../prds/2026-09/48-需求-查询结果流式处理.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | Cursor 迭代器、分批逻辑 | pytest | 批次大小、has_next、内存估算 |
| L2 集成 | 真实 MongoDB Cursor + SSE 流式响应 | pytest + motor | 大数据量流式输出、背压行为 |

### 1.2 测试数据

```python
@pytest.fixture
async def large_collection(mongo_test_db):
    """填充 10,000 条测试文档。"""
    docs = [{"_id": i, "value": f"doc-{i}", "data": "x"*500} for i in range(10000)]
    await mongo_test_db["large_collection"].insert_many(docs)
    yield mongo_test_db["large_collection"]
    await mongo_test_db["large_collection"].drop()

@pytest.fixture
def streaming_config():
    return {"batch_size": 500, "max_memory_mb": 50}
```

---

## 二、测试用例

### 2.1 基本流式

#### TC-STREAM-001: 10,000 条结果分 20 批输出

| **ID** | TC-STREAM-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 查询 `large_collection` 全部 10,000 条<br/>2. 使用 `cursor.to_list(length=500)` 分批<br/>3. 检查批次数 |
| **预期结果** | - 共 20 批<br/>- 每批 500 条（最后一批可能不全）<br/>- 每批独立发送到客户端 |

#### TC-STREAM-002: 每批次间可处理其他请求（非阻塞）

| **ID** | TC-STREAM-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 开始流式查询<br/>2. 在批次间发送另一个轻量 RPC 请求 |
| **预期结果** | - 第二个请求不等待流式查询完成<br/>- 响应正常返回<br/>- Event loop 不被长时间阻塞 |

### 2.2 内存控制

#### TC-STREAM-003: 流式查询内存 < 50MB（10,000 条）

| **ID** | TC-STREAM-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 测量流式查询前后 RSS<br/>2. 对比一次性加载 10,000 条的内存增量 |
| **预期结果** | - 流式内存增量 < 50MB<br/>- 一次性加载内存增量 > 200MB<br/>- 内存在后两批间回落 |

#### TC-STREAM-004: 批次大小自适应

| **ID** | TC-STREAM-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 文档平均大小 1KB，max_memory=1MB<br/>2. 计算自适应 batch_size |
| **预期结果** | - batch_size = 1024<br/>- 每批不超过 max_memory |

### 2.3 背压

#### TC-STREAM-005: 客户端消费慢时 Cursor 暂停

| **ID** | TC-STREAM-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 客户端每批 `await sleep(2)`<br/>2. 服务端监控 Cursor 状态 |
| **预期结果** | - 服务端不一次性加载所有数据<br/>- 内存不随客户端消费慢而飙升 |

#### TC-STREAM-006: 客户端断开连接时 Cursor 关闭

| **ID** | TC-STREAM-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 流式查询中途关闭 HTTP 连接<br/>2. 检查 Cursor 状态 |
| **预期结果** | - `cursor.close()` 被调用<br/>- MongoDB 游标资源释放<br/>- 日志: "Client disconnected, closing cursor" |

---

## 三、边界与异常测试

### TC-EDGE-001: 空结果集
**步骤**：查询返回 0 条结果。  
**预期结果**：返回 `{total: 0, data: []}`，无批次循环。

### TC-EDGE-002: 单批次结果（< batch_size）
**步骤**：查询返回 200 条（batch_size=500）。  
**预期结果**：仅 1 批，含 200 条。

### TC-EDGE-003: MongoDB 查询超时
**步骤**：Cursor 执行超过 `maxTimeMS`。  
**预期结果**：错误返回 + cursor 关闭 + 部分结果丢弃（不发送不完整数据）。

---

## 四、回归测试

### TC-REG-001: 小结果集（< 100 条）行为与改造前一致
**步骤**：发送普通查询请求。  
**预期结果**：行为透明，响应格式不变。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-分批传输 | TC-STREAM-001~002 | L2 |
| FR-内存控制 | TC-STREAM-003~004 | L1+L2 |
| FR-背压 | TC-STREAM-005~006 | L2 |
| FR-边界 | TC-EDGE-001~003 | L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| MongoDB Change Stream | 不同流式场景 | 实时协作测试中补充 |
| gRPC Server-Streaming | 当前仅 HTTP | gRPC 集成测试 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/48-需求-查询结果流式处理.md`*