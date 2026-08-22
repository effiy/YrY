---
title: 'Fragments: May  5'
tags:
- Martin Fowler
category: leader/architecture
created: '2026-08-22'
source: https://martinfowler.com/fragments/2026-05-05.html
type: rss
source_name: Martin Fowler
source_url: https://martinfowler.com/feed.atom
author: Martin Fowler (martin@martinfowler.com)
---

<p>Over the last couple of months Rahul Garg published a series of posts here on how to <a href="https://martinfowler.com/articles/reduce-friction-ai/">reduce the friction in AI-assisted programming</a>. To make it easier to put these ideas into practice he’s now built an <a href="https://martinfowler.com/articles/reduce-friction-ai/#ThesePatternsAsInstallableInfrastructure">open-source framework to operationalize these patterns</a>.</p>

<blockquote>
  <p>AI coding assistants jump straight to code, silently make design decisions, forget constraints mid-conversation, and produce output nobody reviewed against real engineering standards. Lattice fixes this with composable skills in three tiers – atoms, molecules, refiners – that embed battle-tested engineering disciplines (Clean Architecture, DDD, design-first methodology, secure coding, and more), plus a living context layer (the .lattice/ folder) that accumulates your project’s standards, decisions, and review insights. The system gets smarter with use – after a few feature cycles, atoms aren’t applying generic rules, they’re applying your rules, informed by your history.</p>
</blockquote>

<p>It can be installed as a Claude Code plugin or downloaded for use with any AI tool.</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>This is also a good point to note that the article by my colleagues Wei Zhang and Jessie Jie Xia on <a href="https://martinfowler.com/articles/structured-prompt-driven/">Structured-Prompt-Driven Development (SPDD)</a> has generated an enormous amount of traffic, and quite a few questions. They have thus added a <a href="https://martinfowler.com/articles/structured-prompt-driven/#faq">Q&amp;A section</a> to the article that answers a dozen of them.</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>Jessica Kerr (Jessitron) posted a merry tidbit of building a tool to work with conversation logs. <a href="https://jessitron.com/2026/04/27/communication-is-hard-but-sometimes-i-can-fix-it/">She observes the double feedback loop</a> involved.</p>

<blockquote>
  <p>There are (at least) two feedback loops running here. One is the development loop, with Claude doing what I ask and then me checking whether that is indeed what I want.[…] Then there’s a meta-level feedback loop, the “is this working?” check when I feel resistance. Frustration, tedium, annoyance–these feelings are a signal to me that maybe this work could be easier.</p>
</blockquote>

<p>The double loop here is both changing the thing we are building but also changing the thing we are using to build the thing we are building.</p>

<blockquote>
  <p>As developers using software to build software, we have potential to mold our own work environment. With AI making software change superfast, changing our program to make debugging easier pays off immediately. Also, this is fun!</p>
</blockquote>

<p>Indeed it is, and makes me think that agents are allowing us to (re)discover one of the Great Lost Joys of software development - that of molding my development environment to exactly fit the problem and my personal tastes. A while ago I wrote about this under the name <a href="https://martinfowler.com/bliki/InternalReprogrammability.html">Internal Reprogramability</a>. It was a central feature of the Smalltalk and Lisp communities but was mostly lost as we got complex and polished IDEs (although the unix command line gives a hint of its appeal).</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>Ashley MacIsaac is a musician from Cape Breton, who plays folk-influenced music (I have a couple of his albums in my collection). Google generated an AI overview that asserted that had been convicted of crimes, including sexual assault and was on the national sex-offender registry. These were completely false, confusing him with another man with the same name. MacIsaac is <a href="https://www.cbc.ca/news/canada/nova-scotia/cape-breton-fiddler-ashley-macisaac-lawsuit-against-google-9.7187490">suing Google for defamation</a>:</p>

<blockquote>
  <p>“This was not a search engine just scanning through things and giving somebody else’s story […] It was published by them. And to me, that is defamation. The guardrails were not there to prevent Google AI from publishing that content.”</p>
</blockquote>

<p>MacIsaac’s point is that Google must take responsibility for what a tool it controls publishes. MacIsaac suffered genuine harm here, not just to his reputation, but he also had a concert canceled and the claims affect his performing.</p>

<blockquote>
  <p>“I felt that tangible fear from something that was published by a media company,” he said in an interview with The Canadian Press. “I feared for my own safety going on stage because of what I was labelled as. And I don’t know how long this will follow me.”</p>
</blockquote>

<p>Too often tech companies try to dodge the consequences of their actions. There are genuine issues about the difficulties of monitoring what’s published at scale, but that’s a responsibility that they should face up to.</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>Stephen O’Grady (RedMonk) takes a serious look at <a href="https://redmonk.com/sogrady/2026/04/29/infrastructure-spend-in-the-ai-era/">how much the big tech companies are spending on AI build-outs</a>. The sums involved are staggering, not just in absolute terms (over $100 Billion), but also compared to the revenues of the companies involved. Firms like Amazon, Alphabet, and Microsoft are spending over 50% of their revenues (not profits).  Meta and Oracle hit or pass 75% of revenues.</p>

<blockquote>
  <p>That level of investment would have been unthinkable a decade ago. Today, the chart suggests it’s table stakes</p>
</blockquote>

<p>There is a notable exception: Apple. Here they are clearly Thinking Different, eyeballing the chart they seem closer to 10% of revenues.</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>Most folks I talk to about agentic programming are using models in the cloud: Claude, Codex, and the like. Everyone agrees these are the most powerful models, the ones that triggered the <a href="https://martinfowler.com/bliki/NovemberInflection.html">November Inflection</a>. But do we need to use the Most Powerful Models, particularly when we have to ship data to them, and pay handsomely for the privilege? Willem van den Ende <a href="https://willemvandenende.com/blog/engineering/my-local-agentic-dev-setup-today">considers an alternative</a>, that local models are Good Enough.</p>

<blockquote>
  <p>Assumptions<br />
- We are all figuring this out.<br />
- Quality of a harness (coding agent + “skills” + extensions) can matter as least as much as the model<br />
- Running open models and an open coding agent + custom extensions takes time, but pays off in understanding and a stable base where engineering effort compounds<br />
- Open, local, models have (for me) crossed the point where they are good enough for daily work with a coding agent.</p>
</blockquote>

<p>The post describes in detail his setup for local model work. It includes sandboxing with Nono, which is something to consider even if using a Cloud model - such powerful tools need a <a href="https://www.thoughtworks.com/radar/techniques/zero-trust-architecture">Zero Trust Architecture</a>.</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>In case you haven’t noticed, those last two fragments resonate. Apple isn’t playing the cloud AI model game, they are saving a huge amount of money, and if local models end up being the future, they’ll be looking rather wise. Van den Ende’s post led me to a podcast by Nate B Jones that argues that <a href="https://natesnewsletter.substack.com/p/executive-briefing-the-ai-race-youre">Apple is replaying a fifty-year old strategy</a> here. All those years ago anyone who used a computer bought time on a mainframe, the Apple II put far less capable compute into the home and small office. From there came spreadsheets, desktop publishing, and the modern home computer - things that weren’t possible using mainframes.</p>

<p>He sees the rise of John Ternus as CEO isn’t merely a switch to a known insider successor - but a bet that the future of AI is sophisticated hardware in the home, office, and pocket. If Open Source models are Good Enough, then why spend money sending tokens - containing your sensitive data - to the AI megacorps?</p>

<p> ❄                ❄                ❄                ❄                ❄</p>

<p>Talking of five decades in the past, it was in 1974 that Fred Brooks opened <a href="https://martinfowler.com/bliki/MythicalManMonth.html">one of the most influential books</a> in our profession with these paragraphs:</p>

<blockquote>
  <p>No scene from prehistory is quite so vivid as that of the mortal struggles of great beasts in the tar pits. In the mind’s eye one sees dinosaurs, mammoths, and sabertoothed tigers struggling against the grip of the tar. The fiercer the struggle, the more entangling the tar, and no beast is so strong or so skillful but that he ultimately sinks.</p>

  <p>Large-system programming has over the past decade been such a tar pit, and many great and powerful beasts have thrashed violently in it. Most have emerged with running systems — few have met goals, schedules, and budgets. Large and small, massive or wiry, team after team has become entangled in the tar. No one thing seems to cause the difficulty — any particular paw can be pulled away. But the accumulation of simultaneous and interacting factors brings slower and slower motion. Everyone seems to have been surprised by the stickiness of the problem, and it is hard to discern the nature of it. But we must try to understand it if we are to solve it.</p>
</blockquote>

<p>With the title of his recent post Kent Beck summons up that imagery as the <a href="https://tidyfirst.substack.com/p/genie-tarpit">Genie Tarpit</a>. After explaining why skilled software development is about building both features and futures, he observes that these AI tools aren’t doing a good job of producing software with the kind of internal quality that is needed for a good future.</p>

<blockquote>
  <p>Here’s what I’ve observed — genies naturally live down &amp; to the left of muddling. The “plausible deniability” task orientation of the genie leaves it claiming success even though the code doesn’t work at all. And complexity piles on complexity until even the genie can’t pretend to make progress any more.</p>
</blockquote>

<p>It’s still an open question whether, or to what extent, internal quality matters in the age of agentic programming. One view is, as Laura Tacho puts it, “The Venn Diagram of Developer Experience and Agent Experience is a circle”. Well organized elements, with good naming, help The Genie understand code, so are important if we can continue to go beyond small disposable systems. The other view is that such internal quality doesn’t matter, that the galaxy brain of LLMs will make sense of the biggest bowls of spaghetti. Maybe not now, but after a couple more inflections.</p>

<p>That’s the fundamental question. Can The Genie evade the tar pit, or will it struggle fruitlessly against the tar’s sticky grip?</p>