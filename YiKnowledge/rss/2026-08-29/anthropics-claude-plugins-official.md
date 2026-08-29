---
title: anthropics/claude-plugins-official
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-29'
source: https://github.com/anthropics/claude-plugins-official
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Official, Anthropic-managed directory of high quality Claude Code Plugins.</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://code.claude.com/docs/en/plugins">https://code.claude.com/docs/en/plugins</a></p><hr /><h1>Claude Code Plugins Directory</h1> 
<p>A curated directory of high-quality plugins for Claude Code.</p> 
<blockquote> 
 <p><strong>⚠️ Important:</strong> Make sure you trust a plugin before installing, updating, or using it. Anthropic does not control what MCP servers, files, or other software are included in plugins and cannot verify that they will work as intended or that they won't change. See each plugin's homepage for more information.</p> 
</blockquote> 
<h2>Structure</h2> 
<ul> 
 <li><strong><code>/plugins</code></strong> - Internal plugins developed and maintained by Anthropic</li> 
 <li><strong><code>/external_plugins</code></strong> - Third-party plugins from partners and the community</li> 
</ul> 
<h2>Installation</h2> 
<p>Plugins can be installed directly from this marketplace via Claude Code's plugin system.</p> 
<p>To install, run <code>/plugin install {plugin-name}@claude-plugins-official</code></p> 
<p>or browse for the plugin in <code>/plugin &gt; Discover</code></p> 
<h2>Contributing</h2> 
<h3>Internal Plugins</h3> 
<p>Internal plugins are developed by Anthropic team members. See <code>/plugins/example-plugin</code> for a reference implementation.</p> 
<h3>External Plugins</h3> 
<p>Third-party partners can submit plugins for inclusion in the marketplace. External plugins must meet quality and security standards for approval. To submit a new plugin, use the <a href="https://clau.de/plugin-directory-submission">plugin directory submission form</a>.</p> 
<h2>Plugin Structure</h2> 
<p>Each plugin follows a standard structure:</p> 
<pre><code>plugin-name/
├── .claude-plugin/
│   └── plugin.json      # Plugin metadata (required)
├── .mcp.json            # MCP server configuration (optional)
├── commands/            # Slash commands (optional)
├── agents/              # Agent definitions (optional)
├── skills/              # Skill definitions (optional)
└── README.md            # Documentation
</code></pre> 
<h2>Plugin names are immutable</h2> 
<p>The <code>name</code> field in a marketplace entry is an <strong>immutable slug</strong>. Once a plugin has been published, its <code>name</code> must not change — users have it installed under that slug, and renaming it breaks their install with a <code>plugin-not-found</code> error.</p> 
<ul> 
 <li>To change how a plugin is labeled in the UI, set or update <code>displayName</code> instead.</li> 
 <li>If a rename is genuinely unavoidable, add an entry to the top-level <code>renames</code> map in <code>.claude-plugin/marketplace.json</code> so existing installs auto-migrate:</li> 
</ul> 
<pre><code class="language-json">"renames": {
  "old-name": "new-name"
}
</code></pre> 
<p>The Claude Code plugin loader reads this map and transparently rewrites the old slug to the new one on the user's next sync.</p> 
<h2>Skill-bundle plugins</h2> 
<p>When a plugin's source repository ships skills (<code>SKILL.md</code> files) without a <code>.claude-plugin/plugin.json</code> manifest, the marketplace entry can declare the skills directly using <code>strict: false</code> and an explicit <code>skills</code> array.</p> 
<pre><code class="language-json">{
  "name": "example-bundle",
  "description": "Brief description of the bundled skills.",
  "author": { "name": "Author Name" },
  "category": "development",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/example-org/sdk.git",
    "path": "packages/agent-skills",
    "ref": "main",
    "sha": "&lt;commit sha&gt;"
  },
  "strict": false,
  "skills": [
    "./skill-a",
    "./skill-b",
    "./skill-c"
  ],
  "homepage": "https://github.com/example-org/sdk"
}
</code></pre> 
<p>Each path in <code>skills</code> is relative to <code>source.path</code> and points at a directory containing a <code>SKILL.md</code>. Paths can reach deeper than a single level — for example, <code>["./libA/skill-1", "./libB/skill-2"]</code> exposes a curated subset across multiple library subdirectories. Each skill is registered as <code>&lt;plugin-name&gt;:&lt;skill-name&gt;</code> in Claude Code.</p> 
<p>For the underlying schema, see <a href="https://code.claude.com/docs/en/plugin-marketplaces">Strict mode</a> in the marketplace documentation.</p> 
<h2>License</h2> 
<p>Please see each linked plugin for the relevant LICENSE file.</p> 
<h2>Documentation</h2> 
<p>For more information on developing Claude Code plugins, see the <a href="https://code.claude.com/docs/en/plugins">official documentation</a>.</p>