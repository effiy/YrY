---
title: "Win: YiPet Cross-Project Hub — One Extension, Every Project"
tags: [win, yipet, cross-project, bridge, integration]
category: engineer/learn/lessons/wins
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers understand the architectural pattern of making a browser extension the cross-project integration hub"
acceptance_criteria:
  - "What was built and why it succeeded"
  - "Key architectural decisions that enabled success"
  - "Replicable pattern for future cross-project integration"
related:
  - ./README.md
  - ../../../../YiPet/CLAUDE.md
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiAi/CLAUDE.md
---

# Win: YiPet Cross-Project Hub

> **2026-08-05 sprint.** YiPet became the cross-project integration hub in a single sprint — bug reporting, bridges to YiVad, knowledge grounding, and session management, all from a floating chat window on any page.

## What was built

In one sprint, YiPet gained:

- **Bug reporting** — Spot a bug on any page, log it from YiPet. Metadata → MongoDB `bugs`, body → `YiKnowledge/lessons/failures/bugs/<key>.md`
- **Recent Bugs tab** — Sidebar tab listing 30 most recent bugs. Click → open in YiVad. "Discuss" → seed chat with RAG scope from the bug's markdown body
- **YiVad aiChat bridge** — Toolbar button seeds a YiVad session with page context, then `window.open`s the session
- **Per-message bridge** — Each pet response has an "Open in YiVad" button that seeds a session with the message content
- **Cross-project navigation dropdown** — Quick links to YiAi, YiVad admin, aiChat, code-review, BRD, Story Board
- **Page-aware session filter** — Filter sessions by current page (hostname + pathname)
- **Page-aware context chip** — Detects YiVad detail pages (bug/BRD/story) and offers one-click contextual prompts
- **Knowledge grounding** — RAG-scoped chat with per-file and folder-scoped retrieval, knowledge tree browser, file preview, save-to-knowledge
- **Session features** — Export as markdown, branch from message, summarize session, auto-generate title

## Why it succeeded

**1. YiPet's unique position as a browser extension.** YiPet sits on top of every page the user visits. It can see the URL, read the page content, and inject UI. This makes it the natural cross-project hub — no other component in the Yi family has this vantage point.

**2. The four-tier API layer was already in place.** When the sprint started, the API layer (`client → endpoints → types → services`) was already established. Adding `BugService`, `KnowledgeService`, and `RagService` followed the same pattern. The architecture absorbed new capabilities without refactoring.

**3. YiAi's unified backend.** Every cross-project feature (bug reporting, session seeding, knowledge access) goes through the same YiAi backend. The RPC envelope means new features don't need new endpoints — they reuse `data_service`, `knowledge_service`, and `rag_service`.

**4. Session-based state management.** The chat controller's `useSyncExternalStore` pattern made it easy to add new state (sidebar views, RAG scope, knowledge tree) without breaking existing features. Each new feature added fields to `ChatState` and actions to the controller — no architectural changes needed.

## Replicable pattern

The cross-project hub pattern is replicable for any browser extension that needs to integrate with multiple web apps:

1. **Position the extension as the observer** — It can see any page the user visits
2. **Build bridges, not walls** — Each bridge is a one-way link: detect context → create session → open in target app
3. **Use the backend as the integration layer** — All cross-project data flows through YiAi, not direct app-to-app communication
4. **Add features as state + actions** — The controller pattern makes feature additions additive, not transformative

## Key metrics

- **0 architectural changes** — All new features were additive
- **~15 new controller actions** — Each feature added 1-3 actions to the existing controller
- **4 new sidebar tabs** — Knowledge, Stories, Bugs added alongside Sessions
- **3 new API services** — BugService, KnowledgeService, RagService following the existing four-tier pattern