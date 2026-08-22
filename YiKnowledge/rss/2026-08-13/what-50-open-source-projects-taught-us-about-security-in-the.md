---
title: What 50 open source projects taught us about security in the AI era
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-22'
source: https://github.blog/open-source/maintainers/what-50-open-source-projects-taught-us-about-security-in-the-ai-era/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Thu, 13 Aug 2026 16:00:00 +0000
author: Gregg Cochran
---

<p class="wp-block-paragraph">AI is changing the pace of open source development and the security challenges that come with it. Maintainers are reviewing unfamiliar contributions, managing new attack surfaces, and responding to vulnerabilities with limited time and resources.</p>



<p class="wp-block-paragraph">Session 4 of the <a href="https://github.com/open-source/github-secure-open-source-fund">GitHub Secure Open Source Fund</a> tested a practical response. The Secure Fund invested more than <strong>$500,000 across 50 projects</strong>, pairing maintainers with <a href="https://securitylab.github.com/">GitHub Security Lab</a> experts, GitHub security tools, AI-assisted workflows, and a peer community.</p>



<p class="purple-text text-gradient-purple-coral wp-block-paragraph"><strong>One lesson emerged consistently:</strong> <strong>AI can help maintainers investigate, prioritize, and respond faster. Maintainers still provide the context, judgement, and accountability required to decide what ships.</strong></p>



<p class="wp-block-paragraph"><a href="https://github.com/openclaw/openclaw">OpenClaw</a> was invited to participate in Session 4 because it is GitHub&rsquo;s fastest-growing open source project, and its maintainers wanted to strengthen its security posture.</p>



<p class="wp-block-paragraph">By the end of Session 4, <a href="https://github.com/openclaw/openclaw">OpenClaw</a> developed an incident response plan, expanded its use of GitHub security tooling, audited its GitHub Actions workflows, and strengthened its processes for identifying and responding to security issues.</p>



<p class="wp-block-paragraph"><strong>The maintainers shared:</strong></p>



<figure class="wp-block-image size-full"><img alt="OPENCLAW:&#8203;

'The program was invaluable in building the team's security muscle and intuition, and most of all ensuring we develop a safer claw for all.'" class="wp-image-98189" height="1080" src="https://github.blog/wp-content/uploads/2026/08/openclaw.png?resize=1920%2C1080" width="1920" /></figure>



<p class="wp-block-paragraph">OpenClaw&rsquo;s experience reflects the broader story of Session 4. While the specific risks varied across the cohort, maintainers shared a consistent need: the knowledge, tools, and expert support to secure software as AI changed how they built it.</p>



<p class="wp-block-paragraph">Across the program, maintainers turned that support into concrete security improvements. Projects strengthened established practices, prepared for emerging AI-related risks, and explored how tools like <a href="https://github.com/features/copilot">GitHub Copilot</a> could support vulnerability triage, threat modeling, code review, and remediation.</p>



<figure class="wp-block-image size-large"><img alt="UAPARSER.JS:&#8203;

'The program helped us to improve security continuously: from securing workflows, incident response planning, and more. Also, GitHub Copilot can be an amazing tool for improving security!'" class="wp-image-98203" height="576" src="https://github.blog/wp-content/uploads/2026/08/uaparser.png?resize=1024%2C576" width="1024" /></figure>



<p class="wp-block-paragraph">The benefits extend beyond individual projects. When maintainers strengthen the security of widely used open source software, they help build a more resilient ecosystem for everyone who depends on it.</p>



<aside class="wp-block-group post-aside--large p-4 p-md-6 is-style-light-dimmed has-global-padding is-layout-constrained wp-block-group-is-layout-constrained is-style-light-dimmed--1" style="border-top-width: 4px;">
<h2 class="wp-block-heading h5-mktg gh-aside-title is-typography-preset-h5" id="h-nbsp-session-4-by-the-numbers" style="margin-top: 0;">&nbsp;Session 4, by the numbers</h2>



<ul class="wp-block-list">
<li><strong>50</strong> projects</li>



<li><strong>71</strong> maintainers</li>



<li><strong>22</strong> Countries</li>



<li><strong>$500,000+</strong> in non-dilutive funding powered by <a href="https://github.com/open-source/sponsors">GitHub Sponsors</a></li>



<li><strong>92%</strong> of projects completed the program with core GitHub security features enabled&ndash;secret scanning, code scanning, protected branches, private vulnerability reporting, Dependabot</li>



<li><a href="https://github.com/GitHubSecurityLab/gh-secure">Learn more or enable these security features</a> for your own project.</li>
</ul>



<p class="wp-block-paragraph"><strong>Security results across all sessions:</strong></p>



<p class="wp-block-paragraph">Across all GitHub Secure Open Source Fund Sessions and follow-up periods through August 2026:</p>



<ul class="wp-block-list">
<li><strong>188</strong> projects and <strong>290</strong> maintainers have participated across <strong>42</strong> countries</li>



<li>GitHub, Microsoft, and external funding partners have contributed <strong>$1.88 million</strong>, distributed through <a href="https://github.com/open-source/sponsors">GitHub Sponsors.</a></li>



<li>Participating projects have identified and disclosed <strong>533</strong> new CVEs, performed more than <strong>1,500</strong> Dependabot security updates, and resolved more than <strong>650</strong> exposed secrets.</li>



<li>During the last six months ending in July 2026, participating and Alumni projects fixed <strong>4,210</strong> <a href="https://docs.github.com/en/code-security/concepts/code-scanning/codeql/about-code-scanning-with-codeql">CodeQL</a> alerts and blocked <strong>119</strong> secrets from being exposed.</li>
</ul>
</aside>



<h2 class="wp-block-heading" id="h-how-the-github-secure-open-source-fund-works">How the GitHub Secure Open Source Fund works</h2>



<p class="wp-block-paragraph">The GitHub Secure Open Source Fund links funding directly to measurable security outcomes. The program combines hands-on security education, direct engagement with GitHub Security Lab experts, and a trusted community where maintainers can work through security challenges with their peers.</p>



<p class="wp-block-paragraph">Each session is a three-week sprint and engagement for a total of 12 months. Funding and participation are tied directly to outcome&#8209;driven goals and verified security improvements.</p>



<p class="wp-block-paragraph">The sprint is designed and curated by the <a href="https://securitylab.github.com/"><strong>GitHub Security Lab</strong></a><strong>,</strong> and delivered by security experts from GitHub and our partners. The training is structured into different focus areas per week.</p>



<p class="wp-block-paragraph">These include:</p>



<ul class="wp-block-list">
<li><strong>Foundations of open source security</strong></li>



<li><strong>Threat modeling and secure coding</strong></li>



<li><strong>AI security and vulnerability management</strong></li>
</ul>



<p class="wp-block-paragraph">Throughout this program, each project receives $10,000 USD via <a href="https://github.com/sponsors">GitHub Sponsors</a> (which breaks down to $6,000 USD during the sprint and $2,000 USD at six- and 12-month security check-ins). Projects are invited to a new security-focused community and office hours with the <a href="https://securitylab.github.com/">GitHub Security Lab</a>, which they can take advantage of during the full 12 months. They also receive security resources to immediately implement in their project and <a href="https://azure.microsoft.com/en-us">Azure</a> credits for cloud infrastructure.</p>



<ul class="wp-block-list">
<li><a href="https://resources.github.com/github-secure-open-source-fund/">Learn more about the Secure Open Source Fund.</a></li>



<li><a href="https://github.com/open-source/github-secure-open-source-fund">Apply for Session 5 of the GitHub Secure Open Source Fund before August 24.</a></li>



<li><a href="https://forms.cloud.microsoft/r/HeMiufJcMD">Become a Funding or Ecosystem Partner of the GitHub Secure Open Source Fund.</a></li>
</ul>



<h2 class="wp-block-heading" id="h-where-security-work-happened-in-session-4">Where security work happened in Session 4</h2>



<p class="wp-block-paragraph">Session 4 focused on improving security across the systems developers rely on every day. The projects below are grouped by the role they play in the software ecosystem.</p>



<h2 class="wp-block-heading" id="h-ai-machine-learning-and-intelligent-systems">AI, machine learning, and intelligent systems &#129302;</h2>



<p class="wp-block-paragraph"><a href="https://github.com/Garudex-Labs/Caracal">Caracal</a> &bull; <a href="https://github.com/langchain-ai/deepagents">Deep Agents</a> &bull; <a href="https://github.com/arc53/DocsGPT">DocsGPT</a> &bull; <a href="https://github.com/LadybugDB/ladybug">LadybugDB</a> &bull; <a href="https://github.com/langchain-ai/langchain">LangChain</a> &bull; <a href="https://github.com/czlonkowski/n8n-mcp">n8n-MCP</a> &bull; <a href="https://github.com/Nasiko-Labs/nasiko">Nasiko</a> &bull; <a href="https://github.com/onnx/onnx">ONNX</a> &bull; <a href="https://github.com/openclaw/openclaw">OpenClaw</a> &bull; <a href="https://github.com/VectifyAI/PageIndex">PageIndex</a> &bull; <a href="https://github.com/BerkeleyLearnVerify/Scenic">Scenic</a> &bull; <a href="https://github.com/oraios/serena">Serena</a></p>



<p class="wp-block-paragraph">These projects sit at the intersection of AI, automation, data infrastructure, and machine learning. They increasingly serve as foundational components for modern AI workflows and production deployments. As AI adoption accelerates, security improvements in these projects help establish stronger foundations for emerging AI ecosystems.</p>



<figure class="wp-block-image size-full"><img alt="OPEN NEURAL NETWORK EXCHANGE:&#8203;

'The program gave us a structured overview of where to improve and directly connected us to the experts who could help us get there.'" class="wp-image-98274" height="1100" src="https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-13-at-9.06.29-AM.png?resize=1962%2C1100" width="1962" /></figure>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<figure class="wp-block-image size-full"><img alt="NASIKO:&#8203;

'This program helped us turn security into concrete engineering work for an AI Agentic platform. We responded to a real supply-chain issue, tightened dependency controls, and got much clearer about AI-specific risks like untrusted agents, prompt injection, and secrets exposure.'" class="wp-image-98213" height="1080" src="https://github.blog/wp-content/uploads/2026/08/image-8.png?resize=1920%2C1080" width="1920" /></figure>



<h2 class="wp-block-heading" id="h-build-systems-supply-chain-and-release-tooling">Build systems, supply chain, and release tooling &#129520;</h2>



<p class="wp-block-paragraph"><a href="https://github.com/browserslist/browserslist">browserslist</a> &bull; <a href="https://github.com/CycloneDX/cyclonedx-python-lib">CycloneDX Python Library</a> &bull; <a href="https://github.com/cucumber">Cucumber</a> &bull; <a href="https://github.com/golangci/golangci-lint">golangci-lint</a> &bull; <a href="https://github.com/jreleaser/jreleaser">JReleaser</a> &bull; <a href="https://github.com/postcss/postcss">postcss</a> &bull; <a href="https://github.com/go-task/task">Task</a></p>



<p class="wp-block-paragraph">These projects help developers test, validate, package, release, and maintain software across diverse environments. Tools in this group influence everything from software bills of materials and release pipelines to code quality and testing automation.</p>



<figure class="wp-block-image size-large is-resized"><img alt="JRELEASER:&#8203;&#8203;

'We were able to harden our CI setup, as well as adopt verifiable security measures.'" class="wp-image-98194" height="576" src="https://github.blog/wp-content/uploads/2026/08/jreleaser.png?resize=1024%2C576" style="width: 1006px; height: auto;" width="1024" /></figure>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<figure class="wp-block-image size-large"><img alt="GOLANGCI-LINT:&#8203;

'The program was a safe space to talk about our security challenges and helped us see the blind spots in our security process.'" class="wp-image-98196" height="576" src="https://github.blog/wp-content/uploads/2026/08/golangci.png?resize=1024%2C576" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-core-programming-languages-runtimes-and-foundational-libraries">Core programming languages, runtimes, and foundational libraries &#128218;</h2>



<p class="wp-block-paragraph"><a href="https://github.com/raphw/byte-buddy">Byte Buddy</a> &bull; <a href="https://github.com/zloirock/core-js">core-js</a> &bull; <a href="https://github.com/typelevel/fs2">FS2</a> &bull; <a href="https://github.com/gleam-lang/gleam">Gleam</a> &bull; <a href="https://github.com/bigskysoftware/htmx">htmx</a> &bull; <a href="https://github.com/apple/pkl">Pkl</a> &bull; <a href="https://github.com/pyodide/pyodide">Pyodide</a> &bull; <a href="https://github.com/termcolor/termcolor">termcolor</a></p>



<p class="wp-block-paragraph">These projects help define how software is written, configured, executed, and extended. Improvements at this layer flow downstream to thousands of applications and developer ecosystems.</p>



<p class="wp-block-paragraph">Security improvements in foundational runtimes and libraries can extend downstream to the many tools and applications that depend on them.</p>



<figure class="wp-block-image size-large"><img alt="GLEAM:&#8203;

'We have meaningfully improved Gleam's security, and now we are able to pass these learnings onto our users and their projects.'" class="wp-image-98197" height="576" src="https://github.blog/wp-content/uploads/2026/08/gleam.png?resize=1024%2C576" width="1024" /></figure>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<figure class="wp-block-image size-large"><img alt="Typelevel FS2:

'We developed a custom Advanced Security Configuration and activated it for hundreds of repositories across our organization.'" class="wp-image-98238" height="575" src="https://github.blog/wp-content/uploads/2026/08/634926908-69ddd86d-7d01-4c2d-8caf-b61255c43221.png?resize=1024%2C575" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-developer-tools-and-productivity-platforms">Developer tools and productivity platforms &#9874;&#65039;</h2>



<p class="wp-block-paragraph"><a href="https://github.com/cheeriojs/cheerio">cheerio</a> &bull; <a href="https://github.com/bee-san/ciphey">Ciphey</a> &bull; <a href="https://github.com/instavm/coderunner">CodeRunner</a> &bull; <a href="https://github.com/hoppscotch/hoppscotch">Hoppscotch</a> &bull; <a href="https://github.com/mapstruct/mapstruct">MapStruct</a> &bull; <a href="https://github.com/python-pillow/Pillow">Python Pillow</a> &bull; <a href="https://github.com/ProyectoRespira/">Proyecto Respira</a> &bull; <a href="https://github.com/readest/readest">Readest</a> &bull; <a href="https://github.com/ToolJet/ToolJet">ToolJet</a> &bull; <a href="https://github.com/vuetifyjs/vuetify">Vuetify</a> &bull; <a href="https://github.com/yjs/yjs">Yjs</a></p>



<p class="wp-block-paragraph">These projects shape the everyday experience of building, testing, collaborating on, and using software. Many serve as widely adopted utilities, applications, and platforms that appear throughout developer environments and application stacks.</p>



<p class="wp-block-paragraph">Together, this group supports API development, low-code platforms, collaborative applications, content processing, and software delivery workflows. When infrastructure projects become more resilient, the benefits extend far beyond a single application and strengthen entire technology ecosystems.</p>



<figure class="wp-block-image size-large"><img alt="Python Pillow:&#8203;

'We now have an IRP, STRIDE threat model, SBOM-generator, AGENTS.md and more on the way.'" class="wp-image-98198" height="576" src="https://github.blog/wp-content/uploads/2026/08/python-pillow.png?resize=1024%2C576" width="1024" /></figure>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<figure class="wp-block-image size-large"><img alt="CHEERIO:&#8203;

'Dealing with CVEs was a big fear before this program. Now, we have the tools to deal with incidents as they come up.'" class="wp-image-98199" height="576" src="https://github.blog/wp-content/uploads/2026/08/cheerio.png?resize=1024%2C576" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-web-networking-apis-and-infrastructure-services">Web, networking, APIs, and infrastructure services &#128202;</h2>



<p class="wp-block-paragraph"><a href="https://github.com/actix/actix-web">actix-web</a> &bull; <a href="https://github.com/aio-libs/aiohttp">aiohttp</a> &bull; <a href="https://github.com/apache/solr">Apache Solr</a> &bull; <a href="https://github.com/apache/zookeeper">Apache ZooKeeper</a> &bull; <a href="https://github.com/etcd-io/etcd">etcd</a> &bull; <a href="https://github.com/fastapi/fastapi">FastAPI</a> &bull; <a href="https://github.com/haraka/Haraka">Haraka</a> &bull; <a href="https://github.com/hummingbird-project/hummingbird">Hummingbird</a> &bull; <a href="https://github.com/gabriel-vasile/mimetype">mimetype</a> &bull; <a href="https://github.com/GyulyVGC/sniffnet">Sniffnet</a> &bull; <a href="https://github.com/Kludex/starlette">Starlette</a> &bull; <a href="https://github.com/faisalman/ua-parser-js">UAParser.js</a></p>



<p class="wp-block-paragraph">These projects form part of the internet&rsquo;s operational backbone. They handle APIs, networking, search, messaging, service coordination, and distributed systems infrastructure relied on by organizations around the world.</p>



<p class="wp-block-paragraph">This group includes technologies that sit on the critical path of modern cloud applications and internet services.</p>



<figure class="wp-block-image size-large"><img alt="FASTAPI:&#8203;

'The program increased the certainty in how security is handled in FastAPI and friends.'" class="wp-image-98200" height="576" src="https://github.blog/wp-content/uploads/2026/08/fastapi.png?resize=1024%2C576" width="1024" /></figure>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<figure class="wp-block-image size-large"><img alt="APACHE SOLR&trade;:&#8203;

'While Apache's basic practices and policies have a lot of the traditional security risks covered, the quickly changing landscape of AI is clearly something we will need to actively track and adapt to.'" class="wp-image-98201" height="576" src="https://github.blog/wp-content/uploads/2026/08/solr.png?resize=1024%2C576" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-ai-security-as-a-shared-frontier">AI security as a shared frontier</h2>



<p class="wp-block-paragraph">AI-related security questions appeared across projects in Session 4, from machine learning infrastructure and agent frameworks to developer tools and internet infrastructure.</p>



<p class="wp-block-paragraph">At the same time, established security responsibilities did not go away. Maintainers still needed to manage vulnerabilities, secure dependencies, protect release workflows, and prepare for incidents. AI introduced new risks and increased the speed at which maintainers needed to understand and respond to them.</p>



<p class="wp-block-paragraph">The lesson from Session 4 is clear: AI security is not evolving in isolation. It is becoming part of the broader practice of building secure software. As that shift continues, maintainers will need practical education, trusted communities, and expert support that can evolve with them.</p>



<figure class="wp-block-image size-large"><img alt="HUMMINGBIRD:&#8203;

'It's provided us the tools and know-how to review security across our tools and the rest of the ecosystem. It's had a massive impact.'" class="wp-image-98202" height="576" src="https://github.blog/wp-content/uploads/2026/08/hummingbird.png?resize=1024%2C576" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-thank-you-to-all-of-our-partners">Thank you to all of our partners</h2>



<p class="wp-block-paragraph">We couldn&rsquo;t do this without our incredible network of partners. Together, we are helping secure the open source ecosystem for everyone!</p>



<p class="wp-block-paragraph"><strong>Funding Partners:</strong> Alfred P. Sloan Foundation, American Express, Chainguard, Datadog, Herodevs, Kraken, Mayfield, Microsoft, Shopify, Stripe, Superbloom, Vercel, Zerodha, 1Password</p>



<figure class="wp-block-image size-large"><img alt="A decorative header image showing GitHub Secure Open Source Fund, powered by GitHub Sponsors. Logos below are: Alfred P. Sloan Foundation, American Express, chainguard, Datadog, herdevs, Kraken, Microsoft, Mayfield, Shopify, stripe, superbloom, Vercel, 1Password, Zerodha" class="wp-image-93832" height="538" src="https://github.blog/wp-content/uploads/2026/02/header.jpg?resize=1024%2C538" width="1024" /></figure>



<p class="wp-block-paragraph"><strong>Ecosystem Partners</strong>: Atlantic Council, Ecosyste.ms, CURIOSS, Digital Data Design Institute Lab for Innovation Science, Digital Infrastructure Insights Fund, Microsoft for Startups, Mozilla, OpenForum Europe, Open Source Collective, OpenUK, Open Technology Fund, OpenSSF, Open Source Initiative, OpenJS Foundation, University of California, OWASP, Santa Cruz OSPO, Sovereign Tech Agency, SustainOSS</p>



<figure class="wp-block-image size-large"><img alt="" class="wp-image-98184" height="328" src="https://github.blog/wp-content/uploads/2026/08/soss_grid_feb_2026_3.webp?resize=1024%2C328" width="1024" /></figure>

<p>The post <a href="https://github.blog/open-source/maintainers/what-50-open-source-projects-taught-us-about-security-in-the-ai-era/">What 50 open source projects taught us about security in the AI era</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>