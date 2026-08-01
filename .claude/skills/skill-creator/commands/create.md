---
name: skill-creator-create
description: >
  Create a new skill from scratch — capture user intent, interview,
  research, and draft the SKILL.md with proper structure and frontmatter.
---

# Skill Creator — Creating a New Skill

Guide the user through creating a new Claude skill from scratch.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Skill` (skill-creator) | The skill creator itself for writing guidance |
| `Task` (subagent) | Research in parallel via subagents |
| `Read` / `Write` / `SearchReplace` | File operations for drafting the skill |

## Core Workflow

```
Capture Intent → Interview & Research → Write SKILL.md → Create Test Cases
```

## Phase 1: Capture Intent

Start by understanding the user's intent. If the conversation already contains a workflow the user wants to capture ("turn this into a skill"), extract answers from the conversation history first — the tools used, the sequence of steps, corrections made, input/output formats observed. The user confirms before proceeding.

Key questions to answer:

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Should we set up test cases? Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflow steps) benefit from test cases. Skills with subjective outputs (writing style, art) often don't need them. Suggest the appropriate default, but let the user decide.

## Phase 2: Interview and Research

Proactively ask about edge cases, input/output formats, example files, success criteria, and dependencies. Wait to write test prompts until the details are clear.

Check available MCPs — if useful for research (searching docs, finding similar skills, looking up best practices), research in parallel via subagents if available. Come prepared with context to reduce burden on the user.

Pay attention to the user's familiarity with coding jargon:
- "evaluation" and "benchmark" are borderline but OK
- "JSON" and "assertion" — only use without explanation if the user shows familiarity

## Phase 3: Write the SKILL.md

Based on the user interview, fill in these frontmatter components:

- **name**: `yry-tools-<skill-name>` in kebab-case
- **description**: When to trigger, what it does. This is the primary triggering mechanism — include both what the skill does AND specific contexts for when to use it. Make descriptions slightly "pushy" since Claude tends to undertrigger skills. Include trigger words.
- **lifecycle**: `default-pipeline`
- **user_invocable**: `true`

### Skill Anatomy

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description, lifecycle, user_invocable)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── commands/    - Extracted workflow instructions
    ├── scripts/     - Executable code for deterministic/repetitive tasks
    ├── references/  - Docs loaded into context as needed
    └── assets/      - Files used in output (templates, icons, fonts)
```

### Writing Guide

**Progressive Disclosure**: Skills use a three-level loading system:
1. Metadata (name + description) — always in context (~100 words)
2. SKILL.md body — in context whenever skill triggers (<500 lines ideal)
3. Bundled resources — as needed

**Key patterns**:
- Keep SKILL.md under 500 lines; add hierarchy with clear pointers for follow-up
- Reference files clearly with guidance on when to read them
- For large reference files (>300 lines), include a table of contents
- When supporting multiple domains, organize by variant (e.g., `references/aws.md`, `references/gcp.md`)

**Writing style**: Prefer imperative form. Explain why things are important rather than using heavy-handed ALL-CAPS MUSTs. Use theory of mind and make the skill general, not super-narrow to specific examples.

**Structuring SKILL.md**: Follow the yry-tools format:
- Quick Start — `/yry-tools-<name> <command>` syntax
- What This Skill Does / Does NOT Do — bullet lists
- Workflow — ASCII diagram with key principles
- Borders — permission table
- Rules — numbered table with rationale
- Commands — links to command files
- Supporting Resources — links to bundled resources
- Fallback — situation/behavior table

**Examples pattern**:
```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

## Phase 4: Test Cases

After writing the skill draft, come up with 2-3 realistic test prompts. Share them with the user and confirm before proceeding to eval.

Save test cases to `evals/evals.json` (prompts only, no assertions yet):

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": []
    }
  ]
}
```

See `../references/schemas.md` for the full schema. Then proceed to the eval command.

## Communicating with the User

The skill creator is used by people across a wide range of familiarity with coding jargon. Pay attention to context cues to calibrate communication. Briefly explain terms if unsure whether the user will get them.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User already has a draft skill | Skip to eval/improve phase; go to [eval.md](./eval.md) |
| User says "just vibe with me" | Skip formal evals; iterate informally in conversation |
| User wants to edit an existing skill | Go to [improve.md](./improve.md); preserve original name |
| Installed skill path is read-only | Copy to `/tmp/skill-name/` before editing |
