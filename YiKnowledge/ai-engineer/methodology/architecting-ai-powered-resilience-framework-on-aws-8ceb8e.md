---
title: "Architecting an AI-Powered Resilience Framework on AWS"
tags: [aws, chaos-engineering, resilience, sre, ci-cd, agentcore]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/architecting-ai-powered-resilience-framework-on-aws/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Build a five-layer AI-powered resilience framework that automatically discovers dependencies, generates targeted chaos experiments, and embeds resilience testing into CI/CD pipelines."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/modernizing-financial-analytics-with-amazon-sagemaker-unifie-ddaaf2.md
---

# Architecting an AI-Powered Resilience Framework on AWS

> **As an** SRE or cloud architect, **I want to** build an automated resilience testing framework that discovers dependencies and generates targeted chaos experiments, **so that** weaknesses are found before customers do, without requiring specialized chaos engineering expertise.

## Summary

- A five-layer AI-powered resilience framework that automatically discovers infrastructure dependencies, generates targeted experiments, executes them safely, analyzes gaps, and continuously validates resilience through CI/CD integration.
- Combines AWS Resilience Hub, Fault Injection Service (FIS), Bedrock AgentCore, and Systems Manager to reduce manual infrastructure mapping from weeks to 2-4 hours.
- Addresses the key barrier to chaos engineering adoption: the expertise gap. AI agents analyze your specific architecture and generate targeted experiments, removing the need for specialized chaos engineering skills.
- Progressive roll-out strategy: pilot (1-2 weeks), expansion (4-6 weeks), enterprise scale (8-12 weeks).

## Core viewpoints

### 1. Resilience is assumed, not proven -- and that is the problem
The core insight is that systems do not fail because infrastructure is not resilient; they fail because resilience is assumed rather than proven. Every deployment introduces new dependencies, every configuration change creates untested paths. The gap between design intent and runtime behavior is where failures hide. The framework closes this gap through continuous, automated validation.

### 2. Two-tiered CI/CD resilience testing is the practical pattern
For every commit, a lightweight policy-as-code check (seconds) validates basic configuration like missing health checks or single-AZ deployments. For significant architectural changes, a full resilience assessment (2-3 minutes per experiment) runs as a pre-production gate. This two-tiered approach prevents pipeline slowdown while catching both configuration drift and architectural weaknesses.

### 3. Progressive scope expansion is the safety mechanism
Experiments start with 1% of resources and expand progressively (1% to 5% to 10% to 25%) based on risk tolerance and validation results. CloudWatch alarms serve as stop conditions, set well below SLA limits. This makes chaos engineering safe enough to run in production environments.

### 4. The framework creates a continuous improvement feedback loop
Experiment results feed back into the discovery and test generation layers. When experiments reveal undocumented dependencies, the architecture map is updated. When remediation actions resolve failure patterns, Systems Manager automation documents capture these procedures. The Bedrock agent analyzes outcomes to refine hypothesis generation, deprioritizing consistently passing scenarios and focusing on emerging risks.

### 5. The expertise gap is the real barrier to chaos engineering adoption, not tooling
The framework's primary value proposition is not automation -- it is democratization. By using AI to analyze architecture and generate targeted experiments, the framework removes the need for specialized chaos engineering skills that most organizations cannot hire. The tooling (FIS, Resilience Hub) has existed for years; the bottleneck has always been the human expertise to use it effectively. AI fills that gap, making resilience testing accessible to teams without dedicated SRE resources.

## Key info

- Five layers: Discovery, Test Generation, Experimentation, Gap Analysis, Continuous Validation.
- Discovery completes in 2-4 hours for single-account environments with thousands of resources. Subsequent runs process only changes tracked by AWS Config.
- AgentCore Runtime provides dedicated MicroVM session isolation, supports long-running discovery sessions up to 8 hours.
- The framework supports multi-account enterprise deployment with tiered resilience policies (mission-critical, business-critical, non-critical).
- Organizations with mature response capabilities reduce MTTR by approximately 50% and achieve cost savings of up to 58% per event.

## Action recommendations

1. Start with a pilot: pick a non-critical application, deploy the discovery agent, and run a baseline resilience assessment. This takes 1-2 weeks with 2-3 engineers.
2. Implement the two-tiered CI/CD approach: lightweight policy-as-code checks on every commit, full resilience assessments as pre-production gates for architectural changes.
3. Configure progressive scope expansion for all experiments: start at 1%, set CloudWatch alarm stop conditions below SLA limits.
4. Use the gap analysis layer to prioritize remediation by business impact, not just technical severity.

## Anti-patterns

- **Running chaos experiments without progressive scope expansion.** Starting at full scope risks causing actual outages.

- **Treating resilience as a one-time assessment.** The value comes from continuous validation as the system evolves.

- **Implementing the framework without the feedback loop.** Without feeding experiment results back into discovery and test generation, the framework stagnates.

- **Skipping the pilot phase.** Even with AI assistance, chaos engineering requires building organizational confidence incrementally.

- **Implementing the framework without a rollback mechanism for experiments.** Every experiment should have a clear, automated rollback path before it starts. The progressive scope expansion is a safety net, but it is not a substitute for the ability to instantly revert the experiment's effects if something goes wrong.

## Related

- ai-engineer/methodology/modernizing-financial-analytics-with-amazon-sagemaker-unifie-ddaaf2.md
- ai-engineer/methodology/preventing-data-exfiltration-in-machine-learning-environment-936f06.md