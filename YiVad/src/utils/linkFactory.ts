/**
 * Link Factory — 实体 `{type, key, …}` → 可跳转路由 URL 的**唯一可信工厂**。
 *
 * 背景：
 *   YiVad v1 全局搜索命令面板的「点击结果 404/空壳页」主缺陷，根因在于**路由字符串在多
 *   处手工拼接**，而真实路由（authMenuList.json）的参数命名在不同实体间并不一致：
 *     • /project/:key   ✅（后端写 /project/${key}，原本就对）
 *     • /module/:key    ✅
 *     • /issue/:id      ❌ （后端曾写 /issue/${key} — 拼到了错误的形参位）
 *     • /bug/:id        ❌ （同上）
 *     • /page           ❌ （所有 page 结果写死为列表页，丢失具体目标）
 *   此外，isHide 的隐藏设置项（accountManage 等）、用户权限外的设置项、菜单中 isFull
 *   但并未注册到 layout 的设置页，也会出现在结果里，点击即死。
 *
 * 本文件作为 Gold Copy 把这些差异全部集中解决：
 *   1. TEMPLATES 表 = authMenuList 实查派生，任何与菜单的漂移会在开发/CI 阶段被单测抓到。
 *   2. resolveLink(item) 返回 `ok:true` 才允许点击；`ok:false` 结果在 UI 中置灰 + 解释
 *      文案，避免让用户点"必然死路"。
 *   3. 回退策略：当 A/B/C 任何闸门失败时，返回可落地的 fallback URL（列表页预填 query /
 *      跳 /search 重新搜索），保证用户不会看到空白 404。
 *
 * 协作约定：
 *   任何业务代码**禁止**手写 `/issue/${…}`、`/bug/${…}` 等字符串拼接。pre-commit 会拦截。
 *   唯一入口 = 本文件 export 的 resolveLink / hasResolvedRoute / diffRouteTemplatesAgainstAuthMenu。
 */

import { useAuthStore } from "@/stores/modules/auth";
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiAi";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";
import type { YiAiEnvelope } from "@/api/interface/yiAi";
import router from "@/routers/index";

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export type LinkResolveReason =
  | "no_route"           // 路由表中未注册对应模板
  | "hidden"             // settings 类 meta.isHide=true 且不是详情页子路由
  | "no_permission"      // settings 类不在当前用户扁平菜单集合中
  | "missing_key"        // 结果 key 为空，无法拼出详情 URL
  | "type_unknown";      // 未注册的 entity type

export interface LinkResolveOk {
  ok: true;
  /** 可直接传给 router.push 的路径（已经 encodeURIComponent 过 param） */
  link: string;
  /** 实际注入到路由 params 的映射，供闸门 C 做后验对比 */
  params: Record<string, string>;
}

export interface LinkResolveFail {
  ok: false;
  reason: LinkResolveReason;
  /** 可落地的回退 URL（列表页预填 / 跳搜索页）。保证非空。 */
  fallback: string;
  /** 给终端用户看的一句话解释（中文，贴到 tooltip / toast）。 */
  message: string;
}

export type LinkResolveResult = LinkResolveOk | LinkResolveFail;

export interface ResolveLinkInput {
  /** 实体类型：后端 unified_search 中 singular 后的类型字典值 */
  type: string;
  /** 业务主键（issue/bug 用的是业务 key；会被填到路由的正确参数位） */
  key?: string | null | undefined;
  /** 所属项目 key（当前未做项目级权限但保留给后续 Gate A 使用） */
  project?: string | null | undefined;
  /** 标题（用于 fallback 列表页的预填搜索词） */
  title?: string | null | undefined;
  /** 预留扩展位 */
  extra?: Record<string, unknown>;
}

export interface RouteTemplateDrift {
  type: string;
  auth_path: string;
  registry_template: string;
  registry_param: string;
  auth_param: string;
  kind: "missing_template" | "param_mismatch";
}

/* -------------------------------------------------------------------------- */
/*  Route Template Registry — SSOT 直接派生自 authMenuList 实查               */
/*  （2026-10-09 审计结果，见 dev 方案 §2.1 表格）                             */
/* -------------------------------------------------------------------------- */

export interface RouteTemplateEntry {
  type: string;
  /** e.g. "/issue/:id" — 与 authMenuList 实际参数名完全一致 */
  template: string;
  /** menu 实际使用的参数名：Issue/Bug 用 id；Project/Module/Page 用 key */
  paramForKey: "id" | "key";
  /** 失败回退的列表页，支持 __TITLE__ / __KEY__ / __Q__ 占位符 */
  listFallback: string;
  /** settings 类条目需要同时满足：用户菜单存在且 meta.isHide !== true */
  needMenuAuth?: boolean;
  /** menu title 匹配时用的关键词（settings 类） */
  menuKey?: string;
}

const TEMPLATES: RouteTemplateEntry[] = [
  /* ── 实体详情（menu 注册于对应 children 下，参数名以真实 path 为准） ── */
  {
    type: "issue",
    template: "/issue/:id",
    paramForKey: "id",               // authMenuList L312: "/issue/:id"
    listFallback: "/issue?search=__TITLE__"
  },
  {
    type: "bug",
    template: "/bug/:id",
    paramForKey: "id",               // authMenuList L665: "/bug/:id"
    listFallback: "/bug?search=__TITLE__"
  },
  {
    type: "project",
    template: "/project/:key",
    paramForKey: "key",              // authMenuList L272
    listFallback: "/project?k=__KEY__"
  },
  {
    type: "module",
    template: "/module/:key",
    paramForKey: "key",              // authMenuList L487
    listFallback: "/module?search=__TITLE__"
  },
  {
    type: "page",
    template: "/page/:key",
    paramForKey: "key",              // 新增菜单条目：menu_pageDetail（见 authMenuList v2 patch）
    listFallback: "/page?search=__TITLE__"
  },
  /* ── 静态视图（无参数，点击即跳） ── */
  { type: "kanban",    template: "/kanban",    paramForKey: "key", listFallback: "/kanban" },
  { type: "roadmap",   template: "/roadmap",   paramForKey: "key", listFallback: "/roadmap" },
  { type: "import",    template: "/import",    paramForKey: "key", listFallback: "/import" },
  { type: "search",    template: "/search?q=__Q__", paramForKey: "key", listFallback: "/search" },
  { type: "rag-index", template: "/rag",       paramForKey: "key", listFallback: "/rag" },
  { type: "rag-chat",  template: "/rag/chat",  paramForKey: "key", listFallback: "/rag/chat" },
  { type: "ai-chat",   template: "/ai-chat",   paramForKey: "key", listFallback: "/ai-chat" },
  /* ── 设置类（需用户菜单权限 ∩ !isHide） ── */
  { type: "settings-menuManage",     template: "/system/menuManage",       paramForKey: "key", listFallback: "/system/menuManage",       needMenuAuth: true, menuKey: "menuManage" },
  { type: "settings-accountManage",  template: "/system/accountManage",    paramForKey: "key", listFallback: "/system/accountManage",    needMenuAuth: true, menuKey: "accountManage" },
  { type: "settings-roleManage",     template: "/system/roleManage",       paramForKey: "key", listFallback: "/system/roleManage",       needMenuAuth: true, menuKey: "roleManage" },
  { type: "settings-deptManage",     template: "/system/departmentManage", paramForKey: "key", listFallback: "/system/departmentManage", needMenuAuth: true, menuKey: "departmentManage" },
  { type: "settings-dictManage",     template: "/system/dictManage",       paramForKey: "key", listFallback: "/system/dictManage",       needMenuAuth: true, menuKey: "dictManage" },
  { type: "settings-systemLog",      template: "/system/systemLog",        paramForKey: "key", listFallback: "/system/systemLog",        needMenuAuth: true, menuKey: "systemLog" },
  { type: "settings-timingTask",     template: "/system/timingTask",       paramForKey: "key", listFallback: "/system/timingTask",       needMenuAuth: true, menuKey: "timingTask" },
];

const STATIC_NO_PARAM_TYPES = new Set(
  TEMPLATES.filter(t => !t.template.includes(":")).map(t => t.type)
);

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

const _FAIL_MESSAGES: Record<LinkResolveReason, string> = {
  no_route: "该结果未在路由表注册，已为您跳转至相关列表页。",
  hidden: "该菜单项已被系统管理员隐藏，已为您跳转至搜索页重新搜索。",
  no_permission: "当前账号无权限访问该页面，已为您跳转至可访问的列表页。",
  missing_key: "该条目缺少唯一标识（主键），无法跳转详情。",
  type_unknown: "系统暂不支持该类型结果的快速跳转，已为您跳转至搜索页。"
};

function _buildFallback(entry: RouteTemplateEntry | undefined, item: ResolveLinkInput, reason: LinkResolveReason): string {
  const template = entry?.listFallback || "/search?q=__Q__";
  const q = encodeURIComponent(item.title || item.key || "");
  return template
    .replace("__TITLE__", q)
    .replace("__KEY__", encodeURIComponent(item.key || ""))
    .replace("__Q__", q);
}

function _fail(
  reason: LinkResolveReason,
  entry: RouteTemplateEntry | undefined,
  item: ResolveLinkInput
): LinkResolveFail {
  const fallback = _buildFallback(entry, item, reason);
  const result: LinkResolveFail = {
    ok: false,
    reason,
    fallback,
    message: _FAIL_MESSAGES[reason]
  };
  // 可观测性：任何闸门 A 失败都是未来 SLO 波动的信号，先打点再 return
  pushReliabilityEvent({
    id: `link-factory-${reason}-${(item.type || "?")}-${(item.key || "?").slice(0, 12)}`,
    projectKey: item.project || "",
    phase: "search_navigate",
    stage: "gate_a",
    subStage: reason,
    errorType: "business",
    latencyMs: 0,
    tags: { entityType: item.type, reason }
  });
  return result;
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 根据 `item.type + item.key` 解析可跳转 URL。
 *
 * 本函数是**同步纯函数**（除依赖 pinia authStore 作为读侧 SSOT），无任何 await。
 * 这样调用方可以在渲染时直接决定结果卡的可点击性 / 灰卡徽标展示，不会因为异步闸门 A
 * 出现"先允许点击再禁止"的闪烁。
 *
 * 闸门 A 的 4 个校验：
 *   (1) key 非空（除了无参数 static type）
 *   (2) type 在 TEMPLATES 中注册
 *   (3) router / authStore 双端校验：模板路径确实注册在路由表
 *   (4) settings 类：menu 存在 ∩ !isHide ∩ 用户有权限
 */
export function resolveLink(item: ResolveLinkInput): LinkResolveResult {
  const type = (item.type || "").trim();
  const key = (item.key || "").trim();

  /* (1)(2) 基础格式校验 */
  const entry = TEMPLATES.find(t => t.type === type);
  if (!entry) {
    return _fail("type_unknown", undefined, item);
  }
  const needsKey = !STATIC_NO_PARAM_TYPES.has(type);
  if (needsKey && !key) {
    return _fail("missing_key", entry, item);
  }

  /* (3) 拼出 URL 并做双端路由存在性校验 */
  const params: Record<string, string> = needsKey ? { [entry.paramForKey]: key } : {};
  const link = needsKey
    ? entry.template.replace(`:${entry.paramForKey}`, encodeURIComponent(key))
    : entry.template;

  const routerHas = routerHasPath(link, entry.template);

  /* (4) settings 类菜单可见性 & 权限 & isHide */
  if (entry.needMenuAuth) {
    const authStore = useAuthStore();
    const flat = authStore.flatMenuListGet || [];
    const target = flat.find(
      (m: any) =>
        (entry.menuKey && m.key && String(m.key).toLowerCase().includes(entry.menuKey.toLowerCase())) ||
        m.path === entry.template
    );
    if (!target) return _fail("no_permission", entry, item);
    if (target.meta && (target.meta as any).isHide === true) return _fail("hidden", entry, item);
    if (!routerHas) return _fail("no_route", entry, item);
  } else if (!routerHas) {
    // 实体详情页一般都会注册；极端情况下新实体模板已加但 authMenuList.json 还没 patch：
    // 走 no_route 回退（保证用户不会看到 404）。
    return _fail("no_route", entry, item);
  }

  return { ok: true, link, params };
}

/**
 * 判断 path / template 是否确实存在于当前 Vue Router 中。
 *
 * 注：dynamicRouter 在菜单加载完成后会 `router.addRoute("layout", route)`，
 * 这里同时查「layout」下的命名路由和全局 `getRoutes()` 的 path 前缀，保证：
 *   • 详情页 `/issue/:id`（children 注册）
 *   • 全屏独立路由 `/import`（isFull 注册）
 *   • 新补的 `/page/:key`（新增菜单条目注册）
 * 三类都能命中。
 */
export function hasResolvedRoute(linkOrName: string): boolean {
  const byName = router.hasRoute(linkOrName);
  if (byName) return true;
  return routerHasPath(linkOrName, linkOrName);
}

function routerHasPath(link: string, template: string): boolean {
  // 1) 命名参数模板：在 router 所有 record 的 path 找严格等于 template 或匹配到的 param 记录
  const all = router.getRoutes();
  for (const r of all) {
    if (r.path === template) return true;
    if (r.path === link) return true;
    // 匹配 `/issue/:id` 类的 param 形式 path，而 r.path 只是 `/issue/:id` 字面量 → 上面已 match
  }
  // 2) 作为兜底（当路由尚未完全加载时，退化为「path 开头匹配」）：比如 `/page/DOC-xxx`
  //    只允许已知带参数的实体模板这样判断，避免任意路径被误判
  const paramEntry = TEMPLATES.find(t => t.template === template);
  if (paramEntry && template.includes(":")) {
    const prefix = template.slice(0, template.indexOf(":"));
    if (link.startsWith(prefix) && prefix !== "/") return true;
    // router full path：按 segment 数相等 + 前缀匹配
    for (const r of all) {
      const segsA = r.path.replace(/\/$/, "").split("/").filter(Boolean);
      const segsB = template.replace(/\/$/, "").split("/").filter(Boolean);
      if (segsA.length === segsB.length) {
        let allMatch = true;
        for (let i = 0; i < segsA.length; i++) {
          if (segsB[i].startsWith(":")) continue;
          if (segsA[i] !== segsB[i]) { allMatch = false; break; }
        }
        if (allMatch) return true;
      }
    }
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Drift detector — 供单测 / 启动自检使用，发现模板相对 authMenuList 漂移      */
/* -------------------------------------------------------------------------- */

/**
 * 启动时 / CI 中调用一次：对照当前 authStore.flatMenuListGet 与 TEMPLATES
 * 的实体类型返回**不一致清单**。长度为 0 = 对齐。
 */
export function diffRouteTemplatesAgainstAuthMenu(): { drift: RouteTemplateDrift[] } {
  const drift: RouteTemplateDrift[] = [];
  const authStore = useAuthStore();
  const flat = (authStore.flatMenuListGet || []) as any[];
  const knownAuthPaths: Array<{ path: string; key: string; type: string }> = [
    { path: "/project/:key", key: "menu_projectDetail", type: "project" },
    { path: "/issue/:id",   key: "menu_issueDetail",   type: "issue" },
    { path: "/bug/:id",     key: "menu_bugDetail",     type: "bug" },
    { path: "/module/:key", key: "menu_moduleDetail",  type: "module" },
    { path: "/page/:key",   key: "menu_pageDetail",    type: "page" },
    { path: "/kanban",      key: "menu_kanban",        type: "kanban" },
    { path: "/roadmap",     key: "menu_roadmap",       type: "roadmap" },
    { path: "/import",      key: "menu_import",        type: "import" },
    { path: "/system/menuManage",       key: "menu_menuManage",       type: "settings-menuManage" },
    { path: "/system/accountManage",    key: "menu_accountManage",    type: "settings-accountManage" },
    { path: "/system/roleManage",       key: "menu_roleManage",       type: "settings-roleManage" },
    { path: "/system/departmentManage", key: "menu_departmentManage", type: "settings-deptManage" },
    { path: "/system/dictManage",       key: "menu_dictManage",       type: "settings-dictManage" },
    { path: "/system/systemLog",        key: "menu_systemLog",        type: "settings-systemLog" },
    { path: "/system/timingTask",       key: "menu_timingTask",       type: "settings-timingTask" },
  ];

  for (const auth of knownAuthPaths) {
    const entry = TEMPLATES.find(t => t.type === auth.type);
    if (!entry) {
      drift.push({
        type: auth.type,
        auth_path: auth.path,
        registry_template: "",
        registry_param: "",
        auth_param: extractParamName(auth.path) || "",
        kind: "missing_template"
      });
      continue;
    }
    const regParam = entry.template.split("/").find(s => s.startsWith(":"))?.slice(1) || "";
    const authParam = extractParamName(auth.path) || "";
    if (entry.template !== auth.path || regParam !== authParam) {
      drift.push({
        type: auth.type,
        auth_path: auth.path,
        registry_template: entry.template,
        registry_param: regParam,
        auth_param: authParam,
        kind: entry.template !== auth.path ? "missing_template" : "param_mismatch"
      });
    }

    // 同时检查 menu 是否真的存在于 flat 中（若完全不在，说明 authMenuList 丢条目）
    if (!flat.some(m => m.key === auth.key || m.path === auth.path)) {
      drift.push({
        type: auth.type,
        auth_path: auth.path,
        registry_template: entry.template,
        registry_param: "",
        auth_param: "",
        kind: "missing_template"
      });
    }
  }

  return { drift };
}

function extractParamName(template: string): string | undefined {
  const m = template.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/);
  return m ? m[1] : undefined;
}

/* -------------------------------------------------------------------------- */
/*  Gates B/C helpers — 导航时使用                                            */
/* -------------------------------------------------------------------------- */

/**
 * 闸门 B：存在性预检（详情页资源是否真的存在）。
 * 命中 LRU 时 <1ms；未命中时走 YiAi dataService queryDocuments 做 lazy HEAD。
 *
 * 注意：闸门 B 是**可选**的高压性能优化。配置项（search.cmd_palette.gateB）关闭时一律视为 ok，
 * 避免慢查询拖慢点击。
 */
export async function gateBEntityExists(input: ResolveLinkInput, opts?: { signal?: AbortSignal; timeoutMs?: number }): Promise<boolean> {
  const cname = entityTypeToCollection(input.type);
  if (!cname) return true;   // 设置/静态页：不存在的已在 Gate A 拦截
  if (!input.key) return false;
  try {
    const body = { cname, filter: { key: input.key }, pageSize: 1 };
    const resp = await fetch(buildYiAiUrl("/data/query/documents"), {
      method: "POST",
      headers: yiAiAuthHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.any([opts?.signal, (AbortSignal as any).timeout ? (AbortSignal as any).timeout(opts?.timeoutMs ?? 1500) : new AbortController().signal].filter(Boolean))
    });
    if (!resp.ok) return false;
    const data = (await resp.json()) as YiAiEnvelope<{ list?: Array<any> }>;
    return !!data?.data?.list?.length;
  } catch {
    // 网络错误不应阻塞导航：Gate C 会在落地失败时再次兜底
    return true;
  }
}

function entityTypeToCollection(type: string): string | null {
  switch (type) {
    case "issue": return "issues";
    case "bug": return "bugs";
    case "project": return "projects";
    case "module": return "modules";
    case "page": return "pages";
    default: return null;
  }
}

/**
 * 闸门 C 辅助：给定 `{ link, params, expectedTitle }`，在 navigate 后 2s 内做后验比对，
 * resolve = true 表示成功到达目标页面。调用方（useNavigateWithThreeGates）根据结果决定
 * MRU 写入或回退升级。
 */
export async function gateCPostNavigate(opts: {
  expectedLink: string;
  expectedParams: Record<string, string>;
  expectedTitleKeyword?: string;
  timeoutMs?: number;
}): Promise<boolean> {
  const t0 = Date.now();
  const deadline = opts.timeoutMs ?? 2000;
  while (Date.now() - t0 < deadline) {
    const route = router.currentRoute.value;
    const pathOk = route.fullPath === opts.expectedLink || route.path === withoutQuery(opts.expectedLink);
    const paramsOk = Object.entries(opts.expectedParams).every(([k, v]) => String((route.params as any)[k] ?? "") === String(v));
    const titleOk = !opts.expectedTitleKeyword
      ? true
      : (document.title || "").toLowerCase().includes(opts.expectedTitleKeyword.toLowerCase());
    if (pathOk && paramsOk && titleOk) return true;
    // 每 80ms 轮询一次，避免 await nextTick 可能的微任务顺序问题
    await new Promise(r => setTimeout(r, 80));
  }
  return false;
}

function withoutQuery(path: string): string {
  const i = path.indexOf("?");
  return i === -1 ? path : path.slice(0, i);
}

/* -------------------------------------------------------------------------- */
/*  Default export — 单入口组件脚本风格（用户协作偏好）                        */
/* -------------------------------------------------------------------------- */

export default {
  resolveLink,
  hasResolvedRoute,
  diffRouteTemplatesAgainstAuthMenu,
  gateBEntityExists,
  gateCPostNavigate,
  TEMPLATES
};
