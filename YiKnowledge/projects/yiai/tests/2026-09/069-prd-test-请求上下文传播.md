---

doc_type: test
title: "YA-09-65: 服务端请求上下文传播 — 异步任务中的 trace context 与用户信息透传 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-65"
source_prds: ["69-需求-请求上下文传播"]
source_modules: ["69-prd-task-请求上下文传播"]
source_okr: [yiai-001]

type: test
---

# YA-09-65: 请求上下文传播 — 测试规格

> 来源 PRD：[69-需求-请求上下文传播.md](../../prds/2026-09/69-需求-请求上下文传播.md)

本文档定义请求上下文字段传播的**验证方式**——覆盖 contextvars 上下文传递、异步任务中的 trace_id 透传、用户信息保留、跨模块一致性。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest + asyncio | 无 | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | contextvars 基本传递——request_id | L1 |
| COV-2 | 异步任务中 context 透传 | L1 |
| COV-3 | trace_id 跨模块传播 | L2 |
| COV-4 | 用户信息（user_id）在日志中可用 | L2 |
| COV-5 | 并发请求 context 隔离 | L1 |
| COV-6 | context 默认值处理 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `request_ctx` | contextvars 变量：request_id, trace_id, user_id | 上下文传播 |
| `async_task` | asyncio.create_task 中的 context | 异步透传 |

---

## 二、测试用例

### 2.1 Context 传递（COV-1~2 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CTX-001 | request_id 在请求生命周期内保持不变 | 1. 设置 request_id；2. 在各层读取 | 中间件 → Service → Repository 中 request_id 一致 | P0 | 待实现 |
| TC-CTX-002 | trace_id 在异步任务中透传 | 1. 设置 trace_id；2. `asyncio.create_task` | task 内 trace_id 与父 task 一致 | P0 | 待实现 |
| TC-CTX-003 | user_id 在异步任务中透传 | 1. 设置 user_id；2. 创建异步任务 | task 内 user_id 正确传播 | P0 | 待实现 |
| TC-CTX-004 | 并发请求 context 隔离 | 1. 两个并发请求设置不同 request_id；2. 检查 | 各自 request_id 不互相干扰 | P0 | 待实现 |
| TC-CTX-005 | 无 context 时返回默认值 | 1. 不设置任何 context；2. 读取 | request_id="" , trace_id="" , user_id=None | P1 | 待实现 |
| TC-CTX-006 | 新线程不继承 context（Python 限制） | 1. 在新线程中读取 contextvars | 返回默认值，日志 WARNING | P1 | 待实现 |

### 2.2 集成验证（COV-3~4 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CTX-007 | 日志中包含 trace_id | 1. 发送含 trace_id 的请求；2. 检查日志 | 所有日志行包含相同的 trace_id | P0 | 待实现 |
| TC-CTX-008 | RPC 错误响应含 request_id | 1. 触发业务错误；2. 检查响应 | 响应 header 含 X-Request-ID | P1 | 待实现 |
| TC-CTX-009 | 任务队列中 context 保留 | 1. HTTP 请求提交异步任务；2. 任务执行时读取 | 任务中 trace_id 和 user_id 与原始请求一致 | P1 | 待实现 |
| TC-CTX-010 | TraceID 写入 MongoDB 审计日志 | 1. 执行写操作；2. 检查 audit_logs 集合 | audit_logs 文档含 trace_id 字段 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-CTX-EDGE-001 | context 变量被覆盖 | 同一请求中修改 request_id | 新值生效，旧值丢失（预期行为） | P1 | 待实现 |
| TC-CTX-EDGE-002 | 大量 contextvars 变量 | 注册 20 个 contextvars | 性能无明显降级 | P2 | 待实现 |
| TC-CTX-EDGE-003 | 无请求上下文时（后台任务） | 后台 cron 任务读取 context | 默认值，不报错 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-CTX-REG-001 | 缺陷 1：日志中缺少 trace_id 导致无法关联请求 | 检查所有日志输出的 trace_id | 每条日志都有 trace_id | P0 | 待实现 |
| TC-CTX-REG-002 | 缺陷 2：异步任务丢失用户上下文 | 异步任务读取 user_id | user_id 正确传递 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 request_id 传播 | 全生命周期一致 | TC-CTX-001 |
| FR-02 trace_id 透传 | 异步任务中保留 | TC-CTX-002 |
| FR-03 user_id 传播 | 异步任务 + 任务队列 | TC-CTX-003, 009 |
| FR-04 并发隔离 | 不同请求独立 | TC-CTX-004 |
| FR-05 日志集成 | trace_id 记录 | TC-CTX-007 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 跨服务 context 传播（W3C TraceContext） | 单服务场景 | 引入分布式追踪后补充 |
| G-2 | 多进程 context 传递 | Python forking 不支持 contextvars | 使用其他 IPC 机制 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/69-需求-请求上下文传播.md`*
