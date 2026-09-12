import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (static routes)
 *
 * Static routes are the skeleton only: "/", login, layout wrapper.
 * Everything else — including Pipeline, Projects, Project Detail —
 * is registered dynamically from the interface menu tree
 * (GET /api/auth/menu/list + fall back authMenuList.json).
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
    children: []
  }
];

/**
 * errorRouter (error page routes)
 */
export const errorRouter = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/components/ErrorMessage/Error403.vue"),
    meta: {
      title: "403 Page"
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/components/ErrorMessage/Error404.vue"),
    meta: {
      title: "404 Page"
    }
  },
  {
    path: "/500",
    name: "500",
    component: () => import("@/components/ErrorMessage/Error500.vue"),
    meta: {
      title: "500 Page"
    }
  },
  // Resolve refresh page, route warnings
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/ErrorMessage/Error404.vue")
  }
];
