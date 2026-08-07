---
title: Skill Hooks and Permissions Design
aliases:
- skill-hooks-and-permissions
- skill-hooks
- skill-permissions
- hook-design
tags:
- skill-author
- hooks
- permissions
- security
- claude-code
category: skill-author/patterns
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- skill-author
- engineer
benefit: "Skill hooks and permissions are designed securely, providing automation without compromising safety"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./skill-design-principles.md
- ./skill-frontmatter-contract.md
- ./skill-testing-strategy.md
tacit: false
---

# Skill Hooks and Permissions Design

> **As a** skill author, **I want to** design hooks and permissions that automate workflows safely, **so that** skills can respond to events and execute actions without compromising security or user trust.

> Hooks enable skills to react to events (tool calls, session start/stop, user prompts). Permissions control what skills can do. Together, they enable powerful automation but require careful design to prevent unintended behavior, security vulnerabilities, and user confusion.

## Summary

- Hooks are event handlers that execute in response to Claude Code lifecycle events (tool calls, session events, user prompts)
- Permissions control which tools and actions a skill can execute without user approval
- Design principle: Least privilege. A skill should only have the permissions it needs to function.
- Key tension: Automation (fewer prompts) vs. safety (more prompts). Resolve in favor of safety for destructive operations.
- Hooks are configured in `settings.json`, not in the skill prompt. The skill prompt describes what hooks it expects; the user configures them.

## Core viewpoints

### 1. Hooks are user-configured, not skill-enforced

A skill cannot install its own hooks. The skill prompt can recommend hooks ("this skill works best with a pre-tool-call hook"), but the user must explicitly configure them in `settings.json`. This separation prevents skills from silently modifying system behavior.

### 2. The permission boundary is the user's safety net

Every permission you request is a trust decision. Request too many permissions and users will reject the skill. Request too few and the skill won't work. The sweet spot: request exactly what the skill needs to function, explain why each permission is needed, and offer a less-permissive fallback mode.

### 3. Hook timing matters

Pre-tool-call hooks can validate or block actions before they execute (safety). Post-tool-call hooks can react to results (automation). Pre-session hooks can set up context. Post-session hooks can clean up. Choose the right hook timing for the job.

### 4. Destructive operations need explicit confirmation

Any hook that can delete data, modify production systems, or push code should require explicit user confirmation. "Automated" does not mean "unsupervised." The user should always know when a destructive action is about to happen.

### 5. Hooks should be idempotent and timeout-safe

A hook may be called multiple times for the same event (retries). It may be killed mid-execution (timeout). Design hooks to handle both cases gracefully: re-running should be safe, interruption should leave the system in a clean state.

## Key info

### Hook types and use cases

| Hook | Triggers On | Use Case | Risk Level |
|---|---|---|---|
| `PreToolCall` | Before a tool executes | Validate tool arguments, block dangerous operations | Low (read-only) |
| `PostToolCall` | After a tool executes | Log results, trigger follow-up actions | Medium (can modify state) |
| `PreSessionStart` | Before a session begins | Load context, set environment variables | Low |
| `PostSessionEnd` | After a session ends | Cleanup, save state, send notifications | Medium |
| `PrePromptSubmit` | Before user prompt is processed | Enrich prompt, add context | Low |
| `Notification` | On system notifications | React to events, trigger workflows | Medium |

### Permission design template

```markdown
## Permissions

This skill requires the following permissions:

| Permission | Why Needed | Fallback if Denied |
|---|---|---|
| Bash (read-only) | Run `git status`, `git log` | Manual: user copies output |
| Bash (write) | Create branches, commits | Manual: user runs git commands |
| Write | Create/modify skill files | Manual: user edits files |
| MCP: github | Create PRs, read issues | Manual: user uses gh CLI |

### Recommended hooks

Add to `settings.json`:
```json
{
  "hooks": {
    "PreToolCall": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "validate-git-command.sh"
        }]
      }
    ]
  }
}
```
```

### Security checklist for hooks

- [ ] Does the hook validate all inputs before executing?
- [ ] Is the hook idempotent (safe to run twice)?
- [ ] Does the hook have a timeout (max 30 seconds)?
- [ ] Does the hook handle errors gracefully (no crash, no silent failure)?
- [ ] Does the hook log what it did (for debugging and audit)?
- [ ] Is the hook's purpose documented in the skill prompt?
- [ ] Does the hook require the minimum necessary permissions?

## Action recommendations

1. **Start with no hooks, add them when needed**: A skill should work without hooks first. Hooks are optimization, not foundation.
2. **Document every permission request**: Explain why each permission is needed and what the skill can't do without it.
3. **Provide a manual fallback for every automated action**: If the user denies a permission, the skill should still work (with manual steps).
4. **Test hooks with malformed inputs**: What happens if the tool output is empty, malformed, or unexpectedly large?
5. **Review hook permissions quarterly**: Permissions that were needed at launch may no longer be necessary.

## Anti-patterns

- **Over-permissioned skills**: Requesting write access when read-only would suffice. Start with least privilege.
- **Silent hooks**: Hooks that modify state without the user's knowledge. Every automated action should be logged and visible.
- **No fallback**: Skill breaks completely if a permission is denied. Always provide a manual path.
- **Hook as business logic**: Putting complex logic in hooks instead of the skill prompt. Hooks are for validation and automation, not business logic.
- **No timeout**: Hooks that can hang indefinitely. Every hook should have a timeout.
- **User-unaware hooks**: Configuring hooks without the user understanding what they do. Hooks should be explicitly configured by the user.

## Related

- [Skill Design Principles](./skill-design-principles.md) — Architecture principles
- [Skill Frontmatter Contract](./skill-frontmatter-contract.md) — Metadata including dependency declarations
- [Skill Testing Strategy](./skill-testing-strategy.md) — Testing hooks and permissions