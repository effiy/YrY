---
title: Audit logging pattern / Audit logging pattern
aliases: [audit-logging-pattern, audit-trail-pattern, compliance-logging-pattern]
tags: [engineering-pattern, observability, compliance, security, audit]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "All system actions are recorded in an immutable audit trail, enabling compliance, forensics, and anomaly detection"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - at least one concrete example or code snippet is provided
related:
  - ./zero-trust.md
  - ../../oncall-sre/incident-response/do-a-security-audit.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Audit log is not just log; it is a contract. Subject + action + object + time + tamper-proof five dimensions; compliance-value driven; not one-shot; measurable
---

# Audit logging pattern

> **As an** engineer, **I want to** audit logging, **so that** pattern applied consistently. 

## Summary

- Audit log = contract; not just log
- Subject + action + object + time + tamper-proof five dimensions; no missing dimension
- Covers read / write / admin / consent / data-export multi-action
- Links with observability / distributed-tracing / zero-trust / outbox / event-sourcing / cdc
- First principles / inversion / second-order / Occam's razor

## Question

Compliance and security scenarios require answers: 

1. Who did what operation on what data at what time? (who/when/what/which)
2. Can these logs be trusted by third parties (regulators / courts / auditors)?
3. Have the logs been tampered with? Can tampering be discovered?
4. Can they still be looked up three years later?
5. Can a complete chain be assembled across systems and teams?

Regular application logs (INFO/DEBUG) cannot answer — arbitrary structure, writable, short retention, no subject context, broken across systems. 

## Pattern

```python
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Optional


class AuditAction(Enum):
    CREATE = "create"
    READ = "read"              # sensitive data read
    UPDATE = "update"
    DELETE = "delete"
    EXPORT = "export"          # data export
    GRANT = "grant"            # permission grant
    REVOKE = "revoke"
    LOGIN = "login"
    LOGOUT = "logout"
    CONSENT = "consent"        # user consent
    ADMIN = "admin"            # admin operation


class Outcome(Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    DENIED = "denied"


@dataclass
class AuditEvent:
    """An immutable audit event."""
    event_id: str                       # UUID, for dedup
    timestamp: str                      # ISO8601 UTC
    actor_type: str                     # user / service / system
    actor_id: str                       # subject ID
    actor_tenant_id: Optional[str]      # required for multi-tenant scenarios
    action: AuditAction
    outcome: Outcome
    resource_type: str                  # object type: customer / order / pii_record
    resource_id: str                   # object ID
    request_ip: str
    request_ua: str
    trace_id: str                       # cross-system tracing
    session_id: Optional[str] = None
    reason: Optional[str] = None        # business reason
    before: Optional[Any] = None        # value before update
    after: Optional[Any] = None         # value after update
    signature: str = ""                 # tamper-proof signature
    prev_hash: str = ""                 # previous entry in hash chain


@dataclass
class AuditLogger:
    """Audit log writer. append-only + hash chain + async outbox."""
    sink: str                          # audit-store / s3 / lakehouse
    signing_key: str
    _prev_hash: str = "GENESIS"

    def log(self, ev: AuditEvent) -> None:
        ev.prev_hash = self._prev_hash
        ev.signature = self._sign(ev)
        self._append(ev)
        self._prev_hash = ev.signature

    def _sign(self, ev: AuditEvent) -> str:
        payload = f"{ev.event_id}|{ev.timestamp}|{ev.actor_id}|{ev.action.value}|{ev.resource_type}|{ev.resource_id}|{ev.outcome.value}|{ev.prev_hash}"
        return hmac_sha256(self.signing_key, payload)

    def _append(self, ev: AuditEvent) -> None:
        # 1. sync outbox table (atomic with business transaction)
        Outbox.insert(ev)
        # 2. async delivery to sink (no retry no loss)
        # outbox publisher guarantees at-least-once + idempotency by event_id

    def verify_chain(self, events: list[AuditEvent]) -> bool:
        """Called during third-party audit: verify hash chain is intact."""
        prev = "GENESIS"
        for ev in events:
            expected = self._sign(ev_with_prev(ev, prev))
            if ev.signature != expected:
                return False
            prev = ev.signature
        return True


@dataclass
class AuditQuery:
    """Audit query: by subject / object / time / action."""
    actor_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: Optional[AuditAction] = None
    tenant_id: Optional[str] = None
    from_ts: Optional[str] = None
    to_ts: Optional[str] = None

    def execute(self) -> list[AuditEvent]:
        # queries go to read-only replica + columnar storage (separated from business DB)
        return AuditStore.query(self)


def audit_middleware(handler):
    """Decorator: automatically writes audit logs for sensitive endpoints."""
    def wrapped(req):
        actor = req.principal
        resource_type = req.route.audit_resource
        outcome = Outcome.SUCCESS
        try:
            resp = handler(req)
            if resp.status >= 400:
                outcome = Outcome.FAILURE
            return resp
        except PermissionDenied:
            outcome = Outcome.DENIED
            raise
        finally:
            AuditLogger.log(AuditEvent(
                event_id=uuid4(),
                timestamp=datetime.utcnow().isoformat(),
                actor_type=actor.type,
                actor_id=actor.id,
                actor_tenant_id=actor.tenant_id,
                action=req.route.audit_action,
                outcome=outcome,
                resource_type=resource_type,
                resource_id=req.resource_id,
                request_ip=req.ip,
                request_ua=req.ua,
                trace_id=req.trace_id,
                session_id=actor.session_id,
            ))
    return wrapped
```

Implementation checklist: 

1. **Append-only**: audit log only appends; no modify, no delete
2. **Hash chain**: prev_hash + signature; tampering immediately breaks the chain
3. **Outbox**: atomic with business transaction; async delivery
4. **Columnar storage**: separated from business DB; query by column
5. **Retention**: compliance requirements (GDPR 6 years / SOX 7 years / HIPAA 6 years) 
6. **Export**: third-party-readable formats (CSV / JSON / Parquet) 
7. **Cross-system**: trace_id chaining; can assemble full chain by subject / object
8. **Dedup**: event_id idempotent

## Applicable

- Financial transactions, healthcare records, PII access
- Permission changes, admin operations
- Data exports, user consent
- Compliance requirements (GDPR / SOX / HIPAA / SOC2) 

## Not applicable

- Performance debug logs (INFO/DEBUG) 
- Business metric statistics (use metrics not audit) 
- Ad-hoc troubleshooting logs

## Implementation checklist

- [ ] AuditEvent + AuditLogger implementation
- [ ] Hash chain (prev_hash + signature) 
- [ ] Outbox table atomic with business transaction
- [ ] Async publisher delivers to audit-store
- [ ] Columnar storage (partitioned by actor / resource / time) 
- [ ] Retention strategy (by compliance requirement) 
- [ ] Export tool (CSV / JSON / Parquet) 
- [ ] Decorator / interceptor covers sensitive endpoints
- [ ] Cross-system trace_id chaining
- [ ] event_id dedup
- [ ] Third-party verification tool (verify_chain) 
- [ ] Read-only replica (queries do not impact business) 

## Anti-patterns

- Logs can be modified/deleted -> audit distortion
- No hash chain -> tampering cannot be detected
- Separate from business transaction writes -> log loss
- No trace_id -> cross-system breakage
- INFO/DEBUG as audit -> arbitrary structure
- Write to primary DB only -> queries pressure business
- No retention strategy -> cannot look up three years later
- No export -> third-party trust failure
- Mixed across tenants -> mutual leakage
- Missing actor_id -> don't know who did it
- before/after full field dump -> PII leak
- Sync write to primary DB -> business slows down
- No event_id -> immediate retry duplicates
- No outcome -> don't know if it succeeded
- Only success recorded, no failure/denied -> attack attempts invisible

## Related

- observability: [./observability.md](../engineering/observability.md) — metrics / logs / traces triad
- distributed-tracing: [./distributed-tracing.md](../engineering/distributed-tracing.md) — trace_id chaining
- zero-trust: [./zero-trust.md](./zero-trust.md) — default not trust
- outbox: [./outbox.md](../infrastructure/outbox.md) — atomic with business transaction
- event-sourcing: [./event-sourcing.md](../architecture-design/event-sourcing.md) — event as state
- cdc: [./cdc.md](../engineering/cdc.md) — async delivery
- multi-tenancy: [./multi-tenancy.md](../architecture-design/multi-tenancy.md) — tenant_id required
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
