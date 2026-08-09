---
title: Automate custom PII detection at scale with Amazon Macie and Step Functions
tags:
- AWS Architecture
category: data-engineer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/automate-custom-pii-detection-at-scale-with-amazon-macie-and-step-functions/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Wed, 22 Jul 2026 13:30:26 +0000
author: Aishwariya Khiani
status: stable
lifecycle: stable
---

<p>Organizations in regulated industries like financial services, insurance, healthcare, and government ingest large volumes of data containing personally identifiable information (PII). Your applications, claims processing systems, partner data feeds, and internal workflows produce files that may include names, addresses, Social Security numbers, and domain-specific identifiers such as policy numbers, member IDs, and medical record numbers.</p> 
<p>Identifying and classifying this sensitive data is a compliance imperative. Regulations such as GDPR, HIPAA, CCPA, and PCI DSS require you to know where PII resides, who can access it, and how it is protected. Manual classification does not scale. While <a href="https://aws.amazon.com/macie/" rel="noopener" target="_blank">Amazon Macie</a> provides managed sensitive-data discovery, there could be formats that standard detection engines do not recognize by default. You can extend the detection capability with custom identifiers unique to your business.</p> 
<p>In this post, you learn how to build and deploy an event-driven pipeline that automatically detects PII the moment a file arrives in <a href="https://aws.amazon.com/pm/serv-s3/" rel="noopener" target="_blank">Amazon Simple Storage Service</a> (Amazon S3). It then extends beyond Macie built-in managed data identifiers by incorporating your own custom identifiers, which can detect organization-specific sensitive data types alongside standard PII.</p> 
<h2 id="solution-overview">Solution overview</h2> 
<p>The solution uses <a href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" rel="noopener" target="_blank">Amazon EventBridge</a> to trigger an <a href="https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html" rel="noopener" target="_blank">AWS Step Functions</a> workflow, which orchestrates Macie classification jobs, including custom data identifiers, and produces compliance reports with zero manual intervention. As each file lands in Amazon S3, the pipeline automatically invokes Macie to scan it using built-in and custom data identifiers, detecting standard and organization-specific PII without manual intervention. It then generates audit-ready reports in both CSV and JSON formats with full timestamps, giving your compliance team the documentation they need. For high-severity findings, the pipeline publishes real-time notifications through <a href="https://aws.amazon.com/sns/" rel="noopener" target="_blank">Amazon Simple Notification Service</a> (Amazon SNS) so your security team can respond immediately. To maintain clear data lineage throughout the process, the architecture implements a three-bucket pattern. This helps isolate objects by their processing state and ensures that unscanned data never mixes with validated data.</p> 
<h2 id="architecture">Architecture</h2> 
<p>This pipeline uses an event-driven architecture built on the following AWS services:</p> 
<ul> 
 <li>Amazon S3 – Storage layer organizing data across three buckets that represent each processing state: raw, staged, and scanned.</li> 
 <li>Amazon EventBridge – Detects new object uploads and triggers the workflow automatically, without polling.</li> 
 <li>AWS Step Functions – Orchestrates the entire scan lifecycle, coordinating each step from job creation through report generation.</li> 
 <li>Amazon Macie – Detects PII, scanning objects for sensitive data using both built-in and custom data identifiers.</li> 
 <li><a href="https://aws.amazon.com/pm/lambda/" rel="noopener" target="_blank">AWS Lambda</a> – Supplies the compute logic between orchestration steps from initiating Macie classification jobs, polling job status, parsing findings, generating reports, and moving objects between buckets.</li> 
 <li>Amazon SNS – Delivers real-time alerts to notify your team when high-severity findings are detected.</li> 
</ul> 
<p>The following figure provides an overview of the solution architecture using the listed services.</p> 
<p><img alt="Architecture diagram showing the event-driven PII detection pipeline with Amazon S3 buckets, Amazon EventBridge, AWS Step Functions, Amazon Macie, AWS Lambda, and Amazon SNS" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-1.png" width="800" /></p> 
<p><em>Figure 1 — Architecture overview</em></p> 
<p>Several design decisions shape this architecture. The pipeline creates a dedicated Macie classification job for each object rather than batching, which enables real-time PII detection at the point of ingestion. The three-bucket pattern noted earlier isolates unprocessed data from validated data, with the staging bucket configured to auto-expire objects. Step Functions orchestrates the workflow, using built-in retry logic and wait states to handle asynchronous job execution in Macie. Custom data identifiers extend detection capabilities of Macie to cover domain-specific patterns unique to your organization. Finally, Amazon EventBridge triggers the pipeline instead of native S3 event notifications, providing advanced filtering, support for multiple targets, and cross-account routing.</p> 
<h2 id="walkthrough">Walkthrough</h2> 
<p>In this section, you deploy and configure the automated PII detection pipeline.</p> 
<h3 id="prerequisites">Prerequisites</h3> 
<ul> 
 <li>A sandbox or non-prod AWS account with administrative access.</li> 
 <li><a href="https://aws.amazon.com/cli/" rel="noopener" target="_blank">AWS Command Line Interface</a> (AWS CLI) v2 installed and configured.</li> 
 <li>Amazon Macie should be enabled in your target AWS Region.</li> 
 <li>A valid email address for high-severity notifications.</li> 
</ul> 
<h3 id="step-1-deploy-the-aws-cloudformation-stack">Step 1: Deploy the <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" rel="noopener" target="_blank">AWS CloudFormation</a> stack</h3> 
<p>Download and deploy the complete solution through this sample <a href="https://github.com/aws-samples/sample-macie-pii-pipeline/blob/main/deployment/templates/macie_complete_solution.yaml" rel="noopener" target="_blank">CloudFormation template</a>.</p> 
<h4 id="option-a-using-aws-cli">Option A: Using AWS CLI</h4> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws cloudformation deploy \
  --template-file deployment/templates/macie_complete_solution.yaml \
  --stack-name macie-pii-pipeline \
  --parameter-overrides BucketNamePrefix=macie-pii-pipeline \
  NotificationEmail=security-team@example.com \
  --capabilities CAPABILITY_IAM --region us-east-1</code></pre> 
</div> 
<h4 id="option-b-using-aws-management-console">Option B: Using AWS Management Console</h4> 
<ol type="1"> 
 <li>Navigate to the AWS CloudFormation console.</li> 
 <li>Choose Create stack &gt; With new resources (standard).</li> 
 <li>Upload the template, fill in parameters, and submit.</li> 
</ol> 
<p>✓ Expected result: Stack reaches CREATE_COMPLETE after 3 to 5 minutes.</p> 
<p>The following image shows the sample Create stack parameters and configuration:</p> 
<p><img alt="AWS CloudFormation console showing the Create stack configuration page with parameters for BucketNamePrefix and NotificationEmail" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/22/ARCHBLOG-1488_Figure-2.png" width="800" /></p> 
<p><em>Figure 2 — CloudFormation console showing Create stack configuration page</em></p> 
<h3 id="step-2-confirm-the-amazon-sns-subscription">Step 2: Confirm the Amazon SNS subscription</h3> 
<p>Open the confirmation email and choose Confirm subscription.</p> 
<p>✓ Expected result: Subscription shows Confirmed in Amazon SNS console as demonstrated in the following screenshot</p> 
<p><img alt="Amazon SNS console showing a confirmed subscription status" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-3.png" width="800" /></p> 
<p><em>Figure 3 — Amazon SNS confirmed subscription</em></p> 
<h3 id="step-3-configure-custom-data-identifiers">Step 3: Configure custom data identifiers</h3> 
<p>The stack automatically provisions custom data identifiers from the CustomIdentifierPatterns parameter you provided during deployment. Verify they exist in the Macie console.</p> 
<div class="hide-language"> 
 <pre><code class="language-json">[{"name":"PolicyID","regex":"POL-[0-9]{6,10}"},
{"name":"MemberID","regex":"MEM-[A-Z]{2}[0-9]{6}"}]</code></pre> 
</div> 
<p>✓ Expected result: Custom identifiers show up on Macie console as demonstrated in the following image</p> 
<p><img alt="Amazon Macie console showing custom data identifiers for PolicyID and MemberID" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/22/ARCHBLOG-1488_Figure-4.png" width="800" /></p> 
<p><em>Figure 4 — Custom data identifiers in Macie console</em></p> 
<h3 id="step-4-test-the-pipeline">Step 4: Test the pipeline</h3> 
<ol type="1"> 
 <li>Upload a sample file to the raw bucket using the AWS CLI or console.</li> 
</ol> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws s3 cp test-file-with-pii.csv s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-raw/</code></pre> 
</div> 
<p>✓ Expected result: Step Functions execution starts within seconds.</p> 
<p>The following image shows the test files copied to the S3 bucket:</p> 
<p><img alt="Amazon S3 console showing the test file uploaded to the raw bucket" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/22/ARCHBLOG-1488_Figure-5.png" width="800" /></p> 
<p><em>Figure 5 — Test file uploaded to raw bucket</em></p> 
<h4 id="monitor-the-pipeline-progression">Monitor the pipeline progression</h4> 
<p>On your Step Functions console &gt; choose state machine &gt; view running operation.</p> 
<p>Note: The underlying Macie jobs may take some time to complete. Scan duration varies from job to job. The amount and type of data being scanned, its compression, and the number of data identifiers used all dictate how long a job takes to run. For the example illustrated in this post, jobs took roughly 15–20 minutes to complete. As a best practice, consider enabling S3 AWS CloudTrail data-event logging to audit the PII pipeline.</p> 
<p>✓ Expected result: Graph inspector shows active state in blue, completed in green.</p> 
<p><img alt="AWS Step Functions console showing the pipeline execution with active states highlighted" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-6.png" width="800" /></p> 
<p><em>Figure 6 — Step Functions pipeline</em></p> 
<p><img alt="AWS Step Functions Graph inspector showing completed states in green and active states in blue" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-7.png" width="800" /></p> 
<p><em>Figure 7 — Step Functions Graph inspector</em></p> 
<p>The Step Functions state machine orchestrates the end-to-end scanning workflow through five sequential states. First, <strong>TriggerScan</strong> copies newly uploaded objects to a staging bucket and creates a Macie classification job targeting that staged data. Once the job is submitted, the workflow enters <strong>WaitForMacie</strong>, which pauses execution for 60 seconds to allow the classification job time to process. Next, <strong>CheckStatus</strong> polls the Macie <code>DescribeClassificationJob</code> API to determine whether the job has completed. When the job finishes, <strong>GetFindings</strong> retrieves the classification results, generates detailed findings reports, and publishes a notification to an Amazon SNS topic for downstream consumers. Finally, <strong>MoveFiles</strong> relocates the original object from the raw bucket to a permanent scanned-data location and cleans up the staging copy.</p> 
<h4 id="verify-the-reports">Verify the reports</h4> 
<div class="hide-language"> 
 <pre><code class="language-bash">aws s3 ls s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-scanned/reports/</code></pre> 
</div> 
<p>✓ Expected result: Two timestamped files (CSV + JSON) per scan as shown in the following image</p> 
<p><img alt="Amazon S3 console showing timestamped CSV and JSON report files in the scanned bucket" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-8.png" width="800" /></p> 
<p><em>Figure 8 — Reports in scanned bucket</em></p> 
<p>Next, Amazon SNS triggers a notification email to the intended recipients. The following screenshot shows a sample notification.</p> 
<p><img alt="Sample Amazon SNS notification email showing PII detection findings" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-9.png" width="800" /></p> 
<p><em>Figure 9 — Amazon SNS notification email</em></p> 
<h3 id="step-5-review-the-data-flow">Step 5: Review the data flow</h3> 
<p>raw bucket → stage bucket → scanned bucket</p> 
<ul> 
 <li>Raw bucket – The file is removed after processing (versioning enabled).</li> 
 <li>Stage bucket – Auto-expires after seven days.</li> 
 <li>Scanned bucket – Contains the processed files and the reports.</li> 
</ul> 
<p>The following images show the three sample buckets created as part of this walkthrough.</p> 
<p><img alt="Amazon S3 console showing the raw bucket after pipeline execution" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-10.png" width="800" /></p> 
<p><img alt="Amazon S3 console showing the stage bucket after pipeline execution" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-11.png" width="800" /></p> 
<p><img alt="Amazon S3 console showing the scanned bucket with processed files and reports" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/20/ARCHBLOG-1488-8.png" width="800" /></p> 
<p><em>Figure 10 — Three-bucket state after execution</em></p> 
<h2 id="hardening-measures-to-deploy-in-production">Hardening measures to deploy in production</h2> 
<ul> 
 <li>For multi-tenant environments, deploy a separate stack per tenant using a distinct <code>BucketNamePrefix</code> to maintain strict data isolation.</li> 
 <li>Enable Amazon <a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryption.html" rel="noopener" target="_blank">S3 bucket default encryption</a> with SSE-S3 as default setting or with a customer-managed <a href="https://docs.aws.amazon.com/kms/latest/developerguide/overview.html" rel="noopener" target="_blank">AWS Key Management Service</a> (AWS KMS) key by passing the <code>KmsKeyArn</code> parameter.</li> 
 <li>Configure cross-account Amazon EventBridge rules for data sources spanning multiple accounts.</li> 
 <li>Be mindful of <a href="https://docs.aws.amazon.com/macie/latest/user/macie-quotas.html" rel="noopener" target="_blank">Macie quotas</a> for custom data identifiers: up to 10,000 per account, but a maximum of 30 per classification job. Split them across multiple jobs if you need more.</li> 
 <li>For high-volume workloads, batch multiple objects into a single Macie classification job to reduce API overhead and stay within the CreateClassificationJob throttle of 0.1 requests per second (one job every 10 seconds). See <a href="https://docs.aws.amazon.com/macie/latest/user/macie-quotas.html" rel="noopener" target="_blank">Macie quotas</a>.</li> 
 <li>Enable <a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/cloudtrail-logging-s3-info.html" rel="noopener" target="_blank">Amazon S3 AWS CloudTrail events</a> to maintain a complete audit trail of every object access and movement throughout the pipeline.</li> 
 <li>Enable <a href="https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html" rel="noopener" target="_blank">Amazon SNS data encryption</a> with SSE-KMS.</li> 
</ul> 
<h2 id="extending-this-solution">Extending this solution</h2> 
<ul> 
 <li>Data lake integration – Route JSON findings to <a href="https://docs.aws.amazon.com/athena/latest/ug/what-is.html" rel="noopener" target="_blank">Amazon Athena</a> or <a href="https://aws.amazon.com/glue/" rel="noopener" target="_blank">AWS Glue</a> for trend analysis. Build <a href="https://aws.amazon.com/quick/quicksight/" rel="noopener" target="_blank">Amazon QuickSight</a> dashboards for PII density visualization.</li> 
 <li>Remediation workflows – Extend Step Functions with a remediation branch to quarantine files or revoke access when high-severity PII is found.</li> 
 <li>Multi-account environments – Use <a href="https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html" rel="noopener" target="_blank">AWS Organizations</a> and Amazon EventBridge cross-account rules to centralize scanning in a dedicated security account.</li> 
 <li>Enhanced security posture – Publish findings to <a href="https://aws.amazon.com/security-hub/" rel="noopener" target="_blank">AWS Security Hub</a> for unified security posture management.</li> 
 <li>Batch for high-volume – Modify Trigger Scan to batch objects into a single Macie job for cost optimization at scale.</li> 
</ul> 
<h2 id="cleaning-up">Cleaning up</h2> 
<p>To avoid ongoing charges, delete all resources created by this solution:</p> 
<ol type="1"> 
 <li>Empty all S3 buckets created by the stack. CloudFormation cannot delete non-empty buckets. 
  <div class="hide-language"> 
   <pre><code class="language-bash">aws s3 rm s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-raw --recursive
aws s3 rm s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-stage --recursive
aws s3 rm s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-scanned --recursive
aws s3 rm s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-access-logs --recursive</code></pre> 
  </div> </li> 
 <li>Delete the CloudFormation stack. 
  <div class="hide-language"> 
   <pre><code class="language-bash">aws cloudformation delete-stack --stack-name macie-pii-pipeline --region us-east-1</code></pre> 
  </div> </li> 
 <li>Wait for stack deletion to complete. 
  <div class="hide-language"> 
   <pre><code class="language-bash">aws cloudformation wait stack-delete-complete --stack-name macie-pii-pipeline --region us-east-1</code></pre> 
  </div> </li> 
 <li>Amazon S3 buckets use DeletionPolicy: Retain preventing automatic removal. Delete retained buckets manually. 
  <div class="hide-language"> 
   <pre><code class="language-bash">aws s3 rb s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-raw
aws s3 rb s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-stage
aws s3 rb s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-scanned
aws s3 rb s3://macie-pii-pipeline-&lt;ACCOUNT_ID&gt;-access-logs</code></pre> 
  </div> </li> 
 <li>Disable Macie if no longer needed (optional). 
  <div class="hide-language"> 
   <pre><code class="language-bash">aws macie2 disable-macie --region us-east-1</code></pre> 
  </div> </li> 
</ol> 
<h2 id="conclusion">Conclusion</h2> 
<p>In this post, we demonstrated building an event-driven pipeline that automatically detects PII in files uploaded to Amazon S3. By combining Macie’s managed classification with custom data identifiers, orchestrated by AWS Step Functions and triggered in real time through Amazon EventBridge, the solution detects both standard and domain-specific sensitive data without manual intervention. The pipeline responds to S3 bucket uploads within seconds, runs each object through the full scan lifecycle, generates timestamped CSV and JSON reports for compliance, and delivers real-time Amazon SNS notifications when high-severity findings are detected.</p> 
<h3 id="getting-started">Getting started</h3> 
<p>To deploy this solution in your own environment, clone the <a href="https://github.com/aws-samples/sample-macie-pii-pipeline/" rel="noopener" target="_blank">GitHub repository</a> and follow the step-by-step deployment instructions in the README. This is a non-prod sample code without the listed hardening measures. You can extend the pipeline by adding custom data identifiers for your organization’s unique data formats, configuring cross-account Amazon EventBridge rules for multi-account environments, or batching objects per Macie job to optimize for high-volume workloads.</p> 
<p>To learn more, review the <a href="https://docs.aws.amazon.com/macie/" rel="noopener" target="_blank">Amazon Macie documentation</a> for additional detection capabilities, explore <a href="https://docs.aws.amazon.com/step-functions/latest/dg/best-practices.html" rel="noopener" target="_blank">AWS Step Functions best practices</a> for production error handling, and visit the <a href="https://aws.amazon.com/blogs/security/" rel="noopener" target="_blank">AWS Security Blog</a> for more data protection patterns.</p> 
<hr /> 
<h2>About the authors</h2>