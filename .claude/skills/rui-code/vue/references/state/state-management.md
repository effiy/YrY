---
title: State Management Strategy
impact: HIGH
impactDescription: Choosing the wrong store pattern can cause SSR request leaks, brittle mutation flows, and poor scaling
type: best-practice
tags: [vue3, state-management, pinia, composables, ssr, vueuse]
---

# State Management Strategy

**Impact: HIGH** - Use the lightest state solution that fits your app architecture. SPA-only apps can use lightweight global composables, while SSR/Nuxt apps should default to Pinia for request-safe isolation and predictable tooling.

## Task List

- Keep state local first, then promote to shared/global only when needed
- Use singleton composables only in non-SSR applications
- Expose global state as readonly and mutate through explicit actions
- Prefer Pinia for SSR/Nuxt, large apps, and advanced debugging/plugin needs
- Avoid exporting mutable module-level reactive state directly

## Choose the Lightest Store Approach

- **Feature composable:** Default for reusable logic with local/feature-level state.
- **Singleton composable or VueUse `createGlobalState`:** Small non-SSR apps needing shared app state.
- **Pinia:** SSR/Nuxt apps, medium-to-large apps, and cases requiring DevTools, plugins, or action tracing.

## Avoid Exporting Mutable Module State

**BAD:**
```ts
// store/cart.ts
import { reactive } from 'vue'

export const cart = reactive({
  items: [] as Array<{ id: string; qty: number }>
})
```

**GOOD:**
```ts
// composables/useCart.ts — non-Pinia singleton (SPA only; see SSR warning below)
import { reactive, readonly } from 'vue'

let _store: ReturnType<typeof createCart> | null = null

function createCart() {
  const state = reactive({
    items: [] as Array<{ id: string; qty: number }>
  })

  function addItem(id: string, qty = 1) {
    const existing = state.items.find((item) => item.id === id)
    if (existing) {
      existing.qty += qty
      return
    }
    state.items.push({ id, qty })
  }

  return {
    state: readonly(state),
    addItem
  }
}

export function useCart() {
  if (!_store) _store = createCart()
  return _store
}
```

## Do Not Use Runtime Singletons in SSR

Module singletons live for the runtime lifetime. In SSR this can leak state between requests.

**BAD:**
```ts
// shared singleton reused across requests
const cart = useCart()

export function useServerCart() {
  return cart
}
```

**GOOD:**

> `pinia` dependency required. Use the **Setup Store** form — `state: () =>`
> Options Store syntax ties you to the Options API style and is forbidden by
> the parent's Rule 3.

```ts
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref<Array<{ id: string; qty: number }>>([])

  function addItem(id: string, qty = 1) {
    const existing = items.value.find((item) => item.id === id)
    if (existing) {
      existing.qty += qty
      return
    }
    items.value.push({ id, qty })
  }

  return { items, addItem }
})
```

## Use `createGlobalState` for Small SPA Global State

> `@vueuse/core` dependency required.

If the app is non-SSR and already uses VueUse, `createGlobalState` removes singleton boilerplate.

```ts
import { createGlobalState } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

export const useAuthState = createGlobalState(() => {
  // Primitive value — `shallowRef` is the team's preferred primitive wrapper
  // (see references/reactivity/reactivity--reactivity.md).
  const token = shallowRef<string | null>(null)
  const isAuthenticated = computed(() => token.value !== null)

  function setToken(next: string | null) {
    token.value = next
  }

  return {
    token,
    isAuthenticated,
    setToken
  }
})
```
