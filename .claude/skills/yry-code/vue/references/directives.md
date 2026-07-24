# Directive Best Practices

**Impact: MEDIUM** - Directives are for low-level DOM access. Use them sparingly, keep them side-effect safe, and prefer components or composables when you need stateful or reusable UI behavior.

## Task List

- Use directives only when you need direct DOM access
- Do not mutate directive arguments or binding objects
- Clean up timers, listeners, and observers in `unmounted`
- Register directives in `<script setup>` with the `v-` prefix
- In TypeScript projects, type directive values and augment template directive types
- Prefer components or composables for complex behavior

## Treat Directive Arguments as Read-Only

Directive bindings are not reactive storage. Don’t write to them.

```ts
const vFocus = {
  mounted(el, binding) {
    // binding.value is read-only
    el.focus()
  }
}
```

## Avoid Directives on Components

Directives apply to DOM elements. When used on components, they attach to the root element and can break if the root changes.

**BAD:**
```vue
<MyInput v-focus />
```

**GOOD:**
```vue
<!-- MyInput.vue -->
<script setup>
const vFocus = (el) => el.focus()
</script>

<template>
  <input v-focus />
</template>
```

## Clean Up Side Effects in `unmounted`

Any timers, listeners, or observers must be removed to avoid leaks. Stash
state on a `WeakMap<Element, …>` rather than on the DOM node itself — the
DOM property pattern (`el._observer`) is a Vue-documented anti-pattern that
leaks through SSR serialization and breaks under ref reuse.

```ts
const resizeObservers = new WeakMap<Element, ResizeObserver>()

const vResize = {
  mounted(el: Element) {
    const observer = new ResizeObserver(() => { /* ... */ })
    observer.observe(el)
    resizeObservers.set(el, observer)
  },
  unmounted(el: Element) {
    resizeObservers.get(el)?.disconnect()
    resizeObservers.delete(el)
  }
}
```

## Prefer Function Shorthand for Single-Hook Directives

If you only need `mounted`/`updated`, use the function form.

```ts
const vAutofocus = (el) => el.focus()
```

## Use the `v-` Prefix and Script Setup Registration

```vue
<script setup>
const vFocus = (el) => el.focus()
</script>

<template>
  <input v-focus />
</template>
```

## Type Custom Directives in TypeScript Projects

Use `Directive<Element, ValueType>` so `binding.value` is typed, and augment Vue's template types so directives are recognized in SFC templates.

**BAD:**
```ts
// Untyped directive value and no template type augmentation
export const vHighlight = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value
  }
}
```

**GOOD:**
```ts
import type { Directive } from 'vue'

type HighlightValue = string

// `satisfies` keeps the literal type narrow and gives the directive
// proper typing without losing inference.
export const vHighlight = {
  mounted(el: HTMLElement, binding: { value: HighlightValue }) {
    el.style.backgroundColor = binding.value
  }
} satisfies Directive<HTMLElement, HighlightValue>

// Augment `ComponentCustomOptions['directives']` so the directive is
// recognized in SFC templates. `ComponentCustomProperties` is for
// instance-level properties (e.g. `this.$myUtil`), not directives.
declare module 'vue' {
  interface ComponentCustomOptions {
    vHighlight?: typeof vHighlight
  }
}
```

## Handle SSR with `getSSRProps`

Directive hooks such as `mounted` and `updated` do not run during SSR. If a directive sets attributes/classes that affect rendered HTML, provide an SSR equivalent via `getSSRProps` to avoid hydration mismatches.

**BAD:**
```ts
const vTooltip = {
  mounted(el, binding) {
    el.setAttribute('data-tooltip', binding.value)
    el.classList.add('has-tooltip')
  }
}
```

**GOOD:**
```ts
const vTooltip = {
  mounted(el, binding) {
    el.setAttribute('data-tooltip', binding.value)
    el.classList.add('has-tooltip')
  },
  getSSRProps(binding) {
    return {
      'data-tooltip': binding.value,
      class: 'has-tooltip'
    }
  }
}
```

## Prefer Declarative Templates When Possible

If a standard attribute or binding works, use it instead of a directive.

## Decide Between Directives and Components

Use a directive for DOM-level behavior. Use a component when behavior affects structure, state, or rendering.

# Render Function Patterns and Performance

**Impact: MEDIUM** - Render functions are powerful but opt out of template compiler optimizations. Use them intentionally and apply the key patterns below to keep output correct and performant.

## Task List

- Prefer templates; use render functions only when templates cannot express the logic
- Always add stable keys when rendering lists with `h()`/JSX
- Use `withModifiers` / `withKeys` for event modifiers
- Implement `v-model` via `modelValue` + `onUpdate:modelValue`
- Apply custom directives with `withDirectives`
- Use functional components for stateless presentational UI

## Prefer templates over render functions

**BAD:**
```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)
const render = () => h('div', `Count: ${count.value}`)
</script>
```

**GOOD:**
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>
```

## Always add keys for list rendering

**BAD:**
```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const items = ref([{ id: 1, name: 'Apple' }])

    return () => h('ul',
      items.value.map(item => h('li', item.name))
    )
  }
}
```

**GOOD:**
```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const items = ref([{ id: 1, name: 'Apple' }])

    return () => h('ul',
      items.value.map(item => h('li', { key: item.id }, item.name))
    )
  }
}
```

## Use `withModifiers` / `withKeys` for event modifiers

**BAD:**
```javascript
import { h } from 'vue'

export default {
  setup() {
    const handleClick = (e) => {
      e.stopPropagation()
      e.preventDefault()
    }

    return () => h('button', { onClick: handleClick }, 'Click')
  }
}
```

**GOOD:**
```javascript
import { h, withModifiers, withKeys } from 'vue'

export default {
  setup() {
    const handleClick = () => {}
    const handleEnter = () => {}

    return () => h('div', [
      h('button', {
        onClick: withModifiers(handleClick, ['stop', 'prevent'])
      }, 'Click'),
      h('input', {
        onKeyup: withKeys(handleEnter, ['enter'])
      })
    ])
  }
}
```

## Implement `v-model` explicitly

**BAD:**
```javascript
import { h, ref } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')
    return () => h(CustomInput, { modelValue: text.value })
  }
}
```

**GOOD:**
```javascript
import { h, ref } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')
    return () => h(CustomInput, {
      modelValue: text.value,
      'onUpdate:modelValue': (value) => { text.value = value }
    })
  }
}
```

## Use `withDirectives` for custom directives

**BAD:**
```javascript
import { h } from 'vue'

const vFocus = { mounted: (el) => el.focus() }

export default {
  setup() {
    return () => h('input', { 'v-focus': true })
  }
}
```

**GOOD:**
```javascript
import { h, withDirectives } from 'vue'

const vFocus = { mounted: (el) => el.focus() }

export default {
  setup() {
    return () => withDirectives(h('input'), [[vFocus]])
  }
}
```

## Prefer functional components for stateless UI

**BAD:**
```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => h('span', { class: 'badge' }, 'New')
  }
}
```

**GOOD:**
```javascript
import { h } from 'vue'

function Badge(props, { slots }) {
  return h('span', { class: 'badge' }, slots.default?.())
}

Badge.props = ['variant']

export default Badge
```

