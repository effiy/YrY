---
title: "Building Reliable Agentic AI Systems: Bayer's Pharmaceutical Research Assistant"
tags: [rag, agentic-ai, pharmaceutical, knowledge-retrieval, enterprise-ai]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/reliable-llm-bayer.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Learn how to evolve a keyword-based search system into an intelligent research assistant capable of answering complex questions and drafting regulatory documents."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/secure-multi-tenant-rag-with-amazon-bedrock-and-verified-per-bee88b.md
---

# Building Reliable Agentic AI Systems: Bayer's Pharmaceutical Research Assistant

> **As an** AI engineer building enterprise AI systems, **I want to** understand how to evolve a search system into a reliable agentic research assistant, **so that** I can build systems that answer complex domain questions and draft regulated documents with confidence.

## Summary

- Thoughtworks built a system with Bayer to allow pharmaceutical researchers to query decades of study information buried in PDF reports.
- The system evolved from keyword-based search to an intelligent research assistant capable of answering complex questions and drafting regulatory documents.
- The key architectural challenge was reliability: in a pharmaceutical context, incorrect answers have regulatory and safety consequences.
- The evolution path demonstrates a pattern for incrementally increasing AI system capability while maintaining trust and reliability.

## Core viewpoints

### 1. Evolution from search to assistant is the right adoption path
The system did not start as a full agentic assistant. It started as keyword search, then added semantic understanding, then question answering, and finally document drafting. Each stage built trust and validated the approach before adding more capability. This incremental path is the pattern for high-stakes domains where getting it wrong has real consequences.

### 2. Reliability in regulated domains requires a different architecture
Unlike consumer AI applications, pharmaceutical research assistants cannot tolerate hallucinations. The architecture must include retrieval-grounded generation, source attribution, and human review checkpoints. The trade-off is capability vs. reliability, and in regulated domains, reliability wins.

### 3. Decades of unstructured data is the norm, not the exception
Most large enterprises have decades of knowledge buried in PDFs, reports, and documents. The Bayer case is not unique -- it is representative of the data landscape in pharmaceuticals, legal, finance, and engineering. The pattern of structuring unstructured data for AI access is broadly applicable.

### 4. Chunking strategy is a domain-specific design decision, not a mechanical one
The quality of retrieval in a RAG system depends heavily on how documents are chunked. In a pharmaceutical context, a chunk that splits a clinical trial result across two vectors can produce misleading answers. The chunking strategy must respect the domain's document structure -- section boundaries, table integrity, cross-reference resolution -- and cannot be treated as a generic preprocessing step. What works for technical documentation will fail for regulatory submissions.

### 5. Trust is built through transparency, not accuracy alone
The system's source attribution is not just a technical feature -- it is the mechanism by which researchers build trust in the AI. When a researcher can click through to the original PDF and verify the source, the system earns credibility even when the answer is surprising. Without transparent provenance, every answer is suspect, and the system's adoption stalls regardless of its actual accuracy.

## Key info

- The system ingested decades of pharmaceutical study reports in PDF format.
- Evolution path: keyword search -> semantic search -> question answering -> regulatory document drafting.
- The system maintains human-in-the-loop review for all generated content, especially regulatory documents.
- The architecture uses retrieval-augmented generation (RAG) to ground responses in source documents.

## Action recommendations

1. When building AI systems for regulated domains, start with search and evolve incrementally. Each stage validates the approach before adding more autonomy.
2. Always include source attribution in generated responses. In regulated domains, knowing where an answer came from is as important as the answer itself.
3. Maintain human review checkpoints for any output that has regulatory, safety, or financial consequences.
4. Treat unstructured data ingestion as a first-class engineering problem. The quality of the AI system depends on the quality of the ingested data.

## Anti-patterns

- **Starting with a fully autonomous agentic system in a regulated domain.** The incremental evolution path builds trust and validates each capability.

- **Treating RAG as a solved problem.** The retrieval quality, chunking strategy, and source attribution all require domain-specific tuning.

- **Assuming the AI can replace human judgment in regulated contexts.** The system is an assistant, not a replacement -- the human remains the decision-maker.

- **Deploying the system without a measurable quality baseline.** Before going live, the system should be evaluated against a curated set of ground-truth questions with known correct answers. Without this baseline, you cannot tell whether a "good enough" answer is actually correct, and you have no way to detect regressions when the retrieval pipeline or model changes.

- **Treating source attribution as optional polish.** In regulated domains, the source is the answer. A response without a citation is indistinguishable from a hallucination, and users will quickly learn to ignore uncited answers -- or worse, trust them without verification.

## Related

- ai-engineer/methodology/secure-multi-tenant-rag-with-amazon-bedrock-and-verified-per-bee88b.md
- ai-engineer/methodology/building-a-serverless-ai-assistant-at-pelago-concept-to-care-948243.md