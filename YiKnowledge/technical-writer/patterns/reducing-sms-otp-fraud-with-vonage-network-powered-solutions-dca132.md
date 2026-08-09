---
title: Reducing SMS OTP fraud with Vonage network-powered solutions and Amazon Cognito
tags:
- AWS Architecture
category: technical-writer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/reducing-sms-otp-fraud-with-vonage-network-powered-solutions-and-amazon-cognito/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Wed, 17 Jun 2026 13:50:16 +0000
author: Tito Milla
status: stable
lifecycle: stable
---

<p>User authentication remains one of the most targeted touchpoints in application security. With the industrialization of fraud threats by generative AI, cybercrime costs are expected to reach <a href="https://www.sentinelone.com/cybersecurity-101/cybersecurity/cyber-security-statistics/" rel="noopener" target="_blank">$23 trillion</a> in 2027, an increase of 175 percent from 2022. <a href="https://newsroom.transunion.com/h2-2025-global-fraud-report/" rel="noopener" target="_blank">20 percent</a> of fraud is attributed to synthetic identity and authentication exploits, with account takeover (ATO) surging <a href="https://newsroom.transunion.com/h2-2025-global-fraud-report/" rel="noopener" target="_blank">141 percent</a> since 2021.</p> 
<p>But the damage goes beyond security. SMS One-time passcodes (OTPs) achieve only approximately <a href="https://mojoauth.com/white-papers/sms-otp-delivery-problems-solutions/" rel="noopener" target="_blank">80 percent conversion</a> on authentication flows, meaning <em>1 in 5 legitimate users is lost at the point of verification</em>. Enterprises absorb hundreds of thousands of password recovery helpdesk tickets annually, representing significant support costs tied to OTP-based verification. Every abandoned authentication attempt today represents an opportunity to maximize your conversion rates across checkout, account recovery, and onboarding flows. The industry has long assumed that stronger security requires more user friction. That isn’t a law of physics. It’s a limitation of the tools available. Mobile operator network data removes that constraint and provides stronger identity assurance and a smoother experience, not one at the expense of the other.</p> 
<p>In this post, we show how <a href="https://www.vonage.com/network-apis/" rel="noopener" target="_blank">Vonage network-powered solutions</a> work with <a href="https://aws.amazon.com/cognito/" rel="noopener" target="_blank">Amazon Cognito</a> to enhance many mobile-first use cases with network-level identity verification. Vonage network-powered solutions are a composable stack of real-time mobile operator intelligence, silent authentication, and integrated fraud protection, which uses the <code>CUSTOM_AUTH</code> flow to complete identity verification in under 5 seconds, with zero user interaction.</p> 
<h2 id="about-vonage">About Vonage</h2> 
<p>Vonage, part of Ericsson, is an AWS Partner with multiple AWS Marketplace listings. The company provides enterprise and CIAM deployments with cloud-based access to mobile operator network APIs, including real-time mobile identity and authentication across key regions. These complement Vonage’s global communications, voice, and video APIs backed by Ericsson’s global telecommunications infrastructure.</p> 
<h2 id="what-network-powered-means-and-why-it-matters">What network-powered means and why it matters</h2> 
<p>Before diving into architecture, it’s worth being precise about what separates Vonage’s network-powered solutions from the identity and fraud tools enterprises already have in their stack.</p> 
<p>Most identity verification signals today are derived from aggregated, cached, or behavioral data. Traditional phone number lookup services query static databases that may be days or weeks out of date. Device fingerprinting analyzes browser characteristics that might be spoofed. Behavioral biometrics builds models from historical sessions. This is useful, but a lagging indicator by definition.</p> 
<p>Enterprise customers who implement Vonage’s network-powered solutions operate from a fundamentally different layer: <em>real-time data</em> sourced directly from mobile network operators (MNOs). When you query whether a SIM was recently swapped, you’re querying the network that performed the swap. When <a href="https://www.vonage.com/communications-apis/verify/features/silent-authentication/" rel="noopener" target="_blank">Silent Authentication</a> verifies a user, the proof of possession is the cellular data session itself. This session can’t be phished, intercepted, or socially engineered.</p> 
<p>In fraud scenarios where SIM swaps are weaponized for account takeover (ATO), “recently” means minutes or hours, not days. Static databases refreshed weekly are not detecting these events. They’re logging them after the fact. Real-time operator queries close that window entirely.</p> 
<h2 id="the-three-pillars-identity-insights-verify-and-fraud-defender">The three pillars: Identity Insights, Verify, and Fraud Defender</h2> 
<p>Vonage network-powered solutions combine three API service components into a composable security stack that integrates with Amazon Cognito through the <code>CUSTOM_AUTH</code> flow:</p> 
<h3 id="identity-insights-pre-verification-intelligence">1. Identity Insights: Pre-verification intelligence</h3> 
<p><a href="https://www.vonage.com/communications-apis/identity-insights/" rel="noopener" target="_blank">Identity Insights</a> runs before verification channels are initiated, surfacing real-time operator signals that are directly actionable in authentication policy decisions. The following list shows a representative set of JSON elements that might be returned by a request. Customers have the option to select which data is most valuable given a specific authentication use case and industry combination.</p> 
<ul> 
 <li><strong><code>format</code> and <code>network_type</code>:</strong> Filters invalid numbers, VoIP, landline, and premium-rate numbers used in synthetic account creation and bot-driven fraud.</li> 
 <li><strong><code>sim_swap</code>:</strong> Detects SIM swaps within a configurable look-back window, a leading indicator of ATO events in progress.</li> 
 <li><strong><code>subscriber_match</code>:</strong> Compares subscriber identity (name, address) against operator Know Your Customer (KYC) records.</li> 
 <li><strong><code>device_swap</code>:</strong> A recent change in the mobile device associated with a phone number signals that a bad actor might have taken control of the SIM card. (coming soon)</li> 
 <li><strong><code>recycled_number</code>:</strong> Numbers previously deactivated and reassigned to a new subscriber can trigger false identity matches in onboarding flows, creating risk in account creation. (coming soon)</li> 
</ul> 
<p>These pre-checks trigger your defined risk policy: step-up challenge, hard block, or silent logging. Critically, fraudulent attempts are identified and blocked before a single OTP is sent, before verification costs are incurred, and before fraud processing overhead is generated.</p> 
<h3 id="verify-with-silent-authentication-alleviating-the-friction-tax">2. Verify with Silent Authentication: Alleviating the friction tax</h3> 
<p>Every additional step a user must finish during authentication carries a measurable cost: abandoned sign-ups, failed conversions, and support tickets from users who don’t receive or mistyped a code. We call this cumulative loss the friction tax. For SMS OTP flows with approximately 80 percent completion rates, the friction tax means roughly 20 percent of legitimate users drop off before they ever reach your application.</p> 
<p>After a number passes the risk pre-checks, the <a href="https://www.vonage.com/communications-apis/verify/" rel="noopener" target="_blank">Verify API</a> delivers the authentication challenge. The primary authentication method is Silent Authentication.</p> 
<p>When a user initiates sign-in from a mobile device, Vonage routes an HTTP request through the user’s cellular data connection. The mobile operator confirms that the SIM registered to the phone number matches the session making the request. The exchange happens in the background, in seconds. The user doesn’t see, type, copy, or enter any code.</p> 
<p>If Silent Authentication can’t finish or is unavailable, Verify automatically falls back to traditional SMS, RCS, Voice, WhatsApp, or email, remaining transparent to the user.</p> 
<p>Key benefit: Silent Authentication alleviates the three primary exploit vectors against SMS OTP: SIM swap (bad actor receives the code), SS7 interception (message diverted in transit), and social engineering (user tricked into sharing the code). All without additional input from the end user.</p> 
<h3 id="fraud-defender-protecting-the-verification-channel">3. Fraud Defender: Protecting the verification channel</h3> 
<p><a href="https://www.vonage.com/communications-apis/fraud-defender/" rel="noopener" target="_blank">Fraud Defender</a> addresses a threat familiar to enterprise finance teams: <em>artificially inflated traffic (AIT) and SMS pumping</em>. Automated systems trigger high volumes of OTPs sent to premium-rate numbers that bad actors control. At enterprise verification volumes, these events can run undetected for extended periods.</p> 
<p>Fraud Defender provides real-time traffic monitoring and intelligent blocking at the point of outbound delivery, intercepting these malicious events before costs accumulate. The financial impact is immediate and measurable. Fraud Defender typically absorbs its own cost in toll fraud prevention within the first billing cycle. For most enterprises, it quickly becomes a net revenue-positive investment. Vonage customers have collectively saved over $3M in SMS-related fraud costs since deployment. The savings continue to compound as the blocking algorithm evolves to counter new exploit patterns. For Verify customers, the value is even more compelling: Fraud Defender activates automatically with the Vonage Verify API at no additional cost. This makes it one of the highest-ROI fraud protections available.</p> 
<h2 id="prerequisites">Prerequisites</h2> 
<p>To implement this solution, you need:</p> 
<ul> 
 <li>An AWS account with permissions to create and manage Amazon Cognito, AWS Lambda, AWS Secrets Manager, Amazon CloudWatch, and AWS WAF resources.</li> 
 <li>An Amazon Cognito user pool (existing or new).</li> 
 <li>A Vonage API account with access to Identity Insights and Verify APIs.</li> 
 <li>AWS Command Line Interface (AWS CLI) or AWS Serverless Application Model (AWS SAM) CLI installed and configured.</li> 
 <li>For client integration: the Vonage Silent Authentication SDK for your mobile platform (iOS/Android).</li> 
</ul> 
<h2 id="solution-architecture-with-amazon-cognito">Solution architecture with Amazon Cognito</h2> 
<p>Enterprise customers that integrate the Vonage solution use the Amazon Cognito <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html" rel="noopener" target="_blank">CUSTOM_AUTH flow</a>, which uses three AWS Lambda functions that orchestrate the solution stack without changing your existing user pool configuration or downstream service integrations.</p> 
<p><img alt="Architecture diagram showing the Risk-Adaptive Customer Sign-In flow with layers including user devices, edge protection with Amazon CloudFront and AWS WAF, Amazon API Gateway, identity layer with Amazon Cognito, verification layer with Vonage Identity Insights, Verify API, and Fraud Defender, and the carrier network with Mobile Network Operators." src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/09/ARCHBLOG-1533-1.png" width="600" /></p> 
<h3 id="architecture-components">Architecture components</h3> 
<p>The solution connects five layers, each handling a distinct step in the authentication flow:</p> 
<ul> 
 <li><strong>Client app (mobile/web)</strong> – Initiates the <code>CUSTOM_AUTH</code> flow with the Vonage Silent Authentication SDK, follows <code>check_url</code> redirects over the cellular network, and submits the verification code back to Amazon Cognito.</li> 
 <li><strong>Amazon Cognito user pool</strong> – Orchestrates the <code>CUSTOM_AUTH</code> challenge flow and issues JWT tokens upon successful verification.</li> 
 <li><strong>AWS Lambda triggers</strong> – Define Auth Challenge (orchestrator), Create Auth Challenge (calls Vonage APIs), and Verify Auth Challenge (validates response).</li> 
 <li><strong>Vonage Network APIs</strong> – Identity Insights pre-check, Verify with Silent Auth and OTP (built-in failover), and Fraud Defender (automatic).</li> 
 <li><strong>Mobile network operators</strong> – SIM-level identity verification through CAMARA/Open Gateway APIs.</li> 
</ul> 
<h3 id="authentication-flow">Authentication flow</h3> 
<p>The following steps represent an authentication workflow sequence between Amazon Cognito and Vonage network-powered solutions:</p> 
<ol type="1"> 
 <li>The client calls <code>InitiateAuth</code> with <code>CUSTOM_AUTH</code>, passing the user’s phone number.</li> 
 <li>The <em>Define Auth Challenge</em> Lambda function instructs Amazon Cognito to issue a <code>CUSTOM_CHALLENGE</code>.</li> 
 <li>The <em>Create Auth Challenge</em> Lambda function calls Identity Insights for pre-verification risk assessment. If the number passes pre-checks, Lambda calls Vonage Verify to initiate Silent Authentication and returns the <code>check_url</code> to the client.</li> 
 <li>Upon receiving the <code>check_url</code>, the client opens an HTTPS connection to it, triggering HTTP redirects to the mobile carrier’s network for direct mobile-device-to-mobile-network-operator verification. Upon completion, the client receives a verification code from the operator.</li> 
 <li>The client calls <code>RespondToAuthChallenge</code> with the code.</li> 
 <li>The <em>Verify Auth Challenge</em> Lambda function submits the code to Vonage’s check endpoint. On success, it returns <code>answerCorrect = true</code> and Amazon Cognito issues the appropriate session token.</li> 
</ol> 
<p><img alt="Sequence diagram showing the User Login flow with SIM-swap pre-check using Vonage Identity Insights and Silent Authentication via Vonage Verify, orchestrated through the Amazon Cognito CUSTOM_AUTH flow with Lambda triggers." src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/09/ARCHBLOG-1533-2.png" width="600" /></p> 
<h3 id="coexistence-and-phased-rollout">Coexistence and phased rollout</h3> 
<p>A critical design principle: zero disruption to existing infrastructure. The Vonage Network API plugs into the Amazon Cognito <code>CUSTOM_AUTH</code> flow without changes to your existing user pool, app client configurations, or downstream service integrations. Deployment requires a single <code>sam deploy</code> command.</p> 
<p>This design approach allows for a phased rollout. Start with the highest-risk journeys (password recovery, high-value transactions) where security ROI is clearest, then expand to daily login and onboarding as you measure impact. Traditional SMS, RCS, and Voice OTP remain options for lower-risk flows during the transition.</p> 
<h2 id="risk-aware-workflows-by-journey-type">Risk-aware workflows by journey type</h2> 
<p>The strategic value of combining Vonage’s network-powered solutions with the Amazon Cognito policy-driven <code>CUSTOM_AUTH</code> flow is context-aware authentication calibrated to actual risk. CRITICAL journeys are recommended for the first phase of implementation as they aim to meaningfully mitigate synthetic identity and account takeover. The following table describes risk-aware workflows by journey type.</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Journey</strong></td> 
   <td><strong>Risk</strong></td> 
   <td><strong>Vonage Workflow</strong></td> 
  </tr> 
  <tr> 
   <td><strong>New account signup</strong></td> 
   <td>CRITICAL</td> 
   <td>Identity Insights filters invalid/non-mobile numbers + Subscriber Match validates KYC → Silent Auth for zero-tap onboarding</td> 
  </tr> 
  <tr> 
   <td><strong>Daily login</strong></td> 
   <td>MEDIUM</td> 
   <td>SIM swap recency + device consistency check → Silent Auth passively, step-up only on elevated signals</td> 
  </tr> 
  <tr> 
   <td><strong>Password recovery, profile change (contacts), 2FA settings change</strong></td> 
   <td>HIGH</td> 
   <td>Mandatory SIM swap hard-check (tight lookback window) + Subscriber Match → Silent Auth required, no passive bypass</td> 
  </tr> 
  <tr> 
   <td><strong>High-value transaction</strong></td> 
   <td>CRITICAL</td> 
   <td>Full signal stack (line type, SIM swap, subscriber match) → Silent Auth + secondary challenge if risk elevated</td> 
  </tr> 
 </tbody> 
</table> 
<p>Low-risk actions (for example, viewing account details, browsing content, or checking order history) generate no friction and no unnecessary verification cost. High-risk actions trigger the full assurance stack. The calibration is policy-driven and configurable per journey.</p> 
<h2 id="implementation-considerations">Implementation considerations</h2> 
<p>Configuring Amazon Cognito starts with <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html" rel="noopener" target="_blank">setting up the user pool</a> to allow the <code>CUSTOM_AUTH</code> authentication flow and accept phone numbers as the primary sign-in attribute. After the user pool is in place, associate the three required Lambda functions with their corresponding Amazon Cognito trigger hooks and store your Vonage API credentials in AWS Secrets Manager.</p> 
<p>Layer in security from the start, following the AWS Well-Architected Security Pillar. Scope each Lambda function’s AWS Identity and Access Management (IAM) role to only what it needs: Amazon Cognito trigger invocations and AWS Secrets Manager access. Enforce TLS 1.2+ on all communication for encryption in transit. For observability, turn on Amazon CloudWatch logging on each Lambda function and turn on AWS CloudTrail to capture Amazon Cognito API audit trails. Finally, deploy AWS WAF with rate-limiting rules in front of the authentication endpoint to protect against brute-force attempts.</p> 
<p>To configure the solution, follow these steps:</p> 
<ol type="1"> 
 <li>Set up the Amazon Cognito user pool to allow the <code>CUSTOM_AUTH</code> authentication flow.</li> 
 <li>Configure the user pool to accept phone numbers as the primary sign-in attribute.</li> 
 <li>Associate the three required Lambda functions with their corresponding Amazon Cognito trigger hooks.</li> 
 <li>Store your Vonage API credentials in AWS Secrets Manager.</li> 
</ol> 
<p><strong>Important:</strong> This solution creates AWS resources that incur charges. These include Amazon Cognito (per monthly active user), AWS Lambda (per invocation), AWS Secrets Manager (per secret per month), Amazon CloudWatch Logs, AWS CloudTrail, and AWS WAF (per rule and request). See the pricing page for each service and delete resources when no longer needed.</p> 
<h3 id="privacy-and-compliance">Privacy and compliance</h3> 
<p>The architecture is designed so that PII doesn’t leave the mobile operator. <a href="https://developer.vonage.com/en/identity-insights/guides/subscriber-match" rel="noopener" target="_blank">Subscriber Match</a> performs a comparison within the operator’s environment and returns only a match score. The underlying subscriber data isn’t transmitted. Silent Authentication operates without PII exchange. The cellular session is the credential.</p> 
<ul> 
 <li><strong>GDPR:</strong> Only match scores are returned. No subscriber PII is stored or transmitted, supporting GDPR data minimization.</li> 
 <li><strong>PSD2 / Open Banking:</strong> Silent Authentication qualifies as a possession-factor for Strong Customer Authentication (SCA).</li> 
 <li><strong>HIPAA:</strong> Subscriber Match supports identity assurance for healthcare applications.</li> 
 <li><strong>DORA:</strong> Multi-channel fallback achieves &gt; 99.9 percent verification availability.</li> 
 <li><strong>CCPA:</strong> Same data-minimization architecture as GDPR.</li> 
</ul> 
<h2 id="production-results-lydia-solutions">Production results: Lydia Solutions</h2> 
<p><a href="https://www.lydia.me/en" rel="noopener" target="_blank">Lydia Solutions</a>, one of Europe’s fastest-growing mobile financial services applications, deployed Vonage Verify with Silent Authentication in October 2024. The results demonstrate the real-world impact at scale, including up to 50 percent reduction in latency when compared to Lydia Solutions’s previous authentication services.</p> 
<blockquote>
 <p><em>“Vonage Verify with Silent Authentication has been a real innovation for us. The solution has elevated our ability to deliver a simpler, seamless and more secure user experience while protecting against increasingly sophisticated threats and fraud patterns.”</em></p>
</blockquote> 
<p>— William Brulin, Senior VP, Lydia Solutions</p> 
<p>Lydia’s results sit at the high end of outcomes observed. Across deployments in ecommerce, digital banking, and consumer services, conversion improvements of 2–8.5 percent compared to SMS-only are the norm, with authentication journey latency reductions of 50–75 percent.</p> 
<h2 id="conclusion">Conclusion</h2> 
<p>This is where mobile operator data shifts the approach. Rather than applying identical verification friction to every session, enterprises can use real-time network signals to make adaptive authentication decisions. Verify silently when conditions are right, step up when risk indicators appear, and block when fraud is detected.</p> 
<p>Enterprise implementation of the offering makes those risk signals and authentication methods accessible through a composable API layer. The combination of Identity Insights for pre-verification intelligence, Verify for network-layer authentication, and Fraud Defender for channel protection delivers risk-proportionate authentication that’s in production at scale today.</p> 
<p>The solution deploys with minimal changes to your existing Amazon Cognito user pool. Start with high-risk journeys, measure impact, and expand. Vonage Verify API is available across over 700 MNOs in over 200 countries and territories, and the integration requires only three Lambda functions.</p> 
<h3 id="next-steps">Next steps</h3> 
<ul> 
 <li><strong>Try it:</strong> <a href="https://developer.vonage.com/en/verify/overview" rel="noopener" target="_blank">Vonage Verify API documentation</a> and <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-challenge.html" rel="noopener" target="_blank">Amazon Cognito CUSTOM_AUTH guide</a>.</li> 
 <li><strong>Explore:</strong> <a href="https://aws.amazon.com/marketplace/search/results?CREATOR=4d44f6cc-7786-4018-8711-525abbf40c2e&amp;filters=CREATOR" rel="noopener" target="_blank">Vonage on AWS Marketplace</a>.</li> 
 <li><strong>Lydia case study:</strong> <a href="https://www.vonage.com/about-us/newsroom/press-releases/Lydia-Solutions-Partners-with-Vonage-to-Revolutionize-Security-and-User-Experience-Leveraging-Network-Capabilities/b1705e2e-513a-4a91-90f8-d3a6a755523e/" rel="noopener" target="_blank">Press release and results</a>.</li> 
 <li><strong>Contact:</strong> Reach out to your AWS account team or <a href="https://www.vonage.com/communications-apis/" rel="noopener" target="_blank">Vonage</a> to discuss integration.</li> 
</ul> 
<p><em>Vonage is an AWS Partner. To learn more, visit the Vonage <a href="https://aws.amazon.com/marketplace/search/results?searchTerms=vonage" rel="noopener" target="_blank">partner page</a>.</em></p> 
<p><em>The content and opinions in this post are those of the third-party author and AWS is not responsible for the content or accuracy of this post.</em></p> 
<hr /> 
<h2>About the authors</h2>