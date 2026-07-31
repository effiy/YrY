import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (static routes)
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: HOME_URL
  },
  {
    path: LOGIN_URL,
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "Login"
    }
  },
  {
    path: "/layout",
    name: "layout",
    component: () => import("@/layouts/index.vue"),
    // component: () => import("@/layouts/indexAsync.vue"),
    redirect: HOME_URL,
    children: [
      {
        path: "/aiChat",
        name: "aiChat",
        component: () => import("@/views/aiChat/index.vue"),
        meta: {
          title: "AI Chat"
        }
      },
      {
        path: "/bug/detail/:id",
        name: "bugDetail",
        component: () => import("@/views/bug/detail.vue"),
        meta: {
          title: "Bug Detail",
          activeMenu: "/bug/list",
          isHide: true,
          isKeepAlive: true
        }
      },
      {
        path: "/knowledge",
        name: "knowledgeHub",
        component: () => import("@/views/knowledge/index.vue"),
        meta: {
          title: "Knowledge"
        }
      },
      {
        path: "/knowledge/:category",
        name: "knowledgeList",
        component: () => import("@/views/knowledge/CategoryList.vue"),
        meta: {
          title: "Knowledge Category",
          isKeepAlive: true
        }
      },
      {
        path: "/knowledge/detail",
        name: "knowledgeDetail",
        component: () => import("@/views/knowledge/Detail.vue"),
        meta: {
          title: "Knowledge Detail",
          activeMenu: "/knowledge",
          isHide: true,
          isKeepAlive: true
        }
      },
      // Knowledge leaves — 2nd-level view folders, list + detail pair per leaf.
      // Generated from src/views/knowledge/leaves.ts; paths and names kept
      // literal so Rsbuild's static analyzer can resolve them.
      {
        path: "/knowledge/industry/competitors",
        name: "kIndustryCompetitorsList",
        component: () => import("@/views/knowledge/industry/competitors/index.vue"),
        meta: { title: "Competitors", isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/competitors/detail",
        name: "kIndustryCompetitorsDetail",
        component: () => import("@/views/knowledge/industry/competitors/detail.vue"),
        meta: { title: "Competitors Detail", activeMenu: "/knowledge/industry/competitors", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/market-trends",
        name: "kIndustryMarketTrendsList",
        component: () => import("@/views/knowledge/industry/market-trends/index.vue"),
        meta: { title: "Market Trends", isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/market-trends/detail",
        name: "kIndustryMarketTrendsDetail",
        component: () => import("@/views/knowledge/industry/market-trends/detail.vue"),
        meta: { title: "Market Trends Detail", activeMenu: "/knowledge/industry/market-trends", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/reports",
        name: "kIndustryReportsList",
        component: () => import("@/views/knowledge/industry/reports/index.vue"),
        meta: { title: "Industry Reports", isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/reports/detail",
        name: "kIndustryReportsDetail",
        component: () => import("@/views/knowledge/industry/reports/detail.vue"),
        meta: { title: "Industry Reports Detail", activeMenu: "/knowledge/industry/reports", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/use-cases",
        name: "kIndustryUseCasesList",
        component: () => import("@/views/knowledge/industry/use-cases/index.vue"),
        meta: { title: "Use Cases", isKeepAlive: true }
      },
      {
        path: "/knowledge/industry/use-cases/detail",
        name: "kIndustryUseCasesDetail",
        component: () => import("@/views/knowledge/industry/use-cases/detail.vue"),
        meta: { title: "Use Cases Detail", activeMenu: "/knowledge/industry/use-cases", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/lessons/wins",
        name: "kLessonsWinsList",
        component: () => import("@/views/knowledge/lessons/wins/index.vue"),
        meta: { title: "Wins", isKeepAlive: true }
      },
      {
        path: "/knowledge/lessons/wins/detail",
        name: "kLessonsWinsDetail",
        component: () => import("@/views/knowledge/lessons/wins/detail.vue"),
        meta: { title: "Wins Detail", activeMenu: "/knowledge/lessons/wins", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/lessons/failures",
        name: "kLessonsFailuresList",
        component: () => import("@/views/knowledge/lessons/failures/index.vue"),
        meta: { title: "Failures", isKeepAlive: true }
      },
      {
        path: "/knowledge/lessons/failures/detail",
        name: "kLessonsFailuresDetail",
        component: () => import("@/views/knowledge/lessons/failures/detail.vue"),
        meta: { title: "Failures Detail", activeMenu: "/knowledge/lessons/failures", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/lessons/gotchas",
        name: "kLessonsGotchasList",
        component: () => import("@/views/knowledge/lessons/gotchas/index.vue"),
        meta: { title: "Gotchas", isKeepAlive: true }
      },
      {
        path: "/knowledge/lessons/gotchas/detail",
        name: "kLessonsGotchasDetail",
        component: () => import("@/views/knowledge/lessons/gotchas/detail.vue"),
        meta: { title: "Gotchas Detail", activeMenu: "/knowledge/lessons/gotchas", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/methodology/ai-specific",
        name: "kMethodologyAiSpecificList",
        component: () => import("@/views/knowledge/methodology/ai-specific/index.vue"),
        meta: { title: "AI Methodology", isKeepAlive: true }
      },
      {
        path: "/knowledge/methodology/ai-specific/detail",
        name: "kMethodologyAiSpecificDetail",
        component: () => import("@/views/knowledge/methodology/ai-specific/detail.vue"),
        meta: { title: "AI Methodology Detail", activeMenu: "/knowledge/methodology/ai-specific", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/methodology/pm-frameworks",
        name: "kMethodologyPmFrameworksList",
        component: () => import("@/views/knowledge/methodology/pm-frameworks/index.vue"),
        meta: { title: "PM Frameworks", isKeepAlive: true }
      },
      {
        path: "/knowledge/methodology/pm-frameworks/detail",
        name: "kMethodologyPmFrameworksDetail",
        component: () => import("@/views/knowledge/methodology/pm-frameworks/detail.vue"),
        meta: { title: "PM Frameworks Detail", activeMenu: "/knowledge/methodology/pm-frameworks", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/methodology/thinking",
        name: "kMethodologyThinkingList",
        component: () => import("@/views/knowledge/methodology/thinking/index.vue"),
        meta: { title: "Thinking Models", isKeepAlive: true }
      },
      {
        path: "/knowledge/methodology/thinking/detail",
        name: "kMethodologyThinkingDetail",
        component: () => import("@/views/knowledge/methodology/thinking/detail.vue"),
        meta: { title: "Thinking Models Detail", activeMenu: "/knowledge/methodology/thinking", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/people/team",
        name: "kPeopleTeamList",
        component: () => import("@/views/knowledge/people/team/index.vue"),
        meta: { title: "Team", isKeepAlive: true }
      },
      {
        path: "/knowledge/people/team/detail",
        name: "kPeopleTeamDetail",
        component: () => import("@/views/knowledge/people/team/detail.vue"),
        meta: { title: "Team Detail", activeMenu: "/knowledge/people/team", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/people/stakeholders",
        name: "kPeopleStakeholdersList",
        component: () => import("@/views/knowledge/people/stakeholders/index.vue"),
        meta: { title: "Stakeholders", isKeepAlive: true }
      },
      {
        path: "/knowledge/people/stakeholders/detail",
        name: "kPeopleStakeholdersDetail",
        component: () => import("@/views/knowledge/people/stakeholders/detail.vue"),
        meta: { title: "Stakeholders Detail", activeMenu: "/knowledge/people/stakeholders", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/people/experts",
        name: "kPeopleExpertsList",
        component: () => import("@/views/knowledge/people/experts/index.vue"),
        meta: { title: "Experts", isKeepAlive: true }
      },
      {
        path: "/knowledge/people/experts/detail",
        name: "kPeopleExpertsDetail",
        component: () => import("@/views/knowledge/people/experts/detail.vue"),
        meta: { title: "Experts Detail", activeMenu: "/knowledge/people/experts", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/product/strategy",
        name: "kProductStrategyList",
        component: () => import("@/views/knowledge/product/strategy/index.vue"),
        meta: { title: "Product Strategy", isKeepAlive: true }
      },
      {
        path: "/knowledge/product/strategy/detail",
        name: "kProductStrategyDetail",
        component: () => import("@/views/knowledge/product/strategy/detail.vue"),
        meta: { title: "Product Strategy Detail", activeMenu: "/knowledge/product/strategy", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/product/prd",
        name: "kProductPrdList",
        component: () => import("@/views/knowledge/product/prd/index.vue"),
        meta: { title: "PRD", isKeepAlive: true }
      },
      {
        path: "/knowledge/product/prd/detail",
        name: "kProductPrdDetail",
        component: () => import("@/views/knowledge/product/prd/detail.vue"),
        meta: { title: "PRD Detail", activeMenu: "/knowledge/product/prd", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/product/ux",
        name: "kProductUxList",
        component: () => import("@/views/knowledge/product/ux/index.vue"),
        meta: { title: "UX", isKeepAlive: true }
      },
      {
        path: "/knowledge/product/ux/detail",
        name: "kProductUxDetail",
        component: () => import("@/views/knowledge/product/ux/detail.vue"),
        meta: { title: "UX Detail", activeMenu: "/knowledge/product/ux", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/product/metrics",
        name: "kProductMetricsList",
        component: () => import("@/views/knowledge/product/metrics/index.vue"),
        meta: { title: "Metrics", isKeepAlive: true }
      },
      {
        path: "/knowledge/product/metrics/detail",
        name: "kProductMetricsDetail",
        component: () => import("@/views/knowledge/product/metrics/detail.vue"),
        meta: { title: "Metrics Detail", activeMenu: "/knowledge/product/metrics", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/resources/prompts",
        name: "kResourcesPromptsList",
        component: () => import("@/views/knowledge/resources/prompts/index.vue"),
        meta: { title: "Prompts", isKeepAlive: true }
      },
      {
        path: "/knowledge/resources/prompts/detail",
        name: "kResourcesPromptsDetail",
        component: () => import("@/views/knowledge/resources/prompts/detail.vue"),
        meta: { title: "Prompts Detail", activeMenu: "/knowledge/resources/prompts", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/resources/templates",
        name: "kResourcesTemplatesList",
        component: () => import("@/views/knowledge/resources/templates/index.vue"),
        meta: { title: "Templates", isKeepAlive: true }
      },
      {
        path: "/knowledge/resources/templates/detail",
        name: "kResourcesTemplatesDetail",
        component: () => import("@/views/knowledge/resources/templates/detail.vue"),
        meta: { title: "Templates Detail", activeMenu: "/knowledge/resources/templates", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/resources/reading-list",
        name: "kResourcesReadingListList",
        component: () => import("@/views/knowledge/resources/reading-list/index.vue"),
        meta: { title: "Reading List", isKeepAlive: true }
      },
      {
        path: "/knowledge/resources/reading-list/detail",
        name: "kResourcesReadingListDetail",
        component: () => import("@/views/knowledge/resources/reading-list/detail.vue"),
        meta: { title: "Reading List Detail", activeMenu: "/knowledge/resources/reading-list", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/ai-foundations",
        name: "kTechAiFoundationsList",
        component: () => import("@/views/knowledge/tech/ai-foundations/index.vue"),
        meta: { title: "AI Foundations", isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/ai-foundations/detail",
        name: "kTechAiFoundationsDetail",
        component: () => import("@/views/knowledge/tech/ai-foundations/detail.vue"),
        meta: { title: "AI Foundations Detail", activeMenu: "/knowledge/tech/ai-foundations", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/ai-platform",
        name: "kTechAiPlatformList",
        component: () => import("@/views/knowledge/tech/ai-platform/index.vue"),
        meta: { title: "AI Platform", isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/ai-platform/detail",
        name: "kTechAiPlatformDetail",
        component: () => import("@/views/knowledge/tech/ai-platform/detail.vue"),
        meta: { title: "AI Platform Detail", activeMenu: "/knowledge/tech/ai-platform", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/data",
        name: "kTechDataList",
        component: () => import("@/views/knowledge/tech/data/index.vue"),
        meta: { title: "Data", isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/data/detail",
        name: "kTechDataDetail",
        component: () => import("@/views/knowledge/tech/data/detail.vue"),
        meta: { title: "Data Detail", activeMenu: "/knowledge/tech/data", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/infra",
        name: "kTechInfraList",
        component: () => import("@/views/knowledge/tech/infra/index.vue"),
        meta: { title: "Infra", isKeepAlive: true }
      },
      {
        path: "/knowledge/tech/infra/detail",
        name: "kTechInfraDetail",
        component: () => import("@/views/knowledge/tech/infra/detail.vue"),
        meta: { title: "Infra Detail", activeMenu: "/knowledge/tech/infra", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/work/processes",
        name: "kWorkProcessesList",
        component: () => import("@/views/knowledge/work/processes/index.vue"),
        meta: { title: "Processes", isKeepAlive: true }
      },
      {
        path: "/knowledge/work/processes/detail",
        name: "kWorkProcessesDetail",
        component: () => import("@/views/knowledge/work/processes/detail.vue"),
        meta: { title: "Processes Detail", activeMenu: "/knowledge/work/processes", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/work/collaboration",
        name: "kWorkCollaborationList",
        component: () => import("@/views/knowledge/work/collaboration/index.vue"),
        meta: { title: "Collaboration", isKeepAlive: true }
      },
      {
        path: "/knowledge/work/collaboration/detail",
        name: "kWorkCollaborationDetail",
        component: () => import("@/views/knowledge/work/collaboration/detail.vue"),
        meta: { title: "Collaboration Detail", activeMenu: "/knowledge/work/collaboration", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/work/meetings",
        name: "kWorkMeetingsList",
        component: () => import("@/views/knowledge/work/meetings/index.vue"),
        meta: { title: "Meetings", isKeepAlive: true }
      },
      {
        path: "/knowledge/work/meetings/detail",
        name: "kWorkMeetingsDetail",
        component: () => import("@/views/knowledge/work/meetings/detail.vue"),
        meta: { title: "Meetings Detail", activeMenu: "/knowledge/work/meetings", isHide: true, isKeepAlive: true }
      },
      {
        path: "/knowledge/work/tools",
        name: "kWorkToolsList",
        component: () => import("@/views/knowledge/work/tools/index.vue"),
        meta: { title: "Tools", isKeepAlive: true }
      },
      {
        path: "/knowledge/work/tools/detail",
        name: "kWorkToolsDetail",
        component: () => import("@/views/knowledge/work/tools/detail.vue"),
        meta: { title: "Tools Detail", activeMenu: "/knowledge/work/tools", isHide: true, isKeepAlive: true }
      },
      {
        path: "/rag",
        name: "ragPlayground",
        component: () => import("@/views/rag/index.vue"),
        meta: {
          title: "RAG Playground"
        }
      },
      // Tech-leadership per-topic detail routes — list routes live in
      // authMenuList.json. One detail route per topic folder keeps the
      // "each label = a folder" structure literal.
      {
        path: "/tech-leadership/roadmap-review/detail/:id?",
        name: "tlrRoadmapReviewDetail",
        component: () => import("@/views/tech-leadership/roadmap-review/detail.vue"),
        meta: { title: "Tech roadmap review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/adr-review/detail/:id?",
        name: "tlrAdrReviewDetail",
        component: () => import("@/views/tech-leadership/adr-review/detail.vue"),
        meta: { title: "Architecture decision records", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/risk-register/detail/:id?",
        name: "tlrRiskRegisterDetail",
        component: () => import("@/views/tech-leadership/risk-register/detail.vue"),
        meta: { title: "Risk register", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/dora-metrics/detail/:id?",
        name: "tlrDoraMetricsDetail",
        component: () => import("@/views/tech-leadership/dora-metrics/detail.vue"),
        meta: { title: "Engineering productivity metrics", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/tech-debt/detail/:id?",
        name: "tlrTechDebtDetail",
        component: () => import("@/views/tech-leadership/tech-debt/detail.vue"),
        meta: { title: "Tech debt inventory", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/oncall-handover/detail/:id?",
        name: "tlrOncallHandoverDetail",
        component: () => import("@/views/tech-leadership/oncall-handover/detail.vue"),
        meta: { title: "Oncall handover", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/dependency-audit/detail/:id?",
        name: "tlrDependencyAuditDetail",
        component: () => import("@/views/tech-leadership/dependency-audit/detail.vue"),
        meta: { title: "Dependency audit", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/tech-selection/detail/:id?",
        name: "tlrTechSelectionDetail",
        component: () => import("@/views/tech-leadership/tech-selection/detail.vue"),
        meta: { title: "Tech selection evaluation", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/org-diagnose/detail/:id?",
        name: "tlrOrgDiagnoseDetail",
        component: () => import("@/views/tech-leadership/org-diagnose/detail.vue"),
        meta: { title: "Org productivity diagnosis", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/postmortem/detail/:id?",
        name: "tlrPostmortemDetail",
        component: () => import("@/views/tech-leadership/postmortem/detail.vue"),
        meta: { title: "Incident postmortem", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/capacity-cost/detail/:id?",
        name: "tlrCapacityCostDetail",
        component: () => import("@/views/tech-leadership/capacity-cost/detail.vue"),
        meta: { title: "Capacity and cost", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/capacity-plan/detail/:id?",
        name: "tlrCapacityPlanDetail",
        component: () => import("@/views/tech-leadership/capacity-plan/detail.vue"),
        meta: { title: "Capacity plan", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/maturity-model/detail/:id?",
        name: "tlrMaturityModelDetail",
        component: () => import("@/views/tech-leadership/maturity-model/detail.vue"),
        meta: { title: "Maturity model", isHide: true, isKeepAlive: true }
      },
      // Code-review per-topic detail routes.
      {
        path: "/code-review/summary/detail/:id?",
        name: "crSummaryDetail",
        component: () => import("@/views/code-review/summary/detail.vue"),
        meta: { title: "Summarize this file", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/bugs/detail/:id?",
        name: "crBugsDetail",
        component: () => import("@/views/code-review/bugs/detail.vue"),
        meta: { title: "Find potential bugs", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/explain/detail/:id?",
        name: "crExplainDetail",
        component: () => import("@/views/code-review/explain/detail.vue"),
        meta: { title: "Explain the logic", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/security/detail/:id?",
        name: "crSecurityDetail",
        component: () => import("@/views/code-review/security/detail.vue"),
        meta: { title: "Security review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/dependency-risk/detail/:id?",
        name: "crDependencyRiskDetail",
        component: () => import("@/views/code-review/dependency-risk/detail.vue"),
        meta: { title: "Dependency risk", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/access-review/detail/:id?",
        name: "crAccessReviewDetail",
        component: () => import("@/views/code-review/access-review/detail.vue"),
        meta: { title: "Access review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/refactor/detail/:id?",
        name: "crRefactorDetail",
        component: () => import("@/views/code-review/refactor/detail.vue"),
        meta: { title: "Refactor suggestions", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/perf/detail/:id?",
        name: "crPerfDetail",
        component: () => import("@/views/code-review/perf/detail.vue"),
        meta: { title: "Performance analysis", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/tests/detail/:id?",
        name: "crTestsDetail",
        component: () => import("@/views/code-review/tests/detail.vue"),
        meta: { title: "Generate tests", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/style/detail/:id?",
        name: "crStyleDetail",
        component: () => import("@/views/code-review/style/detail.vue"),
        meta: { title: "Naming & style", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/api-contract/detail/:id?",
        name: "crApiContractDetail",
        component: () => import("@/views/code-review/api-contract/detail.vue"),
        meta: { title: "API contract check", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/observability-gap/detail/:id?",
        name: "crObservabilityGapDetail",
        component: () => import("@/views/code-review/observability-gap/detail.vue"),
        meta: { title: "Observability gap", isHide: true, isKeepAlive: true }
      }
    ]
  }
];

/**
 * errorRouter (error page routes)
 */
export const errorRouter = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/components/ErrorMessage/403.vue"),
    meta: {
      title: "403 Page"
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/components/ErrorMessage/404.vue"),
    meta: {
      title: "404 Page"
    }
  },
  {
    path: "/500",
    name: "500",
    component: () => import("@/components/ErrorMessage/500.vue"),
    meta: {
      title: "500 Page"
    }
  },
  // Resolve refresh page, route warnings
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/ErrorMessage/404.vue")
  }
];
