---
title: S&P Global’s innovative disaster recovery strategy using Amazon FSx for NetApp
  ONTAP snapshots
tags:
- AWS Architecture
category: data-engineer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/sp-globals-innovative-disaster-recovery-strategy-using-amazon-fsx-for-netapp-ontap-snapshots/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Tue, 07 Jul 2026 16:32:21 +0000
author: Nishanth Charlakola
status: stable
lifecycle: stable
---

<p><em>This post is co-written by Nishanth Charlakola from S&amp;P Global.</em></p> 
<p>Organizations have a requirement to build high availability and disaster recovery (HA/DR) solutions for their complex SQL Server infrastructure to maintain data availability and integrity. With the rapid pace of cloud adoption, businesses across different industries have realized the value of a successful proof of concept (POC) for any technical project that migrates existing environments to the cloud. For companies of any size, it is important to set standards, minimize risks, and conduct business and technical validation while maintaining speed.</p> 
<p>In this post, we explain how <a href="https://www.spglobal.com/market-intelligence/en" rel="noopener noreferrer" target="_blank">S&amp;P Global Market Intelligence</a> implemented an innovative disaster recovery solution for their Capital IQ platform using <a href="https://aws.amazon.com/fsx/netapp-ontap/" rel="noopener noreferrer" target="_blank">Amazon FSx for NetApp ONTAP</a>. This solution enables immediate failover to read-only mode in a secondary region within 15 minutes, followed by full read-write recovery when needed. This approach achieves reduction in failover time while maintaining data consistency for global financial operations.</p> 
<p>S&amp;P Global Market Intelligence has been providing essential intelligence that unlocks opportunity, fosters growth, and accelerates progress for more than 160 years. The company offers Environmental, Social, and Governance (ESG) solutions, deep data, and insights on critical economic, market, and business factors.</p> 
<h1>Business challenge</h1> 
<p>S&amp;P Global Market Intelligence must maintain uninterrupted access to information, even during regional outages. The Capital IQ platform supports global clients who rely on timely and accurate data for decision-making, with business requirements mandating strict Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).The primary business challenge was making sure that once the decision to fail over has been made, the DR read-only system becomes operational and accessible within 15 minutes. This rapid failover window makes sure you can continue accessing essential financial information with minimal disruption during failover events.</p> 
<h1>Key challenges addressed</h1> 
<ul> 
 <li><strong>Facilitating sub-15-minute access</strong> to critical financial data during regional service disruptions</li> 
 <li><strong>Maintaining data consistency</strong> for financial reporting</li> 
 <li><strong>Supporting system availability</strong> during production code releases</li> 
 <li><strong>Optimizing cross-region data replication costs</strong> without compromising performance</li> 
 <li><strong>Meeting regulatory requirements</strong> for business continuity in financial services</li> 
</ul> 
<h1>Solution overview</h1> 
<p>S&amp;P Global’s DR strategy for the Capital IQ platform follows a two-pronged approach that balances immediate availability with complete recovery capabilities:</p> 
<ol> 
 <li><strong>Immediate failover to DR in read-only mode</strong> – using ONTAP snapshots and FlexClone technology for sub-15-minute recovery</li> 
 <li><strong>Conversion of DR system from read-only to read-write mode</strong> – following established geo-cluster design with SnapMirror replication</li> 
</ol> 
<p>This approach helps you continue accessing essential financial data during disaster scenarios, even while the full recovery process is underway, facilitating business continuity without compromising data integrity.</p> 
<h1>Prerequisites</h1> 
<p>To implement this solution, you need the following:</p> 
<ul> 
 <li>An <a href="https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/" rel="noopener noreferrer" target="_blank">AWS account</a></li> 
 <li>Two <a href="https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/getting-started.html" rel="noopener noreferrer" target="_blank">Amazon FSx for NetApp ONTAP file systems</a> deployed in separate AWS Regions</li> 
 <li><a href="https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html" rel="noopener noreferrer" target="_blank">Virtual private cloud (VPC) peering</a> or <a href="https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html" rel="noopener noreferrer" target="_blank">AWS Transit Gateway</a> connectivity between the primary and DR regions</li> 
 <li>A Windows Server Failover Cluster (WSFC) configured across both regions</li> 
 <li>Microsoft SQL Server installed on Amazon Elastic Compute Cloud (Amazon EC2) instances in both regions</li> 
 <li>Familiarity with <a href="https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/managing-resources-ontap-apps.html" rel="noopener noreferrer" target="_blank">NetApp ONTAP CLI</a> for SnapMirror and FlexClone operations</li> 
 <li>Appropriate <a href="https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/security-iam.html" rel="noopener noreferrer" target="_blank">AWS Identity and Access Management (IAM) permissions</a> to manage Amazon FSx for NetApp ONTAP resources</li> 
</ul> 
<h1>Security and encryption</h1> 
<p>Amazon FSx for NetApp ONTAP supports encryption of data at rest and in transit, helping you meet security and compliance requirements. Data at rest is encrypted using AWS Key Management Service (AWS KMS) keys, and data in transit can be encrypted using SMB Kerberos encryption or NFS Kerberos. For SnapMirror replication, data transferred between file systems is encrypted in transit using AES-256-GCM encryption. For more information about security capabilities, see <a href="https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/security.html" rel="noopener noreferrer" target="_blank">Security in Amazon FSx for NetApp ONTAP</a>.</p> 
<h1>Architecture components</h1> 
<p>The solution architecture includes four key layers:</p> 
<ul> 
 <li><strong>Compute layer: </strong>A four-node geo-distributed Windows Server Failover Cluster (WSFC) spanning two AWS Regions</li> 
 <li><strong>Storage layer: </strong>Two Amazon FSx for NetApp ONTAP file systems, one in the primary region (US-East-1) and another in the DR region (US-West-2)</li> 
 <li><strong>Data replication: </strong>SnapMirror replication from US-East-1 to US-West-2 with 15-minute intervals</li> 
 <li><strong>Rapid recovery: </strong>FlexClone volumes created from existing SnapMirror snapshots in the DR region</li> 
</ul> 
<p><img alt="AWS multi-region SQL Server high availability and disaster recovery architecture with WSFC Geo-Cluster spanning US-East-1 and US-West-2, using Amazon FSx for NetApp ONTAP with SnapMirror replication." class="alignnone size-full wp-image-17672" height="581" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/26/archblog-1222-image-1.jpeg" width="1421" /></p> 
<p><em>Figure 1. Cross-region disaster recovery architecture using Amazon FSx for NetApp ONTAP with SnapMirror replication and FlexClone-based rapid recovery.</em></p> 
<h1>Technical implementation</h1> 
<h2>Cross-Region data replication</h2> 
<p>The Capital IQ team established SnapMirror replication between their production Amazon FSx for NetApp ONTAP file system in US-East-1 (N. Virginia) and their DR file system in US-West-2 (Oregon), making sure the DR region maintains a consistent copy of production data.The SnapMirror replication is configured with a 15-minute schedule between primary and DR Amazon FSx for NetApp ONTAP file systems. This frequent replication makes sure the DR region stays closely synchronized with production, minimizing potential data loss during failover events. The actual Recovery Point Objective (RPO) varies based on production environment activity. During lower activity periods, the RPO can be just a few minutes, while higher transaction volumes may result in a slightly increased RPO within the 15-minute window.</p> 
<h2>Using FlexClone for rapid recovery</h2> 
<p>A key element of S&amp;P Global’s disaster recovery strategy is the use of NetApp FlexClone technology in conjunction with SnapMirror snapshots. A scheduled automation process refreshes the DR environment daily by identifying the most recent SnapMirror snapshot available in the DR region and creating a FlexClone volume from that point-in-time image. With this read-only DR instance pre-provisioned in advance, initiating failover is primarily an application cutover step — redirecting traffic to the ready instance in the DR region.This approach is highly efficient and non-intrusive. By using snapshots for FlexClone creation, the solution maintains the integrity of ongoing SnapMirror replication between production and DR environments. The FlexClone volume operates independently of the active SnapMirror relationship, meaning it does not interrupt or interfere with data replication processes. This separation allows continuous data protection and synchronization, even while the DR environment serves live read-only traffic.</p> 
<h2>FlexClone creation process</h2> 
<ol> 
 <li><strong>Identify </strong>the latest SnapMirror snapshot in the DR region</li> 
 <li><strong>Create </strong>a FlexClone volume from this snapshot using the NetApp ONTAP CLI:</li> 
</ol> 
<p><strong><em>Note: </em></strong><em>The following example demonstrates a typical FlexClone creation command. Actual parameters should be adjusted for your environment.</em></p> 
<p><code>volume clone create \-vserver dr-svm \-flexclone ciq_data_readonly \-parent-volume ciq_data_mirror \-parent-snapshot snapmirror.latest \-type RW</code></p> 
<ol start="3"> 
 <li><strong>Present </strong>the FlexClone volume and its LUNs to the read-only SQL Server instance in the DR region</li> 
 <li><strong>Direct </strong>application traffic to the read-only instance</li> 
</ol> 
<h2>Key advantages</h2> 
<ul> 
 <li><strong>Sub-15-minute recovery: </strong>FlexClone creation completes in under 2 minutes</li> 
 <li><strong>Storage efficiency: </strong>FlexClones consume minimal additional storage as they share data blocks with the parent volume</li> 
 <li><strong>Data consistency: </strong>The clone represents a point-in-time snapshot of production data</li> 
 <li><strong>Operational isolation: </strong>The clone operates independently from ongoing SnapMirror replication</li> 
</ul> 
<h2>Full read-write recovery process</h2> 
<p>While read-only recovery provides immediate business continuity, transitioning to full read-write capability in the DR region follows these orchestrated steps:</p> 
<ol> 
 <li><strong>Stop </strong>SQL Server and freeze writes in the primary region</li> 
 <li><strong>Apply </strong>the final SnapMirror update to the DR region</li> 
 <li><strong>Break </strong>the SnapMirror relationship to make the DR volume read-write</li> 
 <li><strong>Reverse </strong>the replication direction (DR to primary)</li> 
 <li><strong>Fail over </strong>SQL Server resources to the DR nodes</li> 
 <li><strong>Resume </strong>normal operations in the DR region</li> 
</ol> 
<h1>Business benefits</h1> 
<p>This approach to disaster recovery has delivered significant benefits:</p> 
<ul> 
 <li><strong>Enhanced business resilience: </strong>The solution maintained established RTO and RPO standards while transitioning to cloud infrastructure, successfully extending proven on-premises DR capabilities to the cloud.</li> 
 <li><strong>Continuous access during outages: </strong>Clients experience minimal disruption during regional disaster scenarios. The pre-provisioned read-only instance means failover is a redirect, not a rebuild.</li> 
 <li><strong>Resilience beyond disasters: </strong>Read-only instances also support application availability during production code releases extending the solution’s value beyond its original DR scope.</li> 
 <li><strong>Lower infrastructure costs: </strong>FlexClone technology’s efficient data block sharing minimizes storage overhead in the DR region, reducing costs while maintaining comprehensive data protection.</li> 
 <li><strong>Cloud-native without compromise: </strong>By moving from on-premises infrastructure to Amazon FSx for NetApp ONTAP, S&amp;P Global gained cloud agility and elasticity while preserving the mature data management capabilities that financial services operations require.</li> 
 <li><strong>Regulatory compliance: </strong>The solution meets stringent financial services requirements for business continuity and data availability.</li> 
</ul> 
<h1>Conclusion</h1> 
<p>S&amp;P Global Market Intelligence’s implementation demonstrates that organizations can achieve both rapid disaster recovery and cost efficiency using Amazon FSx for NetApp ONTAP. By combining SnapMirror replication with FlexClone technology, they built a DR strategy that is faster, leaner, and more flexible than its on-premises predecessor while maintaining the reliability standards that 160 years of client trust demand.For financial services organizations navigating similar migrations, this approach offers a proven blueprint: replicate what works, modernize how it runs, and maintain the same level of data protection clients expect.</p> 
<p><em>“Adopting Amazon FSx for NetApp ONTAP has helped us extend our proven disaster recovery strategy into the cloud. The ability to use native ONTAP snapshots and FlexClone technology on AWS enables us to deliver the same level of data protection and business continuity that our clients expect, without compromise. This solution bridges the gap between on-premises reliability and cloud agility.”</em></p> 
<p><strong>— Nishanth Charlakola, Director, S&amp;P Global Market Intelligence</strong></p> 
<p>If you need guidance on implementing Amazon FSx for NetApp ONTAP or architecting disaster recovery solutions for financial services, contact your AWS account team.</p> 
<hr /> 
<h2>About the authors<strong>&nbsp;</strong></h2> 
<p><strong>&nbsp;</strong></p>