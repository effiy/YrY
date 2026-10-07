---

doc_type: test
title: "YA-09-42: 服务异步任务队列 — 基于 asyncio.Queue 的后台作业调度系统 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-42"
source_prds: ["46-需求-异步任务队列"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-42: 服务异步任务队列 — 测试规格

> **文档职责**：本文档定义异步任务队列的**怎么验证**（VERIFY），覆盖任务入队、Worker 消费、失败重试、优先级和背压控制。

> 来源 PRD：[46-需求-异步任务队列.md](../../prds/2026-09/46-需求-异步任务队列.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 队列操作、Worker 调度逻辑 | pytest + asyncio | 入队/出队、优先级排序 |
| L2 集成 | 真实任务执行 + 失败重试 | pytest + httpx | 任务完成、重试次数、最终状态 |

### 1.2 测试数据

```python
@pytest.fixture
async def task_queue():
    queue = asyncio.Queue(maxsize=100)
    results = []
    async def worker():
        while True:
            task = await queue.get()
            try:
                result = await task["fn"](*task.get("args", []))
                results.append({"id": task["id"], "status": "done", "result": result})
            except Exception as e:
                results.append({"id": task["id"], "status": "failed", "error": str(e)})
            queue.task_done()
    asyncio.create_task(worker())
    yield queue, results
```

---

## 二、测试用例

### 2.1 基本任务

#### TC-TASK-001: 任务入队并成功执行

| **ID** | TC-TASK-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. `queue.put({"id":"t1", "fn": lambda x: x*2, "args": [21]})`<br/>2. 等待执行 |
| **预期结果** | - 结果: `{"id":"t1", "status":"done", "result":42}`<br/>- `queue.task_done()` 被调用 |

#### TC-TASK-002: FIFO 顺序执行

| **ID** | TC-TASK-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 入队 t1, t2, t3 三个任务 |
| **预期结果** | - 按 t1 -> t2 -> t3 顺序完成<br/>- 完成时间递增 |

#### TC-TASK-003: 多个 Worker 并行消费

| **ID** | TC-TASK-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 启动 4 个 Worker<br/>2. 入队 10 个任务（每个 sleep 0.1s） |
| **预期结果** | - 总耗时 ~0.3s（非 1s）<br/>- 4 个 Worker 并行执行 |

### 2.2 失败重试

#### TC-TASK-004: 失败任务自动重试（最多 3 次）

| **ID** | TC-TASK-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 入队一个前 2 次抛异常，第 3 次成功的任务 |
| **预期结果** | - 重试 3 次后成功<br/>- 日志记录每次重试<br/>- `attempts` 字段 = 3 |

#### TC-TASK-005: 超过最大重试次数标记为 failed

| **ID** | TC-TASK-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 入队一个永远失败的任务<br/>2. max_retries=3 |
| **预期结果** | - 执行 4 次（1 次原始 + 3 次重试）<br/>- 最终状态: `failed`<br/>- 记录到 dead_letter_queue |

### 2.3 优先级

#### TC-TASK-006: 高优先级任务先于低优先级执行

| **ID** | TC-TASK-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 入队: (低优先 b1), (高优先 a1), (低优先 b2)<br/>2. 使用 PriorityQueue |
| **预期结果** | - 执行顺序: a1 -> b1 -> b2 |

### 2.4 背压控制

#### TC-TASK-007: 队列满时 put 阻塞

| **ID** | TC-TASK-007 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 填充队列到 maxsize=100<br/>2. 再尝试 `put` |
| **预期结果** | - `put` 阻塞等待<br/>- 消费后继续入队<br/>- 不丢失任务 |

---

## 三、边界与异常测试

### TC-EDGE-001: 空队列时 Worker 等待
**步骤**：不提交任务，启动 Worker。  
**预期结果**：Worker 等待不退出，CPU 使用率 0%。

### TC-EDGE-002: 任务执行超时取消
**步骤**：任务 sleep 30s，设置 timeout=5s。  
**预期结果**：5s 后 `CancelledError`，任务标记 `timeout`。

### TC-EDGE-003: Worker 崩溃恢复
**步骤**：1 个 Worker 抛出未处理异常。  
**预期结果**：任务不在队列中丢失；新 Worker 自动补充。

### TC-EDGE-004: 优雅关闭——等待进行中任务完成
**步骤**：队列中有 5 个进行中任务，发出 shutdown 信号。  
**预期结果**：5 个任务完成后才退出；新入队被拒绝。

---

## 四、回归测试

### TC-REG-001: 异步任务队列不阻塞 HTTP 请求
**步骤**：入队耗时任务时发送 RPC 请求。  
**预期结果**：RPC 请求立即响应（任务异步执行）。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-入队执行 | TC-TASK-001~003 | L1+L2 |
| FR-失败重试 | TC-TASK-004~005 | L1 |
| FR-优先级 | TC-TASK-006 | L1 |
| FR-背压 | TC-TASK-007 | L1 |
| FR-边界 | TC-EDGE-001~004 | L1 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 持久化队列（重启后恢复） | 当前内存队列 | Redis/Celery 集成测试 |
| 任务依赖 DAG | 未实现 | 后续版本评估 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/46-需求-异步任务队列.md`*