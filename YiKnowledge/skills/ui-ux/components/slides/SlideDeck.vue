<script setup>
import TitleSlide from './TitleSlide.vue'
import ProblemSlide from './ProblemSlide.vue'
import SolutionSlide from './SolutionSlide.vue'
import MetricsSlide from './MetricsSlide.vue'
import ChartSlide from './ChartSlide.vue'
import TestimonialSlide from './TestimonialSlide.vue'
import CtaSlide from './CtaSlide.vue'

const props = defineProps({
  slides: { type: Array, required: true },
  tokensCssPath: { type: String, default: '../../../assets/design-tokens.css' },
})

const componentMap = {
  title: TitleSlide,
  problem: ProblemSlide,
  solution: SolutionSlide,
  metrics: MetricsSlide,
  traction: MetricsSlide,
  chart: ChartSlide,
  testimonial: TestimonialSlide,
  cta: CtaSlide,
  closing: CtaSlide,
}

function slideProps(slide) {
  const normalized = {}
  for (const [k, v] of Object.entries(slide)) {
    if (k === 'type') continue
    // Convert snake_case Python keys to camelCase Vue props
    const camelKey = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    normalized[camelKey] = v
  }
  return normalized
}
</script>

<template>
  <div class="slide-deck">
    <component
      v-for="(slide, i) in slides"
      :key="i"
      :is="componentMap[slide.type] || 'div'"
      v-bind="slideProps(slide)"
    />
  </div>
</template>
