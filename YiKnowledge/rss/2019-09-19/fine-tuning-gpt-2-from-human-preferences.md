---
title: Fine-tuning GPT-2 from human preferences
tags:
- OpenAI Blog
category: aier/foundations
created: '2026-08-22'
source: https://openai.com/index/fine-tuning-gpt-2
type: rss
source_name: OpenAI Blog
source_url: https://openai.com/blog/rss.xml
published: Thu, 19 Sep 2019 07:00:00 GMT
---

We’ve fine-tuned the 774M parameter GPT-2 language model using human feedback for various tasks, successfully matching the preferences of the external human labelers, though those preferences did not always match our own. Specifically, for summarization tasks the labelers preferred sentences copied wholesale from the input (we’d only asked them to ensure accuracy), so our models learned to copy. Summarization required 60k human labels; simpler tasks which continue text in various styles required only 5k. Our motivation is to move safety techniques closer to the general task of “machines talking to humans,” which we believe is key to extracting information about human values.