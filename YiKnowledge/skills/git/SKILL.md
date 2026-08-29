---
title: git
name: git
description: >
  Git version control operations — branch, merge, rebase, stash,
  cherry-pick, bisect, reflog, hooks, and workflow patterns. Invoke
  when the user wants to: create/switch/delete branches, merge or
  rebase changes, resolve merge conflicts, stash/unstash work in
  progress, cherry-pick commits across branches, bisect to find bug
  introduction, recover lost commits via reflog, set up git hooks,
  configure git aliases, amend commits, squash commits, interactive
  rebase, or understand git workflow patterns (GitHub Flow, Git Flow,
  trunk-based). Trigger words: "git branch", "git merge", "git rebase",
  "merge conflict", "git stash", "git cherry-pick", "git bisect",
  "git reflog", "git commit", "git log", "git diff", "git remote",
  "git fetch", "git pull", "git push", "git tag", "git hook",
  "git alias", "git workflow", "squash commits", "amend commit",
  "interactive rebase".
  Do NOT trigger for: GitHub platform operations (PR, Issue, Actions) —
  use /github; git hosting platform comparisons; or non-git VCS (svn,
  mercurial, perforce).
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/git
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - tools
  - git
  - version-control
chip: ai-methodology
---
# git — Git Version Control Operations

> Branch, merge, rebase, stash, recover — local git operations and workflow patterns.

## What this skill does

1. **Branch operations** — `git branch` (list/create/delete), `git switch` / `git checkout`, branch naming conventions, tracking branches (`-u`), remote branch management (`git push -d`).
2. **Merge & rebase** — `git merge` (fast-forward, --no-ff, --squash), `git rebase` (standard, interactive `-i`, onto), rebase vs merge trade-offs, `git pull --rebase`.
3. **Conflict resolution** — conflict markers (`<<<<<<<`/`=======`/`>>>>>>>`), `git mergetool`, ours/theirs strategies, aborting merges/rebases, `git rerere` for repeated resolutions.
4. **Stashing** — `git stash` (push/pop/apply/list/drop), `git stash -u` (include untracked), `git stash -p` (interactive), stash with message (`git stash push -m`).
5. **History manipulation** — `git commit --amend`, `git rebase -i` (pick/reword/squash/fixup/drop), `git reset` (soft/mixed/hard), `git restore` / `git revert`.
6. **Recovery** — `git reflog` for lost commits/rebases, `git fsck` for dangling objects, `git cherry-pick` for selective commits, `git bisect` for bug hunting.
7. **Inspection** — `git log` (--oneline, --graph, --decorate, --author, --since), `git diff` (staged/unstaged/ranges), `git show`, `git blame`, `git grep`.
8. **Remote operations** — `git remote` (add/remove/set-url), `git fetch` vs `git pull`, `git push --force-with-lease`, upstream branch configuration.
9. **Hooks** — `.git/hooks/` (pre-commit, commit-msg, pre-push, post-checkout), husky integration, commitlint, lint-staged.
10. **Workflows** — GitHub Flow (feature branches → PR → main), Git Flow (develop/release/hotfix), trunk-based development, conventional commits.

## What this skill does NOT do

- Does NOT handle GitHub-specific operations (PR, Issue, Actions, releases) — use `/github`.
- Does NOT cover git hosting platform setup (GitHub/GitLab/Bitbucket server config).
- Does NOT cover non-git version control systems (SVN, Mercurial, Perforce).
- Does NOT auto-execute destructive git commands — always confirm before `reset --hard`, `push --force`, etc.

## Workflow

1. **Diagnose state** — `git status`, `git log --oneline -10`, `git branch -vv`.
2. **Plan the operation** — which branches/commits are involved, what's the desired outcome.
3. **Safety check** — for destructive operations, confirm no uncommitted work would be lost.
4. **Execute** — run the git commands, watching for conflict or error output.
5. **Verify** — `git log --oneline --graph`, `git status` to confirm expected state.

## Borders

| Boundary | Permission |
|----------|-----------|
| `.git/` directory | read (git commands) |
| Working tree files | read + write (git operations modify files) |
| `.git/hooks/` | read + write (hook setup) |
| GitHub API | via `/github` only |
| Skill directory | read + write |
| Outside the repository | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| Destructive command requested (`reset --hard`, `push --force`) | Confirm with user before executing. |
| Merge conflict during operation | Guide through resolution step-by-step; don't auto-resolve. |
| Detached HEAD state | Explain how to recover (create branch or switch back). |
| User asks about GitHub PR/Issue | Defer to `/github`. |
| User asks about SVN/Mercurial | Out of scope; state the boundary. |
| User asks in a language other than English | Respond in the user's language; keep git commands in original. |
