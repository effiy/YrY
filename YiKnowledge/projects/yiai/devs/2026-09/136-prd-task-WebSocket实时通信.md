---
doc_type: module
prd_task_id: "YA-09-130"
title: "YA-09-130: WebSocket 实时通信 — FastAPI WS + 房间 + SSE 降级 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "136-需求-WebSocket实时通信.md"
source_okr: [yiai-001]
---

# YA-09-130: WebSocket 实时通信 — FastAPI WS + 房间 + SSE 降级 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[136-需求-WebSocket实时通信.md](../../prds/2026-09/136-需求-WebSocket实时通信.md)
> 需求编号：YA-09-130 · 优先级：P1 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

SSE 是单向推送。WebSocket 双向通信适用于实时协作、Agent 进度推送等场景。

```python
from fastapi import WebSocket, WebSocketDisconnect

class WSManager:
    def __init__(self): self.rooms: dict[str, set[WebSocket]] = defaultdict(set)
    async def connect(self, ws: WebSocket, room: str):
        await ws.accept(); self.rooms[room].add(ws)
    async def broadcast(self, room: str, data: dict):
        for ws in self.rooms.get(room, []):
            try: await ws.send_json(data)
            except: self.rooms[room].discard(ws)

@app.websocket("/ws/{room}")
async def ws_endpoint(ws: WebSocket, room: str):
    await manager.connect(ws, room)
    try:
        while True: data = await ws.receive_json()
    except WebSocketDisconnect: manager.rooms[room].discard(ws)
```

### WS vs SSE 选择: 双向交互 → WS, 单向推送 → SSE, 浏览器兼容问题 → SSE 降级

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | WSManager + 房间 + FastAPI WebSocket | 多客户端同房间收到广播 | 0.75 |
| 2 | SSE 降级 + 重连 + 测试 | WS 不可用时自动降级 SSE | 0.75 |

**合计：1.5d**。