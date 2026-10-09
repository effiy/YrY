/**
 * usePageHelp — 当前路由的上下文感知页面帮助解析器。
 *
 * 实现 PRD §6.2 最长前缀匹配 + :param 通配 Gold Copy 算法；
 * 结合用户角色过滤 sections（roleFilter）；SSR 环境安全返回 null。
 */
import { computed, getCurrentInstance, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { matchPageHelp } from "@/data/help/page-help-content";
import type { LocaleCode } from "@/languages";
import type { PageHelpContent } from "./types";

export interface PageHelpViewModel {
  /** 若未匹配返回 null */
  readonly current: PageHelpContent | null;
  /** sections 已按当前用户角色过滤（隐藏 roleFilter 不匹配的） */
  readonly visibleSections: PageHelpContent["sections"];
  /** 命中的路由模式 */
  readonly matchedPattern: string | null;
}

export interface UsePageHelpOptions {
  role?: "admin" | "member" | "guest";
  locale?: LocaleCode;
}

/**
 * 获取当前路由对应的 PageHelp 视图模型。
 * 在非组件上下文（SSR、单元测试）时返回静态空对象。
 */
export function usePageHelp(opts: UsePageHelpOptions = {}): PageHelpViewModel {
  let route: ReturnType<typeof useRoute> | null = null;
  let localeGetter: (() => LocaleCode) | null = null;
  if (getCurrentInstance()) {
    try {
      route = useRoute();
    } catch { route = null; }
    try {
      const { locale } = useI18n();
      localeGetter = () => (locale.value as LocaleCode) === "zh" ? "zh" : "en";
    } catch { localeGetter = null; }
  }

  const path = route ? computed(() => route!.fullPath) : { value: "/" };
  const loc = localeGetter ?? (() => (opts.locale === "en" ? "en" : "zh"));
  const role = opts.role ?? "member";

  const current = computed<PageHelpContent | null>(() => {
    const p = (typeof path.value === "string" ? path.value : "/") as string;
    return matchPageHelp(p, loc());
  });

  const visibleSections = computed(() => {
    const c = current.value;
    if (!c) return [];
    return c.sections.filter(s => {
      if (!s.roleFilter || s.roleFilter.length === 0) return true;
      return (s.roleFilter as readonly string[]).includes(role);
    });
  });

  const matchedPattern = computed(() => current.value?.routePattern ?? null);

  return { current, visibleSections, matchedPattern };
}

/** 同步工具函数：在非组件上下文根据路径匹配 PageHelp。 */
export function resolvePageHelpForPath(path: string, locale: "zh" | "en" = "zh"): PageHelpContent | null {
  return matchPageHelp(path, locale);
}
