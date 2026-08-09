---
title: AI safety and guardrails dashboard
aliases:
- AI safety dashboard
- LLM guardrails dashboard
- AI trust and safety dashboard
- model safety dashboard
tags:
- dashboard
- ai-safety
- guardrails
- red-teaming
- bias
- content-filtering
- responsible-ai
category: ai-engineer/foundations
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- ai-engineer
- tech-lead
- executive
benefit: AI safety posture and guardrail effectiveness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible
related:
- ./dashboard-ai-maturity.md
- ../platform/dashboard-ai-performance.md
- ../methodology/dashboard-ai-methodology.md
- ../../engineer/quality-security/dashboard-security-posture.md
tacit: false
---

# AI safety and guardrails dashboard

> **As an** AI engineer, **I want to** track AI safety posture and guardrail effectiveness, **so that** AI systems are safe, fair, and aligned with responsible AI principles before they harm users or the business.

> Safety is not a feature — it's a non-negotiable property of AI systems. This dashboard tracks guardrail effectiveness, safety incidents, bias metrics, red-teaming coverage, and content filtering across all AI-powered features.

## Summary

- 5 AI safety dimensions: guardrail effectiveness, safety incidents, bias & fairness, red-teaming, content filtering
- 8 guardrails deployed across input/output: prompt injection detection, PII redaction, toxicity filter, jailbreak detection, hallucination detector, factual grounding, output validation, topic boundary enforcement
- Safety incidents classified by severity: Critical (harmful output), High (biased output), Medium (off-topic), Low (minor quality)
- Red-teaming conducted quarterly with internal team + external vendor; adversarial prompt library of 2,800 test cases
- Dashboard reviewed monthly; safety review board quarterly

## Core viewpoints

- Safety is a property of the system, not the model — the base model alone cannot guarantee safety; safety emerges from the interaction of model, guardrails, prompts, and retrieval context
- Guardrails must be defense-in-depth — input guardrails, retrieval guardrails, generation guardrails, and output guardrails form a layered defense; no single guardrail is sufficient
- Bias compounds at scale — a 0.1% bias rate at 1M requests/day is 1,000 biased outputs/day; small bias rates have large absolute impacts
- Red-teaming is continuous, not a one-time audit — models change, prompts change, and adversaries adapt; red-teaming must be ongoing

## Key information

### 5-panel AI safety overview

```
┌──────────────────────────────────────────────────────────────────┐
│  GUARDRAIL EFFECTIVENESS          │  SAFETY INCIDENTS                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Guardrails:  8 deployed │   │  │  Critical:   0 (0%)     │   │
│  │  Effective:   6 (75%)    │   │  │  High:       2 (0.002%) │   │
│  │  Partial:     1 (13%)    │   │  │  Medium:    12 (0.012%) │   │
│  │  Ineffective: 1 (13%)    │   │  │  Low:       45 (0.045%) │   │
│  │  Block rate:  2.8%       │   │  │  Total:     59/100K req │   │
│  │  False pos:   0.3%       │   │  │  MTTR:       4.2 hours  │   │
│  │  False neg:   0.02%      │   │  │  Trend:      ↓ 15% MoM  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BIAS & FAIRNESS                  │  RED-TEAMING                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Bias score:  0.8%      │   │  │  Test cases: 2,800       │   │
│  │  Gender:     0.3% █     │   │  │  Tested:     2,150 (77%) │   │
│  │  Race:       0.5% █     │   │  │  Passed:     1,892 (88%) │   │
│  │  Age:        0.2% ▏     │   │  │  Failed:      258 (12%)  │   │
│  │  Religion:   0.1% ▏     │   │  │  Fixed:       180 (70%)  │   │
│  │  Fairness:   92/100     │   │  │  Open:         78 (30%)  │   │
│  │  Debiasing:  78% eff.   │   │  │  Next:       Q4 2026    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Guardrail inventory

| Guardrail | Type | Stage | Effectiveness | Precision | Recall | Latency add | Status |
|---|---|---|---|---|---|---|---|
| Prompt injection detection | Input | Pre-LLM | 92% | 96% | 88% | 45ms | Effective |
| PII redaction | Input | Pre-LLM | 95% | 98% | 92% | 28ms | Effective |
| Toxicity filter | Input | Pre-LLM | 88% | 94% | 82% | 35ms | Effective |
| Jailbreak detection | Input | Pre-LLM | 78% | 90% | 65% | 52ms | **Partial** |
| Hallucination detector | Output | Post-LLM | 72% | 85% | 58% | 120ms | **Ineffective** |
| Factual grounding check | Output | Post-LLM | 82% | 88% | 75% | 95ms | Effective |
| Output validation (schema) | Output | Post-LLM | 98% | 99% | 97% | 15ms | Effective |
| Topic boundary enforcement | Output | Post-LLM | 90% | 92% | 88% | 22ms | Effective |

### Hallucination detector — detailed analysis

| Model | Hallucination rate | Detector recall | False positive | Impact | Mitigation |
|---|---|---|---|---|---|
| Claude Opus 4 | 2.1% | 62% | 4.5% | Medium | RAG grounding, citation enforcement |
| Claude Sonnet 4 | 3.5% | 58% | 5.2% | Medium | Reduce context window, source attribution |
| Claude Haiku 4 | 5.8% | 48% | 6.8% | High | Limit to non-critical use cases |
| GPT-4o | 2.8% | 60% | 4.8% | Medium | Grounding prompt, structured output |
| GPT-4o-mini | 6.5% | 42% | 7.5% | High | Avoid open-ended generation |
| Gemini 1.5 Pro | 3.2% | 55% | 5.5% | Medium | Grounding with Google Search |
| **Overall** | **3.5%** | **58%** | **5.5%** | | |

### Safety incident log

| Date | Severity | Use case | Incident | Root cause | Guardrail failure | Resolution | Prevention |
|---|---|---|---|---|---|---|---|
| 2026-08-03 | High | Chat | Model generated incorrect medical advice | Hallucination + no topic boundary | Hallucination detector missed | Response deleted, user notified | Medical topic block |
| 2026-07-22 | High | Chat | Output contained subtle racial stereotype | Bias in training data | Toxicity filter missed (subtle) | Prompt debiasing, output filtered | Bias-aware prompt template |
| 2026-07-15 | Medium | Code Review | Generated code with SQL injection | No output validation for code | Output validation bypassed | Code fixed, validator updated | Security code review guardrail |
| 2026-06-28 | Medium | Search | Off-topic political response to neutral query | Topic boundary failure | Topic boundary too permissive | Response removed | Topic boundary tightened |
| 2026-06-10 | Medium | Agents | Agent executed unintended system command | Tool use without validation | No tool-use safety check | Command blocked post-execution | Tool-use allowlist |
| 2026-05-18 | Low | Documentation | Minor factual error in API documentation | Hallucination, low factuality | Factual grounding missed | Documentation corrected | Source-link requirement |

### Bias & fairness metrics

| Bias dimension | Score | Threshold | Test dataset | Subgroup disparity | Trend | Dataset size |
|---|---|---|---|---|---|---|
| **Gender** | 0.3% | < 0.5% | WinoBias, BOLD | 0.3% (M vs F) | ↓ | 4,200 samples |
| **Race/Ethnicity** | 0.5% | < 0.5% | BOLD, HONEST | 0.5% (White vs non-White) | → | 3,800 samples |
| **Age** | 0.2% | < 0.5% | AgeBias | 0.2% (Young vs Old) | ↓ | 2,100 samples |
| **Religion** | 0.1% | < 0.5% | BOLD | 0.1% (Christian vs non-Christian) | ↓ | 1,800 samples |
| **Socioeconomic** | 0.4% | < 0.5% | Custom | 0.4% (High vs Low SES) | → | 1,500 samples |
| **Overall** | **0.8%** | **< 1.0%** | | | **↓ 0.2%** | **13,400 samples** |

### Red-teaming coverage

| Attack category | Test cases | Tested | Passed | Failed | Fixed | Open | Severity |
|---|---|---|---|---|---|---|---|
| Prompt injection (direct) | 350 | 320 | 285 | 35 | 28 | 7 | Critical |
| Prompt injection (indirect) | 280 | 240 | 205 | 35 | 22 | 13 | Critical |
| Jailbreak (roleplay) | 320 | 280 | 248 | 32 | 25 | 7 | Critical |
| Jailbreak (encoding) | 250 | 200 | 175 | 25 | 18 | 7 | Critical |
| Data extraction | 300 | 250 | 220 | 30 | 22 | 8 | High |
| PII leakage | 280 | 220 | 200 | 20 | 18 | 2 | Critical |
| Toxic content generation | 250 | 200 | 185 | 15 | 12 | 3 | High |
| Bias exploitation | 200 | 150 | 135 | 15 | 10 | 5 | High |
| Hallucination triggering | 300 | 180 | 148 | 32 | 18 | 14 | High |
| Tool-use abuse | 150 | 80 | 68 | 12 | 7 | 5 | Critical |
| Multilingual attacks | 120 | 30 | 23 | 7 | 0 | 7 | Medium |
| **Total** | **2,800** | **2,150** | **1,892** | **258** | **180** | **78** | |

### Content filtering effectiveness

| Filter category | Requests flagged | Block rate | Override rate | False positive | User appeal rate | Appeal upheld |
|---|---|---|---|---|---|---|
| Hate speech | 125/mo | 0.12% | 0.01% | 0.02% | 8% | 12% |
| Violence | 85/mo | 0.08% | 0.01% | 0.01% | 5% | 8% |
| Sexual content | 210/mo | 0.21% | 0.02% | 0.03% | 12% | 15% |
| Self-harm | 42/mo | 0.04% | 0.00% | 0.01% | 3% | 5% |
| Illegal content | 18/mo | 0.02% | 0.00% | 0.00% | 2% | 0% |
| **Total** | **480/mo** | **0.48%** | **0.04%** | **0.07%** | | |

### Safety maturity model

| Level | Description | Current | Target | Gap |
|---|---|---|---|---|
| **L1: Reactive** | Safety incidents handled ad-hoc, no guardrails | — | — | — |
| **L2: Basic** | Basic content filters, manual review for critical outputs | — | — | — |
| **L3: Defined** | Guardrails deployed, incident process defined, basic red-teaming | ← We are here (3.2) | — | — |
| **L4: Managed** | Automated guardrails with metrics, quarterly red-teaming, bias monitoring | — | Q4 2026 | 6 months |
| **L5: Optimizing** | Real-time safety monitoring, automated red-teaming, continuous improvement | — | Q2 2027 | 12 months |

### Safety investment

| Investment area | Annual spend | % of AI budget | ROI | Status |
|---|---|---|---|---|
| Guardrail infrastructure | $85K | 5.2% | Incident prevention | Active |
| Red-teaming (external vendor) | $45K | 2.8% | Vulnerability discovery | Active |
| Bias monitoring tools | $28K | 1.7% | Fairness assurance | Active |
| Safety training (engineers) | $15K | 0.9% | Competency building | Active |
| Content moderation (human review) | $32K | 2.0% | Edge case handling | Active |
| **Total** | **$205K/yr** | **12.6%** | | |

## Action recommendations

1. **Hallucination detector upgrade**: 58% recall, 5.5% false positive; evaluate newer detection models, implement chain-of-verification, add citation requirements
2. **Jailbreak detection improvement**: 65% recall, 78% effectiveness; expand adversarial prompt library, implement embedding-based similarity detection
3. **Red-teaming coverage gap**: 650 untested cases (23%); prioritize critical categories (tool-use abuse, multilingual attacks), complete by Q4
4. **Bias monitoring expansion**: 0.5% race bias at threshold; add intersectional bias testing, expand multilingual bias datasets
5. **Tool-use safety guardrail**: Agent command execution incident; implement tool-use allowlist, parameter validation, and human-in-the-loop for dangerous operations
6. **Medical/topic boundary enforcement**: Medical advice incident; implement topic classifiers for regulated domains, block or redirect to qualified sources
7. **Real-time safety monitoring**: L3→L4 target; implement real-time safety dashboards, automated incident detection, and alerting
8. **Safety training program**: 0.9% of AI budget on training; expand to all AI engineers, include red-teaming techniques and bias awareness
9. **Monthly safety review**: review guardrail metrics, safety incidents, bias trends, and red-teaming progress
10. **External safety audit**: commission independent AI safety audit by Q4 2026, benchmark against NIST AI RMF and EU AI Act requirements



- Safety as a checkbox → deploying guardrails and never testing them; guardrails degrade over time as models and prompts change, they need continuous testing
- Precision at the expense of recall → tuning guardrails to minimize false positives, letting harmful content through; safety is asymmetric — false negatives are much worse than false positives
- English-only safety → testing safety only in English while the product supports 20+ languages; adversarial prompts in other languages easily bypass English-only guardrails
- Safety as the safety team's problem → "the safety team handles it"; every AI engineer is responsible for the safety of their features
- Over-reliance on model alignment → assuming the base model's safety training is sufficient; model alignment is a starting point, not a complete solution

## Related

- Same class: [dashboard-ai-maturity](dashboard-ai-maturity.md) — AI maturity assessment
- Same class: [dashboard-ai-performance](../platform/dashboard-ai-performance.md) — AI model quality
- Same class: [dashboard-ai-methodology](../methodology/dashboard-ai-methodology.md) — prompt engineering, eval
- Same class: [dashboard-security-posture](../../engineer/quality-security/dashboard-security-posture.md) — security posture
- References: NIST — *AI Risk Management Framework 1.0*; Anthropic — *Responsible Scaling Policy*; OWASP — *Top 10 for LLM Applications*; EU AI Act — *High-Risk AI System Requirements*; Google — *PAIR Responsible AI Guide*