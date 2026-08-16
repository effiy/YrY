<template>
  <RoleKnowledgePage
    title="Engineer"
    domains-word="phases"
    description="Build, Ship, Run, Learn — covering the full design → deploy → operate → learn lifecycle for engineering teams."
    category="engineer"
    :subdirs="subdirs"
    :structural-tags="['yivad', 'yiai', 'yipet']"
  >
    <template #title>
      <RoleNav active="engineer" />
    </template>
    <template #header>
      <div class="role-page__quick-nav">
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/skills')">
          <span class="role-page__quick-nav-icon">🪄</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Skills</span>
            <span class="role-page__quick-nav-desc">Claude Code skills — frontend, backend, platform, AI & business capabilities</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/okr/engineer')">
          <span class="role-page__quick-nav-icon">🎯</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Engineer OKR</span>
            <span class="role-page__quick-nav-desc">Build & debug loop — 0 new type errors & green build gate</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/pipeline')">
          <span class="role-page__quick-nav-icon">🔄</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Pipeline</span>
            <span class="role-page__quick-nav-desc">Software delivery pipeline — requirements → build → test → launch across roles</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/metrics')">
          <span class="role-page__quick-nav-icon">📊</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Metrics & KPIs</span>
            <span class="role-page__quick-nav-desc">Role metrics & KPIs — goal progress, coverage & quality gates</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
      </div>
    </template>
  </RoleKnowledgePage>
</template>

<script setup lang="ts" name="engineerHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "build", icon: "🏗️", label: "Build", color: "#1677ff", desc: "Architecture & Development — system design, API and RPC contracts, dev tools, DX, dependency management, vendor evaluation, and project bootstrapping." },
  { id: "ship", icon: "🚀", label: "Ship", color: "#10b981", desc: "Quality, Security, Data & Reliability — supply chain hardening, secrets management, database migration, resilience patterns, observability, and traffic management." },
  { id: "run", icon: "🏃", label: "Run", color: "#8b5cf6", desc: "Process & Onboarding — scenario-based journeys, cross-cutting guides, team workflows, onboarding paths, and forward-deployed engineer operations." },
  { id: "learn", icon: "📖", label: "Learn", color: "#ec4899", desc: "Lessons & Projects — wins, failures, gotchas from real projects, plus YiAi, YiVad, and YiPet project-specific documentation." }
];
</script>

<style scoped lang="scss">
.role-page__quick-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.role-page__quick-nav-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--el-bg-color); border-radius: 10px; border: 1px solid var(--el-border-color-lighter); cursor: pointer; transition: box-shadow .2s, border-color .2s, transform .2s; &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.08); transform: translateY(-1px); } }
.role-page__quick-nav-icon { font-size: 28px; flex-shrink: 0; }
.role-page__quick-nav-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.role-page__quick-nav-title { font-size: 14px; font-weight: 700; color: var(--el-text-color-primary); }
.role-page__quick-nav-desc { font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-page__quick-nav-arrow { font-size: 18px; color: var(--el-text-color-placeholder); flex-shrink: 0; transition: color .2s, transform .2s; .role-page__quick-nav-card:hover & { color: var(--el-color-primary); transform: translateX(3px); } }
</style>
