---
title: Generated and suppressed demand.
tags:
- Irrational Exuberance (Will Larson)
category: leader/leadership
created: '2026-08-29'
source: https://lethain.com/generated-demand/
type: rss
source_name: Irrational Exuberance (Will Larson)
source_url: https://lethain.com/feeds.xml
published: Sat, 11 Jul 2026 14:00:00 -0700
---

<p><img alt="Stages of a performing team, revised for 2026" src="https://lethain.com/static/blog/2026/stages-2026.png" /></p>
<p>Eight years ago, I wrote about <a href="https://lethain.com/durably-excellent-teams/">my theory of restoring struggling teams</a>,
which came down to four steps:</p>
<ol>
<li>A team is <strong>falling behind</strong> if each week their backlog is longer than the week before.
Solve by hiring more.</li>
<li>A team is <strong>treading water</strong> if they’re able to get their critical work done, but are not able to start paying down technical debt or start major new projects.
Solve by reducing work-in-progress.</li>
<li>A team is <strong>repaying debt</strong> when they’re able to start paying down technical debt, but progress still feels slow.
Solve by staying the course: it&rsquo;s actually working, you just have to keep the faith until you finish digging out.</li>
<li>A team is <strong>innovating</strong> when their technical debt is sustainably low, morale is high, and the majority of work is satisfying new user needs.
There&rsquo;s nothing left to solve, at this point.</li>
</ol>
<p>Even now, I find this mental model extremely valuable, but I do think it is missing one interesting
nuance that I&rsquo;ve seen many teams run into in high-growth environments: suppressed and generated demand.
Suppressed demand is the idea of incoming work that isn&rsquo;t incoming, because teams stop asking you for help.
Generated demand is when an increasingly effective team&rsquo;s progress is noticed, and the previously
suppressed demand is converted into actual demand.</p>
<p><img alt="Generated demand" src="https://lethain.com/static/blog/2026/return-to-falling-2026.png" /></p>
<p>The consequence of generated demand is that a team that was struggling can successfully recover,
work through much of its backlog, and then shortly thereafter be just as far underwater as they were at their worst.
This is a very disorienting experience, and even a demoralizing one. The team has done everything right,
shipped a bunch of genuinely valuable work, and are nonetheless just as far underwater as they were before.</p>
<p>To give a concrete example, our Customer Operations Engineering team didn&rsquo;t exist a year ago,
and instead we invested in customer operations engineering tasks by prioritizing them into
a larger team&rsquo;s tasks. This often meant we had very valuable projects that didn&rsquo;t get staffed.
We then split it out into its own team, launching a number of projects like reworking our internal
customer operations tooling and integrating Sierra for our IVR, both of which worked out quite well.
As a result of working out well, there are far more requests for work. Despite accomplishing so much,
the team is even further behind on the incoming requests than they were a year ago, when they had
shipped relatively little and had relatively little capacity to ship more.</p>
<p>Unfortunately, the solution here is not particularly novel: you have to run through the cycle again.
And potentially a third time. And potentially a fourth time. You just have to keep running through
it until you&rsquo;ve surfaced the entire backlog of suppressed demand.
This is very similar to the problem of <a href="https://lethain.com/modeling-reliability/">latent incidents</a> which cause
effective reliability programs to look like they&rsquo;re failing as they drain the stock of previously
created latent incidents. Sometimes you&rsquo;re doing the right thing, and it just takes a while
to work. Your challenge in that moment is building conviction that you are indeed doing the
right thing, and convincing your team and leadership of that as well.</p>
<p>Finally, it&rsquo;s interesting to attempt to predict which teams are, and which aren&rsquo;t, sitting
on top of a backlog of suppressed demand. Some teams run through the recovery cycle, and
find that there simply isn&rsquo;t much else to do. These tend to be teams with very narrow interfaces,
for example a team whose job is providing internal queues probably won&rsquo;t have much generated
demand after clearing the initial backlog. Teams with broad interfaces, like customer operations
or developer experience, are generally sitting on an incredibly large, albeit currently invisible,
backlog of suppressed work.</p>