---
description: Vue 3 Composition API component conventions — SFC structure, props, emits, composables
globs: src/**/*.vue
---

# Vue 3 Component Patterns

YiVad uses Vue 3.5 with Composition API, TypeScript, and `<script setup>` syntax.

## SFC Structure

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props + Emits
// 3. Composables
// 4. Reactive state
// 5. Computed + Watchers
// 6. Methods
// 7. Lifecycle hooks
</script>

<template>
  <!-- template -->
</template>

<style scoped lang="scss">
/* scoped styles */
</style>
```

## Rules

1. **`<script setup lang="ts">`** — always use script setup + TypeScript; no Options API
2. **Props** → `defineProps<{...}>()` with type generics; **Emits** → `defineEmits<{...}>()`
3. **Composables in `src/hooks/`** — extract reusable logic into `useXxx` functions; name file same as composable: `useTable.ts`
4. **Pinia stores in `src/stores/`** — use `defineStore` with setup-function syntax (not options)
5. **Directives in `src/directives/modules/`** — register in `src/directives/index.ts`
6. **Element Plus components** → use `el-` prefix; follow Element Plus 2.14 API
7. **Styles** → scoped SCSS, variables from `src/styles/`, no inline styles except dynamic values
8. **Router** → hash mode; dynamic routes from backend menu API; guards in `src/routers/`
