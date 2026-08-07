---
title: "FOSE Report: Verification, Harness Engineering, Apprenticeship Crisis, and Legacy Modernization"
tags: [verification, harness-engineering, apprenticeship, legacy-modernization, ai-governance, vibe-coding]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-07-21.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand the five headline findings from the FOSE Europe report, the board-vs-engineer divide, LLMs in operations, and the growing revulsion against LLM-generated prose."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/fragments-july-13-d3002f.md
  - ai-engineer/methodology/fragments-july-6-e27df0.md
---

# FOSE Report: Verification, Harness Engineering, Apprenticeship Crisis, and Legacy Modernization

> **As an** AI engineer or engineering leader, **I want to** understand the five headline findings from the FOSE Europe report and the board-vs-engineer divide, **so that** I can align my organization's AI strategy with the emerging consensus.

## Summary

- The Thoughtworks FOSE Europe report identified five headline findings: code generation is no longer the bottleneck (verification is), harness engineering is emerging as a distinct discipline, organizations face a real apprenticeship crisis, the executive/engineer expectation gap is a major risk, and legacy modernization is the clearest near-term value pool.
- The board-vs-engineer divide: executives see productivity gains; engineers see security risks. The gap is exacerbated by executives using LLMs for management reports (where they work decently) and assuming they must work equally well for programming.
- A cautionary tale: ML-optimized air filter replacement saved $50M but caused $100B in fire damage because the model was trained on desert equipment but deployed in the arctic.
- LLMs in operations: agents find anomalies faster and help humans understand what code does, but auto-remediation raises governance concerns.
- The growing revulsion against LLM-generated prose: readers are developing "LLM-antibodies" that cause them to dismiss content before reading it.

## Core viewpoints

### 1. Verification is the new bottleneck, not code generation
The consensus from FOSE: code generation is no longer the constraint. The bottleneck is verification -- how fast can we tell whether what was generated is correct. This shifts investment from generation tools to verification tools, from prompts to review surfaces, from writing code to validating output.

### 2. The apprenticeship crisis is real and urgent
When senior engineers spend their time orchestrating agents rather than mentoring juniors, the traditional apprenticeship model breaks down. Junior developers lose the opportunity to learn by watching seniors work through problems. This is a structural threat to the profession that no amount of AI tooling can solve on its own.

### 3. The executive/engineer expectation gap is a bigger risk than any technical limitation
Boards see promised productivity gains and are not concerned enough about risks, particularly security. Engineers see vibe-coded applications with no observability, no security controls, and no testing. The gap is worsened by executives' personal experience with LLMs: they work well for management reports, so executives assume they work equally well for programming. Kelsey Hightower's observation: "The less busy work you have, the less appealing these AI tools are."

### 4. Context is the difference between $50M saved and $100B lost
The air filter story: an ML model trained on desert equipment (where dust is the concern) was deployed on arctic equipment (where mosquitoes are the concern). Mosquitoes rot, decaying mosquitoes are a fire risk, and the result was $100 billion in fire damage. The lesson: AI suggestions must be validated in context, and sensors must provide rapid feedback when context changes.

### 5. LLM-generated prose is becoming a liability
Martin Fowler reports a visceral reaction to LLM-generated writing: after a couple of paragraphs, he wants to dismiss the entire article. This "LLM-antibody" response means AI-generated or AI-polished writing may discredit content before the reader engages with the ideas. The advice: "Say Your Writing" -- read it aloud to find your real voice and combat the smoothing effect of AI.

## Key info

- Five headline findings: verification bottleneck, harness engineering discipline, apprenticeship crisis, executive/engineer gap, legacy modernization value.
- Vibe-coding controls: separate infrastructure, deterministic controls over data access, threat modeling sessions with board members.
- The "lethal trifecta" of AI security must be addressed for citizen-developed applications.
- LLMs in operations: agents find anomalies faster, cross-match code and traces, collate information from repeated incidents.
- Auto-remediation requires careful documentation of all agent actions and feedback to development teams.
- Law professors rated LLM answers 75% higher than peer answers for student contract law questions.
- DSLs are token-efficient, security-bounded, and translate high-level intent into deterministic code.

## Action recommendations

1. Shift investment from code generation to verification: build better review surfaces, automated gates, and fast feedback loops.
2. Create deliberate apprenticeship structures. Do not let the conductor model of senior engineers eliminate mentoring opportunities.
3. Run threat modeling sessions with board members to close the executive/engineer expectation gap on AI security risks.
4. Put vibe-coded applications in separate infrastructure with deterministic controls over data access.
5. When writing, do not use AI to polish your prose. The LLM voice is increasingly detectable and discredits your writing. Say your writing aloud to find your real voice.

## Anti-patterns

- **Focusing on code generation speed while neglecting verification.** The bottleneck has shifted.

- **Letting senior engineers become full-time agent conductors with no ....** Letting senior engineers become full-time agent conductors with no mentoring time. The apprenticeship crisis is structural and urgent.

- **Deploying AI models without context validation.** The air filter story is a $100B reminder that context matters.

- **Using AI to write or polish prose.** LLM-antibodies mean the writing may be dismissed before it is even read.

- **Assuming LLMs do incident resolution well.** Incidents are rarely linear; they require adaptation that LLMs are not good at.

## Related

- ai-engineer/methodology/fragments-july-13-d3002f.md
- ai-engineer/methodology/fragments-july-6-e27df0.md
- ai-engineer/methodology/the-vibesec-reckoning-5effcd.md