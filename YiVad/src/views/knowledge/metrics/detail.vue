<template>
  <div class="metric-detail">
    <!-- Sticky Header -->
    <header class="metric-detail__sticky-bar">
      <div class="metric-detail__sticky-inner">
        <div class="metric-detail__sticky-left">
          <el-button text size="small" @click="$router.push(`/executiver/okr/${roleId}`)">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span class="metric-detail__sticky-icon">{{ metric?.icon }}</span>
          <span class="metric-detail__sticky-name">{{ metric?.name }}</span>
          <el-tag :type="trendTagType" size="small" effect="dark" round>{{ trendLabel }}</el-tag>
        </div>
        <div class="metric-detail__sticky-actions">
          <el-button v-if="prevMetric" text size="small" @click="router.push(`/executiver/okr/${roleId}/metric/${prevMetric.id}`)">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span class="metric-detail__sticky-nav-hint" v-if="metricIndex !== null">{{ metricIndex + 1 }}/{{ roleMetricCount }}</span>
          <el-button v-if="nextMetric" text size="small" @click="router.push(`/executiver/okr/${roleId}/metric/${nextMetric.id}`)">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </header>

    <div class="metric-detail__body" v-if="metric">
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="metric-detail__breadcrumb">
        <el-breadcrumb-item :to="{ path: '/executiver/okr' }">OKR</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/executiver/okr/${roleId}` }">{{ roleName }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ metric.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- Meta chips -->
      <div class="metric-detail__meta">
        <div class="metric-detail__meta-chip">
          <span class="metric-detail__meta-chip-label">ID</span>
          <code>{{ metric.id }}</code>
        </div>
        <div class="metric-detail__meta-chip">
          <span class="metric-detail__meta-chip-label">Category</span>
          <el-tag size="small" effect="plain" round>{{ metric.category }}</el-tag>
        </div>
        <div class="metric-detail__meta-chip">
          <span class="metric-detail__meta-chip-label">Framework</span>
          <span class="metric-detail__meta-chip-value">{{ metric.framework }}</span>
        </div>
        <div class="metric-detail__meta-chip">
          <span class="metric-detail__meta-chip-label">Cadence</span>
          <span class="metric-detail__meta-chip-value">{{ metric.cadence }}</span>
        </div>
      </div>

      <!-- Description -->
      <section class="metric-detail__section">
        <p class="metric-detail__desc">{{ metric.description }}</p>
      </section>

      <!-- Gauge + Status Cards -->
      <section class="metric-detail__section">
        <h2 class="metric-detail__section-title">
          Current Status
          <span class="metric-detail__section-aside">Updated {{ lastUpdated }}</span>
        </h2>
        <div class="metric-detail__gauge-row">
          <div class="metric-detail__gauge">
            <svg viewBox="0 0 180 180" class="metric-detail__gauge-svg">
              <defs>
                <radialGradient :id="glowId" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" :stop-color="gaugeColor" stop-opacity="0.15" />
                  <stop offset="100%" :stop-color="gaugeColor" stop-opacity="0" />
                </radialGradient>
              </defs>
              <circle cx="90" cy="90" r="80" :fill="`url(#${glowId})`" />
              <circle cx="90" cy="90" r="62" fill="none" stroke="var(--el-fill-color)" stroke-width="10" />
              <circle cx="90" cy="90" r="62" fill="none" :stroke="gaugeColor" stroke-width="10"
                stroke-linecap="round" :stroke-dasharray="gaugeDasharray"
                transform="rotate(-90 90 90)" class="metric-detail__gauge-arc" />
              <text x="90" y="80" text-anchor="middle" class="metric-detail__gauge-value">{{ displayValue }}</text>
              <text x="90" y="100" text-anchor="middle" class="metric-detail__gauge-unit">{{ metric.unit?.trim() }}</text>
              <text x="90" y="118" text-anchor="middle" class="metric-detail__gauge-label">Current</text>
            </svg>
          </div>
          <div class="metric-detail__stat-stack">
            <div class="metric-detail__stat metric-detail__stat--target">
              <span class="metric-detail__stat-icon">🎯</span>
              <div class="metric-detail__stat-body">
                <span class="metric-detail__stat-label">Target</span>
                <span class="metric-detail__stat-value">{{ metric.target }}{{ metric.unit }}</span>
              </div>
            </div>
            <div class="metric-detail__stat metric-detail__stat--baseline">
              <span class="metric-detail__stat-icon">📏</span>
              <div class="metric-detail__stat-body">
                <span class="metric-detail__stat-label">Baseline</span>
                <span class="metric-detail__stat-value">{{ metric.baseline }}{{ metric.unit }}</span>
              </div>
            </div>
            <div class="metric-detail__stat metric-detail__stat--delta">
              <span class="metric-detail__stat-icon">{{ deltaIcon }}</span>
              <div class="metric-detail__stat-body">
                <span class="metric-detail__stat-label">{{ deltaLabel }}</span>
                <span class="metric-detail__stat-value" :style="{ color: gaugeColor }">{{ deltaText }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="metric-detail__progress-bar">
          <div class="metric-detail__progress-track">
            <div class="metric-detail__progress-fill" :style="{ width: clampedProgress + '%', background: gaugeColor }" />
          </div>
          <div class="metric-detail__progress-labels">
            <span>Baseline {{ metric.baseline }}{{ metric.unit }}</span>
            <span>{{ clampedProgress }}%</span>
            <span>Target {{ metric.target }}{{ metric.unit }}</span>
          </div>
        </div>
      </section>

      <!-- Trend + Thresholds (2-col) -->
      <section class="metric-detail__section">
        <div class="metric-detail__two-col">
          <div class="metric-detail__two-col-item">
            <h2 class="metric-detail__section-title">Trend — Last 7 Periods</h2>
            <div class="metric-detail__sparkline">
              <svg viewBox="0 0 600 100" class="metric-detail__sparkline-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient :id="sparkGradientId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="gaugeColor" stop-opacity="0.25" />
                    <stop offset="100%" :stop-color="gaugeColor" stop-opacity="0.02" />
                  </linearGradient>
                </defs>
                <polygon :points="sparkAreaPoints" :fill="`url(#${sparkGradientId})`" />
                <polyline :points="sparkLinePoints" fill="none" :stroke="gaugeColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle v-for="(pt, i) in sparkDots" :key="i" :cx="pt.x" :cy="pt.y" r="3"
                  :fill="i === sparkDots.length - 1 ? gaugeColor : 'white'" :stroke="gaugeColor" stroke-width="1.5" />
              </svg>
              <div class="metric-detail__sparkline-labels">
                <span v-for="(d, i) in trendData" :key="i" class="metric-detail__sparkline-label"
                  :class="{ 'metric-detail__sparkline-label--now': i === trendData.length - 1 }">
                  {{ d.label }}
                </span>
              </div>
            </div>
          </div>
          <div class="metric-detail__two-col-item">
            <h2 class="metric-detail__section-title">Thresholds &amp; Alerts</h2>
            <div class="metric-detail__thresholds">
              <div class="metric-detail__threshold metric-detail__threshold--good" :class="{ 'metric-detail__threshold--active': thresholdActive === 'good' }">
                <div class="metric-detail__threshold-dot metric-detail__threshold-dot--good" />
                <div class="metric-detail__threshold-body">
                  <span class="metric-detail__threshold-label">Good</span>
                  <span class="metric-detail__threshold-range">{{ metric.thresholds.good }}</span>
                </div>
                <span v-if="thresholdActive === 'good'" class="metric-detail__threshold-badge">Current</span>
              </div>
              <div class="metric-detail__threshold metric-detail__threshold--warn" :class="{ 'metric-detail__threshold--active': thresholdActive === 'warning' }">
                <div class="metric-detail__threshold-dot metric-detail__threshold-dot--warn" />
                <div class="metric-detail__threshold-body">
                  <span class="metric-detail__threshold-label">Warning</span>
                  <span class="metric-detail__threshold-range">{{ metric.thresholds.warning }}</span>
                </div>
                <span v-if="thresholdActive === 'warning'" class="metric-detail__threshold-badge metric-detail__threshold-badge--warn">Current</span>
              </div>
              <div class="metric-detail__threshold metric-detail__threshold--bad" :class="{ 'metric-detail__threshold--active': thresholdActive === 'critical' }">
                <div class="metric-detail__threshold-dot metric-detail__threshold-dot--bad" />
                <div class="metric-detail__threshold-body">
                  <span class="metric-detail__threshold-label">Critical</span>
                  <span class="metric-detail__threshold-range">{{ metric.thresholds.critical }}</span>
                </div>
                <span v-if="thresholdActive === 'critical'" class="metric-detail__threshold-badge metric-detail__threshold-badge--bad">Current</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Measurement -->
      <section class="metric-detail__section">
        <h2 class="metric-detail__section-title">How It's Measured</h2>
        <div class="metric-detail__measure-list">
          <div class="metric-detail__measure">
            <div class="metric-detail__measure-head">
              <span class="metric-detail__measure-icon">📡</span>
              <span class="metric-detail__measure-label">Data Source</span>
            </div>
            <span class="metric-detail__measure-value">{{ metric.dataSource }}</span>
          </div>
          <div class="metric-detail__measure">
            <div class="metric-detail__measure-head">
              <span class="metric-detail__measure-icon">⚙️</span>
              <span class="metric-detail__measure-label">Collection Method</span>
            </div>
            <span class="metric-detail__measure-value">{{ metric.collectionMethod }}</span>
          </div>
          <div class="metric-detail__measure">
            <div class="metric-detail__measure-head">
              <span class="metric-detail__measure-icon">🧮</span>
              <span class="metric-detail__measure-label">Calculation</span>
            </div>
            <code class="metric-detail__measure-code">{{ metric.calculation }}</code>
          </div>
        </div>
      </section>

      <!-- Related Goals -->
      <section class="metric-detail__section">
        <h2 class="metric-detail__section-title">Related Goals</h2>
        <div class="metric-detail__related" v-if="relatedGoals.length">
          <div v-for="r in relatedGoals" :key="r.id"
            class="metric-detail__related-card"
            @click="router.push(`/executiver/okr/${goalRoleId(r.id)}/goal/${r.id}`)">
            <span class="metric-detail__related-card-icon">{{ r.icon }}</span>
            <div class="metric-detail__related-card-body">
              <span class="metric-detail__related-card-name">{{ r.name }}</span>
              <span class="metric-detail__related-card-desc">{{ r.description }}</span>
            </div>
            <el-icon class="metric-detail__related-card-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <div v-else class="metric-detail__related-empty">
          <span class="metric-detail__related-empty-icon">🔗</span>
          <span>No related goals linked to this metric.</span>
        </div>
      </section>
    </div>

    <!-- Not Found -->
    <div class="metric-detail__body metric-detail__not-found" v-else>
      <div class="metric-detail__not-found-inner">
        <span class="metric-detail__not-found-icon">📊</span>
        <h2>Metric Not Found</h2>
        <p>The metric <code>{{ metricId }}</code> doesn't exist for role <code>{{ roleId }}</code>.</p>
        <el-button type="primary" @click="router.push(`/executiver/okr/${roleId}`)">
          Back to {{ roleName }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="metricDetail">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import {
  rolesData, metricsData, goalsData, goalMetricMap, ROLE_IDS,
  type MetricItem
} from "../executiver/okrData";

const router = useRouter();
const props = defineProps<{ roleId: string; metricId: string }>();

interface MetricDetailExtra {
  cadence: string;
  dataSource: string;
  collectionMethod: string;
  calculation: string;
  thresholds: { good: string; warning: string; critical: string };
}

const metricDetailExtras: Record<string, MetricDetailExtra> = {
  // ── Executive ──────────────────────────────────
  "exec-m01": { cadence: "Daily", dataSource: "YiAi analytics + YiVad page views + YiPet extension pings", collectionMethod: "Aggregated unique user IDs per day across all 3 products", calculation: "COUNT(DISTINCT user_id) WHERE active_date = TODAY()", thresholds: { good: "≥ 45", warning: "30–45", critical: "< 30" } },
  "exec-m02": { cadence: "Monthly", dataSource: "YiAi tenant registry + business line onboarding records", collectionMethod: "Manual verification of active tenant usage per billing cycle", calculation: "COUNT(tenants) WHERE status = 'active' AND monthly_requests > 100", thresholds: { good: "≥ 3", warning: "2", critical: "< 2" } },
  "exec-m03": { cadence: "Weekly", dataSource: "YiAi agent task logs + aiChat completion events", collectionMethod: "Agent task completion events tagged with automation level", calculation: "automated_tasks / total_tasks * 100 WHERE agent_involved = true", thresholds: { good: "≥ 65%", warning: "50–65%", critical: "< 50%" } },
  "exec-m04": { cadence: "Weekly", dataSource: "YiKnowledge file scan + MongoDB knowledge_files collection", collectionMethod: "Weekly scan of frontmatter completeness across all files", calculation: "COUNT(files) WHERE frontmatter.status IN ('stable','review')", thresholds: { good: "≥ 480", warning: "400–480", critical: "< 400" } },
  "exec-m05": { cadence: "Monthly", dataSource: "HR onboarding records + YiKnowledge freshness + team survey", collectionMethod: "Composite score: 40% onboarding time + 30% freshness + 30% survey", calculation: "0.4*onboarding_score + 0.3*freshness_pct + 0.3*survey_avg", thresholds: { good: "≥ 80", warning: "60–80", critical: "< 60" } },
  "exec-m06": { cadence: "Monthly", dataSource: "OKR tracking spreadsheet + YiVad goal hierarchy", collectionMethod: "Manual mapping of team goals to company-level OKRs per quarter", calculation: "aligned_goals / total_goals * 100", thresholds: { good: "≥ 90%", warning: "75–90%", critical: "< 75%" } },
  "exec-m07": { cadence: "Quarterly", dataSource: "Finance system + HR headcount records", collectionMethod: "Annualized revenue divided by current FTE count", calculation: "(quarterly_revenue * 4) / total_fte", thresholds: { good: "≥ $200K", warning: "$150K–200K", critical: "< $150K" } },
  "exec-m08": { cadence: "Quarterly", dataSource: "Internal user survey (Google Forms)", collectionMethod: "NPS survey sent to all Yi product suite users quarterly", calculation: "promoters_pct - detractors_pct", thresholds: { good: "≥ 50", warning: "30–50", critical: "< 30" } },
  // ── Product ────────────────────────────────────
  "prod-m01": { cadence: "Weekly", dataSource: "YiAi task completion events + YiVad session logs", collectionMethod: "COUNT(DISTINCT user) WHERE completed_ai_task > 0 in past 7 days", calculation: "COUNT(DISTINCT user_id) WHERE ai_tasks_completed >= 1 AND date >= TODAY()-7", thresholds: { good: "≥ 45", warning: "25–45", critical: "< 25" } },
  "prod-m02": { cadence: "Weekly", dataSource: "In-app satisfaction survey (post-task prompt)", collectionMethod: "5-star rating prompt after each AI-assisted task completion", calculation: "AVG(rating) WHERE rating IS NOT NULL", thresholds: { good: "≥ 4.3", warning: "3.8–4.3", critical: "< 3.8" } },
  "prod-m03": { cadence: "Monthly", dataSource: "Feature flag analytics + user event tracking", collectionMethod: "Track feature flag exposure events and subsequent usage", calculation: "users_who_used_feature / users_exposed_to_feature * 100", thresholds: { good: "≥ 55%", warning: "35–55%", critical: "< 35%" } },
  "prod-m04": { cadence: "Monthly", dataSource: "User cohort analysis from YiAi auth logs", collectionMethod: "Cohort analysis: users who returned after first-use date", calculation: "returned_users / first_time_users * 100 WHERE days_since_first_use >= 30", thresholds: { good: "≥ 65%", warning: "40–65%", critical: "< 40%" } },
  "prod-m05": { cadence: "Weekly", dataSource: "GitHub Actions + deployment logs", collectionMethod: "Count production deployments per week across all projects", calculation: "COUNT(deployments) WHERE env = 'production' AND date >= TODAY()-7", thresholds: { good: "≥ 4", warning: "2–4", critical: "< 2" } },
  "prod-m06": { cadence: "Monthly", dataSource: "User onboarding funnel analytics", collectionMethod: "Time delta from account creation to first completed AI task", calculation: "AVG(first_task_completed_at - account_created_at)", thresholds: { good: "≤ 1.5 days", warning: "1.5–3 days", critical: "> 3 days" } },
  "prod-m07": { cadence: "Quarterly", dataSource: "Quarterly user survey (NPS module)", collectionMethod: "Standard NPS question: 'How likely are you to recommend Yi products?'", calculation: "promoters_pct - detractors_pct", thresholds: { good: "≥ 45", warning: "25–45", critical: "< 25" } },
  "prod-m08": { cadence: "Weekly", dataSource: "Incident tracker + deployment logs", collectionMethod: "Count deployments that resulted in incident or rollback", calculation: "failed_deployments / total_deployments * 100", thresholds: { good: "≤ 5%", warning: "5–10%", critical: "> 10%" } },
  // ── Leader ─────────────────────────────────────
  "lead-m01": { cadence: "Quarterly", dataSource: "Architecture review checklist + ADR repository", collectionMethod: "Assessment against architecture maturity model criteria", calculation: "SUM(level_scores) / 4 WHERE levels = [defined, measured, optimized, adaptive]", thresholds: { good: "≥ 4", warning: "3", critical: "< 3" } },
  "lead-m02": { cadence: "Monthly", dataSource: "Deployment logs + incident tracker + CI pipeline", collectionMethod: "Composite: 25% deploy freq + 25% lead time + 25% CFR + 25% MTTR", calculation: "0.25*deploy_score + 0.25*lead_time_score + 0.25*cfr_score + 0.25*mttr_score", thresholds: { good: "≥ 80", warning: "50–80", critical: "< 50" } },
  "lead-m03": { cadence: "Weekly", dataSource: "LLM API usage logs + billing dashboard", collectionMethod: "Total LLM API cost divided by completed agent tasks", calculation: "SUM(llm_cost) / COUNT(completed_agent_tasks)", thresholds: { good: "≤ $0.10", warning: "$0.10–0.15", critical: "> $0.15" } },
  "lead-m04": { cadence: "Monthly", dataSource: "GitHub issues tagged 'tech-debt' + resolution tracker", collectionMethod: "Count of open tech-debt issues vs. resolved in past 90 days", calculation: "COUNT(open_tech_debt_issues)", thresholds: { good: "≤ 15", warning: "15–30", critical: "> 30" } },
  "lead-m05": { cadence: "Weekly", dataSource: "Dependabot alerts + CVE database", collectionMethod: "Median time from CVE disclosure to merged fix PR", calculation: "MEDIAN(fix_merged_at - cve_disclosed_at) WHERE severity = 'critical'", thresholds: { good: "≤ 3 days", warning: "3–7 days", critical: "> 7 days" } },
  "lead-m06": { cadence: "Monthly", dataSource: "ADR repository + decision log", collectionMethod: "Manual audit: significant decisions vs. documented ADRs", calculation: "documented_decisions / total_significant_decisions * 100", thresholds: { good: "≥ 90%", warning: "70–90%", critical: "< 70%" } },
  "lead-m07": { cadence: "Weekly", dataSource: "Vitest / pytest coverage reports from CI", collectionMethod: "Average of line coverage percentages across all 3 projects", calculation: "(yivad_coverage + yipet_coverage + yiai_coverage) / 3", thresholds: { good: "≥ 60%", warning: "30–60%", critical: "< 30%" } },
  // ── Engineer ───────────────────────────────────
  "eng-m01": { cadence: "Weekly", dataSource: "GitHub Actions deployment logs", collectionMethod: "Count production deployments per project per week", calculation: "COUNT(deployments) WHERE env = 'production' AND date >= TODAY()-7", thresholds: { good: "≥ 3.5", warning: "2–3.5", critical: "< 2" } },
  "eng-m02": { cadence: "Weekly", dataSource: "GitHub commit timestamps + deployment logs", collectionMethod: "Median time from commit timestamp to production deploy timestamp", calculation: "MEDIAN(deployed_at - committed_at)", thresholds: { good: "≤ 1 day", warning: "1–2 days", critical: "> 2 days" } },
  "eng-m03": { cadence: "Weekly", dataSource: "Incident tracker + deployment logs", collectionMethod: "Count deployments causing incidents / total deployments", calculation: "incident_deployments / total_deployments * 100", thresholds: { good: "≤ 5%", warning: "5–10%", critical: "> 10%" } },
  "eng-m04": { cadence: "Weekly", dataSource: "GitHub PR review timestamps", collectionMethod: "Median time from PR open to first review comment", calculation: "MEDIAN(first_review_at - pr_opened_at)", thresholds: { good: "≤ 2 hours", warning: "2–4 hours", critical: "> 4 hours" } },
  "eng-m05": { cadence: "Daily", dataSource: "Pre-commit hook logs + CI pipeline results", collectionMethod: "Percentage of commits that pass lint + type-check on first attempt", calculation: "passing_commits / total_commits * 100", thresholds: { good: "≥ 92%", warning: "80–92%", critical: "< 80%" } },
  "eng-m06": { cadence: "Monthly", dataSource: "YiKnowledge git log + file metadata", collectionMethod: "Count new files authored by engineers in engineer/ directory", calculation: "COUNT(new_files) WHERE author_role = 'engineer' AND created_at >= month_start", thresholds: { good: "≥ 14", warning: "8–14", critical: "< 8" } },
  "eng-m07": { cadence: "Monthly", dataSource: "HR onboarding records + GitHub first-PR timestamps", collectionMethod: "Days from start date to first merged PR", calculation: "AVG(first_pr_merged_at - start_date)", thresholds: { good: "≤ 5 days", warning: "5–10 days", critical: "> 10 days" } },
  // ── SRE ────────────────────────────────────────
  "sre-m01": { cadence: "Daily", dataSource: "YiAi health check endpoint + uptime monitor", collectionMethod: "Probe /health every 60s from 3 regions, count successful responses", calculation: "successful_probes / total_probes * 100", thresholds: { good: "≥ 99.5%", warning: "99.0–99.5%", critical: "< 99.0%" } },
  "sre-m02": { cadence: "Daily", dataSource: "YiAi request logs + APM traces", collectionMethod: "99th percentile of non-LLM endpoint response times per day", calculation: "PERCENTILE(response_time_ms, 0.99) WHERE endpoint NOT LIKE '/agent/%'", thresholds: { good: "≤ 500ms", warning: "500–800ms", critical: "> 800ms" } },
  "sre-m03": { cadence: "Daily", dataSource: "SLO error budget tracker", collectionMethod: "Remaining error budget = total budget - consumed downtime", calculation: "(1 - downtime_minutes / total_minutes) / (1 - slo_target) * 100", thresholds: { good: "≥ 50%", warning: "20–50%", critical: "< 20%" } },
  "sre-m04": { cadence: "Weekly", dataSource: "PagerDuty incident timeline", collectionMethod: "Average time from first symptom to alert trigger", calculation: "AVG(alert_triggered_at - incident_start_at)", thresholds: { good: "≤ 3 min", warning: "3–5 min", critical: "> 5 min" } },
  "sre-m05": { cadence: "Weekly", dataSource: "PagerDuty incident timeline", collectionMethod: "Average time from alert trigger to incident resolution", calculation: "AVG(resolved_at - alert_triggered_at)", thresholds: { good: "≤ 20 min", warning: "20–30 min", critical: "> 30 min" } },
  "sre-m06": { cadence: "Weekly", dataSource: "Alert manager + SLO dashboard", collectionMethod: "SLO breaches that fired an alert within 2 minutes", calculation: "breaches_with_alert / total_slo_breaches * 100", thresholds: { good: "≥ 92%", warning: "80–92%", critical: "< 80%" } },
  "sre-m07": { cadence: "Weekly", dataSource: "Deployment logs + incident tracker", collectionMethod: "Deployments completed without rollback or hotfix", calculation: "clean_deployments / total_deployments * 100", thresholds: { good: "≥ 95%", warning: "90–95%", critical: "< 90%" } },
  // ── AI Engineer ────────────────────────────────
  "aier-m01": { cadence: "Weekly", dataSource: "RAG evaluation benchmark suite (100+ queries)", collectionMethod: "Run benchmark queries, score relevance of top-3 retrieved chunks", calculation: "AVG(relevance_score) WHERE score IN [0,1] per query", thresholds: { good: "≥ 0.82", warning: "0.70–0.82", critical: "< 0.70" } },
  "aier-m02": { cadence: "Weekly", dataSource: "Agent task execution logs", collectionMethod: "Count agent tasks that reach stop=completed vs. error/max_turns", calculation: "completed_tasks / total_agent_tasks * 100", thresholds: { good: "≥ 70%", warning: "50–70%", critical: "< 50%" } },
  "aier-m03": { cadence: "Weekly", dataSource: "Agent turn logs + model_switch events", collectionMethod: "Percentage of agent turns where model escalation occurred", calculation: "escalated_turns / total_agent_turns * 100", thresholds: { good: "≤ 10%", warning: "10–20%", critical: "> 20%" } },
  "aier-m04": { cadence: "Weekly", dataSource: "RAG response audit (manual sampling)", collectionMethod: "Manual review of 50 random citations per week for correctness", calculation: "correct_citations / total_citations_sampled * 100", thresholds: { good: "≥ 90%", warning: "80–90%", critical: "< 80%" } },
  "aier-m05": { cadence: "Weekly", dataSource: "LLM API billing + agent task quality scores", collectionMethod: "Total LLM cost divided by sum of task quality scores", calculation: "SUM(llm_cost) / SUM(task_quality_score)", thresholds: { good: "≤ $0.015", warning: "$0.015–0.025", critical: "> $0.025" } },
  "aier-m06": { cadence: "Monthly", dataSource: "Prompt A/B test framework results", collectionMethod: "Percentage of A/B tests where the new prompt variant wins", calculation: "winning_tests / total_ab_tests * 100", thresholds: { good: "≥ 60%", warning: "45–60%", critical: "< 45%" } },
  "aier-m07": { cadence: "Monthly", dataSource: "YiAi benchmark suite (CRUD + RAG + BRD + code)", collectionMethod: "Run full benchmark suite, count passing tests", calculation: "passing_tests / total_benchmark_tests * 100", thresholds: { good: "≥ 80%", warning: "60–80%", critical: "< 60%" } },
  "aier-m08": { cadence: "Monthly", dataSource: "GitHub issue tracker + deployment logs", collectionMethod: "Median time from feature request label to production deploy", calculation: "MEDIAN(deployed_at - issue_created_at) WHERE label = 'ai-feature'", thresholds: { good: "≤ 7 days", warning: "7–14 days", critical: "> 14 days" } },
  // ── Curator ────────────────────────────────────
  "cur-m01": { cadence: "Weekly", dataSource: "YiKnowledge file scan", collectionMethod: "Count files with frontmatter.status IN ('stable','review')", calculation: "COUNT(files) WHERE frontmatter.status IN ('stable','review')", thresholds: { good: "≥ 480", warning: "350–480", critical: "< 350" } },
  "cur-m02": { cadence: "Weekly", dataSource: "YiKnowledge frontmatter validation scan", collectionMethod: "Percentage of files passing all required frontmatter field checks", calculation: "compliant_files / total_files * 100", thresholds: { good: "≥ 92%", warning: "80–92%", critical: "< 80%" } },
  "cur-m03": { cadence: "Weekly", dataSource: "YiKnowledge last_verified field scan", collectionMethod: "Files where last_verified is within their declared review_cycle", calculation: "fresh_files / total_files * 100", thresholds: { good: "≥ 85%", warning: "70–85%", critical: "< 70%" } },
  "cur-m04": { cadence: "Monthly", dataSource: "Readiness checklist audit results", collectionMethod: "Manual audit of stable files against 10-point readiness checklist", calculation: "files_passing_checklist / files_audited * 100", thresholds: { good: "≥ 85%", warning: "65–85%", critical: "< 65%" } },
  "cur-m05": { cadence: "Daily", dataSource: "YiKnowledge inbox directory scan", collectionMethod: "Age of the oldest file in the inbox/ directory", calculation: "MAX(TODAY() - file_created_date) WHERE dir = 'inbox/'", thresholds: { good: "≤ 1 day", warning: "1–3 days", critical: "> 3 days" } },
  "cur-m06": { cadence: "Weekly", dataSource: "YiKnowledge link graph analysis", collectionMethod: "Files with zero related links or no role home directory", calculation: "orphan_files / total_files * 100", thresholds: { good: "≤ 3%", warning: "3–8%", critical: "> 8%" } },
  "cur-m07": { cadence: "Monthly", dataSource: "YiKnowledge search analytics + user timing", collectionMethod: "Median time from search query to file open event", calculation: "MEDIAN(file_opened_at - search_query_at)", thresholds: { good: "≤ 20 sec", warning: "20–60 sec", critical: "> 60 sec" } },
  "cur-m08": { cadence: "Monthly", dataSource: "YiKnowledge frontmatter related-links field scan", collectionMethod: "Average count of entries in the related frontmatter field", calculation: "AVG(COUNT(related_links)) per file", thresholds: { good: "≥ 4.5", warning: "2.5–4.5", critical: "< 2.5" } }
};

const roleName = computed(() => rolesData[props.roleId]?.name || props.roleId);

const lastUpdated = computed(() => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
});

const metric = computed(() => {
  const m = metricsData[props.roleId]?.find(m => m.id === props.metricId);
  if (!m) return null;
  const extra = metricDetailExtras[props.metricId];
  return { ...m, ...extra };
});

// ── Prev/Next navigation ────────────────────────
const roleMetrics = computed(() => metricsData[props.roleId] || []);

const metricIndex = computed(() => {
  const idx = roleMetrics.value.findIndex(m => m.id === props.metricId);
  return idx === -1 ? null : idx;
});

const roleMetricCount = computed(() => roleMetrics.value.length);

const prevMetric = computed(() => {
  if (metricIndex.value === null || metricIndex.value <= 0) return null;
  return roleMetrics.value[metricIndex.value - 1];
});

const nextMetric = computed(() => {
  if (metricIndex.value === null || metricIndex.value >= roleMetrics.value.length - 1) return null;
  return roleMetrics.value[metricIndex.value + 1];
});

// ── Invert goal→metric map to find related goals ──
const relatedGoals = computed(() => {
  if (!metric.value) return [];
  const goalIds = new Set<string>();
  for (const [gid, mids] of Object.entries(goalMetricMap)) {
    if (mids.includes(props.metricId)) goalIds.add(gid);
  }
  const results: Array<{ id: string; icon: string; name: string; description: string }> = [];
  for (const gid of goalIds) {
    for (const roleGoals of Object.values(goalsData)) {
      const g = roleGoals.find(g => g.id === gid);
      if (g) {
        results.push({ id: g.id, icon: g.icon, name: g.title, description: g.description });
        break;
      }
    }
  }
  return results;
});

function goalRoleId(goalId: string): string {
  for (const rid of ROLE_IDS) {
    if ((goalsData[rid] || []).some(g => g.id === goalId)) return rid;
  }
  return "executiver";
}

// ── Computed: trend direction ──────────────────
const isLowerBetter = computed(() => metric.value?.trend === "down");

const clampedProgress = computed(() => {
  if (!metric.value) return 0;
  return Math.min(100, Math.max(0, Math.round(metric.value.progress)));
});

const displayValue = computed(() => {
  if (!metric.value) return "";
  const v = metric.value.current;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
});

// ── Computed: gauge ────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 62; // r=62

const gaugeColor = computed(() => {
  const p = clampedProgress.value;
  if (p >= 100) return "var(--el-color-success)";
  if (p >= 60) return "var(--el-color-primary)";
  if (p >= 30) return "var(--el-color-warning)";
  return "var(--el-color-danger)";
});

const gaugeDasharray = computed(() => {
  const pct = clampedProgress.value / 100;
  const filled = CIRCUMFERENCE * pct;
  return `${filled} ${CIRCUMFERENCE}`;
});

// ── Computed: delta ────────────────────────────
const deltaIcon = computed(() => {
  if (!metric.value) return "";
  return isLowerBetter.value ? "📉" : "📈";
});

const deltaLabel = computed(() => {
  if (!metric.value) return "";
  return isLowerBetter.value ? "Below Target" : "Above Baseline";
});

const deltaText = computed(() => {
  if (!metric.value) return "";
  const m = metric.value;
  const diff = isLowerBetter.value ? m.target - m.current : m.current - m.baseline;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${Number.isInteger(diff) ? diff : diff.toFixed(1)}${m.unit}`;
});

// ── Computed: trend tag ────────────────────────
const trendTagType = computed(() => {
  if (!metric.value) return "info";
  const p = clampedProgress.value;
  if (p >= 100) return "success";
  if (p >= 60) return "primary";
  if (p >= 30) return "warning";
  return "danger";
});

const trendLabel = computed(() => {
  if (!metric.value) return "";
  const m = metric.value;
  if (m.trend === "up") return "Higher is better";
  if (m.trend === "down") return "Lower is better";
  return "Stable";
});

// ── Computed: threshold active zone ────────────
const thresholdActive = computed(() => {
  if (!metric.value) return "";
  const m = metric.value;
  const goodStr = m.thresholds.good;
  const warnStr = m.thresholds.warning;
  const v = m.current;
  // Parse threshold strings to determine which zone the current value is in
  const goodNum = extractThreshold(goodStr);
  const warnNums = extractRange(warnStr);
  if (goodNum !== null) {
    if (isLowerBetter.value ? v <= goodNum : v >= goodNum) return "good";
  }
  if (warnNums) {
    if (v >= warnNums[0] && v <= warnNums[1]) return "warning";
  }
  return "critical";
});

function extractThreshold(s: string): number | null {
  const match = s.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function extractRange(s: string): [number, number] | null {
  const matches = s.match(/[\d.]+/g);
  if (matches && matches.length >= 2) {
    return [parseFloat(matches[0]), parseFloat(matches[1])];
  }
  return null;
}

// ── Computed: trend sparkline ──────────────────
const sparkGradientId = computed(() => `spark-grad-${props.metricId}`);

const glowId = computed(() => `gauge-glow-${props.metricId}`);

// ── Deterministic PRNG for sparkline ────────────
function hashMetricId(id: string): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) | 0;
  }
  return hash;
}

function seedRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

interface TrendPoint { label: string; value: number }

const trendData = computed<TrendPoint[]>(() => {
  if (!metric.value) return [];
  const m = metric.value;
  const labels = m.cadence === "Weekly" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : m.cadence === "Monthly" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    : m.cadence === "Quarterly" ? ["Q1", "Q2", "Q3", "Q4"]
    : m.cadence === "Daily" ? ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Today"]
    : ["T-6", "T-5", "T-4", "T-3", "T-2", "T-1", "Now"];
  const count = labels.length;
  const points: TrendPoint[] = [];
  const direction = m.trend === "up" ? 1 : -1;
  const range = Math.abs(m.baseline - m.target) * 0.3;
  // Deterministic seed from metric ID — stable across renders
  const rng = seedRandom(hashMetricId(props.metricId));
  let val = m.current - direction * range * 0.6;
  for (let i = 0; i < count; i++) {
    const noise = (rng() - 0.5) * range * 0.4;
    const drift = direction * (range / count) * i;
    val = m.current + drift - direction * range * 0.5 + noise;
    val = Math.max(m.baseline * 0.8, Math.min(m.baseline * 1.5, val));
    val = Math.round(val * 10) / 10;
    points.push({ label: labels[i], value: val });
  }
  points[count - 1] = { label: labels[count - 1], value: m.current };
  return points;
});

const sparkLinePoints = computed(() => {
  const data = trendData.value;
  if (!data.length) return "";
  const W = 600;
  const H = 100;
  const pad = 20;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
});

const sparkAreaPoints = computed(() => {
  const line = sparkLinePoints.value;
  if (!line) return "";
  const W = 600;
  const H = 100;
  const pad = 20;
  return `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
});

const sparkDots = computed(() => {
  const data = trendData.value;
  if (!data.length) return [];
  const W = 600;
  const H = 100;
  const pad = 20;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  return data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2);
    return { x, y };
  });
});

</script>

<style scoped lang="scss">
.metric-detail {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; overflow: hidden;
  background: var(--el-bg-color-page);
}

// ── Sticky header ──────────────────────────────
.metric-detail__sticky-bar {
  position: sticky; top: 0; z-index: 10;
  background: var(--el-bg-color); border-bottom: 1px solid var(--el-border-color-lighter);
  backdrop-filter: blur(12px);
}
.metric-detail__sticky-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 32px;
}
.metric-detail__sticky-left {
  display: flex; align-items: center; gap: 8px;
}
.metric-detail__sticky-icon { font-size: 20px; }
.metric-detail__sticky-name { font-size: 15px; font-weight: 600; }
.metric-detail__sticky-actions { display: flex; gap: 4px; }

// ── Body ───────────────────────────────────────
.metric-detail__body {
  flex: 1; overflow: auto; padding: 20px 32px 40px;
  width: 100%; box-sizing: border-box;
}

// ── Breadcrumb ─────────────────────────────────
.metric-detail__breadcrumb { margin-bottom: 16px; }

// ── Meta chips ─────────────────────────────────
.metric-detail__meta {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
}
.metric-detail__meta-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; background: var(--el-fill-color-light);
  border-radius: 20px; font-size: 12px;
  code { font-family: monospace; font-size: 11px; background: var(--el-fill-color); padding: 1px 6px; border-radius: 3px; }
}
.metric-detail__meta-chip-label { font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; font-size: 10px; }
.metric-detail__meta-chip-value { color: var(--el-text-color-regular); }

// ── Sections ───────────────────────────────────
.metric-detail__section { margin-bottom: 28px; }
.metric-detail__section-title {
  margin: 0 0 14px; font-size: 15px; font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex; align-items: baseline; justify-content: space-between;
}
.metric-detail__section-aside {
  font-size: 11px; font-weight: 400; color: var(--el-text-color-placeholder);
}
.metric-detail__desc {
  margin: 0; font-size: 13px; line-height: 1.8; color: var(--el-text-color-regular);
  padding: 14px 16px; background: var(--el-fill-color-light);
  border-radius: 10px; border-left: 3px solid var(--el-color-primary-light-5);
}

// ── Gauge row ──────────────────────────────────
.metric-detail__gauge-row {
  display: flex; align-items: center; gap: 32px; margin-bottom: 20px;
}
.metric-detail__gauge { flex-shrink: 0; }
.metric-detail__gauge-svg { width: 170px; height: 170px; display: block; }
.metric-detail__gauge-arc { transition: stroke-dasharray .8s ease; }
.metric-detail__gauge-value { font-size: 22px; font-weight: 700; fill: var(--el-text-color-primary); }
.metric-detail__gauge-unit { font-size: 11px; fill: var(--el-text-color-secondary); }
.metric-detail__gauge-label { font-size: 10px; fill: var(--el-text-color-placeholder); text-transform: uppercase; letter-spacing: .5px; }

// ── Stat stack ─────────────────────────────────
.metric-detail__stat-stack { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.metric-detail__stat {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 10px;
}
.metric-detail__stat--target { background: var(--el-color-success-light-9); border: 1px solid var(--el-color-success-light-6); }
.metric-detail__stat--baseline { background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter); }
.metric-detail__stat--delta { background: var(--el-color-primary-light-9); border: 1px solid var(--el-color-primary-light-6); }
.metric-detail__stat-icon { font-size: 20px; flex-shrink: 0; }
.metric-detail__stat-body { display: flex; flex-direction: column; gap: 2px; }
.metric-detail__stat-label { font-size: 10px; font-weight: 600; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .3px; }
.metric-detail__stat-value { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); }

// ── Progress bar ───────────────────────────────
.metric-detail__progress-bar { margin-top: 4px; }
.metric-detail__progress-track {
  height: 8px; background: var(--el-fill-color); border-radius: 4px; overflow: hidden;
}
.metric-detail__progress-fill {
  height: 100%; border-radius: 4px; transition: width .8s ease;
  min-width: 0;
}
.metric-detail__progress-labels {
  display: flex; justify-content: space-between; margin-top: 6px;
  font-size: 11px; color: var(--el-text-color-placeholder);
}

// ── Sparkline ──────────────────────────────────
.metric-detail__sparkline {
  padding: 16px 0 8px;
  svg { width: 100%; height: auto; }
}
.metric-detail__sparkline-svg { display: block; }
.metric-detail__sparkline-labels {
  display: flex; justify-content: space-between; margin-top: 6px;
  padding: 0 8px;
}
.metric-detail__sparkline-label {
  font-size: 10px; color: var(--el-text-color-placeholder);
  &--now { color: var(--el-text-color-secondary); font-weight: 600; }
}

// ── Two-column layout ────────────────────────────
.metric-detail__two-col {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px;
}
.metric-detail__two-col-item {
  min-width: 0;
  .metric-detail__section-title { margin-bottom: 14px; }
}

// ── Thresholds ─────────────────────────────────
.metric-detail__thresholds { display: flex; flex-direction: column; gap: 8px; }
.metric-detail__threshold {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 10px; position: relative;
  transition: box-shadow .2s, border-color .2s;
  border: 2px solid transparent;
}
.metric-detail__threshold--active {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-3);
}
.metric-detail__threshold--good { background: #e6ffed; border-color: #b7ebc9; }
.metric-detail__threshold--warn { background: #fff8e6; border-color: #ffe0a3; }
.metric-detail__threshold--bad { background: #ffeef0; border-color: #ffccd3; }
.metric-detail__threshold-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
}
.metric-detail__threshold-dot--good { background: #52c41a; }
.metric-detail__threshold-dot--warn { background: #faad14; }
.metric-detail__threshold-dot--bad { background: #ff4d4f; }
.metric-detail__threshold-body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.metric-detail__threshold-label { font-weight: 600; font-size: 13px; }
.metric-detail__threshold-range { font-size: 12px; color: var(--el-text-color-secondary); font-family: monospace; }
.metric-detail__threshold-badge {
  font-size: 10px; font-weight: 600; color: #fff; background: #52c41a;
  padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: .3px;
}
.metric-detail__threshold-badge--warn { background: #faad14; }
.metric-detail__threshold-badge--bad { background: #ff4d4f; }

// ── Measurement ────────────────────────────────
.metric-detail__measure-list {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;
}
.metric-detail__measure {
  padding: 14px 16px; background: var(--el-fill-color-light);
  border-radius: 10px; display: flex; flex-direction: column; gap: 8px;
}
.metric-detail__measure-head { display: flex; align-items: center; gap: 8px; }
.metric-detail__measure-icon { font-size: 16px; }
.metric-detail__measure-label { font-weight: 600; font-size: 12px; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .3px; }
.metric-detail__measure-value { font-size: 13px; color: var(--el-text-color-regular); line-height: 1.6; }
.metric-detail__measure-code {
  font-family: "SF Mono", "Fira Code", monospace; font-size: 11px;
  color: var(--el-color-primary); background: var(--el-fill-color);
  padding: 8px 12px; border-radius: 6px; line-height: 1.6; word-break: break-all;
}

// ── Related goals ──────────────────────────────
.metric-detail__related { display: flex; flex-direction: column; gap: 8px; }
.metric-detail__related-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: var(--el-fill-color-light);
  border-radius: 10px; cursor: pointer;
  transition: box-shadow .2s, border-color .2s, transform .15s;
  border: 1px solid transparent;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
    transform: translateX(3px);
  }
}
.metric-detail__related-card-icon { font-size: 20px; flex-shrink: 0; }
.metric-detail__related-card-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.metric-detail__related-card-name { font-weight: 600; font-size: 13px; color: var(--el-color-primary); }
.metric-detail__related-card-desc { font-size: 12px; color: var(--el-text-color-secondary); }
.metric-detail__related-card-arrow { color: var(--el-text-color-placeholder); font-size: 14px; flex-shrink: 0; }

// ── Related goals empty ──────────────────────────
.metric-detail__related-empty {
  display: flex; align-items: center; gap: 10px;
  padding: 20px; text-align: center; color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light); border-radius: 10px;
  font-size: 13px; justify-content: center;
}
.metric-detail__related-empty-icon { font-size: 20px; }

// ── Sticky nav ───────────────────────────────────
.metric-detail__sticky-nav-hint {
  font-size: 11px; color: var(--el-text-color-placeholder);
  font-family: monospace; min-width: 40px; text-align: center;
}

// ── Not found ────────────────────────────────────
.metric-detail__not-found {
  display: flex; align-items: center; justify-content: center;
  flex: 1; min-height: 400px;
}
.metric-detail__not-found-inner {
  text-align: center; max-width: 360px;
  h2 { margin: 12px 0 8px; font-size: 18px; color: var(--el-text-color-primary); }
  p { margin: 0 0 20px; font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.6; }
  code { font-family: monospace; background: var(--el-fill-color); padding: 1px 6px; border-radius: 3px; font-size: 11px; }
}
.metric-detail__not-found-icon { font-size: 48px; display: block; }
</style>