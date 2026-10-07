---

doc_type: test
title: "YA-09-57: 服务端数据库读写分离 — 主从复制架构与读请求路由策略 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-57"
source_prds: ["61-需求-数据库读写分离"]
source_modules: ["61-prd-task-数据库读写分离"]
source_okr: [yiai-001]

type: test
---

# YA-09-57: 数据库读写分离 — 测试规格

> 来源 PRD：[61-需求-数据库读写分离.md](../../prds/2026-09/61-需求-数据库读写分离.md)
> 提取日期：2026-09-23

本文档定义 MongoDB 读写分离的**验证方式**——覆盖读请求路由到从节点、写请求路由到主节点、复制延迟处理、从节点不可用降级、读写一致性选择。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + mongomock | 无 | 每次提交 |
| L2 集成 | pytest + MongoDB 副本集 | MongoDB 副本集 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 写请求路由到主节点 | L2 |
| COV-2 | 读请求路由到从节点（readPreference=secondaryPreferred） | L2 |
| COV-3 | 读自己写——写后立即读路由到主节点 | L2 |
| COV-4 | 从节点不可用时降级到主节点 | L2 |
| COV-5 | 复制延迟检测与处理 | L2 |
| COV-6 | query_documents 使用从节点 | L2 |
| COV-7 | create/update/delete 使用主节点 | L2 |
| COV-8 | write concern 配置验证 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `replica_set_uri` | `mongodb://primary:27017,secondary1:27017,secondary2:27017/?replicaSet=rs0` | 副本集连接 |
| `read_client` | `readPreference=secondaryPreferred` 的 Motor client | 读请求测试 |
| `write_client` | `readPreference=primary` 的 Motor client | 写请求测试 |

---

## 二、测试用例

### 2.1 路由策略（COV-1~3 . L2）

> 自动化落点：`tests/integration/test_read_write_split.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RWS-001 | 写请求路由到主节点 | 1. `create_document()`；2. 检查连接的节点 | 操作在 `PRIMARY` 节点执行 | P0 | 待实现 |
| TC-RWS-002 | 读请求路由到从节点 | 1. `query_documents()`；2. 检查连接的节点 | 操作在 `SECONDARY` 节点执行 | P0 | 待实现 |
| TC-RWS-003 | 写后立即读路由到主节点 | 1. create_document；2. 立即 query_documents（同会话） | 查询在主节点执行（读自己写） | P0 | 待实现 |
| TC-RWS-004 | 指定 `readPreference=primary` 强制主节点读 | 1. 查询时传入 `read_preference="primary"` | 在主节点执行查询 | P1 | 待实现 |
| TC-RWS-005 | update 操作路由到主节点 | 1. `update_document()` | 操作在 PRIMARY 执行 | P0 | 待实现 |
| TC-RWS-006 | delete 操作路由到主节点 | 1. `delete_document()` | 操作在 PRIMARY 执行 | P0 | 待实现 |

### 2.2 降级与延迟处理（COV-4~5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RWS-007 | 所有从节点不可用时降级主节点 | 1. 停止所有 secondary；2. 执行 query | 自动降级到主节点读取，日志 WARNING | P0 | 待实现 |
| TC-RWS-008 | 从节点恢复后自动切换回从节点 | 1. 重新启动 secondary；2. 执行 query | 自动切换回从节点读取 | P1 | 待实现 |
| TC-RWS-009 | 复制延迟过大时自动切主节点 | 1. 模拟 secondary 延迟 > 10s；2. 执行 query | 使用 primary 读取，避免读到过期数据 | P1 | 待实现 |
| TC-RWS-010 | 复制延迟可接受时使用从节点 | 1. secondary 延迟 < 2s；2. 执行 query | 正常使用 secondary 读取 | P1 | 待实现 |

### 2.3 Write Concern（COV-8 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RWS-011 | write concern: majority | 1. 写入时 `w="majority"` | 等待大多数节点确认后才返回成功 | P0 | 待实现 |
| TC-RWS-012 | write concern: 1（默认） | 1. 写入时 `w=1` | 主节点确认即返回（最快） | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-RWS-EDGE-001 | 单节点部署（无副本集） | 1. 连接单节点 MongoDB | 读写都在同一节点，无报错 | P0 | 待实现 |
| TC-RWS-EDGE-002 | 主节点切换（stepDown）期间 | 1. PRIMARY 降级；2. 新 PRIMARY 选举 | 短暂不可用后自动重连新 PRIMARY，写入成功 | P1 | 待实现 |
| TC-RWS-EDGE-003 | 事务中的读写分离 | 1. 事务内混合读写 | 事务内所有操作在同一节点（PRIMARY） | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-RWS-REG-001 | 缺陷 1：写入后立即查询为 stale 数据 | 单节点模式下写后读 | 读到刚写入的数据（非 stale） | P0 | 待实现 |
| TC-RWS-REG-002 | 缺陷 2：从节点宕机不影响服务可用性 | 停止 secondary 后服务运行 | 不影响读写功能（降级到主节点） | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 写路由到主节点 | create/update/delete → PRIMARY | TC-RWS-001, 005~006 |
| FR-02 读路由到从节点 | query → SECONDARY | TC-RWS-002 |
| FR-03 读自己写 | 写后读 → PRIMARY | TC-RWS-003 |
| FR-04 从节点降级 | 不可用时 → PRIMARY | TC-RWS-007 ~ 010 |
| FR-05 write concern | majority / 1 | TC-RWS-011 ~ 012 |
| FR-06 单节点兼容 | 无副本集不报错 | TC-RWS-EDGE-001 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 分片集群（sharded cluster）的读写分离 | 当前仅副本集环境 | 分片部署后补充 mongos 路由测试 |
| G-2 | maxStalenessSeconds 配置效果 | 复制延迟容忍度未量化 | 在延迟注入测试中验证 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/61-需求-数据库读写分离.md`*
