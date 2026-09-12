---
title: Docker 与 Kubernetes 容器化指南
aliases: [docker-kubernetes, containerization, k8s, docker]
tags: [sre, observability, docker, kubernetes, containerization, infrastructure]
category: srer/observability
created: 2026-08-24
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "工程师正确容器化 YrY 服务——从 Dockerfile 最佳实践到 Kubernetes 部署模式"
acceptance_criteria:
  - "覆盖 Python 和 Node.js 的 Dockerfile 最佳实践"
  - "包含本地开发的 docker-compose 配置"
  - "生产环境的 Kubernetes 部署模式"
related:
  - ./README.md
  - ./02-可观测-CICD.md
  - ../../engineer/build/
---

# Docker 与 Kubernetes

> **适用场景**：将 YrY 服务部署到生产环境，或搭建一致的开发环境时。容器确保应用在任何地方都以相同方式运行，消除"在我机器上能跑"的问题。

## 为什么 YrY 需要容器化

当前 YrY 各服务直接在宿主机上运行。对于小团队和个人开发，这种部署方式简单直接。但随着服务复杂度增加，容器化带来的收益会越来越明显：

| 问题 | 当前方式 | 容器化后 |
|---|---|---|
| **环境一致性** | 每个人的开发机配置不同 | Docker 镜像确保所有环境一致 |
| **依赖管理** | 手动安装 Python/Node/MongoDB/Ollama | docker-compose 一键启动全部服务 |
| **部署回滚** | `git checkout <commit>` + 手动重启 | 切换镜像标签即可回滚 |
| **资源隔离** | 所有服务共享 CPU 和内存 | 每个容器有独立的资源限制 |
| **扩缩容** | 手动启动进程 | Kubernetes 自动调度和扩缩 |

## Dockerfile 最佳实践

### Python 服务（YiAi）

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 先复制依赖文件（利用层缓存：依赖变更频率远低于代码）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制应用代码
COPY src/ ./src/
COPY config.yaml .

# 以非 root 用户运行（安全最佳实践）
USER 1000:1000

EXPOSE 10086
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "10086"]
```

### Node.js 服务（YiVad / YiPet）

```dockerfile
# 多阶段构建：构建阶段
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 多阶段构建：运行阶段（更小的最终镜像）
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8848
CMD ["node", "dist/server.js"]
```

### Dockerfile 关键规则

| 规则 | 原理 | 如果不遵守的后果 |
|---|---|---|
| **多阶段构建** | 在一个阶段构建，另一个阶段运行——最终镜像更小 | 镜像体积包含不必要构建工具 |
| **先复制依赖，后复制代码** | 利用 Docker 层缓存——依赖变更远少于代码变更 | 每次代码改动都重新安装所有依赖 |
| **以非 root 用户运行** | 安全原则——容器逃逸时危害更小 | 攻击者获得 root 权限 |
| **使用具体标签，不用 `latest`** | 可复现构建——`python:3.12-slim` 而非 `python:latest` | 无法回滚到已知版本；构建不可复现 |
| **使用 `.dockerignore`** | 不要复制 `.git`、`node_modules`、`__pycache__`、`.env` | 镜像体积增大；敏感信息可能泄露 |

## Docker Compose（本地开发）

```yaml
# docker-compose.yml — YrY 全栈一键启动
version: "3.8"
services:
  yiai:
    build: ./YiAi
    ports:
      - "10086:10086"
    volumes:
      - ./YiAi/src:/app/src                    # 热重载开发
      - ./YiAi/config.yaml:/app/config.yaml
      - ./YiKnowledge:/app/../YiKnowledge       # 知识库挂载
    environment:
      - MONGO_URI=mongodb://mongo:27017
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - mongo
      - ollama

  yivad:
    build: ./YiVad
    ports:
      - "8848:8848"
    environment:
      - RSBUILD_API_BASE=http://yiai:10086     # 指向容器网络内的 YiAi

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db                    # 数据持久化

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama              # 模型持久化
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]              # GPU 加速

volumes:
  mongo_data:
  ollama_data:
```

### Docker Compose 使用场景

| 场景 | 命令 | 说明 |
|---|---|---|
| 启动全栈环境 | `docker-compose up -d` | 后台启动所有服务 |
| 重建某个服务 | `docker-compose up -d --build yiai` | 修改 YiAi 代码后重建 |
| 查看日志 | `docker-compose logs -f yiai` | 实时跟踪 YiAi 日志 |
| 停止所有服务 | `docker-compose down` | 停止但不删除数据卷 |

## Kubernetes 生产部署

### Deployment 配置

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yiai
spec:
  replicas: 2                                       # 2 个副本保证高可用
  selector:
    matchLabels:
      app: yiai
  template:
    metadata:
      labels:
        app: yiai
    spec:
      containers:
        - name: yiai
          image: registry.example.com/yiai:v1.2.0   # 使用明确的版本标签
          ports:
            - containerPort: 10086
          resources:
            requests:                                # 保证的最小资源
              cpu: 500m
              memory: 512Mi
            limits:                                  # 允许的最大资源
              cpu: 2000m
              memory: 2Gi
          readinessProbe:                            # 就绪探针：Pod 可以接收流量时
            httpGet:
              path: /health
              port: 10086
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:                             # 存活探针：Pod 需要重启时
            httpGet:
              path: /health
              port: 10086
            initialDelaySeconds: 15
            periodSeconds: 30
```

### 关键 Kubernetes 模式

| 模式 | 作用 | 何时使用 | YiAi 环境配置 |
|---|---|---|---|
| **就绪探针** | 检查 Pod 是否准备好接收流量 | 每个服务必须配置 | `/health/observer` |
| **存活探针** | 检查 Pod 是否存活（不存活则重启）| 每个服务必须配置 | `/health/observer` |
| **资源请求/限制** | 保证最小资源；限制最大资源使用 | 生产部署 | 最小 500m CPU / 512Mi 内存 |
| **PodDisruptionBudget** | 确保自愿中断期间的最小可用 Pod 数 | 关键服务 | minAvailable: 1 |
| **HorizontalPodAutoscaler** | 根据 CPU/内存自动扩缩 Pod 数量 | 负载波动的服务 | 聊天高峰期自动扩容 |

## YrY 容器化现状与路线图

| 服务 | Dockerfile | Docker Compose | Kubernetes | 当前状态 |
|---|---|---|---|---|
| YiAi | 未建立 | 未建立 | 未使用 | 直接在宿主机运行 |
| YiVad | 未建立 | 未建立 | 未使用 | 仅开发服务器 |
| YiPet | 未建立 | 未建立 | 不适用 | Chrome 扩展 |

### 容器化触发时机

对于 YrY 当前的规模，何时应该投入容器化：

| 触发条件 | 优先级 | 说明 |
|---|---|---|
| 需要可复现的部署方式 | 高 | 手动部署容易遗漏步骤 |
| 需要在不同机器上开发 | 中 | Docker Compose 消除环境差异 |
| 需要多服务编排（YiAi + MongoDB + Ollama）| 中 | docker-compose 一键启动所有依赖 |
| 需要自动扩缩容 | 低（远期） | 当前单机部署不需要 |

## 常见反模式

| 反模式 | 为何失败 | 正确做法 |
|---|---|---|
| 生产环境使用 `latest` 标签 | 无法回滚到已知版本；部署时出现意外 | 使用语义化版本标签：`yiai:v1.2.0` |
| Kubernetes 中无健康检查 | Pod 在运行但实际已损坏；Kubernetes 无法发现 | 始终配置就绪探针和存活探针 |
| 密钥写入 Dockerfile 或镜像 | 凭据泄露；镜像无法安全共享 | 使用 K8s Secrets、环境变量或 HashiCorp Vault |
| 一个容器运行多个进程 | 违反单一职责原则；难以监控和调试 | 每个容器运行一个进程；辅助进程使用 Sidecar 模式 |
| 在容器中存储状态数据 | 容器重启后数据丢失 | 使用 Volume 或外部存储（MongoDB 数据、Ollama 模型）|