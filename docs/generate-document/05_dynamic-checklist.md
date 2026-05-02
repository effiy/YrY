# generate-document

> **Document Version**: v1.0 | **Last Updated**: 2026-05-02 | **Maintainer**: Claude | **Tool**: Claude Code
>
> **Related Documents**: [Requirement Document](./01_requirement-document.md) | [Requirement Tasks](./02_requirement-tasks.md) | [Design Document](./03_design-document.md) | [Usage Document](./04_usage-document.md) | [CLAUDE.md](../../CLAUDE.md)
>

[General Checks](#general-checks) | [Scenario Verification](#scenario-verification) | [Feature Implementation](#feature-implementation) | [Code Quality](#code-quality) | [Testing](#testing) | [Check Summary](#check-summary)

---

## General Checks

| Check Item | Priority | Status | Notes |
|------------|----------|--------|-------|
| Title format correct | P0 | ⏳ | Verify H1 matches feature name `generate-document` |
| Linked document links valid | P0 | ⏳ | Verify `./02_requirement-tasks.md`, `./03_design-document.md`, `./04_usage-document.md`, `../../CLAUDE.md` resolve |
| Related files created/updated | P0 | ⏳ | Verify `docs/generate-document/01-05,07` exist |
| Project buildable | P0 | ⏳ | No build step for documentation skill; verify no broken script imports |

---

## Main Operation Scenario Verification

### Scenario 1: Initialize a New Project

**Related Requirement Tasks**: [Initialize a New Project](./02_requirement-tasks.md#scenario-initialize-a-new-project)

**Related Design Document**: [Scenario 1: Initialize a New Project](./03_design-document.md#scenario-1-initialize-a-new-project)

**Verification Tool Recommendation**: `find-skills` returns `generate-document`; manual review for output file list

**Preconditions Verification**:

| Precondition | Priority | Status | Verification Method |
|--------------|----------|--------|---------------------|
| Repository root accessible | P0 | ⏳ | `pwd` confirms git repo root |
| `package.json` or build config exists (optional) | P1 | ⏳ | `ls package.json` or equivalent |

**Operation Steps Verification**:

| Step | Priority | Status | Verification Method |
|------|----------|--------|---------------------|
| Parse `init` command | P0 | ⏳ | Command parser extracts `init` mode |
| Scan repository structure | P0 | ⏳ | `skills/generate-document/rules/init.md` §Workflow step 1 |
| Invoke `docs-retriever` | P0 | ⏳ | Spec list returned |
| Invoke `codes-builder` + `doc-architect` | P0 | ⏳ | Parallel execution per `rules/orchestration.md` §3 |
| Generate 10 base files + `docs/project-init/01-07` | P0 | ⏳ | File existence check |
| Run three-layer review gate | P0 | ⏳ | `doc-mermaid-expert`, `doc-reviewer`, `doc-markdown-tester` invoked |
| Save and invoke `docs-builder` | P0 | ⏳ | Documents on disk, knowledge persisted |
| Execute `import-docs` then `wework-bot` | P0 | ⏳ | `skills/import-docs/` and `skills/wework-bot/` invoked per `rules/workflow.md` §Step 6 |

**Expected Results Verification**:

| Expected Result | Priority | Status | Verification Method |
|-----------------|----------|--------|---------------------|
| 10 base files exist | P0 | ⏳ | `ls CLAUDE.md README.md docs/architecture.md docs/changelog.md docs/devops.md docs/network.md docs/state-management.md docs/FAQ.md docs/auth.md docs/security.md` |
| `docs/project-init/01-07` exists | P0 | ⏳ | `ls docs/project-init/` |
| `06_process-summary.md` written by init | P0 | ⏳ | File exists (exception to implement-code-only rule per `rules/init.md`) |
| `import-docs` and `wework-bot` execute without exception | P0 | ⏳ | Orchestration log confirms execution |

**Verification Focus Points**:

| Focus Point | Priority | Status | Verification Method |
|-------------|----------|--------|---------------------|
| All 17 output files created | P0 | ⏳ | File count check |
| No code files modified | P0 | ⏳ | `git diff --name-only` excludes source code |
| WeCom notification sent | P0 | ⏳ | `wework-bot` return status |

---

### Scenario 2: Generate a Feature Document Set

**Related Requirement Tasks**: [Generate a Feature Document Set](./02_requirement-tasks.md#scenario-generate-a-feature-document-set)

**Related Design Document**: [Scenario 2: Generate a Feature Document Set](./03_design-document.md#scenario-2-generate-a-feature-document-set)

**Verification Tool Recommendation**: `find-skills` returns `generate-document`; manual review for impact analysis completeness

**Preconditions Verification**:

| Precondition | Priority | Status | Verification Method |
|--------------|----------|--------|---------------------|
| Feature name is parseable | P0 | ⏳ | Command parser succeeds (no H1 abort) |
| No existing `docs/<feature-name>/` directory (new mode) | P0 | ⏳ | `test -d docs/<feature-name>/` returns false |

**Operation Steps Verification**:

| Step | Priority | Status | Verification Method |
|------|----------|--------|---------------------|
| Parse feature name | P0 | ⏳ | Extracted from `<feature-name>-<description>` |
| Invoke `docs-retriever` | P0 | ⏳ | Spec set returned |
| Detect no existing documents → new mode | P0 | ⏳ | `rules/workflow.md` §Step 1 |
| Invoke `doc-impact-analyzer` | P0 | ⏳ | `shared/impact-analysis-contract.md` §Analysis Steps |
| Invoke `codes-builder` + `doc-architect` in parallel | P0 | ⏳ | `rules/orchestration.md` §3 |
| Generate 01-05, 07 | P0 | ⏳ | All files present in `docs/<feature-name>/` |
| Run three-layer review gate + `doc-quality-tracker` | P0 | ⏳ | P0 checklist items pass |
| Save to `docs/<feature-name>/`, version `v1.0` | P0 | ⏳ | Header version is `v1.0` |
| Execute `import-docs` then `wework-bot` | P0 | ⏳ | `rules/workflow.md` §Step 6 |

**Expected Results Verification**:

| Expected Result | Priority | Status | Verification Method |
|-----------------|----------|--------|---------------------|
| `docs/<feature-name>/01-05,07` exist | P0 | ⏳ | Directory listing |
| Impact analysis contains four sub-tables | P0 | ⏳ | `02_requirement-tasks.md` §Impact Analysis |
| Design document (`03`) contains no template content | P0 | ⏳ | `rules/design-document.md` specifies template disabled |
| All documents append postscript | P0 | ⏳ | End-of-file check |

**Verification Focus Points**:

| Focus Point | Priority | Status | Verification Method |
|-------------|----------|--------|---------------------|
| Impact chain closed before design conclusions | P0 | ⏳ | `03_design-document.md` §Impact Analysis contains closure summary |
| No hallucinated file paths | P0 | ⏳ | Cross-reference paths against `find` / `glob` results |
| Postscript present in every file | P0 | ⏳ | `grep "Postscript:" docs/<feature-name>/*.md` |

---

### Scenario 3: Update an Existing Feature Document

**Related Requirement Tasks**: [Update an Existing Feature Document](./02_requirement-tasks.md#scenario-update-an-existing-feature-document)

**Related Design Document**: [Scenario 3: Update an Existing Feature Document](./03_design-document.md#scenario-3-update-an-existing-feature-document)

**Verification Tool Recommendation**: `find-skills` returns `generate-document`; manual review for change-level accuracy

**Preconditions Verification**:

| Precondition | Priority | Status | Verification Method |
|--------------|----------|--------|---------------------|
| `docs/<feature-name>/` exists with valid Markdown | P0 | ⏳ | Directory exists and contains `.md` files |
| User input contains a change relative to existing 01-03 | P0 | ⏳ | Diff comparison produces non-empty result |

**Operation Steps Verification**:

| Step | Priority | Status | Verification Method |
|------|----------|--------|---------------------|
| Detect existing `docs/<feature-name>/` | P0 | ⏳ | `rules/workflow.md` §Step 1 |
| Load 01-03, compare with user input | P0 | ⏳ | Diff engine produces change impact table |
| Grade change level: T1/T2/T3 | P0 | ⏳ | `rules/workflow.md` §Step 1 change grading table |
| Skip or trim stages 2-3 based on level | P0 | ⏳ | `rules/orchestration.md` §2.2 |
| Rewrite changed chapters only (T1), or target + sync downstream (T2), or full cascade (T3) | P0 | ⏳ | `rules/workflow.md` §Step 4 update strategy table |
| Increment version | P0 | ⏳ | Header version minor `+1` or major `+1` |
| Save, curate incrementally, sync, notify | P0 | ⏳ | Incremental curation per `rules/workflow.md` §Step 5 |

**Expected Results Verification**:

| Expected Result | Priority | Status | Verification Method |
|-----------------|----------|--------|---------------------|
| Only affected chapters rewritten | P0 | ⏳ | Diff before/after shows minimal changes |
| Unchanged content preserved verbatim | P0 | ⏳ | Text comparison for unchanged sections |
| Change level not downgraded | P0 | ⏳ | Actual diff scope matches declared level |
| T1/T2 do not trigger full-project rescans | P0 | ⏳ | Orchestration log shows skip/trim annotations |

**Verification Focus Points**:

| Focus Point | Priority | Status | Verification Method |
|-------------|----------|--------|---------------------|
| Downstream sync annotations for T2 | P1 | ⏳ | Presence of "Synced due to chapter X change" text |
| Version incremented correctly | P1 | ⏳ | Header version comparison |
| Incremental curation only processes changed knowledge | P1 | ⏳ | `docs-builder` scope limited to diff |

---

## Feature Implementation Checks

### Core Feature: Document Generation Pipeline

| Check Item | Priority | Status | Verification Method |
|------------|----------|--------|---------------------|
| 7-stage pipeline executes in order | P0 | ⏳ | `rules/orchestration.md` §2.1 stage table |
| Stage 3 runs `codes-builder` + `doc-architect` in parallel | P0 | ⏳ | Orchestration log confirms parallel invocation |
| Stage 4 three-layer review gate loops until pass | P0 | ⏳ | Max 1 self-repair round per gate |
| Stage 6 executes `import-docs` then `wework-bot` | P0 | ⏳ | Sequence confirmed in logs |
| `weekly` command triggers `self-improve.js` | P0 | ⏳ | `rules/orchestration.md` §9 |
| `execution-memory.js` writes session record in Stage 5 | P0 | ⏳ | `rules/orchestration.md` §8 |

### Boundaries and Error Handling

| Check Item | Priority | Status | Verification Method |
|------------|----------|--------|---------------------|
| Unparseable feature name aborts (H1) | P0 | ⏳ | Error path test |
| Missing P0 prerequisites write blocking `06_process-summary.md` | P0 | ⏳ | `SKILL.md` §Stop Conditions |
| `from-weekly` with invalid weekly aborts (H4) | P0 | ⏳ | Error path test |
| `API_X_TOKEN` missing degrades to skip sync + notify still sent (H5) | P1 | ⏳ | `SKILL.md` §Block / Abort Thresholds |

---

## Code Quality Checks

| Check Item | Priority | Status | Verification Method |
|------------|----------|--------|---------------------|
| Style compliance (Markdown formatting) | P1 | ⏳ | `doc-markdown-tester` validation |
| Naming clarity (file names, anchor IDs) | P1 | ⏳ | Consistent kebab-case for feature names |
| Performance (pipeline execution time) | P2 | ⏳ | T1 updates should complete in under 60 seconds |
| Security risks (no secrets in generated docs) | P0 | ⏳ | Scan for `API_*_TOKEN`, passwords, keys |

---

## Testing Checks

| Check Item | Priority | Status | Verification Method |
|------------|----------|--------|---------------------|
| Unit coverage core (scripts/*.js) | P1 | ⏳ | `execution-memory.js`, `natural-week.js` can be unit tested |
| E2E coverage main scenarios | P0 | ⏳ | Run `/generate-document init` and `/generate-document <feature>` in a temp repo |
| P0 tests all passed | P0 | ⏳ | Checklist P0 items all marked ✅ |
| Test report complete | P1 | ⏳ | All scenarios have verification tables filled |

---

## Check Summary

### Overall Progress

| Category | Total | Completed | Pass Rate |
|----------|-------|-----------|-----------|
| General Checks | 4 | 0 | 0% |
| Scenario Verification | 3 | 0 | 0% |
| Feature Implementation | 6 | 0 | 0% |
| Code Quality | 4 | 0 | 0% |
| Testing | 4 | 0 | 0% |
| **Total** | **21** | **0** | **0%** |

### Pending Items

- [ ] General Checks: all 4 items
- [ ] Scenario 1: Initialize a New Project — all verification tables
- [ ] Scenario 2: Generate a Feature Document Set — all verification tables
- [ ] Scenario 3: Update an Existing Feature Document — all verification tables
- [ ] Feature Implementation: all 6 items
- [ ] Code Quality: all 4 items
- [ ] Testing: all 4 items

### Conclusion

⏳ Check not started.

---

## Postscript: Future Planning & Improvements
