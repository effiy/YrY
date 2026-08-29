---
title: Decommission a Service
aliases: [decommission, service-removal, sunset-service]
tags: [roadmap, decommission, lifecycle, leader]
category: leader/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [leader]
benefit: "Safely decommission a service with a structured migration, cutover, and cleanup process that minimizes risk and ensures no orphaned dependencies"
related:
  - ./deprecate-a-feature.md
  - ./manage-tech-debt.md
  - ../architecture/README.md
  - ../README.md
  - ../INDEX.md
---

# Decommission a Service

> **As a** tech lead, **I want to** safely decommission a service, **so that** we reduce operational burden, infrastructure cost, and architectural complexity.

## Definition

Service decommissioning is the process of safely shutting down and removing a service. Unlike feature deprecation (which removes user-facing functionality), service decommissioning removes an entire backend component.

## Trigger condition

- Service has been replaced by a new implementation
- Service is no longer needed (downstream consumers migrated away)
- Service is being consolidated into another service
- Service has become too expensive to maintain relative to its value
- Organizational change: team owning the service is disbanded

## Step-by-step walkthrough

### Step 1: Discover all dependencies

Before touching anything, map everything:

| Dependency type | How to discover |
|---|---|
| **Upstream callers** | API gateway logs, service mesh, reverse proxy logs |
| **Downstream services** | Service config, connection strings, client libraries |
| **Data stores** | Databases, caches, message queues, blob storage |
| **Infrastructure** | DNS records, load balancers, firewall rules, secrets |
| **Monitoring & alerts** | Dashboards, alert rules, runbooks, playbooks |
| **CI/CD** | Build pipelines, deploy scripts, environment configs |
| **Documentation** | Architecture diagrams, READMEs, onboarding docs |

**Golden rule**: If you discover a dependency after decommissioning, you've caused an incident. Be thorough.

### Step 2: Plan the migration

For each dependency, define the migration path:

| Dependency | Migration path | Owner | Deadline |
|---|---|---|---|
| Service A calls our API | Migrate to new service API | Team A TL | Week 2 |
| Service B uses our database | New service will expose the data | Team B TL | Week 3 |
| DNS: `old-service.example.com` | Update to point to new service | Infra | Week 4 |

### Step 3: Execute the migration

Phase the migration to minimize risk:

| Phase | Action | Rollback |
|---|---|---|
| **Phase 1: Dual-write** | Both old and new services receive traffic | Easy — just switch traffic back |
| **Phase 2: Read from new** | Reads go to new; writes to both | Moderate — data consistency risk |
| **Phase 3: Old read-only** | Old service is read-only; all writes to new | Moderate — may need data backfill |
| **Phase 4: Drain** | Old service receives no traffic | Hard — old service is stale |
| **Phase 5: Remove** | Old service shut down; code removed | Very hard — need to redeploy old service |

### Step 4: Cut over

Checklist before cutting over:

- [ ] All upstream callers have migrated (verified in logs: 0 requests to old service)
- [ ] All downstream dependencies are no longer needed
- [ ] Data has been migrated and validated
- [ ] Monitoring shows old service handling 0 traffic for at least 1 week
- [ ] Rollback plan is documented and tested
- [ ] On-call team is aware of the decommissioning

During cutover:
1. Stop the old service (don't delete yet)
2. Monitor for 24–48 hours for any unexpected errors
3. If clean, proceed to cleanup

### Step 5: Clean up

Remove all traces of the service:

| Area | Cleanup action |
|---|---|
| **Code** | Delete the repository or mark as archived |
| **Infrastructure** | Delete VMs, containers, databases, caches, queues |
| **DNS** | Remove DNS records |
| **CI/CD** | Remove build pipelines, deploy scripts |
| **Secrets** | Rotate and remove secrets |
| **Monitoring** | Remove dashboards, alert rules, runbooks |
| **Documentation** | Update architecture diagrams; remove or archive service docs |
| **On-call** | Remove from on-call rotation |

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Some callers can't migrate in time | Extend timeline / Help them migrate / Force migration | Help them if it's a capacity issue; force only as a last resort |
| Data migration is too complex | Keep the data store / Simplify the migration / Accept data loss | Never accept data loss unless the data is explicitly non-critical |
| Service is handling traffic you didn't know about | Investigate / Re-plan / Pause decommission | Pause; shadow traffic is a sign of incomplete dependency discovery |
| Rollback is needed after cutover | Redeploy old service / Restore from backup | This is why you don't delete infrastructure immediately |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Discovery | Complete dependency map |
| Planning | Migration plan with owners and deadlines |
| Migration | Phased migration with validation at each phase |
| Cutover | Cutover runbook; rollback plan; monitoring period |
| Cleanup | Verification that all traces are removed |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Deleting the service before migrating traffic | Outage | Phase 4: Drain traffic to 0; verify for 1 week before Phase 5: Remove |
| Incomplete dependency discovery | Orphaned callers break after decommission | Spend at least 50% of the project time on discovery |
| No rollback plan | If something goes wrong, you're scrambling | Always have a rollback plan; test it before cutover |
| Skipping the monitoring period | Cutover looks clean, but a batch job fails at 3am | Monitor for 24–48 hours minimum; check all time windows |
| Forgetting non-code dependencies | DNS, secrets, dashboards, docs left behind | Use the cleanup checklist in Step 5 |

## This product's landing instance

*To be filled in with the most recent service decommissioning. Include the service name, the migration timeline, the dependency map, and the outcome.*