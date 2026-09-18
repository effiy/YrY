---
doc_type: module
prd_task_id: "YA-09-100"
title: "YA-09-100: 蓝绿部署 — 零停机 + 流量切换 + 快速回滚 — 开发方案"
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
source_prd: "42-需求-蓝绿发布策略.md"
source_okr: [yiai-001]
---

# YA-09-100: 蓝绿部署 — 零停机 + 流量切换 + 快速回滚 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[42-需求-蓝绿发布策略.md](../../prds/2026-09/42-需求-蓝绿发布策略.md)
> 需求编号：YA-09-100 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

docker-compose 双实例 + nginx 流量切换实现蓝绿部署。

```yaml
# docker-compose.blue-green.yml
services:
  yiai-blue:
    build: .; ports: ["10086:10086"]
    environment: { DEPLOY_COLOR: "blue" }
  yiai-green:
    build: .; ports: ["10087:10086"]
    environment: { DEPLOY_COLOR: "green" }
  nginx:
    image: nginx:alpine; ports: ["80:80"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
```

### 发布流程: 部署 Green → 健康检查 → 切换 nginx upstream → 验证 → 停止 Blue

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | docker-compose 双实例 + nginx | 流量切换无中断 | 0.25 |
| 2 | 健康检查 + 自动回滚脚本 + 测试 | Green 不健康则停止切换 | 0.25 |

**合计：0.5d**。