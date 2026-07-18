---
name: script-setup-macros
description: Vue 3 script setup syntax and compiler macros for defining props, emits, models, and more
---

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
// feature. The team's preference (see references/core/core--README.md) is to
// discourage it; prefer the `withDefaults` form below for shared components.
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
