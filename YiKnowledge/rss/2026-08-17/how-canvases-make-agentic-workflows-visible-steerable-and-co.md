---
title: How canvases make agentic workflows visible, steerable, and cost-efficient
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-29'
source: https://github.blog/ai-and-ml/github-copilot/how-canvases-make-agentic-workflows-visible-steerable-and-cost-efficient/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Mon, 17 Aug 2026 16:00:00 +0000
author: Ayan Gupta
---

<p class="wp-block-paragraph">When I was in college, I joined the beta for one of the first versions of AI inline completions in VS Code. It felt like a game changer. Since then, GenAI has fundamentally changed software development: hybrid teams where agents and humans work in tandem, with the developer at the center as visionary and orchestrator. We are living in that transition right now.</p>



<figure class="wp-block-image size-large"><img alt="A software lifecycle timeline &mdash; Plan, Build, Review, Ship &mdash; with intertwining green and purple paths representing a human and an AI agent working in tandem." class="wp-image-98310" height="312" src="https://github.blog/wp-content/uploads/2026/08/623371402-ddb0772d-e566-4895-b030-6be9b0fe304c.png?resize=1024%2C312" width="1024" /></figure>



<p class="wp-block-paragraph">As a natural byproduct of how fast innovation in GenAI has moved, we now have tools to help us plan, build, review, and ship code. But in the current state, many workflows still feel disjointed. Context gets lost across threads and surfaces, and too much time gets spent reviewing agent-generated work. Agents can produce changes faster than any human can review them, and most developer tools were not originally designed for multi-agent orchestration. It becomes easy to lose track of what ran, what changed, what was validated, and what still needs human judgment.</p>



<p class="wp-block-paragraph">The GitHub Copilot app is a major step toward addressing this. One feature in particular that I&rsquo;ve learned to love and use almost every day is <strong>canvases</strong>. Canvases let developers and agents interact on a durable, shared surface. Instead of treating chat as the only place where work happens, canvases make work visible, steerable, and approvable as it unfolds.</p>



<h2 class="wp-block-heading" id="h-chat-is-great-for-intent-but-weak-for-durable-execution">Chat is great for intent, but weak for durable execution</h2>



<p class="wp-block-paragraph">I still believe chat is one of the best interfaces we have for intent. It&rsquo;s where you can think, refine, and direct. It&rsquo;s fast and flexible, especially when the problem is still ambiguous.</p>



<p class="wp-block-paragraph">But once an agent starts doing real work, chat becomes a long scroll of instructions, logs, pivots, and corrections. The important parts are technically there, but buried: the plan, decision points, validations, and approval moments. If you have to reconstruct all of that from history, you&rsquo;re already paying a coordination tax.</p>



<p class="wp-block-paragraph">Canvases solve that by giving workflows a home. They make state explicit and persistent. Humans can inspect and guide. Agents can update and progress. Both can stay aligned without constantly replaying context.</p>



<h2 class="wp-block-heading" id="h-the-first-build-java-modernization-studio">The first build: Java Modernization Studio</h2>



<p class="wp-block-paragraph">One of the first canvases I built was <strong>Java Modernization Studio</strong>. Java modernization is exactly the kind of workflow where visibility and governance matter: assessment, planning, migration tasks, validation gates, and readiness to ship.</p>



<p class="wp-block-paragraph">In a chat-only experience, those steps blur together. You can still move forward, but it gets harder to audit and harder to trust at scale, especially with multiple contributors. Teams keep asking the same expensive questions: What stage are we in? What decisions were made? What is blocked? What still needs human approval?</p>



<p class="wp-block-paragraph">The studio made each phase explicit and inspectable. Instead of parsing narrative history, teams could see operational state directly. Instead of guessing what happened, they could verify it. Human reviewers could focus on high-signal judgments while agents kept execution moving between checkpoints.</p>



<figure class="wp-block-image size-full"><img alt="The Java Modernization Studio canvas Overview tab, showing the modernization journey (Assess, Remediate, Validate, Ship), a compile-blocker card, a Run on autopilot option, assessment findings with P0&ndash;P3 severity counts, and the detected stack." class="wp-image-98311" height="2494" src="https://github.blog/wp-content/uploads/2026/08/623375232-cbf590d3-74d6-471d-be21-76add276959b.png?resize=2200%2C2494" width="2200" /></figure>



<p class="wp-block-paragraph"><a href="https://awesome-copilot.github.com/extension/appmod-cockpit/"><strong>Explore the Java Modernization Studio canvas &gt;</strong></a></p>



<h2 class="wp-block-heading" id="h-the-second-build-site-studio">The second build: Site Studio</h2>



<p class="wp-block-paragraph">After that, I built <strong>Site Studio</strong> for a very different workflow: creating and managing personal site content. It&rsquo;s content-heavy rather than migration-heavy, but the orchestration challenge is similar: section progress, iterative edits, review loops, and status transitions.</p>



<p class="wp-block-paragraph">In a chat-only flow, content can drift quickly. A section gets revised, then revised again, and confidence drops in what is current. Feedback gets scattered, drafts repeat, and momentum slows because each iteration starts by rebuilding context.</p>



<p class="wp-block-paragraph">Site Studio keeps that state durable. Section status is visible. Draft values are persisted as work happens. Human review points are explicit. The agent can keep moving while the human can steer, approve, or redirect without losing the thread.</p>



<figure class="wp-block-image size-full"><img alt="The Site Studio canvas Content tab at 100% completion, with editable sections &mdash; Design System, Hero, Navigation, About, Conference Talks, Videos, and Contact &mdash; each showing filled fields and a Mark ready for review action." class="wp-image-98313" height="2623" src="https://github.blog/wp-content/uploads/2026/08/623387227-87abbc64-0005-4816-a6f5-3c86756e1651.png?resize=1185%2C2623" width="1185" /></figure>



<p class="wp-block-paragraph"><strong><a href="https://awesome-copilot.github.com/extension/site-studio/">Explore the Site Studio canvas &gt;</a></strong></p>



<h2 class="wp-block-heading" id="h-the-repeatable-pattern">The repeatable pattern</h2>



<p class="wp-block-paragraph">Across both canvases, I found the same repeatable blueprint:</p>



<ol class="wp-block-list">
<li>Define workflow states clearly.</li>



<li>Surface the decisions that matter.</li>



<li>Persist progress and drafts immediately.</li>



<li>Keep explicit human approval points.</li>
</ol>



<p class="wp-block-paragraph">This shifts the model from prompt-by-prompt interaction to durable collaborative workflows. You stop treating each turn like a fresh start and start treating each workflow like a system with memory, structure, and control.</p>



<h2 class="wp-block-heading" id="h-cost-and-efficiency-yes-canvases-are-an-investment">Cost and efficiency: yes, canvases are an investment</h2>



<p class="wp-block-paragraph">I also want to be explicit about cost: canvases can be an investment. For instance, Site Studio cost me about 2,000 AI credits, and the modernization canvas cost me about 3,000 AI credits. They take effort to design and shape well.</p>



<p class="wp-block-paragraph">But in the long run, especially for repeated workflows, that investment pays back. Durable surfaces reduce repeated prompting, reduce context loss, reduce unnecessary back-and-forth, and reduce rework. Over time, that can save both time and money while improving trust and throughput.</p>



<p class="wp-block-paragraph">So for me, this is not &ldquo;spend more tokens for nicer UX.&rdquo; It&rsquo;s &ldquo;invest in better workflow architecture so recurring work becomes more efficient, predictable, and governable.&rdquo;</p>



<h2 class="wp-block-heading" id="h-available-now-in-awesome-copilot">Available now in awesome-copilot</h2>



<p class="wp-block-paragraph">The canvases I built&mdash;<strong>Java Modernization Studio</strong> and <strong>Site Studio</strong>&mdash;<a href="https://awesome-copilot.github.com/extensions/">are available in <strong>awesome-copilot</strong></a> for anyone who wants to use them, adapt them, or learn from them.</p>



<p class="wp-block-paragraph">If you are already using Copilot agents, a practical next step is to pick one repeated workflow and build a minimal canvas around it with <code>/create-canvas</code>. Start small, run real work, and iterate from actual usage. If it helps your team, contribute it back to <strong>awesome-copilot</strong> so others can benefit too.</p>



<p class="wp-block-paragraph">We&rsquo;re still early in this transition, but the direction is clear. Agents can accelerate execution. Humans provide vision, judgment, and accountability. Canvases are one way to make that partnership real, durable, and scalable.</p>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph"><a href="https://awesome-copilot.github.com/extensions/">Build your own canvas with /create-canvas</a> and contribute it back to awesome-copilot &gt;</p>
</div>

<p>The post <a href="https://github.blog/ai-and-ml/github-copilot/how-canvases-make-agentic-workflows-visible-steerable-and-cost-efficient/">How canvases make agentic workflows visible, steerable, and cost-efficient</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>