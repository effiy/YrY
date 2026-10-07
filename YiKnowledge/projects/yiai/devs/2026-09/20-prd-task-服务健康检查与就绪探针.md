---

doc_type: module
prd_task_id: "YA-09-12"
title: "YA-09-12: 服务健康检查与就绪探针 — K8s 部署可观测性 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "20-需求-服务健康检查与就绪探针.md"
source_okr: [yiai-001]
related_tests: ["20-prd-test-服务健康检查与就绪探针"]

type: task
---

# YA-09-12: 服务健康检查与就绪探针 — K8s 部署可观测性 — 开发方案

> 来源 PRD：[20-需求-服务健康检查与就绪探针.md](../../prds/2026-09/20-需求-服务健康检查与就绪探针.md)
> 需求编号：YA-09-12 · 优先级：P1 · 人天：2.0d
> 测试规格：[20-prd-test-服务健康检查与就绪探针.md](../../tests/2026-09/20-prd-test-服务健康检查与就绪探针.md)

---

<a id="sec-1"></a>
## 一、设计

### 1.1 端点矩阵

| 端点 | 类型 | 检查内容 | K8s 配置 | 失败行为 |
|------|------|---------|---------|---------|
| `GET /health/live` | Liveness | 进程存活 | `initialDelaySeconds: 5, periodSeconds: 10` | K8s 重启 Pod |
| `GET /health/ready` | Readiness | MongoDB + Ollama 连通 + 知识库索引状态 | `initialDelaySeconds: 10, periodSeconds: 5` | 移出 Service 端点 |
| `GET /health/startup` | Startup | 所有依赖就绪（MongoDB 连接池 + Ollama 模型列表 + 知识库首次扫描） | `failureThreshold: 30, periodSeconds: 10` | 阻止 Liveness 探测 |

### 1.2 实现

```python
# server/health.py
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])

class HealthChecker:
    def __init__(self, db: AsyncIOMotorDatabase, ollama_url: str, knowledge_ready: callable):
        self._db = db
        self._ollama_url = ollama_url
        self._knowledge_ready = knowledge_ready
        self._startup_complete = False

    async def check_mongodb(self) -> dict:
        try:
            await self._db.command("ping")
            return {"status": "up", "latency_ms": None}
        except Exception as e:
            return {"status": "down", "error": str(e)[:200]}

    async def check_ollama(self) -> dict:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self._ollama_url}/api/tags")
                if r.status_code == 200:
                    models = len(r.json().get("models", []))
                    return {"status": "up", "models_loaded": models}
                return {"status": "degraded", "http_status": r.status_code}
        except Exception as e:
            return {"status": "down", "error": str(e)[:200]}

    async def check_knowledge(self) -> dict:
        try:
            ready = await self._knowledge_ready()
            return {"status": "ready" if ready else "initializing"}
        except Exception as e:
            return {"status": "error", "error": str(e)[:200]}

    async def liveness(self):
        return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

    async def readiness(self):
        checks = {
            "mongodb": await self.check_mongodb(),
            "ollama": await self.check_ollama(),
            "knowledge": await self.check_knowledge(),
        }
        healthy = all(c.get("status") in ("up", "ready") for c in checks.values())
        status_code = 200 if healthy else 503
        return JSONResponse(
            {"status": "ready" if healthy else "not_ready", "checks": checks},
            status_code=status_code
        )

    async def startup(self):
        if self._startup_complete:
            return {"status": "started"}
        checks = {
            "mongodb": await self.check_mongodb(),
            "ollama": await self.check_ollama(),
        }
        all_up = all(c["status"] == "up" for c in checks.values())
        if all_up:
            self._startup_complete = True
            return {"status": "started", "checks": checks}
        return JSONResponse(
            {"status": "starting", "checks": checks},
            status_code=503
        )

# 工厂函数——依赖注入
def create_health_router(db, ollama_url, knowledge_ready):
    checker = HealthChecker(db, ollama_url, knowledge_ready)
    router.add_api_route("/health/live", checker.liveness, methods=["GET"])
    router.add_api_route("/health/ready", checker.readiness, methods=["GET"])
    router.add_api_route("/health/startup", checker.startup, methods=["GET"])
    return router
```

### 1.3 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| Readiness 包含知识库 | 知识库索引未完成时拒绝流量，避免检索返回空结果 | 仅检查 DB/Ollama（知识库未就绪时 RAG 返回空） |
| Startup 仅检查 DB+Ollama | 知识库扫描可能耗时 30s+，不应阻塞启动——由 Readiness 渐进检查 | 包含知识库（启动过慢） |
| 503 而非 500 | 503 = 临时不可用，符合语义；500 = 内部错误，会触发告警 | 500（误报告警） |
| MongoDB ping 超时 2s | `command("ping")` 极快（<5ms），2s 是极端情况 | 5s（探测周期内可能无法返回） |

---

<a id="sec-2"></a>
## 二、实施步骤

| # | 步骤 | 文件 | 验证 | 人天 |
|---|------|------|------|------|
| 1 | `HealthChecker` 类 + 三个端点 | `server/health.py` | `curl /health/live` → 200 | 0.75 |
| 2 | 集成到 `main.py`（`app.include_router`） | `main.py` | `/docs` 可见 health 标签 | 0.25 |
| 3 | 优雅启动：startup 完成前不注册 ready | `main.py` | startup 未完成时 ready 返回 503 | 0.25 |
| 4 | K8s 探针配置 + docker-compose 集成 | `deploy/` | `docker-compose up` 健康检查通过 | 0.5 |
| 5 | 优雅关闭：SIGTERM → ready 返回 503 → drain → exit | `main.py` | 关闭期间无新请求接受 | 0.25 |

**合计：2.0d**

### 优雅关闭

```python
# main.py
import signal

async def shutdown(sig):
    logger.info("Received %s, draining...", sig.name)
    health_checker.draining = True  # readiness 返回 503
    await asyncio.sleep(5)  # 等待现有请求完成（实际用 connection drain）
    logger.info("Shutdown complete")
    sys.exit(0)

for sig in (signal.SIGTERM, signal.SIGINT):
    asyncio.get_event_loop().add_signal_handler(
        sig, lambda s=sig: asyncio.create_task(shutdown(s))
    )
```

### K8s 探针配置

```yaml
# deploy/k8s/deployment.yaml (片段)
livenessProbe:
  httpGet: { path: /health/live, port: 10086 }
  initialDelaySeconds: 5
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /health/ready, port: 10086 }
  initialDelaySeconds: 10
  periodSeconds: 5
startupProbe:
  httpGet: { path: /health/startup, port: 10086 }
  failureThreshold: 30
  periodSeconds: 10
```

---

<a id="sec-3"></a>
## 三、关联模块

- 上游：[YA-09-11 监控与告警](./106-prd-task-监控与告警体系.md)（health 指标接入 Prometheus）
- 上游：[YA-08-07 Dashboard](../2026-08/07-prd-task-Dashboard健康聚合API.md)
- 下游：[YA-09-14 容器化部署](./137-prd-task-容器化与Docker部署.md)

---

## 四、回滚

- 探针端点独立于业务路由，不影响现有功能
- 出问题时删除 `deploy/k8s/` 中的探针配置，Pod 恢复默认行为
- 本地开发通过 `config.yaml: health.enabled: false` 完全禁用