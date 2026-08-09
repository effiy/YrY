---
title: BRD Agent PRD
aliases:
- AI BRD Agent PRD
- Overseas After-Sales BRD Agent
tags:
- prd
- brd
- ai-agent
- yi-ai
- overseas-after-sales
category: product-manager/discovery/prd
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- product-manager
- tech-lead
- engineer
- ai-engineer
- executive
benefit: Structured, compliant, multilingual BRD generation for overseas after-sales teams — turning unstructured requirements into actionable business documents
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../write-a-brd.md
- ../../frameworks/write-a-brd.md
- ../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/story.md
- ../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-draft-generation
- ../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/multilingual-brd
- ../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-approval-flow
- ../../../engineer/lessons/win-yiai-brd-agent-launch.md
- ../../../knowledge-curator/templates/brd.md
tacit: false
---

# BRD Agent PRD

> **As a** product manager for YiAi, **I want to** define the requirements for an AI-powered BRD generation agent for overseas after-sales teams, **so that** service centers can produce structured, compliant business requirements documents in multiple languages without being BRD-writing experts.

> Overseas after-sales teams in 60+ countries need to produce BRDs for local operational needs — warranty process changes, parts procurement workflows, service center staffing models. These teams are not trained in BRD writing, the documents must comply with headquarters standards, and they must be produced in the local language while remaining reviewable by headquarters staff in English or Chinese.

## Summary

- Overseas after-sales teams across 60+ countries face a structural gap: they have operational needs but lack the BRD-writing expertise and headquarters compliance knowledge to document them effectively.
- The BRD Agent is an AI-powered tool within the YiAi platform that transforms unstructured requirements (voice notes, meeting transcripts, bullet points, templates with fill-in-the-blanks) into structured, compliant BRDs.
- Three core capabilities: BRD generation (transform unstructured input into a structured BRD following the headquarters template), compliance checklist (automatically validate the BRD against headquarters requirements), multilingual support (generate in the local language, maintain English/Chinese review copies).
- An integrated approval workflow routes the generated BRD through the appropriate review chain (local manager, regional compliance officer, headquarters), with version tracking and audit trail.
- Success is measured by: BRD generation time reduction (from 2-3 weeks to 2-3 days), compliance pass rate on first submission (from 40% to 85%), and user satisfaction (NPS target of 50+).

## Core viewpoints

### 1. The problem is expertise asymmetry, not tooling
The core problem is not that teams lack a BRD template — they already have one. The problem is that writing a compliant BRD requires domain knowledge that local service center managers do not have: headquarters compliance standards, cross-regional consistency requirements, and the structured thinking needed to translate operational needs into business requirements. The BRD Agent must encode this expertise, not just provide a form. The agent is a domain expert, not a form-filler.

### 2. Multilingual support is a compliance requirement, not a feature
A BRD written in Thai by a Bangkok service center must be reviewable by a compliance officer in Shanghai who reads Chinese and English. The BRD Agent must not just translate — it must maintain the semantic precision of business requirements across languages. A "warranty claim escalation threshold" must mean the same thing in Thai, Chinese, and English. This requires a structured representation (the BRD schema) that is language-independent, with language-specific rendering layers.

### 3. The agent is the interface — conversational and iterative
The BRD Agent should work through a conversational interface where the user describes their need in natural language, the agent asks clarifying questions, iteratively refines the BRD, and produces a final document. This is not a one-shot generation — it is a structured conversation. The agent follows the BRD template as a schema, probing each section (background, problem statement, scope, requirements, success criteria, risks) and filling it in collaboratively with the user.

### 4. Compliance is automated, not delegated
The compliance checklist must be automated — the agent validates the BRD against a rules engine that encodes headquarters requirements. Required sections must be present. Budget estimates must be within thresholds. Risk assessments must cover mandated categories. The validation is not "does this look like a BRD?" but "does this BRD meet the 47 specific requirements that headquarters mandates?" The compliance officer's role shifts from validator to exception-handler.

### 5. Approval workflow is a first-class requirement
The BRD Agent must integrate with the organization's approval workflow. A generated BRD is not self-approved — it must be routed through a configurable chain: local manager (validates operational need), regional compliance officer (validates compliance), headquarters (final approval). The workflow must support: sequential and parallel approvals, comment and revision cycles, version history, and audit trail. Without this, the generated BRD is a document that goes nowhere.

## Key info

### Problem statement

Overseas after-sales service centers in 60+ countries need to submit BRDs for local operational changes. Current process:
- Service center manager identifies a need (e.g., "we need a faster warranty parts procurement process for electric vehicles").
- Manager writes a BRD using a headquarters template — but lacks BRD-writing training and may not know all compliance requirements.
- BRD is submitted to headquarters, reviewed by a compliance officer, and typically rejected 2-3 times for missing information or non-compliance.
- Each revision cycle takes 1-2 weeks. Total time from need identification to approved BRD: 4-6 weeks.
- Compliance pass rate on first submission: approximately 40%.

### User personas

1. **After-Sales Service Center Manager**: Operational expert, not a BRD writer. Needs to get a BRD approved quickly so operational changes can proceed. Speaks the local language primarily. Wants: simple, guided, fast.

2. **Regional Compliance Officer**: Reviews BRDs from multiple service centers in a region. Needs to ensure consistency and compliance across all submissions. Wants: structured BRDs that are easy to review, automated compliance checks, side-by-side multilingual review.

3. **Headquarters BRD Approver**: Final approver. Needs to see the BRD summary and compliance status at a glance. Wants: confidence that the BRD has been validated, clear decision support.

4. **YiAi Platform Administrator**: Manages the BRD template, compliance rules, and approval workflows. Wants: configurable templates, rules engine, and workflow builder.

### Feature requirements

**BRD Generation (P0)**
- Conversational interface: user describes the need in natural language; agent asks clarifying questions.
- Structured output: BRD follows the headquarters template (background, problem statement, scope, functional requirements, non-functional requirements, success criteria, risks, budget, timeline).
- Iterative refinement: agent and user collaboratively refine each section.
- Reference integration: agent can pull relevant data from YiKnowledge (company standards, past BRDs, industry benchmarks).
- Template library: support for different BRD types (warranty process change, parts procurement, staffing model, tooling request, compliance update).

**Compliance Checklist (P0)**
- Rules engine: encode headquarters BRD requirements as executable rules (e.g., "risk assessment must cover at least 3 categories: operational, financial, compliance").
- Real-time validation: as the BRD is generated, flag missing or non-compliant sections.
- Compliance score: overall score and per-section breakdown.
- Rule management: YiAi platform administrators can add, modify, and deprecate rules.

**Multilingual Support (P0)**
- Primary language generation: BRD is generated in the user's preferred language (15+ languages supported).
- Review copies: automatic generation of English and Chinese review copies.
- Semantic consistency: the structured BRD schema is language-independent; all language versions represent the same underlying data.
- Terminology management: organization-specific terminology is translated consistently.

**Approval Workflow (P1)**
- Configurable approval chains: sequential, parallel, or hybrid.
- Comment and revision: approvers can leave section-specific comments; agent can revise the BRD based on comments.
- Version history: every revision is tracked.
- Audit trail: who approved, when, and what changes were made.
- Status tracking: the submitter can see where their BRD is in the approval pipeline.

### Success metrics

| Metric | Current Baseline | Target | Measurement |
|---|---|---|---|
| BRD generation time | 2-3 weeks (manual) | 2-3 days (agent-assisted) | Time from start to first submission |
| Compliance pass rate (first submission) | 40% | 85% | First-submission approval rate |
| Revision cycles per BRD | 2-3 cycles | 1 cycle | Average revisions before approval |
| User satisfaction (NPS) | N/A (new product) | 50+ | Quarterly NPS survey |
| Total BRD cycle time (need to approval) | 4-6 weeks | 1-2 weeks | End-to-end time |
| BRD submissions per month | 15-20 (status quo) | 25-30 (increased throughput) | Monthly submission count |

### Technical considerations

- The BRD Agent is built on the YiAi platform, leveraging the existing LLM infrastructure and YiKnowledge integration.
- The conversational interface follows the YiAi aiChat patterns (streaming responses, structured output, tool use).
- The BRD schema is defined as a structured data model, not just a markdown template — this enables language-independent representation and automated compliance checking.
- The rules engine should be declarative (rules as data, not code) so that compliance officers can manage rules without engineering support.
- Integration with YiKnowledge for: BRD template (knowledge-curator/templates/brd.md), company standards, past BRD examples, and industry benchmarks.

## Action recommendations

1. Build the BRD schema first — a structured data model that represents every section of a BRD in a language-independent format. This is the foundation for generation, compliance checking, and multilingual support.
2. Start with the conversational generation flow for a single BRD type (warranty process change) in 3 languages (English, Chinese, Thai) before expanding to all BRD types and 15+ languages.
3. Encode the top 20 compliance rules (the ones that cause 80% of first-submission rejections) in the rules engine before building the full rule library.
4. Implement the approval workflow with a simple sequential chain (local manager -> regional compliance -> headquarters) before adding parallel and hybrid approval patterns.
5. Measure and iterate on the user experience before scaling — the conversational agent must feel like a helpful collaborator, not an interrogation.

## Anti-patterns

- **One-shot generation without iteration**: generating a full BRD from a single prompt and expecting it to be correct. The agent must iterate with the user to refine each section.
- **Treating compliance as a post-generation step**: running compliance checks only after the BRD is complete. Compliance should be real-time — flag issues as the BRD is being generated.
- **Machine translation instead of multilingual generation**: translating the final English BRD into Thai via a generic translation API. This loses semantic precision. The BRD must be generated natively in the target language from the structured schema.
- **Rigid approval workflow**: hardcoding a single approval chain for all BRDs. Different BRD types and different regions need different approval chains. The workflow must be configurable.
- **Ignoring the organizational change management**: introducing an AI agent into a process that people have been doing manually for years requires training, change management, and executive sponsorship. The tool is only half the solution.

## Related

- Upstream: [../../write-a-brd.md](../../write-a-brd.md) (BRD writing guide); [../../frameworks/write-a-brd.md](../../frameworks/write-a-brd.md) (BRD framework); [../../../knowledge-curator/templates/brd.md](../../../knowledge-curator/templates/brd.md) (BRD template used by the agent).
- Project context: [../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/story.md](../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/story.md) (the YiAi story that tracks this feature); [../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-draft-generation](../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-draft-generation) (BRD draft generation sub-story); [../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/multilingual-brd](../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/multilingual-brd) (multilingual BRD sub-story); [../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-approval-flow](../../../engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-approval-flow) (approval workflow sub-story).
- Wins: [../../../engineer/lessons/win-yiai-brd-agent-launch.md](../../../engineer/lessons/win-yiai-brd-agent-launch.md) (launch lessons learned).

## References

- YiAi platform architecture and aiChat infrastructure
- YiKnowledge BRD template at `knowledge-curator/templates/brd.md`
- Headquarters BRD compliance standards (internal document)
- YiAi story: overseas-after-sales-ai-brd-agent