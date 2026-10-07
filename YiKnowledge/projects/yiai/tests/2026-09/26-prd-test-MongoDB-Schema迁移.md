---

doc_type: test
title: "YA-09-22: MongoDB Schema 迁移 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-22"
source_prds: ["26-需求-MongoDB-Schema迁移"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-22: MongoDB Schema 迁移 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖迁移版本管理、前滚/回滚、数据转换校验、干运行模式。

> 来源 PRD：[26-需求-MongoDB-Schema迁移.md](../../prds/2026-09/26-需求-MongoDB-Schema迁移.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 迁移逻辑函数 | pytest | up/down 迁移函数、版本号比较、迁移锁 |
| L2 集成测试 | 真实 MongoDB + 迁移脚本 | pytest-asyncio + motor | 执行迁移、数据一致性、回滚、干运行 |

### 1.2 迁移架构

```python
# migrations/001_add_user_status.py
async def up(db):
    await db.users.update_many({}, {"$set": {"status": "active"}})

async def down(db):
    await db.users.update_many({}, {"$unset": {"status": ""}})

# migrations/002_add_session_tags.py
async def up(db):
    await db.sessions.update_many({}, {"$set": {"tags": []}})

async def down(db):
    await db.sessions.update_many({}, {"$unset": {"tags": ""}})
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase

@pytest.fixture
def migration_001():
    """迁移 001——添加 user status 字段。"""
    async def up(db):
        await db.users.update_many({}, {"$set": {"status": "active"}})
    async def down(db):
        await db.users.update_many({}, {"$unset": {"status": ""}})
    return {"version": 1, "description": "添加用户状态字段", "up": up, "down": down}

@pytest.fixture
def migration_002():
    """迁移 002——添加 session tags。"""
    async def up(db):
        await db.sessions.update_many({}, {"$set": {"tags": []}})
    async def down(db):
        await db.sessions.update_many({}, {"$unset": {"tags": ""}})
    return {"version": 2, "description": "添加会话标签", "up": up, "down": down}

@pytest.fixture
def migration_003_with_transform():
    """迁移 003——数据转换（status 字段从英文转中文）。"""
    async def up(db):
        from motor.motor_asyncio import AsyncIOMotorCursor
        cursor = db.bugs.find({})
        async for doc in cursor:
            new_status = {"open": "未解决", "closed": "已关闭", "in_progress": "处理中"}.get(doc.get("status"), doc.get("status"))
            await db.bugs.update_one({"_id": doc["_id"]}, {"$set": {"status": new_status}})
    async def down(db):
        cursor = db.bugs.find({})
        async for doc in cursor:
            old_status = {"未解决": "open", "已关闭": "closed", "处理中": "in_progress"}.get(doc.get("status"), doc.get("status"))
            await db.bugs.update_one({"_id": doc["_id"]}, {"$set": {"status": old_status}})
    return {"version": 3, "description": "状态字段中文化", "up": up, "down": down}

@pytest_asyncio.fixture
async def seeded_migration_db(test_db):
    """预填充迁移测试数据。"""
    await test_db.users.insert_many([
        {"_id": "u1", "username": "alice"},  # 无 status 字段（迁移前状态）
        {"_id": "u2", "username": "bob"},
    ])
    await test_db.bugs.insert_many([
        {"_id": "b1", "title": "Bug 1", "status": "open"},
        {"_id": "b2", "title": "Bug 2", "status": "closed"},
    ])
    return test_db
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 迁移执行

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-MG-01 | 执行单次迁移 | 当前版本=0，目标=1 | 1. 执行 migration_001.up<br>2. 检查数据 | users 集合所有文档多了 status="active" | P0 |
| TC-MG-02 | 顺序执行多次迁移 | 当前版本=0 | 1. 执行 001.up → 002.up<br>2. 检查版本号和数据 | 版本=2，所有迁移生效 | P1 |
| TC-MG-03 | 跳过已执行迁移 | 当前版本=1 | 1. 再次请求 001.up<br>2. 检查行为 | 跳过，日志 "迁移 001 已执行" | P1 |
| TC-MG-04 | 干运行不修改数据 | dry_run=True | 1. 执行 dry run<br>2. 检查数据 | 数据不变，日志显示 "将影响 N 条文档" | P1 |

### 3.2 回滚

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-MG-05 | 回滚单次迁移 | 已执行 001.up | 1. 执行 001.down<br>2. 检查数据 | status 字段被移除 | P0 |
| TC-MG-06 | 回滚多次迁移 | 版本=2 | 1. 执行 002.down → 001.down<br>2. 检查版本和数据 | 版本=0，数据恢复迁移前状态 | P1 |
| TC-MG-07 | 回滚未执行迁移 | 版本=0，尝试 001.down | 1. 尝试回滚未执行的迁移<br>2. 检查行为 | 跳过，日志 "迁移 001 未执行" | P2 |

### 3.3 数据转换

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-MG-08 | 数据格式转换 | bugs status "open"/"closed" | 1. 执行 003.up<br>2. 检查数据 | status 变为 "未解决"/"已关闭" | P1 |
| TC-MG-09 | 转换回滚 | 已执行 003.up | 1. 执行 003.down<br>2. 检查数据 | status 恢复 "open"/"closed" | P1 |
| TC-MG-10 | 空集合迁移 | 空集合 | 1. 执行迁移<br>2. 检查行为 | 不报错，影响 0 条文档 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-MG-01 | 迁移函数抛异常 | up() 中 MongoDB 写入失败 | 部分修改回滚，迁移状态不变 | P1 |
| EG-MG-02 | 并发执行同一迁移 | 两个进程同时执行 001.up | 迁移锁机制防止并发 | P1 |
| EG-MG-03 | 迁移版本不连续 | 当前版本=0，执行 003（跳过 001,002） | 拒绝执行，"请先执行迁移 001, 002" | P2 |
| EG-MG-04 | 迁移大集合（> 100K 文档） | 大集合批量更新 | 分批执行，不超时 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-MG-01 | 迁移不影响其他集合 | 迁移 users 集合 | 其他集合（bugs/sessions）数据不变 | P1 |
| RG-MG-02 | 迁移后 API 兼容 | 添加新字段后 | 现有 query_documents 行为不变 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 迁移执行 | TC-MG-01 ~ TC-MG-04 | 单次/顺序/跳过/干运行 |
| FR2: 回滚 | TC-MG-05 ~ TC-MG-07 | 单次/多次/未执行 |
| FR3: 数据转换 | TC-MG-08 ~ TC-MG-10 | 转换/回滚/空集合 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 大集合迁移性能 | 批量更新大集合的性能未测试 | 添加 100K+ 文档迁移性能基准 |
| 零停机迁移 | 迁移期间服务是否可用 | 添加迁移期间 API 可用性测试 |
| 迁移锁分发 | Redis/DB 锁在分布式环境的行为 | 添加多实例迁移锁竞争测试 |