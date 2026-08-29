---
title: Reverse Proxy — Nginx for YiAi
aliases: [reverse-proxy, nginx, proxy-setup, load-balancer]
tags: [sre, observability, reverse-proxy, nginx, infrastructure]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "SREs set up Nginx as a reverse proxy for YiAi — SSL termination, rate limiting, and static file serving"
acceptance_criteria:
  - "covers SSL termination, rate limiting, WebSocket/SSE proxying, and static files"
  - "includes YiAi-specific Nginx configuration"
  - "covers security headers and logging"
related:
  - ./README.md
  - ./set-up-observability.md
  - ./docker-kubernetes.md
  - ../release/release-procedure.md
---

# Reverse Proxy — Nginx for YiAi

> **When to use:** When exposing YiAi beyond localhost — SSL termination, rate limiting, static file serving, or load balancing.

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/yiai
upstream yiai_backend {
    server 127.0.0.1:10086;
    keepalive 32;
}

server {
    listen 80;
    server_name yi-ai.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yi-ai.example.com;

    # SSL
    ssl_certificate     /etc/ssl/certs/yiai.crt;
    ssl_certificate_key /etc/ssl/private/yiai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req zone=api burst=50 nodelay;

    # Access log
    access_log /var/log/nginx/yiai-access.log;
    error_log  /var/log/nginx/yiai-error.log;

    # Static files
    location /static/ {
        alias /opt/yiai/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API — proxy to uvicorn
    location / {
        proxy_pass http://yiai_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE streaming support
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 600s;  # 10 min for chat

        # CORS (if needed)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type, X-Token';
    }
}
```

## SSE Streaming Support

Critical for YiAi chat. Without these settings, SSE streams break:

```nginx
proxy_set_header Connection '';
proxy_buffering off;       # Don't buffer — stream immediately
proxy_cache off;           # Don't cache SSE
proxy_read_timeout 600s;   # 10 min timeout for long chat sessions
```

## Rate Limiting

| Zone | Rate | Burst | Purpose |
|---|---|---|---|
| `api` | 30 r/s | 50 | General API protection |
| `chat` | 5 r/s | 10 | Chat endpoints (heavier) |
| `static` | 100 r/s | 200 | Static files |

```nginx
# Chat-specific rate limit
location /chat {
    limit_req zone=chat:10m rate=5r/s burst=10 nodelay;
    proxy_pass http://yiai_backend;
}
```

## Load Balancing

```nginx
upstream yiai_backend {
    least_conn;  # Least connections algorithm
    server 127.0.0.1:10086 weight=3 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:10087 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

| Algorithm | Best for |
|---|---|
| `least_conn` | Long-lived connections (SSE chat) |
| `ip_hash` | Session affinity (sticky sessions) |
| `round_robin` | Stateless, short-lived requests |

## Health Checks

```nginx
upstream yiai_backend {
    server 127.0.0.1:10086 max_fails=3 fail_timeout=30s;
    
    # Active health check (nginx plus only)
    # health_check uri=/health interval=10s fails=3 passes=2;
}
```

For open-source nginx, use `max_fails` + `fail_timeout` for passive health checks.

## YiAi-Specific Considerations

| Consideration | Setting |
|---|---|
| SSE streaming | `proxy_buffering off; proxy_read_timeout 600s` |
| Large file uploads | `client_max_body_size 100m` |
| RPC POST body | `proxy_set_header Content-Type application/json` |
| CORS for YiVad (8848) | `add_header Access-Control-Allow-Origin http://localhost:8848` |
| CORS for YiPet (extension) | `add_header Access-Control-Allow-Origin chrome-extension://*` |

## Testing

```bash
# Test the proxy
curl -s https://yi-ai.example.com/health

# Test SSE through proxy
curl -N https://yi-ai.example.com/ \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"module_name":"services.ai.chat_service","method_name":"chat","parameters":{"model":"qwen3.5","messages":[{"role":"user","content":"hi"}],"stream":true}}'

# Check rate limiting
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code}\n" https://yi-ai.example.com/health
done
# Should see 429s after exceeding the rate limit
```

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| `proxy_buffering on` with SSE | SSE chunks are buffered; user sees nothing until stream ends | `proxy_buffering off` for SSE endpoints |
| No `proxy_read_timeout` | 60s default timeout kills long chat sessions | Set to 600s (10 min) for chat |
| No rate limiting | Single client can overwhelm the API | Add rate limiting; 30 r/s is generous for an internal tool |
| SSL terminated at uvicorn | Slower; uvicorn is not an SSL terminator | Terminate SSL at nginx; uvicorn gets plain HTTP |