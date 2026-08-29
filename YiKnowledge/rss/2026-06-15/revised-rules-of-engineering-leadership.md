---
title: Revised rules of engineering leadership.
tags:
- Irrational Exuberance (Will Larson)
category: leader/leadership
created: '2026-08-29'
source: https://lethain.com/revised-rules-of-engineering-leadership/
type: rss
source_name: Irrational Exuberance (Will Larson)
source_url: https://lethain.com/feeds.xml
published: Mon, 15 Jun 2026 06:00:00 -0700
---

<p>From early 2014 through late 2020, I was working in <a href="https://lethain.com/productivity-in-the-age-of-hypergrowth/">hypergrowth</a> environments,
which are challenging, but also educational. The most valuable feature of hypergrowth is that
your mistakes reveal themselves next month rather than next year, because things go wrong very loudly when you&rsquo;re moving fast.
I&rsquo;ve been thinking a lot about hypergrowth recently, because Imprint&rsquo;s business is growing quickly and we did a large batch
of hiring last year, but also because the AI-tooling shift has changed the pace at which it&rsquo;s possible to work.</p>
<p>This post documents the new rules I&rsquo;ve revised my approach to engineering leadership around,
and then talks through the specific projects I&rsquo;ve worked on over the past year that caused
me to believe in these rules.</p>
<h2 id="revised-rules">Revised rules</h2>
<ol>
<li>
<p><strong><a href="https://lethain.com/migrations/">Migrations</a> can be done by an individual rather than a team.</strong>
Even complex, large changes can be 95% owned by the driving individual or team, and done in 10% of the time.
As the initial cost of migrations goes down, the reward/penalty of each migration&rsquo;s quality goes up:
even small sharp edges will break your colleagues&rsquo; mental models about the software you co-maintain.
The impact of individual judgment on your company has never been higher.</p>
</li>
<li>
<p><strong>While 1st-pass code is nearly free, the cost of working code depends on your development harness, and is not free.</strong>
We&rsquo;re in an era when many companies say that <em>everyone</em> should be writing code, however our experience
is that writing code that works well, while avoiding messy edgecases, remains difficult.
Just how difficult remains a factor of your development harness, e.g. your tests, CI/CD,
validation environments, preview-ability of changes, and so on.
While I personally don&rsquo;t imagine it&rsquo;s valuable for most folks at a company to be contributing code,
I suspect that most disagreement about that topic is actually a miscommunication:
even at a company where &ldquo;everyone codes&rdquo;, the marketing team isn&rsquo;t reducing allocations in your servers,
instead it&rsquo;s about whether there is a safe boundary where they <em>can</em> participate.
(Much like a SaaS product that allows customization by writing software.)</p>
<p>The good news is that this means the things that were most valuable to speed up engineering two years ago
are still the things that are most valuable to speed them up today.</p>
</li>
<li>
<p><strong>Optimize the base-case of process for agents.</strong>
Most steps of most processes can be fully automated in most cases.
With the right harnesses, the right controls, domain context, and good judgment in their designers,
you can fully automate the base-case of most processes
in modern technology companies. For example, the base case of code review from a human
is slower and less effective than a good harness&rsquo; code review.
Of course, the harness will miss things, but so will human reviewers, and most areas
are relatively safe to make changes. Of course, there are some higher risk areas, where
this doesn&rsquo;t hold true.
By effectively capturing these distinctions properly, we can go much faster without
introducing risk. By failing to capture these distinctions, we&rsquo;ll create innumerable problems
for ourselves.</p>
<p>As a corollary, I think most planning processes like weekly or bi-weekly sprints are operating at
too low an altitude. Humans planning together still matters, but should be operating at a higher level.</p>
</li>
<li>
<p><strong>Durable, high-ownership teams with domain-context are even more important.</strong>
One of my biggest lessons at Uber was that <a href="https://lethain.com/durably-excellent-teams/">persistent, durable teams work magic</a>
by accumulating domain-context, building a sense of camaraderie, and feeling an increasingly strong sense
of ownership over an area as they continue to work in it.
Even in an era where specifically doing something is much cheaper, you still have to do <a href="https://lethain.com/judgment-is-all-you-need/">the right thing</a>,
which has gotten a bit easier but not much easier, and structural improvements help address this.
(As a recent example of that, we had an issue in production where the necessary data to optimize it simply wasn&rsquo;t being
captured at all, so the harness&rsquo; ideas to solve it were reasonable but wrong, since the only real path forward was
instrumenting the missing information.)</p>
<p>As a specific disagreement, there&rsquo;s a prevailing idea that AI-first companies will be run by a small number of
genius engineers who create perfect versions of things one by one, doing such a good job that there&rsquo;s nothing
to maintain. This is a very compelling vision, but I don&rsquo;t see it happening. High judgment individuals <em>can</em>
wander across a company doing remarkable things, but at some point they do get hemmed in by lack of domain context,
which is why durable teams are the fundamental building block, even in this era.</p>
</li>
<li>
<p><strong>Quick, good, and durable decision-making is a prerequisite to meaningfully benefit from AI.</strong>
Being able to replace a legal review with automation only works if Legal can commit to that change,
which depends on designing the automation thoughtfully, and also the teams&rsquo; willingness to collaborate.
Implementing a new feature is only valuable if you can decide to launch that feature.</p>
<p>Your team and company can only benefit from this increased pace of execution if you can make durable decisions
quickly, and those decisions are good. This is the primary reason, in my opinion, why the average CTO role has
necessarily become substantially more technical and less bureaucratic than a year ago.
In many cases, I am the only person who can make binding decisions when teams disagree on the path forward,
and that means I am making decisions constantly in this new world in order to maintain the pace.
(That&rsquo;s not an argument that executives are better decision makers, just that binding executive decisions
are uniquely powerful to the extent that the executives themselves are aligned enough to honor those decisions.)</p>
</li>
</ol>
<h2 id="what-have-we-done-in-practice">What have we done in practice</h2>
<p>So, I genuinely believe the above rules based on my experiences over the past year, and let me try to
connect them to specific projects we&rsquo;ve worked on that have convinced me of them:</p>
<ol>
<li><strong>Migrations</strong>
<ol>
<li>A year ago, we deployed manually, and deployed ~6 times a week, and now we deploy 200-400 times a week.
Our engineering headcount has doubled, but even if we double the prior deploys, we&rsquo;re still up 20-30x year-over-year.
This is due to a complete overhaul of how we deploy and run migrations, and this migration was done over two months and done 90% by
two folks on our infrastructure team.</li>
<li>The first day of January, about 25% of folks on our team used Claude Code or Cursor every day. By the end of February, 100% did.
We did this without any top-down mandate, just by making the tooling good and chatting with non-adopters to remove sources of friction.
Pretty much every PR is written by harnesses now, at least in the first pass.</li>
<li>We migrated from a large number of varied configuration mechanisms to two configuration mechanisms (one for client or server constants that rarely change,
a second for product-specific or frequently changing values). This was a large series of changes, which were largely done
as a series of isolated projects by individual engineers. First, one engineer cleaned up the architecture to support this approach.
Then another engineer did a reference architecture on the new approach. Then several more engineers followed the reference architecture
in other areas of our codebase. This might have been a years long project of many people in the prior world, but took less than a quarter
to complete, including a new internal tool for managing these values across engineering and non-engineer teams.</li>
<li>We unified a multi-repo frontend application architecture into a mono-repo frontend architecture over about a month.
This was 95% driven by one frontend engineer. We now have a shared frontend development harness, can maintain libraries cheaply,
and entirely moved off using <code>npm</code> for package hosting, which was a source of ongoing friction.</li>
<li>We fully statically typed our frontend code, going from a place where the majority of our frontend code was not typed.
This was done by one engineer, and a lot of tokens, over the course of a few weeks.</li>
<li>We migrated from <code>npm</code> to <code>pnpm</code> for better security defaults and faster deploys.
This took one engineer a few hours a day for a few days.</li>
</ol>
</li>
<li><strong>Cost of working code depends on your development harness.</strong>
<ol>
<li>Where we&rsquo;ve tried to throw design documents and PRs &ldquo;over the wall&rdquo; to engineers on other teams, they&rsquo;ve never gone anywhere.
Slop pull requests and design documents are cheap, but are actively harmful. They not only have to be cleaned up and repaired,
their context poisons the LLM, leading to worse outcomes than starting over.</li>
<li>We&rsquo;ve seen tremendous success in managers contributing software, as long as those managers are validating the work directly,
looking at dashboards after their changes go out, and resolving any issues their changes cause.
We&rsquo;ve found no positive impact from folks attempting to make changes where they don&rsquo;t do those things.</li>
</ol>
</li>
<li><strong>Optimize the base-case of process for agents.</strong>
<ol>
<li>We triage all incoming issues from our customer operations team using a harness which knows our team, our open tickets,
and has limited access to our data warehouse to size the impact of issues.
This is complex, high-skill but not particularly interesting labor that we&rsquo;re now doing better and faster with agents.
Yes, there is still a human triage for the edgecases.
Importantly, we&rsquo;re also doing this without changing human workflows, it&rsquo;s the same workflow, just with some steps
automated.</li>
<li>The first pass of code review is done by the same harness that implements the changes, cleared of the context used
to write the change, allowing humans to focus on higher value feedback.</li>
<li>We rolled out Claude Code and Cowork to all folks in the company last quarter, and have seen them also automate
an increasingly large swath of their work as well.
Our fraud team has been particularly ambitious in replacing manual workflows with a first-pass of automation&ndash;with attribution to the data itself&ndash;to
do the initial investigation on potential attacks automatically.</li>
<li>We&rsquo;ve migrated to Linear, and off Jira, to better support this workflow with a more capable MCP and better Slack integration,
making it possible for everyone internally to have better infrastructure for building these agent-first workflows.
More on this later, but we&rsquo;re almost done alpha-testing our internal harness pulling issues off Linear, and working to resolve them,
automatically which is our biggest next step in this direction.</li>
</ol>
</li>
<li><strong>Durable, high ownership teams with domain-context are even more important.</strong>
<ol>
<li>When I joined, we had a number of areas supported by very talented folks who rotated through them quickly on
a per-project basis. This worked, but it meant we were very reactive to issues.
Now, we&rsquo;ve been able to dedicate at least a small team to every important area of the company,
where they are able to persistently invest.
These teams are now wielding all the new techniques afforded by AI themselves.
Without them, no one would be capturing these opportunities, because there is simply too much
happening.</li>
<li>We launched SierraAI, which is quite good, but since then the team has iterated on it relentlessly,
getting it truly excellent. This is something we wouldn&rsquo;t have been able to do without a dedicated,
focused team.</li>
</ol>
</li>
<li><strong>Quick, good and durable decision making is a prerequisite to benefit from AI.</strong>
<ol>
<li>Changing how we do configuration was a controversial decision, and I&rsquo;ve had to make repeated clarifications on the approach.
This would have been very difficult to do bottom-up, because it impacts every team differently, and the benefit is only experienced
at the ecosystem-level (allowing one person to configure all configuration across teams).</li>
<li>Reworking our CI/CD pipeline was controversial, as it changed many folks&rsquo; mental models of how we deploy and release
(e.g., it forced us to explicitly decouple deploy and release via feature flagging). This was a contentious decision,
and would have been slow and difficult to make bottom-up.</li>
<li>Unifying into a web mono-repo was also a controversial decision with varied opinions. It benefitted greatly from having
a unified decision.</li>
<li>Moving to SierraAI was a difficult discussion versus both various competitors, and also not doing it.
It needed the executive stamp to finalize the cross-functional debate.</li>
</ol>
</li>
</ol>
<p>These are just representative examples, we&rsquo;ve done a lot more than these. The aperture of what&rsquo;s possible has continued
to expand every month this year, but the things holding us back haven&rsquo;t changed all that much: organizational misalignment,
lack of clarity, and poor technical architecture.
It&rsquo;s a wild time to be working in technology.</p>