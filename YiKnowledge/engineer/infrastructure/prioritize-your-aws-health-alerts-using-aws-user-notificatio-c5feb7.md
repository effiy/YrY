---
title: Prioritize your AWS Health alerts using AWS User Notifications
tags: [AWS Health, AWS User Notifications, CloudFormation, alerting, operational-excellence]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/prioritize-your-aws-health-alerts-using-aws-user-notifications/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, devops]
benefit: "Replace noisy AWS Health notification firehose with a two-tier priority system (CRITICAL immediate, INFORMATIONAL batched) using a single CloudFormation template with zero Lambda code."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/infrastructure/building-multi-region-resiliency-for-aws-cloudformation-cust-754c20
---

# Prioritize your AWS Health alerts using AWS User Notifications

> **As a** platform engineer, **I want to** filter and prioritize AWS Health events by service and severity, **so that** my team receives immediate alerts for critical issues without being buried in informational noise.

## Summary

- AWS Health emits all events (issues, scheduled changes, account notifications, deprecations) in an undifferentiated stream, creating a classic signal-to-noise problem.
- The solution uses a two-layer filter: first, scope to only services your organization depends on; second, split into CRITICAL (issue/scheduledChange, delivered immediately) and INFORMATIONAL (everything else, batched in 5-minute windows).
- A single CloudFormation template supports four deployment modes: single-account (Linked), organization-wide (Payer), and variants with an additional EventBridge+SNS custom email path (Combined/PayerCombined).
- No Lambda functions, no DynamoDB tables, no support plan requirement -- the entire solution runs on AWS User Notifications, EventBridge, and SNS.
- Always include `us-east-1` in monitored regions, since global service events (IAM, Route 53, CloudFront) are delivered there.

## Core viewpoints

### 1. The delivery pattern IS the priority signal

AWS User Notifications controls the email format, so you cannot add custom "[CRITICAL]" labels to the default email body. The priority distinction comes from the delivery behavior: standalone emails mean attention now, batched summaries are routine. For teams that need explicit labels, the Combined deployment mode adds an EventBridge InputTransformer that prefixes the email body.

### 2. Lightweight is a feature, not a limitation

This solution deliberately omits deduplication, escalation/acknowledgment, and historical storage. It is not a replacement for AHA, HEIDI, or PagerDuty. It fills a specific gap: the simplest path to priority-separated, real-time health alerting with no code to maintain. It works as a standalone solution or as a foundation layer feeding into more advanced tools.

### 3. Start simple, layer on complexity as needed

The notification configurations and event rules remain in place even as you add Slack/Teams via AWS Chatbot, escalation via PagerDuty/OpsGenie, or historical analysis via HEIDI/CID. The architecture does not lock you into a single path.

### 4. The service filter is the most impactful configuration decision

The default template monitors only Direct Connect, Connect, and RDS. Most organizations need to add EC2, ECS, Lambda, and their primary database service. But over-including services creates noise that defeats the purpose of the two-tier system. The filter should reflect services where degradation directly impacts customer experience, not every service in your bill. A service that is "nice to monitor" but not customer-impacting belongs in INFORMATIONAL, not CRITICAL.

### 5. Lifecycle-based event duplication is a feature for situational awareness, not a bug

Each AWS Health event progresses through states (created, updated, resolved), and each state transition triggers a notification. This means your team sees the event evolve: initial detection, scope change, mitigation progress, and resolution. The sequence of notifications tells a story. Suppressing "duplicate" notifications would hide critical status changes, such as an event expanding in scope or a partial resolution being rolled back.

## Key info

- Four deployment modes: Linked (single account), Payer (organization-wide), Combined (adds EventBridge+SNS), PayerCombined (both).
- CRITICAL events use `eventTypeCategory` matching `issue` or `scheduledChange`; INFORMATIONAL uses an anything-but filter.
- Combined modes include a CloudWatch alarm on SNS delivery failures and a 14-day SQS dead letter queue.
- AWS Health events are lifecycle-based (created, updated, resolved) -- each update triggers a new notification, so a single incident may generate 2-4 emails.

## Action recommendations

1. Deploy the CloudFormation template in Linked mode first to validate the filtering and priority separation for your team.
2. Customize the monitored services list to match your organization's actual dependencies (default: Direct Connect, Connect, RDS).
3. Add `us-east-1` to monitored regions regardless of where your workloads run.
4. For teams needing explicit priority labels or delivery monitoring, upgrade to Combined mode for the EventBridge+SNS layer.

## Anti-patterns

- **Using this as a replacement for a full incident management pipeline (Page....** Do not use this as a replacement for a full incident management pipeline (PagerDuty, OpsGenie) if you need on-call routing and acknowledgment.

- **Skipping `us-east-1` -- global service events will be silently missed.** Do not skip `us-east-1` -- global service events will be silently missed.

- **This solution does not deduplicate events; a single incident progre....** This solution does not deduplicate events; a single incident progressing through its lifecycle will generate multiple notifications.

- **Configuring the CRITICAL notification path to use batched delivery.** Do not configure the CRITICAL notification path to use batched delivery. The whole point of the two-tier system is that CRITICAL events interrupt immediately. Batching them defeats the purpose and makes the CRITICAL path indistinguishable from the INFORMATIONAL path.

- **Assuming all regions have equal event volumes.** Do not assume all regions have equal event volumes. us-east-1 generates the most events because it hosts global services (IAM, Route 53, CloudFront). Monitor regional event patterns and adjust your filtering if certain regions generate disproportionate noise that desensitizes your team to real alerts.

## Related

- engineer/infrastructure/building-multi-region-resiliency-for-aws-cloudformation-cust-754c20