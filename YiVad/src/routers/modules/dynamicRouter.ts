import router from "@/routers/index";
import { LOGIN_URL } from "@/config";
import { RouteRecordRaw } from "vue-router";
import { ElNotification } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
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
      ElNotification({
        title: "No Permission",
        message: "This account has no menu permissions. Please contact the system administrator!",
        type: "warning",
        duration: 3000
      });
      userStore.setToken("");
      router.replace(LOGIN_URL);
      return Promise.reject("No permission");
    }

    // 3. Add dynamic routes
    authStore.flatMenuListGet.forEach(item => {
      item.children && delete item.children;
      if (item.component && typeof item.component == "string") {
        const resolved = modules["/src/views" + item.component + ".vue"];
        // Skip menu entries whose view file is missing — a static route with the same name/path will handle them, otherwise 404.
        if (!resolved) return;
        item.component = resolved;
      }
      if (item.meta.isFull) {
        router.addRoute(item as unknown as RouteRecordRaw);
      } else {
        router.addRoute("layout", item as unknown as RouteRecordRaw);
      }
    });
  } catch (error) {
    // When button || menu request fails, redirect to login page
    userStore.setToken("");
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
};
