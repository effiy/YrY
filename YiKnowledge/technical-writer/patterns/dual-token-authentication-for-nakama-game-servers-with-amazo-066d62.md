---
title: Dual-token authentication for Nakama game servers with Amazon Cognito on AWS
tags:
- AWS Architecture
category: technical-writer/patterns
created: '2026-08-07'
source: https://aws.amazon.com/blogs/architecture/dual-token-authentication-for-nakama-game-servers-with-amazon-cognito-on-aws/
type: rss
source_name: AWS Architecture
source_url: https://aws.amazon.com/blogs/architecture/feed/
published: Mon, 29 Jun 2026 17:09:54 +0000
author: Madhusudan Athinarapu
---

<p>When your game server needs both a managed identity provider and its own session system, players face a broken experience if authentication forces a redirect or stalls gameplay. Dual-token authentication for Nakama game servers with <a href="https://aws.amazon.com/cognito/" rel="noopener" target="_blank">Amazon Cognito</a> solves this by connecting two independent session systems, each with its own token lifecycle, without interrupting the player. This post shows you how.</p> 
<p>Amazon Cognito handles player identity and Nakama manages game sessions. Cognito issues a JWT, a server-side Go hook validates it and exchanges the verified identity for a Nakama session token. Each token is validated independently on every request. The pattern applies to game servers such as Nakama that support runtime authentication hooks.</p> 
<p>The infrastructure wraps Nakama in a default-closed routing layer. <a href="https://aws.amazon.com/cloudfront/" rel="noopener" target="_blank">Amazon CloudFront</a> serves as the single HTTPS entry point, <a href="https://aws.amazon.com/waf/" rel="noopener" target="_blank">AWS WAF</a> filters traffic at the edge, an <a href="https://aws.amazon.com/elasticloadbalancing/application-load-balancer/" rel="noopener" target="_blank">Application Load Balancer</a> (ALB) enforces an explicit route allow-list for HTTP, and a <a href="https://aws.amazon.com/elasticloadbalancing/network-load-balancer/" rel="noopener" target="_blank">Network Load Balancer</a> (NLB) handles WebSocket TCP passthrough. Nakama runs on <a href="https://aws.amazon.com/ecs/" rel="noopener" target="_blank">Amazon Elastic Container Service</a> (Amazon ECS) on <a href="https://aws.amazon.com/fargate/" rel="noopener" target="_blank">AWS Fargate</a>. In this post, we cover the Cognito configuration, the Go hook, the Terraform infrastructure, and the WebSocket lifecycle controls.</p> 
<p>In this post, you learn how to:</p> 
<ol type="1"> 
 <li>Configure an Amazon Cognito User Pool for SRP-based game client authentication with no client secret.</li> 
 <li>Implement a Go runtime hook that validates Cognito JWTs and bridges player identity to Nakama sessions.</li> 
 <li>Set up a default-closed routing layer using Amazon CloudFront, an ALB, and an NLB.</li> 
 <li>Manage the WebSocket connection lifecycle under the NLB TCP idle timeout model.</li> 
</ol> 
<h2>Solution overview</h2> 
<p>The architecture has four layers for authenticating and routing traffic.</p> 
<p>The following diagram shows the architecture. Amazon CloudFront is the single entry point, routing HTTP API traffic through an Application Load Balancer (ALB) to Nakama on Amazon ECS, and WebSocket traffic through a Network Load Balancer (NLB) via TCP passthrough.</p> 
<p><img alt="Architecture diagram showing dual-token authentication flow from client through Amazon CloudFront, ALB, and NLB to Nakama on Amazon ECS" src="https://d2908q01vomqb2.cloudfront.net/fc074d501302eb2b93e2554793fcaf50b3bf7291/2026/06/17/ARCHBLOG-1497-1-1.png" width="600" /></p> 
<p><strong>Figure 1.</strong> Dual-token authentication architecture for Nakama on AWS.</p> 
<p>Traffic flows through the system in six steps:</p> 
<ol type="1"> 
 <li><strong>Client → Amazon Cognito</strong> — The player authenticates using USER_SRP_AUTH. The password never leaves the client. Amazon Cognito returns a JWT access token.</li> 
 <li><strong>Client → Amazon CloudFront</strong> — Requests enter via Amazon CloudFront (HTTPS). AWS WAF inspects traffic at the edge before it reaches the origin.</li> 
 <li><strong>CloudFront → ALB (port 80)</strong> — /* HTTP API traffic. The ALB is security-group locked to the CloudFront managed prefix list only.</li> 
 <li><strong>CloudFront → NLB (port 7350)</strong> — /ws* WebSocket traffic. The NLB performs TCP passthrough with no HTTP inspection.</li> 
 <li><strong>ALB → Amazon ECS (Nakama)</strong> — For auth requests: the BeforeAuthenticateCustom Go hook validates the Cognito JWT and extracts the <code>sub</code> claim as the Nakama user ID. For other API calls: Nakama validates its own session token.</li> 
 <li><strong>NLB → Amazon ECS (Nakama)</strong> — Persistent WebSocket connection. Nakama validates the session token from the token query parameter at connect time.</li> 
</ol> 
<h3 id="why-two-load-balancers">Why two load balancers</h3> 
<p>The ALB and NLB serve different purposes and cannot be combined into one.</p> 
<p>The ALB operates at the HTTP layer (Layer 7). It reads the path, applies listener rules, and returns <code>403</code> for unlisted routes.</p> 
<p>The NLB operates at the TCP layer (Layer 4) and passes the raw stream to Nakama unchanged. Nakama receives the WebSocket upgrade directly from the client, validates the session token, and manages the connection lifecycle end-to-end.</p> 
<p>Amazon CloudFront routes <code>/ws*</code> to the NLB and everything else to the ALB, so each connection type gets the appropriate handling behind a single HTTPS endpoint.</p> 
<h2>Prerequisites</h2> 
<p>Before you deploy this solution, make sure you have:</p> 
<ol type="1"> 
 <li>Terraform &gt;= 1.5.0 (<a href="https://www.terraform.io/downloads" rel="noopener" target="_blank">download</a>).</li> 
 <li><a href="https://go.dev/" rel="noopener" target="_blank">Go</a> &gt;= 1.21 (to build the <a href="https://heroiclabs.com/nakama/" rel="noopener" target="_blank">Nakama</a> plugin locally).</li> 
 <li>Docker and the <a href="https://aws.amazon.com/cli/" rel="noopener" target="_blank">AWS Command Line Interface (AWS CLI)</a> configured with appropriate credentials.</li> 
</ol> 
<p>The repository includes a browser-based test app (<code>/app</code>) that demonstrates the full sign-up, sign-in, and Nakama token exchange flow.</p> 
<h2>Authenticate players with Amazon Cognito</h2> 
<p>Amazon Cognito provides a managed user directory that issues JWTs without requiring you to run your own identity server or store credentials. The game server validates the JWT independently on each request, with no callback to Cognito needed. This decouples identity from game sessions: Cognito owns the player’s identity, Nakama owns the game session, and neither system depends on the other at runtime.</p> 
<p>Players self-register by calling the Cognito SignUp API from the game client. The User Pool verifies their email before the account becomes active. After sign-in, Cognito returns a JWT access token containing the player’s <code>sub</code> claim (a UUID), which becomes the Nakama user ID in the next step.</p> 
<p>Authentication uses the <code>USER_SRP_AUTH</code> flow. The password never leaves the client device. The User Pool <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html" rel="noopener" target="_blank">App Client</a> is configured as a public client with no client secret, since your game client runs in the browser or a native app where any embedded secret is extractable. With SRP, no secret is needed; security comes from the protocol itself.</p> 
<p>After a successful sign-in, Amazon Cognito returns a JWT access token. This token carries the player’s identity claims and is signed with an RSA key pair unique to your User Pool. The <code>sub</code> claim — a UUID generated by Cognito — uniquely identifies the player and becomes the Nakama user ID in the next step.</p> 
<p>The auth Terraform module configures the App Client with <code>generate_secret=false</code> and permits only <code>ALLOW_USER_SRP_AUTH</code> and <code>ALLOW_REFRESH_TOKEN_AUTH</code> flows. The resulting JWT access token is short-lived (1 hour by default) and carries the <code>sub</code>, <code>iss</code>, <code>exp</code>, and <code>client_id</code> claims that the Go hook validates in the next step.</p> 
<h2>Bridge Cognito identity to Nakama sessions</h2> 
<p>Nakama’s server-side runtime supports Go plugins exclusively. The hook in this section is written in Go using Nakama’s <code>runtime.Initializer</code> interface. This is a constraint of the Nakama runtime model.</p> 
<p>Once the client has a Cognito JWT, it needs a Nakama session token to make game API calls.</p> 
<h3 id="validate-the-cognito-jwt-in-the-go-hook">Validate the Cognito JWT in the Go hook</h3> 
<p>The game server cannot trust the identity claim sent by the client directly. Any client can forge a user ID. JWT validation cryptographically proves the identity was issued by Cognito, preventing player impersonation.</p> 
<p>The hook performs five checks in order: token format, algorithm (RS256 only), signature against the JWKS, expiry, and issuer/audience matching your specific User Pool.</p> 
<div class="hide-language"> 
 <pre><code class="language-go">func validateCognitoJWT(token string, env map[string]string) (string, error) {
    parts := strings.Split(token, ".")
    if len(parts) != 3 {
        return "", runtime.NewError("invalid token format", 3)
    }

    // Parse the header to get the key ID (kid)
    var header struct {
        Kid string `json:"kid"`
        Alg string `json:"alg"`
    }
    headerBytes, _ := base64.RawURLEncoding.DecodeString(parts[0])
    json.Unmarshal(headerBytes, &amp;header)

    if header.Alg != "RS256" {
        return "", runtime.NewError("unsupported algorithm: "+header.Alg, 3)
    }

    // Fetch the public key from the JWKS cache
    pubKey, err := jwksCache.getKey(header.Kid)
    if err != nil {
        return "", runtime.NewError("token validation failed", 16)
    }

    // Verify the RSA signature
    hash := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
    signatureBytes, _ := base64.RawURLEncoding.DecodeString(parts[2])
    if err := rsa.VerifyPKCS1v15(pubKey, crypto.SHA256, hash[:], signatureBytes); err != nil {
        return "", runtime.NewError("invalid token signature", 16)
    }

    // Validate claims: expiry, issuer, audience
    if time.Now().Unix() &gt; claims.Exp { return "", runtime.NewError("token expired", 16) }
    if claims.Iss != expectedIssuer || claims.ClientID != env["COGNITO_CLIENT_ID"] {
        return "", runtime.NewError("invalid issuer or audience", 16)
    }

    return claims.Sub, nil // sub claim becomes the Nakama user ID
}</code></pre> 
</div> 
<p><strong>Security note:</strong> The hook never trusts the identity string sent by the client. It discards it and overwrites the Nakama user ID with the <code>sub</code> claim from the validated JWT. A client that sends a forged <code>sub</code> cannot impersonate another player — the hook ignores the body value entirely.</p> 
<h3 id="cache-jwks-keys-with-thundering-herd-protection">Cache JWKS keys with thundering herd protection</h3> 
<p>Amazon Cognito rotates its signing keys periodically. The hook caches keys with a 1-hour TTL. A 30-second re-fetch guard prevents multiple goroutines from calling the JWKS endpoint simultaneously when the cache expires.</p> 
<div class="hide-language"> 
 <pre><code class="language-go">func (c *JWKSCache) refresh() error {
    c.mu.Lock()
    defer c.mu.Unlock()

    // Thundering herd protection: if another goroutine already
    // refreshed within the last 30s, use the updated cache
    if time.Since(c.fetched) &lt; 30*time.Second {
        return nil
    }

    // ... fetch and parse JWKS from Cognito endpoint
}</code></pre> 
</div> 
<h3 id="register-the-hook">Register the hook</h3> 
<p>The hook registers itself in <code>InitModule</code>, the entry point called by Nakama when the plugin loads:</p> 
<div class="hide-language"> 
 <pre><code class="language-go">func InitModule(ctx context.Context, logger runtime.Logger, db *sql.DB,
    nk runtime.NakamaModule, initializer runtime.Initializer) error {

    if err := initializer.RegisterBeforeAuthenticateCustom(beforeAuthenticateCustom); err != nil {
        return fmt.Errorf("failed to register hook: %w", err)
    }
    logger.Info("Cognito JWT validation hook registered")
    return nil
}</code></pre> 
</div> 
<p>When the client calls <code>POST /v2/account/authenticate/custom</code> with the Cognito JWT as the <code>id</code> field, Nakama calls <code>beforeAuthenticateCustom</code> before processing the request. If the JWT is valid, the hook sets <code>in.Account.Id = sub</code> and returns. Nakama creates or links the account and returns a session token to the client.</p> 
<p>If your server is not Nakama, for example, Colyseus, Photon, or a custom WebSocket server, implement the same five checks (algorithm, signature, expiry, issuer, audience) in your server’s middleware or plugin language. The JWKS endpoint and JWT structure follow the OIDC standard, so any OIDC-compliant identity provider (not only Amazon Cognito) works with this pattern.</p> 
<h2>Deploy the infrastructure</h2> 
<p>The infrastructure is organized into six Terraform modules: network (Amazon Virtual Private Cloud (Amazon VPC), subnets, security groups), compute (Amazon ECS cluster, ALB, NLB, <a href="https://aws.amazon.com/ecr/" rel="noopener" target="_blank">Amazon Elastic Container Registry (Amazon ECR)</a>), auth (Cognito User Pool), cdn (CloudFront distribution), waf-cloudfront (AWS WAF Web ACL), and ops (IAM, AWS Systems Manager access). A bootstrap module creates the S3 state backend and AWS Key Management Service (AWS KMS) key before the main deployment.</p> 
<p>Deploy with:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash"># One-time: provision the Terraform state backend
cd terraform/bootstrap &amp;&amp; terraform init &amp;&amp; terraform apply

# Deploy everything
cd terraform &amp;&amp; terraform init -backend-config=config/backend-dev.hcl
make deploy</code></pre> 
</div> 
<p><code>make deploy</code> builds and pushes the Nakama container image to Amazon ECR, then runs <code>terraform apply</code>. The image tag auto-increments from the latest tag in ECR.</p> 
<h3 id="alb-routing-explicit-allow-list">ALB routing: explicit allow list</h3> 
<p>The ALB default listener action returns <code>403</code>. Only the paths in the following table reach Nakama. Requests to unlisted paths are rejected before they reach the game server.</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Priority</strong></td> 
   <td><strong>Path</strong></td> 
   <td><strong>Target</strong></td> 
   <td><strong>Purpose</strong></td> 
  </tr> 
  <tr> 
   <td>1</td> 
   <td>/healthcheck</td> 
   <td>Nakama port 7350</td> 
   <td>Health monitoring</td> 
  </tr> 
  <tr> 
   <td>2</td> 
   <td>/v2/account/authenticate/*</td> 
   <td>Nakama port 7350</td> 
   <td>Session bridge: Go hook validates JWT</td> 
  </tr> 
  <tr> 
   <td>10</td> 
   <td>/v2/*</td> 
   <td>Nakama port 7350</td> 
   <td>Nakama REST API v2</td> 
  </tr> 
  <tr> 
   <td>11</td> 
   <td>/v1/*</td> 
   <td>Nakama port 7350</td> 
   <td>Nakama RPC (v1)</td> 
  </tr> 
  <tr> 
   <td>Default</td> 
   <td>*</td> 
   <td>403 Forbidden</td> 
   <td>Request never reaches Nakama</td> 
  </tr> 
 </tbody> 
</table> 
<p>The default-<code>403</code> posture means a misconfigured client or a scanner probing arbitrary paths gets a <code>403</code> at the ALB, not an error from the game server. This limits the attack surface to the explicitly listed API surface.</p> 
<h3 id="security-group-chain">Security group chain</h3> 
<p>The network layer enforces two security group rules:</p> 
<ol type="1"> 
 <li>The ALB security group allows inbound only from the CloudFront managed prefix list. As an additional application-layer check, CloudFront sends a shared secret in the <code>X-CloudFront-Secret</code> header on every request; ALB listener rules reject any request missing the correct value with a <code>403</code>. The NLB security group applies the same CloudFront managed prefix list restriction at Layer 4.</li> 
 <li>The NLB security group allows inbound TCP 7350 only from the CloudFront managed prefix list. The ECS task security group allows inbound port 7350 only from the ALB security group (HTTP API) and from the NLB security group (WebSocket).</li> 
</ol> 
<p>Together, the routing and security group chain means the only path to Nakama is: Internet → CloudFront → AWS WAF → ALB or NLB → ECS. No hop can be skipped.</p> 
<h2>Manage the WebSocket connection lifecycle</h2> 
<p>The NLB TCP passthrough model creates a lifecycle challenge: the NLB drops idle TCP flows after 350 seconds (the AWS default, not configurable). If a player’s connection sits idle, the NLB closes the underlying TCP connection while Nakama still holds an open socket.</p> 
<p>The following table describes the four controls that handle this:</p> 
<table border="1px" cellpadding="10px" width="100%"> 
 <tbody> 
  <tr> 
   <td><strong>Control</strong></td> 
   <td><strong>Value</strong></td> 
   <td><strong>Purpose</strong></td> 
  </tr> 
  <tr> 
   <td>NLB TCP idle timeout</td> 
   <td>350s</td> 
   <td>NLB drops idle TCP flows. Cannot be changed.</td> 
  </tr> 
  <tr> 
   <td>Nakama ping interval</td> 
   <td>10s</td> 
   <td>Nakama sends a WebSocket ping every 10s, keeping the TCP flow active.</td> 
  </tr> 
  <tr> 
   <td>Nakama pong wait</td> 
   <td>20s</td> 
   <td>If the client does not respond to a ping within 20s, Nakama closes the connection.</td> 
  </tr> 
  <tr> 
   <td>token_expiry_sec</td> 
   <td>7200</td> 
   <td>Nakama rejects session tokens older than 2 hours at connect time.</td> 
  </tr> 
  <tr> 
   <td>single_socket</td> 
   <td>true</td> 
   <td>A new connection from the same user kills the previous one, preventing stale sessions.</td> 
  </tr> 
 </tbody> 
</table> 
<h3 id="the-pingpong-keepalive">The ping/pong keepalive</h3> 
<p>The 10-second ping interval is the key control. Nakama sends a WebSocket ping frame every 10 seconds on each active connection. The client responds with a pong. This keeps the NLB TCP flow alive well within the 350-second idle timeout. If the client goes silent, Nakama detects the missing pong within 20 seconds and closes the socket cleanly.</p> 
<h3 id="session-expiry-at-connect-time">Session expiry at connect time</h3> 
<p>The NLB performs TCP passthrough, so there is no opportunity to inspect HTTP headers or validate the session token at the network layer. Nakama validates the session token from the <code>token</code> query parameter when the WebSocket upgrade request arrives. A token older than <code>token_expiry_sec</code> is rejected and the connection is closed before any game messages are processed.</p> 
<h3 id="single-socket-enforcement">Single socket enforcement</h3> 
<p><code>single_socket: true</code> verifies that when a player opens a second connection (after a network drop and reconnect, for example) the server closes the first connection. Without this, a player’s Nakama state can be split across two concurrent connections if the client does not cleanly close the first one.</p> 
<p>The four-layer model (keepalive, timeout, session expiry at connect, one-connection-per-user enforcement) applies to any real-time server behind an NLB TCP passthrough: Colyseus, Photon, custom WebSocket backends, or any game server that manages persistent connections. If your server does not have built-in ping/pong, implement application-level heartbeat messages that serve the same role.</p> 
<p><strong>Security note:</strong> The session token travels as a query parameter (<code>?token=...</code>) in the WebSocket upgrade URL. Query parameters appear in server access logs, load balancer logs, Amazon CloudFront logs, and browser history. Mitigations: all connections use TLS (token encrypted in transit), session tokens are short-lived (2 hours), and <code>single_socket</code> invalidates old connections on reconnect. For production deployments, consider log redaction policies for the token parameter.</p> 
<h2>Clean up</h2> 
<p>To avoid ongoing AWS charges, destroy all resources when you no longer need them.</p> 
<p>Destroy the main infrastructure first:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">cd terraform &amp;&amp; terraform destroy</code></pre> 
</div> 
<p>Then destroy the Terraform state backend:</p> 
<div class="hide-language"> 
 <pre><code class="language-bash">cd terraform/bootstrap &amp;&amp; terraform destroy</code></pre> 
</div> 
<p>Confirm resources are removed by running <code>terraform state list</code> (should return empty) or checking the AWS Management Console.</p> 
<h2>Conclusion</h2> 
<p>In this post, you implemented a dual-token authentication architecture for a Nakama game server on AWS. Amazon Cognito handles player identity through JWT validation; a Go runtime hook bridges verified identity into Nakama sessions; and the infrastructure enforces a routing layer where HTTP API traffic passes through an Application Load Balancer with an explicit allow list and WebSocket connections reach Nakama directly through a Network Load Balancer TCP passthrough.</p> 
<p>The four-layer WebSocket lifecycle model can be applied to real-time game servers behind an NLB TCP passthrough, not Nakama exclusively.</p> 
<p>For production deployments, consider these next steps:</p> 
<ol type="1"> 
 <li>Replace the PostgreSQL sidecar with <a href="https://aws.amazon.com/rds/aurora/" rel="noopener" target="_blank">Amazon Aurora PostgreSQL-Compatible Edition</a> for persistent, managed player data storage.</li> 
 <li>Add a custom domain with TLS re-encryption between Amazon CloudFront and the ALB.</li> 
 <li>Add <a href="https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html" rel="noopener" target="_blank">Amazon VPC endpoints</a> for Amazon Cognito and <a href="https://aws.amazon.com/secrets-manager/" rel="noopener" target="_blank">AWS Secrets Manager</a> to eliminate the NAT Gateway dependency.</li> 
</ol> 
<p>The full Terraform modules and Go plugin are available in the <a href="https://github.com/aws-samples/sample-dual-token-auth-nakama-cognito">GitHub repository</a>.</p> 
<p>For more on Cognito-based game authentication patterns, refer to <a href="https://aws.amazon.com/blogs/gametech/using-amazon-cognito-to-authenticate-players-for-a-game-backend-service/" rel="noopener" target="_blank">Using Amazon Cognito to Authenticate Players for a Game Backend Service</a> and <a href="https://aws.amazon.com/blogs/architecture/web-application-access-control-patterns-using-aws-services/" rel="noopener" target="_blank">Web application access control patterns using AWS services</a>.</p> 
<p>Share your questions and feedback in the comments.</p> 
<hr /> 
<h2>About the authors</h2>