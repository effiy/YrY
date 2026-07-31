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
      // Tech-leadership + Code-review: list routes come from authMenuList.json;
      // detail routes are hidden children in the menu and registered dynamically.
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
      // BRD: list routes come from authMenuList.json;
      // detail routes are hidden children and registered statically.
      {
        path: "/brd/brd-documents/detail/:id?",
        name: "brdDocumentsDetail",
        component: () => import("@/views/brd/brd-documents/detail.vue"),
        meta: { title: "BRD Document detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/brd-rules/detail/:id?",
        name: "brdRulesDetail",
        component: () => import("@/views/brd/brd-rules/detail.vue"),
        meta: { title: "Business Rule detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/brd-milestones/detail/:id?",
        name: "brdMilestonesDetail",
        component: () => import("@/views/brd/brd-milestones/detail.vue"),
        meta: { title: "Milestone detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/brd-approvals/detail/:id?",
        name: "brdApprovalsDetail",
        component: () => import("@/views/brd/brd-approvals/detail.vue"),
        meta: { title: "Approval Record detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/brd-stakeholders/detail/:id?",
        name: "brdStakeholdersDetail",
        component: () => import("@/views/brd/brd-stakeholders/detail.vue"),
        meta: { title: "Stakeholder detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/brd-objectives/detail/:id?",
        name: "brdObjectivesDetail",
        component: () => import("@/views/brd/brd-objectives/detail.vue"),
        meta: { title: "Business Objective detail", isHide: true, isKeepAlive: true }
      },
      {
        path: "/brd/brd-acceptance/detail/:id?",
        name: "brdAcceptanceDetail",
        component: () => import("@/views/brd/brd-acceptance/detail.vue"),
        meta: { title: "Acceptance Criteria detail", isHide: true, isKeepAlive: true }
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
