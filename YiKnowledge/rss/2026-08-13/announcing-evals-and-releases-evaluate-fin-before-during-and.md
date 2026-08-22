---
title: 'Announcing Evals and Releases: Evaluate Fin before, during, and after you
  go live'
tags:
- Intercom Blog
category: producter/frameworks
created: '2026-08-22'
source: https://www.intercom.com/blog/announcing-evals-and-releases/
type: rss
source_name: Intercom Blog
source_url: https://www.intercom.com/blog/feed
published: Thu, 13 Aug 2026 17:33:52 +0000
author: Brian Donohue
---

<p>Today we&#8217;re announcing <a href="http://fin.ai/evals">Evals and Releases</a>. Paired with <a href="https://www.intercom.com/blog/announcing-monitors-opening-the-ai-black-box/">Monitors</a>, they give you an evaluation system for Fin, so you can test changes before they go live, roll them out with control, evaluate every live conversation, and have confidence in the experience Fin delivers.</p>
<p>Evals tests Fin’s behavior at scale using simulated scenarios built from your own conversations. You group these simulated conversations into an Eval around a theme – such as refund requests, escalation rules, or Fin&#8217;s tone of voice – and each one is scored automatically against criteria you set. Releases gives your team a dedicated space to build changes away from the live version of Fin, test them on real conversations, and roll them out safely.</p>
<p>Once live, <a href="https://www.intercom.com/blog/announcing-monitors-opening-the-ai-black-box/">Monitors</a> keeps the process continuous: assessing the quality of every conversation, and catching issues you can work through in your next Eval and Release.</p>
<p>We call this “Eval-driven delivery.” It’s the discipline our AI research team uses to build and tune AI products, and it’s now in the hands of the teams running support with Fin.</p>
<p><img alt="I diagram showing Eval, Releases, and Monitors in a cycle" class="alignnone size-full wp-image-32268" height="490" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/evals_interstitial_diagram.gif" width="1252" /></p>
<h3><strong>Here&#8217;s what&#8217;s new:</strong></h3>
<ul>
<li><strong>Evals tests Fin end to end.</strong> Create an Eval for a topic, add <a href="https://fin.ai/glossary/simulations-fin-simulations">Simulations</a> that mirror real customer conversations, and each one is scored pass/fail against your success and qualitative criteria. Re-run the Eval after any change to Fin to catch unexpected regressions in performance.</li>
<li><strong>Releases gives you a safe version of Fin to work in.</strong> Bundle changes to content, <a href="https://fin.ai/procedures">Procedures</a>, or <a href="https://www.intercom.com/help/en/articles/10560969-fin-guidance-best-practices">Guidance</a> into one Release, collaborate on it with your team, and test performance with Evals before going live. Then publish to everyone, ramp traffic gradually, or run an A/B test against Fin&#8217;s current configuration.</li>
<li><strong>Evals, Releases, and Monitors work as one system.</strong> Monitors checks every live conversation against your standards and flags the ones that fall short. Turn any flagged conversation into your next set of improvements and run the system again.</li>
</ul>
<h2 id="why-we-built-this">Why we built this</h2>
<p>As AI Agents take on more volume and complex work, ensuring they meet your standards every time is a tough task.</p>
<p>Fin, like any AI Agent, is probabilistic. It reasons through each conversation as it happens, so it can answer the same question in different ways – and your customers will ask the same question in countless ways too. That creates thousands of possible scenarios that no team can validate by hand.</p>
<p>And success isn&#8217;t just about whether the final answer was right. It depends on whether Fin followed your Procedures, used the right content and data sources, handed off at the right moment, and sounded like your brand while doing it.</p>
<p>Teams also continuously make changes to Fin’s content, updating its context when they launch a product, adjust a policy, rewrite a help article, or add a Procedure. That can introduce drift, where changing one thing can impact something else without you noticing. At the scale some of our customers run Fin, a 1% regression could affect thousands of conversations a day.</p>
<p>Current oversight and testing solutions weren’t built for this scale and complexity. Meaning, it can be really hard to always know how Fin will handle a conversation.</p>
<p>We think every support team should have the ability to rigorously test changes and monitor performance without needing a developer or ML specialist.</p>
<h2 id="evals-know-how-fin-will-behave-before-you-go-live">Evals: Know how Fin will behave before you go live</h2>
<p>An Eval is a named group of Simulations – multi-turn test conversations – that validates Fin&#8217;s behavior on one theme, topic, or issue. You might build one for your most common queries, one for how Fin handles refund requests inside and outside your policy, and another for tone of voice across a range of situations.</p>
<p><img alt="Evals menu, showing a few topics, including Shipping &amp; Delivery, Billing, ect" class="alignnone size-full wp-image-32266" height="1097" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Evals--scaled.png" width="2560" /></p>
<h3>Build out Simulations from real conversations</h3>
<p>Simulations are made up of three actors:</p>
<ul>
<li><strong>The simulated customer </strong>– their opening message, and the context they reveal as the conversation goes on, like account details, order information, or a change in mood.</li>
<li><strong>What Fin has access to </strong>– including attributes and data connectors.</li>
<li><strong>The criteria the LLM judge scores against </strong>– whether Fin replied and what it needed to say, whether the right Procedure triggered, or whether a data connector was called.</li>
</ul>
<p>You can create Simulations manually, upload them from existing conversations, or generate them based on real inbox conversations.</p>
<p><img alt="A sample of the conversations inside an Eval" class="alignnone size-full wp-image-32276" height="1097" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Simulated-conversations-scaled.png" width="2560" /></p>
<h3>Score every Simulation the way your best reviewers would</h3>
<p>Running an Eval runs every Simulation inside it and returns a pass or fail for each one. Scoring combines deterministic checks with an LLM judge, and if any single criterion fails, the Simulation fails.</p>
<p>Every run shows the full conversation transcript, the event log, and the outcome – answered by Fin, handed off to your team, or handed off to a workflow – so you can see exactly how Fin got there. Where a scenario needs more than one Procedure, the Simulation shows Fin switching between them mid-conversation.</p>
<p><img alt="A failed simulation sample" class="alignnone size-full wp-image-32270" height="1097" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Failed-Simulation-scaled.png" width="2560" /></p>
<p><img alt="Quote from Hila Horenshtein: &quot;Before Evals, a guidance or content change was the one thing we couldn't auto-test - guidance doesn't fire in a plain simulation, so we'd ship it and watch production. Now we prove it before it goes live. That's the biggest thing Evals changed for us." class="alignnone size-full wp-image-32271" height="1395" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Hila-quote-1-scaled.png" width="2560" /></p>
<h3>Re-run an Eval after any change to catch regressions</h3>
<p>Once an Eval exists, it becomes a way to test for regressions on an ongoing basis. Re-run it before or after committing a change to Fin so you can ensure a fix to one thing doesn&#8217;t break another.</p>
<blockquote><p>&#8220;We group our Evals around different topics, so every time we make a change, we rerun the whole set and see immediately whether anything regressed.&#8221;</p>
<p><span style="font-weight: 400;">— Hila Horenshtein, CX AI Operations Team Lead, AutoDS</span></p></blockquote>
<h2 id="releases-control-how-a-change-reaches-customers">Releases: Control how a change reaches customers</h2>
<p>Releases gives you a dedicated space to plan, collaborate, and test changes to Fin so nothing reaches customers until you decide it&#8217;s ready.</p>
<h3>Work on changes without touching live Fin</h3>
<p>In a Release, you can edit content, add or update Procedures, and change or delete Guidance, all bundled together. This simplifies big changes like new product launches, or optimizations to a specific workflow – like moving Fin from explaining your refund policy to processing refunds with a Procedure.</p>
<p>Your teammates can work in the same Release – reviewing edits, adding their own, or testing what&#8217;s there. Every change is listed in one place, so you can see exactly what&#8217;s in the Release and who made each edit.</p>
<p>You can also run an Eval against any changes within the Release before you publish it. Build the change, run your Eval, see what fails, make adjustments, and run it again – without touching live Fin.</p>
<p><img alt="Releases dashboard, with some in experimenting" class="alignnone size-full wp-image-32275" height="1097" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Releases-scaled.png" width="2560" /></p>
<h3>A/B test a change before it goes wide</h3>
<p>When a Release is ready you can publish it to everyone or run an A/B test against Fin&#8217;s current configuration. Experiment reporting uses metrics you care about, like resolution rate, escalation rate and CSAT, so you can be confident in every new release.</p>
<p><img alt="A Releases Experiment showing a new release vs Fin's existing configuration" class="alignnone size-full wp-image-32269" height="1097" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/experiment-running-scaled.png" width="2560" /></p>
<h3>Roll back instantly</h3>
<p>If something looks wrong partway through a rollout, pause it. Fix the specific issue, re-run the Eval to confirm the fix worked, then pick the rollout back up. If you need to undo a Release entirely, roll it back in one step.</p>
<p><img alt="Jorfan Thompson from Raylo: With Releases we can confirm a change is better for customers before it goes wide. For a business where getting payments and policy right really matters, that control means a lot." class="alignnone size-full wp-image-32272" height="1004" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Jordan-quote-1.png" width="1842" /></p>
<h2 id="how-evals-releases-and-monitors-work-together">How Evals, Releases, and Monitors work together</h2>
<p>Each of these is useful alone. Together, they strengthen the Fin Flywheel, so only the best version of Fin reaches your customers.</p>
<p>You create a change in a Release and validate it with Evals before going live. You roll it out as an experiment, then publish to everyone once the results hold up. From there, a Monitor keeps watch – checking live conversations against your quality standards so the change keeps performing after it&#8217;s fully live. When a Monitor flags a conversation that fell short, you turn it into a Simulation, add it to the relevant Eval, and use it as a benchmark to test a new Release and drive better performance. That’s how you can have confidence in the experience Fin delivers at scale.</p>
<p><img alt="Sample of monitors" class="alignnone size-full wp-image-32273" height="2495" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Monitors-scaled.png" width="2560" /></p>
<h2 id="operator-runs-eval-driven-delivery-for-you">Operator runs Eval-driven delivery for you</h2>
<p>You don&#8217;t have to work through Evals and Releases step by step yourself. <a href="https://fin.ai/operator">Operator</a>, our Agent for customer operations, can use all of these capabilities on your behalf.</p>
<p>For example, you can ask Operator to:</p>
<ul>
<li>Update your refund policy to say that customer refunds can be applied as a credit on their account.</li>
<li>Then, add a test for this to the ‘refund policy’ Eval.</li>
<li>And finally, put this change into a new Release.</li>
</ul>
<p>And it will handle all three. It drafts the content change, builds the Eval, and bundles the work into a Release. Every step comes back as a proposal, so you can review it and give final approval.</p>
<p><img alt="Sample of talking to operator" class="alignnone size-full wp-image-32274" height="2499" src="https://blog.intercomassets.com/blog/wp-content/uploads/2026/08/Operator-scaled.png" width="2560" /></p>
<h2 id="maintaining-customer-experience-as-your-business-evolves">Maintaining customer experience as your business evolves</h2>
<p>You can build a very good AI Agent on day one. Maintaining this performance while your products, policies, and content keep changing is a different problem.</p>
<p>Evals and Releases give your team the same technical rigor an engineering team would build for itself – without needing an engineering team to run it. You set the standards, build the tests, and control the rollout. When integrated with Monitors, you get the oversight you need to maintain your standards as you grow.</p>
<p>Learn more <a href="http://fin.ai/evals">here</a>.</p>