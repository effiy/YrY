"""One-shot seed script: populate 1 representative entry per tech-leadership topic.

For each topic in TL_TOPICS, writes a metadata doc in Mongo collection
``tech_<topic>`` with a realistic markdown body and structured meta fields.

Idempotent: if a collection already has >= 1 doc, that topic is skipped.

Run from YiAi/:
    python scripts/seed_tl_topics.py
"""
from __future__ import annotations

import asyncio
import sys
import time
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from data.database import db  # type: ignore


def _key(topic: str) -> str:
    stamp = int(time.time() * 1000)
    rand = random.randint(10_000, 99_999)
    return f"tl_{topic}_{stamp}{rand}"


def _now() -> int:
    return int(time.time() * 1000)


# (topic, title, meta, content_md)
TOPICS: list[tuple[str, str, dict, str]] = [
    (
        "adr-review",
        "ADR-001: Use Rsbuild over Vite for YiVad",
        {"adr_number": "ADR-001", "status": "accepted", "decider": "FE Lead + Arch Group", "decision_date": "2026-07-15", "project": "yivad"},
        """# ADR: Use Rsbuild over Vite for YiVad

## Context
YiVad was on Vite 8 but needed faster cold starts, better HMR, and native Rspack compatibility. Vite's plugin ecosystem was solid but the team wanted to standardise on a Rust-based toolchain for consistency with the broader Yi family.

## Decision
Migrate YiVad from Vite 8 to Rsbuild 1. Rsbuild's Rspack-based bundler provides faster builds, built-in CSS modules, and a simpler config surface. The `svg-sprite` and `views-glob` plugins replicate the dropped Vite features.

## Options Considered
| Option | Pros | Cons |
|--------|------|------|
| Rsbuild 1 | Fast Rust bundler, simpler config, built-in CSS | Smaller plugin ecosystem |
| Vite 8 | Mature ecosystem, team familiarity | Slower cold starts |
| Webpack 5 | Industry standard | Complex config, slow builds |

## Consequences
- **Positive:** 40% faster cold starts, simpler config, better tree-shaking
- **Negative:** Lost some Vite-specific plugins; had to write custom `svg-sprite` + `views-glob` plugins

## Risk & Rollback
- **Risk:** Rsbuild plugin ecosystem less mature than Vite's
- **Rollback plan:** Keep Vite config as fallback for 2 sprints; revert if critical plugin missing

## Review Schedule
- **Next review:** 2026-10-15
"""
    ),
    (
        "tech-selection",
        "Frontend Build Tool Evaluation",
        {"capability": "Frontend Build Tool", "status": "decided", "evaluator": "FE Lead", "candidates": "Rsbuild, Vite, Webpack, Turbopack", "conclusion": "Rsbuild for YiVad/YiPet, Vite for smaller experiments", "project": "yivad"},
        """# Tech Selection: Frontend Build Tool

## Context
The Yi family needed a unified frontend build tool. YiVad was on Vite, YiPet was on a custom setup. Goal: standardise on one tool that works for SPA (YiVad) and Chrome extension (YiPet).

## Non-Negotiable Constraints
- Must support TypeScript 6 and Vue 3 SFC
- Must work for Chrome MV3 extension builds
- Hot reload / HMR in dev
- Tree-shaking for production

## Evaluation Matrix (1-5 score, weighted)
| Dimension | Weight | Rsbuild | Vite | Webpack |
|-----------|--------|---------|------|---------|
| Performance | 30% | 5 | 4 | 3 |
| Ecosystem | 25% | 4 | 5 | 5 |
| Config Simplicity | 20% | 5 | 3 | 2 |
| Chrome Ext Support | 15% | 4 | 3 | 4 |
| Risk | 10% | 3 | 4 | 5 |
| **Weighted Total** | | **4.35** | 4.0 | 3.4 |

## Decision
- **Selected:** Rsbuild 1
- **Fallback:** Vite 8
- **Rationale:** Best performance/simplicity ratio; Rust-based aligns with Yi family direction

## Review Trigger
Re-evaluate when Turbopack reaches stable for non-Next.js projects.
"""
    ),
    (
        "tech-debt",
        "YiAi Missing Test Coverage",
        {"domain": "test", "severity": "high", "interest_rate": "3", "repayment_cost": "12", "project": "yiai"},
        """# Tech Debt: YiAi Missing Test Coverage

## Debt Item
YiAi has zero automated tests. All verification is manual. This was a deliberate choice during rapid prototyping but now slows down refactoring and makes regression detection impossible.

## Classification
- **Type:** Deliberate
- **Domain:** Test
- **Severity:** High — blocks confident refactoring

## Impact
- **Interest rate:** ~3 person-days/month lost to manual regression testing
- **Affected modules:** All domain packages, all service modules
- **Downstream effects:** Slows onboarding, increases bug escape rate, discourages refactoring

## Repayment Plan
- **Estimated cost:** 12 person-days
- **Approach:** Incremental — add pytest + httpx for integration tests starting with the most critical endpoints
- **Target quarter:** 2026 Q3
- **Dependencies:** None

## Verification
- Test coverage > 60% on services/ and domain/
- CI pipeline runs tests on every PR
"""
    ),
    (
        "risk-register",
        "Ollama GPU Exhaustion Under Peak Load",
        {"probability": "medium", "impact": "major", "category": "Infrastructure", "mitigation": "Request queue with max concurrency limit; monitor GPU utilisation", "contingency": "Fall back to CPU-only mode with degraded latency", "owner": "Backend Lead", "status": "open", "project": "yiai"},
        """# Risk: Ollama GPU Exhaustion Under Peak Load

## Risk Description
Ollama runs on a single GPU node. If multiple concurrent chat/stream requests exceed GPU memory, requests queue up or fail.

## Assessment
- **Probability:** Medium — 3+ concurrent users during peak hours
- **Impact:** Major — degraded chat latency or request failures
- **Category:** Infrastructure
- **Exposure:** Medium × Major = High priority

## Mitigation
Request queue with max concurrency of 2 streams per GPU. Monitor GPU utilisation with Prometheus.

## Contingency
Fall back to CPU-only mode (qwen3:latest runs on CPU at ~5 tokens/s vs ~50 tokens/s GPU).

## Tracking
- **Owner:** Backend Lead
- **Next review:** 2026-09-01
- **Trigger signal:** GPU utilisation > 90% for 5+ minutes

## Status
Open
"""
    ),
    (
        "postmortem",
        "YiAi Chat SSE Hanging on Ollama Restart",
        {"incident_date": "2026-07-28", "severity": "p2", "duration_minutes": 45, "detection_method": "User report", "project": "yiai"},
        """# Postmortem: YiAi Chat SSE Hanging on Ollama Restart

## Incident Summary
- **Date:** 2026-07-28
- **Severity:** P2
- **Duration:** 45 minutes
- **Impact:** 2 users unable to chat; no data loss
- **Detection:** User reported "chat loading forever"

## Timeline (UTC)
| Time | Event |
|------|-------|
| 14:30 | Ollama restarted for model update |
| 14:32 | First user reported chat hanging |
| 14:45 | Dev identified hanging SSE connection |
| 15:05 | Restarted YiAi, confirmed fix |
| 15:15 | Service restored |

## Root Cause Chain (5-Why)
1. **Why** did chat hang? → SSE stream never closed after Ollama disconnect
2. **Why** didn't it close? → `queue.get()` had no timeout
3. **Why** no timeout? → Only `complete()` had timeout; `stream_chat()` was missed
4. **Why** was it missed? → Streaming timeout not part of the original design
5. **Why** not in design? → **[ROOT CAUSE]** Timeout was an afterthought, not a first-class concern

## Action Items
| # | Action | Owner | Due | Priority |
|---|--------|-------|-----|----------|
| 1 | Add `asyncio.wait_for` timeout to `stream_chat` queue.get() | Backend | 2026-08-05 | P0 |
| 2 | Add `asyncio.wait_for` timeout to RAG `rag_chat_stream` | Backend | 2026-08-05 | P0 |
| 3 | Add health check for Ollama connection | Backend | 2026-08-10 | P1 |
"""
    ),
    (
        "oncall-handover",
        "2026-W31 Handover: Alice → Bob",
        {"shift_period": "2026-W31", "from_engineer": "Alice", "to_engineer": "Bob", "ongoing_incidents": 1, "pending_alerts": 2, "project": "yiai"},
        """# Oncall Handover: 2026-W31

## Shift Info
- **Period:** 2026-W31
- **From:** Alice
- **To:** Bob
- **Handover date:** 2026-08-04

## Ongoing Incidents
| # | Incident | Severity | Status | Next Step |
|---|----------|----------|--------|-----------|
| 1 | SSE hanging fix pending | P2 | Mitigated | Deploy timeout fix |

## Pending Alerts / Known Issues
- Ollama GPU memory alert threshold needs tuning
- MongoDB connection pool occasionally exhausted under load test

## Recent Changes (last 7 days)
- Added `asyncio.wait_for` timeout to `complete()` method
- RAG `rag_chat_stream` timeout fix in progress

## Monitoring Dashboard
- Grafana: YiAi API latency dashboard
- Ollama GPU utilisation trending up 15% week-over-week

## Escalation Contacts
- **Secondary oncall:** Charlie
- **Service owners:** Backend Lead — YiAi inference
- **Manager:** Engineering Manager
"""
    ),
    (
        "org-diagnose",
        "Frontend Squad — Delivery Dimension",
        {"team": "Frontend Squad", "dimension": "delivery", "maturity_level": "l3"},
        """# Org Diagnose: Frontend Squad — Delivery

## Assessment Context
- **Team:** Frontend Squad (YiVad + YiPet)
- **Dimension:** Delivery
- **Current maturity:** L3 — Defined / Standardised

## Observations
CI/CD pipelines defined for both YiVad and YiPet. PR-based workflow with lint-staged pre-commit hooks. Deploy is manual (no CD pipeline yet). Release cadence is weekly.

## Gap Analysis
| Capability | Current State | Desired State | Gap |
|------------|---------------|---------------|-----|
| CI Pipeline | L4 — automated lint + type-check | L4 — add automated tests | Medium |
| CD Pipeline | L1 — manual deploy | L3 — automated staging deploy | Large |
| Release Cadence | Weekly | On-demand | Medium |

## Improvement Recommendations
1. **Add Vitest to CI pipeline** — Catches regressions before merge; expected to reduce bug escape rate by 30%
2. **Automate staging deploy** — Reduces release friction; enables more frequent releases
"""
    ),
    (
        "dependency-audit",
        "npm Ecosystem Audit — YiVad",
        {"ecosystem": "npm", "audit_date": "2026-08-01", "total_deps": 342, "outdated": 12, "vulnerable": 0, "unmaintained": 2, "project": "yivad"},
        """# Dependency Audit: npm — 2026-08-01

## Audit Summary
- **Ecosystem:** npm / Node.js
- **Audit date:** 2026-08-01
- **Tool used:** npm audit + npx depcheck
- **Total dependencies:** 342 (direct + transitive)

## Findings

### Critical CVEs
None.

### Outdated (major version behind)
| Package | Current | Latest | Breaking changes | Migration effort |
|---------|---------|--------|------------------|------------------|
| element-plus | 2.14 | 2.15 | Minimal | 2h |
| vue-router | 5.0 | 5.1 | None | 1h |

### Unmaintained / Deprecated
| Package | Last release | Risk | Replacement |
|---------|-------------|------|-------------|
| svg-sprite-loader | 2022 | Medium | Custom Rsbuild plugin |
| node-sass | 2023 | Low | Already migrated to sass |

## Recommendations
1. **Update element-plus to 2.15** — Low effort, bug fixes
2. **Replace svg-sprite-loader** — Already done via Rsbuild migration
"""
    ),
    (
        "roadmap-review",
        "2026 Q3 — Yi Family Platform Unification",
        {"quarter": "2026 Q3", "initiative": "Yi Family Platform Unification", "priority": "p0", "status": "in_progress", "owner": "Engineering Manager", "project": "yry"},
        """# Roadmap Review: 2026 Q3

## Initiative
Yi Family Platform Unification — standardise build tooling, auth patterns, and cross-project RPC protocol across YiAi, YiVad, and YiPet.

## Investment Distribution (this quarter)
| Domain | Investment (person-months) | vs Last Q | Strategic Alignment (1-5) |
|--------|---------------------------|-----------|---------------------------|
| Platform | 3 | +1 | 5 |
| Middleware | 2 | 0 | 4 |
| Business | 4 | +2 | 5 |
| Infrastructure | 1 | -1 | 3 |

## Milestone Alignment
| Milestone | Target Date | Status | Blocker? |
|-----------|-------------|--------|----------|
| YiVad Rsbuild migration | 2026-07-28 | Delivered | No |
| YiPet Rsbuild migration | 2026-08-15 | In Progress | No |
| Cross-project auth unification | 2026-09-01 | Planned | Yes — design review needed |

## Decision
- **Keep:** Rsbuild migration, RPC protocol hardening
- **Adjust:** Auth unification scope — reduce to JWT-only for Q3
- **Drop:** Observability pipeline (defer to Q4)
"""
    ),
    (
        "capacity-plan",
        "YiAi Inference — 2026 Q3",
        {"planning_period": "2026 Q3", "system": "YiAi Inference", "resource_type": "gpu", "current_capacity": "1× RTX 4090 24GB", "projected_growth_pct": 50},
        """# Capacity Plan: YiAi Inference — 2026 Q3

## Baseline
- **System:** YiAi Ollama Inference
- **Resource:** GPU
- **Planning period:** 2026 Q3

## Current State
- **Current capacity:** 1× RTX 4090 24GB
- **Peak utilization:** 85%
- **Average utilization:** 45%
- **Bottleneck resource:** GPU VRAM (qwen3:14b uses ~10GB, leaving ~14GB for KV cache)

## Projected Demand
- **Growth driver:** RAG feature adoption + aiChat multi-user
- **Projected growth:** 50% over Q3
- **Required capacity:** 1× RTX 4090 × 1.5 × 1.5 safety = 2.25 GPUs → 2 GPUs
- **Headroom:** +1 GPU needed

## Scaling Triggers
| Metric | Threshold | Action |
|--------|-----------|--------|
| GPU > 85% | 5 min | Queue new requests |
| GPU > 95% | 5 min | Reject new requests, alert oncall |

## Recommendations
1. **Add second GPU by 2026-09-01** — Before RAG adoption peaks
2. **Evaluate model quantisation** — qwen3:14b → qwen3:7b-q4 for less critical use cases
"""
    ),
    (
        "capacity-cost",
        "Yi Family FinOps — 2026-07",
        {"report_period": "2026-07", "system": "YiAi + YiVad + YiPet", "monthly_cost": 3200, "budget_variance_pct": -8, "compute_pct": 55, "api_pct": 15, "storage_pct": 30},
        """# FinOps Report: Yi Family — 2026-07

## Overview
- **Period:** 2026-07
- **System / Service:** YiAi + YiVad + YiPet
- **Monthly cost:** ¥3,200
- **Budget:** ¥3,500
- **Variance:** -8% (under budget)

## Cost Breakdown
| Category | Cost (¥) | % of Total | vs Last Month |
|----------|----------|------------|---------------|
| GPU Inference | 1,200 | 37.5% | +10% |
| CPU / Memory | 560 | 17.5% | flat |
| Storage | 960 | 30% | +5% |
| Network | 160 | 5% | flat |
| 3rd-party API | 320 | 10% | -5% |
| **Total** | 3,200 | 100% | +3% |

## Unit Economics
- **Cost per chat request:** ¥0.08
- **Cost per RAG query:** ¥0.03
- **Cost per GB stored:** ¥0.12

## Optimization Opportunities
| # | Opportunity | Est. Monthly Saving | Effort | Priority |
|---|-------------|--------------------|--------|----------|
| 1 | Move cold storage to lifecycle tier | ¥200 | Low | High |
| 2 | Model quantisation for dev/test | ¥150 | Medium | Medium |
"""
    ),
    (
        "maturity-model",
        "CI/CD Pipeline — YiVad",
        {"practice_area": "ci-cd", "current_level": "l3", "target_level": "l4"},
        """# Maturity Assessment: CI/CD Pipeline

## Practice Area
CI/CD Pipeline — YiVad

## Current State
- **Current level:** L3 — Defined
- **Evidence:** Husky pre-commit hooks, ESLint + Prettier + Stylelint, commitlint, PR-based workflow

## Target State
- **Target level:** L4 — Measured
- **Rationale:** Need automated test coverage measurement and CD pipeline metrics

## Gap Analysis
| Capability | L1 | L2 | L3 | L4 | L5 | Current | Target | Gap |
|------------|----|----|----|----|----|---------|--------|-----|
| Lint/Format | ✓ | ✓ | ✓ | ✓ | ✓ | 3 | 4 | +1 |
| Automated Tests | — | — | — | ✓ | ✓ | 1 | 4 | +3 |
| CD Pipeline | — | — | — | ✓ | ✓ | 1 | 4 | +3 |

## Improvement Plan
| # | Action | From → To | Effort | Timeline | Owner |
|---|--------|-----------|--------|----------|-------|
| 1 | Add Vitest to CI | L1 → L4 | 3d | 2026-08 | FE Lead |
| 2 | Automated staging deploy | L1 → L3 | 2d | 2026-09 | DevOps |
"""
    ),
    (
        "dora-metrics",
        "Deployment Frequency — YiVad",
        {"metric_type": "deploy-freq", "current_value": "2/week", "target_value": "on-demand", "period": "2026-07", "trend": "up"},
        """# DORA Metric: Deployment Frequency

## Measurement
- **Metric:** Deployment Frequency
- **Period:** 2026-07
- **Current value:** 2/week
- **Target value:** On-demand
- **Elite benchmark:** On-demand (multiple per day)

## Trend
↑ Improving (was 1/week in June)

## Contributing Factors
- Rsbuild migration simplified the build pipeline
- Manual deploy step still the bottleneck — CD pipeline not yet automated

## Improvement Actions
| # | Action | Expected Impact | Timeline |
|---|--------|----------------|----------|
| 1 | Automate staging deploy via GitHub Actions | 2× → 5×/week | 2026-09 |
| 2 | Add deploy preview per PR | Faster feedback loop | 2026-10 |
"""
    ),
    (
        "mentorship-growth",
        "Zhang Wei — FE Engineer Growth Plan",
        {"engineer": "Zhang Wei", "level": "L3", "track": "ic", "mentor": "FE Lead", "team": "Frontend Squad", "current_quarter_focus": "Deepen Vue 3 Composition API patterns; contribute 1 reusable component to ProTable ecosystem", "growth_area": "depth", "aspiration": "Senior FE engineer — own the ProTable component library end-to-end", "strengths": "Clean code, fast PR turnaround, good at code review feedback", "growth_edges": "Needs more exposure to performance profiling and bundle size optimisation", "stretch_opportunities": "Lead the Rsbuild migration for YiPet; own the ProTable v2 refactor", "support_needed": "Pair programming on performance profiling; code review from staff engineer", "last_review_at": "2026-07-01", "next_review_at": "2026-10-01"},
        """# Mentorship & Growth — Zhang Wei

## Profile
- Level: L3 · Track: IC · Team: Frontend Squad
- Mentor: FE Lead

## Current Quarter Focus
Deepen Vue 3 Composition API patterns; contribute 1 reusable component to ProTable ecosystem.

## Growth Area
Technical depth

## Aspiration (12-18 months)
Senior FE engineer — own the ProTable component library end-to-end.

## Strengths
Clean code, fast PR turnaround, good at code review feedback.

## Growth Edges
Needs more exposure to performance profiling and bundle size optimisation.

## Stretch Opportunities
Lead the Rsbuild migration for YiPet; own the ProTable v2 refactor.

## Support Needed
Pair programming on performance profiling; code review from staff engineer.

## Cadence
- Last review: 2026-07-01 · Next: 2026-10-01
"""
    ),
    (
        "project-handoffs",
        "HO-2026-001: YiPet Chat → New FE Owner",
        {"handoff_id": "HO-2026-001", "project": "YiPet Chat", "from": "Alice (outgoing)", "to": "Zhang Wei (incoming)", "owner": "FE Lead", "status": "in_progress", "planned_at": "2026-08-15", "scope": "Code ownership + on-call for YiPet chat extension; roadmap stays with Alice", "artifacts": "Repos: YiPet/src/chat/*; Dashboards: Chrome Web Store analytics; Docs: YiPet/CLAUDE.md; Runbooks: YiPet chat debug guide", "open_work": "PR #42: ChatSidebar inline rename; PR #45: SessionStatusBar parity with YiVad", "known_issues": "macOS FSEvents broken → apscheduler polling fallback; chat.js jsxDEV mismatch in dev mode", "stakeholders": "YiPet users (~50 internal); Chrome Web Store reviewers", "kt_plan": "2 pairing sessions on chat architecture; 1 shadow on-call week; code walkthrough of chat/index.tsx", "acceptance_criteria": "Zhang Wei can deploy a chat hotfix independently; Reviewed all open PRs; On-call handover documented"},
        """# Project Handoff — HO-2026-001

## Parties
- Project: YiPet Chat
- From: Alice (outgoing) → To: Zhang Wei (incoming)
- Coordinator: FE Lead
- Status: In progress

## Scope
Code ownership + on-call for YiPet chat extension; roadmap stays with Alice.

## Artifacts
Repos: YiPet/src/chat/*; Dashboards: Chrome Web Store analytics; Docs: YiPet/CLAUDE.md; Runbooks: YiPet chat debug guide.

## Open Work / WIP
PR #42: ChatSidebar inline rename; PR #45: SessionStatusBar parity with YiVad.

## Known Issues / Landmines
macOS FSEvents broken → apscheduler polling fallback; chat.js jsxDEV mismatch in dev mode.

## Knowledge Transfer Plan
2 pairing sessions on chat architecture; 1 shadow on-call week; code walkthrough of chat/index.tsx.

## Acceptance Criteria
Zhang Wei can deploy a chat hotfix independently; reviewed all open PRs; on-call handover documented.

## Timing
- Planned: 2026-08-15
"""
    ),
    (
        "dependency-adoption",
        "Rsbuild 1 for Yi Family Frontend",
        {"dependency": "Rsbuild 1.x", "category": "tooling", "phase": "delivered", "risk": "low", "owner": "FE Lead", "team": "Frontend Squad", "decided_by": "Architecture Council", "use_case": "Unified frontend build tool for YiVad (SPA) and YiPet (Chrome extension). Replaces Vite 8.", "alternatives": "Vite 8 (mature, slower); Turbopack (not stable for non-Next.js); Webpack 5 (complex config)", "scoring": "Performance: Rsbuild 5/5, Vite 4/5; Config simplicity: Rsbuild 5/5, Vite 3/5; Ecosystem: Rsbuild 4/5, Vite 5/5", "risk_assessment": "Supply chain: npm package, well-maintained; License: MIT; CVE history: clean; Bus factor: moderate (Rspack team); Lock-in: low (standard webpack-compatible config)", "rollout_plan": "YiVad first (2026-07), YiPet next (2026-08), then evaluate for new projects", "exit_plan": "Rsbuild config is standard Rspack — can migrate to any webpack-compatible bundler. Keep Vite config as fallback for 2 sprints.", "decided_at": "2026-07-15", "adopted_at": "2026-07-28", "project": "yry"},
        """# Dependency Adoption — Rsbuild 1.x

## Profile
- Category: Tooling · Phase: Adopted · Owner: FE Lead
- Decided by: Architecture Council on 2026-07-15

## Use Case
Unified frontend build tool for YiVad (SPA) and YiPet (Chrome extension). Replaces Vite 8.

## Alternatives Considered
Vite 8 (mature, slower); Turbopack (not stable for non-Next.js); Webpack 5 (complex config).

## Scoring
Performance: Rsbuild 5/5, Vite 4/5; Config simplicity: Rsbuild 5/5, Vite 3/5; Ecosystem: Rsbuild 4/5, Vite 5/5.

## Risk Assessment
Supply chain: npm package, well-maintained; License: MIT; CVE history: clean; Bus factor: moderate; Lock-in: low.

## Rollout & Exit
- Rollout: YiVad first (2026-07), YiPet next (2026-08)
- Exit: Keep Vite config as fallback for 2 sprints

## Timing
- Decided: 2026-07-15 · Adopted: 2026-07-28
"""
    ),
    (
        "project-bootstrap",
        "YiVad — Vue 3 Admin Dashboard",
        {"project_name": "YiVad", "stack": "Vue 3.5 + TypeScript 6 + Rsbuild 1 + Pinia 4 + Element Plus 2.14", "phase": "delivered", "owner": "FE Lead", "team": "Frontend Squad", "target_ga_at": "2026-07-01", "first_release_at": "2026-07-15", "charter": "Build a Vue 3 admin dashboard as the management UI for the Yi family. ProTable-driven, four layout modes, dynamic routing with backend menu API, button-level permissions.", "principles": "Componentization: extract reusable components, composables, and shared UI primitives. Simplicity first: no features beyond what was asked. Surgical changes: touch only what you must.", "repo_checklist": "README, LICENSE, CI (lint + type-check), ESLint + Prettier + Stylelint, husky + lint-staged, commitlint + cz-git, ADR dir", "runtime_checklist": "Local dev: pnpm dev → localhost:3000; env vars: RSBUILD_ENV_*; seed data: authMenuList.json fallback", "observability_checklist": "Console logs in dev; error boundary in prod; no telemetry yet", "release_checklist": "Semver, changelog via commitlint, manual deploy (no CD yet)", "owners_and_roles": "Codeowner: FE Lead; Oncall: Frontend Squad rotation; Security: shared; Release captain: FE Lead"},
        """# Project Bootstrap — YiVad

## Profile
- Stack: Vue 3.5 + TypeScript 6 + Rsbuild 1 + Pinia 4 + Element Plus 2.14 · Phase: GA/1.0
- Owner: FE Lead (Frontend Squad)
- Target GA: 2026-07-01 · First release: 2026-07-15

## Charter
Build a Vue 3 admin dashboard as the management UI for the Yi family. ProTable-driven, four layout modes, dynamic routing with backend menu API, button-level permissions.

## Guiding Principles
Componentization: extract reusable components, composables, and shared UI primitives. Simplicity first: no features beyond what was asked. Surgical changes: touch only what you must.

## Checklists
### Repo
README, LICENSE, CI (lint + type-check), ESLint + Prettier + Stylelint, husky + lint-staged, commitlint + cz-git, ADR dir.

### Runtime
Local dev: pnpm dev → localhost:3000; env vars: RSBUILD_ENV_*; seed data: authMenuList.json fallback.

### Observability
Console logs in dev; error boundary in prod; no telemetry yet.

### Release
Semver, changelog via commitlint, manual deploy (no CD yet).

## Owners & Roles
Codeowner: FE Lead; Oncall: Frontend Squad rotation; Security: shared; Release captain: FE Lead.
"""
    ),
    (
        "knowledge-evolution",
        "YiKnowledge 14→19 Role Directory Restructure",
        {"area": "YiKnowledge/roles/", "change_type": "restructure", "status": "delivered", "owner": "Knowledge Curator", "team": "Platform", "rationale": "14 category-based directories didn't map to actual user roles. Real users navigate by 'who am I?' not 'what category is this?'. Restructured to 19 bare-role directories.", "current_state": "14 category dirs (engineer, pm, designer, etc.) with mixed content", "target_state": "19 bare-role dirs (frontend-engineer, backend-engineer, ai-engineer, product-manager, etc.) with role-specific content", "migration": "Move files to matching role dirs; update all cross-references; verify 5822→20 broken links", "affected_consumers": "aiChat context, Story Board, BRD, onboarding, code review", "review_cycle": "quarterly knowledge audit", "last_audit_at": "2026-08-05", "started_at": "2026-08-03", "delivered_at": "2026-08-05"},
        """# Knowledge Evolution — YiKnowledge/roles/

## Change
- Type: Restructure · Status: Done
- Owner: Knowledge Curator (Platform)

## Rationale
14 category-based directories didn't map to actual user roles. Real users navigate by "who am I?" not "what category is this?". Restructured to 19 bare-role directories.

## Current State
14 category dirs (engineer, pm, designer, etc.) with mixed content.

## Target State
19 bare-role dirs (frontend-engineer, backend-engineer, ai-engineer, product-manager, etc.) with role-specific content.

## Migration Plan
Move files to matching role dirs; update all cross-references; verify 5822→20 broken links.

## Affected Consumers
aiChat context, Story Board, BRD, onboarding, code review.

## Audit Cadence
- Review cycle: quarterly knowledge audit · Last audit: 2026-08-05
- Started: 2026-08-03 · Delivered: 2026-08-05
"""
    ),
]


async def _collection_has_any(cname: str) -> bool:
    existing = await db.find_one(cname, {})
    return existing is not None


async def _seed_one(topic: str, title: str, meta: dict, content: str) -> str:
    cname = f"tech_{topic}"
    if await _collection_has_any(cname):
        return f"skip   {topic:<30} (already has entries)"

    key = _key(topic)
    now = _now()

    doc = {
        "key": key,
        "topic": topic,
        "title": title,
        "tags": ["seed", "reference"],
        "meta": meta,
        "content": content,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.insert_one(cname, doc)
    return f"wrote  {topic:<30} -> {cname} / {key}"


async def main() -> int:
    await db.initialize()
    written = 0
    skipped = 0
    failed = 0
    for topic, title, meta, content in TOPICS:
        try:
            msg = await _seed_one(topic, title, meta, content)
            print(msg)
            if msg.startswith("wrote"):
                written += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"FAIL   {topic:<30} -> {e}")
            failed += 1
    print(f"\nDone. wrote={written} skip={skipped} fail={failed} total={len(TOPICS)}")
    await db.close()
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))