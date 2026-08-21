---
title: git-worktree
name: git-worktree
description: >
  Use git worktrees for parallel development on the YrY monorepo. Worktrees
  let you check out multiple branches simultaneously in separate directories,
  each with its own working tree — ideal for handling hotfixes while mid-feature,
  reviewing PRs locally without stashing, or running parallel subagent tasks
  in isolated environments. Use this skill when the user needs to work on
  multiple branches at once, or when `/subagent-dev` needs isolated workspaces.
  Trigger words: git worktree, worktree, 工作树, 多分支, parallel branch,
  同时开发, 多任务并行, hotfix while working, switch branch without stash.
  Do NOT trigger for: simple branch switching (use `git switch`), or when
  the user just wants to create a branch.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/git-worktree
review_cycle: quarterly
roles:
  - engineer
  - aier
tags:
  - skill
  - ai
  - git
  - worktree
  - parallel
chip: ai-workflow
---

# git-worktree

> Parallel development with git worktrees. Inspired by superpowers'
> using-git-worktrees and finishing-a-development-branch — adapted for
> the YrY monorepo's multi-project layout.

## What this skill does

- Guide the user through creating, using, and cleaning up git worktrees.
- Enable parallel work: hotfix on one branch while a feature is in progress
  on another.
- Provide isolated workspaces for subagent tasks (each subagent gets its
  own worktree).
- Handle the monorepo reality: worktrees share the same `.git` but have
  independent working directories.
- Guide branch cleanup and merge decisions after work is complete.

## What this skill does NOT do

- Does NOT replace `git switch` or `git stash` for simple branch changes.
- Does NOT replace the project's branching strategy — worktrees are a tool,
  not a workflow.
- Does NOT manage worktrees automatically — the user decides when to create
  and remove them.

## Workflow

```
Need to work on two branches simultaneously
  → Create a worktree for the second branch
      git worktree add ../YrY-hotfix hotfix/bug-123
  → Work in both directories independently
      Main work:  /Users/ruiyi/YrY (feature branch)
      Hotfix:     /Users/ruiyi/YrY-hotfix (hotfix branch)
  → When done with the hotfix:
      git worktree remove ../YrY-hotfix
      (or) git worktree remove ../YrY-hotfix --force (if dirty)
```

### Common patterns

#### Pattern 1: Hotfix while mid-feature

```bash
# You're working on a feature branch in YrY/
# A production bug comes in

# Create a worktree for the hotfix
git worktree add ../YrY-hotfix main
cd ../YrY-hotfix
git switch -c hotfix/critical-bug

# Fix the bug, commit, push, create PR
# Come back to your feature
cd ../YrY
# Your working directory is untouched — no stash needed

# Clean up
git worktree remove ../YrY-hotfix
```

#### Pattern 2: PR review without stash

```bash
# You have uncommitted changes in YrY/
# You need to review a PR locally

git worktree add ../YrY-review pr-review
cd ../YrY-review
git fetch origin pull/123/head:pr-123
git switch pr-123

# Review the code, run tests, approve
# Come back to your work
cd ../YrY
# Uncommitted changes are still there

git worktree remove ../YrY-review
```

#### Pattern 3: Subagent isolation

```bash
# Subagent A works on YiVad, Subagent B works on YiPet
# Create isolated worktrees for each

git worktree add ../YrY-subagent-a feature/yi-vad-change
git worktree add ../YrY-subagent-b feature/yi-pet-change

# Subagent A works in ../YrY-subagent-a
# Subagent B works in ../YrY-subagent-b
# No risk of file conflicts between subagents

# After both complete, merge results
git worktree remove ../YrY-subagent-a
git worktree remove ../YrY-subagent-b
```

### YrY-specific worktree rules

1. **Worktrees go in the parent directory**: `../YrY-<purpose>` keeps them
   alongside the main repo, not inside it.
2. **One purpose per worktree**: `YrY-hotfix`, `YrY-review`, `YrY-subagent-N`.
   Don't reuse a worktree for a different purpose.
3. **Clean up promptly**: Stale worktrees clutter the filesystem and confuse
   `git worktree list`. Remove them when the work is done.
4. **Monorepo awareness**: A worktree contains the entire monorepo (YiVad,
   YiAi, YiPet, YiKnowledge). If you only need one sub-project, the worktree
   still has all of them — that's fine; the isolation is worth the disk space.
5. **Node modules**: Each worktree shares the same `.git` but has its own
   working directory. `node_modules/` in each sub-project needs `pnpm install`
   or `npm install` separately (they're gitignored, not shared).
6. **Claude Code worktrees**: Claude Code has built-in worktree support via
   `EnterWorktree`/`ExitWorktree`. Use that for agent-managed isolation;
   use manual worktrees when you're doing the work yourself.

### Branch cleanup after merge

After a worktree's branch is merged:

```bash
# List all worktrees
git worktree list

# Remove the worktree
git worktree remove ../YrY-<purpose>

# Prune the worktree metadata (if the directory was manually deleted)
git worktree prune

# Delete the merged branch (optional)
git branch -d <branch-name>
```

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | One purpose per worktree | Reusing worktrees causes confusion |
| 2 | Worktrees in parent directory | `../YrY-<purpose>` is the convention |
| 3 | Clean up when done | Stale worktrees accumulate and confuse |
| 4 | Never delete a worktree with `rm -rf` | Use `git worktree remove` to clean up metadata |
| 5 | Same branch can't be in two worktrees | Git enforces this; if you need to, use a new branch |
| 6 | Worktrees share `.git` | All worktrees see the same branches, tags, and history |
| 7 | `node_modules` per worktree | Run install separately in each worktree's sub-projects |

## Borders

| Boundary | Permission |
|----------|-----------|
| Parent directory (for creating worktrees) | read + write |
| Git repository | read + write (via git commands) |
| Project source files (in worktree) | read + write |

## Supporting resources

- [git/SKILL.md](../git/SKILL.md) — general git operations
- [subagent-dev/SKILL.md](../subagent-dev/SKILL.md) — subagent isolation via worktrees
- [finishing-a-development-branch](https://raw.githubusercontent.com/obra/superpowers/main/skills/finishing-a-development-branch/SKILL.md) — original superpowers skill for merge/PR decisions

## Fallback

| Situation | Behavior |
|-----------|----------|
| Worktree creation fails (branch already checked out) | Use a new branch name; or remove the existing worktree first |
| Worktree has uncommitted changes when removing | Use `--force` only if the changes are intentionally discarded |
| Disk space is low | Worktrees duplicate working directories; suggest removing old ones |
| User doesn't need parallel work | Suggest `git switch` or `git stash` instead; don't force worktrees |