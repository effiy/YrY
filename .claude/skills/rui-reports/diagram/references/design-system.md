# Architecture Diagram — Design System

> The visual language used by `templates/architecture-diagram.html`. Use this when filling placeholders or extending the template.

## Color Palette

| Component Type | Fill (rgba) | Stroke | Use for |
|----------------|-------------|--------|---------|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan) | Browser apps, SPAs, mobile clients |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald) | API servers, workers, business logic |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet) | SQL/NoSQL databases, caches, queues |
| AWS/Cloud | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber) | Cloud-managed services (Lambda, S3, etc.) |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose) | Auth providers, secret managers, WAFs |
| Message Bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange) | Kafka, RabbitMQ, pub/sub topics |
| External/Generic | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate) | End users, third-party services |
| Inactive | `rgba(15, 23, 42, 0.5)` | `#475569` | Disabled components, deprecated paths |

Region boundary fills use a 0.05-alpha version of the same color; boundary strokes use the full color.

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

## Spacing Rules

- Standard component height: 60px for services, 80–120px for larger components
- Minimum vertical gap between components: 40px
- Inline connectors (message buses) live in the gap, not overlapping
- Standard viewBox start: 1000×680, expand if layout demands it
- Legend placed at least 20px below the lowest boundary

## Visual Elements

**Background:** `#020617` (slate-950) with a subtle 40px grid pattern (`<pattern id="grid">` in `<defs>`).

**Component boxes:** Rounded rectangles (`rx="6"`) with 1.5px stroke, semi-transparent fills, opaque mask underneath.

**Security groups:** Dashed stroke (`stroke-dasharray="4,4"`), transparent fill, rose color.

**Region boundaries:** Larger dashed stroke (`stroke-dasharray="8,4"`), amber color, `rx="12"`.

**Arrows:** Use the SVG `<marker id="arrowhead">` defined in `<defs>`. Drawn before component boxes so they render behind.

**Masking arrows:** Every component box needs an opaque background rect (`fill="#0f172a"`) at the same position, drawn before the semi-transparent styled rect.

**Auth/security flows:** Dashed lines in rose color (`#fb7185`), `stroke-dasharray="5,5"`.

**Message buses:** Small connector elements (120×20px) in orange between services.

**Pulsing indicator:** 12px circle in cyan, 2s pulse animation, 0.5 opacity at midpoint.

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

## Layout Patterns

### Linear flow (left → right)
- Components in a single row
- Arrows flow right with slight vertical jitter
- Best for: simple request/response chains, pipeline visualizations

### Layered (top → bottom)
- Each layer is a horizontal band
- Components grouped within layers
- Best for: n-tier architectures, layered systems

### Hub-and-spoke
- One central service with surrounding clients/services
- Arrows radiate from center
- Best for: API gateways, message brokers, monoliths

### Mesh
- Multiple interconnected services without a clear flow
- Edges grouped to reduce crossing
- Best for: microservices, event-driven systems

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

All three operations use a `html2canvas` snapshot of the `report-container` element at `scale: 2` for retina-quality output.

## Accessibility

- All interactive elements have `aria-label` or `title` attributes
- Colors meet WCAG AA contrast against `#020617` background
- `@media print` rules hide the toolbar
- Text uses monospace fonts but maintains readable size at default zoom

## Determinism

Layout is deterministic — the same input (brief or knowledge graph) produces the same diagram. This is important for:
- Diff review across iterations
- Reproducible builds in CI
- Predictable handoff to designers

If you need different layouts for the same data, vary the input brief (e.g., add "place auth in top-left"), not the rendering logic.
