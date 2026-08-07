---
title: "Building a Serverless AI Assistant at Pelago: Concept to Care in Two Weeks"
tags: [serverless, healthcare, event-driven, sns, lambda, bedrock, async-ai]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/building-a-serverless-ai-assistant-at-pelago-concept-to-care-in-two-weeks/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Learn how to build an event-driven AI assistant for healthcare that pre-generates suggestions asynchronously, keeping retrieval under 100ms while maintaining HIPAA compliance."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/building-reliable-agentic-ai-systems-658fa0.md
  - ai-engineer/methodology/secure-multi-tenant-rag-with-amazon-bedrock-and-verified-per-bee88b.md
---

# Building a Serverless AI Assistant at Pelago: Concept to Care in Two Weeks

> **As an** AI engineer in a regulated industry, **I want to** build an event-driven AI assistant that pre-generates contextual suggestions asynchronously, **so that** care teams get instant AI-powered suggestions without waiting for LLM processing.

## Summary

- Pelago, a digital health company for substance use disorder support, built an AI assistant for their care team in just two weeks using AWS serverless services.
- The key architectural pattern: asynchronous pre-generation of AI suggestions. When a member sends a message, SNS fans out to a Chat Assistant Lambda that generates suggestions in the background. When a coach opens the conversation, pre-generated suggestions are retrieved in under 100ms.
- The architecture uses SNS fanout to decouple message delivery from AI processing, enabling the AI feature to be added with zero changes to existing message-handling code.
- Results: response preparation time dropped 40%, 79.6% of AI suggestions rated helpful, and the system handled an 8x message volume spike without configuration changes.

## Core viewpoints

### 1. Async pre-generation is the pattern for latency-sensitive AI in user-facing applications
The core insight: LLM inference takes seconds, but users expect sub-100ms responses. The solution is to separate generation from retrieval. AI suggestions are generated in the background when a message arrives, and retrieved instantly when the user opens the conversation. This pattern is applicable to any user-facing AI feature where inference latency exceeds user expectations.

### 2. SNS fanout is the zero-change integration pattern
The Chat Assistant feature was added by creating a new Lambda function and subscribing it to the existing SNS topic. No changes to message publishing code, no changes to existing consumers. This is the power of event-driven architecture: new capabilities can be added without touching existing code paths.

### 3. Polyglot runtimes are a feature, not a compromise
The team used Python for the Bedrock-invoking Lambda (better string manipulation, native Boto3 support) and TypeScript for the retrieval function (consistent with the rest of the backend). This pragmatic choice let the team use the best language for each job without forcing a single runtime.

### 4. Healthcare AI requires human-in-the-loop by design
The system generates suggestions for the care team, not automated responses. Every suggestion must be read, evaluated, and adapted by a human coach. This is not a limitation -- it is the correct architecture for regulated domains where AI output has clinical consequences.

### 5. The two-week timeline was enabled by serverless, not by cutting corners
The speed of delivery (concept to care in two weeks) was not achieved by skipping testing or security review. It was enabled by the serverless architecture: no infrastructure to provision, built-in HIPAA-eligible services, and SNS fanout that allowed the AI feature to be added with zero changes to existing code. The timeline is a testament to the power of serverless for rapid, safe AI feature delivery, not a recommendation to rush regulated software into production.

## Key info

- Architecture: AppSync -> Lambda -> DynamoDB -> SNS -> 4 Lambda subscribers (Metadata, Analytics, Push, Chat Assistant).
- Chat Assistant Lambda: retrieves full conversation history from DynamoDB, invokes Bedrock (Claude), stores suggestion in MySQL. Completes in under 4 seconds.
- Suggestion retrieval: API Gateway -> Lambda -> MySQL, under 100ms.
- PHI never traverses the public internet: VPC endpoints for Bedrock, TLS 1.2+, encryption at rest.
- Idempotency: Chat Assistant Lambda checks MySQL for existing suggestion before generating new one.
- SNS can deliver messages more than once -- idempotency check prevents duplicate Bedrock invocations.
- Development timeline: 2 days architecture/model selection, 3 days core Lambdas, 3 days integration testing/prompt refinement, 2 days deployment/monitoring.

## Action recommendations

1. Use the async pre-generation pattern for any user-facing AI feature where inference latency exceeds user expectations. Generate in the background, retrieve instantly.
2. Use SNS fanout to add AI features to existing event-driven systems. The zero-change integration pattern dramatically reduces risk.
3. Choose the right runtime for each Lambda function. Polyglot is acceptable when the choice is driven by library support and developer productivity.
4. Always implement idempotency checks for SNS-triggered functions. SNS can deliver messages more than once.
5. In regulated domains, design AI as a suggestion system with mandatory human review, not as an autonomous agent.

## Anti-patterns

- **Generating AI suggestions synchronously in the request path.** This blocks the user experience for seconds while the LLM processes.

- **Adding AI features by modifying existing message handling code.** The SNS fanout pattern allows zero-change integration.

- **Using a single runtime for all Lambda functions when different lang....** Using a single runtime for all Lambda functions when different languages have clear advantages for different tasks.

- **Skipping idempotency checks for SNS-triggered functions.** Duplicate invocations waste compute and can produce conflicting outputs.

- **Using the async pre-generation pattern without a staleness strategy.** Pre-generated suggestions can become stale if the conversation context changes between generation and retrieval. The system must handle the case where the user has already addressed the topic the suggestion covers, or the suggestion is no longer relevant given new messages that arrived after generation.

## Related

- ai-engineer/methodology/building-reliable-agentic-ai-systems-658fa0.md
- ai-engineer/methodology/secure-multi-tenant-rag-with-amazon-bedrock-and-verified-per-bee88b.md