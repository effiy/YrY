<script setup>
defineProps({
  headline: { type: String, default: 'The problem your audience faces' },
  pain1Title: { type: String, default: 'Pain Point 1' },
  pain1Desc: { type: String, default: 'Description of the first pain point' },
  pain2Title: { type: String, default: 'Pain Point 2' },
  pain2Desc: { type: String, default: 'Description of the second pain point' },
  pain3Title: { type: String, default: 'Pain Point 3' },
  pain3Desc: { type: String, default: 'Description of the third pain point' },
  company: { type: String, default: 'Company Name' },
  page: { type: String, default: '2' },
})
</script>

<template>
  <section class="slide slide--surface">
    <div class="badge mb-6">The Problem</div>
    <h2 class="slide-heading mb-8">{{ headline }}</h2>
    <div class="grid grid-3 gap-8">
      <div class="card">
        <div class="text-primary" style="font-size: var(--primitive-fontSize-4xl); margin-bottom: var(--primitive-spacing-4);">01</div>
        <h4 style="margin-bottom: var(--primitive-spacing-2); font-size: var(--primitive-fontSize-xl);">{{ pain1Title }}</h4>
        <p class="text-muted">{{ pain1Desc }}</p>
      </div>
      <div class="card">
        <div class="text-secondary" style="font-size: var(--primitive-fontSize-4xl); margin-bottom: var(--primitive-spacing-4);">02</div>
        <h4 style="margin-bottom: var(--primitive-spacing-2); font-size: var(--primitive-fontSize-xl);">{{ pain2Title }}</h4>
        <p class="text-muted">{{ pain2Desc }}</p>
      </div>
      <div class="card">
        <div class="text-accent" style="font-size: var(--primitive-fontSize-4xl); margin-bottom: var(--primitive-spacing-4);">03</div>
        <h4 style="margin-bottom: var(--primitive-spacing-2); font-size: var(--primitive-fontSize-xl);">{{ pain3Title }}</h4>
        <p class="text-muted">{{ pain3Desc }}</p>
      </div>
    </div>
    <div class="slide-footer">
      <span>{{ company }}</span>
      <span>{{ page }}</span>
    </div>
  </section>
</template>
