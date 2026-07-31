# Vue 3 Composition API — Patterns

> Reference for `ref`, `reactive`, `computed`, `watch`, `watchEffect`,
> lifecycle hooks, `provide`/`inject`, and SFC macros. Prefer
> `<script setup>` over `defineComponent` for all new code.

## Reactivity fundamentals

### `ref` vs `reactive`

| Feature | `ref` | `reactive` |
|---------|-------|------------|
| Works with primitives | Yes | No (objects only) |
| `.value` access in `<script>` | Required | Not needed (Proxy) |
| `.value` in `<template>` | Auto-unwrapped | Auto-unwrapped |
| Destructurable | No (loses reactivity) | No (use `toRefs`) |
| Replace entire value | Yes (`ref.value = x`) | No (loses reactivity) |
| `watch` deep by default | No | Yes |

**Prefer `ref`** for primitives and single-value state. **Prefer `reactive`**
for form objects and collections where all properties are known upfront.

```ts
// ✅ Good: primitives as refs
const count = ref(0)
const name = ref('')

// ✅ Good: form objects as reactive
const form = reactive({
  username: '',
  password: '',
  remember: false,
})

// ✅ Good: collections as refs (replaceable)
const items = ref<Item[]>([])

// ❌ Avoid: reactive for primitives
const count = reactive({ value: 0 }) // unnecessary nesting
```

### `computed`

```ts
// Read-only computed (most common)
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Writable computed (rare, for v-model on computed)
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val: string) => {
    const [first, last] = val.split(' ')
    firstName.value = first
    lastName.value = last
  },
})
```

**Avoid side effects in `computed`.** Use `watch` or `watchEffect` instead.

### `watch` vs `watchEffect`

| Feature | `watch` | `watchEffect` |
|---------|---------|---------------|
| Explicit source | Yes | No (auto-tracks) |
| Old + new value | Yes | No |
| Lazy (no initial run) | Yes (default) | No (runs immediately) |
| Flush timing | `pre` (default) | `pre` (default) |

```ts
// ✅ watch: explicit source, access old/new values
watch(() => props.userId, (newId, oldId) => {
  if (newId !== oldId) fetchUser(newId)
})

// ✅ watchEffect: auto-track, no old value needed
watchEffect(() => {
  // re-runs when userId.value or orgId.value changes
  console.log(`User: ${userId.value}, Org: ${orgId.value}`)
})

// ✅ watch multiple sources
watch([() => props.a, () => props.b], ([newA, newB], [oldA, oldB]) => {
  // handle change
})
```

**Common mistakes:**

```ts
// ❌ Watching a reactive object property directly
watch(obj.count, (val) => {}) // Error: obj.count is a number, not a Ref

// ✅ Use a getter function
watch(() => obj.count, (val) => {})

// ❌ Forgetting to clean up watchers in composables
watch(source, handler) // leaks if the component unmounts

// ✅ Store cleanup function
const stop = watch(source, handler)
onUnmounted(stop)
```

## SFC macros (`<script setup>` only)

### `defineProps`

```ts
// Generic type annotation (preferred for TypeScript)
interface Props {
  title: string
  count?: number
  items: Item[]
  theme?: 'light' | 'dark'
}
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  theme: 'light',
})
```

### `defineEmits`

```ts
// Generic type annotation
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', id: number): void
  (e: 'close'): void
}>()

// Usage
emit('change', 42)
```

### `defineExpose`

```ts
// Expose to parent via template ref
defineExpose({
  focus: () => inputRef.value?.focus(),
  reset: () => { form.value = initialForm },
})
```

### `defineModel` (Vue 3.4+)

```ts
// Two-way binding shorthand (replaces props + emit boilerplate)
const modelValue = defineModel<string>({ required: true })
const selected = defineModel<number>('selected', { default: 0 })
```

### `defineSlots`

```ts
// Typed slots (Vue 3.3+)
const slots = defineSlots<{
  default(props: { item: Item }): any
  header(): any
  footer(props: { count: number }): any
}>()
```

## Lifecycle hooks

Order of execution in a parent → child tree:
1. Parent `setup` runs
2. Parent `onBeforeMount`
3. Child `setup` runs
4. Child `onBeforeMount`
5. Child `onMounted`
6. Parent `onMounted`

```ts
import { onMounted, onBeforeUnmount, onUnmounted } from 'vue'

// ✅ setup side effects + cleanup
onMounted(() => {
  window.addEventListener('resize', handler)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handler)
})
```

## `provide` / `inject`

```ts
// Provider (ancestor)
import { provide, ref, type InjectionKey } from 'vue'

interface ThemeContext {
  theme: Ref<'light' | 'dark'>
  toggleTheme: () => void
}

export const THEME_KEY: InjectionKey<ThemeContext> = Symbol('theme')

// In setup:
const theme = ref<'light' | 'dark'>('light')
provide(THEME_KEY, {
  theme: readonly(theme),
  toggleTheme: () => { theme.value = theme.value === 'light' ? 'dark' : 'light' },
})

// Injector (descendant)
import { inject } from 'vue'
const ctx = inject(THEME_KEY)
// ctx is ThemeContext | undefined — guard before use
if (!ctx) throw new Error('ThemeContext not provided')
```

## `useTemplateRef` (Vue 3.5+)

```ts
// Replaces template ref with :ref binding
const inputRef = useTemplateRef<HTMLInputElement>('input')
// Access: inputRef.value?.focus()
```

## Shallow reactivity

```ts
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// ✅ Large immutable data — shallowRef avoids deep proxy cost
const bigList = shallowRef<BigItem[]>([])

// Replace entirely (triggers reactivity)
bigList.value = [...bigList.value, newItem]

// If mutating internally, trigger manually
bigList.value.push(newItem)
triggerRef(bigList)
```
