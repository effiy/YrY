---
title: Handling Outage Communication
aliases:
- handle-an-outage-communication
- outage-communication
- incident-communication
- status-page-communication
tags:
- incident-response
- communication
- outage
- sre
- tech-lead
- crisis-management
category: tech-lead/risk
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- tech-lead
- oncall-sre
- executive
benefit: "Tech leads execute structured outage communication that maintains customer trust, meets SLA obligations, and prevents the secondary incident of poor communication"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./tl-risk-register-single-provider-llm-lock-in.md
- ../../oncall-sre/observability/observability-triad.md
- ../../oncall-sre/incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md
- ../../engineer/lessons/failure-incident-postmortem.md
- ../../knowledge-curator/templates/knowledge-leaf.md
tacit: false
---

# Handling Outage Communication

> **As a** tech lead, **I want to** execute structured outage communication that keeps stakeholders informed without distracting responders, **so that** customer trust is preserved, SLA obligations are met, and the incident is not compounded by poor communication.

> Outage communication is a distinct skill from incident response. The best technical response is undermined by silence, delays, or misleading status updates. This guide provides the communication framework, templates, and escalation paths for production outages.

## Summary

- Outage communication has three audiences with different needs: customers (what's broken, when it'll be fixed), internal stakeholders (business impact, timeline), and responders (technical details, coordination)
- The communication timeline is structured: acknowledge within 5 minutes, update every 30 minutes, resolve with a postmortem commitment within 24 hours
- Status page updates must follow a consistent format: what happened, what's the impact, what we're doing, when's the next update
- The #1 communication failure is silence — an update saying "we're still investigating" is infinitely better than no update
- Internal communication uses a dedicated incident channel; external communication uses the status page; never mix the two

## Core viewpoints

### 1. Communication is part of the incident response, not an afterthought

Assign a Communications Lead role at incident declaration — this person does NOT troubleshoot. Their sole job is to draft updates, manage the status page, and keep stakeholders informed. Rotating this role among team members builds organizational resilience.

### 2. The first update is the most important

The 5-minute acknowledge sets the tone for the entire incident. It doesn't need root cause — it needs: "We're aware of [symptom], it's impacting [scope], we're investigating, next update in 30 minutes." This buys the team breathing room to diagnose without stakeholder pressure.

### 3. Over-communicate during uncertainty, under-communicate during recovery

During the diagnostic phase, stakeholders are anxious because they don't know what's happening. Update every 30 minutes even if the update is "still investigating." During the recovery phase, updates can slow to every 60 minutes as the situation stabilizes.

### 4. Never speculate about root cause or ETA in external communication

"Investigating database connectivity" is acceptable. "The database is down because of a bad deploy" is speculation until confirmed. A wrong root cause statement erodes trust more than saying "we're still investigating." Similarly, never give an ETA you can't commit to — "we're targeting resolution within 2 hours" is better than "fixed in 30 minutes."

### 5. Internal communication is for coordination, external is for trust

The internal incident channel should have raw technical details, log snippets, and real-time coordination. The status page should have business-impact summaries. Never copy-paste internal messages to the status page — they contain information that confuses customers and may expose security details.

## Key info

### Communication roles

| Role | Responsibility | Reports To |
|---|---|---|
| Incident Commander | Overall incident coordination | CTO / VP Engineering |
| Communications Lead | Status page updates, stakeholder communication | Incident Commander |
| Technical Lead | Diagnosis and resolution | Incident Commander |
| Customer Support Liaison | Customer-facing communication, ticket responses | Communications Lead |

### Communication timeline

| Time | Action | Channel | Template |
|---|---|---|---|
| T+0-5 min | Acknowledge incident | Status page | "We are investigating [symptom] affecting [scope]. Next update in 30 min." |
| T+30 min | First update | Status page | "[Status: Investigating/Identified/Mitigating]. [Brief detail]. Impact: [scope]. Next update in 30 min." |
| T+60 min | Second update | Status page + internal Slack | Same format; escalate to exec if not progressing |
| T+90 min | Escalation trigger | Exec briefing | If unresolved at 90 min, brief CTO/VP with current state and ETA |
| T+resolution | Resolved update | Status page | "Service restored at [time]. We'll publish a postmortem within 5 business days." |
| T+24h | Post-incident summary | Email to stakeholders | Brief summary of what happened, impact, and commitment to postmortem |
| T+5 days | Postmortem published | Knowledge base | Full postmortem linked from status page |

### Status page update template

```
[INCIDENT STATUS] - [Brief Title]

Status: Investigating | Identified | Mitigating | Resolved
Impact: [Who is affected, what functionality is degraded]
Scope: [Specific regions, services, user segments]
Current Action: [What the team is doing right now]
Next Update: [Time of next update]

Posted: [Timestamp]
```

### Internal incident channel template

```
INCIDENT: [Title]
Severity: Sev1 | Sev2 | Sev3
Commander: [Name]
Comms Lead: [Name]
Channel: #incident-[date]-[title]

Timeline:
- [HH:MM] Incident declared
- [HH:MM] [Update]
```

### Severity classification

| Severity | Definition | Comms Cadence | Escalation |
|---|---|---|---|
| Sev1 | Complete service outage, all users affected | Every 15-30 min | CTO immediately |
| Sev2 | Partial outage or major feature broken | Every 30 min | VP Engineering at 60 min |
| Sev3 | Minor feature degraded, limited users | Every 60 min | Team lead only |

### Escalation matrix

| Trigger | Escalate To | When |
|---|---|---|
| Sev1 declared | CTO, VP Engineering | Immediately |
| Sev2 unresolved at 60 min | VP Engineering | At 60 min |
| Sev2 unresolved at 120 min | CTO | At 120 min |
| Any incident affecting paying customers | Customer Success VP | At declaration |
| Data loss or security breach | CISO, Legal | Immediately |

## Action recommendations

1. **Pre-write status page templates for common failure modes**: Database outage, API degradation, third-party dependency failure, deployment rollback. Having templates ready reduces the 5-minute acknowledge to 2 minutes.
2. **Assign the Communications Lead role in your on-call rotation**: Every on-call shift should have a designated Comms Lead. Practice this role during fire drills.
3. **Set up a dedicated incident channel before you need it**: `#incident-active` should exist and be known to all engineers. During an incident, move all technical discussion there.
4. **Use a status page provider that works when your infrastructure doesn't**: StatusPage.io, Cachet, or a static site on a separate hosting provider. Your status page must not share infrastructure with your product.
5. **Run a communication fire drill quarterly**: Simulate a Sev1 incident, practice the full communication flow including status page updates, internal coordination, and executive briefing. Time-box: 30 minutes.

## Anti-patterns

- **Silence during investigation**: "We don't have anything new to say" is not a reason to skip an update. "Still investigating" is a valid update. Silence creates panic.
- **Technical details in customer-facing communication**: "The Redis connection pool exhausted due to a connection leak in the session middleware" means nothing to customers. "We're experiencing a database issue affecting login" is the right level.
- **Premature ETA commitments**: "We'll be back up in 10 minutes" is a promise you can't keep. "We're targeting resolution within the hour" sets expectations without over-promising.
- **No communication handoff**: When the Comms Lead's shift ends, the handoff must include: current status, last update time, next update due, and what's changed since the last update. Dropping the baton = silence.
- **Forgetting the "resolved" update**: The status page shows "investigating" for 3 hours after the incident is resolved. Always close the loop with a "resolved" update and a postmortem commitment.
- **Mixing internal and external communication channels**: Discussing root cause hypotheses in a customer-visible Slack channel. Internal investigation stays in `#incident-active`; external updates go through the status page.

## Related

- [Single-Provider LLM Lock-in Risk](./tl-risk-register-single-provider-llm-lock-in.md) — Risk that could trigger an outage
- [Observability Triad](../../oncall-sre/observability/observability-triad.md) — Detection infrastructure for outages
- [Incident Postmortem](../../oncall-sre/incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md) — Post-incident analysis process
- [Failure Incident Postmortem](../../engineer/lessons/failure-incident-postmortem.md) — Postmortem lessons learned
- [Knowledge Leaf Template](../../knowledge-curator/templates/knowledge-leaf.md) — Content structure template