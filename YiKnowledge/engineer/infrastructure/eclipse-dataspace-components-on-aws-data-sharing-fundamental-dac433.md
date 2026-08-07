---
title: 'Eclipse Dataspace Components on AWS: Data sharing fundamentals'
tags: [EDC, IDSA, data-spaces, DSP, DCP, decentralized-identity]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/eclipse-dataspace-components-on-aws-data-sharing-fundamentals/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, architect]
benefit: "Understand the standards and architecture behind cross-organizational data spaces (IDSA, DSP, DCP, EDC) before attempting production deployment on AWS."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - engineer/infrastructure/eclipse-dataspace-components-on-aws-architecture-patterns-in-b54449
  - engineer/infrastructure/eclipse-dataspace-components-on-aws-cost-optimization-strate-7e6656
---

# Eclipse Dataspace Components on AWS: Data sharing fundamentals

> **As a** solution architect, **I want to** understand the ISO-standardized data space architecture (IDSA, DSP, DCP) and how EDC connectors implement it, **so that** I can evaluate whether data spaces are the right pattern for cross-organizational data sharing.

## Summary

- Data spaces enable sovereign, interoperable data sharing between distinct legal entities. The IDSA defines rules; the Dataspace Protocol (DSP) implements them; the Decentralized Claims Protocol (DCP) establishes trust via DIDs and Verifiable Credentials.
- The Eclipse Dataspace Components (EDC) connector is the technical workhorse: a control plane handles contract negotiation, a data plane transfers data between participants.
- DSP is approaching ISO/IEC DIS 20151 standardization. DCP adds decentralized identity on top of DSP.
- EDC is modular by design: SPI defines contracts, Core implements basics, Extensions add cloud-provider integrations (AWS S3, Secrets Manager, DynamoDB).
- The vanilla EDC connector does NOT bundle AWS extensions. You must assemble a custom build using Gradle version catalogs, launcher modules, and project settings.

## Core viewpoints

### 1. Data spaces are not just APIs -- they are governance frameworks

A data space includes a central Dataspace Governance Authority (DSGA) that manages membership, enforces rules, and issues credentials. The connector is only the participant-side software. Understanding this distinction is critical before investing in EDC: you need both the governance layer and the technical infrastructure.

### 2. EDC customization is a Gradle assembly problem, not a configuration problem

The "vanilla" connector ships only core functionality. To integrate with AWS services, you must declare EDC AWS extensions (`org.eclipse.edc.aws`) in a Gradle version catalog, create launcher modules for control plane and data plane, and register subprojects in `settings.gradle.kts`. This is a build-time assembly, not a runtime config toggle.

### 3. Decentralized identity (DCP) is the trust layer that makes data spaces work across organizations

DIDs and Verifiable Credentials replace centralized certificate authorities. The issuer generates a DID, stores a VC in their identity hub, and the verifier resolves the DID document to verify the VC. This is the mechanism that allows participants who have never interacted before to establish trust.

### 4. The Gradle version catalog is the extension API surface, not just a build tool

EDC's modularity is enforced through Gradle dependency management. Each AWS extension (S3, Secrets Manager, DynamoDB) is a separate Maven artifact that you explicitly opt into. This means you only deploy what you need, and the build file itself documents which cloud services your connector depends on. The version catalog IS the architecture decision record -- reading it tells you exactly what the connector can do.

### 5. DSP standardization under ISO signals maturity, not guaranteed interoperability

The Dataspace Protocol approaching ISO/IEC DIS 20151 is a significant milestone, but protocol compliance does not guarantee semantic interoperability. Two DSP-compliant connectors may still disagree on policy semantics, credential formats, or data schemas. Interoperability testing between specific connector implementations is still required for every new participant pairing. Standards reduce the surface area of incompatibility but do not eliminate it.

## Key info

- EDC connector structure: `/spi` (Service Provider Interface), `/core` (default implementations), `/extensions` (cloud provider plugins).
- AWS extensions are published under `org.eclipse.edc.aws` Maven group, separate from core `org.eclipse.edc` artifacts.
- Reference implementation: `github.com/awslabs/dataspace-connector-on-aws`.
- ISO/IEC DIS 20151 covers both DSP and DCP standardization.

## Action recommendations

1. Before writing any code, define the DSGA: who governs membership, what policies apply, and how credentials are issued.
2. Start with the Dataspace Connector on AWS reference implementation rather than building from scratch.
3. Understand the Gradle version catalog and launcher module pattern -- this is the key to customizing EDC for AWS.
4. Plan for both control plane and data plane deployment from day one; they are separate deployable units.

## Anti-patterns

- **Treating EDC as a generic API gateway.** Do not treat EDC as a generic API gateway. It implements a specific sovereign data sharing protocol.

- **Assuming the vanilla connector includes AWS integrations.** Do not assume the vanilla connector includes AWS integrations. You must explicitly include AWS extensions in your build.

- **Skipping the governance layer.** Do not skip the governance layer. Without a DSGA, you have connectors with no trust framework.

- **Assuming DSP compliance eliminates the need for bilateral testing.** Do not assume DSP compliance eliminates the need for bilateral testing. Protocol standards define the wire format, not the business semantics. Always test contract negotiation and data transfer between your connector and each partner's connector before declaring production readiness.

- **Treating the DSGA as a purely technical role.** Do not treat the DSGA as a purely technical role. The Dataspace Governance Authority defines membership criteria, credential issuance policies, and dispute resolution processes. These are business and legal decisions, not infrastructure decisions. Assigning DSGA responsibilities to the engineering team without legal and business representation creates a governance gap.

## Related

- engineer/infrastructure/eclipse-dataspace-components-on-aws-architecture-patterns-in-b54449
- engineer/infrastructure/eclipse-dataspace-components-on-aws-cost-optimization-strate-7e6656