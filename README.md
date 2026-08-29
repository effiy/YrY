# YrY Monorepo

> Monorepo with 3 applications + 1 knowledge base — a full-stack AI-powered development platform.

## Features

- **YiVad** — Vue 3.5 admin dashboard with ProTable, dynamic routing, and button-level permissions
- **YiAi** — FastAPI backend with AI chat (Ollama), RAG (llama_index), file management, and RSS aggregation
- **YiPet** — Chrome MV3 extension that injects an interactive AI companion into any page
- **YiKnowledge** — Markdown knowledge base serving both humans and AI (RAG data source)

## Quick Start

```bash
# 1. Start YiAi backend (port 10086)
cd YiAi && python main.py

# 2. Start YiVad frontend (port 8848)
cd YiVad && pnpm dev

# 3. Build and load YiPet extension
cd YiPet && npm run build
# Load dist/ as unpacked extension in Chrome
```

## Architecture

```
YiPet (browser) ──fetch──→ YiAi (FastAPI :10086) ←──fetch── YiVad (SPA :8848)
     │                          │
     │ chrome.storage           │ MongoDB · Ollama · llama_index
     │                          │
     └── YiKnowledge ←──knowledge watcher (apscheduler)──┤
```

All frontend apps communicate with YiAi through a unified RPC envelope: `{module_name, method_name, parameters}`.

## Configuration

| Variable | Project | Default |
|----------|---------|---------|
| `RSBUILD_API_BASE` | YiPet, YiVad | `http://localhost:10086` |
| YiAi port | YiAi | `10086` |
| YiVad dev port | YiVad | `8848` |

## Development

```bash
# Conventional commits enforced by commitlint
pnpm commit  # YiVad — launches cz-git
npm run commit  # YiPet — launches cz-git
```

### Cross-project changes

1. Read both project CLAUDE.md files
2. Verify RPC parameter names (`filter` not `query`, `target_file` not `path`)
3. Test both sides
4. Update YiKnowledge if new patterns emerge

## Project Structure

```
YrY/
├── YiVad/          # Vue 3.5 admin dashboard
├── YiAi/           # FastAPI backend
├── YiPet/          # Chrome MV3 extension
├── YiKnowledge/    # Markdown knowledge base
├── rs.h5/          # H5 mobile project
└── rs.ui/          # UI component library
```

## License

Proprietary. All rights reserved.