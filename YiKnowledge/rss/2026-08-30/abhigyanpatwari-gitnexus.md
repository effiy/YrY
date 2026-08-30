---
title: abhigyanpatwari/GitNexus
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-30'
source: https://github.com/abhigyanpatwari/GitNexus
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>GitNexus: The Zero-Server Code Intelligence Engine - GitNexus is a client-side knowledge graph creator that runs entirely in your browser. Drop in a git repository (Github, Gitlab, Azure, Local) or ZIP file, and get an interactive knowledge graph with a built in Graph RAG Agent. Perfect for code exploration</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://gitnexus.vercel.app">https://gitnexus.vercel.app</a></p><hr /><h1>GitNexus (Akon Labs)</h1> 
<p><strong>⚠️ Important Notice:</strong> GitNexus has NO official cryptocurrency, token, or coin. Any token/coin using the GitNexus name on Pump.fun or any other platform is <strong>not affiliated with, endorsed by, or created by</strong> this project or its maintainers. Do not purchase any cryptocurrency claiming association with GitNexus.</p> 
<div align="center"> 
 <a href="https://trendshift.io/repositories/19809" target="_blank"> <img alt="abhigyanpatwari%2FGitNexus | Trendshift" height="55" src="https://trendshift.io/api/badge/repositories/19809" style="width: 250px; height: 55px;" width="250" /> </a> 
 <p> <a href="https://discord.gg/MgJrmsqr62"> <img alt="Discord" src="https://img.shields.io/discord/1477255801545429032?color=5865F2&amp;logo=discord&amp;logoColor=white" /> </a> <a href="https://www.npmjs.com/package/gitnexus"> <img alt="npm version" src="https://img.shields.io/npm/v/gitnexus.svg?sanitize=true" /> </a> <a href="https://polyformproject.org/licenses/noncommercial/1.0.0/"> <img alt="License: PolyForm Noncommercial" src="https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg?sanitize=true" /> </a> <a href="https://securityscorecards.dev/viewer/?uri=github.com/abhigyanpatwari/GitNexus"> <img alt="OpenSSF Scorecard" src="https://api.securityscorecards.dev/projects/github.com/abhigyanpatwari/GitNexus/badge" /> </a> <a href="https://github.com/abhigyanpatwari/GitNexus/actions/workflows/ci.yml"> <img alt="CI Workflows" src="https://github.com/abhigyanpatwari/GitNexus/actions/workflows/ci.yml/badge.svg?sanitize=true" /> </a> </p> 
 <p><strong>The nervous system for agent context.</strong></p> 
 <p> Indexes any codebase into a knowledge graph — every dependency, call chain, cluster, and execution flow — then exposes it through smart MCP tools so AI agents never miss code. </p> 
 <p> 💬 <a href="https://discord.gg/MgJrmsqr62">Discord</a> · 🌐 <a href="https://gitnexus.vercel.app">Web UI</a> · 🏢 <a href="https://akonlabs.com">Enterprise (SaaS &amp; self-hosted)</a> </p> 
</div> 
<p><a href="https://github.com/user-attachments/assets/172685ba-8e54-4ea7-9ad1-e31a3398da72">https://github.com/user-attachments/assets/172685ba-8e54-4ea7-9ad1-e31a3398da72</a></p> 
<blockquote> 
 <p><em>Like DeepWiki, but deeper.</em> DeepWiki helps you <em>understand</em> code. GitNexus lets you <em>analyze</em> it — a knowledge graph tracks every relationship, not just descriptions.</p> 
</blockquote> 
<p><strong>TL;DR:</strong> The <strong>CLI + MCP</strong> makes your AI agent reliable — it gives Cursor, Claude Code, Antigravity, Codex, and friends a deep architectural view of your codebase so they stop missing dependencies, breaking call chains, and shipping blind edits. Even smaller models get full architectural clarity. The <strong>Web UI</strong> is a quick way to chat with any repo in the browser.</p> 
<h2>Quick Start</h2> 
<pre><code class="language-bash"># 1. Index your repo (run from repo root)
npx gitnexus analyze

# 2. Connect your editors (one-time, auto-detects Claude Code, Cursor, Codex, …)
npx gitnexus setup
</code></pre> 
<p>That's it. <code>analyze</code> indexes the codebase, installs agent skills, registers Claude Code hooks, and creates <code>AGENTS.md</code> / <code>CLAUDE.md</code> context files — all in one command. <code>setup</code> writes the MCP config so your AI agent can use the graph.</p> 
<details> 
 <strong>Install problems?</strong> npm 11 crash · slow cold install · no C++ toolchain 
 <blockquote> 
  <p><strong>On npm 11.x?</strong> <code>npx</code> can crash during install with <code>Cannot destructure property 'package' of 'node.target'</code> (an npm/arborist bug, before GitNexus runs). Use pnpm instead — it builds the native deps explicitly:</p> 
  <pre><code class="language-bash">pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter dlx gitnexus@latest analyze
</code></pre> 
  <p>Or install globally (<code>npm install -g gitnexus@latest</code>) and run <code>gitnexus analyze</code>. See <a href="https://github.com/abhigyanpatwari/GitNexus/issues/1939">#1939</a>.</p> 
 </blockquote> 
 <blockquote> 
  <p><strong>Fastest MCP startup:</strong> install globally (<code>npm i -g gitnexus</code>) before running <code>gitnexus setup</code> — this writes an absolute-path MCP config that bypasses <code>npx</code> entirely. On a cold cache, an <code>npx</code>-based MCP install can exceed Claude Code's <code>MCP_TIMEOUT</code> default (~30s).</p> 
 </blockquote> 
 <blockquote> 
  <p><strong>No C++ toolchain?</strong> Set <code>GITNEXUS_SKIP_OPTIONAL_GRAMMARS=1</code> before <code>npm install -g gitnexus</code> to skip the vendored grammar materialize/build for <code>tree-sitter-dart</code>, <code>tree-sitter-proto</code>, <code>tree-sitter-swift</code>, and <code>tree-sitter-kotlin</code> — those four languages won't be parsed, but install completes in seconds without <code>python3</code>/<code>make</code>/<code>g++</code>. Strict <code>=1</code> only — any other value falls through to the rebuild.</p> 
 </blockquote> 
 <blockquote> 
  <p><strong>Behind an HTTP proxy / regional firewall?</strong> <code>onnxruntime-node</code>'s postinstall downloads optional CUDA binaries from <code>api.nuget.org</code> and ignores <code>HTTP_PROXY</code>/<code>HTTPS_PROXY</code> (<a href="https://github.com/abhigyanpatwari/GitNexus/issues/2370">#2370</a>). The embedding stack is an optional dependency, so a failed download no longer breaks the install — and it self-heals: the first <code>gitnexus analyze --embeddings</code> (or <code>gitnexus embeddings install</code>) fetches the stack through your npm registry config (mirrors/proxies apply, no NuGet) into <code>~/.gitnexus/embedding-runtime</code> (override with <code>GITNEXUS_EMBEDDING_RUNTIME_DIR</code>). The on-demand prefix needs Node with <code>module.registerHooks</code> (≥ 22.15 on 22.x, ≥ 23.5 on 23.x); on older Node, keep the stack in the install itself with <code>ONNXRUNTIME_NODE_INSTALL=skip npm install -g gitnexus</code> (works on every supported Node).</p> 
 </blockquote> 
 <blockquote> 
  <p><strong>About <code>tree-sitter-kotlin</code>:</strong> like Dart/Proto/Swift, Kotlin is a <strong>vendored</strong> grammar (under <code>gitnexus/vendor/tree-sitter-kotlin</code>). Upstream ships <strong>source only</strong> (no prebuilt binaries), so GitNexus cross-builds the platform prebuilds itself (via the <code>build-tree-sitter-prebuilds</code> GitHub Actions workflow) and vendors them — the same uniform pipeline used for Dart, Proto, and Swift. <code>node-gyp-build</code> selects the right <code>.node</code> at require time, so <strong>no C/C++ toolchain is needed</strong>. If no prebuild matches your platform-arch, only Kotlin (<code>.kt</code>/<code>.kts</code>) parsing is unavailable; the rest of <code>gitnexus</code> is unaffected.</p> 
 </blockquote> 
</details> 
<h3>Deploy to Render</h3> 
<p>Deploy GitNexus in one click:</p> 
<p><a href="https://render.com/deploy?repo=https://github.com/abhigyanpatwari/GitNexus"><img alt="Deploy to Render" src="https://render.com/images/deploy-to-render-button.svg?sanitize=true" /></a></p> 
<p>The Blueprint creates two services. <code>gitnexus-server</code> runs <code>gitnexus serve</code> as a private service: no public URL, reachable only over Render's private network, with a persistent disk for indexes and cloned repos. <code>gitnexus-web</code> is the public one. It serves the UI and reverse-proxies <code>/api/*</code> to the server, so the browser talks to a single origin.</p> 
<p>At the Blueprint's defaults this runs about <strong>$35/month</strong>: $25 for the server's <code>standard</code> instance, $7 for the web service's <code>starter</code> instance, and $2.50 for the 10 GB disk. See <a href="https://render.com/pricing">Render's pricing</a> for other plans.</p> 
<p>The deploy generates an access token, and the UI asks for it on first use:</p> 
<ol> 
 <li>Open the <code>gitnexus-web</code> service in your <a href="https://dashboard.render.com/">Render dashboard</a>.</li> 
 <li>Copy <code>GITNEXUS_SERVE_AUTH_TOKEN</code> from its <strong>Environment</strong> tab.</li> 
 <li>Load the site and paste the token into the prompt (or the settings panel).</li> 
</ol> 
<p>Every <code>/api/*</code> request carries that token as a header, and the proxy answers <code>401</code> without it. The browser keeps it in <code>sessionStorage</code>, so a new tab asks again. To rotate it, edit the environment variable and redeploy.</p> 
<p>The proxy strips <code>Origin</code> before forwarding, so the server's CSRF guard does nothing for proxied traffic; it passes <code>Origin</code>-less requests through by design. The token is the only control on this deploy, not a second layer behind the guard. Anyone holding it can read every indexed repo. See <a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/SECURITY.md#hosted-deploys-on-render">SECURITY.md</a>.</p> 
<p>Indexing is memory-bound. If <code>gitnexus-server</code> runs out of memory on a large repo, raise its <code>plan</code>, which sets available RAM: <code>standard</code> is 2 GB, <code>pro</code> is 4 GB. Raise <code>sizeGB</code> only if the disk fills with clones and indexes.</p> 
<h2>Two Ways to Use GitNexus</h2> 
<table> 
 <thead> 
  <tr> 
   <th></th> 
   <th><strong>CLI + MCP</strong> (recommended)</th> 
   <th><strong>Web UI</strong></th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><strong>What</strong></td> 
   <td>Index repos locally, connect AI agents via MCP</td> 
   <td>Visual graph explorer + AI chat in browser</td> 
  </tr> 
  <tr> 
   <td><strong>For</strong></td> 
   <td>Daily development with Cursor, Claude Code, Antigravity, Codex, Windsurf, OpenCode</td> 
   <td>Quick exploration, demos, one-off analysis</td> 
  </tr> 
  <tr> 
   <td><strong>Scale</strong></td> 
   <td>Full repos, any size</td> 
   <td>Limited by browser memory (~5k files), or unlimited via backend mode</td> 
  </tr> 
  <tr> 
   <td><strong>Install</strong></td> 
   <td><code>npm install -g gitnexus</code></td> 
   <td>No install — <a href="https://gitnexus.vercel.app">gitnexus.vercel.app</a></td> 
  </tr> 
  <tr> 
   <td><strong>Storage</strong></td> 
   <td>LadybugDB native (fast, persistent)</td> 
   <td>LadybugDB WASM (in-memory, per session)</td> 
  </tr> 
  <tr> 
   <td><strong>Parsing</strong></td> 
   <td>Tree-sitter native bindings</td> 
   <td>Tree-sitter WASM</td> 
  </tr> 
  <tr> 
   <td><strong>Privacy</strong></td> 
   <td>Everything local, no network</td> 
   <td>Everything in-browser, no server</td> 
  </tr> 
 </tbody> 
</table> 
<blockquote> 
 <p><strong>Bridge mode:</strong> <code>gitnexus serve</code> connects the two — the web UI auto-detects the local server and can browse all your CLI-indexed repos without re-uploading or re-indexing.</p> 
</blockquote> 
<h2>Why a Knowledge Graph?</h2> 
<p>Tools like <strong>Cursor</strong>, <strong>Claude Code</strong>, <strong>Codex</strong>, <strong>Cline</strong>, <strong>Roo Code</strong>, and <strong>Windsurf</strong> are powerful — but they don't truly know your codebase structure. So this happens:</p> 
<ol> 
 <li>AI edits <code>UserService.validate()</code></li> 
 <li>Doesn't know 47 functions depend on its return type</li> 
 <li><strong>Breaking changes ship</strong></li> 
</ol> 
<p>Traditional Graph RAG gives the LLM raw graph edges and hopes it explores enough. GitNexus <strong>precomputes structure at index time</strong> — clustering, tracing, scoring — so tools return complete context in one call:</p> 
<pre><code class="language-mermaid">flowchart TB
    subgraph Traditional["Traditional Graph RAG"]
        direction TB
        U1["User: What depends on UserService?"]
        U1 --&gt; LLM1["LLM receives raw graph"]
        LLM1 --&gt; Q1["Query 1: Find callers"]
        Q1 --&gt; Q2["Query 2: What files?"]
        Q2 --&gt; Q3["Query 3: Filter tests?"]
        Q3 --&gt; Q4["Query 4: High-risk?"]
        Q4 --&gt; OUT1["Answer after 4+ queries"]
    end

    subgraph GN["GitNexus Smart Tools"]
        direction TB
        U2["User: What depends on UserService?"]
        U2 --&gt; TOOL["impact UserService upstream"]
        TOOL --&gt; PRECOMP["Pre-structured response:
        8 callers, 3 clusters, all 90%+ confidence"]
        PRECOMP --&gt; OUT2["Complete answer, 1 query"]
    end
</code></pre> 
<p><strong>Core innovation: Precomputed Relational Intelligence</strong></p> 
<ul> 
 <li><strong>Reliability</strong> — the LLM can't miss context; it's already in the tool response</li> 
 <li><strong>Token efficiency</strong> — no 10-query chains to understand one function</li> 
 <li><strong>Model democratization</strong> — smaller LLMs work because the tools do the heavy lifting</li> 
</ul> 
<h2>What Your AI Agent Gets</h2> 
<h3>17 MCP tools (15 per-repo + 2 group)</h3> 
<table> 
 <thead> 
  <tr> 
   <th>Tool</th> 
   <th>What It Does</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>list_repos</code></td> 
   <td>Discover all indexed repositories (paginated — <code>limit</code>/<code>offset</code>)</td> 
  </tr> 
  <tr> 
   <td><code>query</code></td> 
   <td>Process-grouped hybrid search (BM25 + semantic + RRF)</td> 
  </tr> 
  <tr> 
   <td><code>context</code></td> 
   <td>360-degree symbol view — categorized refs, process participation</td> 
  </tr> 
  <tr> 
   <td><code>impact</code></td> 
   <td>Blast radius analysis with depth grouping and confidence</td> 
  </tr> 
  <tr> 
   <td><code>trace</code></td> 
   <td>Shortest directed path between two symbols (call + class-member edges)</td> 
  </tr> 
  <tr> 
   <td><code>detect_changes</code></td> 
   <td>Git-diff impact — maps changed lines to affected processes</td> 
  </tr> 
  <tr> 
   <td><code>check</code></td> 
   <td>Read-only structural checks against the indexed graph</td> 
  </tr> 
  <tr> 
   <td><code>rename</code></td> 
   <td>Multi-file coordinated rename with graph + text search</td> 
  </tr> 
  <tr> 
   <td><code>cypher</code></td> 
   <td>Raw Cypher graph queries</td> 
  </tr> 
  <tr> 
   <td><code>route_map</code></td> 
   <td>API route map — which components fetch which endpoints, and handlers</td> 
  </tr> 
  <tr> 
   <td><code>tool_map</code></td> 
   <td>MCP/RPC tool definitions — where they're defined and handled</td> 
  </tr> 
  <tr> 
   <td><code>shape_check</code></td> 
   <td>Validate API response shapes against consumers' property accesses</td> 
  </tr> 
  <tr> 
   <td><code>api_impact</code></td> 
   <td>Pre-change impact report for an API route handler</td> 
  </tr> 
  <tr> 
   <td><code>explain</code></td> 
   <td>Explain persisted taint findings (source→sink flows, <code>--pdg</code> indexes)</td> 
  </tr> 
  <tr> 
   <td><code>pdg_query</code></td> 
   <td>Query control/data dependence at statement level (<code>--pdg</code> indexes)</td> 
  </tr> 
  <tr> 
   <td><code>group_list</code></td> 
   <td>List configured repository groups</td> 
  </tr> 
  <tr> 
   <td><code>group_sync</code></td> 
   <td>Rebuild a group's Contract Registry and cross-repo links</td> 
  </tr> 
 </tbody> 
</table> 
<blockquote> 
 <p>Per-repo tools take an optional <code>repo</code> parameter (omit it when only one repo is indexed) and an optional <code>branch</code> for indexes pinned with <code>gitnexus analyze --branch</code>. Omitting <code>branch</code> queries the workspace index, which follows your checked-out working tree — switching branches and re-running <code>gitnexus analyze</code> updates it incrementally. <code>explain</code> and <code>pdg_query</code> need an index built with <code>gitnexus analyze --pdg</code>.</p> 
</blockquote> 
<h3>Resources for instant context</h3> 
<table> 
 <thead> 
  <tr> 
   <th>Resource</th> 
   <th>Purpose</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>gitnexus://repos</code></td> 
   <td>List all indexed repositories (read this first)</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://setup</code></td> 
   <td>Setup and usage guidance for agents</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://repo/{name}/context</code></td> 
   <td>Codebase stats, staleness check, and available tools</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://repo/{name}/clusters</code></td> 
   <td>All functional clusters with cohesion scores</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://repo/{name}/cluster/{name}</code></td> 
   <td>Cluster members and details</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://repo/{name}/processes</code></td> 
   <td>All execution flows</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://repo/{name}/process/{name}</code></td> 
   <td>Full process trace with steps</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://repo/{name}/schema</code></td> 
   <td>Graph schema for Cypher queries</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://group/{name}/contracts</code></td> 
   <td>A group's extracted contracts and cross-links</td> 
  </tr> 
  <tr> 
   <td><code>gitnexus://group/{name}/status</code></td> 
   <td>Staleness of repos in a group</td> 
  </tr> 
 </tbody> 
</table> 
<h3>2 MCP prompts for guided workflows</h3> 
<table> 
 <thead> 
  <tr> 
   <th>Prompt</th> 
   <th>What It Does</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><code>detect_impact</code></td> 
   <td>Pre-commit change analysis — scope, affected processes, risk level</td> 
  </tr> 
  <tr> 
   <td><code>generate_map</code></td> 
   <td>Architecture documentation from the knowledge graph with mermaid diagrams</td> 
  </tr> 
 </tbody> 
</table> 
<h3>Agent skills installed to <code>.claude/skills/</code> and <code>.agents/skills/</code> (if <code>.agents/</code> exists) automatically</h3> 
<ul> 
 <li><strong>Exploring</strong> — navigate unfamiliar code using the knowledge graph</li> 
 <li><strong>Debugging</strong> — trace bugs through call chains</li> 
 <li><strong>Impact Analysis</strong> — analyze blast radius before changes</li> 
 <li><strong>Refactoring</strong> — plan safe refactors using dependency mapping</li> 
 <li><strong>Guide</strong> — GitNexus tool/resource/schema reference for the agent</li> 
 <li><strong>CLI</strong> — run analyze/status/clean/wiki commands on request</li> 
 <li><strong>PDG Query</strong> — statement-level control/data dependence queries (<code>--pdg</code> index)</li> 
 <li><strong>Taint Analysis</strong> — source→sink data-flow findings (<code>--pdg</code> index)</li> 
 <li><strong>Plan</strong> (<code>/gitnexus-plan</code>) — implementation-ready engineering plans backed by the graph and PDG slices</li> 
 <li><strong>Work</strong> (<code>/gitnexus-work</code>) — executes a plan as impact-checked, <code>detect_changes</code>-gated atomic commits</li> 
 <li><strong>Review</strong> (<code>/gitnexus-review</code>) — graph-backed review of a PR, branch, range, or local diff, with taint pass and per-domain expert lenses</li> 
 <li><strong>LFG</strong> (<code>/gitnexus-lfg</code>) — the full pipeline: plan → user gate → work → review</li> 
</ul> 
<p><strong>Repo-specific skills</strong> — run <code>gitnexus analyze --skills</code> and GitNexus detects the functional areas of your codebase (via Leiden community detection) and generates each one as a direct project skill under <code>.claude/skills/gitnexus-area-&lt;name&gt;/</code>. Each skill describes a module's key files, entry points, execution flows, and cross-area connections, and is regenerated on each <code>--skills</code> run to stay current.</p> 
<p>When a repo contains an <code>.agents/</code> directory, the standard and generated skills are also mirrored to <code>.agents/skills/</code> (e.g. <code>.agents/skills/gitnexus-cli/</code>, <code>.agents/skills/gitnexus-area-&lt;name&gt;/</code>) so agents that read repo-local <code>.agents/skills/</code> (like Codex) stay in sync.</p> 
<h2>Editor Setup</h2> 
<p><code>gitnexus setup</code> auto-detects your editors and writes the correct global MCP config. Run it once. To configure only selected integrations, pass <code>--coding-agent</code>/<code>-c</code> with a comma-separated list, e.g. <code>gitnexus setup -c cursor,codex</code>.</p> 
<table> 
 <thead> 
  <tr> 
   <th>Editor</th> 
   <th>MCP</th> 
   <th>Skills</th> 
   <th>Hooks (auto-augment)</th> 
   <th>Support</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><strong>Claude Code</strong></td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>Yes (PreToolUse + PostToolUse)</td> 
   <td><strong>Full</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Cursor</strong></td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>Yes (postToolUse, <a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/gitnexus-cursor-integration/README.md#hook-install">manual install</a>)</td> 
   <td><strong>Full</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Antigravity</strong> (Google)</td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>Yes (AfterTool, <a href="https://geminicli.com/docs/hooks/reference/">Gemini CLI hooks schema</a>)<a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/#fn-antigravity-hooks">¹</a></td> 
   <td><strong>Full</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Codex</strong></td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>Yes (PreToolUse + PostToolUse, <a href="https://developers.openai.com/codex/hooks">Codex hooks</a>)</td> 
   <td><strong>Full</strong></td> 
  </tr> 
  <tr> 
   <td><strong>OpenCode</strong></td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>—</td> 
   <td>MCP + Skills</td> 
  </tr> 
  <tr> 
   <td><strong>CodeBuddy</strong> (Tencent)</td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>—</td> 
   <td>MCP + Skills</td> 
  </tr> 
  <tr> 
   <td><strong>Qoder</strong> (Alibaba)</td> 
   <td>Yes</td> 
   <td>Yes</td> 
   <td>—</td> 
   <td>MCP + Skills</td> 
  </tr> 
  <tr> 
   <td><strong>Windsurf</strong></td> 
   <td>Yes</td> 
   <td>—</td> 
   <td>—</td> 
   <td>MCP</td> 
  </tr> 
 </tbody> 
</table> 
<blockquote> 
 <p><strong>Claude Code</strong> and <strong>Codex</strong> get the deepest integration: MCP tools + agent skills + PreToolUse hooks that enrich searches with graph context + PostToolUse hooks that detect a stale index after commits and prompt the agent to reindex.</p> 
</blockquote> 
<p><a id="fn-antigravity-hooks"></a></p> 
<blockquote> 
 <p>¹ <strong>Antigravity hooks</strong> follow the <a href="https://geminicli.com/docs/hooks/reference/">Gemini CLI hooks reference</a> (Antigravity 2.0 is the documented successor to Gemini CLI). Augmentation runs in <code>AfterTool</code> because <code>BeforeTool</code> has no context-injection channel in the Gemini contract — the agent sees graph context appended to the tool result via <code>hookSpecificOutput.additionalContext</code>. Stale-index hints land in the same channel after a successful <code>git commit/merge/rebase/cherry-pick/pull</code>. The schema may evolve if Antigravity-specific hook docs diverge from Gemini CLI's; the implementation will track those changes.</p> 
</blockquote> 
<details> 
 <strong>Manual MCP configuration</strong> (if you prefer not to run <code>gitnexus setup</code>) 
 <p><strong>Claude Code</strong> (full support — MCP + skills + hooks):</p> 
 <pre><code class="language-bash"># macOS / Linux
claude mcp add gitnexus -- npx -y gitnexus@latest mcp

# Windows
claude mcp add gitnexus -- cmd /c npx -y gitnexus@latest mcp
</code></pre> 
 <p><strong>Codex</strong> (full support — MCP + skills + hooks):</p> 
 <pre><code class="language-bash">codex mcp add gitnexus -- npx -y gitnexus@latest mcp
</code></pre> 
 <p>Or via <code>~/.codex/config.toml</code> (system scope) / <code>.codex/config.toml</code> (project scope):</p> 
 <pre><code class="language-toml">[mcp_servers.gitnexus]
command = "npx"
args = ["-y", "gitnexus@latest", "mcp"]
</code></pre> 
 <p>Codex hooks (PreToolUse graph enrichment + PostToolUse stale-index detection in <code>~/.codex/hooks.json</code>, <a href="https://developers.openai.com/codex/hooks">same schema as Claude Code</a>) need the bundled adapter script, so they are installed by <code>gitnexus setup -c codex</code> rather than manually.</p> 
 <p>Alternatively, install everything as a <a href="https://developers.openai.com/codex/plugins/build">Codex plugin</a> (MCP + skills + hooks in one step):</p> 
 <pre><code class="language-bash">codex plugin marketplace add abhigyanpatwari/GitNexus
# then inside Codex: /plugins → install "GitNexus"
</code></pre> 
 <blockquote> 
  <p><strong>Codex notes:</strong> SessionStart is intentionally not registered — Codex reads <a href="https://developers.openai.com/codex/guides/agents-md">AGENTS.md natively</a>, which already carries the GitNexus context block. Newly installed hooks need a one-time approval in Codex via <code>/hooks</code> before they run. Pick <strong>one</strong> install route (<code>gitnexus setup -c codex</code> <strong>or</strong> the plugin): plugin hooks load alongside <code>~/.codex/hooks.json</code>, so installing both can fire duplicate hooks per tool call.</p> 
 </blockquote> 
 <p><strong>Cursor</strong> (<code>~/.cursor/mcp.json</code> — global, works for all projects):</p> 
 <pre><code class="language-json">{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
</code></pre> 
 <p><strong>Antigravity</strong> (Google) — <code>~/.gemini/antigravity/mcp_config.json</code>:</p> 
 <pre><code class="language-json">{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
</code></pre> 
 <blockquote> 
  <p><code>gitnexus setup</code> also merges an <code>AfterTool</code> entry into <code>~/.gemini/settings.json</code> (under the canonical <a href="https://geminicli.com/docs/hooks/reference/">Gemini CLI hooks schema</a>) and installs skills to <code>~/.gemini/antigravity/skills/</code>. Existing user hooks are preserved. The hook adapter's path is rewritten at install time, so run <code>gitnexus setup</code> rather than hand-editing.</p> 
 </blockquote> 
 <p><strong>OpenCode</strong> (<code>~/.config/opencode/config.json</code>):</p> 
 <pre><code class="language-json">{
  "mcp": {
    "gitnexus": {
      "type": "local",
      "command": ["gitnexus", "mcp"]
    }
  }
}
</code></pre> 
 <p><strong>CodeBuddy</strong> (Tencent) — priority chain, edit the <strong>first non-empty file that exists</strong>: <code>~/.codebuddy/.mcp.json</code> (recommended) → <code>~/.codebuddy/mcp.json</code> (deprecated) → <code>~/.codebuddy.json</code> (legacy). CodeBuddy reads only the first existing file, so adding servers to a higher-priority file than the one currently in use would hide the servers below it. Create <code>~/.codebuddy/.mcp.json</code> only if none exist:</p> 
 <pre><code class="language-json">{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
</code></pre> 
 <p><strong>Qoder</strong> (Alibaba) — <code>~/.qoder.json</code>:</p> 
 <pre><code class="language-json">{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
</code></pre> 
</details> 
<details> 
 <strong>MCP read-only mode</strong> 
 <p>Set <code>GITNEXUS_MCP_READ_ONLY=1</code> before starting the MCP server to expose only the proven single-repository read surface. Raw <code>cypher</code>, rename and group tools, group routing, and group resources are omitted from discovery and rejected before backend dispatch. Tool descriptions and generated setup/context resources are scrubbed so they do not recommend unavailable routes.</p> 
 <p>The default is unchanged when the variable is unset or <code>0</code>. Any other value fails server startup rather than silently weakening the policy.</p> 
</details> 
<details> 
 <strong>MCP repository policy</strong> 
 <p>Set <code>GITNEXUS_MCP_ALLOWED_REPOS</code> to a comma-separated list of canonical registry names or absolute indexed paths. Entries are trimmed, resolved against the registry, and deduplicated at startup. When exactly one repository is allowed it becomes the implicit default; when several are allowed, callers must select one unless <code>GITNEXUS_MCP_DEFAULT_REPO</code> is also set.</p> 
 <p>The default repository must resolve to an allowed repository. Invalid, ambiguous, blank, or mismatched configuration fails startup before stdio or HTTP begins serving. The allowlist applies to tools, aliases, discovery, resources, templates, implicit resolution, and embedded HTTP; hidden repository details are not included in selection errors. Setting only <code>GITNEXUS_MCP_DEFAULT_REPO</code> chooses a default without restricting explicit repository selections. An allowed repository whose name is duplicated in the registry must be configured by path, and its context resource is only served for the unique name form.</p> 
</details> 
<details> 
 <strong>MCP response budgets</strong> 
 <p>The <code>query</code>, <code>context</code>, and <code>impact</code> tools accept an optional positive-integer <code>maxTokens</code> argument. It bounds the complete formatted MCP response, including hints and error text, using a deterministic four-UTF-8-bytes-per-token estimate. When truncation is required, the response ends with <code>…</code> and remains valid UTF-8.</p> 
 <p>Set <code>GITNEXUS_MCP_DEFAULT_MAX_TOKENS</code> to apply the same guardrail when callers do not send <code>maxTokens</code>. An explicit tool argument takes precedence. Leaving both unset preserves the existing response byte-for-byte; this is a transport guardrail, not semantic pagination or an exact model-specific tokenizer limit.</p> 
</details> 
<h2>CLI Reference</h2> 
<p>Everyday commands:</p> 
<pre><code class="language-bash">gitnexus setup                   # Configure MCP for detected editors (one-time; -c to select)
gitnexus analyze [path]          # Index a repository (or update a stale index)
gitnexus mcp                     # Start MCP server (stdio) — serves all indexed repos
gitnexus serve                   # Start local HTTP server (multi-repo) for web UI connection
gitnexus eval-server             # Start lightweight evaluation HTTP tools (loopback by default)
gitnexus list                    # List all indexed repositories
gitnexus status                  # Show index status for current repo
gitnexus clean                   # Delete index for current repo
gitnexus wiki [path]             # Generate repository wiki from knowledge graph
gitnexus uninstall               # Preview removal of GitNexus MCP/skills/hooks (--force to apply)
</code></pre> 
<p>You can also query the graph directly from the terminal — <code>gitnexus query</code>, <code>context</code>, <code>impact</code>, <code>trace</code>, <code>cypher</code>, <code>detect-changes</code>, and <code>check</code> mirror the MCP tools of the same names, and <code>gitnexus doctor</code> prints runtime platform capabilities.</p> 
<details> 
 <strong>Authenticated <code>eval-server</code> binding</strong> 
 <p><code>gitnexus eval-server</code> binds to <code>127.0.0.1</code> by default. Loopback bindings do not require authentication. Any non-loopback bind, including <code>0.0.0.0</code>, a LAN address, or a hostname that resolves to a LAN IPv4 address, requires <code>GITNEXUS_AUTH_TOKEN</code>. Every endpoint then requires an exact <code>Authorization: Bearer &lt;token&gt;</code> header.</p> 
 <pre><code class="language-bash">GITNEXUS_AUTH_TOKEN='replace-me' gitnexus eval-server --host 0.0.0.0
</code></pre> 
 <p>The token may be set in the shell, <code>.env.local</code>, or <code>.env</code> in the working directory. Precedence is shell &gt; <code>.env.local</code> &gt; <code>.env</code>. Only <code>GITNEXUS_AUTH_TOKEN</code> is read from those files; their other values are not added to the process environment. Keep token files uncommitted.</p> 
</details> 
<details> 
 <strong>All <code>analyze</code> flags</strong> 
 <pre><code class="language-bash">gitnexus analyze --force         # Full rebuild: re-parse + graph rebuild + FTS rebuild
gitnexus analyze --repair-fts    # Fast path: rebuild/verify only FTS indexes on existing index data
gitnexus analyze --skills        # Generate repo-specific skill files from detected communities
gitnexus analyze --skip-embeddings  # Skip embedding generation (faster)
gitnexus analyze --embeddings [limit]  # Enable embedding generation (slower, better search)
gitnexus analyze --skip-agents-md   # Preserve custom AGENTS.md/CLAUDE.md gitnexus section edits
gitnexus analyze --skip-skills      # Skip installing standard skill files under .claude/skills/ and .agents/skills/
gitnexus analyze --skip-git         # Index folders that are not Git repositories
gitnexus analyze --default-branch develop  # Branch used in the generated regression-compare example (base_ref)
gitnexus analyze --verbose       # Log skipped files when parsers are unavailable
gitnexus analyze --worker-timeout 60  # Increase worker idle timeout for slow parses
gitnexus analyze --workers &lt;n&gt;   # Parse worker pool size (&gt;=1; default: cores-1, capped at 16,
                                 # auto-sized to the repo). 0 is rejected — there is no sequential mode.
gitnexus analyze --wal-checkpoint-threshold 67108864  # LadybugDB WAL auto-checkpoint threshold in bytes
                                 # (default 67108864 = 64 MiB; -1 keeps Ladybug stock ~16 MiB)
</code></pre> 
 <p>If <code>analyze</code> reports a worker parse timeout on a large or unusual repository, it keeps running and falls back safely. To give slow worker jobs more time, use <code>--worker-timeout 60</code> or set <code>GITNEXUS_WORKER_SUB_BATCH_TIMEOUT_MS=60000</code>. For very large files, <code>GITNEXUS_WORKER_SUB_BATCH_MAX_BYTES</code> controls the worker job byte budget.</p> 
 <p><strong>Embeddings node limit</strong> — <code>gitnexus analyze --embeddings</code> generates semantic search vectors with a default 50,000-node safety cap to protect memory on large repositories:</p> 
 <pre><code class="language-bash">gitnexus analyze --embeddings          # default 50,000 node safety cap
gitnexus analyze --embeddings 0        # disable the cap entirely
gitnexus analyze --embeddings 100000   # custom cap
</code></pre> 
 <p>If embeddings are skipped on a large repository, the indexed graph likely exceeds the default cap — re-run with <code>--embeddings 0</code> or a higher limit.</p> 
</details> 
<details> 
 <strong>Repository groups</strong> (multi-repo / monorepo service tracking) 
 <pre><code class="language-bash">gitnexus group create &lt;name&gt;                           # Create a repository group
gitnexus group add &lt;group&gt; &lt;groupPath&gt; &lt;registryName&gt;  # Add a repo. &lt;groupPath&gt; is a hierarchy path
                                                       # (e.g. hr/hiring/backend); &lt;registryName&gt; is the
                                                       # repo's name from the registry (see `gitnexus list`)
gitnexus group remove &lt;group&gt; &lt;groupPath&gt;              # Remove a repo by its hierarchy path
gitnexus group list [name]                             # List groups, or show one group's config
gitnexus group sync &lt;name&gt;                             # Extract contracts and match across repos/services
gitnexus group contracts &lt;name&gt;                        # Inspect extracted contracts and cross-links
gitnexus group query &lt;name&gt; &lt;q&gt;                        # Search execution flows across all repos in a group
gitnexus group status &lt;name&gt;                           # Check staleness of repos in a group
gitnexus group impact &lt;name&gt; --target &lt;symbol&gt; --repo &lt;groupPath&gt;  # Cross-repo blast radius
</code></pre> 
</details> 
<details> 
 <strong>Project config (<code>.gitnexusrc</code>)</strong> 
 <p>Commit a <code>.gitnexusrc</code> JSON file at the repo root to preconfigure recurring <code>analyze</code> options per project, instead of re-passing the same flags every run. It is read from the resolved repo root (not <code>.gitnexus/</code>, which is gitignored index storage). <strong>CLI flags always override <code>.gitnexusrc</code>.</strong></p> 
 <pre><code class="language-jsonc">{
  // Default branch used in the generated regression-compare example (base_ref).
  // Use this so a project on `develop`/`master` doesn't get "main" rewritten
  // over its fix on every analyze. (Alias: "branch".)
  "defaultBranch": "develop",
  "skipContextFiles": true, // alias of skipAgentsMd: keep your own AGENTS.md/CLAUDE.md
  "skipSkills": true, // don't install standard skill files under .claude/skills/ and .agents/skills/
  "embeddings": true, // generate embeddings by default
  "workerTimeout": 60,
}
</code></pre> 
 <p>A nested <code>analyze</code> block is also accepted (and overrides flat keys for the same option):</p> 
 <pre><code class="language-json">{ "analyze": { "defaultBranch": "develop", "skipSkills": true } }
</code></pre> 
 <p>Notes:</p> 
 <ul> 
  <li>The default branch is resolved as: <code>--default-branch</code> &gt; <code>.gitnexusrc</code> <code>defaultBranch</code>/<code>branch</code> &gt; auto-detected <code>origin/HEAD</code> &gt; <code>main</code>.</li> 
  <li><code>skipContextFiles</code> / <code>skipAiContext</code> are aliases for <code>skipAgentsMd</code> — they skip the <code>AGENTS.md</code> / <code>CLAUDE.md</code> block only. They do <strong>not</strong> imply <code>skipSkills</code>. <code>indexOnly</code> is the stronger option that skips all file injection.</li> 
  <li>Supported keys: <code>defaultBranch</code> (<code>branch</code>), <code>skipAgentsMd</code> (<code>skipContextFiles</code>, <code>skipAiContext</code>), <code>skipSkills</code>, <code>indexOnly</code>, <code>stats</code>/<code>noStats</code>, <code>embeddings</code>, <code>dropEmbeddings</code>, <code>name</code>, <code>allowDuplicateName</code>, <code>maxFileSize</code>, <code>workerTimeout</code>, <code>walCheckpointThreshold</code>, <code>workers</code>, <code>embeddingThreads</code>, <code>embeddingBatchSize</code>, <code>embeddingSubBatchSize</code>, <code>embeddingDevice</code>.</li> 
  <li>The file is JSON only. Unknown keys and invalid values fail fast with an actionable error before analysis starts.</li> 
 </ul> 
</details> 
<details> 
 <strong>Environment variables</strong> 
 <p>Most <code>analyze</code> knobs are also CLI flags (<code>--workers</code>, <code>--worker-timeout</code>, <code>--max-file-size</code>, <code>--verbose</code>). Use the env-var form when you'd otherwise repeat the same flag every run, or when invoking GitNexus from a long-running host (MCP server, eval-server, CI shell) that already manages its own environment. CLI flags take precedence over env vars; env vars take precedence over built-in defaults.</p> 
 <table> 
  <thead> 
   <tr> 
    <th>Variable</th> 
    <th>Default</th> 
    <th>Effect</th> 
    <th>Tune when…</th> 
   </tr> 
  </thead> 
  <tbody> 
   <tr> 
    <td><code>GITNEXUS_WORKER_POOL_SIZE</code></td> 
    <td><code>cores - 1</code>, capped at 16</td> 
    <td>Parse worker pool size (must be ≥ 1). Equivalent to <code>--workers &lt;n&gt;</code>. The worker pool is the sole parse path — there is no sequential parser, so <code>0</code> is rejected with an actionable error (the pool self-heals via quarantine + respawn).</td> 
    <td>Constrained containers (cgroup CPU limits) or CI runners with explicit quotas. To narrow down a worker crash set <code>1</code> for a single-worker pool — not <code>0</code>.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_PARSE_CHUNK_CONCURRENCY</code></td> 
    <td><code>2</code></td> 
    <td>Number of chunks whose file contents may be read into memory in parallel while the pool dispatches the current chunk. Worker dispatch itself stays serial.</td> 
    <td>Repos large enough to chunk (multi-MB total source) where disk I/O is a measurable fraction of analyze wall-clock.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_VERBOSE</code></td> 
    <td>unset</td> 
    <td>When <code>1</code>, enables verbose ingestion logs (skipped-file warnings, per-chunk throughput, parse-cache stats). Equivalent to <code>--verbose</code>.</td> 
    <td>Debugging an analyze that "completed" but seems to have missed files; tuning <code>--workers</code> / chunk concurrency against observable throughput.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_AUTH_TOKEN</code></td> 
    <td>unset</td> 
    <td>Bearer token required when <code>eval-server</code> binds beyond loopback. May also be read from <code>.env.local</code> or <code>.env</code>; shell values take precedence.</td> 
    <td>Exposing the evaluation HTTP tools to a container, VM, or LAN.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_PROFILE_DEFERRED</code></td> 
    <td>unset</td> 
    <td>When <code>1</code>, emits <code>[deferred-profile]</code> timing/progress logs for the post-chunk deferred resolution band (imports → heritage → buildHeritageMap → legacy call resolution). Implied by <code>GITNEXUS_VERBOSE</code>.</td> 
    <td>Diagnosing analyze stalls in "Resolving calls (all chunks)" on large Java/Kotlin repos (issue #1741) without the full verbose ingestion noise.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_PROFILE_DEFERRED_SLOW_MS</code></td> 
    <td><code>3000</code> (verbose) / <code>5000</code></td> 
    <td>Per-file threshold in ms above which <code>processCallsFromExtracted</code> emits a <code>slow file …</code> log line. Parsed via <code>Number()</code>: accepts integers (<code>5000</code>), scientific notation (<code>2.5e3</code>), decimals (<code>.5</code>), and hex (<code>0x10</code>). Non-finite or non-positive values fall back to the default.</td> 
    <td>Hunting a few outlier files dominating the deferred call-resolution stage; lower to surface more, raise to focus only on the worst.</td> 
   </tr> 
   <tr> 
    <td><code>PROF_LBUG_LOAD</code></td> 
    <td>unset</td> 
    <td>When <code>1</code>, emits one <code>[lbug-load prof]</code> summary line per <code>loadGraphToLbug</code> call breaking the graph-DB persistence wall into stages (<code>csv-emit</code> / <code>copy-nodes</code> / <code>copy-rels</code> / <code>fallback</code> / <code>total</code>) plus node &amp; edge counts. Zero-cost when unset.</td> 
    <td>Attributing large-repo analyze wall time across CSV generation vs. LadybugDB <code>COPY</code> (issue #2203) — the analyze "emit" timing is the scope-resolution bucket, not this DB-write path.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_MAX_FILE_SIZE</code></td> 
    <td><code>512</code> (KB)</td> 
    <td>Walker skip threshold in KB. Hard cap is <code>32768</code> (tree-sitter buffer ceiling). Equivalent to <code>--max-file-size &lt;kb&gt;</code>.</td> 
    <td>Indexing repos with intentionally-large source files (generated parsers, vendored bundles) that should still be parsed.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_SUB_BATCH_TIMEOUT_MS</code></td> 
    <td><code>30000</code></td> 
    <td>Worker idle timeout in milliseconds before retry/fallback. Equivalent to <code>--worker-timeout &lt;seconds&gt;</code> × 1000.</td> 
    <td>Slow-parsing files (large minified JS, deeply-nested TS types) that legitimately need more than 30s.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_READY_TIMEOUT_MS</code></td> 
    <td><code>5000</code></td> 
    <td>Startup budget in milliseconds for a parse worker to load its grammar bindings and report <code>{type:'ready'}</code>. Slots that miss it are treated as startup crashes.</td> 
    <td>Slow or heavily loaded hosts where a full pool cold-starting concurrently needs more than 5s, and analyze aborts with "did not report ready within 5000ms".</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_FTS_STEMMER</code></td> 
    <td><code>porter</code></td> 
    <td>Stemmer used when rebuilding BM25/FTS indexes. Use <code>none</code> for CJK-heavy repositories, or a language stemmer such as <code>german</code>, <code>french</code>, or <code>spanish</code> for matching repository comments. Re-run <code>gitnexus analyze --repair-fts</code> after changing it.</td> 
    <td>Keyword search quality is poor for non-English comments or identifiers under English stemming.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WAL_CHECKPOINT_THRESHOLD</code></td> 
    <td><code>67108864</code> (64 MiB)</td> 
    <td>LadybugDB WAL auto-checkpoint threshold in bytes. Equivalent to <code>--wal-checkpoint-threshold &lt;bytes&gt;</code>. <code>-1</code> keeps LadybugDB's stock threshold (~16 MiB). Larger thresholds reduce checkpoint frequency but increase the WAL size at rotation time — choose a smaller value on disk-constrained environments.</td> 
    <td>You need a larger or smaller WAL auto-checkpoint threshold for your analyze workload.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_LBUG_BUFFER_POOL_SIZE</code></td> 
    <td>min(2 GiB, 80% RAM)</td> 
    <td>LadybugDB buffer-pool ceiling in bytes for every GitNexus database (analyze, MCP server, serve, group bridges). <code>0</code> restores LadybugDB's native unbounded default of 80% of system RAM; invalid values warn and fall back to the default (#2557). During <code>analyze</code> the pool is right-sized to the graph, scaled on non-4 KiB-page hosts by the page-size granule ratio up to min(2 GiB × pageSize/4 KiB, 80% RAM) (#2631); this env var overrides all of that as an absolute value.</td> 
    <td>A long-lived <code>gitnexus mcp</code> or a big incremental <code>analyze</code> uses too much memory, or a huge repo's working set genuinely needs a pool larger than 2 GiB.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_LBUG_MAX_DB_SIZE</code></td> 
    <td><code>17179869184</code> (16 GiB)</td> 
    <td>Maximum size in bytes of a single LadybugDB database file — an mmap/disk-address-space ceiling, not a memory limit (it does not constrain the buffer pool). Invalid values silently fall back to the default.</td> 
    <td>Indexing a genuinely huge monorepo whose on-disk graph index approaches 16 GiB.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_SUB_BATCH_MAX_BYTES</code></td> 
    <td><code>8388608</code> (8 MB)</td> 
    <td>Per-job byte budget the pool will send to a worker in one <code>postMessage</code>.</td> 
    <td>Very large individual files; mostly diagnostic — bumping past 8 MB risks structured-clone memory pressure.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_MAX_RESPAWNS_PER_SLOT</code></td> 
    <td><code>3</code></td> 
    <td>Max replacement spawns per worker slot before the slot is dropped from the active rotation. Bounds respawn loops on a chronically-crashing slot.</td> 
    <td>Hosts where a flaky worker should retry more (raise) or fail-fast (lower) before the slot is dropped.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_MAX_CUMULATIVE_TIMEOUT_MS</code></td> 
    <td><code>5 × subBatchTimeoutMs</code></td> 
    <td>Total retry wall-time budget per job before quarantining. Combined with <code>timeoutBackoffFactor</code>, prevents exponentially-growing retries from stalling for hours.</td> 
    <td>Slow files that legitimately need long total retry windows; lower to fail-fast on stalls.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_CONSECUTIVE_FAILURE_THRESHOLD</code></td> 
    <td><code>max(3, poolSize)</code></td> 
    <td>Per-slot consecutive deaths before the pool's circuit breaker trips. After tripping, every subsequent dispatch rejects until a fresh pool is created.</td> 
    <td>Hosts where a SIGSEGV-prone native grammar should trip the breaker sooner; CI runners that should fail loudly.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_WORKER_SHUTDOWN_DRAIN_MS</code></td> 
    <td><code>30000</code></td> 
    <td>Max wait at pool shutdown for a retired worker still inside native code. The worker is terminated at its next JS-safe point instead of mid-native-call (which aborts the whole process with <code>Napi::Error</code>, #2432); on expiry it is left running, unref'd, and terminated when it surfaces.</td> 
    <td>Shutdown latency matters more than draining a wedged worker (lower), or a legitimately-slow native grammar needs longer to surface (raise).</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_CPP_CAPTURE_BUDGET_MS</code></td> 
    <td><code>20000</code></td> 
    <td>Per-file wall-clock budget for C++ capture extraction. On breach the file keeps the captures accumulated so far and logs a warning — the worker returns to JS instead of stalling in native-heavy loops (#2432). <code>0</code> expires immediately.</td> 
    <td>Pathological generated C++ that still exceeds the budget after the indexed lookups; raise for completeness, lower to fail-fast.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_CHUNK_BYTE_BUDGET</code></td> 
    <td><code>2097152</code> (2 MB)</td> 
    <td>Chunk boundary used for cache-key composition and dispatch. Smaller = finer-grained cache hits but more dispatch overhead.</td> 
    <td>Tuning incremental-analyze cache behavior on monorepos.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_NO_GITIGNORE</code></td> 
    <td>unset</td> 
    <td>When set, skips <code>.gitignore</code> parsing. <code>.gitnexusignore</code> is still honored.</td> 
    <td>Indexing a repo whose <code>.gitignore</code> excludes files you actually want indexed (e.g., generated code committed for cross-repo lookup).</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_SKIP_OPTIONAL_GRAMMARS</code></td> 
    <td>unset</td> 
    <td>When <code>=1</code> strictly, skips the vendored grammar materialize for <code>tree-sitter-dart</code>, <code>tree-sitter-proto</code>, <code>tree-sitter-swift</code>, and <code>tree-sitter-kotlin</code> at install time (and the Dart/Proto source builds). Those four won't be parsed; the install still succeeds.</td> 
    <td>Installing on a host without a C++ toolchain or where the vendored prebuilds don't match; willing to skip Dart/Proto/Swift/Kotlin parsing.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_MCP_READ_ONLY</code></td> 
    <td>unset</td> 
    <td>Set to <code>1</code> to expose only proven single-repository read tools and resources; <code>0</code> disables the policy and any other value fails startup.</td> 
    <td>The MCP server runs in an environment where graph mutation, raw Cypher, and cross-repository group routing must be unavailable.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_MCP_ALLOWED_REPOS</code></td> 
    <td>unset</td> 
    <td>Comma-separated allowlist of canonical indexed repository names or absolute paths. Invalid, ambiguous, or blank entries fail startup.</td> 
    <td>One MCP process must expose only a bounded subset of the repositories in the global registry.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_MCP_DEFAULT_REPO</code></td> 
    <td>unset</td> 
    <td>Canonical indexed repository name or absolute path used when a tool or resource omits its repository. Must belong to the allowlist when one is set.</td> 
    <td>Several repositories are available but unqualified MCP calls should resolve deterministically.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_MCP_DEFAULT_MAX_TOKENS</code></td> 
    <td>unset</td> 
    <td>Default positive-integer response budget for MCP <code>query</code>, <code>context</code>, and <code>impact</code>, estimated at four UTF-8 bytes per token. Explicit <code>maxTokens</code> wins.</td> 
    <td>Long MCP responses consume too much model context and callers cannot reliably add a per-request budget.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_PUBLIC_ORIGIN</code></td> 
    <td>unset</td> 
    <td>The single browser origin <code>serve</code> is reached through, added to the CORS allowlist and to the write-route origin guard. A wildcard bind (<code>0.0.0.0</code>) has no host identity, so without this the server's own UI is refused. <strong>Setting it currently refuses to start:</strong> <code>serve</code> has no authentication, requests carrying no <code>Origin</code> header already reach <code>POST /api/analyze</code> and <code>DELETE /api/repo</code>, and this is the setting that would admit browser writes on top of that. Matching rules for when the gate lifts: the hostname must match exactly, and so must the scheme. A value with no scheme (<code>app.example.com</code>) means <code>https</code>, since a bare host comes from platform service discovery and those terminate TLS; spell out <code>http://app.example.com</code> for plain HTTP. An explicit port must match; with no port, any port on that hostname is accepted. Anything that is not one reachable host (a list, <code>*</code>, a bare port number, a <code>:0</code> port, a trailing dot) warns at startup and allows nothing.</td> 
    <td><code>gitnexus serve</code> runs behind a reverse proxy or on a wildcard bind, and the UI's index/delete requests return <code>origin_not_allowed</code>.</td> 
   </tr> 
   <tr> 
    <td><code>GITNEXUS_TRUST_PROXY</code></td> 
    <td><code>loopback, linklocal, uniquelocal</code></td> 
    <td>Express <code>trust proxy</code> value — which upstream hops may set <code>X-Forwarded-*</code>, and so what the per-IP rate limiter reads as the client IP. Set it to the exact number of proxies you control. Every hop past that is one more entry of the chain the caller gets to write. <code>false</code>/<code>no</code>/<code>off</code> (and a <code>0</code> hop count) trust no hop; a proxy list Express can compile (<code>loopback</code>, <code>10.0.0.0/8, 127.0.0.1</code>) names them instead. <code>true</code>/<code>yes</code>/<code>on</code> is <strong>rejected</strong>: it reads the client-controlled leftmost <code>X-Forwarded-For</code> entry, so a spoofed chain earns a fresh rate-limit key per request, and express-rate-limit rejects it too (<code>ERR_ERL_PERMISSIVE_TRUST_PROXY</code>). Counts above <code>16</code> are rejected as well, as a sanity ceiling rather than a safety boundary. Any invalid value warns and falls back to the default. Bind non-loopback with this unset and <code>serve</code> warns: a load balancer outside the private ranges is untrusted, so every request keys to the balancer and the per-IP limit becomes one shared limit.</td> 
    <td><code>serve</code> sits behind a load balancer outside the private ranges (AWS ALB, Cloudflare, CGNAT), where every request otherwise collapses to the proxy hop and rate limiting goes global.</td> 
   </tr> 
  </tbody> 
 </table> 
</details> 
<details> 
 <strong><code>gitnexus uninstall</code></strong> 
 <p><code>gitnexus uninstall</code> reverses <code>gitnexus setup</code> — it removes the GitNexus MCP entries, hooks, and skill directories it added to each detected editor. Skill directories are identified <strong>by bundled gitnexus skill name</strong> (e.g. <code>gitnexus-cli/</code>), so if you customized files inside an installed skill directory, back them up first. It is a dry-run preview by default and prints the exact paths it would remove; pass <code>--force</code> to apply. Per-repo indexes (<code>gitnexus clean --all</code>) and the global npm package (<code>npm uninstall -g gitnexus</code>) are left for you to remove.</p> 
</details> 
<details> 
 <strong>Publishing to understand-quickly</strong> (opt-in) 
 <p><a href="https://github.com/looptech-ai/understand-quickly"><code>looptech-ai/understand-quickly</code></a> is a public registry of code-knowledge graphs that lists <code>gitnexus@1</code> as a first-class format. After registering your repo once (<code>npx @understand-quickly/cli add</code> or the <a href="https://looptech-ai.github.io/understand-quickly/add.html">wizard</a>), <code>gitnexus publish</code> fires a single <code>repository_dispatch</code> event so the registry resyncs your entry on demand instead of waiting for the nightly job.</p> 
 <p>It is opt-in and a no-op without <code>UNDERSTAND_QUICKLY_TOKEN</code> — a fine-grained GitHub PAT with <code>Repository dispatches: write</code> on the registry repo. Nothing else happens; no graph file is uploaded. See the <a href="https://github.com/looptech-ai/understand-quickly/raw/main/docs/integrations/protocol.md">protocol spec</a> for the full contract.</p> 
</details> 
<h2>How It Works</h2> 
<p>GitNexus builds a complete knowledge graph of your codebase through a multi-phase indexing pipeline:</p> 
<ol> 
 <li><strong>Structure</strong> — walks the file tree and maps folder/file relationships</li> 
 <li><strong>Parsing</strong> — extracts functions, classes, methods, and interfaces using Tree-sitter ASTs</li> 
 <li><strong>Resolution</strong> — resolves imports, function calls, heritage, constructor inference, and <code>self</code>/<code>this</code> receiver types across files with language-aware logic</li> 
 <li><strong>Clustering</strong> — groups related symbols into functional communities</li> 
 <li><strong>Processes</strong> — traces execution flows from entry points through call chains</li> 
 <li><strong>Search</strong> — builds hybrid search indexes for fast retrieval</li> 
</ol> 
<h3>Supported Languages</h3> 
<table> 
 <thead> 
  <tr> 
   <th>Language</th> 
   <th>Imports</th> 
   <th>Named Bindings</th> 
   <th>Exports</th> 
   <th>Heritage</th> 
   <th>Type Annotations</th> 
   <th>Constructor Inference</th> 
   <th>Config</th> 
   <th>Frameworks</th> 
   <th>Entry Points</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>TypeScript</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>JavaScript</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Python</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Java</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Kotlin</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>C#</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Go</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Rust</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>PHP</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Ruby</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Swift</td> 
   <td>—</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>C</td> 
   <td>—</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>C++</td> 
   <td>—</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
  <tr> 
   <td>Dart</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>✓</td> 
   <td>—</td> 
   <td>✓</td> 
   <td>✓</td> 
  </tr> 
 </tbody> 
</table> 
<p><strong>Imports</strong> — cross-file import resolution · <strong>Named Bindings</strong> — <code>import { X as Y }</code> / re-export tracking · <strong>Exports</strong> — public/exported symbol detection · <strong>Heritage</strong> — class inheritance, interfaces, mixins · <strong>Type Annotations</strong> — explicit type extraction for receiver resolution · <strong>Constructor Inference</strong> — infer receiver type from constructor calls (<code>self</code>/<code>this</code> resolution included for all languages) · <strong>Config</strong> — language toolchain config parsing (tsconfig, go.mod, etc.) · <strong>Frameworks</strong> — AST-based framework pattern detection · <strong>Entry Points</strong> — entry point scoring heuristics</p> 
<p><strong>Control flow (CFG, opt-in <code>--pdg</code>)</strong> — per-function control-flow graphs (<code>BasicBlock</code> nodes + <code>CFG</code> edges) feeding the PDG/taint substrate, currently <strong>TypeScript &amp; JavaScript</strong> (#2081 M1); other languages planned. Off by default.</p> 
<h3>Multi-Repo Architecture</h3> 
<p>GitNexus uses a <strong>global registry</strong> so one MCP server can serve multiple indexed repos. No per-project MCP config needed — set it up once and it works everywhere.</p> 
<p>Each <code>gitnexus analyze</code> stores the index in <code>.gitnexus/</code> inside the repo (portable, gitignored) and registers a pointer in <code>~/.gitnexus/registry.json</code>. When an AI agent starts, the MCP server reads the registry and can serve any indexed repo. LadybugDB connections are opened lazily on first query and evicted after 5 minutes of inactivity (max 5 concurrent). If only one repo is indexed, the <code>repo</code> parameter is optional on all tools — agents don't need to change anything.</p> 
<details> 
 <strong>Architecture diagram</strong> 
 <pre><code class="language-mermaid">flowchart TD
    subgraph CLI [CLI Commands]
        Setup["gitnexus setup"]
        Analyze["gitnexus analyze"]
        Clean["gitnexus clean"]
        List["gitnexus list"]
    end

    subgraph Registry ["~/.gitnexus/"]
        RegFile["registry.json"]
    end

    subgraph Repos [Project Repos]
        RepoA[".gitnexus/ in repo A"]
        RepoB[".gitnexus/ in repo B"]
    end

    subgraph MCP [MCP Server]
        Server["server.ts"]
        Backend["LocalBackend"]
        Pool["Connection Pool"]
        ConnA["LadybugDB conn A"]
        ConnB["LadybugDB conn B"]
    end

    Setup --&gt;|"writes global MCP config"| CursorConfig["~/.cursor/mcp.json"]
    Analyze --&gt;|"registers repo"| RegFile
    Analyze --&gt;|"stores index"| RepoA
    Clean --&gt;|"unregisters repo"| RegFile
    List --&gt;|"reads"| RegFile
    Server --&gt;|"reads registry"| RegFile
    Server --&gt; Backend
    Backend --&gt; Pool
    Pool --&gt;|"lazy open"| ConnA
    Pool --&gt;|"lazy open"| ConnB
    ConnA --&gt;|"queries"| RepoA
    ConnB --&gt;|"queries"| RepoB
</code></pre> 
</details> 
<h2>Tool Examples</h2> 
<h3>Impact Analysis</h3> 
<pre><code>impact({target: "UserService", direction: "upstream", minConfidence: 0.8})

TARGET: Class UserService (src/services/user.ts)

UPSTREAM (what depends on this):
  Depth 1 (WILL BREAK):
    handleLogin [CALLS 90%] -&gt; src/api/auth.ts:45
    handleRegister [CALLS 90%] -&gt; src/api/auth.ts:78
    UserController [CALLS 85%] -&gt; src/controllers/user.ts:12
  Depth 2 (LIKELY AFFECTED):
    authRouter [IMPORTS] -&gt; src/routes/auth.ts
</code></pre> 
<p>Options: <code>maxDepth</code>, <code>minConfidence</code>, <code>relationTypes</code> (<code>CALLS</code>, <code>IMPORTS</code>, <code>EXTENDS</code>, <code>IMPLEMENTS</code>), <code>includeTests</code>, <code>limit</code> (max symbols per depth, default 100), <code>offset</code> (pagination start per depth), <code>summaryOnly</code> (counts and risk only, omits symbol list)</p> 
<p><strong>Disambiguation</strong> — when several symbols share the target name, <code>impact</code> returns a ranked <code>ambiguous</code> candidate list instead of guessing. Narrow it with <code>target_uid</code> (exact, zero-ambiguity), <code>file_path</code>, or <code>kind</code> (<code>Function</code>, <code>Class</code>, <code>Method</code>, …). From the CLI these are <code>--uid</code>, <code>--file</code>, and <code>--kind</code>, matching <code>gitnexus context</code>:</p> 
<pre><code class="language-bash">gitnexus impact get_embeddings                       # → ambiguous: lists ranked candidates
gitnexus impact get_embeddings --file src/embed.py   # → resolves to the one in that file
gitnexus impact get_embeddings --uid "Function:src/embed.py:get_embeddings"  # exact
</code></pre> 
<details> 
 <strong>More examples:</strong> search · context · detect_changes · rename · Cypher 
 <h3>Process-Grouped Search</h3> 
 <pre><code>query({search_query: "authentication middleware"})

processes:
  - summary: "LoginFlow"
    priority: 0.042
    symbol_count: 4
    process_type: cross_community
    step_count: 7

process_symbols:
  - name: validateUser
    type: Function
    filePath: src/auth/validate.ts
    process_id: proc_login
    step_index: 2

definitions:
  - name: AuthConfig
    type: Interface
    filePath: src/types/auth.ts
</code></pre> 
 <h3>Context (360-degree Symbol View)</h3> 
 <pre><code>context({name: "validateUser"})

symbol:
  uid: "Function:validateUser"
  kind: Function
  filePath: src/auth/validate.ts
  startLine: 15

incoming:
  calls: [handleLogin, handleRegister, UserController]
  imports: [authRouter]

outgoing:
  calls: [checkPassword, createSession]

processes:
  - name: LoginFlow (step 2/7)
  - name: RegistrationFlow (step 3/5)
</code></pre> 
 <h3>Detect Changes (Pre-Commit)</h3> 
 <pre><code>detect_changes({scope: "all"})

summary:
  changed_count: 12
  affected_count: 3
  changed_files: 4
  risk_level: medium

changed_symbols: [validateUser, AuthService, ...]
affected_processes: [LoginFlow, RegistrationFlow, ...]
</code></pre> 
 <h3>Rename (Multi-File)</h3> 
 <pre><code>rename({symbol_name: "validateUser", new_name: "verifyUser", dry_run: true})

status: success
files_affected: 5
total_edits: 8
graph_edits: 6     (high confidence)
text_search_edits: 2  (review carefully)
changes: [...]
</code></pre> 
 <h3>Cypher Queries</h3> 
 <pre><code class="language-cypher">-- Find what calls auth functions with high confidence
MATCH (c:Community {heuristicLabel: 'Authentication'})&lt;-[:CodeRelation {type: 'MEMBER_OF'}]-(fn)
MATCH (caller)-[r:CodeRelation {type: 'CALLS'}]-&gt;(fn)
WHERE r.confidence &gt; 0.8
RETURN caller.name, fn.name, r.confidence
ORDER BY r.confidence DESC
</code></pre> 
</details> 
<h2>Wiki Generation</h2> 
<p>Generate LLM-powered documentation from your knowledge graph:</p> 
<pre><code class="language-bash"># Requires an LLM API key (OPENAI_API_KEY, etc.)
gitnexus wiki

# Use a custom model or provider (default model: minimax/minimax-m2.5)
gitnexus wiki --model gpt-4o
gitnexus wiki --base-url https://api.anthropic.com/v1

# Force full regeneration
gitnexus wiki --force

# Increase the timeout or retries for large codebases or slow LLM providers
gitnexus wiki --timeout &lt;seconds&gt;  # LLM request timeout in seconds (default: disabled)
gitnexus wiki --retries &lt;n&gt;        # Max LLM retry attempts per request (default: 3)

# Allow a specific LAN/self-hosted HTTP LLM host (HTTPS is preferred for remote endpoints)
gitnexus wiki --base-url http://llama-box.local:8080/v1 --allow-insecure-connection llama-box.local
# Or set a comma-separated host allowlist:
GITNEXUS_ALLOW_INSECURE_CONNECTION=llama-box.local,192.168.1.23

# Change the output language
gitnexus wiki --lang &lt;lang&gt;  # e.g. english, chinese, spanish, japanese
</code></pre> 
<p>For safety, <code>http://</code> LLM base URLs are allowed by default only for loopback hosts (<code>localhost</code>, <code>127.0.0.1</code>, <code>::1</code>). <code>--allow-insecure-connection</code> and <code>GITNEXUS_ALLOW_INSECURE_CONNECTION</code> accept exact hostnames or IP addresses only; do not include schemes, ports, paths, credentials, or wildcards.</p> 
<p>The wiki generator reads the indexed graph structure, groups files into modules via LLM, generates per-module documentation pages, and creates an overview page — all with cross-references to the knowledge graph.</p> 
<h2>Web UI (browser-based)</h2> 
<p>A client-side graph explorer and AI chat — your code never leaves your machine.</p> 
<p><strong>Try it now:</strong> <a href="https://gitnexus.vercel.app">gitnexus.vercel.app</a> — run <code>npx gitnexus@latest serve</code> locally and the page auto-connects to your local backend.</p> 
<img alt="gitnexus_img" height="1343" src="https://github.com/user-attachments/assets/cc5d637d-e0e5-48e6-93ff-5bcfdb929285" width="2550" /> 
<p>The web UI uses the same indexing pipeline as the CLI but runs entirely in WebAssembly (Tree-sitter WASM, LadybugDB WASM, in-browser embeddings). It's great for quick exploration but limited by browser memory for larger repos.</p> 
<p><strong>Local Backend Mode:</strong> run <code>gitnexus serve</code> and open the web UI — it auto-detects the server and shows all your indexed repos, with full AI chat support. No re-upload, no re-index. The agent's tools (Cypher queries, search, code navigation) route through the backend HTTP API automatically.</p> 
<details> 
 <strong>Run the frontend locally</strong> 
 <pre><code class="language-bash">git clone https://github.com/abhigyanpatwari/gitnexus.git
cd gitnexus/gitnexus-shared &amp;&amp; npm install &amp;&amp; npm run build
cd ../gitnexus-web &amp;&amp; npm install
npm run dev
# Then in another terminal, start the backend the frontend connects to:
npx gitnexus@latest serve
</code></pre> 
</details> 
<h2>Docker</h2> 
<pre><code class="language-bash">docker compose up -d
</code></pre> 
<p>This starts the server on <code>http://localhost:4747</code> and the web UI on <code>http://localhost:4173</code>. The UI auto-detects the server because the browser runs on the host and reaches the container via the mapped port.</p> 
<p>The official setup ships <strong>two signed images</strong>, published identically to <strong>GitHub Container Registry</strong> (GHCR) and <strong>Docker Hub</strong> — same build, same digest, same Cosign signature:</p> 
<table> 
 <thead> 
  <tr> 
   <th>Purpose</th> 
   <th>GHCR (default in <code>docker-compose.yaml</code>)</th> 
   <th>Docker Hub mirror</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td>CLI / <code>gitnexus serve</code> backend (HTTP API on port <code>4747</code>, MCP, indexer)</td> 
   <td><code>ghcr.io/abhigyanpatwari/gitnexus:latest</code></td> 
   <td><code>akonlabs/gitnexus:latest</code></td> 
  </tr> 
  <tr> 
   <td>Static web UI (port <code>4173</code>)</td> 
   <td><code>ghcr.io/abhigyanpatwari/gitnexus-web:latest</code></td> 
   <td><code>akonlabs/gitnexus-web:latest</code></td> 
  </tr> 
 </tbody> 
</table> 
<p>A named volume (<code>gitnexus-data</code>) persists the global registry, indexes, and cloned repos at <code>/data/gitnexus</code> inside the server container. To make repos on your host machine indexable, set <code>WORKSPACE_DIR</code> before bringing the stack up:</p> 
<pre><code class="language-bash">WORKSPACE_DIR=$HOME/code docker compose up -d
# Inside the server container the directory is mounted read-only at /workspace.
docker compose exec gitnexus-server gitnexus index /workspace/my-repo
</code></pre> 
<blockquote> 
 <p><strong>Heads-up — image rename.</strong> Earlier releases published the web UI under <code>ghcr.io/abhigyanpatwari/gitnexus</code>. That slug now hosts the CLI/server image and the UI moved to <code>ghcr.io/abhigyanpatwari/gitnexus-web</code>. Previous tags remain pullable, but new versions are only published under the new slugs — update your <code>docker run</code> / compose files (or just adopt the bundled compose).</p> 
</blockquote> 
<details> 
 <strong>Direct <code>docker run</code> &amp; env file</strong> 
 <pre><code class="language-bash"># Server
docker run --rm -d \
  --name gitnexus-server \
  -p 4747:4747 \
  -v gitnexus-data:/data/gitnexus \
  ghcr.io/abhigyanpatwari/gitnexus:latest

# Web UI
docker run --rm -d \
  --name gitnexus-web \
  -p 4173:4173 \
  ghcr.io/abhigyanpatwari/gitnexus-web:latest
</code></pre> 
 <p>Optional env file (override image tags, container names, ports, workspace dir):</p> 
 <pre><code class="language-bash">cp .env.example .env
docker compose --env-file .env up -d
</code></pre> 
 <p>Files:</p> 
 <ul> 
  <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/Dockerfile.web">Dockerfile.web</a> — builds <code>gitnexus-shared</code> and <code>gitnexus-web</code>, then serves the production frontend.</li> 
  <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/Dockerfile.cli">Dockerfile.cli</a> — builds the CLI/server (with its native deps) and runs <code>gitnexus serve --host 0.0.0.0</code>.</li> 
  <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/docker-compose.yaml">docker-compose.yaml</a> — starts both signed images side by side.</li> 
  <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/.env.example">.env.example</a> — overrides for image names, container names, ports, and the workspace mount.</li> 
 </ul> 
</details> 
<details> 
 <strong>Versioning &amp; supply-chain protection</strong> (Cosign signatures, provenance, Kubernetes admission policy) 
 <p>The Docker images are version-locked to the npm package:</p> 
 <ul> 
  <li>Stable images are <strong>only published from <code>vX.Y.Z</code> git tags</strong> (via <code>docker.yml</code> triggered directly by the tag push), and the workflow refuses to build unless the tag exactly matches <code>gitnexus/package.json</code>'s version. So <code>ghcr.io/abhigyanpatwari/gitnexus:1.6.2</code> (and its Docker Hub mirror <code>akonlabs/gitnexus:1.6.2</code>) is byte-for-byte the same release as <code>npm install gitnexus@1.6.2</code> — no drift, no floating builds from <code>main</code>. Both registries receive the same digest from a single build step, so you can pull from either and the signature verifies identically.</li> 
  <li>Release-candidate images (e.g. <code>:1.7.0-rc.1</code>) are published alongside each RC npm release. They are built by <code>publish.yml</code> calling <code>docker.yml</code> as a reusable workflow after the RC tag is created and pushed.</li> 
  <li><code>:latest</code> is auto-promoted only from non-prerelease tags by the Docker metadata action, so it always points at a real, npm-published version.</li> 
 </ul> 
 <p>Both images are signed with <a href="https://docs.sigstore.dev/cosign/signing/overview/">Cosign keyless signing</a> using the workflow's GitHub OIDC identity, and shipped with build provenance and SBOM attestations. <strong>This is your protection against supply-chain attacks</strong>: even if an attacker republishes a same-named image elsewhere (or somehow pushes to a typo-squatted registry), they cannot forge a Cosign signature tied to <code>abhigyanpatwari/GitNexus</code>'s <code>docker.yml</code>. Always verify before pulling into sensitive environments.</p> 
 <p><strong>Stable releases</strong> — signed from the <code>v*</code> tag ref:</p> 
 <pre><code class="language-bash">cosign verify ghcr.io/abhigyanpatwari/gitnexus:1.6.2 \
  --certificate-identity-regexp '^https://github\.com/abhigyanpatwari/GitNexus/\.github/workflows/docker\.yml@refs/tags/v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com

# Same signature verifies the Docker Hub mirror (identical digest):
cosign verify docker.io/akonlabs/gitnexus:1.6.2 \
  --certificate-identity-regexp '^https://github\.com/abhigyanpatwari/GitNexus/\.github/workflows/docker\.yml@refs/tags/v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
</code></pre> 
 <p>The regex pins the certificate identity to this repo's <code>docker.yml</code> workflow <strong>run from a <code>v*</code> tag</strong> — rejecting unsigned images, images signed by other workflows, and images signed from unprotected refs. It is identical for both registries because both sets of tags were signed at the same digest in one workflow run.</p> 
 <p><strong>Release candidates</strong> — signed from <code>refs/heads/main</code> (the caller's ref when <code>publish.yml</code> invokes <code>docker.yml</code> as a reusable workflow):</p> 
 <pre><code class="language-bash">cosign verify ghcr.io/abhigyanpatwari/gitnexus:1.7.0-rc.1 \
  --certificate-identity 'https://github.com/abhigyanpatwari/GitNexus/.github/workflows/docker.yml@refs/heads/main' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
</code></pre> 
 <p>You can also inspect the build provenance and SBOM:</p> 
 <pre><code class="language-bash">cosign download attestation ghcr.io/abhigyanpatwari/gitnexus:1.6.2 \
  --predicate-type https://slsa.dev/provenance/v1
</code></pre> 
 <p><strong>Kubernetes: enforce signatures at admission.</strong> Ship the bundled <a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/deploy/kubernetes/cluster-image-policy.yaml"><code>ClusterImagePolicy</code></a> so the <a href="https://docs.sigstore.dev/policy-controller/overview/">Sigstore policy-controller</a> rejects any GitNexus pod whose image is not signed by this repo's <code>docker.yml</code> running from a <code>vX.Y.Z</code> tag — the same identity the <code>cosign verify</code> snippet above pins.</p> 
 <pre><code class="language-bash"># 1. Install the controller (one-time, cluster-wide)
helm repo add sigstore https://sigstore.github.io/helm-charts &amp;&amp; helm repo update
helm install policy-controller -n cosign-system --create-namespace \
  sigstore/policy-controller

# 2. Opt your namespace in
kubectl label namespace &lt;your-ns&gt; policy.sigstore.dev/include=true

# 3. Apply the policy
kubectl apply -f deploy/kubernetes/cluster-image-policy.yaml
</code></pre> 
 <p>After this, attempting to deploy an unsigned image — or one signed by anything other than <code>abhigyanpatwari/GitNexus</code>'s <code>docker.yml</code> at a <code>v*</code> tag — fails the admission webhook before a pod is ever created. This turns the verifiable signature into an enforced policy, which is the supply-chain control most clusters actually need.</p> 
</details> 
<h2>Enterprise</h2> 
<p>GitNexus is available as an <strong>enterprise offering</strong> — fully managed <strong>SaaS</strong> or <strong>self-hosted</strong> deployment. Commercial use of the OSS version is also available with proper licensing.</p> 
<p>Enterprise includes:</p> 
<ul> 
 <li><strong>PR Review</strong> — automated blast radius analysis on pull requests</li> 
 <li><strong>Auto-updating Code Wiki</strong> — always up-to-date documentation (Code Wiki is also available in OSS)</li> 
 <li><strong>Auto-reindexing</strong> — knowledge graph stays fresh automatically</li> 
 <li><strong>Multi-repo support</strong> — unified graph across repositories</li> 
 <li><strong>OCaml support</strong> — additional language coverage</li> 
 <li><strong>Priority feature/language support</strong> — request new languages or features</li> 
</ul> 
<p><strong>Upcoming:</strong> auto regression forensics · end-to-end test generation</p> 
<p>👉 Learn more at <a href="https://akonlabs.com">akonlabs.com</a> — for commercial licensing or enterprise inquiries, ping us on <a href="https://discord.gg/AAsRVT6fGb">Discord</a> or email <a href="mailto:founders@akonlabs.com">founders@akonlabs.com</a></p> 
<h2>Community Integrations</h2> 
<p>Built by the community — not officially maintained, but worth checking out.</p> 
<table> 
 <thead> 
  <tr> 
   <th>Project</th> 
   <th>Author</th> 
   <th>Description</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><a href="https://github.com/tintinweb/pi-gitnexus">pi-gitnexus</a></td> 
   <td><a href="https://github.com/tintinweb">@tintinweb</a></td> 
   <td>GitNexus plugin for <a href="https://pi.dev">pi</a> — <code>pi install npm:pi-gitnexus</code></td> 
  </tr> 
  <tr> 
   <td><a href="https://github.com/ShunsukeHayashi/gitnexus-stable-ops">gitnexus-stable-ops</a></td> 
   <td><a href="https://github.com/ShunsukeHayashi">@ShunsukeHayashi</a></td> 
   <td>Stable ops &amp; deployment workflows (Miyabi ecosystem)</td> 
  </tr> 
  <tr> 
   <td><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/Documentation/kilo-code-mcp.md">KiloCode MCP workflow</a></td> 
   <td><a href="https://github.com/oktanishq">@oktanishq</a></td> 
   <td>Guide to connect GitNexus MCP to Kilo Code and verify tools.</td> 
  </tr> 
 </tbody> 
</table> 
<blockquote> 
 <p>Have a project built on GitNexus? Open a PR to add it here!</p> 
</blockquote> 
<h2>Roadmap</h2> 
<p><strong>Actively building:</strong></p> 
<ul class="task-list"> 
 <li class="task-list-item"><input disabled="true" id="cbx_0" type="checkbox" /><label for="cbx_0"> <strong>LLM Cluster Enrichment</strong> — semantic cluster names via LLM API</label></li> 
 <li class="task-list-item"><input disabled="true" id="cbx_1" type="checkbox" /><label for="cbx_1"> <strong>AST Decorator Detection</strong> — parse @Controller, @Get, etc.</label></li> 
 <li class="task-list-item"><input disabled="true" id="cbx_2" type="checkbox" /><label for="cbx_2"> <strong>Incremental Indexing</strong> — only re-index changed files</label></li> 
</ul> 
<p><strong>Recently completed:</strong></p> 
<ul class="task-list"> 
 <li class="task-list-item"><input checked="true" disabled="true" id="cbx_3" type="checkbox" /><label for="cbx_3"> Constructor-Inferred Type Resolution, <code>self</code>/<code>this</code> Receiver Mapping</label></li> 
 <li class="task-list-item"><input checked="true" disabled="true" id="cbx_4" type="checkbox" /><label for="cbx_4"> Wiki Generation, Multi-File Rename, Git-Diff Impact Analysis</label></li> 
 <li class="task-list-item"><input checked="true" disabled="true" id="cbx_5" type="checkbox" /><label for="cbx_5"> Process-Grouped Search, 360-Degree Context, Claude Code Hooks</label></li> 
 <li class="task-list-item"><input checked="true" disabled="true" id="cbx_6" type="checkbox" /><label for="cbx_6"> Multi-Repo MCP, Zero-Config Setup, 14 Language Support</label></li> 
 <li class="task-list-item"><input checked="true" disabled="true" id="cbx_7" type="checkbox" /><label for="cbx_7"> Community Detection, Process Detection, Confidence Scoring</label></li> 
 <li class="task-list-item"><input checked="true" disabled="true" id="cbx_8" type="checkbox" /><label for="cbx_8"> Hybrid Search, Vector Index</label></li> 
</ul> 
<h2>Development</h2> 
<ul> 
 <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/ARCHITECTURE.md">ARCHITECTURE.md</a> — packages, index → graph → MCP flow, where to change code</li> 
 <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/RUNBOOK.md">RUNBOOK.md</a> — analyze, embeddings, stale index, MCP recovery, CI snippets</li> 
 <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/GUARDRAILS.md">GUARDRAILS.md</a> — safety rules and operational "Signs" for contributors and agents</li> 
 <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/CONTRIBUTING.md">CONTRIBUTING.md</a> — license, setup, commits, and pull requests</li> 
 <li><a href="https://raw.githubusercontent.com/abhigyanpatwari/GitNexus/main/TESTING.md">TESTING.md</a> — test commands for <code>gitnexus</code> and <code>gitnexus-web</code></li> 
</ul> 
<h2>Tech Stack</h2> 
<table> 
 <thead> 
  <tr> 
   <th>Layer</th> 
   <th>CLI</th> 
   <th>Web</th> 
  </tr> 
 </thead> 
 <tbody> 
  <tr> 
   <td><strong>Runtime</strong></td> 
   <td>Node.js (native)</td> 
   <td>Browser (WASM)</td> 
  </tr> 
  <tr> 
   <td><strong>Parsing</strong></td> 
   <td>Tree-sitter native bindings</td> 
   <td>Tree-sitter WASM</td> 
  </tr> 
  <tr> 
   <td><strong>Database</strong></td> 
   <td>LadybugDB native</td> 
   <td>LadybugDB WASM</td> 
  </tr> 
  <tr> 
   <td><strong>Embeddings</strong></td> 
   <td>HuggingFace transformers.js (GPU/CPU)</td> 
   <td>transformers.js (WebGPU/WASM)</td> 
  </tr> 
  <tr> 
   <td><strong>Search</strong></td> 
   <td>BM25 + semantic + RRF</td> 
   <td>BM25 + semantic + RRF</td> 
  </tr> 
  <tr> 
   <td><strong>Agent Interface</strong></td> 
   <td>MCP (stdio)</td> 
   <td>LangChain ReAct agent</td> 
  </tr> 
  <tr> 
   <td><strong>Visualization</strong></td> 
   <td>—</td> 
   <td>Sigma.js + Graphology (WebGL)</td> 
  </tr> 
  <tr> 
   <td><strong>Frontend</strong></td> 
   <td>—</td> 
   <td>React 18, TypeScript, Vite, Tailwind v4</td> 
  </tr> 
  <tr> 
   <td><strong>Clustering</strong></td> 
   <td>Graphology</td> 
   <td>Graphology</td> 
  </tr> 
  <tr> 
   <td><strong>Concurrency</strong></td> 
   <td>Worker threads + async</td> 
   <td>Web Workers + Comlink</td> 
  </tr> 
 </tbody> 
</table> 
<h2>Security &amp; Privacy</h2> 
<ul> 
 <li><strong>CLI</strong>: everything runs locally on your machine. No network calls. Index stored in <code>.gitnexus/</code> (gitignored). Global registry at <code>~/.gitnexus/</code> stores only paths and metadata.</li> 
 <li><strong>Web</strong>: everything runs in your browser. No code uploaded to any server. API keys stored in localStorage only.</li> 
 <li>Open source — audit the code yourself.</li> 
</ul> 
<h2>Star History</h2> 
<p><a href="https://www.star-history.com/#abhigyanpatwari/GitNexus&amp;type=date&amp;legend=top-left"><img alt="Star History Chart" src="https://api.star-history.com/svg?repos=abhigyanpatwari/GitNexus&amp;type=date&amp;legend=top-left" /></a></p> 
<h2>Acknowledgments</h2> 
<ul> 
 <li><a href="https://tree-sitter.github.io/">Tree-sitter</a> — AST parsing</li> 
 <li><a href="https://ladybugdb.com/">LadybugDB</a> — embedded graph database with vector support (formerly KuzuDB)</li> 
 <li><a href="https://www.sigmajs.org/">Sigma.js</a> — WebGL graph rendering</li> 
 <li><a href="https://huggingface.co/docs/transformers.js">transformers.js</a> — browser ML</li> 
 <li><a href="https://graphology.github.io/">Graphology</a> — graph data structures</li> 
 <li><a href="https://modelcontextprotocol.io/">MCP</a> — Model Context Protocol</li> 
</ul>