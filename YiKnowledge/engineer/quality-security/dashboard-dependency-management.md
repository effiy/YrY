---
title: open source dependency management dashboard
aliases:
- dependency health dashboard
- supply chain dashboard
- SBOM dashboard
- license compliance dashboard
tags:
- dashboard
- dependencies
- open-source
- supply-chain
- sbom
- license-compliance
- vulnerability
- transitive-risk
category: engineer/security-supply-chain
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- security-engineer
benefit: dependency health, supply chain risk, and open source compliance visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- version health, license compliance, vulnerability exposure, transitive risk, SBOM coverage, and update cadence defined
related:
- ./dashboard-api-security.md
- ./dashboard-identity-access-management.md
- ./dashboard-data-protection-privacy.md
- ../../tech-lead/strategy/dashboard-technical-strategy.md
- ../../oncall-sre/observability/dashboard-system-health.md
tacit: false
---

# open source dependency management dashboard

> **As an** engineer, **I want to** track open source dependency health and supply chain risk, **so that** every dependency is intentional, up-to-date, and secure, vulnerabilities are patched before exploitation, licenses are compliant, and the software supply chain is auditable from source to production.

> Dependency management is the invisible backbone of modern software. This dashboard tracks version health, license compliance, vulnerability exposure, transitive dependency risk, SBOM coverage, and update cadence — turning dependency management from a reactive fire drill into a continuously monitored, proactively maintained supply chain security practice.

## Summary

- 6 dependency dimensions: version health, license compliance, vulnerability exposure, transitive risk, SBOM coverage, update cadence
- 1,850 direct dependencies across 42 repositories; 12,400 transitive dependencies; 8 package ecosystems (npm, PyPI, Maven, Go, NuGet, RubyGems, Cargo, Docker)
- Version currency: 62% of dependencies on latest major; 28% one major behind; 10% two or more majors behind (stale); 4.2% deprecated or unmaintained
- License compliance: 78% permissive (MIT, Apache, BSD), 12% copyleft (GPL, AGPL), 5% unknown/unlicensed, 3% proprietary; 8 GPL violations in proprietary products
- Vulnerability exposure: 245 known CVEs (42 critical, 88 high, 72 medium, 43 low); 28 days average time-to-patch critical; 15 zero-days in last 12 months
- SBOM coverage: 35/42 repos (83%) with CycloneDX SBOM; 8 repos with VEX; 0 repos with full attestation chain; SLSA compliance: 18% at Level 2+
- Dashboard reviewed monthly; dependency audit sprint quarterly with engineering and security

## Core viewpoints

- Every dependency is a liability — you're not just importing code, you're importing its bugs, vulnerabilities, license obligations, and maintenance burden; treat each new dependency as a hiring decision with no interview
- Transitive dependencies are the silent killer — 87% of vulnerabilities live in transitive dependencies, not direct ones; you can't manage what you can't see, and most teams can't see past the first layer
- Version lag is a compounding risk — being one major version behind is manageable; being three behind is a migration project; every skipped version adds to the eventual upgrade cost
- License compliance is not a legal checkbox — an AGPL dependency in a proprietary product is a ticking time bomb; license issues discovered post-acquisition or during due diligence can kill deals

## Key information

### 6-panel dependency overview

```
┌──────────────────────────────────────────────────────────────────┐
│  VERSION HEALTH                     │  LICENSE COMPLIANCE                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Direct deps: 1,850      │   │  │  Permissive: 78% (MIT,   │   │
│  │  Transitive: 12,400       │   │  │  Apache, BSD, ISC)       │   │
│  │  On latest: 62%           │   │  │  Copyleft: 12% (GPL,     │   │
│  │  1 major behind: 28%      │   │  │  AGPL, LGPL)             │   │
│  │  2+ behind: 10%           │   │  │  Unknown/unlicensed: 5%  │   │
│  │  Deprecated: 4.2% (78)    │   │  │  Proprietary: 3%          │   │
│  │  Unmaintained: 2.8% (52)  │   │  │  GPL violations: 8        │   │
│  │  Version score: C+ (65)   │   │  │  License score: B (78)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  VULNERABILITY EXPOSURE             │  TRANSITIVE RISK                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Known CVEs: 245 total   │   │  │  Avg transitive depth:4.2│   │
│  │  Critical: 42 (17%)      │   │  │  Max depth: 12 layers    │   │
│  │  High: 88 (36%)          │   │  │  Unpinned: 38% of trans  │   │
│  │  Medium: 72 (29%)        │   │  │  Diamond deps: 185       │   │
│  │  Low: 43 (18%)           │   │  │  Conflict sets: 42       │   │
│  │  Time-to-patch: 28d avg  │   │  │  Abandoned transitive: 95│   │
│  │  Zero-days (12mo): 15    │   │  │  Transitive risk: C (62) │   │
│  │  Vuln score: C+ (68)     │   │  │  Overall: C+ (65)        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SBOM COVERAGE                      │  UPDATE CADENCE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  SBOM coverage: 35/42    │   │  │  Auto-update (Dependabot)│   │
│  │  CycloneDX: 35 repos     │   │  │  enabled: 38/42 repos    │   │
│  │  SPDX: 12 repos          │   │  │  Update PRs/wk: 85       │   │
│  │  VEX: 8 repos            │   │  │  Merge rate: 72%          │   │
│  │  Attestation: 0 repos    │   │  │  Patch latency: 5.2d avg  │   │
│  │  SLSA L2+: 18%           │   │  │  Major upgrade: 45d avg   │   │
│  │  SBOM freshness: 82%     │   │  │  Stale PRs (>30d): 18     │   │
│  │  SBOM score: C+ (68)     │   │  │  Cadence score: B- (72)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Version health by ecosystem

| Ecosystem | Direct deps | Transitive | On latest | 1 behind | 2+ behind | Deprecated | Unmaintained | Health |
|---|---|---|---|---|---|---|---|---|
| **npm** (JavaScript) | 680 | 5,200 | 58% | 30% | 12% | 5.5% (37) | 3.2% (22) | D+ (58) |
| **PyPI** (Python) | 320 | 2,100 | 65% | 25% | 10% | 3.8% (12) | 2.5% (8) | C+ (65) |
| **Maven** (Java) | 280 | 2,400 | 55% | 32% | 13% | 4.5% (13) | 3.8% (11) | C (62) |
| **Go modules** | 220 | 1,200 | 72% | 22% | 6% | 2.2% (5) | 1.5% (3) | B (78) |
| **NuGet** (.NET) | 150 | 680 | 68% | 24% | 8% | 3.5% (5) | 2.0% (3) | B- (72) |
| **RubyGems** | 95 | 420 | 60% | 28% | 12% | 4.8% (5) | 3.5% (3) | C+ (65) |
| **Cargo** (Rust) | 65 | 280 | 75% | 20% | 5% | 1.5% (1) | 1.0% (1) | B+ (82) |
| **Docker images** | 40 | 120 | 58% | 30% | 12% | 0% (0) | 2.5% (1) | B- (70) |
| **Overall** | **1,850** | **12,400** | **62%** | **28%** | **10%** | **4.2% (78)** | **2.8% (52)** | **C+ (65)** |

### Top stale dependencies (2+ majors behind)

| Dependency | Ecosystem | Current | Latest | Behind | Usage (repos) | Migration effort | Risk |
|---|---|---|---|---|---|---|---|
| **Spring Boot** | Maven | 2.7.x | 3.3.x | 2 majors | 12 | High (Java 17→21 req) | Medium |
| **React** | npm | 17.x | 19.x | 2 majors | 8 | Medium (concurrent mode) | Medium |
| **Angular** | npm | 15.x | 18.x | 3 majors | 3 | High (breaking changes) | High |
| **Django** | PyPI | 3.2 LTS | 5.1 | 2 majors | 5 | Medium (async changes) | Medium |
| **Lodash** | npm | 3.x | 4.x | 1 major | 22 | High (API surface change) | High |
| **gRPC** | Go | 1.55 | 1.65 | 10 minor | 8 | Low (mostly compatible) | Low |
| **Elasticsearch client** | PyPI | 7.x | 8.x | 1 major | 4 | Medium (client API change) | Medium |
| **Jackson** | Maven | 2.14 | 2.17 | 3 minor | 18 | Low (drop-in) | Low |
| **Redis client** | npm | 3.x | 4.x | 1 major | 12 | Medium (connection API) | Medium |
| **Terraform provider (AWS)** | Go | 4.x | 5.x | 1 major | 6 | High (resource rename) | High |

### Deprecated and unmaintained dependencies

| Dependency | Ecosystem | Status | Last release | CVEs | Usage (repos) | Replacement | Migration effort |
|---|---|---|---|---|---|---|---|
| **request** | npm | Deprecated | 2020-02 | 8 (2 high) | 14 | node-fetch / axios | Medium |
| **core-js@2** | npm | EOL | 2021-10 | 5 (1 critical) | 18 | core-js@3 | Low |
| **urllib3@1.x** | PyPI | Security-only | 2021-12 | 12 (4 critical) | 8 | urllib3@2.x | Medium |
| **log4j@1.x** | Maven | EOL | 2015-08 | 15 (5 critical) | 3 | log4j@2.x / logback | High |
| **moment** | npm | Maintenance | 2022-09 | 3 (1 high) | 22 | dayjs / luxon / date-fns | High |
| **gm** | npm | Unmaintained | 2019-03 | 2 (1 high) | 2 | sharp | Medium |
| **dotenv@8.x** | npm | Legacy | 2021-05 | 1 (low) | 10 | dotenv@16.x | Low |
| **BeautifulSoup 3** | PyPI | Deprecated | 2012-03 | 0 | 2 | BeautifulSoup 4 | Low |

### License compliance by type

| License type | Dependencies | % of total | Copyleft risk | Products affected | Action |
|---|---|---|---|---|---|
| **MIT** | 780 | 42.2% | None | All | Permissive, no action |
| **Apache 2.0** | 420 | 22.7% | None | All | Permissive, patent grant |
| **BSD (2/3-clause)** | 185 | 10.0% | None | All | Permissive, no action |
| **ISC** | 58 | 3.1% | None | All | Permissive, no action |
| **GPL 2.0/3.0** | 95 | 5.1% | **Strong copyleft** | 3 products | Legal review required |
| **LGPL** | 72 | 3.9% | **Weak copyleft** | 5 products | Dynamic linking OK |
| **AGPL** | 55 | 3.0% | **Strong copyleft (network)** | 2 SaaS products | Critical — remove or isolate |
| **MPL 2.0** | 32 | 1.7% | File-level copyleft | 2 products | File-level only, acceptable |
| **Unlicensed** | 65 | 3.5% | **Unknown** | All | Default copyright, no rights |
| **No license file** | 28 | 1.5% | **Unknown** | All | Treat as all-rights-reserved |
| **Proprietary/Commercial** | 42 | 2.3% | **Paid license** | 3 products | Verify license purchase |
| **CC (non-commercial)** | 18 | 1.0% | **Use restriction** | 2 products | Not for commercial use |
| **Overall** | **1,850** | | | | **78% permissive, 12% copyleft** |

### GPL/AGPL violations by product

| Product | Dependency | License | Usage type | Risk | Detected | Action |
|---|---|---|---|---|---|---|
| **YiVad (SaaS)** | iTextSharp | AGPL 3.0 | PDF generation | **Critical** | 2026-07 | Replace with Apache PDFBox |
| **YiVad (SaaS)** | MongoDB Java Driver (AGPL) | AGPL 3.0 | Database driver | Low | 2026-07 | AGPL exception for drivers, verify |
| **YiPet (Desktop)** | Ghostscript | AGPL 3.0 | PDF rendering | **Critical** | 2026-06 | Replace with poppler (GPL→LGPL) |
| **YiAi (SaaS)** | Elasticsearch client | Apache 2.0 | Search | None | — | Previously AGPL, now Apache, OK |
| **YiWeb (SaaS)** | CKEditor 4 | GPL 2.0 | Rich text editor | **High** | 2026-05 | Upgrade to CKEditor 5 (GPL 2+) or replace |
| **Internal tool** | MySQL Connector/J | GPL 2.0 | Database driver | Low | 2026-04 | GPL exception for connectors, verify |
| **YiPet (Desktop)** | FFmpeg (statically linked) | GPL 3.0 | Media processing | **High** | 2026-03 | Dynamic linking or replace with LGPL build |
| **Analytics pipeline** | GNU Parallel | GPL 3.0 | CLI tool (not distributed) | Low | 2026-02 | Not distributed, acceptable |

### Vulnerability exposure by severity

| Severity | CVEs | % of total | Exploitable (CVSS ≥ 7) | Exploit public | Patch available | Avg age | Time-to-patch |
|---|---|---|---|---|---|---|---|
| **Critical** (CVSS 9.0+) | 42 | 17.1% | 42 (100%) | 18 (43%) | 38 (90%) | 45 days | 12 days |
| **High** (CVSS 7.0-8.9) | 88 | 35.9% | 88 (100%) | 42 (48%) | 82 (93%) | 85 days | 28 days |
| **Medium** (CVSS 4.0-6.9) | 72 | 29.4% | 18 (25%) | 8 (11%) | 65 (90%) | 120 days | 45 days |
| **Low** (CVSS < 4.0) | 43 | 17.6% | 0 (0%) | 2 (5%) | 38 (88%) | 180 days | 90 days |
| **Total** | **245** | | **148 (60%)** | **70 (29%)** | **223 (91%)** | | **28 days avg** |

### Top critical vulnerabilities (open)

| CVE | Dependency | CVSS | Exploit public | Age | Repos affected | Fix version | Patch status |
|---|---|---|---|---|---|---|---|
| **CVE-2026-28491** | lodash 3.x (prototype pollution) | 9.8 | Yes | 35 days | 22 | lodash 4.17.21+ | In progress (22 PRs) |
| **CVE-2026-15238** | Spring Framework (RCE) | 9.6 | Yes | 18 days | 12 | Spring 5.3.32+ | In progress (12 PRs) |
| **CVE-2026-08125** | requests (SSRF) | 9.4 | Yes | 52 days | 14 | axios (replace) | Migration in progress |
| **CVE-2026-35210** | Jackson databind (RCE) | 9.2 | No | 28 days | 18 | Jackson 2.17.1+ | 8/18 repos patched |
| **CVE-2026-44321** | OpenSSL (heartbleed variant) | 9.1 | Yes | 8 days | 8 | OpenSSL 3.2.2+ | 6/8 repos patched |
| **CVE-2026-19034** | urllib3 1.x (CRLF injection) | 9.0 | No | 65 days | 8 | urllib3 2.2.0+ | 3/8 repos patched |
| **CVE-2026-52890** | golang.org/x/net (HTTP/2) | 8.8 | No | 22 days | 10 | x/net 0.28.0+ | 5/10 repos patched |
| **CVE-2026-33287** | log4j 1.x (JNDI) | 8.5 | Yes | 180 days | 3 | Replace with log4j 2.x | Migration stalled |

### Zero-day incidents (last 12 months)

| CVE | Dependency | Date | CVSS | Detection | Time to detect | Time to patch | Impact (repos) |
|---|---|---|---|---|---|---|---|
| **CVE-2026-11923** | npm semver (prototype pollution) | 2026-06-15 | 9.5 | GitHub Advisory | 0 days (pre-disclosure) | 3 days | 28 |
| **CVE-2026-08452** | PyPI certifi (cert validation) | 2026-04-22 | 8.8 | Dependabot | 2 days | 8 days | 12 |
| **CVE-2026-23190** | Go stdlib (net/http) | 2026-03-08 | 9.2 | Vendor advisory | 1 day | 5 days | 15 |
| **CVE-2025-44218** | log4j (another JNDI) | 2025-12-12 | 10.0 | Public exploit | 0 days (in-the-wild) | 12 hours | 3 |
| **CVE-2025-38921** | npm json5 (prototype pollution) | 2025-10-05 | 8.5 | Snyk monitor | 3 days | 6 days | 18 |
| **CVE-2025-27433** | Maven Guava (deserialization) | 2025-08-18 | 9.0 | Internal audit | 0 days (internal) | 1 day | 8 |

### Transitive dependency risk

| Risk metric | Current | Target | Notes |
|---|---|---|---|
| **Average transitive depth** | 4.2 layers | < 3 layers | Some Go dependency trees reach 12 layers |
| **Max transitive depth** | 12 layers (Go) | < 6 layers | Deepest: Kubernetes client → ... → 12th layer |
| **Unpinned transitive deps** | 38% (4,712) | < 10% | Version ranges allow silent drift |
| **Diamond dependencies** | 185 | < 50 | Same dep required at conflicting versions |
| **Active conflict sets** | 42 | 0 | 42 sets of deps with known version conflicts |
| **Abandoned transitive** | 95 (0.8%) | 0 | Transitive deps with no maintainer activity > 2 years |
| **Single-maintainer critical** | 28 | 0 | Critical transitive deps maintained by 1 person |
| **Overall transitive risk** | **C (62)** | **B+ (85)** | |

### Top diamond dependency conflicts

| Dependency | Versions | Consumers | Conflict type | Resolution | Blocker |
|---|---|---|---|---|---|
| **protobuf** | 3.19.x vs 3.25.x | gRPC (3.19) vs OpenTelemetry (3.25) | API incompatibility | Upgrade gRPC | 8 repos blocked |
| **guava** | 30.x vs 33.x | Hadoop client (30) vs BigQuery (33) | Method removal | Shade or upgrade Hadoop | 5 repos blocked |
| **snakeyaml** | 1.x vs 2.x | Spring Boot (1.x) vs internal lib (2.x) | API break | Upgrade Spring Boot | 12 repos blocked |
| **jackson** | 2.14 vs 2.17 | Elasticsearch (2.14) vs Kafka (2.17) | Minor version | Force resolution | 6 repos blocked |
| **netty** | 4.1.100 vs 4.1.112 | gRPC (4.1.100) vs RSocket (4.1.112) | Compatible | BOM override | 4 repos blocked |

### SBOM coverage and maturity

| Repository | SBOM format | Last generated | VEX | Attestation | SLSA level | Dependency count | Freshness |
|---|---|---|---|---|---|---|---|
| **YiVad** | CycloneDX 1.5 | 2026-08-05 | Yes | No | L2 | 485 | 1 day |
| **YiAi** | CycloneDX 1.4 | 2026-08-04 | Yes | No | L2 | 320 | 2 days |
| **YiPet** | CycloneDX 1.5 | 2026-08-03 | No | No | L1 | 280 | 3 days |
| **YiWeb** | CycloneDX 1.4 | 2026-08-01 | Yes | No | L2 | 520 | 5 days |
| **YiKnowledge** | None | — | No | No | L0 | 180 | — |
| **shared-models** | SPDX 2.3 | 2026-07-28 | Yes | No | L1 | 45 | 9 days |
| **data-pipeline** | CycloneDX 1.4 | 2026-07-25 | No | No | L1 | 95 | 12 days |
| **auth-service** | CycloneDX 1.5 | 2026-08-02 | Yes | No | L2 | 165 | 4 days |
| **8 repos — no SBOM** | None | — | No | No | L0 | 485 total | — |

### Update cadence by ecosystem

| Ecosystem | Auto-update tool | Update PRs/wk | Auto-merge rate | Manual merge rate | Patch latency | Minor latency | Major latency |
|---|---|---|---|---|---|---|---|
| **npm** | Dependabot | 38 | 62% | 18% | 3.5 days | 12 days | 35 days |
| **PyPI** | Dependabot | 18 | 68% | 22% | 4.2 days | 15 days | 42 days |
| **Maven** | Dependabot | 15 | 55% | 28% | 8.5 days | 22 days | 58 days |
| **Go** | Dependabot | 8 | 72% | 15% | 2.8 days | 10 days | 28 days |
| **NuGet** | Dependabot | 4 | 58% | 25% | 5.5 days | 18 days | 48 days |
| **RubyGems** | Dependabot | 2 | 65% | 20% | 6.0 days | 20 days | 52 days |
| **Cargo** | Dependabot | 1 | 75% | 15% | 2.5 days | 8 days | 22 days |
| **Docker** | Renovate | 3 | 55% | 30% | 5.0 days | 12 days | 35 days |

### Dependency onboarding (new dependency request)

| Stage | Current | Target | Notes |
|---|---|---|---|
| **Proposal submitted** | 12/mo | — | New dependency or major version bump requests |
| **Security review** | 2.5 days avg | < 1 day | Automated CVE + license scan |
| **License review** | 1.8 days avg | < 1 day | Legal review for non-permissive licenses |
| **Architecture review** | 3.2 days avg | < 2 days | Is there an existing dep that does this? |
| **Maintenance assessment** | Acceptable | — | Release frequency, bus factor, community health |
| **Approval rate** | 72% | — | 28% rejected (existing alternative, license, unmaintained) |
| **Total onboarding time** | 7.5 days avg | < 4 days | From proposal to merged PR |

## Action recommendations

1. **Critical vulnerability sprint**: 42 critical CVEs, 4 with public exploits; patch all criticals within 7 days, prioritize public-exploit CVEs first
2. **Deprecated dependency removal**: 78 deprecated deps (4.2%), 52 unmaintained (2.8%); replace all 130 within 90 days, starting with the 8 with known CVEs
3. **AGPL/GPL violation remediation**: 8 violations in proprietary products; replace iTextSharp with Apache PDFBox, Ghostscript with poppler, CKEditor 4→5; target 0 violations
4. **Stale dependency upgrade program**: 10% of deps 2+ majors behind; create upgrade roadmap for top 10 stale deps, allocate 20% of sprint capacity to upgrades
5. **SBOM universal coverage**: 7 repos without SBOM (83%→100%); generate CycloneDX SBOM for all repos, integrate into CI/CD pipeline, enforce on merge
6. **SLSA Level 2+ adoption**: 18% at L2+; implement provenance attestation for all build pipelines, target 50% L2+ by Q4 2026
7. **Transitive dependency pinning**: 38% unpinned (4,712 deps); implement lockfile enforcement, pin all transitive deps, reduce to < 10% unpinned
8. **Diamond dependency resolution**: 42 active conflict sets; resolve top 5 conflicts (protobuf, guava, snakeyaml, jackson, netty), unblock 35 repos
9. **Unlicensed dependency audit**: 93 deps with no license or unknown license (5%); audit each, request license from maintainer, or replace
10. **Monthly dependency review**: review version health, vulnerability exposure, license compliance, transitive risk, SBOM coverage, and update cadence with engineering and security



- The copy-paste dependency → "just npm install it" without checking last commit date, maintainer count, license, or known vulnerabilities; every dependency is a permanent maintenance commitment — treat it like one
- Version pinning everything (and never updating) → "we pin all deps to avoid breakage" and then never update them; pinning without an update process is just deferred breakage, and the break will be worse
- The "it's just a transitive dep" shrug → ignoring transitive dependencies because "we didn't choose them"; 87% of vulnerabilities live in transitive deps — you chose them when you chose the direct dep
- License ignorance → "nobody reads licenses anyway"; GPL in a proprietary product, AGPL in SaaS, or CC-NC in a commercial product can result in lawsuits, forced open-sourcing, or acquisition deal-killers
- Auto-merge without testing → blindly auto-merging Dependabot PRs because "it's just a patch"; even patch releases can break behavior — automated test suites must pass before auto-merge

## Related

- Same class: [dashboard-api-security](dashboard-api-security.md) — API security posture
- Same class: [dashboard-identity-access-management](dashboard-identity-access-management.md) — IAM health
- Same class: [dashboard-data-protection-privacy](dashboard-data-protection-privacy.md) — data protection and privacy
- Same class: [dashboard-technical-strategy](../../tech-lead/strategy/dashboard-technical-strategy.md) — technical strategy
- Same class: [dashboard-system-health](../../oncall-sre/observability/dashboard-system-health.md) — system health
- References: OWASP — *Software Component Verification Standard (SCVS)*; NTIA — *Software Bill of Materials (SBOM) Minimum Elements*; SLSA — *Supply-chain Levels for Software Artifacts*; Google — *Know, Prevent, Fix: A Framework for Open Source Vulnerability Management*; Linux Foundation — *Census II of Free and Open Source Software*; CycloneDX — *OWASP CycloneDX Specification*; SPDX — *Software Package Data Exchange*