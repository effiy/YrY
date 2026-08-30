---
title: JetBrains/go-modern-guidelines
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/JetBrains/go-modern-guidelines
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Help AI coding agents write modern Go</p><hr /><p><a href="https://confluence.jetbrains.com/display/ALL/JetBrains+on+GitHub"><img alt="official JetBrains project" src="http://jb.gg/badges/official.svg?sanitize=true" /></a></p> 
<h1>Modern Go Guidelines</h1> 
<p>This repository contains <a href="https://github.com/JetBrains/go-modern-guidelines/raw/main/plugin/skills/use-modern-go/SKILL.md">guidelines</a> for code agents that help them write modern Go code.</p> 
<p>For example, an agent with these guidelines uses <code>max(a, b)</code> instead of an if-else block, <code>slices.Contains</code> instead of a manual loop, <code>cmp.Or(a, b, c)</code> instead of a chain of nil checks. It also knows about recent additions like <code>new(42)</code> to get a pointer to a value and <code>errors.AsType[T](err)</code> for type-safe error matching—both from Go 1.26.</p> 
<p>The guidelines cover the most useful features from Go 1.0 through Go 1.27, including everything targeted by the <code>modernize</code> analyzer. An agent will:</p> 
<ul> 
 <li>Detect the project's Go version from <code>go.mod</code></li> 
 <li>Use language features and stdlib additions available up to and including that version</li> 
 <li>Prefer modern idioms over older patterns</li> 
</ul> 
<h2>Motivation</h2> 
<p>All coding agents tend to generate outdated Go. Two reasons:</p> 
<ol> 
 <li> <p><strong>Training data lag.</strong> Models don't know about features added after their training cutoff. They can't use <code>errors.AsType[T]</code> (Go 1.26) if they've never seen it.</p> </li> 
 <li> <p><strong>Frequency bias.</strong> Even for features the model knows, it often picks older patterns. There's more <code>for i := 0; i &lt; n; i++</code> in the training data than <code>for i := range n</code>, so that's what comes out.</p> </li> 
</ol> 
<p>These guidelines fix both problems by giving the agent an explicit reference.</p> 
<p>This aligns with the Go team's direction. The <code>modernize</code> analyzer exists to automatically update existing code to use newer idioms (see <a href="https://www.youtube.com/watch?v=_VePjjjV9JU">this talk</a> from the Go team). These guidelines serve the same goal for new code: agents write modern Go from the start, so there's less to fix later.</p> 
<h2>Requirements</h2> 
<p>The marketplace integrations run a small CLI that is installed on first use with <code>go install</code>. Because of that, the <a href="https://go.dev/dl/">Go toolchain</a> must be installed and available on your <code>PATH</code>.</p> 
<p>The CLI is installed into a local cache (for example <code>~/.cache/go-modern-guidelines</code>) and never modifies your project. It targets <strong>Go 1.25 or newer</strong>; on an older Go it still works as long as automatic toolchain switching is enabled (<code>GOTOOLCHAIN=auto</code>, the default), which lets Go fetch a compatible toolchain on first run.</p> 
<h2>Instructions</h2> 
<p>The guidelines are available for Junie, Claude Code, Codex, and Cursor, and for other agents via <a href="http://skills.sh">skills.sh</a>.</p> 
<h3><a href="https://junie.jetbrains.com">Junie</a></h3> 
<h4>Junie CLI</h4> 
<p>Run the following commands inside a Junie CLI session.</p> 
<ol> 
 <li>Add this repository as a marketplace:</li> 
</ol> 
<pre><code>/extensions marketplace add JetBrains/go-modern-guidelines
</code></pre> 
<ol start="2"> 
 <li>Install the extension:</li> 
</ol> 
<pre><code>/extensions install modern-go-guidelines
</code></pre> 
<p>Junie invokes the skill automatically when it is relevant to a Go task.</p> 
<h4>Updating</h4> 
<p>Update the installed extension from inside a Junie CLI session:</p> 
<pre><code>/extensions update modern-go-guidelines
</code></pre> 
<h3><a href="https://claude.com/product/claude-code">Claude Code</a></h3> 
<h4>Installation</h4> 
<p>Run the following commands inside a Claude Code session.</p> 
<ol> 
 <li>Add this repository as a marketplace:</li> 
</ol> 
<pre><code>/plugin marketplace add JetBrains/go-modern-guidelines
</code></pre> 
<ol start="2"> 
 <li>Install the plugin:</li> 
</ol> 
<pre><code>/plugin install modern-go-guidelines@goland-claude-marketplace
</code></pre> 
<h4>Usage</h4> 
<p>Claude Code invokes the skill automatically when it is relevant to a Go task.</p> 
<p>To invoke it explicitly:</p> 
<pre><code>/modern-go-guidelines:use-modern-go
</code></pre> 
<h4>Updating</h4> 
<p>Claude Code can update the marketplace and installed plugin automatically at startup. Automatic updates are disabled by default for third-party marketplaces, so enable them once:</p> 
<ol> 
 <li>Run <code>/plugin</code>.</li> 
 <li>Open <strong>Marketplaces</strong> and select <code>goland-claude-marketplace</code>.</li> 
 <li>Select <strong>Enable auto-update</strong>.</li> 
</ol> 
<p>When Claude Code reports that the plugin was updated, apply the new version to the current session with:</p> 
<pre><code>/reload-plugins
</code></pre> 
<p>To update it manually instead, run these commands in a terminal:</p> 
<pre><code class="language-bash">claude plugin marketplace update goland-claude-marketplace
claude plugin update modern-go-guidelines@goland-claude-marketplace
</code></pre> 
<h3><a href="https://developers.openai.com/codex/">Codex</a></h3> 
<h4>Installation</h4> 
<p>Run the following commands in a terminal.</p> 
<ol> 
 <li>Add this repository as a marketplace:</li> 
</ol> 
<pre><code>codex plugin marketplace add JetBrains/go-modern-guidelines
</code></pre> 
<ol start="2"> 
 <li>Install the plugin:</li> 
</ol> 
<pre><code>codex plugin add modern-go-guidelines@goland-codex-marketplace
</code></pre> 
<h4>Updating</h4> 
<p>Refresh the marketplace and reinstall the plugin so Codex replaces its cached copy:</p> 
<pre><code class="language-bash">codex plugin marketplace upgrade goland-codex-marketplace
codex plugin remove modern-go-guidelines@goland-codex-marketplace
codex plugin add modern-go-guidelines@goland-codex-marketplace
</code></pre> 
<h3><a href="https://cursor.com">Cursor</a></h3> 
<p>For convenience, the guidelines are distributed as a Cursor plugin.</p> 
<h4>Installation</h4> 
<ol> 
 <li>Add this repository as a marketplace by running the following command in a terminal:</li> 
</ol> 
<pre><code>cursor-agent plugin marketplace add https://github.com/JetBrains/go-modern-guidelines
</code></pre> 
<ol start="2"> 
 <li>Install the plugin with the <code>/plugins</code> command inside a Cursor session.</li> 
</ol> 
<h4>Updating</h4> 
<p>Refresh the marketplace from Git and reopen Cursor so it can pick up the new plugin version:</p> 
<pre><code class="language-bash">cursor-agent plugin marketplace update goland-cursor-marketplace
</code></pre> 
<p>If the installed plugin is still on the previous version, reinstall it with the <code>/plugins</code> command. Cursor does not currently provide a non-interactive CLI command for updating an installed plugin.</p> 
<h3>Other Agents (via <a href="https://skills.sh">skills.sh</a>)</h3> 
<p>The same skill package works across other agents such as OpenCode. Install it with:</p> 
<pre><code class="language-bash">npx skills add JetBrains/go-modern-guidelines
</code></pre> 
<p>(<code>--skill use-modern-go</code> installs only this skill.)</p> 
<h4>Updating</h4> 
<p>Update the project-installed skill with:</p> 
<pre><code class="language-bash">npx skills update use-modern-go -p -y
</code></pre> 
<p>For a globally installed skill, replace <code>-p</code> with <code>-g</code>.</p> 
<h2>Local development</h2> 
<p>To try changes to the CLI in your agent, build this checkout into the tool's cache:</p> 
<pre><code class="language-bash">make dev-install
</code></pre> 
<p>Then set <code>GO_MODERN_GUIDELINES_DEV=1</code> in the environment your agent runs in. With it set, any agent using the plugin runs your local build instead of the released version, the same way across Claude Code, Codex, and Cursor. Export it before launching the agent so the agent process inherits it:</p> 
<pre><code class="language-bash">export GO_MODERN_GUIDELINES_DEV=1
</code></pre> 
<p>After editing the CLI, run <code>make dev-install</code> again to rebuild; the next call picks it up. To go back to the released version, unset the variable (or run <code>make dev-uninstall</code> to remove the build):</p> 
<pre><code class="language-bash">make dev-uninstall
</code></pre> 
<p>This requires the Go toolchain. The dev build is stored in the tool's cache directory (<code>$XDG_CACHE_HOME/go-modern-guidelines</code> or <code>~/.cache/go-modern-guidelines</code>).</p> 
<p>The build is driven by <code>scripts/dev-install.sh</code>, which is intentionally separate from the agent-facing wrapper so an agent can never trigger a build. Without <code>make</code> (for example on Windows) you can run it directly:</p> 
<pre><code class="language-bash">sh scripts/dev-install.sh install       # or: uninstall
pwsh scripts/dev-install.ps1 install    # PowerShell equivalent
</code></pre>