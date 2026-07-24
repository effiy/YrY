# KeepAlive Component Best Practices

**Impact: HIGH** - `<KeepAlive>` caches component instances instead of destroying them. Use it to preserve state across switches, but manage cache size and freshness explicitly to avoid memory growth or stale UI.

## Task List

- Use KeepAlive only where state preservation improves UX
- Set a reasonable `max` to cap cache size
- Declare component names for include/exclude matching
- Use `onActivated`/`onDeactivated` for cache-aware logic
- Decide how and when cached views refresh their data
- Avoid caching memory-heavy or security-sensitive views

## When to Use KeepAlive

Use KeepAlive when switching between views where state should persist (tabs, multi-step forms, dashboards). Avoid it when each visit should start fresh.

**BAD:**
```vue
<template>
  <!-- State resets on every switch -->
  <component :is="currentTab" />
</template>
```

**GOOD:**
```vue
<template>
  <!-- State preserved between switches -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

## When NOT to Use KeepAlive

- Search or filter pages where users expect fresh results
- Memory-heavy components (maps, large tables, media players)
- Sensitive flows where data must be cleared on exit
- Components with heavy background activity you cannot pause

## Limit and Control the Cache

Always cap cache size with `max` and restrict caching to specific components when possible.

```vue
<template>
  <KeepAlive :max="5" include="Dashboard,Settings">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

## Ensure Component Names Match include/exclude

`include` and `exclude` match the component `name` option. Explicitly set names for reliable caching.

```vue
<!-- TabA.vue -->
<script setup>
defineOptions({ name: 'TabA' })
</script>
```

```vue
<template>
  <KeepAlive include="TabA,TabB">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

## Cache Invalidation Strategies

Vue 3 has no direct API to remove a specific cached instance. Use keys or dynamic include/exclude to force refreshes.

```vue
<script setup>
import { ref, reactive } from 'vue'

const currentView = ref('Dashboard')
const viewKeys = reactive({ Dashboard: 0, Settings: 0 })

function invalidateCache(view) {
  viewKeys[view]++
}
</script>

<template>
  <KeepAlive>
    <component :is="currentView" :key="`${currentView}-${viewKeys[currentView]}`" />
  </KeepAlive>
</template>
```

## Lifecycle Hooks for Cached Components

Cached components are not destroyed on switch. Use activation hooks for refresh and cleanup.

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  refreshData()
})

onDeactivated(() => {
  pauseTimers()
})
</script>
```

## Router Caching and Freshness

Decide whether navigation should show cached state or a fresh view. A common pattern is to key by route when params change.

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <KeepAlive>
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </router-view>
</template>
```

If you want cache reuse but fresh data, refresh in `onActivated` and compare query/params before fetching.

# Suspense Component Best Practices

**Impact: MEDIUM** - `<Suspense>` coordinates async dependencies (async components or async setup) and renders a fallback while they resolve. Misconfiguration leads to missing loading states, empty renders, or subtle UX bugs.

## Task List

- Wrap default and fallback slot content in a single root node
- Use `timeout` when you need the fallback to appear on reverts
- Force root replacement with `:key` when you need Suspense to re-trigger
- Add `suspensible` to nested Suspense boundaries (Vue 3.3+)
- Use `@pending`, `@resolve`, and `@fallback` for programmatic loading state
- Nest `RouterView` -> `Transition` -> `KeepAlive` -> `Suspense` in that order
- Keep Suspense usage centralized and documented in production

## Single Root in Default and Fallback Slots

Suspense tracks a single immediate child in both slots. Wrap multiple elements in a single element or component.

**BAD:**
```vue
<template>
  <Suspense>
    <AsyncHeader />
    <AsyncList />

    <template #fallback>
      <LoadingSpinner />
      <LoadingHint />
    </template>
  </Suspense>
</template>
```

**GOOD:**
```vue
<template>
  <Suspense>
    <div>
      <AsyncHeader />
      <AsyncList />
    </div>

    <template #fallback>
      <div>
        <LoadingSpinner />
        <LoadingHint />
      </div>
    </template>
  </Suspense>
</template>
```

## Fallback Timing on Reverts (`timeout`)

When Suspense is already resolved and new async work starts, the previous content remains visible until the timeout elapses. Use `timeout="0"` for immediate fallback or a short delay to avoid flicker.

**BAD:**
```vue
<template>
  <Suspense>
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

**GOOD:**
```vue
<template>
  <Suspense :timeout="200">
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## Pending State Only Re-triggers on Root Replacement

Once resolved, Suspense only re-enters pending when the root node of the default slot changes. If async work happens deeper in the tree, no fallback appears.

**BAD:**
```vue
<template>
  <Suspense>
    <TabContainer>
      <AsyncDashboard v-if="tab === 'dashboard'" />
      <AsyncSettings v-else />
    </TabContainer>

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

**GOOD:**
```vue
<template>
  <Suspense>
    <component :is="tabs[tab]" :key="tab" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## Use `suspensible` for Nested Suspense (Vue 3.3+)

Nested Suspense boundaries need `suspensible` on the inner boundary so the parent can coordinate loading state. Without it, inner async content may render empty nodes until resolved.

**BAD:**
```vue
<template>
  <Suspense>
    <LayoutShell>
      <Suspense>
        <AsyncWidget />
        <template #fallback>Loading widget...</template>
      </Suspense>
    </LayoutShell>

    <template #fallback>Loading layout...</template>
  </Suspense>
</template>
```

**GOOD:**
```vue
<template>
  <Suspense>
    <LayoutShell>
      <Suspense suspensible>
        <AsyncWidget />
        <template #fallback>Loading widget...</template>
      </Suspense>
    </LayoutShell>

    <template #fallback>Loading layout...</template>
  </Suspense>
</template>
```

## Track Loading with Suspense Events

Use `@pending`, `@resolve`, and `@fallback` for analytics, global loading indicators, or coordinating UI outside the Suspense boundary.

```vue
<script setup>
import { ref } from 'vue'

const isLoading = ref(false)

const onPending = () => {
  isLoading.value = true
}

const onResolve = () => {
  isLoading.value = false
}
</script>

<template>
  <LoadingBar v-if="isLoading" />

  <Suspense @pending="onPending" @resolve="onResolve">
    <AsyncPage />
    <template #fallback>
      <PageSkeleton />
    </template>
  </Suspense>
</template>
```

## Recommended Nesting with RouterView, Transition, KeepAlive

When combining these components, the nesting order should be `RouterView` -> `Transition` -> `KeepAlive` -> `Suspense` so each wrapper works correctly.

**BAD:**
```vue
<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <KeepAlive>
        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </KeepAlive>
    </Suspense>
  </RouterView>
</template>
```

**GOOD:**
```vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition mode="out-in">
      <KeepAlive>
        <Suspense>
          <component :is="Component" />
          <template #fallback>Loading...</template>
        </Suspense>
      </KeepAlive>
    </Transition>
  </RouterView>
</template>
```

## Treat Suspense Cautiously in Production

In production code, keep Suspense boundaries minimal, document where they are used, and have a fallback loading strategy if you ever need to replace or refactor them.

# Teleport Component Best Practices

**Impact: MEDIUM** - `<Teleport>` renders part of a component's template in a different place in the DOM while preserving the Vue component hierarchy. Use it for overlays (modals, toasts, tooltips) or any UI that must escape stacking contexts, overflow, or fixed positioning constraints.

## Task List

- Teleport overlays to `body` or a dedicated container outside the app root
- Keep a shared target for similar UI (`#modals`, `#notifications`) and control layering with order or z-index
- Use `:disabled` for responsive layouts that should render inline on small screens
- Remember props, emits, and provide/inject still work through teleport
- Avoid relying on parent stacking contexts or transforms for teleported UI

## Teleport Overlays Out of Transformed Containers

When an ancestor has `transform`, `filter`, or `perspective`, fixed-position overlays can behave like they are locally positioned. Teleport escapes that context.

**BAD:**
```vue
<template>
  <div class="animated-container">
    <button @click="open = true">Open</button>

    <!-- Broken: fixed positioning is scoped to the transformed parent -->
    <div v-if="open" class="modal">Modal</div>
  </div>
</template>

<style>
.animated-container {
  transform: translateZ(0);
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
</style>
```

**GOOD:**
```vue
<template>
  <div class="animated-container">
    <button @click="open = true">Open</button>

    <Teleport to="body">
      <div v-if="open" class="modal">Modal</div>
    </Teleport>
  </div>
</template>
```

## Responsive Layouts with `disabled`

Use `:disabled` to render inline on mobile and teleport on larger screens:

```vue
<script setup>
import { useMediaQuery } from '@vueuse/core'

const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<template>
  <Teleport to="body" :disabled="isMobile">
    <nav class="sidebar">Navigation</nav>
  </Teleport>
</template>
```

## Logical Hierarchy Is Preserved

Teleport changes DOM position, not the Vue component tree. Props, emits, slots, and provide/inject still work:

```vue
<template>
  <Teleport to="body">
    <ChildPanel :message="message" @close="open = false" />
  </Teleport>
</template>
```

## Multiple Teleports to the Same Target

Teleports to the same target append in declaration order:

```vue
<template>
  <Teleport to="#notifications">
    <div>First</div>
  </Teleport>

  <Teleport to="#notifications">
    <div>Second</div>
  </Teleport>
</template>
```

Use a shared container to keep stacking predictable, and apply z-index only when you need explicit layering.

# Transition Component Best Practices

**Impact: MEDIUM** - `<Transition>` animates entering/leaving of a single element or component. It is ideal for toggling UI states, swapping views, or animating one component at a time.

## Task List

- Wrap a single element or component inside `<Transition>`
- Provide a `key` when switching between same element types
- Use `mode="out-in"` when you need sequential swaps
- Prefer `transform` and `opacity` for smooth animations

## Use Transition for a Single Root Element

`<Transition>` only supports one direct child. Wrap multiple nodes in a single element or component.

**BAD:**
```vue
<template>
  <Transition name="fade">
    <h3>Title</h3>
    <p>Description</p>
  </Transition>
</template>
```

**GOOD:**
```vue
<template>
  <Transition name="fade">
    <div>
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </Transition>
</template>
```

## Force Transitions Between Same Element Types

Vue reuses the same DOM element when the tag type does not change. Add `key` so Vue treats it as a new element and triggers enter/leave.

**BAD:**
```vue
<template>
  <Transition name="fade">
    <p v-if="isActive">Active</p>
    <p v-else>Inactive</p>
  </Transition>
</template>
```

**GOOD:**
```vue
<template>
  <Transition name="fade" mode="out-in">
    <p v-if="isActive" key="active">Active</p>
    <p v-else key="inactive">Inactive</p>
  </Transition>
</template>
```

## Use `mode` to Avoid Overlap During Swaps

When swapping components or views, use `mode="out-in"` to prevent both from being visible at the same time.

**BAD:**
```vue
<template>
  <Transition name="fade">
    <component :is="currentView" />
  </Transition>
</template>
```

**GOOD:**
```vue
<template>
  <Transition name="fade" mode="out-in">
    <component :is="currentView" :key="currentView" />
  </Transition>
</template>
```

## Animate `transform` and `opacity` for Performance

Avoid layout-triggering properties such as `height`, `margin`, or `top`. Use `transform` and `opacity` for smooth, GPU-friendly transitions.

**BAD:**
```css
.slide-enter-active,
.slide-leave-active {
  transition: height 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  height: 0;
}
```

**GOOD:**
```css
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-12px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(12px);
  opacity: 0;
}
```

# TransitionGroup Component Best Practices

**Impact: MEDIUM** - `<TransitionGroup>` animates lists of items entering, leaving, and moving. Use it for `v-for` lists or dynamic collections where individual items change over time.

## Task List

- Use `<TransitionGroup>` only for lists and repeated items
- Provide unique, stable keys for every direct child
- Use `tag` when you need semantic or layout wrappers
- Avoid the `mode` prop (not supported)
- Use JavaScript hooks for staggered effects

## Use TransitionGroup for Lists

`<TransitionGroup>` is designed for list items. Use `tag` to control the wrapper element when needed.

**BAD:**
```vue
<template>
  <TransitionGroup name="fade">
    <ComponentA />
    <ComponentB />
  </TransitionGroup>
</template>
```

**GOOD:**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

## Always Provide Stable Keys

Keys are required. Without stable keys, Vue cannot track item positions and animations break.

**BAD:**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

**GOOD:**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

## Do Not Use `mode` on TransitionGroup

`mode` is only for `<Transition>` because it swaps a single element. `<TransitionGroup>` ignores `mode` (it has no concept of "out" then "in" because multiple items move simultaneously), so just drop it. If you genuinely need in/out sequencing for a single element, use `<Transition>` instead.

**BAD:**
```vue
<template>
  <TransitionGroup name="list" tag="div" mode="out-in">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </TransitionGroup>
</template>
```

**GOOD:**
```vue
<template>
  <!-- `mode` is silently ignored on TransitionGroup; just remove it. -->
  <TransitionGroup name="list" tag="div">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </TransitionGroup>
</template>
```

## Stagger List Animations with Data Attributes

For cascading list animations, pass the index to JavaScript hooks and compute delay per item.

```vue
<template>
  <TransitionGroup
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
  >
    <li v-for="(item, index) in items" :key="item.id" :data-index="index">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(12px)'
}

function onEnter(el, done) {
  const delay = Number(el.dataset.index) * 80
  setTimeout(() => {
    el.style.transition = 'all 0.25s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    setTimeout(done, 250)
  }, delay)
}
</script>
```

