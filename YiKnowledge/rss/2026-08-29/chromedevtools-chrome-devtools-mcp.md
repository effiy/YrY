---
title: ChromeDevTools/chrome-devtools-mcp
tags:
- GitHub Trending
category: engineer/ship
created: '2026-08-29'
source: https://github.com/ChromeDevTools/chrome-devtools-mcp
type: rss
source_name: GitHub Trending
source_url: https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml
---

<p>Chrome DevTools for coding agents</p><p><img alt="link" height="20" src="https://mshibanami.github.io/GitHubTrendingRSS/assets/icons/link.png" style="margin: 0 8px 0 0; padding: 0; display: inline-block; vertical-align: middle;" width="20" /><a href="https://npmjs.org/package/chrome-devtools-mcp">https://npmjs.org/package/chrome-devtools-mcp</a></p><hr /><h1>Chrome DevTools for agents</h1> 
<p><a href="https://npmjs.org/package/chrome-devtools-mcp"><img alt="npm chrome-devtools-mcp package" src="https://img.shields.io/npm/v/chrome-devtools-mcp.svg?sanitize=true" /></a></p> 
<p>Chrome DevTools for agents (<code>chrome-devtools-mcp</code>) lets your coding agent (such as Antigravity, Claude, Cursor or Copilot) control and inspect a live Chrome browser. It acts as a Model-Context-Protocol (MCP) server, giving your AI coding assistant access to the full power of Chrome DevTools for reliable automation, in-depth debugging, and performance analysis. A <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/cli.md">CLI</a> is also provided for use without MCP.</p> 
<h2><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md">Tool reference</a> | <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/CHANGELOG.md">Changelog</a> | <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/CONTRIBUTING.md">Contributing</a> | <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/troubleshooting.md">Troubleshooting</a> | <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/design-principles.md">Design Principles</a></h2> 
<h2>Key features</h2> 
<ul> 
 <li><strong>Get performance insights</strong>: Uses <a href="https://github.com/ChromeDevTools/devtools-frontend">Chrome DevTools</a> to record traces and extract actionable performance insights.</li> 
 <li><strong>Advanced browser debugging</strong>: Analyze network requests, take screenshots and check browser console messages (with source-mapped stack traces).</li> 
 <li><strong>Reliable automation</strong>. Uses <a href="https://github.com/puppeteer/puppeteer">puppeteer</a> to automate actions in Chrome and automatically wait for action results.</li> 
</ul> 
<h2>Disclaimers</h2> 
<p><code>chrome-devtools-mcp</code> exposes content of the browser instance to the MCP clients allowing them to inspect, debug, and modify any data in the browser or DevTools. Avoid sharing sensitive or personal information that you don't want to share with MCP clients.</p> 
<p><code>chrome-devtools-mcp</code> officially supports Google Chrome and <a href="https://developer.chrome.com/blog/chrome-for-testing/">Chrome for Testing</a> only. Other Chromium-based browsers may work, but this is not guaranteed, and you may encounter unexpected behavior. Use at your own discretion. We are committed to providing fixes and support for the latest version of <a href="https://chromiumdash.appspot.com/schedule">Extended Stable Chrome</a>.</p> 
<p>Performance tools may send trace URLs to the Google CrUX API to fetch real-user experience data. This helps provide a holistic performance picture by presenting field data alongside lab data. This data is collected by the <a href="https://developer.chrome.com/docs/crux">Chrome User Experience Report (CrUX)</a>. To disable this, run with the <code>--no-performance-crux</code> flag.</p> 
<h2><strong>Usage statistics</strong></h2> 
<p>Google collects usage statistics (such as tool invocation success rates, latency, and environment information) to improve the reliability and performance of Chrome DevTools MCP.</p> 
<p>Data collection is <strong>enabled by default</strong>. You can opt-out by passing the <code>--no-usage-statistics</code> flag when starting the server:</p> 
<pre><code class="language-json">"args": ["-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
</code></pre> 
<p>Google handles this data in accordance with the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.</p> 
<p>Google's collection of usage statistics for Chrome DevTools MCP is independent from the Chrome browser's usage statistics. Opting out of Chrome metrics does not automatically opt you out of this tool, and vice-versa.</p> 
<p>Collection is disabled if <code>CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS</code> or <code>CI</code> env variables are set.</p> 
<h2>Update checks</h2> 
<p>By default, the server periodically checks the npm registry for updates and logs a notification when a newer version is available. You can disable these update checks by setting the <code>CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS</code> environment variable.</p> 
<h2>Requirements</h2> 
<ul> 
 <li><a href="https://nodejs.org/">Node.js</a> <a href="https://github.com/nodejs/Release#release-schedule">LTS</a> version.</li> 
 <li><a href="https://www.google.com/chrome/">Chrome</a> current stable version or newer.</li> 
 <li><a href="https://www.npmjs.com/">npm</a></li> 
</ul> 
<h2>Getting started</h2> 
<p>Add the following config to your MCP client:</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
</code></pre> 
<div class="markdown-alert markdown-alert-note">
 <p class="markdown-alert-title">
  <svg class="octicon octicon-info mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
   <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
  </svg>Note</p>
 <p>Using <code>chrome-devtools-mcp@latest</code> ensures that your MCP client will always use the latest version of the Chrome DevTools MCP server.</p> 
</div> 
<p>If you are interested in doing only basic browser tasks, use the <code>--slim</code> mode:</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--slim", "--headless"]
    }
  }
}
</code></pre> 
<p>See <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/slim-tool-reference.md">Slim tool reference</a>.</p> 
<h3>MCP Client configuration</h3> 
<details> 
 Amp Follow https://ampcode.com/manual#mcp and use the config provided above. You can also install the Chrome DevTools MCP server using the CLI: 
 <pre><code class="language-bash">amp mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
</code></pre> 
</details> 
<details> 
 Antigravity 
 <p>To use the Chrome DevTools MCP server follow the instructions from <a href="https://antigravity.google/docs/mcp">Antigravity's docs</a> to install a custom MCP server. Add the following config to the MCP servers config:</p> 
 <pre><code class="language-bash">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
</code></pre> 
 <p>This will make the Chrome DevTools MCP server automatically connect to the browser that Antigravity is using. If you are not using port 9222, make sure to adjust accordingly.</p> 
 <p>Chrome DevTools MCP will not start the browser instance automatically using this approach because the Chrome DevTools MCP server connects to Antigravity's built-in browser. If the browser is not already running, you have to start it first by clicking the Chrome icon at the top right corner.</p> 
</details> 
<details> 
 Bob 
 <p>Follow the <a href="https://bob.ibm.com/docs/ide/configuration/mcp/mcp-in-bob">IBM Bob MCP guide</a> and add the Chrome DevTools MCP server to your Bob MCP configuration. Use the global config (<code>~/.bob/mcp.json</code>) to apply it across all workspaces, or a project config (<code>.bob/mcp.json</code>) to scope it to one project:</p> 
 <pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
</code></pre> 
 <p>You can edit these files from <strong>Bob panel → Settings → MCP → Edit Global MCP</strong> (or <strong>Edit Project MCP</strong>). Bob hot-reloads on save. Once the server appears in the MCP tab, switch to the <strong>🌎 Browser Dev</strong> mode to get guided browser debugging directly in Bob.</p> 
</details> 
<details> 
 Claude Code 
 <p><strong>Install via CLI (MCP only)</strong></p> 
 <p>Use the Claude Code CLI to add the Chrome DevTools MCP server (<a href="https://code.claude.com/docs/en/mcp">guide</a>):</p> 
 <pre><code class="language-bash">claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
</code></pre> 
 <p><strong>Install as a Plugin (MCP + Skills)</strong></p> 
 <div class="markdown-alert markdown-alert-note">
  <p class="markdown-alert-title">
   <svg class="octicon octicon-info mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
   </svg>Note</p>
  <p>If you already had Chrome DevTools MCP installed previously for Claude Code, make sure to remove it first from your installation and configuration files.</p> 
 </div> 
 <p>To install Chrome DevTools MCP with skills, add the marketplace registry in Claude Code:</p> 
 <pre><code class="language-sh">/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
</code></pre> 
 <p>Then, install the plugin:</p> 
 <pre><code class="language-sh">/plugin install chrome-devtools-mcp@chrome-devtools-plugins
</code></pre> 
 <p>Restart Claude Code to have the MCP server and skills load (check with <code>/skills</code>).</p> 
 <div class="markdown-alert markdown-alert-tip">
  <p class="markdown-alert-title">
   <svg class="octicon octicon-light-bulb mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>
   </svg>Tip</p>
  <p>If the plugin installation fails with a <code>Failed to clone repository</code> error (e.g., HTTPS connectivity issues behind a corporate firewall), see the <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/troubleshooting.md#claude-code-plugin-installation-fails-with-failed-to-clone-repository">troubleshooting guide</a> for workarounds, or use the CLI installation method above instead.</p> 
 </div> 
</details> 
<details> 
 Cline Follow https://docs.cline.bot/mcp/configuring-mcp-servers and use the config provided above. 
</details> 
<details> 
 Codex Follow the 
 <a href="https://developers.openai.com/codex/mcp/#configure-with-the-cli">configure MCP guide</a> using the standard config from above. You can also install the Chrome DevTools MCP server using the Codex CLI: 
 <pre><code class="language-bash">codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
</code></pre> 
 <p><strong>On Windows 11</strong></p> 
 <p>Configure the Chrome install location and increase the startup timeout by updating <code>.codex/config.toml</code> and adding the following <code>env</code> and <code>startup_timeout_ms</code> parameters:</p> 
 <pre><code>[mcp_servers.chrome-devtools]
command = "cmd"
args = [
    "/c",
    "npx",
    "-y",
    "chrome-devtools-mcp@latest",
]
env = { SystemRoot="C:\\Windows", PROGRAMFILES="C:\\Program Files" }
startup_timeout_ms = 20_000
</code></pre> 
</details> 
<details> 
 Command Code 
 <p>Use the Command Code CLI to add the Chrome DevTools MCP server (<a href="https://commandcode.ai/docs/mcp">MCP guide</a>):</p> 
 <pre><code class="language-bash">cmd mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
</code></pre> 
</details> 
<details> 
 Copilot CLI 
 <p>Start Copilot CLI:</p> 
 <pre><code>copilot
</code></pre> 
 <p>Start the dialog to add a new MCP server by running:</p> 
 <pre><code>/mcp add
</code></pre> 
 <p>Configure the following fields and press <code>CTRL+S</code> to save the configuration:</p> 
 <ul> 
  <li><strong>Server name:</strong> <code>chrome-devtools</code></li> 
  <li><strong>Server Type:</strong> <code>[1] Local</code></li> 
  <li><strong>Command:</strong> <code>npx -y chrome-devtools-mcp@latest</code></li> 
 </ul> 
</details> 
<details> 
 Copilot / VS Code 
 <p><strong>Install as a Plugin (Recommended)</strong></p> 
 <p>The easiest way to get up and running is to install <code>chrome-devtools-mcp</code> as an agent plugin. This bundles the <strong>MCP server</strong> and all <strong>skills</strong> together, so your agent gets both the tools and the expert guidance it needs to use them effectively.</p> 
 <ol> 
  <li>Open the <strong>Command Palette</strong> (<code>Cmd+Shift+P</code> on macOS or <code>Ctrl+Shift+P</code> on Windows/Linux).</li> 
  <li>Search for and run the <strong>Chat: Install Plugin From Source</strong> command.</li> 
  <li>Paste in our repository name: <code>ChromeDevTools/chrome-devtools-mcp</code>.</li> 
 </ol> 
 <p>That's it! Your agent is now supercharged with Chrome DevTools capabilities.</p> 
 <hr /> 
 <p><strong>Install as an MCP Server (MCP only)</strong></p> 
 <p><strong>Click the button to install:</strong></p> 
 <p><a href="https://vscode.dev/redirect/mcp/install?name=io.github.ChromeDevTools%2Fchrome-devtools-mcp&amp;config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22chrome-devtools-mcp%22%5D%2C%22env%22%3A%7B%7D%7D"><img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&amp;label=Install%20Server&amp;color=0098FF" /></a></p> 
 <p><a href="https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522io.github.ChromeDevTools%252Fchrome-devtools-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522chrome-devtools-mcp%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D"><img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&amp;label=Install%20Server&amp;color=24bfa5" /></a></p> 
 <p><strong>Or install manually:</strong></p> 
 <p>Follow the VS Code <a href="https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server">MCP configuration guide</a> using the standard config from above, or use the CLI:</p> 
 <p>For macOS and Linux:</p> 
 <pre><code class="language-bash">code --add-mcp '{"name":"io.github.ChromeDevTools/chrome-devtools-mcp","command":"npx","args":["-y","chrome-devtools-mcp"],"env":{}}'
</code></pre> 
 <p>For Windows (PowerShell):</p> 
 <pre><code class="language-powershell">code --add-mcp '{"""name""":"""io.github.ChromeDevTools/chrome-devtools-mcp""","""command""":"""npx""","""args""":["""-y""","""chrome-devtools-mcp"""]}'
</code></pre> 
</details> 
<details> 
 Cursor 
 <p><strong>Click the button to install:</strong></p> 
 <p><a href="https://cursor.com/en/install-mcp?name=chrome-devtools&amp;config=eyJjb21tYW5kIjoibnB4IC15IGNocm9tZS1kZXZ0b29scy1tY3BAbGF0ZXN0In0%3D"><img alt="Install in Cursor" src="https://cursor.com/deeplink/mcp-install-dark.svg?sanitize=true" /></a></p> 
 <p><strong>Or install manually:</strong></p> 
 <p>Go to <code>Cursor Settings</code> -&gt; <code>MCP</code> -&gt; <code>New MCP Server</code>. Use the config provided above.</p> 
</details> 
<details> 
 Devin CLI 
 <p><strong>Install via CLI (MCP only)</strong></p> 
 <p>Use the Devin CLI to add the Chrome DevTools MCP server (<a href="https://docs.devin.ai/cli/extensibility/mcp/configuration">guide</a>):</p> 
 <pre><code class="language-bash">devin mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
</code></pre> 
</details> 
<details> 
 Factory CLI Use the Factory CLI to add the Chrome DevTools MCP server (
 <a href="https://docs.factory.ai/cli/configuration/mcp">guide</a>): 
 <pre><code class="language-bash">droid mcp add chrome-devtools "npx -y chrome-devtools-mcp@latest"
</code></pre> 
</details> 
<details> 
 Gemini CLI Install the Chrome DevTools MCP server using the Gemini CLI. 
 <p><strong>Project wide:</strong></p> 
 <pre><code class="language-bash"># Either MCP only:
gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest
# Or as a Gemini extension (MCP+Skills):
gemini extensions install --auto-update https://github.com/ChromeDevTools/chrome-devtools-mcp
</code></pre> 
 <p><strong>Globally:</strong></p> 
 <pre><code class="language-bash">gemini mcp add -s user chrome-devtools npx chrome-devtools-mcp@latest
</code></pre> 
 <p>Alternatively, follow the <a href="https://github.com/google-gemini/gemini-cli/raw/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server">MCP guide</a> and use the standard config from above.</p> 
</details> 
<details> 
 Gemini Code Assist Follow the 
 <a href="https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer#configure-mcp-servers">configure MCP guide</a> using the standard config from above. 
</details> 
<details> 
 Grok Build CLI 
 <pre><code class="language-bash">grok mcp add chrome-devtools npx chrome-devtools-mcp@latest
</code></pre> 
 <p>See the <a href="https://docs.x.ai/build/features/skills-plugins-marketplaces">docs</a> for more options</p> 
</details> 
<details> 
 JetBrains AI Assistant &amp; Junie 
 <p>Go to <code>Settings | Tools | AI Assistant | Model Context Protocol (MCP)</code> -&gt; <code>Add</code>. Use the config provided above. The same way chrome-devtools-mcp can be configured for JetBrains Junie in <code>Settings | Tools | Junie | MCP Settings</code> -&gt; <code>Add</code>. Use the config provided above.</p> 
</details> 
<details> 
 Kiro 
 <p>In <strong>Kiro Settings</strong>, go to <code>Configure MCP</code> &gt; <code>Open Workspace or User MCP Config</code> &gt; Use the configuration snippet provided above.</p> 
 <p>Or, from the IDE <strong>Activity Bar</strong> &gt; <code>Kiro</code> &gt; <code>MCP Servers</code> &gt; <code>Click Open MCP Config</code>. Use the configuration snippet provided above.</p> 
</details> 
<details> 
 Katalon Studio 
 <p>The Chrome DevTools MCP server can be used with <a href="https://docs.katalon.com/katalon-studio/studioassist/mcp-servers/setting-up-chrome-devtools-mcp-server-for-studioassist">Katalon StudioAssist</a> via an MCP proxy.</p> 
 <p><strong>Step 1:</strong> Install the MCP proxy by following the <a href="https://docs.katalon.com/katalon-studio/studioassist/mcp-servers/setting-up-mcp-proxy-for-stdio-mcp-servers">MCP proxy setup guide</a>.</p> 
 <p><strong>Step 2:</strong> Start the Chrome DevTools MCP server with the proxy:</p> 
 <pre><code class="language-bash">mcp-proxy --transport streamablehttp --port 8080 -- npx -y chrome-devtools-mcp@latest
</code></pre> 
 <p><strong>Note:</strong> You may need to pick another port if 8080 is already in use.</p> 
 <p><strong>Step 3:</strong> In Katalon Studio, add the server to StudioAssist with the following settings:</p> 
 <ul> 
  <li><strong>Connection URL:</strong> <code>http://127.0.0.1:8080/mcp</code></li> 
  <li><strong>Transport type:</strong> <code>HTTP</code></li> 
 </ul> 
 <p>Once connected, the Chrome DevTools MCP tools will be available in StudioAssist.</p> 
</details> 
<details> 
 Mistral Vibe 
 <p>Add in ~/.vibe/config.toml:</p> 
 <pre><code class="language-toml">[[mcp_servers]]
name = "chrome-devtools"
transport = "stdio"
command = "npx"
args = ["chrome-devtools-mcp@latest"]
</code></pre> 
</details> 
<details> 
 OpenCode 
 <p>Add the following configuration to your <code>opencode.json</code> file. If you don't have one, create it at <code>~/.config/opencode/opencode.json</code> (<a href="https://opencode.ai/docs/mcp-servers">guide</a>):</p> 
 <pre><code class="language-json">{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
    }
  }
}
</code></pre> 
</details> 
<details> 
 Qoder 
 <p>In <strong>Qoder Settings</strong>, go to <code>MCP Server</code> &gt; <code>+ Add</code> &gt; Use the configuration snippet provided above.</p> 
 <p>Alternatively, follow the <a href="https://docs.qoder.com/user-guide/chat/model-context-protocol">MCP guide</a> and use the standard config from above.</p> 
</details> 
<details> 
 Qoder CLI 
 <p>Install the Chrome DevTools MCP server using the Qoder CLI (<a href="https://docs.qoder.com/cli/using-cli#mcp-servers">guide</a>):</p> 
 <p><strong>Project wide:</strong></p> 
 <pre><code class="language-bash">qodercli mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
</code></pre> 
 <p><strong>Globally:</strong></p> 
 <pre><code class="language-bash">qodercli mcp add -s user chrome-devtools -- npx chrome-devtools-mcp@latest
</code></pre> 
</details> 
<details> 
 Visual Studio 
 <p><strong>Click the button to install:</strong></p> 
 <p><a href="https://vs-open.link/mcp-install?%7B%22name%22%3A%22chrome-devtools%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22chrome-devtools-mcp%40latest%22%5D%7D"><img alt="Install in Visual Studio" src="https://img.shields.io/badge/Visual_Studio-Install-C16FDE?logo=visualstudio&amp;logoColor=white" /></a></p> 
</details> 
<details> 
 Warp 
 <p>Go to <code>Settings | AI | Manage MCP Servers</code> -&gt; <code>+ Add</code> to <a href="https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server">add an MCP Server</a>. Use the config provided above.</p> 
</details> 
<details> 
 Windsurf Follow the 
 <a href="https://docs.windsurf.com/windsurf/cascade/mcp#mcp-config-json">configure MCP guide</a> using the standard config from above. 
</details> 
<h3>Your first prompt</h3> 
<p>Enter the following prompt in your MCP Client to check if everything is working:</p> 
<pre><code>Check the performance of https://developers.chrome.com
</code></pre> 
<p>Your MCP client should open the browser and record a performance trace.</p> 
<div class="markdown-alert markdown-alert-note">
 <p class="markdown-alert-title">
  <svg class="octicon octicon-info mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
   <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
  </svg>Note</p>
 <p>The MCP server will start the browser automatically once the MCP client uses a tool that requires a running browser instance. Connecting to the Chrome DevTools MCP server on its own will not automatically start the browser.</p> 
</div> 
<h2>Tools</h2> 
<p>If you run into any issues, checkout our <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/troubleshooting.md">troubleshooting guide</a>.</p> 
<!-- BEGIN AUTO GENERATED TOOLS --> 
<ul> 
 <li><strong>Input automation</strong> (10 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#click"><code>click</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#drag"><code>drag</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#fill"><code>fill</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#fill_form"><code>fill_form</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#handle_dialog"><code>handle_dialog</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#hover"><code>hover</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#press_key"><code>press_key</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#type_text"><code>type_text</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#upload_file"><code>upload_file</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#click_at"><code>click_at</code></a></li> 
  </ul> </li> 
 <li><strong>Navigation automation</strong> (6 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#close_page"><code>close_page</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#list_pages"><code>list_pages</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#navigate_page"><code>navigate_page</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#new_page"><code>new_page</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#select_page"><code>select_page</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#wait_for"><code>wait_for</code></a></li> 
  </ul> </li> 
 <li><strong>Emulation</strong> (2 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#emulate"><code>emulate</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#resize_page"><code>resize_page</code></a></li> 
  </ul> </li> 
 <li><strong>Performance</strong> (3 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#performance_analyze_insight"><code>performance_analyze_insight</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#performance_start_trace"><code>performance_start_trace</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#performance_stop_trace"><code>performance_stop_trace</code></a></li> 
  </ul> </li> 
 <li><strong>Network</strong> (2 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_network_request"><code>get_network_request</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#list_network_requests"><code>list_network_requests</code></a></li> 
  </ul> </li> 
 <li><strong>Debugging</strong> (8 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#evaluate_script"><code>evaluate_script</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_console_message"><code>get_console_message</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#lighthouse_audit"><code>lighthouse_audit</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#list_console_messages"><code>list_console_messages</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#take_screenshot"><code>take_screenshot</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#take_snapshot"><code>take_snapshot</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#screencast_start"><code>screencast_start</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#screencast_stop"><code>screencast_stop</code></a></li> 
  </ul> </li> 
 <li><strong>Memory</strong> (13 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#take_heapsnapshot"><code>take_heapsnapshot</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#close_heapsnapshot"><code>close_heapsnapshot</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#compare_heapsnapshots"><code>compare_heapsnapshots</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_class_nodes"><code>get_heapsnapshot_class_nodes</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_details"><code>get_heapsnapshot_details</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_dominators"><code>get_heapsnapshot_dominators</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_duplicate_strings"><code>get_heapsnapshot_duplicate_strings</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_edges"><code>get_heapsnapshot_edges</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_object_details"><code>get_heapsnapshot_object_details</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_retainers"><code>get_heapsnapshot_retainers</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_retaining_paths"><code>get_heapsnapshot_retaining_paths</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_heapsnapshot_summary"><code>get_heapsnapshot_summary</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#query_heapsnapshot_objects"><code>query_heapsnapshot_objects</code></a></li> 
  </ul> </li> 
 <li><strong>Extensions</strong> (5 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#install_extension"><code>install_extension</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#list_extensions"><code>list_extensions</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#reload_extension"><code>reload_extension</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#trigger_extension_action"><code>trigger_extension_action</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#uninstall_extension"><code>uninstall_extension</code></a></li> 
  </ul> </li> 
 <li><strong>Third-party</strong> (2 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#execute_3p_developer_tool"><code>execute_3p_developer_tool</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#list_3p_developer_tools"><code>list_3p_developer_tools</code></a></li> 
  </ul> </li> 
 <li><strong>WebMCP</strong> (2 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#execute_webmcp_tool"><code>execute_webmcp_tool</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#list_webmcp_tools"><code>list_webmcp_tools</code></a></li> 
  </ul> </li> 
 <li><strong>Progressive Web Apps</strong> (4 tools) 
  <ul> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#get_os_app_state"><code>get_os_app_state</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#install_pwa"><code>install_pwa</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#launch_pwa"><code>launch_pwa</code></a></li> 
   <li><a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md#uninstall_pwa"><code>uninstall_pwa</code></a></li> 
  </ul> </li> 
</ul> 
<!-- END AUTO GENERATED TOOLS --> 
<h2>Configuration</h2> 
<p>The Chrome DevTools MCP server supports the following configuration option:</p> 
<!-- BEGIN AUTO GENERATED OPTIONS --> 
<ul> 
 <li> <p><strong><code>--autoConnect</code>/ <code>--auto-connect</code></strong> If specified, automatically connects to a browser (Chrome 144+) running locally from the user data directory identified by the channel param (default channel is stable). Requires the remote debugging server to be started in the Chrome instance via chrome://inspect/#remote-debugging.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--browserUrl</code>/ <code>--browser-url</code>, <code>-u</code></strong> Connect to a running, debuggable Chrome instance (e.g. <code>http://127.0.0.1:9222</code>). For more details see: <a href="https://github.com/ChromeDevTools/chrome-devtools-mcp#connecting-to-a-running-chrome-instance">https://github.com/ChromeDevTools/chrome-devtools-mcp#connecting-to-a-running-chrome-instance</a>.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--wsEndpoint</code>/ <code>--ws-endpoint</code>, <code>-w</code></strong> WebSocket endpoint to connect to a running Chrome instance (e.g., ws://127.0.0.1:9222/devtools/browser/
   
    ). Alternative to --browserUrl.
   </p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--wsHeaders</code>/ <code>--ws-headers</code></strong> Custom headers for WebSocket connection in JSON format (e.g., '{"Authorization":"Bearer token"}'). Only works with --wsEndpoint.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--headless</code></strong> Whether to run in headless (no UI) mode.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--executablePath</code>/ <code>--executable-path</code>, <code>-e</code></strong> Path to custom Chrome executable.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--isolated</code></strong> If specified, creates a temporary user-data-dir that is automatically cleaned up after the browser is closed. Defaults to false.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--userDataDir</code>/ <code>--user-data-dir</code></strong> Path to the user data directory for Chrome. Default is $HOME/.cache/chrome-devtools-mcp/chrome-profile$CHANNEL_SUFFIX_IF_NON_STABLE</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--channel</code></strong> Specify a different Chrome channel that should be used. The default is the stable channel version.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Choices:</strong> <code>canary</code>, <code>dev</code>, <code>beta</code>, <code>stable</code></li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--logFile</code>/ <code>--log-file</code></strong> Path to a file to write debug logs to. Set the env variable <code>DEBUG</code> to <code>*</code> to enable verbose logs. Useful for submitting bug reports.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--viewport</code></strong> Initial viewport size for the Chrome instances started by the server. For example, <code>1280x720</code>. In headless mode, max size is 3840x2160px.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--proxyServer</code>/ <code>--proxy-server</code></strong> Proxy server configuration for Chrome passed as --proxy-server when launching the browser. See <a href="https://www.chromium.org/developers/design-documents/network-settings/">https://www.chromium.org/developers/design-documents/network-settings/</a> for details.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--acceptInsecureCerts</code>/ <code>--accept-insecure-certs</code></strong> If enabled, ignores errors relative to self-signed and expired certificates. Use with caution.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--pageIdRouting</code>/ <code>--page-id-routing</code></strong> Require pageId on page-scoped tools and route requests by page ID (useful for concurrent agent sessions). Use --no-page-id-routing to disable.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>true</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--experimentalDevtools</code>/ <code>--experimental-devtools</code></strong> Whether to enable automation over DevTools targets</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--experimentalVision</code>/ <code>--experimental-vision</code></strong> Whether to enable coordinate-based tools such as click_at(x,y). Usually requires a computer-use model able to produce accurate coordinates by looking at screenshots.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--memoryDebugging</code>/ <code>--memory-debugging</code>, <code>-experimentalMemory</code></strong> Whether to enable memory debugging tools.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--experimentalStructuredContent</code>/ <code>--experimental-structured-content</code></strong> Whether to output structured formatted content.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--experimentalIncludeAllPages</code>/ <code>--experimental-include-all-pages</code></strong> Whether to include all kinds of pages such as webviews or background pages as pages.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--experimentalScreencast</code>/ <code>--experimental-screencast</code></strong> Exposes experimental screencast tools (requires ffmpeg). Install ffmpeg <a href="https://www.ffmpeg.org/download.html">https://www.ffmpeg.org/download.html</a> and ensure it is available in the MCP server PATH.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--experimentalFfmpegPath</code>/ <code>--experimental-ffmpeg-path</code></strong> Path to ffmpeg executable for screencast recording.</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryExperimentalWebmcp</code>/ <code>--category-experimental-webmcp</code></strong> Set to true to enable debugging WebMCP tools. Requires Chrome 150+ with the following flag: <code>--enable-features=WebMCP</code></p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--chromeArg</code>/ <code>--chrome-arg</code></strong> Additional arguments for Chrome. Only applies when Chrome is launched by chrome-devtools-mcp.</p> 
  <ul> 
   <li><strong>Type:</strong> array</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--blockedUrlPattern</code>/ <code>--blocked-url-pattern</code></strong> Restricts browser's network access by blocking specified URL patterns (uses <a href="https://urlpattern.spec.whatwg.org/">https://urlpattern.spec.whatwg.org/</a>). Silently detaches from targets with blocked URLs upon connection, and blocks runtime requests (including navigations and subresources). Accepts an array of patterns.</p> 
  <ul> 
   <li><strong>Type:</strong> array</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--allowedUrlPattern</code>/ <code>--allowed-url-pattern</code></strong> Restricts browser's network access by allowing only specified URL patterns (uses <a href="https://urlpattern.spec.whatwg.org/">https://urlpattern.spec.whatwg.org/</a>). Requires Chrome 149+. Silently detaches from targets with unallowed URLs upon connection, and blocks runtime requests (including navigations and subresources). Accepts an array of patterns.</p> 
  <ul> 
   <li><strong>Type:</strong> array</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--ignoreDefaultChromeArg</code>/ <code>--ignore-default-chrome-arg</code></strong> Explicitly disable default arguments for Chrome. Only applies when Chrome is launched by chrome-devtools-mcp.</p> 
  <ul> 
   <li><strong>Type:</strong> array</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryEmulation</code>/ <code>--category-emulation</code></strong> Set to false to exclude tools related to emulation.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>true</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryPerformance</code>/ <code>--category-performance</code></strong> Set to false to exclude tools related to performance.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>true</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryNetwork</code>/ <code>--category-network</code></strong> Set to false to exclude tools related to network.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>true</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryExtensions</code>/ <code>--category-extensions</code></strong> Set to true to include tools related to extensions. Note: This feature is currently only supported with a pipe connection. autoConnect, browserUrl, and wsEndpoint are not supported with this feature until 149 will be released.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryExperimentalThirdParty</code>/ <code>--category-experimental-third-party</code></strong> Set to true to enable third-party developer tools exposed by the inspected page itself</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--categoryPwa</code>/ <code>--category-pwa</code></strong> Set to true to include tools for automating Progressive Web Apps (install, launch, uninstall, and OS state). This feature is only supported with a pipe connection; autoConnect, browserUrl, and wsEndpoint are not supported.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--performanceCrux</code>/ <code>--performance-crux</code></strong> Set to false to disable sending URLs from performance traces to CrUX API to get field performance data.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>true</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--usageStatistics</code>/ <code>--usage-statistics</code></strong> Set to false to opt-out of usage statistics collection. Google collects usage data to improve the tool, handled under the Google Privacy Policy (<a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a>). This is independent from Chrome browser metrics. Disabled if <code>CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS</code> or <code>CI</code> env variables are set.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>true</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--screenshotFormat</code>/ <code>--screenshot-format</code></strong> Override the default output format used by take_screenshot when the caller does not specify one. JPEG and WebP are ~3-5x smaller than PNG, which helps reduce context size in AI conversations. Unset preserves the existing default ("png").</p> 
  <ul> 
   <li><strong>Type:</strong> string</li> 
   <li><strong>Choices:</strong> <code>jpeg</code>, <code>png</code>, <code>webp</code></li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--screenshotQuality</code>/ <code>--screenshot-quality</code></strong> Override the default compression quality (0-100) used by take_screenshot for JPEG and WebP when the caller does not specify one. Lower values mean smaller files. Ignored for PNG. Unset preserves the Puppeteer default.</p> 
  <ul> 
   <li><strong>Type:</strong> number</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--screenshotMaxWidth</code>/ <code>--screenshot-max-width</code></strong> Maximum width in pixels for screenshots. If the captured image is wider, it is downscaled (preserving aspect ratio) before being returned. Reduces context size in AI conversations. Unset means no resize.</p> 
  <ul> 
   <li><strong>Type:</strong> number</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--screenshotMaxHeight</code>/ <code>--screenshot-max-height</code></strong> Maximum height in pixels for screenshots. If the captured image is taller, it is downscaled (preserving aspect ratio) before being returned. Can be combined with --screenshot-max-width; the smaller scale factor wins. Unset means no resize.</p> 
  <ul> 
   <li><strong>Type:</strong> number</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--slim</code></strong> Exposes a "slim" set of 3 tools covering navigation, script execution and screenshots only. Useful for basic browser tasks.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--redactNetworkHeaders</code>/ <code>--redact-network-headers</code></strong> If true, redacts some of the network headers considered sensitive before returning to the client.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
 <li> <p><strong><code>--allowUnrestrictedPaths</code>/ <code>--allow-unrestricted-paths</code></strong> If set, disables the default path restriction that applies when the MCP client does not negotiate the roots capability. By default, file-writing tools are restricted to the OS temp directory when no roots are configured. Use this only when connecting a trusted local client that does not implement MCP roots and requires access to paths outside the temp directory.</p> 
  <ul> 
   <li><strong>Type:</strong> boolean</li> 
   <li><strong>Default:</strong> <code>false</code></li> 
  </ul> </li> 
</ul> 
<!-- END AUTO GENERATED OPTIONS --> 
<p>Pass them via the <code>args</code> property in the JSON configuration. For example:</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--channel=canary",
        "--headless=true",
        "--isolated=true"
      ]
    }
  }
}
</code></pre> 
<h3>Connecting via WebSocket with custom headers</h3> 
<p>You can connect directly to a Chrome WebSocket endpoint and include custom headers (e.g., for authentication):</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/&lt;id&gt;",
        "--wsHeaders={\"Authorization\":\"Bearer YOUR_TOKEN\"}"
      ]
    }
  }
}
</code></pre> 
<p>To get the WebSocket endpoint from a running Chrome instance, visit <code>http://127.0.0.1:9222/json/version</code> and look for the <code>webSocketDebuggerUrl</code> field.</p> 
<p>You can also run <code>npx chrome-devtools-mcp@latest --help</code> to see all available configuration options.</p> 
<h2>Concepts</h2> 
<h3>Concurrent sessions</h3> 
<p>Most MCP clients start one Chrome DevTools MCP server per conversation. By default, the server runs with <code>--pageIdRouting</code> enabled, making <code>pageId</code> a required parameter on page-scoped tools (such as <code>click</code>, <code>fill</code>, <code>navigate_page</code>, <code>take_snapshot</code>, etc.) so multiple agents or subagents sharing a server instance can route tool calls directly to the specific tab they are working with.</p> 
<p>For <code>evaluate_script</code>, <code>pageId</code> is required by default for targeting pages, but becomes optional when <code>--categoryExtensions</code> is enabled so that <code>serviceWorkerId</code> can be specified instead to evaluate inside an extension background service worker.</p> 
<p>To disable this behavior and default to the currently selected page, pass <code>--no-page-id-routing</code>.</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
</code></pre> 
<p>If you run multiple independent MCP client sessions and want each session to launch its own temporary Chrome profile, also pass <code>--isolated</code>. This avoids sharing the default Chrome DevTools MCP user data directory between those server instances.</p> 
<h3>User data directory</h3> 
<p>By default, <code>chrome-devtools-mcp</code> starts a Chrome's stable channel instance using the following user data directory:</p> 
<ul> 
 <li>Linux / macOS: <code>$HOME/.cache/chrome-devtools-mcp/chrome-profile</code></li> 
 <li>Windows: <code>%USERPROFILE%\.cache\chrome-devtools-mcp\chrome-profile</code></li> 
</ul> 
<p>For non-stable channels, the channel name is appended to the directory name, for example <code>chrome-profile-canary</code>.</p> 
<p>The user data directory is not cleared between runs and is reused for subsequent runs with the same channel. Only one browser can use it at a time. Set the <code>isolated</code> option to <code>true</code> to use a temporary user data directory instead which will be cleared automatically after the browser is closed.</p> 
<h3>Connecting to a running Chrome instance</h3> 
<p>By default, the Chrome DevTools MCP server will start a new Chrome instance with a dedicated profile. This might not be ideal in all situations:</p> 
<ul> 
 <li>If you would like to maintain the same application state when alternating between manual site testing and agent-driven testing.</li> 
 <li>When the MCP needs to sign into a website. Some accounts may prevent sign-in when the browser is controlled via WebDriver (the default launch mechanism for the Chrome DevTools MCP server).</li> 
 <li>If you're running your LLM inside a sandboxed environment, but you would like to connect to a Chrome instance that runs outside the sandbox.</li> 
</ul> 
<p>In these cases, start Chrome first and let the Chrome DevTools MCP server connect to it. There are two ways to do so:</p> 
<ul> 
 <li><strong>Automatic connection (available in Chrome 144)</strong>: best for sharing state between manual and agent-driven testing.</li> 
 <li><strong>Manual connection via remote debugging port</strong>: best when running inside a sandboxed environment.</li> 
</ul> 
<h4>Automatically connecting to a running Chrome instance</h4> 
<p><strong>Step 1:</strong> Set up remote debugging in Chrome</p> 
<p>In Chrome (&gt;= M144), do the following to set up remote debugging:</p> 
<ol> 
 <li>Navigate to <code>chrome://inspect/#remote-debugging</code> to enable remote debugging.</li> 
 <li>Follow the dialog UI to allow or disallow incoming debugging connections.</li> 
</ol> 
<p><strong>Step 2:</strong> Configure Chrome DevTools MCP server to automatically connect to a running Chrome Instance</p> 
<p>To connect the <code>chrome-devtools-mcp</code> server to the running Chrome instance, use <code>--autoConnect</code> command line argument for the MCP server.</p> 
<p>The following code snippet is an example configuration for gemini-cli:</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest", "--autoConnect"]
    }
  }
}
</code></pre> 
<p><strong>Step 3:</strong> Test your setup</p> 
<p>Make sure your browser is running. Open gemini-cli and run the following prompt:</p> 
<pre><code class="language-none">Check the performance of https://developers.chrome.com
</code></pre> 
<div class="markdown-alert markdown-alert-note">
 <p class="markdown-alert-title">
  <svg class="octicon octicon-info mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
   <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
  </svg>Note</p>
 <p>The <code>autoConnect</code> option requires the user to start Chrome. If the user has multiple active profiles, the MCP server will connect to the default profile (as determined by Chrome). The MCP server has access to all open windows for the selected profile.</p> 
</div> 
<p>The Chrome DevTools MCP server will try to connect to your running Chrome instance. It shows a dialog asking for user permission.</p> 
<p>Clicking <strong>Allow</strong> results in the Chrome DevTools MCP server opening <a href="http://developers.chrome.com">developers.chrome.com</a> and taking a performance trace.</p> 
<h4>Manual connection using port forwarding</h4> 
<p>You can connect to a running Chrome instance by using the <code>--browser-url</code> option. This is useful if you are running the MCP server in a sandboxed environment that does not allow starting a new Chrome instance.</p> 
<p>Here is a step-by-step guide on how to connect to a running Chrome instance:</p> 
<p><strong>Step 1: Configure the MCP client</strong></p> 
<p>Add the <code>--browser-url</code> option to your MCP client configuration. The value of this option should be the URL of the running Chrome instance. <code>http://127.0.0.1:9222</code> is a common default.</p> 
<pre><code class="language-json">{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
</code></pre> 
<p><strong>Step 2: Start the Chrome browser</strong></p> 
<div class="markdown-alert markdown-alert-warning">
 <p class="markdown-alert-title">
  <svg class="octicon octicon-alert mr-2" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
   <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
  </svg>Warning</p>
 <p>Enabling the remote debugging port opens up a debugging port on the running browser instance. Any application on your machine can connect to this port and control the browser. Make sure that you are not browsing any sensitive websites while the debugging port is open.</p> 
</div> 
<p>Start the Chrome browser with the remote debugging port enabled. Make sure to close any running Chrome instances before starting a new one with the debugging port enabled. The port number you choose must be the same as the one you specified in the <code>--browser-url</code> option in your MCP client configuration.</p> 
<p>For security reasons, <a href="https://developer.chrome.com/blog/remote-debugging-port">Chrome requires you to use a non-default user data directory</a> when enabling the remote debugging port. You can specify a custom directory using the <code>--user-data-dir</code> flag. This ensures that your regular browsing profile and data are not exposed to the debugging session.</p> 
<p><strong>macOS</strong></p> 
<pre><code class="language-bash">/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable
</code></pre> 
<p><strong>Linux</strong></p> 
<pre><code class="language-bash">/usr/bin/google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile-stable
</code></pre> 
<p><strong>Windows</strong></p> 
<pre><code class="language-bash">"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-profile-stable"
</code></pre> 
<p><strong>Step 3: Test your setup</strong></p> 
<p>After configuring the MCP client and starting the Chrome browser, you can test your setup by running a simple prompt in your MCP client:</p> 
<pre><code>Check the performance of https://developers.chrome.com
</code></pre> 
<p>Your MCP client should connect to the running Chrome instance and receive a performance report.</p> 
<p>If you hit VM-to-host port forwarding issues, see the “Remote debugging between virtual machine (VM) and host fails” section in <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/troubleshooting.md#remote-debugging-between-virtual-machine-vm-and-host-fails"><code>docs/troubleshooting.md</code></a>.</p> 
<p>For more details on remote debugging, see the <a href="https://developer.chrome.com/docs/devtools/remote-debugging/">Chrome DevTools documentation</a>.</p> 
<h3>Debugging Chrome on Android</h3> 
<p>Please consult <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/debugging-android.md">these instructions</a>.</p> 
<h2>Known limitations</h2> 
<p>See <a href="https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/troubleshooting.md">Troubleshooting</a>.</p> 
<h2>Integrating as a browser subagent</h2> 
<p>If you are developing agentic tooling and want to provide an integrated browser subagent as part of your product, we recommend building on top of Chrome DevTools for agents.</p> 
<p>For a reference implementation, see the <a href="https://geminicli.com/docs/core/subagents/#browser-agent">Gemini CLI browser agent documentation</a>.</p>