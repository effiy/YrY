<script setup>
defineProps({
  badge: { type: String, default: 'Growth' },
  headline: { type: String, default: 'Revenue Growth' },
  chartTitle: { type: String, default: 'Quarterly Revenue' },
  bars: {
    type: Array,
    default: () => [
      { label: 'Q1', value: 40, display: '40%' },
      { label: 'Q2', value: 60, display: '60%' },
      { label: 'Q3', value: 80, display: '80%' },
      { label: 'Q4', value: 100, display: '100%' },
    ],
  },
  company: { type: String, default: 'Company Name' },
  page: { type: String, default: '5' },
})
</script>

<template>
  <section class="slide">
    <div class="badge mb-6">{{ badge }}</div>
    <h2 class="slide-heading mb-8">{{ headline }}</h2>
    <div class="chart-container" style="flex: 1;">
      <div class="chart-title">{{ chartTitle }}</div>
      <div class="bar-chart" style="flex: 1; padding-bottom: 40px;">
        <div
          v-for="(b, i) in bars"
          :key="i"
          class="bar"
          :style="{ height: b.value + '%' }"
        >
          <span class="bar-value">{{ b.display || b.value + '%' }}</span>
          <span class="bar-label">{{ b.label }}</span>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>{{ company }}</span>
      <span>{{ page }}</span>
    </div>
  </section>
</template>
