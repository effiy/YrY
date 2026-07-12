<script setup>
import DeliverableCard from './DeliverableCard.vue'

defineProps({
  brandName: { type: String, required: true },
  industry: { type: String, default: 'Technology' },
  styleName: { type: String, default: 'Corporate' },
  mood: { type: String, default: 'Professional' },
  deliverables: {
    type: Array,
    required: true,
    // Each item: { image: String, title: String, concept: String, purpose: String, specs: String }
  },
  generatedDate: { type: String, default: '' },
})
</script>

<template>
  <section class="hero">
    <h1>{{ brandName }}</h1>
    <p class="subtitle">Corporate Identity Program</p>
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Industry</div>
        <div class="meta-value">{{ industry }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Style</div>
        <div class="meta-value">{{ styleName }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Mood</div>
        <div class="meta-value">{{ mood }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Deliverables</div>
        <div class="meta-value">{{ deliverables.length }} Items</div>
      </div>
    </div>
  </section>

  <section class="section">
    <h2 class="section-title">Brand Applications</h2>
    <p class="section-subtitle">
      Comprehensive identity system designed to maintain consistency
      across all brand touchpoints and communications.
    </p>

    <DeliverableCard
      v-for="(item, i) in deliverables"
      :key="i"
      :image="item.image"
      :title="item.title"
      :concept="item.concept"
      :purpose="item.purpose"
      :specs="item.specs"
    />
  </section>

  <footer class="footer">
    <p><strong>{{ brandName }}</strong> Corporate Identity Program</p>
    <p>Generated on {{ generatedDate }}</p>
    <p style="margin-top: 1rem; font-size: 0.8rem;">Powered by CIP Design Skill</p>
  </footer>
</template>
