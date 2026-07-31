# TypeScript in Vue 3 — Conventions

> TypeScript integration patterns for Vue 3 SFCs, composables, stores,
> and router. YiVad uses TypeScript strict mode.

## SFC typing

### Props with TypeScript

```ts
// ✅ Preferred: generic type argument
interface Props {
  id: number
  label: string
  disabled?: boolean
  options?: SelectOption[]
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  options: () => [],
})
```

### Emits with TypeScript

```ts
// ✅ Preferred: generic type argument
const emit = defineEmits<{
  (e: 'submit', payload: { id: number; value: string }): void
  (e: 'cancel'): void
}>()
```

### Template refs

```ts
import { ref, type ComponentPublicInstance } from 'vue'
import MyModal from './MyModal.vue'

// Component template ref
const modalRef = ref<InstanceType<typeof MyModal> | null>(null)
// modalRef.value?.open()

// DOM element template ref
const divRef = ref<HTMLDivElement | null>(null)
// divRef.value?.scrollIntoView()

// Vue 3.5+: useTemplateRef
const inputRef = useTemplateRef<HTMLInputElement>('input')
```

### `defineSlots` typing

```ts
const slots = defineSlots<{
  default(props: { item: Item }): any
  header(): any
}>()

// Access typed slot props
// slots.default?.({ item: myItem })
```

### `defineModel` typing

```ts
// Single model
const modelValue = defineModel<string>({ required: true })

// Named model
const visible = defineModel<boolean>('visible', { default: false })

// Complex type
interface FormData { name: string; age: number }
const formData = defineModel<FormData>({ required: true })
```

## Composables typing

```ts
// ✅ Return a typed object — call sites get full inference
export function useCounter(initial = 0) {
  const count = ref(initial)
  const doubled = computed(() => count.value * 2)
  const increment = (delta = 1) => { count.value += delta }

  return { count: readonly(count), doubled, increment }
}

// ✅ If returning an array, use `as const` for tuple inference
export function useToggle(initial = false) {
  const state = ref(initial)
  const toggle = () => { state.value = !state.value }
  return [readonly(state), toggle] as const
}
```

## Store typing (Pinia)

```ts
// ✅ Setup Store: types flow naturally
export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const roles = ref<string[]>([])

  const isAdmin = computed(() => roles.value.includes('admin'))

  async function fetchUser(id: number) {
    const res = await getUserApi(id)
    name.value = res.name
    roles.value = res.roles
  }

  return { name: readonly(name), roles, isAdmin, fetchUser }
})
// Return type is inferred — no manual typing needed
```

## Router typing

```ts
// Route meta typing
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
    auth?: string[]
    activeMenu?: string
  }
}

// Typed useRoute/useRouter
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
// route.meta.title — typed
```

## Directive typing

```ts
import type { Directive, DirectiveBinding } from 'vue'

interface AuthBinding {
  value: string | string[]  // permission key(s)
}

export const auth: Directive<HTMLElement, AuthBinding> = {
  mounted(el, binding) {
    // binding.value is typed as AuthBinding['value']
  },
}
```

## Event bus typing (mitt)

```ts
import mitt from 'mitt'

type Events = {
  'user:login': { id: number; name: string }
  'user:logout': void
  'theme:change': 'light' | 'dark'
}

export const emitter = mitt<Events>()
// emitter.emit('user:login', { id: 1, name: 'Alice' }) — type-checked
```
