# Vue Router 4 — Patterns

> Router patterns for YiVad's hash-mode SPA with dynamic route
> registration and permission guards.

## Mode

YiVad uses **hash mode** (`createWebHashHistory`). All URLs are `/#/path`.

```ts
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes, // base routes (login, 404, etc.)
})
```

## Dynamic route registration

YiVad loads menu-based routes from the backend API (falls back to local
JSON). Routes are added at runtime via `addRoute`:

```ts
// ✅ Add routes after user login / permission fetch
function addDynamicRoutes(menuList: MenuItem[]) {
  const routes = generateRoutes(menuList)
  routes.forEach((route) => {
    router.addRoute(route)
  })
}

// ✅ Remove all dynamic routes on logout
function resetRouter() {
  // Keep static routes, remove dynamic ones
  const staticNames = staticRoutes.map((r) => r.name)
  router.getRoutes().forEach((r) => {
    if (r.name && !staticNames.includes(r.name)) {
      router.removeRoute(r.name)
    }
  })
}
```

## Navigation guards

Order: `beforeEach` → `beforeResolve` → `afterEach`

```ts
// ✅ Permission guard (runs before every navigation)
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()

  // 1. Whitelist: allow login, 404 without auth
  if (whiteList.includes(to.path)) return true

  // 2. No token → redirect to login
  if (!userStore.token) {
    ElMessage.warning('Please login first')
    return `/login?redirect=${to.path}`
  }

  // 3. Has token but no user info → fetch
  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }

  // 4. Check button-level permissions (handled by v-auth directive)
  return true
})
```

## Route meta conventions

```ts
interface RouteMeta {
  title?: string          // i18n key or literal for breadcrumb/tab
  icon?: string           // Element Plus icon name
  hidden?: boolean        // hide from sidebar menu
  keepAlive?: boolean     // cache component via <keep-alive>
  auth?: string[]         // required permission keys
  activeMenu?: string     // highlight a different menu item
  link?: string           // external link
  isLink?: boolean        // render as <a> instead of <router-link>
}
```

## Nested routes

```ts
// ✅ Layout → children pattern
{
  path: '/',
  component: Layout,
  redirect: '/dashboard',
  children: [
    { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue') },
    { path: 'users', name: 'Users', component: () => import('@/views/users/index.vue') },
  ],
}
```

## Route params and query

```ts
// route.params.* are string | string[] — cast as needed
const userId = Number(route.params.id)

// route.query.* are string | string[] | undefined
const page = Number(route.query.page) || 1
```

## Programmatic navigation

```ts
// ✅ Named routes (preferred — avoids hard-coded paths)
router.push({ name: 'Dashboard' })
router.push({ name: 'UserDetail', params: { id: '42' } })
router.push({ name: 'List', query: { page: '2' } })

// ✅ Path-based (use for redirect params only)
router.push(`/login?redirect=${route.fullPath}`)
```

## Scroll behavior

```ts
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
})
```

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Using `history` mode without server config | Use hash mode (`createWebHashHistory`) unless the server handles SPA fallback |
| Forgetting `await` in async guards | Guards that return a promise block navigation until resolved |
| Mutating `route.params` directly | Params are read-only; use `router.push`/`router.replace` to navigate |
| Calling `useRoute`/`useRouter` outside setup | Only works inside `<script setup>` or setup functions |
| Not resetting dynamic routes on logout | Stale routes persist across sessions — always reset on logout |
