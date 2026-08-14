---
title: vue
name: vue
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
  Do NOT trigger for: Vite build configuration (see /vite),
  UI/UX design review (see /ui-ux), or general HTML/CSS/JS questions
  without Vue.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/vue
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - frontend
  - vue
  - composition-api
chip: ai-methodology
---
# vue — Vue 3 Best Practices & Patterns

> Composition API, Pinia, Vue Router, Element Plus, and SFC conventions — the canonical reference for writing Vue 3 in this project.

## What this skill does

1. **Component structure** — `<script setup lang="ts">` conventions, props/emits typing with `defineProps<{...}>()` and `defineEmits<{...}>()`, SFC ordering (imports → props → composables → state → computed → methods → lifecycle).
2. **Reactivity** — `ref` vs `reactive`, `computed` vs `watch`/`watchEffect`, `shallowRef`/`shallowReactive` for performance, `toRef`/`toRefs` for destructuring.
3. **Pinia stores** — setup-function syntax (`defineStore(() => {...})`), store composition, plugin usage (`pinia-plugin-persistedstate`), store-to-store access patterns.
4. **Vue Router** — hash-mode routing, dynamic routes from backend menu API, navigation guards (`beforeEach`), route meta fields for permissions.
5. **Element Plus** — `el-` prefix components, ProTable as canonical table pattern, form validation, theme overrides via SCSS variables.
6. **Custom directives** — `v-auth` (button-level permissions), `v-copy`, `v-debounce`, `v-throttle`, `v-draggable`, `v-longpress`, `v-watermark`.
7. **Composables** — `useTable`, `useTheme`, `useAuthButtons`, `useSelection` patterns; extracting reusable logic from components.
8. **TypeScript** — strict mode, component type generics, store typing, API response interfaces.

## What this skill does NOT do

- Does NOT cover Vite/Rsbuild build configuration — use `/vite`.
- Does NOT cover UI/UX design review or visual styling decisions — use `/ui-ux`.
- Does NOT cover testing strategy (Vitest, Cypress) — testing infrastructure is project-specific.
- Does NOT teach JavaScript/TypeScript fundamentals or general HTML/CSS.
- Does NOT cover Vue 2 or Options API migration — this project uses Vue 3.5+ only.

## Workflow

1. **Identify the concern** — component structure / reactivity / store / router / UI / directive / composable.
2. **Check project conventions** — read the project's `CLAUDE.md`, `.claude/rules/vue-component-patterns.md`, and `.claude/rules/protable-patterns.md` for project-specific rules.
3. **Apply the pattern** — use the canonical approach from this skill's guidance.
4. **Verify** — check TypeScript compilation (`vue-tsc --noEmit`), ESLint/Prettier compliance.

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files (`src/**`) | read + write |
| `.claude/rules/vue-component-patterns.md` | read |
| `.claude/rules/protable-patterns.md` | read |
| Skill directory | read + write |
| Outside the project | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| User asks about Vue 2 / Options API | Point to Vue 3 migration guide; this skill covers Vue 3.5+ only. |
| User asks about a non-Element Plus UI library (Ant Design, Naive UI) | State the gap; this project uses Element Plus. |
| User asks about Nuxt / SSR | Out of scope; this project is a client-side SPA. |
| User asks about Vite/Rsbuild config | Defer to `/vite`. |
| User asks about testing | State the gap; testing infrastructure is project-specific. |
| User asks in a language other than English | Respond in the user's language; keep code identifiers in original. |
