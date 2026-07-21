---
name: yry-tools-cc
description: >
  Curated Claude Code ecosystem navigator — picks the right subagent,
  skill, workflow, command, plugin, or tip for a given task. Pulls
  from two upstreams registered in references/sources.json
  (VoltAgent/awesome-claude-code-subagents for subagent definitions;
  shanraisshan/claude-code-best-practice for concepts, workflows,
  skills, tips, videos, cross-model integrations), indexes them
  locally, and recommends the most relevant resource with exact title
  and URL. Trigger when the user wants to: find a Claude Code subagent
  (backend, frontend, security, ML, DevOps), look up a concept
  (subagents, commands, skills, hooks, MCP, plugins, settings,
  status line, memory, checkpointing, agent teams, devcontainers),
  pick a workflow / methodology (superpowers, spec kit, BMAD, OpenSpec,
  compound engineering), find curated skill / agent collections
  (anthropics/skills, VoltAgent/awesome-agent-skills,
  msitarzewski/agency-agents), discover cross-model workflows (codex
  plugin, claude-code-router, pal-mcp-server), read tips and tricks
  (prompting, planning, context, CLAUDE.md, debugging, utilities),
  find videos / podcasts, or compare Claude Code to competing tools
  (CodeRabbit, Greptile, Cursor, etc.). Trigger words: "claude
  code", "claude code subagent", ".claude/agents", "claude code
  plugin", "claude code skill", "claude code command", "claude code
  hook", "claude code mcp", "claude code workflow", ".claude/
  settings.json", "CLAUDE.md", "plan mode", "ultrathink",
  "thinking mode", "/compact", "/clear", "/rewind", "/loop",
  "/schedule", "/model", "/agents", "/skills", "/ultrareview",
  "/ultraplan", "agent sdk", "claude code web", "channels",
  "devcontainers", "codex plugin", "gemini cli", "vibe coding",
  "context engineering", "awesome claude code subagents".

  Do NOT trigger for: non-Claude-Code tools (GitHub Copilot, Cursor,
  Windsurf, Aider, Cody, Continue, Tabnine, Codeium, Zed AI,
  JetBrains AI) unless explicitly comparing, Anthropic API usage
  (Messages API, tool use, prompt caching) unrelated to Claude Code
  the CLI, Claude.ai consumer product questions, or general LLM / AI
  engineering advice not specific to Claude Code.
lifecycle: default-pipeline
user_invocable: true
---

# yry-tools-cc — Curated Claude Code Ecosystem Navigator

> Pick the right Claude Code subagent, skill, workflow, or tip.
> Pulls from [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
> and [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice),
> ~336 resources across 18 categories.

## What this skill does

1. **Maps a Claude Code question to a category** across the two
   registered sources. VoltAgent gives 158 ready-to-install subagent
   definitions across 10 categories. shanraisshan gives concepts,
   workflows, skills, tips, videos, and cross-model integrations
   (175+ items across 8 sections, with the Tips section broken into
   12 sub-topics).
2. **Recommends a subagent** for a specific task domain (backend,
   frontend, ML, security, DevOps, mobile, blockchain, fintech,
   healthcare, SEO, etc.). Each subagent comes with a name, a
   one-line role description, and the source path to its full `.md`
   definition.
3. **Recommends a Claude Code concept reference** for a feature
   question (what is plan mode, how does `/ultrareview` work, what's
   the difference between subagents and skills). Surfaces the relevant
   `code.claude.com/docs/...` page with the supporting shanraisshan
   tip or hot-feature entry.
4. **Recommends a workflow / methodology** (superpowers, gstack, GSD,
   spec kit, BMAD, OpenSpec, oh-my-claudecode, compound engineering,
   HumanLayer), each with a star count and the workflow steps.
5. **Recommends a curated collection** of skills (mattpocock/skills,
   anthropics/skills, awesome-agent-skills) or agents
   (msitarzewski/agency-agents) when the user wants a one-stop repo.
6. **Recommends a cross-model workflow** (Codex plugin,
   claude-code-router, pal-mcp-server, CLIProxyAPI) for routing
   Claude Code to other models.
7. **Surfaces targeted tips** for a topic — "tips about
   `CLAUDE.md`", "tips about debugging", "tips about agent teams",
   "tips about hooks".
8. **Cites every recommendation** by exact title and URL with the
   `[src:source-id]` tag.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot
  in `references/`.
- Does NOT install subagents, skills, plugins, or hooks. Recommend
  a subagent and point the user at its `.md` file or the
  `claude plugin install <name>` command.
- Does NOT teach Claude Code from scratch — point the user at
  `https://code.claude.com/docs/` for conceptual questions, or use
  the `CONCEPTS` category in the local index for a curated overview.
- Does NOT cover non-Claude-Code tools (GitHub Copilot, Cursor,
  Windsurf, Aider, Cody, Continue, Zed AI, etc.).
- Does NOT write or modify the user's `CLAUDE.md`, settings.json,
  or `.claude/` directory — this skill is a navigator, not an editor.
- Does NOT run `claude` CLI commands or `/slash-commands` on the
  user's behalf.

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent:
   - "I need a Claude Code subagent for X" → `Language Specialists`,
     `Quality & Security`, `Infrastructure`, `Data & AI`, etc.
     depending on X.
   - "What is / how do I use Y in Claude Code" → `CONCEPTS` for the
     docs page, then the matching `TIPS AND TRICKS / <sub-topic>`.
   - "What workflow / methodology should I use for X" →
     `DEVELOPMENT WORKFLOWS` or `CROSS-MODEL WORKFLOWS`.
   - "I want a bundle of skills / subagents to install" →
     `SKILL COLLECTIONS` or `AGENT COLLECTIONS`.
   - "What does Claude Code replace that I'm already paying for" →
     `STARTUPS / BUSINESSES`.
   - "Show me a video / podcast on X" → `VIDEOS / PODCASTS`.
3. **Filter** to 1-3 high-signal picks — prefer fewer, well-chosen
   resources over a dump of 50 links.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.
   Do not paraphrase the title. Distinguish concept links (pointing
   to `code.claude.com/docs/...`) from community links (tweets,
   GitHub repos, blog posts).

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/sources.json](./references/sources.json) — registered sources.

## Fallback

| Situation | Behavior |
|-----------|---------|
| `references/index.md` missing | Re-run `/yry-init` to rebuild the index, or filter `sources.json` by topic manually. |
| Subagent / workflow not in any registered source | State the gap, suggest the closest related topic, ask the user how to proceed. |
| User wants to install a subagent | Recommend a subagent from the index, then point the user at the `claude plugin install voltagent-<category>` command (or copy the `.md` to `~/.claude/agents/`). This skill does not install. |
| User wants Claude Code conceptual docs | Look in `CONCEPTS` for the `code.claude.com/docs/...` link, otherwise point the user at https://code.claude.com/docs/ directly. |
| Stale README (upstream has moved on) | Tell the user the snapshot may be stale; suggest re-fetching from the upstream repos. |
| User asks about a non-Claude-Code tool (GitHub Copilot, Cursor, etc.) | Out of scope; defer to general Claude. |
| User wants me to actually write a subagent, skill, command, hook, or CLAUDE.md | Recommend a similar existing resource, then hand off — this skill is a navigator, not a generator. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
