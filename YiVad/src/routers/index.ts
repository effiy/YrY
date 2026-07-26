import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
import { LOGIN_URL, ROUTER_WHITE_LIST } from "@/config";
import { initDynamicRouter } from "@/routers/modules/dynamicRouter";
import { staticRouter, errorRouter } from "@/routers/modules/staticRouter";
import NProgress from "@/config/nprogress";

const mode = import.meta.env.VITE_ROUTER_MODE;

const routerMode = {
  hash: () => createWebHashHistory(),
  history: () => createWebHistory()
};

/**
 * @description 📚 Route parameter configuration reference
 * @param path ==> Route menu access path
 * @param name ==> Route name (corresponds to page component name, used for KeepAlive cache identifier && button permission filtering)
 * @param redirect ==> Route redirect address
 * @param component ==> View file path
 * @param meta ==> Route menu metadata
 * @param meta.icon ==> Icon for menu and breadcrumb
 * @param meta.title ==> Route title (used as document.title || menu name)
 * @param meta.activeMenu ==> Menu to highlight when current route is a detail page
 * @param meta.isLink ==> External link URL for the route
 * @param meta.isHide ==> Whether to hide in menu (typically used for list detail pages)
 * @param meta.isFull ==> Whether the menu page is fullscreen (e.g., data screen page)
 * @param meta.isAffix ==> Whether the menu is pinned in tabs (home page is usually pinned)
 * @param meta.isKeepAlive ==> Whether the current route should be cached
 * */
const router = createRouter({
  history: routerMode[mode](),
  routes: [...staticRouter, ...errorRouter],
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

/**
 * @description Route guard beforeEach
 * */
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  // 1. Start NProgress
  NProgress.start();

  // 2. Dynamically set document title
  const title = import.meta.env.VITE_GLOB_APP_TITLE;
  document.title = to.meta.title ? `${to.meta.title} - ${title}` : title;

  // 3. Check if accessing login page: if token exists stay on current page, otherwise reset routes to login
  if (to.path.toLocaleLowerCase() === LOGIN_URL) {
    if (userStore.token) return next(from.fullPath);
    resetRouter();
    return next();
  }

  // 4. Check if the target page is in the route whitelist (static routes); allow directly if so
  if (ROUTER_WHITE_LIST.includes(to.path)) return next();

  // 5. Check if token exists; redirect to login page if not
  if (!userStore.token) return next({ path: LOGIN_URL, replace: true });

  // 6. If no menu list, re-request menu list and add dynamic routes
  if (!authStore.authMenuListGet.length) {
    await initDynamicRouter();
    return next({ ...to, replace: true });
  }

  // 7. Store routerName for button permission filtering
  authStore.setRouteName(to.name as string);

  // 8. Normal page access
  next();
});

/**
 * @description Reset routes
 * */
export const resetRouter = () => {
  const authStore = useAuthStore();
  authStore.flatMenuListGet.forEach(route => {
    const { name } = route;
    if (name && router.hasRoute(name)) router.removeRoute(name);
  });
};

/**
 * @description Route navigation error handler
 * */
router.onError(error => {
  NProgress.done();
  console.warn("Route error", error.message);
});

/**
 * @description Route navigation complete
 * */
router.afterEach(() => {
  NProgress.done();
});

export default router;
