---
title: Handle a Data Breach
aliases: [handle-a-data-breach, data-breach-response, security-incident]
tags: [sre, incident-response, security, data-breach, procedure]
category: srer/incident-response
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, leader, engineer]
benefit: "SREs and leaders respond to data breaches with a structured, time-sensitive procedure that minimizes damage and meets compliance requirements"
acceptance_criteria:
  - "5 phases: contain, assess, notify, remediate, postmortem"
  - "includes notification timeline requirements"
  - "covers evidence preservation for forensic analysis"
related:
  - ./respond-to-an-incident.md
  - ./handle-an-oncall-shift.md
  - ../../leader/risk/write-a-postmortem.md
  - ../../leader/risk/launch-risk-assessment.md
---

# Handle a Data Breach

> **When to use:** When unauthorized access to data is confirmed or strongly suspected. Data breaches are time-sensitive — every minute counts for containment.

## Phase 1: Contain (First 15 Minutes)

### Immediate Actions

| Step | Who | Action | Time |
|---|---|---|---|
| 1 | On-call | **Isolate** affected systems — revoke access, rotate keys, shut down if necessary | 5 min |
| 2 | On-call | **Preserve evidence** — take snapshots of logs, databases, and access records before any changes | 5 min |
| 3 | On-call | **Stop the bleeding** — block the attack vector (IP, token, account) | 5 min |

### What NOT to Do

- Do NOT delete anything — you'll destroy forensic evidence
- Do NOT reboot systems — volatile memory contains attacker traces
- Do NOT notify users yet — assess scope first

## Phase 2: Assess (First Hour)

### Determine Scope

| Question | How to answer |
|---|---|
| What data was accessed? | Check access logs, query history, file access records |
| How many records? | Count unique documents/users accessed |
| When did it start? | Find the earliest unauthorized access timestamp |
| How did they get in? | Trace the attack vector (stolen token, SQL injection, misconfigured ACL) |
| Is the attack still active? | Check for ongoing unauthorized access patterns |

### Severity Classification

| Severity | Criteria | Notification timeline |
|---|---|---|
| **Critical** | PII, credentials, payment data, or > 1000 records | Notify within 24 hours |
| **High** | Internal documents, non-sensitive data, < 1000 records | Notify within 72 hours |
| **Medium** | Metadata only, no content exposed | Notify within 1 week |
| **Low** | Attempted but unsuccessful breach | No notification required |

### Evidence Collection

```bash
# Preserve access logs
cp /var/log/yi-ai/access.log /tmp/breach-$(date +%Y%m%d-%H%M)/

# Snapshot MongoDB access logs
mongodump --uri="mongodb://localhost:27017" --db=admin --collection=system.access_log

# Capture current network connections
ss -tunap > /tmp/breach/connections.txt

# Capture running processes
ps auxf > /tmp/breach/processes.txt
```

## Phase 3: Notify (Per Severity Timeline)

### Internal Notification

1. **Security team** — immediate
2. **Engineering manager** — within 1 hour
3. **VP Engineering / CTO** — within 2 hours for Critical/High
4. **Legal / Compliance** — within 4 hours for Critical (regulatory requirements)

### External Notification (if required)

| Regulation | Requirement |
|---|---|
| GDPR | Notify supervisory authority within 72 hours |
| CCPA | Notify affected users "without unreasonable delay" |
| PIPL (China) | Notify relevant authorities within 24 hours |

### Notification Template

```
Subject: Security Incident Notification — {{date}}

We are writing to inform you of a security incident that may have involved your data.

What happened: {{1-2 sentence description}}
What data was involved: {{data types, NOT specific values}}
What we're doing: {{containment and remediation steps}}
What you should do: {{user actions, if any}}

We will provide updates as our investigation continues.
Contact: {{security team email}}
```

## Phase 4: Remediate

### Root Cause Fix

| Attack vector | Fix |
|---|---|
| Stolen API token | Rotate all tokens; implement token expiration; audit token scope |
| SQL injection | Fix the vulnerable query; audit all queries for the same pattern |
| Misconfigured ACL | Fix ACL; audit all collections for correct permissions |
| Dependency vulnerability | Update the vulnerable dependency; audit all projects |
| Insider threat | Revoke access; review access logs; implement least-privilege |

### Prevent Recurrence

- [ ] Add monitoring for the specific attack pattern
- [ ] Add an alert for the specific data access pattern
- [ ] Update the security checklist with this finding
- [ ] Schedule a penetration test focused on this attack vector

## Phase 5: Postmortem

Write a postmortem using [leader/risk/write-a-postmortem.md](../../leader/risk/write-a-postmortem.md). Key questions:

1. What was the root cause? (5-Whys)
2. How long was the data exposed? (timeline)
3. What was the impact? (records, users, data types)
4. What process changes will prevent this?

## YrY-Specific Considerations

| YiAi consideration | Action |
|---|---|
| MongoDB connection string in config.yaml | Encrypt or use environment variables; never commit to git |
| Ollama API accessible on localhost | Ensure firewall blocks external access to port 11434 |
| YiKnowledge markdown files on disk | File system permissions: read-only for the API user |
| Session data in MongoDB | Implement session TTL; auto-delete sessions > 90 days |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Deleting evidence during containment | Can't determine scope; can't meet compliance requirements | Preserve logs, snapshots, and memory dumps before any cleanup |
| Notifying users before assessing scope | "We've been breached" with no details causes panic | Assess scope first; notify with specific, actionable information |
| Secret postmortem | Team doesn't learn; same breach recurs | Share the postmortem with the engineering team; redact sensitive details |
| No regulatory notification | Fines, legal action, loss of trust | Know your regulatory requirements; notify within the required timeline |