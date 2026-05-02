# generate-document

> **Document Version**: v1.0 | **Last Updated**: 2026-05-02 | **Maintainer**: Claude | **Tool**: Claude Code
>
> **Related Documents**: [Requirement Document](./01_requirement-document.md) | [Requirement Tasks](./02_requirement-tasks.md) | [Design Document](./03_design-document.md) | [CLAUDE.md](../../CLAUDE.md)
>

[Feature Intro](#feature-intro) | [Quick Start](#quick-start) | [Operation Scenarios](#operation-scenarios) | [FAQ](#faq) | [Tips](#tips)

---

## Feature Introduction

`generate-document` is a documentation-generation orchestrator that creates structured Markdown document sets for your project. With a single command, it produces requirement documents, design documents, usage guides, dynamic checklists, and project reports under `docs/<feature-name>/`. The skill enforces spec-driven generation, mandatory impact analysis, and three-layer review gates so that every document is traceable, consistent, and grounded in actual repository facts.

**Core Features**
- 🎯 One-command document sets: turn a feature name into a complete numbered set (01-05, 07)
- ⚡ Incremental updates: T1/T2/T3 change detection rewrites only what changed
- 🔧 Project initialization: scaffold base files and a full document set for new repositories

**Target Audience**: Developers, tech leads, and project maintainers who need consistent, traceable documentation without manual copy-pasting.

---

## Quick Start

### Prerequisites

- [ ] Claude Code CLI is installed and running
- [ ] You are in a git repository root (or a directory you want to document)
- [ ] You have read access to `skills/generate-document/SKILL.md` and `shared/*.md`

### 30-Second Onboarding

1. **Initialize a project** (first time only):
   ```
   /generate-document init
   ```
   This creates `CLAUDE.md`, `README.md`, 8 base `docs/` files, and `docs/project-init/01-07`.

2. **Generate a feature document set**:
   ```
   /generate-document user-login-phone-otp
   ```
   This creates `docs/user-login-phone-otp/01-05,07`.

3. **Generate this week's report**:
   ```
   /generate-document weekly
   ```
   This creates `docs/weekly/<natural-week>/weekly.md`.

4. **Wait for completion**: The pipeline automatically runs `import-docs` then `wework-bot` at the end.

---

## Operation Scenarios

### Scenario 1: Initialize a New Repository

**Applicable Situation**: You have just created a new repository and need standardized documentation.

**Operation Steps**:
1. Open Claude Code in the repository root.
2. Run `/generate-document init`.
3. Review the generated base files (`CLAUDE.md`, `README.md`, `docs/*.md`).
4. Review the full document set under `docs/project-init/`.

**Expected Results**:
- 10 base files exist at root or `docs/`.
- `docs/project-init/01-07` exists and is readable.
- A WeCom notification confirms completion.

**Notes**:
- ✅ Safe to re-run; re-init preserves manual additions outside `<!-- AUTO-GENERATED:BEGIN/END -->` blocks.
- ❌ Do not run `init` if you only want a single feature document; use the feature command instead.

---

### Scenario 2: Document a New Feature

**Applicable Situation**: You are starting work on a new feature and need a complete document set.

**Operation Steps**:
1. Choose a feature name in kebab-case, e.g., `payment-gateway-refund-flow`.
2. Run `/generate-document payment-gateway-refund-flow`.
3. Wait for the 7-stage pipeline to complete.
4. Open `docs/payment-gateway-refund-flow/01_requirement-document.md` to review requirements.

**Expected Results**:
- `docs/payment-gateway-refund-flow/01-05,07` exists.
- Impact analysis in `02_requirement-tasks.md` contains real search results.
- Design document `03_design-document.md` contains no template placeholders.

**Notes**:
- ✅ The command is idempotent; re-running updates existing documents incrementally.
- ❌ If the feature name is unparseable, the pipeline aborts (H1 threshold).

---

### Scenario 3: Update an Existing Feature After Requirement Changes

**Applicable Situation**: A requirement in an existing feature document has changed.

**Operation Steps**:
1. Edit the requirement in `docs/<feature-name>/01_requirement-document.md` (or describe the change to Claude).
2. Re-run `/generate-document <feature-name>-<description>`.
3. The pipeline detects the existing directory, diffs the changes, and grades them T1/T2/T3.
4. Only affected chapters are rewritten; downstream documents sync automatically for T2+.

**Expected Results**:
- Changed chapters are updated.
- Unchanged chapters retain original text verbatim.
- Version number increments (minor `+1` or major `+1`).

**Notes**:
- ✅ T1 changes complete quickly because stages 2-3 are skipped.
- ❌ Do not downgrade change levels manually; the pipeline determines the level from actual diffs.

---

### Scenario 4: Generate a Weekly Report

**Applicable Situation**: You want to summarize the week's progress and plan next week's work.

**Operation Steps**:
1. Run `/generate-document weekly` for the current week, or `/generate-document weekly 2026-04-29` for a specific week.
2. The pipeline collects KPIs via `scripts/collect-weekly-kpi.js` and logs via `scripts/collect-weekly-logs.js`.
3. A draft is produced by `scripts/draft-weekly-report.js`.
4. After completion, `scripts/self-improve.js` appends a "System Self-Improvement Proposal" section.

**Expected Results**:
- `docs/weekly/<natural-week>/weekly.md` exists.
- The report contains a summary, KPIs, and a self-improvement proposal.

**Notes**:
- ✅ The weekly command overwrites the same file if re-run within the same natural week.
- ❌ If there are no commits or activity, the report may be sparse.

---

### Scenario 5: Decompose a Weekly Report into Feature Documents

**Applicable Situation**: Your weekly report contains multiple actionable items that need their own document sets.

**Operation Steps**:
1. Ensure the weekly report exists at `docs/weekly/<natural-week>/weekly.md`.
2. Run `/generate-document from-weekly docs/weekly/<natural-week>/weekly.md`.
3. The pipeline parses "future planning" items and creates one `docs/<feature-name>/` per item.

**Expected Results**:
- Multiple `docs/<feature-name>/01-05,07` sets are created.
- Each set is independent and can be updated separately.

**Notes**:
- ✅ Each feature directory is created only if it does not already exist; existing directories are updated.
- ❌ If the weekly file is invalid or has no actionable items, the pipeline aborts (H4 threshold).

---

## FAQ

### 💡 Basics

**Q: What does `generate-document` actually do?**
A: It reads your repository, retrieves specifications, analyzes impact, designs architecture, and writes a numbered Markdown document set (01-05, 07) under `docs/<feature-name>/`. It does not modify your source code.

**Q: Why are there 7 documents but only 6 numbers?**
A: `06_process-summary.md` is written only by the `implement-code` skill, not by `generate-document`. The `init` command is the sole exception: it writes `06` for `project-init`.

**Q: Do I need to write anything before running the command?**
A: No. For new features, the pipeline generates everything from your feature name and repository context. For updates, it detects existing documents and incrementally applies changes.

### ⚙️ Advanced

**Q: How does T1/T2/T3 change detection work?**
A: The pipeline loads existing 01-03, diffs them against your new input, and classifies the scope: T1 = wording/minor edits (skip stages 2-3); T2 = partial feature changes (trim stages 2-3); T3 = scope/architecture changes (full pipeline).

**Q: Can I customize the document templates?**
A: Only `01_requirement-document.md` and `02_requirement-tasks.md` use templates (`templates/*.md`). `03_design-document.md` and `05_dynamic-checklist.md` are template-disabled and must follow `rules/*.md` strictly.

**Q: What happens if a review gate fails?**
A: The pipeline loops back to the agent responsible for that gate (max 1 self-repair round). If P0 failures persist, the pipeline writes a blocking `06_process-summary.md` and notifies via `wework-bot`.

### 🔧 Troubleshooting

**Q: The pipeline aborted with "P0 prerequisite missing." What do I do?**
A: `generate-document` requires `02_requirement-tasks.md`, `03_design-document.md`, and `05_dynamic-checklist.md` to be present or generatable. If you are running `implement-code` and see this, run `/generate-document <feature-name>` first.

**Q: `import-docs` or `wework-bot` failed. Is my documentation lost?**
A: No. Documents are saved to disk in Stage 5 before sync/notification in Stage 6. If Stage 6 fails, the documents are still on disk. Check `docs/99_agent-runs/` for fallback logs.

**Q: Re-init overwrote my manual edits!**
A: Re-init only rewrites paragraphs inside `<!-- AUTO-GENERATED:BEGIN/END -->` blocks. If you placed manual edits inside those blocks, they will be overwritten. Move manual additions outside the blocks.

---

## Tips and Hints

### 💡 Practical Tips

1. **Use kebab-case feature names**: `user-login-phone-otp` parses reliably; spaces or camelCase may fail parsing.
2. **Keep auto-generated blocks intact**: If you need to edit generated content, do so outside `<!-- AUTO-GENERATED:BEGIN/END -->` so re-init preserves it.
3. **Run `validate-agent-contracts.js` after agent changes**: `node skills/generate-document/scripts/validate-agent-contracts.js` ensures agent contracts still align with skill rules.

### 📚 Best Practices

1. **Generate docs before coding**: Running `generate-document` before `implement-code` ensures P0 prerequisites exist and impact analysis is closed.
2. **Review impact analysis manually**: Even though the pipeline automates it, human review of the "Uncovered Risks" table in `02` and `03` catches edge cases.
3. **Commit generated docs**: The document sets are part of your project history; commit them alongside code changes.

---

## Appendix

### Command Cheat Sheet

| Command | Output | First Run | Re-run | Version Handling |
|---------|--------|-----------|--------|------------------|
| `init` | 10 base files + `docs/project-init/01-07` | Create new | Update facts, keep conventions | Header date updated |
| `<feature-name>-<description>` | `docs/<feature-name>/01-05,07` | Create full set | Diff comparison, cascade update | Minor `+1` |
| `weekly [date]` | `docs/weekly/<natural-week>/weekly.md` | Create new | Same-week overwrite | Minor `+1` |
| `from-weekly <path>` | Multiple `docs/<feature-name>/` sets | Create multiple | Each directory independent update | Each directory minor `+1` |

### Related Resources

- [Generate Document Skill](../../.claude/skills/generate-document/SKILL.md)
- [Generate Document README](../../.claude/skills/generate-document/README.md)
- [Document Contracts](../../shared/document-contracts.md)
- [Evidence and Uncertainty](../../shared/evidence-and-uncertainty.md)
- [Impact Analysis Contract](../../shared/impact-analysis-contract.md)

---

## Postscript: Future Planning & Improvements
