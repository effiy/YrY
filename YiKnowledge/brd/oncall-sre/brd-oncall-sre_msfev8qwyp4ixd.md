---
title: No Lockfile Supply Chain Incident Retrospective — No Lockfile Supply Chain risk
lifecycle: active
key: brd_brd-oncall-sre_msfev8qwyp4ixd
tags:
- sre
- postmortem
- supply-chain
incident_id: INC-2026-07-LOCKFILE
severity: sev1
incident_type: security
status: reviewed
owner: YiAi primary owner
mttr: 60
blast_radius: YiAi all stacks
kb_path: oncall-sre/incident-response/tl_postmortem_no_lockfile_supply_chain_2026_07.md
runbook_link: https://wiki.../no-lockfile
summary: "YiAi having no uv.lock caused supply chain CVE risk — pip-audit discovered 3 high CVEs. Retrospective: introduced uv.lock + pip-audit"
 CI block + min-release-age 7d + lifecycle allowlist.
timeline: 1. 2026-07 pip-audit discovered 3 high CVEs 2. emergency fix + lock version 3. CI block 4. min-release-age
 7d 5. lifecycle allowlist
root_cause: no lockfile + no pip-audit + no min-release-age = supply chain CVE risk
action_items: 1. uv.lock commit 2. pip-audit CI block 3. min-release-age 7d 4. lifecycle
 allowlist 5. quarterly re-audit
slo_impact: no lockfile → supply chain CVE → SEV-1 security event
review_cycle: quarterly
tacit: false
related: []
---

# No Lockfile Supply Chain Incident Retrospective — No Lockfile Supply Chain risk

**Incident ID**: INC-2026-07-LOCKFILE | **Severity**: sev1 | **Type**: security | **Status**: reviewed
**Oncall**: YiAi primary owner | **MTTR**: 60 min | **Blast Radius**: YiAi all stacks
**KB Source**: oncall-sre/incident-response/tl_postmortem_no_lockfile_supply_chain_2026_07.md
**Runbook**: https://wiki.../no-lockfile

## Summary
YiAi having no uv.lock caused supply chain CVE risk — pip-audit discovered 3 high CVEs. Retrospective: introduced uv.lock + pip-audit CI block + min-release-age 7d + lifecycle allowlist.

## Timeline
1. 2026-07 pip-audit discovered 3 high CVEs 2. emergency fix + lock version 3. CI block 4. min-release-age 7d 5. lifecycle allowlist

## Root Cause
no lockfile + no pip-audit + no min-release-age = supply chain CVE risk

## Action Items
1. uv.lock commit 2. pip-audit CI block 3. min-release-age 7d 4. lifecycle allowlist 5. quarterly re-audit

## SLO Impact
no lockfile → supply chain CVE → SEV-1 security event

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/tl_postmortem_no_lockfile_supply_chain_2026_07.md`
- **Runbook**: https://wiki.../no-lockfile
