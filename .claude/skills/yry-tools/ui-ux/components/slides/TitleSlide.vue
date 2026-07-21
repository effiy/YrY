<script setup>
defineProps({
  badge: { type: String, default: 'Pitch Deck' },
  title: { type: String, default: 'Your Title Here' },
  subtitle: { type: String, default: 'Your compelling subtitle' },
  cta: { type: String, default: 'Get Started' },
  secondaryCta: { type: String, default: 'Learn More' },
  company: { type: String, default: 'Company Name' },
  date: { type: String, default: '' },
})
</script>

<template>
  <section class="slide slide--glow flex flex-col items-center justify-center text-center">
    <div class="badge mb-6">{{ badge }}</div>
    <h1 class="slide-title mb-6">{{ title }}</h1>
    <p class="slide-subheading mb-8">{{ subtitle }}</p>
    <div class="flex gap-4">
      <a href="#" class="btn btn-primary">{{ cta }}</a>
      <a href="#" class="btn btn-secondary">{{ secondaryCta }}</a>
    </div>
    <div class="slide-footer">
      <span>{{ company }}</span>
      <span>{{ date }}</span>
    </div>
  </section>
</template>
