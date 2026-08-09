---
title: incident command and response dashboard
aliases:
- incident command dashboard
- war room dashboard
- incident response process dashboard
- incident coordination dashboard
tags:
- dashboard
- incident-command
- incident-response
- war-room
- escalation
- communication
- coordination
category: oncall-sre/incident-response
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: incident command effectiveness and response process health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- command structure, response time, communication, escalation, coordination, and lessons learned from command defined
related:
- ./dashboard-incident-trends.md
- ./dashboard-oncall-health.md
- ./dashboard-postmortem-quality.md
- ../observability/dashboard-system-health.md
- ../release/dashboard-release-management.md
tacit: false
---

# incident command and response dashboard

> **As an** SRE, **I want to** track incident command and response effectiveness, **so that** every incident has clear command structure, swift response, coordinated communication, proper escalation, and the war room is a well-oiled machine — not a panic room.

> Incident command is the difference between a 30-minute incident and a 3-hour outage. This dashboard tracks command structure, response time, communication effectiveness, escalation quality, cross-team coordination, and war room health — turning incident response from an adrenaline-fueled scramble into a practiced, measured, continuously improving capability.

## Summary

- 6 incident command dimensions: command structure, response time, communication, escalation, coordination, war room health
- 86 incidents/year (P1-P3); average 2.8 incidents/week; 12 incidents required formal war room activation
- Command roles: Incident Commander (IC), Operations Lead (OL), Communications Lead (CL), Scribe; 85% of P1 incidents have all roles filled within 5 minutes
- Average time-to-acknowledge: 2.5 min (target < 3 min); time-to-command: 4.8 min (target < 5 min); time-to-mitigate: 42 min (target < 30 min)
- Communication: 92% of incidents have status updates within 15 minutes; 78% have customer-facing updates within 30 minutes; 3 incidents with communication gaps > 1 hour
- Escalation: 88% appropriately escalated; 5 under-escalated (delayed response); 3 over-escalated (unnecessary executive wake-up)
- 12 incident command drills/year; command certification: 28 engineers certified (target 40); 8 active ICs, 6 active OLs, 5 active CLs

## Core viewpoints

- Command is a role, not a person — the Incident Commander is not the person who knows the most about the system; they're the person who keeps the response organized, delegates effectively, and makes decisions under uncertainty
- The first 5 minutes determine the next 5 hours — if you don't establish command, communication, and a clear line of investigation in the first 5 minutes, you'll spend the next 5 hours in chaos
- Communication is the most underrated incident tool — the #1 cause of incident escalation is not technical complexity; it's stakeholders not knowing what's happening and escalating out of anxiety
- A war room is not a panic room — if the war room feels like a panic attack, you're doing it wrong; a good war room is calm, methodical, and boring — the excitement should be in the investigation, not the coordination

## Key information

### 6-panel incident command overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COMMAND STRUCTURE                 │  RESPONSE TIME                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Incidents/yr: 86        │   │  │  Time-to-ack: 2.5 min    │   │
│  │  P1 w/ war room: 12      │   │  │  Time-to-command: 4.8 min│   │
│  │  Roles filled < 5min: 85%│   │  │  Time-to-investigate:18m │   │
│  │  Certified ICs: 8         │   │  │  Time-to-mitigate: 42min │   │
│  │  Certified OLs: 6         │   │  │  Time-to-resolve: 85 min │   │
│  │  Certified CLs: 5         │   │  │  P1 MTTR: 52 min         │   │
│  │  Command drills: 12/yr    │   │  │  Response score: B+ (85) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  COMMUNICATION                     │  ESCALATION                         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Status < 15min: 92%     │   │  │  Appropriate: 88%        │   │
│  │  Customer < 30min: 78%   │   │  │  Under-escalated: 5       │   │
│  │  Internal comm: 85%       │   │  │  Over-escalated: 3        │   │
│  │  Stakeholder notified:88% │   │  │  Auto-escalation: 72%    │   │
│  │  Comm gaps > 1hr: 3      │   │  │  Escalation latency: 8min │   │
│  │  Status page updates: 42 │   │  │  Exec wake-up: 3 (all P1)│   │
│  │  Communication score: B  │   │  │  Escalation score: B+    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CROSS-TEAM COORDINATION           │  WAR ROOM HEALTH                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Teams involved: 2.8 avg │   │  │  War rooms/yr: 12        │   │
│  │  Handoff clarity: 82%    │   │  │  Avg duration: 52 min    │   │
│  │  SMEs reached: 88%       │   │  │  Avg participants: 8.5   │   │
│  │  Dependency identified:85%│  │  │  Scribe notes: 95%       │   │
│  │  Parallel work: 72%      │   │  │  Decision log: 82%       │   │
│  │  Coordination gaps: 8    │   │  │  Post-war room review:88%│   │
│  │  Coordination score: B   │   │  │  War room score: B+ (85)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Command structure by severity

| Severity | Incidents (12 mo) | War room activated | IC assigned < 5 min | All roles filled | Command transitions | Command score |
|---|---|---|---|---|---|---|
| **P1 (Critical)** | 12 | 12 (100%) | 11 (92%) | 10 (83%) | 3 (healthy) | A- (88) |
| **P2 (Major)** | 28 | 8 (29%) | 24 (86%) | 20 (71%) | 5 (healthy) | B+ (84) |
| **P3 (Minor)** | 46 | 0 (0%) | 38 (83%) | 32 (70%) | 2 (healthy) | B (78) |
| **Overall** | **86** | **20 (23%)** | **73 (85%)** | **62 (72%)** | **10** | **B+ (83)** |

### Incident response timeline (P1 incidents, last 12 months)

| Incident | Date | TTA | TTC | TTI | TTM | TTR | Duration | IC | Command quality |
|---|---|---|---|---|---|---|---|---|---|
| Database connection pool exhaustion | 2026-07-28 | 1.5 min | 3.2 min | 12 min | 28 min | 65 min | 65 min | SRE Lead | A (92) |
| CDN cache poisoning | 2026-07-15 | 2.0 min | 4.5 min | 18 min | 35 min | 72 min | 72 min | SRE Sr. | B+ (85) |
| Cross-region link saturation | 2026-06-22 | 2.5 min | 5.0 min | 22 min | 55 min | 110 min | 110 min | SRE Lead | B (80) |
| BGP route leak (cloud provider) | 2026-06-10 | 3.0 min | 6.0 min | 15 min | 45 min | 65 min | 65 min | SRE Sr. | B+ (84) |
| TLS certificate expiry | 2026-05-18 | 1.0 min | 2.0 min | 5 min | 8 min | 18 min | 18 min | SRE Lead | A (95) |
| DNS DDoS amplification | 2026-05-02 | 2.0 min | 4.0 min | 20 min | 38 min | 55 min | 55 min | SRE Sr. | B+ (85) |
| Service mesh control plane | 2026-04-12 | 3.5 min | 7.0 min | 25 min | 42 min | 68 min | 68 min | SRE Lead | B (78) |
| CDN origin shield failure | 2026-03-28 | 2.0 min | 4.5 min | 28 min | 55 min | 85 min | 85 min | SRE Sr. | B (80) |
| Cross-AZ network partition | 2026-03-05 | 1.5 min | 3.0 min | 10 min | 42 min | 55 min | 55 min | SRE Lead | A (90) |
| Retry storm → DB overload | 2026-02-18 | 4.0 min | 8.0 min | 30 min | 85 min | 192 min | 192 min | SRE Lead | C (65) |
| DNS cache poisoning | 2026-01-25 | 2.5 min | 5.5 min | 18 min | 35 min | 55 min | 55 min | SRE Sr. | B (78) |
| Fiber cut (on-prem NY) | 2026-01-08 | 5.0 min | 10 min | 15 min | 45 min | 480 min | 480 min | SRE Lead | B (75) |
| **Average (P1)** | | **2.5 min** | **4.8 min** | **18 min** | **42 min** | **85 min** | **85 min** | | **B+ (83)** |

### Response time breakdown

| Response phase | P1 (target) | P1 (actual) | P2 (target) | P2 (actual) | P3 (target) | P3 (actual) | Overall |
|---|---|---|---|---|---|---|---|
| **Time-to-acknowledge** (alert → human) | < 3 min | 2.5 min | < 5 min | 3.8 min | < 10 min | 6.2 min | 3.5 min |
| **Time-to-command** (ack → IC assigned) | < 5 min | 4.8 min | < 10 min | 7.5 min | < 15 min | 10.2 min | 7.0 min |
| **Time-to-investigate** (IC → hypothesis) | < 15 min | 18 min | < 30 min | 25 min | < 45 min | 32 min | 25 min |
| **Time-to-mitigate** (hypothesis → fix) | < 30 min | 42 min | < 60 min | 55 min | < 120 min | 85 min | 58 min |
| **Time-to-resolve** (fix → verified) | < 60 min | 85 min | < 120 min | 95 min | < 240 min | 150 min | 110 min |
| **Overall response** | | **B+ (85)** | | **B (80)** | | **B (78)** | **B+ (82)** |

### Communication effectiveness

| Communication metric | P1 | P2 | P3 | Overall | Target | Gap |
|---|---|---|---|---|---|---|
| **First status update** < 15 min | 92% | 85% | 72% | 82% | 95% | -13% |
| **Status update cadence** (every 15-30 min) | 88% | 78% | 60% | 74% | 90% | -16% |
| **Internal stakeholder notification** < 15 min | 92% | 82% | 70% | 80% | 95% | -15% |
| **Customer-facing update** < 30 min (P1/P2) | 78% | 65% | N/A | 72% | 90% | -18% |
| **Status page update** (P1/P2) | 85% | 58% | N/A | 72% | 90% | -18% |
| **Executive notification** (P1 only) | 92% | N/A | N/A | 92% | 100% | -8% |
| **Communication handoff** (shift change) | 82% | 75% | 68% | 75% | 90% | -15% |
| **Post-incident communication** (RCA summary) | 88% | 72% | 50% | 68% | 90% | -22% |
| **Overall communication** | **B+ (85)** | **B (78)** | **C+ (68)** | **B (76)** | **A (92)** | |

### Communication gaps — incident review

| Incident | Date | Gap | Duration | Impact | Root cause | Fix |
|---|---|---|---|---|---|---|
| Retry storm → DB overload | 2026-02-18 | No status update for 85 min | 85 min | Exec escalation, customer confusion | CL not assigned, IC overwhelmed | Auto-assign CL for all P1 |
| DNS DDoS | 2026-05-02 | Customer update delayed 55 min | 55 min | 12 support tickets, 3 churn risks | CL focused on internal, forgot external | Two CLs for P1: internal + external |
| Cross-AZ partition | 2026-03-05 | Status page not updated for 42 min | 42 min | Customer trust impact | Status page access not in war room | Add status page to war room checklist |
| CDN origin shield | 2026-03-28 | Executive notified 45 min late | 45 min | CEO found out from Twitter | No exec notification trigger | Auto-escalation at 30 min for P1 |

### Escalation effectiveness

| Escalation metric | Current | 6 months ago | Target | Notes |
|---|---|---|---|---|
| **Appropriate escalation** | 88% | 82% | 95% | 8 of 86 incidents had escalation issues |
| **Under-escalation** (delayed response) | 5 (5.8%) | 8 (9.5%) | 0% | IC didn't escalate when needed |
| **Over-escalation** (unnecessary) | 3 (3.5%) | 5 (5.9%) | < 2% | Exec woken up unnecessarily |
| **Auto-escalation trigger rate** | 72% | 65% | 90% | 28% of escalations are manual |
| **Escalation latency** (decision → action) | 8 min | 12 min | < 5 min | Time from IC decision to person in war room |
| **SME availability** | 88% reached in < 10 min | 85% | 95% | 12% of SMEs not reachable during incidents |
| **Executive escalation appropriateness** | 85% | 78% | 95% | 2 of 13 exec escalations were unnecessary |
| **Overall escalation score** | **B+ (83)** | **B (78)** | **A (92)** | |

### Escalation audit — last 6 months

| Incident | Severity | Escalation type | Trigger | Latency | Appropriate | Outcome |
|---|---|---|---|---|---|---|
| DB connection pool | P1 | SRE → VP Eng | Auto (P1, 15 min) | 2 min | Yes | VP helped prioritize resources |
| CDN cache poisoning | P1 | SRE → VP Eng | Auto (P1, 15 min) | 3 min | Yes | VP approved emergency CDN config change |
| Cross-region link | P1 | SRE → VP Eng | Auto (P1, 15 min) | 2 min | Yes | VP coordinated with cloud provider |
| BGP route leak | P1 | SRE → VP Eng | Manual (external) | 5 min | Yes | External provider issue, needed exec relationship |
| Mobile push delay | P2 | SRE → Mobile Lead | Manual (SME needed) | 15 min | Yes (but slow) | SME was asleep, needed wake-up |
| API rate limit | P2 | SRE → VP Eng | Manual (IC worried) | 8 min | **No (over-escalated)** | Issue resolved before VP joined |
| Log retention failure | P3 | SRE → Security Lead | Manual (compliance) | 12 min | **No (under-escalated)** | Should have escalated earlier |
| ML pipeline delay | P2 | AI/ML → SRE | Manual (dependency) | 8 min | Yes | Cross-team dependency identified |

### Cross-team coordination

| Coordination metric | P1 | P2 | P3 | Overall | Target |
|---|---|---|---|---|---|
| **Teams involved** (avg) | 3.8 | 2.5 | 1.8 | 2.8 | — |
| **Handoff clarity** | 88% | 82% | 78% | 82% | 95% |
| **SME reachability** (within 10 min) | 92% | 88% | 82% | 88% | 95% |
| **Dependency identification** (< 15 min) | 88% | 85% | 80% | 85% | 95% |
| **Parallel work streams** (not blocked) | 78% | 72% | 65% | 72% | 80% |
| **Blame/shadow incidents** | 1 | 2 | 3 | 6 | 0 |
| **Coordination gaps** | 2 | 3 | 3 | 8 | 0 |
| **Overall coordination** | **B+ (85)** | **B (80)** | **B- (72)** | **B (80)** | **A (90)** |

### Coordination gaps

| Incident | Gap | Impact | Root cause | Fix |
|---|---|---|---|---|
| Retry storm → DB | SRE and DB team working on same fix independently | 20 min wasted, conflicting changes | No coordination between OLs | Single OL for cross-team incidents |
| CDN origin shield | CDN team not notified for 25 min | CDN origin overloaded, cascading | CDN not in on-call rotation | Add CDN to incident auto-page |
| Cross-region link | APAC team not informed of US-team actions | APAC team made conflicting config change | Regional silos | Global incident channel, shared decision log |
| Kubernetes node failure | Platform and App teams blamed each other | 15 min lost in blame instead of fixing | No clear ownership | Pre-defined service ownership matrix |
| DNS cache poisoning | Security team joined late, restarted investigation | 12 min duplicated investigation | Security not auto-paged for DNS | Add security to DNS incident auto-page |
| Payment gateway timeout | Payment partner not contacted for 45 min | Extended outage for payment | 3rd-party contact not in runbook | Add vendor contacts to incident runbook |

### War room health (P1 incidents)

| War room metric | Current | Target | Notes |
|---|---|---|---|
| **War rooms activated** (12 mo) | 12 | — | 100% of P1 incidents |
| **Average duration** | 52 min | < 45 min | 7 of 12 under 45 min |
| **Average participants** | 8.5 | < 10 | 3 incidents with > 15 people (too many) |
| **IC designated within 5 min** | 92% | 100% | 1 incident: IC designated at 8 min |
| **Scribe notes taken** | 95% | 100% | 1 incident: no scribe available |
| **Decision log maintained** | 82% | 100% | 3 incidents: decisions not logged |
| **Post-war room review** (within 24 hr) | 88% | 100% | 2 incidents: review delayed past 24 hr |
| **War room hygiene** (clean handoff, clear close) | 85% | 95% | 2 incidents: messy handoff, no clear resolution |
| **Overall war room score** | **B+ (85)** | **A (92)** | |

### Incident command certification

| Role | Certified | In training | Needed (target) | Gap | Certification requirements |
|---|---|---|---|---|---|
| **Incident Commander** (IC) | 8 | 4 | 12 | -4 | 3 shadowed incidents, 2 led with mentor, IC exam |
| **Operations Lead** (OL) | 6 | 3 | 10 | -4 | 2 shadowed, technical deep-dive, OL exam |
| **Communications Lead** (CL) | 5 | 2 | 8 | -3 | 2 shadowed, communication drill, CL exam |
| **Scribe** | 12 | 5 | 15 | -3 | 1 shadowed, scribe template, tool training |
| **Total** | **31** | **14** | **45** | **-14** | |

### Incident command drills

| Drill type | Frequency | Last run | Participants | Duration | Findings | Action items |
|---|---|---|---|---|---|---|
| **P1 war room simulation** | Monthly | 2026-08-01 | 12 | 45 min | 3 (slow escalation, comm gap, tool issue) | 5 |
| **Communication drill** | Monthly | 2026-07-15 | 8 | 30 min | 2 (status page delay, stakeholder list outdated) | 3 |
| **Cross-team coordination** | Quarterly | 2026-06-20 | 15 | 60 min | 4 (SME availability, handoff, tooling, documentation) | 7 |
| **Executive escalation** | Quarterly | 2026-06-10 | 5 | 30 min | 1 (exec notification template outdated) | 2 |
| **Tabletop exercise** | Quarterly | 2026-05-28 | 20 | 90 min | 5 (coordination, comms, escalation, tools, documentation) | 8 |
| **Total drills** | **12/yr** | | | | **15 findings** | **25 actions** |

### Incident command tools and automation

| Tool | Purpose | Adoption | Reliability | Key gap | Action |
|---|---|---|---|---|---|
| **PagerDuty** | Alerting + escalation | 100% | 99.95% | Auto-escalation rules incomplete | Complete auto-escalation configuration |
| **Slack #incident-war-room** | Real-time coordination | 95% | 99.9% | No automated scribe | Add incident bot for auto-scribing |
| **Incident.io** | Incident management | 85% | 99.5% | Not all teams onboarded | Onboard remaining 3 teams |
| **Statuspage** | Customer communication | 80% | 99.9% | Manual updates slow | Add P1 auto-update from incident.io |
| **Jira (postmortem)** | Action item tracking | 90% | 99.9% | Action items not auto-created | Auto-create from incident.io decisions |
| **Zoom (war room)** | Video bridge | 100% | 99.9% | Recording not always started | Auto-record P1 war rooms |
| **Decision log** (Google Docs) | Decision tracking | 82% | N/A | Template not always used | Auto-create from incident.io |

## Action recommendations

1. **IC/OL/CL certification gap**: 14 certifications needed; accelerate training pipeline, run 2 certification sessions per quarter, target 40 certified by Q4 2026
2. **Customer communication improvement**: 72% customer updates within 30 min; designate separate internal and external CLs for P1 incidents, pre-write status page templates
3. **Auto-escalation completion**: 72% auto-escalation, 28% manual; complete auto-escalation rules for all incident types, reduce manual escalation decisions
4. **Communication gap prevention**: 3 incidents with > 1 hour communication gaps; implement auto-reminder at 15-min intervals, pre-assign backup CL for every P1
5. **SME availability**: 88% within 10 min; implement SME escalation tree with 2 backups per service, verify SME contact info monthly
6. **Decision log compliance**: 82% with decision logs; auto-create decision log from incident.io, add decision log to war room closing checklist
7. **Cross-team coordination**: 8 coordination gaps; implement single OL for cross-team incidents, pre-defined service ownership matrix
8. **War room over-participation**: 3 incidents with 15+ people; implement war room participant policy, observers in separate channel
9. **Post-incident communication**: 68% RCA summary sent; add RCA summary to postmortem process, auto-send to stakeholders within 48 hours
10. **Weekly incident command review**: review response times, communication effectiveness, escalation quality, coordination, and war room health with SRE leadership



- The hero IC → one person who is always the Incident Commander because "they're the best at it"; this creates a single point of failure and prevents others from learning — command is a skill to be distributed, not a crown to be worn
- The silent war room → everyone working furiously but nobody saying what they're doing; a quiet war room is a dangerous war room — the IC should narrate what's happening, what's being investigated, and what's been ruled out
- Escalation as panic → escalating because "I don't know what to do" instead of "I need resources/authority/expertise"; escalation should be specific: "I need the DB lead because we suspect a replication issue" not "I need help"
- War room as spectator sport → 20 people in the war room, 5 working, 15 watching; observers add noise, not value — create a separate observer channel and keep the war room to decision-makers and doers
- Communication as an afterthought → "we'll update the status page when we know what's happening"; stakeholders need to know you're working on it before you know what "it" is — the first update should be "we're investigating" within 5 minutes

## Related

- Same class: [dashboard-incident-trends](dashboard-incident-trends.md) — incident trends and analysis
- Same class: [dashboard-oncall-health](dashboard-oncall-health.md) — oncall health and alert fatigue
- Same class: [dashboard-postmortem-quality](dashboard-postmortem-quality.md) — postmortem quality and learning
- Same class: [dashboard-system-health](../observability/dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-release-management](../release/dashboard-release-management.md) — release management
- References: Google SRE — *Chapter 14: Managing Incidents*; PagerDuty — *Incident Command System (ICS)*; Atlassian — *Incident Management Handbook*; Netflix — *Incident Response Process*; Etsy — *Incident Response and Postmortem Guide*; FEMA — *ICS-100 (Incident Command System)*