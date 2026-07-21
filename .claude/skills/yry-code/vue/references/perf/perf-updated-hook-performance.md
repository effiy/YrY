---
title: Avoid Expensive Operations in Updated Hook
impact: MEDIUM
impactDescription: Heavy computations in updated hook cause performance bottlenecks and potential infinite loops
type: efficiency
tags: [vue3, lifecycle, updated, performance, optimization, reactivity]
---

# Avoid Expensive Operations in Updated Hook

**Impact: MEDIUM** - The `updated` hook runs after every reactive state change that causes a re-render. Placing expensive operations, API calls, or state mutations here can cause severe performance degradation, infinite loops, and dropped frames below the optimal 60fps threshold.

Use `updated`/`onUpdated` sparingly for post-DOM-update operations that cannot be handled by watchers or computed properties. For most reactive data handling, prefer watchers (`watch`/`watchEffect`) which provide more control over what triggers the callback.

## Task List

- Never perform API calls in updated hook
- Never mutate reactive state inside updated (causes infinite loops)
- Use conditional checks to verify updates are relevant before acting
- Prefer `watch` or `watchEffect` for reacting to specific data changes
- Use throttling/debouncing if updated operations are expensive
- Reserve updated for low-level DOM synchronization tasks

**BAD:**

```vue
<!-- BAD: API call in updated — fires on every re-render -->
<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const items = ref<string[]>([])

onUpdated(() => {
  // This runs after every single state change!
  fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(items.value)
  })
})
</script>
```

```vue
<!-- BAD: State mutation in updated — infinite loop -->
<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const renderCount = ref(0)

onUpdated(() => {
  // This causes another update, which triggers updated again!
  renderCount.value++ // Infinite loop
})
</script>
```

```vue
<!-- BAD: Heavy computation on every update -->
<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const rawData = ref<unknown[]>([])
const allData = ref<unknown[]>([])

onUpdated(() => {
  // Expensive operation runs on every keystroke, every state change
  processedData.value = heavyComputation(rawData.value)
  analytics.value = calculateMetrics(allData.value)
})
</script>
```

**GOOD:**

```vue
<!-- GOOD: Composition API with targeted watchers + useDebounceFn -->
<script setup lang="ts">
import { ref, watch, onUpdated, useTemplateRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const items = ref<string[]>([])
const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer')

// Watch specific data — not all updates
watch(items, (newItems) => {
  syncToServer(newItems)
}, { deep: true })

const syncToServer = useDebounceFn((payload: string[]) => {
  fetch('/api/sync', { method: 'POST', body: JSON.stringify(payload) })
}, 500)

// Only use onUpdated for DOM synchronization
onUpdated(() => {
  // Scroll to bottom only if content changed height
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
})
</script>

<template>
  <div ref="scrollContainer">{{ items.length }}</div>
</template>
```

```vue
<!-- GOOD: Conditional check in updated hook -->
<script setup lang="ts">
import { ref, onUpdated } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const content = ref('')
const lastSyncedContent = ref('')

const syncContent = useDebounceFn(() => {
  // Sync logic
}, 300)

onUpdated(() => {
  // Only act if specific condition is met
  if (content.value !== lastSyncedContent.value) {
    syncContent()
    lastSyncedContent.value = content.value
  }
})
</script>
```

## Valid Use Cases for Updated Hook

```vue
<!-- GOOD: Low-level DOM synchronization -->
<script setup lang="ts">
import { onUpdated, nextTick } from 'vue'

const thirdPartyWidget = { refresh: () => { /* ... */ } }
let isMaintainingScroll = false

onUpdated(() => {
  // Sync third-party library with Vue's DOM
  thirdPartyWidget.refresh()

  // Update scroll position after content change
  nextTick(() => {
    if (isMaintainingScroll) return
    isMaintainingScroll = true
    // ... maintainScrollPosition logic ...
    isMaintainingScroll = false
  })
})
</script>
```

## Prefer Computed Properties for Derived Data

```vue
<!-- BAD: Calculating derived data in updated -->
<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const numbers = ref([1, 2, 3, 4, 5])
const sum = ref(0)

onUpdated(() => {
  sum.value = numbers.value.reduce((a, b) => a + b, 0) // Causes another update!
})
</script>

<!-- GOOD: Use computed property instead -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const numbers = ref([1, 2, 3, 4, 5])
const sum = computed(() => numbers.value.reduce((a, b) => a + b, 0))
</script>
```
