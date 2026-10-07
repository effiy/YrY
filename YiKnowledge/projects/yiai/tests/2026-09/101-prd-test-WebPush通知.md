---

doc_type: test
title: "YA-09-97: 服务端 Web Push 通知 — 基于 VAPID 的浏览器推送与服务端事件桥接 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-97"
source_prds: ["101-需求-WebPush通知"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-97: Web Push 通知 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

> 来源 PRD：[101-需求-WebPush通知.md](../../prds/2026-09/101-需求-WebPush通知.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

---

## 一、测试范围与策略

### 测试范围

- **核心模块**：`src/services/webpush_service.py`（新建）— `WebPushService` 类的 subscribe/unsubscribe/send_to_user/send_to_event_subscribers/cleanup_expired 方法
- **集成模块**：`src/domain/notification/event_emitter.py`（新建）— `EventEmitter` 事件发布订阅机制
- **API 层**：`src/server/routes/webpush_routes.py`（新建）— 订阅管理 REST API（subscribe/unsubscribe）
- **排除范围**：前端 Service Worker 注册与权限请求（属于 YiVad 测试范围），浏览器兼容性差异测试（需真实浏览器环境）

### 测试策略

| 层级 | 策略 | 工具 |
|------|------|------|
| 单元测试 | Mock `pywebpush.webpush` 函数验证推送调用参数；使用 mongomock 验证订阅的 CRUD 操作 | pytest + unittest.mock + mongomock |
| 集成测试 | 使用真实 MongoDB 验证订阅持久化、过期清理 | pytest-asyncio + motor |
| API 测试 | 使用 httpx AsyncClient 测试 subscribe/unsubscribe 端点 | httpx |
| 事件集成测试 | 验证 EventEmitter 正确解耦业务事件与通知推送 | pytest-asyncio |

### 测试环境

- Python 3.10+
- pytest 8.x + pytest-asyncio
- MongoDB 测试实例（或 mongomock）
- Mock pywebpush（不依赖真实浏览器 Push Service）

---

## 二、测试数据 / Fixtures

### Fixture: `webpush_service`

```python
@pytest.fixture
def webpush_service(mock_mongo_db):
    """使用 mock MongoDB 的 WebPushService。"""
    service = WebPushService()
    service._db = mock_mongo_db
    service._vapid_private_key = "test_private_key"
    service._vapid_claims = {"sub": "mailto:test@example.com"}
    return service

@pytest.fixture
def sample_subscription():
    """标准测试订阅对象。"""
    return PushSubscription(
        endpoint="https://fcm.googleapis.com/fcm/send/test123",
        keys={"p256dh": "base64key1", "auth": "base64key2"},
        user_id="user_001",
        project="yivad",
        enabled_events=["agent_completed", "knowledge_updated"],
        created_at=1725600000.0,
    )

@pytest.fixture
def sample_subscriptions():
    """多个测试订阅（不同用户/事件）。"""
    return [
        {"endpoint": f"https://push.example.com/ep{i}", "keys": {"p256dh": f"k{i}", "auth": f"a{i}"},
         "user_id": f"user_{i:03d}", "enabled_events": ["agent_completed"], "_id": f"id{i}"}
        for i in range(1, 6)
    ]
```

---

## 三、详细测试用例

### TC-01: 用户首次订阅推送
- **优先级**：P0
- **前置条件**：`push_subscriptions` 集合中无该用户记录
- **步骤**：
  1. 构造 `PushSubscription(user_id='user_001', endpoint='https://...')`
  2. 调用 `await webpush_service.subscribe(subscription)`
- **预期结果**：
  - 返回一个字符串 ID（`inserted_id`）
  - 数据库中插入 1 条记录，`user_id='user_001'`
  - `last_push_at` 初始值为 0

### TC-02: 用户重复订阅（更新已有订阅）
- **优先级**：P1
- **前置条件**：`push_subscriptions` 中已有 `user_001` 的订阅记录
- **步骤**：
  1. 使用相同 `user_id` 和 `endpoint` 再次调用 `subscribe`
  2. 传入不同的 `enabled_events`（如新增 `'rag_build_completed'`）
- **预期结果**：
  - 不创建新文档，更新已有文档的 `enabled_events`
  - 返回原文档的 `_id`
  - `push_subscriptions` 中仅 1 条 user_001 的记录

### TC-03: 用户取消订阅
- **优先级**：P0
- **前置条件**：`push_subscriptions` 中有 `user_001` 的订阅
- **步骤**：
  1. 调用 `await webpush_service.unsubscribe(endpoint='https://...', user_id='user_001')`
- **预期结果**：
  - 数据库中该记录被删除
  - 再次查询 `user_001` 返回空列表

### TC-04: 向指定用户推送通知
- **优先级**：P0
- **前置条件**：`user_001` 已订阅，mock `webpush` 返回成功
- **步骤**：
  1. 调用 `await webpush_service.send_to_user('user_001', '测试标题', '测试内容', event_type='agent_completed')`
- **预期结果**：
  - `pywebpush.webpush` 被调用，参数包含正确的 `subscription_info` 和 `data`
  - 返回 `{'success': 1, 'failed': 0, 'expired': 0}`
  - 数据库记录 `last_push_at` 更新为当前时间

### TC-05: 事件类型过滤——不推送未订阅的事件
- **优先级**：P1
- **前置条件**：`user_001` 仅订阅 `['agent_completed']`，未订阅 `'knowledge_updated'`
- **步骤**：
  1. 调用 `send_to_user('user_001', '标题', '内容', event_type='knowledge_updated')`
- **预期结果**：
  - 不调用 `pywebpush.webpush`（`enabled_events` 不包含 `'knowledge_updated'`）
  - 返回 `{'success': 0, 'failed': 0, 'expired': 0}`

### TC-06: 推送失败——订阅过期（410 Gone）
- **优先级**：P1
- **前置条件**：mock `webpush` 抛出 `WebPushException`，`response.status_code == 410`
- **步骤**：
  1. 调用 `send_to_user('user_001', '标题', '内容', event_type='agent_completed')`
- **预期结果**：
  - 自动调用 `unsubscribe` 删除该订阅
  - 返回 `{'success': 0, 'failed': 0, 'expired': 1}`
  - 日志记录相关 WARNING

### TC-07: 推送失败——网络错误（500）
- **优先级**：P2
- **前置条件**：mock `webpush` 抛出 `WebPushException`，`response.status_code == 500`
- **步骤**：
  1. 调用 `send_to_user('user_001', '标题', '内容', event_type='agent_completed')`
- **预期结果**：
  - 不删除订阅（500 非过期）
  - 返回 `{'success': 0, 'failed': 1, 'expired': 0}`
  - 记录 WARNING 日志

### TC-08: 批量向事件订阅者推送
- **优先级**：P1
- **前置条件**：5 个用户订阅了 `'knowledge_updated'` 事件
- **步骤**：
  1. 调用 `await webpush_service.send_to_event_subscribers('knowledge_updated', '知识库更新', 'xxx 文件已更新')`
- **预期结果**：
  - `pywebpush.webpush` 被调用 5 次
  - 返回 `{'success': 5, 'failed': 0, 'expired': 0}`

### TC-09: 过期订阅自动清理
- **优先级**：P2
- **前置条件**：`push_subscriptions` 中有 10 条记录，其中 3 条的 `last_push_at` 距今超过 30 天
- **步骤**：
  1. 调用 `await webpush_service.cleanup_expired(max_age_days=30)`
- **预期结果**：
  - 3 条过期记录被删除
  - 剩余 7 条记录保留
  - 日志记录 `deleted_count=3`

### TC-10: EventEmitter 事件触发通知
- **优先级**：P1
- **前置条件**：EventEmitter 注册了 WebPushService 作为 `'agent_completed'` 监听器
- **步骤**：
  1. `await event_emitter.emit('agent_completed', {'user_id': 'user_001', 'title': '完成', 'body': '推理完成'})`
- **预期结果**：
  - 注册的监听器被调用，参数包含事件名和数据
  - `asyncio.gather` 并行执行所有监听器

---

## 四、边界与异常测试

### EC-01: 空订阅列表推送
- **步骤**：用户无任何订阅时调用 `send_to_user`
- **预期**：返回 `{'success': 0, 'failed': 0, 'expired': 0}`，不抛异常

### EC-02: VAPID 密钥缺失
- **步骤**：`settings.vapid_private_key` 为 None 时初始化 `WebPushService`
- **预期**：`_vapid_private_key` 为 None，后续 `_push_one` 调用应抛出明确错误

### EC-03: 超大 payload 推送
- **步骤**：推送 payload 超过 4KB（Web Push 标准限制）
- **预期**：`pywebpush` 抛出异常，捕获后计入 `failed` 计数

### EC-04: 并发订阅同一用户
- **步骤**：2 个协程同时调用 `subscribe` 相同的 `user_id + endpoint`
- **预期**：最终仅 1 条记录（第二次为 update），无重复记录

### EC-05: 清理时集合不存在
- **步骤**：`push_subscriptions` 集合不存在时调用 `cleanup_expired`
- **预期**：优雅处理，不崩溃

---

## 五、回归测试

### RG-01: 推送失败不影响业务逻辑
- **场景**：Agent 完成事件触发推送，但 Push Service 不可达
- **步骤**：
  1. Mock `webpush` 持续抛出异常
  2. 调用 `send_to_event_subscribers`
- **预期**：方法正常返回（含 failed 计数），不向上层抛出异常
- **验证点**：RPC 响应 `code=0`，Agent 推理结果正常返回给用户

### RG-02: 企业微信通知不受影响
- **场景**：Web Push 功能新增后，企业微信通知应继续正常工作
- **步骤**：
  1. 事件触发 `agent_completed`
  2. 验证 EventEmitter 同时触发 WebPushService 和 WeworkService 监听器
- **预期**：两个监听器均被调用，互不影响

---

## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| TC-01 | 场景 1: 用户订阅推送 | 七、场景 1 |
| TC-02 | 重复订阅更新 | 四、subscribe 方法 |
| TC-03 | 场景 5: 用户取消订阅 | 七、场景 5 |
| TC-04 | 场景 2: 推送通知给用户 | 七、场景 2 |
| TC-05 | 场景 3: 事件类型过滤 | 七、场景 3 |
| TC-06 | 场景 4: 过期订阅自动清理 | 七、场景 4 |
| TC-07 | 推送失败处理 | 八、风险与缓解 |
| TC-08 | 场景 6: 批量推送事件通知 | 七、场景 6 |
| TC-09 | 定期清理僵尸订阅 | 八、风险订阅膨胀 |
| TC-10 | EventEmitter 解耦 | 三、3.1 架构图 |
| EC-01~05 | 边界/异常情况 | 八、风险与缓解 |
| RG-01 | 推送失败不影响业务 | 八、Push Service 不可用 |
| RG-02 | 企微通知不退化 | 八、风险 3 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 浏览器端 Service Worker 测试 | 需要真实浏览器环境（Chrome/Firefox/Safari） | YiPet 测试范围补充，使用 Puppeteer/Playwright |
| VAPID 密钥轮换测试 | 涉及生产密钥变更 | 手动演练 + 文档记录 |
| Safari 16.4 兼容性测试 | 需要 macOS Safari 环境 | 浏览器兼容性矩阵测试 |
| 批量推送性能压测 | 需要 100+ 用户订阅场景 | 使用 Locust 或 k6 补充性能测试 |
| 通知点击跳转测试 | 需要前端路由配合 | 端到端测试（E2E） |
| VAPID 签名验证 | pywebpush 内部实现，不直接测试 | 信任第三方库，验证集成行为 |

---

*测试规格基于 PRD [101-需求-WebPush通知](../../prds/2026-09/101-需求-WebPush通知.md) 提取，覆盖 10 个详细用例 + 5 个边界测试 + 2 个回归测试。*