---
title: 'Eclipse Dataspace Components on AWS: Cost optimization strategies'
tags:
- AWS Architecture
category: devops/processes
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/eclipse-dataspace-components-on-aws-cost-optimization-strategies/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Fri, 17 Jul 2026 16:03:47 +0000
author: Jorge Hernández Suárez
---

<p>When you deploy <a href="https://projects.eclipse.org/projects/technology.edc" rel="noopener" target="_blank">Eclipse Dataspace Components</a> (EDC) connectors on AWS, one of the first challenges you face is predicting and controlling the cost of the required infrastructure. Without clear benchmarks, it is difficult to make informed decisions about workload sizing, environment configuration, and long-term investment.</p> 
<p><a href="https://aws.amazon.com/blogs/architecture/eclipse-dataspace-components-on-aws-data-sharing-fundamentals/" rel="noopener" target="_blank">Part 1</a> of this 3-part blog series covered the fundamentals of data space architectures and the EDC per the International Data Space Association’s (IDSA) standards. <a href="https://aws.amazon.com/blogs/architecture/eclipse-dataspace-components-on-aws-architecture-patterns-in-production/" rel="noopener" target="_blank">Part 2</a> explored production-ready architecture patterns for deploying EDC connectors on <a href="https://aws.amazon.com/" rel="noopener" target="_blank">Amazon Web Services</a> (AWS), discussing operational excellence, security, and reliability principles. This final post covers the remaining three <a href="https://aws.amazon.com/architecture/well-architected/" rel="noopener" target="_blank">AWS Well-Architected Framework</a> pillars: Performance Efficiency, Cost Optimization, and Sustainability.</p> 
<p>In this post, you will learn which AWS services drive cost in an EDC connector deployment, how to estimate monthly costs for business-critical and non-critical workloads, and how to apply optimization strategies that can reduce your spending by up to 58%.</p> 
<h1>Understanding cost drivers in data space deployments</h1> 
<p>Data spaces are secure and sovereign data environments that enable data sharing across independent organizations. With these architectures, you can collaborate with external organizations while maintaining full control over your data and compliance with data sovereignty principles. Your infrastructure costs can vary significantly. The main factors are your performance and reliability requirements, along with data volume and velocity across the network. It’s also important to distinguish between two types of infrastructure. A Dataspace Governance Authority (DSGA) centrally establishes components such as management, identity, and discovery functions. Participants host other components themselves, including the connector. This blog post focuses only on costs associated with EDC connector deployment on the participant, that is, the data provider and consumer sides.</p> 
<h1>Fictional usage assumptions</h1> 
<p>Before diving into the numbers, here are technical and operational assumptions you can use as a baseline for your own estimates.</p> 
<h2 id="technical-assumptions">Technical assumptions</h2> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Category</strong></td> 
   <td><strong>Assumption</strong></td> 
   <td><strong>Justification</strong></td> 
  </tr> 
  <tr> 
   <td>Data Volume</td> 
   <td>5 GB per participant</td> 
   <td>Includes 6 months of historical data, and backups</td> 
  </tr> 
  <tr> 
   <td>Network Traffic</td> 
   <td>20 GB/month per participant</td> 
   <td>Data transfers between participants</td> 
  </tr> 
  <tr> 
   <td>API Calls</td> 
   <td>100,000/month per participant</td> 
   <td>Catalog queries, contract negotiations, and data transfers</td> 
  </tr> 
  <tr> 
   <td>OAuth Token Requests</td> 
   <td>1,000/month per participant</td> 
   <td>Machine-to-machine authentication for data plane operations</td> 
  </tr> 
 </tbody> 
</table> 
<p><em>Table 1: Technical assumptions for EDC connector cost estimation</em></p> 
<h2 id="operational-assumptions">Operational assumptions</h2> 
<ul> 
 <li>Single <a href="https://aws.amazon.com/about-aws/global-infrastructure/regions_az/" rel="noopener" target="_blank">AWS Region</a>: Spain (eu-south-2)</li> 
 <li>Operating hours: 24/7/365.</li> 
 <li>Growth rate: Not considered in baseline estimates.</li> 
 <li>Disaster recovery: Automated backups only (no cross-region replication)</li> 
</ul> 
<h1>Deployment architecture and scenarios</h1> 
<p><em>Figure 1</em> shows the reference architecture for deploying production-ready EDC connectors on AWS, covered in depth in Part 2 of this series.</p> 
<p><img alt="Production-ready EDC connector deployment architecture diagram showing AWS services including Amazon ECS, Amazon Aurora, Network Load Balancer, and supporting services" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/04/ARCHBLOG-1441-1.png" width="800" /></p> 
<p><em>Figure 1: Production-ready EDC connector deployment</em></p> 
<p>This post considers two cost scenarios depending on the criticality of the workload:</p> 
<ul> 
 <li>Business-critical workloads: Designed for high availability, performance, and reliability of use cases supporting critical business functions.</li> 
 <li>Non-critical workloads: Designed for use cases that tolerate interruptions, testing environments, or production workloads where brief disruptions are acceptable.</li> 
</ul> 
<p>Both scenarios follow the architecture patterns described in Part 2 of this post series, with the primary differences being in sizing of compute and database resources.</p> 
<h1>Cost estimation: Business-critical workloads</h1> 
<p>Note: These estimates use the assumptions above and illustrate the relative cost contribution of each service. Your actual costs may vary based on your specific usage patterns, data volumes and regional pricing. This post highlights which components represent the highest cost drivers and therefore come with the highest potential for optimization.</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>AWS Service</strong></td> 
   <td><strong>Configuration</strong></td> 
   <td><strong>Monthly Cost (USD)</strong></td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/rds/aurora/" rel="noopener" target="_blank">Amazon Aurora</a> PostgreSQL-Compatible Edition</td> 
   <td>db.r6g.large (2 vCPU, 16 GB), 20 GB storage + 10 GB backup</td> 
   <td align="right">276.00</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/ecs/">Amazon Elastic Container Service</a> (Amazon ECS) with <a href="https://aws.amazon.com/fargate/" rel="noopener" target="_blank">AWS Fargate</a></td> 
   <td>2 vCPU, 4 GB RAM, always on</td> 
   <td align="right">83.00</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/elasticloadbalancing/network-load-balancer/" rel="noopener" target="_blank">Network Load Balancer</a></td> 
   <td>20 GB processed data</td> 
   <td align="right">20.00</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/secrets-manager/" rel="noopener" target="_blank">AWS Secrets Manager</a></td> 
   <td>10 secrets</td> 
   <td align="right">4.00</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/cognito/" rel="noopener" target="_blank">Amazon Cognito</a></td> 
   <td>1K machine-to-machine (M2M) token requests</td> 
   <td align="right">2.25</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/ecr/">Amazon Elastic Container Registry</a> (Amazon ECR)</td> 
   <td>2 GB storage, 10 GB transfer</td> 
   <td align="right">1.00</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/api-gateway/" rel="noopener" target="_blank">Amazon API Gateway</a></td> 
   <td>100K REST API calls</td> 
   <td align="right">0.40</td> 
  </tr> 
  <tr> 
   <td><a href="https://aws.amazon.com/s3/" rel="noopener" target="_blank">Amazon Simple Storage Service</a> (Amazon S3)</td> 
   <td>5 GB Standard tier</td> 
   <td align="right">0.10</td> 
  </tr> 
  <tr> 
   <td><strong>Total</strong></td> 
   <td></td> 
   <td align="right"><strong>387.00</strong></td> 
  </tr> 
 </tbody> 
</table> 
<p><em>Table 2: Estimated monthly cost for business-critical EDC connector deployment</em></p> 
<p>These estimates help identify where your budget goes and where optimization has the most impact. In the business-critical scenario, the main cost driver is Amazon Aurora PostgreSQL. The db.r6g.large configuration is selected for constant workloads that require reliability and speed with high memory and performance. Amazon ECS with AWS Fargate is the second largest cost contributor as it runs containers continuously to maintain environment availability. Network Load Balancer represents a third notable cost component, while the remaining services contribute only a small portion of the total cost.</p> 
<h1>Cost estimation: Non-critical workloads</h1> 
<p>If you are running development, testing, or experimentation environments, you can reduce costs by up to 58% through rightsizing and use of <a href="https://aws.amazon.com/ec2/spot/" rel="noopener" target="_blank">Amazon EC2 Spot</a> capacity.</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>AWS Service</strong></td> 
   <td><strong>Configuration</strong></td> 
   <td><strong>Monthly Cost (USD)</strong></td> 
  </tr> 
  <tr> 
   <td>Amazon Aurora PostgreSQL-Compatible</td> 
   <td>db.t4g.medium (2 vCPU, 4 GB), 20 GB storage + 10 GB backup</td> 
   <td align="right">110.00</td> 
  </tr> 
  <tr> 
   <td>Amazon ECS with AWS Fargate Spot</td> 
   <td>2 vCPU, 4 GB RAM, always on</td> 
   <td align="right">26.00</td> 
  </tr> 
  <tr> 
   <td>Network Load Balancer</td> 
   <td>20 GB processed data</td> 
   <td align="right">20.00</td> 
  </tr> 
  <tr> 
   <td>AWS Secrets Manager</td> 
   <td>10 secrets</td> 
   <td align="right">4.00</td> 
  </tr> 
  <tr> 
   <td>Amazon Cognito</td> 
   <td>1K M2M token requests</td> 
   <td align="right">2.25</td> 
  </tr> 
  <tr> 
   <td>Amazon ECR</td> 
   <td>2 GB storage, 10 GB transfer</td> 
   <td align="right">1.00</td> 
  </tr> 
  <tr> 
   <td>Amazon API Gateway</td> 
   <td>100K REST API calls</td> 
   <td align="right">0.40</td> 
  </tr> 
  <tr> 
   <td>Amazon S3</td> 
   <td>5 GB Standard tier</td> 
   <td align="right">0.10</td> 
  </tr> 
  <tr> 
   <td><strong>Total</strong></td> 
   <td></td> 
   <td align="right"><strong>164.00</strong></td> 
  </tr> 
 </tbody> 
</table> 
<p><em>Table 3: Estimated monthly cost for non-critical EDC connector deployment</em></p> 
<p>These figures show that a non-critical configuration can cut costs significantly while maintaining the same data throughput and API capacity. Costs are reduced through the use of smaller and more flexible resources. Amazon Aurora PostgreSQL remains the main cost driver, but the smaller instance type (db.t4g.medium) reduces cost significantly. From a compute perspective, using Amazon ECS with AWS Fargate Spot capacity cuts costs by almost 70% compared to the business-critical setup. In total, this configuration reduces the monthly cost by approximately 58%, while maintaining identical assumptions for data throughput, API calls, and storage.</p> 
<h2 id="key-takeaways-on-cost-optimization">Key takeaways on cost optimization</h2> 
<p>This comparison shows that the primary cost contributors in both scenarios are database, compute and load balancing resources, which represent baseline infrastructure costs rather than usage-based charges. Services like Amazon S3, API Gateway, and data transfer charges contribute marginally to overall costs at these volumes. This cost structure indicates that the architecture scales efficiently with increased usage. As you onboard more use cases and increase data volume and velocity, you get more value from your existing infrastructure investment without proportional cost increases.</p> 
<h1>Well-Architected pillars: Performance efficiency, cost optimization, and sustainability</h1> 
<p>Part 2 of this series covered EDC best practices along the Operational Excellence, Security, and Reliability pillars of the <a href="https://aws.amazon.com/architecture/well-architected/" rel="noopener" target="_blank">AWS Well-Architected Framework</a>. This section covers the remaining three pillars as they apply to EDC deployments.</p> 
<h2 id="performance-efficiency">Performance efficiency</h2> 
<p><strong>Right-size compute resources:</strong> Match your Amazon ECS task definitions to actual workload requirements. Start with smaller configurations and scale up based on observed metrics rather than over-provisioning from the start. <a href="https://aws.amazon.com/cloudwatch/" rel="noopener" target="_blank">Amazon CloudWatch</a> Container Insights provides the visibility needed to make informed sizing decisions.</p> 
<p><strong>Use the flexibility of Amazon Aurora:</strong> For workloads with variable demand patterns, consider <a href="https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html" rel="noopener" target="_blank">Amazon Aurora Serverless v2</a> which automatically scales database capacity based on application needs. This eliminates the need to provision for peak capacity while maintaining performance during high-demand periods.</p> 
<p><strong>Optimize data transfer patterns:</strong> Design your data plane operations to minimize unnecessary data movement. Use <a href="https://aws.amazon.com/s3/transfer-acceleration/" rel="noopener" target="_blank">Amazon S3 Transfer Acceleration</a> for large transfers across geographic distances and consider data compression where appropriate to reduce both transfer times and costs.</p> 
<h2 id="cost-optimization">Cost optimization</h2> 
<p><strong>Reduce compute costs for fault-tolerant workloads:</strong> With AWS Fargate Spot, you can save up to 70% for workloads that can tolerate interruptions. Non-critical environments, batch processing, and development workloads are ideal candidates. Implement graceful shutdown handling to manage Spot interruptions effectively.</p> 
<p><strong>Lower storage costs over time:</strong> Configure <a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html" rel="noopener" target="_blank">Amazon S3 Lifecycle</a> policies to automatically transition infrequently accessed data to lower-cost storage classes such as <a href="https://aws.amazon.com/s3/storage-classes/intelligent-tiering/" rel="noopener" target="_blank">S3 Intelligent-Tiering</a> or <a href="https://aws.amazon.com/s3/storage-classes/glacier/instant-retrieval/" rel="noopener" target="_blank">S3 Glacier Instant Retrieval</a>. For EDC connector deployments, historical transfer logs and archived assets are good candidates for tiered storage.</p> 
<p><strong>Monitor for unexpected cost increases:</strong> Use <a href="https://aws.amazon.com/aws-cost-management/aws-cost-explorer/" rel="noopener" target="_blank">AWS Cost Explorer</a> and set up <a href="https://aws.amazon.com/aws-cost-management/aws-budgets/" rel="noopener" target="_blank">AWS Budgets</a> with alerts to help detect unexpected cost increases. Tag EDC-related AWS resources consistently so you can accurately allocate costs and identify optimization opportunities.</p> 
<p><strong>Lock in lower rates for predictable workloads:</strong> For business-critical connectors with predictable, steady-state usage, <a href="https://aws.amazon.com/savingsplans/" rel="noopener" target="_blank">Savings Plans</a> for Amazon Aurora and AWS Fargate can provide significant discounts compared to On-Demand pricing.</p> 
<h2 id="sustainability">Sustainability</h2> 
<p><strong>Optimize resource utilization:</strong> Higher utilization of provisioned resources means less waste. Use automatic scaling policies to match capacity with demand and shut down non-production environments outside of business hours when possible.</p> 
<p><strong>Select efficient instance types:</strong> <a href="https://aws.amazon.com/ec2/graviton/" rel="noopener" target="_blank">AWS Graviton</a>-based instances (such as the r6g and t4g families used in our example) deliver better price-performance and energy efficiency compared to equivalent x86 instances. AWS Graviton processors offer improved performance per watt of energy use.</p> 
<p><strong>Minimize data movement:</strong> Each data transfer consumes energy. Design your data space integrations to avoid redundant transfers, cache frequently accessed catalog data of peers locally using the Federated Catalog, and batch operations where possible to reduce the total number of network round trips.</p> 
<h1>Summary</h1> 
<p>By rightsizing AWS infrastructure to match actual compute and database capacity needs, data space participants can achieve significant cost savings without compromising on data security and sovereignty aspects that make data spaces valuable. The comparison between business-critical and non-critical workload configurations demonstrates how AWS services like Amazon Aurora, AWS Fargate Spot, and Amazon S3 can be combined effectively to balance data sovereignty, performance, and cost efficiency.</p> 
<p>As data spaces grow in adoption across industries and geographies, understanding these cost dynamics becomes increasingly important as you plan your network participation. The patterns and estimates in this post series offer a foundation for planning your cross-organizational data strategy and data spaces journey on AWS.</p> 
<p>To get started, assess your workload criticality to determine whether a business-critical or non-critical configuration fits your needs. Then use the <a href="https://calculator.aws/" rel="noopener" target="_blank">AWS Pricing Calculator</a> to estimate costs for your specific data volumes, regions, and usage patterns. For an end-to-end reference implementation, explore the <a href="https://github.com/awslabs/dataspace-connector-on-aws" rel="noopener" target="_blank">Dataspace Connector on AWS</a> project which combines Infrastructure-as-Code with custom EDC extensions and AI tooling integration.</p> 
<h2 id="references">References</h2> 
<ul> 
 <li><a class="uri" href="https://github.com/awslabs/dataspace-connector-on-aws" rel="noopener" target="_blank">https://github.com/awslabs/dataspace-connector-on-aws</a></li> 
 <li><a class="uri" href="https://github.com/awslabs/minimum-viable-dataspace-on-aws" rel="noopener" target="_blank">https://github.com/awslabs/minimum-viable-dataspace-on-aws</a></li> 
 <li><a class="uri" href="https://aws.amazon.com/architecture/well-architected/" rel="noopener" target="_blank">https://aws.amazon.com/architecture/well-architected/</a></li> 
</ul> 
<h2>About the authors</h2>