---
description: "Self-test scene reference — all 6 self-test scenes with detailed descriptions and expected verification outputs."
---

# Self-Test Scenes Reference

## Scene 1: post-init-full-self-check
**Purpose**: Verify all artifacts from a fresh `/rui-init` run.
**Checks**: All 7 verify checks pass. CLAUDE.md, README.md, docs/ all present.
**Expected**: 7/7 pass.

## Scene 2: pre-commit-incremental-self-check
**Purpose**: Verify only changed files before commit.
**Checks**: Changed-files-only verification. Unchanged artifacts are skipped.
**Expected**: Changed artifacts pass relevant verify checks.

## Scene 3: doc-code-consistency
**Purpose**: Ensure documentation matches code.
**Checks**: Cross-reference all file paths in docs against actual filesystem.
**Expected**: Zero broken references, zero stale paths.

## Scene 4: security-surface-regression
**Purpose**: Detect security surface changes since last init.
**Checks**: Compare current `securitySurface` against baseline from last run.
**Expected**: No new un-reviewed surface dimensions.

## Scene 5: cross-story-integration-regression
**Purpose**: Verify cross-scene references are intact.
**Checks**: All inter-scene links resolve. No orphan scenes.
**Expected**: All cross-references valid.

## Scene 6: third-party-framework-service
**Purpose**: Document and verify third-party integrations.
**Checks**: All external dependencies cataloged with version, purpose, and risk level.
**Expected**: Complete third-party inventory with no unknowns.
