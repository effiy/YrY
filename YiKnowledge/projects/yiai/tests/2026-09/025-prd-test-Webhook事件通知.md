---

doc_type: test
title: "YA-09-21: Webhook 事件通知 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-21"
source_prds: ["25-需求-Webhook事件通知"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-21: Webhook 事件通知 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖事件订阅管理、异步推送、重试策略、签名校验。

> 来源 PRD：[25-需求-Webhook事件通知.md](../../prds/2026-09/25-需求-Webhook事件通知.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 事件分发、签名计算 | pytest | 事件匹配、HMAC 签名、重试退避 |
| L2 集成测试 | HTTP webhook 推送 + MongoDB | pytest-asyncio + httpx + motor | 订阅 CRUD、事件触发→推送、交付状态 |

### 1.2 事件类型

| 事件 | 触发时机 | 载荷 |
|------|---------|------|
| `document.created` | 文档创建 | `{collection, doc_id, data}` |
| `document.updated` | 文档更新 | `{collection, doc_id, changes}` |
| `document.deleted` | 文档删除 | `{collection, doc_id}` |
| `file.uploaded` | 文件上传 | `{path, size, type}` |
| `knowledge.indexed` | 知识库索引完成 | `{files_count, duration_ms}` |
| `agent.task.completed` | Agent 任务完成 | `{task_id, summary}` |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import hmac
import hashlib
import json
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def webhook_subscription():
    """Webhook 订阅配置。"""
    return {
        "url": "https://example.com/webhook/receiver",
        "events": ["document.created", "document.updated"],
        "secret": "whsec_abc123",
        "active": True,
        "retry_config": {"max_retries": 3, "backoff_base": 5},
    }

@pytest.fixture
def sample_events():
    """示例事件载荷。"""
    return {
        "document.created": {
            "event": "document.created",
            "timestamp": "2026-09-23T10:30:00Z",
            "data": {"collection": "bugs", "doc_id": "bug_001", "title": "新建缺陷"},
        },
        "document.updated": {
            "event": "document.updated",
            "timestamp": "2026-09-23T10:31:00Z",
            "data": {"collection": "bugs", "doc_id": "bug_001", "changes": {"status": "resolved"}},
        },
        "document.deleted": {
            "event": "document.deleted",
            "timestamp": "2026-09-23T10:32:00Z",
            "data": {"collection": "bugs", "doc_id": "bug_002"},
        },
    }

@pytest.fixture
def mock_webhook_receiver():
    """Mock 外部 webhook 接收端点。"""
    async def handle(request):
        # 校验签名
        signature = request.headers.get("X-YiAi-Signature")
        body = await request.body()
        expected = hmac.new(b"whsec_abc123", body, hashlib.sha256).hexdigest()
        if signature != f"sha256={expected}":
            return {"status": "invalid_signature"}, 401
        return {"status": "received"}, 200
    return AsyncMock(side_effect=handle)
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 订阅管理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-WH-01 | 创建订阅 | 有效 URL + 事件列表 | 1. 创建 webhook 订阅<br>2. 查询订阅列表 | 订阅创建成功，含唯一 ID | P0 |
| TC-WH-02 | 订阅 URL 校验 | url="not-a-valid-url" | 1. 创建订阅<br>2. 检查校验 | 拒绝，"URL 格式无效" | P1 |
| TC-WH-03 | 事件类型校验 | events=["invalid.event"] | 1. 创建订阅<br>2. 检查校验 | 拒绝，"无效事件类型: invalid.event" | P2 |
| TC-WH-04 | 停用订阅 | subscription.active=True | 1. 设置 active=False<br>2. 触发事件 | 事件不推送到该订阅 | P1 |
| TC-WH-05 | 删除订阅 | 订阅已存在 | 1. DELETE /webhooks/{id}<br>2. 查询订阅 | 订阅不存在 | P2 |

### 3.2 事件推送

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-WH-06 | 事件触发→推送 | 订阅 document.created | 1. 创建文档<br>2. 检查 webhook 接收 | 接收端收到 document.created 事件 | P0 |
| TC-WH-07 | 无匹配订阅不推送 | 仅订阅 document.updated | 1. 创建文档（触发 document.created）<br>2. 检查推送 | 不推送 document.created | P1 |
| TC-WH-08 | 多订阅同时推送 | 2 个订阅侦听同一事件 | 1. 触发事件<br>2. 检查两个接收端 | 两个订阅都收到推送 | P2 |
| TC-WH-09 | HMAC 签名校验 | secret=whsec_abc123 | 1. 检查 webhook 请求头<br>2. 验证 X-YiAi-Signature | 签名 = sha256=hmac(secret, body) | P1 |

### 3.3 重试策略

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-WH-10 | 第 1 次推送失败→重试 | webhook 接收端 500 | 1. 推送失败<br>2. 等待退避<br>3. 检查重试 | 按退避策略重试（5s/10s/20s） | P1 |
| TC-WH-11 | 重试 3 次后放弃 | max_retries=3 | 1. 连续 3 次推送失败<br>2. 检查交付状态 | 状态标记为 "failed"，不继续重试 | P1 |
| TC-WH-12 | 重试期间接收端恢复 | 第 1 次失败，第 2 次成功 | 1. 首次推送 500<br>2. 5s 后重试成功 | 交付状态 "delivered" | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-WH-01 | webhook URL 不可达 | 接收端宕机 | 进入重试队列，不丢失事件 | P1 |
| EG-WH-02 | webhook 响应超时 | 接收端 > 10s 未响应 | 超时后视为失败，进入重试 | P1 |
| EG-WH-03 | 并发事件推送顺序 | 短时间内触发 100 个事件 | 事件按时间戳顺序推送 | P2 |
| EG-WH-04 | 超大事件载荷 | data 字段 > 1MB | 截断或拒绝 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-WH-01 | 事件推送不影响业务操作 | webhook 推送异步进行 | 文档 CRUD 延迟不显著增加 | P0 |
| RG-WH-02 | 无订阅时不推送 | Webhook 系统运行但无订阅 | 业务操作不受影响 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 订阅管理 | TC-WH-01 ~ TC-WH-05 | 创建/校验/停用/删除 |
| FR2: 事件推送 | TC-WH-06 ~ TC-WH-09 | 触发/匹配/多订阅/签名 |
| FR3: 重试策略 | TC-WH-10 ~ TC-WH-12 | 重试/放弃/恢复 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 大规模订阅性能 | 100+ 订阅时的推送延迟 | 添加订阅批量推送性能测试 |
| 事件持久化 | 事件是否持久化以防丢失 | 添加事件队列入库和重放测试 |
| 自定义 Header | webhook 订阅可能需要自定义 Header | 添加自定义 Header 配置测试 |