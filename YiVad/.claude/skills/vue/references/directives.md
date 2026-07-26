# Custom Directives — Patterns

> YiVad custom directive conventions. All directives live in
> `src/directives/modules/` and are registered via `src/directives/index.ts`.

## Directive lifecycle

Vue 3 directive hooks (aligned with component lifecycle):

| Hook | When |
|------|------|
| `created` | Before element attributes/event listeners are applied |
| `mounted` | After element is inserted into DOM (most common) |
| `beforeUpdate` | Before the component updates |
| `updated` | After the component updates |
| `beforeUnmount` | Before the element is removed |
| `unmounted` | After the element is removed |

## v-auth — Permission check

```ts
// src/directives/modules/auth.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/modules/user'

export const auth: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const required = binding.value
    const permissions = userStore.authButtonList as string[]

    if (!required) return

    const hasAuth = Array.isArray(required)
      ? required.some((key) => permissions.includes(key))
      : permissions.includes(required)

    if (!hasAuth) {
      el.parentNode?.removeChild(el) // or: el.style.display = 'none'
    }
  },
}

// Usage:
// <el-button v-auth="'user:create'">Create User</el-button>
// <el-button v-auth="['user:create', 'user:admin']">Admin Only</el-button>
```

## v-copy — Copy to clipboard

```ts
// Directive that copies binding.value to clipboard on click
export const copy: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    el.$value = binding.value
    el.handler = () => {
      navigator.clipboard.writeText(el.$value)
        .then(() => ElMessage.success('Copied!'))
    }
    el.addEventListener('click', el.handler)
  },
  updated(el, binding) {
    el.$value = binding.value
  },
  unmounted(el) {
    el.removeEventListener('click', el.handler)
  },
}
```

## v-debounce — Debounced event

```ts
export const debounce: Directive<HTMLElement, Function> = {
  mounted(el, binding) {
    if (typeof binding.value !== 'function') return
    let timer: ReturnType<typeof setTimeout> | null = null
    const delay = binding.arg ? Number(binding.arg) : 500

    el.addEventListener('click', (e) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => binding.value(), delay)
    })
  },
}
// Usage: <el-button v-debounce:300="handleSubmit">Submit</el-button>
```

## v-throttle — Throttled event

```ts
// Similar to debounce but enforces minimum interval between calls.
// Stores last invocation time; skips if called within the interval.
```

## v-draggable — Drag to move element

```ts
// Makes the bound element draggable within its offset parent.
// Uses mousedown/mousemove/mouseup events with transform: translate().
```

## v-longpress — Long-press trigger

```ts
// Triggers binding.value after a configurable press duration (default 800ms).
// Cancels if the user releases early or moves the pointer.
```

## v-waterMarker — Watermark overlay

```ts
// Renders a semi-transparent watermark text (binding.value) across the element
// using a canvas-based background-image. Redraws on resize via ResizeObserver.
```

## Directive registration pattern

```ts
// src/directives/index.ts
import type { App } from 'vue'
import { auth } from './modules/auth'
import { copy } from './modules/copy'
import { debounce } from './modules/debounce'
import { throttle } from './modules/throttle'
import { draggable } from './modules/draggable'
import { longpress } from './modules/longpress'
import { waterMarker } from './modules/waterMarker'

const directives: Record<string, Directive> = {
  auth, copy, debounce, throttle, draggable, longpress, waterMarker,
}

export function setupDirectives(app: App) {
  Object.entries(directives).forEach(([name, directive]) => {
    app.directive(name, directive)
  })
}
```

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Not cleaning up event listeners in `unmounted` | Always remove listeners to prevent memory leaks |
| Mutating the element in `created` (no DOM yet) | Use `mounted` for DOM manipulation |
| Accessing `useXxxStore()` in directive without active Pinia | Ensure `app.use(pinia)` runs before `setupDirectives(app)` |
| Forgetting `el.$value` update in `updated` hook | If the binding value changes, the directive must reflect it |
