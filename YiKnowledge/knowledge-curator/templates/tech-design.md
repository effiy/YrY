---
title: Technical Design Template
aliases:
- tech-design-template
- technical-design-template
tags:
- template
- tech-design
- architecture
- interface
- data
- non-functional
category: knowledge-curator/templates
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: yearly
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
benefit: template reusable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./adr.md
- ./adr.md
- ./tech-selection-evaluation.md
- ./prd.md
- ../../README.md
tacit: false
---

# Technical Design Template

> **As a** knowledge curator, **I want to** tech design, **so that** template reusable.

> Distilled from internal technical design documentation; names, brands, internal API documentation platforms, and collaboration platform links have been removed so it can be used as a general template. Covers the full chain: business analysis -> architecture overview -> detailed design -> data design -> non-functional design -> risk and implementation plan.

## Summary

- Seven sections: Solution Overview -> Business Analysis -> Architecture Overview -> Detailed Design -> Data Design -> Non-functional Design -> Risk and Implementation
- Each section contains a field table + Markdown template, ready to copy and use
- New interfaces must include: performance monitoring, error code monitoring, error log monitoring, business monitoring design
- Revision record is required: version + content + author + modification time
- Accompanying ADR: major architecture decisions are written as a separate ADR; this solution references the ADR number

## Template body

```markdown
# {Project/Requirement} Technical Design

> Note: This template is distilled from internal technical design documentation; names, brands, internal API documentation platforms, and collaboration platform links have been removed so it can be used as a general template. All modification points can be marked in **red**, and new additions marked in **green**.

## Revision Record

| Version | Content | Author | Modified |
|---|---|---|---|
| V1.0 | New document | | |
| V1.1 | Partial adjustment | | |
| V1.2 | Add monitoring and alerting design | | |

## Solution Overview

Explain the purpose, scope, background, overall goals and significance of this solution. Briefly introduce the business scenario and expected benefits so readers can understand the core value without reading other chapters. A requirement PRD link may be attached.

## Business Analysis

### Unified Glossary

Centralise the definitions of terms involved in this solution to avoid ambiguity. Example:

| Name | Explanation |
|---|---|
| International segment unit price | International segment product unit price; divided into global, regional, general agent tiers, priority increases in turn, falls back to the upper tier if not configured |
| Non-international segment unit price | Non-international segment product unit price |

### Requirement Alignment

List the corresponding page, menu path, and subsystem function descriptions by business scenario. For example:

| Page | Scenario | Menu Path | Subsystem A Function Description | Subsystem B Function Description |
|---|---|---|---|---|
| Screenshot | Order status change record | Menu level 1 -> 2 -> 3 -> Tab-status track | 1. Log recording: record operation log when order status changes; 2. Log query: query log by order number with pagination, display by local time | 1. Operation log save interface; 2. Operation log query interface; 3. Order status change message |

### Business Use Cases

List relevant business use cases, recommended use case diagram (UML) + use case description table. Each use case includes: use case name, participating roles, trigger condition, main flow, exception flow, post-condition. Highlight newly added/modified/deleted use cases.

### Conceptual Model

Use domain modelling (class diagram / ER model / domain object relationship diagram) to describe core entities, attributes and relationships. The conceptual model of the whole service is maintained in a separate link; update it iteratively when changes occur.

### Business Process

Draw a business process diagram, explain the start point, end condition, main steps, branch logic, and external system interaction points. Newly added/modified/deleted nodes may be marked.

## Architecture Overview Design

### System Architecture Overview

Provide an overall architecture view (layered architecture diagram / microservice architecture diagram / deployment topology), and explain the modules and services involved in this system and their interaction methods. The fixed part is retained as a template; each requirement only adds or modifies the modules involved.

### System Interaction Diagram / Microservice Sequence Diagram

Draw as needed. Recommended to reference the "end-to-end system interaction breakdown" style template, covering cross-subsystem chains.

### Module Function Description and Dependencies

Explain the involved modules and their function changes (added/modified/deprecated) one by one; a table may list module name, responsibility, interface dependency, and call direction.

### State Machine (optional)

Provide a state machine diagram for state-transition type business.

### External Systems and Interface Dependencies

**Depends on external interfaces:**

| No. | Interface Description | External System | Call Method | API Doc | Auth Method | Timeout | Error Strategy | Idempotent |
|---|---|---|---|---|---|---|---|---|
| 1 | xxx | Fulfilment system | http/mq | link | hmac/token | 30s | return failure; retry on failure | |

**Provides external interfaces:**

| No. | Interface Description | Calling System | Call Method | API Doc | Auth Method | Timeout | Performance QPS | Performance RT | Sync-receive-async-process | Idempotent |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | yyy | Fulfilment system | http/mq | link | hmac/token | 30s | 10 QPS | Target RT | receive data first, process business logic asynchronously | |

## Detailed Design

### Interface Design

| No. | System | Market | Interface Description | Link | New/Update | Note |
|---|---|---|---|---|---|---|
| 1 | User system | Region A | User query | link | Update | New field xxx |

Rules:
1. Use the unified API documentation platform for interface management.
2. Enum-type fields must list all type definitions; if different enums cause param/return param differences, they must be explained.
3. The mandatory nature of non-required fields in different business scenarios must be clearly noted.
4. Fields that strongly depend on prior interfaces must be marked with their source (e.g. the verification code of the login interface comes from the verification-code sending interface).
5. List error codes and meanings returned on exceptions.

### Sequence Design

Draw sequence diagrams for key business processes, showing the call chain, sequence order, concurrency points, and sync/async call methods. Explain performance bottlenecks and optimisation points (sequence diagrams between internal classes).

Requirements:
1. Sequence diagrams must include all business branches and exception returns for test coverage.
2. Batch data must explain whether it is processed in a loop or in a single batch, and explain the performance impact.
3. When requirements are updated, the modified parts in the sequence diagram must be marked in red.
4. Ambiguous complex business logic and algorithms must be noted and explained.

### Consistency Design (optional)

Explain the distributed transaction solution (SAGA / compensation / eventual consistency), compensation event format and trigger conditions, and give failure scenarios and recovery steps.

### Async / Event Design (optional)

List the event inventory, each event's JSON Schema, topic name, versioning strategy, consumption semantics (at-least-once / at-most-once), retry and DLQ strategy, and monitoring metrics.

## Data Design

### Data Model / ER Diagram

Provide an ER diagram, marking primary keys / foreign keys / relationship types and data owners. No need to mark all fields; having core fields and clearly expressing table relationships is enough. The data model of the whole service is maintained in a separate link.

### Data Model Changes

DDL of newly added/modified/deleted data tables, including field name, type, length, default value, index, constraints.

```sql
CREATE TABLE IF NOT EXISTS `account_encrypt_field_data` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'update time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='Account encrypted field original value';

-- 1. Do not define CHARSET=utf8mb4 and COLLATE=utf8mb4_0900_ai_ci in the DDL; the DBA defines them at the whole-database level
-- 2. Table fields and table names must add COMMENT
```

### Storage Plan

Sharding / partitioning strategy, index design. Selection: MySQL / Redis / ES / big data.

### Data Dictionary

Build a data dictionary for involved table fields, clarifying field meaning, value range, unit, and business description.

### Data Migration Plan

Explain the migration strategy, scripts, execution steps, and rollback plan.
1. Migration method: DRS sync / SQL script / interface/scheduled task; real-time migration / downtime migration.
2. Execution time: before or after launch, and scope of impact.

## Non-functional Design

### Security Requirements

Explain requirements for data security, access control, encrypted transmission, and audit logs.

### High Availability and Disaster Recovery Requirements

List requirements for availability, failover, disaster recovery switching, and backup restoration.

### Operability

Monitoring, alerting, logging, health check requirements, and any new ops scripts or tools needed.

> New interfaces must include: performance monitoring, error code monitoring, error log monitoring, business monitoring design.

### Data Tracking

Track PV/UV and other data tracking points.

## Risks and Constraints

List possible risks (technical / business / resource) and constraints, and give mitigation measures.

1. **Business risk**: unclear business items, points that may affect test submission.
2. **Resource risk**: work scheduling; whether the normal workload matches the actually achievable workload.
3. **Technical risk**:
   - Involving thread context; evaluate whether child threads depend on it.
   - Whether high-frequency interface calls or scheduled tasks will heavily consume memory/CPU.
   - Involving external calls; evaluate the impact and compensation plan of call failures.
   - Technical solution uncertain, or new technology needs to be researched.

## Implementation Plan

Explain the development, testing, and launch plan; list main milestones, personnel division, and dependencies.

1. Developers:
2. Testers:
3. Test submission date:
4. Launch date:
5. Use case review date:
6. Code CR date:
7. Smoke test time:
8. Joint debugging time:
```

## Field Explanation

| Section | Required | Rule |
|---|---|---|
| Revision record | Yes | Version + content + author + time |
| Solution overview | Yes | purpose / scope / background / benefits |
| Unified glossary | Yes | Term definition table |
| Requirement alignment | Yes | Scenario + page + subsystem function |
| Business use cases | Yes | Use case diagram + description table |
| Conceptual model | Yes | Class diagram / ER diagram |
| Business process | Yes | Process diagram + start/end + branches |
| System architecture overview | Yes | Layered / microservice / deploy topology |
| Module function description | Yes | Module + responsibility + dependencies |
| External system dependencies | Yes | Dependencies + provide two-way table |
| Interface design | Yes | No. + system + description + link |
| Sequence design | Yes | Key process sequence diagram |
| Consistency design | Optional | Distributed transaction solution |
| Async event design | Optional | Event inventory + Schema + DLQ |
| Data model | Yes | ER diagram + data owner |
| DDL changes | Yes | Fields + type + index + COMMENT |
| Storage plan | Yes | Sharding + selection |
| Data migration | As needed | Strategy + script + rollback |
| Security requirements | Yes | Data / access / encryption / audit |
| High availability | Yes | Availability / disaster recovery / backup |
| Operability | Yes | Monitoring / alerting / logs / health check |
| Data tracking | Recommended | PV / UV |
| Risks and constraints | Yes | Business / resource / technical |
| Implementation plan | Yes | Milestones + personnel + dates |

## Usage Suggestions

- The seven sections have a fixed order and cannot be swapped: Business analysis -> architecture overview -> detailed design -> data -> non-functional -> risk -> implementation
- The revision record must be filled in every update for traceability
- Mark modifications in **red** and new additions in **green** for easy review
- New interfaces must have four monitoring items: performance / error codes / error logs / business monitoring
- Do not define CHARSET and COLLATE at the table level in DDL; the DBA defines them at the whole-database level
- Table fields and table names must add COMMENT
- Major architecture decisions are written as a separate ADR; this solution references the ADR number
- Accompanying selection evaluation: [tech-selection-evaluation-template.md](./tech-selection-evaluation.md)
- PR review date and code CR date are listed separately to avoid confusion

## Anti-patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Skipping business analysis | Writing architecture directly | Unified glossary + requirement alignment + use cases required |
| Interface design without link | Maintained outside the documentation platform | Unified API documentation platform |
| DDL without COMMENT | Field meaning lost after half a year | Table + field must add COMMENT |
| No sequence diagram | Complex process relies on text | Key process must draw sequence diagram |
| Non-functional section omitted | Monitoring added after launch | New interface must have four monitoring items |
| No data migration plan | Data loss on launch | Fill strategy + rollback as needed |
| Risk section only says "none" | Risk under-reported | Business / resource / technical three dimensions required |

## Related

- ADR template: [adr-template.md](./adr.md)
- ADR summary: [adr-summary.md](./adr.md)
- Selection evaluation: [tech-selection-evaluation-template.md](./tech-selection-evaluation.md) / [tech-selection-evaluation-summary.md](./tech-selection-evaluation.md)
- PRD template: [prd.md](./prd.md)
- Review process: [../../product-manager/processes/tech-review.md](../../product-manager/delivery/tech-review.md)
