---
title: Skill Frontmatter Contract
aliases:
- skill-frontmatter-contract
- skill-metadata
- skill-yaml
tags:
- skill-author
- frontmatter
- metadata
- skill-design
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
benefit: "Skill frontmatter is consistent, machine-readable, and provides all metadata needed for discovery and invocation"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./skill-design-principles.md
- ./skill-versioning.md
- ./skill-hooks-and-permissions.md
tacit: false
---

# Skill Frontmatter Contract

> **As a** skill author, **I want to** define a standard frontmatter contract for skills, **so that** skill metadata is consistent, machine-readable, and sufficient for discovery, invocation, and governance.

> The frontmatter is the API of a skill. It's what the Claude Code harness reads to determine when and how to invoke the skill. Inconsistent frontmatter means inconsistent behavior. The contract below defines required, recommended, and optional fields.

## Summary

- Required fields: `name`, `description` — the minimum for skill discovery and invocation
- Recommended fields: `version`, `author`, `tags`, `requires` — for governance and dependency management
- Optional fields: `examples`, `see_also`, `deprecated`, `experimental` — for documentation and lifecycle
- Key principle: The `description` field is the most important — it determines when the skill is suggested to users
- The `name` field is the skill's identity. Changing it is a MAJOR breaking change.

## Core viewpoints

### 1. The description is the discovery mechanism

Claude Code uses the `description` field to determine whether to suggest a skill to the user. A good description answers: when should this skill be used (trigger context), what does it do (capability), and what's the outcome (value). A bad description means the skill is never suggested.

### 2. Required fields should be minimal

The minimum viable frontmatter is `name` and `description`. Every additional required field is a barrier to skill creation. Fields should be required only if the harness needs them to function correctly. Recommended fields should be strongly encouraged but not enforced.

### 3. The frontmatter is the public API; the prompt is the implementation

The frontmatter tells the harness and users what the skill does. The prompt tells Claude how to do it. These are separate concerns. Changing the prompt without changing the frontmatter is a PATCH. Changing the frontmatter (especially `description` or `name`) is at least MINOR.

### 4. Tags enable cross-cutting discovery

The `tags` field enables users to find skills by topic, not just by name. A user searching for "git" should find all git-related skills. Tags should be consistent across the skill ecosystem — use the same tag for the same concept across all skills.

### 5. The `requires` field enables dependency checking

If a skill depends on external tools, MCP servers, or other skills, declare them in `requires`. This enables the harness to check dependencies before invocation and provide clear error messages when dependencies are missing.

## Key info

### Full frontmatter specification

```yaml
---
# REQUIRED
name: skill-name              # Unique identifier, kebab-case, no spaces
description: >-               # One sentence: when, what, outcome
  When the user wants to [action], this skill [what it does]
  so that [outcome].

# RECOMMENDED
version: 1.0.0                # Semantic versioning
author: team-name             # Who maintains this skill
tags: [tag1, tag2]            # Discovery keywords
requires:                     # Dependencies
  tools: [Bash, Write]        # Required Claude Code tools
  mcp: [github]               # Required MCP servers
  skills: [yry-init]          # Required other skills

# OPTIONAL
examples:                     # Usage examples shown to users
  - "Create a new branch"
  - "Switch to main"
see_also: [other-skill]       # Related skills
deprecated: false             # Deprecation flag
deprecated_message: "..."     # Migration guidance
experimental: false           # Experimental feature flag
---
```

### Field descriptions

| Field | Required | Type | Description |
|---|---|---|---|
| `name` | Yes | string | Unique skill identifier, kebab-case |
| `description` | Yes | string | One sentence: trigger context, capability, outcome |
| `version` | Recommended | string | Semantic version (MAJOR.MINOR.PATCH) |
| `author` | Recommended | string | Team or person maintaining the skill |
| `tags` | Recommended | string[] | Discovery keywords, consistent across ecosystem |
| `requires` | Recommended | object | Dependencies: tools, MCP servers, other skills |
| `examples` | Optional | string[] | Usage examples for user documentation |
| `see_also` | Optional | string[] | Related skills |
| `deprecated` | Optional | boolean | Whether this skill is deprecated |
| `deprecated_message` | Optional | string | Migration guidance for deprecated skills |
| `experimental` | Optional | boolean | Whether this skill is experimental |

### Standard tags for the yry-* ecosystem

| Tag | Use For |
|---|---|
| `git` | Git operations |
| `npm` | Package management |
| `import` | Data import/sync |
| `brd` | Business requirements documents |
| `init` | Project initialization |
| `loop` | Recurring/polling operations |
| `cli` | CLI-focused skills |
| `api` | API-focused skills |
| `experimental` | Experimental features |

## Action recommendations

1. **Always include `name` and `description`**: These are the minimum. Everything else is optional but recommended.
2. **Write the description for the user, not the machine**: "When the user wants to create a git branch" is better than "git branch creation skill."
3. **Use consistent tags**: Check existing skills for tag conventions before creating new tags.
4. **Declare dependencies in `requires`**: This prevents "tool not found" errors at runtime.
5. **Add `examples` for discoverability**: Examples help users understand when to use the skill.

## Anti-patterns

- **Missing description**: Skill has a name but no description. The harness can't suggest it to users.
- **Vague description**: "Helps with git." Doesn't answer when, what, or outcome.
- **Inconsistent tags**: `git` in one skill, `version-control` in another, `scm` in a third. Standardize.
- **Undeclared dependencies**: Skill uses a tool or MCP server without declaring it in `requires`. Runtime errors.
- **Name changes without version bump**: Changing `name` is a MAJOR breaking change. It breaks all references.

## Related

- [Skill Design Principles](./skill-design-principles.md) — Architecture principles
- [Skill Versioning](./skill-versioning.md) — Version management
- [Skill Hooks and Permissions](./skill-hooks-and-permissions.md) — Hooks and permission design