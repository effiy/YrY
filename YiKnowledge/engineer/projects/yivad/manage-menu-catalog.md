---
title: YiVad Menu Catalog Management
aliases: [yivad-menu, yivad-menu-management, yivad-catalog, yivad-menu-interface]
tags: [yivad, menu, catalog, routing, dynamic-routes, menu-management, seed]
category: engineer/projects/yivad
created: 2026-08-06
updated: 2026-08-08
last_verified: 2026-08-08
source: ../../YiVad/src
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, new-hire]
benefit: "menu management self-service — add, edit, hide, reorder sidebar menus without code changes"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
  - "menu data sources, document shape, and sorting behavior match the running code"
related:
  - ./architecture.md
  - ./functional-modules.md
  - ./dev-standards.md
  - ./rag-system-pages-reference.md
  - ./engineering/claude.md
  - ../INDEX.md
tacit: "The `menus` MongoDB collection is the single source of truth for both sidebar navigation and dynamic route registration. The frontend fallback JSON and the backend seed file exist only to reproduce it; changing a menu entry changes what users see and can navigate to."
---

# YiVad Menu Catalog Management

> **As an** engineer, **I want to** manage the menu catalog, **so that** sidebar navigation and routes can be adjusted without frontend code changes.

## Summary

YiVad's sidebar menu and dynamic routes share a single source of truth: the **menu tree** stored in MongoDB's `menus` collection. The tree is served by `GET /auth/menu/list` (YiAi), flattened into Vue Router routes by the dynamic router, and rendered as the sidebar. A built-in management page at **System Management → Menu Management** (`/system/menuMange`) provides full CRUD on the tree — no code changes needed to add, hide, or delete menu entries.

There are **three copies** of the menu tree, all of which must stay in sync:

| # | Source | Role | Managed by |
|---|---|---|---|
| 1 | MongoDB `menus` collection | **Runtime source of truth.** `GET /auth/menu/list` reads it on every request. | Menu Management page (`data_service` RPC) |
| 2 | `YiAi/src/data/seeds/menus.json` | **Backend seed.** Upserted into `menus` on boot *only when the collection is empty* (fresh deploy). | Seed file in the repo |
| 3 | `YiVad/src/assets/json/authMenuList.json` | **Frontend fallback.** Loaded *only when* the `/auth/menu/list` request throws (YiAi unreachable, e.g. offline dev). | Repo file |

All three currently contain the same canonical tree (66 flat documents / 9 top-level groups). Editing the seed or the fallback does **not** affect a running system whose `menus` collection is already populated — use the Menu Management page for live changes.

## Core viewpoints

- **Menu = route = sidebar entry** — one menu node produces one sidebar item and one Vue Router route. The `component` field maps to a `.vue` file under `src/views/`.
- **The `home` entry is load-bearing** — `HOME_URL` is `/home/index`, and `/` redirects there. That route is added *dynamically* from the menu tree; if the `home` menu entry is missing, the app boots into a 404.
- **Static routes are the skeleton** — login, layout, **aiChat**, **RAG system** (dashboard + 4 sub-pages), Knowledge Base `:category`/`detail` sub-routes, and all code-review/BRD/tech-leadership `detail/:id?` pages are hard-coded in `staticRouter.ts`. **aiChat and RAG are intentionally NOT menu entries.** Everything else comes from the menu tree.
- **Management page is self-service** — `src/views/system/menuMange/index.vue` is a ProTable tree editor; create/edit/delete menus without touching the database directly.
- **Fallback ensures offline dev** — when the YiAi backend is unreachable, the frontend loads `src/assets/json/authMenuList.json` so the app is still navigable.
- **Sidebar order is alphabetical, not by `order`** — see [Sorting behavior](#sorting-behavior) below.

## Key information

### Menu data model

Each runtime menu node in MongoDB (`_build_menu_tree` in `YiAi/src/server/routes/auth.py`):

```
{
  key:        "menu_brdReviewHub",   // unique document id
  path:       "/brd/index",          // route path; ALSO the parent-reference key for children
  name:       "brdReviewHub",        // route name — KeepAlive cache key + v-auth permission prefix
  component:  "/brd/index/index",    // view path relative to src/views/, e.g. "/brd/index/index" → src/views/brd/index/index.vue. Empty string "" for group nodes that only redirect.
  redirect:   "",                    // group nodes set e.g. "/brd/index"
  meta: {
    icon:        "DataAnalysis",     // Element Plus icon name
    title:       "Review Hub",       // sidebar + browser tab label
    isLink:      "",                 // external URL, renders as <a> instead of router-link
    isHide:      false,              // hide from sidebar (detail pages)
    isFull:      false,              // full-screen page (skips layout chrome)
    isAffix:     false,              // pin tab (home is isAffix: true)
    isKeepAlive: true                // cache the page component
  },
  parent:     "/brd" | null,         // top-level = null; children reference the parent's path
  order:      0                      // backend tree sort key — see Sorting behavior
}
```

> **Type vs wire format.** `MenuDocument` in `src/api/interface/yiweb.ts` declares a *flattened* shape (`parentId`, `sort`, `icon`, `title`, …) inherited from the template, but the runtime docs written by `createMenu` and the seed use the **nested `meta` + `parent` + `order`** shape above. Treat `MenuDocument` as a type hint, not the wire format. The nested shape is what the backend reassembles into a tree (`parent` → path grouping) and what the menuMange form reads/writes.

### The three data sources in detail

**1. MongoDB `menus` collection (runtime truth).** Served by `GET /auth/menu/list`:

```
YiAi/src/server/routes/auth.py → menu_list()
  → collection.find({}) → _build_menu_tree(docs)
      → group by `parent`: null → top-level; else attach under docs[parentPath]
      → orphans (parent path not present) promoted to top-level
      → sort each level by (order, path)
  → empty collection? → _scan_views_dir() (auto-scan YiVad/src/views BUSINESS_DIRS — dev-only, not the business tree)
```

There is also a parallel REST surface `GET|POST|PUT|DELETE /system/menus` in `YiAi/src/server/routes/system.py`, but the menuMange page does **not** use it — it uses the generic `data_service` RPC (below). `GET /auth/buttons` reads the `button_permissions` collection the same way.

**2. Backend seed `menus.json`.** `_SEED_SPECS` in `YiAi/src/app.py` maps `("menus", "menus.json", "path")`. On boot, `_seed_collection_if_empty` upserts each doc via `replace_one({path}, doc)` **only when `count_documents({}) == 0`**. So the seed reproduces the menu on a fresh MongoDB, and is otherwise inert. The lookup field is `path` — every seed doc must have a unique `path`.

**3. Frontend fallback `authMenuList.json`.** `getAuthMenuListApi()` in `src/api/modules/login.ts` tries `http.get("/auth/menu/list")` and falls back to this JSON on any thrown error. It is a nested tree wrapping `{ code: 200, data: [...], msg: "success" }`; the store destructures `data`.

### Static vs dynamic routes

| Layer | File | What it contains |
|---|---|---|
| Static | `src/routers/modules/staticRouter.ts` | Login, layout shell, **aiChat**, **RAG** (index + retrieval/chat/compare/history), Knowledge Base `:category` + `:category/detail/:file` sub-routes, all code-review/BRD/tech-leadership `detail/:id?` routes, 403/404/500 + catch-all |
| Dynamic | `src/routers/modules/dynamicRouter.ts` | `GET /auth/menu/list` (or fallback) → `getFlatMenuList` → `router.addRoute("layout", item)` per node; entries whose component doesn't resolve via `viewsGlob` are skipped |
| Fallback | `src/assets/json/authMenuList.json` | Same tree as the seed, nested — Home, Knowledge Base, BRD (9), Code Review (18), Tech Leadership (19), FDE Resume, Story Board, RSS (4), System Management (7) |

**Key rule**: detail pages (list-item detail views) are registered as **static hidden routes** with `isHide: true` — they appear in the router but not in the sidebar. List pages come from the dynamic menu tree. **aiChat and RAG are static too** — do not recreate them as menu entries.

### Route initialization flow

```
App boot → router.beforeEach guard
  → authStore.authMenuList empty?
    → initDynamicRouter()
      → getAuthMenuList() → GET /auth/menu/list (or fallback JSON)
      → getAuthButtonList() → GET /auth/buttons (or fallback JSON)
      → no menus? → clear token, redirect to login
      → flatMenuListGet.forEach(item):
        → delete item.children
        → resolve component via viewsGlob map ("/src/views" + component + ".vue"); skip if missing
        → router.addRoute("layout" or top-level if meta.isFull, item)
      → guard re-enters with the now-available route
```

### Sorting behavior

- Backend `/auth/menu/list` sorts the tree by `(order, path)`.
- **The sidebar ignores `order`.** The layouts render `authStore.showMenuListGet`, which is `sortMenuTree(getShowMenuList(...))` — `sortMenuTree` re-sorts every level **alphabetically by `meta.title`** (`localeCompare`, locale `zh-CN`). So the sidebar order you see is title-alphabetical, not the `order` you set.
- `menuMange` renders `sortMenuTree(authStore.authMenuListGet)` too — also alphabetical.
- `getMenuList()` queries with `orderBy: "sort"`, but the docs use the field `order` — the sort key mismatch is a silent no-op.

Net effect: `order` has **no visible effect** on the sidebar or the management page in the current code. It only matters as a tiebreaker inside the API tree, which the frontend then re-sorts. To reorder menus, edit their **titles**.

### Menu management page

**Path**: `src/views/system/menuMange/index.vue`  
**Route**: `/system/menuMange` — a child of **System Management** in the dynamic menu tree  
**Tech**: ProTable with `tree-props`, `row-key="path"`, `:pagination="false"`, data from `sortMenuTree(authStore.authMenuListGet)` (raw list, so hidden menus stay manageable)

**Features**:
- Tree table showing all menus (including `isHide`) with parent-child indentation
- Search/filter by menu name, route name, route path
- Add menu dialog (keyboard shortcut: `N`)
- Edit menu dialog (Edit button or row context)
- Delete menu with orphan warning (children become top-level on refresh — no cascade delete)
- Keyboard shortcuts: `N` new, `/` focus search, `⌘/Ctrl+S` save, `?` help, `Esc` close

**Form fields in the edit dialog**:

| Field | Control | Notes |
|---|---|---|
| Menu Name | text input | Required, becomes `meta.title` |
| Parent Menu | tree-select | `el-tree-select` on `parent` (a path); leave empty for top-level |
| Route Path | text input | Required, e.g. `/my-feature` |
| Route Name | text input | Required, unique route name |
| Component Path | text input | Relative to `src/views/`, e.g. `/my-feature/index`; empty for group nodes |
| Redirect | text input | Optional redirect target |
| Icon | text input | Element Plus icon name |
| External Link | text input | Optional external URL (`meta.isLink`) |
| Order | number input | Stored as `order` — see [Sorting behavior](#sorting-behavior) |
| Hidden Menu | switch | `meta.isHide` |
| Full Screen | switch | `meta.isFull` |
| Fixed Tab | switch | `meta.isAffix` |
| Page Cache | switch | `meta.isKeepAlive` |

Save/delete call `createMenu`/`updateMenu`/`deleteMenu` → `data_service` RPC → then `authStore.getAuthMenuList()` to refresh the sidebar. A full page reload is recommended to re-register routes.

### API layer

| Operation | Function | Target |
|---|---|---|
| List menus | `getMenuList()` | `data_service.query_documents({cname: "menus", limit: 1000, orderBy: "sort", orderType: "asc"})` |
| Create menu | `createMenu(params)` | `data_service.create_document("menus", { ...params, key, createdAt, updatedAt })` |
| Update menu | `updateMenu(key, params)` | `data_service.update_document("menus", key, { ...params, key, updatedAt })` |
| Delete menu | `deleteMenu(key)` | `data_service.delete_document("menus", key)` |
| Load for routing | `getAuthMenuListApi()` | `GET /auth/menu/list` (falls back to local JSON) |
| Button permissions | `getAuthButtonListApi()` | `GET /auth/buttons` (falls back to `authButtonList.json`) |

Defined in `src/api/modules/system.ts`, `src/api/modules/login.ts`, and the generic wrapper `src/api/modules/dataService.ts`.

### Current menu tree (served by `GET /auth/menu/list`; seed + fallback match)

> 括号内依次为 Element Plus 图标名和主页 `index.vue` 的相对路径（基路径 `src/views/`），用逗号分隔。Sidebar 渲染顺序按标题字母序，非下方展示顺序。

```
Home (HomeFilled, src/views/home/index.vue)

Knowledge Base (Collection, src/views/knowledge/index.vue)

BRD Management (DocumentChecked)
├── Review Hub (DataAnalysis, src/views/brd/index/index.vue)
├── Engineer (Menu, src/views/brd/engineer/index.vue)
├── Tech Lead (Menu, src/views/brd/tech-lead/index.vue)
├── Product Manager (Menu, src/views/brd/product-manager/index.vue)
├── AI Engineer (Menu, src/views/brd/ai-engineer/index.vue)
├── New Hire (Menu, src/views/brd/new-hire/index.vue)
├── Knowledge Curator (Menu, src/views/brd/knowledge-curator/index.vue)
├── Executive (Menu, src/views/brd/executive/index.vue)
└── Oncall SRE (Menu, src/views/brd/oncall-sre/index.vue)

Code Review (DocumentChecked)
├── Review Hub (DataAnalysis, src/views/code-review/index/index.vue)
├── Summarize this file (Menu, src/views/code-review/summary/index.vue)
├── Find potential bugs (Menu, src/views/code-review/bugs/index.vue)
├── Explain the logic (Menu, src/views/code-review/explain/index.vue)
├── Security review (Menu, src/views/code-review/security/index.vue)
├── Dependency risk (Menu, src/views/code-review/dependency-risk/index.vue)
├── Access review (Menu, src/views/code-review/access-review/index.vue)
├── Refactor suggestions (Menu, src/views/code-review/refactor/index.vue)
├── Performance analysis (Menu, src/views/code-review/perf/index.vue)
├── Generate tests (Menu, src/views/code-review/tests/index.vue)
├── Naming & style (Menu, src/views/code-review/style/index.vue)
├── API contract check (Menu, src/views/code-review/api-contract/index.vue)
├── Observability gap (Menu, src/views/code-review/observability-gap/index.vue)
├── Concurrency review (Menu, src/views/code-review/concurrency/index.vue)
├── Error handling review (Menu, src/views/code-review/error-handling/index.vue)
├── Dead code review (Menu, src/views/code-review/dead-code/index.vue)
├── Backward compat review (Menu, src/views/code-review/backward-compat/index.vue)
└── i18n / a11y review (Menu, src/views/code-review/i18n-a11y/index.vue)

Tech Leadership (Monitor)
├── Review Hub (DataAnalysis, src/views/tech-leadership/index/index.vue)
├── Architecture Decision Records (Menu, src/views/tech-leadership/adr-review/index.vue)
├── Tech Selection Evaluation (Menu, src/views/tech-leadership/tech-selection/index.vue)
├── Tech Debt Inventory (Menu, src/views/tech-leadership/tech-debt/index.vue)
├── Risk Register (Menu, src/views/tech-leadership/risk-register/index.vue)
├── Postmortems (Menu, src/views/tech-leadership/postmortem/index.vue)
├── Oncall Handover (Menu, src/views/tech-leadership/oncall-handover/index.vue)
├── Org Diagnose (Menu, src/views/tech-leadership/org-diagnose/index.vue)
├── Dependency Audit (Menu, src/views/tech-leadership/dependency-audit/index.vue)
├── Roadmap Review (Menu, src/views/tech-leadership/roadmap-review/index.vue)
├── Capacity Plan (Menu, src/views/tech-leadership/capacity-plan/index.vue)
├── Capacity & Cost (FinOps) (Menu, src/views/tech-leadership/capacity-cost/index.vue)
├── Maturity Model (Menu, src/views/tech-leadership/maturity-model/index.vue)
├── DORA Metrics (Menu, src/views/tech-leadership/dora-metrics/index.vue)
├── Mentorship & Growth (Menu, src/views/tech-leadership/mentorship-growth/index.vue)
├── Project Handoffs (Menu, src/views/tech-leadership/project-handoffs/index.vue)
├── Dependency Adoption (Menu, src/views/tech-leadership/dependency-adoption/index.vue)
├── Project Bootstrap (Menu, src/views/tech-leadership/project-bootstrap/index.vue)
└── Knowledge Evolution (Menu, src/views/tech-leadership/knowledge-evolution/index.vue)

FDE Resume (UserFilled, src/views/resume/index.vue)
Story Board (Tickets, src/views/story/index.vue)
RSS Feeds (Link)
├── All Items (Menu, src/views/rss/index.vue)
├── Starred (Star, src/views/rss/index.vue)
├── Unread (Reading, src/views/rss/index.vue)
└── Scheduler & Seeds (Setting, src/views/rss/index.vue)

System Management (Tools)
├── Menu Management (Menu, src/views/system/menuMange/index.vue)
├── Account Management (Menu, src/views/system/accountManage/index.vue)
├── Role Management (Menu, src/views/system/roleManage/index.vue)
├── Department Management (Menu, src/views/system/departmentManage/index.vue)
├── Dictionary Management (Menu, src/views/system/dictManage/index.vue)
├── System Logs (Menu, src/views/system/systemLog/index.vue)
└── Scheduled Tasks (Menu, src/views/system/timingTask/index.vue)
```

Static routes (not in the dynamic menu, but always available):
- `/aiChat` — AI Chat
- `/rag`, `/rag/retrieval`, `/rag/chat`, `/rag/compare`, `/rag/history` — RAG System
- `/knowledge/:category` and `/knowledge/:category/detail/:file` — Knowledge Base drill-down
- All code-review / BRD / tech-leadership `detail/:id?` routes

## Action recommendations

1. **Add a new top-level menu** — open Menu Management (System Management → Menu Management), press `N`, fill in path/name/component/icon, leave parent empty, save. The view file must exist under `src/views/<component-path>.vue`.
2. **Add a child menu** — same as above, but select a parent from the tree-select (sets `parent` to the parent's `path`).
3. **Hide a menu without deleting** — edit the menu, toggle "Hidden Menu" on. It stays registered as a route but disappears from the sidebar.
4. **Reorder menus** — edit the **titles**: the sidebar sorts alphabetically by `meta.title` (`sortMenuTree`), so the `order` field has no visible effect. Rename to the sort order you want.
5. **Delete a menu** — click Delete; if the menu has children, they become top-level after refresh (no cascade delete).
6. **After any menu change** — the page calls `authStore.getAuthMenuList()` to refresh the sidebar. A full page reload is recommended to re-register routes.
7. **Register a new detail route** — add a static route in `staticRouter.ts` with `isHide: true` and `isKeepAlive: true`. Do NOT add detail routes to the menu tree — they are navigation targets, not sidebar entries.
8. **Re-seed after deleting the whole collection** — the seed `menus.json` only runs when the `menus` collection is empty. To restore a clean canonical menu, `db.menus.drop()` and restart YiAi (or re-apply the seed docs).

## Pitfalls

- **Adding a menu without a corresponding view file** — the dynamic router silently skips entries whose component path doesn't resolve via `viewsGlob`. The menu appears in the sidebar but clicking it does nothing.
- **Editing the fallback JSON or seed expecting a live change** — `authMenuList.json` is only a fallback and `menus.json` only seeds an empty collection. Neither affects an already-seeded running system. Use the Menu Management page.
- **Putting detail routes in the menu tree** — detail pages (`/xxx/detail/:id?`) should be static hidden routes in `staticRouter.ts`, not menu entries.
- **Re-adding aiChat or RAG as menu entries** — both are already static routes. Duplicating them in the tree creates redundant routes and dead sidebar entries (the stale DB once had `/aiChat` and `/rag` menu nodes; the canonical tree omits them).
- **Deleting the `home` menu entry** — `HOME_URL` is `/home/index` and `/` redirects there. Without the dynamic `home` route the app lands on the 404 catch-all after login.
- **Deleting a parent menu expecting cascade** — children are orphaned to top-level, not deleted. Delete children first if you want them gone.
- **Expecting `order` to reorder the sidebar** — the sidebar sorts alphabetically by title. `order` is effectively vestigial; `getMenuList()` even queries it under the wrong name (`sort`).
- **Forgetting to create the view file** — the menuMange page doesn't create `.vue` files. Create the component under `src/views/<path>/index.vue` before or right after adding the menu.

## Anti-patterns

- **Editing `authMenuList.json` as if it were the production menu source.** The fallback JSON is only loaded when the YiAi backend is unreachable. Changes to this file are invisible to all users in normal operation, creating a false sense that the menu was updated. Always use the Menu Management page or the `data_service` API to modify the live menu tree in MongoDB.
- **Using the menu tree to register detail/dynamic-parameter routes.** Routes like `/code-review/detail/:id` belong in `staticRouter.ts` as hidden routes, not in the menu tree. Putting them in the menu tree creates a sidebar entry for a page that cannot render without a parameter, and clutters navigation with dead-end links.
- **Adding aiChat / RAG as menu nodes.** They are static routes and already reachable; menu-tree duplicates are dead weight and confuse future editors.
- **Deleting the `home` menu node.** The app boots into `/home/index`; removing the dynamic route strands every user on the 404 page.
- **Deleting a parent menu node and assuming children are cascade-deleted.** The menu management page orphans children to the top level on parent deletion (the backend `_build_menu_tree` promotes orphaned `parent` paths to roots). Delete children first, then the parent.
- **Creating a menu entry with a component path that does not yet exist on disk.** The dynamic router silently skips entries whose `component` field does not resolve via `viewsGlob`. The menu appears in the sidebar but clicking it navigates to a blank page with no error. Always create the `.vue` file under `src/views/` before or immediately after adding the menu record.
- **Trusting the `order` field for sidebar order.** The sidebar and the management page re-sort alphabetically by title. Renaming titles is the only reliable way to reorder; relying on `order` (or the `sort` query key in `getMenuList`) produces no visible change.
- **Changing the `name` field of an existing menu without updating all references to it.** The `name` field is used as the KeepAlive cache key and as the button-permission filter string. Renaming it breaks the page cache for that route and silently disables all `v-auth` directives that reference the old name. Audit all usages of the old name in `v-auth` directives and `include` lists before renaming.

## Related

- [YiVad Architecture overview](./architecture.md) — layered boundaries, data flow, degradation strategy
- [YiVad Functional module inventory](./functional-modules.md) — views/stores/api modules map
- [YiVad Development standards](./dev-standards.md) — naming, SFC structure, ProTable, v-auth
- [RAG System Pages Reference](./rag-system-pages-reference.md) — RAG five-page menu structure
- [YiVad CLAUDE.md mirror](./engineering/claude.md) — full project profile and constraints
- [projects/ INDEX](../INDEX.md) — cross-project index
