---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-068-observability-sre-platform
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: brd
---

# brd-2026-068 Observability & SRE Platform — rule

> **As an** engineer, **I want to** rules, **so that** project context preserved.

## 1. SLO rules
- Core services must define SLI/SLO
- Error Budget quarterly review
- SLO breach triggers Chaos drill

## 2. Alert rules
- 100% must have runbook
- Four golden signals required
- Thresholds based on SLO rather than hard-coded
- Silent alerts cleaned up quarterly

## 3. Collection rules
- OTel Collector unified collection
- OTLP protocol required
- Sampling rate 10-20%
- PII data masking required

## 4. Documentation rules
- Runbook required
- Dashboard JSON committed to repo
- Changelog required
