---
title: market-research
name: market-research
description: >
  Survey open-source projects for a technology domain, evaluate single
  projects for production readiness, compare competing alternatives head-to-head,
  monitor GitHub trending for new entrants, and review YiKnowledge entries for quality.
  Use this skill whenever the user asks about open-source tools in a category, wants
  to know if a project is safe to adopt, needs to choose between alternatives, or
  asks you to write a market-trends report. Trigger words: "survey open source", "landscape
  research", "open source alternatives", "GitHub trending", "market research", "tool
  comparison", "OSS selection", "evaluate project", "is it production ready", "should
  we adopt", "compare", "vs", "which is better", "pick one", "rewrite README", "frontmatter",
  "what's new", "check trends", "review this entry". Do NOT trigger for: writing
  code documentation, editing source files outside YiKnowledge, or evaluating closed-source
  commercial products.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-12
updated: 2026-08-12
category: executiver/skills/market-research
review_cycle: monthly
roles:
  - executiver
tags:
  - skill
  - market
  - research
  - open-source
  - github
  - strategy
chip: business-strategy
---

# market-research — Open-Source Research & Evaluation

> Scan GitHub, evaluate projects, compare alternatives, and write to YiKnowledge. One skill for the full research lifecycle: survey → evaluate → compare → monitor → review.

## What this skill does

1. **Landscape survey** — Break a domain into 3-5 key paths, search GitHub and the web independently per path, and produce a structured report with comparison tables, cross-cutting analysis, key trends, and a phased adoption roadmap.
2. **Single-project evaluation** — Triage a GitHub repo in 60 seconds, then deep-dive into code quality, community health, and adoption risk. Produce a scored 0-100 readiness report.
3. **Head-to-head comparison** — Score two or more projects across 5 weighted dimensions, assess license and bus-factor risk, and recommend a primary pick with clear rationale.
4. **Trend monitoring** — Scan GitHub for new entrants and fast risers in a domain, classify signals, and write brief trend entries.
5. **Quality review** — Validate a YiKnowledge markdown file: frontmatter compliance, cross-reference integrity, data freshness.

## What this skill does NOT do

- Does NOT write code documentation — this is for YiKnowledge markdown files only.
- Does NOT evaluate closed-source commercial products.
- Does NOT make the final adoption decision — present the data, let the team decide.
- Does NOT access private repos, gated docs, or paid services.

## Reference implementation

The canonical output of this skill is `YiKnowledge/executiver/industry/market-trends/README.md` (AI-Driven Code Quality landscape). All modes should produce output at the same quality bar and follow the same structural conventions.

---

## Domain analysis: deriving key paths

Before searching, break the domain into **3-5 key paths**. Each path must be a distinct comparison dimension — a specific question the research answers. Paths that overlap produce redundant tables; paths that are too broad miss specialized tools.

**Methodology**:

1. List the user's stated requirement verbatim.
2. Identify the nouns (what's being evaluated) and verbs (what actions are needed).
3. Group verbs into 3-5 clusters — each cluster is one key path.
4. Name each path as a gerund phrase (e.g., "Intelligent Code Review" not "Code Review").
5. For each path, write a one-sentence scope statement and 3 search keyword pairs.

**Example — AI-Driven Code Quality**:

> **Requirement**: Key paths for AI-driven code quality improvement include: intelligent code review (auto-detect bugs and style violations), automated test generation (improve test coverage), assisted code refactoring (simplify redundant logic and optimize performance), and code style alignment (ensure consistent codebase style).

| Path | Scope | Primary keywords | Secondary keywords |
|------|-------|-----------------|-------------------|
| **Intelligent Code Review** | Auto-detect bugs and style violations in PRs | `AI code review`, `PR review bot` | `automated bug detection`, `LLM code reviewer` |
| **Automated Test Generation** | Generate unit/integration tests to improve coverage | `AI test generation`, `automated unit testing` | `LLM test writing`, `test coverage AI` |
| **Assisted Code Refactoring** | Simplify redundant logic and optimize performance | `AI code refactoring`, `AI pair programming` | `code optimization AI`, `multi-file refactor` |
| **Code Style Alignment** | Ensure consistent codebase style | `AI linter`, `LLM code formatter` | `style consistency tool`, `semantic linting` |

**Anti-patterns**:

- **One broad search** — "AI code tools" returns code-generation tools but misses specialized linters and test generators. Search per path.
- **Vague path names** — "Quality" is not a path; "Intelligent Code Review" is.
- **Too many paths** — 6+ paths fragment the research; merge overlapping ones.

---

## Workflow

### Mode 1: Landscape Survey

**When**: User asks "what open-source tools exist for X" or "survey the X landscape."

**Output file**: `YiKnowledge/executiver/industry/market-trends/README.md` (or domain-specific file).

**Steps**:

1. **Derive key paths** using the methodology above. Confirm with the user only if the paths are ambiguous; otherwise proceed.
2. **Search per path** — run 2-3 `WebSearch` queries per path in parallel. Use both primary and secondary keywords. Use `WebFetch` on `https://github.com/trending` for broad discovery if accessible.
3. **Build per-path tables** — minimum 4 projects per path. Use this exact column schema:

   | Project | Stars | Language | License | Core Capability | Integration | Bus Factor | Last Release |
   |---------|-------|----------|---------|----------------|-------------|------------|-------------|

   - **Project**: Linked GitHub repo name.
   - **Stars**: `~` approximate, never exact. Use `New` for projects < 3 months old.
   - **Language**: Primary language(s).
   - **License**: SPDX identifier (MIT, Apache-2.0, AGPL-3.0, etc.). Flag copyleft licenses with `⚠️`.
   - **Core Capability**: One sentence — what it uniquely does.
   - **Integration**: How it fits into a workflow (CLI, CI, IDE plugin, GitHub Action, etc.).
   - **Bus Factor**: `Solo` (single maintainer), `Small` (2-3), `Team` (4+), `Org` (backed by organization).
   - **Last Release**: Month/Year. Flag `>12 months` with `⚠️ stale`.

   Sort by stars descending. After each table, add a **Recommendation** line that maps scenarios to picks:
   > **Recommendation**: Multi-platform → PR-Agent; Qwen ecosystem → Alibaba Open-Code-Review; GitHub-only → CodeRabbit; security-critical → add CodeQL.

4. **Cross-Path Comparison** — summary table mapping each path to its primary pick, alternative, maturity level (High/Medium/Low/Emerging), and self-hosted availability:

   | Path | Primary | Alternative | Maturity | License Risk | Self-Hosted |
   |------|---------|-------------|----------|-------------|-------------|

5. **Key Technology Trends** — 4-5 structured trends, each with:
   - **Signal** (1 sentence): What's happening.
   - **Evidence** (1 sentence): Which projects/data points support it.
   - **Implication** (1 sentence): What it means for adoption decisions.

   Format as numbered list:
   > 1. **Agentification** — From single-point tools to autonomous agents (OpenHands, Sweep AI). *Implication*: AI shifts from "advisor" to "executor"; evaluate sandbox safety before adopting.

6. **Team Adoption Roadmap** — 3-4 phases, each with:
   - **Phase name and goal** (1 sentence).
   - **Tools**: Specific recommendations.
   - **Success metric**: Measurable outcome.
   - **Timeline**: Week/month estimate.

   > 1. **Phase 1 — Foundation** (Weeks 1-2): Deploy Ruff/Biome. *Metric*: Zero style violations in CI. *Tools*: Ruff, Biome.

7. **Sources & Verification** — List all sources with access dates. Format: `- Source type: specific query or URL (YYYY-MM-DD)`.

8. **Write the file** with full YiKnowledge frontmatter (see [Output conventions](#output-conventions)).

### Mode 2: Single-Project Evaluation

**When**: User asks "is X production ready" or "should we adopt X."

**Output file**: `YiKnowledge/executiver/industry/market-trends/<project-slug>.md`.

**Steps**:

1. **Quick triage** (halt if any red flag):
   - `WebFetch` the GitHub repo: stars, license, last release date.
   - `WebSearch` for "[project] CVE" and "[project] production users".
   - **Red flags**: last release > 2 years, no license, < 100 stars + solo maintainer, known unpatched CVEs.

2. **Deep-dive** (if triage passes):
   - Test coverage (check for CI badge, coverage config).
   - Dependency hygiene (is there a lockfile, are deps pinned).
   - CI/CD (actions/workflows present, passing).
   - Security policy (SECURITY.md, private reporting enabled).
   - Code structure (monorepo vs single-package, modularity).

3. **Adoption risk score** (0-100):

   | Dimension | Weight | Check |
   |-----------|--------|-------|
   | License safety | 25% | Permissive (MIT, Apache-2.0) = 25; copyleft (AGPL) = 10; none = 0 |
   | Maintenance | 30% | Release < 3 months = 30; < 6 months = 20; < 12 months = 10; > 12 months = 0 |
   | Community | 25% | Org-backed + active PRs = 25; team + issues answered = 18; solo = 8 |
   | Vendor neutrality | 20% | Foundation/community-governed = 20; single-vendor but open = 12; single-vendor controlled = 5 |

   **80+**: Safe to adopt · **60-79**: Monitor before adopting · **40-59**: High risk · **< 40**: Avoid.

4. **Write to file** — Quick Facts table, Health Scan table, scored Risk Score, and Verdict with conditions.

### Mode 3: Head-to-Head Comparison

**When**: User asks "X vs Y" or "which is better, A or B."

**Output file**: `YiKnowledge/executiver/industry/competitors/<category>-comparison.md`.

**Steps**:

1. **Score each project** 1-5 on five dimensions with specific evidence cited:
   - Code Quality, Documentation, Release Cadence, Governance, Community.

2. **Apply domain weights**:
   - **Critical** (2x): Security, compliance, infrastructure. Governance and Code Quality get double weight.
   - **Standard** (1x): General tooling, dev tools, libraries.
   - **Low** (0.5x): Experimental, early-stage, exploratory.

3. **Risk assessment** — License type, bus factor, commercial backing, vendor lock-in potential.

4. **Write to file** — weighted matrix, risk table, and recommendation with "when to use the alternative."

### Mode 4: Trend Monitoring

**When**: User asks "what's new in X" or "check trends for Y."

**Output file**: `YiKnowledge/executiver/industry/market-trends/<project-slug>.md` (one per entry).

**Steps**:

1. **Search** — `WebSearch` for "[domain] new open source [current year]" and "[domain] github trending".
2. **Classify**:
   - **New entrant** (< 3 months, > 500 stars/week) → Watch brief.
   - **Fast riser** (> 2k stars/month) → Rising brief.
   - **Established** (> 10k stars) → Update existing map.
   - **Noise** (< 100 stars) → Skip.
3. **Write brief** — what it does, why it matters, 3-month monitor action, re-evaluation date.
4. **Update** the parent README's file inventory table.

### Mode 5: Knowledge Entry Review

**When**: User asks "review this entry" or "validate YiKnowledge file."

**Steps**:

1. **Frontmatter** — all required fields present, `updated` is recent, `category` matches directory path.
2. **Cross-references** — resolve every `related` path, flag broken links.
3. **Freshness** — `last_verified` within `review_cycle` window, `status: draft` not older than 30 days.
4. **Report** — Critical (must fix), Warnings (should fix), Passed.

---

## Output conventions

### Frontmatter (all modes)

```yaml
---
title: <Display Title>
aliases: [<3-4 short aliases, hyphenated>]
tags: [leaf, <domain>, <subdomain>]
category: <role>/<domain>/<subdomain>
created: '<YYYY-MM-DD>'
updated: '<YYYY-MM-DD>'
last_verified: '<YYYY-MM-DD>'
source: <GitHub Trending / Web Research / GitHub Repo Inspection>
type: <research | summary | reference>
lifecycle: active
status: draft
review_cycle: monthly
roles: [executiver]
benefit: <one-line value statement>
acceptance_criteria:
  - <measurable criterion 1>
  - <measurable criterion 2>
related:
  - <relative path to related file>
skill: market-research
---
```

### Directory placement

| Output type | Directory |
|-------------|-----------|
| Landscape surveys, project evaluations, trend briefs | `executiver/industry/market-trends/` |
| Head-to-head comparisons | `executiver/industry/competitors/` |

Always update the parent `README.md` file inventory when adding a new file. An unlisted file is undiscoverable.

### Content structure

Every research entry follows this order:

1. **Goal** — 2-3 sentences: what we researched and why.
2. **Key paths** — numbered list with one-sentence scope per path.
3. **Per-path tables** — consistent column schema, sorted by stars, with scenario-based Recommendation line.
4. **Cross-Path Comparison** — summary table.
5. **Key Technology Trends** — 4-5 structured trends (signal + evidence + implication).
6. **Team Adoption Roadmap** — 3-4 phases (goal + tools + metric + timeline).
7. **Sources & Verification** — all URLs with access dates.
8. **Related** — links to adjacent YiKnowledge entries.

### Table schema reference

**Per-path project table** (Mode 1):

| Column | Format | Example |
|--------|--------|---------|
| Project | `[Name](https://github.com/owner/repo)` | `[Ruff](https://github.com/astral-sh/ruff)` |
| Stars | `~Nk` or `New` | `~30k` |
| Language | Primary language(s) | `Python` |
| License | SPDX id, `⚠️` for copyleft | `MIT` |
| Core Capability | One sentence | `Rust-powered, blazing-fast lint + auto-fix` |
| Integration | Workflow method | `CLI / pre-commit / CI` |
| Bus Factor | Solo / Small / Team / Org | `Org` |
| Last Release | Month Year, `⚠️ stale` if >12mo | `2026-07` |

**Cross-Path Comparison table** (Mode 1):

| Column | Meaning |
|--------|---------|
| Path | Key path name |
| Primary | Best overall pick |
| Alternative | Runner-up or niche pick |
| Maturity | High / Medium / Low / Emerging |
| License Risk | None / Low / Medium (copyleft) |
| Self-Hosted | Yes / Partial / No |

---

## Rules

| # | Rule | Why |
|---|------|-----|
| 1 | Every project must have a GitHub URL | A claim without a link is unverifiable |
| 2 | Star counts are `~` (approximate), never exact | Stars change daily; exact numbers rot immediately |
| 3 | Run searches per path independently, not one broad search | A single search misses specialized tools in subcategories |
| 4 | Include at least one non-Western ecosystem project per domain | GitHub's English-language bias hides major projects from Alibaba, Tencent, and other ecosystems |
| 5 | Score with evidence, not intuition | "4/5 documentation" is meaningless without citing what you actually saw |
| 6 | Last release date matters more than star count | An actively maintained 500-star project is safer than a stale 10k-star one |
| 7 | Flag single-maintainer projects regardless of score | Bus factor of 1 is a material risk even if everything else looks perfect |
| 8 | Record the evaluation date in `last_verified` | A 6-month-old evaluation is stale — scores decay, projects get abandoned |
| 9 | Deprecate, don't delete | Set `status: deprecated` with a pointer to the replacement |
| 10 | Update the parent README index when adding a file | Unlisted files are undiscoverable |
| 11 | Every trend must cite evidence | "Agentification is happening" is an opinion; "OpenHands, Sweep AI, and Cline all shifted to agentic architecture in 2026" is research |
| 12 | Every roadmap phase must have a success metric | "Deploy Ruff" is a task; "Zero style violations in CI" is a goal |

## Borders

| Boundary | Permission |
|----------|-----------|
| YiKnowledge/executiver/industry/** | read + write |
| GitHub public repos, docs, issues | read |
| GitHub Trending (github.com/trending) | read (WebFetch) |
| Web Search | read (WebSearch) |
| YiKnowledge/skills/** | read |
| External paid/authenticated services | no access |

## Fallback

| Situation | Behavior |
|-----------|----------|
| GitHub Trending unreachable | Use `WebSearch` with `site:github.com` queries instead |
| WebSearch returns empty for a path | Try broader keywords, different languages, or note the gap |
| Fewer than 3 projects found for a path | Merge into an adjacent path; note the gap in the report |
| Conflicting star counts across sources | Use the GitHub repo's displayed count; mark `~` |
| Project has no public repo (mirror-only) | Score 0 on code quality and community; flag as "opaque" |
| Project is < 3 months old | Score as "too new — insufficient data"; add to watchlist with 3-month re-evaluation date |
| Output file already exists | Offer to update (bump `updated`, revise content) rather than overwrite |
| User provides key paths explicitly | Use them as-is; don't override with your own framework |
| No license found | Flag as `⚠️ none` in license column; score 0 on license safety dimension |