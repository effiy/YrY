---
title: Claude Code tips
aliases:
- claude-code-tips
- claude-cli-best-practices
tags:
- tools
- Claude Code
- AI development
- subagents
- skills
category: engineer/engineering
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- engineer
benefit: tooling trustworthy
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./biome-eslint-prettier.md
- ./vllm-ollama-deployment.md
- ../../new-hire/onboarding/template.md
tacit: false
---

# Claude Code tips

> **As an** engineer, **I want to** claude code tips, **so that** tooling trustworthy.

> Anthropic's official CLI lets Claude read and write files in the terminal, run commands, and interact with Git / GitHub.

## Summary

- Suitable scenarios: search and refactor in medium-to-large codebases, cross-file batch modification, complex multi-step tasks, PR/Issue operations, personal development flow.
- Key extension mechanisms: Skills (custom slash commands), Subagents (parallel / isolated context), Hooks (event hooks), MCP servers (external tools), Settings.json (permissions / env / hooks).
- Best practices: CLAUDE.md project briefing, configure permissions per team risk preference, use subagents for independent tasks, use plan mode for large tasks.
- Common commands: `/clear` (clear context), `/compact` (compress), `/cost`, `/model`, `/init`, `/review`, `/loop`, `!` shell, `#` memory, `@` file reference.
- Comparison with alternatives: Claude Code is terminal-native with strong extensions; Cursor has good IDE integration; Copilot is enterprise-popular; Aider is open-source and git-friendly.

## Core viewpoints

- **CLAUDE.md is the single highest-leverage 30-minute investment in a project** — A well-written CLAUDE.md (architecture, conventions, commands, key paths) turns Claude from a generic assistant into a project-aware developer. Without it, Claude spends the first 5-10 turns of every session learning the project structure, consuming context and tokens. With it, Claude can start contributing within the first turn. The ROI is measured in tokens saved per session, not minutes saved per developer.

- **Subagents are not parallel execution — they are context isolation** — The primary value of subagents is not that they run in parallel (though they can), but that each subagent has its own clean context window. This prevents a 50-file refactor from polluting the main session's understanding of the codebase. A subagent that modifies 10 files returns only a summary to the main session, keeping the main context focused on the task at hand.

- **Permission configuration is a team culture lever, not just a security control** — `allow` lists encode what the team trusts Claude to do autonomously; `deny` lists encode what the team reserves for human judgment. A team that `allow`s `git commit` but `deny`s `git push --force` is saying "Claude can contribute, but humans own deployment." This is a cultural decision, not a technical one.

- **Hooks are the most underutilized mechanism in Claude Code** — PreToolUse hooks can intercept dangerous commands before execution, PostToolUse hooks can auto-format, auto-lint, and auto-write commit messages. A team that invests in hooks once encodes their entire process into Claude's workflow, making every session follow team conventions automatically.

- **Plan mode is not about Claude's ability — it's about human alignment** — Claude can execute a 20-file refactor without a plan, but the human reviewer cannot review 20 files without understanding the strategy. Plan mode forces Claude to articulate the strategy before execution, giving the human a chance to correct course. The cost is one extra turn; the benefit is that the human never receives a surprise refactor.


- CLAUDE.md is the entry point for Claude to understand the project — write architecture / conventions / commands / key paths at the project root, within a few hundred lines.
- Subagents are key for large tasks — use Agents to isolate context for independent tasks so the main context does not overflow, with parallel execution.
- Plan mode prevents large tasks from drifting — EnterPlanMode lets Claude write a plan, align, then execute.
- Permission configuration reduces prompts and prevents mis-operations — `allow` common commands, `deny` dangerous commands (`rm -rf *` / `git push --force`).
- Hooks encode team processes — PreToolUse intercepts dangerous commands, PostToolUse formats / lints / auto-writes commit messages.

## Key information

### Key features

| Feature | Use |
|---|---|
| `/help` | Built-in help |
| `/clear` | Clear current session context |
| `/init` | Generate CLAUDE.md project briefing |
| `/review` | Review a PR |
| `/loop` | Scheduled recurring task (monitoring class) |
| Skills | User custom slash commands |
| Subagents | Sub-agents (parallel / isolated context) |
| Hooks | Event hooks (pre / post tool) |
| MCP servers | Connect external tools |
| Settings.json | Permission, env, hooks configuration |

### Permission configuration example

```json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Bash(git status)", "Bash(git log)"],
    "deny": ["Bash(rm -rf *)", "Bash(git push --force:*)"]
  }
}
```

Adjust per team risk preference to reduce permission prompts.

### Common shortcuts / commands

| Command | Effect |
|---|---|
| `/clear` | Clear context |
| `/compact` | Compress context (keep summary) |
| `/cost` | View this session's spend |
| `/model` | Switch model |
| `/fast` | Switch to Opus 4.6 fast mode |
| `!` prefix | Run shell command directly |
| `#` prefix | Add memory |
| `@` prefix | Reference file / directory |

### Comparison with alternatives

| Tool | Advantage | Disadvantage |
|---|---|---|
| Claude Code | Terminal-native, strong sub-agents / skills / hooks | Bound to Anthropic models |
| Cursor | IDE integration, friendly UI | Weak at terminal tasks |
| GitHub Copilot | Built into VS Code, enterprise-popular | Weak single-file context |
| Aider | Open source, git-friendly | Less capable than Claude Code |

### Applicable scenarios

- Code search and refactor in medium-to-large codebases
- Cross-file batch modification
- Multi-step execution of complex tasks
- PR / Issue operations
- Engineer personal development flow

## Action recommendations

1. Write CLAUDE.md at the project root (architecture / conventions / commands / key paths, within a few hundred lines)
2. Configure `permissions`: `allow` common commands, `deny` dangerous commands
3. Use Subagents for independent tasks to isolate context and avoid main context overflow
4. Use EnterPlanMode for large tasks so Claude writes a plan, align, then execute
5. Encode team processes as Skills (e.g. yry-* series)
6. Hooks periodic review: PreToolUse intercepts danger, PostToolUse formats / lints
7. Keep files modified at once <= 5, batch + test
8. Use Claude Code to accelerate new hire onboarding (read CLAUDE.md + run setup)

## Anti-patterns

- **Skipping CLAUDE.md because "Claude can figure it out"** — Claude without CLAUDE.md spends the first 5-10 turns of every session learning the project, consuming context and tokens. The 30-minute investment in CLAUDE.md pays back in the first 3-5 sessions. Every session without CLAUDE.md is a session that starts from zero.

- **Not using subagents for independent tasks** — A 50-file refactor in the main session pollutes the context window, causing Claude to lose track of earlier decisions. Subagents isolate context: each subagent modifies its files and returns only a summary, keeping the main session focused.

- **Permissions too loose** — `allow`ing `Bash(*)` or `Bash(git *)` means Claude can run `rm -rf *` or `git push --force`. The permission list should be specific: `Bash(npm run test:*)` not `Bash(npm *)`.

- **Modifying more than 5 files in a single turn** — Context loss compounds with each file modified. After 10 files, Claude loses track of the overall strategy and starts introducing inconsistencies. Batch changes into groups of 3-5 files, test, then continue.

- **Hooks that block normal work** — A PreToolUse hook that requires confirmation for every `git commit` trains developers to bypass the hook. Hooks should be silent for trusted operations and only prompt for dangerous ones. Periodic review of hook effectiveness prevents drift.

## Related

- Same class: [Biome / ESLint / Prettier comparison](./biome-eslint-prettier.md), [vLLM / Ollama deployment tips](./vllm-ollama-deployment.md)
- Upstream: [New hire onboarding template](../../new-hire/onboarding/template.md) (CLAUDE.md is required onboarding reading)
- Downstream: Each project's CLAUDE.md (YiAi / YiVad / YiPet)
- References: Claude Code official documentation, Anthropic *Best Practices for Agentic Workflows*, built-in `/help`
