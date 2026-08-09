---
title: code quality dashboard
aliases:
- code quality health dashboard
- static analysis dashboard
- code health dashboard
- technical excellence dashboard
- SonarQube dashboard
tags:
- dashboard
- code-quality
- static-analysis
- complexity
- duplication
- technical-debt
- code-review
- sonarqube
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- engineer
- tech-lead
- security-engineer
benefit: code quality, maintainability, and technical excellence visible at a glance across all repositories
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- complexity, duplication, coverage, security hotspots, code smells, and reliability rating defined
related:
- ./dashboard-quality-metrics.md
- ./dashboard-test-automation.md
- ./dashboard-code-review-health.md
- ../infrastructure/dashboard-cicd-pipeline-health.md
- ../../tech-lead/risk/dashboard-technical-debt.md
tacit: false
---

# code quality dashboard

> **As an** engineer, **I want to** track code quality across all repositories, **so that** every codebase is maintainable, complexity is managed, duplication is eliminated, security hotspots are resolved, and code quality is a measurable, continuously improving practice — not a subjective "clean code" debate.

> Code quality is the foundation of sustainable delivery. This dashboard tracks complexity, duplication, test coverage, security hotspots, code smells, and reliability rating — turning code quality from subjective opinions in code review into an objective, measured, and continuously improving engineering discipline.

## Summary

- 6 code quality dimensions: complexity, duplication, coverage, security hotspots, code smells, reliability rating
- 42 repositories across 8 languages (TypeScript 18, Python 10, Go 6, Java 4, Rust 2, Kotlin 1, Swift 1); 2.8M lines of code; 285 active contributors
- Complexity: avg cyclomatic complexity 8.5 (target < 10); 285 methods with complexity > 20; 45 "brain methods" (complexity > 50); 12% of code in high-complexity files
- Duplication: 8.5% duplicated lines (target < 5%); 238K duplicated lines; 185 duplication blocks > 20 lines; worst repo at 22% duplication
- Coverage: 72% line coverage (target 80%); 58% branch coverage; 12 repos below 60% coverage; 8 repos with no coverage measurement
- Dashboard reviewed weekly; code quality sprint monthly with engineering leads

## Core viewpoints

- Complexity is a tax on every future change — a method with cyclomatic complexity 50 takes 10× longer to understand, test, and modify than a method with complexity 5; complexity is not a style issue, it's a velocity issue
- Duplication is not just DRY dogma — every duplicated block of code is a place where the same bug needs to be fixed twice; a 20-line block duplicated 5 times means 5 potential inconsistencies when requirements change
- Coverage is a floor, not a ceiling — 80% line coverage means 20% of your code has never been executed by tests; the question is not "is 80% enough?" but "which 20% is untested, and what happens when it fails?"
- Code smells are early warnings of future incidents — a "god class" today is a production outage next quarter when someone needs to change it under pressure; code smells are the leading indicators, incidents are the lagging indicators

## Key information

### 6-panel code quality overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPLEXITY                          │  DUPLICATION                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg complexity: 8.5     │   │  │  Duplicated lines: 8.5%  │   │
│  │  Complexity > 20: 285    │   │  │  Duplicated blocks: 185   │   │
│  │  Brain methods (>50): 45 │   │  │  Lines duplicated: 238K  │   │
│  │  High-complexity files:  │   │  │  > 20 lines: 185 blocks  │   │
│  │  12% of codebase         │   │  │  Worst repo: 22%         │   │
│  │  Cognitive complexity:   │   │  │  Duplication trend: +0.5%│   │
│  │  15.2 avg (target < 15)  │   │  │  Duplication score: C(68)│   │
│  │  Complexity score: B(78) │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TEST COVERAGE                       │  SECURITY HOTSPOTS                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Line coverage: 72%      │   │  │  Hotspots total: 145     │   │
│  │  Branch coverage: 58%    │   │  │  Critical: 12 (8.3%)    │   │
│  │  Function coverage: 78%  │   │  │  High: 38 (26.2%)       │   │
│  │  Repos < 60%: 12         │   │  │  Medium: 52 (35.9%)     │   │
│  │  Uncovered repos: 8      │   │  │  Low: 43 (29.7%)        │   │
│  │  Coverage trend: +1.2%/mo│   │  │  Hotspots resolved: 28/mo│   │
│  │  Coverage score: B- (72) │   │  │  Hotspot score: B- (72)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CODE SMELLS                         │  RELIABILITY RATING                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total smells: 3,850     │   │  │  A rating: 22 repos     │   │
│  │  Blocker: 85 (2.2%)      │   │  │  B rating: 10 repos     │   │
│  │  Critical: 420 (10.9%)   │   │  │  C rating: 6 repos      │   │
│  │  Major: 1,850 (48.1%)    │   │  │  D rating: 3 repos      │   │
│  │  Minor: 1,250 (32.5%)    │   │  │  E rating: 1 repo       │   │
│  │  Info: 245 (6.4%)        │   │  │  Open bugs: 285 critical│   │
│  │  Smell score: B- (72)    │   │  │  Reliability: B (78)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Code quality by repository

| Repository | Language | LOC | Complexity | Duplication | Coverage | Smells | Rating | Quality gate |
|---|---|---|---|---|---|---|---|---|
| **YiVad Core** | TypeScript | 185K | 7.8 | 6.5% | 76% | 520 | B | Passed |
| **YiAi Agents** | Python | 145K | 9.2 | 8.0% | 68% | 480 | B | Passed |
| **YiWeb** | TypeScript | 210K | 8.5 | 7.5% | 72% | 620 | B | Passed |
| **YiPet** | TypeScript | 95K | 6.5 | 4.0% | 82% | 185 | A | Passed |
| **API Gateway** | Go | 45K | 5.2 | 3.5% | 85% | 85 | A | Passed |
| **Auth Service** | Go | 38K | 4.8 | 2.8% | 88% | 52 | A | Passed |
| **Payment Service** | Java | 52K | 11.5 | 12.0% | 65% | 285 | C | **Failed** |
| **Database Proxy** | Rust | 28K | 6.2 | 4.5% | 78% | 42 | A | Passed |
| **Notification Service** | Python | 35K | 10.8 | 15.0% | 55% | 198 | **D** | **Failed** |
| **Search Service** | Go | 32K | 7.5 | 6.0% | 72% | 95 | B | Passed |
| **Data Pipeline** | Python | 85K | 12.2 | 18.0% | 42% | 385 | **D** | **Failed** |
| **ML Training** | Python | 65K | 9.8 | 11.0% | 38% | 242 | **D** | **Failed** |
| **CDN Config** | TypeScript | 8K | 3.5 | 2.0% | 90% | 12 | A | Passed |
| **Infrastructure as Code** | TypeScript | 28K | 5.5 | 4.0% | 75% | 58 | A | Passed |
| **Mobile App** | Kotlin/Swift | 120K | 8.0 | 7.0% | 68% | 365 | B | Passed |
| **Other (27 repos)** | Various | 1.2M | 8.2 | 8.5% | 68% | 1,240 | B | 18 passed, 9 failed |

### Top complexity hotspots

| File | Repository | Method | Cyclomatic | Cognitive | Lines | Risk | Suggested fix |
|---|---|---|---|---|---|---|---|
| **payment_processor.py** | Payment Service | `process_payment()` | 85 | 92 | 420 | Critical | Split into validation, processing, notification |
| **data_transformer.py** | Data Pipeline | `transform_batch()` | 72 | 78 | 380 | Critical | Extract transformation steps into pipeline stages |
| **notification_dispatcher.py** | Notification | `dispatch()` | 68 | 75 | 350 | Critical | Strategy pattern per channel, separate formatters |
| **agent_orchestrator.ts** | YiAi Agents | `execute_agent_loop()` | 65 | 70 | 520 | Critical | State machine pattern, extract tool execution |
| **search_query_builder.ts** | YiWeb | `build_advanced_query()` | 58 | 62 | 280 | High | Builder pattern, separate filter construction |
| **report_generator.py** | Data Pipeline | `generate_report()` | 55 | 60 | 310 | High | Template method pattern, extract sections |
| **user_profile_manager.ts** | YiVad Core | `update_profile()` | 52 | 55 | 290 | High | Extract validators, separate persistence logic |
| **checkout_handler.java** | Payment Service | `handle_checkout()` | 50 | 52 | 260 | High | Split into pre-checkout, processing, post-checkout |

### Duplication by repository

| Repository | Duplicated lines | Duplication % | Blocks > 20 lines | Trend | Root cause | Action |
|---|---|---|---|---|---|---|
| **Data Pipeline** | 15.3K | 18.0% | 42 | Increasing | Copy-paste ETL patterns across pipeline stages | Extract shared ETL base classes |
| **Notification Service** | 5.3K | 15.0% | 18 | Stable | Duplicated channel adapters (email/push/SMS) | Abstract channel adapter interface |
| **Payment Service** | 6.2K | 12.0% | 15 | Increasing | Duplicated validation logic across payment methods | Extract payment method validator |
| **ML Training** | 7.2K | 11.0% | 12 | Stable | Copied preprocessing for different models | Shared preprocessing pipeline |
| **YiVad Core** | 12.0K | 6.5% | 22 | Stable | Duplicated CRUD components across modules | Shared component library |
| **YiWeb** | 15.8K | 7.5% | 28 | Decreasing | Duplicated form handling, API client patterns | Extracted shared hooks, API client |

### Security hotspot inventory

| Hotspot | Repository | Severity | Category | Age (days) | Review status | Assignee |
|---|---|---|---|---|---|---|
| **SQL injection in dynamic query** | Payment Service | Critical | Injection | 45 | Under review | security-team |
| **Hardcoded API key in config** | Data Pipeline | Critical | Credentials | 12 | To fix | data-team |
| **Unvalidated redirect in auth flow** | YiWeb | Critical | Open Redirect | 28 | To fix | web-team |
| **XSS in user-generated content** | YiVad Core | Critical | XSS | 8 | To fix | yivad-team |
| **Insecure deserialization** | ML Training | Critical | Deserialization | 35 | To fix | ml-team |
| **Command injection in file processor** | Notification | Critical | Injection | 18 | Under review | notif-team |
| **Missing CSRF token in state change** | YiWeb | High | CSRF | 22 | To fix | web-team |
| **Weak crypto algorithm (MD5)** | Auth Service | High | Cryptography | 55 | Under review | auth-team |
| **Log injection via user input** | API Gateway | High | Injection | 15 | To fix | gateway-team |
| **Path traversal in file download** | YiVad Core | High | Path Traversal | 10 | Under review | yivad-team |

### Code smell distribution by type

| Smell type | Count | % of total | Blocker | Critical | Major | Most common in | Impact |
|---|---|---|---|---|---|---|---|
| **Long method** (> 50 lines) | 850 | 22.1% | 12 | 85 | 753 | Java, Python | Understandability, testability |
| **God class** (> 500 lines, > 20 methods) | 185 | 4.8% | 28 | 52 | 105 | Java, TypeScript | Coupling, single responsibility |
| **Long parameter list** (> 5 params) | 520 | 13.5% | 0 | 18 | 502 | TypeScript, Python | API usability, error-prone |
| **Switch/if-else chains** (> 5 branches) | 380 | 9.9% | 5 | 35 | 340 | All languages | Extensibility, OCP violation |
| **Feature envy** (excessive external calls) | 280 | 7.3% | 0 | 22 | 258 | Java, TypeScript | Coupling, encapsulation |
| **Data clumps** (repeated param groups) | 195 | 5.1% | 0 | 8 | 187 | TypeScript, Python | Missing abstraction |
| **Comments** (too many, dead code) | 420 | 10.9% | 0 | 15 | 405 | All languages | Dead code, misleading docs |
| **Exception handling** (empty catch, generic) | 310 | 8.1% | 15 | 85 | 210 | Java, Python | Silent failures, debugging |
| **Mutable static/global state** | 145 | 3.8% | 8 | 42 | 95 | Python, TypeScript | Testability, thread safety |
| **Other** (20+ types) | 565 | 14.7% | 17 | 58 | 490 | Various | Various |

### Reliability rating by repository

| Rating | Repos | Criteria | Bugs open (critical) | Bugs open (major) | MTTR (bugs) | Action |
|---|---|---|---|---|---|---|
| **A** (0 bugs, 0 smells) | 22 | Zero critical/major bugs, < 30 min fix time | 0 avg | 2 avg | 2 days | Maintain |
| **B** (minor issues) | 10 | < 5 critical bugs, < 20 major bugs | 3 avg | 12 avg | 5 days | Monitor, fix during sprints |
| **C** (moderate issues) | 6 | < 10 critical bugs, < 50 major bugs | 8 avg | 35 avg | 12 days | Dedicated bug-fix sprint |
| **D** (serious issues) | 3 | > 10 critical OR > 50 major bugs | 18 avg | 72 avg | 22 days | Stop features, reliability sprint |
| **E** (critical issues) | 1 | > 20 critical bugs, production incidents | 28 | 105 | 35 days | Code freeze, remediation plan |

### Code quality trend (6 months)

| Month | Complexity avg | Duplication % | Coverage % | Smells total | Hotspots open | Quality gate pass |
|---|---|---|---|---|---|---|
| **2026-03** | 9.2 | 9.5% | 68% | 4,250 | 185 | 28/42 (67%) |
| **2026-04** | 9.0 | 9.2% | 69% | 4,180 | 172 | 29/42 (69%) |
| **2026-05** | 8.8 | 9.0% | 70% | 4,050 | 168 | 30/42 (71%) |
| **2026-06** | 8.7 | 8.8% | 71% | 3,950 | 155 | 32/42 (76%) |
| **2026-07** | 8.6 | 8.7% | 71.5% | 3,900 | 150 | 33/42 (79%) |
| **2026-08** | 8.5 | 8.5% | 72% | 3,850 | 145 | 33/42 (79%) |

## Action recommendations

1. **Payment Service quality gate failure**: complexity 11.5, duplication 12%, 65% coverage; refactor `process_payment()` (complexity 85), extract payment method validators, add integration tests, target B rating
2. **Data Pipeline remediation**: duplication 18%, coverage 42%, D rating; extract shared ETL base classes, add data transformation tests, target 70% coverage and < 10% duplication
3. **Notification Service refactor**: duplication 15%, D rating, critical command injection hotspot; extract channel adapter interface, fix command injection, add channel-specific tests
4. **Brain method elimination**: 45 methods with complexity > 50; refactor top 10 brain methods (account for 35% of complexity violations), set complexity gate at 20 for new code
5. **Security hotspot SLA**: 12 critical hotspots, avg age 28 days; enforce 14-day SLA for critical, 30-day for high, 60-day for medium; escalate overdue hotspots to security lead
6. **Coverage gap closure**: 8 repos with no coverage, 12 repos < 60%; add coverage measurement to all repos, set minimum 60% coverage gate for CI, target 80% for critical-path repos
7. **Duplication trend reversal**: 8.5% duplication, +0.5%/month trend; add duplication gate to CI (fail on > 5% new duplication), schedule monthly dedup sprints for worst repos
8. **Code smell reduction**: 3,850 smells, 85 blockers; fix all 85 blockers within 30 days, reduce critical smells by 50% in 90 days, add smell count to engineering metrics review
9. **Quality gate enforcement**: 9 repos failing quality gate; enforce quality gate in CI (block merge on gate failure), add override process with tech lead approval for exceptions
10. **Weekly code quality review**: review complexity, duplication, coverage, security hotspots, smells, and reliability ratings with engineering leads; track quality gate pass rate as engineering KPI



- The coverage theater → writing tests that execute code but make no assertions; 80% coverage with no assertions is worse than 40% coverage with meaningful assertions — coverage measures execution, not verification
- The "refactor later" trap → deferring complexity reduction with the promise of future refactoring; complexity compounds — a 50-line method that's "too complex" today becomes a 200-line method that's "too risky to touch" next quarter
- The quality gate as a checkbox → configuring quality gates but allowing anyone to override them; a quality gate with 100% override rate is not a gate — it's a suggestion; overrides should require justification and be tracked
- Generic exception swallowing → catching `Exception` or `Throwable` and logging without re-throwing or handling; a swallowed exception is a ticking time bomb — the system continues in an undefined state until it fails catastrophically
- Copy-paste as "temporary" reuse → copying code with the comment "// TODO: extract to shared module"; the code gets copied 5 more times before the refactor happens, and by then the copies have diverged into incompatible versions

## Related

- Same class: [dashboard-quality-metrics](dashboard-quality-metrics.md) — quality metrics
- Same class: [dashboard-test-automation](dashboard-test-automation.md) — test automation
- Same class: [dashboard-code-review-health](../process/dashboard-code-review-health.md) — code review health
- Same class: [dashboard-cicd-pipeline-health](../infrastructure/dashboard-cicd-pipeline-health.md) — CI/CD pipeline health
- Same class: [dashboard-technical-debt](../../tech-lead/risk/dashboard-technical-debt.md) — technical debt
- References: SonarSource — *SonarQube Quality Metrics*; Martin Fowler — *Refactoring*; Robert C. Martin — *Clean Code*; McCabe — *Cyclomatic Complexity Metric*; Google — *Code Health Best Practices*; Nicole Forsgren — *Accelerate and Code Quality*