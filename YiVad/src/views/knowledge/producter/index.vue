<template>
  <RoleKnowledgePage
    title="Product Manager"
    domains-word="problem domains"
    description="frameworks, discovery, delivery, strategy, and projects for product management."
    category="producter"
    :subdirs="subdirs"
    :structural-tags="['product', 'product-management', 'yivad', 'yiai', 'yipet']"
  />
</template>

<script setup lang="ts" name="producterHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";

const subdirs = [
  { id: "frameworks", icon: "🧩", label: "Frameworks", color: "#1677ff", desc: "Product management frameworks — RICE/ICE prioritization, MoSCoW, JTBD, Kano model, story mapping, OKR design, dual-track agile, and lean startup methodology." },
  { id: "discovery", icon: "🔍", label: "Discovery", color: "#10b981", desc: "User research and product discovery — PRD writing, UX patterns (Nielsen heuristics, accessibility, IA), product metrics (AARRR, NPS, DORA, retention), and AI product analytics." },
  { id: "delivery", icon: "🚀", label: "Delivery", color: "#7c3aed", desc: "Sprint execution and delivery rituals — async meetings, design reviews, retrospectives, sprint planning, quarterly planning, and stakeholder communication cadence." },
  { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "Product strategy and market positioning — AI after-sales case studies, RAG agent deployment cases, overseas BRD methodology, and competitive analysis." },
  { id: "projects", icon: "📦", label: "Projects", color: "#f59e0b", desc: "Per-project product management — YiAi, YiVad, YiPet project coordination, iteration planning, and stakeholder visibility." }
];
</script>
