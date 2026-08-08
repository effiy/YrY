import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (static routes)
 *
 * Static routes are the skeleton: login, layout, RAG pages,
 * knowledge sub-routes, and all detail sub-routes (code-review/BRD/tech-leadership).
 * Everything else (BRD, Code Review, Tech Leadership, RSS Feeds, Story Board,
 * FDE Resume, Knowledge Base index) comes from the dynamic menu tree.
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
      // ── RAG System (static — not in the dynamic menu) ──────────────
      {
        path: "/rag",
        name: "rag",
        component: () => import("@/views/rag/index.vue"),
        meta: {
          title: "RAG System",
          icon: "DataBoard"
        }
      },
      {
        path: "/rag/retrieval",
        name: "ragRetrieval",
        component: () => import("@/views/rag/retrieval.vue"),
        meta: {
          title: "Retrieval Explorer",
          icon: "Search",
          activeMenu: "/rag"
        }
      },
      {
        path: "/rag/chat",
        name: "ragChat",
        component: () => import("@/views/rag/chat.vue"),
        meta: {
          title: "RAG Chat",
          icon: "ChatDotRound",
          activeMenu: "/rag"
        }
      },
      {
        path: "/rag/compare",
        name: "ragCompare",
        component: () => import("@/views/rag/compare.vue"),
        meta: {
          title: "RAG vs Baseline",
          icon: "Switch",
          activeMenu: "/rag"
        }
      },
      {
        path: "/rag/history",
        name: "ragHistory",
        component: () => import("@/views/rag/history.vue"),
        meta: {
          title: "Query History",
          icon: "Timer",
          activeMenu: "/rag"
        }
      },
      // ── Knowledge Base sub-routes (static — category/detail not in menu) ──
      {
        path: "/knowledge/:category",
        name: "knowledgeCategory",
        component: () => import("@/views/knowledge/category.vue"),
        meta: { title: "Knowledge Category", activeMenu: "/knowledge", isKeepAlive: true }
      },
      {
        path: "/knowledge/:category/detail/:file",
        name: "knowledgeDetail",
        component: () => import("@/views/knowledge/detail.vue"),
        meta: { title: "Knowledge Detail", isHide: true, isKeepAlive: true }
      },
      // ── Code Review detail routes (static hidden — list routes from menu) ──
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
      },
      {
        path: "/code-review/concurrency/detail/:id?",
        name: "crConcurrencyDetail",
        component: () => import("@/views/code-review/concurrency/detail.vue"),
        meta: { title: "Concurrency review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/error-handling/detail/:id?",
        name: "crErrorHandlingDetail",
        component: () => import("@/views/code-review/error-handling/detail.vue"),
        meta: { title: "Error handling review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/dead-code/detail/:id?",
        name: "crDeadCodeDetail",
        component: () => import("@/views/code-review/dead-code/detail.vue"),
        meta: { title: "Dead code review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/backward-compat/detail/:id?",
        name: "crBackwardCompatDetail",
        component: () => import("@/views/code-review/backward-compat/detail.vue"),
        meta: { title: "Backward compat review", isHide: true, isKeepAlive: true }
      },
      {
        path: "/code-review/i18n-a11y/detail/:id?",
        name: "crI18nA11yDetail",
        component: () => import("@/views/code-review/i18n-a11y/detail.vue"),
        meta: { title: "i18n / a11y review", isHide: true, isKeepAlive: true }
      },
      // ── BRD detail routes (static hidden — list routes from menu) ──
      {
        path: "/brd/engineer/detail/:id?",
        name: "brdEngineerDetail",
        component: () => import("@/views/brd/engineer/detail.vue"),
        meta: { title: "As an Engineer — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/tech-lead/detail/:id?",
        name: "brdTechLeadDetail",
        component: () => import("@/views/brd/tech-lead/detail.vue"),
        meta: { title: "As a Tech Lead — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/product-manager/detail/:id?",
        name: "brdProductManagerDetail",
        component: () => import("@/views/brd/product-manager/detail.vue"),
        meta: { title: "As a Product Manager — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/ai-engineer/detail/:id?",
        name: "brdAiEngineerDetail",
        component: () => import("@/views/brd/ai-engineer/detail.vue"),
        meta: { title: "As an AI Engineer — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/new-hire/detail/:id?",
        name: "brdNewHireDetail",
        component: () => import("@/views/brd/new-hire/detail.vue"),
        meta: { title: "As a New Hire — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/knowledge-curator/detail/:id?",
        name: "brdKnowledgeCuratorDetail",
        component: () => import("@/views/brd/knowledge-curator/detail.vue"),
        meta: { title: "As a Knowledge Curator — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/executive/detail/:id?",
        name: "brdExecutiveDetail",
        component: () => import("@/views/brd/executive/detail.vue"),
        meta: { title: "As an Executive — detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/oncall-sre/detail/:id?",
        name: "brdOncallSreDetail",
        component: () => import("@/views/brd/oncall-sre/detail.vue"),
        meta: { title: "As an Oncall SRE — detail", isHide: true, isKeepAlive: true }
      },
      // ── Tech Leadership detail routes (static hidden — list routes from menu) ──
      {
        path: "/tech-leadership/adr-review/detail/:id?",
        name: "tlrAdrReviewDetail",
        component: () => import("@/views/tech-leadership/adr-review/detail.vue"),
        meta: { title: "Architecture Decision Record detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/tech-selection/detail/:id?",
        name: "tlrTechSelectionDetail",
        component: () => import("@/views/tech-leadership/tech-selection/detail.vue"),
        meta: { title: "Tech Selection detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/tech-debt/detail/:id?",
        name: "tlrTechDebtDetail",
        component: () => import("@/views/tech-leadership/tech-debt/detail.vue"),
        meta: { title: "Tech Debt detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/risk-register/detail/:id?",
        name: "tlrRiskRegisterDetail",
        component: () => import("@/views/tech-leadership/risk-register/detail.vue"),
        meta: { title: "Risk Register detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/postmortem/detail/:id?",
        name: "tlrPostmortemDetail",
        component: () => import("@/views/tech-leadership/postmortem/detail.vue"),
        meta: { title: "Postmortem detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/oncall-handover/detail/:id?",
        name: "tlrOncallHandoverDetail",
        component: () => import("@/views/tech-leadership/oncall-handover/detail.vue"),
        meta: { title: "Oncall Handover detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/org-diagnose/detail/:id?",
        name: "tlrOrgDiagnoseDetail",
        component: () => import("@/views/tech-leadership/org-diagnose/detail.vue"),
        meta: { title: "Org Diagnose detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/dependency-audit/detail/:id?",
        name: "tlrDependencyAuditDetail",
        component: () => import("@/views/tech-leadership/dependency-audit/detail.vue"),
        meta: { title: "Dependency Audit detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/roadmap-review/detail/:id?",
        name: "tlrRoadmapReviewDetail",
        component: () => import("@/views/tech-leadership/roadmap-review/detail.vue"),
        meta: { title: "Roadmap Review detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/capacity-plan/detail/:id?",
        name: "tlrCapacityPlanDetail",
        component: () => import("@/views/tech-leadership/capacity-plan/detail.vue"),
        meta: { title: "Capacity Plan detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/capacity-cost/detail/:id?",
        name: "tlrCapacityCostDetail",
        component: () => import("@/views/tech-leadership/capacity-cost/detail.vue"),
        meta: { title: "Capacity & Cost detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/maturity-model/detail/:id?",
        name: "tlrMaturityModelDetail",
        component: () => import("@/views/tech-leadership/maturity-model/detail.vue"),
        meta: { title: "Maturity Model detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/dora-metrics/detail/:id?",
        name: "tlrDoraMetricsDetail",
        component: () => import("@/views/tech-leadership/dora-metrics/detail.vue"),
        meta: { title: "DORA Metrics detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/mentorship-growth/detail/:id?",
        name: "tlrMentorshipGrowthDetail",
        component: () => import("@/views/tech-leadership/mentorship-growth/detail.vue"),
        meta: { title: "Mentorship & Growth detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/project-handoffs/detail/:id?",
        name: "tlrProjectHandoffsDetail",
        component: () => import("@/views/tech-leadership/project-handoffs/detail.vue"),
        meta: { title: "Project Handoff detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/dependency-adoption/detail/:id?",
        name: "tlrDependencyAdoptionDetail",
        component: () => import("@/views/tech-leadership/dependency-adoption/detail.vue"),
        meta: { title: "Dependency Adoption detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/project-bootstrap/detail/:id?",
        name: "tlrProjectBootstrapDetail",
        component: () => import("@/views/tech-leadership/project-bootstrap/detail.vue"),
        meta: { title: "Project Bootstrap detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/tech-leadership/knowledge-evolution/detail/:id?",
        name: "tlrKnowledgeEvolutionDetail",
        component: () => import("@/views/tech-leadership/knowledge-evolution/detail.vue"),
        meta: { title: "Knowledge Evolution detail", isHide: true, isKeepAlive: true }
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