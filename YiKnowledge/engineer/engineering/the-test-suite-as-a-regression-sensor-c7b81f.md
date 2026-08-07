---
title: The test suite as a regression sensor
tags: [testing, coding-agents, mutation-testing, regression, sensors, quality, AI-assisted-development]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/sensors-for-coding-agents.html#TheTestSuiteAsARegressionSensor
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, ai-engineer]
benefit: "Understand why mutation testing is the key sensor for evaluating whether a test suite can actually catch defects introduced by coding agents."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/infrastructure/three-more-static-code-analysis-sensors-c2bb94
---

# The test suite as a regression sensor

> **As a** tech lead using coding agents, **I want to** know whether my test suite can actually detect defects introduced by agent-generated code, **so that** I can trust the agent's output without manual review of every change.

## Summary

- Birgitta Bockeler concludes her series on sensors for coding agents by examining the test suite as a regression sensor, with a focus on mutation testing.
- A test suite's value as a sensor depends not on its coverage percentage but on its ability to detect injected defects. Mutation testing measures this directly by introducing small faults (mutations) and checking whether tests fail.
- Coverage is a weak proxy for test quality. High coverage with weak assertions gives false confidence. Mutation testing reveals the gap between "covered" and "actually tested."
- For coding agents, the test suite is the primary regression sensor. If the agent introduces a defect and the tests pass, the sensor has failed.
- Mutation testing provides a quantitative measure of the test suite's defect-detection capability (the "mutation score").

## Core viewpoints

### 1. Coverage is not test quality

A line can be "covered" by a test that makes no assertions about its behavior. Mutation testing reveals this: if you change the code (e.g., flip a condition, change a return value) and no test fails, the test suite is not actually testing that code.

### 2. Mutation testing is a sensor calibration tool

Before trusting a test suite to catch defects from coding agents, run mutation testing to calibrate it. The mutation score tells you how many injected defects the suite catches. A low score means the suite is a weak sensor, regardless of coverage percentage.

### 3. Coding agents amplify the need for strong regression sensors

When humans write code, they have contextual understanding that helps them avoid certain classes of defects. Coding agents lack this understanding. The test suite is the primary defense against agent-introduced defects. If the sensor is weak, the agent's output cannot be trusted.

### 4. Mutation testing reveals the difference between "covered" and "tested"

A line of code is covered if it executes during a test run. It is tested only if a change to that line causes a test to fail. Mutation testing bridges this gap by injecting changes and measuring failures. A codebase with 90% coverage and 40% mutation score has 90% of lines executing but only 40% of lines actually tested. The gap is where bugs hide.

### 5. The test suite's role changes when coding agents become the primary code producers

When humans write code, the test suite is a verification tool. When coding agents write code, the test suite is the primary quality gate. The human reviewer can no longer rely on the author's intent (the agent has no intent) and must rely on the tests to catch defects. This shifts the test suite from a safety net to the front line of defense.

## Key info

- Mutation testing injects small faults (flip conditions, change operators, modify return values) and checks if tests fail.
- Mutation score = percentage of mutations killed by tests. A higher score means a stronger regression sensor.
- Coverage is a weak proxy for test quality. Mutation testing reveals the gap.
- For coding agents, the test suite is the primary regression sensor.

## Action recommendations

1. Run mutation testing on your existing test suite to calibrate it as a regression sensor. Aim for a high mutation score (>80%).
2. Add mutation testing to your CI pipeline as a quality gate for agent-generated code.
3. Use mutation testing results to identify weakly tested code and strengthen assertions.
4. Treat the test suite as a sensor, not just a verification tool. Regularly calibrate it.

## Anti-patterns

- **Do not rely on code coverage as a measure of test quality. Coverage is a weak proxy.**

- **Do not trust a test suite that has not been calibrated with mutation testing to catch agent-introduced defects.**

- **Do not add tests just to increase coverage. Add tests that kill mutations.**

- **Running mutation testing only once and assuming the score is stable.** The mutation score degrades as code changes. New code paths, refactored logic, and changed assertions all affect the score. A mutation score of 80% measured six months ago may be 50% today. Mutation testing must be part of the CI pipeline, not a one-time audit.

- **Treating mutation testing as a replacement for other testing practices.** Mutation testing measures test quality, but it does not replace integration testing, end-to-end testing, or manual exploratory testing. A high mutation score means the unit tests are strong -- it does not mean the system works correctly. Mutation testing is one sensor in a multi-sensor suite, not the only sensor.

## Related

- engineer/infrastructure/three-more-static-code-analysis-sensors-c2bb94