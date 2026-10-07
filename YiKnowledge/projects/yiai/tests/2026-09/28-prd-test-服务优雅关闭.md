---

doc_type: test
title: "YA-09-24: 服务优雅关闭 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-24"
source_prds: ["28-需求-服务优雅关闭"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-24: 服务优雅关闭 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 GracefulShutdown 信号处理、进行中请求等待、连接池释放、定时任务停止。

> 来源 PRD：[28-需求-服务优雅关闭.md](../../prds/2026-09/28-需求-服务优雅关闭.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | ShutdownManager 逻辑 | pytest | 信号处理、资源注册、关闭超时 |
| L2 集成测试 | uvicorn 进程 + 信号 | pytest + subprocess + signal | SIGTERM/SIGINT 处理、请求排空 |

### 1.2 关闭序列

```
SIGTERM/SIGINT 收到
  → 健康检查返回 shutting_down
  → 停止接收新请求（Connection: close）
  → 等待进行中请求完成（graceful_timeout=30s）
  → 关闭 SSE 长连接
  → 关闭 MongoDB 连接池
  → 停止 Knowledge Watcher 定时任务
  → 停止 RSS 抓取调度
  → 进程退出
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import asyncio
import signal
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def shutdown_config():
    """优雅关闭配置。"""
    return {
        "graceful_timeout": 30,  # 等待进行中请求的超时
        "force_exit_timeout": 35,  # 强制退出超时
        "drain_new_requests": True,  # 排空新请求
    }

@pytest.fixture
def resources_to_close():
    """需要关闭的资源列表。"""
    class MockResource:
        def __init__(self, name, close_delay=0):
            self.name = name
            self.close_delay = close_delay
            self.closed = False
        async def close(self):
            await asyncio.sleep(self.close_delay)
            self.closed = True

    return [
        MockResource("mongodb_connection", 0.1),
        MockResource("ollama_client", 0.05),
        MockResource("knowledge_watcher", 0.02),
        MockResource("rss_scheduler", 0.02),
        MockResource("sse_connections", 0.5),  # 模拟多个 SSE 连接关闭
    ]

@pytest.fixture
def pending_requests():
    """模拟进行中的请求。"""
    async def long_request(duration=5):
        await asyncio.sleep(duration)
        return {"status": "done"}
    return long_request
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 信号处理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-01 | SIGTERM 触发优雅关闭 | 服务运行中 | 1. 发送 SIGTERM<br>2. 观察关闭日志 | 日志显示 "SIGTERM received, shutting down gracefully..." | P0 |
| TC-GS-02 | SIGINT 触发优雅关闭 | 服务运行中 | 1. Ctrl+C (SIGINT)<br>2. 观察行为 | 与 SIGTERM 相同的关闭流程 | P1 |
| TC-GS-03 | 重复信号强制退出 | 第 1 个 SIGTERM 后 5s 再发 | 1. 第 2 个 SIGTERM<br>2. 检查行为 | 强制立即退出，日志 "forced shutdown" | P1 |
| TC-GS-04 | force_exit_timeout 超时强制退出 | 资源关闭超过 35s | 1. 资源关闭慢<br>2. 达到 force_exit_timeout | 强制退出，进程退出码非 0 | P2 |

### 3.2 请求排空

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-05 | 进行中请求等待完成 | 1 个 2s 的慢请求进行中 | 1. SIGTERM 发送<br>2. 检查请求是否完成 | 关闭等待 2s 让请求完成 | P0 |
| TC-GS-06 | 新请求被拒绝 | 关闭已经开始 | 1. 关闭进行中<br>2. 新请求到达 | 返回 503 Service Unavailable | P1 |
| TC-GS-07 | 请求超过 graceful_timeout 被中断 | 1 个 40s 的请求进行中 | 1. graceful_timeout=30s<br>2. 等待 30s | 请求被中断，资源仍释放 | P1 |

### 3.3 资源清理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GS-08 | MongoDB 连接池关闭 | MongoDB 连接活跃 | 1. 触发关闭<br>2. 检查连接状态 | 所有连接关闭，client.close() 被调用 | P0 |
| TC-GS-09 | Knowledge Watcher 停止 | 定时任务运行中 | 1. 触发关闭<br>2. 检查 scheduler | apscheduler shutdown，不再触发新任务 | P1 |
| TC-GS-10 | SSE 长连接关闭 | 5 个活跃 SSE 连接 | 1. 触发关闭<br>2. 检查 SSE 连接 | 所有 SSE 连接发送 done 事件后关闭 | P1 |
| TC-GS-11 | 资源关闭顺序 | resources_to_close（5 个资源） | 1. 触发关闭<br>2. 检查关闭顺序 | 先停新请求→SSE→MongoDB→定时任务 | P2 |
| TC-GS-12 | 资源关闭失败不影响其他 | 第 3 个资源 close() 抛异常 | 1. 触发关闭<br>2. 检查后续资源 | 继续关闭其他资源，日志 ERROR | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-GS-01 | 无进行中请求时关闭 | 空闲状态 | 立即完成关闭（< 1s） | P2 |
| EG-GS-02 | 资源关闭 hang 住 | 某资源 close() 永不返回 | force_exit_timeout 后强制退出 | P1 |
| EG-GS-03 | 关闭中收到健康检查 | /health 请求 | 返回 status="shutting_down" | P2 |
| EG-GS-04 | Agent 循环进行中被关闭 | Agent 运行到一半 | SSE 发送 error 帧 → 关闭连接 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-GS-01 | 正常启动不受影响 | 优雅关闭机制加入后 | 启动流程不变 | P1 |
| RG-GS-02 | 定时任务重启后恢复 | 关闭后重新启动 | Knowledge Watcher + RSS 调度正常运行 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 信号处理 | TC-GS-01 ~ TC-GS-04 | SIGTERM/SIGINT/重复/强制 |
| FR2: 请求排空 | TC-GS-05 ~ TC-GS-07 | 等待/拒绝/超时 |
| FR3: 资源清理 | TC-GS-08 ~ TC-GS-12 | MongoDB/Watcher/SSE/顺序/失败 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| K8s preStop hook 集成 | 本地开发无 K8s | 添加 K8s terminationGracePeriodSeconds 测试 |
| 进程组信号传播 | 子进程（如 Ollama 代理）的信号处理 | 添加子进程信号传播测试 |
| 关闭耗时监控 | 无优雅关闭耗时 metrics | 添加 shutdown_duration_seconds 指标 |