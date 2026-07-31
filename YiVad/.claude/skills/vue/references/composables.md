# Composables — Conventions

> YiVad composable patterns. All composables live in `src/hooks/` and
> follow Vue 3 composable conventions.

## Naming

- **File name**: `useXxx.ts` (camelCase)
- **Function name**: `useXxx()` — must start with `use`
- **Return**: a plain object or readonly refs; never return the raw ref directly

## Return shape

```ts
// ✅ Plain object (named access) — preferred for 3+ values
export function useTable() {
  const data = ref<Item[]>([])
  const loading = ref(false)
  const total = ref(0)
  const fetch = async () => { /* ... */ }

  return { data: readonly(data), loading: readonly(loading), total: readonly(total), fetch }
}

// ✅ Array tuple (array destructuring) — OK for 2 values
export function useToggle(initial = false) {
  const state = ref(initial)
  const toggle = () => { state.value = !state.value }
  return [readonly(state), toggle] as const
}
```

## Cleanup

**Every composable that creates side effects must clean up.**

```ts
export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void
) {
  onMounted(() => window.addEventListener(event, handler))
  onBeforeUnmount(() => window.removeEventListener(event, handler))
}

// ✅ For composables without component lifecycle (called outside setup):
export function useInterval(callback: () => void, ms: number) {
  const timer = setInterval(callback, ms)
  // Return a stop function — caller is responsible for cleanup
  return () => clearInterval(timer)
}
```

## Stateful singletons

```ts
// ✅ Module-level state for global composables (shared across components)
const globalCount = ref(0)

export function useGlobalCount() {
  const increment = () => { globalCount.value++ }
  return { count: readonly(globalCount), increment }
}
```

## YiVad composable inventory

| Composable | Location | Purpose |
|-----------|----------|---------|
| `useTable` | `src/hooks/useTable.ts` | Generic table data + pagination + loading |
| `useTheme` | `src/hooks/useTheme.ts` | Theme switching (light/dark), CSS variable injection |
| `useAuthButtons` | `src/hooks/useAuthButtons.ts` | Button-level permission check helper |
| `useSelection` | `src/hooks/useSelection.ts` | Multi-select checkbox logic |
| `useHandleData` | `src/hooks/useHandleData.ts` | Data mutation with loading + error handling |
| `useDownload` | `src/hooks/useDownload.ts` | File download helper |
| `useOnline` | `src/hooks/useOnline.ts` | Navigator online/offline status |

## Composable → component wiring

```vue
<script setup lang="ts">
// ✅ Composables at top level of <script setup>
const { data, loading, total, fetch } = useTable(getUserList)

// ✅ Call on mount
onMounted(() => fetch())
</script>

<template>
  <el-table v-loading="loading" :data="data">
    <!-- ... -->
  </el-table>
</template>
```

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Calling composable inside callback/conditional | Always call at top level of `<script setup>` |
| Returning a ref directly (not in object) | Wrap in `{ value: readonly(ref) }` or `as const` tuple |
| Forgetting cleanup in event/interval composables | Always `onBeforeUnmount`/`onUnmounted` cleanup |
| Creating side effects in `computed` | Use `watch` or `watchEffect` for side effects |
| Mutating props inside composable | Props are read-only; emit events or use `defineModel` |
