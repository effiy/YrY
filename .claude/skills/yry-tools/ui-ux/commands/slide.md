---
name: ui-ux-slide
description: >
  Create strategic HTML presentation slides with Chart.js, design
  tokens, copywriting formulas, and contextual decision system.
---

# Design System — Slide Creation

Brand-compliant presentations using design tokens + Chart.js + contextual decision system.

## Contextual Decision Flow

```
1. Parse goal/context
        ↓
2. Search slide-strategies.csv → Get strategy + emotion beats
        ↓
3. For each slide:
   a. Query slide-layout-logic.csv → layout + break_pattern
   b. Query slide-typography.csv → type scale
   c. Query slide-color-logic.csv → color treatment
   d. Query slide-backgrounds.csv → image if needed
   e. Apply animation class from slide-animations.css
        ↓
4. Generate HTML with design tokens
        ↓
5. Validate with slide-token-validator.py
```

## Slide Search (BM25)

```bash
# Basic search (auto-detect domain)
python scripts/slide/search-slides.py "investor pitch"

# Domain-specific search
python scripts/slide/search-slides.py "problem agitation" -d copy
python scripts/slide/search-slides.py "revenue growth" -d chart

# Contextual search
python scripts/slide/search-slides.py "problem slide" --context --position 2 --total 9
```

## Slide Requirements

ALL slides MUST:
1. Import `assets/design-tokens.css` — single source of truth
2. Use CSS variables: `var(--color-primary)`, `var(--slide-bg)`, etc.
3. Use Chart.js for charts (NOT CSS-only bars)
4. Include navigation (keyboard arrows, click, progress bar)
5. Center align content
6. Focus on persuasion/conversion

## Token Compliance

```css
/* CORRECT - uses token */
background: var(--slide-bg);
color: var(--color-primary);

/* WRONG - hardcoded */
background: #0D0D0D;
color: #FF6B6B;
```
