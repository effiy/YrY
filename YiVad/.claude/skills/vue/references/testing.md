# Testing — Vue 3 Patterns

> Test patterns for Vue 3 components, composables, stores, and
> directives. YiVad uses Vitest + @vue/test-utils (to be added).

## Setup (project baseline)

```bash
npm install -D vitest @vue/test-utils jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

## Component testing

### Minimal mount

```ts
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

test('renders title', () => {
  const wrapper = mount(MyComponent, {
    props: { title: 'Hello' },
  })
  expect(wrapper.text()).toContain('Hello')
})
```

### Testing emitted events

```ts
test('emits submit on button click', async () => {
  const wrapper = mount(MyForm)
  await wrapper.find('[data-test="submit"]').trigger('click')
  expect(wrapper.emitted('submit')).toBeTruthy()
  expect(wrapper.emitted('submit')![0]).toEqual([{ name: 'Alice' }])
})
```

### Testing v-model

```ts
test('v-model syncs value', async () => {
  const wrapper = mount(MyInput, {
    props: { modelValue: 'initial' },
  })
  await wrapper.find('input').setValue('changed')
  expect(wrapper.emitted('update:modelValue')![0]).toEqual(['changed'])
})
```

### Testing async operations

```ts
import { flushPromises } from '@vue/test-utils'

test('loads data on mount', async () => {
  // Mock the API
  vi.mock('@/api/modules/user', () => ({
    getUserList: vi.fn().mockResolvedValue({ data: { list: [{ id: 1 }] } }),
  }))

  const wrapper = mount(UserList)
  await flushPromises()

  expect(wrapper.findAll('[data-test="user-row"]')).toHaveLength(1)
})
```

## Composable testing

### With component wrapper (integration-style)

```ts
test('useCounter increments', () => {
  const wrapper = mount(defineComponent({
    setup() {
      return useCounter()
    },
    template: '<div>{{ count }}</div>',
  }))
  expect(wrapper.text()).toBe('0')
})
```

### With `effectScope` (unit-style)

```ts
import { effectScope } from 'vue'

test('useCounter', () => {
  const scope = effectScope()
  const result = scope.run(() => useCounter())
  expect(result).toBeDefined()
  expect(result!.count.value).toBe(0)
  result!.increment()
  expect(result!.count.value).toBe(1)
  scope.stop() // cleanup
})
```

## Store testing (Pinia)

```ts
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('user store login', async () => {
  const store = useUserStore()
  await store.login({ username: 'admin', password: '123456' })
  expect(store.token).toBeTruthy()
  expect(store.isLoggedIn).toBe(true)
})
```

## Directive testing

```ts
test('v-auth removes unauthorized element', () => {
  // Setup store with permissions
  const userStore = useUserStore()
  userStore.authButtonList = ['user:read']

  const wrapper = mount(defineComponent({
    template: '<button v-auth="\'user:write\'">Delete</button>',
  }), {
    global: { directives: { auth } },
  })

  // Element should be removed
  expect(wrapper.find('button').exists()).toBe(false)
})
```

## Router testing

```ts
import { createRouter, createWebHashHistory } from 'vue-router'

async function createTestRouter() {
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/login', component: Login },
    ],
  })
  await router.push('/')
  await router.isReady()
  return router
}
```

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Forgetting `await` on async user interactions | `trigger('click')` is async — always `await` |
| Not waiting for `flushPromises` after API calls | Components re-render after promises resolve |
| Using real stores in component tests | Mock API responses, use real Pinia instance |
| Shallow mounting with `shallowMount` for integration tests | Use `mount` unless explicitly testing isolation |
| Directly asserting on ref `.value` outside `effectScope` | Always wrap in `effectScope().run()` |
