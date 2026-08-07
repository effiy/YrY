---
title: "The VibeSec Reckoning: Securing AI-Generated Applications"
tags: [vibe-coding, security, harness-engineering, ai-safety, secure-by-default]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/vibesec-reckoning.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Implement practical security controls for AI-generated applications, including security context files, permission scrutiny, and secure-by-default harnesses."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/bliki-vibe-coding-257924.md
  - ai-engineer/methodology/fragments-july-21-db3e9f.md
---

# The VibeSec Reckoning: Securing AI-Generated Applications

> **As a** developer or security engineer, **I want to** implement practical security controls for AI-generated applications, **so that** vibe-coded and agent-generated software does not become a security liability.

## Summary

- Thoughtworks' global marketing team built applications using AI agents and discovered that AI frequently recommends insecure configurations, creating systemic security problems.
- The team developed four key practices: write a security context file to guide the AI, be cautious with AI permission requests, create a daily security intelligence feed, and provide builders with a secure-by-default harness and templates.
- The approach is practical and battle-tested, not theoretical -- it emerged from real application development experience.
- The core insight: AI agents do not have security judgment; they need explicit security context and guardrails.

## Core viewpoints

### 1. AI agents have no security intuition -- they need explicit security context
Unlike human developers who develop security intuition over time, AI agents have no inherent sense of what is secure. They will happily recommend insecure configurations, exposed credentials, and vulnerable patterns. The solution is not to stop using AI but to provide explicit security context that guides every decision.

### 2. A security context file is the minimum viable security harness
The security context file tells the AI agent what is secure and what is not in the specific context of your organization and application. It is a living document that evolves as new threats emerge and new patterns are discovered. Without it, the AI defaults to generic (and often insecure) recommendations.

### 3. AI permission requests must be scrutinized, not auto-approved
AI agents frequently request permissions they do not need, and auto-approving these requests is a common failure mode. The practice: every permission request should be reviewed against the principle of least privilege. If the AI cannot justify why it needs a permission, the request should be denied.

### 4. Secure-by-default harnesses and templates prevent entire classes of vulnerabilities
The most effective security control is preventing insecure configurations from being generated in the first place. A secure-by-default harness that bakes security into the generation process and templates that encode secure patterns eliminate entire categories of vulnerabilities before they are created.

## Key info

- The four practices emerged from real-world experience building applications for Thoughtworks' global marketing team.
- Security context file: a document that guides the AI on what is secure in the specific organizational context.
- Permission scrutiny: review every AI permission request; deny if not justified by least privilege.
- Daily security intelligence feed: keep the AI's security knowledge current with the latest threats and best practices.
- Secure-by-default harness: templates and patterns that make security the default, not an afterthought.

## Action recommendations

1. Create a security context file for every AI-assisted project. This file should define what is secure, what is not, and what patterns to avoid.
2. Never auto-approve AI permission requests. Review each request against the principle of least privilege.
3. Implement a daily security intelligence feed to keep AI agents updated on current threats and best practices.
4. Build secure-by-default templates and harnesses. The best security control is the one that prevents vulnerabilities from being generated.
5. Treat AI security as an ongoing practice, not a one-time setup. The security context file and intelligence feed should evolve with the threat landscape.

## Anti-patterns

- **Using AI coding agents without a security context file.** Without explicit security guidance, AI agents default to generic patterns that ignore project-specific security requirements, compliance constraints, and threat models. The security context file serves as the agent's security conscience, defining what is acceptable and what is forbidden before any code is generated.

- **Auto-approving AI permission requests without human review.** Every permission escalation — file system access, network calls, shell execution — represents a potential attack surface. Auto-approval is the fastest path to a security incident because the AI may request permissions for operations that are unnecessary for the task but dangerous if granted. Each request must be reviewed against the principle of least privilege.

- **Assuming the AI will "figure out" security on its own through general training.** AI agents have no security intuition — they cannot distinguish between a safe and unsafe pattern without explicit guidance. The agent's training data includes both secure and insecure code examples, and without a security context file, it has no way to know which patterns to prefer. Security must be explicitly specified, not implicitly trusted.

- **Treating security as a post-generation review step rather than a pre-generation constraint.** Reviewing AI-generated code for security vulnerabilities is necessary but insufficient — the most effective controls prevent insecure code from being generated in the first place. Secure-by-default templates, security linters in the generation pipeline, and pre-commit hooks that block known vulnerable patterns are more reliable than human review alone.

- **Treating AI security configuration as a one-time setup rather than an evolving practice.** The threat landscape changes daily — new CVEs are published, attack techniques evolve, and dependencies accumulate vulnerabilities. The security context file, intelligence feed, and secure-by-default templates must be updated continuously to reflect the current threat environment. A security configuration from last quarter is a false sense of security.

## Related

- ai-engineer/methodology/bliki-vibe-coding-257924.md
- ai-engineer/methodology/fragments-july-21-db3e9f.md
- ai-engineer/methodology/fragments-august-4-727eab.md