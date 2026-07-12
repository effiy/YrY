---
name: design-logo
description: >
  Design logos with AI generation — search 55+ styles, 30 color
  palettes, 25 industry guides, then generate with Gemini models.
---

# Design — Logo Creation

55+ styles, 30 color palettes, 25 industry guides. Gemini Nano Banana models.

## Generate Design Brief

```bash
python3 scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

## Search Styles/Colors/Industries

```bash
python3 scripts/logo/search.py "minimalist clean" --domain style
python3 scripts/logo/search.py "tech professional" --domain color
python3 scripts/logo/search.py "healthcare medical" --domain industry
```

## Generate with AI

ALWAYS generate output logo images with white background.

```bash
python3 scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
```

## Top Logo Styles

| Style | Best For |
|-------|----------|
| minimalist | Tech, SaaS, startups |
| lettermark | Enterprise, legal |
| mascot | Gaming, education |
| emblem | Education, government |
| wordmark | Media, fashion |
| vintage | F&B, craft, handmade |
| geometric | Fintech, crypto |
| gradient | Modern brands, SaaS |
