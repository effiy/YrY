---
name: component-extractor
description: Extracts reusable Vue 3 components, composables, and directives from existing YiVad code.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# component-extractor — YiVad component/composable extraction

Extract reusable components, composables, and directives from existing code and place them in the correct directories.

## Target directories

```
src/components/               # Cross-page reusable UI components
├── ProTable/                 # Table component (canonical table pattern)
├── SearchForm/               # Search form
├── SelectFilter/             # Dropdown filter
├── TreeFilter/               # Tree filter
├── Upload/                   # File upload (Img.vue, Imgs.vue)
├── WangEditor/               # Rich text editor
├── SvgIcon/                  # SVG icon
├── ErrorMessage/             # Error pages (403, 404, 500)
└── ImportExcel/              # Excel import

src/hooks/                    # Composable functions (useXxx)
├── useTable.ts               # Table logic
├── useTheme.ts               # Theme switching
├── useSelection.ts            # Multi-select logic
└── ...

src/directives/modules/       # Custom directives
├── auth.ts                   # v-auth — permission control
├── copy.ts                   # v-copy — one-click copy
├── debounce.ts               # v-debounce — debounce
├── draggable.ts              # v-draggable — drag
└── ...
```

## Extraction checklist

When you spot duplicated code, extract in this priority order:

1. **Composable** — pure logic duplication → `src/hooks/useXxx.ts`
2. **Directive** — DOM behavior duplication → `src/directives/modules/<name>.ts`
3. **Component** — UI template duplication → `src/components/<Name>/index.vue`

## Rules

- Components define their interface with `defineProps<{...}>()` and `defineEmits<{...}>()`
- Composables return an object containing `ref`/`reactive`/`computed`/methods
- Directives are registered in `src/directives/index.ts`
- Only extract code with 2+ use sites — a single-use abstraction adds complexity
- After extraction, update all call sites and ensure type checks pass
