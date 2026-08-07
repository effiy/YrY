---
title: Handle secrets and config
aliases:
- I want to manage secrets and config
- secrets-config-journey
- secrets management entry
- environment config entry
tags:
- journeys
- secrets
- config
- env-vars
- vault
- rotation
- least-privilege
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./harden-supply-chain.md
- ../../executive/strategy/handle-data-compliance.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to handle secrets and config

> **As an** engineer, **I want to** handle secrets and config, **so that** incident is contained. 

> "How to manage secrets / config / environment variables / credential rotation / least privilege" reach vault + env layering + rotation + audit + compliance within 2 hops. 

## Summary

- Layering follows env (public config) + secret (sensitive credential) + vault (dynamic secrets) 
- Rotation follows [work/processes/secret-rotation-process](../process/README.md) + quarterly audit
- Compliance follows [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md)
- Least privilege follows [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md)

## Core viewpoints

**Secrets in environment variables are secrets in plain text.** Environment variables are visible to every process that inherits the parent process's environment, every debugging tool that dumps the process state, and every error reporting library that captures the environment. A secret that enters the environment has already leaked to a wider audience than intended. The only acceptable location for secrets is a dedicated secret manager that authenticates the requesting service and never exposes the secret to the process environment.

**Least privilege is not a security feature; it is the default state.** Every service should start with zero permissions and request only what it needs. The question is not "why shouldn't this service have access" but "why should it." A service that has read-write access to a database it only reads from is a write accident waiting to happen. A service that has access to secrets it does not use is a leak vector with no compensating benefit.

**Credential rotation must be automated, not scheduled.** A quarterly reminder to rotate credentials means the rotation happens quarterly at best, and in practice, it does not happen at all. Automated rotation with a dual-key system (old key and new key both valid during the rotation window) eliminates the human bottleneck and the service interruption risk. If rotation is not automated, it is not happening.

**The blast radius of a leaked secret is determined by the scope of the secret, not by the speed of the response.** A leaked database admin credential that grants access to all databases is a catastrophe regardless of how quickly it is rotated. A leaked service-specific credential with read-only access to one table is a minor incident. The secret hierarchy should be designed so that no single secret can compromise the entire system.

**Config and secrets must be in separate channels with separate access controls.** Config (URLs, ports, feature flags) changes frequently and can be broadly visible. Secrets (API keys, DB passwords, tokens) change rarely and must be tightly restricted. When config and secrets are stored in the same file or the same environment, the access control is the union of both requirements, which means secrets are overexposed.

## Key info

- **Secret storage hierarchy**: Level 0 (hardcoded in source code -- worst, detectable by regex scan), Level 1 (`.env` file -- gitignored but still plain text on disk, leaked by backup, IDE, and screen sharing), Level 2 (environment variables injected at runtime -- visible to child processes, crash dumps, and monitoring tools), Level 3 (secret manager like HashiCorp Vault, AWS Secrets Manager, or Doppler -- secrets never touch the filesystem, authenticated per-service, rotation built-in). The Yi family currently operates at Level 1-2 (`.env` + `config.yaml`); Level 3 is the target for production deployments.
- **Vault dynamic secrets**: a database credential generated on-the-fly by Vault, valid for a configurable TTL (e.g., 1 hour), automatically revoked after expiry. The service requests a credential from Vault (`vault read database/creds/readonly`), gets a unique username/password, and uses it for the TTL duration. The benefit: even if the credential leaks, it expires before an attacker can use it. The cost: the service must be able to request a new credential mid-operation, which requires a retry loop for "credential expired" errors.
- **Dual-key rotation mechanics**: the secret manager maintains two valid keys (old and new) during the rotation window (typically 2x the credential TTL). The service receives the new key at the start of the window, starts using it immediately, and the old key is revoked at the end of the window. This ensures zero-downtime rotation: a request that started with the old key completes before the old key is revoked. Without dual-key, rotation causes a brief window where no key is valid, which manifests as 503 errors.
- **Config layering pattern**: `config.defaults.yaml` (committed to repo, safe defaults, no secrets) → `config.<env>.yaml` (committed, env-specific overrides, no secrets) → environment variables (injected at runtime, overrides config files, may contain secrets) → `config.local.yaml` (gitignored, developer-specific overrides, never committed). The YiAi pattern: `config.yaml` + pydantic-settings with `YamlConfigSettingsSource`. The key rule: secrets never appear in committed files; the `.env` file is gitignored and `.env.example` is committed with placeholder values.
- **Secret leak incident response**: (1) revoke the credential immediately (not "when we have a replacement"), (2) rotate the credential, (3) audit access logs for the credential's usage during the exposure window, (4) determine the blast radius (what data was accessible with this credential), (5) update the secret hierarchy to reduce the blast radius of the next leak. The most common mistake: spending hours investigating the leak source before revoking the credential, giving the attacker more time.

## Scenario

When kicking off a new project / credential leak / secret rotation / environment config chaos / compliance audit, engineer + architect + security need to manage secrets + config + rotation + least privilege + compliance. This entry aggregates secret layering, rotation process, compliance, monitoring into a 2-hop path, avoiding "hardcoded secrets / credential leak / missing rotation / over-permissioned". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [secret-rotation-process.md](./../../oncall-sre/incident-response/do-a-security-audit.md) · [security-audit-process.md](./../../oncall-sre/incident-response/do-a-security-audit.md) · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) — prompt injection leak risk |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) — credential leak incident reference |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) — supply chain pitfall |
| `projects/` | each project `dev-standards-summary.md` §environment config + `adr-*` §secrets management |
| `journeys/` | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) · [./harden-supply-chain.md](./harden-supply-chain.md) · [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |

## Action recommendations

1. **Three-layer layering**: env (public config: URL / port / log level) + secret (sensitive credential: API key / DB password / token) + vault (dynamic secrets: short-term STS / dynamic DB credential) . 
2. **No secrets in env**: env variables only hold public config; secrets go through secret manager / vault; env does not enter git. 
3. **Least privilege**: each service only takes the secrets it needs; do not share admin credentials; follow [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) (essence of permission: what it can do) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md) (do not add permission without need) . 
4. **Rotation process**: follow [secret-rotation-process](./../../oncall-sre/incident-response/do-a-security-audit.md) quarterly rotation + forced rotation after incident; automated rotation + dual-key parallel switch (no service interruption) . 
5. **Audit**: follow [security-audit-process](./../../oncall-sre/incident-response/do-a-security-audit.md) + [quarterly-security-audit-process](../quality-security/quarterly-security-audit.md); full audit of secret access logs. 
6. **Prompt injection defense**: LLM application prompt injection can leak secrets — follow [prompt-injection-defense-summary](../../ai-engineer/methodology/prompt-injection-defense.md) + restrict LLM access to secrets. 
7. **MV3 dual-world secret isolation**: extension secrets only in isolated world ([dual-world-boundary-pattern](../engineering/dual-world-boundary.md)) — main world does not touch secrets. 
8. **Supply chain hardening**: new dependencies introduced must run [supply-chain-hardening-pattern](../process/harden-supply-chain.md); prevent supply chain poisoning and secret theft. 
9. **Monitoring alerts**: alert on secret access exceptions (frequency / source / time) — follow [monitoring-governance-process](../process/monitoring-governance.md). 
10. **Thinking frameworks**: [inversion](../../knowledge-curator/templates/thinking/inversion.md) "how to make secrets leak" reverse-engineer improvements + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) (rotation second-order effect: service interruption risk) . 

## Anti-patterns

- **Hardcoding secrets in source code.** API keys, database passwords, and tokens committed to the repository are leaked to every developer with read access, every CI pipeline that clones the repo, and every backup of the repository. Even if the commit is later removed, the secret remains in the git history forever. The only remediation is to revoke and rotate the secret immediately.

- **Using the same secret for multiple environments.** A staging database password that is the same as the production database password means that anyone with staging access has production access. Every environment must have its own credentials, and the staging credentials must not grant access to production resources.

- **Storing secrets in the same config file as non-secret config.** When secrets are colocated with config, a developer who needs to read the config file (to check a port number or feature flag) inadvertently sees the secrets. The secrets should be in a separate file with separate access controls, or better, in a secret manager that never exposes the secret value to the file system.

- **Neglecting to rotate secrets after an employee departure.** When an engineer with access to production secrets leaves the organization, every secret they had access to must be rotated. Trusting that the former employee will not misuse the credentials is not a security control. The offboarding process must include a credential rotation step.

- **Relying on obscurity instead of encryption.** A secret that is base64-encoded or stored in an "obscure" location is not protected. Any attacker who gains access to the file system can decode base64 and find the obscure location. The only acceptable protection is encryption at rest with a key that is itself stored in a hardware security module or secret manager.

## Related

- similar journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- similar journey: [./harden-supply-chain.md](./harden-supply-chain.md) — supply chain hardening
- similar journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — secret access monitoring
- similar journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — credential leak incident
- upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — quarterly audit of secrets
