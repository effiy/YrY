---
title: Skill Versioning and Migration Patterns
aliases:
- skill-versioning
- skill-migration
- skill-upgrade
- skill-changelog
tags:
- skill-author
- versioning
- migration
- changelog
- maintenance
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
benefit: "Skill changes are versioned, documented, and safely migrated without breaking existing users"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./skill-design-principles.md
- ./skill-testing-strategy.md
- ./skill-frontmatter-contract.md
tacit: false
---

# Skill Versioning and Migration Patterns

> **As a** skill author, **I want to** version skills and manage migrations safely, **so that** users get improvements without breaking changes and can understand what changed.

> Skills evolve. Prompts improve, workflows change, new features are added. Without versioning, users don't know what changed, regressions go undetected, and breaking changes surprise people. A simple versioning discipline prevents these problems.

## Summary

- Version format: `MAJOR.MINOR.PATCH` (semantic versioning adapted for skills)
- MAJOR: Breaking change in behavior, output format, or trigger phrases
- MINOR: New feature, new trigger phrase, non-breaking behavior change
- PATCH: Bug fix, clarification, typo fix, no behavior change
- Changelog: Every version change must have a changelog entry explaining WHAT changed and WHY
- Migration: MAJOR version changes require migration instructions for users

## Core viewpoints

### 1. Version the prompt, not just the code

The skill prompt is the primary artifact. If the prompt changes, the version must change. If only the supporting scripts change (same behavior, better implementation), that's a PATCH. If the prompt behavior changes (different output, different workflow), that's at least a MINOR.

### 2. Breaking changes require migration guides

A MAJOR version means the skill behaves differently. Users who relied on the old behavior need to know: (1) what changed, (2) why it changed, (3) how to adapt their workflow. A MAJOR version without a migration guide is a user-hostile change.

### 3. The changelog is the user's primary change detection mechanism

Users don't diff skill prompts. They read changelogs. Every version change must have a one-line summary that a user can understand. "Refactored prompt structure" is useless. "Fixed: skill now correctly handles branch names with hyphens" is useful.

### 4. Deprecation before removal

If a feature or trigger phrase is being removed, deprecate it for one MINOR version before removing it in the next MAJOR. During the deprecation period, the skill should still respond to the old trigger but add a deprecation notice. This gives users time to adapt.

### 5. Backward compatibility is a feature

Before making a MAJOR change, ask: "Can I achieve the same improvement with a backward-compatible change?" Adding a new trigger phrase is MINOR. Removing an old trigger phrase is MAJOR. Adding a new output field is MINOR. Changing the output format is MAJOR.

## Key info

### Version decision examples

| Change | Version Bump | Reason |
|---|---|---|
| Fix typo in prompt | PATCH | No behavior change |
| Clarify instruction | PATCH | No behavior change |
| Add new trigger phrase | MINOR | New feature, backward compatible |
| Add new workflow step | MINOR | New feature, old behavior still works |
| Improve error message | MINOR | Behavior change, backward compatible |
| Change output format | MAJOR | Breaking change for users parsing output |
| Remove trigger phrase | MAJOR | Breaking change — users rely on that trigger |
| Change default behavior | MAJOR | Breaking change — same input, different output |

### Changelog format

```markdown
# Changelog

## [1.2.0] - 2026-08-07
### Added
- New trigger phrase: "create feature branch" now also triggers on "start feature"
### Changed
- Branch creation now confirms the branch name before creating
### Fixed
- Skill no longer creates branches with uppercase letters (invalid in git)

## [1.1.0] - 2026-07-15
### Added
- Support for creating branches from any base branch, not just main
### Deprecated
- `create-branch` command. Use `branch create` instead. Will be removed in 2.0.0.

## [1.0.0] - 2026-07-01
### Added
- Initial release: create, switch, delete, and list branches
```

### Migration guide template (for MAJOR versions)

```markdown
# Migration Guide: v1.x → v2.0.0

## What changed
- [Breaking change 1]: Old behavior → New behavior
- [Breaking change 2]: Old behavior → New behavior

## Why
- [Reason for change 1]
- [Reason for change 2]

## How to migrate
### If you were using [old feature]:
Before: `[old command]`
After: `[new command]`

### If you were using [old trigger]:
The trigger `[old phrase]` has been removed. Use `[new phrase]` instead.

## Timeline
- v1.x: Deprecated (still works, shows migration notice)
- v2.0.0: Old behavior removed
```

## Action recommendations

1. **Start versioning from 1.0.0**: Don't wait until the skill is "stable." Version from the first deployment.
2. **Keep a changelog**: One file (`CHANGELOG.md`) in the skill directory. Update it with every change.
3. **Deprecate before removing**: Give users at least one MINOR version of deprecation notice before removing features.
4. **Write migration guides for MAJOR versions**: One `MIGRATION.md` file that explains what changed, why, and how to adapt.
5. **Tag versions in git**: `git tag skill-name/v1.2.0` so users can pin to specific versions.

## Anti-patterns

- **No versioning**: Changing the skill prompt without tracking versions. Users can't tell what changed or when.
- **Silent breaking changes**: MAJOR behavior changes without a version bump. Users' workflows break without warning.
- **No changelog**: Version numbers without explanations. "v1.2.0" tells users nothing about what changed.
- **No migration guide**: MAJOR version with breaking changes and no guidance. Users are left to figure it out themselves.
- **Version inflation**: Bumping MAJOR for every change. MAJOR means breaking; use MINOR and PATCH for most changes.
- **No deprecation period**: Removing features immediately. Give users time to adapt.

## Related

- [Skill Design Principles](./skill-design-principles.md) — Architecture principles
- [Skill Testing Strategy](./skill-testing-strategy.md) — Regression testing for version changes
- [Skill Frontmatter Contract](./skill-frontmatter-contract.md) — Version in frontmatter