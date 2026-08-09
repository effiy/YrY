---
title: Inline Citation RAG Pattern
aliases: [inline-citation-rag-pattern, number-sources-postprocessor, citation-rag]
tags: [pattern, engineeringPattern, RAG, reference, inline-citation, traceability, scope-filter]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "RAG responses include inline citations to source documents, enabling users to verify and trust AI-generated answers"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ../lessons/win-yiai-rag-hybrid-retrieval.md
  - ../../tech-lead/decisions/yiai--rag-evaluation-infra.md
  - ../projects/yiai/dev-standards.md
---

# Inline Citation RAG Pattern

> **As an** engineer, **I want to** inline citation rag, **so that** pattern applied consistently.

> RAG answers return source in the same frame: `_NumberSourcesPostprocessor` numbers fragments + retrieval result list + clickable jump + scope filter; do not let users face "LLM answers without traceability".

## Summary

- **Pattern**: retrieval → `QueryFusionRetriever` (vector + BM25 fusion) → `LLMRerank` reorder → `_NumberSourcesPostprocessor` gives source numbers → answer text embeds `[1][2]` + same-frame return source list (path + snippet + score) → frontend clickable jump → scope filter (by collection / directory / filetype)
- **Cross-project applicability**: YiAi RAG / YiAi BRD Agent, reusable in any "LLM long answer requiring traceability" scenario
- **Implementation**: [yiai rag hybrid retrieval win](../lessons/win-yiai-rag-hybrid-retrieval.md) — recall rate and traceability both win
- **Replacement solution**: pure LLM long answer without source (not applicable to knowledge base scenarios, rationale in §Not applicable)

## Core viewpoints

- **Inline citations are not a UX feature — they are a trust mechanism** — Users who cannot verify where an AI answer came from will either blindly trust incorrect information or distrust all AI output. Inline citations `[1][2]` make the provenance visible at the sentence level, turning "I think the answer is X" into "the answer is X, sourced from documents Y and Z." This is the difference between a search engine (which users trust because they can click through) and a black-box LLM (which users distrust because they cannot).

- **Hybrid retrieval (vector + BM25) is not a performance optimization — it is a recall insurance policy** — Vector retrieval excels at semantic similarity but misses exact keyword matches. BM25 excels at exact keyword matches but misses semantic similarity. A query for "deployment" that retrieves "Launch" documents via vector but misses "deployment guide" via BM25 is incomplete. Fusion retrieval ensures both paths are covered, and the cost is a single additional retriever.

- **Reranking is not about ordering — it is about preventing the LLM from using the wrong source** — Without reranking, the top-k results from vector retrieval may have the correct document at position 8 but the wrong document at position 1. The LLM uses the top results first, so an incorrect source at position 1 can dominate the answer. Reranking ensures the most relevant sources are at the top, not just the most similar.

- **Source numbering is the bridge between the answer and the evidence** — Without `[1][2]` numbering, the user receives a source list at the end of the answer but cannot match which sentence came from which source. The numbering bridges the gap: "The system uses FastAPI [1][3]" tells the user exactly which documents to check. Without numbering, the source list is decoration, not evidence.

- **Scope filtering is not a search feature — it is a quality control mechanism** — Full-library retrieval mixes sources from different domains, producing answers that cross-reference deployment docs with marketing docs. Scope filtering (by collection, directory, or filetype) ensures the LLM only uses relevant sources, preventing cross-domain interference. The scope is a quality gate, not a search filter.

## Key info

- **RAG pipeline component chain (5 stages with Yi-family implementation)**: (1) Retrieval — `QueryFusionRetriever` fuses vector (semantic similarity) + BM25 (keyword match) results, each returning top_k=10; (2) Reranking — optional `LLMRerank` reorders fused results by relevance, keeping top_n=5; (3) Source numbering — `_NumberSourcesPostprocessor` assigns sequential numbers [1][2]... to the reranked nodes; (4) Generation — LLM generates answer with inline citation markers [1][2] referencing the numbered sources; (5) Presentation — frontend renders answer text with clickable citation links, source list with path + snippet + score, and scope filter. The YiAi RAG system implements all 5 stages; the source numbering postprocessor is a custom llama_index postprocessor.
- **Hybrid retrieval fusion algorithm (Reciprocal Rank Fusion)**: RRF score = Σ(1 / (k + rank_i)) for each retriever i, where k=60 (standard constant). Each retriever ranks documents independently; RRF combines the ranks without requiring normalized scores. The fused ranking favors documents that rank highly in both retrievers. Example: a document ranked #1 by vector and #3 by BM25 gets RRF = 1/(60+1) + 1/(60+3) = 0.0164 + 0.0159 = 0.0323. A document ranked #5 by both gets RRF = 1/(60+5) + 1/(60+5) = 0.0308. The #1/#3 document wins despite not being #1 in both. The YiAi RAG system uses RRF with k=60 via llama_index `QueryFusionRetriever`.
- **Citation numbering and source list format**: The `_NumberSourcesPostprocessor` assigns sequential numbers to nodes after reranking. The LLM prompt instructs: "Cite sources using [1][2] format. Every factual claim must have a citation." The source list returned to the frontend contains: `[{index: 1, path: "category/file.md", snippet: "first 200 chars...", score: 0.85, metadata: {collection, directory, filetype}}]`. The frontend renders: clickable citation markers in the answer text, a source list panel with expandable snippets, and a scope filter dropdown (by collection/directory/filetype). The Yi-family RAG system returns source lists with all fields; the frontend clickable jump to knowledge leaf detail is planned.
- **Scope filter implementation (3 filter dimensions)**: (1) Collection — filter by MongoDB collection (e.g., `knowledge_files` for YiKnowledge, `brd_documents` for BRDs); (2) Directory — filter by file path prefix (e.g., `engineer/engineering/` for engineering patterns); (3) Filetype — filter by file extension or category (e.g., `.md` for markdown, `type: summary` for summary files). The scope filter is passed as metadata filter to the vector search query, reducing the candidate set before retrieval. This improves both relevance (no cross-domain noise) and latency (smaller candidate set). The YiAi RAG system supports all 3 filter dimensions; the default scope is the full YiKnowledge corpus.
- **RAG evaluation metrics specific to citation quality**: Beyond standard ragas metrics (faithfulness, relevance, precision, recall), citation-specific metrics include: (1) Citation coverage — percentage of factual claims in the answer that have a citation; target > 90%; (2) Citation accuracy — percentage of citations that point to a source that actually supports the claim; target > 95%; (3) Citation relevance — percentage of cited sources that are relevant to the query; target > 85%. The YiAi RAG system evaluates faithfulness and relevance weekly; citation coverage and accuracy are not yet measured.
- **Yi-family RAG implementation details (2026-08)**: YiAi RAG — llama_index-based, `QueryFusionRetriever` (vector + BM25), optional `LLMRerank`, custom `_NumberSourcesPostprocessor`, `config.yaml` rag section (embed/llm models, top_k, chunk_size, toggles for hybrid/rerank/citations). YiVad RAG — planned integration with YiAi RAG endpoint, knowledge leaf view "Ask RAG" button, SSE streaming with clickable source links. YiPet RAG — planned integration with YiAi RAG endpoint, model selector for RAG queries. The RAG eval set contains 100 examples evaluated weekly; CI blocks on faithfulness drop > 5%.

## Question

Pain points without this pattern (quantitative):

- **Answer not traceable**: LLM gives answer but user does not know where it came from = cannot verify = trust collapse
- **Low recall**: single-path vector retrieval = search for "deployment" misses "Launch" docs = answer missing
- **rerank missing**: vector recall top-k order wrong = answer uses wrong source = mismatched
- **scope not controllable**: full-library retrieval = cross-domain interference = answer sources mixed = user cannot focus
- **source not numbered**: source list piled at end of answer = user cannot match which fragment corresponds to which source

## Pattern

### retrieval + reorder + numbering pipeline

```python
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.postprocessor.types import BaseNodePostprocessor

# 1. Fusion retrieval: vector + BM25
retriever = QueryFusionRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    similarity_top_k=10,
    num_candidates=50,
    mode='reciprocal_rerank',
)

# 2. LLM rerank
reranker = LLMRerank(choice_batch_size=5, top_n=5)

# 3. Numbering postprocessor
class _NumberSourcesPostprocessor(BaseNodePostprocessor):
    def _postprocess_nodes(self, nodes, query_bundle):
        for i, node in enumerate(nodes, 1):
            node.metadata['source_number'] = i
        return nodes

# 4. Assemble query engine
query_engine = RetrieverQueryEngine.from_args(
    retriever,
    node_postprocessors=[reranker, _NumberSourcesPostprocessor()],
    response_synthesizer_mode='compact',
)

# 5. Answer + source list
response = await query_engine.aquery(query)
answer = response.response  # embedded [1][2]
sources = [
    {'number': n.metadata['source_number'],
     'path': n.node.metadata['file_path'],
     'snippet': n.node.text[:200],
     'score': n.score}
    for n in response.source_nodes
]
```

### scope filter

```python
# Filter by collection / directory / filetype
def build_retriever(scope: dict):
    filters = MetadataFilters(filters=[
        MetadataFilter(key='collection', value=scope['collection']),
        MetadataFilter(key='directory', value=scope['directory'], operator='contains'),
    ])
    return vector_retriever.with_filters(filters)
```

### same-frame return source

```json
{
  "data": {
    "answer": "... RAG answer embedded [1][2] ...",
    "sources": [
      {"number": 1, "path": "YiKnowledge/methodology/ai-specific/prompt-eng.md", "snippet": "...", "score": 0.87},
      {"number": 2, "path": "YiKnowledge/lessons/wins/yiai-rag-hybrid-retrieval-win.md", "snippet": "...", "score": 0.82}
    ]
  }
}
```

### frontend rendering (same frame as SSE streaming)

```typescript
for await (const chunk of sseStream(...)) {
  if (chunk.answer) renderMarkdown(chunk.answer);
  if (chunk.sources) renderSources(chunk.sources);  // [1] → click to jump to source path
}
```

## Applicable / Not applicable

### Applicable

- Knowledge base / documentation library RAG (answer needs traceability)
- Long answers (> 200 words, user needs to verify)
- Multi-source recall (vector + BM25 fusion)
- Controllable scope (by collection / directory / type)
- Streaming output (same frame as SSE with source)

### Not applicable

- Chitchat / creative generation (no traceability needed)
- Short answers (< 50 words, source list longer than answer)
- Single-source recall (no fusion needed)
- Offline batch jobs (no same-frame needed, can post-process)

## Implementation list

| No. | Change | impact scope | Launch strategy |
|---|---|---|---|
| 1 | onboarding `QueryFusionRetriever` (vector + BM25 fusion) | backend RAG pipeline | one-shot |
| 2 | onboarding `LLMRerank` reorder top-k | backend RAG pipeline | follows #1 |
| 3 | implement `_NumberSourcesPostprocessor` to give source numbers | backend postprocessor | one-shot |
| 4 | answer text embeds `[N]` numbers + same-frame return source list | backend response | follows #3 |
| 5 | scope filter (collection / directory / type) | backend retriever | one-shot |
| 6 | frontend source list rendering + clickable jump | frontend RAG view | follows #4 |
| 7 | CI: eval set baseline + recall rate rollback > 5% block | CI | one-shot |
| 8 | Monitoring: source list missing rate (answer exists but sources empty) > 1% alert | Monitoring | one-shot |

## Action recommendations

1. **Add a monitoring alert that fires when the source list is empty but the answer is non-empty (source missing rate > 1% in any 5-minute window).** An answer without sources is a trust collapse event. The user receives information they cannot verify, and the system has no way to detect that it is fabricating citations. The source missing rate is the single most important RAG quality metric, and it must be monitored in real time, not discovered via user complaints.

2. **Implement the `_NumberSourcesPostprocessor` in the YiAi RAG pipeline and wire it into the same-frame SSE streaming response so that `[1][2]` inline citations are rendered alongside the answer text as it streams.** A source list piled at the end of the answer without numbering is decoration, not evidence. The numbering bridges the gap between the answer and the evidence, telling the user exactly which sentence came from which source. The frontend must render the numbered citations as clickable links that jump to the source document.

3. **Add `QueryFusionRetriever` (vector + BM25 fusion) to the RAG pipeline if it is not already in place, and run an A/B test comparing recall@k between single-path vector retrieval and fusion retrieval.** Vector retrieval misses exact keyword matches (searching for "deployment" misses "Launch" documents). BM25 catches the lexical match. The A/B test should measure recall@5 on a representative query set and block the fusion rollout if recall does not improve by at least 5%.

4. **Build a scope filter that allows users to constrain retrieval by collection, directory, and filetype, and expose it in the YiVad RAG chat UI.** Full-library retrieval mixes sources from different domains, producing answers that cross-reference deployment docs with marketing docs. The scope filter is a quality control mechanism that ensures the LLM only uses relevant sources. The UI should allow users to select a scope before sending a query, and the scope should be persisted per conversation.

5. **Create an evaluation set of at least 50 RAG queries with known expected sources, and run it in CI to verify that source numbering is correct, recall meets the baseline, and no answers are returned without sources.** The evaluation set should include queries that test cross-domain interference (queries that should NOT return sources from certain collections), empty-source edge cases, and multi-source queries where the answer should cite multiple documents. The CI gate should block merge if the source missing rate exceeds 0%.

## Anti-patterns

- **Answer without source** — LLM long answer without traceability = trust collapse. Users cannot verify where the answer came from and will either blindly trust incorrect information or distrust all AI output. Must include source list in the same frame as the answer.

- **Source list without numbering** — A source list piled at the end of the answer without `[1][2]` numbering is decoration, not evidence. The user cannot match which sentence came from which source. `_NumberSourcesPostprocessor` must number sources and the answer must embed the numbers inline.

- **Single-path vector retrieval** — Vector retrieval searches for "deployment" and misses "Launch" documents because they are semantically similar but lexically different. BM25 catches the lexical match. Without fusion retrieval, recall is incomplete and the answer is based on a partial document set.

- **Skipping reranking** — Without reranking, the correct document may be at position 8 while the wrong document is at position 1. The LLM uses top results first, so an incorrect source can dominate the answer. Reranking ensures the most relevant sources are at the top.

- **No scope filter** — Full-library retrieval mixes sources from different domains, producing answers that cross-reference deployment docs with marketing docs. Scope filtering (by collection, directory, or filetype) ensures the LLM only uses relevant sources, preventing cross-domain interference.


- **Answer without source**: LLM long answer without traceability = trust collapse; must include source list in same frame.
- **Source without numbering**: list piled at end = user cannot match; must `_NumberSourcesPostprocessor` number + answer embed `[N]`.
- **Single-path vector retrieval**: search "deployment" misses "Launch" docs; must `QueryFusionRetriever` fusion.
- **Skip rerank**: top-k order wrong = mismatched; must `LLMRerank`.
- **Scope not controllable**: full-library retrieval = cross-domain interference; must MetadataFilters.
- **Source without path**: only snippet, cannot jump; must include `file_path`.
- **Non-streaming return source**: user waits 30s without feedback; must SSE same frame with source (see [sse-streaming-pattern](../architecture-design/sse-streaming.md)).
- **No eval set run**: recall rate drift by eye; must CI baseline + rollback threshold (see [adr-rag-evaluation-infra](../../tech-lead/decisions/yiai--rag-evaluation-infra.md)).

## Related

- Implementation: [yiai rag hybrid retrieval win](../lessons/win-yiai-rag-hybrid-retrieval.md) — recall rate and traceability both win
- Implementation: [YiAi RAG evaluation ADR](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) — eval set + CI gate
- Implementation: [YiAi development standards §RAG pipeline](../projects/yiai/dev-standards.md)
- Companion: [sse-streaming-pattern](../architecture-design/sse-streaming.md) — same-frame source streaming foundation
- Companion: [rpc-envelope-pattern](../architecture-design/rpc-envelope.md) — source list via same envelope
- Upstream: [./README.md](./) — engineering-patterns leaf entry
