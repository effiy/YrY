---
title: Incident Response Procedure
tags: [incident-response, srer, oncall, procedure]
category: srer/incident-response
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Oncall engineers follow a clear, step-by-step incident response procedure covering detection, triage, mitigation, and postmortem"
acceptance_criteria:
  - "4-phase response procedure with clear handoffs"
  - "Degradation countermeasures for each Yi family service"
  - "Postmortem template included"
related:
  - ./README.md
  - ../../leader/risk/
  - ../../../YiAi/CLAUDE.md
  - ../../../YiVad/CLAUDE.md
  - ../../../YiPet/CLAUDE.md
---

# Incident Response Procedure

> **4-phase response: Detect → Triage → Mitigate → Learn.** Every incident follows this procedure. The goal is to restore service first, understand root cause second.

## Phase 1: Detect

### Monitoring sources

| Source | What it detects | Where |
|---|---|---|
| YiAi `/health/observer` | MongoDB connectivity, Ollama availability | `GET /health/observer` |
| YiAi logs | Agent errors, SSE stream failures, watcher sync failures | uvicorn stdout |
| YiVad browser console | 401 (token expired), 422 (parameter mismatch), SSE aborts | Browser DevTools |
| YiPet chat window | API client errors, SSE stream failures | Chat window error toasts |

### Degradation countermeasures (Yi family)

| Service | Condition | Behavior |
|---|---|---|
| YiAi — MongoDB | Unreachable | Writes fail fast; reads return empty results |
| YiAi — Ollama | Unreachable | Chat returns `ErrorCode.AI_UNAVAILABLE`; image processing returns 503 |
| YiAi — OSS | Unreachable | File storage falls back to local disk only |
| YiVad — Menu API | Unavailable | Falls back to `authMenuList.json` static file |
| YiVad — Token | Expired | 401 interceptor redirects to login |
| YiPet — YiAi | Unreachable | API client retries with exponential backoff, surfaces typed error |

## Phase 2: Triage

### Severity levels

| Level | Definition | Response time | Example |
|---|---|---|---|
| P0 — Critical | YiAi down, all Yi family services unavailable | Immediate | MongoDB unreachable, uvicorn crashed |
| P1 — Major | One service degraded, workaround exists | <30 min | Ollama unreachable (chat down, data CRUD still works) |
| P2 — Minor | Non-critical feature broken | <4 hours | Knowledge watcher stale, RAG index outdated |
| P3 — Cosmetic | Visual bug, no functional impact | Next business day | UI layout issue, i18n missing key |

### Triage questions

1. What service is affected? (YiAi / YiVad / YiPet / YiKnowledge)
2. What is the user impact? (Can users still accomplish their tasks?)
3. Is there a workaround? (Can users switch to an alternative path?)
4. Is this a known degradation scenario? (Check the countermeasures table above)

## Phase 3: Mitigate

### Immediate actions (first 5 minutes)

1. **Check YiAi health**: `curl http://localhost:10086/health/observer`
2. **Check MongoDB**: Is the MongoDB process running? Can YiAi connect?
3. **Check Ollama**: Is Ollama running? `curl http://localhost:11434/api/tags`
4. **Check disk**: Is the disk full? (YiAi dual-writes to disk)
5. **Check recent changes**: `git log --oneline -5` in the affected project

### Service-specific recovery

**YiAi not responding**:
```bash
# Check if uvicorn is running
ps aux | grep uvicorn
# Restart if needed
cd YiAi && python main.py
```

**MongoDB unreachable**:
```bash
# Check MongoDB status
brew services list | grep mongodb
# Restart if needed
brew services restart mongodb-community
```

**Ollama unreachable**:
```bash
# Check Ollama status
curl http://localhost:11434/api/tags
# Restart if needed
ollama serve
```

**Knowledge watcher stale**:
```bash
# Check watcher logs for "0 files synced"
# Manually trigger sync
curl -X POST http://localhost:10086/knowledge-sync
```

## Phase 4: Learn

### Postmortem template

After every P0 or P1 incident, complete this within 24 hours:

```markdown
# Incident Postmortem: <title>

## Timeline
- [HH:MM] Incident detected (how?)
- [HH:MM] Response started (who?)
- [HH:MM] Root cause identified
- [HH:MM] Mitigation applied
- [HH:MM] Service restored
- Total downtime: <N> minutes

## Impact
- What was affected?
- How many users impacted?
- What data was lost or corrupted (if any)?

## Root Cause
- What specifically caused the failure?
- Why wasn't it caught earlier?

## Resolution
- What was done to restore service?
- Was the fix a workaround or permanent?

## Action Items
- [ ] Short-term fix (this week)
- [ ] Long-term prevention (this sprint)
- [ ] Monitoring improvement (add alert for this failure mode)

## Lessons Learned
- What would we do differently next time?
- What worked well in the response?
```

## Health check endpoints

| Endpoint | Purpose | Expected response |
|---|---|---|
| `GET /health/observer` | YiAi overall health | `{"status": "ok", "mongodb": "connected", "ollama": "available"}` |
| `GET /rag-status` | RAG index status | `{"built": true, "num_docs": N, "last_built_at": "ISO timestamp"}` |
| `GET /knowledge-scan` | Knowledge base scan | `{"files": N, "categories": [...]}` |

## Anti-patterns

- **Restarting services without checking logs first.** The logs contain the root cause. Restarting destroys evidence. Always `tail -100` before `restart`.
- **No postmortem for P1 incidents.** "It was a quick fix" is not a reason to skip the postmortem. The postmortem is how you prevent the next incident.
- **Fixing the symptom, not the root cause.** MongoDB unreachable → restart MongoDB. But why was it unreachable? Disk full? OOM? Network partition? Fix the root cause, not just the symptom.