import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (static routes)
 *
 * Static routes are the skeleton: login, layout, RAG pages,
 * pipeline
 * Everything else comes from the dynamic menu tree.
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
      // ── Pipeline overview ────────────────────────────────────────
      {
        path: "/pipeline",
        name: "pipeline",
        component: () => import("@/views/knowledge/pipeline/index.vue"),
        meta: { title: "Pipeline", icon: "Guide", isKeepAlive: true }
      },
      // ── Skills ──────────────────────────────────────────────────
      {
        path: "/skills",
        name: "skills",
        component: () => import("@/views/knowledge/skills/index.vue"),
        meta: { title: "Skills", icon: "MagicStick", isKeepAlive: true }
      },
      {
        path: "/skills/:skillId",
        name: "skillDetail",
        component: () => import("@/views/knowledge/skills/skillDetail.vue"),
        meta: { title: "Skill Detail", icon: "MagicStick", activeMenu: "/skills" }
      },
      // ── AI Engineer ────────────────────────────────────────────
      {
        path: "/aier",
        name: "aier",
        component: () => import("@/views/knowledge/aier/index.vue"),
        meta: { title: "AI Engineer", icon: "Cpu", isKeepAlive: true }
      },
      // ── Role pages ────────────────────────────────────────────
      {
        path: "/engineer",
        name: "engineer",
        component: () => import("@/views/knowledge/engineer/index.vue"),
        meta: { title: "Engineer", icon: "Setting", isKeepAlive: true }
      },
      {
        path: "/srer",
        name: "srer",
        component: () => import("@/views/knowledge/srer/index.vue"),
        meta: { title: "SRE", icon: "Warning", isKeepAlive: true }
      },
      {
        path: "/curator",
        name: "curator",
        component: () => import("@/views/knowledge/curator/index.vue"),
        meta: { title: "Curator", icon: "Collection", isKeepAlive: true }
      },
      {
        path: "/executiver",
        name: "executiver",
        component: () => import("@/views/knowledge/executiver/index.vue"),
        meta: { title: "Executive", icon: "Medal", isKeepAlive: true }
      },
      {
        path: "/executiver/rss",
        name: "rssManager",
        component: () => import("@/views/knowledge/executiver/rssManager.vue"),
        meta: { title: "RSS Manager", icon: "Connection", activeMenu: "/executiver" }
      },
      {
        path: "/executiver/okr",
        name: "okr",
        component: () => import("@/views/knowledge/executiver/okr.vue"),
        meta: { title: "OKR", icon: "Aim", activeMenu: "/executiver" }
      },
      {
        path: "/executiver/okr/:roleId",
        name: "okrRole",
        component: () => import("@/views/knowledge/executiver/okrRole.vue"),
        props: true,
        meta: { title: "Role OKR", icon: "Aim", activeMenu: "/executiver" }
      },
      {
        path: "/executiver/reading-list",
        name: "readingList",
        component: () => import("@/views/knowledge/executiver/readingList.vue"),
        meta: { title: "Reading List", icon: "Reading", activeMenu: "/executiver" }
      },
      {
        path: "/executiver/process",
        name: "processRecord",
        component: () => import("@/views/knowledge/executiver/processRecord.vue"),
        meta: { title: "Process Record", icon: "Document", activeMenu: "/executiver" }
      },
      {
        path: "/leader",
        name: "leader",
        component: () => import("@/views/knowledge/leader/index.vue"),
        meta: { title: "Tech Lead", icon: "Star", isKeepAlive: true }
      },
      {
        path: "/producter",
        name: "producter",
        component: () => import("@/views/knowledge/producter/index.vue"),
        meta: { title: "Product Manager", icon: "Present", isKeepAlive: true }
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
