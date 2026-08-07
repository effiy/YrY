---
title: Three more static code analysis sensors for coding agents
tags: [static-analysis, coding-agents, modularity, dependency-rules, coupling, sensors, AI-assisted-development]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/sensors-for-coding-agents.html#StaticCodeAnalysisDependencyRules
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, ai-engineer]
benefit: "Understand which types of sensors (computational vs. inferential) work best for enforcing modularity when coding agents generate code, and why prompting beats computation for coupling analysis."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/engineering/the-test-suite-as-a-regression-sensor-c7b81f
---

# Three more static code analysis sensors for coding agents

> **As a** tech lead using coding agents, **I want to** deploy effective sensors that enforce modularity in agent-generated code, **so that** the codebase does not degrade into a tightly coupled monolith over time.

## Summary

- Birgitta Bockeler explores three additional static analysis sensors for coding agents, focusing on enforcing and checking modularity.
- Computational sensors for dependency rules were effective at enforcing explicit rules but limited in scope -- rules had to be defined upfront and were rigid.
- A computational sensor built for coupling data (measuring afferent/efferent coupling) proved lackluster. The numeric scores were hard to interpret and act on.
- An inferential sensor (prompting an LLM to review modularity) was more effective. It provided nuanced, contextual feedback that computational metrics could not capture.
- The key insight: for fuzzy, context-dependent qualities like "good modularity," prompting-based inferential sensors outperform computational ones.

## Core viewpoints

### 1. Computational sensors are good for rules, poor for judgment

Dependency rule checks (e.g., "package X must not import from package Y") are well-suited to computational sensors. They are deterministic, fast, and produce clear violations. But they cannot assess whether a module boundary is drawn in the right place.

### 2. Inferential sensors (LLM prompts) are better for qualitative assessments

Modularity is a qualitative property. Two codebases can have identical dependency metrics but vastly different modularity quality. Prompting an LLM to review the codebase produces contextual feedback that metrics alone cannot. The trade-off is non-determinism and cost.

### 3. The sensor portfolio should match the problem type

Use computational sensors for deterministic, rule-based checks (dependency rules, linting, type checking). Use inferential sensors for qualitative, context-dependent assessments (modularity, naming, design coherence). Neither type alone is sufficient.

### 4. Coupling metrics are diagnostic, not prescriptive

Numerical coupling scores (afferent/efferent coupling) can identify that something is wrong but cannot tell you what to do about it. This is the fundamental limitation of computational sensors for qualitative properties: they measure symptoms, not causes. The LLM-based inferential sensor bridges this gap by providing specific, contextual recommendations that a number alone cannot.

### 5. The sensor portfolio must evolve with the codebase

As the codebase grows, the set of dependency rules that matter changes. A rule that was critical at 10K lines may be irrelevant at 100K lines, and new coupling patterns emerge that were not present before. Treat the sensor configuration as a living artifact that is reviewed and updated alongside the codebase. A sensor portfolio that was well-tuned for a monolith may be actively harmful for a microservices architecture and vice versa.

## Key info

- Three sensors evaluated: dependency rule enforcement (computational), coupling data measurement (computational), modularity review via LLM prompt (inferential).
- Dependency rules: good at enforcement, limited by rule rigidity.
- Coupling data: numeric scores (afferent/efferent coupling) were hard to interpret and act on.
- Modularity review: LLM prompt was more effective, providing nuanced feedback.

## Action recommendations

1. **Deploy computational dependency rule checks (e.g., ArchUnit, dependency-cruiser) for deterministic module boundary enforcement in CI.** Rules like "package X must not import from package Y" are fast, deterministic, and produce clear violations. Every dependency rule must block the build on violation, or it will accumulate violations until it becomes meaningless.

2. **Supplement computational checks with periodic LLM-based modularity reviews for qualitative feedback on design coherence.** Modularity is a qualitative property. Two codebases can have identical dependency metrics but vastly different modularity quality. An LLM-based inferential sensor provides contextual feedback that metrics alone cannot -- specific recommendations about where boundaries are drawn, not just whether rules are violated.

3. **Use coupling metrics (afferent/efferent coupling) as diagnostic indicators, not prescriptive rules.** Numerical coupling scores can identify that something is wrong but cannot tell you what to do about it. When a coupling score spikes, trigger an LLM-based review to diagnose the root cause and recommend specific refactoring actions, rather than treating the number itself as actionable.

4. **Build a sensor portfolio that matches the problem type: computational for deterministic rules, inferential for qualitative judgment, and test suite for regression detection.** Neither type alone is sufficient. Computational sensors cannot assess whether a module boundary is drawn in the right place. Inferential sensors are non-deterministic and cannot guarantee rule compliance. The portfolio covers all three dimensions.

5. **Treat the sensor configuration as a living artifact reviewed and updated alongside the codebase.** A rule that was critical at 10K lines may be irrelevant at 100K lines, and new coupling patterns emerge that were not present before. A sensor portfolio tuned for a monolith may be actively harmful for a microservices architecture. Review the sensor configuration during architecture review cycles.

## Anti-patterns

- **Relying solely on dependency metrics.** Do not rely solely on dependency metrics. Low coupling scores can mask poor modularity.

- **Using inferential sensors for deterministic checks.** Do not use inferential sensors for deterministic checks. Use computational sensors for rules that must never be violated.

- **Treating sensor output as ground truth.** Do not treat sensor output as ground truth. All sensors have false positives and false negatives.

- **Using computational sensors for fuzzy properties like "good naming" or "c....** Do not use computational sensors for fuzzy properties like "good naming" or "clean architecture." These require context and judgment that only inferential sensors can provide. Using computational sensors for these creates false confidence in metrics that do not capture what matters.

- **Configuring dependency rules that are not enforced in CI.** Do not configure dependency rules that are not enforced in CI. Rules that run only on a developer's machine are not rules; they are suggestions that will be ignored. Every dependency rule must block the build on violation, or it will accumulate violations until it becomes meaningless.

## Related

- engineer/engineering/the-test-suite-as-a-regression-sensor-c7b81f