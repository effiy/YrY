---

doc_type: test
title: "YA-09-54: 服务端批量操作事务支持 — MongoDB 多文档 ACID 事务与回滚策略 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-54"
source_prds: ["58-需求-MongoDB事务支持"]
source_modules: ["58-prd-task-MongoDB事务支持"]
source_okr: [yiai-001]

type: test
---

# YA-09-54: MongoDB 事务支持 — 测试规格

> 来源 PRD：[58-需求-MongoDB事务支持.md](../../prds/2026-09/58-需求-MongoDB事务支持.md)
> 提取日期：2026-09-23

本文档定义 MongoDB 多文档 ACID 事务的**验证方式**——覆盖事务提交/回滚、跨集合原子性、事务超时、并发事务、重试策略。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + mongomock | 无 | 每次提交 |
| L2 集成 | pytest + 真实 MongoDB 副本集 | MongoDB 副本集 | 每次提交 / CI |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 事务提交——多集合写入全部成功 | L2 |
| COV-2 | 事务回滚——中间步骤失败全部撤销 | L2 |
| COV-3 | 跨集合原子性（projects + bugs + audit_logs） | L2 |
| COV-4 | 事务超时（默认 60s） | L2 |
| COV-5 | 并发事务隔离 | L2 |
| COV-6 | 事务重试策略（指数退避） | L1 |
| COV-7 | 单节点回退行为 | L1 |
| COV-8 | `with_transaction` 封装 | L2 |
| COV-9 | 归档项目事务 | L2 |
| COV-10 | 创建用户事务 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mongo_session` | `AsyncIOMotorClient.start_session()` | 事务 session |
| `txn_collections` | `["projects", "bugs", "audit_logs"]` | 跨集合操作 |
| `sample_archive_data` | project key + 10 bug keys | 归档项目测试 |
| `sample_user_data` | username + permissions + session | 创建用户测试 |

---

## 二、测试用例

### 2.1 事务提交与回滚（COV-1~3 . L2）

> 自动化落点：`tests/integration/test_mongo_transaction.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TXN-001 | 事务提交——三集合写入成功 | 1. 开启事务；2. 写入 projects, bugs, audit_logs；3. commit | 三个集合均包含新文档 | P0 | 待实现 |
| TC-TXN-002 | 事务回滚——第二步失败全部撤销 | 1. 写入 projects 成功；2. 写入 bugs 时抛异常；3. abort | projects 集合无新文档（已回滚） | P0 | 待实现 |
| TC-TXN-003 | 事务回滚——第三步失败全部撤销 | 1. 写入 projects + bugs 成功；2. 写入 audit_logs 失败；3. abort | projects 和 bugs 均无新文档 | P0 | 待实现 |
| TC-TXN-004 | 事务外查询看不到未提交数据 | 1. 事务内写入但未 commit；2. 另一个 session 查询 | 查询结果不含事务内写入的数据 | P0 | 待实现 |
| TC-TXN-005 | abort_transaction 后数据完全恢复 | 1. 开启事务写入；2. abort_transaction；3. 查询所有集合 | 所有集合恢复到事务前状态 | P0 | 待实现 |
| TC-TXN-006 | 空事务——commit 无操作 | 1. 开启事务；2. 不执行任何操作；3. commit | commit 成功，无副作用 | P1 | 待实现 |

### 2.2 事务超时与并发（COV-4~5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TXN-007 | 事务超时自动 abort | 1. 开启事务（超时 1s）；2. sleep 2s；3. 尝试写入 | 抛 `PyMongoError`，事务已自动 abort | P0 | 待实现 |
| TC-TXN-008 | 事务超时后可配置 | 1. `with_transaction(max_commit_time_ms=5000)`；2. 5s 内操作 | 5s 内成功 commit | P1 | 待实现 |
| TC-TXN-009 | 并发事务写入不同集合不冲突 | 1. T1 写 projects；2. T2 写 bugs；3. 同时 commit | 两个事务都成功，无写冲突 | P1 | 待实现 |
| TC-TXN-010 | 并发事务写入同一文档冲突 | 1. T1 和 T2 同时修改同一 document | T2 抛出 `WriteConflict`，可重试 | P0 | 待实现 |

### 2.3 重试与封装（COV-6~8 . L1+L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TXN-011 | 写冲突自动重试成功 | 1. `with_retry(max_retries=3)`；2. 模拟 WriteConflict | 重试后成功，耗时 < 500ms | P0 | 待实现 |
| TC-TXN-012 | 超过重试次数后失败 | 1. 永久的 WriteConflict；2. max_retries=3 | 重试 3 次后返回失败 | P0 | 待实现 |
| TC-TXN-013 | 指数退避间隔正确 | 1. 检查重试间隔序列 | 间隔为: 100ms, 200ms, 400ms（指数增长） | P1 | 待实现 |
| TC-TXN-014 | `with_transaction` 封装完整 | 1. 使用 with_transaction 包装业务逻辑 | commit/abort 自动处理，异常自动回滚 | P0 | 待实现 |

### 2.4 业务场景（COV-9~10 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TXN-015 | 归档项目——projects + bugs + audit_logs | 1. 执行归档操作 | 三个集合原子更新：project.archived=true, bugs.status=archived, audit 记录 | P0 | 待实现 |
| TC-TXN-016 | 创建用户——users + permissions + sessions | 1. 执行创建用户操作 | 三个集合原子写入，任一失败全部回滚 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-TXN-EDGE-001 | 事务中读取未提交的自身写入 | 同一事务内写入后读取 | 可以读到自身写入（read-your-own-writes） | P1 | 待实现 |
| TC-TXN-EDGE-002 | 大事务（100+ 文档） | 事务内写入 100 条文档 | 成功 commit，耗时合理 | P1 | 待实现 |
| TC-TXN-EDGE-003 | 事务期间集合被删除 | 事务内引用被删除的集合 | 抛 NamespaceNotFound，事务 abort | P1 | 待实现 |
| TC-TXN-EDGE-004 | 客户端断开连接事务自动 abort | 事务进行中关闭 client | 事务 abort，不残留未提交数据 | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-TXN-REG-001 | 缺陷 1：归档项目半途失败数据不一致 | 模拟 bugs 更新失败 | 整个事务回滚，project 状态不变 | P0 | 待实现 |
| TC-TXN-REG-002 | 缺陷 2：创建用户无权限无法登录 | 模拟 permissions 写入失败 | 事务回滚，users 中也无该用户 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 多集合原子提交 | commit 后全部可见 | TC-TXN-001, 004 |
| FR-02 失败自动回滚 | abort 后全部撤销 | TC-TXN-002 ~ 003, 005 |
| FR-03 事务超时控制 | 超时自动 abort | TC-TXN-007 ~ 008 |
| FR-04 并发事务隔离 | 写冲突处理 | TC-TXN-009 ~ 010 |
| FR-05 重试策略 | 指数退避重试 | TC-TXN-011 ~ 013 |
| FR-06 with_transaction 封装 | 自动 commit/abort | TC-TXN-014 |
| FR-07 业务场景 | 归档项目 + 创建用户 | TC-TXN-015 ~ 016 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 单节点 MongoDB 不支持事务 | 开发环境可能使用单节点 | 文档说明 + 条件跳过测试 |
| G-2 | Change Stream + 事务组合未测试 | 事务内外的 Change Stream 行为未知 | 添加 Change Stream 集成测试 |
| G-3 | 分布式事务（跨 shard）未测试 | YiAi 当前未使用分片 | 分片部署后补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/58-需求-MongoDB事务支持.md`*
