---
title: Knowledge Base Readiness Checklist
tags: [governance, checklist, quality, curator]
category: curator/governance
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Authors self-verify content quality before publishing; curators use it as a review gate"
acceptance_criteria:
  - "10 questions covering frontmatter, naming, role boundary, and content quality"
  - "Each question has a pass/fail criterion"
  - "Anti-patterns for common failures are noted"
related:
  - ./governance.md
  - ../../MEMORY.md
  - ../../README.md
---

# Knowledge Base Readiness Checklist

> **10-question gate.** Run before publishing any new knowledge file. All 10 must pass. If a question doesn't apply, explain why in the commit message.

## The checklist

### 1. Does the file have a clear, descriptive title?

- [ ] **PASS** — `title:` is a complete sentence or descriptive phrase, not a vague label
- **FAIL** — `title: "Notes"`, `title: "Stuff"`, `title: "Misc"`

### 2. Is the file in the correct role directory?

- [ ] **PASS** — File lives under exactly one role directory (`aier/`, `curator/`, `engineer/`, `executiver/`, `leader/`, `producter/`, `srer/`)
- **FAIL** — File in root, in wrong role, or duplicated across roles
- **Tip**: Use the [role boundary decision tree](../../README.md#role-boundary-quick-reference)

### 3. Does the filename follow kebab-case convention?

- [ ] **PASS** — `lowercase-with-hyphens.md`, no underscores, no digits, no spaces
- **FAIL** — `My_File.md`, `file123.md`, `File Name.md`

### 4. Are all required frontmatter fields present?

- [ ] **PASS** — `title`, `tags` (3-5), `category`, `created`, `updated`, `source`, `type`, `status` all present
- **FAIL** — Any required field missing or empty

### 5. Is the `benefit:` field specific and reader-focused?

- [ ] **PASS** — Answers "what does the reader gain?" in one sentence. Example: `"Engineers find the right API pattern for cross-service communication"`
- **FAIL** — `benefit: "useful"`, `benefit: "good to know"`, or copied from another file

### 6. Are `acceptance_criteria:` verifiable?

- [ ] **PASS** — Each criterion is a falsifiable statement. Example: `"3 anti-patterns listed with why they fail"`
- **FAIL** — Vague criteria like `"good content"`, `"useful information"`

### 7. Is the `category:` field correct?

- [ ] **PASS** — `category: <role>/<subdir>` matches the file's actual location. Root files use `category: root`
- **FAIL** — `category: engineer` when file is in `engineer/build/` (should be `category: engineer/build`)

### 8. Do all `related:` links resolve to existing files?

- [ ] **PASS** — Every path in `related:` points to a file or directory that exists
- **FAIL** — Dead links (test by clicking through or running `ls` on each path)

### 9. Is the content within the role's boundary?

- [ ] **PASS** — Content answers the role's core question (e.g., engineer = "how to implement", leader = "how to decide")
- **FAIL** — Architecture decision filed under `engineer/` instead of `leader/`, or how-to pattern filed under `leader/` instead of `engineer/`

### 10. Does the content add new information (not duplicate existing)?

- [ ] **PASS** — Content either covers a new topic or adds a genuinely different perspective to an existing topic
- **FAIL** — Content rephrases an existing file without adding new insight
- **Tip**: `rg "^title:" YiKnowledge -l | xargs rg -l "<keyword>"` to check for duplicates

## Post-publish

After the file is published, the curator will verify during the next daily scan:

- Frontmatter compliance (automated check)
- Naming convention (automated check)
- Role boundary (manual review)
- Cross-reference validity (automated check)

## Common failures

| Failure | Frequency | Fix |
|---|---|---|
| Wrong `category:` field | Common | Match `category:` to the file's directory path |
| Missing `benefit:` | Common | Add one sentence answering "what does the reader gain?" |
| Dead `related:` links | Common | Run `ls` on each path before committing |
| Wrong role directory | Occasional | Consult the role boundary decision tree |
| Underscores in filename | Rare | Rename to hyphens, update all cross-references |

## Anti-patterns

- **Skipping the checklist because "it's just a quick note."** A quick note without frontmatter is invisible to RAG and grep. If it's worth writing, it's worth the 2-minute checklist.
- **Copying frontmatter from another file without updating.** Stale `category:`, `tags:`, and `benefit:` fields mislead search and retrieval. Every field should reflect the actual content.
- **Filing under the "closest" role instead of the correct one.** "It's sort of about engineering" is not a valid reason to file a business strategy document under `engineer/`. Use the decision tree.