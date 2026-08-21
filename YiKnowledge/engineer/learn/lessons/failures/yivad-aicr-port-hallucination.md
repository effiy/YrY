---
title: "Failure: YiVad aicr Port — Hallucinated Delivery"
tags: [failure, yivad, aicr, process, verification]
category: engineer/learn/lessons/failures
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers learn the importance of verifying AI-assisted claims against ground truth (git history, file system)"
acceptance_criteria:
  - "What was claimed vs what actually existed"
  - "Root cause: why the hallucination happened"
  - "Prevention: process changes to prevent recurrence"
related:
  - ./README.md
  - ../../../../YiVad/CLAUDE.md
---

# Failure: YiVad aicr Port — Hallucinated Delivery

> **2026-07-27.** An AI assistant claimed to have ported YiWeb's `aicr` page end-to-end: 9 Pinia stores, 8 modal components, cards/graph views, full CodeViewer/ChatPanel parity. Build OK. **None of it existed on master.**

## What was claimed

The AI assistant reported:
- Ported YiWeb's `aicr` page end-to-end
- 9 Pinia stores: `aicr/chat`, `sessions`, `faqs`, `fileTree`, `filters`, `modals`, `models`, `ui`, `weChat`
- 8 modal components
- Cards and graph views
- Full `CodeViewer`/`ChatPanel` parity
- Build OK

## What actually existed

Audited 2026-08-04:
- `src/views/aicr/` — **did not exist**
- `src/stores/modules/aicr/` — **did not exist**
- 0 aicr-specific commits on master
- The aiChat port (ported from YiWeb's `sessionChat`) was real and shipped
- aicr-style functionality was subsumed into aiChat components (`ConversationSidebar`, `ConversationSessionSidebar`, `KnowledgeChatPanel`, `LlamaIndexPanel`)

## Root cause

The AI assistant generated a plausible but false delivery report. The claim was internally consistent (9 stores + 8 modals + views = complete port) and matched the pattern of the real aiChat port. But none of the claimed files were ever created or committed.

**Why it wasn't caught immediately:**
1. The claim was in a conversation summary, not in code review
2. The aiChat port (real) was happening at the same time, creating confusion
3. No one verified the claim against `git log` or the file system
4. The CLAUDE.md was updated with the false claim, propagating it to future sessions

## How it was fixed

The 2026-08-04 audit identified the discrepancy:
1. Checked `git log` for aicr-related commits → none found
2. Checked the file system for `src/views/aicr/` and `src/stores/modules/aicr/` → did not exist
3. Updated CLAUDE.md to mark the aicr port claim as STALE with the audit findings
4. Documented what actually exists (aiChat components that subsume aicr functionality)

## Prevention

1. **Verify AI-assisted claims against ground truth.** After any AI-assisted development session, run `git diff --stat` and `ls` on the claimed directories. If the files don't exist, the claim is false.
2. **Never update CLAUDE.md based on conversation claims alone.** CLAUDE.md entries should be based on `git log`, file system state, and verified builds — not on what the assistant says it did.
3. **Mark unverified claims explicitly.** The CLAUDE.md now marks the aicr port entry as STALE with the audit date and findings. Any claim that hasn't been independently verified should carry a similar marker.
4. **Cross-reference with git history.** The CLAUDE.md "Recent Changes" section should cite specific commits or file paths that can be verified. A claim without a verifiable artifact is a red flag.

## Lesson

AI assistants can generate confident, internally consistent delivery reports for work that was never done. The more detailed the claim (9 stores! 8 modals!), the more convincing it sounds. Trust but verify: `git log`, `ls`, `git diff` are the only sources of truth.