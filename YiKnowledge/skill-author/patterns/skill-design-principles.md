---
title: Skill Design Principles
aliases:
- skill-design-principles
- claude-code-skill-design
- skill-architecture
tags:
- skill-author
- skill-design
- claude-code
- patterns
- architecture
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
benefit: "Claude Code skills are designed with consistent principles that maximize reusability, maintainability, and user experience"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./yry-skill-family.md
- ./writing-skill-prompts.md
- ./skill-testing-strategy.md
- ./skill-versioning.md
tacit: false
---

# Skill Design Principles

> **As a** skill author, **I want to** design Claude Code skills following consistent principles, **so that** skills are reusable, maintainable, and provide a coherent user experience.

> A well-designed skill is a focused capability module that extends Claude Code's behavior for a specific domain or workflow. The design principles below are derived from building the yry-* skill family (yry-init, gen-brd, import, git, npm, loop, etc.).

## Summary

- Single responsibility: Each skill does one thing well. If a skill's description needs "and," consider splitting it.
- Composable: Skills should work together. A skill can invoke other skills as subroutines.
- Self-documenting: The skill's description and prompt are the documentation. A user should understand what the skill does from its name and description alone.
- Idempotent: Running the same skill twice with the same inputs should produce the same result or be safe to re-run.
- Fail-safe: Skills should handle errors gracefully, provide clear error messages, and never leave the system in a broken state.
- The yry-* naming convention: `yry-` prefix for project-specific skills, descriptive kebab-case names.

## Core viewpoints

### 1. Skills are capabilities, not scripts

A skill is not a shell script wrapped in a pretty interface. It's a capability module that combines: domain knowledge (what the skill knows), workflow logic (what the skill does), and behavior modification (how Claude behaves when the skill is active). The skill's prompt is the primary interface; executable scripts are implementation details.

### 2. The description is the contract

A skill's description in the available-skills list is the user's primary discovery mechanism. It must answer three questions in one sentence: When should I use this skill? (trigger) What does it do? (capability) What's the outcome? (value). If the description is unclear, the skill will never be invoked.

### 3. Composable skills are more valuable than monolithic skills

A skill that invokes other skills (via the Skill tool) creates a capability graph. For example, `gen-brd` invokes `yry-init` for context loading. This composition means each skill stays focused while the system as a whole handles complex workflows. Monolithic skills that do everything themselves are harder to maintain and reuse.

### 4. The user story format is the skill's mental model

Every skill should be structured around a user story: "As a [role], I want to [action], so that [outcome]." This format forces clarity about who the skill serves, what it does, and why. It also makes the skill discoverable — users can search for skills by role or outcome.

### 5. Skills should be stateless where possible

Skills that depend on persistent state (files, environment variables, external services) are harder to test and debug. Prefer stateless skills that take inputs and produce outputs. When state is necessary (e.g., `loop` skill's cron state), isolate it and document it explicitly.

## Key info

### Skill anatomy

```
skill-name/
  skill.md          # The skill prompt (loaded when skill is invoked)
  README.md         # Human-readable documentation
  rules/            # Optional: rules that modify Claude's behavior
  scripts/          # Optional: executable scripts
  templates/        # Optional: output templates
```

### Skill prompt structure

```markdown
---
name: skill-name
description: One sentence that answers: when, what, outcome
---

# Skill Name

> **As a** [role], **I want to** [action], **so that** [outcome].

## When to use
- Trigger condition 1
- Trigger condition 2

## What it does
1. Step 1
2. Step 2
3. Step 3

## Output
- What the user gets

## Dependencies
- Other skills or tools needed

## Examples
- Example usage 1
- Example usage 2
```

### Design decision tree

| Decision | Options | Recommendation |
|---|---|---|
| Skill vs. slash command? | Skill = complex workflow; Slash = simple action | Start as slash, graduate to skill when logic exceeds 10 lines |
| Skill vs. MCP tool? | Skill = Claude-driven; MCP = external system | Use MCP for external APIs, skills for Claude workflows |
| One skill or many? | Monolithic vs. composable | Default to composable. Split when description needs "and." |
| yry- prefix or not? | yry-* for project-specific; generic for reusable | yry-* for internal tools; generic names for open-source potential |

### The yry-* skill family

| Skill | Purpose | Composes |
|---|---|---|
| `yry-init` | Project initialization with CODEBUDDY.md | Standalone |
| `gen-brd` | Generate BRD entries in YiVad | Invokes `yry-init` |
| `import` | Sync local docs to remote API | Standalone |
| `git` | Git version control operations | Standalone |
| `npm` | Personal npm package management | Standalone |
| `loop` | Recurring prompt scheduling | Standalone |

## Action recommendations

1. **Start with the user story**: Before writing a single line, write the user story. If you can't articulate it clearly, the skill isn't ready.
2. **Write the description first**: The description determines discoverability. Test it: can a colleague understand when to use this skill from the description alone?
3. **Design for composition**: Can this skill invoke or be invoked by other skills? If not, is it truly standalone or just not designed for composition?
4. **Test with real scenarios**: Don't just test the happy path. Test: missing inputs, wrong inputs, partial failures, and re-runs.
5. **Document with examples**: Every skill should have at least 2 usage examples showing different scenarios.

## Anti-patterns

- **Kitchen-sink skills**: One skill that does 5 different things. Split into composable skills.
- **No user story**: Skill has no clear user, action, or outcome. Users can't discover it.
- **Hard-coded paths**: Skill references absolute paths or environment-specific values. Use relative paths and configuration.
- **Silent failures**: Skill fails without error messages. Always communicate what went wrong and what to do about it.
- **No idempotency**: Running the skill twice causes errors or duplicate work. Design for safe re-runs.
- **Over-engineering**: A 500-line skill for a task that could be a 10-line slash command. Start simple.

## Related

- [YrY Skill Family](./yry-skill-family.md) — The yry-* skill ecosystem
- [Writing Skill Prompts](./writing-skill-prompts.md) — Prompt engineering for skills
- [Skill Testing Strategy](./skill-testing-strategy.md) — How to test skills
- [Skill Versioning](./skill-versioning.md) — Versioning and migration patterns