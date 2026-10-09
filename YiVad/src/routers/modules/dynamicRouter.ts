import router from "@/routers/index";
import { LOGIN_URL } from "@/config";
import { RouteRecordRaw } from "vue-router";
import { ElNotification } from "element-plus";
import { useUserStore } from "@/stores/modules/user";
import { useAuthStore } from "@/stores/modules/auth";
import { clearPersistedState } from "@/stores/helper/persist";
import { useI18n } from "vue-i18n";
import fallbackMenuJson from "@/assets/json/authMenuList.json";
import fallbackButtonJson from "@/assets/json/authButtonList.json";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";
// Map of all view files under src/views, keyed by their absolute path.
// Backed by build/views-glob-plugin.ts (replaces vite's `import.meta.glob`).
import viewsGlob from "@yivad/views-glob";

const modules = viewsGlob as Record<string, () => Promise<any>>;

/**
 * 诊断计数器（进程级）：统计 v1 拼错组件 / 隐藏菜单未注册组件 / dynamicRouter 历史漂移带来的
 * resolveComponent 失败次数；每次 initDynamicRouter 后打印到 devtools console。
 * 生产环境同步推 reliability 事件，便于后续在 SLO 面板发现"新增菜单但忘记建 .vue 文件"这类事故。
 */
export const DYNAMIC_ROUTER_DIAG_COUNTERS = {
  resolveFailed: 0,
  isFullResolved: 0,
  layoutResolved: 0,
  failedEntries: [] as Array<{ key: string; component: string; path: string; reason: "no_component" | "resolve_failed" | "redirect_fallback" }>,
};

/**
 * Convert a camelCase/PascalCase path segment to kebab-case.
 *   "menuManage"   → "menu-manage"
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
 * Resolve a menu `component` string (e.g. "/system/menuManage/index") to a
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

  const normalizePath = (p: string) => `/src/views${p}.vue`;

  const addVariantsFor = (form: string) => {
    variants.add(normalizePath(form));
    if (form.endsWith("/index")) {
      variants.add(normalizePath(form.slice(0, -"/index".length)));
    }
  };

  addVariantsFor(normalized);

  const segmentsKebab = normalized.split("/").map(seg => (seg ? kebab(seg) : "")).join("/");
  if (segmentsKebab !== normalized) addVariantsFor(segmentsKebab);

  const commonTypos: [RegExp, string][] = [
    [/Mange/g, "Manage"],
    [/mange/g, "manage"],
    [/Acount/g, "Account"],
    [/acount/g, "account"]
  ];
  let corrected = normalized;
  let anyCorrected = false;
  for (const [re, rep] of commonTypos) {
    if (re.test(corrected)) {
      corrected = corrected.replace(re, rep);
      anyCorrected = true;
    }
  }
  if (anyCorrected && corrected !== normalized) {
    addVariantsFor(corrected);
    const correctedKebab = corrected.split("/").map(seg => (seg ? kebab(seg) : "")).join("/");
    if (correctedKebab !== corrected) addVariantsFor(correctedKebab);
  }

  for (const key of variants) {
    if (modules[key]) return modules[key];
  }

  const normSegs = normalized.split("/").filter(Boolean);
  if (normSegs.length >= 2) {
    const tailSeg = normSegs[normSegs.length - 1].toLowerCase().replace(/[-_]/g, "");
    const parentSegs = normSegs.slice(0, -1);
    for (const key of Object.keys(modules)) {
      if (!key.startsWith("/src/views/")) continue;
      const keyParts = key.replace("/src/views/", "").replace(/\.vue$/, "").split("/").filter(Boolean);
      if (keyParts.length < parentSegs.length) continue;
      let parentMatch = true;
      for (let i = 0; i < parentSegs.length - 1; i++) {
        if (kebab(parentSegs[i]) !== kebab(keyParts[i])) {
          parentMatch = false;
          break;
        }
      }
      if (!parentMatch) continue;
      const keyTail = keyParts[keyParts.length - 1].toLowerCase().replace(/[-_]/g, "");
      if (keyTail === tailSeg) return modules[key];
    }
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
    // 1. Get menu list && button permission list — tolerate transient errors
    // by falling back to the bundled JSON. Both the HTTP endpoints and the
    // local JSON share the same { code, data } envelope so destructuring is
    // uniform in `authStore.getAuthMenuList()`.
    try {
      await authStore.getAuthMenuList();
    } catch {
      authStore.$patch({
        authMenuList: (fallbackMenuJson as any).data ?? []
      });
    }
    try {
      await authStore.getAuthButtonList();
    } catch {
      authStore.$patch({
        authButtonList: (fallbackButtonJson as any).data ?? {}
      });
    }

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

      let registerKind: "redirect" | "component" | "empty" = "empty";
      if (item.component && typeof item.component == "string") {
        const resolved = resolveComponent(item.component);
        if (resolved) {
          route.component = resolved;
          registerKind = "component";
        } else {
          DYNAMIC_ROUTER_DIAG_COUNTERS.resolveFailed += 1;
          DYNAMIC_ROUTER_DIAG_COUNTERS.failedEntries.push({
            key: String(item.key ?? ""),
            component: item.component,
            path: item.path ?? "",
            reason: "resolve_failed",
          });
          try {
            console.warn("[dynamicRouter] resolveComponent 失败：", { key: item.key, component: item.component, path: item.path });
          } catch { /* noop */ }
          pushReliabilityEvent({
            projectKey: "",
            phase: "store_init",
            status: "degraded",
            durationMs: 0,
            retryCount: 0,
            errorType: "business",
            errorMessage: `resolveComponent failed for ${item.component} (${item.path})`,
            tags: {
              stage: "dynamicRouter.resolveComponent",
              subStage: "resolve_failed",
              menu_key: String(item.key ?? ""),
              component: String(item.component ?? ""),
              path: String(item.path ?? ""),
            },
          });
        }
      } else if (item.redirect && !item.component) {
        route.redirect = item.redirect;
        registerKind = "redirect";
      } else if (!item.redirect && !item.component && !(item.meta as any)?.isHide) {
        // 既无 component 也无 redirect 且非隐藏菜单：v1 历史漂移，注册一条空壳也会 404 → 埋点
        DYNAMIC_ROUTER_DIAG_COUNTERS.resolveFailed += 1;
        DYNAMIC_ROUTER_DIAG_COUNTERS.failedEntries.push({
          key: String(item.key ?? ""),
          component: "",
          path: item.path ?? "",
          reason: "no_component",
        });
        pushReliabilityEvent({
          projectKey: "",
          phase: "store_init",
          status: "degraded",
          durationMs: 0,
          retryCount: 0,
          errorType: "business",
          errorMessage: `menu entry without component/redirect: ${item.path}`,
          tags: {
            stage: "dynamicRouter.resolveComponent",
            subStage: "no_component",
            menu_key: String(item.key ?? ""),
            path: String(item.path ?? ""),
          },
        });
      }

      if (item.meta.isFull) {
        router.addRoute(route);
        if (registerKind === "component") DYNAMIC_ROUTER_DIAG_COUNTERS.isFullResolved += 1;
      } else {
        router.addRoute("layout", route);
        if (registerKind === "component") DYNAMIC_ROUTER_DIAG_COUNTERS.layoutResolved += 1;
      }
    });

    if (DYNAMIC_ROUTER_DIAG_COUNTERS.resolveFailed > 0) {
      try {
        console.info(
          "[dynamicRouter] 诊断：%s 条 resolve 失败；%s 条 full-route 注册；%s 条 layout-route 注册。",
          DYNAMIC_ROUTER_DIAG_COUNTERS.resolveFailed,
          DYNAMIC_ROUTER_DIAG_COUNTERS.isFullResolved,
          DYNAMIC_ROUTER_DIAG_COUNTERS.layoutResolved,
          DYNAMIC_ROUTER_DIAG_COUNTERS.failedEntries,
        );
      } catch { /* noop */ }
    }
  } catch (error) {
    // Do not nuke the session for transient/operational failures:
    //   • request canceled by AxiosCanceler (duplicate URL)
    //   • AbortSignal / network timeout
    //   • transient HTTP / network errors
    // Only drop token and bounce to /login when the backend explicitly tells us
    // the user is unauthorized (code maps to OVERDUE / UNAUTHORIZED) or the
    // menu list is genuinely empty after both endpoints + fallback JSON have
    // been exhausted.
    const msg = String((error as any)?.message ?? (error as any)?.code ?? "");
    const isAuthFatal =
      /UNAUTHORIZED|OVERDUE|401|403|No permission/i.test(msg) ||
      (error as any)?.status === 401 ||
      (error as any)?.status === 403;

    if (isAuthFatal) {
      userStore.setToken("");
      clearPersistedState();
      router.replace(LOGIN_URL);
    }
    return Promise.reject(error);
  }
};
