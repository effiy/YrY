---
title: 'Apple’s new M6 Mac mini and M5 Ultra Mac Studio: 10 details you might have
  missed'
tags:
- Popular Science
category: life/science
created: '2026-08-29'
source: https://www.popsci.com/gear/apple-m6-mac-mini-m5-ultra-mac-studio-specs-details/
type: rss
source_name: Popular Science
source_url: https://www.popsci.com/feed/
published: Tue, 25 Aug 2026 11:13:25 -0400
author: Stan Horaczek
---

<p class="article-paragraph skip">Apple refreshed the Mac mini and the Mac Studio today with four different chips between them. The Mac mini gets the all-new M6 and the M5 Pro. The Mac Studio gets the M5 Max and the brand-new M5 Ultra. If the middle two sound familiar, they should, because those are the same parts that showed up in <a href="https://www.popsci.com/gear/apple-m5-pro-max-chips-macbook-pros-details/" rel="noreferrer noopener" target="_blank">March&#8217;s MacBook Pro refresh</a>. The M6 and the M5 Ultra are where the actual engineering news lives, and both of them are aimed squarely at running AI models on your desk instead of a massive data center. Pre-orders open today and machines start arriving September 22.</p>



<h2 class="wp-block-heading" id="h-1-the-m6-is-apple-s-first-2nm-chip-and-it-landed-in-the-cheapest-desktop-mac">1. The M6 is Apple&#8217;s first 2nm chip, and it landed in the cheapest desktop Mac</h2>



<p class="article-paragraph skip">Apple built the M6 on a 2-nanometer process, a first for the company. Every M5-family part, including the $5,499 M5 Ultra, uses third-generation 3nm. The M4 generation before it used second-generation 3nm. So the newest, densest silicon Apple has announced currently sits in an $899 Mac mini and nowhere else, which is not how this usually goes.</p>



<p class="article-paragraph skip">The smaller process lets Apple add CPU cores while holding the line on power efficiency. M6 has a 12-core CPU, two more than M5, split into a configuration Apple hasn&#8217;t used before: 2 super cores, 4 performance cores, and 6 efficiency cores. The two super cores handle single-threaded work on their own. The four performance cores use less power and join in when a multithreaded job needs them, while the six efficiency cores take background tasks like file indexing. Apple claims the world&#8217;s fastest single-threaded performance and up to 1.2x faster multithreaded performance than M5.</p>



<figure class="wp-block-image size-large"><img alt="Apple M6 and M5 Ultra chips against a space background" class="wp-image-781749" height="1055" src="https://www.popsci.com/wp-content/uploads/2026/08/apple-m5-m6-chips.jpg?strip=all&#038;quality=85&#038;w=1583" width="1583" /> <figcaption class="wp-element-caption">Apple</figcaption></figure>



<h2 class="wp-block-heading" id="h-2-the-m5-ultra-is-the-first-apple-chip-built-out-of-four-dies">2. The M5 Ultra is the first Apple chip built out of four dies</h2>



<p class="article-paragraph skip">UltraFusion has been Apple&#8217;s trick for building Ultra chips since the M1 Ultra in 2022, and until now it meant joining two dies. The M5 Ultra doubles that. Because the M5 Max is itself a two-die chip built on the Fusion Architecture that debuted in March, connecting two M5 Max chips produces a quad-die system on a chip, a first for Apple silicon. Apple says UltraFusion now moves more than 4.4TB/s between dies with over 6x the connection density of the previous version, which is what lets four separate pieces of silicon behave like one processor rather than four chips trying to get along.</p>



<p class="article-paragraph skip">The result tops out at a 36-core CPU (12 super cores and 24 performance cores) and an 80-core GPU, though the $5,499 Mac Studio starts with a 30-core CPU and 64-core GPU and charges extra for the full chip. The GPU count at the top of the range is unchanged from the M3 Ultra, so a large share of this generation&#8217;s gains comes from new hardware inside each core and from the wider interconnect rather than from adding cores.</p>



<h2 class="wp-block-heading" id="h-3-there-are-two-different-ai-accelerators-on-these-chips-and-they-aren-t-the-same-thing">3. There are two different AI accelerators on these chips, and they aren&#8217;t the same thing</h2>



<p class="article-paragraph skip">These two get conflated constantly, including in Apple&#8217;s own marketing. The Neural Engine is a dedicated block that has been on Apple silicon for years and handles Apple Intelligence tasks and Core ML models. Neural Accelerators are new hardware built into each individual GPU core to speed up matrix multiplication, the math that dominates LLM inference. They&#8217;re separate pieces of hardware doing different jobs, and the two new chips improve different ones.</p>



<p class="article-paragraph skip">M6 introduces a new Neural Engine arrangement Apple calls Dual 16-core, meaning two complete engines that macOS frameworks can run simultaneously for up to 2x the peak compute of the previous generation. The M5 Ultra keeps a 32-core Neural Engine, the same count the M3 Ultra had, and instead adds Neural Accelerators to an Ultra-class GPU for the first time. That second change is where the big AI multipliers come from. Apple puts the M5 Ultra at up to 4.3x the peak AI compute of the M3 Ultra in the Mac Studio announcement.</p>



<figure class="wp-block-image size-large"><img alt="Mac Mini with a monitor that has Xcode on the screen" class="wp-image-781758" height="1055" src="https://www.popsci.com/wp-content/uploads/2026/08/mac-mini-x-code.jpg?strip=all&#038;quality=85&#038;w=1583" width="1583" /><figcaption class="wp-element-caption">Running big models locally is a central part of the pitch for the top-end Mac Studio. Apple Apple</figcaption></figure>



<h2 class="wp-block-heading" id="h-4-memory-bandwidth-is-a-major-limiter-on-local-ai-and-it-s-the-spec-buyers-often-skip">4. Memory bandwidth is a major limiter on local AI, and it&#8217;s the spec buyers often skip</h2>



<p class="article-paragraph skip">Core counts get the headlines. Bandwidth is what most people should be reading. For a lot of LLM work, the machine has to stream model weights out of memory repeatedly as it generates tokens, so the width of that pipe puts a practical ceiling on output speed. It isn&#8217;t the only variable. GPU compute, quantization, model architecture, and software optimization all move the number too, and mixture-of-experts models only touch a fraction of their weights per token. But bandwidth is the one that scales cleanly across this lineup, which makes it a useful way to rank the four machines.</p>



<p class="article-paragraph skip">Here&#8217;s the spread, and note that two of these four move depending on how you configure the machine. The M6 runs at 153GB/s in the $899 Mac mini&#8217;s 16GB configuration and steps up to 170GB/s once you order 24GB or more. The M5 Pro sits at 307GB/s regardless of configuration. The M5 Max starts at 460GB/s and reaches 614GB/s only with the 40-core GPU upgrade. The M5 Ultra delivers 1.2TB/s at every configuration, 50 percent more than the M3 Ultra&#8217;s 819GB/s. If you&#8217;re shopping these machines specifically to run models locally, bandwidth deserves at least as much attention as GPU cores, and on the mini and the M5 Max Studio it&#8217;s tied to boxes you have to tick.</p>



<h2 class="wp-block-heading" id="h-5-the-mac-studio-s-memory-ceiling-didn-t-move-but-everything-feeding-it-got-faster">5. The Mac Studio&#8217;s memory ceiling didn&#8217;t move, but everything feeding it got faster</h2>



<p class="article-paragraph skip">A Mac Studio with M5 Ultra can be configured to 512GB of unified memory, which is enough to hold open-weight models with hundreds of billions of parameters in RAM. Two things to know before you treat that as the headline. The M3 Ultra Mac Studio could also be configured to 512GB back in March 2025, so the capacity is the same. And the 512GB option requires the upgraded 36-core CPU and 80-core GPU, which the $5,499 machine doesn&#8217;t include.</p>



<p class="article-paragraph skip">What changed is how fast that memory can be read, how much compute sits next to it, and how the dies talk to each other. Bandwidth went from 819GB/s on the M3 Ultra to 1.2TB/s, the GPU picked up Neural Accelerators, and storage moved to a PCIe Gen 6 architecture Apple rates at roughly twice the previous speed. There&#8217;s a scheduling catch on the big one, though. Every other Mac Studio configuration arrives September 22, but the 512GB build doesn&#8217;t ship until late October.</p>



<h2 class="wp-block-heading" id="h-6-you-can-cluster-these-macs-over-thunderbolt-5-and-the-899-one-is-left-out">6. You can cluster these Macs over Thunderbolt 5, and the $899 one is left out</h2>



<p class="article-paragraph skip">Thunderbolt 5 on the Mac Studio now supports RDMA, or remote direct memory access, which lets one machine read another&#8217;s memory directly without going through the usual networking overhead. Apple says the result is a shared memory pool across clustered systems, and that four clustered Mac Studio units deliver up to 3x faster AI inference than a single one. The Mac mini with M5 Pro has Thunderbolt 5 as well, which makes a stack of them a plausible small-team inference box.</p>



<p class="article-paragraph skip">The Mac mini with M6 ships with three Thunderbolt 4 ports instead, so it can&#8217;t use Apple&#8217;s Thunderbolt 5 clustering feature. It can still participate in ordinary networked and distributed computing over Ethernet, so this isn&#8217;t a wall so much as a missing shortcut. It&#8217;s the clearest functional line Apple has drawn between the $899 mini and the $1,699 one, and you&#8217;ll want to know it before you buy four of the cheap ones expecting to pool their memory.</p>



<h2 class="wp-block-heading" id="h-7-the-m5-pro-and-m5-max-already-shipped-in-march-s-macbook-pros">7. The M5 Pro and M5 Max already shipped in March&#8217;s MacBook Pros</h2>



<p class="article-paragraph skip">Two of the four chips in today&#8217;s announcement aren&#8217;t new. The M5 Pro in the Mac mini tops out at the same 18-core CPU, 20-core GPU, 64GB memory ceiling, and 307GB/s of bandwidth as the M5 Pro in the 14-inch MacBook Pro. The M5 Max in the Mac Studio matches its laptop counterpart at 18 CPU cores, up to 40 GPU cores, 128GB, and up to 614GB/s.</p>



<p class="article-paragraph skip">One wrinkle the spec sheet turns up: the $1,699 Mac mini uses the same binned M5 Pro Apple puts in the entry 14-inch MacBook Pro, a 15-core CPU with 5 super cores and 10 performance cores alongside a 16-core GPU. The 18-core CPU and 20-core GPU cost extra on the mini, the same way they do on that entry 14-inch. Every 16-inch MacBook Pro with an M5 Pro includes them standard.</p>



<p class="article-paragraph skip">That&#8217;s normal for Apple and it isn&#8217;t a knock. It does mean that if you read <a href="https://www.popsci.com/gear/apple-m5-pro-max-chips-macbook-pros-details/" rel="noreferrer noopener" target="_blank">our coverage of the M5 Pro and M5 Max in March</a>, you already have a decent sense of what two of these machines will do. Desktops generally have more thermal headroom than laptops running the same silicon, so these may be able to sustain peak performance longer under extended loads. We&#8217;ll know how much once we can run them.</p>



<h2 class="wp-block-heading" id="h-8-the-mac-studio-finally-gets-wi-fi-7-and-the-mini-s-ethernet-got-faster">8. The Mac Studio finally gets Wi-Fi 7, and the mini&#8217;s Ethernet got faster</h2>



<p class="article-paragraph skip">The Mac Studio has never had Wi-Fi 7. The previous generation shipped with Wi-Fi 6E and Bluetooth 5.3, and Apple&#8217;s N1 wireless chip brings both up to Wi-Fi 7 and Bluetooth 6 now, matching what the MacBook Pro picked up in March. You need a Wi-Fi 7 router to see any of it, and in a machine most people connect over Ethernet anyway, this matters less than it would on a laptop.</p>



<p class="article-paragraph skip">The more useful wired change is on the Mac mini, which moves from Gigabit Ethernet standard to 2.5Gb, with the 10Gb option carrying over. Both minis keep the two front USB-C ports and the front headphone jack with high-impedance support that the M4 model already had. New to both machines is genlock over USB-C for syncing a display to camera capture, including an iPhone 17 Pro, which is a small feature that a specific set of video people will care about a lot.</p>



<figure class="wp-block-image size-large"><img alt="Apple Mac Mini back" class="wp-image-781759" height="1055" src="https://www.popsci.com/wp-content/uploads/2026/08/mac-mini-back.jpg?strip=all&#038;quality=85&#038;w=1583" width="1583" /><figcaption class="wp-element-caption">You get a simple set of powerful ports. Apple</figcaption></figure>



<h2 class="wp-block-heading" id="h-9-apple-s-biggest-multipliers-are-measured-against-the-m1">9. Apple&#8217;s biggest multipliers are measured against the M1</h2>



<p class="article-paragraph skip">Read the footnotes on the performance claims. Apple says the Mac mini with M6 does LLM prompt processing up to 13.5x faster in LM Studio, and that number is against a Mac mini with M1 from 2020. Against the M4 mini it replaces, the same test comes in at 4.8x. The Excel spreadsheet claim follows the same pattern: 2.3x against M1, 1.5x against M4.</p>



<p class="article-paragraph skip">The M4-to-M6 numbers are still good, and 4.8x on prompt processing in one generation is a real jump. The flashy figures in the headlines are six-year comparisons, though, and anyone upgrading from a 2024 machine should read the second number in each sentence. Apple also publishes more than one graphics figure for the M5 Ultra without saying which workload produced which: the chip announcement cites up to 40 percent faster than M3 Ultra, while the Mac Studio announcement cites up to 1.8x. Both are &#8220;up to&#8221; results, so they may simply come from different tests.</p>



<h2 class="wp-block-heading" id="h-10-every-one-of-these-machines-costs-more-than-the-one-it-replaces">10. Every one of these machines costs more than the one it replaces</h2>



<p class="article-paragraph skip">The Mac mini with M6 starts at $899. The M4 mini it replaces started at $599. The M5 Pro mini starts at $1,699, up from $1,399 for the M4 Pro version. On the Mac Studio side, the M5 Max model starts at $2,499 against $1,999 for the M4 Max, and the M5 Ultra starts at $5,499 against $3,999 for the M3 Ultra.</p>



<p class="article-paragraph skip">That&#8217;s $300 more on both minis, $500 more on the base Studio, and $1,500 more at the top. Here&#8217;s the part that stings: all four machines carry over their predecessor&#8217;s exact base memory and storage. The M6 mini still starts at 16GB and 256GB, the M5 Pro mini at 24GB and 512GB, the M5 Max Studio at 36GB and 512GB, and the M5 Ultra Studio at 96GB and 1TB. The increases go toward the chips and a handful of platform upgrades, including Wi-Fi 7, Bluetooth 6, 2.5Gb Ethernet on the mini, genlock, and the faster SSD architecture. Education pricing knocks $100 off each Mac mini and $200 to $400 off the Studios. Apple is also leasing the Mac Studio through its Apple Upgrade program at $48.99 per month for the M5 Max and $110.10 per month for the M5 Ultra on a 36-month term.</p>



<h2 class="wp-block-heading" id="h-where-to-order-the-new-mac-mini-and-mac-studio">Where to order the new Mac mini and Mac Studio</h2>



<p class="article-paragraph skip">Pre-orders for all four chip options open today, August 25, in 30 countries including the U.S. Machines start arriving September 22, with the 512GB Mac Studio following in late October. All four are designed to run macOS 27 Golden Gate, which Apple says arrives this fall and which brings <a href="https://www.popsci.com/gear/apple-wwdc-announcements-2026/" rel="noreferrer noopener" target="_blank">the rebuilt Siri AI Apple showed at WWDC in June</a>. Apple&#8217;s spec page notes Siri AI itself lands in beta later this year, in English first. If you&#8217;re setting one of these up on a desk, our guide to <a href="https://www.popsci.com/gear/best-monitors-for-mac-mini/" rel="noreferrer noopener" target="_blank">the best monitors for the Mac mini</a> still applies.</p>



<p class="article-paragraph skip">The prices below buy the starting configurations, which are not the headline numbers Apple&#8217;s announcements quote. Here&#8217;s what each one actually includes before upgrades.</p>



<ul class="wp-block-list">
<li><strong>$899 Mac mini (M6):</strong> 12-core CPU, 12-core GPU, 16GB memory, 256GB SSD, 153GB/s</li>



<li><strong>$1,699 Mac mini (M5 Pro):</strong> 15-core CPU, 16-core GPU, 24GB memory, 512GB SSD, 307GB/s</li>



<li><strong>$2,499 Mac Studio (M5 Max):</strong> 18-core CPU, 32-core GPU, 36GB memory, 512GB SSD, 460GB/s</li>



<li><strong>$5,499 Mac Studio (M5 Ultra):</strong> 30-core CPU, 64-core GPU, 96GB memory, 1TB SSD, 1.2TB/s</li>
</ul>



<h3 class="wp-block-heading">Apple Mac mini (M6) $899</h3>




<section class="acf-product-card-block recurrent-blocks pw-incontent-excluded pgIgnore  ">
	
			<h3 class="product-title wp-block-heading">Apple Mac mini (M6) $899</h3>
	
	
	
	
		<div class="product-image">
				<a class="product-card-link" href="https://www.apple.com/shop/buy-mac/mac-mini" rel="noopener sponsored" target="_blank">
					<figure>
				<img alt="Mac Mini M6" class="attachment-post-thumb-medium size-full" height="512" src="https://www.popsci.com/wp-content/uploads/2026/08/mac-mini-m6-front.jpg?quality=85&#038;w=768" width="768" />

									<figcaption>
							<span class="product-image-caption">
															</span>
													<span class="product-image-credits">
								<p class="article-paragraph skip">Apple</p>							</span>
											</figcaption>
				
				
			</figure>
				</a>
			</div>

	
	
		<a class="product-button-link" href="https://www.apple.com/shop/buy-mac/mac-mini" rel="noopener sponsored" target="_blank">
			See It		</a>

	
		</section>



<p class="article-paragraph skip"><br />The entry Mac mini is the only machine in Apple&#8217;s lineup with a 2nm chip in it, and it&#8217;s the one model here whose chip isn&#8217;t binned: every M6 config gets the full 12-core CPU and 12-core GPU with Neural Accelerators, plus the Dual 16-core Neural Engine. At $899 that comes with 16GB of memory, a 256GB SSD, and 153GB/s of bandwidth. Moving to 24GB or 32GB raises bandwidth to 170GB/s, which is the figure worth paying for if you plan to run models locally. Three Thunderbolt 4 ports leave it out of Apple&#8217;s clustering feature.</p>



<h3 class="wp-block-heading">Apple Mac mini (M5 Pro) $1,699</h3>




<section class="acf-product-card-block recurrent-blocks pw-incontent-excluded pgIgnore  ">
	
			<h3 class="product-title wp-block-heading">Apple Mac mini (M5 Pro) $1,699</h3>
	
	
	
	
		<div class="product-image">
				<a class="product-card-link" href="https://www.apple.com/shop/buy-mac/mac-mini" rel="noopener sponsored" target="_blank">
					<figure>
				<img alt="Apple Mac Mini back" class="attachment-post-thumb-medium size-full" height="512" src="https://www.popsci.com/wp-content/uploads/2026/08/mac-mini-back.jpg?quality=85&#038;w=768" width="768" />

									<figcaption>
							<span class="product-image-caption">
								You get a simple set of powerful ports.							</span>
													<span class="product-image-credits">
								<p class="article-paragraph skip">Apple</p>							</span>
											</figcaption>
				
				
			</figure>
				</a>
			</div>

	
	
		<a class="product-button-link" href="https://www.apple.com/shop/buy-mac/mac-mini" rel="noopener sponsored" target="_blank">
			See It		</a>

	
		</section>



<p class="article-paragraph skip"><br />The chassis is identical to the M6 model and the internals aren&#8217;t close. For $1,699 you get a 15-core CPU, a 16-core GPU, 24GB of memory, a 512GB SSD, and 307GB/s of bandwidth, roughly double the entry M6&#8217;s pipe. This is the same binned M5 Pro Apple uses in the entry 14-inch MacBook Pro, and upgrading to an 18-core CPU and 20-core GPU costs extra, as does going past 24GB. Three Thunderbolt 5 ports make this the cheapest Mac you can cluster. Apple cites 4x faster LLM prompt processing than the M4 Pro mini.</p>



<h3 class="wp-block-heading">Apple Mac Studio (M5 Max) $2,499</h3>




<section class="acf-product-card-block recurrent-blocks pw-incontent-excluded pgIgnore  ">
	
			<h3 class="product-title wp-block-heading">Apple Mac Studio (M5 Max) $2,499</h3>
	
	
	
	
		<div class="product-image">
				<a class="product-card-link" href="https://www.apple.com/shop/buy-mac/mac-studio" rel="noopener sponsored" target="_blank">
					<figure>
				<img alt="Mac Studio Back with ports" class="attachment-post-thumb-medium size-full" height="512" src="https://www.popsci.com/wp-content/uploads/2026/08/mac-studio-m5-max-back.jpg?quality=85&#038;w=768" width="768" />

									<figcaption>
							<span class="product-image-caption">
															</span>
													<span class="product-image-credits">
								<p class="article-paragraph skip">Apple</p>							</span>
											</figcaption>
				
				
			</figure>
				</a>
			</div>

	
	
		<a class="product-button-link" href="https://www.apple.com/shop/buy-mac/mac-studio" rel="noopener sponsored" target="_blank">
			See It		</a>

	
		</section>



<p class="article-paragraph skip"><br />Consider this the model for creatives. The $2,499 build has an 18-core CPU, a 32-core GPU with Neural Accelerators, 36GB of memory, a 512GB SSD, and 460GB/s of bandwidth, which handles 8K color grading and multi-stream ProRes work without the Ultra&#8217;s price. The 40-core GPU is the upgrade that matters, because it&#8217;s what unlocks both 614GB/s and any memory config above 36GB. Apple claims 3x faster Magic Mask performance in DaVinci Resolve Studio than the M4 Max version, and PCIe Gen 6 storage roughly doubles SSD speeds.</p>



<h3 class="wp-block-heading">Apple Mac Studio (M5 Ultra) $5,499</h3>




<section class="acf-product-card-block recurrent-blocks pw-incontent-excluded pgIgnore  ">
	
			<h3 class="product-title wp-block-heading">Apple Mac Studio (M5 Ultra) $5,499</h3>
	
	
	
	
		<div class="product-image">
				<a class="product-card-link" href="https://www.apple.com/shop/buy-mac/mac-studio" rel="noopener sponsored" target="_blank">
					<figure>
				<img alt="Apple Mac Studio M5 Max or M6" class="attachment-post-thumb-medium size-full" height="512" src="https://www.popsci.com/wp-content/uploads/2026/08/apple-mac-studio-m5.jpg?quality=85&#038;w=768" width="768" />

									<figcaption>
							<span class="product-image-caption">
															</span>
													<span class="product-image-credits">
								<p class="article-paragraph skip">Apple</p>							</span>
											</figcaption>
				
				
			</figure>
				</a>
			</div>

	
	
		<a class="product-button-link" href="https://www.apple.com/shop/buy-mac/mac-studio" rel="noopener sponsored" target="_blank">
			See It		</a>

	
		</section>



<p class="article-paragraph skip"><br />The quad-die M5 Ultra is the fastest chip Apple has built, and $5,499 buys a 30-core CPU, a 64-core GPU, 96GB of memory, a 1TB SSD, and the full 1.2TB/s of bandwidth, which doesn&#8217;t change across configurations. The 36-core CPU and 80-core GPU are an upgrade, and they&#8217;re mandatory if you want 512GB, the capacity that lets this thing run frontier-class open-weight models entirely in memory. The M3 Ultra offered that same 512GB ceiling at 819GB/s and without Neural Accelerators. Its Media Engine plays back up to 33 simultaneous streams of 8K ProRes 422 at 30 fps. </p>
<p>The post <a href="https://www.popsci.com/gear/apple-m6-mac-mini-m5-ultra-mac-studio-specs-details/">Apple’s new M6 Mac mini and M5 Ultra Mac Studio: 10 details you might have missed</a> appeared first on <a href="https://www.popsci.com">Popular Science</a>.</p>