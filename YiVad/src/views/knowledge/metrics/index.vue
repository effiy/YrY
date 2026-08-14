<template>
  <div class="metrics">
    <header class="metrics__header">
      <h1>Metrics &amp; KPIs</h1>
      <p>Quantitative measures that track progress toward role goals. Each role owns a set of metrics that answer "are we winning?" — from DORA metrics for engineering velocity to HEART/AARRR for product outcomes, SLOs for reliability, and model evaluation scores for AI quality. Every metric has a current value, target, and baseline tracked in <code>YiKnowledge/&lt;role&gt;/metrics/</code>.</p>
    </header>

    <div class="metrics__grid">
      <el-card v-for="role in roleMetrics" :key="role.id" class="metrics__card" shadow="hover">
        <div class="metrics__card-head">
          <span class="metrics__card-icon">{{ role.icon }}</span>
          <el-tag type="info" size="small">{{ role.dir }}</el-tag>
        </div>
        <h2 class="metrics__card-title">{{ role.name }}</h2>
        <p class="metrics__card-desc">{{ role.description }}</p>

        <div class="metrics__card-categories">
          <span class="metrics__card-categories-label">Categories:</span>
          <div class="metrics__card-categories-list">
            <el-tag v-for="c in role.categories" :key="c" size="small" effect="plain">{{ c }}</el-tag>
          </div>
        </div>

        <el-divider style="margin: 12px 0" />

        <div class="metrics__card-keyfiles">
          <span class="metrics__card-keyfiles-label">Key directories:</span>
          <div class="metrics__card-keyfiles-list">
            <code v-for="k in role.keyFiles" :key="k" class="metrics__keyfile-tag">{{ k }}</code>
          </div>
        </div>

        <el-divider style="margin: 12px 0" />

        <div class="metrics__card-summary">
          <span class="metrics__card-summary-label">{{ role.metricCount }} metrics</span>
          <span class="metrics__card-summary-names">{{ role.metricNames.join(', ') }}</span>
        </div>

        <div class="metrics__card-action">
          <el-button type="primary" size="small" @click="$router.push(`/metrics/${role.id}`)">
            View Metrics
          </el-button>
        </div>
      </el-card>
    </div>

    <el-divider />

    <section class="metrics__framework">
      <h2>Metric Frameworks by Role</h2>
      <p class="metrics__framework-desc">Different roles use different metric frameworks. The frameworks are complementary — together they provide a full picture of product + engineering + AI health.</p>
      <div class="metrics__framework-grid">
        <div v-for="f in frameworks" :key="f.name" class="metrics__framework-item">
          <div class="metrics__framework-head">
            <span class="metrics__framework-icon">{{ f.icon }}</span>
            <div>
              <h3 class="metrics__framework-name">{{ f.name }}</h3>
              <span class="metrics__framework-roles">{{ f.roles.join(', ') }}</span>
            </div>
          </div>
          <p class="metrics__framework-desc">{{ f.description }}</p>
          <div class="metrics__framework-metrics">
            <span v-for="m in f.metrics" :key="m" class="metrics__framework-metric">{{ m }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="metricsIndex">
const roleMetrics = [
  {
    id: "executiver", name: "Executive", icon: "🏢", dir: "executiver/",
    description: "Business-level KPIs: product growth, market adoption, organizational health. Track whether the Yi product suite is delivering business value against the strategy defined in executiver/strategy/.",
    categories: ["Growth", "Adoption", "Efficiency"],
    metricCount: 6,
    metricNames: ["Product Suite DAU", "Business Line Adoption", "Revenue/Efficiency Impact", "Org Health Score", "KB Coverage %", "Strategic Alignment"],
    keyFiles: ["executiver/strategy/", "executiver/industry/", "executiver/roadmap/"]
  },
  {
    id: "producter", name: "Product", icon: "📋", dir: "producter/",
    description: "Product success metrics: user engagement, feature adoption, customer satisfaction. HEART + AARRR frameworks track each project's product-market fit. PRDs in producter/discovery/prd/ define the success criteria being measured.",
    categories: ["Engagement", "Adoption", "Satisfaction", "Retention"],
    metricCount: 8,
    metricNames: ["North Star Metric", "HEART Score", "AARRR Funnel", "Feature Adoption Rate", "NPS/CSAT", "DORA Metrics", "Time-to-Value", "User Retention"],
    keyFiles: ["producter/discovery/prd/", "producter/frameworks/", "producter/delivery/"]
  },
  {
    id: "leader", name: "Leader", icon: "🧭", dir: "leader/",
    description: "Technical health metrics: architecture maturity, tech debt, cost efficiency, security posture. DORA metrics for delivery performance. Each ADR in leader/decisions/ is a bet — track whether the bets pay off.",
    categories: ["Architecture", "Cost", "Security", "Delivery"],
    metricCount: 7,
    metricNames: ["Architecture Maturity Level", "DORA Baseline", "Cost per Task", "Tech Debt Ratio", "CVE Resolution Time", "ADR Coverage", "Test Coverage %"],
    keyFiles: ["leader/decisions/", "leader/architecture/", "leader/risk/", "leader/capacity/"]
  },
  {
    id: "engineer", name: "Engineer", icon: "⚡", dir: "engineer/",
    description: "Engineering productivity metrics: velocity, quality, knowledge sharing. DORA metrics + code quality indicators + KB contribution metrics. Eight subdirectories each contribute to the overall engineering health picture.",
    categories: ["Velocity", "Quality", "Knowledge"],
    metricCount: 7,
    metricNames: ["Deployment Frequency", "Lead Time", "Change Failure Rate", "Code Review Turnaround", "Lint Pass Rate", "KB Contributions", "Developer Onboarding Time"],
    keyFiles: ["engineer/development/", "engineer/quality-security/", "engineer/lessons/"]
  },
  {
    id: "srer", name: "SRE", icon: "🔧", dir: "srer/",
    description: "Reliability metrics: SLOs, incident response, observability coverage. The last line of defense — measure what happens in production. Postmortems in srer/incident-response/ feed back into reliability improvements.",
    categories: ["Reliability", "Incident", "Observability"],
    metricCount: 7,
    metricNames: ["API Availability", "P99 Latency", "Error Budget", "MTTD", "MTTR", "Alert Coverage", "Deploy Success Rate"],
    keyFiles: ["srer/release/", "srer/incident-response/", "srer/observability/"]
  },
  {
    id: "aier", name: "AI Engineer", icon: "🤖", dir: "aier/",
    description: "AI quality metrics: RAG relevance, agent task completion, model evaluation scores. AI-specific metrics not covered by general engineering frameworks. Foundations in aier/foundations/ inform the evaluation methodology.",
    categories: ["RAG Quality", "Agent Reliability", "Model Performance"],
    metricCount: 8,
    metricNames: ["RAG Relevance Score", "Agent Task Completion %", "Model Fallback Rate", "Citation Accuracy", "Cost per Quality Point", "Prompt A/B Win Rate", "Benchmark Pass Rate", "AI Feature Time-to-Ship"],
    keyFiles: ["aier/foundations/", "aier/methodology/", "aier/ml/", "aier/data/"]
  },
  {
    id: "curator", name: "Curator", icon: "📦", dir: "curator/",
    description: "KB health metrics: coverage, freshness, quality, governance compliance. The KB is the AI's cognitive boundary — measure its health. Governance cadence metrics are tracked in curator/governance/.",
    categories: ["Coverage", "Freshness", "Quality", "Governance"],
    metricCount: 6,
    metricNames: ["File Count", "Frontmatter Compliance", "Freshness Score", "Readiness Pass Rate", "Inbox Age", "Orphan Content %"],
    keyFiles: ["curator/governance/", "curator/archive/", "curator/templates/"]
  }
];

const frameworks = [
  {
    name: "OKR", icon: "🎯", roles: ["Executive", "Product", "Leader"],
    description: "Objectives and Key Results — qualitative objectives with quantitative key results. Cadence: annual (company) + quarterly (teams).",
    metrics: ["Objective progress %", "KR completion %", "Alignment score", "Stretch ratio"]
  },
  {
    name: "DORA", icon: "🚀", roles: ["Leader", "Engineer", "SRE"],
    description: "DevOps Research and Assessment — four key metrics for software delivery performance. Industry standard for engineering velocity.",
    metrics: ["Deployment Frequency", "Lead Time for Changes", "Change Failure Rate", "MTTR"]
  },
  {
    name: "HEART", icon: "❤️", roles: ["Product"],
    description: "Google's UX measurement framework — Happiness, Engagement, Adoption, Retention, Task Success. User-centered product metrics.",
    metrics: ["Happiness (NPS/CSAT)", "Engagement (DAU/MAU)", "Adoption (new users)", "Retention (churn rate)", "Task Success (completion rate)"]
  },
  {
    name: "AARRR", icon: "🏴‍☠️", roles: ["Product", "Executive"],
    description: "Pirate Metrics — Acquisition, Activation, Retention, Revenue, Referral. Growth funnel for product-market fit.",
    metrics: ["Acquisition rate", "Activation rate", "Retention rate", "Revenue per user", "Referral rate"]
  },
  {
    name: "SLO/SLI", icon: "📊", roles: ["SRE"],
    description: "Service Level Objectives and Indicators — define acceptable reliability thresholds. Error budgets link reliability to feature velocity.",
    metrics: ["Availability SLI", "Latency SLI", "Error rate SLI", "Error budget remaining"]
  },
  {
    name: "AI Eval", icon: "🤖", roles: ["AI Engineer"],
    description: "AI-specific evaluation frameworks — RAG relevance, agent task completion, model benchmark scores. AI quality is not covered by traditional metrics.",
    metrics: ["RAG relevance score", "Agent task completion %", "Citation accuracy", "Model benchmark pass rate"]
  }
];
</script>

<style scoped lang="scss">
.metrics {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page);
}
.metrics__header {
  margin-bottom: 20px;
  h1 { margin: 0 0 4px; font-size: 22px; }
  p { margin: 0; font-size: 13px; color: var(--el-text-color-secondary); max-width: 900px; }
}

.metrics__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-bottom: 8px; }
.metrics__card {
  :deep(.el-card__body) { padding: 18px; display: flex; flex-direction: column; }
}
.metrics__card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.metrics__card-icon { font-size: 24px; }
.metrics__card-title { margin: 0 0 6px; font-size: 16px; }
.metrics__card-desc { margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: var(--el-text-color-secondary); }
.metrics__card-categories { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.metrics__card-categories-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }
.metrics__card-categories-list { display: flex; gap: 4px; }
.metrics__card-summary { display: flex; flex-direction: column; gap: 4px; }
.metrics__card-summary-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }
.metrics__card-summary-names { font-size: 12px; color: var(--el-text-color-regular); }
.metrics__card-keyfiles { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; }
.metrics__card-keyfiles-label { font-weight: 600; color: var(--el-text-color-secondary); white-space: nowrap; }
.metrics__card-keyfiles-list { display: flex; flex-wrap: wrap; gap: 4px; }
.metrics__keyfile-tag {
  padding: 1px 8px; background: var(--el-fill-color); border-radius: 4px;
  font-size: 11px; font-family: monospace; color: var(--el-text-color-regular);
}
.metrics__card-action { margin-top: 12px; display: flex; justify-content: flex-end; }

.metrics__framework {
  h2 { margin: 0 0 4px; font-size: 16px; }
}
.metrics__framework-desc { margin: 0 0 14px; font-size: 13px; color: var(--el-text-color-secondary); }
.metrics__framework-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }
.metrics__framework-item {
  padding: 14px; background: var(--el-fill-color-light); border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}
.metrics__framework-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
.metrics__framework-icon { font-size: 22px; }
.metrics__framework-name { margin: 0 0 2px; font-size: 14px; }
.metrics__framework-roles { font-size: 11px; color: var(--el-color-primary); }
.metrics__framework-desc { margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); }
.metrics__framework-metrics { display: flex; flex-wrap: wrap; gap: 4px; }
.metrics__framework-metric {
  padding: 2px 8px; background: var(--el-color-primary-light-9); border-radius: 4px;
  font-size: 11px; color: var(--el-color-primary);
}
</style>