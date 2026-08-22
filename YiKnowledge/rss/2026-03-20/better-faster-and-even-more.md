---
title: Better, Faster, and (Even) More
tags:
- Rands in Repose
category: leader/leadership
created: '2026-08-22'
source: https://randsinrepose.com/archives/better-faster-and-even-more/
type: rss
source_name: Rands in Repose
source_url: https://randsinrepose.com/feed/
published: Fri, 20 Mar 2026 22:30:18 +0000
author: rands
---

<p><img alt="Better, Faster, and (Even) More" class="webfeedsFeaturedVisual" height="418" src="https://randsinrepose.com/wp-content/uploads/2026/03/betterfastermore-2.jpg" width="800" /></p>
<p class="wp-block-paragraph">I&#8217;ve never built more interesting, random, and useless scripts, tools, and services than I have in the last six months. The cost to go from &#8220;Random Thought&#8221; to &#8220;Working Something&#8221; has never been lower thanks to <a href="https://code.claude.com/docs/en/overview">Claude Code</a>. However, this increase in speed has only made my desire to move faster and more efficiently higher.</p>



<p class="wp-block-paragraph">The following is a set of tools and practices I&#8217;ve gathered over the last 90 days, which continue to accelerate my process and give me daily joy.</p>



<h2 class="wp-block-heading">How I Organize</h2>



<p class="wp-block-paragraph">Everything lives under <code>~/Projects/</code>. Each project is its own git repo with its own <code>CLAUDE.md</code> (project-specific instructions) and <code>WORKLOG.md</code> (session history). Three repos do special duty:</p>



<ul class="wp-block-list">
<li><strong><code>dotfiles</code></strong> — Machine configuration. Shell config, terminal config, Claude Code settings, skills, and status line script all live here and get symlinked to where the system expects them (<code>~/.zshrc</code>, <code>~/.claude/settings.json</code>, <code>~/.config/ghostty/config</code>, etc.). Checked into git so every machine stays in sync with a pull.</li>



<li><strong><code>credentials</code></strong> — A private repo for API keys and secrets, kept separate from project code.</li>



<li><strong><code>scripts</code></strong> — Standalone CLI tools added to PATH. Things like <code>fresh</code> (repo health checker), <code>gpush</code> (one-command commit and push), and <code>ghostty-font</code> (font switcher).</li>
</ul>



<p class="wp-block-paragraph">Every project gets two files: <code>CLAUDE.md</code> and <code>WORKLOG.md</code>. <code>CLAUDE.md</code> is instructions and reference — how to build, deploy, what patterns to follow, where things live. It rarely changes. <code>WORKLOG.md</code> is the session diary. Every time Claude and I work on a project, it logs what we investigated, what changed, what we decided, and why. When I come back days or weeks later, Claude reads the worklog and picks up where we left off instead of starting cold.</p>



<h2 class="wp-block-heading">Copy to Clipboard</h2>



<p class="wp-block-paragraph">Claude generates a lot of stuff that I cut and paste, but the initial problem was that copying from <a href="https://ghostty.org/">Ghostty</a> included unavoidable leading spaces on output. The fix? Have Claude paste text straight to the clipboard via macOS <code>pbcopy</code><sup><a class="footnote-link footnote-identifier-link" href="https://randsinrepose.com/archives/better-faster-and-even-more/#footnote_1_5494" id="identifier_1_5494" title="Windows equivalent: clip, e.g., echo hello | clip">1</a></sup>. Also, depending on where I am posting (mail, Slack, messages), I have Claude format appropriately before pasting<sup><a class="footnote-link footnote-identifier-link" href="https://randsinrepose.com/archives/better-faster-and-even-more/#footnote_2_5494" id="identifier_2_5494" title="Also, I have since learned there is a /copy command in Claude">2</a></sup>.</p>



<h2 class="wp-block-heading">Screenshot to Clipboard</h2>



<p class="wp-block-paragraph">It is often much faster to just dump a screenshot into Claude Code rather than describe the issue. I used to grab a screenshot and then cut and paste it from my Documents directory. Too slow. F12 grabs a region of the screen and puts it on the clipboard so I can paste. Configured in macOS System Settings &gt; Keyboard &gt; Shortcuts<sup><a class="footnote-link footnote-identifier-link" href="https://randsinrepose.com/archives/better-faster-and-even-more/#footnote_3_5494" id="identifier_3_5494" title="On Windows: Win+Shift+S opens the Snipping Tool for region capture to clipboard.">3</a></sup>.</p>



<h2 class="wp-block-heading">Check My Setup</h2>



<p class="wp-block-paragraph">I move between three machines a lot, and given that the state of the art is changing, well, daily, a day working on one machine means that my local config has improved THAT DAY, which means when I move to a new machine, I want to update the setup.</p>



<p class="wp-block-paragraph">I have a single script that validates my entire Mac setup. Checks 30+ items across categories: core tools (Homebrew, Python, Node, <a href="https://ghostty.org/">Ghostty</a>, Claude Code), shell config (zsh default, oh-my-zsh), symlinks (.zshrc, .gitconfig, Ghostty config), SSH (key, agent, keychain), credentials, and coding fonts. Reports green/yellow/red per item. When things are missing, prints fix commands in dependency order — SSH before git config, Homebrew before everything that needs <code>brew install</code>.</p>



<div class="wp-block-kevinbatdorf-code-block-pro padding-bottom-disabled"><span><svg height="14" viewBox="0 0 54 14" width="54" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(1 1)"><circle cx="6" cy="6" fill="#e1e4e833" r="6" stroke="#e1e4e84d" stroke-width=".5"></circle><circle cx="26" cy="6" fill="#e1e4e833" r="6" stroke="#e1e4e84d" stroke-width=".5"></circle><circle cx="46" cy="6" fill="#e1e4e833" r="6" stroke="#e1e4e84d" stroke-width=".5"></circle></g></svg></span><span class="code-block-pro-copy-button" style="color: #e1e4e8; display: none;" tabindex="0"><pre class="code-block-pro-copy-button-pre"><textarea class="code-block-pro-copy-button-textarea" readonly="readonly" tabindex="-1"># This is an example
# Check Claude Code global settings.json

if &#91; -f "$HOME/.claude/settings.json" &#93;; then
    settings_issues=""
    if ! grep -q "alwaysThinkingEnabled.*true" "$HOME/.claude/settings.json"; then
        settings_issues="thinking"
    fi
    if ! grep -q "statusLine" "$HOME/.claude/settings.json"; then
        settings_issues="${settings_issues:+$settings_issues, }statusLine"
    fi

    if &#91; -z "$settings_issues" &#93;; then
        print_row "Claude Code settings" "${GREEN}✓ Configured${NC}" "Thinking + status line enabled"
    else
        print_row "Claude Code settings" "${YELLOW}&#x26a0; Incomplete${NC}" "Missing: $settings_issues"
        missing_items+=("claude-settings")
    fi
else
    print_row "Claude Code settings" "${RED}✗ Missing${NC}" "~/.claude/settings.json"
    missing_items+=("claude-settings")
fi</textarea></pre><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path class="with-check" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"></path><path class="without-check" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span><pre class="shiki github-dark" style="background-color: #24292e;" tabindex="0"><code><span class="line"><span style="color: #6A737D;"># This is an example</span></span>
<span class="line"><span style="color: #6A737D;"># Check Claude Code global settings.json</span></span>
<span class="line"></span>
<span class="line"><span style="color: #F97583;">if</span><span style="color: #E1E4E8;"> &#91; </span><span style="color: #F97583;">-f</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;</span><span style="color: #E1E4E8;">$HOME</span><span style="color: #9ECBFF;">/.claude/settings.json&quot;</span><span style="color: #E1E4E8;"> &#93;; </span><span style="color: #F97583;">then</span></span>
<span class="line"><span style="color: #E1E4E8;">    settings_issues</span><span style="color: #F97583;">=</span><span style="color: #9ECBFF;">&quot;&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">if</span><span style="color: #E1E4E8;"> </span><span style="color: #F97583;">!</span><span style="color: #E1E4E8;"> </span><span style="color: #B392F0;">grep</span><span style="color: #E1E4E8;"> </span><span style="color: #79B8FF;">-q</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;alwaysThinkingEnabled.*true&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;</span><span style="color: #E1E4E8;">$HOME</span><span style="color: #9ECBFF;">/.claude/settings.json&quot;</span><span style="color: #E1E4E8;">; </span><span style="color: #F97583;">then</span></span>
<span class="line"><span style="color: #E1E4E8;">        settings_issues</span><span style="color: #F97583;">=</span><span style="color: #9ECBFF;">&quot;thinking&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">fi</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">if</span><span style="color: #E1E4E8;"> </span><span style="color: #F97583;">!</span><span style="color: #E1E4E8;"> </span><span style="color: #B392F0;">grep</span><span style="color: #E1E4E8;"> </span><span style="color: #79B8FF;">-q</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;statusLine&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;</span><span style="color: #E1E4E8;">$HOME</span><span style="color: #9ECBFF;">/.claude/settings.json&quot;</span><span style="color: #E1E4E8;">; </span><span style="color: #F97583;">then</span></span>
<span class="line"><span style="color: #E1E4E8;">        settings_issues</span><span style="color: #F97583;">=</span><span style="color: #9ECBFF;">&quot;${</span><span style="color: #E1E4E8;">settings_issues</span><span style="color: #F97583;">:</span><span style="color: #9ECBFF;">+</span><span style="color: #E1E4E8;">$settings_issues</span><span style="color: #9ECBFF;">, }statusLine&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">fi</span></span>
<span class="line"></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">if</span><span style="color: #E1E4E8;"> &#91; </span><span style="color: #F97583;">-z</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;</span><span style="color: #E1E4E8;">$settings_issues</span><span style="color: #9ECBFF;">&quot;</span><span style="color: #E1E4E8;"> &#93;; </span><span style="color: #F97583;">then</span></span>
<span class="line"><span style="color: #E1E4E8;">        </span><span style="color: #B392F0;">print_row</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;Claude Code settings&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;${</span><span style="color: #E1E4E8;">GREEN</span><span style="color: #9ECBFF;">}✓ Configured${</span><span style="color: #E1E4E8;">NC</span><span style="color: #9ECBFF;">}&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;Thinking + status line enabled&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">else</span></span>
<span class="line"><span style="color: #E1E4E8;">        </span><span style="color: #B392F0;">print_row</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;Claude Code settings&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;${</span><span style="color: #E1E4E8;">YELLOW</span><span style="color: #9ECBFF;">}&#x26a0; Incomplete${</span><span style="color: #E1E4E8;">NC</span><span style="color: #9ECBFF;">}&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;Missing: </span><span style="color: #E1E4E8;">$settings_issues</span><span style="color: #9ECBFF;">&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">        missing_items</span><span style="color: #F97583;">+=</span><span style="color: #E1E4E8;">(</span><span style="color: #9ECBFF;">&quot;claude-settings&quot;</span><span style="color: #E1E4E8;">)</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #F97583;">fi</span></span>
<span class="line"><span style="color: #F97583;">else</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #B392F0;">print_row</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;Claude Code settings&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;${</span><span style="color: #E1E4E8;">RED</span><span style="color: #9ECBFF;">}✗ Missing${</span><span style="color: #E1E4E8;">NC</span><span style="color: #9ECBFF;">}&quot;</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;~/.claude/settings.json&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    missing_items</span><span style="color: #F97583;">+=</span><span style="color: #E1E4E8;">(</span><span style="color: #9ECBFF;">&quot;claude-settings&quot;</span><span style="color: #E1E4E8;">)</span></span>
<span class="line"><span style="color: #F97583;">fi</span></span></code></pre><span style="display: flex; padding: 10px; width: 100%; background-color: #24292e; color: #d3d7dd; font-size: 12px; line-height: 1;">Bash</span></div>



<h2 class="wp-block-heading">Uncommitted Changes / Or Fresh</h2>



<p class="wp-block-paragraph">I have an <a href="https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git">oh-my-zsh git plugin</a> with the <a href="https://github.com/ohmyzsh/ohmyzsh/blob/master/themes/robbyrussell.zsh-theme">robbyrussell</a> theme. The prompt shows a yellow <code>✗</code> when the working tree has uncommitted changes. No custom config — it&#8217;s the default behavior of that theme&#8217;s <code>git_prompt_status</code> function.</p>



<p class="wp-block-paragraph">For times when I forget, I have a script called Fresh that walks through my entire Project directory and reports uncommitted changes, unpushed commits, and stale repos across all projects. One command to answer: &#8220;Did I forget to push something before switching machines?&#8221;</p>



<h2 class="wp-block-heading">Memories vs. Skills vs. Hooks</h2>



<p class="wp-block-paragraph"><strong>Memories</strong> (<code>~/.claude/projects/&lt;project&gt;/memory/</code>): Persistent notes Claude saves between sessions per project. Things like &#8220;this user prefers terse responses&#8221; or &#8220;the auth rewrite is driven by compliance, not tech debt.&#8221; Claude reads them at the start of each conversation to pick up context that it would otherwise lose. They&#8217;re markdown files with frontmatter (type, description) indexed by a <code>MEMORY.md</code> file. Types: user preferences, feedback/corrections, project context, external references. Checked in alongside my project, and by far the largest timesaver for building context.</p>



<p class="wp-block-paragraph"><strong>Skills</strong> (<code>~/.claude/skills/&lt;name&gt;/SKILL.md</code>): Reusable prompt templates invoked with <code>/skillname</code>. A skill defines a multi-step procedure Claude follows — like a macro. Example: <code>/floyd</code> loads a voice definition file, then rewrites whatever content I have in that voice. Skills don&#8217;t execute code themselves; they inject instructions into the conversation that Claude follows. I have skills for blog posts, podcasts, recurring expenses, and a lot more.</p>



<p class="wp-block-paragraph"><strong>Hooks</strong> (<code>settings.json</code> → <code>"hooks"</code>): Shell commands that fire automatically on Claude Code events like tool use or end of response. I don&#8217;t use them yet, but they&#8217;re there for automation — things like running a linter after every file edit or logging tool usage.</p>



<h2 class="wp-block-heading">Statusline</h2>



<p class="wp-block-paragraph">Claude Code has a configurable status line at the bottom of the terminal. Mine runs a bash script that renders three lines of live data:</p>



<figure class="wp-block-image size-large"><a href="https://randsinrepose.com/wp-content/uploads/2026/03/partial-footer.png"><img alt="" class="wp-image-5497" height="117" src="https://randsinrepose.com/wp-content/uploads/2026/03/partial-footer-1024x117.png" width="1024" /></a></figure>



<p class="wp-block-paragraph">The rate limit data comes from Anthropic&#8217;s usage API, authenticated via an OAuth token pulled from the macOS Keychain. It caches the response for 60 seconds, so it doesn&#8217;t slow down every render<sup><a class="footnote-link footnote-identifier-link" href="https://randsinrepose.com/archives/better-faster-and-even-more/#footnote_4_5494" id="identifier_4_5494" title="Currently rocking the IBM Plex Mono &mdash; more on this shortly">4</a></sup>.</p>



<h2 class="wp-block-heading">Ghostty Tab Title</h2>



<p class="wp-block-paragraph">I&#8217;m usually working on several projects at once, so at-a-glance tabs are essential. I have a <code>claude()</code> wrapper in <code>.zshrc</code>:</p>



<div class="wp-block-kevinbatdorf-code-block-pro padding-bottom-disabled"><span><svg height="14" viewBox="0 0 54 14" width="54" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(1 1)"><circle cx="6" cy="6" fill="#FF5F56" r="6" stroke="#E0443E" stroke-width=".5"></circle><circle cx="26" cy="6" fill="#FFBD2E" r="6" stroke="#DEA123" stroke-width=".5"></circle><circle cx="46" cy="6" fill="#27C93F" r="6" stroke="#1AAB29" stroke-width=".5"></circle></g></svg></span><span class="code-block-pro-copy-button" style="color: #e1e4e8; display: none;" tabindex="0"><pre class="code-block-pro-copy-button-pre"><textarea class="code-block-pro-copy-button-textarea" readonly="readonly" tabindex="-1">claude() {
    printf '\033]0;Claude: %s\007' "${PWD##*/}"
    CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1 command claude "$@"
    printf '\033]0;%s\007' "${PWD##*/}"
}</textarea></pre><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path class="with-check" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"></path><path class="without-check" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span><pre class="shiki github-dark" style="background-color: #24292e;" tabindex="0"><code><span class="line"><span style="color: #B392F0;">claude</span><span style="color: #E1E4E8;">() {</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #79B8FF;">printf</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">'\033]0;Claude: %s\007'</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;${</span><span style="color: #E1E4E8;">PWD</span><span style="color: #F97583;">##*/</span><span style="color: #9ECBFF;">}&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    CLAUDE_CODE_DISABLE_TERMINAL_TITLE</span><span style="color: #F97583;">=</span><span style="color: #79B8FF;">1</span><span style="color: #E1E4E8;"> </span><span style="color: #79B8FF;">command</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">claude</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;</span><span style="color: #79B8FF;">$@</span><span style="color: #9ECBFF;">&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">    </span><span style="color: #79B8FF;">printf</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">'\033]0;%s\007'</span><span style="color: #E1E4E8;"> </span><span style="color: #9ECBFF;">&quot;${</span><span style="color: #E1E4E8;">PWD</span><span style="color: #F97583;">##*/</span><span style="color: #9ECBFF;">}&quot;</span></span>
<span class="line"><span style="color: #E1E4E8;">}</span></span></code></pre><span style="display: flex; padding: 10px; width: 100%; background-color: #24292e; color: #d3d7dd; font-size: 12px; line-height: 1;">Bash</span></div>



<p class="wp-block-paragraph"></p>



<p class="wp-block-paragraph">Sets the <a href="https://ghostty.org/">Ghostty</a> tab title to &#8220;Claude: projectname&#8221; when Claude starts, suppresses Claude&#8217;s own title management via the env var, and restores the tab to just the project name on exit.</p>



<p class="wp-block-paragraph">I&#8217;ve written this up entirely because I am certain others have found equally satisfying improvements, and I want to know what they are.</p>



<p class="wp-block-paragraph"><strong>UPDATE: Tips from Readers</strong></p>



<p class="wp-block-paragraph">Since publishing, readers have shared helpful tips that I&#8217;ve incorporated into my workflow:</p>



<p class="wp-block-paragraph"><strong>Per-project terminal colors.</strong> Most modern terminals let you set background colors per profile or directory. I now have different colors for different projects — green for one, blue for another. It sounds minor, but it&#8217;s a surprisingly effective context signal when you&#8217;re bouncing between windows. </p>



<p class="wp-block-paragraph"><strong>Tuning tool permissions.</strong> Claude Code asks permission before running shell commands, which is safe but slow. I had Claude review the commands I run regularly, filter out anything destructive, and approve the rest in the project&#8217;s <code>.claude/settings.json</code>. Game-changer — sessions move noticeably faster when you&#8217;re not clicking &#8220;Allow&#8221; every few seconds.</p>



<p class="wp-block-paragraph"><strong><code>/copy</code> for grabbing output.</strong> The <code>/copy</code> slash command copies Claude&#8217;s last response directly to your clipboard. Cleaner than selecting and copying manually, especially for long responses.</p>



<p class="wp-block-paragraph"><strong>Worklog trimming.</strong> I wrote a persistent instruction that tells Claude how to compress my worklog files. The rule: delete anything recoverable from git history or the current code, condense old completed work, but keep open questions, key decisions, and active experiments. This keeps the context window focused on what actually matters rather than filling it with stale history.</p>
<ol class="footnotes"><li class="footnote" id="footnote_1_5494">Windows equivalent: clip, e.g., <code>echo hello | clip</code></li><li class="footnote" id="footnote_2_5494">Also, I have since learned there is a <code>/copy</code> command in Claude</li><li class="footnote" id="footnote_3_5494">On Windows: <code>Win+Shift+S</code> opens the Snipping Tool for region capture to clipboard.</li><li class="footnote" id="footnote_4_5494">Currently rocking the <a href="https://www.ibm.com/plex/">IBM Plex Mono</a> &#8212; more on this shortly</li></ol>