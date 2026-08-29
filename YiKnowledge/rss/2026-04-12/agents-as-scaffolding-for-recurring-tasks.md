---
title: Agents as scaffolding for recurring tasks.
tags:
- Irrational Exuberance (Will Larson)
category: leader/leadership
created: '2026-08-29'
source: https://lethain.com/agents-as-scaffolding/
type: rss
source_name: Irrational Exuberance (Will Larson)
source_url: https://lethain.com/feeds.xml
published: Sun, 12 Apr 2026 10:00:00 -0700
---

<p>One of my gifts/curses is an endless fixation with how processes can be optimized.
For a brief moment early in my career, that was focused on improving how humans collaborate,
but that quickly switched to figuring out how we can minimize human involvement, and eliminate
human-to-human handoffs as much as possible.
Lately, every time I perform a recurring task&ndash;or see someone else perform one&ndash;I think about
how we might eliminate the human&rsquo;s involvement entirely by introducing agents.
This both has worked well, but also worked poorly, and I wanted to highlight the pattern
I&rsquo;ve found useful.</p>
<p>For a concrete example, a problem that all software companies have is patching security vulnerabilities.
We have that problem too, and I check our security dashboards periodically to ensure nothing has gone awry.
Sometimes when I check that dashboard, I&rsquo;ll notice a finding that&rsquo;s precariously close to our resolution SLAs,
and either fix it myself or track down the appropriate team to fix it.
However, this feels like a process that shouldn&rsquo;t require me checking on it.</p>
<p>Five to six months ago, I added Github Dependabot webhooks as an input into our internal agent framework.
Then I set up an agent to handle those webhooks, including filtering incoming messages down to the highest priority issues.
About a month ago, when I upgraded from GPT 4.1 to GPT 5.4 with high reasoning, I noticed that it got
quite good at using the Github MCP to determine the appropriate owners for a given issue, using the same variety
of techniques that a human would use: looking at Codeowners files where available, looking at recent commits on
the repository, and so on. The alerts and owners were already getting piped into a Slack channel.</p>
<p>So, this worked! However, it didn&rsquo;t actually work that well, because despite repeated iteration on the prompt,
including numerous <code>CRITICAL: you must...</code> statements, it simply could not reliably restrict itself to <code>critical</code>
severity alerts. It would also include some <code>high</code> severity alerts, and even the occasional <code>medium</code> severity alert.
This is a recurring issue with using agents as drop-in software replacement: they simply are not perfect, and interrupting
your colleagues requires a level of near-perfection.</p>
<p>If I&rsquo;d hired someone on our Security team to notify teams about critical alerts, and they occasionally flagged non-critical alerts,
eventually someone would pop into my DMs to ask me what was going wrong. That didn&rsquo;t happen here, because the knowledge that those DMs
would show up prevented me from rolling the notifications out more aggressively.
Coding agents address this sort of issue by running tests, typechecking, or linting, but less structured tasks
are either harder or more expensive to verify. For example, I could have added an eval verifying messages didn&rsquo;t mention medium or high
severity tasks before allowing it to send to Slack, but I found that somewhat unsatisfying despite knowing that it would work.</p>
<p>Instead, after some procrastination on other tasks, I finally prompted Claude to update this agent to rely on
a <a href="https://lethain.com/agents-coordinators/">code-driven workflow</a> where flow-control is managed by software by default, and only
cedes control to an agent where ideal.
That workflow looks like:</p>
<ol>
<li>A webhook comes in from Dependabot</li>
<li>Script extracts the severity and action (e.g. is it a new issue versus a resolved issue),
and filters out low priority or non-actionable webhooks</li>
<li>The code packages the metadata into a list of issues and repositories</li>
<li>The code passes each repository-scoped bundle to an agent with our internal ownership skill and
the Github MCP to determine appropriate folks to notify for each issue</li>
<li>The issues and ownership data are passed to a second agent that formats them
as a Slack message</li>
</ol>
<p>This works 100% of the time, while still allowing us to rely on our internal ownership skill to
determine the most likely teams or individuals to notify for a given problem.
It&rsquo;s now something I can rollout more aggressively.</p>
<p>The immediate fast follow was a weekly follow-up ping for open critical issues,
relying on the same split of deterministic and agentic behaviors.
The next improvement will be automating the generation of the vulnerability fixes,
such that the human involvement is just reviewing the change before it automatically
deploys.
(We <a href="https://lethain.com/dependabot-auto-merge/">already do this for Dependabot generated PRs</a>,
but in my experience Dependabot can solve a reasonable subset of identified issues,
but far from all of them.)</p>
<p>That is the pattern that I&rsquo;ve found effective:</p>
<ol>
<li>Prototype with agent-driven workflow until I get a feel for the workflow and what&rsquo;s difficult about it</li>
<li>Refactor agent-driven control away, increasingly relying on code-driven workflow for more and more of the solution</li>
<li>End with a version that narrowly relies on agents for their strengths (navigating ambiguous problems like identifying code owners)</li>
</ol>
<p>This has worked well for pretty much every problem I&rsquo;ve encountered. The end-result is faster, cheaper, and more maintainable.
It&rsquo;s also a cheap transition, generally I can take logs of some recent runs, the agent&rsquo;s prompt, and some brief instructions,
throw them into Codex/Claude, and get a working replacement in a few minutes.</p>