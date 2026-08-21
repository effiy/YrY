---
title: YiAi Development Standards
tags: [yiai, standards, conventions, backend]
category: engineer/learn/projects/yiai
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Quick reference to YiAi coding conventions and RPC field contracts"
related:
  - ./README.md
  - ./architecture.md
  - ./functional-modules.md
---

# YiAi Development Standards

> Full standards in [README.md](./README.md) and [CLAUDE.md](../../../../YiAi/CLAUDE.md). Quick reference below.

## Naming

- **Files**: snake_case
- **Domain modules**: `domain/<name>/` with `__init__.py` public API
- **Services**: `services/<name>/<name>_service.py`
- **Routes**: `server/routes/<name>.py`

## Layer discipline

- Routes → Services → Domain → Data (never skip layers)
- Domain packages never import `server/`
- Callers use `__init__.py` re-exports, not internal files

## RPC field contracts (load-bearing)

| Correct | Wrong | Context |
|---------|-------|---------|
| `filter` | `query` | `data_service.query_documents` |
| `target_file` | `path` | `/read-file`, `/write-file` |
| `cname` | `collection_name` | `data_service` collection parameter |

## Configuration

- `config.yaml` + pydantic-settings
- Flat YAML keys mapped via `YamlConfigSettingsSource`

## Testing

- pytest 8 + pytest-asyncio + httpx + pytest-cov
- Directory: `tests/{unit,integration,eval}/`
- Run: `python -m pytest tests/ -v`