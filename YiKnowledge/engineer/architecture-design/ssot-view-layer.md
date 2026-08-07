---
title: SSOT view layer pattern
aliases: [ssot-view-layer-pattern, leaves-ssot-pattern, single-source-of-truth-view]
tags: [pattern, engineering patterns, SSOT, view layer, route derivation, CI consistency]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "All views derive from a single source of truth, eliminating data inconsistency and reconciliation overhead"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
- ./rpc-envelope.md
  - ../lessons/win-yivad-leaf-view-leaves-ssot.md
  - ../projects/yivad/dev-standards.md
  - ../projects/yivad/functional-modules.md
---

> **Status (2026-08-07)**: This pattern document is valid as a methodology reference. However, the YiVad knowledge leaf view layer (28 leaves, `leaves.ts` SSOT, 56 routes) used as the primary case study was never landed on master. The pattern itself is sound; the case study describes a planned approach, not a completed implementation. Knowledge browsing is currently embedded in `KnowledgePreviewDialog.vue` and `story/index.vue`.

# SSOT view layer pattern

> **As an** engineer, **I want to** use the SSOT view layer, **so that** the pattern is applied consistently.

> Single data source (leaves.ts) as SSOT up front + 1-line wrapper component + derived routes + CI consistency assertion; N leaf views do not write N sets of boilerplate, only maintain 1 leaf list + 2 generic components + 1-line wrapper x N.

## Summary

- **Pattern**: `leaves.ts` as leaf metadata SSOT (name / title / category / meta) -> `KnowledgeLeafList` + `KnowledgeLeafDetail` two generic components -> each leaf writes a 1-line wrapper (`<KnowledgeLeafDetail :leaf="xxx" />`) -> `staticRouter` derives the route table from `leaves.ts` -> CI runs wrapper-vs-leaves / route-vs-leaves consistency assertions
- **Cross-project applicability**: YiVad knowledge base leaf view layer (28 leaves x index/detail = 56 routes), reusable for any scenario of "N isomorphic views + different metadata"
- **Landing**: [yivad leaf view leaves ssot win](../lessons/win-yivad-leaf-view-leaves-ssot.md) — 28 leaves + 56 routes parity 100%
- **Alternative**: independent .vue per leaf + independent route declaration (not applicable, reason in §not applicable)

## Core viewpoints

**The SSOT is not the data file -- it is the CI check that blocks divergence.** A `leaves.ts` file is just a TypeScript array. The SSOT pattern becomes real only when a CI script fails the build because the wrapper count, route count, and leaf count do not match. Without the enforcement mechanism, the "single source" is just a suggestion that drifts within two sprints.

**One-line wrappers are not boilerplate reduction -- they are a contract that each leaf is isomorphic.** If every leaf must fit into the same `<KnowledgeLeafDetail :leaf="xxx" />` wrapper, then no leaf can have a custom layout, custom data fetching, or custom state. This constraint is the feature: it prevents the N-leaf codebase from diverging into N different coding styles. The cost is that truly unique leaves must break the pattern; the benefit is that the other 95% stay identical.

**Derived routes are safer than hand-written routes because they eliminate the "forgot to add" failure mode.** A hand-written route table will eventually miss a new leaf. A derived route table (`leaves.flatMap(leaf => [...])`) cannot miss a leaf because it iterates the source of truth. The trade is that the route pattern must be uniform; the win is that 404s from missing routes become impossible.

**The isomorphic constraint is the pattern's value, not its limitation.** If leaves are not isomorphic (different layouts, different data sources, different behaviors), the SSOT pattern provides no benefit. The pattern's applicability test is: "can every leaf be rendered by the same two generic components?" If yes, use it. If no, the pattern will fight you.

**Leaf count is the unit of technical debt for this pattern.** When N=5, the SSOT overhead is barely justified. When N=28, the overhead is negligible compared to the drift it prevents. When N=100, the pattern is the only thing standing between you and 200 files of duplicated boilerplate. The pattern's ROI scales linearly with N.

## Key info

- **SSOT file structure**: `leaves.ts` is a typed array where each entry has: `name` (file identifier, used in route paths), `title` (display name, i18n key), `category` (grouping for navigation), `meta` (arbitrary metadata for the detail component). The type definition (`LeafMeta` interface) is the contract between the SSOT file and the generic components. Adding a field to the type without updating the components causes a compile-time error; adding a leaf without updating the type is impossible.
- **CI consistency checks**: three assertions must pass: (1) wrapper count = leaf count (every leaf in the SSOT has a wrapper component), (2) route count = leaf count × 2 (index + detail route for each leaf), (3) no leaf appears in the SSOT that doesn't have a corresponding markdown file in the expected directory. The third check is the most frequently skipped and the most valuable -- it catches the case where a leaf is declared but the content doesn't exist.
- **Derived route generation**: `leaves.flatMap(leaf => [{ path: `/${leaf.name}`, component: LeafList, props: { category: leaf.category } }, { path: `/${leaf.name}/:id`, component: LeafDetail, props: { leaf } }])`. The route pattern must be uniform for derivation to work. Non-uniform routes (e.g., one leaf with a custom sub-route) must be handled outside the derivation, which breaks the pattern's guarantee.
- **YiVad implementation**: the SSOT pattern was applied to 28 knowledge leaf views, reducing route boilerplate from ~280 lines (10 lines per route × 28 leaves) to ~30 lines (leaves.ts ~15 lines + derived routes ~15 lines). The CI check runs on every PR and takes ~200ms. The pattern was validated when a leaf was added in a PR without a wrapper component -- CI caught it before merge.
- **Generic component design**: `KnowledgeLeafList` (renders a filtered list of leaves by category, handles loading/empty/error states) and `KnowledgeLeafDetail` (renders a single leaf's markdown content, handles loading/not-found/error states). These two components must handle every leaf's rendering needs; if a leaf needs a custom chart, a custom interactive element, or a custom data source, the pattern breaks and the leaf must be a standalone component.

## Problem

Pain points of not using this pattern (quantified):

- **Boilerplate redundancy**: 28 leaves x 2 views (index + detail) = 56 .vue files, each with 20+ lines of boilerplate = 1120+ lines of duplicate boilerplate
- **Route drift**: hand-written `staticRouter` route table = forgetting to update routes after leaf add/remove = 404 / dead links
- **Metadata drift**: leaf title / category / icon scattered across multiple files = change one place miss N = inconsistency
- **Slow onboarding for new leaf**: adding a leaf requires changing 4 files (leaf declaration / index.vue / detail.vue / router) = easy to miss
- **Parity unverifiable**: each leaf view written separately = visual/behavior drift only caught by eye

## Pattern

### 1. SSOT: leaves.ts

```typescript
// src/views/knowledge/leaves.ts
export interface KnowledgeLeaf {
  name: string;          // kebab-case, used for wrapper file name and route path
  title: string;         // display title
  category: string;      // primary category
  meta?: Record<string, unknown>;
}

export const KNOWLEDGE_LEAVES: KnowledgeLeaf[] = [
  { name: 'agile-pm', title: 'Agile PM methodology', category: 'methodology/pm-frameworks' },
  { name: 'prompt-eng', title: 'Prompt engineering', category: 'methodology/ai-specific' },
  // ... N entries
];
```

### 2. Generic components

```vue
<!-- src/views/knowledge/KnowledgeLeafList.vue -->
<template>
  <div v-for="leaf in leaves" :key="leaf.name">
    <router-link :to="`/knowledge/${leaf.name}`">{{ leaf.title }}</router-link>
  </div>
</template>

<script setup lang="ts">
import { KNOWLEDGE_LEAVES } from './leaves';
const leaves = KNOWLEDGE_LEAVES;
</script>
```

```vue
<!-- src/views/knowledge/KnowledgeLeafDetail.vue -->
<template>
  <MarkdownRender :source="contentSource" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ leaf: KnowledgeLeaf }>();
const contentSource = computed(() => `/content/${props.leaf.category}/${props.leaf.name}.md`);
</script>
```

### 3. 1-line wrapper x N

```vue
<!-- src/views/knowledge/leaves/agile-pm/index.vue -->
<template><KnowledgeLeafList /></template>
<script setup lang="ts">
import KnowledgeLeafList from '@/views/knowledge/KnowledgeLeafList.vue';
</script>
```

```vue
<!-- src/views/knowledge/leaves/agile-pm/detail.vue -->
<template><KnowledgeLeafDetail :leaf="leaf" /></template>
<script setup lang="ts">
import KnowledgeLeafDetail from '@/views/knowledge/KnowledgeLeafDetail.vue';
import { KNOWLEDGE_LEAVES } from '@/views/knowledge/leaves';
const leaf = KNOWLEDGE_LEAVES.find(l => l.name === 'agile-pm')!;
</script>
```

### 4. Derived routes

```typescript
// src/router/staticRouter.ts
import { KNOWLEDGE_LEAVES } from '@/views/knowledge/leaves';

export const staticRouter = [
  // other routes...
  ...KNOWLEDGE_LEAVES.flatMap(leaf => [
    { path: `/knowledge/${leaf.name}`, component: () => import(`@/views/knowledge/leaves/${leaf.name}/index.vue`) },
    { path: `/knowledge/${leaf.name}/detail`, component: () => import(`@/views/knowledge/leaves/${leaf.name}/detail.vue`) },
  ]),
];
```

### 5. CI consistency assertion

```bash
# scripts/check-leaf-consistency.ts
# 1. wrapper file count === leaves.ts entry count x 2
# 2. wrapper paths === leaves.ts declared paths
# 3. route table entry count === leaves.ts entry count x 2
npx tsx scripts/check-leaf-consistency.ts
```

CI failure = missed change = block merge.

## Applicable / Not applicable

### Applicable

- N isomorphic views (list + detail) + different metadata (N >= 5)
- Metadata may be added/removed (leaf add/remove is routine)
- Route table must be strongly consistent with metadata
- Large team / cross-project (SSOT lowers communication cost)

### Not applicable

- Single page or few pages (N < 5): direct writing is simpler
- Heterogeneous view structure (each leaf has different layout): SSOT fails
- Static markdown site (no frontend framework): use vitepress / docsify instead
- Fully dynamic routes (backend-driven): route table is not SSOT

## Landing checklist

| # | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Build `leaves.ts` SSOT (name / title / category / meta) | Frontend leaf view layer | One-shot |
| 2 | Build `KnowledgeLeafList` + `KnowledgeLeafDetail` generic components | Frontend shared | One-shot |
| 3 | Each leaf writes a 1-line wrapper (index.vue + detail.vue) | Frontend leaf files | Gradual |
| 4 | `staticRouter` derives route table from `leaves.ts` | Frontend router | One-shot |
| 5 | Write `check-leaf-consistency.ts` script: wrapper count / route count / leaf count consistent | Frontend scripts | One-shot |
| 6 | CI integrates consistency assertion (block on inconsistency) | CI | Follows #5 |

## Action recommendations

1. **Make the CI consistency check block the merge, not just warn.** A CI script that outputs "leaf count mismatch" but returns exit code 0 is a suggestion that will be ignored. The CI check must fail the build on any inconsistency between wrapper count, route count, and leaf count. A warning is the same as no check at all.

2. **Keep the generic component truly generic -- push special cases into leaf metadata, not into conditional branches.** The moment `KnowledgeLeafDetail` contains `if (leaf.name === 'prompt-eng') { renderSpecial() }`, the pattern is broken. Special cases belong in a `component` field in `leaves.ts` or in a composition layer above the generic component.

3. **Run the applicability test before adopting the SSOT pattern: "can every leaf be rendered by the same two generic components?"** If leaves are not isomorphic (different layouts, different data sources, different behaviors), the SSOT pattern provides no benefit and will fight you. The pattern serves the 95% of leaves that are isomorphic; the 5% that are not should be handled separately with explicit documentation.

4. **Read leaf metadata from `leaves.ts` in wrappers, never hardcode it.** When adding a new leaf by copying an existing wrapper, the developer must not forget to update the category or title. The wrapper should reference `leaves.ts` for all metadata, making the SSOT the single point of change for every leaf property.

5. **Calculate the SSOT pattern's ROI before adopting it for a new use case.** When N=5, the overhead is barely justified. When N=28, the overhead is negligible. When N=100, the pattern is the only thing preventing 200 files of duplicated boilerplate. The pattern's ROI scales linearly with N, and the break-even point is around N=10.

## Anti-patterns

**SSOT that is not the actual source of truth.** If the CI check passes but the runtime reads from a different source (e.g., a hardcoded list in the router, a separate config file), the SSOT is a fiction. The runtime must consume the SSOT directly, and the CI check must verify that no other source exists. The SSOT is the only source; the CI check is the enforcement.

**Adding special-case logic to the generic component.** The moment `KnowledgeLeafDetail` contains `if (leaf.name === 'prompt-eng') { renderSpecial() } else { renderDefault() }`, the pattern is broken. Special cases belong in the leaf metadata (e.g., a `component` field in `leaves.ts`) or in a composition layer above the generic component. The generic component must remain generic.

**Forcing non-isomorphic leaves into the SSOT pattern.** If three leaves need a custom layout, a custom data source, and custom interactivity, they should not be forced into the `<KnowledgeLeafDetail>` wrapper. The pattern serves the 95% of leaves that are isomorphic; the 5% that are not should be handled separately with explicit documentation of why they break the pattern.

**Metadata drift through copy-paste.** When adding a new leaf, the developer copies an existing wrapper file, changes the leaf name, but forgets to update the category or title. The SSOT has the correct values, but the wrapper file has stale metadata. The wrapper should not contain hardcoded metadata -- it should read from `leaves.ts`.

**CI check that warns but does not block.** A CI script that outputs "leaf count mismatch: 28 wrappers, 29 leaves" but returns exit code 0 is not enforcement -- it is a suggestion that will be ignored. The CI check must block the merge. A warning is the same as no check at all.



- **Each leaf writes 20+ lines of boilerplate**: boilerplate redundancy + change one place miss N; must use 1-line wrapper + generic components.
- **Hand-written route table**: forget to update routes after leaf add/remove = 404; must derive from `leaves.ts`.
- **Metadata scattered across files**: leaf title hand-written in wrapper = changing title requires editing N places; must read from `leaves.ts`.
- **Skip CI consistency assertion**: missed changes caught by eye = 404 after launch; must block in CI.
- **Business logic in wrapper**: breaks isomorphism = SSOT fails; push business logic down to generic components or independent leaf files.
- **Leaf names using `_` or digits**: violates naming constraint = route paths and file names in chaos; must use kebab-case + no `_` + no digits.

## Related

- Landing: [yivad leaf view leaves ssot win](../lessons/win-yivad-leaf-view-leaves-ssot.md) — 28 leaves + 56 routes parity 100%
- Landing: [YiVad dev standards §view layer](../projects/yivad/dev-standards.md)
- Landing: [YiVad functional modules §knowledge leaf](../projects/yivad/functional-modules.md)
- Companion: [rpc-envelope-pattern](./rpc-envelope.md) — another dimension of the same frontend base layer (network layer)
- Upstream: [./README.md](./) — engineering-patterns leaf entry
