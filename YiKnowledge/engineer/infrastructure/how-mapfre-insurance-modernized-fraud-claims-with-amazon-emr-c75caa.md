---
title: How Mapfre Insurance modernized fraud claims with Amazon EMR Serverless
tags: [fraud-detection, EMR Serverless, Apache Iceberg, graph-database, Neo4j, ML, lakehouse, Guidewire]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/how-mapfre-usa-modernized-fraud-claims-with-amazon-emr-serverless/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, engineer, ai-engineer]
benefit: "Learn how graph-based features + ML on a lakehouse architecture (Iceberg + EMR Serverless + Neo4j) delivered $5M+ NPV in fraud detection savings with 50-135% accuracy improvement."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./set-up-a-data-pipeline.md
---

# How Mapfre Insurance modernized fraud claims with Amazon EMR Serverless

> **As a** data engineering lead in insurance, **I want to** combine graph-based features with ML models on a lakehouse architecture, **so that** fraud rings and hidden relationships across claims, policies, and providers can be detected where traditional rules-based approaches fail.

## Summary

- Mapfre Insurance built a fraud detection platform (Atenea) on AWS combining graph-based features (Neo4j) with ML models, deployed on a lakehouse architecture using Apache Iceberg tables on S3 with AWS Glue Data Catalog and Lake Formation governance.
- Three-layer data model: Silver (raw source data), Gold (intermediate features), Platinum (Feature Store: encoded features + model predictions). EMR Serverless handles batch processing and scoring; MWAA (Airflow) orchestrates.
- Graph enrichment via Neo4j captures entity relationships: suspicious claim linkages, provider fraud ratios, centrality metrics. Neo4j Bloom supports investigative workflows with visual relationship exploration.
- Results: 50-135% detection accuracy improvement, $5M+ NPV in realized savings, and automatic Guidewire activity creation for front-line adjusters with top-3 model drivers for explainability.
- Guidewire integration: Lambda reads S3 scoring results, calls Guidewire Predictive Model API per-claim, with retries, DLQ, and SNS alerts for resilience.

## Core viewpoints

### 1. Graph features + ML finds what rules miss

Traditional fraud detection uses rules-based controls and structured-data-only analysis. These catch known patterns but miss sophisticated fraud rings. Graph features (shared addresses, providers, vehicles, prior incidents) reveal hidden relationships that rules cannot express.

### 2. Explainability drives adoption

Each flagged claim generates a Guidewire activity showing the top three model drivers. Investigators understand why the claim was flagged, which builds trust and accelerates action. Without explainability, even accurate models are ignored.

### 3. The lakehouse pattern (Iceberg + Glue + Lake Formation) provides long-term governance

The platform's layered architecture (Silver/Gold/Platinum) with Iceberg tables enables schema evolution, time travel, and fine-grained access control through Lake Formation. The Feature Store as managed Iceberg tables makes features reusable across models.

### 4. The Platinum Feature Store layer is the organizational scaling mechanism

Once features are computed and stored as managed Iceberg tables, they become reusable across models and teams. A fraud detection feature (e.g., "provider claim ratio") built for one model can be consumed by another without re-extracting from source systems. This is how ML platforms scale beyond single-model projects: the marginal cost of a new model drops when features already exist in the store.

### 5. Guidewire integration is the bridge between prediction and business action

The Lambda that reads S3 scoring results and calls the Guidewire Predictive Model API is where ML output becomes a business process. The retry with DLQ and SNS alerting pattern ensures that no prediction is silently dropped. In enterprise ML, the last mile of integration -- getting the prediction into the system where people act on it -- determines whether the model creates value or just generates reports.

## Key info

- Architecture: Iceberg on S3, Glue Data Catalog, Lake Formation, EMR Serverless, MWAA (Airflow), Neo4j, Lambda, Secrets Manager.
- Guidewire integration: S3 event -> Lambda -> Guidewire Predictive Model API (per-claim), with retries, DLQ, SNS alerts.
- Data quality: automated validation at key pipeline stages, monitoring dashboards, standardized recovery and promotion.
- Results: 50-135% accuracy improvement, $5M+ NPV, production savings exceeding projections.

## Action recommendations

1. Start with graph enrichment of existing structured data. Neo4j can be co-located on AWS and fed from Iceberg tables.
2. Use the three-layer lakehouse pattern (raw/feature/prediction) for governance and feature reuse.
3. Integrate ML predictions directly into the business workflow (e.g., Guidewire) with explainability (top model drivers).
4. Implement automated retry + DLQ patterns for API integrations to external systems.

## Anti-patterns

- **Relying solely on structured data for fraud detection.** Do not rely solely on structured data for fraud detection. Fraud rings are relationship-based and require graph features.

- **Deploying ML models without explainability.** Do not deploy ML models without explainability. Adjusters will ignore black-box predictions.

- **Skipping data quality checks at pipeline boundaries.** Do not skip data quality checks at pipeline boundaries. ML models amplify data quality issues.

- **Building graph features without a graph database.** Do not build graph features without a graph database. Attempting to compute graph metrics (centrality, community detection) in SQL on relational tables is possible but becomes exponentially complex as the graph grows. Use a purpose-built graph database like Neo4j from the start.

- **Treating the Feature Store as a dumping ground.** Do not treat the Feature Store as a dumping ground. Without governance (schema enforcement, ownership assignment, freshness SLAs), the Feature Store becomes a swamp of stale, undocumented features that no one trusts. Every feature in the Platinum layer should have a defined owner and a documented refresh cadence.

## Related

- ./set-up-a-data-pipeline.md