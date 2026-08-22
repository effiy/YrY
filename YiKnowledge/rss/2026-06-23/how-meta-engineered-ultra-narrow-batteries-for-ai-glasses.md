---
title: How Meta Engineered Ultra-Narrow Batteries for AI Glasses
tags:
- Meta Engineering
category: engineer/learn/lessons/wins
created: '2026-08-22'
source: https://engineering.fb.com/2026/06/23/production-engineering/how-meta-built-ultra-narrow-batteries-for-ai-glasses-meta-tech-podcast/
type: rss
source_name: Meta Engineering
source_url: https://engineering.fb.com/feed/
published: Tue, 23 Jun 2026 16:00:38 +0000
---

<p><span style="font-weight: 400;">Smart glasses like the <a href="https://www.meta.com/ai-glasses/shop-all?ref=engineeringatmeta" rel="noopener" target="_blank">Ray-Ban Meta </a></span><span style="font-size: 1rem;">and <a href="https://www.meta.com/ai-glasses/oakley-meta?ref=engineeringatmeta" rel="noopener" target="_blank">Oakley Meta Vanguards</a> need to pack enough energy to power features like cameras, speakers, AI workloads, and even a display. But it all has to fit into the glasses’ temple arms.</span></p>
<p><span style="font-weight: 400;">So how do you place a battery with enough power to run a pair of smart glasses all day into a form factor narrower than an adult’s pinky finger? You have to rethink how batteries are made. </span></p>
<p><span style="font-weight: 400;">In </span><a href="https://insidefacebookmobile.libsyn.com/86-a-hard-cell-engineering-ultra-narrow-batteries-for-ai-glasses" rel="noopener" target="_blank"><span style="font-weight: 400;">episode 86 of the Meta Tech Podcast</span></a><span style="font-weight: 400;">, host <a href="https://www.threads.com/@passy_" rel="noopener" target="_blank">Pascal Hartig</a> sat down with Karthik and Myuran, the engineers behind Meta&#8217;s steel can battery technology, for a conversation on powering the newest and next generation of wearables. </span></p>
<p></p>
<h2><span style="font-weight: 400;">Why Traditional Batteries Fall Short for Smart Glasses</span></h2>
<p><span style="font-weight: 400;">Traditional pouch cells — the batteries in most phones and laptops– can’t cut it for devices like smart glasses because they’re difficult to reshape and shrink down. Their folds waste volume, their tolerances eat into precious millimeters of space, and at smaller sizes they can have difficulty providing peak power for multitasking (for example, if someone is using the camera and asking the AI model to perform a task at the same time). </span></p>
<p><span style="font-weight: 400;">Smart glasses need a battery that can claim every micron of space – something rigid, precise, and shaped to the product rather than the other way around.</span></p>
<h2><span style="font-weight: 400;">Enter Steel-Can Cells (at Never-Before-Seen Widths)</span><span style="font-weight: 400;"> </span></h2>
<p><span style="font-weight: 400;">Steel-can batteries aren&#8217;t new. Power tools and watches use them. But Meta’s AI glasses needed batteries with widths as narrow as 7mm, narrower than anything that existed before. Getting there meant rethinking nearly every internal component of the battery. </span></p>
<h3><span style="font-weight: 400;">The Electrode Architecture</span></h3>
<p><span style="font-weight: 400;">Traditional steel-can cells use a wound &#8220;jelly roll&#8221; of electrode material. Meta’s engineers replaced that with die-cut stacked layers, similar to wiring small resistors in parallel. The result is dramatically lower impedance, which matters when peak power is required so that the device can avoid brownouts if a lot of power is being demanded at the same time (because someone may be making a recording while asking the AI a question at the same time). </span></p>
<h3><span style="font-weight: 400;">Tolerances</span></h3>
<p><span style="font-weight: 400;">A steel-can cell holds its shape to roughly 100 microns. On a 10mm-wide battery, that gives back real usable volume that translates directly into additional energy density and runtime.</span><span style="font-weight: 400;"><br />
</span></p>
<h2><span style="font-weight: 400;">New Challenges With Each Generation</span></h2>
<p><span style="font-weight: 400;">From Gen 1 to Gen 2 the Meta Ray-Ban&#8217;s, cell capacity grew from 160 mAh to 210 mAh — roughly a 30 percent bump. Yet the product shipped with claims of double the runtime. The chemistry didn&#8217;t change. The extra gains came from system-level efficiency improvements across hardware and software such as better power management, tighter firmware control, and a form factor that allowed for a larger cell</span></p>
<p><span style="font-weight: 400;">The Oakley Meta Vanguards actually feature a battery in each temple arm, which introduced a real systems puzzle at the intersection of electrical, firmware, and mechanical engineering. The cells in each temple arm are symmetric, but the electronic loads aren&#8217;t split evenly between the two sides. That creates cross-charging risks and sequencing complexity at boot and shutdown. </span></p>
<p><span style="font-weight: 400;">Then the Meta Ray-Ban Display glasses introduced the most demanding power profile yet. Its screen draws sustained power rather than short bursts, which required designing a 248 mAh steel-can cell, the largest in Meta’s lineup.</span></p>
<h2><span style="font-weight: 400;">More Power to the Wearables</span></h2>
<p><span style="font-weight: 400;">The ultra-narrow steel-can approach we developed for our smart glasses is proving adaptable to other form factors across Meta&#8217;s hardware portfolio.</span><span style="font-weight: 400;"><br />
</span></p>
<p><span style="font-weight: 400;">Meta is now focused on scaling and democratizing this technology across multiple vendors, ensuring we have resilient supply and can bring these batteries to the next generation of wearables.</span><span style="font-weight: 400;"><br />
</span></p>
<p><span style="font-weight: 400;">Listen to the full episode to hear the complete story — from first sketch to global shelf — including details on cross-charging two-battery systems, software versus hardware iteration cycles, and what it&#8217;s really like to collaborate across time zones to build something the world has never seen.</span></p>
<h2>Listen now</h2>
<p>You can also find the episode wherever you get your podcasts, including:</p>
<ul>
<li style="font-weight: 400;"><a href="https://open.spotify.com/episode/4JK9EnUe77SCq1EgOD8p7A" rel="noopener" target="_blank"><span style="font-weight: 400;">Spotify</span></a></li>
<li style="font-weight: 400;"><a href="https://podcasts.apple.com/us/podcast/meta-tech-podcast/id1370910331" rel="noopener" target="_blank"><span style="font-weight: 400;">Apple Podcasts</span></a></li>
<li style="font-weight: 400;"><a href="https://pca.st/juweao6h" rel="noopener" target="_blank"><span style="font-weight: 400;">PocketCasts</span></a></li>
</ul>
<h2>Timestamps</h2>
<ul>
<li style="font-weight: 400;"><span style="font-weight: 400;">0:06 — Intro and News</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">1:49 — Guest intros</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">4:16 — The problem with existing batteries</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">6:40 — Pouch vs. steel-can batteries</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">10:27 — What lower impedance means</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">12:25 — Power requirements</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">16:02 — Synchronizing two batteries</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">23:11 — Manufacturing never-done-before batteries</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">28:12 — Software vs. hardware iteration cycles</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">30:51 — Collaborations across the globe</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">37:00 — Market compliance</span></li>
<li style="font-weight: 400;"><span style="font-weight: 400;">42:24 — Outro</span></li>
</ul>
<p>The <a href="https://insidefacebookmobile.libsyn.com/" rel="noopener" target="_blank">Meta Tech Podcast</a> is a podcast, brought to you by Meta, where we highlight the work Meta’s engineers are doing at every level – from low-level frameworks to end-user features.</p>
<p>Send us feedback on <a href="https://instagram.com/metatechpod" rel="noopener" target="_blank">Instagram</a>, <a href="https://threads.net/@metatechpod" rel="noopener" target="_blank">Threads</a>, or <a href="https://twitter.com/metatechpod" rel="noopener" target="_blank">X</a>.</p>
<p>And if you’re interested in learning more about career opportunities at Meta visit the <a href="https://www.metacareers.com/?ref=engineering.fb.com" rel="noopener" target="_blank">Meta Careers</a> page.</p>
<p>The post <a href="https://engineering.fb.com/2026/06/23/production-engineering/how-meta-built-ultra-narrow-batteries-for-ai-glasses-meta-tech-podcast/">How Meta Engineered Ultra-Narrow Batteries for AI Glasses</a> appeared first on <a href="https://engineering.fb.com">Engineering at Meta</a>.</p>