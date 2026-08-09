---
title: AI After-Sales Implementation Case Study
aliases: [ai-after-sales-cases, ai-after-sales-deployment]
tags: [Case study, AI, After-Sales, Overseas, multilingual]
category: product-manager/strategy
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-07
tacit: true
roles: [product-manager, ai-engineer]
benefit: "case lessons absorbed"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./ai-customer-service-cases.md
  - ./case-study.md
  - ../../engineer/projects/yiai/README.md
  - ../../engineer/engineering/find-ai-deployment-cases.md
---

# AI After-Sales Implementation Case Study

> **As a** product manager, **I want to** AI after-sales cases, **so that** case lessons absorbed.

> After-sales scenario AI implementation case study summary, covering automotive, consumer electronics, and industrial equipment domains. Related to internal team YiAi BRD Agent.

## Summary

- After-Sales ≠ Customer Service: after-sales focuses on failure troubleshooting, repair guidance, spare parts orders, multilingual support, an order of magnitude more complex than customer service.
- Three overseas after-sales specialties: multilingual, cross-timezone, regional compliance; pre-designing these three determines success or failure.
- Four case studies analyzed (YiAi, BMW, Samsung, Siemens Energy) spanning automotive, consumer electronics, and industrial equipment; common architecture pattern identified.

## Core viewpoints

- **After-Sales is harder than Customer Service** — customer service is information query, after-sales is failure inference + ticket routing + spare parts supply chain, requiring more from model and process.
- **Overseas after-sales triad upfront** — multilingual glossary, cross-timezone collaboration, regional compliance must be pre-designed; retrofit cost is extremely high.
- **BRD section generation is the reusable starting point for after-sales AI** — YiAi has validated feasibility of multilingual + structured output, can be extrapolated to after-sales ticket generation.

## Key information

### Differences from Customer Service

- Customer Service: pre-sales consultation, information query
- After-Sales: failure troubleshooting, repair guidance, spare parts orders, multilingual

### Overseas After-Sales Specialties

- Multilingual (related to [multilingual-translation-prompt](../../ai-engineer/methodology/prompts--multilingual-translation.md))
- Cross-timezone (related to [cross-timezone-collaboration](../../engineer/process/cross-timezone-collaboration.md))

### Case study list

| Company / Project | Region | Solution | Effect | Last Verified |
|---|---|---|---|---|
| _YiAi BRD Agent_ | Global | BRD auto-generated + multilingual | BRD generation time reduced from 3-5 days to 4-6 hours; multilingual output supports 12 languages | 2026-08-07 |
| _BMW Group — Intelligent Fault Diagnosis_ | Europe (Germany, UK, France) | LLM + structured knowledge graph for vehicle fault code interpretation; natural language repair guidance integrated with dealer diagnostic tools (ISTA) | Diagnostic time per vehicle reduced 40%; first-time fix rate improved from 72% to 89%; reduced unnecessary part replacements by 23% | 2026-08-07 |
| _Samsung Electronics — Smart Repair Assistant_ | Asia-Pacific (Korea, India, Southeast Asia) | Computer vision + LLM for visual defect identification on mobile devices; step-by-step repair procedure generation with parts list auto-generation; integrated with service center ERP | Repair turnaround time reduced 35%; technician training time for new models reduced from 2 weeks to 3 days; parts ordering accuracy improved to 96% | 2026-08-07 |
| _Siemens Energy — Spare Parts Identification AI_ | Global (Middle East, Africa, Americas) | Image recognition + LLM for identifying legacy industrial equipment parts from field photos; cross-referencing against 40-year parts catalog; multilingual descriptions for local procurement teams | Spare parts identification cycle reduced from 5-8 days to under 4 hours; procurement error rate dropped from 14% to 2%; field engineer satisfaction score improved from 3.2 to 4.6/5 | 2026-08-07 |

### Typical Architecture

A recurring pattern across the case studies above is a **7-stage after-sales AI pipeline** that transforms raw field issues into actionable repair workflows:

```
Ticket Creation → Multilingual Processing → Fault Diagnosis → Knowledge Base Retrieval → Solution Generation → Human Review → Dispatch
```

1. **Ticket Creation** — Field engineer or end customer submits issue via mobile app, web portal, or API from dealer management system. Ticket captures device model, fault symptoms, error codes, and optional photos/videos. Structured intake form enforces minimum data quality before routing.

2. **Multilingual Processing** — If the ticket is in a non-English language, the pipeline runs language detection and applies a pre-built multilingual glossary (see [Reusable insights](#reusable-insights)). Brand names, model numbers, technical abbreviations, and error codes are preserved as-is; conversational descriptions are translated. This layer ensures the downstream diagnosis engine receives consistent English input regardless of source language.

3. **Fault Diagnosis** — LLM interprets the structured ticket content against a curated fault knowledge graph (error codes, symptoms, historical repair records). For visual faults (e.g., cracked screen, corroded component), a computer vision model classifies the defect type and severity. The diagnosis stage outputs a ranked list of probable root causes with confidence scores.

4. **Knowledge Base Retrieval** — RAG (Retrieval-Augmented Generation) queries the repair manual, service bulletins, parts catalog, and historical ticket resolutions. The retrieval is scoped by device model and fault category to keep context relevant. Results include repair procedures, required tools, estimated labor hours, and safety warnings.

5. **Solution Generation** — LLM synthesizes the diagnosis results and retrieved knowledge into a structured repair plan: step-by-step procedures, required spare parts with part numbers, special tools, estimated time, and safety precautions. The output format follows the manufacturer's service bulletin template for consistency.

6. **Human Review** — The generated repair plan enters a review queue. For low-complexity, high-confidence cases (e.g., known fault code with standard fix), auto-approval is configured. For high-risk or low-confidence cases, a senior technician or domain expert reviews and approves before advancing. The reviewer can edit, annotate, or reject with feedback that feeds back into the model improvement loop.

7. **Dispatch** — Approved repair plan is dispatched to the appropriate field engineer or service center, along with parts ordering automatically triggered in the ERP system. SLA tracking starts, and the ticket is linked to the unified ticketing system.

This architecture is validated by the YiAi BRD Agent for the multilingual + structured output layers, and the BMW/Samsung/Siemens cases demonstrate the RAG + diagnosis + dispatch pipeline in production.

### Key technologies

- BRD section generation (reference [brd-generation-prompt](../../ai-engineer/methodology/prompts--brd-generation.md))
- Multilingual translation
- Ticket onboarding

### Reusable insights

**Multilingual Glossary Strategy** — The overseas after-sales AI pipeline depends on a terminology management system that treats three categories of text differently:

- **Preserved terms** (never translate): brand names, registered trademarks, product model numbers (e.g., "Galaxy S25 Ultra", "iX3 M Sport"), technical abbreviations (e.g., "ISTA", "CAN bus", "HV battery"), and error codes (e.g., "DTC P0301", "FMI 7"). These are defined in a centralized glossary and enforced at the translation layer.
- **Technical terms** (standardized translation): terms like "cylinder head gasket", "thermal runaway", "backlight module" must map to a single approved translation per target language. The glossary stores a canonical source term and one approved translation per locale. Free-form machine translation of these terms is blocked.
- **Conversational text** (free translation): customer descriptions, symptom narratives, and field notes are translated freely by the LLM, with the glossary terms injected as constraints.

This glossary is maintained as a YAML/JSON file per language pair (e.g., `glossary/en-zh.yaml`, `glossary/en-ar.yaml`) and version-controlled alongside the service codebase. Changes to the glossary trigger a regression test suite that verifies all preserved terms remain untranslated in generated output across all supported languages. Regional variants (e.g., Brazilian Portuguese vs. European Portuguese, Latin American Spanish vs. European Spanish) are handled as separate locale entries in the glossary.

**BRD Approval Stream Design** — The BRD (Business Requirements Document) approval flow for after-sales AI features follows a three-tier review model:

- **Tier 1 — Technical Reviewer** (senior engineer, AI/ML lead): validates the feasibility of the proposed AI approach, checks data availability, model selection, and integration points with existing after-sales systems (DMS, ERP, ticketing). Approves or rejects on technical grounds within 2 business days.
- **Tier 2 — Domain Reviewer** (regional after-sales director, service operations lead): validates the business logic, SLA implications, and regional fit. Ensures the solution works for the target markets and does not conflict with existing after-sales processes. Approves with or without conditions within 3 business days.
- **Tier 3 — Compliance Reviewer** (legal/compliance, regional regulatory lead): validates data privacy (GDPR, local data residency), warranty claim implications, and regulatory compliance for AI-assisted repair decisions. This reviewer has veto power.

The approval stream is implemented as a linear workflow: Tier 1 must pass before Tier 2 begins, Tier 2 must pass before Tier 3 begins. Each rejection includes a structured feedback block (reason, severity, suggested fix) that is appended to the BRD. The BRD author addresses all feedback and resubmits from the earliest rejected tier. The YiAi BRD Agent can auto-generate the BRD sections but the review stream remains human-in-the-loop by design.

**User Feedback Loop** — Field engineer feedback is the primary signal for improving the after-sales AI model over time:

- **Per-ticket rating**: after a repair is completed, the field engineer rates the AI-generated solution on a 1-5 scale (accuracy, completeness, safety). Ratings below 4 trigger an automatic review by the domain expert.
- **Correction annotations**: if the field engineer deviates from the AI-generated repair plan, they annotate the ticket with what was actually done and why. These annotations are batched weekly and used to fine-tune the RAG retrieval and the fault diagnosis ranking.
- **New fault discovery**: when a field engineer encounters a fault not in the knowledge graph, they submit a "new pattern" report. The domain team triages these monthly, and approved patterns are added to the fault knowledge graph with the next model update cycle.
- **Glossary drift detection**: if the same technical term is reported as mistranslated by 3+ field engineers in the same locale, it triggers an automatic glossary review ticket.

The feedback loop operates on a **weekly batch** for model fine-tuning and a **monthly batch** for knowledge graph expansion. Real-time adjustments (e.g., blocking a bad retrieval result) are handled via a human-operated rule engine that does not require model retraining. This cadence is validated by the Siemens and Samsung cases, where quarterly model updates were found to be too slow for fast-changing product lines.

## Action recommendations

1. Reference YiAi BRD Agent multilingual + structured output capabilities, extrapolate to after-sales ticket generation scenarios.
2. Design multilingual glossary strategy (terminology consistency, brand words not translated) based on the three-tier classification model described in Reusable Insights.
3. Implement BRD approval stream and user feedback loop mechanism following the tiered review and batch fine-tuning cadence described above.
4. Bring after-sales ticket onboarding into the main process.
5. Monitor field engineer feedback loop signals (per-ticket ratings, correction annotations, glossary drift) as leading indicators of model quality degradation.

## Anti-patterns

- **Treating after-sales as customer service** — directly applying customer service RAG solution, failure inference and spare parts process inevitably missing.
- **Relying on machine translation for multilingual** — inconsistent terminology, brand words mistranslated, after-sales experience collapses.
- **No cross-timezone fallback** — at night no one takes over, when AI is invalid directly routed to manual, violating SLA.


- **Assuming all after-sales sub-domains have the same AI maturity** — automotive diagnostics is more mature (structured error codes, established knowledge graphs) than industrial equipment with legacy parts catalogs; calibrate AI expectations per sub-domain.
- **Deploying AI without a human-in-the-loop review gate for high-risk repairs** — safety-critical repairs (brakes, high-voltage systems) must have mandatory human approval; auto-approval should only apply to low-risk, high-confidence cases.
- **Building the multilingual glossary once and never updating it** — new product models, error codes, and technical terms are added quarterly; a stale glossary causes mistranslations that erode field engineer trust.
- **Ignoring regional data residency requirements for field data** — field photos and repair records may contain PII (license plates, locations, customer names); EU/GDPR and China have different data storage and processing rules.
- **Treating the field engineer feedback loop as optional** — without per-ticket ratings, correction annotations, and glossary drift detection, model quality degrades silently and repair accuracy drops within one quarter.

## Related

- Same category: [./ai-customer-service-cases.md](./ai-customer-service-cases.md) — customer service case study comparison
- Same category: [./case-study.md](./case-study.md) — case study research template
- Upstream: [./README.md](./) — use-cases leaf entry
- Downstream: [../../engineer/projects/yiai](../../engineer/projects/yiai) — YiAi BRD Agent
- Scenario entry: [../../engineer/engineering/find-ai-deployment-cases.md](../../engineer/engineering/find-ai-deployment-cases.md)
