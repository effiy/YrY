<template>
  <div class="role-metrics">
    <header class="role-metrics__header">
      <div class="role-metrics__header-left">
        <el-button text @click="$router.push('/metrics')">
          <el-icon><ArrowLeft /></el-icon>
          All Metrics
        </el-button>
        <h1>{{ role.name }} Metrics</h1>
      </div>
      <el-tag type="info" size="small">{{ role.dir }}</el-tag>
    </header>
    <p class="role-metrics__desc">{{ role.description }}</p>

    <div class="role-metrics__categories">
      <span class="role-metrics__categories-label">Categories:</span>
      <el-tag v-for="c in role.categories" :key="c" size="small" effect="plain">{{ c }}</el-tag>
    </div>

    <el-divider />

    <el-table :data="metrics" stripe border style="width: 100%" row-key="id" :default-sort="{ prop: 'id', order: 'ascending' }">
      <el-table-column prop="id" label="Metric ID" width="130" sortable>
        <template #default="{ row }">
          <code class="role-metrics__table-id">{{ row.id }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Metric" min-width="220" sortable>
        <template #default="{ row }">
          <div class="role-metrics__table-metric">
            <span class="role-metrics__table-icon">{{ row.icon }}</span>
            <div>
              <span class="role-metrics__table-name">{{ row.name }}</span>
              <p class="role-metrics__table-desc">{{ row.description }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="Category" width="120" sortable>
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="framework" label="Framework" width="120" sortable />
      <el-table-column label="Current" width="120" sortable prop="current">
        <template #default="{ row }">
          <span class="role-metrics__table-value">{{ row.current }}{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Target" width="110" sortable prop="target">
        <template #default="{ row }">
          <span class="role-metrics__table-target">{{ row.target }}{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Baseline" width="110" sortable prop="baseline">
        <template #default="{ row }">
          <span class="role-metrics__table-baseline">{{ row.baseline }}{{ row.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Progress" width="160">
        <template #default="{ row }">
          <div class="role-metrics__table-progress">
            <el-progress :percentage="row.progress" :status="row.progress >= 100 ? 'success' : row.progress < 30 ? 'exception' : undefined" :stroke-width="6" />
            <span class="role-metrics__table-progress-text">{{ row.progress }}%</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Trend" width="90">
        <template #default="{ row }">
          <el-tag :type="row.trend === 'up' ? 'success' : row.trend === 'down' ? 'danger' : 'info'" size="small">
            {{ row.trend === 'up' ? '↑ Up' : row.trend === 'down' ? '↓ Down' : '→ Flat' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="$router.push(`/metrics/${role.id}/metric/${row.id}`)">Details</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-divider />

    <div class="role-metrics__list">
      <el-card v-for="metric in metrics" :key="metric.id" class="role-metrics__card" shadow="hover">
        <div class="role-metrics__card-head">
          <div class="role-metrics__card-head-left">
            <span class="role-metrics__card-icon">{{ metric.icon }}</span>
            <div>
              <h2 class="role-metrics__card-title">{{ metric.name }}</h2>
              <span class="role-metrics__card-id">{{ metric.id }}</span>
            </div>
          </div>
          <el-tag :type="metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'danger' : 'info'" size="small">
            {{ metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→' }} {{ metric.current }}{{ metric.unit }}
          </el-tag>
        </div>

        <p class="role-metrics__card-desc">{{ metric.description }}</p>

        <div class="role-metrics__card-meta">
          <div class="role-metrics__card-meta-item">
            <span class="role-metrics__card-meta-label">Category:</span>
            <el-tag size="small" effect="plain">{{ metric.category }}</el-tag>
          </div>
          <div class="role-metrics__card-meta-item">
            <span class="role-metrics__card-meta-label">Target:</span>
            <span class="role-metrics__card-meta-value">{{ metric.target }}{{ metric.unit }}</span>
          </div>
          <div class="role-metrics__card-meta-item">
            <span class="role-metrics__card-meta-label">Framework:</span>
            <span class="role-metrics__card-meta-value">{{ metric.framework }}</span>
          </div>
        </div>

        <el-divider style="margin: 10px 0" />

        <div class="role-metrics__card-progress">
          <div class="role-metrics__card-progress-bar">
            <span class="role-metrics__card-progress-label">Progress</span>
            <el-progress :percentage="metric.progress" :status="metric.progress >= 100 ? 'success' : metric.progress < 30 ? 'exception' : undefined" :stroke-width="8" />
          </div>
          <div class="role-metrics__card-progress-detail">
            <span>Current: <strong>{{ metric.current }}{{ metric.unit }}</strong></span>
            <span>Target: <strong>{{ metric.target }}{{ metric.unit }}</strong></span>
            <span>Baseline: <strong>{{ metric.baseline }}{{ metric.unit }}</strong></span>
          </div>
        </div>

        <div class="role-metrics__card-action">
          <el-button size="small" @click="$router.push(`/metrics/${role.id}/metric/${metric.id}`)">View Details</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="roleMetrics">
import { ArrowLeft } from "@element-plus/icons-vue";

const props = defineProps<{ roleId: string }>();

const rolesData: Record<string, {
  id: string; name: string; icon: string; dir: string;
  description: string; categories: string[];
}> = {
  executiver: {
    id: "executiver", name: "Executive", icon: "🏢", dir: "executiver/",
    description: "Business-level KPIs: product growth, market adoption, organizational health. Track whether the Yi product suite is delivering business value.",
    categories: ["Growth", "Adoption", "Efficiency"]
  },
  producter: {
    id: "producter", name: "Product", icon: "📋", dir: "producter/",
    description: "Product success metrics: user engagement, feature adoption, customer satisfaction. HEART + AARRR frameworks for each project.",
    categories: ["Engagement", "Adoption", "Satisfaction", "Retention"]
  },
  leader: {
    id: "leader", name: "Leader", icon: "🧭", dir: "leader/",
    description: "Technical health metrics: architecture maturity, tech debt, cost efficiency, security posture.",
    categories: ["Architecture", "Cost", "Security", "Delivery"]
  },
  engineer: {
    id: "engineer", name: "Engineer", icon: "⚡", dir: "engineer/",
    description: "Engineering productivity metrics: velocity, quality, knowledge sharing.",
    categories: ["Velocity", "Quality", "Knowledge"]
  },
  srer: {
    id: "srer", name: "SRE", icon: "🔧", dir: "srer/",
    description: "Reliability metrics: SLOs, incident response, observability coverage.",
    categories: ["Reliability", "Incident", "Observability"]
  },
  aier: {
    id: "aier", name: "AI Engineer", icon: "🤖", dir: "aier/",
    description: "AI quality metrics: RAG relevance, agent task completion, model evaluation scores.",
    categories: ["RAG Quality", "Agent Reliability", "Model Performance"]
  },
  curator: {
    id: "curator", name: "Curator", icon: "📦", dir: "curator/",
    description: "KB health metrics: coverage, freshness, quality, governance compliance.",
    categories: ["Coverage", "Freshness", "Quality", "Governance"]
  }
};

interface MetricItem {
  id: string; icon: string; name: string; category: string; framework: string;
  description: string; current: number; target: number; baseline: number;
  unit: string; trend: string; progress: number;
}

const metricsData: Record<string, MetricItem[]> = {
  executiver: [
    { id: "exec-m01", icon: "👥", name: "Yi Product Suite DAU", category: "Growth", framework: "OKR", description: "Daily active users across YiAi, YiVad, and YiPet. Measures overall product suite adoption.", current: 38, target: 50, baseline: 15, unit: " users", trend: "up", progress: 66 },
    { id: "exec-m02", icon: "🏭", name: "Business Line Adoption", category: "Adoption", framework: "OKR", description: "Number of business lines actively using YiAi as their AI backend with independent tenant isolation.", current: 2, target: 3, baseline: 1, unit: " lines", trend: "up", progress: 67 },
    { id: "exec-m03", icon: "⚡", name: "AI Task Automation Rate", category: "Efficiency", framework: "OKR", description: "Percentage of routine operational tasks handled by AI agents without human intervention.", current: 55, target: 70, baseline: 20, unit: "%", trend: "up", progress: 62 },
    { id: "exec-m04", icon: "📚", name: "KB Coverage", category: "Efficiency", framework: "OKR", description: "YiKnowledge file count with complete frontmatter. Measures knowledge capture completeness.", current: 410, target: 500, baseline: 200, unit: " files", trend: "up", progress: 82 },
    { id: "exec-m05", icon: "😊", name: "Org Health Score", category: "Efficiency", framework: "OKR", description: "Composite score from onboarding time, knowledge freshness, and team satisfaction surveys.", current: 72, target: 85, baseline: 50, unit: "/100", trend: "up", progress: 60 },
    { id: "exec-m06", icon: "🎯", name: "Strategic Alignment", category: "Adoption", framework: "OKR", description: "Percentage of team goals that directly trace to company-level OKRs. Measures cascade effectiveness.", current: 85, target: 95, baseline: 60, unit: "%", trend: "up", progress: 80 }
  ],
  producter: [
    { id: "prod-m01", icon: "⭐", name: "North Star Metric", category: "Engagement", framework: "HEART", description: "Weekly active users who complete at least one AI-assisted task. The single most important product metric.", current: 28, target: 50, baseline: 10, unit: " WAUs", trend: "up", progress: 56 },
    { id: "prod-m02", icon: "😊", name: "Happiness (CSAT)", category: "Satisfaction", framework: "HEART", description: "Customer satisfaction score for AI-assisted tasks. Measured post-task with 1-5 scale.", current: 4.1, target: 4.5, baseline: 3.5, unit: "/5", trend: "up", progress: 60 },
    { id: "prod-m03", icon: "📈", name: "Feature Adoption Rate", category: "Adoption", framework: "AARRR", description: "Percentage of users who have tried a new feature within 30 days of release.", current: 45, target: 60, baseline: 25, unit: "%", trend: "up", progress: 50 },
    { id: "prod-m04", icon: "🔄", name: "User Retention (D30)", category: "Retention", framework: "AARRR", description: "Percentage of users who return within 30 days of first use. Key indicator of product stickiness.", current: 55, target: 70, baseline: 30, unit: "%", trend: "up", progress: 50 },
    { id: "prod-m05", icon: "🚀", name: "Deployment Frequency", category: "Engagement", framework: "DORA", description: "How often each project deploys to production. Higher frequency = smaller batches = lower risk.", current: 3, target: 5, baseline: 1, unit: "/week", trend: "up", progress: 60 },
    { id: "prod-m06", icon: "⏱️", name: "Time-to-Value", category: "Adoption", framework: "HEART", description: "Time from first use to first successful AI-assisted task completion. Lower is better.", current: 2.5, target: 1, baseline: 5, unit: " days", trend: "down", progress: 70 },
    { id: "prod-m07", icon: "📋", name: "NPS Score", category: "Satisfaction", framework: "HEART", description: "Net Promoter Score — would users recommend Yi products to colleagues? Industry benchmark.", current: 35, target: 50, baseline: 10, unit: " pts", trend: "up", progress: 50 },
    { id: "prod-m08", icon: "🔧", name: "Change Failure Rate", category: "Engagement", framework: "DORA", description: "Percentage of deployments that cause incidents or require rollback. Lower is better.", current: 8, target: 5, baseline: 20, unit: "%", trend: "down", progress: 75 }
  ],
  leader: [
    { id: "lead-m01", icon: "🏗️", name: "Architecture Maturity", category: "Architecture", framework: "Maturity Model", description: "Current architecture maturity level across all projects. Target: L4 (Measured) with automated fitness functions.", current: 3, target: 4, baseline: 2, unit: " level", trend: "up", progress: 50 },
    { id: "lead-m02", icon: "🚀", name: "DORA Elite Benchmark", category: "Delivery", framework: "DORA", description: "Composite DORA score: deploy freq + lead time + CFR + MTTR. Elite = deploy on-demand, lead time < 1h, CFR < 5%, MTTR < 1h.", current: 65, target: 85, baseline: 30, unit: "/100", trend: "up", progress: 55 },
    { id: "lead-m03", icon: "💰", name: "Cost per AI Task", category: "Cost", framework: "FinOps", description: "Average LLM API cost per completed agent task. Optimize through model routing and caching.", current: 0.12, target: 0.08, baseline: 0.25, unit: " $/task", trend: "down", progress: 70 },
    { id: "lead-m04", icon: "🧹", name: "Tech Debt Ratio", category: "Architecture", framework: "Maturity Model", description: "Number of acknowledged tech debt items vs. resolved items. Includes YiVad type errors, YiPet dependency warnings.", current: 35, target: 10, baseline: 50, unit: " items", trend: "down", progress: 60 },
    { id: "lead-m05", icon: "🛡️", name: "CVE Resolution Time", category: "Security", framework: "Security", description: "Median time from critical CVE disclosure to remediation across all projects. Target: < 7 days.", current: 5, target: 3, baseline: 14, unit: " days", trend: "down", progress: 65 },
    { id: "lead-m06", icon: "📝", name: "ADR Coverage", category: "Architecture", framework: "Maturity Model", description: "Percentage of significant technical decisions documented as ADRs with context/decision/consequences.", current: 80, target: 95, baseline: 40, unit: "%", trend: "up", progress: 75 },
    { id: "lead-m07", icon: "🧪", name: "Test Coverage", category: "Architecture", framework: "Maturity Model", description: "Average test coverage across all three projects. YiVad and YiPet are starting from zero.", current: 35, target: 65, baseline: 10, unit: "%", trend: "up", progress: 33 }
  ],
  engineer: [
    { id: "eng-m01", icon: "🚀", name: "Deployment Frequency", category: "Velocity", framework: "DORA", description: "Deployments per week per project. YiAi: 3x/week, YiVad: 2x/week, YiPet: bi-weekly releases.", current: 2.5, target: 4, baseline: 1, unit: "/week", trend: "up", progress: 60 },
    { id: "eng-m02", icon: "⏱️", name: "Lead Time for Changes", category: "Velocity", framework: "DORA", description: "Median time from code committed to code running in production.", current: 1.5, target: 0.5, baseline: 4, unit: " days", trend: "down", progress: 70 },
    { id: "eng-m03", icon: "🔧", name: "Change Failure Rate", category: "Quality", framework: "DORA", description: "Percentage of deployments that cause incidents or require rollback.", current: 8, target: 5, baseline: 20, unit: "%", trend: "down", progress: 75 },
    { id: "eng-m04", icon: "👀", name: "Code Review Turnaround", category: "Quality", framework: "Engineering", description: "Median time from PR open to first review. Target: < 4 hours during business hours.", current: 3.5, target: 2, baseline: 8, unit: " hours", trend: "down", progress: 60 },
    { id: "eng-m05", icon: "✅", name: "Lint Pass Rate", category: "Quality", framework: "Engineering", description: "Percentage of commits that pass pre-commit lint + type-check on first attempt.", current: 88, target: 95, baseline: 60, unit: "%", trend: "up", progress: 70 },
    { id: "eng-m06", icon: "📚", name: "KB Contributions", category: "Knowledge", framework: "Engineering", description: "New knowledge files contributed by engineers per month. Measures knowledge-sharing culture.", current: 12, target: 15, baseline: 5, unit: " files/mo", trend: "up", progress: 80 },
    { id: "eng-m07", icon: "🌱", name: "Developer Onboarding Time", category: "Knowledge", framework: "Engineering", description: "Days until a new engineer is productive (first PR merged). Target: < 5 days.", current: 8, target: 5, baseline: 20, unit: " days", trend: "down", progress: 55 }
  ],
  srer: [
    { id: "sre-m01", icon: "📡", name: "API Availability", category: "Reliability", framework: "SLO", description: "YiAi API uptime percentage. Measured at the load balancer. SLO: 99.5%.", current: 99.7, target: 99.5, baseline: 99.0, unit: "%", trend: "up", progress: 100 },
    { id: "sre-m02", icon: "🐌", name: "P99 Latency (non-LLM)", category: "Reliability", framework: "SLO", description: "99th percentile response time for non-LLM API endpoints (CRUD, file ops).", current: 320, target: 500, baseline: 800, unit: "ms", trend: "down", progress: 100 },
    { id: "sre-m03", icon: "🎫", name: "Error Budget Remaining", category: "Reliability", framework: "SLO", description: "Percentage of error budget remaining this month. When exhausted, feature freezes until reliability improves.", current: 65, target: 20, baseline: 50, unit: "%", trend: "down", progress: 75 },
    { id: "sre-m04", icon: "🔔", name: "MTTD (Mean Time to Detect)", category: "Incident", framework: "SLO", description: "Average time from incident start to detection. Target: < 5 minutes for critical incidents.", current: 4, target: 3, baseline: 15, unit: " min", trend: "down", progress: 70 },
    { id: "sre-m05", icon: "🔧", name: "MTTR (Mean Time to Resolve)", category: "Incident", framework: "SLO", description: "Average time from incident detection to resolution. Target: < 30 minutes for P1 incidents.", current: 25, target: 20, baseline: 60, unit: " min", trend: "down", progress: 70 },
    { id: "sre-m06", icon: "📊", name: "Alert Coverage", category: "Observability", framework: "SLO", description: "Percentage of SLO breaches that trigger an alert within 2 minutes.", current: 85, target: 95, baseline: 50, unit: "%", trend: "up", progress: 70 },
    { id: "sre-m07", icon: "✅", name: "Deploy Success Rate", category: "Reliability", framework: "SLO", description: "Percentage of deployments that complete without rollback or hotfix.", current: 92, target: 98, baseline: 80, unit: "%", trend: "up", progress: 60 }
  ],
  aier: [
    { id: "aier-m01", icon: "🔍", name: "RAG Relevance Score", category: "RAG Quality", framework: "AI Eval", description: "Hybrid retrieval relevance (semantic + keyword). Measured against 100+ test queries across all knowledge domains.", current: 0.78, target: 0.85, baseline: 0.55, unit: "", trend: "up", progress: 72 },
    { id: "aier-m02", icon: "✅", name: "Agent Task Completion", category: "Agent Reliability", framework: "AI Eval", description: "Percentage of agent tasks that complete successfully (CRUD operations, multi-step workflows).", current: 62, target: 75, baseline: 30, unit: "%", trend: "up", progress: 55 },
    { id: "aier-m03", icon: "🔄", name: "Model Fallback Rate", category: "Agent Reliability", framework: "AI Eval", description: "Percentage of agent turns where the primary model stalls and a stronger fallback model takes over.", current: 15, target: 10, baseline: 35, unit: "%", trend: "down", progress: 65 },
    { id: "aier-m04", icon: "📎", name: "Citation Accuracy", category: "RAG Quality", framework: "AI Eval", description: "Percentage of inline citations that point to the correct source file and section.", current: 85, target: 92, baseline: 60, unit: "%", trend: "up", progress: 72 },
    { id: "aier-m05", icon: "💰", name: "Cost per Quality Point", category: "Model Performance", framework: "AI Eval", description: "LLM API cost divided by task quality score. Optimizes the cost-quality tradeoff.", current: 0.018, target: 0.012, baseline: 0.04, unit: " $/pt", trend: "down", progress: 60 },
    { id: "aier-m06", icon: "🧪", name: "Prompt A/B Win Rate", category: "Model Performance", framework: "AI Eval", description: "Percentage of prompt changes that win in A/B tests. Measures prompt engineering effectiveness.", current: 55, target: 65, baseline: 40, unit: "%", trend: "up", progress: 50 },
    { id: "aier-m07", icon: "📊", name: "Benchmark Pass Rate", category: "Model Performance", framework: "AI Eval", description: "Percentage of YiAi-specific benchmark tests that pass. Covers CRUD, RAG, BRD, and code tasks.", current: 72, target: 85, baseline: 45, unit: "%", trend: "up", progress: 60 },
    { id: "aier-m08", icon: "🚀", name: "AI Feature Time-to-Ship", category: "Agent Reliability", framework: "AI Eval", description: "Median time from AI feature request to production deployment.", current: 10, target: 7, baseline: 21, unit: " days", trend: "down", progress: 65 }
  ],
  curator: [
    { id: "cur-m01", icon: "📄", name: "File Count", category: "Coverage", framework: "KB Health", description: "Total verified knowledge files with complete frontmatter across all 7 role directories.", current: 410, target: 500, baseline: 200, unit: " files", trend: "up", progress: 82 },
    { id: "cur-m02", icon: "📋", name: "Frontmatter Compliance", category: "Quality", framework: "KB Health", description: "Percentage of files with complete frontmatter (benefit + acceptance_criteria + roles + tags).", current: 88, target: 95, baseline: 60, unit: "%", trend: "up", progress: 75 },
    { id: "cur-m03", icon: "🔄", name: "Freshness Score", category: "Freshness", framework: "KB Health", description: "Percentage of files with last_verified within their declared review_cycle. Content rots without maintenance.", current: 78, target: 90, baseline: 50, unit: "%", trend: "up", progress: 65 },
    { id: "cur-m04", icon: "✅", name: "Readiness Pass Rate", category: "Quality", framework: "KB Health", description: "Percentage of stable files that pass the 10-question readiness checklist.", current: 75, target: 90, baseline: 40, unit: "%", trend: "up", progress: 58 },
    { id: "cur-m05", icon: "📥", name: "Inbox Age", category: "Governance", framework: "KB Health", description: "Age of oldest unclassified item in inbox. Target: zero items older than 7 days.", current: 3, target: 0, baseline: 14, unit: " days", trend: "down", progress: 70 },
    { id: "cur-m06", icon: "👻", name: "Orphan Content", category: "Coverage", framework: "KB Health", description: "Percentage of files without valid related links or role home. Orphaned content is undiscoverable.", current: 8, target: 2, baseline: 25, unit: "%", trend: "down", progress: 75 }
  ]
};

const role = rolesData[props.roleId] || rolesData.executiver;
const metrics = metricsData[props.roleId] || [];
</script>

<style scoped lang="scss">
.role-metrics {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page);
}
.role-metrics__header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.role-metrics__header-left {
  display: flex; align-items: center; gap: 12px;
  h1 { margin: 0; font-size: 22px; }
}
.role-metrics__desc { margin: 0 0 10px; font-size: 13px; color: var(--el-text-color-secondary); max-width: 900px; }
.role-metrics__categories { display: flex; align-items: center; gap: 8px; }
.role-metrics__categories-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }

.role-metrics__list { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.role-metrics__card {
  :deep(.el-card__body) { padding: 18px; display: flex; flex-direction: column; }
}
.role-metrics__card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.role-metrics__card-head-left { display: flex; align-items: flex-start; gap: 10px; }
.role-metrics__card-icon { font-size: 24px; margin-top: 2px; }
.role-metrics__card-title { margin: 0 0 2px; font-size: 15px; }
.role-metrics__card-id { font-size: 11px; font-family: monospace; color: var(--el-text-color-secondary); }
.role-metrics__card-desc { margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: var(--el-text-color-secondary); }
.role-metrics__card-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 4px; }
.role-metrics__card-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.role-metrics__card-meta-label { font-weight: 600; color: var(--el-text-color-secondary); }
.role-metrics__card-meta-value { color: var(--el-text-color-regular); }

.role-metrics__card-progress { display: flex; flex-direction: column; gap: 8px; }
.role-metrics__card-progress-bar { display: flex; flex-direction: column; gap: 4px; }
.role-metrics__card-progress-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); }
.role-metrics__card-progress-detail { display: flex; gap: 16px; font-size: 12px; color: var(--el-text-color-secondary); }
.role-metrics__card-action { margin-top: 12px; display: flex; justify-content: flex-end; }

// Table styles
.role-metrics__table-id { font-family: monospace; font-size: 12px; color: var(--el-color-primary); }
.role-metrics__table-metric { display: flex; align-items: flex-start; gap: 8px; }
.role-metrics__table-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.role-metrics__table-name { font-weight: 600; font-size: 13px; display: block; }
.role-metrics__table-desc { margin: 2px 0 0; font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.role-metrics__table-value { font-weight: 700; font-size: 14px; color: var(--el-color-primary); }
.role-metrics__table-target { font-weight: 600; font-size: 13px; color: var(--el-color-success); }
.role-metrics__table-baseline { font-size: 13px; color: var(--el-text-color-secondary); }
.role-metrics__table-progress { display: flex; align-items: center; gap: 8px; }
.role-metrics__table-progress-text { font-size: 12px; font-weight: 600; color: var(--el-text-color-secondary); white-space: nowrap; }
</style>