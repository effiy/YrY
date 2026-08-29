---
title: Harden the Supply Chain
aliases: [harden-supply-chain, supply-chain-security, dependency-security]
tags: [engineer, ship, security, supply-chain, dependencies, audit]
category: engineer/ship
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, srer]
benefit: "Engineers harden the software supply chain — from dependency auditing to lockfile integrity and build reproducibility"
acceptance_criteria:
  - "covers dependency auditing, lockfile integrity, and build reproducibility"
  - "includes YrY-specific tooling (pip audit, npm audit, Biome)"
  - "real supply chain lessons from YiKnowledge"
related:
  - ./README.md
  - ../../leader/decisions/yipet/biome-lint-format.md
---

# Harden the Supply Chain

> **When to use:** Before every release and when adding new dependencies. Supply chain attacks are the fastest-growing attack vector — a single compromised dependency can expose everything.

## YiAi — Python Supply Chain

### Dependency Audit

```bash
# Check for known vulnerabilities
pip-audit

# Check for outdated packages
pip list --outdated

# Generate a requirements.txt with hashes
pip freeze --require-hashes > requirements.txt
```

### Lockfile Integrity

```bash
# Verify installed packages match requirements
pip check

# Check for dependency confusion (typosquatting)
pip list --format=json | python3 -c "
import json, sys
packages = json.load(sys.stdin)
for p in packages:
    name = p['name'].lower()
    # Flag suspicious: hyphens replaced with underscores, extra chars
    if name.startswith('python-') or name.endswith('-py'):
        print(f'SUSPICIOUS: {p[\"name\"]}=={p[\"version\"]}')
"
```

### Minimal Dependencies

```txt
# requirements.txt — keep it minimal
fastapi==0.115.*
uvicorn[standard]==0.34.*
motor==3.7.*
pydantic==2.10.*
pydantic-settings==2.7.*
pyyaml==6.0.*
tenacity==9.0.*
httpx==0.28.*
apscheduler==3.11.*
llama-index==0.12.*
ollama==0.4.*
```

**Rule:** Every dependency must earn its place. Before adding a dependency, ask:
1. Can we implement this in < 50 lines?
2. Is the package actively maintained? (> 1 commit in the last 3 months)
3. Does it have known vulnerabilities? (`pip-audit`)
4. How many transitive dependencies does it pull in?

## YiVad/YiPet — Node.js Supply Chain

### Dependency Audit

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically (non-breaking)
npm audit fix

# Check for outdated packages
npm outdated

# Check bundle size impact
npx bundlesize
```

### Lockfile Integrity

```bash
# Verify package-lock.json is in sync
npm ci  # (fails if package-lock.json doesn't match package.json)

# Check for integrity mismatches
npm audit signatures
```

### Biome for Supply Chain Hygiene

YiPet uses Biome for linting and formatting — one tool instead of ESLint + Prettier + 50+ plugins:

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "security": { "noDangerouslySetInnerHtml": "warn" }
    }
  }
}
```

**Benefit:** Fewer dependencies = smaller attack surface. Biome replaces ~50 transitive dependencies.

## Build Reproducibility

### Python

```bash
# Pin exact versions with hashes
pip-compile --generate-hashes requirements.in -o requirements.txt

# Install from pinned requirements
pip install --require-hashes -r requirements.txt
```

### Node.js

```bash
# Use ci (clean install) instead of install in CI
npm ci

# Never use npm install (can modify lockfile)
```

## Supply Chain Lessons from YiKnowledge

The [no-lockfile supply chain postmortem](../../srer/incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md) documented a real incident:

| Lesson | Action |
|---|---|
| Without a lockfile, builds are not reproducible | Always commit `package-lock.json` / `requirements.txt` |
| A dependency update can break production | Pin exact versions; use `npm ci` / `pip install --require-hashes` |
| Audit before every release | Add `npm audit` / `pip-audit` to CI pipeline |

## Quarterly Supply Chain Checklist

- [ ] Run `pip-audit` / `npm audit` — fix all critical/high vulnerabilities
- [ ] Review new dependencies added this quarter — are they still needed?
- [ ] Check for abandoned dependencies (> 6 months no commits)
- [ ] Verify lockfile integrity (`npm ci` / `pip check`)
- [ ] Update to latest patch versions of all dependencies
- [ ] Remove unused dependencies

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| `npm install` in CI | Can modify lockfile; builds are not reproducible | Use `npm ci` in CI; never `npm install` |
| No lockfile committed | Dependencies drift; builds break unexpectedly | Always commit lockfiles |
| "It's just a small utility package" | Left-pad incident: 11 lines of code broke thousands of projects | Audit every dependency; prefer writing small utilities yourself |
| Ignoring `npm audit` warnings | Known vulnerabilities accumulate; one is exploited | Fix all critical/high vulnerabilities; track medium/low |