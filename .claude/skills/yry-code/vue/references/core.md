# Script Setup & Macros

`<script setup>` is the recommended syntax for Vue SFCs with Composition API. It provides better runtime performance and IDE type inference.

## Basic Syntax

```vue
<script setup lang="ts">
// Top-level bindings are exposed to template
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <button @click="increment">{{ count }}</button>
  <MyComponent />
</template>
```

## defineProps

Declare component props with full TypeScript support.

```ts
// Type-based declaration (recommended)
const props = defineProps<{
  title: string
  count?: number
  items: string[]
}>()

// With defaults (Vue 3.5+) — note: Reactive Props Destructure is a Vue 3.5
// feature. The team's preference is to discourage it; prefer the
// `withDefaults` form below for shared components.
const { title, count = 0 } = defineProps<{
  title: string
  count?: number
}>()

// With defaults (Vue 3.4 and below)
const props = withDefaults(defineProps<{
  title: string
  items?: string[]
}>(), {
  items: () => []  // Use factory for arrays/objects
})
```

## defineEmits

Declare emitted events with typed payloads.

```ts
// Named tuple syntax (recommended)
const emit = defineEmits<{
  update: [value: string]
  change: [id: number, name: string]
  close: []
}>()

emit('update', 'new value')
emit('change', 1, 'name')
emit('close')
```

## defineModel

Two-way binding prop consumed via `v-model`. Available in Vue 3.4+.

```ts
// Basic usage - creates "modelValue" prop
const model = defineModel<string>()
model.value = 'hello'  // Emits "update:modelValue"

// Named model - consumed via v-model:name
const count = defineModel<number>('count', { default: 0 })

// With modifiers — parent uses `v-model.trim`, etc.
const [modelValue, modifiers] = defineModel<string>()
if (modifiers.trim) {
  // value is the raw value; here you'd trim it before emitting
}

// With transformers — `set` runs before the value is emitted to the parent.
// `get` runs when the parent value updates. Modifiers are read in `set` to
// transform the outgoing value.
const model = defineModel({
  set(val) { return modifiers.trim ? val?.trim() : val },
  get(val) { return val?.toLowerCase() }
})
```

Parent usage:
```vue
<Child v-model="name" />
<Child v-model:count="total" />
<Child v-model.trim="text" />
```

## defineExpose

Explicitly expose properties to parent via template refs. Components are closed by default.

```ts
import { ref } from 'vue'

const count = ref(0)
const reset = () => { count.value = 0 }

defineExpose({
  count,
  reset
})
```

Parent access:
```ts
const childRef = ref<{ count: number; reset: () => void }>()
childRef.value?.reset()
```

## defineOptions

Declare component options without a separate `<script>` block. Available in Vue 3.3+.

```ts
defineOptions({
  inheritAttrs: false,
  name: 'CustomName'
})
```

## defineSlots

Provide type hints for slot props. Available in Vue 3.3+.

```ts
const slots = defineSlots<{
  default(props: { item: string; index: number }): any
  header(props: { title: string }): any
}>()
```

## Generic Components

Declare generic type parameters using the `generic` attribute.

```vue
<script setup lang="ts" generic="T extends string | number">
defineProps<{
  items: T[]
  selected: T
}>()
</script>
```

Multiple generics with constraints:
```vue
<script setup lang="ts" generic="T extends string | number, U extends Record<string, T>">
defineProps<{
  data: U
  key: keyof U
}>()
</script>
```

## Local Custom Directives

Use `vNameOfDirective` naming convention.

```ts
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

// Or import and rename
import { myDirective as vMyDirective } from './directives'
```

```vue
<template>
  <input v-focus />
</template>
```

## Top-level await

Use `await` directly in `<script setup>`. The component becomes async and must be used with `<Suspense>`.

```vue
<script setup lang="ts">
const data = await fetch('/api/data').then(r => r.json())
</script>
```

<!--
Source references:
- https://vuejs.org/api/sfc-script-setup.html
-->

# Reactivity, Lifecycle & Composables

## Reactivity

### ref vs shallowRef

```ts
import { ref, shallowRef } from 'vue'

// ref - deep reactivity (tracks nested changes)
const user = ref({ name: 'John', profile: { age: 30 } })
user.value.profile.age = 31  // Triggers reactivity

// shallowRef - only .value assignment triggers reactivity (better performance)
const data = shallowRef({ items: [] })
data.value.items.push('new')  // Does NOT trigger reactivity
data.value = { items: ['new'] }  // Triggers reactivity
```

**Prefer `shallowRef`** for large data structures or when deep reactivity is unnecessary.

### computed

```ts
import { ref, computed } from 'vue'

const count = ref(0)

// Read-only computed
const doubled = computed(() => count.value * 2)

// Writable computed
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => { count.value = val - 1 }
})
```

### reactive & readonly

```ts
import { reactive, readonly } from 'vue'

const state = reactive({ count: 0, nested: { value: 1 } })
state.count++  // Reactive

const readonlyState = readonly(state)
readonlyState.count++  // Warning, mutation blocked
```

Note: `reactive()` loses reactivity on destructuring. Use `ref()` or `toRefs()`.

## Watchers

### watch

```ts
import { ref, watch } from 'vue'

const count = ref(0)

// Watch single ref
watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`)
})

// Watch getter
watch(
  () => props.id,
  (id) => fetchData(id),
  { immediate: true }
)

// Watch multiple sources
watch([firstName, lastName], ([first, last]) => {
  fullName.value = `${first} ${last}`
})

// Deep watch with depth limit (Vue 3.5+)
watch(state, callback, { deep: 2 })

// Once (Vue 3.4+)
watch(source, callback, { once: true })
```

### watchEffect

Runs immediately and auto-tracks dependencies.

```ts
import { ref, watchEffect, onWatcherCleanup } from 'vue'

const id = ref(1)

watchEffect(async () => {
  const controller = new AbortController()
  
  // Cleanup on re-run or unmount (Vue 3.5+)
  onWatcherCleanup(() => controller.abort())
  
  const res = await fetch(`/api/${id.value}`, { signal: controller.signal })
  data.value = await res.json()
})

// Pause/resume (Vue 3.5+)
const { pause, resume, stop } = watchEffect(() => {})
pause()
resume()
stop()
```

### Flush Timing

```ts
// 'pre' (default) - before component update
// 'post' - after component update (access updated DOM)
// 'sync' - immediate, use with caution

watch(source, callback, { flush: 'post' })
watchPostEffect(() => {})  // Alias for flush: 'post'
```

## Lifecycle Hooks

```ts
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,      // KeepAlive
  onDeactivated,    // KeepAlive
  onServerPrefetch  // SSR only
} from 'vue'

onMounted(() => {
  console.log('DOM is ready')
})

onUnmounted(() => {
  // Cleanup timers, listeners, etc.
})

// Error boundary
onErrorCaptured((err, instance, info) => {
  console.error(err)
  return false  // Stop propagation
})
```

## Effect Scope

Group reactive effects for batch disposal.

```ts
import { effectScope, onScopeDispose } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)
  
  watch(count, () => console.log(count.value))
  
  // Cleanup when scope stops
  onScopeDispose(() => {
    console.log('Scope disposed')
  })
})

// Dispose all effects
scope.stop()
```

## Composables

Composables are functions that encapsulate stateful logic using Composition API.

### Naming Convention

- Start with `use`: `useMouse`, `useFetch`, `useCounter`

### Pattern

```ts
// composables/useMouse.ts
import { shallowRef, onScopeDispose } from 'vue'

export function useMouse() {
  const x = shallowRef(0)
  const y = shallowRef(0)

  const update = (e: MouseEvent) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  window.addEventListener('mousemove', update)
  onScopeDispose(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

### Accept Reactive Input

Use `toValue()` (Vue 3.3+) to normalize refs, getters, or plain values.

```ts
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

export function useFetch(url: MaybeRefOrGetter<string>) {
  const data = ref(null)
  const error = ref(null)

  watchEffect(async () => {
    data.value = null
    error.value = null
    
    try {
      const res = await fetch(toValue(url))
      data.value = await res.json()
    } catch (e) {
      error.value = e
    }
  })

  return { data, error }
}

// Usage - all work:
useFetch('/api/users')
useFetch(urlRef)
useFetch(() => `/api/users/${props.id}`)
```

### Return Refs (Not Reactive)

Always return plain object with refs for destructuring compatibility.

```ts
// Good - preserves reactivity when destructured
return { x, y }

// Bad - loses reactivity when destructured
return reactive({ x, y })
```

<!--
Source references:
- https://vuejs.org/api/reactivity-core.html
- https://vuejs.org/api/reactivity-advanced.html
- https://vuejs.org/api/composition-api-lifecycle.html
- https://vuejs.org/guide/reusability/composables.html
-->

# Built-in Components & Directives

## Transition

Animate enter/leave of a single element or component.

```vue
<template>
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

### CSS Classes

| Class | When |
|-------|------|
| `{name}-enter-from` | Start state for enter |
| `{name}-enter-active` | Active state for enter (add transitions here) |
| `{name}-enter-to` | End state for enter |
| `{name}-leave-from` | Start state for leave |
| `{name}-leave-active` | Active state for leave |
| `{name}-leave-to` | End state for leave |

### Transition Modes

```vue
<!-- Wait for leave to complete before enter -->
<Transition name="fade" mode="out-in">
  <component :is="currentView" />
</Transition>
```

### JavaScript Hooks

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @leave="onLeave"
  :css="false"
>
  <div v-if="show">Content</div>
</Transition>

<script setup lang="ts">
function onEnter(el: Element, done: () => void) {
  // Animate with JS library
  gsap.to(el, { opacity: 1, onComplete: done })
}
</script>
```

### Appear on Initial Render

```vue
<Transition appear name="fade">
  <div>Shows with animation on mount</div>
</Transition>
```

## TransitionGroup

Animate list items. Each child must have a unique `key`.

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
/* Move animation for reordering */
.list-move {
  transition: transform 0.3s ease;
}
</style>
```

## Teleport

Render content to a different DOM location.

```vue
<template>
  <button @click="open = true">Open Modal</button>
  
  <Teleport to="body">
    <div v-if="open" class="modal">
      Modal content rendered at body
    </div>
  </Teleport>
</template>
```

### Props

```vue
<!-- CSS selector -->
<Teleport to="#modal-container">

<!-- DOM element -->
<Teleport :to="targetElement">

<!-- Disable teleport conditionally -->
<Teleport to="body" :disabled="isMobile">

<!-- Defer until target exists (Vue 3.5+) -->
<Teleport defer to="#late-rendered-target">
```

## Suspense

Handle async dependencies with loading states. **Experimental feature.**

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

### Async Dependencies

Suspense waits for:
- Components with `async setup()`
- Components using top-level `await` in `<script setup>`
- Async components created with `defineAsyncComponent`

```vue
<!-- AsyncComponent.vue -->
<script setup lang="ts">
const data = await fetch('/api/data').then(r => r.json())
</script>
```

### Events

```vue
<Suspense
  @pending="onPending"
  @resolve="onResolve"
  @fallback="onFallback"
>
  ...
</Suspense>
```

## KeepAlive

Cache component instances when toggled.

```vue
<template>
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

### Include/Exclude

```vue
<!-- By name (string or regex) -->
<KeepAlive include="ComponentA,ComponentB">
<KeepAlive :include="/^Tab/">
<KeepAlive :include="['TabA', 'TabB']">

<!-- Exclude -->
<KeepAlive exclude="ModalComponent">

<!-- Max cached instances -->
<KeepAlive :max="10">
```

### Lifecycle Hooks

```ts
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  // Called when component is inserted from cache
  fetchLatestData()
})

onDeactivated(() => {
  // Called when component is removed to cache
  pauseTimers()
})
```

## v-memo

Skip re-renders when dependencies unchanged. Use for performance optimization.

```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    <!-- Only re-renders when item.selected changes -->
    <ExpensiveComponent :item="item" />
  </div>
</template>
```

Equivalent to `v-once` when empty:
```vue
<div v-memo="[]">Never updates</div>
```

## v-once

Render once, skip all future updates.

```vue
<span v-once>Static: {{ neverChanges }}</span>
```

## Custom Directives

Create reusable DOM manipulations.

```ts
// Directive definition
const vFocus: Directive<HTMLElement> = {
  mounted: (el) => el.focus()
}

// Full hooks
const vColor: Directive<HTMLElement, string> = {
  created(el, binding, vnode, prevVnode) {},
  beforeMount(el, binding) {},
  mounted(el, binding) {
    el.style.color = binding.value
  },
  beforeUpdate(el, binding) {},
  updated(el, binding) {
    el.style.color = binding.value
  },
  beforeUnmount(el, binding) {},
  unmounted(el, binding) {}
}
```

### Directive Arguments & Modifiers

```vue
<div v-color:background.bold="'red'">

<script setup lang="ts">
const vColor: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    // binding.arg = 'background'
    // binding.modifiers = { bold: true }
    // binding.value = 'red'
    el.style[binding.arg || 'color'] = binding.value
    if (binding.modifiers.bold) {
      el.style.fontWeight = 'bold'
    }
  }
}
</script>
```

### Global Registration

```ts
// main.ts
app.directive('focus', {
  mounted: (el) => el.focus()
})
```

<!--
Source references:
- https://vuejs.org/api/built-in-components.html
- https://vuejs.org/guide/built-ins/transition.html
- https://vuejs.org/guide/built-ins/teleport.html
- https://vuejs.org/guide/built-ins/suspense.html
- https://vuejs.org/guide/built-ins/keep-alive.html
- https://vuejs.org/api/built-in-directives.html
- https://vuejs.org/guide/reusability/custom-directives.html
-->

# Single-File Component Structure, Styling, and Template Patterns

**Impact: MEDIUM** - Using SFCs with consistent structure and performant styling keeps components easier to maintain and avoids unnecessary render overhead.

## Task List

- Use `.vue` SFCs instead of separate `.js`/`.ts` and `.css` files for components
- Colocate template, script, and styles in the same SFC by default
- Use PascalCase for component names in templates and filenames
- Prefer component-scoped styles
- Prefer class selectors (not element selectors) in scoped CSS for performance
- Access DOM / component refs with `useTemplateRef()` in Vue 3.5+
- Use camelCase keys in `:style` bindings for consistency and IDE support
- Use `v-for` and `v-if` correctly
- Never use `v-html` with untrusted/user-provided content
- Choose `v-if` vs `v-show` based on toggle frequency and initial render cost

## Colocate template, script, and styles

**BAD:**
```
components/
├── UserCard.vue
├── UserCard.js
└── UserCard.css
```

**GOOD:**
```vue
<!-- components/UserCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  user: { firstName: string; lastName: string }
}>()

const displayName = computed(() =>
  `${props.user.firstName} ${props.user.lastName}`
)
</script>

<template>
  <div class="user-card">
    <h3 class="name">{{ displayName }}</h3>
  </div>
</template>

<style scoped>
.user-card {
  padding: 1rem;
}

.name {
  margin: 0;
}
</style>
```

## Use PascalCase for component names

**BAD:**
```vue
<script setup>
import userProfile from './user-profile.vue'
</script>

<template>
  <user-profile :user="currentUser" />
</template>
```

**GOOD:**
```vue
<script setup lang="ts">
import UserProfile from './UserProfile.vue'
</script>

<template>
  <UserProfile :user="currentUser" />
</template>
```

## Best practices for `<style>` block in SFCs

### Prefer component-scoped styles

- Use `<style scoped>` for styles that belong to a component.
- Keep **global CSS** in a dedicated file (e.g. `src/assets/main.css`) for resets, typography, tokens, etc.
- Use `:deep()` sparingly (edge cases only).

**BAD:**

```vue
<style>
/* ❌ leaks everywhere */
button { border-radius: 999px; }
</style>
```

**GOOD:**

```vue
<style scoped>
.button { border-radius: 999px; }
</style>
```

**GOOD:**

```css
/* src/assets/main.css */
/* ✅ resets, tokens, typography, app-wide rules */
:root { --radius: 999px; }
```

### Use class selectors in scoped CSS

**BAD:**
```vue
<template>
  <article>
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </article>
</template>

<style scoped>
article { max-width: 800px; }
h1 { font-size: 2rem; }
p { line-height: 1.6; }
</style>
```

**GOOD:**
```vue
<template>
  <article class="article">
    <h1 class="article-title">{{ title }}</h1>
    <p class="article-subtitle">{{ subtitle }}</p>
  </article>
</template>

<style scoped>
.article { max-width: 800px; }
.article-title { font-size: 2rem; }
.article-subtitle { line-height: 1.6; }
</style>
```

## Access DOM / component refs with `useTemplateRef()`

For Vue 3.5+: use `useTemplateRef()` to access template refs.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const inputRef = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

## Use camelCase in `:style` bindings

**BAD:**
```vue
<template>
  <div :style="{ 'font-size': fontSize + 'px', 'background-color': bg }">
    Content
  </div>
</template>
```

**GOOD:**
```vue
<template>
  <div :style="{ fontSize: fontSize + 'px', backgroundColor: bg }">
    Content
  </div>
</template>
```

## Use `v-for` and `v-if` correctly

### Always provide a stable `:key`

- Prefer primitive keys (`string | number`).
- Avoid using objects as keys.

**GOOD:**

```vue
<li v-for="item in items" :key="item.id">
  <input v-model="item.text" />
</li>
```

### Avoid `v-if` and `v-for` on the same element

It leads to unclear intent and unnecessary work.
([Reference](https://vuejs.org/guide/essentials/list.html#v-for-with-v-if))

**To filter items**
**BAD:**

```vue
<li v-for="user in users" v-if="user.active" :key="user.id">
  {{ user.name }}
</li>
```

**GOOD:**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const activeUsers = computed(() => users.value.filter(u => u.active))
</script>

<template>
  <li v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

**To conditionally show/hide the entire list**
**GOOD:**

```vue
<ul v-if="shouldShowUsers">
  <li v-for="user in users" :key="user.id">
    {{ user.name }}
  </li>
</ul>
```

## Never render untrusted HTML with `v-html`

**BAD:**
```vue
<template>
  <!-- DANGEROUS: untrusted input can inject scripts -->
  <article v-html="userProvidedContent"></article>
</template>
```

**GOOD:**
```vue
<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  trustedHtml?: string
  plainText: string
}>()

const safeHtml = computed(() => DOMPurify.sanitize(props.trustedHtml ?? ''))
</script>

<template>
  <!-- Preferred: escaped interpolation -->
  <p>{{ props.plainText }}</p>

  <!-- Only for trusted/sanitized HTML -->
  <article v-html="safeHtml"></article>
</template>
```

## Choose `v-if` vs `v-show` by toggle behavior

**BAD:**
```vue
<template>
  <!-- Frequent toggles with v-if cause repeated mount/unmount -->
  <ComplexPanel v-if="isPanelOpen" />

  <!-- Rarely shown content with v-show pays initial render cost -->
  <AdminPanel v-show="isAdmin" />
</template>
```

**GOOD:**
```vue
<template>
  <!-- Frequent toggles: keep in DOM, toggle display -->
  <ComplexPanel v-show="isPanelOpen" />

  <!-- Rare condition: lazy render only when true -->
  <AdminPanel v-if="isAdmin" />
</template>
```

