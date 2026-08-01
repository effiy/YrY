---
name: slides-create
description: >
  Create strategic HTML presentations with Chart.js, design tokens,
  responsive layouts, and copywriting-optimized content.
---

# Slides — Create Presentation

Strategic HTML presentation design with data visualization, copywriting formulas, and contextual slide strategies.

## Workflow

### Step 1: Define Deck Strategy

Analyze: audience, goal, tone, length. Apply slide strategies from `references/slide-strategies.md`.

### Step 2: Design Each Slide

For each slide position, follow the contextual decision flow:

```
Goal → slide-layout-logic.csv → layout + break_pattern
Content type → slide-typography.csv → type scale
Emotion → slide-color-logic.csv → color treatment
Background → slide-backgrounds.csv → image
Copy → slide-copy.csv → formula (PAS, AIDA, FAB)
```

### Step 3: Implement with Design Tokens

Every slide MUST:
- Import `assets/design-tokens.css`
- Use CSS variables exclusively: `var(--color-primary)`, `var(--slide-bg)`
- Use Chart.js for charts (CDN: `chart.js@4.4.1`)
- Include keyboard navigation and progress bar

### Step 4: Validate

```bash
python scripts/slide/slide-token-validator.py slide.html
```

## Pattern Breaking (Duarte Sparkline)

Alternate between emotions for engagement:
```
"What Is" (frustration) ↔ "What Could Be" (hope)
```
System calculates pattern breaks at 1/3 and 2/3 positions.

## Knowledge Base

| Topic | File |
|-------|------|
| Layout Patterns | `references/layout-patterns.md` |
| HTML Template | `references/html-template.md` |
| Copywriting Formulas | `references/copywriting-formulas.md` |
| Slide Strategies | `references/slide-strategies.md` |
