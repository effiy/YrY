<template>
  <RoleKnowledgePage
    title="SRE"
    domains-word="problem domains"
    description="incident response, observability, and release management for production reliability."
    category="srer"
    :subdirs="subdirs"
  >
    <template #title>
      <RoleNav active="srer" show-quick-nav quick-role="srer" sticky />
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="srerHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "incident-response", icon: "🚨", label: "Incident Response", color: "#ef4444", desc: "Production incident management lifecycle — war room protocols, blast radius analysis, rollback drills, oncall handovers, postmortems, and chaos engineering experiments." },
  { id: "observability", icon: "📊", label: "Observability", color: "#1677ff", desc: "Monitoring and observability stack — logs, metrics, traces triad, Docker/K8s monitoring, GPU inference observability, CI/CD pipeline visibility, and SLO tracking dashboards." },
  { id: "release", icon: "🚀", label: "Release", color: "#10b981", desc: "Safe deployment practices — canary releases, hotfix protocols, release freeze management, rollback procedures, and progressive delivery strategies." }
];
</script>
