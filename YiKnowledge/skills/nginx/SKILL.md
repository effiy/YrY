---
title: nginx
name: nginx
description: >
  Nginx operations — configuration, reverse proxy, load balancing, SSL
  termination, caching, security hardening, and logging. Invoke when the user
  is configuring Nginx server blocks, setting up reverse proxy, debugging 502/504
  errors, configuring SSL/TLS, optimizing static file serving, or setting up
  rate limiting. Trigger words: "nginx", "nginx.conf", "server block",
  "reverse proxy", "proxy_pass", "load balancing", "upstream", "SSL nginx",
  "Let's Encrypt nginx", "rate limiting nginx", "limit_req", "gzip", "cache",
  "proxy_cache", "CORS nginx", "redirect nginx", "rewrite", "location block",
  "try_files", "WebSocket nginx", "HTTP/2", "HTTP/3", "nginx log", "access_log",
  "error_log".
  Do NOT trigger for: Apache httpd, Caddy, Traefik, HAProxy, or general web
  server theory without Nginx-specific configuration.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/nginx
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - nginx
  - infrastructure
  - devops
chip: backend
---
# Nginx

Nginx configuration and operations for production deployments.

## Core Concepts

- **Configuration** — `nginx.conf`, server blocks, location blocks, includes
- **Reverse Proxy** — `proxy_pass`, headers, timeouts, buffering
- **Load Balancing** — upstream groups, balancing algorithms, health checks
- **SSL/TLS** — certificate configuration, HSTS, modern cipher suites
- **Security** — rate limiting, IP allow/deny, request filtering, CORS

## Key Rules

1. Always test configuration with `nginx -t` before reloading
2. Use `try_files` for SPA routing, not `if` blocks
3. Set proper `proxy_set_header` values when proxying — `Host`, `X-Real-IP`, `X-Forwarded-For`
4. Enable gzip for text-based responses — but don't compress images
5. Rate-limit sensitive endpoints (`login`, `api`) with `limit_req_zone`