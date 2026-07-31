---
name: yry-code-vue
description: >
  Vue 3 best-practices reference for Composition API, TypeScript,
  Pinia state management, Vue Router, Element Plus UI, custom
  directives, composables, and SFC conventions. Invoke when the user is
  writing, reviewing, refactoring, or scaffolding Vue 3 components or
  composables; debugging reactivity; designing Pinia stores; configuring
  Vue Router guards or dynamic routes; styling with Element Plus;
  authoring custom directives; or structuring a Vue 3 SPA project.
  Trigger words: "Vue 3", "Vue", "composition API", "ref reactive",
  "computed watch", "Pinia", "Vue Router", "Element Plus", "ElTable",
  "ProTable", "v-auth", "custom directive", "composable", "useXxx",
  "defineProps", "defineEmits", "SFC", "template ref", "provide inject",
  "slot", "teleport", "Suspense", "transition", "Vue i18n", "Vue SPA".
  Do NOT trigger for: Vite build configuration (see yry-code/vite),
  testing strategy (see yry-test), UI/UX design review (see yry-tools/ui-ux),
  or general HTML/CSS/JS questions without Vue.
lifecycle: default-pipeline
user_invocable: true
---

# yry-code-vue — Vue 3 Best Practices

> Opinionated Vue 3 conventions for Composition API, TypeScript, state
> management, routing, and UI. Encodes the *why* and the *shape* of
> idiomatic Vue 3 code in a TypeScript + Element Plus SPA.

## What this skill does

1. **Encodes Vue 3 Composition API conventions** — `ref` vs `reactive`,
   `computed` vs `watch`/`watchEffect`, `defineProps`/`defineEmits` with
   TypeScript generics, `defineExpose`, `useTemplateRef`, lifecycle hooks.
2. **Prescribes Pinia store patterns** — Options Store vs Setup Store,
   `storeToRefs` for reactive destructuring, plugin registration,
   `pinia-plugin-persistedstate` conventions.
3. **Maps Vue Router patterns** — hash vs history mode, dynamic route
   registration, navigation guards (`beforeEach`, `beforeResolve`),
   `addRoute`/`removeRoute` for permission-gated routing, route meta fields.
4. **Documents Element Plus conventions** — ElTable/ElForm/ElDialog
   patterns, icon registration (`@element-plus/icons-vue`), theme
   override via CSS variables, `ElMessage`/`ElNotification` usage.
5. **Guides custom directive authoring** — `v-auth` (permission checks),
   `v-copy`, `v-debounce`, `v-throttle`, `v-draggable`, `v-longpress`,
   `v-waterMarker` — lifecycle, argument binding, SSR compatibility.
6. **Defines composable conventions** — naming (`use*`), return shape
   (reactive object or array of refs), side-effect cleanup (`onUnmounted`),
   composable placement in `src/hooks/`.
7. **Sets SFC structure conventions** — `<script setup lang="ts">` first,
   `<template>` second, `<style lang="scss" scoped>` last; single-root
   components; explicit prop defaults.

## What this skill does NOT do

- Does NOT scaffold a new Vue project. Use `npm create vue@latest` or
  the project's own Vite setup.
- Does NOT cover Vue 2 or Options API migration. Point at the official
  Vue 3 migration guide for those tasks.
- Does NOT run builds, tests, or linting commands. Recommend templates
  and patterns, then let the user execute.
- Does NOT replace the official Vue 3 docs at
  [vuejs.org](https://vuejs.org/). When in doubt, the official reference
  wins; this skill captures judgment and project-specific conventions.
- Does NOT cover Nuxt, VitePress, or other Vue-based meta-frameworks.

## Workflow

1. **Identify the change** — new component? store refactor? route guard?
   directive? composable extraction? Element Plus integration?
2. **Open the matching reference doc** in `references/`.
3. **Apply the pattern**, then re-check against the project's
   `CLAUDE.md` constraints before committing.

Key principles: prefer `<script setup>` over `defineComponent`; prefer
`ref` over `reactive` for primitives and single-value state; prefer
composables over mixins; prefer Pinia Setup Stores over Options Stores
for new code; prefer `storeToRefs` over direct destructuring; always
clean up side effects in `onUnmounted`; Element Plus components are
on-demand registered (unplugin-element-plus or manual import); every
new API call goes through `src/api/index.ts` RequestHttp class.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` (this skill's reference files) | read |
| The user's Vue project (any path the user names) | read + write (with user confirmation) |
| Other installed skills | read-only |

## Supporting resources

- [references/composition-api.md](./references/composition-api.md) — `ref`, `reactive`, `computed`, `watch`, `watchEffect`, lifecycle hooks, `provide`/`inject`, `defineProps`/`defineEmits`/`defineExpose`.
- [references/typescript.md](./references/typescript.md) — TypeScript in Vue SFCs: generic props, emit types, template ref typing, `defineSlots`, `defineModel`, type-only props.
- [references/pinia.md](./references/pinia.md) — Setup Store pattern, `storeToRefs`, `defineStore`, plugin system, persisted state, store composition.
- [references/vue-router.md](./references/vue-router.md) — Hash vs history, dynamic routes, navigation guards, route meta, `addRoute` for permission-gating, scroll behavior.
- [references/element-plus.md](./references/element-plus.md) — Table/Form/Dialog patterns, icon registration, theme override, message/notification API, ElConfigProvider.
- [references/directives.md](./references/directives.md) — Custom directive lifecycle, argument binding, `v-auth` permission pattern, debounce/throttle/copy/draggable/longpress/watermark.
- [references/composables.md](./references/composables.md) — Composable conventions, return shapes, cleanup patterns, composable placement (`src/hooks/`).
- [references/testing.md](./references/testing.md) — Vitest + @vue/test-utils, component mounting, store mocking, directive testing, composable testing.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User asks about Vue 2 / Options API | Point at the official Vue 3 migration guide; this skill covers Vue 3 only. |
| User asks about Nuxt / VitePress | Out of scope; defer to those frameworks' docs. |
| User asks for an API signature | Link to [vuejs.org](https://vuejs.org/api/); this skill encodes judgment, not the API reference. |
| User is debugging a reactivity issue | Walk through `isRef`/`isReactive`/`toRaw` inspection; suggest the Vue DevTools browser extension. |
| User wants code generated for a specific feature | Hand off to the general coding workflow; this skill provides the *pattern*, the user writes the *instance*. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
