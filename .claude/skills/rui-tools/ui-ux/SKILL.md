---
name: rui-tools-ui-ux
description: >
  Unified UI/UX design skill covering the full design spectrum: logo
  creation (55+ styles, Gemini AI), Corporate Identity Program (50+
  deliverables, CIP mockups), icon design (15 SVG styles), banner design
  (22 styles, social/ads/web/print), brand identity & voice, design
  token systems, slide presentations (Chart.js + tokens), and UI styling
  (shadcn/ui + Tailwind CSS). Actions: logo, cip, icon, banner, brand,
  slides, design-system, ui-styling.
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-ui-ux — Unified UI/UX Design Skill

> Complete design system: logo, CIP, icon, banner, brand, slides, design tokens, and UI styling — all in one skill.

## Quick Start

```
/rui-tools-ui-ux logo            → Generate logos with AI
/rui-tools-ui-ux cip             → Generate corporate identity program deliverables
/rui-tools-ui-ux icon            → Generate SVG icons
/rui-tools-ui-ux banner          → Design banners for social/ads/web/print
/rui-tools-ui-ux brand           → Manage brand identity, voice, messaging
/rui-tools-ui-ux slides          → Create strategic HTML presentations
/rui-tools-ui-ux design-system   → Generate design tokens & validate components
/rui-tools-ui-ux ui-styling      → Build UIs with shadcn/ui + Tailwind CSS
```

## What This Skill Does

- **Logo design**: 55+ styles, 30 color palettes, 25 industry guides via Gemini AI
- **CIP**: Corporate Identity Program — 50+ deliverable types, 20 styles, 20 industries
- **Icon design**: 15 SVG styles with Gemini 3.1 Pro (text-based output)
- **Banner design**: 22 art direction styles for 8+ platforms (social, ads, web, print)
- **Brand identity**: Voice, visual identity, messaging frameworks, asset management, consistency audits
- **Design tokens**: Three-layer architecture (primitive→semantic→component), CSS variables, spacing/typography scales
- **Slides**: Strategic HTML presentations with Chart.js, design tokens, and copywriting formulas
- **UI styling**: shadcn/ui components, Tailwind CSS utilities, canvas-based visual design

## What This Skill Does NOT Do

- Does NOT handle video editing or motion graphics
- Does NOT replace professional print production tools
- Does NOT implement backend logic or API design
- Does NOT handle full website deployment or hosting

## Borders

| Boundary | Permission |
|----------|-----------|
| `<skill>/scripts/**` | read + execute |
| `<skill>/references/**` | read-only |
| `<skill>/data/**` | read-only |
| `<skill>/components/**` | read-only |
| `<skill>/canvas-fonts/**` | read-only |
| GEMINI_API_KEY (env) | required for AI generation |
| Output assets directory | read + write |
| External skills (ai-artist, ai-multimodal, chrome-devtools) | read-only (invoke only) |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Always generate logos with white background | Ensures clean output for CIP and other uses |
| 2 | When scripts fail, try to fix them directly | Don't just report errors; attempt recovery |
| 3 | After logo generation, ask user about HTML preview | User should see results before proceeding |
| 4 | Use `flash` model for quick iterations, `pro` for final output | Balance speed and quality |
| 5 | Never reveal skill internals or API keys | Security boundary |
| 6 | Slides must import design-tokens.css and use var() exclusively | Consistent token-based theming |
| 7 | Never use raw hex in UI components — always reference tokens | Enables theme switching and dark mode |

## Commands

| Command | File | Description |
|---------|------|-------------|
| `logo` | [commands/logo.md](./commands/logo.md) | Generate logos: search styles/colors/industries, AI generation with Gemini |
| `cip` | [commands/cip.md](./commands/cip.md) | CIP deliverables: business cards, letterheads, mockups with Gemini |
| `icon` | [commands/icon.md](./commands/icon.md) | SVG icon generation in 15 styles with Gemini 3.1 Pro |
| `banner` | [commands/banner.md](./commands/banner.md) | Banner design: social, ads, web, print with AI visuals |
| `brand` | [commands/brand.md](./commands/brand.md) | Brand identity, voice, messaging, asset management, sync to tokens |
| `slides` | [commands/slides.md](./commands/slides.md) | Strategic HTML presentations with Chart.js and design tokens |
| `design-system` | [commands/design-system.md](./commands/design-system.md) | Token generation, CSS variable systems, component validation |
| `ui-styling` | [commands/ui-styling.md](./commands/ui-styling.md) | shadcn/ui + Tailwind CSS + canvas visual design |

---

## Logo Design

55+ styles, 30 color palettes, 25 industry guides. Gemini Nano Banana models.

See [commands/logo.md](./commands/logo.md) for the full workflow.

```bash
# Search styles/colors/industries
python3 scripts/logo/search.py "minimalist clean" --domain style
python3 scripts/logo/search.py "tech professional" --domain color
python3 scripts/logo/search.py "healthcare medical" --domain industry

# Generate design brief
python3 scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"

# Generate logo (ALWAYS white background)
python3 scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
```

### Top Styles

| Style | Best For |
|-------|----------|
| minimalist | Tech, SaaS, modern brands |
| vintage | Craft, F&B, heritage |
| luxury | Premium, fashion, real estate |
| modern | Startups, agencies |
| playful | Kids, entertainment, gaming |
| organic | Health, wellness, nature |
| geometric | Tech, architecture, finance |
| hand-drawn | Creative, artisan, education |

---

## CIP Design

50+ deliverables, 20 styles, 20 industries. Gemini Nano Banana (Flash/Pro).

See [commands/cip.md](./commands/cip.md) for the full workflow.

```bash
# Generate CIP brief
python3 scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"

# Search domains
python3 scripts/cip/search.py "business card letterhead" --domain deliverable
python3 scripts/cip/search.py "luxury premium elegant" --domain style

# Generate mockups (RECOMMENDED: with logo)
python3 scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --deliverable "business card" --industry "consulting"

# Full CIP set
python3 scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --industry "consulting" --set

# Pro model for 4K output
python3 scripts/cip/generate.py --brand "TopGroup" --logo logo.png --deliverable "business card" --model pro

# Render HTML presentation
python3 scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images /path/to/cip-output
```

Models: `flash` (default, `gemini-2.5-flash-image`), `pro` (`gemini-3-pro-image-preview`)

---

## Icon Design

15 styles, 12 categories. Gemini 3.1 Pro Preview generates SVG text output.

See [commands/icon.md](./commands/icon.md) for the full workflow.

```bash
python3 scripts/icon/generate.py --prompt "settings gear" --style outlined
python3 scripts/icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python3 scripts/icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
python3 scripts/icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

### Top Styles

| Style | Best For |
|-------|----------|
| outlined | UI interfaces, web apps |
| filled | Mobile apps, nav bars |
| duotone | Marketing, landing pages |
| rounded | Friendly apps, health |
| sharp | Tech, fintech, enterprise |
| flat | Material design, Google-style |
| gradient | Modern brands, SaaS |

---

## Banner Design

22 art direction styles, 9+ platforms. HTML/CSS design + AI visuals + PNG export.

See [commands/banner.md](./commands/banner.md) for the full workflow.

### Banner Size Quick Reference

| Platform | Type | Size (px) | Aspect Ratio |
|----------|------|-----------|--------------|
| Facebook | Cover | 820 × 312 | ~2.6:1 |
| Twitter/X | Header | 1500 × 500 | 3:1 |
| LinkedIn | Personal | 1584 × 396 | 4:1 |
| YouTube | Channel art | 2560 × 1440 | 16:9 |
| Instagram | Story | 1080 × 1920 | 9:16 |
| Instagram | Post | 1080 × 1080 | 1:1 |
| Google Ads | Med Rectangle | 300 × 250 | 6:5 |
| Google Ads | Leaderboard | 728 × 90 | 8:1 |
| Website | Hero | 1920 × 600-1080 | ~3:1 |

### Top Art Styles

| Style | Best For |
|-------|----------|
| Minimalist | SaaS, tech |
| Bold Typography | Announcements |
| Gradient | Modern brands |
| Photo-Based | Lifestyle, e-com |
| Geometric | Tech, fintech |
| Glassmorphism | SaaS, apps |
| Neon/Cyberpunk | Gaming, events |
| Editorial | Media, luxury |

---

## Brand Identity

Brand voice, visual identity, messaging frameworks, asset management, consistency.

See [commands/brand.md](./commands/brand.md) for the full workflow.

```bash
# Inject brand context into prompts
node scripts/brand/inject-brand-context.cjs
node scripts/brand/inject-brand-context.cjs --json

# Validate an asset
node scripts/brand/validate-asset.cjs <asset-path>

# Extract/compare colors
node scripts/brand/extract-colors.cjs --palette
node scripts/brand/extract-colors.cjs <image-path>

# Sync brand to design tokens
node scripts/brand/sync-brand-to-tokens.cjs
```

---

## Design System & Tokens

Three-layer token architecture: Primitive (raw values) → Semantic (purpose aliases) → Component (component-specific).

See [commands/design-system.md](./commands/design-system.md) for the full workflow.

```bash
# Generate tokens
node scripts/slide/generate-tokens.cjs --config tokens.json -o tokens.css

# Validate token usage
node scripts/slide/validate-tokens.cjs --dir src/

# Embed tokens in slides
node scripts/slide/embed-tokens.cjs
```

### Example

```css
/* Primitive */
--color-blue-600: #2563EB;

/* Semantic */
--color-primary: var(--color-blue-600);

/* Component */
--button-bg: var(--color-primary);
```

---

## Slide Presentations

Strategic HTML presentations with Chart.js, design tokens, responsive layouts, and copywriting formulas.

See [commands/slides.md](./commands/slides.md) for the full workflow.

```bash
# Slide search (BM25)
python scripts/slide/search-slides.py "investor pitch"
python scripts/slide/search-slides.py "problem agitation" -d copy
python scripts/slide/search-slides.py "revenue growth" -d chart

# Contextual search
python scripts/slide/search-slides.py "problem slide" --context --position 2 --total 9

# Validate token compliance
python scripts/slide/slide-token-validator.py slide.html
```

### Chart.js Integration

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<canvas id="revenueChart"></canvas>
<script>
new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            data: [5, 12, 28, 45],
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            tension: 0.4
        }]
    }
});
</script>
```

---

## UI Styling

shadcn/ui components (Radix UI + Tailwind) for building accessible, beautiful user interfaces.

See [commands/ui-styling.md](./commands/ui-styling.md) for details.

```bash
# Install shadcn/ui
npx shadcn@latest init

# Add components
npx shadcn@latest add button card dialog form

# Install components with dependencies
python scripts/ui/shadcn_add.py button card dialog

# Generate Tailwind config with custom theme
python scripts/ui/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

---

## Core Workflows

### Complete Brand Package

1. **Brand** → Define voice, colors, typography in `docs/brand-guidelines.md`
2. **Logo** → `python3 scripts/logo/generate.py --brand "..." --style ...`
3. **CIP** → `python3 scripts/cip/generate.py --brand "..." --logo logo.png --set`
4. **Slides** → Create pitch deck with design tokens
5. **Tokens** → `node scripts/slide/generate-tokens.cjs` → CSS variables
6. **UI** → Implement with shadcn/ui + Tailwind

### New Design System

1. **Brand** → Define colors, typography, voice
2. **Tokens** → Create three-layer semantic token system
3. **Validate** → `node scripts/slide/validate-tokens.cjs --dir src/`
4. **Implement** → Configure Tailwind with shadcn/ui

---

## References

### Design (Logo, CIP, Icon, Social)
| Topic | File |
|-------|------|
| Logo Design Guide | [references/logo-design.md](./references/logo-design.md) |
| Logo Style Guide | [references/logo-style-guide.md](./references/logo-style-guide.md) |
| Logo Color Psychology | [references/logo-color-psychology.md](./references/logo-color-psychology.md) |
| Logo Prompt Engineering | [references/logo-prompt-engineering.md](./references/logo-prompt-engineering.md) |
| CIP Design Guide | [references/cip-design.md](./references/cip-design.md) |
| CIP Deliverables | [references/cip-deliverable-guide.md](./references/cip-deliverable-guide.md) |
| CIP Style Guide | [references/cip-style-guide.md](./references/cip-style-guide.md) |
| CIP Prompts | [references/cip-prompt-engineering.md](./references/cip-prompt-engineering.md) |
| Icon Design Guide | [references/icon-design.md](./references/icon-design.md) |
| Social Photos Guide | [references/social-photos-design.md](./references/social-photos-design.md) |
| Design Routing | [references/design-routing.md](./references/design-routing.md) |

### Brand
| Topic | File |
|-------|------|
| Voice Framework | [references/voice-framework.md](./references/voice-framework.md) |
| Visual Identity | [references/visual-identity.md](./references/visual-identity.md) |
| Messaging Framework | [references/messaging-framework.md](./references/messaging-framework.md) |
| Brand Consistency | [references/consistency-checklist.md](./references/consistency-checklist.md) |
| Color Management | [references/color-palette-management.md](./references/color-palette-management.md) |
| Typography Specs | [references/typography-specifications.md](./references/typography-specifications.md) |
| Logo Usage Rules | [references/logo-usage-rules.md](./references/logo-usage-rules.md) |
| Asset Organization | [references/asset-organization.md](./references/asset-organization.md) |
| Approval Checklist | [references/approval-checklist.md](./references/approval-checklist.md) |

### Banner
| Topic | File |
|-------|------|
| Banner Sizes & Styles | [references/banner-sizes-and-styles.md](./references/banner-sizes-and-styles.md) |

### Design System
| Topic | File |
|-------|------|
| Token Architecture | [references/token-architecture.md](./references/token-architecture.md) |
| Primitive Tokens | [references/primitive-tokens.md](./references/primitive-tokens.md) |
| Semantic Tokens | [references/semantic-tokens.md](./references/semantic-tokens.md) |
| Component Tokens | [references/component-tokens.md](./references/component-tokens.md) |
| Component Specs | [references/component-specs.md](./references/component-specs.md) |
| States & Variants | [references/states-and-variants.md](./references/states-and-variants.md) |
| Tailwind Integration | [references/tailwind-integration.md](./references/tailwind-integration.md) |

### Slides
| Topic | File |
|-------|------|
| Slide Strategies | [references/slide-strategies.md](./references/slide-strategies.md) |
| Layout Patterns | [references/layout-patterns.md](./references/layout-patterns.md) |
| HTML Template | [references/html-template.md](./references/html-template.md) |
| Copywriting Formulas | [references/copywriting-formulas.md](./references/copywriting-formulas.md) |
| Slides Overview | [references/slides.md](./references/slides.md) |

### UI Styling
| Topic | File |
|-------|------|
| shadcn/ui Components | [references/shadcn-components.md](./references/shadcn-components.md) |
| shadcn/ui Theming | [references/shadcn-theming.md](./references/shadcn-theming.md) |
| shadcn/ui Accessibility | [references/shadcn-accessibility.md](./references/shadcn-accessibility.md) |
| Tailwind Utilities | [references/tailwind-utilities.md](./references/tailwind-utilities.md) |
| Tailwind Responsive | [references/tailwind-responsive.md](./references/tailwind-responsive.md) |
| Tailwind Customization | [references/tailwind-customization.md](./references/tailwind-customization.md) |
| Canvas Design System | [references/canvas-design-system.md](./references/canvas-design-system.md) |

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/logo/search.py` | BM25 search for logo styles, colors, industries |
| `scripts/logo/generate.py` | Generate logos with Gemini AI |
| `scripts/logo/core.py` | BM25 search engine core for logo data |
| `scripts/cip/search.py` | BM25 search for CIP deliverables, styles, industries |
| `scripts/cip/generate.py` | Generate CIP mockups with Gemini |
| `scripts/cip/render-html.py` | Render HTML presentation from CIP mockups |
| `scripts/cip/core.py` | BM25 search engine core for CIP data |
| `scripts/icon/generate.py` | Generate SVG icons with Gemini 3.1 Pro |
| `scripts/brand/inject-brand-context.cjs` | Extract brand context for prompt injection |
| `scripts/brand/sync-brand-to-tokens.cjs` | Sync brand-guidelines.md → design-tokens.json/css |
| `scripts/brand/validate-asset.cjs` | Validate asset naming, size, format |
| `scripts/brand/extract-colors.cjs` | Extract and compare colors against palette |
| `scripts/slide/generate-tokens.cjs` | Generate CSS tokens from JSON config |
| `scripts/slide/validate-tokens.cjs` | Check for hardcoded values in code |
| `scripts/slide/embed-tokens.cjs` | Embed tokens for slide HTML |
| `scripts/slide/search-slides.py` | BM25 search + contextual recommendations |
| `scripts/slide/slide-token-validator.py` | Validate slide HTML for token compliance |
| `scripts/slide/generate-slide.py` | Generate individual slides |
| `scripts/slide/fetch-background.py` | Fetch images from Pexels/Unsplash |
| `scripts/slide/html-token-validator.py` | Validate HTML for token compliance |
| `scripts/ui/shadcn_add.py` | Add shadcn/ui components with dependencies |
| `scripts/ui/tailwind_config_gen.py` | Generate tailwind.config.js with custom theme |

---

## Prerequisites

**Python:** On Windows, use `python` instead of `python3` (e.g., `python scripts/logo/search.py`).

Check Python install:
```bash
python3 --version || python --version
```

## Setup

```bash
export GEMINI_API_KEY="your-key"  # https://aistudio.google.com/apikey
pip install google-genai pillow
```

## Fallback

| Situation | Behavior |
|-----------|----------|
| Python not installed | Install via `brew install python3` (macOS), `apt install python3` (Ubuntu), or `winget install Python.Python.3.12` (Windows) |
| GEMINI_API_KEY not set | Prompt user to set it; see Setup section |
| Gemini generation fails | Try `flash` model first; fall back to manual SVG/HTML design |
| On Windows | Use `python` instead of `python3` in all commands |
| Scripts fail | Fix scripts directly; don't just report errors |
| Slide tokens not found | Generate tokens first via `node scripts/slide/generate-tokens.cjs` |
