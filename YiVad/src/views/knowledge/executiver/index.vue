<template>
  <RoleKnowledgePage
    title="Executive"
    domains-word="domains"
    description="strategy, industry analysis, roadmap planning, and reading list for executive decision-making."
    category="executiver"
    :subdirs="subdirs"
    :structural-tags="['resources', 'product', 'product-management', 'product-strategy']"
  >
    <template #title>
      <RoleNav active="executiver" show-quick-nav quick-role="executiver" sticky />
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="executiverHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "Executive strategy frameworks — Porter's Five Forces, Blue Ocean, SWOT, VRIO, product strategy, business model canvas, and value proposition design for competitive advantage." },
  { id: "industry", icon: "🏭", label: "Industry", color: "#1677ff", desc: "Market intelligence and competitive analysis — AI industry reports (Gartner, McKinsey, a16z, CAICT), competitor landscape mapping, and regional market observation." },
  { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#10b981", desc: "Strategic planning cadence — annual planning, quarterly business reviews, OKR tracking, headcount and budget planning, and organizational alignment." },
  { id: "reading-list", icon: "📚", label: "Reading List", color: "#7c3aed", desc: "Executive development reading — curated books, articles, and reading notes on management, leadership, and industry trends for continuous learning." }
];
</script>
