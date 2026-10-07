---

doc_type: task
prd_task_id: "YA-09-108"
title: "YA-09-108: 跨项目桥接 — 技术设计"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: task
---

# YA-09-108: 跨项目桥接 — 技术设计

## 实现

**文件**：`services/bridge_service.py`

**流程**：YiPet → `create_bridge_token(session_key)` → MongoDB `bridge_tokens` → YiVad → `window.open(yivad/#/aiChat?session=<key>)` → `validate_bridge_token(token)` → 选择已植入会话

**安全**：token 一次性使用（验证后删除），60s 过期