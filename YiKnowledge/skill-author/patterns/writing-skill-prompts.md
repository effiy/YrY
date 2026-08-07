---
title: Writing Skill Prompts — Prompt Engineering for Claude Code Skills
aliases:
- writing-skill-prompts
- skill-prompt-engineering
- skill-prompt-template
tags:
- skill-author
- prompt-engineering
- skill-design
- claude-code
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
- ai-engineer
benefit: "Skill prompts are clear, effective, and produce consistent behavior across different invocation contexts"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./skill-design-principles.md
- ./skill-testing-strategy.md
- ../../ai-engineer/methodology/prompt-engineering-guide.md
tacit: false
---

# Writing Skill Prompts — Prompt Engineering for Claude Code Skills

> **As a** skill author, **I want to** write effective skill prompts that produce consistent, predictable behavior, **so that** users get reliable results regardless of how they phrase their request.

> A skill prompt is a specialized system prompt that loads when a skill is invoked. It modifies Claude's behavior for the duration of the skill invocation. Writing effective skill prompts is a distinct skill from general prompt engineering — skill prompts must be concise, context-independent, and robust to varied user phrasings.

## Summary

- Skill prompts are loaded as context when a skill is invoked via the Skill tool or slash command
- They must be self-contained: Claude may have no prior context about the user's intent when the skill loads
- Structure: role definition → behavior rules → workflow steps → output format → error handling
- Key challenge: Balancing specificity (consistent behavior) with flexibility (handling varied user inputs)
- Length guideline: 50-200 lines. Shorter than 50 is too vague; longer than 200 is too prescriptive.

## Core viewpoints

### 1. The prompt is the product

Unlike general AI prompts where the user provides the instruction, a skill prompt IS the instruction. The user's invocation ("/gen-brd") is just a trigger. The skill prompt must contain everything Claude needs to complete the task. If the prompt is ambiguous, the skill is unreliable.

### 2. Specificity creates reliability

A skill prompt that says "help the user with git" will behave differently every time. A skill prompt that says "when the user asks to create a branch: (1) verify the branch name follows the convention, (2) run `git checkout -b`, (3) confirm the branch was created" will behave consistently. Specificity is the difference between a tool and a suggestion.

### 3. The trigger list is the user interface

The prompt should include a clear list of trigger phrases that activate different behaviors within the skill. "When the user says 'create a branch' or 'new branch' or 'start feature'..." This trigger list is the implicit UI of the skill. Missing triggers mean the skill won't activate when the user expects it to.

### 4. Error handling is not optional

Every skill prompt should include error handling instructions. What should Claude do when: a required tool is unavailable, the user provides invalid input, an external command fails, or the skill's assumptions are violated? Error handling is the difference between a robust skill and a fragile one.

### 5. Examples are the most valuable content

A skill prompt with 3 concrete examples of expected behavior is more valuable than a skill prompt with 3 pages of abstract rules. Examples show Claude the pattern; rules tell Claude about the pattern. Claude learns better from examples.

## Key info

### Skill prompt template

```markdown
---
name: skill-name
description: [One sentence: when, what, outcome]
---

# Skill Name

> **As a** [role], **I want to** [action], **so that** [outcome].

## Behavior rules

1. [Rule 1 — what Claude should always do]
2. [Rule 2 — what Claude should never do]
3. [Rule 3 — constraint or boundary]

## Workflow

### When the user says [trigger phrase 1]:
1. [Step 1 with specific tool/action]
2. [Step 2]
3. [Output format]

### When the user says [trigger phrase 2]:
...

## Output format

[Describe the expected output structure]

## Error handling

- If [error condition]: [response]
- If [error condition]: [response]

## Examples

### Example 1: [Scenario]
User: [input]
Claude: [expected behavior]

### Example 2: [Scenario]
User: [input]
Claude: [expected behavior]
```

### Prompt writing checklist

- [ ] Does the description answer: when, what, outcome?
- [ ] Are there at least 3 trigger phrases for each behavior?
- [ ] Is every step specific enough that two different Claude instances would behave the same?
- [ ] Are error conditions handled explicitly?
- [ ] Are there at least 2 concrete examples?
- [ ] Is the prompt under 200 lines?
- [ ] Are file paths relative (not absolute)?
- [ ] Are tool names correct and available?

### Common prompt patterns

| Pattern | Use When | Example |
|---|---|---|
| **Decision tree** | The skill has multiple behaviors based on user input | "If the user says X, do Y. If the user says A, do B." |
| **Pipeline** | The skill has a fixed sequence of steps | "Step 1: validate. Step 2: process. Step 3: output." |
| **Tool orchestration** | The skill coordinates multiple tools | "Use Bash for X, then use Write for Y, then use Bash for Z." |
| **Template fill** | The skill generates output from a template | "Fill in the template with the following fields: ..." |

## Action recommendations

1. **Write the examples first**: Before writing rules, write 3 examples of what the skill should do. The rules will emerge from the examples.
2. **Test with varied phrasings**: "Create a branch," "New branch," "Start a feature branch," "I need a branch for..." should all trigger the same behavior.
3. **Keep prompts under 200 lines**: If your prompt is longer, the skill is probably doing too much. Split it.
4. **Include "never" rules**: Explicitly state what Claude should NOT do. "Never commit without asking." "Never skip hooks." "Never use absolute paths."
5. **Review with a fresh session**: Test the skill in a new conversation where Claude has no context. If it works, the prompt is self-contained.

## Anti-patterns

- **Vague instructions**: "Help the user with git." This is a suggestion, not a skill. Be specific.
- **No trigger list**: The skill only activates when the user says the exact skill name. Add trigger phrases.
- **No error handling**: The skill breaks on the first unexpected input. Handle errors explicitly.
- **Context-dependent**: The skill assumes Claude has prior context from the conversation. Skills must be self-contained.
- **Overly long prompts**: 500+ line prompts that Claude can't fully process. Be concise.
- **Missing examples**: All rules, no examples. Claude learns patterns from examples, not abstract rules.

## Related

- [Skill Design Principles](./skill-design-principles.md) — Architecture principles for skills
- [Skill Testing Strategy](./skill-testing-strategy.md) — How to test skill prompts
- [Skill Versioning](./skill-versioning.md) — Managing prompt changes over time
- [Prompt Engineering Guide](../../ai-engineer/methodology/prompt-engineering-guide.md) — General prompt engineering