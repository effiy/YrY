---
title: Supply chain attack surface without a lockfile
aliases: [no-lockfile-supply-chain-risk, pip-audit-gap, requirements-txt-risk]
tags: [pitfall, supply chain, lockfile, pip-audit, security, dependency management]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: true
roles: [engineer, oncall-sre]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# Supply chain attack surface without a lockfile

> **As an** engineer, **I want to** no lockfile supply chain risk, **so that** same mistake avoided.

> YiAi `requirements.txt` has no version pinning, no lockfile, no `pip-audit`, no `min-release-age` equivalent strategy — the supply chain attack surface is huge. This gotcha is the basis for [ADR multi-provider LLM route §risk #5](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) and [ADR pytest §risk](../../tech-lead/decisions/yiai/pytest-introduction.md), referencing [Pi Agent Harness Evolution](../engineering/pi-agent-harness-evolution.md) §supply chain hardening checklist.

## Summary

- **Current state**: YiAi `requirements.txt` only lists package names, no version pinning; `pip install -r` installs the latest each time, supply chain attack surface is huge.
- **Risk**: malicious dependency of the day (e.g. `torch` typosquatting) / newly published but unaudited versions / `pip-audit` missing → poisoned at install time.
- **Fix**: `uv` lockfile + `pip-audit` + min-release-age equivalent strategy (`pip-tools` + self-written check) + pre-commit blocks lockfile mis-submit.
- **Borrow**: Pi Agent Harness's npm hardening checklist (pin + min-release-age=2 + shrinkwrap allowlist + lifecycle script allowlist) translated to Python equivalent.

## Core viewpoints

- **A `requirements.txt` file without version pinning is not a dependency specification -- it is a suggestion that pip is free to ignore**: Every `pip install -r requirements.txt` is a new roll of the dice, pulling whatever the latest compatible version happens to be. Two machines running the same `requirements.txt` can have different dependency trees, and the resulting bugs are non-reproducible by definition. The lockfile is not a nice-to-have; it is the only artifact that guarantees reproducibility.

- **The supply chain attack surface expands with every dependency, and the Python ecosystem's default tooling provides zero defense**: npm has `package-lock.json`, `npm audit`, and shrinkwrap by default. pip has none of these. The Python ecosystem's "batteries included" philosophy does not extend to supply chain security, which means every Python project starts with a security deficit that must be closed deliberately.

- **`pip-audit` without CI blocking is security theater**: Running `pip-audit` and printing warnings is equivalent to not running it at all. If a high-severity CVE does not block the merge, the CVE will reach production. The `--strict` flag is not optional -- it is the difference between auditing and pretending to audit.

- **The `min-release-age` strategy addresses a threat model that version pinning alone cannot**: A pinned version protects against accidental upgrades but not against malicious packages published under the same version number (typosquatting) or newly published versions with undiscovered vulnerabilities. The 7-day window gives the community time to detect and report issues before they enter your dependency tree.

- **Lifecycle script allowlisting is the most overlooked supply chain vector because it operates at install time, not runtime**: When pip installs a package, it executes `setup.py` or `pyproject.toml [build-system]` hooks with arbitrary code execution privileges. A compromised package's malicious code runs before any import statement is evaluated. Auditing these hooks is not a CI optimization -- it is a pre-execution security gate.


- **`requirements.txt` without pinning = non-reproducible + non-auditable** — different versions installed each time; no defense against supply chain attacks.
- **lockfile is ground truth, not `requirements.txt`** — `uv` / `pip-tools` generate lockfile; CI installs lockfile, not `requirements.txt`.
- **`pip-audit` is passive inspection, not active defense** — must pair with `min-release-age` equivalent strategy to block same-day dependencies.
- **lifecycle script in Python is setup.py / pyproject.toml `[build-system]`** — pip executes it at install time; equivalent to npm `preinstall`, must have allowlist.
- **Hardening is basic hygiene, not optional** — YiAi's current gap is marked "high / high" in [ADR multi-provider §risk #5](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md).

## Key information

### Symptoms

- `pip install -r requirements.txt` installs different versions at different times (patch / minor / even major).
- Newly published malicious packages (e.g. typosquatting `torcch` for `torch`) if mixed into dependencies, are installed immediately.
- Newly published but unaudited versions (containing malicious code) are installed directly.
- No one reviews dependency list changes (PR template has no "dependency change" section).
- `pip-audit` not in CI; no one scans after CVE publication.
- No lockfile → `pip freeze` results differ between machines → non-reproducible bugs.

### Root cause

- `requirements.txt` does not pin versions by default (or only `>=`), installs the latest each time.
- pip has no native `min-release-age` / lockfile / shrinkwrap equivalent mechanism.
- Python ecosystem `uv` / `pip-tools` provides equivalent, but YiAi has not adopted them.
- `setup.py` / `pyproject.toml` `[build-system]` lifecycle scripts execute when pip installs packages, with no allowlist → arbitrary code execution.
- Team has insufficient awareness of Python supply chain risk (mistakenly believing `requirements.txt` version pinning is enough).

### Impact scope

- YiAi backend full stack (`fastapi` / `motor` / `llama_index` / `apscheduler` / `pydantic-settings` and all dependencies).
- After multi-provider LLM routing is introduced, the dependency surface expands again (`llama-index-llms-openai` / `anthropic` / `google-genai` etc.), attack surface grows in parallel.
- YiVad / YiPet consume via YiAi HTTP endpoints; YiAi poisoning = whole family poisoned.

### Solution

**Phase 1 — Introduce lockfile (highest priority)**

```bash
# Using uv (recommended, 10-100x faster than pip-tools)
pip install uv
uv pip compile requirements.txt -o uv.lock
# CI installs lockfile
uv pip sync uv.lock
```

Or `pip-tools`:

```bash
pip install pip-tools
pip-compile requirements.in -o requirements.txt
pip install -r requirements.txt  # install locked versions
```

Key points:
- `requirements.in` is input (semantic version constraint); `requirements.txt` / `uv.lock` is output (pinned versions).
- CI installs lockfile, not `requirements.in`.
- Lockfile committed to git; `.gitignore` does not ignore it.

**Phase 2 — `pip-audit` in CI**

```bash
pip install pip-audit
pip-audit --strict --ignore-vuln GHSA-XXXX  # known false positive ignored
```

Key points:
- CI runs `pip-audit` each time; CVE hits block PR.
- Weekly full `pip-audit --fix` check for upgrades.
- Ignored CVEs must use `--ignore-vuln` + comment reason.

**Phase 3 — min-release-age equivalent strategy**

pip has no native support, use `pip-tools` + self-written check:

```python
# scripts/check_min_release_age.py
import json, subprocess, sys, time
from datetime import datetime, timedelta

MIN_AGE_DAYS = 2
packages = json.loads(subprocess.check_output(['pip', 'list', '--format=json']))
for pkg in packages:
    # Query PyPI JSON API for release date
    release_date = get_pypi_release_date(pkg['name'], pkg['version'])
    if release_date and (datetime.now() - release_date).days < MIN_AGE_DAYS:
        print(f"BLOCK {pkg['name']}=={pkg['version']} released {release_date}")
        sys.exit(1)
```

Key points:
- Blocks same-day / yesterday published dependencies.
- CI runs this script after `pip sync`.
- PyPI API has rate limit; cache 24h.

**Phase 4 — lifecycle script allowlist**

```toml
# pyproject.toml
[tool.pip.allowlist]
scripts = ["build", "install"]  # only allow standard build/install hook
```

pip has no native allowlist, use `pip install --no-build-isolation` + self-audit `pyproject.toml` `[build-system]`:

```bash
# CI runs
python scripts/audit_build_scripts.py  # scan all dependency pyproject.toml, list non-standard hooks
```

Key points:
- List all dependencies' `[build-system]` hooks; non-`setuptools` / `flit` / `poetry-core` flagged for re-review.
- Equivalent to npm shrinkwrap lifecycle allowlist.

**Phase 5 — pre-commit blocks lockfile mis-submit**

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: block-lockfile-change
      name: block uv.lock change without PI_ALLOW_LOCKFILE_CHANGE=1
      entry: bash -c 'if [ -z "$PI_ALLOW_LOCKFILE_CHANGE" ]; then git diff --cached --name-only | grep -q "uv.lock" && echo "block uv.lock change without PI_ALLOW_LOCKFILE_CHANGE=1" && exit 1; fi'
      language: system
      pass_filenames: false
```

Key points:
- Borrows pi's `PI_ALLOW_LOCKFILE_CHANGE=1` mechanism.
- Lockfile changes must explicitly inject env; prevents accidental upgrades.

### Borrow Pi Agent Harness hardening checklist

| pi (npm) | YiAi (Python equivalent) | Status |
|---|---|---|
| `save-exact=true` | `uv pip compile` default pins exact version | Pending |
| `min-release-age=2` | `scripts/check_min_release_age.py` self-written | Pending |
| `package-lock.json` is ground truth | `uv.lock` is ground truth | Pending |
| pre-commit blocks lockfile mis-submit | `block-lockfile-change` hook | Pending |
| `npm run check` verifies pin + native import | `pip check` + `uv pip tree` + self-audit | Pending |
| `npm-shrinkwrap.json` contains lifecycle allowlist | `pyproject.toml [tool.pip.allowlist]` + self-written | Pending |
| Release smoke test | `uv pip sync uv.lock` + `pytest -q` in clean venv | Pending |
| `npm audit --omit=dev` + `npm audit signatures` | `pip-audit --strict` | Pending |
| Shrinkwrap lifecycle allowlist | `audit_build_scripts.py` scans `[build-system]` | Pending |

### Similar pitfalls

- `requirements.txt` using `>=` instead of `==` — equivalent to no pin.
- `pip install` without `--no-deps` to install local wheel — implicitly pulls all transitive dependencies.
- `Dockerfile` using `pip install -r requirements.txt` instead of `pip sync uv.lock` — image layer cache installs old versions but lockfile inconsistent.
- Jupyter notebook `!pip install` — no one audits dependencies.
- dev dependencies and prod dependencies not separated — `pip-audit --omit=dev` equivalent missing.

## Action recommendations

1. Immediately introduce `uv` lockfile (Phase 1), landing in the same PR as [ADR multi-provider #6](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md).
2. CI adds `pip-audit` gate (Phase 2), CVE blocks PR.
3. Implement `check_min_release_age.py` (Phase 3), blocks same-day dependencies.
4. `audit_build_scripts.py` (Phase 4) scans `[build-system]`, lists non-standard hooks for re-review.
5. pre-commit adds `block-lockfile-change` (Phase 5), lockfile changes must inject env.
6. Dockerfile changes to `uv pip sync uv.lock`, not `pip install -r`.
7. PR template adds "dependency change" section, requires reason + CVE check result.
8. Monthly scan `pip-audit --fix` + Renovate tracks upgrades; quarterly re-review dependency list.



- **`requirements.txt` only `>=` not `==`** — equivalent to no pin; must lockfile pin exact version.
- **lockfile in `.gitignore`** — non-reproducible; must commit.
- **CI installs `requirements.in`** — installs different versions each time; must install lockfile.
- **`pip-audit` not in CI** — no one scans after CVE publication; must CI run + block.
- **`pip install` without auditing `[build-system]`** — arbitrary lifecycle script execution; must allowlist.
- **Only hardening direct dependencies** — transitive dependencies ignored; lockfile full pin is the only defense.
- **lockfile auto-upgrade** — silent upgrades attacked; must pre-commit block + env explicit.

## Anti-patterns

- **Generating the lockfile once and then never regenerating it, treating it as a static artifact.** A lockfile generated six months ago pins versions that are now known to have vulnerabilities. The lockfile is a living artifact that must be regenerated on a schedule (weekly) to incorporate security patches. A static lockfile is a snapshot of the dependency tree at a point in time when it was known to be safe; a stale lockfile is a snapshot of the dependency tree at a point in time when it was not yet known to be vulnerable.
- **Running `pip-audit` only against the direct dependencies listed in `requirements.in`, not against the full resolved tree in `uv.lock`.** A direct dependency may be clean, but one of its transitive dependencies may have a critical CVE. `pip-audit` must run against the installed packages (the resolved tree), not against the input file. The audit that only scans direct dependencies is auditing the specification, not the system.
- **Using `pip install -r requirements.txt` in the Dockerfile while the CI pipeline uses `uv pip sync uv.lock`.** The Docker image and the CI environment are running different dependency trees. A bug that reproduces in the Docker container but not in CI is a dependency drift bug, and the drift is invisible because the two environments use different install commands. The Dockerfile must use the same install command as CI: `uv pip sync uv.lock`.
- **Adding the `block-lockfile-change` pre-commit hook but not documenting the `PI_ALLOW_LOCKFILE_CHANGE=1` escape hatch in the project's CONTRIBUTING guide.** A new developer tries to add a dependency, the pre-commit hook blocks the commit, and the developer has no idea why or how to proceed. The developer either abandons the dependency or disables the hook entirely. The escape hatch must be documented in the setup guide, with a clear explanation of when it is appropriate to use and what the consequences are.
- **Treating supply chain hardening as a one-time project that is "done" after the four-piece suite is in place.** A new class of supply chain attack is discovered (e.g., a compromised build system that injects malicious code into otherwise-clean source tarballs). The four-piece suite does not detect this because it audits the published package, not the build artifact. Supply chain hardening is a continuous process that must evolve as the threat landscape evolves. The hardening checklist must be reviewed quarterly against current threat intelligence.

## Related

- Same category: [./README.md](./) — gotchas leaf entry
- Same category: [./sse-ondone-guard.md](gotcha-sse-ondone-guard.md) — cross-project contract category pitfall
- Gap source: [YiAi development standards](../projects/yivad/dev-standards.md) §supply chain hardening gap
- Triggering ADR: [ADR multi-provider LLM route §risk #5](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) + [ADR pytest §risk](../../tech-lead/decisions/yiai/pytest-introduction.md)
- Borrowed checklist: [Pi Agent Harness Evolution](../engineering/pi-agent-harness-evolution.md) §supply chain hardening checklist
- upstream: [journeys/i-want-to-check-engineering-gotchas](../process/check-engineering-gotchas.md) — scenario entry
