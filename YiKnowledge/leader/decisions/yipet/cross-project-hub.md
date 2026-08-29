---
title: "ADR: YiPet Cross-Project Hub — Bug Reporting, Bridges, Navigation"
tags: [adr, yipet, cross-project, bug-reporting, bridge, navigation]
category: leader/decisions/yipet
created: 2026-08-24
updated: 2026-08-24
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the cross-project hub design — bug reporting to YiKnowledge, bridges to YiVad, and page-aware context"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ./chrome-mv3-dual-world.md
  - ../../yivad/agent-mode-pi-loop.md
---

# ADR: YiPet Cross-Project Hub — Bug Reporting, Bridges, Navigation

> **Status**: Accepted (2026-08-05) — implemented

## Context

YiPet operates as a browser extension on any page, but the Yi family has two other surfaces: YiVad (admin dashboard) and YiKnowledge (markdown knowledge base). Users needed to seamlessly move between these surfaces — report a bug from any page, open a YiVad session from the chat window, and navigate to project dashboards. Without cross-project bridges, each surface was an island.

The question was: should YiPet be a self-contained chat tool, or should it serve as the entry point to the Yi family ecosystem?

## Decision

**Position YiPet as the cross-project hub — the browser extension that bridges any page into the Yi family ecosystem via bug reporting, session seeding, and contextual navigation.**

### Architecture

```
YiPet (browser extension on any page)
  │
  ├── Bug Reporting
  │   ├── BugReportDialog → form (severity/priority/status/type/...)
  │   ├── Metadata → MongoDB bugs collection
  │   └── Long-form body → YiKnowledge/lessons/failures/bugs/<key>.md
  │
  ├── Cross-Project Bridges
  │   ├── YiVad aiChat bridge → seed session → window.open YiVad/#/aiChat?session=<key>
  │   ├── Per-message export → "Open in YiVad aiChat" button
  │   └── Page-aware context → detect YiVad detail pages, offer contextual prompts
  │
  └── Navigation
      ├── Cross-project dropdown → YiAi, YiVad, aiChat, BRD, Story Board links
      └── Recent Bugs sidebar tab → list 30 most recent, click → YiVad detail
```

### Key design decisions

1. **Dual-write bug reporting**: Metadata (severity, priority, assignee, tags) goes to MongoDB `bugs` collection for structured querying. Long-form body (description, steps, expected, actual) goes to `YiKnowledge/lessons/failures/bugs/<key>.md` for RAG indexing. This split keeps structured data queryable and narrative content searchable via RAG.

2. **Session-seeding bridge to YiVad**: Instead of building a full aiChat UI in the extension, YiPet seeds a session via `SessionService.create` with page context (URL, title, body), then `window.open`s YiVad's aiChat page with the session key. YiVad handles the full agent mode UI; YiPet is the entry point.

3. **Page-aware context detection**: `detectProjectFromUrl` inspects the current page URL to determine if it's a YiVad detail page (bug, BRD, story). If so, offers contextual one-click prompts: "Discuss bug <key>", "Summarize BRD <key>", "Walk me through <key>".

4. **Page-aware session filter**: `EnvironmentOutlined` button filters sessions to only those from the current page (hostname + pathname + hash-path). This lets users see conversation history scoped to the page they're on.

5. **Recent Bugs sidebar tab**: Fourth sidebar tab listing 30 most recent bugs from MongoDB. Click opens detail in YiVad; "Discuss" button seeds chat input + RAG scope from the bug's `contentPath`.

### Consequences

- **Positive**: YiPet becomes the ecosystem entry point; bug reporting is available from any page; contextual prompts reduce friction for common tasks
- **Negative**: YiPet now depends on YiVad being available for detail views; the dual-write bug reporting has two failure points (MongoDB + filesystem)
- **Risk**: `window.open` to YiVad may be blocked by popup blockers; the `localhost:8848` URL is hardcoded and breaks if YiVad port changes

## Alternatives considered

1. **Build full aiChat UI in YiPet** — rejected because it duplicates YiVad's agent mode UI; the session-seeding bridge is lighter and keeps the canonical UI in one place
2. **Bug reporting only to MongoDB** — rejected because narrative bug descriptions benefit from RAG indexing in YiKnowledge
3. **No cross-project bridges (self-contained)** — rejected because it leaves YiPet as an island; the ecosystem value is in the bridges