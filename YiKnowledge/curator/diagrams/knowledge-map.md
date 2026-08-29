---
title: Knowledge Map — What Knowledge Exists
aliases: [knowledge-map, kmap, explicit-tacit-map]
tags: [curator, diagrams, knowledge-map, governance, topology]
category: curator/diagrams
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Curators see the full knowledge topology — what knowledge exists, who holds it, and who consumes it"
acceptance_criteria:
  - "maps explicit knowledge (files) to role directories"
  - "identifies tacit knowledge holders"
  - "identifies knowledge consumers across YrY projects"
related:
  - ./README.md
  - ./user-journey.md
  - ./directory-blueprint.md
  - ../governance/governance.md
---

# Knowledge Map — What Knowledge Exists

> **Purpose:** Map the knowledge landscape — what we know, where it lives, who holds it, and who consumes it. Update quarterly.

## Explicit Knowledge (in YiKnowledge)

| Knowledge domain | Role directory | File count | Primary holder | Consumers |
|---|---|---|---|---|
| Implementation patterns | engineer/ | 50 | Engineering team | YiVad, YiAi, YiPet devs |
| Architecture decisions | leader/ | 45 | Tech lead | All engineers |
| Product requirements | producter/ | 27 | PM | Engineers, stakeholders |
| AI methodology | aier/ | 26 | AI engineer | YiAi devs, RAG users |
| Operations & reliability | srer/ | 20 | SRE | All engineers |
| Business strategy | executiver/ | 32 | Executives | PM, tech lead |
| Knowledge governance | curator/ | 25 | Curator | All knowledge authors |
| Demo projects | demos/ | 9 | Curator | YiVad PM users |
| Skills | skills/ | 30+ | Curator | Claude Code users |

## Tacit Knowledge (in people's heads)

| Knowledge | Holder | Criticality | Risk if lost | Mitigation |
|---|---|---|---|---|
| YiAi agent loop internals | Ruiyi | High | Agent bugs take days to fix | Documented in CLAUDE.md recent changes |
| YiVad ProTable patterns | Ruiyi | Medium | New YiVad features take longer | Partially documented in engineer/ |
| YiPet dual-world injection | Ruiyi | High | MV3 boundary bugs unexplained | Documented in YiPet CLAUDE.md |
| Ollama model selection rationale | Ruiyi | Medium | Wrong model chosen for new features | Partially in aier/platform/ |
| MongoDB schema design | Ruiyi | Medium | Schema changes cause regressions | In code (models/) but not reasoned about |

## Knowledge Gaps (identified but not yet documented)

| Gap | Priority | Owner | Status |
|---|---|---|---|
| YiVad component library reference | Medium | — | Not started |
| YiAi error code catalog with examples | Low | — | Error codes exist in code, not documented |
| YiPet content script debugging guide | Medium | — | Not started |
| Cross-project E2E test strategy | Low | — | Not started |

## Knowledge Consumers

| Consumer | What they consume | How |
|---|---|---|
| **YiAi BRD Agent** | All YiKnowledge files | RAG retrieval via llama_index |
| **YiAi RAG Engine** | engineer/, leader/, aier/ | Hybrid retrieval (vector + keyword) |
| **YiVad aiChat** | Chat sessions + RAG context | SSE streaming from YiAi |
| **YiPet chat** | RAG-grounded answers | SSE streaming from YiAi |
| **Claude Code** | CLAUDE.md files, YiKnowledge | Context injection |
| **Human developers** | All directories | Direct file reading, grep, INDEX navigation |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Tacit knowledge stays tacit | Single point of failure; knowledge leaves when the person leaves | Identify top 3 tacit knowledge items per quarter; document them |
| Knowledge map never updated | Map rots; shows wrong picture of what exists | Update quarterly; verify file counts and holders |
| Gaps identified but never filled | List grows; nothing changes | Assign an owner and timeline to every gap |