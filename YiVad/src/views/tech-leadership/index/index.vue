<template>
  <div class="tlr-overview">
    <header class="tlr-overview__header">
      <h1>Tech Leadership Review Hub</h1>
      <p>Central dashboard for tech-leadership practices across all Yi-family projects. Browse architecture decisions, tech selections, risk registers, postmortems, DORA metrics, and more.</p>
    </header>

    <!-- Stats row -->
    <section v-if="stats.some(s => s.value !== '—')" class="tlr-overview__stats" aria-label="Knowledge base stats">
      <div v-for="s in stats" :key="s.label" class="tlr-overview__stat">
        <div class="tlr-overview__stat-value">{{ s.value }}</div>
        <div class="tlr-overview__stat-label">{{ s.label }}</div>
      </div>
    </section>

    <!-- Project context chips -->
    <section class="tlr-overview__projects" aria-label="Projects under tech leadership">
      <div class="tlr-overview__project" v-for="p in PROJECTS" :key="p.key">
        <span class="tlr-overview__project-icon">{{ p.icon }}</span>
        <div>
          <strong>{{ p.name }}</strong>
          <span class="tlr-overview__project-desc">{{ p.desc }}</span>
        </div>
      </div>
    </section>

    <el-divider />

    <div class="tlr-overview__grid">
      <el-card
        v-for="topic in TL_TOPICS"
        :key="topic.value"
        class="tlr-overview__card"
        shadow="hover"
        @click="open(topic.value)"
      >
        <div class="tlr-overview__card-head">
          <span class="tlr-overview__card-icon">{{ topic.icon }}</span>
          <el-tag v-if="topic.count !== undefined" type="info" size="small">{{ topic.count }} entries</el-tag>
        </div>
        <h2 class="tlr-overview__title">{{ topic.label }}</h2>
        <p class="tlr-overview__content">{{ topic.content }}</p>
        <div class="tlr-overview__card-foot">
          <span class="tlr-overview__action">Browse →</span>
        </div>
      </el-card>
    </div>

    <!-- Quick links -->
    <el-divider />
    <section class="tlr-overview__links" aria-label="Quick navigation">
      <h3>Quick Actions</h3>
      <div class="tlr-overview__link-row">
        <el-button
          v-for="link in quickLinks"
          :key="link.key"
          :icon="link.icon"
          @click="router.push(link.path)"
        >
          {{ link.label }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="tlrReviewHub">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { DocumentAdd, DataAnalysis, Warning, TrendCharts, Clock } from "@element-plus/icons-vue";
import { getTopicList, type TopicEntryDocument } from "@/api/modules/topic";

const router = useRouter();

const PROJECTS = [
  {
    key: "yiai",
    name: "YiAi",
    icon: "🐍",
    desc: "FastAPI · Python 3.10+ · MongoDB · Ollama · RAG"
  },
  {
    key: "yivad",
    name: "YiVad",
    icon: "🖥️",
    desc: "Vue 3.5 · TypeScript · Pinia · Element Plus · Rsbuild"
  },
  {
    key: "yipet",
    name: "YiPet",
    icon: "🐾",
    desc: "Chrome MV3 · React 18 · Ant Design · Rsbuild · Biome"
  },
  {
    key: "yiknowledge",
    name: "YiKnowledge",
    icon: "📚",
    desc: "Markdown · YAML frontmatter · Static knowledge base"
  },
];

const TL_TOPICS = [
  {
    value: "adr-review",
    label: "Architecture Decision Records",
    icon: "📝",
    content: "ADR registry with status tracking — proposed, accepted, deprecated, and superseded decisions. Document context, options considered, consequences, and review schedules.",
    count: undefined as number | undefined
  },
  {
    value: "tech-selection",
    label: "Tech Selection Evaluation",
    icon: "🔍",
    content: "Technology evaluation matrix with weighted scoring, PoC results, and fallback plans. Track capability selections and their review triggers.",
    count: undefined as number | undefined
  },
  {
    value: "tech-debt",
    label: "Tech Debt Inventory",
    icon: "🏚️",
    content: "Classified tech debt items by domain (code, test, architecture, dependency, data, docs, deploy, monitoring). Track interest rate, repayment cost, and quarterly plans.",
    count: undefined as number | undefined
  },
  {
    value: "risk-register",
    label: "Risk Register",
    icon: "⚠️",
    content: "Risk assessment matrix with probability, impact, mitigation, and contingency plans. Track status and review cycles for all identified project risks.",
    count: undefined as number | undefined
  },
  {
    value: "postmortem",
    label: "Postmortems",
    icon: "🩺",
    content: "Blameless incident postmortems with 5-Why root cause analysis, timeline reconstruction, contributing factors, and action items. What went well, what went wrong, where we got lucky.",
    count: undefined as number | undefined
  },
  {
    value: "oncall-handover",
    label: "Oncall Handover",
    icon: "🔄",
    content: "Shift handover records — ongoing incidents, pending alerts, recent changes, monitoring dashboards, and escalation contacts for smooth oncall transitions.",
    count: undefined as number | undefined
  },
  {
    value: "org-diagnose",
    label: "Org Diagnose",
    icon: "🏥",
    content: "Organizational health assessment by team and dimension (delivery, quality, collaboration, tooling, knowledge). Maturity-level gap analysis with improvement recommendations.",
    count: undefined as number | undefined
  },
  {
    value: "dependency-audit",
    label: "Dependency Audit",
    icon: "🔗",
    content: "Cross-ecosystem dependency audits (npm, pip, cargo, Go modules). Track critical CVEs, outdated packages, and unmaintained dependencies with remediation plans.",
    count: undefined as number | undefined
  },
  {
    value: "roadmap-review",
    label: "Roadmap Review",
    icon: "🗺️",
    content: "Quarterly roadmap reviews — investment distribution across platform/middleware/business/infra, milestone alignment, risks & blockers, and next-quarter preview.",
    count: undefined as number | undefined
  },
  {
    value: "capacity-plan",
    label: "Capacity Plan",
    icon: "📊",
    content: "Resource capacity planning across compute, memory, storage, network, and GPU. Projected growth, scaling triggers, and headroom analysis.",
    count: undefined as number | undefined
  },
  {
    value: "capacity-cost",
    label: "Capacity & Cost (FinOps)",
    icon: "💰",
    content: "FinOps reports with cost breakdown by category, unit economics, budget variance tracking, and optimization opportunities. Monthly health indicators.",
    count: undefined as number | undefined
  },
  {
    value: "maturity-model",
    label: "Maturity Model",
    icon: "📈",
    content: "Practice-area maturity assessments (CI/CD, testing, observability, security, architecture, documentation). L1–L5 gap analysis with improvement plans and progress tracking.",
    count: undefined as number | undefined
  },
  {
    value: "dora-metrics",
    label: "DORA Metrics",
    icon: "🚀",
    content: "Four key DORA metrics — Deployment Frequency, Lead Time for Changes, MTTR, and Change Failure Rate. Trend analysis, contributing factors, and improvement actions.",
    count: undefined as number | undefined
  },
  {
    value: "mentorship-growth",
    label: "Mentorship & Growth",
    icon: "🌱",
    content: "Per-engineer growth plan — level + track, current quarter focus, growth area (depth / breadth / scope / leadership / collaboration / execution / communication / domain), 12-18mo aspiration, strengths + growth edges, stretch opportunities, support needed, mentor + last/next review.",
    count: undefined as number | undefined
  },
  {
    value: "project-handoffs",
    label: "Project Handoffs",
    icon: "📦",
    content: "Project handoff registry — from → to, scope (code / on-call / roadmap / vendor), artifacts (repos / dashboards / docs / runbooks / ADRs / secrets), open WIP, known landmines, stakeholders to notify, knowledge-transfer plan + acceptance criteria, status (drafted → in-progress → KT-done → completed / deferred).",
    count: undefined as number | undefined
  },
  {
    value: "dependency-adoption",
    label: "Dependency Adoption",
    icon: "➕",
    content: "Dependency adoption registry — category (library / SaaS / infra / tooling / storage / observability), use case, alternatives + decision matrix, risk assessment (supply chain / license / CVE / bus factor / lock-in), POC + security review, rollout + exit plan, phase (proposed → evaluating → decided → adopting → adopted / deferred / rejected).",
    count: undefined as number | undefined
  },
  {
    value: "project-bootstrap",
    label: "Project Bootstrap",
    icon: "🆕",
    content: "Project bootstrap registry — charter, guiding principles, repo + runtime + observability + release checklists, owners & roles, target GA date, phase (charter → repo+CI scaffold → skeleton app runs → first feature shipped → GA 1.0 / deferred / cancelled).",
    count: undefined as number | undefined
  },
  {
    value: "knowledge-evolution",
    label: "Knowledge Evolution",
    icon: "🔁",
    content: "Knowledge-base change registry — area, change type (new / refresh / restructure / merge / split / archive / delete), rationale, current vs target state, migration plan, affected consumers (aicr / story / bug / aiChat / onboarding), review cycle + last audit, status (proposed → in-progress → done / deferred / cancelled).",
    count: undefined as number | undefined
  }
];

const quickLinks = [
  { key: "new-adr", label: "New ADR", icon: DocumentAdd, path: "/tech-leadership/adr-review/detail/new" },
  { key: "risks", label: "Risk Register", icon: Warning, path: "/tech-leadership/risk-register" },
  { key: "dora", label: "DORA Metrics", icon: TrendCharts, path: "/tech-leadership/dora-metrics" },
  { key: "postmortems", label: "Postmortems", icon: Clock, path: "/tech-leadership/postmortem" },
  { key: "roadmap", label: "Roadmap Review", icon: DataAnalysis, path: "/tech-leadership/roadmap-review" }
];

// ── Stats ────────────────────────────────────────────────────────────────
const stats = ref([
  { label: "ADR Records", value: "—" },
  { label: "Open Risks", value: "—" },
  { label: "Active Debt Items", value: "—" }
]);

async function loadStats() {
  try {
    const [adrRes, riskRes, debtRes] = await Promise.all([
      getTopicList<TopicEntryDocument>("tech-leadership", "adr-review", { pageSize: 1 }),
      getTopicList<TopicEntryDocument>("tech-leadership", "risk-register", { pageSize: 1 }),
      getTopicList<TopicEntryDocument>("tech-leadership", "tech-debt", { pageSize: 1 })
    ]);
    if (adrRes.code === 0) stats.value[0].value = String(adrRes.data?.total ?? "—");
    if (riskRes.code === 0) stats.value[1].value = String(riskRes.data?.total ?? "—");
    if (debtRes.code === 0) stats.value[2].value = String(debtRes.data?.total ?? "—");
  } catch {
    // Stats are best-effort
  }
}

// ── Topic entry counts ───────────────────────────────────────────────────
async function loadTopicCounts() {
  const topics = TL_TOPICS.map(t => t.value);
  const results = await Promise.allSettled(
    topics.map(t => getTopicList<TopicEntryDocument>("tech-leadership", t, { pageSize: 1 }))
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.code === 0) {
      TL_TOPICS[i].count = r.value.data?.total ?? 0;
    }
  });
}

function open(value: string) {
  router.push(`/tech-leadership/${value}`);
}

onMounted(() => {
  loadStats();
  loadTopicCounts();
});
</script>

<style scoped lang="scss">
.tlr-overview {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 20px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.tlr-overview__header {
  margin-bottom: 16px;
  h1 {
    margin: 0 0 4px;
    font-size: 22px;
  }
  p {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    max-width: 720px;
  }
}
.tlr-overview__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.tlr-overview__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.tlr-overview__stat-value {
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}
.tlr-overview__stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tlr-overview__projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  margin-bottom: 4px;
}
.tlr-overview__project {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  font-size: 13px;
}
.tlr-overview__project-icon {
  font-size: 22px;
}
.tlr-overview__project-desc {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.tlr-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.tlr-overview__card {
  cursor: pointer;
  transition: transform 0.15s ease;
  &:hover {
    transform: translateY(-2px);
  }
}
.tlr-overview__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.tlr-overview__card-icon {
  font-size: 22px;
}
.tlr-overview__title {
  margin: 0 0 6px;
  font-size: 15px;
}
.tlr-overview__content {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
.tlr-overview__card-foot {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.tlr-overview__action {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-color-primary);
}
.tlr-overview__links {
  h3 {
    margin: 0 0 10px;
    font-size: 14px;
  }
}
.tlr-overview__link-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
