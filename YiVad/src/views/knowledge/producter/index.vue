<template>
  <RoleKnowledgePage
    title="Product Manager"
    domains-word="problem domains"
    description="frameworks, discovery, delivery, strategy, and projects for product management."
    category="producter"
    :subdirs="subdirs"
    :structural-tags="['product', 'product-management', 'yivad', 'yiai', 'yipet']"
  >
    <template #title>
      <RoleNav active="producter" />
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
        <div class="role-page__quick-nav-card" @click="$router.push('/executiver/okr/producter')">
          <span class="role-page__quick-nav-icon">🎯</span>
          <div class="role-page__quick-nav-body">
            <span class="role-page__quick-nav-title">Product OKR</span>
            <span class="role-page__quick-nav-desc">Requirement review loop — PRD, acceptance criteria & WSJF prioritization</span>
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

<script setup lang="ts" name="producterHub">
import RoleKnowledgePage from "@/views/knowledge/components/RoleKnowledgePage.vue";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";

const subdirs = [
  { id: "frameworks", icon: "🧩", label: "Frameworks", color: "#1677ff", desc: "Product management frameworks — RICE/ICE prioritization, MoSCoW, JTBD, Kano model, story mapping, OKR design, dual-track agile, and lean startup methodology." },
  { id: "discovery", icon: "🔍", label: "Discovery", color: "#10b981", desc: "User research and product discovery — PRD writing, UX patterns (Nielsen heuristics, accessibility, IA), product metrics (AARRR, NPS, DORA, retention), and AI product analytics." },
  { id: "delivery", icon: "🚀", label: "Delivery", color: "#7c3aed", desc: "Sprint execution and delivery rituals — async meetings, design reviews, retrospectives, sprint planning, quarterly planning, and stakeholder communication cadence." },
  { id: "strategy", icon: "🎯", label: "Strategy", color: "#ef4444", desc: "Product strategy and market positioning — AI after-sales case studies, RAG agent deployment cases, overseas BRD methodology, and competitive analysis." },
  { id: "projects", icon: "📦", label: "Projects", color: "#f59e0b", desc: "Per-project product management — YiAi, YiVad, YiPet project coordination, iteration planning, and stakeholder visibility." }
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
