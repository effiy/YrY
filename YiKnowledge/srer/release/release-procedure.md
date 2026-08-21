---
title: Release Procedure — Yi Family Services
tags: [release, srer, procedure, deployment, rollback]
category: srer/release
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Engineers follow a consistent release procedure for YiAi, YiVad, and YiPet with rollback plans and verification steps"
acceptance_criteria:
  - "Release procedure for each Yi family service"
  - "Rollback procedure with verification"
  - "Pre-release and post-release checklists"
related:
  - ./README.md
  - ../incident-response/respond-to-an-incident.md
  - ../../../YiAi/CLAUDE.md
  - ../../../YiVad/CLAUDE.md
  - ../../../YiPet/CLAUDE.md
---

# Release Procedure

> **Release = Build + Verify + Deploy + Monitor.** Each Yi family service has its own release path. All releases follow the same pre-release → deploy → verify → rollback pattern.

## Pre-release checklist (all services)

- [ ] All tests pass (`npm test`, `pnpm type:check`, `vue-tsc --noEmit`)
- [ ] Lint passes (`npm run lint`, `pnpm lint:eslint`, `ruff check`)
- [ ] Build succeeds (`npm run build`, `pnpm build:pro`)
- [ ] Breaking changes documented in CLAUDE.md "Recent Changes"
- [ ] Cross-project contract changes documented in RPC protocol reference
- [ ] Rollback plan written (see below)

## YiAi (Python backend)

### Deploy
```bash
cd YiAi
git pull
pip install -r requirements.txt
# Restart uvicorn
pkill -f uvicorn
python main.py &
```

### Verify
```bash
curl http://localhost:10086/health/observer
# {"status": "ok", "mongodb": "connected", "ollama": "available"}

curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name":"services.database.data_service","method_name":"query_documents","parameters":{"cname":"menus","pageSize":1}}'
# Should return {"code": 0, "data": {"list": [...]}}
```

### Rollback
```bash
git checkout <previous-commit>
pip install -r requirements.txt
pkill -f uvicorn
python main.py &
```

## YiVad (Vue 3 SPA)

### Deploy
```bash
cd YiVad
git pull
pnpm install
pnpm build:pro
# Deploy dist/ to web server or serve locally
pnpm dev   # for local dev
```

### Verify
```bash
# Check build output
ls dist/index.html
# Verify TypeScript
pnpm type:check
# Open browser and check:
# - Login works
# - Menu loads (dynamic routes from backend)
# - ProTable pages render
# - aiChat SSE streaming works
```

### Rollback
```bash
git checkout <previous-commit>
pnpm install
pnpm build:pro
```

## YiPet (Chrome Extension)

### Deploy
```bash
cd YiPet
git pull
npm install
npm run build
npm run typecheck
npm test
# Load dist/ as unpacked extension in Chrome
```

### Verify
```bash
# In Chrome:
# - Pet appears on any page
# - Ctrl+Shift+X opens chat
# - Chat SSE streaming works
# - Popup opens and settings persist
# - Knowledge tree loads
# - RAG grounding works
npm test   # All tests pass
```

### Rollback
```bash
git checkout <previous-commit>
npm install
npm run build
# Reload extension in chrome://extensions
```

## YiKnowledge (Markdown KB)

### Deploy
```bash
cd YiKnowledge
git pull
# YiAi's knowledge watcher picks up changes within 5 seconds
# Verify: curl http://localhost:10086/knowledge-scan
```

### Verify
```bash
# Check watcher synced
curl http://localhost:10086/rag-status
# {"built": true, "num_docs": N}
# Verify cross-references
# Run the readiness checklist for any new files
```

### Rollback
```bash
git checkout <previous-commit>
# Watcher picks up the reverted files within 5 seconds
```

## Release coordination

When a change spans multiple services (e.g., new RPC parameter), release in this order:

1. **YiAi first** — Backend must support the new contract before frontends use it
2. **YiVad + YiPet** — Can deploy in parallel after YiAi is verified
3. **YiKnowledge** — Last, if the change includes documentation updates

## Post-release monitoring

After every release, monitor for 15 minutes:

- [ ] YiAi `/health/observer` returns ok
- [ ] YiVad pages load without console errors
- [ ] YiPet chat streaming works
- [ ] No spike in 401 (token), 422 (parameter), or 500 errors
- [ ] Knowledge watcher syncs successfully (check logs)

## Anti-patterns

- **Deploying YiVad before YiAi when the change adds a new API parameter.** YiVad will send the new parameter, YiAi won't recognize it, and the error behavior depends on whether it's silently ignored (wrong results) or rejected (422).
- **Skipping the rollback plan.** "We'll figure it out if something goes wrong" is how 15-minute incidents become 2-hour incidents. Write the rollback plan before deploying.
- **Deploying on Friday afternoon.** The Yi family has no automated alerting or monitoring beyond health endpoints. A Friday deploy means finding out about problems on Monday.