---
title: "Data Governance for AI: Lineage, Catalog, Quality, Access Control, and Compliance"
aliases:
  - data governance
  - data lineage
  - data quality
  - data catalog
  - AI data governance
  - data access control
  - data compliance
tags:
  - data
  - governance
  - lineage
  - quality
  - catalog
  - compliance
  - AI-governance
category: ai-engineer/data
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Govern AI data with the same rigor as traditional data -- lineage, quality, catalog, access control, and compliance are prerequisites for trustworthy AI, not optional extras"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - data-modeling.md
  - etl-elt-patterns.md
  - lakehouse-architecture.md
  - mongodb-indexing.md
  - ../methodology/rag-design-patterns.md
  - ../methodology/ai-alignment-strategy.md
tacit: false
---

# Data Governance for AI

> **As an** AI engineer, **I want to** implement data governance for AI systems, **so that** data lineage, quality, catalog, access control, and compliance are systematically managed -- enabling trustworthy AI, regulatory compliance, and efficient data discovery.

> AI data governance extends traditional data governance with new dimensions: model lineage, embedding quality, prompt data governance, and AI-specific compliance requirements (EU AI Act, GDPR, industry regulations).

## Summary

- Three pillars of data governance: data lineage (field-level tracking from source to consumer), data quality (completeness, uniqueness, consistency, timeliness, accuracy, validity), and data catalog (business terms + technical field mapping, self-service discovery).
- AI applications add new governance dimensions: model lineage (which model version used which data), embedding quality (are embeddings consistent and up to date?), prompt governance (versioned, reviewed, tested), and AI compliance (EU AI Act, bias audits, explainability).
- Lineage tools: OpenLineage, Apache Atlas, DataHub. Value: impact analysis, root-cause tracing, compliance audit.
- Quality tools: Great Expectations, dbt tests, Soda, RAGAS (for RAG-specific quality). Gate: block downstream on quality failure.
- Catalog tools: DataHub, Amundsen, OpenMetadata. Value: self-service discovery, compliance audit, AI asset registration.
- Governance process: discover -> classify -> tag -> quality gates -> lineage tracking -> catalog exposure -> access control -> compliance audit.

## Core viewpoints

### 1. AI data governance is not a separate discipline -- it is traditional data governance applied to AI artifacts

The same principles apply: know what data you have (catalog), know where it came from (lineage), know if it is good (quality), and control who can access it (access control). AI introduces new artifacts (models, embeddings, prompts, evaluation results) that must be governed alongside traditional data (tables, files, APIs). The key insight: treat a model version as a data asset with lineage, quality checks, and a catalog entry. Treat an embedding as a derived data product with upstream lineage to the source document and model version.

### 2. Lineage in AI systems must cover the full chain: source data -> training data -> model -> inference -> output

Traditional data lineage tracks data from source to dashboard. AI lineage must extend this to: source data -> training/embedding pipeline -> model version -> inference prompt -> model output. This full chain enables: (a) impact analysis (if a source dataset changes, which models are affected?), (b) root-cause analysis (if a model output is wrong, trace back to the training data), (c) compliance audit (prove that a specific model version was trained on approved data), and (d) data deletion (GDPR right-to-be-forgotten requires deleting training data and retraining models).

### 3. Data quality gates are mandatory in AI pipelines -- dirty data silently degrades model quality

The most insidious AI failures come from data quality issues that go undetected: a training dataset with 5% mislabeled examples, a RAG knowledge base with stale documents, an embedding index with missing chunks. Unlike traditional data quality issues (which cause visible errors in dashboards), AI data quality issues silently degrade model outputs without obvious failures. Quality gates must be automated and enforced: (a) structural validation (schema, nulls, duplicates), (b) semantic validation (label consistency, embedding drift), (c) freshness validation (data age vs. SLA), and (d) retrieval validation (RAG recall rate on test queries).

### 4. AI compliance is not just about data privacy -- it is about model behavior, bias, and explainability

The EU AI Act (effective 2026) classifies AI systems into risk tiers and imposes requirements: (a) high-risk AI systems must maintain technical documentation, (b) data governance for training/validation/testing datasets, (c) transparency and provision of information to users, (d) human oversight, and (e) accuracy, robustness, and cybersecurity. These requirements map directly to data governance practices: technical documentation = data catalog + lineage, data governance = quality gates + lineage, transparency = model cards + explainability, human oversight = access control + audit trails.

## Key info

### Data governance pillars for AI

| Pillar | Traditional scope | AI-specific scope | Tools |
|---|---|---|---|
| Lineage | Table-level, column-level | Model version, embedding, prompt, inference output | OpenLineage, DataHub |
| Quality | Completeness, uniqueness, consistency | Embedding quality, retrieval quality, label accuracy | Great Expectations, RAGAS |
| Catalog | Tables, columns, dashboards | Models, datasets, embeddings, prompts, eval results | DataHub, Amundsen |
| Access control | Role-based, row-level | Model access (who can call which model), data access (training data) | Apache Ranger, AWS IAM |
| Compliance | GDPR, CCPA | EU AI Act, bias audits, model cards, explainability | DataHub, manual audits |

### AI lineage chain

```
Source Data (raw data from systems)
    |
    v
Training/Embedding Pipeline (ETL/ELT, chunking, embedding)
    |
    v
Dataset Version (snapshot of processed data at a point in time)
    |
    v
Model Training (training run with hyperparameters)
    |
    v
Model Version (registered model artifact)
    |
    v
Inference (prompt + model -> output)
    |
    v
Output (response, prediction, generated content)
```

### Data quality dimensions for AI

| Dimension | Traditional definition | AI-specific definition | Example check |
|---|---|---|---|
| Completeness | Non-null rate of required fields | All chunks embedded, all embeddings in index | `SELECT count(*) FROM embeddings WHERE vector IS NULL` |
| Uniqueness | No duplicate primary keys | No duplicate chunks, no duplicate embeddings | `SELECT chunk_hash, count(*) GROUP BY chunk_hash HAVING count(*) > 1` |
| Consistency | Cross-table consistency | Embedding consistency across model versions | Cosine similarity of same doc embedded by old vs. new model |
| Timeliness | Data freshness | RAG index freshness vs. source | `MAX(updated_at) < NOW() - INTERVAL '1 hour'` |
| Accuracy | Reconciliation with source | Retrieval recall on test queries | RAGAS context_recall > 0.9 |
| Validity | Enum values, format compliance | Label validity, chunk format compliance | Chunk length within [100, 2000] tokens |

### Governance process

```
Discover -> Classify -> Tag -> Quality gates -> Lineage tracking -> Catalog exposure -> Access control -> Compliance audit -> Continuous monitoring
```

### EU AI Act compliance mapping

| EU AI Act requirement | Governance practice | Tool |
|---|---|---|
| Technical documentation | Data catalog with model cards, dataset cards | DataHub |
| Data governance for training data | Data quality gates, lineage, versioning | Great Expectations, OpenLineage |
| Transparency | Model cards, explainability reports | DataHub, SHAP/LIME |
| Human oversight | Access control, approval workflows, audit trails | Apache Ranger, manual review |
| Accuracy, robustness | Continuous evaluation, monitoring, regression testing | RAGAS, custom eval suites |

## Action recommendations

1. Use OpenLineage or DataHub for field-level lineage covering the full AI chain: source data -> training -> model -> inference -> output.
2. Use Great Expectations or dbt tests for structural quality gates; use RAGAS for RAG-specific quality; block downstream on any quality failure.
3. Use DataHub or Amundsen to register all AI assets (models, datasets, embeddings, prompts) as catalog entries with business metadata.
4. Implement access control on AI assets: who can train models, who can call models, who can access training data, who can view evaluation results.
5. Build model cards and dataset cards for every production model and dataset. These are the foundation for EU AI Act compliance.
6. Synchronize governance with development: governance is not an afterthought. Add governance checks to the CI/CD pipeline for AI assets.
7. Tier governance by criticality: high-risk models (user-facing, financial, health) get full governance; low-risk models (internal tools) get lighter governance.
8. Business defines data quality and compliance requirements; engineering maintains the technical implementation.

## Anti-patterns

- **Governance as afterthought**: should be synchronized with development. Retroactive governance is 10x more expensive.
- **No business participation**: business should define data quality requirements, compliance policies, and catalog terms. Engineering cannot do this alone.
- **All-field governance**: tier by criticality. Governing every field in every dataset is unsustainable.
- **No quality gates in AI pipelines**: dirty data propagates through embedding and retrieval silently. Quality gates are mandatory.
- **Incomplete RAG knowledge source metadata**: incomplete frontmatter = data without a catalog = low recall quality and untraceable outputs.
- **Treating AI governance as a one-time compliance checkbox**: governance is continuous. Models, data, and regulations change.
- **No lineage between model and training data**: without lineage, you cannot trace a model failure to its root cause or comply with data deletion requests.

## Related

- Same category: [data-modeling-summary.md](./data-modeling.md), [etl-elt-patterns-summary.md](./etl-elt-patterns.md), [lakehouse-architecture-summary.md](./lakehouse-architecture.md)
- Methodology: [../methodology/rag-design-patterns.md](../methodology/rag-design-patterns.md) (data quality is the prerequisite for RAG recall), [../methodology/ai-alignment-strategy.md](../methodology/ai-alignment-strategy.md) (alignment governance)
- Platform: [../platform/dashboard-data-governance.md](./dashboard-data-governance.md) (governance monitoring)

## References

- DataHub: https://datahubproject.io/
- OpenLineage: https://openlineage.io/
- Great Expectations: https://greatexpectations.io/
- EU AI Act: https://artificialintelligenceact.eu/
- RAGAS: https://github.com/explodinggradients/ragas