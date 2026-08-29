---
title: YrY Knowledge Base — Quick Reference
aliases: [quick-reference, cheat-sheet, quick-ref, lookup]
tags: [index, quick-reference, cheat-sheet, navigation, lookup]
category: root
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, producter, aier, srer, executiver, curator]
benefit: "Anyone finds the right file in under 10 seconds — 'I want to X → go to file Y'"
acceptance_criteria:
  - "50+ task → file mappings covering all 7 roles"
  - "each mapping is a verified existing file path"
  - "organized by role and task type"
related:
  - ./INDEX.md
  - ./README.md
  - ./demos/playground.md
---

# YrY Knowledge Base — Quick Reference

> **How to use:** Find your task in the left column, go to the file in the right column. Every path is verified.

## Engineer — How to Implement

| I want to... | Go to |
|---|---|
| Add a cross-project RPC call | [engineer/build/implement-cross-project-rpc-call.md](engineer/build/implement-cross-project-rpc-call.md) |
| Implement SSE streaming | [engineer/build/implement-sse-streaming.md](engineer/build/implement-sse-streaming.md) |
| Add a YiAi domain module | [engineer/build/add-a-yiai-domain-module.md](engineer/build/add-a-yiai-domain-module.md) |
| Add a YiVad ProTable page | [engineer/build/add-a-yivad-page.md](engineer/build/add-a-yivad-page.md) |
| Debug YiPet content script | [engineer/build/debug-yipet-content-script.md](engineer/build/debug-yipet-content-script.md) |
| Set up testing | [engineer/ship/set-up-testing-infrastructure.md](engineer/ship/set-up-testing-infrastructure.md) |
| Harden supply chain | [engineer/ship/harden-supply-chain.md](engineer/ship/harden-supply-chain.md) |
| Implement retry with backoff | [engineer/ship/retry-with-backoff.md](engineer/ship/retry-with-backoff.md) |
| Migrate data safely | [engineer/ship/migrate-data.md](engineer/ship/migrate-data.md) |
| Check known gotchas | [engineer/learn/lessons/gotchas/](engineer/learn/lessons/gotchas/) |
| See a real bug | [engineer/learn/lessons/bugs/](engineer/learn/lessons/bugs/) |
| Learn YiAi architecture | [engineer/learn/projects/yiai/architecture.md](engineer/learn/projects/yiai/architecture.md) |
| Learn YiVad architecture | [engineer/learn/projects/yivad/architecture.md](engineer/learn/projects/yivad/architecture.md) |
| Learn YiPet architecture | [engineer/learn/projects/yipet/architecture.md](engineer/learn/projects/yipet/architecture.md) |

## Leader — How to Decide

| I want to... | Go to |
|---|---|
| Write an ADR | [curator/templates/adr.md](curator/templates/adr.md) |
| Evaluate a technology | [curator/templates/tech-selection-evaluation.md](curator/templates/tech-selection-evaluation.md) |
| Write a postmortem | [leader/risk/write-a-postmortem.md](leader/risk/write-a-postmortem.md) |
| Assess launch risks | [leader/risk/launch-risk-assessment.md](leader/risk/launch-risk-assessment.md) |
| Run a FinOps review | [leader/capacity/run-a-finops-review.md](leader/capacity/run-a-finops-review.md) |
| Write a tech design | [curator/templates/tech-design.md](curator/templates/tech-design.md) |
| Manage tech debt | [leader/roadmap/manage-tech-debt.md](leader/roadmap/manage-tech-debt.md) |
| Plan a tech roadmap | [leader/roadmap/plan-tech-roadmap.md](leader/roadmap/plan-tech-roadmap.md) |
| Define an SLO | [leader/roadmap/define-an-slo.md](leader/roadmap/define-an-slo.md) |

## Producter — What to Build

| I want to... | Go to |
|---|---|
| Write a PRD | [producter/discovery/write-a-prd.md](producter/discovery/write-a-prd.md) |
| Do user research | [producter/frameworks/do-user-research.md](producter/frameworks/do-user-research.md) |
| Prioritize features (RICE/ICE) | [producter/frameworks/rice-ice-prioritization.md](producter/frameworks/rice-ice-prioritization.md) |
| Run a sprint | [producter/delivery/run-a-sprint.md](producter/delivery/run-a-sprint.md) |
| Define a north star metric | [producter/discovery/metrics/north-star-metric.md](producter/discovery/metrics/north-star-metric.md) |
| Map user stories | [producter/frameworks/story-mapping.md](producter/frameworks/story-mapping.md) |
| Study AI product cases | [producter/strategy/ai-customer-service-cases.md](producter/strategy/ai-customer-service-cases.md) |
| Run a usability test | [curator/templates/usability-test-report.md](curator/templates/usability-test-report.md) |
| Interview a user | [curator/templates/user-research-interview.md](curator/templates/user-research-interview.md) |

## SRE — How to Operate

| I want to... | Go to |
|---|---|
| Respond to an incident | [srer/incident-response/respond-to-an-incident.md](srer/incident-response/respond-to-an-incident.md) |
| Handle a data breach | [srer/incident-response/handle-a-data-breach.md](srer/incident-response/handle-a-data-breach.md) |
| Run a war room | [srer/incident-response/run-a-war-room.md](srer/incident-response/run-a-war-room.md) |
| Handle an on-call shift | [srer/incident-response/handle-an-oncall-shift.md](srer/incident-response/handle-an-oncall-shift.md) |
| Set up on-call rotation | [srer/incident-response/set-up-an-oncall-rotation.md](srer/incident-response/set-up-an-oncall-rotation.md) |
| Set up observability | [srer/observability/set-up-observability.md](srer/observability/set-up-observability.md) |
| Define SLOs/SLIs | [srer/observability/slo-sli-definition.md](srer/observability/slo-sli-definition.md) |
| Ship a release | [srer/release/release-procedure.md](srer/release/release-procedure.md) |
| Do a canary release | [srer/release/canary-release.md](srer/release/canary-release.md) |
| Ship a hotfix | [srer/release/hotfix-release.md](srer/release/hotfix-release.md) |
| Do a rollback drill | [srer/release/rollback-drill.md](srer/release/rollback-drill.md) |
| Manage a release freeze | [srer/release/release-freeze.md](srer/release/release-freeze.md) |
| Monitor capacity and cost | [srer/observability/capacity-and-cost.md](srer/observability/capacity-and-cost.md) |
| Set up CI/CD | [srer/observability/cicd.md](srer/observability/cicd.md) |
| Understand observability triad | [srer/observability/observability-triad.md](srer/observability/observability-triad.md) |

## AI Engineer — How to Use AI

| I want to... | Go to |
|---|---|
| Choose an LLM | [aier/foundations/llm-fundamentals.md](aier/foundations/llm-fundamentals.md) |
| Understand RAG patterns | [aier/foundations/rag-patterns.md](aier/foundations/rag-patterns.md) |
| Choose a vector DB | [aier/platform/vector-db-selection.md](aier/platform/vector-db-selection.md) |
| Choose an embedding model | [aier/platform/embedding-model-selection.md](aier/platform/embedding-model-selection.md) |
| Design an agent | [aier/methodology/agent-architecture-patterns.md](aier/methodology/agent-architecture-patterns.md) |
| Evaluate an LLM | [aier/methodology/llm-evaluation.md](aier/methodology/llm-evaluation.md) |
| Evaluate an agent | [aier/methodology/agent-evaluation.md](aier/methodology/agent-evaluation.md) |
| Write a prompt | [aier/methodology/prompt-engineering.md](aier/methodology/prompt-engineering.md) |
| Review code with AI | [aier/methodology/prompts/code-review-prompt.md](aier/methodology/prompts/code-review-prompt.md) |
| Use RAG prompt | [aier/methodology/prompts/rag-system-prompt.md](aier/methodology/prompts/rag-system-prompt.md) |
| Use agent tool prompt | [aier/methodology/prompts/agent-tool-use-prompt.md](aier/methodology/prompts/agent-tool-use-prompt.md) |
| Generate a BRD with AI | [aier/methodology/prompts/brd-generation-prompt.md](aier/methodology/prompts/brd-generation-prompt.md) |
| Apply chain-of-thought | [aier/methodology/prompts/chain-of-thought-prompting.md](aier/methodology/prompts/chain-of-thought-prompting.md) |
| Use traditional ML | [aier/ml/traditional-ml-patterns.md](aier/ml/traditional-ml-patterns.md) |

## Executive — Business Strategy

| I want to... | Go to |
|---|---|
| Analyze competitors | [executiver/industry/competitors/competitor-analysis-template.md](executiver/industry/competitors/competitor-analysis-template.md) |
| Write an industry report | [executiver/industry/reports/industry-report-template.md](executiver/industry/reports/industry-report-template.md) |
| Write a BRD | [curator/templates/brd.md](curator/templates/brd.md) |
| Run a SWOT analysis | [executiver/strategy/swot-analysis.md](executiver/strategy/swot-analysis.md) |
| Run Porter's Five Forces | [executiver/strategy/porter-five-forces.md](executiver/strategy/porter-five-forces.md) |
| Plan quarterly strategy | [executiver/roadmap/quarterly-business-review.md](executiver/roadmap/quarterly-business-review.md) |
| Plan annual strategy | [executiver/roadmap/annual-strategic-planning.md](executiver/roadmap/annual-strategic-planning.md) |

## Curator — Knowledge Governance

| I want to... | Go to |
|---|---|
| Create a new knowledge file | [curator/governance/readiness-checklist.md](curator/governance/readiness-checklist.md) |
| Use a template | [curator/templates/](curator/templates/) |
| Check knowledge base health | [curator/diagrams/dashboard-index.md](curator/diagrams/dashboard-index.md) |
| See the directory blueprint | [curator/diagrams/directory-blueprint.md](curator/diagrams/directory-blueprint.md) |
| See the knowledge map | [curator/diagrams/knowledge-map.md](curator/diagrams/knowledge-map.md) |
| Archive a file | [curator/archive/archive.md](curator/archive/archive.md) |

## Interactive — Try It Now

| I want to... | Go to |
|---|---|
| Test the RPC envelope | [demos/playground.md](demos/playground.md) |
| Stream AI chat | [demos/playground.md](demos/playground.md) |
| Query RAG | [demos/playground.md](demos/playground.md) |
| Instantiate a demo | [demos/playground.md](demos/playground.md) |
| Test a prompt | [demos/playground.md](demos/playground.md) |
| See the filter/query bug | [demos/playground.md](demos/playground.md) |
| Start a demo project | [demos/INDEX.md](demos/INDEX.md) |