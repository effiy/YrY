---
title: BRD-2026-077 knowledge base file watcher and sync
lifecycle: active
key: brd_brd-engineer_msfe6wyiai077
tags:
- engineer
- yiai
- knowledge-watcher
- apscheduler
- macos-fsevents
- l3-maturity
brd_id: BRD-2026-077
project: yiai
domain: Knowledge Base File Watcher
quarter: 2026 Q3
priority: p1
status: in_progress
owner: YiAi Platform Team
tech_stack: FastAPI, APScheduler, MongoDB, YiKnowledge scanner
key_metrics: file watching missing 100%→0% (down 100%); sync delay 0s→30s (up 100%); macOS FSEvents missed event rate 70%→0% (down
  100%); recall index freshness 60%→100% (up 67%); on-call manual coverage 0%→100%
acceptance_criteria: '1. APScheduler polling 100% covers YiKnowledge root directory

  2. file change sync delay <30 seconds

  3. macOS FSEvents missed events 0 (3 consecutive months)

  4. recall index freshness 100%

  5. 8 new files 100% auto-synced

  6. on-call manual 100% coverage

  7. CI enforces lint + frontmatter validation'
stakeholders: YiAi Tech Lead (decision); YiAi Platform Team 3 FTE (execution); AI Engineer Team (consumption);
  SRE/DevOps (operations); architecture committee (technical review); 5 business teams (consumption)
kb_path: tech-lead/decisions/yiai--knowledge-watcher-deployment
notes: Since macOS FSEvents silently misses events on this machine (both watchfiles / watchdog fail),
  use APScheduler scheduled polling + file hash comparison + MongoDB index sync, targeting L3 platformization
  maturity, evolving to cross-platform unified watching within 3 years (L4 100%).
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# BRD-2026-077 knowledge base file watcher and sync

**BRD ID**: BRD-2026-077  |  **Project**: yiai  |  **Domain**: Knowledge Base File Watcher  |  **Quarter**: 2026 Q3
**Priority**: P1  |  **Status**: In Progress  |  **Owner**: YiAi Platform Team
**KB Source**: tech-lead/decisions/yiai--knowledge-watcher-deployment

## Context
Since macOS FSEvents silently misses events on this machine (both watchfiles / watchdog fail), use APScheduler scheduled polling + file hash comparison + MongoDB index sync, targeting L3 platformization maturity, evolving to cross-platform unified watching within 3 years (L4 100%).

## Objectives & Key Metrics
file watching missing 100%→0% (down 100%); sync delay 0s→30s (up 100%); macOS FSEvents missed event rate 70%→0% (down 100%); recall index freshness 60%→100% (up 67%); on-call manual coverage 0%→100%

## Acceptance Criteria
1. APScheduler polling 100% covers YiKnowledge root directory
2. file change sync delay <30 seconds
3. macOS FSEvents missed events 0 (3 consecutive months)
4. recall index freshness 100%
5. 8 new files 100% auto-synced
6. on-call manual 100% coverage
7. CI enforces lint + frontmatter validation

## Stakeholders
YiAi Tech Lead (decision); YiAi Platform Team 3 FTE (execution); AI Engineer Team (consumption); SRE/DevOps (operations); architecture committee (technical review); 5 business teams (consumption)

## Milestones
M1 (2026 Q3, 2 weeks): APScheduler polling + hash comparison + 5 directory onboarding; M2 (2026 Q3, 2 weeks): MongoDB index sync + CI lint; M3 (2026 Q4, 3 weeks): 8 new file auto-sync + on-call manual; M4 (2027 Q1): cross-platform watching pilot + 50% coverage; M5 (2027 Q3): 100% coverage + L3 achieved; M6 (2028 Q1): cross-platform watching GA + L4 60%

## Risks
1. Polling performance (P0) — incremental hash + rate limiting
2. macOS compatibility (P0) — apscheduler fallback
3. Index sync drift (P1) — contract test + audit
4. Business party stealthy edits (P1) — CI lint + quarterly scan
5. Cross-platform limitations (P2) — Linux inotify adaptation

## Long-term Evolution
After 3 years sync delay 10 seconds, missed events 0, cross-platform 100%; after 5 years cross-platform unified watching GA, L4 100%.

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai--knowledge-watcher-deployment`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
