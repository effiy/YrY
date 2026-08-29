<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiVad is the admin dashboard member of the Yi family — an open-source management framework built with Vue 3.5, TypeScript
        6, Rsbuild 1, Pinia 4, and Element Plus 2.14. It provides a powerful <strong>ProTable</strong> component that drives table
        pages from a declarative column configuration, plus four layout modes, dynamic role-based routing, button-level permission
        control via the <code>v-auth</code> directive, KeepAlive page caching, and full i18n (zh + en). It is the companion to
        <strong>YiAi</strong> (FastAPI backend) and <strong>YiPet</strong> (Chrome MV3 extension).
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Architecture</h4>
      <span class="text">
        YiVad follows a <strong>componentization</strong> architecture. The <strong>ProTable</strong> component centralizes table
        logic — search, pagination, sorting — into a declarative columns-configuration pattern. Auth is button-level via the
        <code>v-auth</code> directive, decoupled from route guards. Pages are cached through KeepAlive with multi-level nested
        route support. State syncs to <code>localStorage</code> via <code>pinia-plugin-persistedstate</code>.
      </span>
      <div ref="archRef">
        <pre class="mermaid">
graph LR
    Layout[Layout<br/>4 Modes] -->|mounts| Router[Router<br/>Dynamic]
    Router -->|renders| ProTable[ProTable<br/>Columns Config]
    ProTable -->|guards| Auth[Auth<br/>v-auth Directive]
    ProTable -->|calls| API[api/modules]
    API -->|http.post| YiAi[YiAi :10086]
    Auth -->|checks| Store[Pinia Stores]
    Store -->|persists| LS[localStorage]
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">Layout Modes</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="m in layoutModes" :key="m.name" :label="m.name" label-align="left">
          <span class="term-desc">{{ m.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Highlights</h4>
      <el-row :gutter="12">
        <el-col :span="12" v-for="f in features" :key="f" class="feature-item">
          <span class="feature-text">{{ f }}</span>
        </el-col>
      </el-row>
    </div>

    <div class="card mb10">
      <h4 class="title">Data Flow</h4>
      <div ref="dataFlowRef">
        <h5 class="subtitle">Table Fetch (ProTable → YiAi → MongoDB)</h5>
        <pre class="mermaid">
sequenceDiagram
    participant View as View (ProTable)
    participant API as api/modules
    participant HTTP as RequestHttp
    participant YiAi as YiAi (FastAPI)
    participant DB as MongoDB

    View-&gt;&gt;API: requestApi({pageNum, pageSize, ...filters})
    API-&gt;&gt;HTTP: http.post("", {module_name, method_name, parameters})
    HTTP-&gt;&gt;YiAi: fetch POST / (X-Token header)
    YiAi-&gt;&gt;DB: collection.find(filter).sort().skip().limit()
    DB--&gt;&gt;YiAi: { list, total, pageNum, pageSize, totalPages }
    YiAi--&gt;&gt;HTTP: { code: 0, message: "ok", data: {...} }
    HTTP--&gt;&gt;API: response data
    API--&gt;&gt;View: { list, total }
    View-&gt;&gt;View: render rows + Pagination
        </pre>
        <h5 class="subtitle">Chat (SSE Streaming)</h5>
        <pre class="mermaid">
sequenceDiagram
    participant Store as aiChat Store
    participant Stream as streamChat()
    participant YiAi as YiAi (FastAPI)
    participant Ollama as Ollama

    Store-&gt;&gt;Stream: streamChat(payload, onChunk, onDone, onError)
    Stream-&gt;&gt;YiAi: fetch POST / (SSE, AbortController)
    YiAi-&gt;&gt;Ollama: POST /api/chat
    Ollama--&gt;&gt;YiAi: streaming tokens
    YiAi--&gt;&gt;Stream: data: {"data":{"message":"..."}}
    Stream--&gt;&gt;Store: onChunk(text)
    YiAi--&gt;&gt;Stream: data: {"done":true}
    Stream--&gt;&gt;Store: onDone()
    Store-&gt;&gt;Store: upsertSession + autoForwardToWeCom
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">API Design</h4>
      <span class="text">
        YiVad's HTTP layer is built on a custom <strong>RequestHttp</strong> class (Axios wrapper) with
        request/response interceptors, automatic cancellation, and loading-state management. All API calls go
        through <code>src/api/modules/</code> domain service functions — nothing imports <code>axios</code> directly.
      </span>
      <el-descriptions :column="2" border style="margin-top: 12px;">
        <el-descriptions-item v-for="a in apiDesign" :key="a.label" :label="a.label" label-align="left">
          <span class="term-desc">{{ a.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <div ref="apiRef">
        <pre class="mermaid" style="margin-top: 12px;">
sequenceDiagram
    participant View as View / Store
    participant Module as api/modules/*.ts
    participant HTTP as RequestHttp (Axios)
    participant YiAi as YiAi (FastAPI)

    View-&gt;&gt;Module: domainService.method(params)
    Module-&gt;&gt;HTTP: http.post("", {module_name, method_name, parameters})
    HTTP-&gt;&gt;HTTP: Request interceptor<br/>• Attach X-Token<br/>• Duplicate cancellation<br/>• Fullscreen loading
    HTTP-&gt;&gt;YiAi: fetch POST /
    YiAi--&gt;&gt;HTTP: { code, message, data }
    HTTP-&gt;&gt;HTTP: Response interceptor<br/>• checkStatus on error<br/>• Hide loading<br/>• 401 → redirect login
    HTTP--&gt;&gt;Module: ResultData&lt;T&gt;
    Module--&gt;&gt;View: typed response
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">Module Boundaries</h4>
      <span class="text">
        Top-down layering: <strong>Layout → Router → ProTable → Auth</strong>. Stores may import from
        <code>@/api/modules</code> and <code>@/hooks</code> but MUST NOT import <code>axios</code> directly.
      </span>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="m in moduleBoundaries" :key="m.module" :label="m.module" label-align="left">
          <span class="term-desc">{{ m.publicApi }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Project Info</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Version" label-align="left">
          <el-tag>{{ version }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Release Date" label-align="left">
          <el-tag>{{ lastBuildTime }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Framework" label-align="left">
          <el-tag>Vue 3.5 + Composition API (script setup)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="State Management" label-align="left">
          <el-tag>Pinia 4 (persistedstate plugin)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="UI Library" label-align="left">
          <el-tag>Element Plus 2.14</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Charts" label-align="left">
          <el-tag>ECharts 6</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Router" label-align="left">
          <el-tag>Vue Router 5 (hash mode, dynamic routes)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="HTTP" label-align="left">
          <el-tag>Axios (RequestHttp wrapper with interceptors)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="i18n" label-align="left">
          <el-tag>Vue-i18n 11 (zh + en)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Build Tool" label-align="left">
          <el-tag>Rsbuild 1 (Sass, TSX, CORS proxy, SVG sprite)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Code Quality" label-align="left">
          <el-tag>ESLint 10 + Prettier + Stylelint 17 + Husky</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Commits" label-align="left">
          <el-tag>Conventional Commits (commitlint 21 + cz-git)</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Domain Language</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="term in domainTerms" :key="term.name" :label="term.name">
          <span class="term-desc">{{ term.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Recent Changes</h4>
      <el-timeline>
        <el-timeline-item v-for="c in recentChanges" :key="c.date" :timestamp="c.date" placement="top" :hollow="c.hollow">
          <h5 class="change-title">{{ c.title }}</h5>
          <p class="change-desc">{{ c.desc }}</p>
        </el-timeline-item>
      </el-timeline>
    </div>

    <el-collapse class="mb10">
      <el-collapse-item title="Production Dependencies" name="prod">
        <el-descriptions :column="3" border>
          <el-descriptions-item v-for="(dep, key) in prodDeps" :key="key" width="400px">
            <template #label>
              <el-link :href="dep.url" target="_blank" type="primary" :underline="false" class="dep-name">{{ key }}</el-link>
            </template>
            <el-tag type="info">{{ dep.version }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
      <el-collapse-item title="Development Dependencies" name="dev">
        <el-descriptions :column="3" border>
          <el-descriptions-item v-for="(dep, key) in devDeps" :key="key" width="400px">
            <template #label>
              <el-link :href="dep.url" target="_blank" type="primary" :underline="false" class="dep-name">{{ key }}</el-link>
            </template>
            <el-tag type="info">{{ dep.version }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-collapse-item>
    </el-collapse>

    <div class="card mb10">
      <h4 class="title">Tech Stack</h4>
      <div class="tag-list">
        <el-link v-for="tech in techStack" :key="tech.name" :href="tech.url" target="_blank" :underline="false" class="tech-link">
          <el-tag class="tech-tag">{{ tech.name }}</el-tag>
        </el-link>
      </div>
    </div>

    <div class="card">
      <h4 class="title">Related Projects</h4>
      <div class="related-list">
        <div v-for="p in relatedProjects" :key="p.name" class="related-item">
          <span class="related-name">{{ p.name }}</span>
          <span class="related-desc">{{ p.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="aboutYivad">
import { ref } from "vue";
import { useMermaid } from "@/hooks/useMermaid";

const archRef = ref<HTMLElement | null>(null);
const dataFlowRef = ref<HTMLElement | null>(null);
const apiRef = ref<HTMLElement | null>(null);

useMermaid(archRef, dataFlowRef, apiRef);

interface Dep {
  version: string;
  url: string;
}
type DepMap = Record<string, Dep>;
interface Tech {
  name: string;
  url: string;
}

const { pkg, lastBuildTime } = __APP_INFO__;
const { version } = pkg;

const prodDeps: DepMap = {
  "@element-plus/icons-vue": { version: "^2.3.2", url: "https://element-plus.org/en-US/component/icon.html" },
  "@vueuse/core": { version: "^14.3.0", url: "https://vueuse.org/" },
  "@wangeditor/editor": { version: "^5.1.23", url: "https://www.wangeditor.com/" },
  "@wangeditor/editor-for-vue": { version: "^5.1.12", url: "https://www.wangeditor.com/v5/for-vue.html" },
  axios: { version: "^1.18.1", url: "https://axios-http.com/docs/intro" },
  cytoscape: { version: "^3.34.0", url: "https://js.cytoscape.org/" },
  "cytoscape-dagre": { version: "^2.5.0", url: "https://github.com/cytoscape/cytoscape.js-dagre" },
  dayjs: { version: "^1.11.21", url: "https://day.js.org/" },
  "driver.js": { version: "^1.8.0", url: "https://driverjs.com/" },
  echarts: { version: "^6.1.0", url: "https://echarts.apache.org/handbook/" },
  "echarts-liquidfill": { version: "^3.1.0", url: "https://github.com/ecomfe/echarts-liquidfill" },
  "element-plus": { version: "^2.14.3", url: "https://element-plus.org/" },
  marked: { version: "^18.0.7", url: "https://marked.js.org/" },
  md5: { version: "^2.3.0", url: "https://github.com/pvnode/nodejs-md5" },
  mitt: { version: "^3.0.1", url: "https://github.com/developit/mitt" },
  nprogress: { version: "^0.2.0", url: "https://ricostacruz.com/nprogress/" },
  pinia: { version: "^4.0.2", url: "https://pinia.vuejs.org/" },
  "pinia-plugin-persistedstate": { version: "^4.7.1", url: "https://prazdevs.github.io/pinia-plugin-persistedstate/" },
  qs: { version: "^6.15.3", url: "https://github.com/ljharb/qs" },
  screenfull: { version: "^6.0.2", url: "https://github.com/sindresorhus/screenfull.js" },
  sortablejs: { version: "^1.15.7", url: "https://sortablejs.github.io/Sortable/" },
  vue: { version: "^3.5.40", url: "https://vuejs.org/" },
  "vue-i18n": { version: "^11.4.8", url: "https://vue-i18n.intlify.dev/" },
  "vue-router": { version: "^5.2.0", url: "https://router.vuejs.org/" },
  vuedraggable: { version: "^4.1.0", url: "https://github.com/SortableJS/Vue.Draggable" }
};

const devDeps: DepMap = {
  "@commitlint/cli": { version: "^21.2.1", url: "https://commitlint.js.org/" },
  "@commitlint/config-conventional": { version: "^21.2.0", url: "https://commitlint.js.org/reference/config-conventional" },
  "@eslint/js": { version: "^10.0.1", url: "https://eslint.org/docs/latest/use/configure/configuration-files" },
  "@types/md5": { version: "^2.3.6", url: "https://www.npmjs.com/package/@types/md5" },
  "@types/nprogress": { version: "^0.2.3", url: "https://www.npmjs.com/package/@types/nprogress" },
  "@types/qs": { version: "^6.15.1", url: "https://www.npmjs.com/package/@types/qs" },
  "@types/sortablejs": { version: "^1.15.9", url: "https://www.npmjs.com/package/@types/sortablejs" },
  "@typescript-eslint/eslint-plugin": { version: "^8.65.0", url: "https://typescript-eslint.io/" },
  "@typescript-eslint/parser": { version: "^8.65.0", url: "https://typescript-eslint.io/" },
  "@rsbuild/core": { version: "^1.0.0", url: "https://rsbuild.dev/" },
  "@rsbuild/plugin-sass": { version: "^1.0.0", url: "https://rsbuild.dev/plugins/list/sass.html" },
  "@rsbuild/plugin-vue": { version: "^1.0.0", url: "https://rsbuild.dev/plugins/list/vue.html" },
  "@rsbuild/plugin-vue-jsx": { version: "^1.0.0", url: "https://rsbuild.dev/plugins/list/vue-jsx.html" },
  autoprefixer: { version: "^10.5.4", url: "https://github.com/postcss/autoprefixer" },
  "cz-git": { version: "^1.13.1", url: "https://cz-git.qbb.sh/" },
  czg: { version: "^1.13.1", url: "https://cz-git.qbb.sh/" },
  eslint: { version: "^10.8.0", url: "https://eslint.org/" },
  "eslint-config-prettier": { version: "^10.1.8", url: "https://github.com/prettier/eslint-config-prettier" },
  "eslint-plugin-prettier": { version: "^5.5.6", url: "https://github.com/prettier/eslint-plugin-prettier" },
  "eslint-plugin-vue": { version: "^10.10.0", url: "https://eslint.vuejs.org/" },
  globals: { version: "^17.8.0", url: "https://github.com/sindresorhus/globals" },
  husky: { version: "^9.1.7", url: "https://typicode.github.io/husky/" },
  "lint-staged": { version: "^17.2.0", url: "https://github.com/okonet/lint-staged" },
  postcss: { version: "^8.5.23", url: "https://postcss.org/" },
  "postcss-html": { version: "^1.8.1", url: "https://github.com/ota-miki/stylelint-config-html" },
  prettier: { version: "^3.9.6", url: "https://prettier.io/" },
  sass: { version: "^1.102.0", url: "https://sass-lang.com/" },
  "standard-version": { version: "^9.5.0", url: "https://github.com/conventional-changelog/standard-version" },
  stylelint: { version: "^17.14.1", url: "https://stylelint.io/" },
  "stylelint-config-html": { version: "^1.1.0", url: "https://github.com/ota-miki/stylelint-config-html" },
  "stylelint-config-recess-order": { version: "^7.7.0", url: "https://github.com/stormwarning/stylelint-config-recess-order" },
  "stylelint-config-recommended-scss": {
    version: "^17.0.1",
    url: "https://www.npmjs.com/package/stylelint-config-recommended-scss"
  },
  "stylelint-config-recommended-vue": {
    version: "^1.6.1",
    url: "https://www.npmjs.com/package/stylelint-config-recommended-vue"
  },
  "stylelint-config-standard": { version: "^40.0.0", url: "https://www.npmjs.com/package/stylelint-config-standard" },
  "stylelint-config-standard-scss": { version: "^17.0.0", url: "https://www.npmjs.com/package/stylelint-config-standard-scss" },
  typescript: { version: "^6.0.3", url: "https://www.typescriptlang.org/" },
  "typescript-eslint": { version: "^8.65.0", url: "https://typescript-eslint.io/" },
  "vue-eslint-parser": { version: "^10.4.1", url: "https://github.com/vuejs/vue-eslint-parser" },
  "vue-tsc": { version: "^3.3.8", url: "https://github.com/vuejs/language-tools" }
};

const features = [
  "Vue 3.5 + TypeScript 6, single-file components with script setup",
  "Rsbuild 1 build tooling (Sass, TSX, CORS proxy, SVG sprite)",
  "Pinia 4 state management with persistedstate plugin",
  "Full Axios wrapper with request interception & cancellation",
  "ProTable — declarative table driven by column configuration",
  "Element Plus: size switching, multi-theme, dark mode, i18n",
  "Dynamic role-based routing with permission guards (Vue Router 5)",
  "KeepAlive page caching with multi-level nested routes",
  "Custom directives: auth, copy, watermark, drag, debounce, longpress",
  "aiChat (per-message actions, SSE streaming, aborted flag)",
  "Knowledge-base browser page + knowledge tree bridge",
  "Bug list + detail page (per YiKnowledge bug-logging-protocol)",
  "Story detail page (story.md display + knowledge cross-link)",
  "Sidebar parity (ChatSidebar + ConversationSidebar + FileTree baseline)",
  "ESLint 10 + Prettier + Stylelint 17 with pre-commit hooks (husky)",
  "Conventional commits enforced by commitlint 21 + cz-git",
  "Browser support: Chrome, Edge, Firefox, Safari (last 2 versions)"
];

const apiDesign = [
  { label: "RequestHttp", desc: "Axios wrapper with request/response interceptors, duplicate cancellation, loading-state management, and 401 redirect to login" },
  { label: "RPC Envelope", desc: "POST / { module_name, method_name, parameters } → { code, message, data } — the universal protocol for all YiAi calls" },
  { label: "API Modules", desc: "30+ domain service modules under src/api/modules/ — each module exports typed functions that call http.post(). Views and stores import from here, never from axios directly" },
  { label: "X-Token Auth", desc: "Request interceptor attaches Bearer token from userStore. 401 responses trigger automatic logout and redirect to login" },
  { label: "SSE Streaming", desc: "Chat uses fetch with AbortController and line-by-line SSE parsing. On abort, partial content is persisted but not auto-forwarded to WeCom" },
  { label: "File I/O", desc: "readFile/writeFile via POST /read-file and /write-file with target_file param (not path — a past bug source)" },
  { label: "Data CRUD", desc: "data_service.query_documents uses filter param (not query). Supports pagination (pageNum/pageSize), sorting (orderBy/orderType), projection (fields/excludeFields)" },
  { label: "Type Safety", desc: "All RPC types defined in src/api/interface/yiweb.ts — ServicePayload, YiAiEnvelope<T>, QueryDocumentsData<T>, etc." }
];

const domainTerms = [
  { name: "ProTable", desc: "Declarative table built on el-table, driven by a columns config array for search, pagination, sorting — eliminating repetitive table markup" },
  { name: "Dynamic Router", desc: "Fetches permission menu tree from backend API at runtime, flattens it, and registers routes via router.addRoute() based on user permissions" },
  { name: "AuthButton (v-auth)", desc: "Button-level permission control directive that hides elements when the user lacks the required operation permission string" },
  { name: "Pinia Persist", desc: "pinia-plugin-persistedstate auto-syncs global/user/tabs stores to localStorage so state survives page refresh" },
  { name: "Layout Mode", desc: "Four switchable page-level structures: vertical (sidebar), classic, transverse (top nav), columns (split) — controlled via globalStore.layout" },
  { name: "KeepAlive Cache", desc: "Multi-level nested route caching — visited pages stay mounted in memory, preserving scroll position and form state" }
];

const layoutModes = [
  { name: "vertical", desc: "Sidebar navigation on the left, content on the right — the default mode" },
  { name: "classic", desc: "Sidebar + top bar — the traditional admin layout" },
  { name: "transverse", desc: "Top navigation only — maximises horizontal space" },
  { name: "columns", desc: "Split layout with collapsible left rail — for deep menu hierarchies" }
];

const relatedProjects = [
  { name: "YiAi", description: "FastAI backend — provides chat, files, RSS, WeCom, and execution APIs (port 10086)" },
  { name: "YiPet", description: "Chrome MV3 extension — interactive browser companion with multi-role chat" }
];

const techStack: Tech[] = [
  { name: "Vue 3.5", url: "https://vuejs.org/" },
  { name: "TypeScript 6", url: "https://www.typescriptlang.org/" },
  { name: "Rsbuild 1", url: "https://rsbuild.dev/" },
  { name: "Pinia 4", url: "https://pinia.vuejs.org/" },
  { name: "Element Plus 2.14", url: "https://element-plus.org/" },
  { name: "Vue Router 5", url: "https://router.vuejs.org/" },
  { name: "ECharts 6", url: "https://echarts.apache.org/" },
  { name: "Axios", url: "https://axios-http.com/" },
  { name: "Vue-i18n 11", url: "https://vue-i18n.intlify.dev/" },
  { name: "Sass/SCSS", url: "https://sass-lang.com/" },
  { name: "ESLint 10", url: "https://eslint.org/" },
  { name: "Prettier 3", url: "https://prettier.io/" },
  { name: "Stylelint 17", url: "https://stylelint.io/" },
  { name: "Husky 9", url: "https://typicode.github.io/husky/" },
  { name: "commitlint 21", url: "https://commitlint.js.org/" },
  { name: "cz-git", url: "https://cz-git.qbb.sh/" }
];

const moduleBoundaries = [
  { module: "src/views/", publicApi: "Page components per feature domain. Import from @/components, @/hooks, @/stores, @/api/modules." },
  { module: "src/layouts/", publicApi: "Four layout modes (vertical, classic, transverse, columns). Share Header/Menu/Footer/Tabs — don't fork per layout." },
  { module: "src/components/", publicApi: "Reusable components: ProTable, ECharts, Upload, WangEditor, SearchForm. ProTable is canonical — don't use raw el-table." },
  { module: "src/hooks/", publicApi: "Composables: useTable, useTheme, useAuthButtons, useSelection. Name file same as composable." },
  { module: "src/stores/", publicApi: "Pinia setup-function stores. May import from @/api/modules and @/hooks. MUST NOT import axios directly." },
  { module: "src/api/modules/", publicApi: "Domain service functions (sessions, chatService, dataService, fileService, faqService, weChatService, knowledgeService, ragService). The public API surface for stores and views." },
  { module: "src/api/index.ts", publicApi: "RequestHttp class — Axios wrapper with interceptors, cancellation, error mapping. Modules call http.post(...); nothing else imports axios." },
  { module: "src/directives/", publicApi: "v-auth, v-copy, v-watermark, v-drag, v-debounce, v-throttle, v-longpress. Register via src/directives/index.ts." },
  { module: "src/routers/", publicApi: "Hash-mode Vue Router 5 with dynamic routes from backend menu API. Guards in src/routers/beforeEach.ts." }
];

const recentChanges = [
  { date: "2026-07-31", title: "Knowledge + RAG + Story pages", desc: "New src/views/knowledge/ (CategoryList + Detail + MarkdownView) browsing the YiKnowledge markdown tree. src/views/story/ now displays story.md via MarkdownView with cross-links. Added api/modules/knowledgeService.ts and ragService.ts (RAG chat uses the existing SSE parser).", hollow: false },
  { date: "2026-07-30", title: "Sidebar parity + RSS → YiKnowledge offload", desc: "ChatSidebar (aiChat) and ConversationSidebar aligned to a FileTree baseline — favorites + batch operations + hover action row + inline rename. RSS body content moved to YiKnowledge markdown; MongoDB now stores metadata only (category_path + file_path).", hollow: false },
  { date: "2026-07-28", title: "readFile / writeFile target_file fix", desc: "src/api/modules/fileService.ts: readFile and writeFile were sending { path } but YiAi's /read-file and /write-file require target_file (Pydantic FileReadRequest/FileWriteRequest). Every call would 422. Fixed both to send { target_file: path, content }.", hollow: false },
  { date: "2026-07-28", title: "chat abort guard", desc: "On SSE onDone, the store now checks !lastPet?.aborted && !lastPet?.error before calling autoForwardToRobots(streamed). Previously, if the user aborted mid-stream, partial content would still auto-forward to WeCom robots.", hollow: false },
  { date: "2026-07-28", title: "Vite → Rsbuild migration", desc: "Migrated from Vite 8 to Rsbuild 1. Env prefix is now RSBUILD_ENV_* (no more VITE_ leaks). svg-sprite + views-glob custom plugins replicate dropped Vite features.", hollow: false },
  { date: "2026-07-27", title: "aiChat port (from YiWeb)", desc: "Ported YiWeb's sessionChat page. Per-message actions (regenerate / retry / resend / delete / edit), streamingType, aborted flag, scrollTick throttle. Fixed index.vue useResizable scaffold bug.", hollow: true },
  { date: "2026-07-27", title: "code review chat port (from YiWeb)", desc: "Ported chat and knowledge-tree infrastructure: stores, modal components, cards/graph views.", hollow: true }
];
</script>

<style lang="scss" scoped>
@use "../common.scss";
</style>