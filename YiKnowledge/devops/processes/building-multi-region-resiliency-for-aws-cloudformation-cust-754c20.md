---
title: Building multi-Region resiliency for AWS CloudFormation custom resource deployment
tags:
- AWS Architecture
category: devops/processes
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/building-multi-region-resiliency-for-aws-cloudformation-custom-resource-deployment/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Wed, 22 Jul 2026 14:25:09 +0000
author: Raman Pujani
---

<p><a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" rel="noopener" target="_blank">AWS CloudFormation</a> is the foundational tool of infrastructure-as-code for thousands of organizations running workloads on AWS. But as teams push the boundaries of what CloudFormation can do natively, <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html" rel="noopener" target="_blank">custom resources</a> have emerged as a powerful extension mechanism that unlocks a broad range of possibilities. Yet, when it comes to building resilient, multi-Region deployments with custom resources, customers quickly discover a gap: there is no built-in multi-Region support. In this post, we will explore that challenge and go over a robust active-active architecture that solves it.</p> 
<p>A <strong>CloudFormation custom resource</strong> allows you to write custom provisioning logic that AWS CloudFormation invokes during stack operations (Create, Update, or Delete). When CloudFormation encounters a custom resource in a template, it sends a lifecycle event to a target, typically an <a href="https://docs.aws.amazon.com/lambda/latest/dg/welcome.html" rel="noopener" target="_blank">AWS Lambda function</a> through an <a href="https://docs.aws.amazon.com/sns/latest/dg/welcome.html" rel="noopener" target="_blank">Amazon Simple Notification Service topic</a>. CloudFormation waits for a response with a presigned URL, and then proceeds or rolls back based on that response.</p> 
<p>Customers use Custom Resources for a wide variety of use cases, including:</p> 
<ul> 
 <li><strong>Third-party API integrations</strong> to provision resources in external systems (for example, DNS providers, SaaS providers) as part of a CloudFormation stack.</li> 
 <li><strong>Complex initialization logic</strong> for seeding databases, generating secrets, or bootstrapping configurations that CloudFormation doesn’t natively support.</li> 
 <li><strong>Cross-account or cross-service orchestration</strong> for triggering workflows in other AWS accounts or services during stack lifecycle events.</li> 
 <li><strong>Custom validation and compliance checks</strong> enforcing organizational policies before a stack is allowed to complete.</li> 
 <li><strong>Resource types not yet supported natively</strong> for bridging the gap until AWS adds first-class support.</li> 
</ul> 
<p>In short, Custom Resources turn CloudFormation into a fully extensible orchestration engine instead of only an AWS resource provisioner.</p> 
<p>While single-Region deployments can achieve high resilience, multi-Region architectures become essential for organizations that need to meet specific business requirements. These include stringent disaster recovery objectives, data residency mandates, latency-sensitive use cases across geographies, and mission-critical business continuity needs. However, when it comes to CloudFormation Custom Resources, multi-Region design introduces a set of hard problems that CloudFormation does not solve natively:</p> 
<ul> 
 <li><strong>No native fan-out mechanism</strong>: CloudFormation stacks in different Regions each trigger their own custom resource events independently. There is no built-in way to coordinate these events across Regions.</li> 
 <li><strong>Duplicate execution risk</strong>: If you deploy the same Lambda function handler in multiple Regions to achieve redundancy, both instances may process the same event. This can lead to duplicate side effects (for example, creating the same record twice in a database or calling an external API multiple times).</li> 
 <li><strong>No distributed locking</strong>: CloudFormation provides no mechanism to verify that only one handler processes a given event, even when multiple handlers are active.</li> 
 <li><strong>No automated failover</strong>: If the primary Region’s Lambda function handler fails, there is no built-in mechanism to automatically route the event to a secondary Region.</li> 
 <li><strong>Idempotency is your problem:</strong> Helping verify that retries and failover scenarios don’t cause unintended duplicate operations is entirely the responsibility of the developer.</li> 
</ul> 
<p>Until now, these gaps meant that teams either accept the risk of single-Region custom resource handlers (a reliability concern) or build complex, bespoke solutions to handle multi-Region scenarios.</p> 
<h2 id="walkthrough">Walkthrough</h2> 
<h3 id="prerequisites">Prerequisites</h3> 
<ul> 
 <li>AWS account with administrator access.</li> 
 <li>Basic understanding of AWS services including CloudFormation, <a href="https://aws.amazon.com/lambda/features/" rel="noopener" target="_blank">AWS Lambda</a>, <a href="https://aws.amazon.com/dynamodb/features/" rel="noopener" target="_blank">Amazon DynamoDB</a>, <a href="https://aws.amazon.com/sqs/features/" rel="noopener" target="_blank">Amazon Simple Queue Service (Amazon SQS)</a>, <a href="https://aws.amazon.com/sns/features/" rel="noopener" target="_blank">Amazon Simple Notification Service (Amazon SNS)</a>, <a href="https://aws.amazon.com/iam/" rel="noopener" target="_blank">AWS Identity and Access Management (IAM)</a>, <a href="https://aws.amazon.com/cloudwatch/" rel="noopener" target="_blank">Amazon CloudWatch</a>, and <a href="https://docs.aws.amazon.com/r53recovery/latest/dg/what-is-route53-recovery.html" rel="noopener" target="_blank">Amazon Application Recovery Controller</a>.</li> 
 <li><a href="https://aws.amazon.com/cli/" rel="noopener" target="_blank">AWS Command Line Interface (AWS CLI)</a>, Bash or PowerShell.</li> 
 <li>Access to minimum two <a href="https://aws.amazon.com/about-aws/global-infrastructure/regions_az/" rel="noopener" target="_blank">AWS Regions</a> required.</li> 
</ul> 
<h2 id="solution-approach">Solution approach</h2> 
<p>This proposed architecture delivers an <strong>active-active multi-Region solution</strong> for CloudFormation custom resource processing. It is designed around four core principles:</p> 
<ul> 
 <li><strong>Active-Active processing</strong>: Both the primary Region (us-east-1) and secondary Region (us-west-2) are always live and capable of handling events.</li> 
 <li><strong>No duplicate execution</strong>: A DynamoDB Global Table-based distributed locking mechanism helps verify that only one Region processes any given event, regardless of which Region receives it first.</li> 
 <li><strong>Idempotency mechanism:</strong> Every request is tracked by state, so retries and failover scenarios are designed to avoid duplicate side effects.</li> 
 <li><strong>Fully automated failover:</strong> Amazon Application Recovery Controller detects failures and triggers failover without manual intervention.</li> 
</ul> 
<p>This architecture avoids the single points of failure inherent in single-Region custom resource designs while preventing the duplicate processing risks of naive multi-Region approaches. This architecture is ideal for mission-critical workloads where regional failures cannot be tolerated.</p> 
<p>The following section provides a detailed walkthrough of how this architecture processes a CloudFormation lifecycle event from end to end.</p> 
<p>This architecture diagram describes a multi-Region CloudFormation custom resource architecture operating in an Active-Active configuration. It handles CloudFormation lifecycle events (Create/Update/Delete) with high availability and no duplicate processing across multiple AWS Regions. The architecture uses a central primary Region (us-east-1) and a secondary Region (us-west-2) to process custom resource events, with <a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html" rel="noopener" target="_blank">Amazon DynamoDB Global Tables</a> providing distributed locking and idempotency, and Amazon Application Recovery Controller providing automated failover. Customer AWS Regions fan out events simultaneously to both infrastructure Regions, supporting resilience even if the primary Region fails.</p> 
<p><img alt="Architecture diagram showing the multi-Region CloudFormation custom resource processing flow with SNS fan-out, SQS queues, Lambda handlers, DynamoDB Global Tables for distributed locking, and Amazon Application Recovery Controller for automated failover" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/22/archblog-1547-arch-diagram.png" width="800" /></p> 
<h3 id="step-1-event-initiation-customer-regions">Step 1: Event initiation (Customer Regions)</h3> 
<p>A CloudFormation Stack in one of the customer Regions (us-east-1, eu-west-1, or ap-southeast-1) initiates a Create, Update, or Delete lifecycle event. Along with the event payload, CloudFormation generates a <strong>presigned response URL</strong> that the handler must call to signal success or failure. This event is published to a local <strong>Amazon Simple Notification Service (SNS) topic</strong> within that customer Region.</p> 
<h3 id="step-2-cross-region-fan-out-with-sns-subscriptions">Step 2: Cross-Region fan-out with SNS subscriptions</h3> 
<p>The Amazon SNS topic is configured with <strong>cross-region subscriptions</strong> that simultaneously fan out the event to two Amazon SQS queues in the central infrastructure AWS Regions:</p> 
<ul> 
 <li><strong>Primary SQS queue</strong>: Central Infrastructure Region: us-east-1.</li> 
 <li><strong>Secondary SQS queue</strong>: Central Infrastructure Region: us-west-2.</li> 
</ul> 
<p>Both queues receive the event at the same time, setting up the Active-Active processing model.</p> 
<h3 id="step-3-primary-lambda-function-handler-immediate-processing">Step 3: Primary Lambda function handler (Immediate processing)</h3> 
<p>The Primary SQS queue triggers the <strong>Primary Lambda Custom Resource Handler</strong> immediately, with no delay. The Lambda function executes the following steps:</p> 
<ul> 
 <li>Check the DynamoDB Global Table for an existing lock on this request.</li> 
 <li>Acquire the lock by using a <strong>conditional write</strong> (only succeeds if no lock exists, preventing race conditions).</li> 
 <li>Execute the custom resource business logic.</li> 
 <li>Send a SUCCESS or FAILED response back to CloudFormation using the presigned URL.</li> 
 <li>Update the DynamoDB state to mark the request as fully processed.</li> 
</ul> 
<h3 id="step-4-secondary-lambda-function-handler-delayed-processing">Step 4: Secondary Lambda function handler (Delayed processing)</h3> 
<p>The Secondary SQS queue is configured with a <strong>delay</strong>, implemented by using either an SQS Delay Queue or a Visibility Timeout. After this delay, the <strong>Secondary Lambda Custom Resource Handler</strong> runs:</p> 
<ul> 
 <li>Check the DynamoDB Global Table Replica for an existing lock.</li> 
 <li><strong>Skip processing</strong> if the primary has already handled the request (idempotency check).</li> 
 <li>Acquire the lock if the primary has <em>not</em> yet processed it (failover scenario).</li> 
 <li>Execute the custom resource logic if the lock was successfully acquired.</li> 
 <li>Send the response to CloudFormation.</li> 
</ul> 
<p>The delay is intended to give the primary Region time to process the event first. The secondary only takes over if the primary has not completed processing within the delay window.</p> 
<h3 id="step-5-dynamodb-global-tables-distributed-locking-and-idempotency">Step 5: DynamoDB Global Tables: Distributed locking and idempotency</h3> 
<p><strong>Amazon DynamoDB Global Tables</strong> are the backbone of coordination in this architecture. Both Regions read from and write to the Global Table with <strong>strong consistency</strong>. The table tracks:</p> 
<ul> 
 <li><strong>Lock state</strong>: Which Region holds the lock for a given request.</li> 
 <li><strong>Idempotency records</strong>: Whether a request has already been processed.</li> 
 <li><strong>Request state</strong>: The full lifecycle status of each event.</li> 
</ul> 
<p>Bidirectional replication is designed to help maintain both Regions with the latest state, supporting the lock mechanism’s reliability despite network partitions or regional degradation.</p> 
<h3 id="step-6-cloudformation-response">Step 6: CloudFormation response</h3> 
<p>After either the primary or secondary Lambda function handler completes processing, CloudFormation receives the <strong>SUCCESS or FAILED callback</strong> using the pre-signed URL. Based on this response, CloudFormation either continues the stack operation or initiates a rollback.</p> 
<h3 id="step-7-amazon-cloudwatch-monitoring">Step 7: Amazon CloudWatch monitoring</h3> 
<p><a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html" rel="noopener" target="_blank"><strong>Amazon CloudWatch alarms</strong></a> continuously monitor SQS queue depth and Lambda execution health in both Regions. These alarms serve as the early warning system for the automated failover mechanism.</p> 
<h3 id="step-8-automated-failover-with-amazon-route-53-arc">Step 8: Automated failover with ARC</h3> 
<p>If the primary Region (us-east-1) experiences a failure, CloudWatch detects it and triggers <strong>Amazon Application Recovery Controller</strong> to initiate automated failover to the secondary Region (us-west-2). No manual intervention is typically required. The secondary Region is designed to take over processing responsibilities.</p> 
<h2 id="clean-up">Clean up</h2> 
<p>Delete resources created using the following AWS services in every Region to avoid additional costs:</p> 
<ul> 
 <li>ARC.</li> 
 <li>SNS topic.</li> 
 <li>SQS queue/messages.</li> 
 <li>DynamoDB table.</li> 
 <li>Lambda code.</li> 
 <li>CloudWatch Log Groups.</li> 
 <li>IAM roles.</li> 
 <li>CloudFormation (if used for automation).</li> 
 <li>Any other AWS service used for customizing your deployment.</li> 
</ul> 
<h2 id="conclusion">Conclusion</h2> 
<p>CloudFormation Custom Resources are an indispensable tool for teams building sophisticated infrastructure automation on AWS. However, the lack of native multi-Region support has long been a barrier to building truly resilient custom resource architectures.</p> 
<p>This architecture addresses the major challenge directly:</p> 
<ul> 
 <li><strong>Resilience:</strong> Active-Active design means no single Region is a bottleneck or single point of failure.</li> 
 <li><strong>Correctness:</strong> Amazon DynamoDB distributed locking and idempotency designed to eliminate duplicate processing.</li> 
 <li><strong>Automation:</strong> Amazon Application Recovery Controller-driven failover removes the need for manual intervention during regional outages.</li> 
 <li><strong>Scalability:</strong> The fan-out model with SNS cross-Region subscriptions supports multiple customer Regions simultaneously.</li> 
</ul> 
<p>For teams operating at scale across multiple AWS Regions, this architecture provides a blueprint for extending the power of CloudFormation without sacrificing reliability. Whether you’re managing compliance-driven multi-Region deployments or building for global high availability, this pattern gives you a foundation for resilient custom resource processing.</p> 
<h2 id="call-to-action">Call to action</h2> 
<p>Refer to the following content to learn more about relevant AWS services:</p> 
<ul> 
 <li><a href="https://aws.amazon.com/blogs/mt/managing-resources-using-aws-cloudformation-resource-types/" rel="noopener" target="_blank">Managing resources using AWS CloudFormation Resource Types</a></li> 
 <li><a href="https://aws.amazon.com/blogs/database/part-1-build-resilient-applications-with-amazon-dynamodb-global-tables/" rel="noopener" target="_blank">Build resilient applications with Amazon DynamoDB global tables: Part 1</a></li> 
 <li><a href="https://aws.amazon.com/blogs/database/part-2-build-resilient-applications-with-amazon-dynamodb-global-tables/" rel="noopener" target="_blank">Build resilient applications with Amazon DynamoDB global tables: Part 2</a></li> 
 <li><a href="https://aws.amazon.com/blogs/database/building-distributed-locks-with-the-dynamodb-lock-client/" rel="noopener" target="_blank">Building Distributed Locks with the DynamoDB Lock Client</a></li> 
 <li><a href="https://aws.amazon.com/blogs/aws/introducing-amazon-application-recovery-controller-region-switch-a-multi-region-application-recovery-service/" rel="noopener" target="_blank">Introducing Amazon Application Recovery Controller Region switch: A multi-Region application recovery service</a></li> 
 <li><a href="https://github.com/aws-samples/sample-sns-sqs-multi-region" rel="noopener" target="_blank">SQS Multi-Region: SNS Fan-Out Pattern</a></li> 
</ul>