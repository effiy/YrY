<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiPet (Gentle Companion) is a Chrome Manifest V3 browser extension with a three-layer architecture: a React 18 + Ant
        Design 5 popup control panel, a content script running across Chrome's dual execution contexts (ISOLATED + MAIN world),
        and a typed HTTP API layer that talks to a local YiAi FastAPI backend. It injects an interactive animated companion into
        any web page, supports multi-role AI chat with SSE streaming, on-demand CDN resource injection (80+ libraries), full i18n
        (en + zh_CN), and timezone-aware display. Built with Rsbuild + TypeScript in strict mode.
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Architecture</h4>
      <span class="text">
        YiPet runs across two Chrome execution contexts (ISOLATED + MAIN world) and communicates with a local YiAi FastAPI
        backend. The API layer follows a strict four-tier architecture: <strong>client → endpoints → types → services</strong>.
        State is persisted via <code>chrome.storage.local</code>; popup-to-content-script communication uses
        <code>chrome.tabs.sendMessage</code>.
      </span>
      <div ref="archRef">
        <pre class="mermaid">
graph TB
    Popup[Popup UI<br/>React 18 + Antd 5] -->|chrome.tabs.sendMessage| CS[Content Script<br/>ISOLATED World]
    CS -->|CustomEvent| Main[MAIN World<br/>Bootstrap]
    Main -->|mutates| DOM[Pet DOM]
    Popup -->|ApiClient| API[API Layer<br/>4-tier]
    Chat[Chat Window<br/>React 18] -->|ApiClient| API
    API -->|fetch POST /| YiAi[YiAi FastAPI :10086]
    CS -->|chrome.storage| Storage[(chrome.storage.local)]
    Popup -->|chrome.storage| Storage
        </pre>
      </div>
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
        <h5 class="subtitle">Chat (SSE Streaming)</h5>
        <pre class="mermaid">
sequenceDiagram
    participant User as User
    participant Controller as ChatController
    participant API as api.chat.stream()
    participant YiAi as YiAi (FastAPI)

    User-&gt;&gt;Controller: send(text)
    Controller-&gt;&gt;API: stream({user, model, messages, ...})
    API-&gt;&gt;YiAi: fetch POST / (SSE, AbortController)
    YiAi--&gt;&gt;API: data: {"data":{"message":"..."}}
    API--&gt;&gt;Controller: onChunk(text)
    YiAi--&gt;&gt;API: data: {"done":true}
    API--&gt;&gt;Controller: onDone()
    Controller-&gt;&gt;Controller: useSyncExternalStore → React re-render
        </pre>
        <h5 class="subtitle">Popup → Content Script → MAIN World</h5>
        <pre class="mermaid">
sequenceDiagram
    participant Popup as Popup (React)
    participant CS as Content Script<br/>(ISOLATED)
    participant Main as Bootstrap<br/>(MAIN world)
    participant DOM as Pet DOM

    Popup-&gt;&gt;CS: chrome.tabs.sendMessage({type, payload})
    CS-&gt;&gt;Main: CustomEvent (window)
    Main-&gt;&gt;DOM: mutate pet DOM
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">API Design</h4>
      <span class="text">
        YiPet's API layer follows a strict <strong>four-tier architecture</strong>: client → endpoints → types → services.
        No tier skips a level — services use client + endpoints + types; types never import services; client never imports
        services. All cross-project calls use the <strong>RPC envelope</strong> POSTed to YiAi's root.
      </span>
      <el-descriptions :column="2" border style="margin-top: 12px;">
        <el-descriptions-item v-for="a in apiDesign" :key="a.label" :label="a.label" label-align="left">
          <span class="term-desc">{{ a.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <div ref="apiRef">
        <pre class="mermaid" style="margin-top: 12px;">
sequenceDiagram
    participant UI as Popup / Chat UI
    participant Service as api/services/*.ts
    participant Client as ApiClient
    participant YiAi as YiAi (FastAPI)

    UI-&gt;&gt;Service: domainService.method(params)
    Service-&gt;&gt;Client: client.post(endpoint, payload)
    Client-&gt;&gt;YiAi: fetch POST / (RPC envelope)
    YiAi--&gt;&gt;Client: { code, message, data }
    Client--&gt;&gt;Service: typed response
    Service--&gt;&gt;UI: domain data
    Note over UI,YiAi: SSE Streaming: client.stream()<br/>yields onChunk/onDone/onError
        </pre>
      </div>
    </div>

    <div class="card mb10">
      <h4 class="title">Module Boundaries</h4>
      <span class="text">
        UI components are co-located with their CSS in feature folders. The API layer is the only tier that talks to
        external services — UI components never call <code>fetch</code> directly.
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
          <el-tag>1.2.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Platform" label-align="left">
          <el-tag>Chrome MV3 Extension</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="UI Framework" label-align="left">
          <el-tag>React 18.3 (function components + hooks)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Component Library" label-align="left">
          <el-tag>Ant Design 5.21 + @ant-design/icons 5.5</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Build Tool" label-align="left">
          <el-tag>Rsbuild 1.0 + TypeScript 5.5 (strict)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Linter / Formatter" label-align="left">
          <el-tag>Biome 2.5 (replaces ESLint + Prettier)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Test Framework" label-align="left">
          <el-tag>Vitest 2 + jsdom 29</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="i18n" label-align="left">
          <el-tag>chrome.i18n (en + zh_CN)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Backend" label-align="left">
          <el-tag type="success">YiAi FastAPI (localhost:10086)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="API Layer" label-align="left">
          <el-tag>Four-tier (Client → Endpoints → Types → Services)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="State" label-align="left">
          <el-tag>chrome.storage.local</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="CDN Resources" label-align="left">
          <el-tag>80+ versioned libraries (local, CSP-compliant)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Commands" label-align="left">
          <el-tag>Ctrl/Cmd+Shift+P (popup) · Ctrl/Cmd+Shift+X (chat)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Architecture" label-align="left">
          <el-tag>Single repo · Multi-entry Rsbuild build</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Domain Language</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="t in domainTerms" :key="t.name" :label="t.name">
          <span class="term-desc">{{ t.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">i18n &amp; Timezone</h4>
      <span class="text">
        YiPet uses Chrome's built-in <code>chrome.i18n</code> API with 55+ externalized strings across English (en) and Chinese
        (zh_CN). The typed <code>t('key')</code> wrapper provides compile-time safety, while locale resolution follows: user
        preference (chrome.storage) → Chrome UI language → fallback to en.
      </span>
      <br /><br />
      <span class="text">
        All timestamps are stored in ISO 8601 UTC. Display conversion uses <code>Intl.DateTimeFormat</code> with explicit timezone
        detection: user preference → system timezone (<code>Intl.DateTimeFormat().resolvedOptions().timeZone</code>). Relative
        time formatting via <code>Intl.RelativeTimeFormat</code>; dayjs with timezone plugin available from the CDN catalog.
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Permissions &amp; Security</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="p in permissions" :key="p.name" :label="p.name" label-align="left">
          <span class="term-desc">{{ p.desc }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <br />
      <span class="text">
        <strong>CSP compliance:</strong> MV3 enforces <code>script-src 'self'</code>. YiPet complies by bundling all CDN libraries
        locally under <code>public/cdn/vendor/</code>, loaded via <code>chrome-extension://</code> URLs through
        <code>web_accessible_resources</code>. No remote code, no eval, no inline scripts.
      </span>
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
  </div>
</template>

<script setup lang="ts" name="aboutYiPet">
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

const prodDeps: DepMap = {
  react: { version: "^18.3.1", url: "https://react.dev/" },
  "react-dom": { version: "^18.3.1", url: "https://react.dev/" },
  antd: { version: "^5.21.0", url: "https://ant.design/" },
  "@ant-design/icons": { version: "^5.5.0", url: "https://ant.design/components/icon" }
};

const devDeps: DepMap = {
  "@biomejs/biome": { version: "^2.5.5", url: "https://biomejs.dev/" },
  "@types/chrome": { version: "^0.0.270", url: "https://www.npmjs.com/package/@types/chrome" },
  "@types/react": { version: "^18.3.0", url: "https://www.npmjs.com/package/@types/react" },
  "@types/react-dom": { version: "^18.3.0", url: "https://www.npmjs.com/package/@types/react-dom" },
  "@rsbuild/core": { version: "^1.0.0", url: "https://rsbuild.dev/" },
  "@rsbuild/plugin-react": { version: "^1.0.0", url: "https://rsbuild.dev/plugins/list/react.html" },
  jsdom: { version: "^29.1.1", url: "https://github.com/jsdom/jsdom" },
  typescript: { version: "^5.5.0", url: "https://www.typescriptlang.org/" },
  vitest: { version: "^2.0.0", url: "https://vitest.dev/" }
};

const features = [
  "Animated pet companion injected into any page",
  "Multi-role AI chat window with SSE streaming",
  "React 18 + Ant Design 5 popup (function components + hooks)",
  "Per-message actions: regenerate, retry, resend, delete, edit",
  "On-demand CDN resource injection (80+ libraries, all local)",
  "i18n: English + Simplified Chinese (chrome.i18n, typed t() wrapper)",
  "Timezone-aware display (ISO 8601 UTC + Intl.DateTimeFormat)",
  "Four-tier API layer: client → endpoints → types → services",
  "Chrome MV3 dual execution context (ISOLATED + MAIN world)",
  "Biome 2.5 linter/formatter (replaces ESLint + Prettier)",
  "Vitest + jsdom unit-test runner",
  "Multi-entry Rsbuild build (popup, chat, CDN utils, bootstrap)"
];

const domainTerms = [
  { name: "Pet", desc: "The interactive DOM element injected into the page, with a role image, color theme gradient, and configurable size" },
  { name: "Role", desc: "The pet's occupational identity — Teacher, Doctor, Pastry Chef, Police Officer (4 roles). Determines appearance" },
  { name: "Popup", desc: "The action.default_popup page — a React 18 + Ant Design 5 settings panel. Short-lived, closes on outside click" },
  { name: "Content Script", desc: "Declared in manifest.json. Runs in ISOLATED world at document_end. Has chrome.runtime.* APIs but can't see page JS globals" },
  { name: "MAIN World", desc: "The page's own JS execution context. After bootstrap self-injects, window.YiPet is accessible from DevTools" },
  { name: "ISOLATED World", desc: "Default content script environment. Shares page DOM but not JS globals. Uses chrome.tabs.sendMessage for communication" },
  { name: "CDN Catalog", desc: "Resource manifest in src/content/cdn/catalog.ts — maps short keys to local file paths under cdn/vendor/. All local, no remote CDN" },
  { name: "Bootstrap", desc: "src/content/bootstrap.ts — the dual-world entry that self-injects into MAIN world and sets up window.YiPet" }
];

const permissions = [
  { name: "storage", desc: "Persist user preferences, locale, and timezone" },
  { name: "tabs", desc: "Access active tab for message relay between popup and content script" },
  { name: "scripting", desc: "Programmatic content script injection" },
  { name: "webRequest", desc: "Network request observation" },
  { name: "host_permissions", desc: "<all_urls> — content script runs on every page" }
];

const techStack: Tech[] = [
  { name: "TypeScript 5.5", url: "https://www.typescriptlang.org/" },
  { name: "Rsbuild 1.0", url: "https://rsbuild.dev/" },
  { name: "React 18.3", url: "https://react.dev/" },
  { name: "Ant Design 5.21", url: "https://ant.design/" },
  { name: "@ant-design/icons 5.5", url: "https://ant.design/components/icon" },
  { name: "Biome 2.5", url: "https://biomejs.dev/" },
  { name: "Vitest 2", url: "https://vitest.dev/" },
  { name: "Chrome MV3", url: "https://developer.chrome.com/docs/extensions/mv3/intro/" },
  { name: "chrome.i18n", url: "https://developer.chrome.com/docs/extensions/reference/i18n/" },
  { name: "chrome.storage", url: "https://developer.chrome.com/docs/extensions/reference/storage/" },
  { name: "FastAPI (YiAi)", url: "https://fastapi.tiangolo.com/" },
  { name: "MongoDB (Motor)", url: "https://motor.readthedocs.io/" }
];

const apiDesign = [
  { label: "ApiClient", desc: "src/api/client.ts — wraps fetch with retry, error extraction, dev-gated logger, and SSE streaming. Other tiers MUST NOT call fetch directly" },
  { label: "Endpoints", desc: "src/api/endpoints.ts — path constants by domain (auth, sessions, chat, database, knowledge, rag, agent, bug, wework)" },
  { label: "Types", desc: "src/api/types.ts — single source of truth for RpcRequest, LoginRequest, ChatParams, QueryParams, SessionRecord, and all response interfaces" },
  { label: "Services", desc: "src/api/services/*.ts — domain service classes (AuthService, ChatService, SessionService, DatabaseService, etc.). createApiServices(config) aggregator" },
  { label: "RPC Envelope", desc: "POST / { module_name, method_name, parameters } → { code, message, data } — same protocol as YiVad" },
  { label: "SSE Streaming", desc: "client.stream() parses text/event-stream line-by-line → onChunk(text) / onDone() / onError(err). AbortController for cancellation" },
  { label: "chrome.storage", desc: "chrome.storage.local for persistent state (preferences, locale, timezone). Survives extension reloads" },
  { label: "Cross-Context", desc: "Popup → Content Script via chrome.tabs.sendMessage. ISOLATED → MAIN world via CustomEvent + script injection" }
];

const moduleBoundaries = [
  { module: "src/api/client.ts", publicApi: "ApiClient — wraps CDN api-client (fetch + retry + error extraction) with dev-gated logger + SSE streaming. Other tiers MUST NOT call fetch directly." },
  { module: "src/api/endpoints.ts", publicApi: "Path constants by domain (auth, sessions, chat, ...)" },
  { module: "src/api/types.ts", publicApi: "Request/response interfaces — single source of truth (RpcRequest, LoginRequest, ChatParams, QueryParams, SessionRecord, etc.)" },
  { module: "src/api/services/*.ts", publicApi: "Domain service classes (AuthService, ChatService, SessionService, ConfigService, DatabaseService, FaqService). createApiServices(config) aggregator." },
  { module: "src/popup/", publicApi: "App.tsx (root), index.tsx (mount), data.ts (config adaptor), components/* (co-located TSX + CSS)" },
  { module: "src/chat/", publicApi: "controller.ts (state/streaming/actions via useSyncExternalStore), components/*, types.ts" },
  { module: "src/content/", publicApi: "bootstrap.ts (dual-world entry), cdn/catalog.ts + cdn/injector.ts, ipc/messages.ts, rendering/overlay.ts, state/" },
  { module: "src/shared/", publicApi: "i18n/, theme/, roles.ts, locale/, timezone/, datetime/, env.ts, log.ts, state.ts" }
];

const recentChanges = [
  { date: "2026-07-28", title: "query → filter RPC param fix", desc: "src/api/services/sessions.ts: SessionService.list() and .get(id) were sending query: {...} but YiAi's query_documents only recognises filter. Both now send filter: {...}. Without this fix, list/get silently returned ALL sessions or none. types.ts QueryParams.query also renamed to QueryParams.filter.", hollow: false },
  { date: "2026-07-28", title: "Stack migration", desc: "React 15 + Bootstrap → React 18.3 + Ant Design 5.21. ESLint → Biome 2.5. Docs updated to match.", hollow: false },
  { date: "2026-07-28", title: "Chat dev-mode jsxDEV mismatch", desc: "Dev-mode React plugin + production NODE_ENV define produced jsxDEV is not a function at runtime. Chat bundle dev script now runs --mode production.", hollow: false },
  { date: "2026-07-27", title: "YiPett shortcut + chat box port", desc: "Esc closes chat, Ctrl+Shift+X toggles, role system prompt wired, conversations persist. YiPett's full feature set stays out of scope.", hollow: true }
];
</script>

<style lang="scss" scoped>
@use "../common.scss";
</style>