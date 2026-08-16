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
      <div class="role-page__quick-nav">
        <div class="role-page__quick-nav-card" @click="$router.push('/knowledge/skills')">
          <span class="role-page__quick-nav-icon">🪄</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Skills</span>
            <span class="role-page__quick-nav-desc">Claude Code skills — frontend, backend, platform, AI & business capabilities</span>
          </div>
          <span class="role-page__quick-nav-arrow">→</span>
        </div>
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/okr/leader')">
          <span class="role-page__quick-nav-icon">🎯</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Tech Lead OKR</span>
            <span class="role-page__quick-nav-desc">Technical review loop — ADRs, data models & risk mitigations</span>
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

<script setup lang="ts" name="leaderHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "architecture", icon: "🏛️", label: "Architecture", color: "#1677ff", desc: "Technical leadership architecture — maturity model assessments, architecture decision records, tech selection evaluations, and system coherence strategies." },
  { id: "decisions", icon: "📝", label: "Decisions (ADRs)", color: "#10b981", desc: "Architecture Decision Records organized by project — YiAi, YiVad, YiPet, FDE — documenting trade-offs, context, and rationale for key technical choices." },
  { id: "risk", icon: "⚠️", label: "Risk", color: "#ef4444", desc: "Risk management for tech leads — risk register, dependency risk assessment, outage communication protocols, and postmortem methodology." },
  { id: "capacity", icon: "📈", label: "Capacity", color: "#f59e0b", desc: "Capacity planning and cost management — FinOps reviews, cost overrun handling, dependency audits, and capacity trend tracking across YiAi, YiVad, YiPet." },
  { id: "roadmap", icon: "🗺️", label: "Roadmap", color: "#7c3aed", desc: "Technical roadmap planning — SLO definition, tech debt management, PoC evaluation, service decommissioning, feature deprecation, and quarterly roadmap reviews." }
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
