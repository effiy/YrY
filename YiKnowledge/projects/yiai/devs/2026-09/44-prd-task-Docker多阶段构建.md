---
doc_type: module
prd_task_id: "YA-09-37"
title: "YA-09-37: Docker 多阶段构建 — 镜像体积优化 + 安全基础镜像 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "44-需求-Docker多阶段构建.md"
source_okr: [yiai-001]
---

# YA-09-37: Docker 多阶段构建 — 镜像体积优化 + 安全基础镜像 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[44-需求-Docker多阶段构建.md](../../prds/2026-09/44-需求-Docker多阶段构建.md)
> 需求编号：YA-09-37 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```dockerfile
# Stage 1: Build
FROM python:3.11-slim AS builder
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-alpine
COPY --from=builder /root/.local /root/.local
COPY src/ /app/src/
COPY config.yaml /app/
ENV PATH=/root/.local/bin:$PATH
EXPOSE 10086
HEALTHCHECK --interval=30s CMD curl -f http://localhost:10086/health/live || exit 1
USER 1000:1000
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "10086"]
```

### 优化策略

| 策略 | 效果 |
|------|------|
| `python:3.11-alpine` | 基础镜像 < 50MB |
| `--no-cache-dir` pip | 减少 pip 缓存 |
| `.dockerignore` node_modules/ | 排除不必要文件 |
| 非 root 用户 | `USER 1000:1000` |
| HEALTHCHECK | K8s/Docker 探针 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 多阶段 Dockerfile | 镜像 < 200MB | 0.5 |
| 2 | .dockerignore + 安全扫描 + 测试 | `docker scan` 无高危漏洞 | 0.5 |

**合计：1.0d**。