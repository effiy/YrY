---
name: rui-html-vue
description: >
  Unified Vue 3 knowledge navigator — consolidates 27 source skills
  (15 core Vue 3 topics + 12 VueUse composable categories) into a
  single, topic-routed reference. Use when writing, reviewing, or
  debugging Vue 3 SFCs: Composition API primitives (ref / shallowRef
  / reactive / computed / watch / watchEffect), data flow (props /
  emits / defineModel / provide-inject), built-in components
  (KeepAlive / Suspense / Teleport / Transition), composables (with
  onScopeDispose hygiene), VueUse utilities across 12 categories,
  SFC performance (v-once / v-memo / virtual lists), async components,
  state management (Pinia / plugin install()), slot design, custom
  directives, render functions, the 4-file component pattern,
  infrastructure scripts (W1–W6), running a structured code review
  against the consolidated checklist, producing an optimization
  page report with severity / effort / impact scoring, identifying
  inline code chunks that should be split into a standalone
  component (detection side: 5 heuristics + signal catalog +
  6-question decision tree + priority scoring rubric + scan
  workflow + triage matrix; refactor side: naming convention,
  slot-vs-prop decision matrix, CSS scoping pitfalls, risk
  classification, edge cases, testing, multi-extraction order,
  8-step transformation recipe, single-file SFC vs 4-file pattern
  decision, before/after cookbook). Trigger phrases: "vue 3",
  "composition api", "script setup", "defineProps", "defineEmits",
  "defineModel", "ref vs shallowRef", "v-memo", "useStorage",
  "useFetch", "useEventListener", "createGlobalState", "useDark",
  "useIntersectionObserver", "useVirtualList", "useVModel",
  "KeepAlive", "Suspense", "Teleport", "defineAsyncComponent",
  "useTemplateRef", "v-model modifier", "4-file pattern", "Pinia
  plugin install()", "review my vue code", "code review checklist",
  "optimization report", "what can I improve on this page",
  "page report", "perf audit", "is this a candidate",
  "scan for extraction candidates", "which extraction first",
  "extraction priority", "extract component", "refactor into a
  component", "split out a component", "split into a component",
  "this is duplicated — pull it out", "make this reusable",
  "repeated markup", "inlined button", "inlined card",
  "slot vs prop", "name this component", "extraction risk",
  "extraction broke my styles", "css scoped broke after extract",
  "test the extraction", "order of extractions", "KeepAlive
  extraction", "Teleport extraction", "SSR extraction".

  Do NOT trigger for: React/Angular/Svelte questions, Vue 2 / Nuxt 2
  specifics, or general CSS layout / accessibility patterns not
  specific to Vue.
lifecycle: default-pipeline
user_invocable: true
---

# rui-html-vue

> Unified Vue 3 knowledge navigator. One skill, 27 source skills,
> 249 reference docs, 1 routing table.

This skill consolidates the 27 `rui-html-vue-*` source skills into a
single, topic-routed reference. **Start here** — pick the topic
below that matches the user's question, then read the linked
reference doc(s). When the user describes a problem, match the
keywords to the routing table — every Vue 3 question should land
on exactly one topic.

## Topic Routing

Match the user's question to a topic. The first column is a
recognizable keyword, the second is the topic folder, the third is
the canonical reference doc inside that folder.

| Keyword / Trigger | Topic | Reference |
|---|---|---|
| `<script setup>`, `defineProps`, `defineEmits`, `defineModel`, `defineExpose`, `defineOptions`, `defineSlots`, generic SFC, Vue 3 language | `core/` | [script-setup-macros.md](./references/core/core--script-setup-macros.md), [core-new-apis.md](./references/core/core--core-new-apis.md) |
| SFC structure, `useTemplateRef`, `v-if` vs `v-show`, `v-for` key, `v-html` security, scoped CSS, PascalCase, `camelCase :style` | `core/` | [sfc.md](./references/core/sfc--sfc.md) |
| `ref` vs `shallowRef` vs `reactive`, `computed` vs `watch`, `watchEffect`, `useStorage`, `refDebounced`, `refThrottled`, destructuring from reactive, deep watcher | `reactivity/` | [reactivity.md](./references/reactivity/reactivity--reactivity.md) |
| `v-once`, `v-memo`, virtualize large list, `updated` hook perf, component abstraction in lists | `perf/` | [perf-v-once-v-memo-directives.md](./references/perf/perf-v-once-v-memo-directives.md), [perf-virtualize-large-lists.md](./references/perf/perf-virtualize-large-lists.md), [perf-avoid-component-abstraction-in-lists.md](./references/perf/perf-avoid-component-abstraction-in-lists.md), [perf-updated-hook-performance.md](./references/perf/perf-updated-hook-performance.md) |
| props / emits / `defineModel` / `v-model` modifier / `provide` / `inject` / `InjectionKey` / props drilling | `data-flow/` | [component-data-flow.md](./references/data-flow/component-data-flow.md) |
| Extract composable, `useXxx`, options-object composable, readonly state, pure utility vs composable, `onScopeDispose` | `composables/` | [composables.md](./references/composables/composables.md) |
| `KeepAlive` / `Suspense` / `Teleport` / `Transition` / `TransitionGroup` / `onActivated` / `onDeactivated` / FLIP / `mode out-in` / `move class` | `builtin/` | [component-keep-alive.md](./references/builtin/component-keep-alive.md), [component-suspense.md](./references/builtin/component-suspense.md), [component-teleport.md](./references/builtin/component-teleport.md), [component-transition.md](./references/builtin/component-transition.md), [component-transition-group.md](./references/builtin/component-transition-group.md) |
| Class-based animation (shake / pulse / highlight) / state-driven animation (`:style` + `transition`) / GPU acceleration | `animation/` | [animation-class-based-technique.md](./references/animation/animation-class-based-technique.md), [animation-state-driven-technique.md](./references/animation/animation-state-driven-technique.md) |
| `defineAsyncComponent`, `loadingComponent`, `errorComponent`, `delay` 200ms, `hydrateOnIdle`, `hydrateWhenVisible`, SSR hydration | `async/` | [component-async.md](./references/async/component-async.md) |
| Vue plugin `install()` / `app.use(plugin, options)` / `InjectionKey<T>` / Pinia vs singleton composable / SSR state leak | `state/` | [plugins.md](./references/state/plugins.md), [state-management.md](./references/state/state-management.md) |
| Custom directive / `v-mounted` / `unmounted` cleanup / `h()` render function / JSX / `withModifiers` / `withKeys` / v-model in render | `directives/` | [directives.md](./references/directives/directives.md), [render-functions.md](./references/directives/render-functions.md) |
| Named slot (`#`) / scoped slot / `defineSlots` / slot fallback / `useAttrs` / `attrs.onClick` / `attrs['data-testid']` / `onUpdated` attrs | `slots/` | [component-slots.md](./references/slots/component-slots.md), [component-fallthrough-attrs.md](./references/slots/component-fallthrough-attrs.md) |
| 4-file component pattern / `index.html` + `data.js` + `index.js` + `index.css` / `mountDocComponent` / `data.js` flat / template id unique | `pattern/` | [component-pattern-spec.md](./references/pattern/component-pattern-spec.md) |
| CSS `@import` chain / `--rui-*` → `--rui-doc-*` token bridge / layer responsibilities / theme switch | `css/` | [css-architecture.md](./references/css/css-architecture.md) |
| `mountDocComponent` / `includeHTML` / `data-include` / scroll spy / W1–W6 / pre-delivery checklist | `infra/` | [infrastructure-and-workflows.md](./references/infra/infrastructure-and-workflows.md) |
| Code review of an SFC, `v-html` on user input, `v-for` key, `v-if` + `v-for`, missing cleanup, `useAttrs` reactivity, leaky singleton, severity anchors | `review/` | [code-review-checklist.md](./references/review/code-review-checklist.md) |
| Optimization page report, perf audit, "what can I improve on this page", severity / effort / impact scoring, sprint slice, risk matrix | `optimize/` | [optimization-report.md](./references/optimize/optimization-report.md) |
| **Extract component** (detection side) — is this a candidate? which heuristic? scan a codebase mechanically. 6-question decision tree, priority scoring rubric, signal catalog, triage matrix, falsifiers. Trigger: "is this a candidate", "scan for extractions", "which extraction first", "is this duplicated", "should I extract this" | `extract/` | [component-identification.md](./references/extract/component-identification.md) |
| **Extract component** (refactor side) — execute the extraction. naming convention, slot-vs-prop decision matrix, CSS scoping pitfalls, risk classification, edge cases (SSR / KeepAlive / Teleport / async / provide-inject), testing, multi-extraction order, 8-step transformation recipe, single-file SFC vs 4-file pattern decision, 5-entry before/after cookbook, anti-patterns, scanning patterns, verification | `extract/` | [component-extraction.md](./references/extract/component-extraction.md) |
| `useAnimate`, `useInterval`, `useIntervalFn`, `useNow`, `useRafFn`, `useTimeout`, `useTimeoutFn`, `useTimestamp`, `useTransition` | `vueuse-animation/` | (per-function .md) |
| `useArrayDifference`, `useArrayEvery`, `useArrayFilter`, `useArrayFind`, `useArrayFindIndex`, `useArrayFindLast`, `useArrayIncludes`, `useArrayJoin`, `useArrayMap`, `useArrayReduce`, `useArraySome`, `useArrayUnique`, `useSorted` | `vueuse-array/` | (per-function .md) |
| `useBluetooth`, `useBreakpoints`, `useBroadcastChannel`, `useBrowserLocation`, `useClipboard`, `useColorMode`, `useDark`, `useEventListener`, `useFullscreen`, `useMediaQuery`, `usePermission`, `usePreferredDark`, `useScriptTag`, `useShare`, `useStyleTag`, `useTitle`, `useUrlSearchParams`, `useWakeLock`, `useWebNotification`, `useWebWorker`, … | `vueuse-browser/` | (per-function .md) |
| `computedInject`, `createReusableTemplate`, `createTemplatePromise`, `templateRef`, `tryOnBeforeMount`, `tryOnMounted`, `tryOnScopeDispose`, `useCurrentElement`, `useMounted`, `useTemplateRefsList`, `useVModel`, `useVModels`, `useVirtualList`, `unrefElement` | `vueuse-component/` | (per-function .md) |
| `useActiveElement`, `useDocumentVisibility`, `useDraggable`, `useDropZone`, `useElementBounding`, `useElementSize`, `useElementVisibility`, `useIntersectionObserver`, `useMouseInElement`, `useMutationObserver`, `useResizeObserver`, `useWindowFocus`, `useWindowScroll`, `useWindowSize` | `vueuse-elements/` | (per-function .md) |
| `useEventSource`, `useFetch`, `useWebSocket` | `vueuse-network/` | (per-function .md) |
| `computedAsync`, `computedEager`, `computedWithControl`, `createRef`, `extendRef`, `reactify`, `reactifyObject`, `reactiveComputed`, `reactiveOmit`, `reactivePick`, `refAutoReset`, `refDebounced`, `refDefault`, `refThrottled`, `refManualReset`, `refWithControl`, `syncRef`, `syncRefs`, `toReactive`, `toRef`, `toRefs` | `vueuse-reactivity/` | (per-function .md) |
| `onClickOutside`, `onKeyStroke`, `onLongPress`, `useBattery`, `useDeviceMotion`, `useDeviceOrientation`, `useEventListener`, `useFocus`, `useFocusWithin`, `useFps`, `useGeolocation`, `useIdle`, `useInfiniteScroll`, `useMagicKeys`, `useMouse`, `useMousePressed`, `useNetwork`, `useOnline`, `usePageLeave`, `useParallax`, `usePointer`, `usePointerSwipe`, `useScroll`, `useScrollLock`, `useSpeechRecognition`, `useSwipe`, `useTextSelection`, `useUserMedia` | `vueuse-sensors/` | (per-function .md) |
| `createGlobalState`, `createInjectionState`, `createSharedComposable`, `injectLocal`, `provideLocal`, `useAsyncState`, `useDebouncedRefHistory`, `useLastChanged`, `useLocalStorage`, `useManualRefHistory`, `useRefHistory`, `useSessionStorage`, `useStorage`, `useStorageAsync`, `useThrottledRefHistory` | `vueuse-state/` | (per-function .md) |
| `useCountdown`, `useDateFormat`, `useTimeAgo`, `useTimeAgoIntl` | `vueuse-time/` | (per-function .md) |
| `createDisposableDirective`, `createEventHook`, `createUnrefFn`, `get`, `isDefined`, `makeDestructurable`, `set`, `useAsyncQueue`, `useCached`, `useCloned`, `useConfirmDialog`, `useCounter`, `useCycleList`, `useDebounceFn`, `useEventBus`, `useMemoize`, `useOffsetPagination`, `usePrevious`, `useStepper`, `useSupported`, `useThrottleFn`, `useTimeoutPoll`, `useToNumber`, `useToString`, `useToggle` | `vueuse-utilities/` | (per-function .md) |
| `until`, `watchArray`, `watchAtMost`, `watchDebounced`, `watchDeep`, `watchIgnorable`, `watchImmediate`, `watchOnce`, `watchPausable`, `watchThrottled`, `watchTriggerable`, `watchWithFilter`, `whenever` | `vueuse-watch/` | (per-function .md) |

## What this skill does NOT do

- Does NOT cover React / Angular / Svelte — Vue 3 only.
- Does NOT cover Vue 2 / Nuxt 2 specifics — the routing table targets Vue 3 + Composition API only.
- Does NOT cover general CSS layout / accessibility patterns not specific to Vue — defer to general frontend references.
- Does NOT pull from upstream at answer time — uses a local snapshot of consolidated reference docs under `references/`.

## Rules

1. **Route first, then read.** Match the user's question to a topic in the routing table; don't read every reference doc — load the one that fits.
2. **Prefer templates over render functions.** Templates get compiler optimizations; `h()` / JSX opt out.
3. **Use Composition API + `<script setup lang="ts">`.** Never Options API; never plain `<script>` when SFC works.
4. **Prefer `shallowRef` over `ref` when deep reactivity isn't needed.**
5. **Props are read-only in the child.** Use `defineModel` for two-way bindings.
6. **Use `InjectionKey<T>` symbols for `provide` / `inject`.** Never `inject('foo')` without a typed key.
7. **Side-effect composables must clean up** via `onScopeDispose` / `tryOnScopeDispose`.
8. **Keep `loadingComponent` delay near 200ms** unless real UX data says otherwise.
9. **GPU-accelerate animations** with `transform` / `opacity`.
10. **`v-for` always has `:key`.** `v-if` and `v-for` never on the same element.
11. **Never `v-html` untrusted / user-provided content** — XSS vector.
12. **Use `onUpdated()` for attr-driven side effects** — `useAttrs()` is not reactive.
13. **Singletons leak across requests in SSR/Nuxt** — use Pinia for SSR-safe shared state.
14. **Custom directives are for low-level DOM access only.**
15. **For VueUse: pick by category, not by name.**
16. **Code review vs optimization report are different deliverables.** Review = correctness against the rules; report = opportunity list with severity / effort / impact. Don't conflate them.
17. **Every opportunity in a report cites a location, a rule, and a verification step.** A report without verifiable wins is just a checklist.
18. **Component Extraction entries cite a detection heuristic and a target file.** "This could be a component" is a refactor wish, not a report item — every extraction entry must reference one of the five heuristics (#1 repeated pattern, #2 local state, #3 nesting+size, #4 mixed concerns, #5 inlined primitive) and a concrete `path/to/NewComponent.vue`. If neither can be filled in, drop the entry. The detection heuristics, signal catalog, decision tree, priority rubric, and triage matrix live in [component-identification.md](./references/extract/component-identification.md); the transformation recipe, naming, slot-vs-prop, CSS scoping, risk, edge cases, testing, multi-extraction order, decision tree (single SFC vs 4-file pattern), and before/after cookbook live in [component-extraction.md](./references/extract/component-extraction.md); the optimization report only owns the *entry shape*.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [`references/index.md`](./references/index.md) — human-readable topic table.

## Fallback

| Situation | Behavior |
|---|---|
| User asks a question that doesn't fit any topic | Re-read the routing table; if still no match, ask the user to clarify. Do not invent. |
| Reference doc contradicts another | Prefer the most recently consolidated doc; report the conflict to the user. |
| User wants the previous 28-skill split | The 27 source skills still exist under `rui-html-vue-*` and can be installed individually. This skill supersedes them for daily use. |
| Stale doc — upstream Vue / VueUse changed | Tell the user the snapshot may be stale; suggest re-running the consolidation from the upstream source skills. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
