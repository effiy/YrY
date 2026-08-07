---
title: "Secure Multi-Tenant RAG with Amazon Bedrock and Verified Permissions"
tags: [rag, multi-tenant, aws, cedar, authorization, bedrock, knowledge-base]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/secure-multi-tenant-rag-with-amazon-bedrock-and-verified-permissions/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Implement defense-in-depth document-level access control in RAG applications using a single Knowledge Base with Cedar policy-driven metadata filtering."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/building-reliable-agentic-ai-systems-658fa0.md
  - ai-engineer/methodology/preventing-data-exfiltration-in-machine-learning-environment-936f06.md
---

# Secure Multi-Tenant RAG with Amazon Bedrock and Verified Permissions

> **As an** AI platform architect, **I want to** implement fine-grained document-level access control in a multi-department RAG application, **so that** each department can only access its own documents without duplicating infrastructure.

## Summary

- A defense-in-depth authorization pattern for granular, intra-tenant document access control in RAG applications using a single Amazon Bedrock Knowledge Bases instance.
- Two independent authorization layers: Layer 1 (Lambda Authorizer) controls API access, Layer 2 (middleware Lambda) controls document-level access through metadata filtering.
- Cedar policies in Amazon Verified Permissions are evaluated at runtime to dynamically construct metadata filters, enabling policy changes without code redeployment.
- The pattern is designed for intra-tenant access control (departments within one organization), not cross-tenant isolation (separate customers). For hard tenant boundaries, use a dedicated Knowledge Base per tenant.

## Core viewpoints

### 1. Filter-level isolation is not infrastructure-level isolation -- know the difference
This pattern provides logical isolation through metadata filters, not physical isolation through IAM. If the middleware that constructs the filter fails open, documents from other groups would be exposed. This is appropriate for intra-tenant access control but not for cross-tenant compliance boundaries. The key design decision is recognizing which isolation level your use case requires.

### 2. Externalized authorization decouples policy from code
By using Cedar policies in Verified Permissions, authorization rules are externalized from application code. This means: policy changes take effect on the next API call without redeployment, policies are auditable and version-controlled, and the same policy store can drive both API-level and document-level authorization decisions.

### 3. Two independent layers provide defense in depth
Layer 1 (API Gateway Lambda Authorizer) answers "can you invoke the API?" Layer 2 (middleware Lambda) answers "which documents can your department access?" Neither layer depends on the other for correctness. If Layer 1 is bypassed, Layer 2 still enforces document-level isolation. Both fail closed (deny by default).

### 4. The ingestion pipeline is the foundation of the authorization system
Documents must be tagged with department metadata before they are indexed. The ingestion pipeline uses an event-driven two-phase approach: Phase 1 (S3 upload triggers metadata tagging via SQS), Phase 2 (scheduled Lambda triggers the Knowledge Base ingestion job). The ingestion safeguard verifies every document has a metadata sidecar before indexing, preventing untagged documents from bypassing filters.

### 5. The metadata filter is applied before vector search, not after -- and that matters
The architecture applies the metadata filter before the vector similarity search runs, meaning unauthorized documents are never in the retrieval set. This is a critical design choice: if the filter were applied after retrieval, an attacker could potentially infer the content of unauthorized documents from the similarity scores or the fact that certain documents were retrieved but then filtered out. Pre-filtering eliminates this side channel entirely.

## Key info

- Cedar schema: three entity types (Principal=UserGroup, Action=query/invokeModel, Resource=KnowledgeBase/Model).
- Metadata filter construction: `{"equals": {"key": "department", "value": "dept-a"}}` for single department, `{"orAll": [...]}` for multi-department access.
- The metadata filter is applied before vector similarity search runs, so unauthorized documents are never in the retrieval set.
- Adding a department requires only a new Cedar policy and tagged documents -- no infrastructure changes.
- Ingestion safeguard: documents without metadata sidecars are excluded from indexing and logged.
- Policy governance: restrict who can modify Cedar policies in production; validate against test scenarios before promotion.
- Production cache TTL trade-off: 0 TTL = immediate revocation but higher latency; 300s TTL = better latency but up to 5-minute revocation delay.

## Action recommendations

1. Use this pattern for intra-tenant access control within a single organization. For cross-tenant isolation, provision a dedicated Knowledge Base per tenant with IAM boundaries.
2. Implement the two-layer authorization: Lambda Authorizer for API access, middleware Lambda for document-level filtering. Both should fail closed.
3. Use the event-driven two-phase ingestion pipeline: tag documents with metadata on upload, then trigger ingestion on a schedule after verifying all documents have metadata.
4. Restrict S3 write access to the metadata tagging Lambda only. All other principals should have read-only access to prevent metadata tampering.
5. Set the API Gateway authorizer cache TTL to 0 during testing, and to a deliberately short value (30-60s) in production if timely revocation matters.
6. Add Guardrails for Amazon Bedrock as an output safety layer: contextual grounding checks and content filtering.

## Anti-patterns

- **Using metadata filtering as a substitute for hard tenant isolation ....** Using metadata filtering as a substitute for hard tenant isolation in a multi-tenant SaaS product. This is filter-level isolation, not infrastructure-level.

- **Skipping the ingestion safeguard.** Without verifying metadata sidecars, untagged documents can bypass filters.

- **Allowing unrestricted S3 write access to the document bucket.** Anyone with write access could modify metadata sidecars and re-tag documents.

- **Setting the Lambda Authorizer cache TTL too high when timely policy....** Setting the Lambda Authorizer cache TTL too high when timely policy revocation matters. A cached authorization decision can permit access for up to the TTL duration after revocation.

- **Applying metadata filters after vector search instead of before.** Post-retrieval filtering creates a side channel where the existence and similarity of unauthorized documents can be inferred from retrieval behavior. Pre-filtering eliminates this channel by ensuring unauthorized documents are never in the candidate set.

## Related

- ai-engineer/methodology/building-reliable-agentic-ai-systems-658fa0.md
- ai-engineer/methodology/preventing-data-exfiltration-in-machine-learning-environment-936f06.md
- ai-engineer/methodology/architecting-offline-first-generative-ai-applications-for-ed-4e8e94.md