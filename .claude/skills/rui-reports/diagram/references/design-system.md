# Architecture Diagram — Design System

> The visual language used by the 4-file split under `templates/` (entry point: `templates/index.html`). Use this when filling placeholders or extending the template.

## Color Palette

| Component Type | Fill (rgba) | Stroke | Use for |
|----------------|-------------|--------|---------|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan) | Browser apps, SPAs, mobile clients, CDN edge |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald) | API servers, workers, business logic, gateways |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet) | SQL/NoSQL databases, caches, message queues |
| AWS/Cloud | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber) | Cloud-managed services (ECR, S3, Lambda, ALB, CloudFront) |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose) | Auth providers, WAFs, secret managers, IAM |
| Message Bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange) | Kafka, RabbitMQ, SQS, SNS, EventBridge |
| External/Generic | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate) | End users, third-party APIs (Stripe, SendGrid, Twilio) |
| Inactive | `rgba(15, 23, 42, 0.5)` | `#475569` | Disabled components, deprecated paths, legacy systems |

Region boundary fills use a 0.04–0.05-alpha version of the same color; boundary strokes use the full color.

### Arrow Color Semantics

| Color | Stroke | Dash Pattern | Meaning |
|-------|--------|-------------|---------|
| `#22d3ee` (cyan) | 1.5px solid | — | Frontend/CDN flow; user-facing traffic |
| `#34d399` (emerald) | 1.5px solid | — | Synchronous service-to-service calls (REST/gRPC) |
| `#a78bfa` (violet) | 1.5px solid | — | Data read/write operations (TLS-encrypted) |
| `#fbbf24` (amber) | 1.5px | `6,4` | Infrastructure provisioning, CI/CD deploy paths |
| `#fb7185` (rose) | 1.5px | `5,5` | Authentication/authorization flows (JWT, OAuth) |
| `#fb923c` (orange) | 1.5px | `4,3` | Async messaging, pub/sub, event streams |
| `#64748b` (slate) | 1px | `2,2` | Telemetry, monitoring, external API calls |

## Typography

```css
font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace;
```

| Element | Size | Weight |
|---------|------|--------|
| Page title (`h1`) | 1.5rem | 700 |
| Subtitle | 0.875rem | 400 |
| Component name | 11–12px | 600 |
| Component sublabel | 9px | 400 |
| Annotation | 8px | 400 |
| Tiny label | 7px | 400 |
| Card title (`h3`) | 0.875rem | 600 |
| Card body | 0.75rem | 400 |
| Footer | 0.75rem | 400 |

## Component Sizing Guide

| Component Role | Width | Height | rx | Notes |
|---------------|-------|--------|----|-------|
| Standard service | 100px | 50px | 6 | 2 lines of text max |
| Compact service | 80px | 40px | 6 | Dense layouts, leaf nodes |
| Gateway / Critical service | 100-120px | 80-130px | 8 | Multiple responsibilities, needs list items |
| Database cluster | 160-200px | 40-50px | 8 | Wide for read-replica labels |
| Message bus connector | 120-200px | 20-30px | 4 | Thin horizontal strip between layers |
| External service | 100-120px | 50px | 6 | Third-party APIs |
| Observability panel | 100px | 140-180px | 8 | Tall for stacked tool list |
| Cloud resource (S3, ECR) | 100px | 60-80px | 6 | Multi-line for bucket/registry names |

## Spacing Rules

- Standard component height: 60px for services, 80–120px for larger components
- Minimum vertical gap between components: 40px
- Minimum horizontal gap between components: 20px
- Inline connectors (message buses) live in the gap, never overlapping component boxes
- Standard viewBox start: 1200×800, expand if layout demands it
- Legend placed at least 20px below the lowest boundary element
- Security groups: 12px padding on all sides from enclosed components
- Region boundaries: 20px padding from outermost enclosed element

## Visual Elements

**Background:** `#020617` (slate-950) with a subtle 40px grid pattern (`<pattern id="grid">` in `<defs>`).

**Component boxes:** Rounded rectangles (`rx="6"` for standard, `rx="8"` for large/gateway components) with 1.5px stroke, semi-transparent fills, opaque mask underneath.

**Security groups:** Dashed stroke (`stroke-dasharray="4,4"`), transparent fill with optional 0.03-alpha background, rose color. Label positioned at top-left inside the boundary.

**Region boundaries:** Larger dashed stroke (`stroke-dasharray="8,4"`), amber color, `rx="14"`, 0.04-alpha fill. Label at top-left inside the boundary with bold weight.

**Arrows:** Use distinct colored SVG `<marker>` elements per connection type defined in `<defs>`. Always drawn before component boxes and opaque masks.

**Arrow markers:** Define one `<marker>` per color in `<defs>` (e.g., `arrow-cyan`, `arrow-emerald`, `arrow-violet`, `arrow-amber`, `arrow-rose`, `arrow-orange`, `arrow-slate`). Each marker has `refX="7" refY="3"` for standard 8×6 arrowheads.

**Gradients:** Use `<linearGradient>` in `<defs>` for large region fills and gateway components. Direction: diagonal (`x1="0" y1="0" x2="1" y2="1"`). Stops: 0% at 0.15 opacity → 100% at 0.05 opacity. Provides subtle depth without overwhelming the dark theme.

**Masking arrows:** Every component box needs an opaque background rect (`fill="#0f172a"`) at the exact same position and dimensions, drawn before the semi-transparent styled rect.

**Auth/security flows:** Dashed lines in rose color (`#fb7185`), `stroke-dasharray="5,5"`. Always label with the auth protocol (JWT, OAuth2, OIDC, PKCE, mTLS).

**Async/event flows:** Dashed lines in orange (`#fb923c`), `stroke-dasharray="4,3"`. Label with `publish`/`consume` or the topic name.

**Infrastructure flows:** Long-dashed lines in amber (`#fbbf24`), `stroke-dasharray="6,4"`. Label with `deploy`, `push`, `provision`, or `trigger`.

**Telemetry flows:** Thin dotted lines in slate (`#64748b`), `stroke-dasharray="2,2"`, 1px weight. Minimal labels (e.g., `metrics`, `logs`, `traces`).

**Message buses:** Small connector elements (120–200px × 20–30px) in orange between services. Centered in the gap between rows.

**Pulsing indicator:** 12px circle in cyan, 2s pulse animation, opacity 1→0.4, with `box-shadow` glow at peak.

**Multi-line components:** For database clusters, S3 buckets, and observability stacks, use bullet-point style sub-labels (`• item-name`) at 8px font size. Bottom line can carry a tiny status annotation at 7px in the stroke color.

## SVG Document Order (mandatory)

```
1. <defs>             — markers, patterns, gradients
2. Background grid    — single <rect> with fill="url(#grid)"
3. Arrows             — lines/paths with marker-end
4. Opaque masks       — solid-fill rects at every component position
5. Component boxes    — semi-transparent styled rects + labels
6. Security groups    — dashed rose rects
7. Region boundaries  — dashed amber rects (drawn AFTER components inside them)
8. Legend             — placed outside all boundaries
```

This order eliminates z-index hacks: each later element paints on top of earlier ones.

## Color Accessibility

All stroke colors meet WCAG AA contrast (≥ 3:1) against the `#020617` background at normal text sizes. Labels use white (`#ffffff`, contrast 18.7:1) or `#94a3b8` (slate-400, contrast 6.2:1) for readability.

| Stroke Color | Against #020617 | AA Normal Text | AA Large Text |
|-------------|-----------------|----------------|---------------|
| `#22d3ee` (cyan) | 11.2:1 | ✅ Pass | ✅ Pass |
| `#34d399` (emerald) | 9.8:1 | ✅ Pass | ✅ Pass |
| `#a78bfa` (violet) | 6.5:1 | ✅ Pass | ✅ Pass |
| `#fbbf24` (amber) | 12.3:1 | ✅ Pass | ✅ Pass |
| `#fb7185` (rose) | 4.8:1 | ✅ Pass | ✅ Pass |
| `#fb923c` (orange) | 5.1:1 | ✅ Pass | ✅ Pass |
| `#94a3b8` (slate-400) | 6.2:1 | ✅ Pass | ✅ Pass |
| `#475569` (slate-600) | 3.8:1 | ⚠️ Large only | ✅ Pass |

**Guidelines for label colors:**
- Primary labels (component names): always `#ffffff` (white) for maximum contrast
- Secondary labels (tech/port info): `#94a3b8` — sufficient for 9px+ text
- Tiny annotations (7-8px): `#475569` acceptable for short labels; prefer `#64748b` for better readability
- Arrow labels: `#94a3b8` for standard; use the arrow's stroke color for emphasis (e.g., `#fb7185` for auth flows)
- Footer/legend text: `#475569` at 9px+ is sufficient for non-critical metadata

**Color-blind safe palettes:**
- Red-green colorblind (deuteranopia): cyan/amber/violet remain distinguishable from emerald/rose when paired with shape and label cues
- Blue-yellow colorblind (tritanopia): all palette colors remain distinct
- Always pair color with a secondary indicator: component shape (rx value), label text, or legend position

## Layout Patterns

### Linear flow (left → right)
- Components in a single row or staggered rows
- Arrows flow right with slight vertical jitter
- Best for: simple request/response chains, pipeline visualizations, API → DB flows
- Max 5-6 components per row to avoid horizontal scroll

### Layered (top → bottom)
- Each layer is a horizontal band separated by ≥40px
- Components grouped within layers; intra-layer arrows are horizontal
- Cross-layer arrows are vertical or diagonal
- Best for: n-tier architectures, layered systems, OSI-like stacks
- Tip: Put entry points at top, data stores at bottom

### Hub-and-spoke
- One central service (the hub) with surrounding clients/services arranged radially
- Arrows radiate from the hub center to each spoke
- Best for: API gateways, message brokers, service meshes, monoliths
- Tip: The hub should be visually prominent (larger box, more detail)

### Mesh / Microservices
- Multiple interconnected services without a single clear flow direction
- Edges grouped to reduce crossing; use message bus connectors for event streams
- Best for: microservices architectures, event-driven systems, domain-driven designs
- Tip: Group by domain boundary; use security groups to delineate bounded contexts

### Hybrid (Cloud-native)
- Edge/CDN layer at top-left → security perimeter → core services → data layer
- Infrastructure/CI-CD column on the left side
- Observability column on the right side
- External services at the bottom
- Best for: modern cloud deployments with DevOps practices
- This is the **recommended default** for most production system diagrams

### Infrastructure-Overlay
- Main application flow in the center
- CI/CD pipeline shown as a vertical column on the left
- Monitoring/observability stack as a vertical column on the right
- Data stores and external services at the bottom
- Best for: DevOps-oriented documentation, onboarding diagrams

## Summary Cards

Always exactly 3 cards. Each card has:
- Colored dot (cyan, amber, violet, rose, or emerald) — color encodes category
- Title (1 line)
- 3–5 bullet items (1 line each, max)

Cards pull from the top 3 layers' descriptions (codebase mode) or the user's brief (requirements mode).

## Toolbar

The export toolbar (three-dot `⋯` button) expands into:
- 📋 Copy — high-DPI PNG to clipboard (via `html2canvas` + Clipboard API)
- 🖼️ PNG — download PNG
- 📄 PDF — download PDF (via `jsPDF`)

All three operations use a `html2canvas` snapshot of the `report-container` element at `scale: 2` for retina-quality output. CDN dependencies:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

## Advanced Techniques

### Curved Connection Paths
For complex flows that need to route around components, use SVG `<path>` with cubic bezier curves:
```svg
<path d="M x1 y1 L xCtrl y1 Q xCtrl yCtrl xCtrl yCtrl L x2 y2"
      fill="none" stroke="color" stroke-width="1.5" stroke-dasharray="X,Y"
      marker-end="url(#arrow-color)"/>
```
Use `Q` (quadratic) for single-bend paths and `C` (cubic) for S-curves.

### Multi-line Component Annotations
For components with many details (API Gateway, database clusters):
- Main label: 12px bold at vertical center − 10px
- Bullet items: 8px, one per line, `•` prefix, 16px line spacing
- Footer annotation: 7px in the stroke color at the bottom

### Security Group Nesting
Security groups can nest inside region boundaries but should NOT overlap each other. Draw the outermost boundary first in the SVG document order, then inner boundaries.

### Legend Structure
A comprehensive legend has TWO sections:
1. **Component types** — colored swatches with labels, arranged in 2-3 columns
2. **Line styles** — sample lines with labels, arranged in 2 columns

Both sections use 9px font. Line style samples should be ~50px long strokes at actual diagram weight.

### viewBox Calculation
Calculate viewBox dimensions dynamically:
- `width` = max(rightmost element x + width) + 40px padding
- `height` = max(bottommost element y + height) + legend section height + 60px padding
- Never hardcode a viewBox that crops content

### Component Position Grid
For deterministic layout, snap component positions to a virtual grid:
- X: multiples of 20px from the left edge
- Y: multiples of 20px from the top
- This ensures consistent alignment and simplifies arrow routing

## Accessibility

- All interactive elements have `aria-label` or `title` attributes
- Colors meet WCAG AA contrast against `#020617` background
- `@media print` rules hide the toolbar
- Text uses monospace fonts but maintains readable size at default zoom
- Arrow labels are readable at 8-9px on standard displays

## Determinism

Layout is deterministic — the same input (brief or knowledge graph) produces the same diagram. This is important for:
- Diff review across iterations
- Reproducible builds in CI
- Predictable handoff to designers

If you need different layouts for the same data, vary the input brief (e.g., add "place auth in top-left"), not the rendering logic.

## CSS Theming System

The template exposes 18 CSS custom properties in `:root` for one-click re-theming. When generating a diagram, do NOT override individual color values inline — modify the `:root` block instead.

### Theme Variables

```css
:root {
  --bg-primary: #020617;        /* page background */
  --bg-card: rgba(15,23,42,0.5); /* card/panel backgrounds */
  --bg-panel: rgba(15,23,42,0.6);
  --bg-tile: rgba(15,23,42,0.4);
  --border-default: #1e293b;    /* standard borders */
  --text-primary: #ffffff;      /* headings, component names */
  --text-secondary: #94a3b8;    /* body text, descriptions */
  --text-muted: #64748b;        /* labels, metadata */
  --text-dim: #475569;          /* footer, minor annotations */
  --color-frontend: #22d3ee;    /* cyan */
  --color-backend: #34d399;     /* emerald */
  --color-database: #a78bfa;    /* violet */
  --color-cloud: #fbbf24;       /* amber */
  --color-security: #fb7185;    /* rose */
  --color-message: #fb923c;     /* orange */
  --color-external: #94a3b8;    /* slate */
  --font-mono: 'JetBrains Mono', 'SF Mono', ...;
}
```

To re-theme: change `:root` values, then update the SVG component `fill`/`stroke` values (these are SVG attributes, not CSS) and arrow `<marker>` colors to match.

### Reusable Panel Classes

When building data panels (metrics, scaling, ownership, API tables, etc.), use these CSS classes instead of inline styles:

| Class | Purpose |
|-------|---------|
| `.panel` | Standard panel container (margin-top, bg, border-radius) |
| `.panel-header` | Panel title bar (font-size, weight, margin) |
| `.panel-grid` | 2-3 column auto-fit grid (280px min, 0.5rem gap) |
| `.panel-grid-4` | 3-4 column auto-fit grid (280px min, 0.75rem gap) |
| `.panel-item` | Individual panel sub-card (bg, border-radius) |
| `.panel-item-title` | Panel sub-card title |
| `.panel-item-body` | Panel sub-card body text |
| `.panel-table` | Full-width styled table with border-collapse |
| `.panel-table th` | Table header cell (muted color, bottom border) |
| `.panel-table td` | Table data cell (bottom border) |

Inline styles are acceptable for one-off layouts (Request Trace, Deployment Pipeline) where the structure doesn't match the grid/table patterns. Always prefer utility classes for standard panels with grid or table layouts.
