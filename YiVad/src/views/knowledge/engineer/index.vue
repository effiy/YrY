<template>
  <RoleKnowledgePage
    title="Engineer"
    domains-word="phases"
    description="Build, Ship, Run, Learn — covering the full design → deploy → operate → learn lifecycle for engineering teams."
    category="engineer"
    :subdirs="subdirs"
    :structural-tags="['yivad', 'yiai', 'yipet']"
  />
</template>

<script setup lang="ts" name="engineerHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";

const subdirs = [
  { id: "build", icon: "🏗️", label: "Build", color: "#1677ff", desc: "Architecture & Development — system design, API and RPC contracts, dev tools, DX, dependency management, vendor evaluation, and project bootstrapping." },
  { id: "ship", icon: "🚀", label: "Ship", color: "#10b981", desc: "Quality, Security, Data & Reliability — supply chain hardening, secrets management, database migration, resilience patterns, observability, and traffic management." },
  { id: "run", icon: "🏃", label: "Run", color: "#8b5cf6", desc: "Process & Onboarding — scenario-based journeys, cross-cutting guides, team workflows, onboarding paths, and forward-deployed engineer operations." },
  { id: "learn", icon: "📖", label: "Learn", color: "#ec4899", desc: "Lessons & Projects — wins, failures, gotchas from real projects, plus YiAi, YiVad, and YiPet project-specific documentation." }
];
</script>
