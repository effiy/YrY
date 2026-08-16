<template>
  <RoleKnowledgePage
    title="SRE"
    domains-word="problem domains"
    description="incident response, observability, and release management for production reliability."
    category="srer"
    :subdirs="subdirs"
  >
    <template #title>
      <RoleNav active="srer" />
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
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/okr/srer')">
          <span class="role-page__quick-nav-icon">🎯</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">SRE OKR</span>
            <span class="role-page__quick-nav-desc">Test & launch loop — test reports & launch records</span>
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

<script setup lang="ts" name="srerHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "incident-response", icon: "🚨", label: "Incident Response", color: "#ef4444", desc: "Production incident management lifecycle — war room protocols, blast radius analysis, rollback drills, oncall handovers, postmortems, and chaos engineering experiments." },
  { id: "observability", icon: "📊", label: "Observability", color: "#1677ff", desc: "Monitoring and observability stack — logs, metrics, traces triad, Docker/K8s monitoring, GPU inference observability, CI/CD pipeline visibility, and SLO tracking dashboards." },
  { id: "release", icon: "🚀", label: "Release", color: "#10b981", desc: "Safe deployment practices — canary releases, hotfix protocols, release freeze management, rollback procedures, and progressive delivery strategies." }
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
