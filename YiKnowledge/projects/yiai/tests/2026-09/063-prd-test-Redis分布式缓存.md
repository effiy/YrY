---

doc_type: test
title: "YA-09-59: 服务端数据库查询结果缓存策略增强 — 基于 Redis 的分布式缓存 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-59"
source_prds: ["63-需求-Redis分布式缓存"]
source_modules: ["63-prd-task-Redis分布式缓存"]
source_okr: [yiai-001]

type: test
---

# YA-09-59: Redis 分布式缓存 — 测试规格

> 来源 PRD：[63-需求-Redis分布式缓存.md](../../prds/2026-09/63-需求-Redis分布式缓存.md)

本文档定义 Redis 分布式缓存层的**验证方式**——覆盖缓存读写、TTL 过期、序列化/反序列化、缓存穿透保护、缓存雪崩预防、分布式一致性。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + fakeredis | 无 | 每次提交 |
| L2 集成 | pytest + real Redis | Redis 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 缓存写入——set with TTL | L1 |
| COV-2 | 缓存读取——get 命中/未命中 | L1 |
| COV-3 | 缓存过期——TTL 后自动删除 | L1 |
| COV-4 | 序列化——复杂 Python 对象 ↔ Redis bytes | L1 |
| COV-5 | 缓存穿透——空结果也缓存（短 TTL） | L1 |
| COV-6 | 缓存雪崩——TTL 随机抖动 | L1 |
| COV-7 | 写操作后缓存失效 | L2 |
| COV-8 | query_documents 缓存集成 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `redis_client` | fakeredis / real Redis client | 缓存操作 |
| `cache_key` | `"query:bugs:hash:abc123"` | 缓存键 |
| `cached_data` | `{"list": [...], "total": 50}` | 缓存值 |

---

## 二、测试用例

### 2.1 缓存基础操作（COV-1~3 . L1）

> 自动化落点：`tests/unit/test_redis_cache.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CCH-001 | 缓存写入后读取命中 | 1. `cache.set(key, data, ttl=60)`；2. `cache.get(key)` | 返回存入的 data（反序列化后一致） | P0 | 待实现 |
| TC-CCH-002 | 缓存未命中返回 None | 1. `cache.get("nonexistent")` | 返回 None | P0 | 待实现 |
| TC-CCH-003 | TTL 过期后自动删除 | 1. set with ttl=0.1；2. sleep 0.2s；3. get | 返回 None（已过期） | P0 | 待实现 |
| TC-CCH-004 | TTL 设置为 0 永不过期 | 1. set(key, data, ttl=0) | 缓存永不过期 | P1 | 待实现 |
| TC-CCH-005 | 序列化往返——含 datetime/nested dict | 1. set → get 含复杂类型 | 所有类型正确还原 | P0 | 待实现 |
| TC-CCH-006 | 二进制数据缓存 | 1. set/get bytes 类型 | bytes 正确往返 | P1 | 待实现 |

### 2.2 缓存保护策略（COV-5~6 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CCH-007 | 缓存穿透——空结果缓存（短 TTL） | 1. 查询不存在的数据；2. get | 返回 `{"empty": true}`，TTL=30s | P0 | 待实现 |
| TC-CCH-008 | 缓存雪崩——TTL 随机抖动 | 1. set 100 个 key with ttl=60；2. 检查实际 TTL | TTL 在 50-70s 之间分布（随机抖动 ±10s） | P1 | 待实现 |
| TC-CCH-009 | FCFS 互斥锁——同一 key 并发 miss 时仅一个查询穿透 | 1. 10 并发 get 同一 miss key | 仅 1 个后端查询，其余等待缓存填充 | P1 | 待实现 |

### 2.3 集成测试（COV-7~8 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CCH-010 | query_documents 首次查 DB 后写缓存 | 1. 首次查询；2. get(cache_key) | 缓存中有结果，key 基于参数哈希 | P0 | 待实现 |
| TC-CCH-011 | 第二次查询命中缓存不查 DB | 1. 二次同参数查询 | 不调用 MongoDB（缓存命中），响应更快 | P0 | 待实现 |
| TC-CCH-012 | 写操作后缓存自动失效 | 1. create_document；2. 再次查询 | 查询未命中缓存，重新查 DB | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CCH-EDGE-001 | Redis 不可用时降级查 DB | 1. 停止 Redis；2. 查询 | 直接查 DB，不报错，日志 WARNING | P0 | 待实现 |
| TC-CCH-EDGE-002 | 超大值（10MB）缓存 | set 10MB 数据 | 成功缓存（Redis 支持 512MB 上限） | P2 | 待实现 |
| TC-CCH-EDGE-003 | Redis 连接池耗尽 | 所有连接被占用 | 新请求排队等待或降级 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-CCH-REG-001 | 缺陷 1：无 Redis 时服务正常（可选依赖） | 不部署 Redis 运行全部测试 | 全部通过（缓存模块自动降级） | P0 | 待实现 |
| TC-CCH-REG-002 | 缺陷 2：缓存数据与 DB 数据一致 | 写操作后的缓存状态 | 缓存已失效，查询返回最新数据 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 缓存读写 | set/get + 序列化 | TC-CCH-001 ~ 006 |
| FR-02 TTL 过期 | 自动删除 | TC-CCH-003 ~ 004 |
| FR-03 穿透保护 | 空结果缓存 | TC-CCH-007 |
| FR-04 雪崩预防 | TTL 抖动 | TC-CCH-008 ~ 009 |
| FR-05 写失效 | 写入后缓存清除 | TC-CCH-012 |
| FR-06 降级处理 | Redis 不可用 → DB | TC-CCH-EDGE-001 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | Redis Cluster 模式未测试 | 分片环境行为未知 | 集群部署后补充 |
| G-2 | 缓存预热策略未测试 | 启动后冷缓存影响性能 | 添加预热测试 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/63-需求-Redis分布式缓存.md`*
