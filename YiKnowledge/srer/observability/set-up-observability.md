---
title: Observability Setup — Yi Family Services
tags: [observability, srer, monitoring, health-check, logging]
category: srer/observability
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Engineers set up observability for Yi family services: health checks, logging, and manual monitoring procedures"
acceptance_criteria:
  - "Health check endpoints documented for each service"
  - "Logging configuration and log locations documented"
  - "Manual monitoring checklist for daily operations"
related:
  - ./README.md
  - ../incident-response/respond-to-an-incident.md
  - ../release/release-procedure.md
  - ../../../YiAi/CLAUDE.md
---

# Observability Setup

> **Current state: manual monitoring via health endpoints and logs.** No automated alerting, no dashboards, no metrics pipeline. This document describes what exists today and how to use it effectively.

## Health check endpoints

### YiAi

| Endpoint | Purpose | Expected | Notes |
|---|---|---|---|
| `GET /health/observer` | Overall health | `{"status":"ok","mongodb":"connected","ollama":"available"}` | Combined health check |
| `GET /rag-status` | RAG index status | `{"built":true,"num_docs":N,"last_built_at":"..."}` | Check after knowledge changes |
| `GET /knowledge-scan` | Knowledge base scan | `{"files":N,"categories":[...]}` | Verify watcher is syncing |

### Health check script

```bash
#!/bin/bash
# check-health.sh — Run manually or via cron every 5 minutes

echo "=== YiAi Health ==="
curl -s http://localhost:10086/health/observer | python3 -m json.tool

echo "=== RAG Status ==="
curl -s http://localhost:10086/rag-status | python3 -m json.tool

echo "=== Ollama Models ==="
curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; [print(m['name']) for m in json.load(sys.stdin)['models']]"
```

## Logging

### YiAi logs

| Log source | Location | What to look for |
|---|---|---|
| uvicorn stdout | Terminal where `python main.py` runs | Request logs, errors, stack traces |
| Agent loop | stdout with `[Agent]` prefix | Turn progress, tool calls, confirmations, escalation |
| Knowledge watcher | stdout with `[Knowledge]` prefix | Sync cycles, file counts, errors |
| Python exceptions | stdout | Stack traces with file:line |

### Key log patterns to monitor

```bash
# Agent errors
tail -f /dev/stdout | grep "\[Agent\].*error"

# Watcher sync failures
tail -f /dev/stdout | grep "\[Knowledge\].*failed"

# MongoDB connection errors
tail -f /dev/stdout | grep "pymongo.errors"

# Ollama connection errors
tail -f /dev/stdout | grep "ConnectionError.*11434"
```

### YiVad logs

| Log source | Location | What to look for |
|---|---|---|
| Browser console | Chrome DevTools → Console | 401 (token), 422 (parameter), SSE errors |
| Network tab | Chrome DevTools → Network | Failed requests, slow responses |
| Build output | Terminal | `vue-tsc` errors, build warnings |

### YiPet logs

| Log source | Location | What to look for |
|---|---|---|
| Service worker console | `chrome://extensions` → YiPet → Service Worker | Extension errors |
| Popup console | Right-click popup → Inspect | Popup errors |
| Chat window console | Chat window → Inspect | SSE errors, API errors |
| Dev-gated logger | Console (when `RSBUILD_LOG_LEVEL=debug`) | API client logs |

## Manual monitoring checklist

### Daily (5 minutes)

- [ ] Run `check-health.sh` — verify all endpoints return `ok`
- [ ] Check YiAi stdout for error patterns (last 50 lines)
- [ ] Verify knowledge watcher synced: `curl http://localhost:10086/rag-status`
- [ ] Check disk space (YiAi dual-writes to disk): `df -h`

### Weekly (15 minutes)

- [ ] Review YiAi logs for agent errors and escalation events
- [ ] Check MongoDB collection sizes: `db.stats()` in mongo shell
- [ ] Verify RAG index doc count matches YiKnowledge file count
- [ ] Check for stale knowledge files: `rg "last_verified: 2025" YiKnowledge -l`

### Post-deployment (15 minutes)

- [ ] Run health checks on all endpoints
- [ ] Send a test chat message through YiVad and YiPet
- [ ] Verify knowledge watcher detects new files
- [ ] Check browser consoles for new errors

## Known monitoring gaps

| Gap | Impact | Mitigation |
|---|---|---|
| No automated alerting | Incidents discovered by users, not operators | Manual health checks; consider adding cron-based alerting |
| No metrics pipeline | No historical data on uptime, latency, error rates | Consider adding Prometheus + Grafana |
| No log aggregation | Logs scattered across terminals | Consider adding a simple log file with rotation |
| No disk usage monitoring | YiAi dual-writes can fill disk silently | `df -h` in daily checklist |
| No MongoDB connection pooling metrics | Connection exhaustion not detected | Monitor `pymongo.errors` in logs |

## Setting up basic alerting (recommended next step)

Add a cron job that runs `check-health.sh` every 5 minutes and sends a notification on failure:

```bash
# crontab -e
*/5 * * * * /path/to/check-health.sh || echo "YiAi health check failed at $(date)" >> /tmp/yiai-alerts.log
```

## Anti-patterns

- **Checking only YiAi's health endpoint.** YiAi can be healthy while YiVad has a broken build or YiPet has a CDN loading failure. Check all services in the daily checklist.
- **Ignoring disk space.** YiAi dual-writes files to disk. A full disk causes silent write failures. Disk space is the most common avoidable outage.
- **No baseline for "normal" error rates.** Without knowing what "normal" looks like, you can't detect anomalies. Start by logging the daily error count for a week to establish a baseline.