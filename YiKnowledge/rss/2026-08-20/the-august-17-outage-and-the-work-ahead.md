---
title: The August 17 outage, and the work ahead
tags:
- GitHub Blog
category: devops/processes
created: '2026-08-22'
source: https://github.blog/news-insights/company-news/the-august-17-outage-and-the-work-ahead/
type: rss
source_name: GitHub Blog
source_url: https://github.blog/feed/
published: Thu, 20 Aug 2026 18:36:11 +0000
author: Vlad Fedorov
---

<p class="wp-block-paragraph">On August 17, GitHub experienced an outage that lasted 7 hours and 47 minutes. It disrupted github.com, authentication, GitHub Actions, APIs, pull requests, issues, and Copilot, affecting developers and organizations around the world. If you were trying to ship software that day, we let you down.</p>



<p class="wp-block-paragraph">This was our second significant incident in August, following <a href="https://www.githubstatus.com/incidents/qcvjkzcs7j74">an actions failure on August 6</a>. In <a href="https://github.blog/news-insights/company-news/addressing-githubs-recent-availability-issues-2/">March</a> and <a href="https://github.blog/news-insights/company-news/an-update-on-github-availability/">April</a>, I shared the work underway to improve GitHub&rsquo;s reliability. We have made progress, but these incidents make clear that we must accelerate this work.</p>



<h2 class="wp-block-heading" id="h-what-happened">What happened</h2>



<p class="wp-block-paragraph">Our investigation found that the outage began when traffic reached a new peak, and a critical infrastructure component in our Central US data center failed to scale with it. The resulting capacity pressure spread through our systems, causing authentication failures and disrupting multiple GitHub services.</p>



<p class="wp-block-paragraph">Recovery required several coordinated actions. Teams rerouted traffic, isolated affected infrastructure, and restored services in stages. Most GitHub services recovered earlier that day, but some Copilot services took longer. Errors in those services triggered a client-side retry loop that increased traffic during recovery. We had to mitigate that behavior before we could safely restore traffic. The full <a href="https://www.githubstatus.com/incidents/zkxwbgr0cnmx">root cause analysis</a> includes a detailed technical timeline.</p>



<p class="wp-block-paragraph">Neither outage was caused by a code or configuration change. Both incidents were capacity failures at their core. We failed to scale critical components before demand exceeded their capacity. Since April, monthly commits have grown from 1.4 billion to 2.9 billion. That growth explains the pressure on our systems, but it does not excuse these outages.</p>



<figure class="wp-block-image size-large"><img alt="Three side-by-side dark-themed line charts show strong growth from 2023 to 2026: merged pull requests per month rising to about 130M, commits per month rising to about 2.9B, and new repositories per month rising to about 24M, with acceleration in 2025&ndash;2026." class="wp-image-98403" height="576" src="https://github.blog/wp-content/uploads/2026/08/blog-post-aug-17-outage-1.png?resize=1024%2C576" width="1024" /></figure>



<h2 class="wp-block-heading" id="h-what-we-have-done-and-what-comes-next">What we have done and what comes next</h2>



<p class="wp-block-paragraph">As part of the reliability commitments we made earlier this year, we have focused on three priorities: adding capacity, improving efficiency, and removing architectural bottlenecks. We have since added more than 3 million CPU cores, 120 petabytes of high-speed storage, and significant network capacity. We installed as much hardware as available power allowed in our existing data centers while accelerating our migration to Azure.</p>



<p class="wp-block-paragraph">Today, Azure serves roughly 58% of GitHub&rsquo;s platform load and half of all Git operations, up from 12% of platform load in May. This expanded footprint has also supported the growth in GitHub Actions job runs shown below.</p>



<figure class="wp-block-image size-large"><img alt="Large dark-themed line chart titled &lsquo;Growth in completed GitHub Actions runs&rsquo; shows a rising trend from early 2026 to August, with regular weekly dips and increasing peaks. Values grow from roughly 15&ndash;30M early in the year to over 100M, ending near 115.4M." class="wp-image-98393" height="576" src="https://github.blog/wp-content/uploads/2026/08/3-GH-Actions-runs.png?resize=1024%2C576" width="1024" /></figure>



<p class="wp-block-paragraph">Azure&rsquo;s infrastructure and capacity have also accelerated our work to scale the largest monorepos. Our next milestone is an architecture that scales read capacity linearly with the number of readers, enabling unlimited read operations. We will roll it out gradually, beginning with the largest monorepos.</p>



<figure class="wp-block-image size-large"><img alt="Two dark-themed &lsquo;Fetch Throughput History&rsquo; charts compare fetch operations per second over short time windows. Left chart fluctuates and plateaus around ~1,000 OPS/S before dropping near the end; right chart climbs steadily in steps to about ~1,800 OPS/S." class="wp-image-98401" height="576" src="https://github.blog/wp-content/uploads/2026/08/blog-post-aug-17-outage-Gitfetch.png?resize=1024%2C576" width="1024" /></figure>



<p class="wp-block-paragraph">Scale is not our only challenge. As the pace and complexity of change increased, our existing operational practices did not keep up. We have redirected teams and resources toward availability and invested in stronger testing, safer rollouts, better observability, and more effective alerting. We have made progress, but this work is not complete.</p>



<p class="wp-block-paragraph">In addition, we are also isolating critical systems and removing shared dependencies between them. This work is designed to reduce the likelihood of an outage and limit its impact when one occurs.</p>



<p class="wp-block-paragraph">We learn from every outage and add new work to our availability workstream. The August 6 and August 17 incidents led to two immediate changes. First, we are applying consistent retry limits, retry budgets, and variable timeouts across service-to-service interactions to prevent retry storms and cascading load. Second, we are reviewing lower-priority CPU and memory alerts to identify components that could fail during sudden traffic spikes.</p>



<p class="wp-block-paragraph">Our commitment to high availability isn&rsquo;t just a technical promise. The developer community depends on GitHub to build, ship, and operate their work. That is only possible if you can rely on us, and on August 17, you couldn&rsquo;t. It is our responsibility to fix that. We&rsquo;ll earn your trust through the scaling and reliability of the platform.</p>

<p>The post <a href="https://github.blog/news-insights/company-news/the-august-17-outage-and-the-work-ahead/">The August 17 outage, and the work ahead</a> appeared first on <a href="https://github.blog">The GitHub Blog</a>.</p>