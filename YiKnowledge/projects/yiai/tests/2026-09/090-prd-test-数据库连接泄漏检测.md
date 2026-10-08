---

doc_type: test
title: "YA-09-86: 服务端数据库连接泄漏自动检测 — Cursor/连接池的定时扫描与告警恢复 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-86"
source_prds: ["90-需求-数据库连接泄漏检测"]
source_modules: ["90-prd-task-数据库连接泄漏检测"]
source_okr: [yiai-001]

type: test
---

# YA-09-86: 数据库连接泄漏检测 — 测试规格

> 来源 PRD：[90-需求-数据库连接泄漏检测.md](../../prds/2026-09/90-需求-数据库连接泄漏检测.md)

本文档定义数据库连接泄漏自动检测的**验证方式**——覆盖 Cursor 未关闭检测、连接池泄漏扫描、定时告警、自动恢复机制。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + mongomock | 无 | 每次提交 |
| L2 集成 | pytest + MongoDB | MongoDB 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 未关闭 Cursor 检测 | L1 |
| COV-2 | 连接池使用率监控 | L2 |
| COV-3 | 泄漏告警触发（> 阈值） | L1 |
| COV-4 | 自动恢复——强制关闭泄漏连接 | L2 |
| COV-5 | 泄漏统计与历史 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `leaked_cursor` | 未调用 `close()` 的 cursor | 泄漏检测 |
| `connection_pool` | Motor AsyncIOMotorClient 连接池 | 连接泄漏监控 |

---

## 二、测试用例

### 2.1 Cursor 泄漏检测（COV-1 . L1）

> 自动化落点：`tests/unit/test_connection_leak_detector.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CLK-001 | 检测到未关闭 cursor | 1. `cursor = collection.find({})`；2. 不调用 close；3. 运行检测 | 检测到泄漏 cursor，日志含 cursor 创建位置（call stack） | P0 | 待实现 |
| TC-CLK-002 | 正常关闭 cursor 不触发告警 | 1. `cursor = find()`；2. 正常遍历并 close | 无泄漏告警 | P0 | 待实现 |
| TC-CLK-003 | with 语句自动关闭 cursor | 1. `async with collection.find({}) as cursor` | 退出 with 后 cursor 已关闭，无泄漏 | P1 | 待实现 |
| TC-CLK-004 | 多 cursor 同时泄漏检测 | 1. 10 个未关闭 cursor | 全部检测到，日志含计数值 | P1 | 待实现 |

### 2.2 连接池泄漏（COV-2~3 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CLK-005 | 连接池使用率 < 50% 正常 | 1. 正常负载；2. 检查 pool | 无告警 | P0 | 待实现 |
| TC-CLK-006 | 连接池使用率 > 80% 触发 WARNING | 1. 模拟连接占用 > 80% | WARNING "Connection pool usage high" | P0 | 待实现 |
| TC-CLK-007 | 连接数持续增长（泄漏模式）触发 CRITICAL | 1. 连接数 5 分钟持续增长 | CRITICAL "Potential connection leak detected" | P0 | 待实现 |
| TC-CLK-008 | 连接池空闲连接数正常 | 1. 检查 minPoolSize/maxPoolSize | idle 连接在合理范围内 | P1 | 待实现 |

### 2.3 自动恢复（COV-4 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CLK-009 | 自动关闭超时 cursor（> 60s） | 1. cursor 活跃 > 60s | 自动 kill cursor，日志 "Auto-killed stale cursor" | P0 | 待实现 |
| TC-CLK-010 | 强制重置连接池 | 1. 连接数异常 > maxPoolSize；2. POST /admin/pool/reset | 连接池重置，恢复正常 | P1 | 待实现 |

### 2.4 监控 API（COV-5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CLK-011 | GET /health/debug/connections 返回连接状态 | 1. 查询连接诊断端点 | 返回 {pool_size, active, idle, leaked_cursors, total_created} | P0 | 待实现 |
| TC-CLK-012 | 泄漏统计数据历史 | 1. GET /health/debug/connections/history | 含时间序列的泄漏计数数据 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CLK-EDGE-001 | 检测器自身不造成泄漏 | 检测器扫描 cursor 列表 | 扫描操作不残留 cursor | P1 | 待实现 |
| TC-CLK-EDGE-002 | MongoDB 重启后连接恢复 | 重启 MongoDB, 检测连接状态 | 自动重连, 连接计数正确 | P1 | 待实现 |
| TC-CLK-EDGE-003 | 高并发下的检测准确性 | 100 并发请求 + 部分 cursor 泄漏 | 准确检测泄漏 cursor 数量 | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-CLK-REG-001 | 缺陷 1：长时间运行 cursor 泄漏导致 OOM | 运行 1 小时持续泄漏 | 检测器告警 + 自动恢复，无 OOM | P0 | 待实现 |
| TC-CLK-REG-002 | 缺陷 2：检测器不影响查询性能 | 对比有无检测器的查询延迟 | P99 差异 < 2ms | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 Cursor 泄漏检测 | 未关闭 cursor 识别 | TC-CLK-001 ~ 004 |
| FR-02 连接池监控 | 使用率 + 趋势 | TC-CLK-005 ~ 008 |
| FR-03 自动恢复 | 强制关闭 + 重置 | TC-CLK-009 ~ 010 |
| FR-04 监控 API | /health/debug/connections | TC-CLK-011 ~ 012 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 异步 HTTP 客户端连接池泄漏 | 仅检测 MongoDB 连接池 | 扩展到 httpx client pool 监控 |
| G-2 | 操作系统级文件描述符泄漏 | cursor 泄漏可能表现为 fd 泄漏 | 集成 lsof/fd 检查 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/90-需求-数据库连接泄漏检测.md`*
