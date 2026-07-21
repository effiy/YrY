---
name: banner-design-create
description: >
  Design banners for social media, ads, web, and print — multiple art
  direction options with AI-generated visuals.
---

# Banner Design — Create Banners

Design banners across social, ads, web, and print formats. Generates multiple art direction options per request with AI-powered visual elements.

## Workflow

### Step 1: Gather Requirements

Collect via AskUserQuestion:
1. **Purpose** — social cover, ad banner, website hero, or print?
2. **Platform/size** — which platform or custom dimensions?
3. **Content** — headline, subtext, CTA, logo placement?
4. **Brand** — existing brand guidelines?
5. **Style preference** — any art direction? (default: 3 options)

### Step 2: Research & Art Direction

1. Activate `yry-tools-ui-ux` skill for design intelligence
2. Select 2-3 complementary art direction styles from `references/banner-sizes-and-styles.md`

### Step 3: Design & Generate

1. Create HTML/CSS banner with exact platform dimensions
2. Generate visual elements with ai-artist + ai-multimodal skills
3. Compose: overlay text, CTA, logo on generated visual

### Step 4: Export to PNG

Use chrome-devtools skill for screenshot at exact dimensions.

## Banner Size Quick Reference

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

## Top Art Styles

| Style | Best For | Key Elements |
|-------|----------|--------------|
| Minimalist | SaaS, tech | White space, 1-2 colors, clean type |
| Bold Typography | Announcements | Oversized type as hero element |
| Gradient | Modern brands | Mesh gradients, chromatic blends |
| Photo-Based | Lifestyle, e-com | Full-bleed photo + text overlay |
| Geometric | Tech, fintech | Shapes, grids, abstract patterns |
| Glassmorphism | SaaS, apps | Frosted glass, blur, glow borders |
| Neon/Cyberpunk | Gaming, events | Dark bg, glowing neon accents |
| Editorial | Media, luxury | Grid layouts, pull quotes |

## Design Rules

- Safe zones: critical content in central 70-80% of canvas
- CTA: one per banner, bottom-right, min 44px height, action verb
- Typography: max 2 fonts, min 16px body, ≥32px headline
- Text ratio: under 20% for ads (Meta penalizes heavy text)
- Print: 300 DPI, CMYK, 3-5mm bleed
