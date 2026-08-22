---
title: Make no assumptions.
tags:
- Irrational Exuberance (Will Larson)
category: leader/leadership
created: '2026-08-22'
source: https://lethain.com/make-no-assumptions/
type: rss
source_name: Irrational Exuberance (Will Larson)
source_url: https://lethain.com/feeds.xml
published: Sat, 11 Jul 2026 06:00:00 -0700
---

<p>I&rsquo;ve recently been thinking a lot about the concept of &ldquo;soil horizons&rdquo;,
which is the idea that there are many distinct layers of soil, from topsoil all the way down
to bedrock, which all combine into a soil horizon.
Translating this idea into software, the ideal codebase would have a single uniform
&ldquo;code layer&rdquo;, but a surprisingly large percentage of production software has numerous, distinct
code layers as the leading architect shifted over time.
I&rsquo;ve found this particularly true for software in problem-spaces with <a href="https://lethain.com/quality/">high essential complexity and low scale complexity</a>,
where the purifying challenges of scaling never create enough pressure
to compact disjoint layers into a unified layer.</p>
<p>Codebases with the most code layers tend to be created by small teams working on complex domains
over a long period of time. In many companies this might be an identity, permissions or payments team:
stuff that&rsquo;s permanently valuable, but usually not the central concern at any given time.
On such teams, there is often only one architect who understands the nuances of the domain well enough
to make tradeoffs. When that architect leaves, they are replaced by someone who aspires to operate
in the same code layer, but simply cannot because they lack enough context to do so.
As a result, that new replacement creates a new code layer, despite not intending to.
If the team runs through a handful of folks as the new team leads struggle, it&rsquo;s easy to
end up with a complex code horizon very quickly.</p>
<p><img alt="Software history framed as soil horizons." src="https://lethain.com/static/blog/2026/code_horizons.png" /></p>
<p>The problem of messy code horizons is not a new one, and the general approach
to addressing them is the same one I wrote about seven years ago in
<a href="https://lethain.com/reclaim-unreasonable-software/">Reclaim unreasonable software</a>,
but with the proliferation of coding and non-coding harnesses,
lately I&rsquo;m running into the problem of messy code horizons more frequently.
Even more concerning, I&rsquo;m seeing this problem expand from impacting code horizons into
impacting how organizations make decisions outside of software, e.g. the company&rsquo;s general reasoning horizons.
When individuals or teams rely on LLMs to reason to conclusions, rather than using LLMs to explore or draft options,
it&rsquo;s possible for even the most important decisions to be built on top of flawed reasoning layers underneath.</p>
<p>In the next section, I&rsquo;ll develop the problem statement a bit about what I&rsquo;m running into,
and then in the final section I&rsquo;ll lay out the approaches that I am finding (moderately) effective to navigate that problem.</p>
<h2 id="messy-reasoning-horizons">Messy reasoning horizons</h2>
<p>If you give three enthusiastic engineers a problem, a new codebase, a coding harness, and self-approval rights,
it&rsquo;s very easy to end up with three new soil horizons as their harnesses gleefully commit code.
However, in engineering we have a number of techniques to derisk this problem.
First, we have manual and automated code review, and second we increasingly have the
ability for the harnesses to operate off sufficiently clear instructions that they write new code
consistently with the existing code, even if the operator is unaware of what good looks like.
This is also true for code review, where coding harnesses
can drive consistency across pull requests even if the person (or harness) creating the pull requests
is not operating off the same shared context as the wider team.</p>
<p>Many codebases are not well-configured for this new reality, and those codebases are getting
worse at an accelerating rate as more harness and agent contributions get added.
Legacy codebases that reach a certain size before introducing these better practices are
<a href="https://lethain.com/revised-rules-of-engineering-leadership/">easier to fix than before</a>, but still require a lot
of work to fix.</p>
<p>That said, I&rsquo;m confident that coding harnesses are going to substantially
improve the quality of code horizons over the next year or two as the way we configure harnesses improves.
That&rsquo;s not the problem I&rsquo;m worried about.
What I&rsquo;m worried about is the application of harnesses to problems outside of writing software,
where there&rsquo;s no static typing, linting, or unit tests to validate the output.</p>
<p>Let me provide a very recent example from my own work that highlights this problem:
I wanted to understand how our incidents were trending over time.
So I pulled data via an MCP, and the analysis was unintuitive to me, in particular
I thought we were having more Data related incidents than the results reflected.
I had to look at the incidents in Slack, then the results in our incident tool,
and understand why the two conflicted. After a bit, I recognized the results in our incident tool
were only showing incidents that properly tagged a team when the alert was triggered, so it was omitting about half the relevant incidents.
After having the agent manually tag the incidents without team assignments, the data
made a lot more sense. After recognizing the issue, it was trivial to fix.
However, if I had simply accepted the initial analysis, I would have made
the perfectly wrong conclusion about what was happening. On top of that wrong conclusion,
I could have easily pushed the team to take on a project to solve an illusionary problem.</p>
<p>What&rsquo;s so pernicious about messy reasoning horizons, is once any reasoning layer is poisoned,
it&rsquo;s impossible to reason effectively on top of it. If you take the incident analysis example,
it&rsquo;s easy to imagine prioritizing the perfectly wrong set of remediations, which have the artifacts
of solid strategic reasoning, but are nonetheless just wrong.
It&rsquo;s easy to imagine a team wasting a quarter of time building a solution to this sort of problem
that never existed.</p>
<p>It&rsquo;s true that poor reasoning has always existed, long before harnesses, but my experience is that
poor reasoning wearing well-formatted clothing is proliferating more widely than I&rsquo;ve previously seen, and it is increasingly difficult to combat
because certain social norms are &ndash; at least temporarily &ndash; collapsing around folks actually thinking.
That collapse is largely driven by unprincipled adoption of AI techniques without paying attention to whether
they work. Widespread adoption is, in my opinion, the fundamental risk for most companies at the moment,
and something companies need to be doing, but many approaches inadvertently mix play (experimenting with something new in ways that are likely to fail!)
with production (creating load-bearing work product!) in ways that erode social norms for quality.</p>
<p>The norms are not uniformly collapsing by any means, they are <em>generally</em> intact, but even a small increase
in the proliferation of low quality reasoning layers has a devastating effect on your ability to reason
successfully. Especially true the further up the poor reasoning occurs (sloppy reasoning from senior leaders)
or when senior leaders rely on layers of reasoning without inspection (leaders who aren&rsquo;t sufficiently &ldquo;in the details&rdquo;
to spot likely reasoning errors in reasoning layers).</p>
<p>As a result, we now live in a world where accepting any part of the reasoning context before <a href="https://lethain.com/inspection/">inspecting</a>
it might lead to making a catastrophic mistake.
This is an exhausting way to live.</p>
<h2 id="make-no-assumptions">Make no assumptions</h2>
<p>Accepting that this is the world we live in, I wanted to lay out
the techniques that I am finding useful to deal with it.
Some of these are novel, but many of them are the same techniques I was
using before the LLM-advent:</p>
<ol>
<li>
<p><strong>Make no assumptions</strong>. When new hires join my team or my company,
the first thing I tell them is that it&rsquo;s essential that they &ldquo;make no assumptions.&rdquo;
This is difficult to do, and it goes against every instinct because it forces you to
inspect each aspect of how the company works and thinks, but I do think it&rsquo;s the necessary approach.
It&rsquo;s a bit like learning &ldquo;internet-skepticism&rdquo; at some point in your life, where you realize
that everything on the internet is self-motivated in some way, and you have to maintain a strict
filter on what ideas you accept.</p>
<p>This is a hard change to make, but I genuinely believe this is the correct mindset for accepting
new information in the current era. The combination of fewer management layers and more flawed
reasoning layers means that the core job of leadership is inspecting the details.</p>
</li>
<li>
<p><strong>The author must be the first human in the loop for their output.</strong> The biggest cultural failure with harnesses is when you can tell
that you&ndash;the recipient of a piece of work&ndash;are the first human in the loop reviewing it.
You must set a cultural norm that the creator of a piece of content is always the first human in the
loop before asking another human to review it.
If you fail to set that cultural expectation, then you will quickly crush the remaining team with a high
standard for quality reasoning, which will lead to a full destruction of your reasoning horizon.</p>
</li>
<li>
<p><strong>Prioritize reasonable software.</strong> Run the <a href="https://lethain.com/reclaim-unreasonable-software/">Reclaim unreasonable software</a> playbook,
recognizing that <a href="https://lethain.com/revised-rules-of-engineering-leadership/">migrations are cheap in 2026</a>,
so it&rsquo;s much faster to remediate gaps. The core idea here is that relying on convention doesn&rsquo;t work,
and instead you have to rely on deterministic decisioning for each approach.
For humans this can feel overly prescriptive, but harnesses don&rsquo;t care.</p>
</li>
<li>
<p><strong>Learn faster by separating play and production.</strong> Many folks trying to learn how to use harnesses and LLMs
leap directly into using them in their most critical work. This is a slow way to learn, and can lead to
substantial errors in your most critical work. It&rsquo;s much faster to work by buffering small pockets of time
to learn.</p>
<p>For example, our head of data has spent time building an iOS app fully &ldquo;hands off the keyboard&rdquo;
to get a better feel for the tools. This sort of experiment goes much faster and gives you more
repetitions in less time. The very practical version of this is setting aside a day or two periodically
for folks to experiment.</p>
</li>
<li>
<p><strong>Structure how you think with LLMs.</strong> In <em><a href="https://craftingengstrategy.com/">Crafting Engineering Strategy</a></em>,
I lay out a structured approach to reasoning through creating a strategy document, which aims to prevent the
reasoning errors that folks make in their thinking.
This applies equally in how we use LLMs, and I think you can substantially reduce the chance of introducing
flawed reasoning layers by focusing LLM work on
<a href="https://craftingengstrategy.com/strategy-steps/">exploration</a> (gathering information on internet and via various MCPs),
<a href="https://craftingengstrategy.com/refinement-intro/">refinement</a> (presenting gathered information effectively),
and a final formatting pass.
That takes much of the work out of strategy creation while constraining the areas you have to avoid
making any assumptions about its output.</p>
</li>
</ol>
<p>I&rsquo;m certain there are more things! What are you trying?</p>