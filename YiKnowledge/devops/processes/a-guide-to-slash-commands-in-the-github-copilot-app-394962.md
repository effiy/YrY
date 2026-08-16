---
title: A guide to slash commands in the GitHub Copilot app
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-16'
source: https://github.blog/ai-and-ml/github-copilot/a-guide-to-slash-commands-in-the-github-copilot-app/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Thu, 06 Aug 2026 19:49:34 +0000
author: Jacklyn Carroll
---

<p class="wp-block-paragraph">If you&rsquo;ve used slash commands in the GitHub Copilot CLI, you already know how powerful a quick <code>/</code> can be. In the GitHub Copilot app, slash commands take that idea further, giving you shortcuts for managing sessions, navigating projects, and customizing your Copilot workflow.</p>



<h2 class="wp-block-heading" id="h-what-are-slash-commands">What are slash commands?</h2>



<p class="wp-block-paragraph">Slash commands are text shortcuts you type directly into the GitHub Copilot app&rsquo;s chat composer. Start by typing <code>/</code> and an autocomplete menu appears, showing the commands available in your current context. It&rsquo;s a small character with a lot of potential, opening the door to shortcuts that help you work with Copilot in new ways.</p>



<p class="wp-block-paragraph">If you&rsquo;re coming from the CLI, here&rsquo;s the key difference: CLI slash commands are designed around a terminal-first workflow. Things like adding directories, setting your working directory, and managing terminal access happen through commands. This makes sense, because the CLI lives inside your terminal where there&rsquo;s no visual interface.</p>



<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>&#128161; <strong>Tip</strong>: If you&rsquo;ve used slash commands in the Copilot CLI, you&rsquo;ll notice some familiar faces. Commands like <code>/clear</code> and <code>/model</code> work in both places. But the GitHub Copilot app-specific commands are tailored for the multi-session workflow that the desktop app provides.</td></tr></tbody></table></figure>



<p class="wp-block-paragraph">The app, on the other hand, provides a visual interface for managing context. File access commands like <code>/add-dir</code> or <code>/cwd</code> aren&rsquo;t needed since the app manages project context automatically. App slash commands are more about workflows. You can navigate between sessions, manage projects, and control how the agent works.</p>



<h2 class="wp-block-heading" id="why-use-slash-commands">Why use slash commands?</h2>



<p class="wp-block-paragraph">Slash commands may look like simple shortcuts, but they can change how you interact with Copilot. They help you move faster, stay focused, and quickly access the workflows you need. Instead of digging through options or breaking your focus to find the right tool, you can type a command and keep moving. A single <code>/</code> opens up the list of slash commands that can help you move faster, explore new ideas, and get the most out of the app.</p>



<p class="wp-block-paragraph">Let&rsquo;s take a look at some of the slash commands available in the GitHub Copilot app and how they can fit into your everyday workflows.</p>



<h2 class="wp-block-heading" id="before-you-write-code-make-a-plan">Before you write code, make a <code>/plan</code></h2>



<p class="wp-block-paragraph">Good code starts with a good plan. <code>/plan</code> helps you break down a task before you start writing code, think through your approach, identify potential challenges, and decide what needs to happen next. It also switches your session into <strong>Plan</strong> mode, which you can also select from the <strong>Mode</strong> dropdown in the chat composer.</p>



<ul class="wp-block-list">
<li><strong>Plan a new feature.</strong> Break down new feature ideas before jumping into implementation. Have Copilot identify files, components, and dependencies so you have a clearer path forward.</li>



<li><code>/plan I need to add two-factor authentication to our application. Help me break down the work involved, identify what files need to change, and outline an implementation approach.</code></li>



<li><strong>Prepare for a large refactor.</strong> Map out complex changes before touching your code. Uncover potential risks and develop an incremental approach for making large changes safely.</li>



<li><code>/plan We want to refactor our notification system code to make it easier to support new channels like push notifications. Help me understand the changes needed and create an incremental migration plan.</code></li>



<li><strong>Triage and fix bugs.</strong> If you know something is wrong but aren&rsquo;t sure where to start, <code>/plan</code> can help you explore possible causes and outline the steps needed to diagnose and resolve the problem.</li>



<li><code>/plan Users are reporting that our checkout flow randomly fails after payment processing. Help me investigate possible causes and create a plan to diagnose and fix the issue.</code></li>
</ul>



<h2 class="wp-block-heading" id="let-copilot-play-devils-advocate-with-spar">Let Copilot play devil&rsquo;s advocate with <code>/spar</code></h2>



<p class="wp-block-paragraph">Sometimes the best way to validate an idea is to challenge it. <code>/spar</code> is like that one teammate who raises their hand and asks, &ldquo;Have we thought about what happens when this goes wrong?&rdquo; It helps you pressure-test your approach by having Copilot question your assumptions and point out potential risks or tradeoffs before you commit to a solution. Here are a few ways you can use it:</p>



<ul class="wp-block-list">
<li><strong>Validate an architecture choice.</strong> Pitch your plan to use Redis for caching and have Copilot question your invalidation strategy, scalability, or whether another approach better fits your workload.</li>



<li><code>/spar I'm planning to use Redis as a caching layer for our product API. Challenge my approach and point out any scalability or consistency concerns I may have missed.</code></li>



<li><strong>Compare implementation options.</strong> Ask Copilot to debate the pros and cons of REST versus GraphQL, or synchronous versus asynchronous processing, based on your application&rsquo;s requirements.</li>



<li><code>/spar Help me decide between REST and GraphQL for a customer-facing API. Ask questions, challenge my assumptions, and recommend which approach fits best for an app with mobile clients.</code></li>



<li><strong>Review a migration plan.</strong> Walk through a database migration or infrastructure change and have Copilot identify edge cases, risks, or rollout concerns before you begin.</li>



<li><code>/spar I'm migrating our database to a new managed service with minimal downtime. Poke holes in my migration plan and identify any risks or edge cases I should account for.</code></li>



<li><strong>Challenge a performance optimization.</strong> Share an optimization you&rsquo;re considering and ask Copilot to point out hidden bottlenecks, unintended side effects, or simpler alternatives.</li>



<li><code>/spar I'm planning to lazy load most of the components on my site to improve initial load time. Critique my approach and tell me where it could hurt user experience or introduce unnecessary complexity.</code></li>
</ul>



<h2 class="wp-block-heading" id="autopilot-take-the-wheel"><code>/autopilot</code> take the wheel</h2>



<p class="wp-block-paragraph">Once you have a <code>/plan</code>, the next step is turning that idea into working code. <code>/autopilot</code> helps you work through implementation, make changes, and iterate as needed. Instead of managing each individual step, give Copilot a goal and let it work through the steps needed to complete the task. It also switches your session into <strong>Autopilot</strong> mode, which you can also select from the <strong>Mode</strong> dropdown in the chat composer.</p>



<ul class="wp-block-list">
<li><strong>Implement a new feature.</strong> Hand off a task and let Copilot work through the implementation steps.</li>



<li><code>/autopilot Add support for exporting user reports as CSV files. Identify the files that need changes, implement the feature, and update any relevant tests.</code></li>



<li><strong>Complete a larger maintenance task.</strong> Use <code>/autopilot</code> for tasks that require multiple steps, such as updating dependencies, refactoring code, or improving documentation.</li>



<li><code>/autopilot Update this project to the latest version of React. Identify breaking changes, update the code where needed, and make sure the test suite passes.</code></li>
</ul>



<h2 class="wp-block-heading" id="talk-it-through-with-rubber-duck">Talk it through with <code>/rubber-duck</code></h2>



<p class="wp-block-paragraph">I&rsquo;ve learned from personal experience that talking things through with your cat isn&rsquo;t always helpful. Their listening skills are questionable at best, and their debugging advice usually ends with them sitting on my keyboard or chewing my wires. <code>/rubber-duck</code> gives you something even better: a fresh set of eyes.</p>



<p class="wp-block-paragraph">It uses a different model to independently review your work, helping surface blind spots, question assumptions, and catch issues your primary model may have missed. It&rsquo;s especially useful for complex refactors, architectural decisions, migration plans, or any time you want a second opinion before moving forward.</p>



<ul class="wp-block-list">
<li><strong>Get a second opinion on a plan.</strong> Before you start implementing a complex feature, have a different model independently review your plan and point out assumptions, missing steps, or potential risks.<br /><code>/rubber-duck Review the implementation plan we've created for adding two-factor authentication. Identify any blind spots, edge cases, or risks that we may have overlooked.</code></li>



<li><strong>Review a large refactor.</strong> After making significant changes, ask /rubber-duck to critique the approach and highlight anything that could be simplified, improved, or handled differently.<br /><code>/rubber-duck Review the refactoring we've completed for the notification system. Look for architectural concerns, unnecessary complexity, or areas that could be improved before I open a pull request.</code></li>



<li><strong>Validate a migration strategy.</strong> Before rolling out a complex migration, use a second model to independently evaluate your approach and identify rollout or reliability concerns.<br /><code>/rubber-duck Review our database migration plan and implementation. Point out any blind spots, rollback concerns, or edge cases we should address before deployment.</code></li>
</ul>



<h2 class="wp-block-heading" id="turn-conversations-into-interactive-experiences-with-create-canvas">Turn conversations into interactive experiences with <code>/create-canvas</code></h2>



<p class="wp-block-paragraph">Not every problem is best solved through a chat window. <code>/create-canvas</code> lets you create interactive interfaces directly from a conversation with Copilot. Instead of working through information in a long chat, you can turn it into a visualization, dashboard, or custom workflow you can interact with. For example:</p>



<ul class="wp-block-list">
<li><code>/create-canvas Create an interactive diagram showing how services in this application connect.</code></li>



<li><code>/create-canvas Create an issue triage board that lets me review and categorize open issues.</code></li>
</ul>



<p class="wp-block-paragraph">For more information and examples on creating canvases, <a href="https://github.blog/ai-and-ml/github-copilot/how-to-build-interactive-experiences-with-canvases/">check out our blog post</a>.</p>



<h2 class="wp-block-heading" id="when-one-task-becomes-many-use-orchestrate">When one task becomes many, use <code>/orchestrate</code></h2>



<p class="wp-block-paragraph">Not every task fits neatly into a single workflow. Sometimes you need to make changes across multiple repositories or tackle several related tasks at once. <code>/orchestrate</code> helps you coordinate work across sessions and repositories by breaking larger efforts into smaller tasks that can move forward in parallel.</p>



<ul class="wp-block-list">
<li><strong>Coordinate changes across repositories.</strong> When a feature touches multiple codebases, <code>/orchestrate</code> can help you track the work and coordinate updates across each repository.</li>



<li><code>/orchestrate I need to add support for a new authentication flow across our frontend, backend, and shared repositories. Help me break down the work and coordinate the changes needed in each codebase.</code></li>



<li><strong>Manage parallel development tasks.</strong> For larger projects, Copilot can divide the work into focused efforts so multiple pieces can move forward together.</li>



<li><code>/orchestrate Prepare this feature for release. Identify the work needed for implementation, testing, documentation, and deployment, then help coordinate each task.</code></li>
</ul>



<h2 class="wp-block-heading" id="your-next-workflow-starts-with">Your next workflow starts with <code>/</code></h2>



<p class="wp-block-paragraph">You don&rsquo;t need to memorize any commands to get started. Pick a few slash commands that match how you work and build from there. The autocomplete menu has your back for the rest. Type <code>/</code> and start exploring! You can also <a href="https://docs.github.com/copilot/concepts/agents/github-copilot-app">read our docs</a> to learn more about the GitHub Copilot app.</p>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph"><a href="https://github.com/features/ai/github-app">Try slash commands in the GitHub Copilot app</a>, or <a href="https://docs.github.com/copilot/reference/github-copilot-app-reference/slash-commands">check out our docs</a> for a list of available commands.</p>
</div>

<p>The post <a href="https://github.blog/ai-and-ml/github-copilot/a-guide-to-slash-commands-in-the-github-copilot-app/">A guide to slash commands in the GitHub Copilot app</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>