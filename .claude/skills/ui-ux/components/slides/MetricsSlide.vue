<script setup>
defineProps({
  headline: { type: String, default: 'Our Growth' },
  metrics: {
    type: Array,
    default: () => [
      { value: '10K+', label: 'Active Users' },
      { value: '95%', label: 'Retention Rate' },
      { value: '3x', label: 'Revenue Growth' },
      { value: '$2M', label: 'ARR' },
    ],
  },
  company: { type: String, default: 'Company Name' },
  page: { type: String, default: '4' },
})
</script>

<template>
  <section class="slide slide--surface slide--glow">
    <div class="badge mb-6">Traction</div>
    <h2 class="slide-heading mb-8 text-center">{{ headline }}</h2>
    <div class="grid grid-4 gap-6" style="flex: 1; align-items: center;">
      <div v-for="(m, i) in metrics.slice(0, 4)" :key="i" class="card metric">
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </div>
    <div class="slide-footer">
      <span>{{ company }}</span>
      <span>{{ page }}</span>
    </div>
  </section>
</template>
