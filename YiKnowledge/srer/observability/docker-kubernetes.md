---
title: Docker and Kubernetes — Containerization Guide
aliases: [docker-kubernetes, containerization, k8s, docker]
tags: [sre, observability, docker, kubernetes, containerization, infrastructure]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Engineers containerize YrY services correctly — from Dockerfile best practices to Kubernetes deployment patterns"
acceptance_criteria:
  - "covers Dockerfile best practices for Python and Node.js"
  - "includes docker-compose for local development"
  - "Kubernetes deployment patterns for production"
related:
  - ./README.md
  - ./cicd.md
  - ../../engineer/build/
---

# Docker and Kubernetes

> **When to use:** When deploying YrY services to production, or when setting up consistent development environments. Containers ensure the app runs the same way everywhere.

## Dockerfile Best Practices

### Python (YiAi)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY src/ ./src/
COPY config.yaml .

# Run as non-root
USER 1000:1000

EXPOSE 10086
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "10086"]
```

### Node.js (YiVad / YiPet)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8848
CMD ["node", "dist/server.js"]
```

### Key Rules

| Rule | Why |
|---|---|
| **Multi-stage builds** | Build in one stage, run in another — smaller final image |
| **Copy deps first, code second** | Layer caching — deps change less often than code |
| **Run as non-root** | Security — container escape is less dangerous |
| **Use specific tags, not `latest`** | Reproducible builds — `python:3.12-slim` not `python:latest` |
| **`.dockerignore`** | Don't copy `.git`, `node_modules`, `__pycache__`, `.env` |

## Docker Compose (Local Development)

```yaml
# docker-compose.yml — YrY full stack
version: "3.8"
services:
  yiai:
    build: ./YiAi
    ports:
      - "10086:10086"
    volumes:
      - ./YiAi/src:/app/src
      - ./YiAi/config.yaml:/app/config.yaml
      - ./YiKnowledge:/app/../YiKnowledge
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
      - RSBUILD_API_BASE=http://yiai:10086

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  mongo_data:
  ollama_data:
```

## Kubernetes Deployment (Production)

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yiai
spec:
  replicas: 2
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
          image: registry.example.com/yiai:v1.2.0
          ports:
            - containerPort: 10086
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
          readinessProbe:
            httpGet:
              path: /health
              port: 10086
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 10086
            initialDelaySeconds: 15
            periodSeconds: 30
```

### Key Kubernetes Patterns

| Pattern | What it does | When to use |
|---|---|---|
| **Readiness probe** | Checks if the pod is ready to serve traffic | Every service |
| **Liveness probe** | Checks if the pod is alive (restart if not) | Every service |
| **Resource requests/limits** | Guarantees minimum resources; caps maximum | Production deployments |
| **PodDisruptionBudget** | Ensures minimum available pods during voluntary disruptions | Critical services |
| **HorizontalPodAutoscaler** | Scales pods based on CPU/memory | Variable-load services |

## YrY Containerization Status

| Service | Dockerfile | Docker Compose | K8s | Notes |
|---|---|---|---|---|
| YiAi | None yet | None yet | None | Runs directly on host |
| YiVad | None yet | None yet | None | Dev server only |
| YiPet | None yet | None yet | N/A | Chrome extension |

**When to containerize:** When you need reproducible deployments, consistent dev environments, or multi-service orchestration. For now, YiAi runs on a single host — containerization is a future optimization.

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| `latest` tag in production | Can't rollback to a known version; surprises on deploy | Use semantic version tags: `yiai:v1.2.0` |
| No health checks in K8s | Pod is running but broken; K8s can't tell | Always add readiness and liveness probes |
| Secrets in Dockerfile or image | Credentials leak; image is not shareable | Use K8s secrets, environment variables, or vault |
| One container = multiple processes | Violates single-responsibility; hard to monitor | One process per container; use sidecar pattern for helpers |