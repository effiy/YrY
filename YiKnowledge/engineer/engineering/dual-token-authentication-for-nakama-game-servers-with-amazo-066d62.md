---
title: Dual-token authentication for Nakama game servers with Amazon Cognito on AWS
tags: [game-servers, Nakama, Cognito, JWT, WebSocket, NLB, dual-token, authentication, Go]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/dual-token-authentication-for-nakama-game-servers-with-amazon-cognito-on-aws/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, game-developer]
benefit: "Learn how to bridge two independent session systems (Cognito JWT + Nakama session token) with a Go runtime hook, and manage WebSocket lifecycle under NLB TCP passthrough constraints."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../quality-security/handle-secrets-and-config.md
  - ./do-a-tech-stack-inventory.md
---

# Dual-token authentication for Nakama game servers with Amazon Cognito on AWS

> **As a** game backend engineer, **I want to** authenticate players via Cognito and bridge their identity to Nakama game sessions without interrupting gameplay, **so that** players get seamless authentication and the game server never handles user credentials.

## Summary

- Dual-token pattern: Cognito owns player identity (JWT), Nakama owns game sessions (session token). A Go runtime hook validates the Cognito JWT and exchanges the verified identity for a Nakama session token.
- Cognito is configured with USER_SRP_AUTH (password never leaves the client), public app client with no client secret, JWT access token (1-hour expiry, RS256 signed).
- The Go hook performs five checks: token format, algorithm (RS256 only), RSA signature against JWKS, expiry, and issuer/audience. It NEVER trusts the identity string from the client -- it overwrites the Nakama user ID with the `sub` claim from the validated JWT.
- Infrastructure: CloudFront -> WAF -> ALB (HTTP API, explicit allow-list, default 403) + NLB (WebSocket TCP passthrough). Two load balancers are required because ALB operates at Layer 7 and NLB at Layer 4.
- WebSocket lifecycle: NLB drops idle TCP after 350s. Nakama 10s ping/pong keepalive prevents this. `single_socket: true` ensures one connection per user.

## Core viewpoints

### 1. The Go hook must never trust the client's identity claim

The client sends a user ID in the request body. The hook discards it and overwrites the Nakama user ID with the `sub` claim from the cryptographically validated JWT. This is the critical security property: a client cannot impersonate another player by forging a user ID.

### 2. Two load balancers are necessary, not a design flaw

The ALB handles HTTP API traffic with path-based routing and an explicit allow-list (default 403). The NLB handles WebSocket TCP passthrough. These cannot be combined into one because WebSocket requires Layer 4 passthrough while the HTTP API requires Layer 7 routing.

### 3. WebSocket token-in-query-parameter is a necessary evil with trade-offs

The session token travels as `?token=...` in the WebSocket upgrade URL because NLB TCP passthrough prevents HTTP header inspection. Mitigations: TLS (encrypted in transit), short-lived tokens (2 hours), `single_socket` enforcement, and log redaction policies for the token parameter.

### 4. The JWKS cache with thundering herd guard is the unsung reliability hero

The Go hook caches the JWKS response with a 1-hour TTL and a 30-second thundering herd guard. Without this, every authentication request would hit the Cognito JWKS endpoint, creating a single point of failure and unnecessary latency. The 30-second guard prevents cache stampedes when the TTL expires -- a subtle reliability pattern that is easy to overlook but critical at scale.

### 5. The dual-token pattern decouples identity from session management

Cognito owns "who the player is" (identity) while Nakama owns "what the player is doing right now" (session). This separation means that identity changes (password reset, account recovery) do not require session management changes, and session management changes (token expiry, socket lifecycle) do not require identity changes. The two systems are independently evolvable because the Go hook is the only integration point.

## Key info

- Cognito: USER_SRP_AUTH, public client (no secret), RS256 JWT with 1-hour expiry.
- Go hook: five checks (format, algorithm, signature, expiry, issuer/audience), JWKS cache with 1-hour TTL and 30-second thundering herd guard.
- ALB routing: explicit allow-list (healthcheck, /v2/account/authenticate/*, /v2/*, /v1/*), default 403.
- WebSocket: NLB TCP idle timeout 350s, Nakama ping 10s, pong wait 20s, token_expiry_sec 7200, single_socket true.
- Infrastructure: 6 Terraform modules (network, compute, auth, cdn, waf, ops) + bootstrap module.

## Action recommendations

1. Implement the five JWT validation checks in your server's auth hook: format, algorithm, signature, expiry, issuer/audience.
2. Use USER_SRP_AUTH for client-side authentication. The password never leaves the device.
3. For WebSocket behind NLB: configure keepalive pings shorter than the NLB idle timeout (350s), implement session expiry at connect time, and enforce single-socket-per-user.
4. Add log redaction policies for the `token` query parameter in WebSocket URLs.

## Anti-patterns

- **Do not trust the client's identity claim. Always cryptographically validate the JWT and use the `sub` claim.**

- **Do not combine HTTP API and WebSocket on a single load balancer. ALB for HTTP, NLB for WebSocket TCP passthrough.**

- **Do not use a single load balancer for both. The routing requirements are fundamentally different.**

- **Do not use ALBs for WebSocket with NLB TCP passthrough pattern. ALBs require HTTP inspection.**

- **Assuming that TLS alone makes token-in-query-parameter safe.** TLS protects the token in transit, but the token remains in server logs, proxy logs, and browser history after decryption. The token-in-query-parameter pattern is a necessary evil with NLB TCP passthrough, not a secure design choice. Mitigations must include short-lived tokens, single-socket enforcement, and aggressive log redaction -- TLS alone is not sufficient.

## Related

- ../quality-security/handle-secrets-and-config.md
- ./do-a-tech-stack-inventory.md