<template>
  <div class="goals">
    <header class="goals__header">
      <h1>Goals &amp; Objectives</h1>
      <p>Role-level goals for YiAi, YiVad, and YiPet. Each role owns objectives that cascade from org strategy down to project execution. Goals are qualitative, time-bound targets backed by Key Results — every goal lives in <code>YiKnowledge/&lt;role&gt;/goals/</code> and is tracked via the Knowledge Base dashboard.</p>
    </header>

    <div class="goals__grid">
      <el-card v-for="role in roleGoals" :key="role.id" class="goals__card" shadow="hover">
        <div class="goals__card-head">
          <span class="goals__card-icon">{{ role.icon }}</span>
          <el-tag type="info" size="small">{{ role.dir }}</el-tag>
        </div>
        <h2 class="goals__card-title">{{ role.name }}</h2>
        <p class="goals__card-desc">{{ role.description }}</p>

        <div class="goals__card-projects">
          <span class="goals__card-projects-label">Projects:</span>
          <div class="goals__card-projects-tags">
            <el-tag v-for="p in role.projects" :key="p" size="small" :type="p === 'YiAi' ? 'primary' : p === 'YiVad' ? 'success' : 'warning'">{{ p }}</el-tag>
          </div>
        </div>

        <el-divider style="margin: 12px 0" />

        <div class="goals__card-keyfiles">
          <span class="goals__card-keyfiles-label">Key directories:</span>
          <div class="goals__card-keyfiles-list">
            <code v-for="k in role.keyFiles" :key="k" class="goals__keyfile-tag">{{ k }}</code>
          </div>
        </div>

        <el-divider style="margin: 12px 0" />

        <div class="goals__card-summary">
          <span class="goals__card-summary-label">{{ role.goalCount }} goals</span>
          <span class="goals__card-summary-names">{{ role.goalNames.join(', ') }}</span>
        </div>

        <div class="goals__card-action">
          <el-button type="primary" size="small" @click="$router.push(`/goals/${role.id}`)">
            View Goals
          </el-button>
        </div>
      </el-card>
    </div>

    <el-divider />

    <section class="goals__cascade">
      <h2>Goal Cascade</h2>
      <p class="goals__cascade-desc">Goals flow from strategy to execution through the role chain:</p>
      <div class="goals__cascade-flow">
        <div v-for="(c, i) in cascade" :key="c.id" class="goals__cascade-item">
          <span v-if="i > 0" class="goals__cascade-arrow">→</span>
          <div class="goals__cascade-card">
            <span class="goals__cascade-icon">{{ c.icon }}</span>
            <span class="goals__cascade-role">{{ c.role }}</span>
            <span class="goals__cascade-focus">{{ c.focus }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="goalsIndex">
const roleGoals = [
  {
    id: "executiver",
    name: "Executive",
    icon: "🏢",
    dir: "executiver/",
    description: "Define org-level objectives that cascade into team goals. Own the annual and quarterly OKR cycle for the Yi family of products. Strategy documents in executiver/strategy/ drive the product roadmap.",
    projects: ["YiAi", "YiVad", "YiPet"],
    goalCount: 4,
    goalNames: ["Yi Product Suite Growth", "AI-First Transformation", "Operational Excellence", "Talent & Culture"],
    keyFiles: ["executiver/strategy/", "executiver/industry/", "executiver/roadmap/"]
  },
  {
    id: "producter",
    name: "Product",
    icon: "📋",
    dir: "producter/",
    description: "Define product goals that translate business strategy into measurable outcomes. Own the product roadmap and success metrics for each project. PRDs in producter/discovery/prd/ are the primary input to leader decisions.",
    projects: ["YiAi", "YiVad", "YiPet"],
    goalCount: 5,
    goalNames: ["YiAi Chat Experience", "YiVad Admin Maturity", "YiPet Extension Adoption", "BRD Agent Quality", "Cross-Project Integration"],
    keyFiles: ["producter/discovery/prd/", "producter/frameworks/", "producter/delivery/", "producter/strategy/"]
  },
  {
    id: "leader",
    name: "Leader",
    icon: "🧭",
    dir: "leader/",
    description: "Set technical direction goals. Every architecture decision and tech selection is a bet on a future state — define the bets and track whether they pay off. ADRs in leader/decisions/ are the single source of truth for technical choices.",
    projects: ["YiAi", "YiVad", "YiPet"],
    goalCount: 5,
    goalNames: ["Architecture Maturity L4", "Multi-Provider LLM Strategy", "Test Coverage Baseline", "Cost Efficiency", "Security Posture"],
    keyFiles: ["leader/decisions/", "leader/architecture/", "leader/risk/", "leader/capacity/", "leader/roadmap/"]
  },
  {
    id: "engineer",
    name: "Engineer",
    icon: "⚡",
    dir: "engineer/",
    description: "Turn decisions into working software. Goals focus on delivery velocity, code quality, and knowledge sharing. Eight subdirectories span the full BUILD → SHIP cycle — from architecture patterns to lessons learned.",
    projects: ["YiAi", "YiVad", "YiPet"],
    goalCount: 5,
    goalNames: ["Delivery Velocity", "Code Quality", "Knowledge Sharing", "Developer Experience", "Technical Debt Reduction"],
    keyFiles: ["engineer/architecture/", "engineer/development/", "engineer/quality-security/", "engineer/lessons/"]
  },
  {
    id: "srer",
    name: "SRE",
    icon: "🔧",
    dir: "srer/",
    description: "Keep the systems running. Goals focus on reliability, observability, and incident response for YiAi (the backend serving both YiVad and YiPet). SLOs, postmortems, and runbooks live in srer/.",
    projects: ["YiAi"],
    goalCount: 4,
    goalNames: ["SLO Compliance", "Incident Response Maturity", "Observability Coverage", "Release Safety"],
    keyFiles: ["srer/release/", "srer/incident-response/", "srer/observability/"]
  },
  {
    id: "aier",
    name: "AI Engineer",
    icon: "🤖",
    dir: "aier/",
    description: "Push AI capabilities forward. Goals focus on RAG quality, agent reliability, model evaluation, and AI feature delivery. The most active role — AI/ML knowledge spans foundations, methodology, platform, data, and ML subdirectories.",
    projects: ["YiAi", "YiVad", "YiPet"],
    goalCount: 5,
    goalNames: ["RAG Retrieval Quality", "Agent Task Completion", "Model Evaluation Cadence", "AI Feature Velocity", "Prompt Engineering Standards"],
    keyFiles: ["aier/foundations/", "aier/methodology/", "aier/platform/", "aier/data/", "aier/ml/"]
  },
  {
    id: "curator",
    name: "Curator",
    icon: "📦",
    dir: "curator/",
    description: "Maintain the knowledge base that feeds all projects. Goals focus on KB health, governance compliance, and AI-searchable content quality. The meta-layer — governs all content, owns none of it.",
    projects: ["YiAi", "YiVad", "YiPet"],
    goalCount: 4,
    goalNames: ["KB Coverage", "Freshness Compliance", "Content Quality", "Governance Cadence"],
    keyFiles: ["curator/governance/", "curator/diagrams/", "curator/templates/", "curator/archive/"]
  }
];

const cascade = [
  { id: "executiver", icon: "🏢", role: "Executive", focus: "Growth & Transformation" },
  { id: "producter", icon: "📋", role: "Product", focus: "Feature Outcomes" },
  { id: "leader", icon: "🧭", role: "Leader", focus: "Technical Bets" },
  { id: "engineer", icon: "⚡", role: "Engineer", focus: "Delivery Execution" },
  { id: "srer", icon: "🔧", role: "SRE", focus: "Reliability" },
  { id: "aier", icon: "🤖", role: "AI Engineer", focus: "AI Acceleration" },
  { id: "curator", icon: "📦", role: "Curator", focus: "KB Health" }
];
</script>

<style scoped lang="scss">
.goals {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page);
}
.goals__header {
  margin-bottom: 20px;
  h1 { margin: 0 0 4px; font-size: 22px; }
  p { margin: 0; font-size: 13px; color: var(--el-text-color-secondary); max-width: 900px; }
}

.goals__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-bottom: 8px; }
.goals__card {
  :deep(.el-card__body) { padding: 18px; display: flex; flex-direction: column; }
}
.goals__card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.goals__card-icon { font-size: 24px; }
.goals__card-title { margin: 0 0 6px; font-size: 16px; }
.goals__card-desc { margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: var(--el-text-color-secondary); }
.goals__card-projects { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.goals__card-projects-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }
.goals__card-projects-tags { display: flex; gap: 4px; }
.goals__card-summary { display: flex; flex-direction: column; gap: 4px; }
.goals__card-summary-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }
.goals__card-summary-names { font-size: 12px; color: var(--el-text-color-regular); }
.goals__card-keyfiles { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; }
.goals__card-keyfiles-label { font-weight: 600; color: var(--el-text-color-secondary); white-space: nowrap; }
.goals__card-keyfiles-list { display: flex; flex-wrap: wrap; gap: 4px; }
.goals__keyfile-tag {
  padding: 1px 8px; background: var(--el-fill-color); border-radius: 4px;
  font-size: 11px; font-family: monospace; color: var(--el-text-color-regular);
}
.goals__card-action { margin-top: 12px; display: flex; justify-content: flex-end; }

.goals__cascade {
  h2 { margin: 0 0 4px; font-size: 16px; }
}
.goals__cascade-desc { margin: 0 0 12px; font-size: 13px; color: var(--el-text-color-secondary); }
.goals__cascade-flow { display: flex; align-items: center; flex-wrap: wrap; gap: 0; }
.goals__cascade-item { display: flex; align-items: center; }
.goals__cascade-arrow { margin: 0 10px; font-size: 18px; color: var(--el-color-primary); font-weight: 700; }
.goals__cascade-card {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 10px 18px; background: var(--el-fill-color-light); border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}
.goals__cascade-icon { font-size: 22px; }
.goals__cascade-role { font-weight: 600; font-size: 13px; }
.goals__cascade-focus { font-size: 11px; color: var(--el-color-primary); font-weight: 600; }
</style>