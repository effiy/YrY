/**
 * @file: data.js
 * @purpose: Static content + SVG markup for the architecture diagram.
 *           Pure data — no logic, no DOM access. Loaded before index.js
 *           and exposed as window.REPORT_DATA.
 *
 * @shape:
 *   {
 *     meta:               { title, pageTitle, subtitle, footer }
 *     executiveSummary:   [{ color, title, content }]
 *     toc:                [{ href, icon, label }]
 *     metrics:            [{ label, status?, value, valueClass, sub }]
 *     svgDiagram:         '<svg>…</svg>'   (full markup as a string)
 *     summaryCards:       [{ color, title, items: [str] }]
 *     pipeline:           [{ badge, badgeClass, info }]
 *     securityCards:      [{ color, title, items: [str] }]
 *     trace:              [{ name, nameClass, sub, time }]
 *     scalingTiles:       [{ color, title, body }]
 *     ownership:          { headers: [str], rows: [[str|html]] }
 *     apiTable:           { headers: [str], rows: [[str|html]] }
 *     stack:              [{ label, value, valueClass }]
 *     schemaTiles:        [{ title, body }]
 *     roadmap:            [{ tag, tagClass, text, textClass }]
 *     glossary:           [{ term, termClass?, def }]
 *   }
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     SVG DIAGRAM (the hand-positioned architecture diagram)
     Kept as a string so index.js can mount it via v-html into the
     <section class="diagram-container"> element.
     ───────────────────────────────────────────────────────────────── */
  var svgDiagram = [
    '<svg ref="svg" viewBox="0 0 1280 850" role="img"',
    '     aria-labelledby="diagram-title diagram-desc"',
    '     xmlns="http://www.w3.org/2000/svg">',
    '  <title id="diagram-title">Microservices Platform Architecture — AWS us-east-1</title>',
    '  <desc id="diagram-desc">System architecture showing CloudFront CDN, WAF, ALB, API Gateway, three Go microservices (User, Order, Payment), PostgreSQL RDS, Redis cache, Kafka message bus, and supporting infrastructure services</desc>',

    /* ── 1. Definitions ── */
    '  <defs>',
    '    <marker id="arrow-cyan"    markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22d3ee"/></marker>',
    '    <marker id="arrow-emerald" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#34d399"/></marker>',
    '    <marker id="arrow-violet"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#a78bfa"/></marker>',
    '    <marker id="arrow-amber"   markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#fbbf24"/></marker>',
    '    <marker id="arrow-rose"    markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#fb7185"/></marker>',
    '    <marker id="arrow-orange"  markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#fb923c"/></marker>',
    '    <marker id="arrow-slate"   markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#64748b"/></marker>',
    '    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">',
    '      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/>',
    '    </pattern>',
    '    <linearGradient id="grad-cyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22d3ee" stop-opacity="0.15"/><stop offset="100%" stop-color="#22d3ee" stop-opacity="0.05"/></linearGradient>',
    '    <linearGradient id="grad-emerald" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399" stop-opacity="0.15"/><stop offset="100%" stop-color="#34d399" stop-opacity="0.05"/></linearGradient>',
    '    <linearGradient id="grad-violet" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.15"/><stop offset="100%" stop-color="#a78bfa" stop-opacity="0.05"/></linearGradient>',
    '    <filter id="shadow-sm" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/></filter>',
    '    <filter id="shadow-md" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/></filter>',
    '    <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    '  </defs>',

    /* ── 2. Background Grid ── */
    '  <rect width="100%" height="100%" fill="url(#grid)"/>',

    /* ── 3. ARROWS (drawn first — rendered behind boxes) ── */
    '  <line x1="100" y1="365" x2="178" y2="365" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrow-cyan)"/>',
    '  <text x="140" y="358" fill="#94a3b8" font-size="9" text-anchor="middle">HTTPS/TLS</text>',
    '  <text x="140" y="388" fill="#475569" font-size="7" text-anchor="middle">p95 ≤ 120ms</text>',

    '  <line x1="290" y1="365" x2="338" y2="365" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrow-cyan)"/>',
    '  <line x1="450" y1="365" x2="498" y2="365" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#arrow-cyan)"/>',

    '  <line x1="610" y1="315" x2="658" y2="315" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-emerald)"/>',
    '  <text x="634" y="309" fill="#94a3b8" font-size="8" text-anchor="middle">gRPC</text>',

    '  <line x1="610" y1="365" x2="658" y2="365" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-emerald)"/>',
    '  <text x="634" y="358" fill="#94a3b8" font-size="8" text-anchor="middle">REST</text>',
    '  <text x="634" y="388" fill="#475569" font-size="7" text-anchor="middle">p95 ≤ 45ms</text>',

    '  <line x1="610" y1="405" x2="658" y2="405" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>',
    '  <text x="634" y="398" fill="#fb923c" font-size="8" text-anchor="middle">WSS</text>',

    '  <line x1="770" y1="340" x2="770" y2="228" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,5" marker-end="url(#arrow-rose)"/>',
    '  <text x="778" y="288" fill="#fb7185" font-size="8">JWT</text>',

    '  <line x1="830" y1="365" x2="908" y2="365" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-emerald)"/>',
    '  <text x="869" y="358" fill="#475569" font-size="7" text-anchor="middle">p95 ≤ 18ms</text>',

    '  <line x1="830" y1="415" x2="908" y2="415" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-emerald)"/>',
    '  <line x1="830" y1="455" x2="908" y2="455" stroke="#34d399" stroke-width="1.5" marker-end="url(#arrow-emerald)"/>',

    '  <line x1="960" y1="340" x2="960" y2="228" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrow-violet)"/>',
    '  <text x="968" y="288" fill="#94a3b8" font-size="8">R/W</text>',

    '  <line x1="1020" y1="390" x2="1020" y2="508" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrow-violet)"/>',
    '  <text x="1028" y="452" fill="#94a3b8" font-size="8">TLS</text>',
    '  <text x="1032" y="468" fill="#475569" font-size="7">p95 ≤ 8ms</text>',

    '  <line x1="1060" y1="415" x2="1060" y2="508" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrow-violet)"/>',
    '  <line x1="1100" y1="455" x2="1100" y2="508" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arrow-violet)"/>',

    '  <line x1="960" y1="430" x2="960" y2="558" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>',
    '  <text x="948" y="498" fill="#fb923c" font-size="8">publish</text>',

    '  <line x1="890" y1="565" x2="828" y2="565" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>',
    '  <text x="860" y="558" fill="#fb923c" font-size="8">consume</text>',

    '  <line x1="770" y1="590" x2="770" y2="668" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow-slate)"/>',
    '  <text x="780" y="632" fill="#94a3b8" font-size="8">SMTP</text>',

    '  <line x1="1020" y1="470" x2="1020" y2="668" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow-slate)"/>',
    '  <text x="1030" y="572" fill="#94a3b8" font-size="8">API</text>',

    '  <line x1="200" y1="195" x2="200" y2="138" stroke="#fbbf24" stroke-width="1.5" marker-end="url(#arrow-amber)"/>',
    '  <text x="212" y="170" fill="#fbbf24" font-size="8">push</text>',

    '  <path d="M 260 120 L 450 120 Q 470 120 470 140 L 470 228" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="6,4" marker-end="url(#arrow-amber)"/>',
    '  <text x="360" y="113" fill="#fbbf24" font-size="8">deploy</text>',

    '  <line x1="1150" y1="140" x2="1150" y2="508" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>',
    '  <text x="1160" y="325" fill="#475569" font-size="7">metrics</text>',

    /* ── 4. OPAQUE MASKS ── */
    '  <rect x="50"  y="80"  width="100" height="60"  rx="6" fill="#0f172a"/>',
    '  <rect x="190" y="180" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="50"  y="180" width="100" height="70"  rx="6" fill="#0f172a"/>',
    '  <rect x="50"  y="340" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="190" y="340" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="350" y="340" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="510" y="340" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="350" y="280" width="100" height="40"  rx="6" fill="#0f172a"/>',
    '  <rect x="670" y="280" width="100" height="130" rx="8" fill="#0f172a"/>',
    '  <rect x="920" y="340" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="920" y="410" width="100" height="40"  rx="6" fill="#0f172a"/>',
    '  <rect x="920" y="460" width="100" height="40"  rx="6" fill="#0f172a"/>',
    '  <rect x="800" y="540" width="80"  height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="920" y="520" width="200" height="40"  rx="8" fill="#0f172a"/>',
    '  <rect x="920" y="570" width="200" height="30"  rx="4" fill="#0f172a"/>',
    '  <rect x="920" y="640" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="690" y="640" width="120" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="690" y="540" width="100" height="50"  rx="6" fill="#0f172a"/>',
    '  <rect x="1120" y="80" width="100" height="160" rx="8" fill="#0f172a"/>',

    /* ── 5. COMPONENTS ── */
    '  <g class="svg-comp">',
    '    <rect class="comp-stroke" data-component="ecr" x="50" y="80" width="100" height="60" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"/>',
    '    <text x="100" y="106" fill="white" font-size="11" font-weight="600" text-anchor="middle">ECR</text>',
    '    <text x="100" y="124" fill="#94a3b8" font-size="9" text-anchor="middle">Container Registry</text>',

    '    <rect class="comp-stroke" data-component="github-actions" x="190" y="180" width="100" height="50" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"/>',
    '    <text x="240" y="202" fill="white" font-size="11" font-weight="600" text-anchor="middle">GitHub Actions</text>',
    '    <text x="240" y="218" fill="#94a3b8" font-size="9" text-anchor="middle">CI/CD Pipeline</text>',

    '    <rect class="comp-stroke" data-component="s3" x="50" y="180" width="100" height="70" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"/>',
    '    <text x="100" y="202" fill="white" font-size="11" font-weight="600" text-anchor="middle">S3</text>',
    '    <text x="100" y="218" fill="#94a3b8" font-size="8" text-anchor="middle">• assets-cdn</text>',
    '    <text x="100" y="232" fill="#94a3b8" font-size="8" text-anchor="middle">• logs-archive</text>',
    '    <text x="100" y="246" fill="#fbbf24" font-size="7" text-anchor="middle">Versioned + Encrypted</text>',

    '    <rect class="comp-stroke" data-component="users" x="50" y="340" width="100" height="50" rx="6" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1.5"/>',
    '    <text x="100" y="362" fill="white" font-size="11" font-weight="600" text-anchor="middle">Users</text>',
    '    <text x="100" y="378" fill="#94a3b8" font-size="9" text-anchor="middle">Web / Mobile / API</text>',

    '    <rect class="comp-stroke" data-component="cloudfront" x="190" y="340" width="100" height="50" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"/>',
    '    <text x="240" y="362" fill="white" font-size="11" font-weight="600" text-anchor="middle">CloudFront</text>',
    '    <text x="240" y="378" fill="#94a3b8" font-size="9" text-anchor="middle">CDN + Edge</text>',

    '    <rect class="comp-stroke" data-component="waf" x="350" y="340" width="100" height="50" rx="6" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1.5"/>',
    '    <text x="400" y="362" fill="white" font-size="11" font-weight="600" text-anchor="middle">WAF</text>',
    '    <text x="400" y="378" fill="#94a3b8" font-size="9" text-anchor="middle">Rate Limit + DDoS</text>',

    '    <rect class="comp-stroke" data-component="alb" x="510" y="340" width="100" height="50" rx="6" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"/>',
    '    <text x="560" y="362" fill="white" font-size="11" font-weight="600" text-anchor="middle">ALB</text>',
    '    <text x="560" y="378" fill="#94a3b8" font-size="9" text-anchor="middle">HTTPS :443 • 50K qps</text>',

    '    <rect class="comp-stroke" data-component="auth" x="350" y="280" width="100" height="40" rx="6" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1.5"/>',
    '    <text x="400" y="304" fill="white" font-size="11" font-weight="600" text-anchor="middle">Auth Service</text>',
    '    <text x="400" y="314" fill="#94a3b8" font-size="7" text-anchor="middle">OAuth2 + OIDC</text>',

    '    <rect class="comp-stroke" data-component="api-gateway" x="670" y="280" width="100" height="130" rx="8" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1.5" filter="url(#shadow-sm)"/>',
    '    <text x="720" y="306" fill="white" font-size="12" font-weight="600" text-anchor="middle">API Gateway</text>',
    '    <text x="720" y="326" fill="#94a3b8" font-size="8" text-anchor="middle">• Auth middleware</text>',
    '    <text x="720" y="342" fill="#94a3b8" font-size="8" text-anchor="middle">• Rate limiting</text>',
    '    <text x="720" y="358" fill="#94a3b8" font-size="8" text-anchor="middle">• Request routing</text>',
    '    <text x="720" y="374" fill="#94a3b8" font-size="8" text-anchor="middle">• Schema validation</text>',
    '    <text x="720" y="390" fill="#94a3b8" font-size="8" text-anchor="middle">• Circuit breaker</text>',
    '    <text x="720" y="406" fill="#34d399" font-size="7" text-anchor="middle">×3 instances • Auto-scale</text>',

    '    <rect class="comp-stroke" data-component="user-service" x="920" y="340" width="100" height="50" rx="6" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1.5"/>',
    '    <text x="970" y="362" fill="white" font-size="11" font-weight="600" text-anchor="middle">User Service</text>',
    '    <text x="970" y="378" fill="#94a3b8" font-size="9" text-anchor="middle">Go :8080 • ×2</text>',

    '    <rect class="comp-stroke" data-component="order-service" x="920" y="410" width="100" height="40" rx="6" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1.5"/>',
    '    <text x="970" y="430" fill="white" font-size="11" font-weight="600" text-anchor="middle">Order Service</text>',
    '    <text x="970" y="444" fill="#94a3b8" font-size="8" text-anchor="middle">Go :8081 • ×2</text>',

    '    <rect class="comp-stroke" data-component="payment-service" x="920" y="460" width="100" height="40" rx="6" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1.5"/>',
    '    <text x="970" y="480" fill="white" font-size="11" font-weight="600" text-anchor="middle">Payment Svc</text>',
    '    <text x="970" y="494" fill="#94a3b8" font-size="8" text-anchor="middle">Go :8082 • ×1</text>',

    '    <rect class="comp-stroke" data-component="redis" x="800" y="540" width="80" height="50" rx="6" fill="rgba(76, 29, 149, 0.4)" stroke="#a78bfa" stroke-width="1.5"/>',
    '    <text x="840" y="562" fill="white" font-size="11" font-weight="600" text-anchor="middle">Redis</text>',
    '    <text x="840" y="578" fill="#94a3b8" font-size="9" text-anchor="middle">Cluster • 3 nodes</text>',

    '    <rect class="comp-stroke" data-component="postgresql" x="920" y="520" width="200" height="40" rx="8" fill="rgba(76, 29, 149, 0.4)" stroke="#a78bfa" stroke-width="1.5"/>',
    '    <text x="1020" y="540" fill="white" font-size="11" font-weight="600" text-anchor="middle">PostgreSQL</text>',
    '    <text x="1020" y="554" fill="#94a3b8" font-size="8" text-anchor="middle">RDS Multi-AZ • Read Replicas</text>',

    '    <rect class="comp-stroke" data-component="kafka" x="920" y="570" width="200" height="30" rx="4" fill="rgba(251, 146, 60, 0.3)" stroke="#fb923c" stroke-width="1.5"/>',
    '    <text x="1020" y="590" fill="white" font-size="11" font-weight="600" text-anchor="middle">Kafka</text>',

    '    <rect class="comp-stroke" data-component="notification" x="690" y="540" width="100" height="50" rx="6" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1.5"/>',
    '    <text x="740" y="562" fill="white" font-size="11" font-weight="600" text-anchor="middle">Notification</text>',
    '    <text x="740" y="578" fill="#94a3b8" font-size="9" text-anchor="middle">Worker</text>',

    '    <rect class="comp-stroke" data-component="sendgrid" x="690" y="640" width="120" height="50" rx="6" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1.5"/>',
    '    <text x="750" y="662" fill="white" font-size="11" font-weight="600" text-anchor="middle">SendGrid</text>',
    '    <text x="750" y="678" fill="#94a3b8" font-size="9" text-anchor="middle">Email Delivery</text>',

    '    <rect class="comp-stroke" data-component="stripe" x="920" y="640" width="100" height="50" rx="6" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1.5"/>',
    '    <text x="970" y="662" fill="white" font-size="11" font-weight="600" text-anchor="middle">Stripe</text>',
    '    <text x="970" y="678" fill="#94a3b8" font-size="9" text-anchor="middle">Payments API</text>',

    '    <rect class="comp-stroke" data-component="observability" x="1120" y="80" width="100" height="160" rx="8" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1.5"/>',
    '    <text x="1170" y="106" fill="white" font-size="12" font-weight="600" text-anchor="middle">Observability</text>',
    '    <text x="1170" y="128" fill="#94a3b8" font-size="8" text-anchor="middle">• Grafana</text>',
    '    <text x="1170" y="144" fill="#94a3b8" font-size="8" text-anchor="middle">• Prometheus</text>',
    '    <text x="1170" y="160" fill="#94a3b8" font-size="8" text-anchor="middle">• OpenTelemetry</text>',
    '    <text x="1170" y="176" fill="#94a3b8" font-size="8" text-anchor="middle">• ELK Stack</text>',
    '    <text x="1170" y="192" fill="#94a3b8" font-size="8" text-anchor="middle">• PagerDuty</text>',
    '    <text x="1170" y="212" fill="#94a3b8" font-size="8" text-anchor="middle">• CloudWatch</text>',
    '    <text x="1170" y="232" fill="#fbbf24" font-size="7" text-anchor="middle">5s scrape interval</text>',
    '  </g>',

    /* ── 6. BOUNDARIES ── */
    '  <rect class="svg-boundary" x="340" y="268" width="120" height="65" rx="8" fill="transparent" stroke="#fb7185" stroke-width="1" stroke-dasharray="4,4"/>',
    '  <text x="350" y="282" fill="#fb7185" font-size="8">sg-auth :443</text>',

    '  <rect class="svg-boundary" x="660" y="268" width="390" height="250" rx="10" fill="rgba(251, 113, 133, 0.03)" stroke="#fb7185" stroke-width="1" stroke-dasharray="4,4"/>',
    '  <text x="672" y="284" fill="#fb7185" font-size="9" font-weight="600">VPC: Services (10.0.0.0/16)</text>',
    '  <text x="672" y="298" fill="#fb7185" font-size="8">sg-services :3000-8082</text>',

    '  <rect class="svg-boundary" x="790" y="508" width="340" height="105" rx="10" fill="rgba(251, 113, 133, 0.03)" stroke="#fb7185" stroke-width="1" stroke-dasharray="4,4"/>',
    '  <text x="802" y="524" fill="#fb7185" font-size="9" font-weight="600">VPC: Data (10.0.1.0/24)</text>',
    '  <text x="802" y="538" fill="#fb7185" font-size="8">sg-data :5432 :6379 :9092</text>',

    '  <rect class="svg-boundary" x="30" y="60" width="1220" height="650" rx="14" fill="rgba(251, 191, 36, 0.04)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,4"/>',
    '  <text x="46" y="82" fill="#fbbf24" font-size="11" font-weight="600">AWS Region: us-east-1</text>',

    /* ── 7. LEGEND ── */
    '  <text x="50" y="730" fill="white" font-size="11" font-weight="600">Legend</text>',
    '  <rect x="50" y="744" width="18" height="12" rx="3" fill="rgba(8, 51, 68, 0.4)" stroke="#22d3ee" stroke-width="1"/>',
    '  <text x="76" y="754" fill="#94a3b8" font-size="9">Frontend / CDN</text>',
    '  <rect x="200" y="744" width="18" height="12" rx="3" fill="rgba(6, 78, 59, 0.4)" stroke="#34d399" stroke-width="1"/>',
    '  <text x="226" y="754" fill="#94a3b8" font-size="9">Backend Service</text>',
    '  <rect x="380" y="744" width="18" height="12" rx="3" fill="rgba(76, 29, 149, 0.4)" stroke="#a78bfa" stroke-width="1"/>',
    '  <text x="406" y="754" fill="#94a3b8" font-size="9">Database / Cache</text>',
    '  <rect x="560" y="744" width="18" height="12" rx="3" fill="rgba(120, 53, 15, 0.3)" stroke="#fbbf24" stroke-width="1"/>',
    '  <text x="586" y="754" fill="#94a3b8" font-size="9">Cloud / AWS</text>',
    '  <rect x="740" y="744" width="18" height="12" rx="3" fill="rgba(136, 19, 55, 0.4)" stroke="#fb7185" stroke-width="1"/>',
    '  <text x="766" y="754" fill="#94a3b8" font-size="9">Security / Auth</text>',
    '  <rect x="50" y="768" width="18" height="12" rx="3" fill="rgba(251, 146, 60, 0.3)" stroke="#fb923c" stroke-width="1"/>',
    '  <text x="76" y="778" fill="#94a3b8" font-size="9">Message Bus / Events</text>',
    '  <rect x="280" y="768" width="18" height="12" rx="3" fill="rgba(30, 41, 59, 0.5)" stroke="#94a3b8" stroke-width="1"/>',
    '  <text x="306" y="778" fill="#94a3b8" font-size="9">External / 3rd Party</text>',
    '  <rect x="500" y="768" width="18" height="12" rx="3" fill="transparent" stroke="#fb7185" stroke-width="1" stroke-dasharray="4,4"/>',
    '  <text x="526" y="778" fill="#94a3b8" font-size="9">Security Group</text>',
    '  <rect x="700" y="768" width="18" height="12" rx="3" fill="rgba(251, 191, 36, 0.05)" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,4"/>',
    '  <text x="726" y="778" fill="#94a3b8" font-size="9">Region / Boundary</text>',

    '  <text x="50" y="800" fill="#64748b" font-size="9" font-weight="600">Line Styles</text>',
    '  <line x1="50" y1="812" x2="100" y2="812" stroke="#34d399" stroke-width="1.5"/>',
    '  <text x="110" y="816" fill="#94a3b8" font-size="9">Sync (REST/gRPC)</text>',
    '  <line x1="280" y1="812" x2="330" y2="812" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="4,3"/>',
    '  <text x="340" y="816" fill="#94a3b8" font-size="9">Async (Pub/Sub)</text>',
    '  <line x1="510" y1="812" x2="560" y2="812" stroke="#fb7185" stroke-width="1.5" stroke-dasharray="5,5"/>',
    '  <text x="570" y="816" fill="#94a3b8" font-size="9">Auth / Security</text>',
    '  <line x1="740" y1="812" x2="790" y2="812" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="6,4"/>',
    '  <text x="800" y="816" fill="#94a3b8" font-size="9">Infra / Deploy</text>',
    '  <line x1="950" y1="812" x2="1000" y2="812" stroke="#64748b" stroke-width="1" stroke-dasharray="2,2"/>',
    '  <text x="1010" y="816" fill="#94a3b8" font-size="9">Telemetry</text>',
    '</svg>'
  ].join('\n');

  /* ─────────────────────────────────────────────────────────────────
     DATA OBJECT — exposed as window.REPORT_DATA
     ───────────────────────────────────────────────────────────────── */
  window.REPORT_DATA = {
    meta: {
      title: 'Microservices Platform Architecture Diagram',
      pageTitle: 'Microservices Platform — Cloud-Native Architecture',
      subtitle: 'Multi-service e-commerce platform on AWS with event-driven communication, comprehensive observability, and CI/CD automation',
      footer: 'Microservices Platform • AWS us-east-1 • Go + PostgreSQL + Kafka • v2.3.0 • Updated 2026-07-14',
      traceSub: 'end-to-end p95 ≤ 380ms'
    },

    executiveSummary: [
      { color: 'cyan',    title: '▸ System Scope',        content: 'Cloud-native microservices platform serving 500K+ daily active users across web, mobile, and API channels. Processes 12K requests/sec with p95 latency under 200ms end-to-end.' },
      { color: 'emerald', title: '▸ Architecture Style',  content: 'Hybrid cloud-native: CDN edge → API Gateway → domain microservices → polyglot persistence. Event-driven communication via Kafka for async workflows. CI/CD with canary deployments.' },
      { color: 'violet',  title: '▸ Key Decisions',       content: 'Go chosen for service performance (sub-ms GC pauses). PostgreSQL over NoSQL for ACID compliance on payment data. Kafka over SQS for ordered event replay and long-term retention.' }
    ],

    toc: [
      { href: '#diagram',   icon: '📐', label: 'Diagram' },
      { href: '#metrics',   icon: '📊', label: 'Metrics' },
      { href: '#summary',   icon: '📋', label: 'Summary' },
      { href: '#pipeline',  icon: '🚀', label: 'Pipeline' },
      { href: '#security',  icon: '🔒', label: 'Security' },
      { href: '#trace',     icon: '🔍', label: 'Trace' },
      { href: '#scaling',   icon: '⚖️', label: 'Scaling' },
      { href: '#ownership', icon: '👥', label: 'Teams' },
      { href: '#api',       icon: '📡', label: 'API' },
      { href: '#stack',     icon: '🧰', label: 'Stack' },
      { href: '#schema',    icon: '🗄️', label: 'Schema' },
      { href: '#roadmap',   icon: '🔮', label: 'Roadmap' }
    ],

    metrics: [
      { label: 'Uptime (30d)',     status: 'green', value: '99.97%',  valueClass: 'green',  sub: 'SLA target: 99.95%' },
      { label: 'Requests / sec',   status: null,    value: '12.4K',   valueClass: 'cyan',   sub: 'peak: 28K • p95 ≤ 200ms' },
      { label: 'Error Rate (24h)', status: null,    value: '0.07%',   valueClass: 'amber',  sub: 'threshold: 0.1% • 5xx + 4xx' },
      { label: 'Deploy Frequency', status: null,    value: '8 / week', valueClass: 'violet', sub: 'canary rollout • mean MTTR 12m' },
      { label: 'Active Alerts',    status: null,    value: '0',       valueClass: 'rose',   sub: 'PagerDuty • 5min escalation' }
    ],

    svgDiagram: svgDiagram,

    summaryCards: [
      {
        color: 'cyan',
        title: 'Architecture & Scaling',
        items: [
          'API Gateway (×3 instances, auto-scaling) serves as the single entry point — routing REST, gRPC, and WebSocket traffic with circuit breaker protection',
          'Three Go microservices — User (×2), Order (×2), and Payment (×1) — each isolated in VPC security groups with dedicated ports and health checks',
          'CloudFront CDN at 50K qps capacity with integrated WAF for DDoS protection, bot mitigation, and per-IP rate limiting',
          'Auth Service enforces OAuth2 + OIDC with JWT validation at the gateway middleware; all inter-service traffic uses mTLS',
          'S3 stores static assets and log archives with SSE-KMS encryption, cross-region replication, and lifecycle policies'
        ]
      },
      {
        color: 'emerald',
        title: 'Data Flow & Performance',
        items: [
          'Critical path latency: Edge (p95 ≤ 120ms) → ALB (p95 ≤ 45ms) → API Gateway → User Service (p95 ≤ 18ms) → PostgreSQL (p95 ≤ 8ms)',
          'Order events published to Kafka (3-node cluster) and consumed asynchronously by Notification Worker; email delivery via SendGrid SMTP',
          'Redis Cluster (3 nodes) caches user sessions with write-through invalidation; hit rate target ≥ 95% at 10K reads/sec',
          'Payment Service integrates Stripe API with idempotency keys; transaction records persisted to PostgreSQL with ACID guarantees',
          'All database connections use TLS 1.3 within the secured VPC data layer (10.0.1.0/24); connection pooling at 200 conns/pool'
        ]
      },
      {
        color: 'violet',
        title: 'Reliability & Observability',
        items: [
          'PostgreSQL RDS Multi-AZ with 2 read replicas; automated failover < 60s; point-in-time recovery with 35-day retention',
          'GitHub Actions CI/CD: build → test → ECR push → ECS deploy with canary rollout (10% → 50% → 100%) and automated rollback on alarm',
          'Observability stack: Grafana dashboards (20+ panels), Prometheus (5s scrape), OpenTelemetry tracing (100% sampling), ELK log aggregation (7-day retention)',
          'SLA targets: 99.95% API availability, p95 response < 200ms, error rate < 0.1%; PagerDuty on-call with 5min escalation'
        ]
      }
    ],

    pipeline: [
      { badge: 'Dev',         badgeClass: 'dev',  info: 'Push to feature branch' },
      { badge: 'CI',          badgeClass: 'dev',  info: 'Lint • Test • Build image' },
      { badge: 'Staging',     badgeClass: 'stg',  info: 'Deploy to ECS staging<br/>Integration + E2E tests' },
      { badge: 'Canary 10%',  badgeClass: 'stg',  info: 'Traffic shift • 10min bake' },
      { badge: 'Canary 50%',  badgeClass: 'stg',  info: 'Monitor p95 + errors' },
      { badge: 'Production',  badgeClass: 'prod', info: '100% traffic<br/>Auto-rollback on alarm' }
    ],

    securityCards: [
      {
        color: 'rose',
        title: 'Encryption & Secrets',
        items: [
          'In-transit: TLS 1.3 enforced for all external and inter-service communication; mTLS within service mesh',
          'At-rest: AES-256-GCM for RDS, S3 (SSE-KMS with customer-managed keys), EBS volumes',
          'Secrets managed via AWS Secrets Manager with automatic 30-day rotation; no hardcoded credentials',
          'KMS key policy enforces least-privilege; CloudTrail audits all key usage'
        ]
      },
      {
        color: 'amber',
        title: 'Network & Access',
        items: [
          'VPC isolation: Services (10.0.0.0/16), Data (10.0.1.0/24) — no public subnets for data tier',
          'Security groups follow least-privilege: only required ports open between specific CIDR ranges',
          'WAF rules: OWASP Top 10 mitigation, IP reputation, geo-blocking (allowlist: US, EU, APAC)',
          'IAM: role-based access with temporary credentials (STS); no long-lived IAM user keys'
        ]
      },
      {
        color: 'orange',
        title: 'Compliance & Audit',
        items: [
          'Framework alignment: SOC 2 Type II, GDPR (EU data residency in eu-west-1), PCI-DSS (payment tier)',
          'Audit logging: CloudTrail (API calls), VPC Flow Logs (network), RDS audit logs (DB queries)',
          'Vulnerability scanning: ECR image scanning on push + weekly Trivy scans with Slack notifications',
          'Incident response: PagerDuty on-call rotation, 5-min ack SLA, automated rollback via CloudWatch alarm'
        ]
      }
    ],

    trace: [
      { name: '1. DNS/TLS', nameClass: 'cyan',    sub: 'CloudFront',    time: '~80ms' },
      { name: '2. WAF',     nameClass: 'cyan',    sub: 'Rule check',    time: '~12ms' },
      { name: '3. ALB',     nameClass: 'cyan',    sub: 'Route :443',    time: '~8ms'  },
      { name: '4. Gateway', nameClass: 'emerald', sub: 'Auth + Validate', time: '~45ms' },
      { name: '5. Order Svc', nameClass: 'emerald', sub: 'Business logic', time: '~65ms' },
      { name: '6. DB Write', nameClass: 'violet', sub: 'INSERT order',  time: '~18ms' },
      { name: '7. Event',   nameClass: 'orange',  sub: 'Kafka pub',     time: '~35ms' },
      { name: '8. 200 OK',  nameClass: 'emerald', sub: 'JSON response', time: '~17ms' }
    ],

    scalingTiles: [
      {
        color: 'cyan',
        title: 'API Gateway Auto-Scaling',
        body: '<span style="color: var(--text-muted);">Metric:</span> CPU ≥ 70% OR RequestCount ≥ 5K/min<br/>' +
              '<span style="color: var(--text-muted);">Policy:</span> +2 instances, 5min cooldown<br/>' +
              '<span style="color: var(--text-muted);">Range:</span> Min 2 • Desired 3 • Max 8<br/>' +
              '<span style="color: var(--text-muted);">Scale-in:</span> CPU ≤ 30% for 10min → −1'
      },
      {
        color: 'emerald',
        title: 'Service Tier Scaling',
        body: '<span style="color: var(--text-muted);">User/Order:</span> CPU ≥ 60% → +1 (max 4)<br/>' +
              '<span style="color: var(--text-muted);">Payment:</span> Fixed ×1 (compliance)<br/>' +
              '<span style="color: var(--text-muted);">Notification:</span> Queue depth ≥ 1K → +1<br/>' +
              '<span style="color: var(--text-muted);">Warm-up:</span> 30s grace period per instance'
      },
      {
        color: 'violet',
        title: 'Database Resilience',
        body: '<span style="color: var(--text-muted);">RDS:</span> Multi-AZ • Auto-failover ≤ 60s<br/>' +
              '<span style="color: var(--text-muted);">Backup:</span> Daily snapshots • 35-day PITR<br/>' +
              '<span style="color: var(--text-muted);">Redis:</span> Cluster mode • Auto-failover<br/>' +
              '<span style="color: var(--text-muted);">Kafka:</span> 3 brokers • RF=3 • min.insync=2'
      },
      {
        color: 'rose',
        title: 'Disaster Recovery',
        body: '<span style="color: var(--text-muted);">RPO:</span> 5 minutes (cross-region replication)<br/>' +
              '<span style="color: var(--text-muted);">RTO:</span> 30 minutes (automated failover)<br/>' +
              '<span style="color: var(--text-muted);">DR Region:</span> us-west-2 (warm standby)<br/>' +
              '<span style="color: var(--text-muted);">Test:</span> Quarterly failover drill'
      }
    ],

    ownership: {
      headers: ['Service', 'Team', 'Tier', 'SLA', 'On-Call', 'Runbook'],
      rows: [
        ['<span style="color: var(--color-frontend);">API Gateway</span>', 'Platform',  '<span style="color: var(--color-backend);">Tier 0</span>', '99.95%', 'Primary: Alice • Secondary: Bob',    '<span style="color: var(--text-dim);">/ops/gateway</span>'],
        ['<span style="color: var(--color-backend);">User Service</span>',  'Identity',  '<span style="color: var(--color-backend);">Tier 1</span>', '99.9%',  'Primary: Carol • Secondary: Dave',   '<span style="color: var(--text-dim);">/ops/user-svc</span>'],
        ['<span style="color: var(--color-backend);">Order Service</span>', 'Commerce',  '<span style="color: var(--color-backend);">Tier 1</span>', '99.9%',  'Primary: Eve • Secondary: Frank',    '<span style="color: var(--text-dim);">/ops/order-svc</span>'],
        ['<span style="color: var(--color-backend);">Payment Svc</span>',   'Commerce',  '<span style="color: var(--color-cloud);">Tier 1</span>',   '99.95%', 'Primary: Eve • Escalation: Legal',   '<span style="color: var(--text-dim);">/ops/payment-svc</span>'],
        ['<span style="color: var(--color-security);">Auth Service</span>', 'Identity',  '<span style="color: var(--color-backend);">Tier 0</span>', '99.95%', 'Primary: Carol • SecOps backup',     '<span style="color: var(--text-dim);">/ops/auth-svc</span>'],
        ['<span style="color: var(--color-database);">PostgreSQL</span>',   'Platform',  '<span style="color: var(--color-backend);">Tier 0</span>', '99.95%', 'Primary: Bob • AWS Support',         '<span style="color: var(--text-dim);">/ops/rds</span>']
      ]
    },

    apiTable: {
      headers: ['Method', 'Path', 'Service', 'Auth', 'Rate Limit', 'Description'],
      /* Each row is { method, path, service, auth, rate, desc }.
         The template applies the `mono` class to the path <td> and the
         `muted` class to the description <td> for visual parity with
         the original inline-style markup. */
      rows: [
        { method: 'GET',   color: 'backend',  path: '/api/v1/users/:id',       service: 'User Service',  auth: 'JWT (read)',  rate: '100/min',   desc: 'Fetch user profile by ID' },
        { method: 'POST',  color: 'cloud',    path: '/api/v1/orders',           service: 'Order Service', auth: 'JWT + scope', rate: '30/min',    desc: 'Create new order (idempotent)' },
        { method: 'PATCH', color: 'frontend', path: '/api/v1/orders/:id',       service: 'Order Service', auth: 'JWT + owner', rate: '60/min',    desc: 'Update order status or details' },
        { method: 'POST',  color: 'backend',  path: '/api/v1/payments/charge',  service: 'Payment Svc',   auth: 'JWT + mTLS',  rate: '10/min',    desc: 'Authorize and capture payment' },
        { method: 'GET',   color: 'backend',  path: '/api/v1/health',           service: 'Gateway',       auth: 'None',        rate: '1000/min',  desc: 'Aggregated health check (all services)' },
        { method: 'WS',    color: 'security', path: '/ws/v1/events',            service: 'Gateway',       auth: 'JWT + upgrade', rate: '50 conn/IP', desc: 'Real-time order status stream' }
      ]
    },

    stack: [
      { label: 'Go',          value: '1.22', valueClass: 'cyan'   },
      { label: 'PostgreSQL',  value: '16.2', valueClass: 'violet' },
      { label: 'Redis',       value: '7.2',  valueClass: 'rose'   },
      { label: 'Kafka',       value: '3.7',  valueClass: 'orange' },
      { label: 'TypeScript',  value: '5.4',  valueClass: 'cyan'   },
      { label: 'React',       value: '18.3', valueClass: 'cyan'   },
      { label: 'Docker',      value: '26.x', valueClass: 'amber'  },
      { label: 'Terraform',   value: '1.8',  valueClass: 'amber'  },
      { label: 'Prometheus',  value: '2.52', valueClass: 'orange' },
      { label: 'Grafana',     value: '11.0', valueClass: 'orange' }
    ],

    schemaTiles: [
      {
        title: 'users',
        body: '<span style="color: var(--color-cloud);">PK</span> id UUID<br/>' +
              'email VARCHAR(255) UNIQUE<br/>' +
              'name VARCHAR(255)<br/>' +
              'created_at TIMESTAMP<br/>' +
              '<span style="color: var(--text-dim);">→ orders.user_id</span>'
      },
      {
        title: 'orders',
        body: '<span style="color: var(--color-cloud);">PK</span> id UUID<br/>' +
              '<span style="color: var(--color-cloud);">FK</span> user_id → users<br/>' +
              'status ENUM(\'pending\',\'paid\',\'cancelled\')<br/>' +
              'total DECIMAL(10,2)<br/>' +
              '<span style="color: var(--text-dim);">→ payments.order_id</span>'
      },
      {
        title: 'payments',
        body: '<span style="color: var(--color-cloud);">PK</span> id UUID<br/>' +
              '<span style="color: var(--color-cloud);">FK</span> order_id → orders<br/>' +
              'stripe_charge_id VARCHAR(255)<br/>' +
              'amount DECIMAL(10,2)<br/>' +
              'status ENUM(\'auth\',\'captured\',\'refunded\')'
      },
      {
        title: 'sessions',
        body: '<span style="color: var(--color-cloud);">PK</span> token VARCHAR(512)<br/>' +
              'user_id UUID<br/>' +
              'expires_at TIMESTAMP<br/>' +
              '<span style="color: var(--text-dim);">Redis-backed cache</span><br/>' +
              '<span style="color: var(--text-dim);">TTL: 24h</span>'
      },
      {
        title: 'outbox',
        body: '<span style="color: var(--color-cloud);">PK</span> id BIGSERIAL<br/>' +
              'aggregate_id UUID<br/>' +
              'event_type VARCHAR(100)<br/>' +
              'payload JSONB<br/>' +
              '<span style="color: var(--text-dim);">processed BOOL DEFAULT false</span>'
      }
    ],

    roadmap: [
      { tag: 'Q3\'26', tagClass: 'q3',   text: 'Service mesh migration (Istio → Linkerd)',                textClass: '' },
      { tag: 'Q3\'26', tagClass: 'q3',   text: 'Payment Service split: Stripe + PayPal adapters',        textClass: '' },
      { tag: 'Q4\'26', tagClass: 'q4',   text: 'Event sourcing for Order domain (Kafka log compaction)', textClass: '' },
      { tag: 'Q4\'26', tagClass: 'q4',   text: 'Multi-region active-active (us-east-1 + eu-west-1)',     textClass: '' },
      { tag: 'Debt',   tagClass: 'debt', text: 'User Service: migrate remaining REST endpoints to gRPC', textClass: 'muted' },
      { tag: 'Debt',   tagClass: 'debt', text: 'Consolidate 3 monitoring dashboards into 1 unified Grafana view', textClass: 'muted' }
    ],

    glossary: [
      { term: 'ALB',         termClass: 'cyan',    def: 'Application Load Balancer, L7 routing' },
      { term: 'WAF',         termClass: 'cyan',    def: 'Web Application Firewall, OWASP rules' },
      { term: 'gRPC',        termClass: 'emerald', def: 'High-performance RPC over HTTP/2 + Protobuf' },
      { term: 'JWT',         termClass: 'emerald', def: 'JSON Web Token, stateless authentication' },
      { term: 'Kafka',       termClass: 'orange',  def: 'Distributed event streaming platform' },
      { term: 'WSS',         termClass: 'orange',  def: 'WebSocket Secure, real-time bidirectional' },
      { term: 'PITR',        termClass: 'violet',  def: 'Point-In-Time Recovery, DB backup strategy' },
      { term: 'Multi-AZ',    termClass: 'violet',  def: 'Multi Availability Zone, HA deployment' },
      { term: 'ECR',         termClass: 'amber',   def: 'Elastic Container Registry, Docker images' },
      { term: 'ECS',         termClass: 'amber',   def: 'Elastic Container Service, container orchestration' },
      { term: 'mTLS',        termClass: 'rose',    def: 'Mutual TLS, bidirectional certificate verification' },
      { term: 'OIDC',        termClass: 'rose',    def: 'OpenID Connect, identity layer on OAuth2' },
      { term: 'RPO',         termClass: '',        def: 'Recovery Point Objective, max data loss' },
      { term: 'RTO',         termClass: '',        def: 'Recovery Time Objective, max downtime' },
      { term: 'SLA',         termClass: '',        def: 'Service Level Agreement, availability target' },
      { term: 'MTTR',        termClass: '',        def: 'Mean Time To Recovery, avg incident duration' },
      { term: 'CSS Theme',   termClass: '',        def: '18 custom properties in <span style="font-family: var(--font-mono); color: var(--text-muted);">:root</span> enable one-click re-theming of the entire diagram' }
    ]
  };
})();
