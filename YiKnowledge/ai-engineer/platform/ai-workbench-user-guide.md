---
title: AI Desktop Workbench User Guide
aliases:
- AI workbench user guide
- desktop AI agent
- SOUL USER IDENTITY AGENTS
tags:
- AI workbench
- Agent
- Skill
- Memory
- Workspace
category: ai-engineer/platform
created: 2026-07-30
updated: 2026-08-07
source: internal (rewritten from desensitised internal training material)
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- ai-engineer
benefit: platform reliable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- llm-comparison.md
- inference-engine-comparison.md
- ../../engineer/projects/yiai/README.md
tacit: false
---

# AI Desktop Workbench User Guide

> **As a** an ai engineer, **I want to** ai workbench user guide, **so that** platform reliable.

> Runs locally, based on file-system identity and memory, highly transparent and editable desktop-client AI workbench.

## Summary
- Four-layer architecture: desktop client / runtime / workspace and memory / external capabilities
- Core components: Agent / Workspace / SOUL.md / USER.md / IDENTITY.md / AGENTS.md / Memory / Skill / Tools / scheduled tasks
- Generic main line: business problem → upload data → AI analysis execution → output → human confirmation → captured as template/Skill/memory
- Guidance file division: SOUL is who, USER how to work with me, IDENTITY business background, AGENTS workspace rules
- Involves external sending / collaboration platform writes / system submission / memory capture / batch file modification — **preview first, then confirm, then execute**

## Core viewpoints

**The AI workbench is not a productivity tool -- it is a force multiplier that changes the economics of which tasks are worth automating.** The traditional ROI calculation for automation is: if the task takes X hours and the automation takes Y hours to build, automate if X * frequency > Y. The AI workbench changes this equation because Y (the time to build the automation) is often minutes, not hours. This means that tasks that were previously too small to automate (one-off analyses, ad-hoc reports, quick data transformations) become cost-effective. The workbench's value is not in doing the same tasks faster -- it is in automating tasks that were previously not worth automating.

**The guidance file system (SOUL/USER/IDENTITY/AGENTS) is a lightweight form of prompt engineering that compounds over time.** Each guidance file is a reusable prompt fragment. The investment in writing a good SOUL.md pays off every time the Agent is invoked, because the Agent always has access to its role definition, principles, and boundaries. The compounding effect is that the Agent's behavior becomes more consistent and predictable over time, not less -- unlike traditional software, which tends to accumulate bugs and edge cases.

**Skills are the bridge between tacit knowledge and executable automation -- and they only work if they are created from real task completions, not from speculation.** The sequence is: complete a real task, identify what worked, capture the pattern as a Skill, and iterate the Skill as you use it. If you create a Skill before completing the task, you are guessing at what works. The Skill creation process is a retrospective, not a design exercise.

**Memory is the most dangerous component of the AI workbench because it silently accumulates sensitive information.** The workbench's Memory system captures preferences, patterns, and project context automatically. Without explicit rules about what NOT to store (passwords, keys, customer PII, internal secrets), the Memory becomes a security liability. The rule must be enforced at the architectural level (filtering before storage), not just at the prompt level (asking the Agent not to store sensitive data).

**The "preview first, then confirm, then execute" workflow is not a UX preference -- it is a safety boundary.** The AI workbench can send emails, write to collaboration platforms, modify files, and execute system commands. Without a human-in-the-loop confirmation step, a single hallucination or misinstruction can cause irreversible damage. The preview-confirm-execute pattern is the minimum viable safety mechanism for any operation that has external effects.

- **Local run + file-system identity + high transparency** — the core characteristics of the workbench
- **Clear guidance file division** — SOUL/USER/IDENTITY/AGENTS each manage one thing
- **Memory must not store passwords, keys, customer privacy** — suitable for capturing preferences, calibre, project background, skill experience
- **Skills are distilled from real-task retrospectives** — first complete task → retrospective → capture → iterate while using
- **Complex tasks must preview first, then confirm, then execute** — external sending / collaboration platform writes / system submissions all preview + confirm

## Key information

### concept breakdown

Desktop-client AI workbench built on an open-source Agent framework. The lower layer reuses the framework's Agent execution, model invocation, tool scheduling, skill loading, memory management and task orchestration capabilities; the upper layer wraps it as a chat interface + workspace + Agent/Skill/collaboration platform/browser/file entries.

#### Four-layer architecture

| layer | role |
|---|---|
| Desktop client layer | chat, Agent, Skills, workspace, settings, external channel entries |
| Runtime layer | Agent execution, context management, tool scheduling, model invocation, skill loading |
| Workspace and memory layer | files, output, guidance files, long-term memory, skill capture |
| External capability layer | Excel/PPT/collaboration platform/browser/web/system file integration |

#### Core components

- **Agent**: AI role with clear division of labour (data analysis / PPT expert / market intelligence / project assistant, etc.), each with independent workspace, context and long-term memory
- **Workspace**: the Agent's workbench, storing input files, output, guidance files (SOUL/USER/IDENTITY/AGENTS)
- **SOUL.md**: long-term role setting — who this Agent is, what principles it follows, output style, business boundaries
- **USER.md**: user preference — output structure, reporting habits, common calibre, confirmation requirements. This file can differ when the same Agent is used by different users
- **IDENTITY.md**: identity and business background — department, position responsibilities, business objectives, communication notes
- **AGENTS.md**: workspace rules — directory organisation, file handling process, must-confirm operations, security boundaries
- **Memory**: four layers — session memory / short-term memory (daily file) / long-term memory (MEMORY.md) / dreams (consolidation mechanism). Suitable for capturing preferences, calibre, project background, skill experience; **must not** store passwords, keys, customer privacy
- **Skill**: reusable operation manual — trigger conditions, input, steps, output format, constraints. First complete real task → retrospective → capture Skill → iterate while using
- **Tools**: let AI move from "answering" to "executing" — read Excel/Word/PPT/PDF, generate Markdown/HTML/PPT, operate browser, write to collaboration platform, organise files
- **Scheduled tasks**: cadence-triggered work, combined with Agent/Skill/Memory

### Key parameters / formulas / data

#### Guidance file division quick reference

| file | problem solved | suitable to write | not suitable to write |
|---|---|---|---|
| SOUL.md | who the Agent is | role, principles, boundaries, long-term style | daily ad-hoc tasks |
| USER.md | how to work with me | user preferences, reporting habits, common formats | passwords, keys, sensitive privacy |
| IDENTITY.md | business background | position, department, responsibilities, business objectives | overly detailed personal privacy |
| AGENTS.md | workspace rules | file rules, operation standards, security requirements | large background sections unrelated to task |
| Memory | which experiences are reusable later | preferences, calibre, long-term projects, valid experiences | undestined sensitive raw data |
| Skill | how to stably reuse a class of tasks | steps, tools, input/output template | one-off ad-hoc ideas |

#### Eight categories of practical scenarios

1. **Excel data analysis summary**: first do field identification and risk-point scanning, do not fabricate unread data, mark "to confirm" when uncertain
2. **Skill use and creation**: capture successful reading experience into a `local-excel-reader` class Skill, structure includes trigger conditions / input / steps / notes / constraints / output format
3. **Use Skill for second-round business analysis and iterate Skill**: optimise while using, distinguish "solidifiable field identification rules" from "judgement that must be left for business confirmation"
4. **Collaboration platform documentation + HTML dashboard**: first write collaboration platform documentation for collaborative capture, then use HTML dashboard for visual prototype; sensitive operations must be human-confirmed
5. **Multi-Agent use**: data analysis / PPT expert / knowledge base administrator / scheduler division of labour; use `@Agent` to switch; can build a "scheduler Agent" maintaining `agents-index.md` index, dispatching roles by task type
6. **Browser automation + Subagent**: split task into data extraction / cleaning / theme analysis / suggestion generation; must annotate source link, collection time, calibre constraints; **when data is insufficient clearly explain, do not fabricate**
7. **Archive + memory + scheduled tasks**: one-off analysis becomes long-term tracking — archive for long-term capture, memory solidifies tracking calibre, scheduled tasks trigger by time
8. **Knowledge base organisation**: classified directory + dual-copy archive (original + summary) + YAML Frontmatter + progressive reading (metadata first, then full text)

### Applicable scenarios
- Excel / PPT / document automated processing
- Multi-Agent collaboration on complex business tasks
- Browser automation + data collection analysis
- Knowledge base organisation (classification + dual-copy archive + frontmatter)
- Long-term tracking class of business (archive + memory + scheduled task combination)

## Action recommendations
1. Write all four guidance files SOUL / USER / IDENTITY / AGENTS for each Agent, with clear division and no mixing
2. Memory only stores preferences, calibre, project background, valid experiences, not passwords / keys / customer privacy
3. For complex tasks, first let AI break down steps, give basis, list risks, output items to confirm
4. Involving external sending / collaboration platform writes / system submission / memory capture / batch file modification — **preview first, then confirm, then execute**
5. Capture successful experiences as Skills, structure includes trigger conditions / input / steps / notes / constraints / output format
6. For multi-Agent scenarios build a "scheduler Agent" maintaining `agents-index.md` index
7. Browser automation must annotate source link, collection time, calibre constraints, when data is insufficient clearly explain
8. Knowledge base uses classified directory + dual-copy archive (original + summary) + YAML frontmatter + progressive reading

## Anti-patterns

**Creating Skills before completing the task they are meant to automate.** A Skill created from imagination rather than experience encodes assumptions about what works, not actual working patterns. The result is a Skill that looks complete but fails on real tasks because it misses the edge cases, implicit constraints, and tacit knowledge that only emerge from doing the work. The correct sequence is: do the task, capture what worked, codify as a Skill, iterate.

**Storing passwords, API keys, or customer PII in Memory or guidance files.** The workbench's Memory system is designed for capturing preferences and patterns, not secrets. Secrets stored in Memory are readable by any Agent that has access to the workspace, and they persist across sessions indefinitely. Secrets belong in environment variables, secret managers, or credential stores -- never in Memory or guidance files.

**Skipping the preview-confirm step for operations that modify external systems.** The preview step is the last line of defense against a hallucinated or misdirected action. When the AI writes to a collaboration platform, sends an email, or modifies a file, a human must review the action before it executes. Skipping this step is equivalent to giving the AI unsupervised access to external systems -- which is acceptable only for read-only operations.

**Using the same Agent for unrelated tasks without resetting the context.** The Agent's context accumulates across interactions, and a long-running session can accumulate enough context to cause the Agent to confuse instructions from different tasks. The remedy is to use separate Agents for separate domains (data analysis Agent, PPT Agent, knowledge base administrator Agent) and to start new sessions for unrelated tasks.

**Feeding public repository content into the AI workbench as if it were internal data.** Public repositories (GitHub, Wikipedia, web pages) come with licenses, terms of use, and attribution requirements. Feeding this content into the AI workbench for analysis or training may violate these terms. The workbench should include a source attribution mechanism and a license compliance check for any externally sourced content.


- **USER.md writes passwords / keys** — sensitive privacy does not go into guidance files
- **Memory stores undestined raw data** — customer privacy and sensitive data do not go into memory
- **No preview before execution** — external sending / collaboration platform writes / batch file modification must preview + confirm
- **AI fabricates unread data** — Excel fields not clearly identified, fabricates numbers, must mark "to confirm"
- **Browser automation without source annotation** — data lacks credibility, must annotate source link, collection time, calibre constraints
- **Skill solidified after one occurrence** — ad-hoc ideas do not go into Skill, only after retrospective
- **Public repo content directly fed as internal data** — note source, licence, network and enterprise compliance requirements

## Related
- Same class: [llm-comparison-summary.md](./llm-comparison.md), [inference-engine-comparison-summary.md](./inference-engine-comparison.md)
- Upstream: [../foundations/rlhf-dpo-alignment.md](../foundations/rlhf-dpo-alignment.md) (Agent alignment)
- Downstream: [../../engineer/projects/yiai/README.md](../../engineer/projects/yiai/README.md)
