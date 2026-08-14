<script setup>
defineProps({
  quote: { type: String, default: 'This product changed how we work. Incredible results.' },
  author: { type: String, default: 'Jane Doe' },
  role: { type: String, default: 'CEO, Example Company' },
  company: { type: String, default: 'Company Name' },
  page: { type: String, default: '6' },
})
</script>

<template>
  <section class="slide slide--surface flex flex-col justify-center">
    <div class="badge mb-6">What They Say</div>
    <div class="testimonial" style="max-width: 900px;">
      <p class="testimonial-quote">"{{ quote }}"</p>
      <p class="testimonial-author">{{ author }}</p>
      <p class="testimonial-role">{{ role }}</p>
    </div>
    <div class="slide-footer">
      <span>{{ company }}</span>
      <span>{{ page }}</span>
    </div>
  </section>
</template>
