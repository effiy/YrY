---
title: Blueprint an enterprise RAG
aliases: [i-want-to-blueprint-an-enterprise-rag, enterprise-rag-blueprint, llamaparse, agent-search, vector-search, hybrid-bm25, groundedness-at-scale]
tags: [journeys, methodology, enterprise-rag, blueprint, llamaparse, agent-search, vector-search, hybrid-search, bm25, grounding, enterprise-deployment]
category: ai-engineer/methodology
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Enterprise RAG systems are designed with production-grade retrieval, grounding, and scale from day one"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./rag-design-patterns.md
  - ./run-a-two-loop-llm-evaluation.md
  - ./hallucination-mitigation.md
  - ./prompt-engineering-guide.md
  - ../platform/pick-a-vector-database.md
  - ../platform/embedding-model-selection.md
  - ../platform/orchestrate-agents-with-adk-and-agents-cli.md
  - ../../engineer/process/operate-as-a-forward-deployed-engineer.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: "An enterprise RAG blueprint is not a RAG pattern; it is an end-to-end stack. Four fixed segments: Ingestion (LlamaParse) + Grounding (Agent Search) + Vector Storage (Vector Search) + Hybrid Search (BM25); each segment ties into compliance + measurement; distinguished from rag-design-patterns: the latter is about internal patterns, this file is about enterprise deployment blueprint"
---

# I want to blueprint an enterprise RAG

> **As an** ai engineer, **I want to** blueprint an enterprise RAG, **so that** launch is safe.

## Summary

- Enterprise RAG = end-to-end stack; not an internal RAG pattern
- Four fixed segments: Ingestion + Grounding + Vector Storage + Hybrid Search
- Ingestion: LlamaParse handles complex enterprise PDFs / tables
- Grounding: Agent Search hosts the RAG engine
- Vector Storage: Vector Search for large-scale indexing
- Hybrid Search: semantic + BM25 to satisfy industry terminology
- Each segment ties into compliance + measurement
- Distinguished from rag-design-patterns: this file is about enterprise deployment blueprint
- publicly queryable; periodic review
- first principles / inversion / second-order / Occam

## Core viewpoints

**An enterprise RAG blueprint is a deployment contract, not a pattern catalog.** Calling it a "blueprint" means every segment (Ingestion, Grounding, Vector Storage, Hybrid Search) is a fixed architectural commitment with named tools, not a menu of options. When you tell a customer "this is our RAG blueprint," you are committing to LlamaParse for ingestion, Agent Search for grounding, and Vector Search for storage. The blueprint is prescriptive because enterprise customers need predictability, not flexibility. If a segment needs to change, the blueprint version changes, and the migration path is documented.

**The four segments are not four independent choices -- they are a dependency chain.** Ingestion quality determines what Grounding can see. Grounding quality determines what Vector Storage indexes. Vector Storage recall determines what Hybrid Search can surface. If you compromise on Ingestion (e.g., raw text instead of LlamaParse for complex PDFs), you silently degrade every downstream segment. The blueprint must be evaluated end-to-end, not segment by segment.

**Compliance is not a fifth segment -- it is a cross-cutting constraint that shapes every segment.** PII/PHI/Secret handling through DLP and VPC Service Controls is not optional. It must be designed into the Ingestion pipeline (redact before storage), the Grounding layer (authorization-aware retrieval), and the Hybrid Search layer (no leakage across tenants). Retrofitting compliance after the blueprint is built costs 3-5x more than designing it in from the start.

**"Groundedness at scale" is the enterprise differentiator.** A demo with 5 documents and perfect answers is easy. The enterprise RAG differentiator is maintaining <1% hallucination rate across millions of documents with weekly updates. This requires a golden dataset (human-annotated 0% hallucination baseline), automated regression evaluation, and a monitoring pipeline that catches drift before customers do.

**Vendor lock-in is the second-order risk that must be explicitly managed.** Choosing LlamaParse + Agent Search + Vector Search creates a stack dependency. The blueprint must include an abstraction layer and a documented extraction path for each segment. The cost of switching should be calculable, not discovered during a vendor crisis.

## Key info

- **LlamaParse capabilities**: handles complex PDFs (multi-column, tables, diagrams, handwritten notes), outputs structured markdown with table preservation, supports 50+ languages, processes ~1 page/second. The key differentiator from raw text extraction: table structure is preserved as markdown tables, not flattened into unstructured text, which means the RAG system can answer "what's in row 3, column 4" accurately. Cost: ~$0.003/page. For enterprise deployments with 100K+ documents, the ingestion pipeline must handle rate limiting (default 10 req/s) and retry on transient failures.
- **Agent Search grounding**: the RAG engine that hosts retrieval + generation. Key features: authorization-aware retrieval (each user only sees documents they're permitted to access), multi-turn conversation support, source attribution with inline citations, and streaming responses. The grounding layer is the security boundary: if Agent Search doesn't enforce authorization, the vector store's access control is irrelevant.
- **Vector Search at scale**: for enterprise deployments with millions of documents, vector search must support: horizontal scaling (shard by tenant or document collection), incremental indexing (new documents visible within seconds, not hours), and hybrid search natively (vector + BM25 in a single query, not two separate queries merged client-side). The most common enterprise failure: choosing a vector database that performs well at 10K documents but degrades exponentially at 1M documents.
- **Hybrid search configuration**: BM25 weight should be higher for enterprise deployments (0.6-0.7 BM25, 0.3-0.4 vector) because enterprise queries are terminology-heavy (product codes, regulation numbers, internal acronyms). Pure vector search fails on exact term matching (e.g., "ISO 27001 Section 8.3" requires exact matching, not semantic similarity). The hybrid fusion algorithm (Reciprocal Rank Fusion, RRF) is the default because it requires no tuning and works across different score distributions.
- **Groundedness at scale metrics**: (1) hallucination rate: percentage of claims in generated answers that cannot be attributed to source documents, target <1%, measured by human annotation of a random sample; (2) answer coverage: percentage of questions that receive an answer with at least one citation, target >95%; (3) citation accuracy: percentage of citations that point to the correct source passage, target >90%, measured by human annotation; (4) retrieval recall@10: percentage of questions where the correct answer passage is in the top 10 retrieved documents, target >90%.

## Scenario

An enterprise RAG blueprint is not a RAG pattern; it is an end-to-end stack. This entry provides the enterprise RAG blueprint full path, covering the four fixed segments (Ingestion + Grounding + Vector Storage + Hybrid Search) + compliance + measurement, linking with rag-design-patterns + run-a-two-loop-llm-evaluation + hallucination-mitigation + prompt-engineering-guide + pick-a-vector-database + embedding-model-selection + orchestrate-agents-with-adk-and-agents-cli + prepare-a-rag-deployment-strategy + operate-as-a-forward-deployed-engineer, publicly queryable, periodic review, and links to rag-patterns / two-loop-eval / hallucination / prompt-eng / vector-db / embedding / adk / rag-deploy / fde-role and other leaves.

## 2-hop reachability paths

| Hops | target | file |
|---|---|---|
| 1 hop | entry overview | [README.md](./) |
| 1 hop | rag-design-patterns | [./rag-design-patterns.md](./rag-design-patterns.md) |
| 1 hop | two-loop-eval | [./run-a-two-loop-llm-evaluation.md](./run-a-two-loop-llm-evaluation.md) |
| 2 hops | adk | [../platform/orchestrate-agents-with-adk-and-agents-cli.md](../platform/orchestrate-agents-with-adk-and-agents-cli.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **end-to-end anchor**: blueprint = stack; not a single pattern
2. **four fixed segments**: Ingestion + Grounding + Vector Storage + Hybrid Search; no segment omitted
3. **Ingestion**: LlamaParse handles complex enterprise PDF / tables / multi-column layouts; no raw text
4. **Grounding**: Agent Search hosts RAG; semantic retrieval over customer data
5. **Vector Storage**: Vector Search for large-scale indexing; supports petabyte
6. **Hybrid Search**: semantic + BM25; satisfies industry terminology + abbreviations + numbering
7. **Embedding selection**: matches enterprise corpus; no general small model
8. **Chunking strategy**: paragraph-level + table preservation; no brute 512-token
9. **Reranking**: cross-encoder rerank; no bare BM25
10. **Citation required**: every answer must cite source; no "sourceless answers"
11. **Groundedness measurement**: 0% hallucination baseline (human-signed golden set)
12. **compliance**: PII / PHI / Secret go through DLP + VPC SC; no bare transfer
13. **FinOps**: embedding + retrieval cost observable; no blind spending
14. **phased delivery**: MVP (1 data source + 1 user group) → Scale (multi-source + everyone) → Optimize
15. **no blueprint for blueprint's sake**: each segment ties to landing scenarios and business measurement
16. **no sloganeering**: each segment labels tools + measurement + cost
17. **versioned**: blueprint has versions; evolution is traceable
18. **links with rag-design-patterns**: blueprint + internal patterns co-build
19. **links with two-loop-eval**: blueprint + two-loop evaluation co-build
20. **links with hallucination-mitigation**: blueprint + hallucination mitigation co-build
21. **links with prompt-engineering-guide**: blueprint + prompt engineering co-build
22. **links with vector-db**: blueprint + vector DB selection co-build
23. **links with embedding**: blueprint + embedding selection co-build
24. **links with adk**: blueprint + ADK multi-agent co-build
25. **links with rag-deployment**: blueprint + deployment strategy co-build
26. **links with fde-role**: blueprint + FDE co-build
27. **distinguished from rag-design-patterns**: this file is about enterprise deployment blueprint; the latter is about internal chunking / reranking / hybrid general patterns
28. **toolchain**: LlamaParse / Agent Search / Vector Search / BM25 / cross-encoder / LangSmith / BigQuery Agent Analytics / DLP / VPC SC
29. **publicly queryable**: blueprint accessible to everyone; not hidden
30. **periodic review**: evolution updates; not one-shot (embedding models are changing)
31. **first principles**: why a blueprint is necessary; worst consequence of not doing it (every customer rebuilds / drift / compliance failure)
32. **inversion thinking**: how much can building on OSS RAG solve; can you bear the ops cost
33. **second-order thinking**: second-order consequences after the blueprint (vendor lock-in / team learning curve / multi-customer reuse)
34. **Occam**: the simpler the blueprint the better; cut redundant segments

## Anti-patterns

- **Blueprinting without a named customer.** A blueprint that is not tied to a specific customer deployment is a thought experiment. Every segment should be stress-tested against a real customer's document corpus, compliance requirements, and scale expectations. Abstract blueprints produce architecture that works in slides but fails in production.

- **Treating Ingestion as a "just use LlamaParse" checkbox.** LlamaParse handles complex PDFs and tables, but enterprise documents often contain scanned images, handwritten annotations, multi-column layouts, and embedded spreadsheets. Each of these requires explicit configuration, not a default setting. Failing to characterize the document corpus before configuring ingestion leads to silent data loss.

- **Skipping the golden dataset because "we'll evaluate after launch."** Without a human-annotated 0% hallucination baseline, you have no way to measure whether the blueprint is working. Building the golden dataset is the first deliverable, not an afterthought. The cost of building it after launch is the cost of every customer discovering problems before you do.

- **Mixing the blueprint with the internal RAG pattern library.** Enterprise blueprints are prescriptive deployment contracts; internal RAG patterns are reusable design fragments. Conflating the two leads to customer-facing documents that are too abstract to deploy and internal documents that are too specific to reuse. Keep them in separate files with explicit cross-references.

- **Deploying the full blueprint as a single phase.** The MVP phase (1 data source + 1 user group) is not optional -- it is the only way to validate each segment's configuration before scaling. Skipping to multi-source deployment without single-source validation means debugging four segments simultaneously with live customer data.

## Related

- rag-design-patterns: [./rag-design-patterns.md](./rag-design-patterns.md) — RAG internal patterns co-build
- two-loop-eval: [./run-a-two-loop-llm-evaluation.md](./run-a-two-loop-llm-evaluation.md) — two-loop evaluation co-build
- hallucination-mitigation: [./hallucination-mitigation.md](./hallucination-mitigation.md) — hallucination mitigation co-build
- prompt-engineering-guide: [./prompt-engineering-guide.md](./prompt-engineering-guide.md) — prompt engineering co-build
- vector-db: [../platform/pick-a-vector-database.md](../platform/pick-a-vector-database.md) — vector DB selection co-build
- embedding: [../platform/embedding-model-selection.md](../platform/embedding-model-selection.md) — embedding selection co-build
- adk: [../platform/orchestrate-agents-with-adk-and-agents-cli.md](../platform/orchestrate-agents-with-adk-and-agents-cli.md) — ADK toolchain co-build
- rag-deployment: [../foundations/prepare-a-rag-deployment-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-a-rag-deployment-strategy.md) — RAG deployment strategy co-build
- fde-role: [../../engineer/process/operate-as-a-forward-deployed-engineer.md](../../engineer/process/operate-as-a-forward-deployed-engineer.md) — FDE co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
