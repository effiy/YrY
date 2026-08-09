---
title: RAG System Pages — Menu & UI Reference
tags:
- RAG
- UI
- YiVad
- Documentation
category: engineer/projects/yivad
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
- ai-engineer
benefit: project context preserved
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../new-hire/onboarding/yivad--onboarding.md
- ./engineering/claude.md
- ../INDEX.md
tacit: false
---

# RAG System Pages — Menu & UI Reference

> **As an** engineer, **I want to** rag system pages reference, **so that** project context preserved. 

## Summary

- The RAG system is a developer tool with five pages under `/rag` namespace: Dashboard (index health + quick query), Retrieval Explorer (raw vector/BM25 inspection), RAG Chat (streaming conversational with inline citations), RAG vs Baseline (side-by-side comparison), and Query History (searchable in-memory log)
- The Dashboard-as-hub pattern is more valuable than any individual page — it provides at-a-glance index health, quick query capability, and navigation links so users don't need to know which page to visit for which task
- Raw `el-table` is the correct choice for retrieval results and history pages despite ProTable being the canonical table pattern — ProTable is designed for server-paginated CRUD, while RAG pages work with in-memory arrays and custom column rendering (progress bars, score colors, tag badges)
- The inline citation system (`[Source N]` → `[N]` → superscript badge) is a fragile three-party contract between the backend's `_NumberSourcesPostprocessor`, the LLM's citation behavior, and the frontend's rendering — any change to the numbering scheme silently breaks the mapping
- Query history is intentionally ephemeral (Pinia store, last 20, cleared on browser restart) — the RAG system is a developer tool, not a production audit system

## Core viewpoints

**The RAG system is a developer tool, not a production audit system, and that identity shapes every design decision.** No backend persistence for query history (Pinia store holds last 20 in memory, cleared on browser restart), no paginated server-side tables (raw `el-table` used because data is in-memory arrays), and no authentication beyond the existing app login. Adding production-grade persistence and audit would change the cost profile and architectural complexity significantly.

**The Dashboard-as-hub pattern is more valuable than any individual RAG page.** The dashboard provides at-a-glance index health, quick query capability, and navigation links to deeper tools. This prevents users from needing to know which page to visit for which task. The methodology links (rag-design-patterns, rag-system-prompt) embedded in the dashboard close the loop between tool usage and concept learning.

**Raw `el-table` is the correct choice for the retrieval results and history pages, despite ProTable being the canonical table pattern.** ProTable is designed for server-paginated CRUD operations. The RAG pages work with in-memory arrays from the Pinia store and use custom column rendering (progress bars, score color coding, tag badges). Forcing ProTable onto this use case would be over-engineering and would require a fake pagination layer.

**The inline citation system (`[N]` markers) is a contract between the backend and frontend that must stay in sync.** The backend's `_NumberSourcesPostprocessor` prepends `[Source N]` to chunks, the LLM is prompted to emit `[N]` markers, and the frontend renders them as superscript badges mapped to the sidebar source list. A change to the numbering scheme on the backend would silently break the citation mapping in the frontend.

**The RAG vs Baseline comparison page is an evaluation tool, not a production feature.** Side-by-side comparison of RAG-grounded vs plain LLM answers on the same question is valuable for understanding RAG's impact, but the comparison metrics (response lengths, source count, best score) are qualitative, not quantitative. The page is a developer tool for intuition-building, not a replacement for a proper evaluation framework like ragas.

## Key info

- **RAG system page architecture (5 pages under `/rag` namespace)**: (1) Dashboard — index health at-a-glance (document count, chunk count, last indexed timestamp), quick query bar, navigation links to deeper tools; serves as the hub that prevents users from needing to know which page to visit for which task; (2) Retrieval Explorer — raw vector/BM25 inspection, shows retrieved chunks with scores, allows switching between retrieval methods and comparing results; (3) RAG Chat — streaming conversational interface with inline citations (`[N]` superscript badges mapped to sidebar source list), scope filter by file path; (4) RAG vs Baseline — side-by-side comparison of RAG-grounded vs. plain LLM answers on the same question; qualitative metrics (response lengths, source count, best score); (5) Query History — searchable in-memory log (Pinia store, last 20 queries, cleared on browser restart). No backend persistence for query history — the RAG system is intentionally a developer tool, not a production audit system.
- **Inline citation system contract (3-party dependency)**: Backend — `_NumberSourcesPostprocessor` prepends `[Source N]` to each chunk before sending to LLM; LLM — prompted to emit `[N]` markers in its response referencing the source numbers; Frontend — renders `[N]` as superscript badges mapped to the sidebar source list (path + snippet + score). Any change to the numbering scheme on the backend silently breaks the citation mapping in the frontend. The contract is fragile because it spans three independently maintained components.
- **Table component selection rationale (raw `el-table` vs. ProTable)**: ProTable is the canonical table pattern in YiVad, designed for server-paginated CRUD operations. The RAG pages use raw `el-table` because: (1) data is in-memory arrays from Pinia store, not server-paginated; (2) custom column rendering required (progress bars for scores, color coding for score ranges, tag badges for metadata); (3) ProTable's pagination/search/column-config features would be over-engineering for in-memory data. This is a deliberate exception to the ProTable-first rule, justified by the fundamentally different data access pattern.
- **Dashboard-as-hub pattern implementation**: The dashboard provides: (1) Index health summary — document count, chunk count, last indexed timestamp, index size; (2) Quick query — single text input that queries the RAG system and shows top 3 results with scores; (3) Navigation links — cards linking to each of the 4 deeper tool pages with descriptions of when to use each; (4) Methodology links — embedded links to `rag-design-patterns-summary.md` and `rag-system-prompt.md` to close the loop between tool usage and concept learning. The hub pattern is more valuable than any individual page because it eliminates the need for users to understand the tool landscape before they can use it.
- **Query history design decisions**: Intentionally ephemeral — Pinia store holds last 20 queries, cleared on browser restart. No backend persistence, no pagination, no export. Rationale: (1) the RAG system is a developer tool, not a production audit system; (2) adding production-grade persistence would require authentication, authorization, retention policies, and data compliance — a significant architectural change; (3) developers typically need recent queries for debugging, not historical queries for compliance. If production audit requirements emerge, the query history would need a full backend persistence layer with retention policies.
- **YiVad RAG system state (2026-08)**: All 5 pages implemented and functional. RAG chat uses hybrid retrieval (vector + BM25) with cross-encoder reranking targeting faithfulness > 0.9 and context recall > 0.8. The RAG API modules (`ragService.ts`) and Pinia stores (`rag.ts`) were added 2026-07-31. The system is used by the internal team (3-4 engineers) for YiKnowledge exploration and debugging. No production users, no authentication beyond existing app login, no audit requirements.

## 1. Menu Structure

The RAG system in YiVad consists of five pages under a unified `/rag` namespace:

| Path | Route Name | Title | Description |
|------|-----------|-------|-------------|
| `/rag` | `rag` | RAG System | Dashboard with index health, config overview, quick query, recent activity |
| `/rag/retrieval` | `ragRetrieval` | Retrieval Explorer | One-shot semantic search — inspect raw retriever output with ranked results table and detail drawer |
| `/rag/chat` | `ragChat` | RAG Chat | Streaming conversational interface grounded in YiKnowledge with inline [N] citations and expandable sources |
| `/rag/compare` | `ragCompare` | RAG vs Baseline | Side-by-side comparison of RAG-grounded vs plain LLM (no retrieval) on the same question |
| `/rag/history` | `ragHistory` | Query History | Searchable log of past retrieval queries with stats, detail view, and rerun capability |

All sub-pages use `activeMenu: "/rag"` so the sidebar highlights the parent RAG System entry when any child is active.

## 2. Page Details

### 2.1 Dashboard (`/rag`)

**Purpose:** Operational overview — index health, retrieval configuration, and quick actions.

**Key UI elements:**

| Element | Description |
|---------|-------------|
| Index Status Card | Shows built/not-built health tag, document count, last-build timestamp, persist directory path, and any errors |
| Retrieval Configuration Card | Displays embedding model, LLM model, chunk size/overlap, hybrid retrieval status (Vector+BM25 or Vector only), rerank toggle, inline citation status |
| Quick Query Card | Inline text input → one-shot `ragQuery(top_k=5)` → top-3 results with score badges and path labels |
| Recent Queries Table | Last 5 queries from the Pinia store's in-memory history: question, scope tag, top-k, result count, best score progress bar, timestamp |
| Methodology Links | Quick links to `rag-design-patterns-summary.md` and `rag-system-prompt.md` in the knowledge base |

**Actions:**
- "Retrieval Explorer" → `/rag/retrieval`
- "Chat" → `/rag/chat`
- "Rebuild Index" → triggers `POST /rag-build`, updates status

### 2.2 Retrieval Explorer (`/rag/retrieval`)

**Purpose:** Raw retriever inspection — see exactly what chunks come back from the vector/BM25 pipeline, without LLM generation.

**Query controls:**
- Question textarea (Enter+Ctrl to submit)
- Top-K number input (1–50)
- Scope text input (substring filter on `file_path`, e.g. `projects/YiVad`)

**Results table columns:**

| Column | Type | Description |
|--------|------|-------------|
| `#` | Index | 1-based rank in retrieved order |
| Relevance | Progress bar | Cosine similarity score 0–100% with color coding: ≥70% green, ≥40% amber, <40% red |
| Document | Icon + path | Relative path from YiKnowledge root, monospace font |
| Category | Tag | Frontmatter `category` field (methodology, tech, work, projects, resources, industry) — color-coded |
| Type | Tag | Frontmatter `type` field (summary, prompt, protocol, reference, etc.) |
| Chunk Preview | Text (truncated) | First ~60 chars of chunk text with `[Source N]` prefix stripped |
| Chars | Number | Character count of the chunk |
| Actions | Button | "Inspect" → opens detail drawer |

**Detail drawer** shows: document link (→ Knowledge Base), relevance score progress bar, metadata table (all non-internal frontmatter fields), full chunk text (pre-formatted, scrollable), copy and open-in-KB actions.

**Empty state** provides diagnostic tips: broaden scope, use general terms, check index status, rebuild.

### 2.3 RAG Chat (`/rag/chat`)

**Purpose:** Conversational RAG — multi-turn chat where each assistant answer is grounded in retrieved YiKnowledge chunks.

**Key features:**
- Scope filter for targeted KB subsets
- Example prompts as clickable tags in the welcome state
- Streaming responses with real-time text accumulation
- Inline `[N]` citation markers rendered as superscript badges
- Expandable sources panel per assistant message:
  - Click to expand/collapse
  - Each source chip shows `[N]`, file path, mini progress bar, and score
  - Click a source chip → opens detail dialog with full text + score
- Stop button to abort in-flight generation
- Enter to send, Shift+Enter for newline

### 2.4 RAG vs Baseline (`/rag/compare`)

**Purpose:** Quality evaluation — compare RAG-grounded answers against plain LLM (Ollama without retrieval) on identical questions.

**Side-by-side panels:**
- **Left (RAG):** Green "RAG" badge, streaming indicator, sources list with scores, error display
- **Right (Baseline):** Amber "Baseline" badge, streaming indicator, hallucination warning note, error display

**Comparison metrics** (shown after both complete):
- Response lengths and ratio
- RAG source count and best score
- Error comparison

### 2.5 Query History (`/rag/history`)

**Purpose:** Audit trail — browse, search, and replay past retrieval queries.

**Stats row:** Total queries, unique scopes, average best score, total sources retrieved.

**Table columns:**

| Column | Type | Description |
|--------|------|-------------|
| Time | Datetime | Formatted locale timestamp |
| Question | Text (truncated) | Original query |
| Scope | Tag / muted text | Scope filter or "Full Knowledge Base" |
| Top-K | Number | Chunks requested |
| Results | Badge | Result count — green (>0) or red (0) |
| Top Score | Progress bar + label | Best relevance score with color coding |
| Avg Score | Label | Average relevance across all results |
| Actions | Buttons | "Rerun" (→ Retrieval Explorer with query pre-filled), "Detail" (opens detail drawer) |

**Detail drawer** shows: full question text, query parameters table, per-source detail list (rank, path, score bar, chunk preview), rerun button.

**Search:** Text filter across question and scope fields.

## 3. Data Types

### RagSource (API response)
```
{
  file_path: string,      // Relative path in YiKnowledge
  score: number,          // Cosine similarity 0–1
  text: string,           // Chunk content
  metadata?: {            // Frontmatter-derived
    category?: string,    // e.g. "methodology/ai-specific"
    tags?: string | string[],
    type?: string,         // e.g. "summary", "prompt", "protocol"
    status?: string,       // e.g. "stable", "draft"
    source?: string,       // e.g. "internal", "external"
    title?: string,
    created?: string,
    updated?: string
  }
}
```

### Query History Entry (Pinia store, in-memory)
```
{
  question: string,
  scope: string,
  topK: number,
  sources: RagSource[],
  timestamp: number       // Date.now()
}
```

## 4. Backend Endpoints Used

| Endpoint | Method | Pages Using |
|----------|--------|-------------|
| `/rag-status` | POST | Dashboard, all pages (index health) |
| `/rag-build` | POST | Dashboard (rebuild button) |
| `/rag-query` | POST | Dashboard (quick query), Retrieval Explorer, History (rerun) |
| `/rag-chat` | POST (SSE) | Chat, Compare (RAG side) |
| `/rag-file-chat` | POST (SSE) | (available for aicr integration) |

## 5. Design Decisions

- **No backend persistence for query history.** The Pinia store holds the last 20 queries in memory. Restarting the browser clears history. This is intentional — the RAG system is a developer tool, not a production audit system.
- **Dashboard as hub.** The dashboard provides at-a-glance health and quick links to deeper tools. It also surfaces links to methodology docs so users can self-educate on RAG concepts.
- **ProTable-like tables without ProTable.** The retrieval results and history pages use raw `el-table` with custom column rendering (progress bars, tags, score colors) because the data is not paginated server-side and the store directly provides the array. ProTable is designed for server-paginated CRUD — using it for in-memory arrays would be over-engineering.
- **Inline citations match the backend's `_NumberSourcesPostprocessor`.** The chat LLM receives `[Source N]` prefixed chunks and is prompted to cite with `[N]` markers, which the frontend renders as superscript badges. The sidebar source list is in the same order, so `[N]` maps to the Nth chip.

## Action recommendations

1. **Add backend persistence for query history before the RAG system is used for any production workflow:** The current in-memory Pinia store (last 20 queries, cleared on browser restart) is acceptable for a developer tool but becomes a liability the moment anyone relies on the history for audit or debugging. Add a `rag_queries` MongoDB collection with fields: `question`, `scope`, `top_k`, `result_count`, `best_score`, `timestamp`, and `user`. Implement a retention policy (e.g., 90 days) and a simple search interface. This is a 2-hour task that transforms the history page from ephemeral to auditable.

2. **Add a scope validation endpoint that checks the actual YiKnowledge directory structure:** The current scope filter performs a substring match on `file_path` with no validation. A typo (`projects/YiVad` vs `projects/yivad`) silently returns zero results. Add a `/rag-scopes` endpoint that returns the list of valid scope values derived from the top-level YiKnowledge directories. The frontend should auto-complete scope values from this endpoint and display a warning when a manually entered scope does not match any known directory. This prevents the most common user error in the RAG system.

3. **Implement an end-to-end test for the inline citation pipeline:** The `[Source N]` prefix -> `[N]` citation -> superscript badge pipeline is a fragile contract between the backend, the LLM, and the frontend. Create an automated test that: (1) builds the RAG index with a known set of documents, (2) runs a query that should return specific sources, (3) verifies that the response contains `[1]`, `[2]` markers, (4) verifies that the source list matches the citation markers, and (5) verifies that clicking a citation badge in the frontend navigates to the correct source. This test should run in CI whenever the backend's `_NumberSourcesPostprocessor` or the frontend's citation rendering changes.

4. **Add a RAG evaluation dashboard that compares the RAG vs Baseline page results against a ground truth dataset:** The current RAG vs Baseline comparison page is qualitative (response lengths, source counts, best scores). Add a quantitative evaluation mode: upload a ground truth dataset (question, expected answer, expected sources), run both RAG and baseline against each question, and compute ragas metrics (faithfulness, answer relevancy, context precision, context recall). Display the results as a comparison table with RAG vs baseline scores for each metric. This turns the comparison page from a developer intuition tool into a quantitative evaluation tool.

5. **Create a "RAG Performance" monitoring dashboard with alert thresholds:** The current dashboard shows index health and recent queries but has no performance monitoring. Add metrics for: (1) query latency (p50, p99), (2) source count distribution (queries returning 0 sources), (3) index build time, (4) index staleness (time since last build vs last knowledge base change), and (5) error rate. Set alert thresholds: p99 latency > 5 seconds, 0-source rate > 10%, index staleness > 1 hour. Export these metrics to the existing observer monitoring system so that RAG degradation is detected before users report it.

## Anti-patterns

- **Treating the RAG system as a production audit trail.** Query history is in-memory only (Pinia store, last 20 queries, cleared on browser restart). There is no backend persistence, no export, and no retention policy. For production audit requirements, implement backend persistence before relying on the history page.

- **Using ProTable for the retrieval results or history tables.** ProTable is designed for server-paginated CRUD with search, pagination, and sorting. The RAG pages work with in-memory arrays and use custom column rendering (progress bars, score colors, tag badges). Using ProTable would require a fake pagination layer and would not support the custom rendering needed.

- **Changing the backend chunk numbering scheme without updating the frontend citation rendering.** The `[Source N]` prefix -> `[N]` citation -> superscript badge pipeline is a fragile contract. A change to the backend's `_NumberSourcesPostprocessor` numbering scheme would silently break the citation mapping in the frontend. Any change to the chunk numbering must be tested end-to-end.

- **Relying on the RAG vs Baseline comparison page for quantitative evaluation.** The comparison page shows response lengths, source counts, and best scores, but these are qualitative indicators, not rigorous evaluation metrics. For quantitative RAG evaluation, use a proper framework like ragas with metrics for faithfulness, relevance, and context precision.

- **Hardcoding the scope filter path without verifying it matches the actual YiKnowledge directory structure.** The scope filter performs a substring match on `file_path`. A typo in the scope string (e.g., `projects/YiVad` vs `projects/yivad`) will silently return zero results. Scope values should be validated against the actual knowledge base directory structure.

## 6. Related Documentation

- [[rag-design-patterns-summary]] — Chunking, hybrid search, reranking methodology
- [[rag-system-prompt]] — Prompt templates, failure modes, citation strategy
- [[YiAi CLAUDE.md]] — Backend RAG module API (`domain/rag/`, `services/rag/`, `server/routes/rag.py`)
- [[YiVad CLAUDE.md]] — Frontend patterns, ProTable conventions, module boundaries

## Related

- [YiVad architecture](./architecture.md) — tech stack, layer boundaries, and SSE streaming data flow used by RAG chat
- [YiVad functional modules](./functional-modules.md) — RAG store and ragService API module inventory
- [YiVad development standards](./dev-standards.md) — ProTable conventions, SSE streaming standard, and RPC field contract
- [YiVad engineering CLAUDE.md](./engineering/claude.md) — recent changes tracking RAG module additions
- [YiAi engineering CLAUDE.md](../yiai/engineering/claude.md) — backend RAG module architecture (domain/rag/, services/rag/, server/routes/rag.py)
