<template>
  <RoleKnowledgePage
    title="Tech Lead"
    domains-word="domains"
    description="architecture decisions, tech selection, capacity planning, risk management, and roadmap for technical leadership."
    category="leader"
    :subdirs="subdirs"
    :structural-tags="['yivad', 'yiai', 'yipet', 'adr']"
  >
    <template #title>
      <RoleNav active="leader" />
    </template>
    <template #header>
      <ExecutiverQuickNav role="leader" />
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="leaderHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import ExecutiverQuickNav from "@/views/knowledge/components/ExecutiverQuickNav.vue";

const subdirs = [
  { id: "architecture", icon: "🏛️", label: "Architecture", color: "#1677ff", desc: "Technical leadership architecture — maturity model assessments, architecture decision records, tech selection evaluations, and system coherence strategies." },
  { id: "decisions", icon: "📝", label: "Decisions (ADRs)", color: "#10b981", desc: "Architecture Decision Records organized by project — YiAi, YiVad, YiPet, FDE — documenting trade-offs, context, and rationale for key technical choices." },
  { id: "risk", icon: "⚠️", label: "Risk", color: "#ef4444", desc: "Risk management for tech leads — risk register, dependency risk assessment, outage communication protocols, and postmortem methodology." },
  { id: "capacity", icon: "📈", label: "Capacity", color: "#f59e0b", desc: "Capacity planning and cost management — FinOps reviews, cost overrun handling, dependency audits, and capacity trend tracking across YiAi, YiVad, YiPet." },
  { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#7c3aed", desc: "Technical roadmap planning — SLO definition, tech debt management, PoC evaluation, service decommissioning, feature deprecation, and quarterly roadmap reviews." }
];
</script>
