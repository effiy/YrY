---
name: diagram-create
description: >
  Create a polished dark-themed architecture diagram as a self-contained
  HTML+SVG file — gather requirements and produce a professional system
  architecture diagram with inline SVG, CSS styling, and built-in export.
---

# Diagram Creator — Create Architecture Diagrams

Create polished dark-themed architecture diagrams as self-contained HTML files with inline SVG graphics and CSS styling.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Write` | Create the diagram HTML file |
| `Read` | Read the template at `../resources/template.html` |

## Process

### Step 1: Gather Requirements

Understand what the user needs the diagram to show:

- What system or architecture should the diagram represent?
- What components are involved? (frontends, backends, databases, cloud services, message buses, security components)
- How do components connect? (data flows, auth flows, API calls)
- Any specific boundaries? (AWS regions, VPCs, security groups)
- What level of detail? (high-level overview or detailed component view)

### Step 2: Plan the Layout

Sketch the layout mentally before writing SVG:

- Group related components into regions or clusters
- Determine flow direction (left-to-right, top-to-bottom)
- Assign semantic colors per component type
- Calculate positions with minimum 40px vertical gaps
- Place arrows before boxes in SVG document order

### Step 3: Build the Diagram

Copy the template from `../resources/template.html` and customize:

1. Update `<title>`, header text, and subtitle
2. Set the SVG `viewBox` dimensions to fit your layout
3. Add background grid (already in template)
4. Draw connection arrows (lines with arrowheads, drawn first)
5. Draw component boxes (with opaque backgrounds to mask arrows)
6. Add security groups and region boundaries as needed
7. Add a legend with all used component types
8. Update the three summary cards
9. Update footer metadata

### Step 4: Deliver

Save as a single self-contained `.html` file. The user can open it directly in any browser. The built-in export toolbar (three-dot menu in header) supports:
- Copy as high-DPI PNG to clipboard
- Download as PNG
- Download as PDF

## Design System Reference

### Color Palette

| Component Type | Fill (rgba) | Stroke |
|---------------|-------------|--------|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan) |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald) |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet) |
| AWS/Cloud | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber) |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose) |
| Message Bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange) |
| External/Generic | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate) |

### Typography

```css
font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace;
```

Font sizes: 12px for component names, 9px for sublabels, 8px for annotations, 7px for tiny labels.

### Visual Elements

**Background:** `#020617` (slate-950) with a subtle 40px grid pattern.

**Component boxes:** Rounded rectangles (`rx="6"`) with 1.5px stroke, semi-transparent fills.

**Security groups:** Dashed stroke (`stroke-dasharray="4,4"`), transparent fill, rose color.

**Region boundaries:** Larger dashed stroke (`stroke-dasharray="8,4"`), amber color, `rx="12"`.

**Arrows:** Use SVG marker for arrowheads, drawn before component boxes so they render behind.

**Masking arrows:** Each component box needs an opaque background rect (`fill="#0f172a"`) at the same position, drawn before the semi-transparent styled rect, to fully mask any arrows behind it.

**Auth/security flows:** Dashed lines in rose color (`#fb7185`).

**Message buses:** Small connector elements (120×20px) in orange between services.

### Spacing Rules

- Standard component height: 60px for services, 80–120px for larger components
- Minimum vertical gap between components: 40px
- Place inline connectors (message buses) in the gap, not overlapping

### Layout Structure

1. **Header** — Title with pulsing dot indicator, subtitle, and export toolbar (three-dot menu)
2. **Main SVG diagram** — Contained in rounded border card
3. **Summary cards** — Grid of 3 cards below the diagram with key details
4. **Footer** — Minimal metadata line

### Legend Placement

Place legends OUTSIDE all boundary boxes (region boundaries, cluster boundaries, security groups). Calculate where all boundaries end and place the legend at least 20px below the lowest boundary. Expand the SVG viewBox height if needed.
