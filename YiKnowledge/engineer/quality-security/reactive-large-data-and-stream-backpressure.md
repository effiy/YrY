---
title: Reactive large data and stream backpressure — shallowRef boundary + SSE chunk consumption
  + keep-alive LRU
tags:
- performance
- reactivity
- shallowref
- vue
- sse
- backpressure
- keep-alive
- lru
- chunk
- debounce
- virtual-scroll
category: engineer/quality-security
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- performance-engineer
- frontend-engineer
- ai-engineer
- code-reviewer
benefit: Frontend no longer stalls or OOMs due to shallowRef vs ref misuse, keep-alive cache accumulation, or SSE production/consumption rate mismatch
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../README.md
- ../../engineer/architecture-design/rpc-envelope-contract.md
- ../../engineer/quality-security/iterative-self-check.md
- ../../../YiVad/src/components/WangEditor/index.vue
- ../../../YiVad/src/directives/modules/debounce.ts
- ../../../YiVad/src/stores/modules/keepAlive.ts
- ../../../YiVad/rsbuild.config.ts
- ../../../YiVad/src/views/code-review/meta-schemas.ts
tacit: false
---

# Reactive large data and stream backpressure — shallowRef boundary + SSE chunk consumption + keep-alive LRU

> **As a** a performance-engineer, **I want to** a Vue 3 reactivity boundary, SSE chunk consumption backpressure, keep-alive cache LRU, bundle chunk strategy, and a virtual scroll threshold rule, **so that** the frontend no longer stalls or OOMs due to `shallowRef` vs `ref` misuse, keep-alive failure, or SSE rate mismatch.

> YiVad / YiPet frontends both have performance-sensitive zones: `WangEditor/index.vue` uses `shallowRef` to hold the editor instance, the `v-debounce` directive, `useKeepAliveStore` to manage route-level cache, and SSE chat / RAG streaming. This document is the canonical performance paradigm reference; during the 2026-07-29 sidebar parity work, the aicr `flatFiles` cache once exposed a stale-state performance bug (see [iterative-self-check](./iterative-self-check.md) Round 17).

## Summary

- **Reactivity only to the boundary layer** — Use `shallowRef` for large objects (editor / chart / store collection); use deep reactivity only for small data (messages list); use `markRaw` to skip third-party instances
- **keep-alive cache must have an upper bound** — `useKeepAliveStore` accumulates names, so an LRU or explicit clear is required; otherwise stale components stay resident in memory
- **SSE backpressure = consumption ≥ production** — Consume each chunk immediately when the caller `reader.read()` returns; do not buffer; if UI rendering cannot keep up, batch with `requestAnimationFrame`
- **chunk strategy = entry + shared vendor** — Split per entry for multiple entries (YiPet has 4 bundles); extract shared vendor into a separate chunk; use dynamic import for route-level lazy loading
- **debounce / throttle is an input constraint** — Search / filter / resize must use `v-debounce`; do not hand-write `setTimeout` everywhere
- **Virtual scroll = 1000 row threshold** — Lists > 1000 rows trigger virtual scrolling; FileTree flatFiles is a high-risk area
- **ECharts resize = ResizeObserver + debounce** — Do not use `window.addEventListener('resize')`

## Core viewpoints

- **Reactivity boundary = shallow for large objects, deep for small data** — Vue 3 `ref` is deep by default; for editor instance / chart instance / large flat arrays use `shallowRef`, only triggering reactivity when reassigning `.value`; deep attribute changes are non-reactive, avoiding the deep proxy performance tax
- **`markRaw` skips third-party instance reactivity wrapping** — When a third-party instance (wangEditor / ECharts / video.js) is put into a ref, Vue tries to deep-proxy wrap it; `markRaw(instance)` tells Vue to skip; otherwise the instance internal state gets intercepted by the proxy, causing instance behavior exceptions
- **keep-alive LRU is a hard constraint** — `useKeepAliveStore` persistently accumulating names leaves stale components resident in memory; more route meta `isKeepAlive: true` makes it worse; use LRU max=10 or explicitly call `removeKeepAliveName` when a route closes
- **SSE chunk production > consumption = buffer accumulation** — During chat / RAG streaming, YiAi-side Ollama chunk production rate is high; the caller `reader.read()` consumption rate depends on UI rendering; if rendering is slow, the browser internal buffer accumulates; backpressure = immediate consumption + UI batch processing
- **Backpressure is not the server's responsibility** — Server-side SSE chunk production is rate-limited by the LLM / Ollama; backpressure is client-side: when consumption cannot keep up, the UI should batch (`requestAnimationFrame`) instead of re-rendering on every chunk
- **Missing chunk strategy = single huge bundle** — YiVad has no explicit `manualChunks`; YiPet splits 4 bundles per entry but has no shared vendor extraction; upgrade direction: extract a `vendor.js` shared chunk (`vue` / `react` / `antd`) via `manualChunks` config
- **debounce / throttle is a project paradigm, not ad-hoc optimization** — The `v-debounce` directive is a project hard constraint; search / filter / resize must use it; do not hand-write `setTimeout(fn, 300)` everywhere
- **Virtual scroll = 1000 row trigger** — ProTable already has lazy render (`ProTable/index.vue:292` comment mentions `el-table hasn't rendered its tbody yet`), but it is not virtualized; FileTree flatFiles large-data scenarios need virtual scrolling

## Key information

### Reactivity boundary (`shallowRef` / `shallowReactive` / `markRaw`)

```typescript
// Paradigm: large objects use shallowRef
import { shallowRef } from "vue";
const editorRef = shallowRef();           // WangEditor/index.vue:25
const chartRef = shallowRef<ECharts>();   // ECharts instance
const fileTree = shallowRef<FlatFile[]>([]);  // flatFiles

// Paradigm: third-party instances use markRaw
import { markRaw, shallowRef } from "vue";
const modalInstance = shallowRef();
modalInstance.value = markRaw(thirdPartyModal);

// Anti-pattern: large objects using ref (deep proxy performance tax)
import { ref } from "vue";
const editorRef = ref();  // every internal attribute change triggers reactivity
```

**Decision criteria**:
| data | reactivity choice | reason |
|---|---|---|
| Form state (small object) | `ref` / `reactive` | field changes need to trigger reactivity |
| Messages list (medium) | `ref([])` + push | append needs reactivity |
| Editor / chart instance | `shallowRef` | instance internal state is non-reactive |
| Large flat array (>1000) | `shallowRef` + manual trigger | deep proxy performance tax |
| third-party instance into ref | `shallowRef` + `markRaw(instance)` | skip proxy wrapping |

### keep-alive cache LRU

```typescript
// Anti-pattern: unlimited accumulation (hypothetical)
const keepAliveStore = useKeepAliveStore();
keepAliveStore.addKeepAliveName(route.fullPath);  // keeps accumulating, no upper bound

// Paradigm: LRU max=10
const MAX_KEEP_ALIVE = 10;
function addKeepAliveName(name: string) {
  if (keepAliveNames.value.length >= MAX_KEEP_ALIVE) {
    keepAliveNames.value.shift();  // LRU evict oldest
  }
  keepAliveNames.value.push(name);
}

// Paradigm: explicitly clear on route close
function removeKeepAliveName(name: string) {
  const idx = keepAliveNames.value.indexOf(name);
  if (idx > -1) keepAliveNames.value.splice(idx, 1);
}
```

`assembly/tabs/index.vue:50` already calls `removeKeepAliveName`, confirming it runs on route close; but there is no max limit — upgrade direction adds LRU.

### SSE chunk consumption and backpressure

**Server-side production** (`YiAi/src/services/ai/chat_service.py` simplified):
```python
async def chat_stream(parameters):
    async def event_generator():
        async for chunk in ollama_chat_stream(...):  # production rate limited by LLM
            yield f"data: {json.dumps({'data': {'message': chunk}})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

**Client-side consumption** (YiVad / YiPet simplified):
```typescript
// Paradigm: consume immediately, batch UI updates
const res = await fetch("/", { method: "POST", body: JSON.stringify(rpc) });
const reader = res.body!.getReader();
const decoder = new TextDecoder();
let buffer = "";
let pendingRender = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  
  // parse SSE framing
  const lines = buffer.split("\n\n");
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const payload = JSON.parse(line.slice(6));
    if (payload.done) return;
    pendingRender += payload.data.message;
  }
  
  // UI batching: requestAnimationFrame coalesce
  requestAnimationFrame(() => {
    if (pendingRender) {
      appendToUI(pendingRender);
      pendingRender = "";
    }
  });
}
```

**Anti-pattern**:
```typescript
// Direct DOM write per chunk
for (const chunk of chunks) {
  document.querySelector("#chat").innerHTML += chunk;  // reflow every time
}

// Accumulate chunks into array then render once (backpressure fails, buffer accumulates)
const allChunks = [];
while (true) {
  const { value } = await reader.read();
  allChunks.push(value);  // OOM risk
}
```

### chunk strategy (rsbuild config)

`YiVad/rsbuild.config.ts:90`:
```typescript
output: {
  filename: "assets/js/[name]-[hash].js",
  chunkFilename: "assets/js/[name]-[hash].js",
}
// no manualChunks config
```

**YiPet 4 bundle split** (each its own rsbuild config):
- `rsbuild.config.cdn.ts` — CDN runtime pass-through
- `rsbuild.config.ts` — main bundle (content script)
- `rsbuild.config.chat.ts` — chat bundle
- `rsbuild.config.bootstrap.ts` — bootstrap script

**Upgrade direction**:
```typescript
// rsbuild.config.ts
performance: {
  chunkSplit: {
    strategy: "split-by-experience",
    // or manually:
    // splitChunks: {
    //   cacheGroups: {
    //     vendor: { test: /[\\/]node_modules[\\/]\(vue|element-plus\)/, name: "vendor" },
    //   },
    // },
  },
},
```

### debounce / throttle (`v-debounce` directive)

`directives/modules/debounce.ts` provides button / input debounce:
```typescript
const debounce: Directive = {
  mounted(el, binding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-debounce: binding.value must be a function");
    }
    el.__debounceTimer__ = null;
    el.addEventListener("click", () => {
      if (el.__debounceTimer__) clearTimeout(el.__debounceTimer__);
      el.__debounceTimer__ = setTimeout(() => {
        binding.value();
        el.__debounceTimer__ = null;
      }, 300);
    });
  },
};

// usage
// <el-button v-debounce="handleSubmit">Submit</el-button>
```

**Applicable scenarios**:
- search input — debounce 300ms
- filter input — debounce 300ms
- submit button — debounce 500ms (prevent double click)
- resize observer — debounce 100ms
- scroll handler — throttle 16ms (60fps)

### ECharts resize Pattern

```typescript
// Paradigm: ResizeObserver + debounce
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
const chartRef = shallowRef<ECharts>();
let resizeObserver: ResizeObserver | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  chartRef.value = echarts.init(container);
  
  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => chartRef.value?.resize(), 100);
  });
  resizeObserver.observe(container);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (resizeTimer) clearTimeout(resizeTimer);
  chartRef.value?.dispose();
});

// Anti-pattern: window resize
window.addEventListener("resize", () => chartRef.value?.resize());
```

### Virtual scroll threshold

| data size | strategy |
|---|---|
| < 100 rows | plain `v-for`, no optimization |
| 100-1000 rows | plain `v-for` + stable `:key` |
| 1000-10000 rows | virtual scroll (`vue-virtual-scroller` / `RecycleScroller`) |
| > 10000 rows | pagination + virtual scroll + backend limit |

**High-risk zones**:
- `fileTreeStore.flatFiles` — aicr file tree, large-data scenario
- `sessions` collection list — YiVad admin backend
- `brd_<topic>` list — BRD table

## Anti-patterns

- **Do not use `ref` for large objects** — deep proxy performance tax; use `shallowRef`
- **Do not let third-party instances become reactivity-wrapped** — `markRaw(instance)` skips
- **Do not accumulate keep-alive names without bound** — LRU or explicit clear required
- **Do not directly write DOM in the SSE chunk loop** — reflow every time; batch with `requestAnimationFrame`
- **Do not accumulate chunks into an array then render** — OOM risk; consume immediately
- **Do not use `window.addEventListener('resize')` for ECharts resize** — ResizeObserver + debounce is the paradigm
- **Do not hand-write `setTimeout(fn, 300)` everywhere** — `v-debounce` directive is the project paradigm
- **Do not pretend ProTable is virtualized** — it is lazy render (`:lazy`), not virtual scroll; switch solution for > 1000 rows
- **Do not ship a single huge bundle** — `manualChunks` extracts vendor shared chunk
- **Do not leave a 1000+ row list un-virtualized** — data-size threshold triggers

## Action recommendations

When auditing new component performance:

1. **Reactivity choice audit** — grep `ref(` call sites, confirm large objects should switch to `shallowRef`; grep `reactive(` call sites, confirm whether `shallowReactive` is needed
2. **`markRaw` audit** — grep `shallowRef()` + third-party instance assignments, confirm whether `markRaw` is applied
3. **keep-alive audit** — grep `addKeepAliveName`, confirm there is an LRU or explicit clear
4. **SSE consumption audit** — grep `reader.read()` + `requestAnimationFrame`, confirm chunk immediate consumption + UI batching
5. **debounce audit** — grep `@input` / `@resize` / `@scroll`, confirm `v-debounce` or explicit `setTimeout`
6. **resize audit** — grep `ResizeObserver`, confirm ECharts / large charts use ResizeObserver + debounce
7. **chunk audit** — run `pnpm build:dev` to inspect bundle size; split any chunk > 500KB

When upgrading existing components:

1. run grep `ref(` to find large-object refs, evaluate each whether to switch to `shallowRef`
2. run grep `useKeepAliveStore` to find all call sites, confirm LRU strategy
3. run Chrome DevTools Performance record 5 seconds of main process, look for long tasks > 50ms
4. run Lighthouse scoring (performance score < 80 is an optimization signal)
5. bundle size audit: `pnpm build:pro` + `webpack-bundle-analyzer` or rsbuild built-in analyzer


- **Using `ref` instead of `shallowRef` for large objects** — `ref` applies deep reactive proxy wrapping to every nested property of the object, which for editor instances, chart instances, or large flat arrays (>1000 items) imposes a significant performance tax. `shallowRef` only triggers reactivity on `.value` reassignment, avoiding the deep proxy overhead.
- **Letting third-party library instances become reactivity-wrapped** — when a wangEditor, ECharts, or video.js instance is placed into a `ref`, Vue attempts to deep-proxy its internal state, which can cause the instance to behave incorrectly. Always wrap third-party instances with `markRaw()` before storing them in a `shallowRef`.
- **Accumulating keep-alive cache names without an upper bound** — `useKeepAliveStore` persistently adds route names with no eviction, so every `isKeepAlive: true` route stays resident in memory forever. An LRU strategy (max=10) or explicit `removeKeepAliveName` on route close is required to prevent memory growth.
- **Accumulating SSE chunks into an array before rendering** — buffering all chunks into an array and rendering once at the end creates OOM risk for long streams and defeats the purpose of streaming. Each chunk must be consumed immediately on `reader.read()`, with UI updates batched via `requestAnimationFrame` to avoid per-chunk reflows.
- **Using `window.addEventListener('resize')` for chart resizing** — the window resize event fires on every pixel change and does not capture container-level size changes (e.g., sidebar collapse, split-pane drag). ECharts and other charts must use `ResizeObserver` on the container element with a debounce wrapper.

- [performance-engineer/README.md](../README.md) — Performance Engineer work directory
- [api-designer/patterns/rpc-envelope-contract.md](../architecture-design/rpc-envelope-contract.md) — SSE shape contract
- [iterative-self-check](./iterative-self-check.md) — Round 17 `toggleFavorite` stale `flatFiles` (performance + cache bug)
- [YiVad/src/components/WangEditor/index.vue](../../../YiVad/src/components/WangEditor/index.vue) — `shallowRef` editor instance paradigm sample
- [YiVad/src/directives/modules/debounce.ts](../../../YiVad/src/directives/modules/debounce.ts) — `v-debounce` directive source of truth
- [YiVad/src/stores/modules/keepAlive.ts](../../../YiVad/src/stores/modules/keepAlive.ts) — keep-alive store
- [YiVad/rsbuild.config.ts](../../../YiVad/rsbuild.config.ts) — chunkFilename strategy (line 90)
- [YiVad/src/views/code-review/meta-schemas.ts](../../../YiVad/src/views/code-review/meta-schemas.ts) — performance review checklist (line 515 performance paradigm)
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template

## Related

- [Iterative self-check](./iterative-self-check.md) — code review patterns covering performance bugs and stale state
- [MongoDB query filter contract](../infrastructure/mongodb-query-filter-contract.md) — backend data contract patterns
- [YiVad one-screen layout](../projects/yivad/one-screen-layout.md) — YiVad layout and scroll optimization pattern
- [YiVad architecture](../projects/yivad/architecture.md) — YiVad architecture with SSE streaming and ProTable data flow
- [SSE onDone guard gotcha](../lessons/gotcha-sse-ondone-guard.md) — SSE streaming gotcha with abort guard
