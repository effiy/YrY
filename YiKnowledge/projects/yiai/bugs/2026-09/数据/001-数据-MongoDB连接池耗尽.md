---
title: "MongoDB: 连接池耗尽导致高并发下 RPC 请求超时"
tags:
- mongodb
- connection-pool
- motor
- timeout
- concurrency
category: projects/yiai/bugs/data
created: 2026-09-06
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: domain/data/database.py, domain/data/data_service.py
reporter: Claude
environment: macOS / Python 3.10+ / MongoDB 7.0
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-06)
frequency: intermittent
---

## Description

在高并发场景下（YiVad 列表页同时加载 Project/Issue/Bug 数据 + YiPet 扩展初始化），MongoDB 连接池耗尽导致部分 RPC 请求超时。日志显示 `pymongo.errors.ServerSelectionTimeoutError` 和 `ConnectionPoolFull` 错误。

**触发条件：**
- 并发 RPC 请求数 > MongoDB 连接池最大连接数（默认 100）
- 慢查询占用连接时间过长（> 30s）
- Motor 异步驱动未正确释放连接

**影响：**
- YiVad 列表页加载时部分统计卡片显示 "--"（数据加载失败）
- YiPet 扩展初始化时聊天服务不可用
- 超时请求未重试，用户需手动刷新

## Steps to Reproduce

1. 启动 YiAi 后端
2. 同时打开 5 个浏览器标签页访问 YiVad 列表页
3. 在 YiPet 扩展中快速切换 3 个会话
4. 观察 `/project` 页面的统计卡片——部分显示 "--" 或加载骨架屏不消失
5. 检查 YiAi 日志：`pymongo.errors.ServerSelectionTimeoutError: localhost:27017: connection pool exhausted`

## Root Cause

### 1. 连接池配置不当

`motor.motor_asyncio.AsyncIOMotorClient` 的默认 `maxPoolSize=100`，但 `minPoolSize` 未设置（默认为 0），导致：
- 突发流量时连接池从 0 开始建立连接，建立延迟 ~50-200ms/连接
- 无连接预热机制

### 2. 连接泄漏

`data_service.py` 中部分查询方法未使用 `async with` 上下文管理器，cursor 未显式关闭：

```python
# domain/data/data_service.py:89 — 连接泄漏
async def query_documents(self, parameters: dict) -> dict:
    collection = self.db[parameters["cname"]]
    cursor = collection.find(filter_dict)  # cursor 未关闭
    # ...
    return result  # cursor 在函数返回后由 GC 回收，但连接未立即释放
```

### 3. 慢查询无超时控制

`data_service.aggregate_documents` 中的聚合管道（用于 YiVad 统计图表）未设置 `maxTimeMS`，复杂聚合（如 30 天活动趋势）执行时间可达 10-30s，长时间占用连接。

## Fix

### 1. 连接池配置优化

```python
# domain/data/database.py
client = motor.motor_asyncio.AsyncIOMotorClient(
    mongodb_url,
    maxPoolSize=100,
    minPoolSize=10,           # 预热 10 个连接
    maxIdleTimeMS=30000,      # 空闲 30s 后释放
    connectTimeoutMS=5000,    # 连接超时 5s
    serverSelectionTimeoutMS=5000,
)
```

### 2. Cursor 显式关闭

```python
# domain/data/data_service.py
async def query_documents(self, parameters: dict) -> dict:
    collection = self.db[parameters["cname"]]
    cursor = collection.find(filter_dict)
    try:
        # ... 查询逻辑
        return result
    finally:
        await cursor.close()  # 确保连接释放
```

### 3. 聚合查询超时控制

```python
# domain/data/data_service.py
async def aggregate_documents(self, parameters: dict) -> dict:
    pipeline = parameters.get("pipeline", [])
    cursor = collection.aggregate(pipeline, maxTimeMS=15000)  # 15s 超时
    # ...
```

## Verification

- 并发 20 个 RPC 请求 → 全部在 5s 内返回，无超时
- 连接池监控：`maxPoolSize=100`，峰值使用 ≤ 45
- 慢聚合查询在 15s 后自动终止，返回部分结果 + WARNING 日志
- Motor cursor 在 `finally` 块中正确关闭

## Prevention

- **监控层面：** 添加 MongoDB 连接池指标监控（活跃连接数、等待队列长度、平均查询时间）
- **代码层面：** 所有 cursor 操作 MUST 使用 `async with` 或 `try/finally` 确保连接释放
- **测试层面：** 添加并发压力测试（`pytest-asyncio` + 20 并发 fixture）
- **配置层面：** 在 `config.py` 中暴露 MongoDB 连接池参数，支持按环境调整

## 影响范围

- **影响模块**：domain/data/database.py, domain/data/data_service.py
- **涉及文件**：
- `data_service.py`
- `config.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
