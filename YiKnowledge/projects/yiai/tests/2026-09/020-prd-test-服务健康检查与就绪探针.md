---

doc_type: test
title: "YA-09-16: 服务健康检查与就绪探针 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-16"
source_prds: ["20-需求-服务健康检查与就绪探针"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-16: 服务健康检查与就绪探针 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 liveness/readiness 端点、依赖健康检查、Kubernetes 探针集成。

> 来源 PRD：[20-需求-服务健康检查与就绪探针.md](../../prds/2026-09/20-需求-服务健康检查与就绪探针.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 健康检查逻辑 | pytest | 状态聚合、依赖超时、JSON 响应格式 |
| L2 集成测试 | FastAPI 端点 + 真实依赖 | pytest-asyncio + httpx | /health /health/ready /health/live 端点 |
| L4 性能基准 | 健康检查延迟 | pytest + time.perf_counter | 健康检查 < 100ms |

### 1.2 健康检查端点

| 端点 | 用途 | 响应码 | 检查内容 |
|------|------|--------|---------|
| `/health` | 综合健康 | 200/503 | 所有组件状态 + 版本信息 |
| `/health/live` | 存活探针 | 200 | 仅进程存活（最小开销） |
| `/health/ready` | 就绪探针 | 200/503 | 所有依赖可用（MongoDB + Ollama） |

### 1.3 依赖健康检查

| 依赖 | 检查方式 | 超时 | 降级策略 |
|------|---------|------|---------|
| MongoDB | `db.command("ping")` | 5s | 标记 unhealthy |
| Ollama | `GET /api/tags` | 5s | 标记 degraded（AI 不可用） |
| 磁盘空间 | `shutil.disk_usage` | 1s | < 5% 标记 warning |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def healthy_dependencies():
    """所有依赖健康的 mock。"""
    return {
        "mongodb": {"status": "healthy", "latency_ms": 2, "version": "7.0.0"},
        "ollama": {"status": "healthy", "latency_ms": 15, "models": ["qwen2.5:7b", "nomic-embed-text"]},
        "disk": {"status": "healthy", "free_gb": 50, "total_gb": 100},
    }

@pytest.fixture
def degraded_dependencies():
    """部分依赖降级的 mock。"""
    return {
        "mongodb": {"status": "healthy", "latency_ms": 3},
        "ollama": {"status": "unhealthy", "error": "Connection refused"},
        "disk": {"status": "healthy", "free_gb": 45},
    }

@pytest.fixture
def unhealthy_dependencies():
    """全部依赖不健康的 mock。"""
    return {
        "mongodb": {"status": "unhealthy", "error": "ServerSelectionTimeoutError"},
        "ollama": {"status": "unhealthy", "error": "Connection refused"},
        "disk": {"status": "healthy", "free_gb": 10},
    }

@pytest.fixture
def health_response_format():
    """健康检查响应格式。"""
    return {
        "status": "healthy",  # healthy | degraded | unhealthy
        "version": "1.0.0",
        "uptime_seconds": 3600,
        "checks": {
            "mongodb": {"status": "healthy", "latency_ms": 2},
            "ollama": {"status": "healthy", "latency_ms": 15},
            "disk": {"status": "healthy", "free_gb": 50},
        },
        "timestamp": "2026-09-23T10:30:00Z",
    }

@pytest.fixture
def kubernetes_probe_config():
    """K8s 探针配置。"""
    return {
        "livenessProbe": {
            "httpGet": {"path": "/health/live", "port": 10086},
            "initialDelaySeconds": 10,
            "periodSeconds": 15,
            "timeoutSeconds": 5,
            "failureThreshold": 3,
        },
        "readinessProbe": {
            "httpGet": {"path": "/health/ready", "port": 10086},
            "initialDelaySeconds": 5,
            "periodSeconds": 10,
            "timeoutSeconds": 5,
            "failureThreshold": 3,
        },
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 /health 综合健康端点

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-HC-01 | 全部健康返回 200 | 所有依赖正常 | 1. GET /health<br>2. 检查响应 | 200，status="healthy"，checks 含 mongodb/ollama/disk | P0 |
| TC-HC-02 | 部分降级返回 200 + degraded | Ollama 不可用 | 1. GET /health<br>2. 检查响应 | 200，status="degraded"，ollama.healthy=false | P1 |
| TC-HC-03 | 全部不健康返回 503 | MongoDB + Ollama 均不可用 | 1. GET /health<br>2. 检查响应 | 503，status="unhealthy" | P0 |
| TC-HC-04 | 响应包含版本和运行时间 | 服务运行中 | 1. GET /health<br>2. 检查响应字段 | 含 version 和 uptime_seconds | P1 |

### 3.2 /health/live 存活探针

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-HC-05 | 进程存活返回 200 | 服务运行 | 1. GET /health/live<br>2. 检查响应 | 200，最小响应体（无依赖检查） | P0 |
| TC-HC-06 | liveness 延迟 < 10ms | 服务运行 | 1. 测量 /health/live 响应时间<br>2. 验证阈值 | 响应时间 < 10ms（无外部依赖调用） | P2 |
| TC-HC-07 | liveness 不因依赖故障而失败 | MongoDB 宕机 | 1. GET /health/live<br>2. 检查响应 | 仍返回 200（仅检查进程存活） | P0 |

### 3.3 /health/ready 就绪探针

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-HC-08 | 所有依赖就绪返回 200 | 依赖正常 | 1. GET /health/ready<br>2. 检查响应 | 200，status="ready" | P0 |
| TC-HC-09 | MongoDB 不就绪返回 503 | MongoDB 不可达 | 1. GET /health/ready<br>2. 检查响应 | 503，status="not ready"，reason="MongoDB unavailable" | P1 |
| TC-HC-10 | Ollama 不就绪→ degraded | Ollama 不可达 | 1. GET /health/ready<br>2. 检查响应 | 可配置：503 或 200+degraded（取决于策略） | P1 |

### 3.4 依赖健康检查逻辑

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-HC-11 | MongoDB ping 超时 5s | MongoDB 响应慢 | 1. 模拟 MongoDB 5s+ 延迟<br>2. 检查健康检查结果 | mongodb.healthy=false，错误="timeout" | P1 |
| TC-HC-12 | 磁盘空间 < 5% warning | 磁盘使用率 > 95% | 1. 模拟磁盘不足<br>2. 检查健康检查结果 | disk.status="warning"，含剩余空间信息 | P2 |
| TC-HC-13 | 依赖检查并发执行 | 需要检查 3 个依赖 | 1. 并发检查 mongodb/ollama/disk<br>2. 测量总耗时 | 总耗时 = max(各检查耗时)，非 sum | P2 |

### 3.5 K8s 探针集成

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-HC-14 | liveness 探针 failureThreshold=3 | 服务假死（不响应） | 1. 连续 3 次失败<br>2. 检查 K8s 行为 | K8s 重启 Pod | P1 |
| TC-HC-15 | readiness 探针 initialDelay=5s | 服务启动中 | 1. 启动服务<br>2. 5s 后首次 readiness 检查 | 启动后 5s 内不检查 readiness | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-HC-01 | 依赖检查函数自身抛异常 | mongodb.ping() 抛未知异常 | 标记 unhealthy + 记录异常详情 | P1 |
| EG-HC-02 | 并发健康检查请求 | 同一时间 10 个 /health 请求 | 每个返回一致结果，无竞态 | P2 |
| EG-HC-03 | 自定义健康检查端点 | 添加业务自定义检查 | 结果合并到总状态中 | P2 |
| EG-HC-04 | 无磁盘检查权限 | 磁盘检查失败 | 标记 unknown（不判定 unhealthy） | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-HC-01 | 健康检查不影响业务端点 | /health 高频率调用 | 业务 API 性能不退化 | P1 |
| RG-HC-02 | 健康检查端点自身稳定 | 持续调用 1h | /health 响应时间稳定 | P2 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: /health 综合端点 | TC-HC-01 ~ TC-HC-04 | 健康/降级/不健康/元数据 |
| FR2: /health/live 存活探针 | TC-HC-05 ~ TC-HC-07 | 存活/低延迟/依赖无关 |
| FR3: /health/ready 就绪探针 | TC-HC-08 ~ TC-HC-10 | 就绪/不就绪/degraded |
| FR4: 依赖健康检查 | TC-HC-11 ~ TC-HC-13 | 超时/磁盘/并发 |
| FR5: K8s 探针集成 | TC-HC-14, TC-HC-15 | failureThreshold/initialDelay |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 真实 K8s 环境测试 | 本地开发无 K8s 集群 | 添加 CI 中 K3s/Minikube 环境测试 |
| 外部 HTTP 依赖检查 | 仅检查 MongoDB/Ollama，不含外部 API | 添加可配置的外部依赖健康检查 |
| Prometheus metrics 暴露 | 健康检查状态未暴露为 metrics | 添加 `/metrics` 端点暴露健康状态 |
| 优雅关闭时的健康状态 | 服务 closing 期间的健康检查 | 添加 shutting_down 状态测试 |