---
name: brand-update
description: >
  Update brand identity (voice, colors, typography, messaging) and sync
  changes to design tokens across all design systems.
---

# Brand — Update Identity & Sync

Update the brand identity in `docs/brand-guidelines.md` and sync changes to design tokens.

## Workflow

### Step 1: Edit Brand Guidelines

Edit `docs/brand-guidelines.md` — the single source of truth for:
- Brand voice and tone
- Color palette (primary, secondary, accent)
- Typography (heading font, body font, scale)
- Logo usage rules
- Messaging framework

### Step 2: Sync to Design Tokens

```bash
node scripts/brand/sync-brand-to-tokens.cjs
```

This syncs:
- `docs/brand-guidelines.md` → `assets/design-tokens.json`
- `docs/brand-guidelines.md` → `assets/design-tokens.css`

### Step 3: Verify

```bash
node scripts/brand/inject-brand-context.cjs --json | head -20
```

## Supporting Scripts

| Script | Purpose |
|--------|---------|
| `scripts/brand/inject-brand-context.cjs` | Extract brand context for prompt injection |
| `scripts/brand/sync-brand-to-tokens.cjs` | Sync brand-guidelines.md → design-tokens.json/css |
| `scripts/brand/validate-asset.cjs` | Validate asset naming, size, format |
| `scripts/brand/extract-colors.cjs` | Extract and compare colors against palette |
