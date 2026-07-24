# Component Data Flow Best Practices

**Impact: HIGH** - Vue components stay reliable when data flow is explicit: props go down, events go up, `v-model` handles two-way bindings, and provide/inject supports cross-tree dependencies. Blurring these boundaries leads to stale state, hidden coupling, and hard-to-debug UI.

The main principle of data flow in Vue.js is **Props Down / Events Up**. This is the most maintainable default, and one-way flow scales well.

## Task List

- Treat props as read-only inputs
- Use props/emit for component communication; reserve refs for imperative actions
- When refs are required for imperative APIs, type them with template refs
- Emit events instead of mutating parent state directly
- Use `defineModel` for v-model in modern Vue (3.4+)
- Handle v-model modifiers deliberately in child components
- Use symbols for provide/inject keys to avoid props drilling (over ~3 layers)
- Keep mutations in the provider or expose explicit actions
- In TypeScript projects, prefer type-based `defineProps`, `defineEmits`, and `InjectionKey`

## Props: One-Way Data Down

Props are inputs. Do not mutate them in the child.

**BAD:**
```vue
<script setup>
const props = defineProps({ count: Number })

function increment() {
  props.count++
}
</script>
```

**GOOD:**

```vue
<script setup lang="ts">
const props = defineProps<{ count: number }>()

// Pick the right escape hatch for your case:
// 1. Emit an event and let the parent decide.
const emit = defineEmits<{ increment: [] }>()
function increment() { emit('increment') }

// 2. Two-way binding — prefer `defineModel` (Vue 3.4+).
//    const count = defineModel<number>({ default: 0 })
//    function increment() { count.value++ }

// 3. Local copy when the child needs to mutate freely.
import { ref, watch } from 'vue'
const local = ref(props.count)
watch(() => props.count, (next) => { local.value = next })
function increment() { local.value++ }
</script>
```

## Prefer props/emit over component refs

**BAD:**
```vue
<script setup>
import { ref } from 'vue'
import UserForm from './UserForm.vue'

const formRef = ref(null)

function submitForm() {
  if (formRef.value.isValid) {
    formRef.value.submit()
  }
}
</script>

<template>
  <UserForm ref="formRef" />
  <button @click="submitForm">Submit</button>
</template>
```

**GOOD:**
```vue
<script setup>
import UserForm from './UserForm.vue'

function handleSubmit(formData) {
  api.submit(formData)
}
</script>

<template>
  <UserForm @submit="handleSubmit" />
</template>
```

## Type component refs when imperative access is required

Prefer props/emits by default. When a parent must call an exposed child method, type the ref explicitly and expose only the intended API from the child with `defineExpose`.

**BAD:**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DialogPanel from './DialogPanel.vue'

const panelRef = ref(null)

onMounted(() => {
  panelRef.value.open()
})
</script>

<template>
  <DialogPanel ref="panelRef" />
</template>
```

**GOOD:**
```vue
<!-- DialogPanel.vue -->
<script setup lang="ts">
function open() {}

defineExpose({ open })
</script>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import DialogPanel from './DialogPanel.vue'

// Vue 3.5+ with useTemplateRef
const panelRef = useTemplateRef('panelRef')

// Before Vue 3.5 with manual typing and ref
// const panelRef = ref<InstanceType<typeof DialogPanel> | null>(null)

onMounted(() => {
  panelRef.value?.open()
})
</script>

<template>
  <DialogPanel ref="panelRef" />
</template>
```

## Emits: Explicit Events Up

Component events do not bubble. If a parent needs to know about an event from a grandchild, the child in between must re-emit it.

**BAD:**
```vue
<!-- Parent.vue -->
<!-- Parent listens for `saved`, but Parent only sees Child — events don't bubble up the component tree. -->
<Child @saved="onSaved" />
```

**GOOD:**
```vue
<!-- Child.vue (sits between Parent and Grandchild) -->
<script setup lang="ts">
const emit = defineEmits<{ saved: [payload: { id: string }] }>()

function onGrandchildSaved(payload: { id: string }) {
  emit('saved', payload)
}
</script>

<template>
  <!-- Child re-emits the grandchild's event to its own parent. -->
  <Grandchild @saved="onGrandchildSaved" />
</template>
```

**Event naming:** use kebab-case in templates and camelCase in script:
```vue
<script setup>
const emit = defineEmits(['updateUser'])
</script>

<template>
  <ProfileForm @update-user="emit('updateUser', $event)" />
</template>
```

## `v-model`: Predictable Two-Way Bindings

Use `defineModel` by default for component bindings and emit updates on input. Only use the `modelValue` + `update:modelValue` pattern if you are on Vue < 3.4.

**BAD:**
```vue
<script setup>
const props = defineProps({ value: String })
</script>

<template>
  <input :value="props.value" @input="$emit('input', $event.target.value)" />
</template>
```

**GOOD (Vue 3.4+):**
```vue
<script setup>
const model = defineModel({ type: String })
</script>

<template>
  <input v-model="model" />
</template>
```

**GOOD (Vue < 3.4):**
```vue
<script setup>
const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

If you need the updated value immediately after a change, use the input event value or `nextTick` in the parent.

## Provide/Inject: Shared Context Without Prop Drilling

Use provide/inject for cross-tree state, but keep mutations centralized in the provider and expose explicit actions.

**BAD:**
```vue
// Provider.vue
provide('theme', reactive({ dark: false }))

// Consumer.vue
const theme = inject('theme')
// Mutating shared state from any depth becomes hard to track
theme.dark = true
```

**GOOD:**
```ts
import type { InjectionKey } from 'vue'
import { reactive, readonly, type Ref } from 'vue'

interface Theme {
  dark: boolean
}

interface ThemeActions {
  toggleTheme: () => void
}

// Type the keys — the parent's `InjectionKey<T>` and the consumer's
// `inject(key)` agree at compile time, not at runtime.
export const themeKey: InjectionKey<Ref<Theme>> = Symbol('theme')
export const themeActionsKey: InjectionKey<ThemeActions> = Symbol('theme-actions')
```

```vue
<!-- Provider.vue -->
<script setup lang="ts">
import { provide, reactive, readonly } from 'vue'
import { themeKey, themeActionsKey } from './keys'

const theme = reactive({ dark: false })
const toggleTheme = () => { theme.dark = !theme.dark }

provide(themeKey, theme) // reactive — consumers see updates
provide(themeActionsKey, { toggleTheme })
</script>

<!-- Consumer.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { themeKey, themeActionsKey } from './keys'

const theme = inject(themeKey)
const { toggleTheme } = inject(themeActionsKey)!
</script>
```

## Use TypeScript Contracts for Public Component APIs

In TypeScript projects, type component boundaries directly with `defineProps`, `defineEmits`, and `InjectionKey` so invalid payloads and mismatched injections fail at compile time.

**BAD:**
```vue
<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps({
  userId: String
})

const emit = defineEmits(['save'])
const settings = inject('settings')

// Payload shape is not checked here
emit('save', 123)

// Key is string-based and not type-safe
settings?.theme = 'dark'
</script>
```

**GOOD:**
```vue
<script setup lang="ts">
import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'

interface Props {
  userId: string
}

interface Emits {
  save: [payload: { id: string; draft: boolean }]
}

interface Settings {
  theme: 'light' | 'dark'
}

const settingsKey: InjectionKey<Settings> = Symbol('settings')

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Wrap in `reactive` so consumers can read updates through `inject`.
provide(settingsKey, reactive<Settings>({ theme: 'light' }))

const settings = inject(settingsKey)
if (settings) {
  emit('save', { id: props.userId, draft: false })
}
</script>
```

