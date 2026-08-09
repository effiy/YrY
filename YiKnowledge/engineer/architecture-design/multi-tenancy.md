---
title: Multi-tenant Architecture Pattern / Multi-tenancy pattern
aliases: [multi-tenancy-pattern, multi-tenant-architecture-pattern, tenant-isolation-pattern]
tags: [engineering-pattern, architecture, multi-tenancy, isolation, saas]
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
benefit: "A single application instance serves multiple tenants with strict data isolation and per-tenant configurability"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided"
related:
 - ./caching.md
 - ./rate-limiting.md
 - ./zero-trust.md
 - ./api-gateway.md
 - ./database-sharding.md
 - ./connection-pooling.md
 - ./feature-flag.md
 - ./graceful-degradation.md
 - ../../product-manager/frameworks/prepare-a-product-strategy.md
 - ../strategies/prepare-a-zero-trust-strategy.md
 - ../../knowledge-curator/templates/thinking--first-principles.md
 - ../../knowledge-curator/templates/thinking--inversion.md
 - ../../knowledge-curator/templates/thinking--second-order-thinking.md
 - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Multi-tenant is not just sharing; it is a contract. Isolation + data + resource + quota + upgrade five dimensions; business-value driven; not one-shot; measurable
---

# Multi-tenant Architecture Pattern

> **As an** engineer, **I want to** multi tenancy, **so that** pattern applied consistently.

## Summary

- Multi-tenant = contract; not just sharing
- Isolation + data + resource + quota + upgrade five dimensions; no missing dimension
- Cover dedicated / shared-DB-per-tenant / shared-schema / shared-table multiple forms
- Links with zero-trust / api-gateway / database-sharding / rate-limiting / caching / feature-flag
- First principles / inversion / second-order / Occam's razor

## problem

In SaaS scenarios many customers share the same set of infrastructure, but must guarantee:

1. Data mutually invisible (tenant A cannot read tenant B's data)
2. Performance mutually non-interfering (tenant A's slow query cannot drag down tenant B)
3. Quota mutually non-crowding (tenant A's resource consumption cannot starve tenant B)
4. Upgrades mutually non-blocking (tenant A's schema upgrade cannot force tenant B to follow)
5. Faults mutually non-spreading (tenant A's fault cannot spread to tenant B)

Doing only one dimension is not enough: only data isolation but missing quota → big tenant crushes small tenant; only quota but missing upgrade → any upgrade causes total outage.

## Pattern

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class IsolationLevel(Enum):
 DEDICATED = "dedicated" # Independent DB + independent compute
 SHARED_DB_PER_TENANT = "shared_db_per_tenant" # Shared compute, each tenant independent DB/schema
 SHARED_SCHEMA = "shared_schema" # Shared DB/schema, tenant_id column isolation
 SHARED_TABLE = "shared_table" # Shared table, tenant_id row-level isolation (weakest)


@dataclass
class Tenant:
 tenant_id: str
 name: str
 tier: str # free / pro / enterprise
 isolation: IsolationLevel
 quota: "TenantQuota"
 feature_flags: dict[str, bool] = field(default_factory=dict)
 created_at: str = ""
 archived_at: Optional[str] = None


@dataclass
class TenantQuota:
 rps: int = 100 # requests per second
 concurrent: int = 10 # concurrent connections
 storage_mb: int = 1024
 bandwith_mb_per_min: int = 100
 seats: int = 5 # number of users


@dataclass
class TenantContext:
 """Tenant context spanning the full request lifecycle."""
 tenant_id: str
 isolation: IsolationLevel
 db_url: str # connection string determined by isolation
 cache_namespace: str # cache namespace
 trace_id: str

 @staticmethod
 def from_request(tenant_id: str, trace_id: str) -> "TenantContext":
 tenant = TenantRegistry.get(tenant_id)
 if tenant is None or tenant.archived_at:
 raise TenantNotFound(tenant_id)
 return TenantContext(
 tenant_id=tenant.tenant_id,
 isolation=tenant.isolation,
 db_url=_resolve_db_url(tenant),
 cache_namespace=f"t:{tenant.tenant_id}:",
 trace_id=trace_id,
 )


@dataclass
class TenantRegistry:
 """Tenant registry. All reads and writes go through here."""
 _by_id: dict[str, Tenant] = field(default_factory=dict)

 @classmethod
 def get(cls, tenant_id: str) -> Optional[Tenant]:
 return cls._by_id.get(tenant_id)

 @classmethod
 def register(cls, tenant: Tenant) -> None:
 if tenant.tenant_id in cls._by_id:
 raise TenantAlreadyExists(tenant.tenant_id)
 cls._by_id[tenant.tenant_id] = tenant

 @classmethod
 def archive(cls, tenant_id: str, at: str) -> None:
 t = cls._by_id.get(tenant_id)
 if t is None:
 raise TenantNotFound(tenant_id)
 t.archived_at = at


def _resolve_db_url(tenant: Tenant) -> str:
 """Resolve connection string by isolation level."""
 if tenant.isolation == IsolationLevel.DEDICATED:
 return f"postgres://dedicated-{tenant.tenant_id}@db-host:5432/tenant"
 if tenant.isolation == IsolationLevel.SHARED_DB_PER_TENANT:
 return f"postgres://shared@db-host:5432/tenant_{tenant.tenant_id}"
 # SHARED_SCHEMA / SHARED_TABLE: shared connection, but each SQL must carry tenant_id
 return "postgres://shared@db-host:5432/multi_tenant"


def enforce_tenant_in_sql(sql: str, ctx: TenantContext) -> str:
 """SHARED_SCHEMA/SHARED_TABLE must enforce tenant_id filter injection."""
 if ctx.isolation in (IsolationLevel.DEDICATED, IsolationLevel.SHARED_DB_PER_TENANT):
 return sql
 if "tenant_id" not in sql:
 raise TenantNotScoped(sql)
 if "WHERE" not in sql.upper():
 raise TenantNotScoped(sql)
 return sql


def check_quota(ctx: TenantContext, quota: TenantQuota) -> None:
 """Quota check (in-flight + per minute)."""
 key = f"{ctx.tenant_id}:rps"
 current = RateLimiter.current(key)
 if current >= quota.rps:
 raise QuotaExceeded(f"rps {current}/{quota.rps}")
 # concurrent / storage / bandwidth similar
```

Landing checklist:

1. **Isolation level**: DEDICATED > SHARED_DB_PER_TENANT > SHARED_SCHEMA > SHARED_TABLE; tier-based level
2. **Data isolation**: every SQL must carry tenant_id; SHARED_TABLE uses row-level security (RLS)
3. **Resource isolation**: connection pool / cache namespace / queue topic by tenant
4. **Quota**: RPS / concurrent / storage / bandwidth / seats; over limit 429 + Retry-After
5. **Upgrade**: schema upgrade by tenant gradual rollout; feature_flag control
6. **Fault**: bulkhead isolation; any tenant fault does not spread to others
7. **trace_id**: spans request → DB → cache → queue

## apply

- SaaS many customers sharing infrastructure
- B2B many organisations data isolation
- Internal many BUs sharing platform

## not apply

- Single-tenant private deployment (no multi-tenant mechanism needed)
- One-shot batch ETL / reports (no multi-tenant scenario)
- Internal tools with no SLA at all

## Landing checklist

- [ ] Isolation level decision matrix (tier × cost × compliance)
- [ ] TenantRegistry + TenantContext implementation
- [ ] SQL enforce tenant_id check (lint + runtime)
- [ ] RLS (Row Level Security) enabled (SHARED_TABLE)
- [ ] Quota middleware (RPS / concurrent / storage / bandwidth / seats)
- [ ] connection pool / cache namespace by tenant isolation
- [ ] feature_flag by tenant gradual rollout
- [ ] bulkhead isolate thread pool / connection pool
- [ ] audit_log includes tenant_id
- [ ] trace_id spans
- [ ] Archive process (archive instead of delete)

## Anti-patterns

- Shared table but SQL forgets tenant_id → data leak
- Shared cache but key does not contain tenant_id → cross-tenant read
- No quota → big tenant starves small tenant
- No bulkhead → one tenant fault shakes whole platform
- DEDICATED tier over-issued → resource waste
- Upgrade not gradual → any schema change causes total outage
- Archive treated as delete → data residue + audit fail
- tenant_id auto-increment integer → enumeration attack
- No trace_id → cross-tenant trace broken
- Shared admin interface skips tenant check → total leak
- Quota only watches RPS not concurrent → slow query drags down
- No RLS only application-layer check → any SQL concatenation error leaks all
- Upgrade cross-tier sync → free tier drags down enterprise
- No tenant-level audit log → compliance fail
- Cross-tenant join (OLAP outside)

## Related

- zero-trust: [./zero-trust.md](../quality-security/zero-trust.md) — tenants mutually do not trust
- api-gateway: [./api-gateway.md](./api-gateway.md) — entry quota
- database-sharding: [./database-sharding.md](./database-sharding.md) — by-tenant sharding
- rate-limiting: [./rate-limiting.md](../engineering/rate-limiting.md) — quota
- caching: [./caching.md](./caching.md) — namespace isolation
- feature-flag: [./feature-flag.md](../infrastructure/feature-flag.md) — gradual rollout
- graceful-degradation: [./graceful-degradation.md](./graceful-degradation.md) — bulkhead
- connection-pooling: [./connection-pooling.md](../infrastructure/connection-pooling.md) — pool isolation
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
