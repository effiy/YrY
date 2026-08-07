---
title: Cell-based architecture pattern / Cell-based architecture pattern
aliases: [cell-based-architecture-pattern, cell-based-pattern, cell-architecture]
tags: [engineering-pattern, architecture, organization, team-topologies, ddd]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: pattern
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "System is partitioned into isolated failure cells so that blast radius is bounded and predictable"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./micro-frontends.md
 - ./api-gateway.md
 - ./anti-corruption-layer.md
 - ./bff.md
 - ./cqrs.md
 - ./event-driven-architecture.md
 - ./zero-trust.md
 - ./aggregator.md
 - ./saga.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A cell is not just a service split; it is a contract. cell + endpoint + component + autonomy + data — five dimensions; business-value driven; not one-shot; measurable
---

# Cell-based architecture pattern

> **As an** engineer, **I want to** cell based architecture, **so that** pattern applied consistently.

## Summary

- Cell = contract; not just a service split
- cell + endpoint + component + autonomy + data — five dimensions; no missing dimension
- business-value driven; not by feel
- covers cell / endpoint / component / data ownership — multiple forms
- links with micro-frontends + api-gateway + anti-corruption-layer + bff + cqrs + event-driven + zero-trust + aggregator + saga
- publicly accessible; not hidden
- first principles / inversion / second-order / Occam's razor

## Problem

Traditional microservices in large organizations show:

- Service granularity chaos — one team owns 50 services, no one person can remember them all
- Service boundary and team boundary mismatch — cross-team changes to one capability need to coordinate N services
- Data ownership fragmented — the same business concept is writable by N services, data inconsistency
- End-to-end capability unlocatable — user journey crosses many services, no owner findable
- Platform vs business vs endpoint services mixed — teams don't know whether they are Platform or business

Inversion: if team < 5 services / business domain < 3 / no cross-team collaboration friction, introducing cells is over-engineering; first modularize a monolith.

## Pattern

```python
from dataclasses import dataclass, field
from typing import Callable

@dataclass
class Cell:
 """Cell: autonomous business unit; owns endpoints + components + data + deployment"""
 name: str # billing-cell / catalog-cell / order-cell
 owner_team: str
 business_domain: str
 endpoints: list["Endpoint"]
 components: list["Component"]
 data_stores: list["DataStore"]
 acl: "ACL" # inbound/outbound boundary translation
 deploy_independent: bool = True
 sla: dict = field(default_factory=dict)

@dataclass
class Endpoint:
 """Externally exposed API; the cell's only outward contract"""
 path: str # /api/v1/billing/*
 method: str
 auth: str # JWT / mTLS / API key
 rate_limit: str # 100 rps
 contract_test: str # baseline file path
 owner_cell: str

@dataclass
class Component:
 """Component inside a cell; independently deployable; not exposed outward"""
 name: str
 type: str # api / worker / scheduler / ui
 deploy_unit: str
 tech_stack: str

@dataclass
class DataStore:
 """Cell-owned data; other cells do not read/write directly"""
 kind: str # postgres / mongo / redis / s3
 scope: str # owner_cell name
 access_mode: str # "private" # only accessible via Endpoint

class ACL:
 """Anti-corruption layer: cell boundary translation; no bidirectional dependency"""
 def __init__(self, inbound_translators: dict, outbound_translators: dict):
 self._in = inbound_translators # external DTO → internal domain
 self._out = outbound_translators # internal domain → external DTO

class CellRegistry:
 """Cell registry; routing + discovery + governance"""
 def __init__(self):
 self._cells: dict[str, Cell] = {}
 def register(self, cell: Cell) -> None:
 # validate: endpoint path not conflicting / data store scope unique / owner_team non-empty
 for ep in cell.endpoints:
 for existing in self._cells.values():
 for existing_ep in existing.endpoints:
 if ep.path == existing_ep.path:
 raise ValueError(f"endpoint collision: {ep.path}")
 self._cells[cell.name] = cell
 def route(self, path: str) -> Cell | None:
 for cell in self._cells.values():
 if any(ep.path.rstrip("*") in path for ep in cell.endpoints):
 return cell
 return None
 def discover(self, business_domain: str) -> list[Cell]:
 return [c for c in self._cells.values() if c.business_domain == business_domain]
```

### Five dimensions

1. **Cell** — autonomous business unit; owns endpoints + components + data + deployment; team autonomy
2. **Endpoint** — only outward contract; API path + auth + rate-limit + contract test; cell's only outward exposure
3. **Component** — independently deployable inside the cell; api / worker / scheduler / ui; not exposed outward
4. **Autonomy** — team owns the full stack; independent repo / CI / CD / deploy / rollback / SLO
5. **Data** — cell-owned data store; other cells do not read/write directly; only via Endpoint or event subscription

## Applicable

- Large organization (≥5 teams) with multiple business domains
- Team boundary aligned with business domain (forward Conway's Law)
- Frequent cross-domain collaboration + strong data-ownership need
- Platform / business / endpoint team layered governance
- Multi-region / multi-tenant SaaS

## Not applicable

- Small team / single business domain — over-engineering
- Single region / single tenant — monolith suffices
- Team lacks DevOps capability — cells require independent deployment
- Business domain boundary fuzzy — cell split is hard
- Strong consistency cross-domain transactions — saga complexity exceeds revenue

## Landing checklist

1. **Cell split** — by business domain + team boundary; not by tech layer (don't split api-cell / db-cell)
2. **Endpoint SSOT** — every cell's outward endpoint has a unique path; no conflict; contract baseline
3. **Component layering** — api / worker / scheduler / ui independently deployable inside cell; not exposed outward
4. **Data ownership** — cell owns its data store; others don't read/write directly; only via Endpoint or event
5. **ACL boundary** — inbound / outbound translation; external DTO ↔ internal domain; no bidirectional dependency
6. **Autonomous team** — own repo / CI / CD / deploy / rollback / SLO / on-call
7. **Platform layer** — Platform team provides platform capabilities (auth / observability / data-plane); cells consume
8. **Event bus** — cross-cell async communication; publish / subscribe; no direct RPC
9. **Aggregate layer** — aggregator / BFF / gateway aggregates across cells; contains no business rules
10. **Zero trust** — mTLS between cells + every request validation; no IP trust
11. **Observe** — every cell independent RUM + trace_id spans end-to-end + business metric + SLO
12. **Contract QA** — endpoint baseline run both ways; schema evolution double run
13. **Cell registry** — routing + discover + governance; endpoint path no conflict
14. **Governance** — cell lifecycle cadence + launch / deprecate / merge / split process

## Anti-patterns

- Cell split by tech — api-cell / db-cell loses business autonomy
- Endpoint path conflict — routing partial failure
- Data ownership fuzzy — cross-cell direct read/write; data inconsistency
- ACL bidirectional dependency — compile-time coupling; independent deploy fails
- Cell contains cross-domain business rules — should only own a single business domain
- Cross-cell direct RPC — sync coupling; should use event or aggregator
- Cell shares data store — regresses to distributed monolith
- Platform layer contains business — Platform loses reusable property
- Cell not independently deployable — team loses autonomy
- No contract QA — cells escalate contract downstream unknown; runtime crash
- No trace_id — cross-cell trace breaks
- Cell boundary = team boundary not aligned — reverse Conway's Law; collaboration friction big

## Related

- [micro-frontends-pattern.md](./micro-frontends.md) — frontend cell-ization; shell + remote co-build
- [api-gateway-pattern.md](./api-gateway.md) — gateway aggregates many cell endpoints
- [anti-corruption-layer-pattern.md](./anti-corruption-layer.md) — cell inbound/outbound boundary ACL
- [bff-pattern.md](./bff.md) — each client independent BFF; cells consume
- [cqrs-pattern.md](./cqrs.md) — read/write split inside cell
- [event-driven-architecture-pattern.md](./event-driven-architecture.md) — async communication between cells
- [zero-trust-pattern.md](../quality-security/zero-trust.md) — zero trust between cells
- [aggregator-pattern.md](./aggregator.md) — cross-cell aggregation
- [saga-pattern.md](./saga.md) — cross-cell long transactions
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
