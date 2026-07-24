# Use v-once and v-memo to Skip Unnecessary Updates

**Impact: MEDIUM** - Vue re-evaluates templates on every reactive change. For content that never changes or changes infrequently, `v-once` and `v-memo` tell Vue to skip updates, reducing render work.

Use `v-once` for truly static content and `v-memo` for conditionally-static content in lists.

## Task List

- Apply `v-once` to elements that use runtime data but never need updating
- Apply `v-memo` to list items that should only update on specific condition changes
- Verify memoized content doesn't need to respond to other state changes
- Profile with Vue DevTools to confirm update skipping

## v-once: Render Once, Never Update

**BAD:**
```vue
<template>
  <!-- BAD: Re-evaluated on every parent re-render -->
  <div class="terms-content">
    <h1>Terms of Service</h1>
    <p>Version: {{ termsVersion }}</p>
    <div v-html="termsContent"></div>
  </div>

  <!-- This content NEVER changes, but Vue checks it every render -->
  <footer>
    <p>Copyright {{ copyrightYear }} {{ companyName }}</p>
  </footer>
</template>
```

**GOOD:**
```vue
<template>
  <!-- GOOD: Rendered once, skipped on all future updates -->
  <div class="terms-content" v-once>
    <h1>Terms of Service</h1>
    <p>Version: {{ termsVersion }}</p>
    <div v-html="termsContent"></div>
  </div>

  <!-- v-once tells Vue this never needs to update -->
  <footer v-once>
    <p>Copyright {{ copyrightYear }} {{ companyName }}</p>
  </footer>
</template>

<script setup>
// These values are set once at component creation
const termsVersion = '2.1'
const termsContent = fetchedTermsHTML
const copyrightYear = 2024
const companyName = 'Acme Corp'
</script>
```

## v-memo: Conditional Memoization for Lists

**BAD:**
```vue
<template>
  <!-- BAD: All items re-render when selectedId changes -->
  <div v-for="item in list" :key="item.id">
    <div :class="{ selected: item.id === selectedId }">
      <ExpensiveComponent :data="item" />
    </div>
  </div>
</template>
```

**GOOD:**
```vue
<template>
  <!-- GOOD: Items only re-render when their selection state changes -->
  <div
    v-for="item in list"
    :key="item.id"
    v-memo="[item.id === selectedId]"
  >
    <div :class="{ selected: item.id === selectedId }">
      <ExpensiveComponent :data="item" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([/* many items */])
const selectedId = ref(null)

// When selectedId changes:
// - Only the previously-selected item re-renders (selected: true -> false)
// - Only the newly-selected item re-renders (selected: false -> true)
// - All other items are SKIPPED (v-memo values unchanged)
</script>
```

## v-memo with Multiple Dependencies

```vue
<template>
  <!-- Re-render only when item's selection OR editing state changes -->
  <div
    v-for="item in items"
    :key="item.id"
    v-memo="[item.id === selectedId, item.id === editingId]"
  >
    <ItemCard
      :item="item"
      :selected="item.id === selectedId"
      :editing="item.id === editingId"
    />
  </div>
</template>

<script setup>
const selectedId = ref(null)
const editingId = ref(null)
const items = ref([/* ... */])
</script>
```

## v-memo with Empty Array = v-once

```vue
<template>
  <!-- v-memo="[]" is equivalent to v-once -->
  <div v-for="item in staticList" :key="item.id" v-memo="[]">
    {{ item.name }}
  </div>
</template>
```

## When NOT to Use These Directives

```vue
<template>
  <!-- DON'T: Content that DOES need to update -->
  <div v-once>
    <span>Count: {{ count }}</span>  <!-- count won't update! -->
  </div>

  <!-- DON'T: When child components have their own reactive state -->
  <div v-memo="[selected]">
    <InputField v-model="item.name" />  <!-- v-model won't work properly -->
  </div>

  <!-- DON'T: When the memoization benefit is minimal -->
  <span v-once>{{ simpleText }}</span>  <!-- Overhead not worth it -->
</template>
```

## Performance Comparison

| Scene | Without Directive | With v-once/v-memo |
|----------|-------------------|-------------------|
| Static header, parent re-renders 100x | Re-evaluated 100x | Evaluated 1x |
| 1000 items, selection changes | 1000 items re-render | 2 items re-render |
| Complex child component | Full re-render | Skipped if memoized |

## Debugging Memoized Components

```vue
<script setup>
import { onUpdated } from 'vue'

// This won't fire if v-memo prevents update
onUpdated(() => {
  console.log('Component updated')
})
</script>
```

# Virtualize Large Lists to Avoid DOM Overload

**Impact: HIGH** - Rendering all items in a large list (hundreds or thousands) creates massive amounts of DOM nodes. Each node consumes memory, slows down initial render, and makes updates expensive. List virtualization only renders visible items, dramatically improving performance.

Use a virtualization library when dealing with lists that could exceed 50-100 items, especially if items have complex content.

## Task List

- Identify lists that render more than 50-100 items
- Install a virtualization library (vue-virtual-scroller, @tanstack/vue-virtual)
- Replace standard `v-for` with virtualized component
- Ensure list items have consistent or estimable heights
- Test with realistic data volumes during development

## Recommended Libraries

| Library | Best For | Notes |
|---------|----------|-------|
| `vue-virtual-scroller` | General use, easy setup | Most popular, good defaults |
| `@tanstack/vue-virtual` | Complex layouts, headless | Framework-agnostic, flexible |
| `vue-virtual-scroll-grid` | Grid layouts | 2D virtualization |
| `vueuc/VVirtualList` | Naive UI projects | Part of Naive UI ecosystem |

**BAD:**
```vue
<template>
  <!-- BAD: Renders ALL 10,000 items immediately -->
  <div class="user-list">
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserCard from './UserCard.vue'

const users = ref([])

onMounted(async () => {
  // 10,000 DOM nodes created, browser struggles
  users.value = await fetchAllUsers()
})
</script>
```

**GOOD:**
```vue
<template>
  <!-- GOOD: Only renders ~20 visible items at a time -->
  <RecycleScroller
    class="user-list"
    :items="users"
    :item-size="80"
    key-field="id"
    v-slot="{ item }"
  >
    <UserCard :user="item" />
  </RecycleScroller>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import UserCard from './UserCard.vue'

const users = ref([])

onMounted(async () => {
  // 10,000 items in memory, but only ~20 DOM nodes
  users.value = await fetchAllUsers()
})
</script>

<style scoped>
.user-list {
  height: 600px; /* Container must have fixed height */
}
</style>
```

## Using @tanstack/vue-virtual

```vue
<template>
  <div ref="parentRef" class="list-container">
    <div
      :style="{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative'
      }"
    >
      <div
        v-for="virtualRow in rowVirtualizer.getVirtualItems()"
        :key="virtualRow.key"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`
        }"
      >
        <UserCard :user="users[virtualRow.index]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

const users = ref([/* 10,000 users */])
const parentRef = ref(null)

const rowVirtualizer = useVirtualizer({
  count: users.value.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 80,  // Estimated row height
  overscan: 5  // Render 5 extra items above/below viewport
})
</script>

<style scoped>
.list-container {
  height: 600px;
  overflow: auto;
}
</style>
```

## Dynamic Heights with vue-virtual-scroller

```vue
<template>
  <!-- For variable height items, use DynamicScroller -->
  <DynamicScroller
    :items="messages"
    :min-item-size="54"
    key-field="id"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :data-index="index"
      >
        <ChatMessage :message="item" />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
</script>
```

## Performance Comparison

| Approach | 100 Items | 1,000 Items | 10,000 Items |
|----------|-----------|-------------|--------------|
| Regular v-for | ~100 DOM nodes | ~1,000 DOM nodes | ~10,000 DOM nodes |
| Virtualized | ~20 DOM nodes | ~20 DOM nodes | ~20 DOM nodes |
| Initial render | Fast | Slow | Very slow / crashes |
| Virtualized render | Fast | Fast | Fast |

## When NOT to Virtualize

- Lists under 50 items with simple content
- Lists where all items must be accessible to screen readers simultaneously
- Print layouts where all content must render
- SEO-critical content that must be in initial HTML

# Avoid Excessive Component Abstraction in Large Lists

**Impact: MEDIUM** - Component instances are more expensive than plain DOM nodes. While abstractions improve code organization, unnecessary nesting creates overhead. In large lists, this overhead multiplies - 100 items with 3 levels of abstraction means 300+ component instances instead of 100.

Don't avoid abstraction entirely, but be mindful of component depth in frequently-rendered elements like list items.

## Task List

- Review list item components for unnecessary wrapper components
- Consider flattening component hierarchies in hot paths
- Use native elements when a component adds no value
- Profile component counts using Vue DevTools
- Focus optimization efforts on the most-rendered components

**BAD:**
```vue
<!-- BAD: Deep abstraction in list items -->
<template>
  <div class="user-list">
    <!-- For 100 users: Creates 400 component instances -->
    <UserCard v-for="user in users" :key="user.id" :user="user" />
  </div>
</template>

<!-- UserCard.vue -->
<template>
  <Card>  <!-- Wrapper component #1 -->
    <CardHeader>  <!-- Wrapper component #2 -->
      <UserAvatar :src="user.avatar" />  <!-- Wrapper component #3 -->
    </CardHeader>
    <CardBody>  <!-- Wrapper component #4 -->
      <Text>{{ user.name }}</Text>
    </CardBody>
  </Card>
</template>

<!-- Each UserCard creates: Card + CardHeader + CardBody + UserAvatar + Text
     100 users = 500+ component instances -->
```

**GOOD:**
```vue
<!-- GOOD: Flattened structure in list items -->
<template>
  <div class="user-list">
    <!-- For 100 users: Creates 100 component instances -->
    <UserCard v-for="user in users" :key="user.id" :user="user" />
  </div>
</template>

<!-- UserCard.vue - Flattened, uses native elements -->
<template>
  <div class="card">
    <div class="card-header">
      <img :src="user.avatar" :alt="user.name" class="avatar" />
    </div>
    <div class="card-body">
      <span class="user-name">{{ user.name }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: Object
})
</script>

<style scoped>
/* Styles that would have been in Card, CardHeader, etc. */
.card { /* ... */ }
.card-header { /* ... */ }
.card-body { /* ... */ }
.avatar { /* ... */ }
</style>
```

## When Abstraction Is Still Worth It

```vue
<!-- Component abstraction is valuable when: -->

<!-- 1. Complex behavior is encapsulated -->
<UserStatusIndicator :user="user" />  <!-- Has logic, tooltips, etc. -->

<!-- 2. Reused outside of the hot path -->
<Card>  <!-- OK to use in one-off places, not in 100-item lists -->

<!-- 3. The list itself is small -->
<template v-if="items.length < 20">
  <FancyItem v-for="item in items" :key="item.id" />
</template>

<!-- 4. Virtualization is used (only ~20 items rendered at once) -->
<RecycleScroller :items="items">
  <template #default="{ item }">
    <ComplexItem :item="item" />  <!-- OK - only 20 instances exist -->
  </template>
</RecycleScroller>
```

## Measuring Component Overhead

```javascript
// In development, profile component counts
import { onMounted, getCurrentInstance } from 'vue'

onMounted(() => {
  const instance = getCurrentInstance()
  let count = 0

  function countComponents(vnode) {
    if (vnode.component) count++
    if (vnode.children) {
      vnode.children.forEach(child => {
        if (child.component || child.children) countComponents(child)
      })
    }
  }

  // Use Vue DevTools instead for accurate counts
  console.log('Check Vue DevTools Components tab for instance counts')
})
```

## Alternatives to Wrapper Components

```vue
<!-- Instead of a <Button> component for styling: -->
<button class="btn btn-primary">Click</button>

<!-- Instead of a <Text> component: -->
<span class="text-body">{{ content }}</span>

<!-- Instead of layout wrapper components in lists: -->
<div class="flex items-center gap-2">
  <!-- content -->
</div>

<!-- Use CSS classes or Tailwind instead of component abstractions for styling -->
```

## Impact Calculation

| List Size | Components per Item | Total Instances | Memory Impact |
|-----------|---------------------|-----------------|---------------|
| 100 items | 1 (flat) | 100 | Baseline |
| 100 items | 3 (nested) | 300 | ~3x memory |
| 100 items | 5 (deeply nested) | 500 | ~5x memory |
| 1000 items | 1 (flat) | 1000 | High |
| 1000 items | 5 (deeply nested) | 5000 | Very High |

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

