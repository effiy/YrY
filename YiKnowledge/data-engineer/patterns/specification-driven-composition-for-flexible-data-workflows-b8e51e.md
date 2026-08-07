---
title: Specification-driven composition for flexible data workflows
tags:
- AWS Architecture
category: data-engineer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/specification-driven-composition-for-flexible-data-workflows/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Thu, 09 Jul 2026 22:27:31 +0000
author: Rostislav Markov
---

<p>Specification-driven composition addresses a common scalability bottleneck in data pipelines. Data pipelines often start as simple scripts, but as they grow, you duplicate transformation logic and small changes cascade across multiple workflows. Copying and modifying data transformation logic across scripts leads to workflows that become difficult to manage at scale. Tracking what each pipeline does becomes harder because workflow intent is embedded in code. This lack of visibility complicates governance, especially in regulated environments such as healthcare, finance, and life sciences.</p> 
<p>Many implementations combine orchestration, transformation logic, and validation rules in the same scripts. Supporting new datasets requires modifying and redeploying code, while validation often happens only during processing. As a result, issues surface late in the lifecycle which increases the operational risk. Specification-driven composition separates workflow intent from implementation so you can build flexible data workflows.</p> 
<p>In this post, I show how to apply specification-driven composition to data transformation workflows. I explain the challenges with script-based pipelines, introduce the pattern and its core components, and walk through a serverless implementation using <a href="https://docs.aws.amazon.com/lambda/" rel="noopener" target="_blank">AWS Lambda</a>, <a href="https://docs.aws.amazon.com/step-functions/" rel="noopener" target="_blank">AWS Step Functions</a>, <a href="https://docs.aws.amazon.com/s3/" rel="noopener" target="_blank">Amazon Simple Storage Service (Amazon S3)</a>, and <a href="https://docs.aws.amazon.com/opensearch-service/" rel="noopener" target="_blank">Amazon OpenSearch Service</a>.</p> 
<h2 id="solution-overview">Solution overview</h2> 
<p>You can separate workflow intent from processing logic with specification-driven composition. This approach reduces duplication, shortens the time required to onboard new datasets, and improves consistency across workflows. Instead of embedding logic in scripts, the system describes workflow intent in a structured specification, validates the specification before processing, and dynamically assembles a processing pipeline.</p> 
<p>This approach moves pipeline configuration outside application code and composes pipelines from reusable processing components. To separate concerns, it organizes a workflow into three layers, as shown in Figure 1. The intent layer defines workflow behavior using specifications. The composition layer validates specifications and assembles pipelines. The processing layer runs the pipeline of transformation steps.</p> 
<p><img alt="A diagram showing the three layers of specification-driven composition. The intent layer holds the specification, the composition layer contains the composer and capability registry, and the processing layer runs the capability pipeline." src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/09/ARCHBLOG-1432-1.png" width="800" /></p> 
<p>Figure 1. Specification-Driven Composition design pattern.</p> 
<h3 id="benefits">Benefits</h3> 
<p>Specification-driven composition provides several practical benefits when you manage multiple pipelines. First, it improves governance because specifications provide a clear, traceable description of workflow behavior that you can review and validate before invocation. In regulated industries, this traceability shortens audit preparation time and reduces the review burden for new dataset submissions.</p> 
<p>Second, the pattern supports reusable transformations. You implement transformation logic once and reuse it across multiple workflows. This reduces duplication and improves consistency. In practice, teams adopting this pattern report being able to onboard new datasets in days rather than weeks because most required capabilities already exist in the registry.</p> 
<p>Third, specification-driven composition enables flexible pipeline design. You define new specifications to create pipelines supporting new datasets and use cases without modifying application code and registering new system release.</p> 
<p>Fourth, the pattern separates business intent from execution artifacts. The specification expresses what the workflow should do in domain terms, while the generated state machine remains a system artifact. This separation matters in regulated environments (for example, GxP) where business users author intent but are not allowed to author or modify execution code directly.</p> 
<p>Finally, the declarative representation of workflows lets AI tools assist with capability discovery, specification authoring, and pipeline analysis, while runtime behavior stays predictable as it relies on validated capabilities.</p> 
<h3 id="core-components">Core components</h3> 
<p>You work with four key components to define, validate, and run workflows.</p> 
<ol type="1"> 
 <li>Specification</li> 
</ol> 
<p>A specification is a structured document, typically JSON or YAML, that describes datasets, mappings, and transformations. It defines what the workflow should do without including processing logic. Because specifications are explicit and versioned, they provide a clear record of workflow intent.</p> 
<ol start="2" type="1"> 
 <li>Composer</li> 
</ol> 
<p>The composer converts specifications into runnable steps, so workflows run consistently without embedding transformation logic in application code. It checks that referenced capabilities exist, retrieves metadata, and builds a workflow that can run on the processing layer. The composer does not perform transformations. It only assembles the workflow. In practice, the composer compiles business intent expressed in the specification into a code artifact such as an Amazon States Language (ASL) definition. This abstraction lets domain users author specifications without producing runnable code, which is important in environments with strict separation of duties.</p> 
<ol start="3" type="1"> 
 <li>Capability registry</li> 
</ol> 
<p>The registry stores metadata about reusable transformation functions. This includes identifiers, input/output formats, invocation details, and permission boundaries. The composer uses the registry to validate specifications and locate capabilities. Treat this registry as a governed artifact rather than a manually edited lookup table. Capability definitions live in version control, and your CI/CD pipeline validates metadata and runs tests before you publish new versions. Specification authors include explicit capability version references in the specifications to support reproducible workflow runs. In regulated systems, you must validate new capabilities and obtain approval through a separate workflow before you register them.</p> 
<ol start="4" type="1"> 
 <li>Capability pipeline</li> 
</ol> 
<p>Once assembled, the pipeline runs a sequence of transformation steps. Each step performs a specific operation such as formatting, validation, or enrichment. Because these steps are reusable, you can apply them across many workflows.</p> 
<h2 id="technical-implementation">Technical implementation</h2> 
<p>Let’s walk through a technical implementation of this pattern using serverless AWS services. In this example, workflow specifications are uploaded to an S3 bucket. An AWS Lambda composer retrieves and validates the specification, looking up capability metadata in Amazon OpenSearch Service. The composer then assembles the workflow in AWS Step Functions, which orchestrates the workflow and invokes AWS Lambda capability processors. Each processor emits traces to Amazon CloudWatch Logs.</p> 
<p>Figure 2 shows the architecture.</p> 
<p><img alt="Users upload specifications to Amazon S3, which invokes the Lambda composer. The composer queries the OpenSearch registry and assembles a Step Functions workflow of Lambda capability processors, which emit traces to CloudWatch." src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/07/09/ARCHBLOG-1432-2.png" width="800" /></p> 
<p>Figure 2. AWS implementation of Specification-Driven Composition</p> 
<h3 id="interpreting-the-workflow-specification">Interpreting the workflow specification</h3> 
<p>The workflow specification defines datasets and transformation logic using a structured format (in this example, JSON). A specification is a declarative document that describes what the pipeline should produce rather than how to produce it. Your composer reads the specification, validates it against a schema, and uses it to construct the pipeline.</p> 
<p>The following example maps source fields to target fields using reusable capabilities (Figure 3). It takes data from a source dataset (‘raw_orders’), maps specific fields (‘order_date’, ‘amount’) and applies reusable transformation capabilities such as ‘format_date’ and ‘normalize_currency’. Each mapping explicitly links a source field to a target field and references a capability that performs the transformation. Source dataset(s) are listed under the ‘source’ section of the JSON document, target datasets under the ‘target’ section, and mappings ‘mappings’. You can define your own specification structure and build custom validation logic in your composer to make sure specifications are valid.</p> 
<div class="hide-language"> 
 <pre><code class="language-json">{
  "source": {
    "dataset": "raw_orders"
  },
  "target": {
    "dataset": "orders_clean"
  },
  "mappings": [
    {
      "source_field": "order_date",
      "target_field": "order_date",
      "transformation": {
        "capability": "format_date"
      }
    },
    {
      "source_field": "amount",
      "target_field": "amount_normalized",
      "transformation": {
        "capability": "normalize_currency"
      }
    }
  ]
}</code></pre> 
</div> 
<p>You can model preprocessing steps such as column standardization, numeric casting, or unit conversion as first-class capabilities and reference them earlier in the specification (for example, in a dedicated ‘preprocessing’ section) before downstream mappings run. This way, preparation logic uses the same metadata, versioning, validation, and observability model as the rest of the workflow, which simplifies lineage and review.</p> 
<p>In this example, an <a href="https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html" rel="noopener" target="_blank">S3 event notification invokes the composer Lambda function</a> when you upload a specification. In practice, the same composer can be invoked through several mechanisms depending on the use case: S3 events for new specifications, an Amazon EventBridge schedule for recurring runs, an API or UI action for on-demand invocation, a direct Step Functions StartExecution call, or an upstream pipeline. This flexibility lets you re-run an approved specification against refreshed data without re-authoring or re-approving the workflow.</p> 
<p>The composer parses the specification and validates the referenced capabilities by querying Amazon OpenSearch Service to <a href="https://docs.aws.amazon.com/opensearch-service/latest/developerguide/indexing.html" rel="noopener" target="_blank">retrieve capability metadata</a> such as Amazon Resource Names (ARNs). OpenSearch Service is used here because the composer does more than direct-key lookups. It supports capability discovery through full-text and semantic search over capability metadata such as capability descriptions, input/output schemas, and tags. This lets data authors and AI tools find reusable capabilities by intent rather than by exact identifier. After validation, the composer <a href="https://docs.aws.amazon.com/step-functions/latest/dg/connect-lambda.html" rel="noopener" target="_blank">assembles and starts an AWS Step Functions state machine</a> which invokes each capability in sequence. Each capability runs independently, making the pipeline modular and reusable.</p> 
<h3 id="securing-sensitive-data-flows">Securing sensitive data flows</h3> 
<p>This pattern suits regulated workloads, so handle security as part of the design. Use SSE-KMS with a customer managed key on the specification and data S3 buckets and enable encryption at rest on the Amazon OpenSearch Service domain. Enforce HTTPS (TLS) access with an S3 bucket policy (<code>aws:SecureTransport</code>) and enable node-to-node encryption on Amazon OpenSearch Service. AWS Step Functions and Lambda calls use TLS by default. Each capability processor receives only the fields its mapping references, and you can apply IAM policy at the source bucket to restrict access. Processors emit traces to Amazon CloudWatch Logs.</p> 
<p>For data classification, you can tag sensitive fields in the specification (example: <code>"sensitivity": "PHI"</code>) and declare the sensitivity of each capability in the registry: a direct-move capability preserves the source classification, a date-of-birth-to-age capability clears it, and an enrichment that introduces sensitive data sets it. The composer combines the source tag with the capability’s behavior to derive the target field’s sensitivity, validating that the combination resolves clearly before assembling the pipeline. It then generates the masking artifact for the output (for example, AWS Lake Formation column grants) so consumers get correct masking without a separate masking specification or manual effort.</p> 
<h3 id="recognizing-the-pattern">Recognizing the pattern</h3> 
<p>This approach works well when you describe workflows using structured specifications, reuse transformation logic across pipelines, require validation before invocation, and require workflows to be deterministic and auditable. You are likely to recognize the pattern in regulated data pipelines for the submission of tabular datasets to oversight agencies.</p> 
<p>Consider clinical trial reporting as a concrete example. Data analysts collect raw data from clinical sites and must transform it into a standard submission format such as the Study Data Tabulation Model (SDTM) before submission to agencies such as the US Food and Drug Administration. With specification-driven composition, data analysts define specifications that map collected data about adverse events, demographics, and vital signs to the standard target variables, and the validated output feeds downstream systems such as patient safety and medical monitoring.</p> 
<p>That said, this pattern might add unnecessary complexity for simple, one-time data transformations or pipelines with fewer than three to five workflows. Evaluate this pattern’s impact by tracking the reduction in duplicated transformation logic across pipelines, the time required to onboard new datasets, and the number of workflows you can create without modifying application code.</p> 
<h2 id="conclusion">Conclusion</h2> 
<p>Script-based data pipelines accumulate hidden costs as they grow, including duplicated logic across files and late-breaking validation failures. Specification-driven composition separates workflow intent from processing so you can manage data workflows more consistently at scale. The result is faster dataset onboarding, stronger governance, and pipelines that are transparent enough to trust in regulated environments.</p> 
<p>This pattern is especially valuable for regulated reporting pipelines, multi-source data integration, and reusable ETL frameworks where traceability and flexibility matter. By investing a small set of reusable capabilities and a disciplined specification format, you can reduce the engineering effort for new pipelines by treating them more as configuration tasks which may be delegated to system users.</p> 
<h3 id="next-steps">Next steps</h3> 
<p>To get started, take one existing pipeline and describe it as a specification. Implement a small set of reusable transformation functions and use them to assemble your first composed workflow. The <a href="https://docs.aws.amazon.com/lambda/latest/dg/concepts-event-driven-architectures.html" rel="noopener" target="_blank">AWS Lambda event-driven architectures guide</a> is a good starting point for wiring S3 uploads to your composer, and the <a href="https://docs.aws.amazon.com/step-functions/latest/dg/connect-lambda.html" rel="noopener" target="_blank">AWS Step Functions and Lambda integration guide</a> will help you orchestrate your capability processors. To monitor the pipeline, see <a href="https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html" rel="noopener" target="_blank">publishing custom CloudWatch metrics</a>.</p> 
<p>For a practical first use case, try applying the pattern to a reporting pipeline you maintain today that has three or more variants such as monthly finance reports generated from different source systems. Replace the duplicated scripts with a single composer and a shared capability library, and measure the onboarding time for the next variant. As you expand your capability library, you can apply the same pattern across additional workflows and standardize how transformations are defined and run.</p> 
<hr /> 
<h2>About the author</h2>