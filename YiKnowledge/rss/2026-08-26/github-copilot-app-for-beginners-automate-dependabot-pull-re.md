---
title: 'GitHub Copilot app for Beginners: Automate Dependabot pull request triage'
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-29'
source: https://github.blog/ai-and-ml/github-copilot/github-copilot-app-for-beginners-automate-dependabot-pull-request-triage/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Wed, 26 Aug 2026 20:12:53 +0000
author: Christopher Harrison
---

<p class="wp-block-paragraph">I might be biased, but I think Dependabot is pretty amazing. It helps keep my projects up to date, ensuring I&rsquo;m always using secure libraries. But because there&rsquo;re frequently new vulnerabilities, there&rsquo;re frequently new pull requests from Dependabot.</p>



<p class="wp-block-paragraph">Sometimes it&rsquo;s a minor version bump. Sometimes it&rsquo;s a major version upgrade. Sometimes everything will work just fine. And sometimes&hellip; well, every single developer has been caught by a breaking change.</p>



<p class="wp-block-paragraph">How can we best triage these pull requests? The work isn&rsquo;t particularly difficult per se, but it certainly is repetitive.</p>



<p class="wp-block-paragraph">It&rsquo;s the perfect task to offload to Copilot! With <a href="https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations">GitHub Copilot app automations</a>, you can hand off that first round of review. Instead of manually inspecting every Dependabot pull request, you can create an automation that reviews open pull requests, groups them by risk, verifies CI status, and delivers a summary before your day begins.</p>



<p class="wp-block-paragraph">Follow the steps below to build a daily Dependabot triage automation.</p>



<h2 class="wp-block-heading" id="h-step-1-create-a-new-automation">Step 1: Create a new automation</h2>



<p class="wp-block-paragraph">From the GitHub Copilot app, <a href="https://docs.github.com/en/copilot/how-tos/github-copilot-app/using-automations">create a new automation</a>.</p>



<p class="wp-block-paragraph">You&rsquo;ll configure two things first:</p>



<ul class="wp-block-list">
<li><strong>Name:</strong> Give the automation a descriptive name, such as <strong>Daily Dependabot Triage</strong>.</li>



<li><strong>Trigger:</strong> Decide when it should run.</li>
</ul>



<p class="wp-block-paragraph">Available trigger options include:</p>



<ul class="wp-block-list">
<li>Manual</li>



<li>Hourly</li>



<li>Daily</li>



<li>Weekly</li>



<li>When an issue is created</li>
</ul>



<p class="wp-block-paragraph">For recurring maintenance tasks like <a href="https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/dependabot-quickstart">Dependabot reviews</a>, a daily schedule is often a good choice. For example, you might schedule it to run before your workday begins so the results are waiting when you log in.</p>



<p class="wp-block-paragraph">You can also choose whether the automation runs in the cloud or on your local machine.</p>



<h2 class="wp-block-heading" id="step-2-describe-the-task-in-natural-language">Step 2: Describe the task in natural language</h2>



<p class="wp-block-paragraph">Next, tell Copilot what you want it to do.</p>



<p class="wp-block-paragraph">For example:</p>


<div class="wp-block-code-wrapper">
<pre class="wp-block-code language-plaintext"><code>Review the open Dependabot pull requests, group them by risk, identify the safe patch and minor version updates, verify that CI is passing for each pull request, and provide a short summary of the recommended next steps.</code></pre>
<svg class="octicon octicon-copy js-clipboard-copy-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg class="octicon octicon-check js-clipboard-check-icon" height="16" version="1.1" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></div>


<p class="wp-block-paragraph">Because the prompt uses natural language, you can customize it to match your team&rsquo;s workflow.</p>



<h2 class="wp-block-heading" id="step-3-select-the-repository">Step 3: Select the repository</h2>



<p class="wp-block-paragraph">Choose the repository or project the automation should analyze.</p>



<p class="wp-block-paragraph">Once you&rsquo;ve selected the repository, create the automation.</p>



<p class="wp-block-paragraph">If you want to test it immediately instead of waiting for the scheduled run, choose <strong>Create and Run</strong>.</p>



<h2 class="wp-block-heading" id="step-4-review-the-results">Step 4: Review the results</h2>



<p class="wp-block-paragraph">When the automation finishes, Copilot returns a summary instead of a list of individual pull requests.</p>



<p class="wp-block-paragraph">For example, it might:</p>



<ul class="wp-block-list">
<li>Group safe patch updates together</li>



<li>Separate minor and major version upgrades</li>



<li>Identify which pull requests have passing CI</li>



<li>Highlight dependencies that require additional investigation</li>
</ul>



<p class="wp-block-paragraph">Rather than interrupting your morning with dozens of small decisions, you can quickly identify which updates are ready to merge and which deserve closer attention.</p>



<h2 class="wp-block-heading" id="step-5-continue-the-work-in-a-copilot-session">Step 5: Continue the work in a Copilot session</h2>



<p class="wp-block-paragraph">If one of the updates requires additional work, you can continue directly from the automation results.</p>



<p class="wp-block-paragraph">For example, if the summary identifies a major framework upgrade, you can start a new Copilot session from the results and ask Copilot to help complete the migration.</p>



<p class="wp-block-paragraph">Because the session starts with the automation&rsquo;s context, you don&rsquo;t have to gather the information again.</p>



<h2 class="wp-block-heading" id="review-previous-automation-runs">Review previous automation runs</h2>



<p class="wp-block-paragraph">Every automation run is saved, making it easy to see:</p>



<ul class="wp-block-list">
<li>When it ran</li>



<li>What actions it performed</li>



<li>What results it produced</li>
</ul>



<p class="wp-block-paragraph">Having a history of each run makes automations transparent. You can always review what happened instead of treating them as a black box.</p>



<h2 class="wp-block-heading" id="turn-repetitive-work-into-background-work">Turn repetitive work into background work</h2>



<p class="wp-block-paragraph">Dependabot triage is a good example of the kind of recurring task that&rsquo;s well suited for automation. You describe the workflow once, choose when it should run, and let Copilot perform the repetitive steps automatically.</p>



<p class="wp-block-paragraph">If you&rsquo;re just getting started with automations, begin with a task you already perform on autopilot. Let Copilot handle the routine work so you can spend your time on the decisions that require your expertise.</p>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph"><strong>Ready to automate your next recurring task?</strong> <a href="https://github.com/features/ai/github-app">Create your first automation in the GitHub Copilot app &gt;</a></p>
</div>

<p>The post <a href="https://github.blog/ai-and-ml/github-copilot/github-copilot-app-for-beginners-automate-dependabot-pull-request-triage/">GitHub Copilot app for Beginners: Automate Dependabot pull request triage</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>