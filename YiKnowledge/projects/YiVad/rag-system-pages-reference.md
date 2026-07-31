---
title: RAG System Pages — Menu & UI Reference
tags: [RAG, UI, YiVad, Documentation]
category: projects/YiVad
created: 2026-07-31
updated: 2026-07-31
source: internal
type: reference
status: stable
---

# RAG System Pages — Menu & UI Reference

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

## 6. Related Documentation

- [[rag-design-patterns-summary]] — Chunking, hybrid search, reranking methodology
- [[rag-system-prompt]] — Prompt templates, failure modes, citation strategy
- [[YiAi CLAUDE.md]] — Backend RAG module API (`domain/rag/`, `services/rag/`, `server/routes/rag.py`)
- [[YiVad CLAUDE.md]] — Frontend patterns, ProTable conventions, module boundaries
