---
title: How bitdrift scaled to 121 million concurrent gRPC connections on Amazon CloudFront
  for live telemetry sporting events
tags:
- AWS Architecture
category: devops/processes
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/how-bitdrift-scaled-to-121-million-concurrent-grpc-connections-on-amazon-cloudfront-for-live-telemetry-sporting-events/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Wed, 15 Jul 2026 15:27:47 +0000
author: Raghuram Gururajan
status: stable
lifecycle: stable
---

<p>When 121 million mobile devices establish persistent gRPC connections to your origin infrastructure within seconds of a live broadcast, the routing policy behind your DNS records matters far more than it does at normal traffic levels. The wrong policy can concentrate all your connections onto a single origin endpoint, turning a scaling success into an outage. <a href="https://bitdrift.io/?utm_campaign=uc&amp;utm_medium=blog&amp;utm_source=aws" rel="noopener" target="_blank">bitdrift</a>, a mobile observability platform founded by former Lyft infrastructure engineers, learned this firsthand while delivering real-time telemetry for a major customer during the T20 World Cup cricket series. As matches kicked off, <a href="https://aws.amazon.com/cloudfront/" rel="noopener" target="_blank">Amazon CloudFront</a> absorbed traffic surging from near-zero to 110K+ peak requests per second.</p> 
<p>bitdrift and the AWS account team diagnosed a connection concentration pattern under production pressure. The fix was a single DNS concentration change: migrating from weighted to multi-value answer routing. This change made bitdrift’s multi-<a href="https://aws.amazon.com/elasticloadbalancing/network-load-balancer/">Network Load Balancer</a> (NLB’s) architecture distribute load, and they served 121 million devices with zero server-side errors.</p> 
<p>bitdrift is a mobile observability platform (founded by ex-Lyft engineers) whose lightweight Capture performance-centric <a href="https://bitdrift.io/feature/performance-centric?utm_campaign=uc&amp;utm_medium=blog&amp;utm_source=aws" rel="noopener" target="_blank">SDK</a> provides real-time telemetry from millions of mobile devices. When bitdrift onboarded a major customer whose app serves live T20 World Cup cricket matches, they hit a scaling problem they hadn’t seen before: traffic surging from near-zero to tens of millions of concurrent gRPC connections within seconds of match start.</p> 
<h2 id="the-dns-resolution-imbalance">The DNS resolution imbalance</h2> 
<p>During early events in late February 2026, bitdrift experienced errors between CloudFront and their NLB origins under peak load. The AWS account team (SA, AM, TAM, CloudFront service team, and <a href="https://aws.amazon.com/route53/" rel="noopener" target="_blank">Amazon Route 53</a> specialists) identified the root cause: Route 53 Weighted routing was returning a single IP per DNS response. This caused all CloudFront cache hosts to resolve to the same origin for the duration of the TTL, creating a thundering herd effect that overwhelmed individual NLBs.</p> 
<h3 id="the-ttl-driven-traffic-concentration">The TTL-driven traffic concentration</h3> 
<p>When you use weighted routing in Route 53, each DNS query returns a single IP address. At CloudFront’s scale, this means all edge nodes resolve your origin to the same load balancer for the duration of the DNS TTL. This creates a concentration effect where one NLB absorbs all traffic until the TTL expires and a new resolution occurs. Even after the customer scaled from 2 to 6 NLB IPs, the problem persisted because weighted routing returned a single IP per response. All CloudFront edge nodes resolved to the same origin for the duration of the TTL, making it appear that adding more origins had no effect.</p> 
<h2 id="why-persistent-connections-amplify-this-problem">Why persistent connections amplify this problem</h2> 
<p>Unlike short-lived HTTP requests, gRPC connections are long-lived and accumulate on whichever origin was resolved at connection time. This meant that a DNS configuration producing mild unevenness with stateless traffic caused catastrophic overload with persistent connections. Even after the customer scaled from 2 to 6 NLB IPs, the problem persisted. Weighted routing returned a single IP per response, and all CloudFront edge nodes resolved to the same origin for the duration of the TTL. This made it appear that adding more origins had no effect.</p> 
<h2 id="architecture-diagram">Architecture diagram</h2> 
<p>The following diagram shows the end-to-end architecture, from CloudFront edge nodes through Route 53 to the multi-region NLB fleet.</p> 
<p><img alt="" class="alignnone wp-image-17919 size-full" height="739" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/14/Picture1-5.png" width="1384" /></p> 
<p><em>Figure 1. Amazon Route 53 is the origin-facing DNS routing layer between CloudFront and the multi-AZ Network Load Balancer (NLB) fleet. When CloudFront edge nodes need to reach the origin, they resolve the origin domain through Route 53, which directs traffic to the appropriate NLB across AZ-1, AZ-2, and AZ-3. Each NLB then forwards connections to its corresponding Amazon Elastic Kubernetes Service (Amazon EKS) workloads running within a virtual private cloud (VPC). Under Weighted routing, Route 53 returns only a single IP per DNS query, causing all edge nodes to converge on one NLB per TTL window, creating the thundering herd effect.</em></p> 
<h1>The fix: multi-value answer routing</h1> 
<p>Multi-Value Answer routing returns up to 8 IP addresses per DNS query, with built-in health checks per record. CloudFront edge nodes can immediately spread connections across multiple origins from the first DNS resolution, eliminating the single-origin bottleneck.</p> 
<p>The customer-side change was straightforward:</p> 
<ul> 
 <li><strong>bitdrift switched from Weighted to Multi-Value Answer routing,</strong> which returns up to 8 IPs per DNS response with built-in health checks spreading origin connections across multiple NLBs immediately.</li> 
</ul> 
<p>The customer didn’t need to change any code or redesign their architecture. A DNS configuration update was all it took to handle 121 million concurrent devices with zero errors.</p> 
<p><img alt="Graph showing traffic patterns during the T20 World Cup cricket series" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/16/ARCHBLOG-1460-5-fixed.jpg" width="800" /></p> 
<h2 id="before-vs.-after-comparison">Before vs.&nbsp;after comparison</h2> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Aspect</strong></td> 
   <td><strong>Before (Weighted Routing)</strong></td> 
   <td><strong>After (Multi-Value Routing)</strong></td> 
  </tr> 
  <tr> 
   <td><strong>IPs returned per DNS query</strong></td> 
   <td>1</td> 
   <td>8</td> 
  </tr> 
  <tr> 
   <td><strong>Origin load distribution</strong></td> 
   <td>All traffic to single NLB per TTL window</td> 
   <td>Traffic spread across multiple NLBs immediately</td> 
  </tr> 
  <tr> 
   <td><strong>Behavior under surge</strong></td> 
   <td>Thundering herd single NLB overwhelmed</td> 
   <td>Even distribution no single point of overload</td> 
  </tr> 
  <tr> 
   <td><strong>Errors at peak load</strong></td> 
   <td>Origin errors between CloudFront and NLB</td> 
   <td>Zero server-side errors</td> 
  </tr> 
  <tr> 
   <td><strong>Customer-side change required</strong></td> 
   <td>—</td> 
   <td>DNS configuration update only</td> 
  </tr> 
 </tbody> 
</table> 
<h1>Results and key metrics</h1> 
<p>Before the fix, CloudFront cache hosts resolved the origin domain to a single NLB IP per DNS TTL window (60 seconds). During traffic surges, this funneled all origin connections through a single load balancer, overwhelming its capacity.</p> 
<p>On the February 27th event (14 million concurrent connections), approximately 80% of requests failed with HTTP 500 errors. The issue recurred on March 1st despite scaling to 4 NLB IPs. Weighted routing still returned only one IP per DNS response, so adding more origins had no effect until the routing policy was changed.</p> 
<p>After switching to Multi-Value Answer routing on March 4th, CloudFront cache hosts immediately began resolving all 6 origin IPs simultaneously. During the next peak event, there were zero origin connection errors. By the final match on March 8th, bitdrift handled 121 million unique devices and 110K+ peak requests per second with zero server-side errors.</p> 
<h2 id="key-metrics">Key metrics</h2> 
<ul> 
 <li>121M unique devices during a single live sporting event.</li> 
 <li>110K+ peak requests per second.</li> 
 <li>100x traffic surge handled (near-zero to peak in seconds).</li> 
 <li>Zero server-side errors.</li> 
 <li>Minimal customer change: DNS configuration update only.</li> 
</ul> 
<h2 id="performance-before-vs.-after">Performance before vs.&nbsp;after</h2> 
<p><img alt="Performance comparison chart showing error rates before and after switching to multi-value answer routing" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/15/ARCHBLOG-1460-3-corrected.png" width="800" /></p> 
<h2 id="improvement-summary">Improvement summary</h2> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Metric</strong></td> 
   <td><strong>Before (Mar 1–2)</strong></td> 
   <td><strong>After (Mar 7–9)</strong></td> 
   <td><strong>Improvement</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Peak 5xx Error Rate</strong></td> 
   <td>79.80%</td> 
   <td>0.033%</td> 
   <td><strong>99.96% reduction</strong> (2,418× better)</td> 
  </tr> 
  <tr> 
   <td><strong>Avg 5xx Error Rate</strong></td> 
   <td>1.87%</td> 
   <td>0.003%</td> 
   <td><strong>99.84% reduction</strong> (623× better)</td> 
  </tr> 
  <tr> 
   <td><strong>Peak 5-min Requests</strong></td> 
   <td>169M</td> 
   <td>49.3M</td> 
   <td>Different event scale</td> 
  </tr> 
  <tr> 
   <td><strong>Peak Requests/sec</strong></td> 
   <td>563K</td> 
   <td>164K</td> 
   <td>Different event scale</td> 
  </tr> 
  <tr> 
   <td><strong>Avg 4xx Error Rate</strong></td> 
   <td>0.014%</td> 
   <td>0.007%</td> 
   <td><strong>50% reduction</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Server-Side Outages</strong></td> 
   <td>Multiple origin failures</td> 
   <td>Zero</td> 
   <td><strong>100% elimination</strong></td> 
  </tr> 
  <tr> 
   <td><strong>Unique Devices (Mar 8)</strong></td> 
   <td>121 million</td> 
   <td>121 million</td> 
   <td>Zero server-side errors</td> 
  </tr> 
 </tbody> 
</table> 
<h1>Technical walk-through</h1> 
<p>To switch your Route 53 origin records from weighted routing to multi-value answer routing, follow these steps. If you’re using CloudFront with multiple origin load balancers, this configuration ensures traffic is distributed evenly across all of them from the first request.</p> 
<h2 id="prerequisites">Prerequisites</h2> 
<p>Before you begin, make sure you have:</p> 
<ul> 
 <li>An AWS account with access to Route 53 and CloudFront.</li> 
 <li>A hosted zone in Route 53 for your domain.</li> 
 <li>Two or more NLB’s serving as CloudFront origins.</li> 
 <li>A CloudFront distribution configured with your origin domain.</li> 
 <li><a href="https://aws.amazon.com/cli/" rel="noopener" target="_blank">AWS Command Line Interface (AWS CLI)</a> installed (optional, for CLI steps).</li> 
</ul> 
<h2 id="step-1-identify-your-current-origin-records">Step 1: Identify your current origin records</h2> 
<p>First, check what records currently exist for your origin domain.</p> 
<h3 id="in-the-console">In the console:</h3> 
<ol type="1"> 
 <li>Open the Route 53 console.</li> 
 <li>Choose <strong>Hosted zones</strong> in the left navigation.</li> 
 <li>Select your hosted zone (for example, origin.example.com).</li> 
 <li>Find the records for your origin domain (for example, origin.example.com).</li> 
 <li>Note the routing policy. If it says Weighted, this guide applies to you.</li> 
</ol> 
<h3 id="using-the-cli">Using the CLI:</h3> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws route53 list-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --query "ResourceRecordSets[?Name=='origin.example.com.']"</code></pre> 
</div> 
<p>You’ll see something like:</p> 
<div class="hide-language"> 
 <pre><code class="language-json">[
  {
    "Name": "origin.example.com.",
    "Type": "A",
    "SetIdentifier": "nlb-1",
    "Weight": 50,
    "AliasTarget": {
      "DNSName": "nlb-1-abcdef.elb.us-east-1.amazonaws.com.",
      "HostedZoneId": "Z26RNL4JYFTOTI",
      "EvaluateTargetHealth": true
    }
  },
  {
    "Name": "origin.example.com.",
    "Type": "A",
    "SetIdentifier": "nlb-2",
    "Weight": 50,
    "AliasTarget": {
      "DNSName": "nlb-2-ghijkl.elb.us-east-1.amazonaws.com.",
      "HostedZoneId": "Z26RNL4JYFTOTI",
      "EvaluateTargetHealth": true
    }
  }
]</code></pre> 
</div> 
<h2 id="step-2-create-health-checks-for-each-origin">Step 2: Create health checks for each origin</h2> 
<p>Multi-Value Answer routing requires a health check attached to each record. The main advantage here is that unhealthy origins are automatically removed from the DNS responses.</p> 
<h3 id="in-the-console-1">In the console:</h3> 
<ol type="1"> 
 <li>In Route 53, choose <strong>Health checks</strong> in the left navigation.</li> 
 <li>Choose <strong>Create health check</strong>.</li> 
 <li>Configure:</li> 
</ol> 
<ul> 
 <li>Name: nlb-1-health-check.</li> 
 <li>What to monitor: Endpoint.</li> 
 <li>Specify endpoint by: Domain name.</li> 
 <li>Protocol: TCP (or HTTP/HTTPS if your origin supports it).</li> 
 <li>Domain name: nlb-1-abcdef.elb.us-east-1.amazonaws.com.</li> 
 <li>Port: Your origin port (for example, 443).</li> 
 <li>Request interval: 10 seconds (Fast) recommended for burst traffic patterns.</li> 
 <li>Failure threshold: 3.</li> 
</ul> 
<ol start="4" type="1"> 
 <li>Choose <strong>Create health check</strong>.</li> 
 <li>Repeat for each NLB.</li> 
</ol> 
<h3 id="using-the-cli-1">Using the CLI:</h3> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws route53 create-health-check \
  --caller-reference "nlb-1-health-$(date +%s)" \
  --health-check-config '{
    "Type": "TCP",
    "FullyQualifiedDomainName": "nlb-1-abcdef.elb.us-east-1.amazonaws.com",
    "Port": 443,
    "RequestInterval": 10,
    "FailureThreshold": 3
  }'</code></pre> 
</div> 
<h2 id="step-3-create-multi-value-answer-records">Step 3: Create multi-value answer records</h2> 
<p>Note: <em>Multi-Value Answer routing requires IP address records, not Alias records. Assign Elastic IP addresses to each NLB Availability Zone before proceeding — Application Load Balancers are not compatible with this pattern because they do not support static IP addresses.</em></p> 
<p>Now create the new records with Multi-Value Answer routing.</p> 
<h3 id="in-the-console-2">In the console:</h3> 
<ol type="1"> 
 <li>Choose <strong>Create record</strong>.</li> 
 <li>Configure:</li> 
</ol> 
<ul> 
 <li>Record name: origin (or your subdomain)</li> 
 <li>Record type: A.</li> 
 <li>Routing policy: Multi-Value Answer.</li> 
 <li>Value/Route traffic to: Enter the IP address of your first NLB (or use the NLB’s static IP).</li> 
 <li>Health check: Select the health check you created for this NLB.</li> 
 <li>Record ID: nlb-1 (a unique ID for this record)</li> 
 <li>TTL: 60 seconds (keep it low for faster failover).</li> 
</ul> 
<ol start="3" type="1"> 
 <li>Choose <strong>Create records</strong>.</li> 
 <li>Repeat for each NLB.</li> 
</ol> 
<h3 id="using-the-cli-2">Using the CLI:</h3> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "origin.example.com.",
          "Type": "A",
          "SetIdentifier": "nlb-1",
          "MultiValueAnswer": true,
          "TTL": 60,
          "ResourceRecords": [{"Value": "10.0.1.100"}],
          "HealthCheckId": "abcd1234-5678-90ab-cdef-EXAMPLE1"
        }
      },
      {
        "Action": "CREATE",
        "ResourceRecordSet": {
          "Name": "origin.example.com.",
          "Type": "A",
          "SetIdentifier": "nlb-2",
          "MultiValueAnswer": true,
          "TTL": 60,
          "ResourceRecords": [{"Value": "10.0.2.100"}],
          "HealthCheckId": "abcd1234-5678-90ab-cdef-EXAMPLE2"
        }
      }
    ]
  }'</code></pre> 
</div> 
<h2 id="step-4-delete-the-old-weighted-records">Step 4: Delete the old weighted records</h2> 
<p>Once you’ve verified the Multi-Value Answer records are returning correctly (Step 5), delete the original Weighted routing records. Route 53 does not allow mixed routing policies for the same record name. The old Weighted records must be removed.</p> 
<h2 id="step-5-verify-the-configuration">Step 5: Verify the configuration</h2> 
<div class="hide-language"> 
 <pre><code class="language-bash">dig origin.example.com +short</code></pre> 
</div> 
<p>You should see multiple IPs returned simultaneously:</p> 
<div class="hide-language"> 
 <pre><code class="language-plaintext">10.0.1.100
10.0.2.100
10.0.3.100</code></pre> 
</div> 
<h1>Summary of challenges</h1> 
<p>Resolving the issue under production pressure presented several challenges:</p> 
<ul> 
 <li><strong>Diagnosing under fire:</strong> The initial outage occurred during a live T20 World Cup match with 14 million concurrent connections. Root cause analysis had to happen in real-time while the customer’s production traffic was failing.</li> 
 <li><strong>Persistent connections amplify DNS routing issues:</strong> Unlike short-lived HTTP requests, gRPC connections are long-lived and accumulate on whichever origin was resolved at connection time. This meant that a DNS configuration producing mild unevenness with stateless traffic caused catastrophic overload with persistent connections.</li> 
 <li><strong>DNS caching obscured the real bottleneck:</strong> Even after the customer scaled from 2 to 6 NLB IPs, the problem persisted. Because Weighted routing returned a single IP per response, all CloudFront edge nodes resolved to the same origin for the duration of the TTL. This made it appear that adding more origins had no effect.</li> 
 <li><strong>Customer coordination under time pressure:</strong> The customer was initially reluctant to change their Route 53 configuration ahead of the next match. Working with the AWS account team to build confidence in the DNS change while a live event was days away required clear communication of the root cause and expected impact.</li> 
</ul> 
<h1>Conclusion</h1> 
<p>This case demonstrates that at extreme scale, infrastructure decisions that seem routine can become the difference between a flawless event and a production outage. Choosing a DNS routing policy is one such decision. bitdrift’s architecture was sound: CloudFront at the edge, NLBs at the origin, gRPC for efficient persistent connections. But Weighted routing’s single-IP-per-response behavior created a thundering herd that no amount of origin scaling could overcome.</p> 
<p>The fix was purely configuration: switching from weighted to multi-value answer routing in Route 53. After that change, bitdrift handled 121 million concurrent devices with zero errors.</p> 
<p>If you’re running CloudFront with multiple origin load balancers, especially with persistent connection protocols like gRPC or WebSocket, review your Route 53 routing policy. Multi-Value Answer routing ensures that CloudFront edge nodes distribute origin connections across all available endpoints from the first DNS resolution. This eliminates the single-origin bottleneck that Weighted routing can create under surge conditions.</p> 
<p>For pre-event capacity planning or to discuss your architecture with an AWS specialist, contact your AWS account team or reach out through AWS Support.</p> 
<h2 id="key-takeaways">Key takeaways</h2> 
<ol type="1"> 
 <li><strong>DNS routing policy selection matters at extreme scale.</strong> Weighted vs.&nbsp;Multi-Value Answer has significant implications for origin load distribution behind CloudFront.</li> 
 <li><strong>Persistent connections (gRPC, WebSocket) amplify DNS routing problems.</strong> Unlike stateless HTTP where connections are short-lived, persistent connections accumulate on whichever origin was resolved at connection time. A DNS misconfiguration that causes mild unevenness with HTTP traffic can cause catastrophic overload with persistent connections.</li> 
 <li><strong>Engaging AWS service teams early</strong> for pre-event capacity reviews prevents day-of failures.</li> 
 <li><strong>A DNS configuration change can improve scale</strong> without requiring any architectural changes.</li> 
</ol> 
<h2>About the authors</h2>