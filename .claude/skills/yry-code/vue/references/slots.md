# Component Slots Best Practices

**Impact: MEDIUM** - Slots are a core component API surface in Vue. Structure them intentionally so templates stay predictable, typed, and performant.

## Task List

- Use shorthand syntax for named slots (`#` instead of `v-slot:`)
- Render optional slot wrapper elements only when slot content exists (`$slots` checks)
- Type scoped slot contracts with `defineSlots` in TypeScript components
- Provide fallback content for optional slots
- Prefer composables over renderless components for pure logic reuse

## Shorthand syntax for named slots

**BAD:**
```vue
<MyComponent>
  <template v-slot:header> ... </template>
</MyComponent>
```

**GOOD:**
```vue
<MyComponent>
  <template #header> ... </template>
</MyComponent>
```

## Conditionally Render Optional Slot Wrappers

Use `$slots` checks when wrapper elements add spacing, borders, or layout constraints.

**BAD:**
```vue
<!-- Card.vue -->
<template>
  <article class="card">
    <header class="card-header">
      <slot name="header" />
    </header>

    <section class="card-body">
      <slot />
    </section>

    <footer class="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```

**GOOD:**
```vue
<!-- Card.vue -->
<template>
  <article class="card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <section v-if="$slots.default" class="card-body">
      <slot />
    </section>

    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```

## Type Scoped Slot Props with defineSlots

In `<script setup lang="ts">`, use `defineSlots` so slot consumers get autocomplete and static checks.

**BAD:**
```vue
<!-- ProductList.vue -->
<script setup lang="ts">
interface Product {
  id: number
  name: string
}

defineProps<{ products: Product[] }>()
</script>

<template>
  <ul>
    <li v-for="(product, index) in products" :key="product.id">
      <slot :product="product" :index="index" />
    </li>
  </ul>
</template>
```

**GOOD:**
```vue
<!-- ProductList.vue -->
<script setup lang="ts">
interface Product {
  id: number
  name: string
}

defineProps<{ products: Product[] }>()

defineSlots<{
  default(props: { product: Product; index: number }): any
  empty(): any
}>()
</script>

<template>
  <ul v-if="products.length">
    <li v-for="(product, index) in products" :key="product.id">
      <slot :product="product" :index="index" />
    </li>
  </ul>
  <slot v-else name="empty" />
</template>
```

## Provide Slot Fallback Content

Fallback content makes components resilient when parents omit optional slots.

**BAD:**
```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit" class="btn-primary">
    <slot />
  </button>
</template>
```

**GOOD:**
```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit" class="btn-primary">
    <slot>Submit</slot>
  </button>
</template>
```

## Prefer Composables for Pure Logic Reuse

Renderless components are still useful for slot-driven composition, but composables are usually cleaner for logic-only reuse.

**BAD:**
```vue
<!-- MouseTracker.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function onMove(event: MouseEvent) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', onMove))
onUnmounted(() => window.removeEventListener('mousemove', onMove))
</script>

<template>
  <slot :x="x" :y="y" />
</template>
```

**GOOD:**
```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function onMove(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', onMove))
  onUnmounted(() => window.removeEventListener('mousemove', onMove))

  return { x, y }
}
```

```vue
<!-- MousePosition.vue -->
<script setup lang="ts">
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>{{ x }}, {{ y }}</p>
</template>
```

# Component Fallthrough Attributes Best Practices

**Impact: MEDIUM** - Fallthrough attributes are straightforward once you follow Vue's conventions: hyphenated names use bracket notation, listener keys are camelCase `onX`, and `useAttrs()` is current-but-not-reactive.

## Task List

- Access hyphenated attribute names with bracket notation (for example `attrs['data-testid']`)
- Access event listeners with camelCase `onX` keys (for example `attrs.onClick`)
- Do not `watch()` values returned from `useAttrs()`; those watchers do not trigger on attr changes
- Use `onUpdated()` for attr-driven side effects
- Promote frequently observed attrs to props when reactive observation is required

## Access Attribute and Listener Keys Correctly

Hyphenated attribute names preserve their original casing in JavaScript, so dot notation does not work for keys that include `-`.

**BAD:**
```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs.data-testid)  // Syntax error
console.log(attrs.dataTestid)   // undefined for data-testid
console.log(attrs['on-click'])  // undefined
console.log(attrs['@click'])    // undefined
</script>
```

**GOOD:**
```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs['data-testid'])
console.log(attrs['aria-label'])
console.log(attrs['foo-bar'])

console.log(attrs.onClick)
console.log(attrs.onCustomEvent)
console.log(attrs.onMouseEnter)
</script>
```

### Naming Reference

| Parent Usage | Access in `attrs` |
|--------------|-------------------|
| `class="foo"` | `attrs.class` |
| `data-id="123"` | `attrs['data-id']` |
| `aria-label="..."` | `attrs['aria-label']` |
| `foo-bar="baz"` | `attrs['foo-bar']` |
| `@click="fn"` | `attrs.onClick` |
| `@custom-event="fn"` | `attrs.onCustomEvent` |
| `@update:modelValue="fn"` | `attrs['onUpdate:modelValue']` |

## `useAttrs()` Is Not Reactive

`useAttrs()` always reflects the latest values, but it is intentionally not reactive for watcher tracking.

**BAD:**
```vue
<script setup>
import { watch, watchEffect, useAttrs } from 'vue'

const attrs = useAttrs()

watch(
  () => attrs.someAttr,
  (newValue) => {
    console.log('Changed:', newValue) // Never runs on attr changes
  }
)

watchEffect(() => {
  console.log(attrs.class) // Runs on setup, not on attr updates
})
</script>
```

**GOOD:**
```vue
<script setup>
import { onUpdated, useAttrs } from 'vue'

const attrs = useAttrs()

onUpdated(() => {
  console.log('Latest attrs:', attrs)
})
</script>
```

**GOOD:**
```vue
<script setup>
import { watch } from 'vue'

const props = defineProps({
  someAttr: String
})

watch(
  () => props.someAttr,
  (newValue) => {
    console.log('Changed:', newValue)
  }
)
</script>
```

## Common Patterns

### Check for optional attrs safely

> `useAttrs()` is **not reactive** (per `SKILL.md` rule 12). Wrapping it in
> `computed` does not make it re-evaluate on attribute changes — it only runs
> once at setup. Use plain expressions in the template, or `onUpdated` for
> side effects that need to react to attribute changes.

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()

// Plain values — read once at setup, fine for static helpers.
const hasTestId = 'data-testid' in attrs
const ariaLabel = attrs['aria-label'] ?? 'Default label'
</script>

<template>
  <div :data-has-testid="hasTestId" :aria-label="ariaLabel">
    <slot />
  </div>
</template>
```

### Forward listeners after internal logic

```vue
<script setup>
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

function handleClick(event) {
  console.log('Internal handling first')
  attrs.onClick?.(event)
}
</script>

<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>
```

## TypeScript Notes

`useAttrs()` is typed as `Record<string, unknown>`, so cast individual keys when needed.

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()

const testId = attrs['data-testid'] as string | undefined
const onClick = attrs.onClick as ((event: MouseEvent) => void) | undefined
</script>
```

