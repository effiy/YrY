---
title: Prioritize your AWS Health alerts using AWS User Notifications
tags:
- AWS Architecture
category: data-engineer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/prioritize-your-aws-health-alerts-using-aws-user-notifications/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Thu, 16 Jul 2026 14:56:22 +0000
author: Naga Bhargav
---

<p>If you run critical workloads on AWS, such as a contact center on <a href="https://aws.amazon.com/connect/" rel="noopener" target="_blank">Amazon Connect Customer</a>, database workloads on <a href="https://aws.amazon.com/rds/" rel="noopener" target="_blank">Amazon Relational Database Service (Amazon RDS)</a>, or hybrid connectivity through <a href="https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html" rel="noopener" target="_blank">AWS Direct Connect</a>, service health events demand your attention. But not all events are equal. An operational issue, a scheduled maintenance window, and a deprecation notice buried in your inbox have very different consequences. The problem is that they all arrive through the same channel, making their urgency difficult to determine.</p> 
<p><a href="https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html" rel="noopener" target="_blank">AWS Health</a> generates events for every service, every account, every Region. The service delivers ongoing issues, scheduled changes, account notifications, and deprecation notices in one undifferentiated stream. For operations teams, this creates a familiar problem: either you treat every notification as urgent with unwanted triage noise, or you start ignoring them and risk missing something that matters. Both paths lead to slower response times and unwanted escalations.</p> 
<p>This post walks you through a lightweight approach to solving this problem using <a href="https://docs.aws.amazon.com/notifications/latest/userguide/what-is-service.html" rel="noopener" target="_blank">AWS User Notifications</a>, a fully managed service for routing AWS events to your preferred delivery channels. This solution filters health events to only the services you want to be notified about, then separates what remains into two priority tiers. Critical events arrive immediately. Informational events arrive as batched summaries. In this post, we address this problem with a single <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" rel="noopener" target="_blank">AWS CloudFormation</a> template with four deployment approaches that you can deploy in your AWS environment.</p> 
<h2 id="solution-overview">Solution overview</h2> 
<p>The design follows a simple principle: filter first, then separate by priority.</p> 
<p>The first layer filters out noise. Event rules match health events only for the services your organization depends on, such as AWS Direct Connect, Amazon Connect Customer, and Amazon RDS. Everything else is silenced before it reaches your inbox.</p> 
<p>The second layer separates what remains by urgency. Two notification configurations handle different priority tiers:</p> 
<ul> 
 <li><strong>CRITICAL</strong> — Matches events where <strong>eventTypeCategory</strong> is <em>issue</em> or <em>scheduledChange</em>. These arrive immediately as individual notifications with no batching.</li> 
 <li><strong>INFORMATIONAL</strong> — Matches everything else using an anything-but filter such as <em>accountNotification</em>. AWS User Notifications batches these within a five-minute window and delivers them as grouped summaries.</li> 
</ul> 
<p>In this solution, a CloudFormation template supports four deployment modes through a <code>DeploymentMode</code> parameter:</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Mode</strong></td> 
   <td><strong>Scope</strong></td> 
   <td><strong>What you get</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Linked</strong> (default)</td> 
   <td>Single account</td> 
   <td>Email contacts + User Notifications event rules + channel associations</td> 
  </tr> 
  <tr> 
   <td><strong>Payer</strong></td> 
   <td>Entire organization or OU</td> 
   <td>Everything in Linked, plus organizational unit associations scoped to a root or OU</td> 
  </tr> 
  <tr> 
   <td><strong>Combined</strong></td> 
   <td>Single account</td> 
   <td>Everything in Linked, plus <a href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" rel="noopener" target="_blank">Amazon EventBridge</a> rules and an <a href="https://aws.amazon.com/sns/" rel="noopener" target="_blank">Amazon Simple Notification Service (Amazon SNS)</a> topic with [CRITICAL]/[INFORMATIONAL] prefixed custom email</td> 
  </tr> 
  <tr> 
   <td><strong>PayerCombined</strong></td> 
   <td>Entire organization or OU</td> 
   <td>Everything in Linked, plus org associations AND Amazon EventBridge rules with SNS custom email messages</td> 
  </tr> 
 </tbody> 
</table> 
<p>The following diagram shows how health events flow through the solution:</p> 
<p><img alt="Architecture diagram showing priority-based AWS Health alerting using AWS User Notifications" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/09/ARCHBLOG-1496-1.png" width="800" /></p> 
<p style="text-align: left;"><em>Figure 1: Architecture diagram showing priority-based AWS Health alerting using AWS User Notifications</em></p> 
<h3 id="what-gets-deployed">What gets deployed</h3> 
<p>Once you deploy the CloudFormation stack, AWS provisions the following resources:</p> 
<ul> 
 <li><strong>Prioritized AWS services</strong> — AWS Direct Connect, Amazon Connect Customer, and Amazon RDS are pre-configured as the monitored services. You can customize this list directly in the CloudFormation template parameters.</li> 
 <li><strong>Two notification configurations</strong> on AWS User Notifications — one scoped for CRITICAL events (service issues and scheduled changes) and one for INFORMATIONAL events (account notifications), ensuring targeted alerting.</li> 
 <li><strong>Email delivery channel</strong> — AWS automatically links both notification configurations to the email address you provide during stack deployment, so alerts reach the right contacts from day one.</li> 
</ul> 
<h3 id="how-the-notification-flow-works">How the notification flow works</h3> 
<p><strong>User Notifications path (all deployment modes)</strong></p> 
<ul> 
 <li>AWS Health emits an event and lands on the default Amazon EventBridge event bus.</li> 
 <li>User Notifications event rule filters by service + category → two priority tiers.</li> 
 <li>Notification configuration routes: Critical = immediate, Informational = 5-min batch.</li> 
 <li>Email contact receives AWS-standard formatted notification.</li> 
</ul> 
<p><strong>Amazon EventBridge + SNS path (Combined and PayerCombined modes only)</strong></p> 
<p>In parallel with the above, a second delivery path activates:</p> 
<ul> 
 <li>Same AWS Health events land on the default Amazon EventBridge event bus.</li> 
 <li>Custom Amazon EventBridge rules (deployed by the template) evaluate the events on the default event bus and filter by the same service and category criteria as the AWS User Notifications event rules.</li> 
 <li><code>InputTransformer</code> reformats the event into a human-readable message with [CRITICAL] and [INFORMATIONAL] prefix.</li> 
 <li>Amazon SNS delivers the custom formatted email to all subscribers via the Amazon SNS topic.</li> 
 <li>Failed deliveries route to an <a href="https://aws.amazon.com/sqs/" rel="noopener" target="_blank">Amazon Simple Queue Service</a> dead letter queue and an <a href="https://aws.amazon.com/cloudwatch/" rel="noopener" target="_blank">Amazon CloudWatch</a> alarm triggers if an Amazon SNS delivery fails.</li> 
</ul> 
<h2 id="prerequisites">Prerequisites</h2> 
<p>To follow along, you need:</p> 
<ul> 
 <li>An active AWS account.</li> 
 <li>Permissions to deploy AWS CloudFormation stacks and create AWS User Notifications resources.</li> 
 <li>For organization-wide deployment: access to the management (payer) account and the organization root ID or organizational unit (OU) ID.</li> 
 <li>(Optional) The <a href="https://aws.amazon.com/cli/" rel="noopener" target="_blank">AWS Command Line Interface (AWS CLI)</a>, installed and configured, for CLI-based deployment.</li> 
</ul> 
<h2 id="deployment-walkthrough">Deployment walkthrough</h2> 
<p>This section walks you through deploying, verifying, and testing the solution. Choose one of the four deployment modes based on your scope, then follow the remaining steps to confirm everything works.</p> 
<h3 id="step-1-deploy-the-aws-cloudformation-stack">Step 1: Deploy the <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" rel="noopener" target="_blank">AWS CloudFormation</a> stack</h3> 
<p>Download and deploy the complete solution through this sample <a href="https://github.com/aws-samples/sample-prioritize-aws-health-alerts-using-user-notifications" rel="noopener" target="_blank">CloudFormation template</a></p> 
<p>Select the deployment option that matches your requirements:</p> 
<h4 id="option-a-single-account-linked-mode">Option A: Single account (Linked mode)</h4> 
<p>Deploy using the AWS CLI:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws cloudformation deploy \
    --template-file prioritize-aws-health-notifications.yaml \
    --stack-name prioritize-aws-health-notifications \
    --parameter-overrides \
    DeploymentMode=Linked \
    NotificationEmail=ops-team@example.com \
    NotificationRegions=us-east-1,us-west-2
    NotificationHubAlreadyEnabled=No</code></pre> 
</div> 
<p>Note : Set <strong>NotificationHubAlreadyEnabled=Yes</strong> if your AWS account already has a notification hub enabled in AWS User Notifications.</p> 
<p><strong>Or deploy through the</strong> <a href="https://console.aws.amazon.com/cloudformation/" rel="noopener" target="_blank">AWS CloudFormation console</a>:</p> 
<ul> 
 <li>Open the CloudFormation console and choose <strong>Create stack</strong>.</li> 
 <li>Upload the prioritize-aws-health-notifications.yaml template file.</li> 
 <li>For <strong>Stack name</strong>, enter health-notifications.</li> 
 <li>For <strong>DeploymentMode</strong>, select Linked.</li> 
 <li>For <strong>NotificationEmail</strong>, enter the email address for notifications.</li> 
 <li>For <strong>NotificationRegions</strong>, enter the Regions to monitor (comma-separated)</li> 
 <li>For <strong>NotificationHubAlreadyEnabled</strong>, select Yes/No</li> 
 <li>Choose <strong>Submit</strong>.</li> 
</ul> 
<h4 id="option-b-organization-wide-payer-mode">Option B: Organization-wide (Payer mode)</h4> 
<p>Before deploying, run the following command from the payer account to grant the AWS Health service access to your organization:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws health enable-health-service-access-for-organization</code></pre> 
</div> 
<p>Then deploy:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws cloudformation deploy \
    --template-file prioritize-aws-health-notifications.yaml \
    --stack-name prioritize-aws-health-notifications-org \
    --parameter-overrides \
    DeploymentMode=Payer \
    NotificationEmail=ops-team@example.com \
    NotificationRegions=us-east-1,us-west-2 \
    NotificationHubAlreadyEnabled=No
    OrgRootId=r-xxxx</code></pre> 
</div> 
<p>Replace r-xxxx with your organization root ID to cover all accounts, or use an OU ID (for example, ou-xxxx-xxxxxxxx) to scope coverage to a specific unit.</p> 
<h4 id="option-c-single-account-with-custom-sns-email-combined-mode">Option C: Single account with custom SNS email (Combined mode)</h4> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws cloudformation deploy \
    --template-file prioritize-aws-health-notifications.yaml \
    --stack-name prioritize-aws-health-notifications-combined \
    --parameter-overrides \
    DeploymentMode=Combined \
    NotificationEmail=ops-team@example.com \
    NotificationRegions=us-east-1,us-west-2
    NotificationHubAlreadyEnabled=No</code></pre> 
</div> 
<h4 id="option-d-organization-wide-with-custom-sns-email-payercombined-mode">Option D: Organization-wide with custom SNS email (PayerCombined mode)</h4> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws cloudformation deploy \
    --template-file prioritize-aws-health-notifications.yaml \
    --stack-name prioritize-aws-health-notifications-full \
    --parameter-overrides \
    DeploymentMode=PayerCombined \
    NotificationEmail=ops-team@example.com \
    NotificationRegions=us-east-1,us-west-2 \
    NotificationHubAlreadyEnabled=No
    OrgRootId=r-xxxx</code></pre> 
 <pre><code class="language-bash">
</code><strong style="font-family: Georgia, 'Times New Roman', 'Bitstream Charter', Times, serif;">Expected result:</strong><span style="font-family: Georgia, 'Times New Roman', 'Bitstream Charter', Times, serif;"> Stack reaches CREATE_COMPLETE in 2–3 minutes.</span></pre> 
</div> 
<p><img alt="CloudFormation console showing CREATE_COMPLETE status" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/16/archblog-1496-fig-2-1.png" width="800" /></p> 
<p style="text-align: left;"><em>Figure 2: CloudFormation console showing CREATE_COMPLETE status.</em></p> 
<h3 id="step-2-confirm-the-email-subscription">Step 2: Confirm the email subscription</h3> 
<p>After the stack deploys, check the email inbox you specified during deployment. You will receive a subscription confirmation from AWS User Notifications.</p> 
<ol type="1"> 
 <li>Open the confirmation email.</li> 
 <li>Choose <strong>Confirm subscription</strong>.</li> 
</ol> 
<p><strong>Important:</strong> Notifications will not be delivered until you confirm the email contact.</p> 
<p><strong>Expected result:</strong> The email contact shows Verified in the AWS User Notifications console</p> 
<p><img alt="AWS User Notifications console showing verified email contact" src="https://d2908q01vomqb2.cloudfront.net/1b6453892473a467d07372d45eb05abc2031647a/2026/07/15/archblog-1496-fig-3.png" width="800" /></p> 
<p style="text-align: left;"><em>Figure 3: AWS User Notifications console showing verified email contact.</em></p> 
<h3 id="step-3-verify-the-notification-configurations">Step 3: Verify the notification configurations</h3> 
<p>Open the <a href="https://console.aws.amazon.com/notifications/" rel="noopener" target="_blank">AWS User Notifications console</a> and confirm the following resources were created:</p> 
<ol start="3" type="1"> 
 <li>Navigate to <strong>Notification configurations</strong> — you should see two entries:. 
  <ul> 
   <li>Health-Critical-Notifications — scoped to <em>issue</em> and <em>scheduledChange</em> event types.</li> 
   <li>Health-Informational-Notifications — matches all event categories except <em>issue</em> and <em>scheduledChange</em> using an anything-but filter.</li> 
  </ul> </li> 
 <li>Choose each configuration and verify:. 
  <ul> 
   <li><strong>Event rules</strong> list your selected services (AWS Direct Connect, Amazon Connect Customer, Amazon RDS).</li> 
   <li><strong>Delivery channels</strong> show your confirmed email contact.</li> 
  </ul> </li> 
</ol> 
<p><strong>Expected result:</strong> Two notification configurations visible, each with event rules matching your monitored services and the email channel associated.</p> 
<p><img alt="AWS User Notifications console showing two notification configurations" src="https://d2908q01vomqb2.cloudfront.net/1b6453892473a467d07372d45eb05abc2031647a/2026/07/15/archblog-1496-fig-4.png" width="800" /></p> 
<p style="text-align: left;"><em>Figure 4: AWS User Notifications console showing two notification configurations.</em></p> 
<h3 id="step-4-test-the-solution">Step 4: Test the solution</h3> 
<p>Validate the deployed resources via the AWS CLI:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws notifications list-notification-configurations</code></pre> 
</div> 
<p><strong>Expected result:</strong> Returns two configurations with their ARNs and aggregation settings — CRITICAL with no aggregation (NONE) and INFORMATIONAL with a 5-minute aggregation window (SHORT).</p> 
<p>To verify end-to-end delivery, check the <a href="https://health.aws.amazon.com/" rel="noopener" target="_blank">AWS Health Dashboard</a> for any active events in your monitored Regions. When a matching event occurs:</p> 
<ul> 
 <li><strong>CRITICAL</strong> (issue or scheduled change): Email arrives immediately with event details, affected resources, and recommended actions.</li> 
 <li><strong>INFORMATIONAL</strong> (account notification): Email arrives as a grouped summary within 5 minutes.</li> 
</ul> 
<p><strong>Expected result:</strong> Email notification received with the correct delivery pattern — standalone for critical, batched for informational.</p> 
<h2 id="what-you-receive">What you receive</h2> 
<p>The pattern is simple: a standalone email means something needs attention now. A batched summary means routine updates you can review on your own schedule. The email format is controlled by AWS User Notifications and cannot be customized. The priority distinction comes from the delivery pattern, not from text labels in the email body.</p> 
<p>For teams using <a href="https://aws.amazon.com/chatbot/" rel="noopener" target="_blank">AWS Chatbot in chat applications</a> (Slack or Microsoft Teams) or the console <a href="https://aws.amazon.com/notifications/" rel="noopener" target="_blank">Notification Center</a>, the configuration names [CRITICAL] and [INFORMATIONAL] appear directly in the notification, providing explicit priority context.</p> 
<p><img alt="Sample CRITICAL email notification from AWS User Notifications" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/13/ARCHBLOG-1496-5.png" width="800" /></p> 
<p style="text-align: left;"><em>Figure 5: Sample CRITICAL email notification from AWS User Notifications related to an ISSUE.</em></p> 
<p><img alt="Sample INFORMATIONAL digest email from AWS User Notifications" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/13/ARCHBLOG-1496-6.png" width="800" /></p> 
<p><em>Figure 6: Sample INFORMATIONAL digest email from AWS User Notifications related to an accountNotification.</em></p> 
<h2 id="customizing-the-solution">Customizing the solution</h2> 
<p>You can tailor the solution to your environment by adjusting which services are monitored and which <a href="https://aws.amazon.com/about-aws/global-infrastructure/regions_az/" rel="noopener" target="_blank">Regions</a> are covered.</p> 
<h3 id="adding-or-removing-monitored-services">Adding or removing monitored services</h3> 
<p>This template monitors AWS Direct Connect, Amazon Connect Customer, and Amazon RDS by default. To monitor additional services, update the service array in the <code>EventPattern</code> of both event rules. For example, to add <a href="https://aws.amazon.com/ec2/" rel="noopener" target="_blank">Amazon Elastic Compute Cloud (Amazon EC2)</a>:</p> 
<div class="hide-language"> 
 <pre><code class="language-json">"service": ["DIRECTCONNECT", "CONNECT", "RDS", "EC2"]</code></pre> 
</div> 
<p>Update the stack, and the new services are covered immediately.</p> 
<h3 id="multi-region-monitoring">Multi-Region monitoring</h3> 
<p>To get notifications about other AWS Regions, pass multiple Regions in the <code>NotificationRegions</code> parameter:</p> 
<div class="hide-language"> 
 <pre><code class="language-plaintext">NotificationRegions=us-east-1,us-west-2,eu-west-1</code></pre> 
</div> 
<p>Always include <code>us-east-1</code> regardless of where your workloads run. AWS Health global events — such as those for <a href="https://aws.amazon.com/iam/" rel="noopener" target="_blank">AWS Identity and Access Management (IAM)</a>, <a href="https://aws.amazon.com/route53/" rel="noopener" target="_blank">Amazon Route 53</a>, and <a href="https://aws.amazon.com/cloudfront/" rel="noopener" target="_blank">Amazon CloudFront</a> — are delivered to <code>us-east-1</code>. If you exclude it, you miss global events.</p> 
<h3 id="adding-delivery-channels">Adding delivery channels</h3> 
<p>The solution starts with an email, but you can extend it without modifying the core event rules or notification configurations:</p> 
<ul> 
 <li><strong>More email recipients:</strong> Create additional EmailContact resources and associate them with the existing CRITICAL and INFORMATIONAL configurations.</li> 
 <li><strong>Slack or Microsoft Teams:</strong> Set up an <a href="https://aws.amazon.com/chatbot/" rel="noopener" target="_blank">AWS Chatbot in chat applications</a> channel and create a ChannelAssociation linking it to the notification configurations.</li> 
 <li><strong>Mobile push:</strong> Install the <a href="https://aws.amazon.com/console/mobile/" rel="noopener" target="_blank">AWS Console Mobile App</a> and sign in. User Notifications delivers to the mobile app automatically — no additional CloudFormation resources needed.</li> 
 <li><strong>Team-based routing:</strong> Associate the network team’s email only with the CRITICAL configuration, and the general ops team with both CRITICAL and INFORMATIONAL. This is done through channel associations alone — no changes to event rules.</li> 
</ul> 
<h2 id="how-this-solution-compares-to-existing-approaches">How this solution compares to existing approaches</h2> 
<p>Several tools exist for routing AWS Health events, each designed for different operational needs. This solution is not a replacement for all of them — it fills a specific gap.</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Approach</strong></td> 
   <td><strong>What it does</strong></td> 
   <td><strong>Trade-offs</strong></td> 
  </tr> 
  <tr> 
   <td><a href="https://github.com/aws-samples/aws-health-aware" rel="noopener" target="_blank">AWS Health Aware (AHA)</a></td> 
   <td>Open-source framework with Lambda, DynamoDB, Secrets Manager. Supports Slack, Teams, Chime, and email with event deduplication.</td> 
   <td>Requires Business or Enterprise Support plan. Ongoing maintenance of deployed components.</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/blogs/mt/aws-health-events-intelligence-dashboards-insights/" rel="noopener" target="_blank">HEIDI</a> <strong>/</strong> <a href="https://www.wellarchitectedlabs.com/cloud-intelligence-dashboards/" rel="noopener" target="_blank">CID Health Events Dashboard</a></td> 
   <td>Historical analysis and trend visualization using <a href="https://aws.amazon.com/quicksight/" rel="noopener" target="_blank">Amazon QuickSight</a> , <a href="https://aws.amazon.com/athena/" rel="noopener" target="_blank">Amazon Athena</a> , and <a href="https://aws.amazon.com/s3/" rel="noopener" target="_blank">Amazon S3</a> .</td> 
   <td>Designed for operational planning and post-incident review — not real-time alerting. Requires Business or Enterprise Support plan.</td> 
  </tr> 
  <tr> 
   <td><strong>Custom Amazon EventBridge + Lambda + SNS</strong></td> 
   <td>Full flexibility for routing and transformation.</td> 
   <td>Requires writing, testing, and maintaining application code.</td> 
  </tr> 
  <tr> 
   <td><strong>Third-party tools (PagerDuty, Datadog)</strong></td> 
   <td>Escalation, on-call routing, and acknowledgment workflows.</td> 
   <td>Licensing costs and vendor dependencies.</td> 
  </tr> 
  <tr> 
   <td><strong>This solution</strong></td> 
   <td>Simplest path to priority-separated, real-time health alerting. One stack, no code, no compute, no support plan requirement.</td> 
   <td>No deduplication, no escalation/acknowledgment, no historical storage.</td> 
  </tr> 
 </tbody> 
</table> 
<p>The approach in this post sits at a different point on the spectrum. It works well as a standalone solution for teams that need straightforward alerting, and it works equally well as a foundation layer that feeds into more advanced tools as operational needs grow.</p> 
<p>You can start with this solution for immediate coverage, then consider adding PagerDuty by subscribing it to the Amazon SNS topic (Combined mode) for escalation and on-call routing, or pair it with HEIDI for historical trend analysis.</p> 
<h2 id="things-to-consider">Things to consider</h2> 
<p>This solution is intentionally lightweight, and that comes with trade-offs worth understanding:</p> 
<ul> 
 <li><strong>Email format:</strong> AWS User Notifications controls the email body and subject line. You cannot add custom text like ‘[CRITICAL]’ to the email itself by default. The priority signal is the delivery pattern — standalone means critical, batched means informational. For teams that need explicit priority labels in email, the Combined deployment mode adds an Amazon EventBridge + SNS layer with <code>InputTransformer</code> that prefixes the email body with ‘[CRITICAL]’ or ‘[INFORMATIONAL]’.</li> 
 <li><strong>Delivery monitoring (Combined modes):</strong> The Amazon EventBridge + SNS layer includes built-in reliability. A dead letter queue (DLQ) retains failed deliveries for 14 days for troubleshooting, and a CloudWatch alarm fires if SNS fails to deliver notifications. This means you are alerted not just about AWS Health issues, but also about failures in the notification pipeline itself.</li> 
 <li><strong>No deduplication:</strong> AWS Health events have a lifecycle — created, updated, resolved. Each update triggers a new notification. A single incident might generate 2–4 emails as the event progresses. For strict deduplication, consider pairing with AHA or adding a lightweight Lambda function.</li> 
 <li><strong>No escalation or acknowledgment:</strong> This solution sends notifications but does not track whether anyone acted on them. For on-call routing and escalation chains, integrate with an incident management tool like PagerDuty or OpsGenie via the SNS topic.</li> 
 <li><strong>No historical storage:</strong> Notifications are delivered in real time but not stored for later analysis. For post-incident review and trend reporting, pair with HEIDI or the CID Health Events Dashboard.</li> 
</ul> 
<p>The advantage of this approach is that it does not lock you into a single path. The notification configurations and event rules remain in place as you layer on additional capabilities.</p> 
<h2 id="cleanup">Cleanup</h2> 
<p>If you no longer need the health notification resources, delete the CloudFormation stack:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws cloudformation delete-stack --stack-name prioritize-aws-health-notifications</code></pre> 
</div> 
<p><strong>Note:</strong> AWS CloudFormation preserves resources with <code>DeletionPolicy: Retain</code> (notification configurations, event rules, email contacts, and channel associations) after you delete the stack. To fully remove them, delete the resources manually through the AWS User Notifications console or the AWS CLI.</p> 
<p><strong>Expected result:</strong> Stack reaches DELETE_COMPLETE within 2–3 minutes.</p> 
<h2 id="conclusion">Conclusion</h2> 
<p>In this post, we walked through how to set up priority-based AWS Health alerting using AWS User Notifications and a single CloudFormation template. The solution filters health events to only the services that matter to your organization, then separates what remains into immediate critical alerts and batched informational summaries.</p> 
<p>The core value is simplicity. No Lambda functions to patch. No DynamoDB tables to manage. No code to maintain. One stack, deployed in minutes, covering a single account or an entire organization. Because it uses only native AWS services with no support plan requirement, any team can adopt it regardless of their current tooling or support tier.</p> 
<p>This approach works as a standalone alerting solution. It also works as a starting point that you can extend with Slack and Microsoft Teams integration through AWS Chatbot in chat applications, escalation workflows through PagerDuty or OpsGenie, and historical analysis through HEIDI or CID.</p> 
<p>To get started, download the CloudFormation templates from the <a href="https://github.com/aws-samples/sample-prioritize-aws-health-alerts-using-user-notifications" rel="noopener" target="_blank">GitHub repository</a>. For more information, see the <a href="https://docs.aws.amazon.com/notifications/latest/userguide/what-is-service.html" rel="noopener" target="_blank">AWS User Notifications User Guide</a> and the <a href="https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html" rel="noopener" target="_blank">AWS Health User Guide</a>.</p> 
<p>If you have questions or want help implementing this solution for your organization, contact your AWS account team or visit the <a href="https://aws.amazon.com/contact-us/" rel="noopener" target="_blank">AWS Contact Us</a> page.</p> 
<h2>About the Authors</h2>