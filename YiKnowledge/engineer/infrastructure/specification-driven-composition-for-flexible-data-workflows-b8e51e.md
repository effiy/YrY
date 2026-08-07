---
title: Specification-driven composition for flexible data workflows
tags: [data-pipelines, serverless, Step Functions, Lambda, specification-driven, ETL, governance]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/specification-driven-composition-for-flexible-data-workflows/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, engineer, ai-engineer]
benefit: "Replace brittle, duplicated data pipeline scripts with a three-layer pattern (intent/composition/processing) that onboards new datasets in days instead of weeks."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./set-up-a-data-pipeline.md
  - ./do-a-data-migration.md
---

# Specification-driven composition for flexible data workflows

> **As a** data engineer managing multiple ETL pipelines, **I want to** separate workflow intent from implementation so that onboarding a new dataset does not require modifying and redeploying application code.

## Summary

- Script-based data pipelines accumulate hidden costs: duplicated transformation logic, cascading changes, and late-breaking validation failures. Workflow intent is embedded in code, making governance difficult.
- Specification-driven composition separates concerns into three layers: Intent (structured JSON/YAML specs), Composition (a composer that validates and assembles), and Processing (reusable capability functions).
- The composer compiles a specification into a Step Functions state machine by looking up capabilities in an OpenSearch Service registry. Capabilities are versioned, tested, and governed through CI/CD.
- Teams adopting this pattern report onboarding new datasets in days rather than weeks, because most needed capabilities already exist in the registry.
- The pattern is especially valuable for regulated environments (GxP, healthcare, finance) where business users author intent but cannot author or modify execution code.

## Core viewpoints

### 1. Specifications are governance artifacts, not just config files

In regulated environments, the specification is the auditable record of what the workflow does. It is reviewed and validated before invocation. The generated Step Functions state machine is a system artifact -- business users never touch it. This separation matters for compliance (e.g., FDA submissions in SDTM format).

### 2. The capability registry is the moat

The registry is not a manually edited lookup table. It lives in version control, goes through CI/CD validation, and capability versions are pinned in specifications for reproducibility. New capabilities require validation and approval before registration. This is the governance layer that makes the pattern trustworthy.

### 3. AI tools can assist with specification authoring

Declarative specifications enable AI tools to help with capability discovery, specification authoring, and pipeline analysis. Runtime behavior stays predictable because it relies on validated capabilities. The specification is machine-readable intent.

### 4. Preprocessing steps as first-class capabilities is a design choice with compounding returns

Column standardization, numeric casting, and unit conversion are often treated as ad-hoc preprocessing embedded in each pipeline. By modeling them as versioned capabilities in the registry, they become reusable, testable, and governable. The marginal cost of adding data quality preprocessing to a new pipeline approaches zero, and consistency across pipelines improves because every pipeline uses the same validated capability.

### 5. Sensitivity classification in the specification is a compliance multiplier

Declaring field sensitivity (e.g., PHI, PII, PCI) in the spec and capability behavior in the registry allows the composer to derive output sensitivity automatically. This means privacy impact assessments and data flow audits can be generated from the specification rather than conducted manually. The specification becomes the data flow diagram, and sensitivity propagation is deterministic rather than reliant on human judgment for each pipeline.

## Key info

- Three layers: Intent (specification JSON/YAML), Composition (Lambda composer + OpenSearch registry), Processing (Step Functions + Lambda capabilities).
- Preprocessing steps (column standardization, numeric casting, unit conversion) can be modeled as first-class capabilities with the same metadata, versioning, and validation.
- Sensitivity classification: tag fields in the spec (e.g., `"sensitivity": "PHI"`), declare capability behavior in the registry, and the composer derives output sensitivity automatically.
- Composer can be invoked via S3 events, EventBridge schedules, API/UI actions, or direct Step Functions StartExecution calls.

## Action recommendations

1. Take one existing pipeline with 3+ variants and describe it as a specification. Implement a small set of reusable capabilities.
2. Store capability definitions in version control with CI/CD validation. Pin capability versions in specifications.
3. Use OpenSearch Service for the capability registry if you need full-text/semantic search over capability metadata.
4. For regulated workloads, add sensitivity classification to the specification and capability registry from day one.

## Anti-patterns

- **Applying this pattern to simple, one-time transformations or pipelines with ....** Do not apply this pattern to simple, one-time transformations or pipelines with fewer than 3-5 workflows. The overhead of the composer and registry outweighs the benefit.

- **Letting the registry become a manually edited lookup table.** Do not let the registry become a manually edited lookup table. It must be version-controlled and CI/CD-validated.

- **Skipping the composer.** Do not skip the composer. Writing specifications directly into Step Functions ASL defeats the governance separation.

- **Using the specification pattern for pipelines with fewer than 3-5 workflows.** Do not use the specification pattern for pipelines with fewer than 3-5 workflows. The composer and registry overhead is justified by reuse; for one-off transformations, a simple script is more appropriate and easier to maintain.

- **Versioning capabilities independently of the specifications that use them.** Do not version capabilities independently of the specifications that use them. A capability version change can break existing specifications silently if the composer does not enforce pinned versions. Always pin capability versions in specifications and require explicit specification updates to adopt new capability versions.

## Related

- ./set-up-a-data-pipeline.md
- ./do-a-data-migration.md