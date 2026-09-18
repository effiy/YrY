---
doc_type: module
prd_task_id: "YA-09-72"
title: "YA-09-72: 配置中心热更新 — SIGHUP + YAML watch + 通知 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "27-需求-配置中心热更新.md"
source_okr: [yiai-001]
---

# YA-09-72: 配置中心热更新 — SIGHUP + YAML watch + 通知 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[27-需求-配置中心热更新.md](../../prds/2026-09/27-需求-配置中心热更新.md)
> 需求编号：YA-09-72 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

支持运行时重载 `config.yaml` 而无需重启服务——通过 `SIGHUP` 信号或 Admin API 触发。

```python
import signal
from watchdog.observers import Observer

class HotReloader:
    def __init__(self, settings):
        self.settings = settings
        signal.signal(signal.SIGHUP, self._on_sighup)
        # 可选：watchdog 文件监听
        self.observer = Observer()
        self.observer.schedule(ConfigHandler(settings), path="config.yaml")

    def _on_sighup(self, signum, frame):
        self.settings.reload()
        logger.info("Config reloaded via SIGHUP")

# Admin API 手动触发
@router.post("/admin/config/reload")
async def reload_config():
    settings.reload()
    return {"message": "OK"}
```

### 可热更新 vs 需重启

| 可热更新 | 需重启 |
|---------|--------|
| `rag.top_k`、`rag.chunk_size` | `server.port` |
| `knowledge.watcher_poll_seconds` | `mongo.url` |
| `llm.model`、`llm.provider` | `jwt.secret` |
| 日志级别、CORS origins | 中间件配置 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | SIGHUP + Admin API 重载 | `kill -HUP` → 配置生效 | 0.25 |
| 2 | 变更通知 + 测试 | 企微推送热更新结果 | 0.25 |

**合计：0.5d**。