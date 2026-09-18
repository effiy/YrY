---
doc_type: module
prd_task_id: "YA-09-40"
title: "YA-09-40: Docker Compose 部署 — 全栈编排 + 健康检查 — 开发方案"
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
source_prd: "137-需求-容器化与Docker部署.md"
source_okr: [yiai-001]
---

# YA-09-40: Docker Compose 部署 — 全栈编排 + 健康检查 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[137-需求-容器化与Docker部署.md](../../prds/2026-09/137-需求-容器化与Docker部署.md)
> 需求编号：YA-09-40 · 优先级：P1 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```yaml
# docker-compose.yml
services:
  yiai:
    build: ./YiAi
    ports: ["10086:10086"]
    environment: { MONGO_URL: "mongodb://mongo:27017", OLLAMA_HOST: "http://ollama:11434" }
    depends_on: { mongo: { condition: service_healthy }, redis: { condition: service_healthy } }
    healthcheck: { test: ["CMD", "curl", "-f", "http://localhost:10086/health/ready"], interval: 10s }

  mongo:
    image: mongo:7
    volumes: ["mongo_data:/data/db"]
    healthcheck: { test: echo 'db.runCommand("ping").ok' | mongosh --quiet, interval: 10s }

  ollama:
    image: ollama/ollama:latest
    volumes: ["ollama_data:/root/.ollama"]

  redis:
    image: redis:7-alpine
    healthcheck: { test: ["CMD", "redis-cli", "ping"], interval: 10s }

volumes: { mongo_data:, ollama_data: }
```

### 启动顺序

1. MongoDB + Redis → 健康检查通过
2. Ollama → 模型拉取
3. YiAi → `/health/ready` 检查所有依赖

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | docker-compose.yml + 健康检查依赖 | `docker compose up` 全栈启动 | 0.75 |
| 2 | 环境变量注入 + 数据卷持久化 + 测试 | 重启后数据保留 | 0.75 |

**合计：1.5d**。