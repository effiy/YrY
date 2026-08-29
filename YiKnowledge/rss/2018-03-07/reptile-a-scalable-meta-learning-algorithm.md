---
title: 'Reptile: A scalable meta-learning algorithm'
tags:
- OpenAI Blog
category: aier/foundations
created: '2026-08-29'
source: https://openai.com/index/reptile
type: rss
source_name: OpenAI Blog
source_url: https://openai.com/blog/rss.xml
published: Wed, 07 Mar 2018 08:00:00 GMT
---

We’ve developed a simple meta-learning algorithm called Reptile which works by repeatedly sampling a task, performing stochastic gradient descent on it, and updating the initial parameters towards the final parameters learned on that task. Reptile is the application of the Shortest Descent algorithm to the meta-learning setting, and is mathematically similar to first-order MAML (which is a version of the well-known MAML algorithm) that only needs black-box access to an optimizer such as SGD or Adam, with similar computational efficiency and performance.