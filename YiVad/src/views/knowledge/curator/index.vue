<template>
  <RoleKnowledgePage
    title="Curator"
    domains-word="domains"
    description="governance, templates, diagrams, and archive for the knowledge base lifecycle."
    category="curator"
    :subdirs="subdirs"
  />
</template>

<script setup lang="ts" name="curatorHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";

const subdirs = [
  { id: "governance", icon: "⚖️", label: "Governance", color: "#1677ff", desc: "Knowledge base lifecycle management — review cycles, quality gates, triage protocols, tacit knowledge capture, readiness checklists, and knowledge evolution strategy." },
  { id: "templates", icon: "📝", label: "Templates", color: "#10b981", desc: "Standardized document templates for consistent knowledge creation — ADR, BRD, PRD, tech design, retrospectives, usability tests, and knowledge leaf specifications." },
  { id: "diagrams", icon: "📊", label: "Diagrams", color: "#7c3aed", desc: "Visual knowledge architecture — directory blueprints, knowledge maps, and user journey diagrams that reveal cross-department flow and knowledge bottlenecks." },
  { id: "archive", icon: "🗄️", label: "Archive", color: "#f59e0b", desc: "Deprecated and superseded content — preserved for historical traceability and audit, organized by original category for forensic lookup." }
];
</script>
