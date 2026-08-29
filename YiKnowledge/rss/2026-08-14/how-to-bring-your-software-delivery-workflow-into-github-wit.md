---
title: How to bring your software delivery workflow into GitHub with agent apps
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-29'
source: https://github.blog/ai-and-ml/github-copilot/how-to-bring-your-software-delivery-workflow-into-github-with-agent-apps/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Fri, 14 Aug 2026 16:00:00 +0000
author: Sam Zhang
---

<p class="wp-block-paragraph">How many tabs do you have open alongside your pull request?</p>



<p class="wp-block-paragraph">Imagine picking up a new issue in your product&rsquo;s free-trial onboarding flow: make the &ldquo;invite your teammates&rdquo; step optional. Support keeps flagging the step as a friction point as signups increase. Quick win, right?</p>



<p class="wp-block-paragraph">From scoping to deployment, you need answers to these four questions:</p>



<ul class="wp-block-list">
<li>Is this even the right change?</li>



<li>Are the dependencies I&rsquo;m touching clean?</li>



<li>How do I roll it out safely?</li>



<li>Is it safe to deploy right now?</li>
</ul>



<p class="wp-block-paragraph">Each answer lives in a different tool, so working through the pull request means carrying the same context across four places.</p>



<p class="wp-block-paragraph"><a href="https://docs.github.com/copilot/concepts/agents/agent-apps">GitHub agent apps</a> bring the tools you need to answer those questions to where you&rsquo;re already working, powered by the same platform and harness as our own <a href="https://docs.github.com/copilot/concepts/agents/cloud-agent/about-cloud-agent">Copilot cloud agent</a>. The illustrative walkthrough below shows how you can use services you already depend on, such as Amplitude, Endor Labs, LaunchDarkly, and PagerDuty to answer these questions and complete this request, without ever leaving GitHub.</p>



<h2 class="wp-block-heading" id="h-1-before-you-build-it">1. Before you build it</h2>



<p class="wp-block-paragraph">Support says the &ldquo;invite your teammates&rdquo; step is annoying for customers who are onboarding with your product, but they haven&rsquo;t given an indication of who has complained or whether those complaints lead to churn. You&rsquo;d be right to be skeptical. So instead of opening Amplitude and building a query to confirm your hunch, you ask the <a href="https://github.com/apps/amplitude">Amplitude</a> agent right from the <strong>Agents</strong> tab:</p>



<figure class="wp-block-video"><video controls="controls" height="1788" poster="https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-12-at-4.03.38-PM.png" src="https://github.blog/wp-content/uploads/2026/08/Amp.mp4" width="2524"></video></figure>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>@amplitude[agent] is completing the team invite step correlated with success later in the funnel? Break it down by segments we're measuring. </code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The split comes back clear: team users who finish the step are more likely to retain later, while solo users don&rsquo;t have that correlation. A rescope is now justified: defer the step for solo signups and keep it for teams.</p>



<p class="wp-block-paragraph">Access to product insights is now within GitHub, enabling course correction before any code is written.</p>



<h2 class="wp-block-heading" id="h-2-as-you-build-it">2. As you build it</h2>



<p class="wp-block-paragraph">Copilot opens a draft pull request for the change. The implementation also updates dependencies used by the onboarding flow. Instead of waiting for a CI scan to fail later, you ask the <a href="https://github.com/marketplace/endor-labs-agenthq-plugin">Endor Labs</a> agent in a comment:</p>



<figure class="wp-block-video"><video controls="controls" height="850" poster="https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-12-at-4.03.21-PM.png" src="https://github.blog/wp-content/uploads/2026/08/endor.mp4" width="2440"></video></figure>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>@endor-labs-github-agenthq[agent] is there anything I need to watch out for in the dependencies being touched by this pull request?</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The agent identifies the changed dependencies, checks them for known vulnerabilities and broader package risk, then reports back in the pull request. This time, everything looks clean. Nothing to remediate.</p>



<p class="wp-block-paragraph">Dependency review becomes a proactive check while the change is still in front of you. Much better than remediating a CI scan after it fails.</p>



<h2 class="wp-block-heading" id="h-3-rolling-it-out">3. Rolling it out</h2>



<p class="wp-block-paragraph">The previous finding now gets carried through to implementation: solo signups get the optional path, while teams keep the existing one. Because these segments are set at signup, a feature flag can target them directly. Ask the <a href="https://github.com/marketplace/launchdarkly-agent">LaunchDarkly</a> agent to set it up for you, the same way you&rsquo;d ask a team member:</p>



<figure class="wp-block-video"><video controls="controls" height="1114" poster="https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-12-at-4.03.15-PM.png" src="https://github.blog/wp-content/uploads/2026/08/darkly.mp4" width="2440"></video></figure>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>@launchdarkly-agent[agent] please create a feature flag for this pull request and wire it into the code. 
   - key: defer-team-invite 
   - type: boolean 
   - default: false 
   - target: solo-intent signups 
   - rollout: internal &gt; 5% &gt; 25% &gt; 100% </code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The agent creates the flag in LaunchDarkly and adds the code implementation as a commit you review. If the target environment requires approval, it creates an approval request instead of applying the targeting change directly. A human still decides whether the rollout moves forward.</p>



<p class="wp-block-paragraph">Flag setup goes from a second tool, a manual code handoff, and Slack coordination to one pull request comment and a commit you review.</p>



<h2 class="wp-block-heading" id="h-4-before-you-ship">4. Before you ship</h2>



<p class="wp-block-paragraph">Review tells you the code is correct, but whether the service is in a good state for a deployment is a different question. Before merging, you ask the <a href="https://github.com/apps/pagerduty-agent-app">PagerDuty</a> agent:</p>



<figure class="wp-block-video"><video controls="controls" height="860" poster="https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-12-at-4.03.02-PM.png" src="https://github.blog/wp-content/uploads/2026/08/pagerduty.mp4" width="2440"></video></figure>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>@pagerduty-agent-app[agent] assess the deployment risk for this pull request against the onboarding service. Check active incidents and recent incident history, then recommend whether to proceed. </code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">The agent maps the repository to its PagerDuty service, checks for active incidents, reviews the previous 90 days, and compares the files in the pull request with areas involved in past incidents.</p>



<p class="wp-block-paragraph">This time, the risk is low. There are no active incidents and no meaningful correlation with the current changes. The recommendation is to proceed.</p>



<p class="wp-block-paragraph">Nothing dramatic happens, but that&rsquo;s the point. Checking deploy risk becomes a routine step for your pull requests instead of something you do only when a release already feels dangerous.</p>



<h2 class="wp-block-heading" id="h-what-changes">What changes</h2>



<p class="wp-block-paragraph">You still use Amplitude, LaunchDarkly, Endor Labs, and PagerDuty. But now, you no longer need to carry the context between them, and they&rsquo;ll all work directly in your GitHub workflows.</p>



<p class="wp-block-paragraph">As work moves from idea to production, developers can bring each service into GitHub when its context or capabilities matter. With agent apps, GitHub becomes the place where developers and agents coordinate what happens next, without developers switching contexts.</p>



<h2 class="wp-block-heading" id="h-try-it">Try it</h2>



<p class="wp-block-paragraph"><a href="https://docs.github.com/copilot/how-tos/use-copilot-agents/cloud-agent/use-agent-apps">Agent apps</a> are available from the <a href="https://github.com/marketplace?type=apps&amp;category=agent-apps">GitHub Marketplace</a>. Install one, enable it for your organization, and take it for a spin:</p>



<ul class="wp-block-list">
<li>Assign it to an issue to kick off a task.</li>



<li>@mention it in a pull request comment for analysis or action.</li>



<li>Select it from the <strong>Agents</strong> tab in your repository.</li>
</ul>



<p class="wp-block-paragraph">Your tools are still your tools. Now, they show up where you are already working: on GitHub. Explore the other inaugural agent apps and start bringing your stack directly into your workflow:</p>



<ul class="wp-block-list">
<li><a href="https://github.com/marketplace/packfiles-agent">Packfiles</a>&rsquo;s agent reads your backlog and builds a migration strategy. reads your backlog and builds a migration strategy.</li>



<li><a href="https://github.com/marketplace/miro-agent-app">Miro</a>&lsquo;s agent connects visual collaboration with code workflows.</li>



<li><a href="https://github.com/marketplace/bright-security-agent">Bright Security</a>&lsquo;s agent autonomously handles end-to-end dynamic security testing inside GitHub.</li>



<li><a href="https://github.com/marketplace/sonarqube-agent">SonarQube</a>&lsquo;s agent brings analysis, quality gates, and remediation into GitHub agent sessions.</li>



<li><a href="https://github.com/marketplace/octopus-deploy-intelligence-agent">Octopus Deploy</a>&lsquo;s agent can identify, diagnose, and resolve deployment failures.</li>
</ul>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph"><a href="https://github.com/marketplace?type=apps&amp;category=agent-apps">Discover agent apps in the GitHub Marketplace &gt;</a></p>
</div>

<p>The post <a href="https://github.blog/ai-and-ml/github-copilot/how-to-bring-your-software-delivery-workflow-into-github-with-agent-apps/">How to bring your software delivery workflow into GitHub with agent apps</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>