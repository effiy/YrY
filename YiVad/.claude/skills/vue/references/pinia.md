# Pinia — State Management Patterns

> Pinia 2 Setup Store conventions. YiVad uses Pinia with
> `pinia-plugin-persistedstate` for localStorage persistence.

## Store style: Options vs Setup

**Prefer Setup Stores** for all new code. They feel like composables and
types flow naturally without wrappers.

```ts
// ✅ Preferred: Setup Store
export const useCounterStore = defineStore('counter', () => {
  // State = ref/reactive
  const count = ref(0)
  const history = ref<number[]>([])

  // Getters = computed
  const doubled = computed(() => count.value * 2)

  // Actions = functions
  function increment() {
    count.value++
    history.value.push(count.value)
  }

  return { count, history, doubled, increment }
})

// ❌ Legacy: Options Store (use only for existing code compatibility)
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { doubled: (s) => s.count * 2 },
  actions: { increment() { this.count++ } },
})
```

## Reactive destructuring

```ts
// ❌ Breaks reactivity
const { count, doubled } = useCounterStore()

// ✅ Use storeToRefs for state + getters
const store = useCounterStore()
const { count, doubled } = storeToRefs(store)
// Actions can be destructured directly
const { increment } = store
```

## Store composition

```ts
// ✅ Compose stores inside another store
export const useAppStore = defineStore('app', () => {
  const userStore = useUserStore()
  const themeStore = useThemeStore()

  const isReady = computed(() => userStore.isLoggedIn && themeStore.isLoaded)

  async function initialize() {
    await Promise.all([userStore.fetchUser(), themeStore.loadTheme()])
  }

  return { isReady, initialize }
})
```

## Persistence

YiVad uses `pinia-plugin-persistedstate`. Configure in the store definition:

```ts
// In store file or plugin setup:
export const useUserStore = defineStore('user', () => {
  // ... store body ...
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'userInfo'], // only persist these fields
  },
})
```

## Store access patterns

### In components

```ts
// ✅ Import and use directly in setup
const userStore = useUserStore()
const { userInfo, isLoggedIn } = storeToRefs(userStore)
```

### In composables

```ts
// ✅ Call useXxxStore() at the top level of the composable
export function useAuthButtons() {
  const userStore = useUserStore()
  // ...
}
```

### In route guards

```ts
// ✅ Guards run before setup — call the store anyway (Pinia handles it)
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token && to.path !== '/login') {
    return '/login'
  }
})
```

## Store reset pattern

```ts
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)

  // ... getters + actions ...

  function $reset() {
    token.value = ''
    userInfo.value = null
  }

  return { token, userInfo, $reset, /* ... */ }
})
```

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Destructuring state/getters directly | Use `storeToRefs(store)` |
| Mutating state from outside the store | Expose an action instead |
| Using `this` in Setup Store | Use the refs directly (no `this`) |
| Calling `useXxxStore()` outside setup/guard context | Pinia requires an active `pinia` instance — ensure `app.use(pinia)` ran first |
| Forgetting to return from the Setup function | Every state/getter/action used externally must be in the return object |
