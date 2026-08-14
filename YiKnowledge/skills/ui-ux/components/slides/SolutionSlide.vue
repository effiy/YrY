<script setup>
defineProps({
  headline: { type: String, default: 'How we solve this' },
  feature1Title: { type: String, default: 'Feature 1' },
  feature1Desc: { type: String, default: 'Description of feature 1' },
  feature2Title: { type: String, default: 'Feature 2' },
  feature2Desc: { type: String, default: 'Description of feature 2' },
  feature3Title: { type: String, default: 'Feature 3' },
  feature3Desc: { type: String, default: 'Description of feature 3' },
  company: { type: String, default: 'Company Name' },
  page: { type: String, default: '3' },
})
</script>

<template>
  <section class="slide">
    <div class="badge mb-6">The Solution</div>
    <h2 class="slide-heading mb-8">{{ headline }}</h2>
    <div class="flex gap-8" style="flex: 1;">
      <div style="flex: 1;">
        <div class="feature-item">
          <div class="feature-icon">&#10003;</div>
          <div class="feature-content">
            <h4>{{ feature1Title }}</h4>
            <p>{{ feature1Desc }}</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">&#10003;</div>
          <div class="feature-content">
            <h4>{{ feature2Title }}</h4>
            <p>{{ feature2Desc }}</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">&#10003;</div>
          <div class="feature-content">
            <h4>{{ feature3Title }}</h4>
            <p>{{ feature3Desc }}</p>
          </div>
        </div>
      </div>
      <div style="flex: 1;" class="card flex items-center justify-center">
        <div class="text-center">
          <div class="text-accent" style="font-size: 80px; margin-bottom: var(--primitive-spacing-4);">&#9670;</div>
          <p class="text-muted">Product screenshot or demo</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>{{ company }}</span>
      <span>{{ page }}</span>
    </div>
  </section>
</template>
