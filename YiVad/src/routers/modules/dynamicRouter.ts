import router from "@/routers/index";
import { LOGIN_URL } from "@/config";
import { RouteRecordRaw } from "vue-router";
import { ElNotification } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
import { clearPersistedState } from "@/stores/helper/persist";
import { useI18n } from "vue-i18n";
// Map of all view files under src/views, keyed by their absolute path.
// Backed by build/views-glob-plugin.ts (replaces vite's `import.meta.glob`).
import viewsGlob from "@yivad/views-glob";

const modules = viewsGlob as Record<string, () => Promise<any>>;

/**
 * Convert a camelCase/PascalCase path segment to kebab-case.
 *   "menuMange"    → "menu-manage"
 *   "accountManage" → "account-manage"
 *   "AiChat"       → "ai-chat"
 */
function kebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Resolve a menu `component` string (e.g. "/system/menuMange/index") to a
 * lazy view loader from `modules`.
 *
 * The menu tree has historically used camelCase names but the filesystem uses
 * kebab-case. We try several fallbacks so existing seed data & DB docs still
 * work without a migration:
 *
 *   1. exact:  `/src/views/${component}.vue`
 *   2. each path segment rewritten to kebab-case
 *   3. remove trailing `/index` (handles `/foo/index` when view is `/foo.vue`)
 */
function resolveComponent(component: string): (() => Promise<any>) | undefined {
  if (!component) return undefined;

  const variants = new Set<string>();
  const normalized = component.startsWith("/") ? component : `/${component}`;

  // 1) exact path
  variants.add(`/src/views${normalized}.vue`);

  // 2) each segment converted to kebab-case
  const segmentsKebab = normalized.split("/").map(seg => (seg ? kebab(seg) : "")).join("/");
  if (segmentsKebab !== normalized) {
    variants.add(`/src/views${segmentsKebab}.vue`);
  }

  // 3) strip trailing /index for both forms
  [normalized, segmentsKebab].forEach(form => {
    if (form.endsWith("/index")) {
      variants.add(`/src/views${form.slice(0, -"/index".length)}.vue`);
    }
  });

  for (const key of variants) {
    if (modules[key]) return modules[key];
  }
  return undefined;
}

/**
 * @description Initialize dynamic routes
 */
export const initDynamicRouter = async () => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  try {
    // 1. Get menu list && button permission list
    await authStore.getAuthMenuList();
    await authStore.getAuthButtonList();

    // 2. Check if the current user has menu permission
    if (!authStore.authMenuListGet.length) {
      const { t } = useI18n();
      ElNotification({
        title: t("common.noPermission"),
        message: t("common.noPermissionMsg"),
        type: "warning",
        duration: 3000
      });
      userStore.setToken("");
      clearPersistedState();
      router.replace(LOGIN_URL);
      return Promise.reject("No permission");
    }

    // 3. Add dynamic routes
    authStore.flatMenuListGet.forEach(item => {
      item.children && delete item.children;

      const route = {
        path: item.path,
        name: item.name,
        meta: item.meta as any
      } as RouteRecordRaw;

      if (item.component && typeof item.component == "string") {
        const resolved = resolveComponent(item.component);
        if (resolved) route.component = resolved;
      } else if (item.redirect && !item.component) {
        route.redirect = item.redirect;
      }

      if (item.meta.isFull) {
        router.addRoute(route);
      } else {
        router.addRoute("layout", route);
      }
    });
  } catch (error) {
    // When button || menu request fails, redirect to login page
    userStore.setToken("");
    clearPersistedState();
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
};
