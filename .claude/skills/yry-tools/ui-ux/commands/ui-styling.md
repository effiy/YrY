---
name: ui-ux-ui-styling
description: >
  Build beautiful, accessible UIs with shadcn/ui components (Radix UI +
  Tailwind), utility-first Tailwind CSS, and canvas-based visual design.
---

# UI Styling — Components & Theme

Build production-grade user interfaces with shadcn/ui components, Tailwind CSS utilities, and canvas-based visual design.

## Component Layer: shadcn/ui

Pre-built accessible components via Radix UI primitives. Copy-paste distribution model.

```bash
# Initialize shadcn/ui with Tailwind
npx shadcn@latest init

# Add components
npx shadcn@latest add button card dialog form

# Or use the Python helper
python scripts/ui/shadcn_add.py button card dialog
```

## Styling Layer: Tailwind CSS

Utility-first CSS with design tokens, responsive breakpoints, and dark mode.

```bash
# Generate Tailwind config with custom theme
python scripts/ui/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

### Quick Example

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">View your metrics</p>
          <Button variant="default" className="w-full">View Details</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Visual Design Layer: Canvas

Museum-quality visual compositions with philosophy-driven design approach.

## Knowledge Base

| Topic | File |
|-------|------|
| shadcn/ui Components | [../references/shadcn-components.md](../references/shadcn-components.md) |
| shadcn/ui Theming | [../references/shadcn-theming.md](../references/shadcn-theming.md) |
| shadcn/ui Accessibility | [../references/shadcn-accessibility.md](../references/shadcn-accessibility.md) |
| Tailwind Utilities | [../references/tailwind-utilities.md](../references/tailwind-utilities.md) |
| Tailwind Responsive | [../references/tailwind-responsive.md](../references/tailwind-responsive.md) |
| Tailwind Customization | [../references/tailwind-customization.md](../references/tailwind-customization.md) |
| Canvas Design System | [../references/canvas-design-system.md](../references/canvas-design-system.md) |

## Best Practices

1. **Component Composition**: Build complex UIs from simple, composable primitives
2. **Utility-First Styling**: Use Tailwind classes directly; extract only for true repetition
3. **Mobile-First**: Start with mobile styles, layer responsive variants
4. **Accessibility-First**: Leverage Radix UI primitives, add focus states, use semantic HTML
5. **Design Tokens**: Use CSS variables consistently for theming and dark mode
6. **Dark Mode**: Apply dark variants to all themed elements
7. **Performance**: Leverage automatic CSS purging, avoid dynamic class names
