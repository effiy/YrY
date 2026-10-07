---

doc_type: task
prd_task_id: "YA-09-121"
title: "YA-09-121: 容器化部署 — 技术实现"
status: 已完成
priority: P1
owner: Claude
roles: [sre, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "121-需求-容器化部署.md"

type: task
---

# YA-09-121: 容器化部署 — 技术实现

## Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ src/
COPY config.yaml .
EXPOSE 10086
HEALTHCHECK --interval=30s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:10086/health')"
CMD ["python", "-m", "uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "10086"]
```

## Docker Compose

三服务编排：yiai (10086) + mongo (27017) + ollama (11434)。YiKnowledge 以只读卷挂载供 RAG 使用。

## 使用

```bash
docker compose up -d      # 启动
docker compose ps          # 状态
docker compose logs yiai   # 日志
```