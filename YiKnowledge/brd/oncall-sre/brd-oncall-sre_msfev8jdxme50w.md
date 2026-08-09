---
title: Vulnerability management strategy — Prepare a Vulnerability Management Strategy
lifecycle: active
key: brd_brd-oncall-sre_msfev8jdxme50w
tags:
- sre
- vulnerability
- security
incident_id: INC-VULN-001
severity: sev2
incident_type: security
status: stable
owner: Security SRE
mttr: 60
blast_radius: depends on CVE
kb_path: oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md
runbook_link: https://wiki.../vuln-mgmt
summary: "Vulnerability management: scan + classify + remediation SLA (Critical 24h / High 7d / Medium 30d / Low 90d) + automated remediation"
  + monitoring.
timeline: 1. Scan and discover 2. Classify (CVSS) 3. Remediation SLA 4. Automated PR 5. review + merge 6. deploy + verify
root_cause: Not scanned + delayed remediation
action_items: 1. pip-audit / npm audit / trivy 2. CVSS classification 3. Remediation SLA 4. Automated PR 5. deploy verification
slo_impact: Critical 24h unpatched -> SEV-1 security incident
review_cycle: quarterly
tacit: false
related: []
type: reference
---

# Vulnerability management strategy — Prepare a Vulnerability Management Strategy

**Incident ID**: INC-VULN-001  |  **Severity**: sev2  |  **Type**: security  |  **Status**: stable
**Oncall**: Security SRE  |  **MTTR**: 60 min  |  **Blast Radius**: depends on CVE
**KB Source**: oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md
**Runbook**: https://wiki.../vuln-mgmt

## Summary
Vulnerability management: scan + classify + remediation SLA (Critical 24h / High 7d / Medium 30d / Low 90d) + automated remediation + monitoring.

## Timeline
1. Scan and discover 2. Classify (CVSS) 3. Remediation SLA 4. Automated PR 5. review + merge 6. deploy + verify

## Root Cause
Not scanned + delayed remediation

## Action Items
1. pip-audit / npm audit / trivy 2. CVSS classification 3. Remediation SLA 4. Automated PR 5. deploy verification

## SLO Impact
Critical 24h unpatched -> SEV-1 security incident

## References
- **KB Source**: `YiKnowledge/oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md`
- **Runbook**: https://wiki.../vuln-mgmt
