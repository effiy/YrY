---
title: Lessons learned from scaling to 1 million Lambda functions
tags:
- AWS Architecture
category: technical-writer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/lessons-learned-from-scaling-to-1-million-lambda-functions/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Mon, 29 Jun 2026 17:21:05 +0000
author: Ben Freiberg
status: stable
lifecycle: stable
---

<p>In this post, we share our journey and the lessons learned from building and running a fully serverless, multi-account software as a service (SaaS) platform at scale. We’ll explore why true scale-to-zero is critical, how we handle quota management, why engaging AWS service teams early saved us from outages, and which unexpected practices emerged once we scaled from thousands to over a million functions.</p> 
<p>At <a href="http://proglove.com/" rel="noopener" target="_blank">ProGlove</a>, we build smart wearable barcode scanning solutions that connect frontline workers to digital workflows. Our scanners integrate with Insight, our AWS-based SaaS platform, to provide real-time visibility into processes, helping customers in manufacturing, logistics and retail improve productivity, reduce errors and enhance ergonomics on the shop floor.</p> 
<p>We chose a <a href="https://aws.amazon.com/blogs/architecture/6000-aws-accounts-three-people-one-platform-lessons-learned/" rel="noopener" target="_blank">one AWS account per tenant architecture</a> to achieve clearer security boundaries, streamlined ownership of services, and more transparent cost. It is important to focus on efficiency with dedicated tenant resources at scale, because resource wastage will also scale. The ability to scale-to-zero removes this concern.</p> 
<h2 id="phase-1-the-simple-origins-0-to-1000-lambdas">Phase 1: The “simple” origins (0 to 1,000 Lambda functions)</h2> 
<p>When you first build a serverless system, you think in single digits. A handful of <a href="https://aws.amazon.com/lambda/" rel="noopener" target="_blank">AWS Lambda</a> functions, maybe a few dozen at most. It’s hard to imagine what changes when your platform operates thousands of AWS accounts and deploys over one million Lambda functions into production, each isolated to a single customer’s account.</p> 
<p>We followed standard playbooks, where “scale-to-zero” was merely a nice-to-have. We used serverless best practices like <a href="https://aws.amazon.com/sqs/" rel="noopener" target="_blank">Amazon Simple Queue Service (Amazon SQS)</a> for decoupling and long-polling to keep the application responsive and resilient. At this scale, a few idle functions or a handful of accounts were a negligible expense and the benefits of a high-level managed service like AWS Lambda really showed.</p> 
<h3 id="microservice-composition">Microservice composition</h3> 
<p>Each microservice in our platform follows a consistent structure: 5 to 15 Lambda functions coordinated by <a href="https://aws.amazon.com/step-functions/" rel="noopener" target="_blank">AWS Step Functions</a>, with <a href="https://aws.amazon.com/eventbridge/" rel="noopener" target="_blank">Amazon EventBridge</a> handling event routing and <a href="https://aws.amazon.com/dynamodb/" rel="noopener" target="_blank">Amazon DynamoDB</a> as the primary data store.</p> 
<p><img alt="Architecture diagram showing a microservice composition with Lambda functions, Step Functions, EventBridge, and DynamoDB" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/17/ARCHBLOG-1323-1.png" width="600" /></p> 
<p>These resources are bundled together into a dedicated <a href="https://aws.amazon.com/cloudformation/" rel="noopener" target="_blank">AWS CloudFormation</a> stack for deployment.</p> 
<p>As we onboarded our first handful of tenants, it quickly became clear that deploying and updating AWS CloudFormation stacks individually per account wouldn’t scale. We adopted <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html" rel="noopener" target="_blank">AWS CloudFormation StackSets</a>, which let us push infrastructure updates to multiple accounts in parallel from a central management account. At this stage, StackSets felt like a superpower. One deployment operation and many accounts are updated simultaneously. We evaluated building a fully custom replacement later, but ultimately concluded that the maintenance overhead wasn’t worth the marginal control gains and stayed with StackSets as our core mechanism.</p> 
<h2 id="phase-2-the-first-50-accounts">Phase 2: The first 50 accounts</h2> 
<p>Growing to 50 tenant accounts forced us to confront problems that weren’t visible at single-digit scale. Three areas in particular required deliberate architectural decisions: observability, account provisioning, and quota isolation.</p> 
<h3 id="automating-account-creation">Automating account creation</h3> 
<p>We knew manual provisioning would not scale. Instead we built an automated account factory on top of <a href="https://aws.amazon.com/organizations/" rel="noopener" target="_blank">AWS Organizations</a>: an AWS Step Functions workflow in the management account handles the full provisioning lifecycle: Creating the account, applying baseline service control policies (SCPs), bootstrapping cross-account IAM roles, and triggering the initial CloudFormation StackSet deployment. All done using cross-account AWS Lambda invocations. New tenant accounts go from request to ready in under 15 minutes, at near-zero incremental cost per provisioning run.</p> 
<p><img alt="Account provisioning workflow using AWS Organizations and Step Functions" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/17/ARCHBLOG-1323-2.png" width="600" /></p> 
<h3 id="the-quota-isolation-benefit">The quota isolation benefit</h3> 
<p>One underappreciated advantage of the account-per-tenant model is quota separation. Each account gets its own Lambda concurrent execution limit, its own <a href="https://aws.amazon.com/api-gateway/" rel="noopener" target="_blank">Amazon API Gateway</a> throttle, and its own service quotas across the board. In a shared-account SaaS model at this scale, a single noisy tenant could exhaust shared concurrency and cause cascading failures across all other tenants. With account isolation, that class of problem simply doesn’t exist as each tenant’s activity is bound to their own account.</p> 
<h2 id="phase-3-scaling-challenges-the-self-ddos">Phase 3: Scaling challenges (the self-DDoS)</h2> 
<p>As our fleet grew beyond a few hundred accounts, we began to experience the “Physics of Scale”. We discovered that when hundreds of backend service instances simultaneously access other services, the resulting request volume can resemble a coordinated&nbsp;attack, impacting not only our own infrastructure but also AWS.</p> 
<p>One time, we faced a massive metric spike where our own functions effectively overwhelmed (similar to a DDoS attack) our internal APIs. The root cause was synchronized schedules: every Lambda was using the same <code>rate(5 minutes)</code> expression, which aligned to the top of the minute across thousands of accounts.</p> 
<p>The solution was request scattering. We now use a standardized internal library that enforces <a href="https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/" rel="noopener" target="_blank">jitter</a>, randomized batch offsets, and staggered updates across all scheduled functions.</p> 
<blockquote>
 <p>Rule of Thumb: “Never do the same thing at the same time everywhere”.</p>
</blockquote> 
<h3 id="multi-account-observability-as-a-cost-driver">Multi-account observability as a cost driver</h3> 
<p>With several dozen accounts, manual log access per account became unworkable. We adopted a third-party observability platform, forwarding <a href="https://aws.amazon.com/cloudwatch/" rel="noopener" target="_blank">Amazon CloudWatch</a> logs and metrics cross-account to a centralized dashboard. At roughly $3 per account per month, the cost felt insignificant.</p> 
<p>That assumption was soon replaced by a very real learning: at thousands of accounts, $3 per account per month becomes an impactful expense that demands active management. We learned to treat per-account observability costs with the same scrutiny you apply to compute costs.</p> 
<p>What came as a surprise to us were the actual cost drivers: instead of Lambda compute or storage costs, we found that forwarding all observability data almost doubled our cloud bill. As a result, we had to learn how to differentiate between high and low priority observability data and only move around the priority data.</p> 
<p>With all mitigations combined we managed to bring observability costs down to around $0.7 per account. Additionally, we were able to switch accounts to almost 0 after some time of inactivity by only monitoring a small set of very basic metrics.</p> 
<h2 id="phase-4-rethinking-architectural-patterns-for-scale-to-zero">Phase 4: Rethinking architectural patterns for scale-to-zero</h2> 
<p>One of the most painful lessons was realizing that traditional Amazon SQS “best practices” increased costs in our use-case and scale.</p> 
<h3 id="replacing-sqs-and-the-dlq-dilemma">Replacing SQS and the DLQ dilemma</h3> 
<p>After we scaled to over a thousand AWS accounts, we understood that “idle” doesn’t necessarily mean there are no costs – even when using Serverless. When Lambda functions consume events from EventBridge through an SQS queue to increase resilience, they constantly make requests to the queue even when there are no messages to process.</p> 
<p>To eliminate the cost of continuous polling, we removed Amazon SQS from the path between Amazon EventBridge and AWS Lambda.</p> 
<ul> 
 <li><strong>Metric-Driven Safety:</strong> Instead of relying on a queue to buffer requests, we monitor <code>AsyncEventsDropped</code> and <code>ConcurrentExecutions</code> to make sure we stay within our quotas without losing events.</li> 
 <li><strong>The Centralized DLQ:</strong> Polling individual Dead Letter Queues (DLQs) in every account reintroduced the same polling cost issues. We solved this by routing failures to a centralized DLQ as shown in the following two diagrams.</li> 
 <li><strong>The Isolation Trade-off:</strong> This approach requires extreme discipline to make sure we don’t break our data isolation patterns, as events from different tenants converge in a single location for recovery. Because of cost implications at scale, the use of SQS moved from a silo to a <a href="https://aws.amazon.com/blogs/apn/using-amazon-sqs-in-a-multi-tenant-saas-solution/" rel="noopener" target="_blank">bridged model</a> where the AWS account ID can be treated as a tenant ID.</li> 
</ul> 
<hr /> 
<p><img alt="Individual dead letter queue per queue architecture" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/17/ARCHBLOG-1323-3.png" width="600" /></p> 
<p><em>Individual DLQ per queue</em></p> 
<p><img alt="Centralized dead letter queue polling architecture" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/17/ARCHBLOG-1323-4.png" width="600" /></p> 
<p><em>Centralized DLQ polling</em></p> 
<h2 id="phase-5-industrializing-the-deployment-engine">Phase 5: Industrializing the deployment engine</h2> 
<p>Serverless architectures grow to large numbers of infrastructure components: where a monolith or <a href="https://aws.amazon.com/ec2/" rel="noopener" target="_blank">Amazon Elastic Compute Cloud (Amazon EC2)</a>-based service might be a handful of resources, a single microservice in our stack spans dozens of Lambda functions, EventBridge rules, DynamoDB tables, and Step Functions state machines. Multiplied across thousands of accounts, deployment complexity compounds quickly.</p> 
<p>Initially, we used AWS CloudFormation StackSets to roll out updates in parallel. However, at the scale of 1 million Lambda functions, StackSets hit a performance ceiling and occasionally produced errors that added up significantly at our volume.</p> 
<h3 id="from-custom-engines-to-collaborative-roadmaps">From custom engines to collaborative roadmaps</h3> 
<p>The bottlenecks became such a blocker that we began building our own internal serverless deployment system to replace StackSets. This caught the attention of the AWS CloudFormation service team, who committed to supporting our use case at the scale we required and partnered with us closely from that point on.</p> 
<p>By engaging early and often, we were able to:</p> 
<ul> 
 <li><strong>Influence the Roadmap:</strong> We provided the scale requirements that helped AWS prioritize StackSet stability and performance improvements.</li> 
 <li><strong>Automate Resiliency:</strong> We built a deployment tracking service that aggregates StackSet events through Amazon EventBridge. A central AWS Step Functions state machine now acts as our “single-pane-of-glass,” acting on failures and triggering retries for occasional AWS internal errors.</li> 
</ul> 
<h2 id="phase-6-mature-governance-and-finops">Phase 6: Mature governance and FinOps</h2> 
<p>Being able to scale a serverless platform with a small team of engineers requires consistent and efficient governance practices. This applies to both cloud governance topics as well as engineering practices. Otherwise it will be next to impossible to keep software delivery and development performance as well as reliability at a high level over time.</p> 
<p>Cost optimization also changes at a higher maturity level: once cost control is tightly monitored and automated, the discipline changes from housekeeping tasks to collect easy cost savings towards increasingly complex architectural changes. For example, if a new feature significantly increases the number of Lambda invocations and drives up cost, you will need to re-think the architecture and include the new focus on cost.</p> 
<h3 id="the-mono-repo-strategy">The mono-repo strategy</h3> 
<p>We consolidated 20 microservices into a single mono-repo. This helped us to:</p> 
<ul> 
 <li>Enforce consistent tooling and security scanning across&nbsp;more than a million functions.</li> 
 <li>Coordinate runtime and library upgrades through a single source of truth for configuration.</li> 
 <li>Make sure every change passes through the same CI/CD chain with guaranteed compatibility.</li> 
</ul> 
<h3 id="the-almost-zero-reality">The “Almost-Zero” Reality</h3> 
<p>Even with a scale-to-zero mandate, we learned that “zero” is often “almost-zero”.</p> 
<ul> 
 <li><strong>The Monitoring Tax:</strong> We avoided services like NAT Gateways, but monitoring introduced additional costs such as CloudWatch Alarms. Aggregating metrics in external observability tools added up quickly.</li> 
 <li><strong>The Optimization Payoff:</strong> By aggressively optimizing these costs, we reduced our idle cost for inactive accounts to less than $1&nbsp;per month.</li> 
</ul> 
<h3 id="think-beyond-the-obvious-services">Think beyond the obvious services</h3> 
<p>One of the most valuable habits we built was resisting the urge to immediately default to a familiar pattern or write custom code. AWS offers a growing catalog of fully managed, event-driven services such as <a href="https://aws.amazon.com/eventbridge/pipes/" rel="noopener" target="_blank">Amazon EventBridge Pipes</a>, <a href="https://aws.amazon.com/appsync/" rel="noopener" target="_blank">AWS AppSync</a>, Amazon SQS FIFO, and others, that can remove entire categories of custom Lambda code. Before writing a function, ask whether a native service integration already solves the problem.</p> 
<p>A deliberate research step of exploring native AWS capabilities before opening an editor consistently paid off. It reduces the surface area you own, eliminates maintenance burden, and builds the team’s instinct for choosing the right service over reinventing it. <a href="https://serverlessland.com/" rel="noopener" target="_blank">Serverlessland</a> is an excellent starting point for discovering patterns and service combinations you may not have considered.</p> 
<h2 id="conclusion-scaling-efficiency-faster-than-growth">Conclusion: Scaling efficiency faster than growth</h2> 
<p>Scaling from 0 to 1M Lambda functions across thousands of AWS accounts is a question of efficiency not of capacity. Every new account, every new customer, adds potential operational load. The only way to stay ahead is to make sure efficiency scales faster than growth. For us, that means true scale-to-zero, proactive and efficient quota management, tight collaboration with AWS service teams, disciplined developer education, and a mono-repo that enforces consistency.</p> 
<p>We’ve learned that the difference between success and failure at this scale lies in unexpected aspects like the hard-learned fact that observability becomes an increasingly complex problem the more distributed your platform becomes.</p> 
<p>The benefits are substantial. With the right automation and architectural rigor, a lean team can operate a large-scale infrastructure. Using a cloud-native approach based on serverless services is the most important operational advantage in this case.</p> 
<p>To apply these lessons to your own workloads, discover event-driven patterns and service combinations on&nbsp;<span class="c-mrkdwn__draggable-link"><a class="c-link" href="https://serverlessland.com/" rel="noopener noreferrer" target="_blank">Serverless Land</a></span>.</p> 
<hr /> 
<h2>About the authors</h2>