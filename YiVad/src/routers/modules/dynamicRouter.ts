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
        const resolved = modules["/src/views" + item.component + ".vue"];
        if (!resolved) return;
        route.component = resolved;
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
