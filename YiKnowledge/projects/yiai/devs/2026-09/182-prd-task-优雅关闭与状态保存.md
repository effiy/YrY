---

doc_type: module
prd_task_id: "YA-09-75"
title: "YA-09-75: 优雅关闭与状态保存 — Agent 上下文持久化 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "182-需求-优雅关闭与状态保存.md"
source_okr: [yiai-001]
related_tests: ["182-prd-test-优雅关闭与状态保存"]

type: task
---

# YA-09-75: 优雅关闭与状态保存 — Agent 上下文持久化 — 开发方案

> 来源 PRD：[182-需求-优雅关闭与状态保存.md](../../prds/2026-09/182-需求-优雅关闭与状态保存.md)
> 需求编号：YA-09-75 · 优先级：P2 · 人天：3.0d

---

<a id="sec-1"></a>
## 一、问题

当前 YiAi 收到 SIGTERM 立即退出：进行中的 LLM 推理被中断、Agent 对话上下文丢失、未完成的文件写入损坏。

---

<a id="sec-2"></a>
## 二、方案

### 2.1 信号处理

```python
# main.py
import signal, asyncio

class GracefulShutdown:
    def __init__(self, app, drain_seconds=30):
        self._app = app
        self._drain = drain_seconds
        self._shutting_down = False

    async def handle_signal(self, sig: signal.Signals):
        if self._shutting_down: return
        self._shutting_down = True
        logger.info("Received %s, draining for %ds...", sig.name, self._drain)

        # Step 1: 拒绝新请求
        self._app.state.accepting = False

        # Step 2: 等待现有请求完成
        await asyncio.sleep(self._drain)

        # Step 3: 保存 Agent 会话
        await self._save_agent_sessions()

        # Step 4: 关闭连接池
        await self._close_connections()

        logger.info("Shutdown complete")
        sys.exit(0)

    async def _save_agent_sessions(self):
        from domain.agent.session import AgentSessionManager
        manager = AgentSessionManager()
        count = await manager.save_all_active()
        logger.info("Saved %d active agent sessions", count)
```

### 2.2 Agent 检查点

```python
# domain/agent/session.py
class AgentSessionManager:
    async def save_all_active(self):
        sessions = await self._db.agent_sessions.find({"status": "active"})
        count = 0
        for s in sessions:
            await self._db.agent_sessions.update_one(
                {"_id": s["_id"]},
                {"$set": {
                    "context": s.get("context", {}),
                    "checkpoint_at": datetime.utcnow(),
                    "status": "paused"
                }}
            )
            count += 1
        return count

    async def resume(self, session_id: str):
        session = await self._db.agent_sessions.find_one({"_id": session_id})
        if session and session.get("status") == "paused":
            return self._restore_context(session["context"])
```

---

<a id="sec-3"></a>
## 三、实施步骤

| # | 步骤 | 验证 | 人天 |
|---|------|------|------|
| 1 | `GracefulShutdown` 类 | `kill -TERM` 后等待现有请求完成 | 1.0 |
| 2 | Agent 会话检查点 | 重启后恢复未完成 Agent 任务 | 1.0 |
| 3 | MongoDB/Cursor/HTTP 连接池关闭 | 关闭后无连接泄漏 | 0.5 |
| 4 | docker-compose `stop_grace_period` 集成 | `docker-compose down` 优雅退出 | 0.5 |

**合计：3.0d**

---

## 四、回滚

- 优雅关闭失败时 `SIGKILL` 强制退出（K8s 默认行为）
- 检查点数据仅用于恢复，不影响正常流程