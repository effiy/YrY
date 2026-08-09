---
title: How Mapfre Insurance modernized fraud claims with Amazon EMR Serverless
tags:
- AWS Architecture
category: data-engineer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/how-mapfre-usa-modernized-fraud-claims-with-amazon-emr-serverless/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Tue, 14 Jul 2026 21:47:35 +0000
author: Lijan Kuniyil
status: stable
lifecycle: stable
---

<p>Insurance fraud remains a significant challenge for the insurance industry because fraudulent claims can increase loss costs, reduce trust, and consume investigation capacity that could otherwise be focused on serving customers. Traditional fraud detection approaches typically rely on rules-based controls, manual investigation triggers, historical claim patterns, and structured-data-only analysis. These approaches are useful for known fraud patterns, but they can struggle to detect sophisticated fraud rings or hidden relationships across claimants, policies, vehicles, providers, addresses, and prior suspicious activities.</p> 
<p><a href="https://www.mapfreinsurance.com/" rel="noopener" target="_blank">Mapfre Insurance</a> is the number one auto and home insurer in Massachusetts, serving customers in 11 states nationwide. Our coverage includes auto, home, motorcycle, watercraft, business insurance, and more. As part of Mapfre Group, we’re a worldwide leader serving over 31.1 million customers in more than 100 countries with a team of 31,000 employees. In collaboration with AWS and Neo4j, Mapfre Insurance modernized its fraud prevention capabilities by combining graph-based features with machine learning (ML) models deployed on AWS. This initiative, focused initially on Massachusetts Auto insurance and later expanded to Home (HO), has delivered significant business impact, exceeding $5 million Net Present Value (NPV), with realized savings already outperforming projections.</p> 
<p>In this post, we share how Mapfre Insurance designed and implemented this solution, highlight the technical architecture running on AWS specifically on the Mapfre Data Platform called Atenea, and explore lessons learned that can apply to other industries facing complex fraud challenges.</p> 
<h2 id="business-challenge">Business challenge</h2> 
<p>Fraudulent claims aren’t always isolated events. They often involve hidden networks of policyholders, vehicles, providers, and prior suspicious activities. Detecting these complex relationships requires going beyond traditional structured data analysis.</p> 
<p>Mapfre set out with a clear goal:</p> 
<ul> 
 <li><strong>Goal:</strong> Improve fraud detection accuracy and claims handling efficiency.</li> 
 <li><strong>Key KPI:</strong> Identify fraudulent claims missed by traditional methods.</li> 
 <li><strong>Approach:</strong> Develop several ML models that use both traditional structured data and graph-based features derived from claim relationships.</li> 
 <li><strong>Deployment:</strong> Integrate seamlessly with Guidewire Claims, so front-line adjusters automatically receive fraud alerts with explanations.</li> 
</ul> 
<p>Each flagged claim exposure generates a Guidewire activity showing the top three model drivers, helping investigators understand why the claim was identified and act quickly.</p> 
<h2 id="technical-solution-on-aws-atenea-data-platform">Technical solution on AWS (Atenea Data Platform)</h2> 
<p>The fraud detection platform is built on a modern data architecture on AWS, designed to scale efficiently and provide long-term governance.</p> 
<p>At its core, the solution uses <a href="https://iceberg.apache.org/" rel="noopener" target="_blank">Apache Iceberg</a> tables stored on Amazon Simple Storage Service (<a href="https://aws.amazon.com/s3/" rel="noopener" target="_blank">Amazon S3</a>), with metadata managed through the <a href="https://docs.aws.amazon.com/glue/latest/dg/components-overview.html#data-catalog-intro" rel="noopener" target="_blank">AWS Glue Data Catalog</a> and access governed through <a href="https://aws.amazon.com/lake-formation/" rel="noopener" target="_blank">AWS Lake Formation</a> as part of the Atenea lakehouse governance model. The platform feature store is implemented through feature-store-managed Iceberg tables that manage model features, predictions, and Guidewire activities. The implementation is structured across three logical layers:</p> 
<ul> 
 <li><strong>Silver Layer</strong> – Iceberg tables that contain source data from each of the sources, used as the initial consumption point of the platform.</li> 
 <li><strong>Gold Layer</strong> – Iceberg tables storing intermediate data, such as unified Guidewire activity logs, Auto features, and Home features.</li> 
 <li><strong>Platinum Layer</strong> – Feature Store-managed Iceberg tables containing encoded features and model predictions, making them reusable across models and ensuring strong metadata governance.</li> 
</ul> 
<p>Processing pipelines are executed on <a href="https://aws.amazon.com/emr/serverless/" rel="noopener" target="_blank">Amazon EMR Serverless</a>, with orchestration managed by Apache Airflow operators running on <a href="https://aws.amazon.com/managed-workflows-for-apache-airflow/" rel="noopener" target="_blank">Amazon Managed Workflows for Apache Airflow (Amazon MWAA)</a>. This provides elastic, cost-efficient compute for both batch processing and fast-time scoring, while keeping orchestration, monitoring, and recovery centralized.</p> 
<p>For graph enrichment, the platform connects to Neo4j using a dedicated driver, enabling advanced network-based features like suspicious claim linkages, provider fraud ratios, and centrality metrics.</p> 
<p>This architecture supports efficient, reliable, and transparent production execution through repeatable Airflow orchestration, environment-based continuous integration and delivery (CI/CD) promotion, centralized monitoring, failure notifications, retry mechanisms, dead-letter queue handling for Guidewire integration, and controlled secret management. At the same time, the layered lakehouse design keeps the platform flexible enough to evolve with new business needs and fraud detection use cases.</p> 
<p><img alt="Architecture diagram showing the Mapfre USA fraud detection platform on AWS, including data ingestion, graph enrichment, model scoring, and Guidewire integration" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/30/ARCHBLOG-1452-1.png" width="800" /></p> 
<p>The data sources are policy, claims, vehicles, and notes (from AS400 and Guidewire), which include structured data and derived features capturing entity relationships (graph data).</p> 
<p>The following list describes the architecture overview:</p> 
<ol type="1"> 
 <li><strong>Data ingestion</strong> – Claim batch data uploaded to Amazon S3. Data gets standardized and materialized in Iceberg tables within the Silver layer.</li> 
 <li><strong>Graph enrichment</strong> – Data processed to update Neo4j graph database hosted on AWS.</li> 
 <li><strong>Model training and scoring</strong> – Batch scoring for several ML models.</li> 
 <li><strong>Model orchestration</strong> – Unified orchestration for ingestion, training, and inference using Apache Airflow operators. CI/CD pipelines for promotion across environments.</li> 
 <li><strong>Execution platform</strong> – Amazon EMR Serverless for cost-efficient Spark processing. Migration to Apache Iceberg plus AWS Glue Data Catalog for scalable metadata handling.</li> 
 <li><strong>Integration with claims systems</strong> – Fraud predictions automatically create Guidewire activities, enriched with a description for investigators.</li> 
 <li><strong>Secrets and security</strong> – <a href="https://aws.amazon.com/secrets-manager/" rel="noopener" target="_blank">AWS Secrets Manager</a> securely stores credentials and tokens for Guidewire API integration, with environment-specific and Region-specific access controls.</li> 
 <li><strong>Monitoring and reliability</strong> – <a href="https://aws.amazon.com/cloudwatch/" rel="noopener" target="_blank">Amazon CloudWatch</a> and <a href="https://aws.amazon.com/sns/" rel="noopener" target="_blank">Amazon Simple Notification Service (Amazon SNS)</a> provide visibility into pipeline health and notify teams on failures. Data quality checks are executed at key stages of the pipeline to validate data availability, schema consistency, completeness, and business-rule expectations before outputs are consumed by models or sent to Guidewire.</li> 
</ol> 
<h2 id="guidewire-integration-with-mlops-on-aws">Guidewire integration with MLOps on AWS</h2> 
<p>One of the most important parts of Mapfre’s solution was closing the loop between ML predictions and the claims handling system. This required a resilient integration between the Atenea data platform on AWS and Guidewire Claims.</p> 
<p>The following describes the integration flow:</p> 
<ol type="1"> 
 <li>When an ML use case finishes scoring, the results are written as JSON files into the S3 path: <code>&lt;bucket_name&gt;/guidewire/</code>.</li> 
 <li>An S3 event notification triggers an <a href="https://aws.amazon.com/lambda/" rel="noopener" target="_blank">AWS Lambda</a> function.</li> 
 <li>This Lambda function: 
  <ul> 
   <li>Reads the JSON file.</li> 
   <li>Calls the Guidewire Predictive Model API.</li> 
   <li>Because Guidewire doesn’t support batch requests, the Lambda function sends each JSON payload individually. This keeps the integration compatible with Guidewire and isolates failures at the individual activity level, but it increases the number of API calls and makes retry, throttling, DLQ handling, and monitoring controls important.</li> 
  </ul> </li> 
 <li>If successful, the API responds with HTTP 201 (activity created). 
  <ul> 
   <li>If not, the Lambda function retries up to two times.</li> 
   <li>Failed requests are sent to an Amazon Simple Queue Service (Amazon SQS) dead-letter queue (DLQ), and an Amazon SNS notification is published for monitoring.</li> 
  </ul> </li> 
 <li>Secrets are stored in AWS Secrets Manager and injected as Lambda environment variables, along with AWS Region-specific URLs for token retrieval and API endpoints.</li> 
 <li>The following JSON shows the example structure for Guidewire integration:</li> 
</ol> 
<div class="hide-language"> 
 <pre><code class="language-json">{
  "method": "createPredictiveActivity",
  "params": [
    {
      "claimNumber": "AUXXXXXXX",
      "exposureNumber": 1,
      "subject": "Fraud alert from ML model",
      "description": "Claim flagged as potential fraud based on graph + ML features",
      "shortSubject": "ML_Fraud_Flag",
      "priority": "high",
      "availableForClosedClaim": true,
      "autoCloseOnExposureClosure": false,
      "targetDays": 4,
      "escalationDays": 6
    }
  ]
}</code></pre> 
</div> 
<p><img alt="Diagram showing the Guidewire integration flow with AWS Lambda, Amazon SQS dead-letter queue, and AWS Secrets Manager" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/30/ARCHBLOG-1452-2.png" width="800" /></p> 
<p>Key benefits of this integration:</p> 
<ul> 
 <li><strong>Real-time actionability</strong> – Fraud predictions automatically create Guidewire activities for front-line adjusters.</li> 
 <li><strong>Resilience</strong> – Built-in retries, DLQ handling, and Amazon SNS alerts make sure failed events aren’t lost.</li> 
 <li><strong>Security</strong> – Secrets and tokens are managed using AWS Secrets Manager, with strict environment separation (dev, pre, pro).</li> 
 <li><strong>Scalability</strong> – Any new MLOps use case writes results into the S3 output path, automatically flowing into Guidewire.</li> 
</ul> 
<p>This integration shows that fraud models don’t exist in isolation but actively augment daily claim workflows in production. It connects Atenea’s MLOps pipelines on AWS directly with business decisioning systems, which is critical to realizing the fraud savings impact.</p> 
<h2 id="data-quality-and-resilience">Data quality and resilience</h2> 
<p>For robustness, data quality checks are applied on ingestion pipelines and graph features. Automated validation detects anomalies early, monitoring dashboards track KPIs and model performance, and standardized recovery and promotion processes operate across environments.</p> 
<h2 id="visualization-and-investigative-tools">Visualization and investigative tools</h2> 
<p>Neo4j Bloom supports SIU workflows by visually exploring entity relationships, such as a provider linked across multiple suspicious claims, accelerating fraud ring identification.</p> 
<h2 id="conclusion">Conclusion</h2> 
<p>The fraud detection model in auto claims has enhanced Mapfre Insurance’s ability to identify fraudulent activity, driving significant savings and improving overall claims efficiency.</p> 
<p>During the pilot phase alone, savings exceeded projections, and in production the initiative has proven a Net Present Value (NPV) of more than $5M. These results confirm the business case and highlight the strength of combining structured data with graph-based features to uncover fraud networks that traditional approaches miss.</p> 
<p>The results have been compelling:</p> 
<ul> 
 <li><strong>Accuracy gains</strong> – Detection improved by 50–135 percent compared to baseline methods.</li> 
 <li><strong>Substantial realized value</strong> – Both during the pilot and in production.</li> 
 <li><strong>Cross-functional success</strong> – The initiative brought together Claims, IT Data, Advanced Analytics, and Neo4j teams in an agile, collaborative model.</li> 
</ul> 
<p>Beyond the financial outcomes, several lessons have emerged. First, cross-functional collaboration between groups like Claims, Data Engineering, Advanced Analytics, and technology partners like AWS and Neo4j was critical to success. Second, explainability proved essential. By presenting adjusters with the top model drivers directly in Guidewire, trust and adoption of the system increased substantially. Finally, building resilience into the architecture through monitoring, retries, and data quality processes helped the models operate reliably in production.</p> 
<p>Looking ahead, the platform is well-positioned to expand beyond fraud detection. New use cases such as underwriting anomaly detection and customer entity resolution are already on the roadmap. With robust architecture built on AWS using Amazon EMR Serverless, Apache Iceberg on Amazon S3 supported by AWS Glue Data Catalog and Lake Formation, a custom-built Feature Store, and Neo4j, Mapfre now has a scalable foundation to continue driving innovation and business impact.</p> 
<p>To learn more about <a href="https://aws.amazon.com/emr/serverless/" rel="noopener" target="_blank">Amazon EMR Serverless</a>, see the <a href="https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/emr-serverless.html" rel="noopener" target="_blank">Amazon EMR Serverless documentation</a>.</p>