# YiAi production Docker image
FROM python:3.11-slim

LABEL org.opencontainers.image.title="YiAi"
LABEL org.opencontainers.image.description="FastAPI backend for the Yi family"

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for uvloop build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/
COPY config.yaml .

EXPOSE 10086

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:10086/health')"

CMD ["python", "-m", "uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "10086"]