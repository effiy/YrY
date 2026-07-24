# Use Class-based Animations for Non-Enter/Leave Effects

**Impact: LOW** - For animations on elements that are not entering or leaving the DOM, use CSS class-based animations triggered by Vue's reactive state. This is simpler than `<Transition>` and more appropriate for feedback animations like shake, pulse, or highlight effects.

## Task List

- Use class-based animations for elements staying in the DOM
- Use `<Transition>` only for enter/leave animations
- Combine CSS animations with Vue's class bindings (`:class`)
- Consider using `setTimeout` to auto-remove animation classes

**When to Use Class-based Animations:**
- User feedback (shake on error, pulse on success)
- Attention-grabbing effects (highlight changes)
- Hover/focus states that need more than CSS transitions
- Any animation where the element stays mounted

**When to Use Transition Component:**
- Elements entering/leaving the DOM (v-if/v-show)
- Route transitions
- List item additions/removals

## Basic Pattern

```vue
<template>
  <div :class="{ shake: showError }">
    <button @click="submitForm">Submit</button>
    <span v-if="showError">This feature is disabled!</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showError = ref(false)

function submitForm() {
  if (!isValid()) {
    // Trigger shake animation
    showError.value = true

    // Auto-remove class after animation completes
    setTimeout(() => {
      showError.value = false
    }, 820)  // Match animation duration
  }
}
</script>

<style>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);  /* Enable GPU acceleration */
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
```

## Common Animation Patterns

### Pulse on Success

```vue
<template>
  <button
    @click="save"
    :class="{ pulse: saved }"
  >
    {{ saved ? 'Saved!' : 'Save' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const saved = ref(false)

async function save() {
  await saveData()
  saved.value = true
  setTimeout(() => saved.value = false, 1000)
}
</script>

<style>
.pulse {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
```

### Highlight on Change

```vue
<template>
  <div
    :class="{ highlight: justUpdated }"
  >
    Value: {{ value }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const value = ref(0)
const justUpdated = ref(false)

watch(value, () => {
  justUpdated.value = true
  setTimeout(() => justUpdated.value = false, 1000)
})
</script>

<style>
.highlight {
  animation: highlight 1s ease-out;
}

@keyframes highlight {
  0% { background-color: yellow; }
  100% { background-color: transparent; }
}
</style>
```

### Bounce Attention

```vue
<template>
  <div
    :class="{ bounce: needsAttention }"
    @animationend="needsAttention = false"
  >
    <BellIcon />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const needsAttention = ref(false)

function notifyUser() {
  needsAttention.value = true
  // No setTimeout needed - using animationend event
}
</script>

<style>
.bounce {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
```

## Using animationend Event

Instead of `setTimeout`, use the `animationend` event for cleaner code:

```vue
<template>
  <div
    :class="{ animate: isAnimating }"
    @animationend="isAnimating = false"
  >
    Content
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isAnimating = ref(false)

function triggerAnimation() {
  isAnimating.value = true
  // Class is automatically removed when animation ends
}
</script>
```

## Composable for Reusable Animations

Prefer `@animationend` over `setTimeout` so cleanup is automatic and the
composable doesn't leak timers on unmount (per `SKILL.md` rule 7).

```ts
// composables/useClassAnimation.ts
import { shallowRef, onScopeDispose } from 'vue'

export function useClassAnimation() {
  const isAnimating = shallowRef(false)

  function trigger(el: HTMLElement | null) {
    if (!el) return
    isAnimating.value = true

    const onEnd = () => {
      isAnimating.value = false
      el.removeEventListener('animationend', onEnd)
    }
    el.addEventListener('animationend', onEnd)
    onScopeDispose(() => el.removeEventListener('animationend', onEnd))
  }

  return { isAnimating, trigger }
}
```

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useClassAnimation } from '@/composables/useClassAnimation'

const shakeEl = useTemplateRef<HTMLElement>('shakeEl')
const pulseEl = useTemplateRef<HTMLElement>('pulseEl')
const shake = useClassAnimation()
const pulse = useClassAnimation()
</script>

<template>
  <button
    ref="shakeEl"
    :class="{ shake: shake.isAnimating }"
    @click="shake.trigger(shakeEl)"
  >
    Shake me
  </button>

  <button
    ref="pulseEl"
    :class="{ pulse: pulse.isAnimating }"
    @click="pulse.trigger(pulseEl)"
  >
    Pulse me
  </button>
</template>
```

# State-driven Animations with CSS Transitions and Style Bindings

**Impact: LOW** - For responsive, interactive animations that react to user input or state changes, combine Vue's dynamic style bindings with CSS transitions. This creates smooth animations that interpolate values in real-time based on state.

## Task List

- Use `:style` binding for dynamic properties that change frequently
- Add CSS `transition` property to smoothly animate between values
- Consider using `transform` and `opacity` for GPU-accelerated animations
- For complex value interpolation, use watchers with animation libraries

## Basic Pattern

```vue
<template>
  <div
    @mousemove="onMousemove"
    :style="{ backgroundColor: `hsl(${hue}, 80%, 50%)` }"
    class="interactive-area"
  >
    <p>Move your mouse across this div...</p>
    <p>Hue: {{ hue }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hue = ref(0)

function onMousemove(e) {
  // Map mouse X position to hue (0-360)
  const rect = e.currentTarget.getBoundingClientRect()
  hue.value = Math.round((e.clientX - rect.left) / rect.width * 360)
}
</script>

<style>
.interactive-area {
  transition: background-color 0.3s ease;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
```

## Common Use Cases

### Following Mouse Position

```vue
<template>
  <div
    class="container"
    @mousemove="onMousemove"
  >
    <div
      class="follower"
      :style="{
        transform: `translate(${x}px, ${y}px)`
      }"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const x = ref(0)
const y = ref(0)

function onMousemove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  x.value = e.clientX - rect.left
  y.value = e.clientY - rect.top
}
</script>

<style>
.container {
  position: relative;
  height: 300px;
}

.follower {
  position: absolute;
  width: 20px;
  height: 20px;
  background: blue;
  border-radius: 50%;
  /* Smooth following with transition */
  transition: transform 0.1s ease-out;
  /* Prevent the follower from triggering mousemove */
  pointer-events: none;
}
</style>
```

### Progress Animation

```vue
<template>
  <div class="progress-container">
    <div
      class="progress-bar"
      :style="{ width: `${progress}%` }"
    />
  </div>
  <input
    type="range"
    v-model.number="progress"
    min="0"
    max="100"
  />
</template>

<script setup>
import { ref } from 'vue'

const progress = ref(0)
</script>

<style>
.progress-container {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}
</style>
```

### Scroll-based Animation

> Prefer `useEventListener` from `@vueuse/core` over manual
> `addEventListener` / `removeEventListener` so cleanup is automatic. The
> scroll handler below is also throttled with `useThrottleFn` to avoid
> re-renders on every event (per `SKILL.md` rule 7 and the
> `references/perf/perf-updated-hook-performance.md` guidance).

```vue
<template>
  <div
    class="hero"
    :style="{
      opacity: heroOpacity,
      transform: `translateY(${scrollOffset}px)`
    }"
  >
    <h1>Scroll Down</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventListener, useThrottleFn } from '@vueuse/core'

const scrollY = ref(0)

const heroOpacity = computed(() => {
  return Math.max(0, 1 - scrollY.value / 300)
})

const scrollOffset = computed(() => {
  return scrollY.value * 0.5  // Parallax effect
})

const handleScroll = useThrottleFn(() => {
  scrollY.value = window.scrollY
}, 16) // ~60fps

// `useEventListener` auto-removes the listener on scope dispose.
useEventListener(window, 'scroll', handleScroll, { passive: true })
</script>

<style>
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* For decorative parallax, a small transition smooths jitter; for
     pure scroll-locked effects, remove the transition. */
  transition: transform 0.1s linear;
}
</style>
```

### Color Theme Transition

```vue
<template>
  <div
    class="app"
    :style="themeStyles"
  >
    <button @click="toggleTheme">Toggle Theme</button>
    <p>Current theme: {{ isDark ? 'Dark' : 'Light' }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isDark = ref(false)

const themeStyles = computed(() => ({
  '--bg-color': isDark.value ? '#1a1a1a' : '#ffffff',
  '--text-color': isDark.value ? '#ffffff' : '#1a1a1a',
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)'
}))

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<style>
.app {
  min-height: 100vh;
  transition: background-color 0.5s ease, color 0.5s ease;
}
</style>
```

## Advanced: Numerical Tweening with Watchers

For smooth number animations (counters, stats), prefer `useTransition` from
`@vueuse/core` — it gives you a `ref<number>` that animates without adding a
new dependency. Only reach for a library like `gsap` when you need richer
easing or timelines.

```vue
<template>
  <div>
    <input v-model.number="targetNumber" type="number" />
    <p class="counter">{{ Math.round(displayNumber) }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'

const source = ref(0)
const targetNumber = ref(0)

const displayNumber = useTransition(source, {
  duration: 500,
  transition: TransitionPresets.easeOutCubic
})

// Keep `source` in sync with the input — `useTransition` tweens the value.
import { watch } from 'vue'
watch(targetNumber, (next) => {
  source.value = Number(next) || 0
})
</script>
```

## Performance Considerations

```vue
<style>
/* GOOD: GPU-accelerated properties */
.element {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* AVOID: Properties that trigger layout recalculation */
.element {
  transition: width 0.3s ease, height 0.3s ease, margin 0.3s ease;
}

/* For high-frequency updates, consider will-change */
.frequently-animated {
  will-change: transform;
}
</style>
```

