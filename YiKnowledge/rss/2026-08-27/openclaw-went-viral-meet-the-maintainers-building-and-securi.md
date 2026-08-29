---
title: OpenClaw went viral. Meet the maintainers building and securing it.
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-29'
source: https://github.blog/open-source/maintainers/openclaw-went-viral-meet-the-maintainers-building-and-securing-it/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Thu, 27 Aug 2026 16:00:00 +0000
author: Gregg Cochran
---

<p class="wp-block-paragraph">What began as a personal experiment quickly became a global open source project with extraordinary momentum.</p>



<p class="wp-block-paragraph"><a href="https://github.com/openclaw/openclaw">OpenClaw</a> is a personal AI assistant that runs on users&rsquo; devices and connects with the messaging channels they already use. Started by Peter Steinberger as a weekend project in November 2025, its GitHub repository has grown to approximately 388,000 stars, 81,000 forks, and more than 80,000 commits by August 26, 2026.</p>



<p class="wp-block-paragraph">In this video interview, filmed just six months into the project, creator Peter Steinberger and several OpenClaw maintainers discuss managing a surge of pull requests, rethinking contributor trust and code review, addressing software supply chain risks, and balancing powerful agent capabilities with security. They also share security lessons from the <a href="https://github.com/open-source/github-secure-open-source-fund">GitHub Secure Open Source Fund</a> and the value of connecting with maintainers facing similar challenges. Watch the full video above, then explore the key lessons below.</p>



<h2 class="wp-block-heading" id="h-people-in-this-video">People in this video</h2>



<p class="wp-block-paragraph">The following maintainers shared their experiences maintaining and securing OpenClaw.</p>



<ul class="wp-block-list">
<li><a href="https://www.linkedin.com/in/steipete/">Peter Steinberger</a>, Creator of OpenClaw</li>



<li><a href="https://www.linkedin.com/in/bradgroux/">Brad Groux</a>, CEO, Digital Meld</li>



<li><a href="https://www.linkedin.com/in/joshavant/?skipRedirect=true">Josh Avant</a>, Member of technical staff, OpenClaw Foundation</li>



<li><a href="https://www.linkedin.com/in/jalehman1/">Josh Lehman</a>, Martian Engineering</li>



<li><a href="https://www.linkedin.com/in/sally-ann-omalley/">Sally O&rsquo;Malley</a>, Principal software engineer at Red Hat</li>



<li><a href="https://www.linkedin.com/in/buns/">Val Alexander</a>, OpenCoven</li>



<li><a href="https://www.linkedin.com/in/koconder/">Vincent Koc</a>, Chief architect, OpenClaw Foundation</li>
</ul>



<p class="wp-block-paragraph">Here are the top 10 lessons that we took away from the conversation.</p>



<h2 class="wp-block-heading" id="h-lessons-1-3-how-ai-changed-contributions-and-community">Lessons 1&ndash;3: How AI changed contributions and community</h2>



<h3 class="wp-block-heading" id="h-1-pull-requests-became-prompt-requests">1. Pull requests became prompt requests</h3>



<p class="wp-block-paragraph">OpenClaw&rsquo;s maintainers found themselves managing thousands of pull requests and issues, with some contributors opening hundreds of pull requests at once.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">I&nbsp;don&rsquo;t&nbsp;even call them pull requests. I call them prompt requests.</p>
<cite>Peter Steinberger</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">There were some contributors that had multiple hundreds of pull requests running these sort of automated software factories that were just mining everything for issues.</p>
<cite>Josh Lehman</cite></blockquote>



<p class="wp-block-paragraph">The challenge shifted from attracting participation to finding valuable contributions amid a flood of activity that could overwhelm human review.</p>



<h3 class="wp-block-heading" id="h-2-keep-the-door-open-for-new-contributors">2. Keep the door open for new contributors</h3>



<p class="wp-block-paragraph">OpenClaw&rsquo;s maintainers wanted the project to be welcoming to new participants, whether they were first-time open source contributors, non-developers solving a specific problem, or people using AI agents to help. Rather than dismissing imperfect contributions, they looked for promising ideas and worked with contributors to refine, rewrite, or complete the final changes themselves.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">I know how it felt when, many years ago, my first pull request was accepted on a project.</p>
<cite>Peter Steinberger</cite></blockquote>



<p class="wp-block-paragraph">Some of the first-time contributions that were merged came from people without a development background. They used an agent to create a pull request, and worked with maintainers to finish the change.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">A good proportion of those first-time pull requests that got merged are from non-developers. They&rsquo;re just people that have a specific problem and a need.</p>
<cite>Vincent Koc</cite></blockquote>



<h3 class="wp-block-heading" id="h-3-agents-save-time-but-make-it-harder-to-sign-off">3. Agents save time but make it harder to sign off</h3>



<p class="wp-block-paragraph">The maintainers described two very different outcomes from the same technology: agents can help people reclaim time, but they can also make it harder to stop working.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">I&rsquo;ve seen the other side of it, where people are just so in love with it and they realize, wow, if I don&rsquo;t sleep tonight, I can do what used to take a week for me to do.</p>
<cite>Val Alexander</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">I have three kids. They&rsquo;re very small. OpenClaw lets me manage agents that go and work for me so I can get back to playing with my kids.</p>
<cite>Josh Lehman</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">Sometimes the maintainers will go on the channel and say, &lsquo;I&rsquo;m&nbsp;going to touch grass now.&nbsp;I&rsquo;m&nbsp;taking a few hours off.&rsquo;</p>
<cite>Sally O&rsquo;Malley</cite></blockquote>



<p class="wp-block-paragraph">Agents are neither good nor bad for work-life balance. But they amplify both the opportunity to do more and the importance of knowing when to step away.</p>



<h2 class="wp-block-heading" id="h-lessons-4-6-how-maintainers-adapted">Lessons 4-6: How maintainers adapted</h2>



<h3 class="wp-block-heading" id="h-4-earn-trust-by-finding-where-you-can-add-value">4. Earn trust by finding where you can add value</h3>



<p class="wp-block-paragraph">There was no single path to becoming an OpenClaw maintainer. Some contributors arrived through security work, others through integrations or community participation, but the common thread was finding a way to add value and taking ownership.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">Peter ignored me, so I was like, how else can I get his attention? Security.</p>
<cite>Vincent Koc</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">I&rsquo;m a Microsoft guy, so I thought, is there a plugin for Microsoft Teams?</p>
<cite>Brad Groux</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">I looked into the community and I was in voice chat, and people were asking a lot of questions, and I was like, well, how can I add value in these conversations?</p>
<cite>Val Alexander</cite></blockquote>



<h3 class="wp-block-heading" id="h-5-the-new-trust-signal-is-showing-your-work">5. The new trust signal is showing your work</h3>



<p class="wp-block-paragraph">As contribution counts became less informative, the team identified evidence that could help a pull request stand out: agent transcripts, screenshots, testing, and an explanation of the contributor&rsquo;s thinking.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">If you provide us with the transcripts, we&nbsp;actually see&nbsp;how you came to the pull request and your discussion with the agent. Incredibly valuable. If you add screenshots, you can prove that you tested this.</p>
<cite>Peter Steinberger</cite></blockquote>



<p class="wp-block-paragraph">The important question was not simply whether a human or an agent wrote the code. It was whether the contributor understood the feature and had considered how it interacted with the rest of the project.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">Nobody cares if you wrote the code or not, but we care if you actually thought about this feature.</p>
<cite>Peter Steinberger</cite></blockquote>



<h3 class="wp-block-heading" id="h-6-maintainers-are-reviewing-agent-code-with-agents">6. Maintainers are reviewing agent code with agents</h3>



<p class="wp-block-paragraph">Maintainers increasingly relied on AI tools to help review AI-generated contributions, while also taking a more hands-on approach to improving submitted code.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">Whenever I get a pull request from an AI, one thing I love to do now is use GitHub Copilot for all the reviews. I just press a button right there. It does a review and generates clarity on all the files that are attached, what the files mean, and how they changed.</p>
<cite>Val Alexander</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">This is the first project where I saw it become normalized that when someone submits a pull request, as a maintainer, you just edit it. You just make it right.</p>
<cite>Josh Lehman</cite></blockquote>



<h2 class="wp-block-heading" id="h-lessons-7-9-security-challenges">Lessons 7&ndash;9: Security challenges</h2>



<h3 class="wp-block-heading" id="h-7-reputation-became-an-attack-surface">7. Reputation became an attack surface</h3>



<p class="wp-block-paragraph">Contribution history itself could be manipulated. OpenClaw&rsquo;s maintainers saw people duplicate existing pull requests, and Vincent Koc explains why.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">People would basically duplicate other people&rsquo;s pull requests. What they were attempting to do here was to build credibility, because we had these badges, like how many you&rsquo;ve merged. So the more merges you had, it was like a trust signal to us maintainers.</p>
<cite>Vincent Koc</cite></blockquote>



<p class="wp-block-paragraph">Peter described a company using an automated pull request to promote their product. The team had to identify duplicate work and determine which pull request was the original.</p>



<p class="wp-block-paragraph">The code was not the only thing the project needed to evaluate. Maintainers also had to reconsider the social signals they used to decide what, and whom, to trust.</p>



<h3 class="wp-block-heading" id="h-8-safe-by-default-depends-on-who-you-ask">8. &ldquo;Safe by default&rdquo; depends on who you ask</h3>



<p class="wp-block-paragraph">What feels safe to one user may feel unnecessarily restrictive to another.</p>



<p class="wp-block-paragraph">The tradeoff was clear in practice. Tighter workspace restrictions generated user complaints, while fewer restrictions could expose the project to security incidents.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">It&rsquo;s really often a hard game to find the right balance between making it really convenient for users and also building something that is safe enough as a default.</p>
<cite>Peter Steinberger</cite></blockquote>



<p class="wp-block-paragraph">Secure defaults must account for an agent&rsquo;s capabilities, what users understand, and what a particular environment is prepared to allow.</p>



<h3 class="wp-block-heading" id="h-9-know-who-maintains-your-dependencies">9. Know who maintains your dependencies</h3>



<p class="wp-block-paragraph">Recent supply chain attacks pushed the maintainers to think more carefully about both the dependencies they relied on and their relationship with the projects behind them.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">We went through our dependencies with a fine-tooth comb. What it&rsquo;s pushed us to do is actually reduce the core dependencies, but also create a relationship with the maintainers that we have a dependency on.</p>
<cite>Vincent Koc</cite></blockquote>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">It&rsquo;s not the default that companies actually try to contribute back instead of just maintaining a fork and not caring.</p>
<cite>Peter Steinberger</cite></blockquote>



<h2 class="wp-block-heading" id="h-lesson-10-how-the-github-secure-open-source-fund-helped">Lesson 10: How the GitHub Secure Open Source Fund helped</h2>



<p class="wp-block-paragraph">Participants described the GitHub Secure Open Source Fund as both a security learning experience and a way to connect with maintainers confronting similar, often overwhelming, problems.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">The presenter was like, first, go get a cup of coffee. Step one, take a breath. It connected us to the human element of being a maintainer.</p>
<cite>Josh Avant</cite></blockquote>



<p class="wp-block-paragraph">The program provided greater awareness of security practices and helped participating maintainers understand how to prompt agents.</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p class="wp-block-paragraph">We have agents now, and they can do just about anything that you ask them to do, but you still have to know what to ask them to do. Now I have the ability to know what to ask for.</p>
<cite>Josh Lehman</cite></blockquote>



<p class="wp-block-paragraph">Vincent emphasized the value of meeting other maintainers who were experiencing the same challenges of securing open source projects. The program gave participants a community they could tap into and learn from as those challenges continued.</p>



<h2 class="wp-block-heading" id="h-continue-the-conversation">Continue the conversation</h2>



<p class="wp-block-paragraph"><a href="https://www.youtube.com/watch?v=5VSwaUXtPIE">Watch the full conversation</a> to hear how OpenClaw&rsquo;s maintainers are adapting when contributions scale faster than the human systems used to review, secure, and sustain them.</p>



<p class="wp-block-paragraph">OpenClaw participated in Session 4 of the GitHub Secure Open Source Fund. To learn more, read <a href="https://github.blog/open-source/maintainers/what-50-open-source-projects-taught-us-about-security-in-the-ai-era/">What 50 open source projects taught us about security in the AI era.</a></p>



<p class="wp-block-paragraph"><a href="https://github.com/open-source/github-secure-open-source-fund">Applications for the GitHub Secure Open Source Fund are now open</a><strong>.</strong> If you&rsquo;re maintaining an open source project, apply to learn from security experts, connect with fellow maintainers, and strengthen the security of your project.</p>



<p class="wp-block-paragraph"><a href="https://github.com/orgs/community/discussions/205852">Head over to the GitHub Community</a> and ask the maintainers what it&rsquo;s really like building the fastest-growing open source project in GitHub history!</p>



<h2 class="wp-block-heading" id="h-thank-you-to-all-github-secure-open-source-fund-partners">Thank you to all GitHub Secure Open Source Fund Partners</h2>



<p class="wp-block-paragraph">Together, we are helping secure the open source ecosystem for everyone!</p>



<p class="wp-block-paragraph"><strong>Funding Partners:</strong> Alfred P. Sloan Foundation, American Express, Chainguard, Datadog, Herodevs, Kraken, Mayfield, Microsoft, Shopify, Stripe, Superbloom, Vercel, Zerodha, 1Password</p>



<figure class="wp-block-image size-large"><img alt="A decorative header image showing GitHub Secure Open Source Fund, powered by GitHub Sponsors. Logos below are: Alfred P. Sloan Foundation, American Express, chainguard, Datadog, herdevs, Kraken, Microsoft, Mayfield, Shopify, stripe, superbloom, Vercel, 1Password, Zerodha" class="wp-image-93832" height="538" src="https://github.blog/wp-content/uploads/2026/02/header.jpg?resize=1024%2C538" width="1024" /></figure>



<p class="wp-block-paragraph"><strong>Ecosystem Partners</strong>: Atlantic Council, Ecosyste.ms, CURIOSS, Digital Data Design Institute Lab for Innovation Science, Digital Infrastructure Insights Fund, Microsoft for Startups, Mozilla, OpenForum Europe, Open Source Collective, OpenUK, Open Technology Fund, OpenSSF, Open Source Initiative, OpenJS Foundation, University of California, OWASP, Santa Cruz OSPO, Sovereign Tech Agency, SustainOSS</p>



<figure class="wp-block-image size-large"><img alt="" class="wp-image-98184" height="328" src="https://github.blog/wp-content/uploads/2026/08/soss_grid_feb_2026_3.webp?resize=1024%2C328" width="1024" /></figure>



<div class="wp-block-group post-content-cta has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
<p class="wp-block-paragraph">Looking for practical security steps you can take for your project? <a href="https://gh.io/gh-secure">Set up the security baseline for your project in one minute &gt;</a></p>
</div>

<p>The post <a href="https://github.blog/open-source/maintainers/openclaw-went-viral-meet-the-maintainers-building-and-securing-it/">OpenClaw went viral. Meet the maintainers building and securing it.</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>