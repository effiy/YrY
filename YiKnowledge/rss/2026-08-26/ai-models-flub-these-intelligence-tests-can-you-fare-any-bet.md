---
title: AI models flub these intelligence tests. Can you fare any better?
tags:
- MIT Technology Review
category: ai-engineer/methodology
created: '2026-08-29'
source: https://www.technologyreview.com/2026/08/26/1141952/puzzles-ai-models-flub-these-tests/
type: rss
source_name: MIT Technology Review
source_url: https://www.technologyreview.com/feed/
published: Wed, 26 Aug 2026 09:00:00 +0000
author: Grace Huckins
---

<p>Puzzles and games have been central to AI development since the very beginning. Just as we humans like to test our smarts with crosswords or logic puzzles, developers can test how far models have advanced with a gaming gauntlet. The term “machine learning” was popularized in a 1959 article by the IBM computer scientist Arthur Samuel about an algorithm that learned to play checkers. Chess and the Chinese board game Go are famous AI test beds too.&nbsp;</p>



<p>Judged purely on its puzzling skills, AI is improving a lot—and quickly. In late 2024, a team of scientists from Columbia University showed that even the best models could figure out only 18% of the infamous <em>New York Times</em> Connections puzzles; by early 2025, some models could solve them near perfectly every time.&nbsp;</p>



<p>But puzzles do more than just highlight the inexorable advance of AI capabilities. Seeing where models succeed and fail—and where we humans still beat them—can provide a useful window into the technology’s strengths and weaknesses. Despite advances, today’s models still fumble: Subtle changes in classic riddles often trip them up, and visual puzzles are a particular weak spot.&nbsp;</p>



<p>Here you’ll have the chance to test your wits on puzzles that have stumped models at one time or another. Some might be as tricky for you as they were for the AI; others are so simple that they’ll have you doubting whether AI is really intelligent at all. Each one highlights at least one way in which machine and human cognition differ. If you ace the test, you’ll have proved that you can out-puzzle an AI—at least for now.&nbsp;</p>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<h2 class="wp-block-heading"><strong>Spatial Reasoning</strong></h2>



<p>Let’s start with a domain where humans have a huge advantage: spatial reasoning. If you’ve ever taken an IQ test, you may have done a mental rotation problem. These puzzles ask you to determine whether different images represent the same objects from different angles. Though today’s language models typically have the ability to analyze visual inputs, they still fail abysmally at these puzzles. For all the talk of how world models can help AI understand physical environments, LLMs still don’t seem to be able to manipulate 3D objects the way spatial thinkers like architects and mechanical engineers can.</p>



<h3 class="wp-block-heading"><strong>Mental Rotation</strong></h3>



<p><strong>Instructions</strong>: <em>Choose the answer that shows the object in the prompt, but from a different angle. In each case, there’s only one correct answer!</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<h2 class="wp-block-heading"><strong>Memory &amp; Adaptability</strong></h2>



<p>Frontier LLMs have extraordinary memories; they were exposed to a monstrous volume of facts during training and can recite many of them faithfully. That’s an asset for outcompeting humans at trivia, but it can also be a liability. When a puzzle closely resembles one a model saw during training, the model may whiz by key differences and respond with what it memorized.&nbsp;</p>



<p>This held true in a 2024 study in which researchers from Google and the University of Illinois Urbana-Champaign trained and tested models on slight variations of a classic type of puzzle called Knights and Knaves. In these problems, some characters always tell the truth and others always lie, and you have to figure out who’s who. The same principle may be at work in a test called SimpleBench. These questions resemble more complicated problems that models likely encountered in training. Humans spot the trick, but even top-tier models trip.</p>



<h3 class="wp-block-heading"><strong>Knights and Knaves</strong></h3>



<p><strong>Instructions</strong>: <em>The only thing you need to know to solve these puzzles is that knights always tell the truth and knaves always lie. Determine who’s what on the basis of what each character says.</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<h3 class="wp-block-heading"><strong>SimpleBench</strong></h3>



<p><strong>Instructions</strong>: <em>Read these SimpleBench problems carefully, and you should be able to figure out the answers in no time.</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<h2 class="wp-block-heading"><strong>Abstract &amp; Visual Reasoning</strong></h2>



<p>AI doesn’t just bungle visual problems in 3D—two dimensions can trip it up as well. That’s a major factor in how well models do on the most famous ­puzzle-based benchmark, ARC-AGI. These problems require you to infer abstract, general rules from a set of examples. Models do better on ARC puzzles when they receive each grid not as an image but as a string of numbers that encodes the color of each cell.&nbsp;</p>



<p>Research suggests that even when models answer ARC-AGI questions correctly, they often do so using byzantine and non-­generalizable rules, whereas humans draw on simple visual concepts. Despite these disadvantages, models have gotten quite good at ARC-AGI over the past year, but some puzzles—such as the one printed here—still stump them.</p>



<h3 class="wp-block-heading"><strong>ARC-AGI</strong></h3>



<p><strong>Instruction</strong>s: <em>Study the three pairs of grids shown below to figure out the rule that dictates how the ones on the left transform into the ones on the right. Then get out your markers or colored pencils and fill in the fourth grid using that rule. (The solution is the same no matter which way the grids are oriented.)</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<h2 class="wp-block-heading"><strong>Intuition</strong></h2>



<p>It’s not just AI models that fall into traps. We humans have our own cognitive foibles, many of which AI does not share. Psychologists have designed problem suites that invert the SimpleBench phenomenon: For these questions, humans often give knee-jerk answers, whereas models will respond deliberatively. Some of the problems exploit errors in the ways that we intuitively do math; others are phrased so as to suggest obvious answers that fall apart if the question is read carefully.&nbsp;</p>



<h3 class="wp-block-heading"><strong>Lightning Round</strong></h3>



<p><strong>Instructions</strong>: <em>Answer the questions below as quickly as you can.</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<h2 class="wp-block-heading"><strong>Increasing Complexity</strong></h2>



<p>In some cases, whether an LLM can complete a puzzle is a matter of scale. One study from researchers at Apple found that LLMs can ace simple versions of the Tower of Hanoi problem, which involves moving a stack of disks one at a time without ever putting a larger disk atop a smaller one, and river-crossing puzzles, in which a group of people must traverse a river according to certain rules. But only up to a point: As the number of disks or people hits six and higher, the models began to falter. </p>



<p>In another study, researchers at the University of Washington, Stanford University, and the Allen Institute for AI observed that LLMs struggle similarly with logic grid puzzles, which require deducing the attributes of a set of individuals from a list of clues. The Apple paper went viral, but commentators questioned whether the results reveal a unique limitation of LLM reasoning—or just that it’s normal to make errors as complexity piles up.</p>



<h3 class="wp-block-heading"><strong>The River</strong></h3>



<p><strong>Instructions</strong>: <em>Using the scenario provided, plan the trips necessary to get everyone across the river.&nbsp;</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<h3 class="wp-block-heading"><strong>Logic Grid</strong></h3>



<p><strong>Instructions</strong>: <em>Using the list of clues, determine who lives in each house and what style of music each person enjoys. There is only one possible solution. You may find it helpful to fill out the grid below to keep track of your deductions.</em></p>





<div class="wp-block-spacer" style="height: 40px;"></div>



<p><br /></p>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<p><em>Grace Huckins is an AI reporter at </em>MIT Technology Review<em>. They have a PhD in neuroscience.</em></p>



<hr class="wp-block-separator has-alpha-channel-opacity" />



<h2 class="wp-block-heading has-small-font-size"><em>Credits: </em></h2>



<p class="has-small-font-size"><strong>Mental Rotation: </strong><a href="https://github.com/stogiannidis/srbench/blob/main/LICENSE">CC BY 4.0</a>. Stogiannidis, Ilias, Steven McDonagh, Sotirios A. Tsaftaris. Mind the Gap: Benchmarking Spatial Reasoning in Vision-Language Models (copyright 2025); illustrations by John MacNeill. <strong>Knights &amp; knaves</strong>: Courtesy Dan MacKinnon. <strong>Simplebench</strong>: <a href="https://github.com/simple-bench/SimpleBench/blob/main/LICENSE">CC BY 4.0</a>. SimpleBench Team. The Text Benchmark in which Unspecialized Human Performance Exceeds that of Current Frontier Models (copyright 2024). <strong>ARC-AGI</strong>: Courtesy <a href="https://arcprize.org/">ARC Prize Foundation</a>. <strong>Lightning round</strong>: <a href="https://www.nature.com/articles/s43588-023-00527-x">CC BY 4.0</a>. Hagendorff, Thilo, Sarah Fabi, Michal Kosinski. Human-like intuitive behavior and reasoning biases emerged in large language models but disappeared in ChatGPT. <em>Nat Comput Sci</em> 3, 833–838 (copyright 2023). <strong>The river</strong>: Adapted from <em>Propositiones ad Acuendos Juvenes,</em> Alcuin of York (ca. 800 CE). <strong>Logic grid</strong>: <a href="https://github.com/WildEval/ZeroEval/blob/main/LICENSE">Apache License 2.0</a>. Lin, Bill Y., Ronan Le Bras, Kyle Richardson, et al. ZebraLogic: On the Scaling Limits of LLMs for Logical Reasoning (copyright 2025)</p>