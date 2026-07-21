<script setup>
defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  concept: { type: String, default: '' },
  purpose: { type: String, default: '' },
  specs: { type: String, default: '' },
})
</script>

<template>
  <div class="deliverable">
    <div class="deliverable-image">
      <img :src="image" :alt="title" loading="lazy">
    </div>
    <div class="deliverable-content">
      <h3 class="deliverable-title">{{ title }}</h3>
      <p class="deliverable-concept">{{ concept }}</p>
      <p class="deliverable-purpose">{{ purpose }}</p>
      <span class="deliverable-specs">{{ specs }}</span>
    </div>
  </div>
</template>
