# Vue Plugin Best Practices

**Impact: MEDIUM** - Vue plugins should follow the `app.use()` contract, expose explicit capabilities, and use collision-safe injection keys. This keeps plugin setup predictable and composable across large apps.

## Task List

- Export plugins as an object with `install()` or as an install function
- Use the `app` instance in `install()` to register components/directives/provides
- Type plugin APIs with `Plugin` (and options tuple types when needed)
- Use symbol keys (prefer `InjectionKey<T>`) for `provide/inject` in plugins
- Add a small typed composable wrapper for required injections to fail fast

## Structure Plugins for `app.use()`

A Vue plugin must be either:
- An object with `install(app, options?)`
- A function with the same signature

**BAD:**
```ts
const notAPlugin = {
  doSomething() {}
}

app.use(notAPlugin)
```

**GOOD:**
```ts
import type { App, InjectionKey, Plugin } from 'vue'

interface PluginOptions {
  prefix?: string
  debug?: boolean
}

interface MyPluginApi {
  prefix: string
}

const myPluginKey: InjectionKey<MyPluginApi> = Symbol('myPlugin')

const myPlugin: Plugin<[PluginOptions]> = {
  install(app: App, options: PluginOptions = {}) {
    const { prefix = 'my', debug = false } = options

    if (debug) {
      console.log('Installing myPlugin with prefix:', prefix)
    }

    app.provide(myPluginKey, { prefix })
  }
}

app.use(myPlugin, { prefix: 'custom', debug: true })
```

**GOOD:**
```ts
import type { App, Plugin } from 'vue'

interface SimplePluginOptions {
  message: string
}

const simplePlugin: Plugin<[SimplePluginOptions]> = (app: App, options?: SimplePluginOptions) => {
  app.config.globalProperties.$greet = () => options?.message ?? 'Hello!'
}

app.use(simplePlugin, { message: 'Welcome!' })
```

## Register Capabilities Explicitly in `install()`

Inside `install()`, wire behavior through Vue application APIs:
- `app.component()` for global components
- `app.directive()` for global directives
- `app.provide()` for injectable services and config
- `app.config.globalProperties` for optional global helpers (sparingly)

**BAD:**
```ts
const uselessPlugin = {
  install(app, options) {
    const service = createService(options)
  }
}
```

**GOOD:**
```ts
import type { InjectionKey, Plugin } from 'vue'

interface Service {
  fetch(): Promise<void>
}

const serviceKey: InjectionKey<Service> = Symbol('plugin-service')

const usefulPlugin: Plugin<[{ apiKey: string }]> = {
  install(app, options) {
    const service: Service = createService(options)
    app.provide(serviceKey, service)
  }
}
```

## Type Plugin Contracts

Use Vue's `Plugin` type to keep install signatures and options type-safe.

```ts
import type { App, InjectionKey, Plugin } from 'vue'

interface MyOptions {
  apiKey: string
}

const apiKeyKey: InjectionKey<string> = Symbol('plugin-api-key')

const myPlugin: Plugin<[MyOptions]> = {
  install(app: App, options: MyOptions) {
    app.provide(apiKeyKey, options.apiKey)
  }
}
```

## Use Symbol Injection Keys in Plugins

String keys can collide (`'http'`, `'config'`, `'i18n'`). Use symbol keys with `InjectionKey<T>` so injections are unique and typed.

**BAD:**
```ts
export default {
  install(app) {
    app.provide('http', axios)
    app.provide('config', appConfig)
  }
}
```

**GOOD:**
```ts
import type { InjectionKey } from 'vue'
import type { AxiosInstance } from 'axios'

interface AppConfig {
  apiUrl: string
  timeout: number
}

export const httpKey: InjectionKey<AxiosInstance> = Symbol('http')
export const configKey: InjectionKey<AppConfig> = Symbol('appConfig')

export default {
  install(app) {
    app.provide(httpKey, axios)
    app.provide(configKey, { apiUrl: '/api', timeout: 5000 })
  }
}
```

## Provide Required Injection Helpers

Wrap required injections in composables that throw clear setup errors.

```ts
import { inject, type InjectionKey } from 'vue'

// Co-locate these with the plugin that provides them.
export interface AuthService {
  currentUser(): { id: string; name: string } | null
  signOut(): Promise<void>
}

export const authKey: InjectionKey<AuthService> = Symbol('auth')

export function useAuth(): AuthService {
  const auth = inject(authKey, undefined as AuthService | undefined)
  if (!auth) {
    throw new Error('Auth plugin not installed. Did you forget app.use(authPlugin)?')
  }
  return auth
}
```

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

