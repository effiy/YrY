
<h4 align="center">Persistent memory compression system built for <a href="https://claude.com/claude-code" target="_blank">Claude Code</a>.</h4>

  <a href="#quick-start">Quick Start</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#mcp-search-tools">Search Tools</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#license">License</a>

  Claude-Mem seamlessly preserves context across sessions by automatically capturing tool usage observations, generating semantic summaries, and making them available to future sessions. This enables Claude to maintain continuity of knowledge about projects even after sessions end or reconnect.

---

## Quick Start

Install with a single command:

```bash
npx claude-mem install
```

Or install for Gemini CLI (auto-detects `~/.gemini`):

```bash
npx claude-mem install --ide gemini-cli
```
Or install for OpenCode:

```bash
npx claude-mem install --ide opencode
```

Or install from the plugin marketplace inside Claude Code:

```bash
/plugin marketplace add thedotmack/claude-mem

/plugin install claude-mem
```

Restart Claude Code or Gemini CLI. Context from previous sessions will automatically appear in new sessions.

> **Note:** Claude-Mem is also published on npm, but `npm install -g claude-mem` installs the **SDK/library only** — it does not register the plugin hooks or set up the worker service. Always install via `npx claude-mem install` or the `/plugin` commands above.

### 🦞 OpenClaw Gateway

Install claude-mem as a persistent memory plugin on [OpenClaw](https://openclaw.ai) gateways with a single command:

```bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
```

The installer handles dependencies, plugin setup, AI provider configuration, worker startup, and optional real-time observation feeds to Telegram, Discord, Slack, and more. See the [OpenClaw Integration Guide](https://docs.claude-mem.ai/openclaw-integration) for details.

**Key Features:**

- 🧠 **Persistent Memory** - Context survives across sessions
- 📊 **Progressive Disclosure** - Layered memory retrieval with token cost visibility
- 🔍 **Skill-Based Search** - Query your project history with mem-search skill
- 🖥️ **Web Viewer UI** - Real-time memory stream at http://localhost:37777
- 💻 **Claude Desktop Skill** - Search memory from Claude Desktop conversations
- 🔒 **Privacy Control** - Use `<private>` tags to exclude sensitive content from storage
- ⚙️ **Context Configuration** - Fine-grained control over what context gets injected
- 🤖 **Automatic Operation** - No manual intervention required
- 🔗 **Citations** - Reference past observations with IDs (access via http://localhost:37777/api/observation/{id} or view all in the web viewer at http://localhost:37777)
- 🧪 **Beta Channel** - Try experimental features like Endless Mode via version switching

---

## Documentation

📚 **[View Full Documentation](https://docs.claude-mem.ai/)** - Browse on official website

### Getting Started

- **[Installation Guide](https://docs.claude-mem.ai/installation)** - Quick start & advanced installation
- **[Gemini CLI Setup](https://docs.claude-mem.ai/gemini-cli/setup)** - Dedicated guide for Google's Gemini CLI integration
- **[Usage Guide](https://docs.claude-mem.ai/usage/getting-started)** - How Claude-Mem works automatically
- **[Search Tools](https://docs.claude-mem.ai/usage/search-tools)** - Query your project history with natural language
- **[Beta Features](https://docs.claude-mem.ai/beta-features)** - Try experimental features like Endless Mode

### Best Practices

- **[Context Engineering](https://docs.claude-mem.ai/context-engineering)** - AI agent context optimization principles
- **[Progressive Disclosure](https://docs.claude-mem.ai/progressive-disclosure)** - Philosophy behind Claude-Mem's context priming strategy

### Architecture

- **[Overview](https://docs.claude-mem.ai/architecture/overview)** - System components & data flow
- **[Architecture Evolution](https://docs.claude-mem.ai/architecture-evolution)** - The journey from v3 to v5
- **[Hooks Architecture](https://docs.claude-mem.ai/hooks-architecture)** - How Claude-Mem uses lifecycle hooks
- **[Hooks Reference](https://docs.claude-mem.ai/architecture/hooks)** - 7 hook scripts explained
- **[Worker Service](https://docs.claude-mem.ai/architecture/worker-service)** - HTTP API & Bun management
- **[Database](https://docs.claude-mem.ai/architecture/database)** - SQLite schema & FTS5 search
- **[Search Architecture](https://docs.claude-mem.ai/architecture/search-architecture)** - Hybrid search with Chroma vector database

### Configuration & Development

- **[Configuration](https://docs.claude-mem.ai/configuration)** - Environment variables & settings
- **[Development](https://docs.claude-mem.ai/development)** - Building, testing, contributing
- **[Troubleshooting](https://docs.claude-mem.ai/troubleshooting)** - Common issues & solutions

---

## How It Works

**Core Components:**

1. **5 Lifecycle Hooks** - SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd (6 hook scripts)
2. **Smart Install** - Cached dependency checker (pre-hook script, not a lifecycle hook)
3. **Worker Service** - HTTP API on port 37777 with web viewer UI and 10 search endpoints, managed by Bun
4. **SQLite Database** - Stores sessions, observations, summaries
5. **mem-search Skill** - Natural language queries with progressive disclosure
6. **Chroma Vector Database** - Hybrid semantic + keyword search for intelligent context retrieval

See [Architecture Overview](https://docs.claude-mem.ai/architecture/overview) for details.

---

## MCP Search Tools

Claude-Mem provides intelligent memory search through **4 MCP tools** following a token-efficient **3-layer workflow pattern**:

**The 3-Layer Workflow:**

1. **`search`** - Get compact index with IDs (~50-100 tokens/result)
2. **`timeline`** - Get chronological context around interesting results
3. **`get_observations`** - Fetch full details ONLY for filtered IDs (~500-1,000 tokens/result)

**How It Works:**
- Claude uses MCP tools to search your memory
- Start with `search` to get an index of results
- Use `timeline` to see what was happening around specific observations
- Use `get_observations` to fetch full details for relevant IDs
- **~10x token savings** by filtering before fetching details

**Available MCP Tools:**

1. **`search`** - Search memory index with full-text queries, filters by type/date/project
2. **`timeline`** - Get chronological context around a specific observation or query
3. **`get_observations`** - Fetch full observation details by IDs (always batch multiple IDs)

**Example Usage:**

```typescript
// Step 1: Search for index
search(query="authentication bug", type="bugfix", limit=10)

// Step 2: Review index, identify relevant IDs (e.g., #123, #456)

// Step 3: Fetch full details
get_observations(ids=[123, 456])
```

See [Search Tools Guide](https://docs.claude-mem.ai/usage/search-tools) for detailed examples.

---

## Beta Features

Claude-Mem offers a **beta channel** with experimental features like **Endless Mode** (biomimetic memory architecture for extended sessions). Switch between stable and beta versions from the web viewer UI at http://localhost:37777 → Settings.

See **[Beta Features Documentation](https://docs.claude-mem.ai/beta-features)** for details on Endless Mode and how to try it.

---

## System Requirements

- **Node.js**: 18.0.0 or higher
- **Claude Code**: Latest version with plugin support
- **Bun**: JavaScript runtime and process manager (auto-installed if missing)
- **uv**: Python package manager for vector search (auto-installed if missing)
- **SQLite 3**: For persistent storage (bundled)

---
### Windows Setup Notes

If you see an error like:

```powershell
npm : The term 'npm' is not recognized as the name of a cmdlet
```

Make sure Node.js and npm are installed and added to your PATH. Download the latest Node.js installer from https://nodejs.org and restart your terminal after installation.

---

## Configuration

Settings are managed in `~/.claude-mem/settings.json` (auto-created with defaults on first run). Configure AI model, worker port, data directory, log level, and context injection settings.

See the **[Configuration Guide](https://docs.claude-mem.ai/configuration)** for all available settings and examples.

### Mode & Language Configuration

Claude-Mem supports multiple workflow modes and languages via the `CLAUDE_MEM_MODE` setting.

This option controls both:
- The workflow behavior (e.g. code, chill, investigation)
- The language used in generated observations

#### How to Configure

Edit your settings file at `~/.claude-mem/settings.json`:

```json
{
  "CLAUDE_MEM_MODE": "code--zh"
}
```

Modes are defined in `plugin/modes/`. To see all available modes locally:

```bash
ls ~/.claude/plugins/marketplaces/thedotmack/plugin/modes/
```

#### Available Modes

| Mode | Description |
|------------|-------------------------|
| `code` | Default English mode |
| `code--zh` | Simplified Chinese mode |
| `code--ja` | Japanese mode |

Language-specific modes follow the pattern `code--[lang]` where `[lang]` is the ISO 639-1 language code (e.g., `zh` for Chinese, `ja` for Japanese, `es` for Spanish).

> Note: `code--zh` (Simplified Chinese) is already built-in — no additional installation or plugin update is required.

#### After Changing Mode

Restart Claude Code to apply the new mode configuration.
---

## Development

See the **[Development Guide](https://docs.claude-mem.ai/development)** for build instructions, testing, and contribution workflow.

---

## Troubleshooting

If experiencing issues, describe the problem to Claude and the troubleshoot skill will automatically diagnose and provide fixes.

See the **[Troubleshooting Guide](https://docs.claude-mem.ai/troubleshooting)** for common issues and solutions.

---
