---
title: RAG-Based AI Agent Case Study
aliases:
  - RAG agent case study
  - RAG enterprise case study
  - RAG + Agent implementation
tags:
  - Case study
  - AI
  - RAG
  - Agent
  - enterprise
  - LLM
category: product-manager/strategy
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-07
tacit: true
roles:
  - product-manager
  - ai-engineer
benefit: PMs can learn from RAG-based AI agent implementations, including architecture patterns, evaluation strategies, and production lessons for enterprise deployment
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./ai-after-sales-cases.md
  - ./ai-customer-service-cases.md
  - ./case-study.md
  - ../../ai-engineer/methodology/README.md
  - ../../engineer/engineering/find-ai-deployment-cases.md
---

# RAG-Based AI Agent Case Study

> **As a** product manager, **I want to** study RAG-based AI agent implementations in enterprise settings, **so that** I can apply proven architecture patterns, evaluation frameworks, and production lessons to our AI products.

> RAG (Retrieval-Augmented Generation) is the dominant architecture for grounding LLM responses in enterprise knowledge. This case study synthesizes patterns from multiple RAG + Agent implementations: the architecture that works, the evaluation results that matter, and the production lessons that separate successful deployments from failed ones.

## Summary

- RAG augments LLM generation with retrieved context from enterprise knowledge bases. The architecture solves the two biggest problems of LLMs in enterprise: hallucination (the model makes things up) and staleness (the model's training data is outdated).
- The RAG pipeline has five stages: ingestion (documents into the knowledge base), retrieval (finding relevant documents), augmentation (adding retrieved context to the prompt), generation (the LLM produces the response), and evaluation (measuring quality and correctness).
- The RAG + Agent pattern extends RAG by giving the LLM the ability to use tools: search the knowledge base, query databases, call APIs, and execute code. This transforms the LLM from a question-answerer into an autonomous agent that can complete multi-step tasks.
- Key production challenges: retrieval quality is the primary bottleneck (if the right documents are not retrieved, the response is wrong regardless of the LLM quality), latency is the user experience bottleneck (RAG adds 500ms-2s to response time), and evaluation is the quality bottleneck (how do you know if the RAG system is working correctly?).
- The evaluation framework must cover four dimensions: retrieval quality (are the right documents retrieved?), generation quality (is the response correct and grounded?), latency (is the response fast enough?), and cost (is the system economically viable?).

## Core viewpoints

- **Retrieval quality is the foundation** -- a RAG system is only as good as its retrieval. If the wrong documents are retrieved, the best LLM in the world will produce a wrong answer. Invest in retrieval quality before investing in better models, better prompts, or better agents. The retrieval pipeline is the highest-leverage component to optimize.
- **RAG is not a binary choice; it is a spectrum** -- at one end, naive RAG (retrieve-then-generate without any agent loop). At the other end, fully autonomous agents (plan, retrieve, reason, act, reflect). The right point on the spectrum depends on the use case. Start with naive RAG; add agent capabilities only when the use case requires them.
- **Evaluation must be continuous and automated** -- manually evaluating RAG outputs works for a proof of concept. It does not scale to production. Automated evaluation using LLM-as-judge (one LLM evaluates another LLM's output) is the current best practice. Set up evaluation pipelines that run on every deployment.
- **Latency and cost are product constraints, not just engineering concerns** -- users will not wait 5 seconds for a RAG response. The retrieval + generation pipeline must complete in under 2 seconds for chat, under 5 seconds for document generation. Cost per query must be tracked and optimized; a $0.10 per query cost is unsustainable at 10,000 queries per day.
- **The knowledge base is the product, not just the input** -- the quality, structure, and freshness of the knowledge base determine the quality of the RAG system. A poorly maintained knowledge base produces poor RAG responses, regardless of the architecture. Knowledge base management is a product function, not just an engineering function.

## Key information

### RAG architecture (five-stage pipeline)

```
[Documents] --> [Ingestion] --> [Vector Store / Search Index]
                                      |
[User Query] --> [Retrieval] <--------+
                      |
                      v
              [Augmentation] --> [Prompt + Retrieved Context]
                                      |
                                      v
                              [Generation] --> [Response]
                                      |
                                      v
                              [Evaluation] --> [Metrics]
```

**Stage 1: Ingestion**
- Document parsing: PDF, HTML, Markdown, code, images
- Chunking: splitting documents into retrievable units (256-1024 tokens per chunk)
- Embedding: converting chunks into vector representations
- Indexing: storing embeddings in a vector database for similarity search

**Stage 2: Retrieval**
- Dense retrieval: semantic search using embeddings
- Sparse retrieval: keyword search (BM25) for exact matches
- Hybrid retrieval: combining dense and sparse for better recall
- Re-ranking: using a cross-encoder to reorder retrieved results by relevance
- Retrieval strategies: top-k, threshold-based, multi-hop (retrieve, then retrieve more based on results)

**Stage 3: Augmentation**
- Context window management: fitting retrieved documents within the LLM's context limit
- Context ordering: placing the most relevant documents first
- Context compression: summarizing retrieved documents to fit more context
- Source attribution: tagging each piece of context with its source document

**Stage 4: Generation**
- Prompt template: system prompt + retrieved context + user query + instructions
- Citations: the response must cite the source documents used
- Fallback: when retrieval confidence is low, the system should say "I don't know" rather than hallucinate
- Streaming: the response should stream token-by-token for perceived speed

**Stage 5: Evaluation**
- Retrieval evaluation: recall@k, precision@k, MRR (Mean Reciprocal Rank), NDCG
- Generation evaluation: faithfulness (is the response grounded in the retrieved context?), answer relevance (does the response answer the question?), correctness (is the response factually correct?)
- Latency evaluation: P50, P95, P99 response times
- Cost evaluation: cost per query, cost per user, total daily cost

### RAG + Agent architecture

The RAG + Agent pattern extends the basic RAG pipeline with an agent loop:

```
[User Query] --> [Agent: Plan] --> [Agent: Retrieve] --> [Agent: Reason]
                                                              |
                                                              v
[User <-- Response] <-- [Agent: Reflect] <-- [Agent: Act] <--+
```

**Agent capabilities**:
- **Plan**: Break down the user's query into sub-tasks. "What do I need to know to answer this?"
- **Retrieve**: Search the knowledge base for relevant information. May involve multiple retrieval steps.
- **Reason**: Analyze the retrieved information. "What does this information tell me? What is missing?"
- **Act**: Use tools (database queries, API calls, calculations) to fill gaps or perform actions.
- **Reflect**: Evaluate the response. "Is this answer complete and correct? Do I need to retrieve more information?"

**Agent loop**: The agent may go through multiple Plan-Retrieve-Reason-Act cycles before producing a final response. Each cycle adds latency and cost. The number of cycles must be bounded (e.g., max 5 cycles).

### Evaluation framework

| Dimension | Metric | Target | How to measure |
|---|---|---|---|
| Retrieval quality | Recall@5 | > 90% | Does the top-5 retrieved set contain the correct document? |
| Retrieval quality | Precision@5 | > 80% | Are the top-5 retrieved documents relevant to the query? |
| Generation quality | Faithfulness | > 95% | Is every claim in the response supported by the retrieved context? (LLM-as-judge) |
| Generation quality | Answer relevance | > 90% | Does the response directly answer the user's question? (LLM-as-judge) |
| Generation quality | Citation accuracy | > 95% | Do the citations point to the correct source documents? |
| Latency | P95 response time | < 2 seconds (chat), < 5 seconds (document) | End-to-end time from query to complete response |
| Cost | Cost per query | < $0.01 | API cost of retrieval + generation per query |
| User satisfaction | CSAT | > 80% | Post-interaction survey |

### Production lessons

**Lesson 1: Chunking strategy matters more than the embedding model**
- The way documents are chunked (size, overlap, strategy) has more impact on retrieval quality than which embedding model is used.
- Chunk size sweet spot: 256-512 tokens for Q&A, 512-1024 tokens for document summarization.
- Overlap: 10-20% between chunks to prevent context loss at chunk boundaries.
- Semantic chunking (split by topic/section) outperforms fixed-size chunking for structured documents.

**Lesson 2: Hybrid retrieval is worth the complexity**
- Dense retrieval (embeddings) alone misses exact matches (product codes, error numbers, specific terms).
- Sparse retrieval (BM25) alone misses semantic matches (synonyms, paraphrases).
- Hybrid retrieval (dense + sparse + re-ranking) provides the best of both worlds.
- The additional latency of hybrid retrieval (50-200ms) is worth the improvement in recall.

**Lesson 3: "I don't know" is a feature, not a failure**
- The RAG system must have a confidence threshold. When retrieval confidence is below the threshold, the system should say "I don't have enough information to answer this question" rather than hallucinate.
- Users prefer an honest "I don't know" to a confident wrong answer.
- Set the confidence threshold based on retrieval scores and re-ranker scores.

**Lesson 4: Evaluation is a product, not a project**
- Manual evaluation works for the first week. After that, you need automated evaluation.
- LLM-as-judge (using GPT-4 or Claude to evaluate the RAG output) is the current best practice for generation quality.
- Human evaluation is still needed for edge cases and for calibrating the automated evaluation.
- Evaluation results must be tracked over time. A dashboard showing faithfulness, relevance, and latency trends is essential.

**Lesson 5: The knowledge base decays, and the RAG system decays with it**
- Documents become outdated. The knowledge base must be refreshed on a schedule.
- A document that is 6 months old may contain outdated information. The response must include the document date so the user can assess freshness.
- Knowledge base quality metrics (document age, missing documents, broken links) should be tracked alongside RAG quality metrics.

### When to use RAG vs. when to use fine-tuning

| Approach | When to use | When not to use |
|---|---|---|
| RAG | Knowledge changes frequently, documents are the source of truth, transparency and citations are required | Latency requirements are extremely tight (< 500ms), the knowledge base is small and static |
| Fine-tuning | The domain has a specific style/tone that is hard to capture in prompts, latency requirements are very tight | Knowledge changes frequently (fine-tuning is expensive to update), citations are required |
| RAG + Fine-tuning | The domain requires both up-to-date knowledge and a specific style/tone | Budget does not allow for both (RAG + fine-tuning doubles the cost) |

## Action recommendations

1. Start with document ingestion and chunking. Invest time in getting the chunking strategy right. Experiment with chunk sizes (256, 512, 1024) and strategies (fixed, semantic, recursive). Evaluate retrieval quality for each.
2. Implement hybrid retrieval (dense + sparse) with re-ranking. The additional complexity and latency are worth the improvement in recall.
3. Build an automated evaluation pipeline from day one. Use LLM-as-judge for faithfulness and relevance. Track metrics over time. Set up alerts when metrics degrade.
4. Set a confidence threshold for retrieval. When confidence is below the threshold, the system says "I don't know." This is better than hallucination.
5. Track cost per query from day one. Set a budget. If cost per query exceeds the budget, optimize: reduce context size, use smaller models, cache common queries.
6. Add the agent loop only when the use case requires it. Start with naive RAG. Add agent capabilities when users need multi-step reasoning or tool use.
7. Establish a knowledge base maintenance process. Documents must be reviewed and updated on a schedule. The knowledge base is the product.

## Anti-patterns

- **Optimizing the LLM before optimizing retrieval** -- spending time on prompt engineering and model selection while retrieval quality is poor. Retrieval is the foundation. Fix retrieval first.
- **No evaluation pipeline** -- deploying a RAG system without automated evaluation. You have no idea if the system is getting better or worse over time. Build evaluation from day one.
- **Ignoring latency** -- a RAG system that takes 5 seconds to respond is a failed product, regardless of answer quality. Optimize for latency: smaller chunks, faster retrieval, streaming responses.
- **No confidence threshold** -- the system always tries to answer, even when it has no relevant information. This produces hallucinations. "I don't know" is a valid and valuable response.
- **Treating the knowledge base as static** -- documents become outdated, and the RAG system produces outdated answers. Knowledge base maintenance is an ongoing product function.
- **Agent loop without bounds** -- an agent that can loop indefinitely will consume excessive time and cost. Always set a maximum number of cycles (e.g., max 5).

## Related

- Same category: [./ai-after-sales-cases.md](./ai-after-sales-cases.md) -- AI after-sales case study (RAG applied to after-sales)
- Same category: [./ai-customer-service-cases.md](./ai-customer-service-cases.md) -- AI customer service case study (RAG applied to customer service)
- Same category: [./case-study.md](./case-study.md) -- case study research template
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) -- AI methodology frameworks
- Scenario entry: [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md) -- AI deployment case study entry point
- References: Lewis et al. -- *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (2020); LangChain -- *RAG Documentation*; LlamaIndex -- *RAG Architecture Guide*; Anthropic -- *Contextual Retrieval*; OpenAI -- *RAG Best Practices*