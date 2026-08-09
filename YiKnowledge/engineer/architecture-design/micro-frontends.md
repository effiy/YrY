---
title: Micro-frontends pattern / Micro-frontends pattern
aliases: [micro-frontends-pattern, mfe-pattern, micro-frontend-architecture]
tags: [engineering-pattern, frontend, architecture, composition, isolation]
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
benefit: "Teams independently develop, test, and deploy frontend modules without cross-team coordination bottlenecks"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./bff.md
  - ./api-gateway.md
  - ./anti-corruption-layer.md
  - ./ssot-view-layer.md
  - ./graceful-degradation.md
  - ./strangler-fig.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Micro-frontends is not just splitting the shell; it is a contract. Shell + remote + isolation + composition + routing + governance five dimensions; business-value driven; not one-shot; measurable
---

# Micro-frontends pattern

> **As an** engineer, **I want to** micro frontends, **so that** pattern applied consistently.

## Summary

- Micro-frontends = contract; not just splitting the shell
- Shell + remote + isolation + composition + routing + governance six dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers module-federation / single-spa / qiankun / web-components / iframe multiple forms
- Links with BFF + api-gateway + anti-corruption-layer + ssot-view-layer + feature-flag + canary + strangler
- Publicly queryable; not hidden
- First principles / inversion / second-order / Occam

## Problem

As the monolithic frontend grows with more teams / business lines:

- Build / publish coupling — one team changes one line, everyone rebuilds / deploys
- Tech stack bundled — React 15 to 18 upgrade must sync everyone
- Team boundary doesn't match code boundary — one repo, multiple teams, frequent conflicts
- Large blast radius — one bug impacts all pages
- Performance degradation — single bundle grows, first paint slower

Inversion thinking: if teams < 3 / business lines < 3 / no independent deploy need, micro-frontends is over-engineering; monolith + module-based is enough.

## Pattern

```python
from dataclasses import dataclass, field
from typing import Callable, Awaitable

@dataclass
class RemoteApp:
    name: str
    entry: str  # URL to remoteEntry.js / manifest
    route_prefix: str  # /pet/* / /aicr/*
    css_scope: str  # shadow DOM / CSS modules scope
    independent_deploy: bool = True
    version: str = "latest"
    fallback_html: str = "<div>loading...</div>"

class MicroFrontendShell:
    """Shell: route dispatch + remote loading + isolation + shared contract"""
    def __init__(self, remotes: list[RemoteApp]):
        self._remotes = {r.name: r for r in remotes}
        self._loaded: dict[str, object] = {}
        self._event_bus = EventBus()

    async def mount(self, name: str, mount_point: str, props: dict) -> None:
        if name not in self._loaded:
            remote = self._remotes[name]
            try:
                module = await self._load_remote(remote)
            except Exception as e:
                # Degrade: remote load failure -> fallback HTML; do not block the whole page
                document.getElementById(mount_point).innerHTML = remote.fallback_html
                return
            self._loaded[name] = module
        # Shared contract: user / theme / i18n / feature-flag / trace_id
        ctx = ShellContext(user=props.get("user"),
                           theme=props.get("theme"),
                           i18n=props.get("i18n"),
                           flags=props.get("flags"),
                           trace_id=props.get("trace_id"),
                           event_bus=self._event_bus)
        await self._loaded[name].mount(mount_point, ctx)

    async def unmount(self, name: str, mount_point: str) -> None:
        if name in self._loaded:
            await self._loaded[name].unmount(mount_point)

    async def _load_remote(self, remote: RemoteApp):
        # module federation / systemjs / import() — choose by tool
        url = f"{remote.entry}?v={remote.version}"
        return await dynamic_import(url)

@dataclass
class ShellContext:
    """shell -> remote shared contract; no business rules"""
    user: dict
    theme: str
    i18n: dict
    flags: dict
    trace_id: str
    event_bus: "EventBus"

class EventBus:
    """Cross-remote communication; publish / subscribe; no direct calls"""
    def __init__(self):
        self._handlers: dict[str, list[Callable]] = {}
    def on(self, event: str, handler: Callable) -> None:
        self._handlers.setdefault(event, []).append(handler)
    async def emit(self, event: str, payload: dict) -> None:
        for h in self._handlers.get(event, []):
            await h(payload)
```

### Six dimensions

1. **Shell** — container / route dispatch / remote loading / shared contract (user / theme / i18n / flags / trace_id); no business
2. **Remote** — independent repo / independent build / independent deploy / independent tech stack (React / Vue / Solid)
3. **Isolation** — CSS / DOM / state / dependencies isolation; shadow DOM or CSS modules or scoped class
4. **Composition** — multiple remotes on same screen + route-level / component-level composition + shared contract passing
5. **Routing** — route prefix dispatch (/pet/* -> pet-shell; /aicr/* -> aicr-shell) + history API coordination
6. **Governance** — version negotiation + shared dependencies (react / react-dom singleton) + independent deploy + independent rollback + feature flag traffic cut

## Applicable

- Multiple teams (>=3) developing different business domains in parallel
- Each business line has independent deploy cadence / independent SLO
- Cross tech-stack consolidation (merging legacy Vue + new React)
- Large portal aggregating multiple sub-apps
- Gradual migration of legacy (with strangler-fig)

## Not applicable

- Single team / single business line — over-engineering
- Strongly consistent interaction pages (frequent cross-remote communication on same screen) — communication cost exceeds benefit
- SEO key pages — CSR remote loading is unfriendly to SEO
- Strict first-paint < 200ms scenarios — remote loading extra RTT
- Team without DevOps capability — independent deploy pipeline unmaintained

## Landing checklist

1. **Shell selection** — self-built shell + module-federation / single-spa / qiankun / Web Component host
2. **Remote boundary** — split by business domain, not by page; domain is autonomous
3. **Shared contract** — ShellContext SSOT; user / theme / i18n / flags / trace_id; no business
4. **Route dispatch** — route prefix + history API; no hardcoded URLs
5. **CSS isolation** — shadow DOM / CSS modules / scoped class / BEM prefix
6. **State isolation** — each remote manages its own state; no cross-remote direct read / write
7. **Cross-remote communication** — EventBus pub / sub; no direct calls; no shared store
8. **Shared dependencies** — react / react-dom / lodash singletons; version negotiation + singleton OR singletonOrHigher
9. **Independent deploy** — each remote independent CI / CD; shell can switch traffic without release
10. **Independent rollback** — remote independent version + independent rollback + feature flag cut back
11. **Load degradation** — remote load failure -> fallback HTML / skeleton; do not block whole page
12. **Load performance** — preload key remote + lazy secondary + cache busting
13. **Observation** — each remote independent RUM + trace_id end-to-end + error boundary
14. **Contract test** — shell <-> remote contract baseline; schema evolution dual-run
15. **Security** — remotes do not trust each other; CSP restrictions; postMessage origin verification

## Anti-patterns

- Shell contains business rules — should only do dispatch + load + isolation
- Shared store — reverts to monolith; state strongly coupled
- Cross-remote direct calls — compile-time coupling; independent deploy failure
- Shared dependencies without singleton — react multiple versions / instances; hooks crash across instances
- CSS not isolated — style pollution; overwriting each other
- Hardcoded routes — adding a new remote must modify shell; should be config-driven
- Remote loading without fallback — one remote down takes the whole page
- Not independently deployed — reverts to monolith + multiple repos; loses core value
- Not independently rolled back — one remote bug forces everyone to roll back
- Shell and remote in same repo — build coupling; loses independent deploy
- No contract test — shell upgrades contract remote doesn't know; runtime crash
- No trace_id — cross-remote chain broken
- Direct iframe — communication hard / SEO poor / performance poor; only for fully independent third parties

## Related

- [bff-pattern.md](./bff.md) — each remote pairs with a BFF; frontend-backend co-build
- [api-gateway-pattern.md](./api-gateway.md) — gateway aggregates multiple remote backends
- [anti-corruption-layer-pattern.md](./anti-corruption-layer.md) — remote <-> remote ACL
- [ssot-view-layer.md](./ssot-view-layer.md) — view layer SSOT; remote does not redefine
- [contract-test-baseline.md](../quality-security/contract-test-baseline.md) — shell <-> remote contract baseline
- [feature-flag.md](../infrastructure/feature-flag.md) — remote independent traffic cut
- [canary-deployment-pattern.md](../infrastructure/canary-deployment.md) — remote independent canary
- [strangler-fig-pattern.md](./strangler-fig.md) — legacy frontend strangle replacement
- [graceful-degradation.md](./graceful-degradation.md) — remote load failure degradation
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
