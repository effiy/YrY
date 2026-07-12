<script setup>
defineProps({
  headline: { type: String, default: 'Ready to get started?' },
  subheadline: { type: String, default: 'Join thousands of teams already using our solution.' },
  cta: { type: String, default: 'Start Free Trial' },
  ctaUrl: { type: String, default: '#' },
  contact: { type: String, default: 'contact@example.com' },
  website: { type: String, default: 'www.example.com' },
})
</script>

<template>
  <section class="slide slide--gradient flex flex-col items-center justify-center text-center">
    <h2 class="slide-heading mb-6" style="color: var(--color-foreground);">{{ headline }}</h2>
    <p class="slide-body mb-8" style="color: rgba(255,255,255,0.8);">{{ subheadline }}</p>
    <div class="flex gap-4">
      <a :href="ctaUrl" class="btn" style="background: var(--color-foreground); color: var(--color-primary);">{{ cta }}</a>
    </div>
    <div class="slide-footer" style="border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.6);">
      <span>{{ contact }}</span>
      <span>{{ website }}</span>
    </div>
  </section>
</template>
