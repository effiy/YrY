---
title: Reducing SMS OTP fraud with Vonage network-powered solutions and Amazon Cognito
tags: [authentication, fraud-prevention, Cognito, CUSTOM_AUTH, SIM-swap, Silent-Authentication, mobile-identity, Vonage]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/reducing-sms-otp-fraud-with-vonage-network-powered-solutions-and-amazon-cognito/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, security-engineer]
benefit: "Replace SMS OTP with network-level Silent Authentication that achieves 2-8.5% conversion improvement, 50-75% latency reduction, and eliminates SIM-swap/SS7/social-engineering exploit vectors."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../quality-security/handle-secrets-and-config.md
---

# Reducing SMS OTP fraud with Vonage network-powered solutions and Amazon Cognito

> **As a** security architect for a mobile-first application, **I want to** replace SMS OTP with network-level identity verification, **so that** authentication is both more secure (eliminating SIM-swap, SS7 interception, and social engineering) and more seamless (zero-tap for legitimate users).

## Summary

- SMS OTP achieves only ~80% conversion on authentication flows. 1 in 5 legitimate users is lost at verification. Fraud costs are projected to reach $23 trillion by 2027.
- Vonage's network-powered solutions use real-time mobile operator data (not cached databases) to verify identity: Identity Insights for pre-verification risk assessment, Verify with Silent Authentication for zero-tap verification, and Fraud Defender for toll fraud protection.
- Silent Authentication: the cellular data session itself is the proof of possession. The operator confirms the SIM matches the phone number. No code to type, copy, or intercept. If unavailable, falls back to SMS/RCS/Voice/WhatsApp/Email.
- Integration with Cognito uses the CUSTOM_AUTH flow with three Lambda triggers: Define Auth Challenge, Create Auth Challenge (calls Identity Insights + Verify), Verify Auth Challenge (validates the code).
- Production results (Lydia Solutions): up to 50% latency reduction, 2-8.5% conversion improvement vs. SMS-only across deployments.

## Core viewpoints

### 1. Real-time operator data is fundamentally different from static databases

Most identity verification signals come from aggregated, cached, or behavioral data. SIM-swap databases refreshed weekly miss events that happen in minutes. Vonage queries the operator that performed the swap directly. The window for fraud is closed entirely.

### 2. Silent Authentication eliminates the "friction tax"

Every additional step in authentication costs users. SMS OTP's ~80% completion rate means 20% of legitimate users are lost. Silent Authentication completes in under 5 seconds with zero user interaction. The cellular session is the credential -- nothing to type, copy, or phish.

### 3. Risk-adaptive workflows are the strategic value

Not every authentication needs the full signal stack. Low-risk actions (viewing account details) generate no friction. High-risk actions (password recovery, high-value transactions) trigger the full assurance stack. The calibration is policy-driven and configurable per journey.

### 4. Fraud Defender's cost absorption is a business case, not a technical feature

Vonage reports that Fraud Defender typically absorbs its own cost in toll fraud prevention within the first billing cycle. This changes the adoption conversation from "should we invest in fraud prevention" to "can we afford not to." When the security control pays for itself, the decision is not about risk tolerance -- it is about financial rationality.

### 5. CUSTOM_AUTH flow is the integration pattern that enables progressive adoption

The CUSTOM_AUTH flow in Cognito allows adding Silent Authentication without disrupting existing authentication paths. The three Lambda triggers (Define, Create, Verify) are the integration surface. Teams can start with high-risk journeys (password recovery, high-value transactions) and expand to lower-risk journeys over time. This progressive adoption path reduces the risk of a big-bang migration.

## Key info

- Three pillars: Identity Insights (pre-verification: SIM swap, subscriber match, line type, device swap), Verify (Silent Auth + fallback to SMS/RCS/Voice/WhatsApp/Email), Fraud Defender (AIT/SMS pumping protection, automatic with Verify).
- Cognito integration: CUSTOM_AUTH flow, 3 Lambda triggers, Vonage credentials in Secrets Manager.
- Fraud Defender: typically absorbs its own cost in toll fraud prevention within the first billing cycle. Vonage customers have collectively saved over $3M.
- Lydia Solutions: 50% latency reduction, 2-8.5% conversion improvement.
- Compliance: GDPR (match scores only, no PII transmitted), PSD2/SCA (possession factor), HIPAA, DORA (>99.9% availability via multi-channel fallback), CCPA.

## Action recommendations

1. Start with the highest-risk journeys (password recovery, high-value transactions) where security ROI is clearest. Use CUSTOM_AUTH flow for zero-disruption deployment.
2. Implement risk-adaptive workflows: Silent Auth for low/medium risk, full signal stack for high/critical risk.
3. Store Vonage API credentials in Secrets Manager with environment-specific access controls.
4. Enable Fraud Defender automatically with Verify API -- it is included at no additional cost.

## Anti-patterns

- **Do not apply the same verification friction to all sessions. Risk-adaptive means calibrating to actual risk.**

- **Do not rely on static SIM-swap databases. Real-time operator queries close the fraud window entirely.**

- **Do not ignore the token-in-query-parameter concern for WebSocket. Use TLS, short-lived tokens, and log redaction.**

- **Assuming that network-level authentication eliminates the need for fallback.** Silent Authentication requires a cellular data session. Users on Wi-Fi or in areas with poor cellular coverage cannot use Silent Auth. The system must fall back to SMS, RCS, Voice, WhatsApp, or Email. Designing for Silent Auth without a fallback path creates a failure mode where legitimate users cannot authenticate at all.

- **Treating fraud prevention as a feature rather than a continuous process.** Fraud tactics evolve. The SIM-swap window that was measured in days is now measured in minutes. A fraud prevention system that was secure last year may be vulnerable today because attackers adapt. The security posture must be continuously reviewed and recalibrated, not deployed once and forgotten.

## Related

- ../quality-security/handle-secrets-and-config.md