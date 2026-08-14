---
name: code-quality-research
description: Use this skill when evaluating, comparing, or selecting open-source AI-powered code quality tools. Covers intelligent code review, automated test generation, assisted refactoring, and code style alignment. Provides a structured framework for tool selection with adoption roadmaps.
metadata:
  source: YiKnowledge/executiver/industry/market-trends/README.md
  review_cycle: monthly
  roles:
    - executiver
    - engineer
---

# Code Quality Research Skill

Survey, evaluate, and select open-source AI tools across the four key paths of code quality improvement. Use this skill to make evidence-based tooling decisions, not gut-feel picks.

## When to Activate

- Choosing an AI code review tool for the team
- Evaluating test generation solutions for a specific language stack
- Comparing refactoring tools (Aider vs Cline vs OpenHands)
- Setting up code style enforcement (linter + formatter + AI layer)
- Building a phased adoption roadmap for AI-assisted development
- Re-evaluating the toolchain when a new entrant gains traction
- Answering "should we adopt X for code quality"

## Four Key Paths

Every code quality tooling decision maps to one of these four paths. Start by identifying which path(s) the current need falls into.

| Path | Scope | Primary Keywords | Secondary Keywords |
|------|-------|-----------------|-------------------|
| **Intelligent Code Review** | Auto-detect bugs and style violations in PRs | `AI code review`, `PR review bot` | `automated bug detection`, `LLM code reviewer` |
| **Automated Test Generation** | Generate unit/integration tests to improve coverage | `AI test generation`, `automated unit testing` | `LLM test writing`, `test coverage AI` |
| **Assisted Code Refactoring** | Simplify redundant logic and optimize performance | `AI code refactoring`, `AI pair programming` | `code optimization AI`, `multi-file refactor` |
| **Code Style Alignment** | Ensure consistent codebase style | `AI linter`, `LLM code formatter` | `style consistency tool`, `semantic linting` |

## Quick Decision Matrix

Use this table to narrow choices before deep-diving.

| Path | Primary Pick | Alternative | Maturity | Self-Hosted |
|------|-------------|-------------|----------|-------------|
| Intelligent Code Review | [PR-Agent](https://github.com/Codium-ai/pr-agent) | [CodeRabbit](https://github.com/coderabbitai/ai-pr-reviewer) | High | Yes |
| Automated Test Generation | [Qodo](https://github.com/Codium-ai) / [Aider](https://github.com/paul-gauthier/aider) | [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Medium-High | Yes |
| Assisted Code Refactoring | [Aider](https://github.com/paul-gauthier/aider) + [Cline](https://github.com/cline/cline) | [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Medium-High | Yes |
| Code Style Alignment | [Ruff](https://github.com/astral-sh/ruff) / [Biome](https://github.com/biomejs/biome) | [SonarQube](https://github.com/SonarSource/sonarqube) + [GPTLint](https://github.com/nicepkg/gptlint) | High | Yes |

## Scenario-Based Selection

### FAIL: One-Size-Fits-All Picks
```
"We'll just use GitHub Copilot for everything."
→ Copilot doesn't review PRs, doesn't generate tests, doesn't enforce style.
  One tool cannot cover all four paths.
```

### PASS: Path-Specific Selection
```
Code Review: "We use GitHub + GitLab → PR-Agent (multi-platform)"
Test Generation: "We're a Java shop → Diffblue Cover"
Refactoring: "CLI-first team → Aider; VS Code team → Cline"
Style: "Python → Ruff; Frontend → Biome"
```

## Project Evaluation Checklist

When evaluating a specific tool, verify each dimension before adopting.

### Triage (halt if any red flag)

- [ ] Last release within 12 months (stale → skip)
- [ ] License is permissive (MIT, Apache-2.0) — copyleft (AGPL) flagged
- [ ] Stars > 100 or org-backed (solo + < 100 stars → high risk)
- [ ] No known unpatched CVEs
- [ ] Public repo with readable code

### Deep-Dive (if triage passes)

- [ ] Test coverage visible (CI badge, coverage config)
- [ ] Lockfile present and dependencies pinned
- [ ] CI/CD pipeline active (actions/workflows present, passing)
- [ ] Security policy (SECURITY.md, private reporting enabled)
- [ ] Bus factor: Org > Team > Small > Solo (flag solo regardless of score)

### Adoption Risk Score (0-100)

| Dimension | Weight | Check |
|-----------|--------|-------|
| License safety | 25% | Permissive = 25; copyleft = 10; none = 0 |
| Maintenance | 30% | Release < 3mo = 30; < 6mo = 20; < 12mo = 10; > 12mo = 0 |
| Community | 25% | Org-backed + active PRs = 25; team + issues answered = 18; solo = 8 |
| Vendor neutrality | 20% | Foundation/community = 20; single-vendor open = 12; single-vendor controlled = 5 |

**80+**: Safe to adopt · **60-79**: Monitor before adopting · **40-59**: High risk · **< 40**: Avoid

## Key Technology Trends

When evaluating the landscape, watch for these signals.

### 1. Agentification
**Signal**: Tools shifting from single-point to autonomous agents (OpenHands, Sweep AI, Cline).
**Evidence**: OpenHands, Sweep AI, and Cline all shifted to agentic architecture in 2025-2026.
**Implication**: Evaluate sandbox safety before adopting agentic tools. AI moves from "advisor" to "executor."

### 2. Local / Self-Hosted
**Signal**: Growing demand for privacy-preserving, local LLM-based tools.
**Evidence**: Tabby, Continue, and Ollama integrations support fully local workflows.
**Implication**: Self-hosted options eliminate data leakage risk for compliance-sensitive orgs.

### 3. Multi-LLM
**Signal**: Tools support GPT-4, Claude, Gemini interchangeably.
**Evidence**: PR-Agent, Aider, OpenHands all support multiple backends.
**Implication**: Avoid vendor lock-in. Prefer tools that let you switch models.

### 4. Traditional + AI Dual Layer
**Signal**: Deterministic linters (Ruff, Biome) paired with AI semantic linting (GPTLint).
**Evidence**: GPTLint rules catch what ESLint/Ruff can't — semantic anti-patterns.
**Implication**: Don't replace traditional tools; add AI as a second layer.

### 5. CI/CD Deep Integration
**Signal**: Out-of-the-box GitHub Action / GitLab CI workflows.
**Evidence**: PR-Agent, CodeRabbit, CodeQL all ship with ready-to-use CI configs.
**Implication**: Prefer tools with native CI integration over DIY webhook setups.

## Adoption Roadmap

### Phase 1 — Foundation (Weeks 1-2)
**Goal**: Zero style violations in CI.
**Tools**: Ruff (Python) + Biome (frontend) + pre-commit hooks.
**Metric**: CI pipeline blocks on style violations.

### Phase 2 — Review (Weeks 3-4)
**Goal**: Every PR gets automated review before human review.
**Tools**: PR-Agent (multi-platform) or CodeRabbit (GitHub-only).
**Metric**: > 90% of PRs have AI review comments; < 5% false positive rate.

### Phase 3 — Refactor + Test (Weeks 5-8)
**Goal**: AI-assisted refactoring and test generation for new features.
**Tools**: Aider (CLI) or Cline (VS Code) for refactoring; Qodo or Diffblue for test generation.
**Metric**: Test coverage increases by 10%+; refactoring time reduced by 30%+.

### Phase 4 — Continuous Evaluation (Ongoing)
**Goal**: Monitor emerging tools; adopt full-flow automation when ready.
**Action**: Re-run this skill monthly. Check GitHub Trending for new entrants.
**Metric**: Quarterly tooling review with updated comparison tables.

## Rules

| # | Rule | Why |
|---|------|-----|
| 1 | Every tool must have a GitHub URL | Unverifiable claims are not research |
| 2 | Star counts are approximate (`~`), never exact | Stars change daily; exact numbers rot |
| 3 | Search per path independently | One broad search misses specialized tools |
| 4 | Include non-Western ecosystem projects | GitHub's English-language bias hides major projects |
| 5 | Score with evidence, not intuition | "4/5 docs" is meaningless without citing what you saw |
| 6 | Last release > star count for safety | Active 500★ project beats stale 10k★ one |
| 7 | Flag solo maintainers regardless of score | Bus factor of 1 is material risk |
| 8 | Record evaluation date | Scores decay; projects get abandoned |
| 9 | Deprecate, don't delete | Set `status: deprecated` with replacement pointer |
| 10 | Update the parent index when adding files | Unlisted files are undiscoverable |

## Borders

| Boundary | Permission |
|----------|-----------|
| GitHub public repos, docs, issues | read |
| GitHub Trending | read |
| Web Search | read |
| YiKnowledge/executiver/industry/** | read + write |
| YiKnowledge/skills/** | read |

## Resources

- [GitHub Trending](https://github.com/trending)
- [OWASP Code Review Guide](https://owasp.org/www-project-code-review-guide/)
- [AI Code Quality Landscape (full report)](../../executiver/industry/market-trends/README.md)