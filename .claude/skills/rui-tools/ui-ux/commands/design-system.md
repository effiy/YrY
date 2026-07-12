---
name: design-system-generate
description: >
  Generate design tokens from JSON config, validate for hardcoded
  values, and create token-compliant slides.
---

# Design System — Generate & Validate

Generate CSS design tokens from JSON configuration, validate code for hardcoded values, and create token-compliant presentations.

## Token Generation

```bash
node scripts/slide/generate-tokens.cjs --config tokens.json -o tokens.css
```

Three-layer structure: Primitive (raw values) → Semantic (purpose aliases) → Component (component-specific).

## Token Validation

```bash
node scripts/slide/validate-tokens.cjs --dir src/
```

Checks for hardcoded values that should reference tokens.

## Slide Creation

See [slide.md](./slide.md) for the slide generation workflow.

## Best Practices

1. Never use raw hex in components — always reference tokens
2. Semantic layer enables theme switching (light/dark)
3. Component tokens enable per-component customization
4. Use HSL format for opacity control
5. Document every token's purpose
