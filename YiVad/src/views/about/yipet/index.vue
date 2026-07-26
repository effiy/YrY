<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiPet (Gentle Companion) is a Chrome MV3 browser extension with a three-layer architecture: a React 15 popup control
        panel, a content script running across Chrome's dual execution contexts (ISOLATED + MAIN world), and a typed HTTP API
        layer that talks to a local YiAi FastAPI backend. It injects an interactive animated companion into any web page, supports
        multi-role AI chat with SSE streaming, on-demand CDN resource injection (80+ libraries), full i18n (en + zh_CN), and
        timezone-aware display. Built with Vite + TypeScript in strict mode.
      </span>
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
      <h4 class="title">Architecture</h4>
      <span class="text">
        YiPet runs across two Chrome execution contexts (ISOLATED + MAIN world) and communicates with a local YiAi FastAPI
        backend. The popup UI, content scripts, and API layer form a clean three-tier stack. The API layer follows a strict
        four-tier architecture: client → endpoints → types → services.
      </span>
      <div class="arch-diagram">
        <el-tag type="primary" size="large">Popup UI (React 15)</el-tag>
        <span class="arch-arrow">↔</span>
        <el-tag type="success" size="large">Content Script (MV3 Dual)</el-tag>
        <span class="arch-arrow">↔</span>
        <el-tag type="warning" size="large">YiAi API (FastAPI)</el-tag>
      </div>
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
          <el-tag>React 15.6.1 (CDN)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="CSS Framework" label-align="left">
          <el-tag>Bootstrap 5.2.3 (CDN)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Build Tool" label-align="left">
          <el-tag>Vite 5 + TypeScript (strict)</el-tag>
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
          <el-tag>Cmd+Shift+P (popup) / Cmd+Shift+X (chat)</el-tag>
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
        All timestamps are stored in ISO 8601 UTC. Display conversion uses Intl.DateTimeFormat with explicit timezone detection:
        user preference → system timezone (Intl.DateTimeFormat().resolvedOptions().timeZone). Relative time formatting via
        Intl.RelativeTimeFormat; dayjs with timezone plugin available from the CDN catalog.
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
        <strong>CSP compliance:</strong> MV3 enforces script-src 'self'. YiPet complies by bundling all CDN libraries locally
        under <code>public/cdn/vendor/</code>, loaded via <code>chrome-extension://</code> URLs through web_accessible_resources.
        No remote code, no eval, no inline scripts.
      </span>
    </div>

    <div class="card mb10">
      <h4 class="title">Production Dependencies</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in prodDeps" :key="key" width="400px" :label="key">
          <el-tag type="info">{{ value }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Development Dependencies</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in devDeps" :key="key" width="400px" :label="key">
          <el-tag type="info">{{ value }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card">
      <h4 class="title">Tech Stack</h4>
      <div class="tag-list">
        <el-tag v-for="tech in techStack" :key="tech" class="tech-tag">{{ tech }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="aboutYiPet">
const prodDeps: Record<string, string> = {
  react: "15.6.1 (CDN)",
  "react-dom": "15.6.1 (CDN)",
  bootstrap: "5.2.3 (CDN)"
};

const devDeps: Record<string, string> = {
  typescript: "^5.5.0",
  vite: "^5.4.0",
  vitest: "^2.0.0",
  "@types/chrome": "^0.0.270",
  jsdom: "^29.1.1"
};

const features = [
  "Animated pet companion on any page",
  "Multi-role AI chat window",
  "React 15 control panel (popup)",
  "On-demand CDN resource injection",
  "i18n: English & 简体中文",
  "Timezone-aware display",
  "Four-tier API layer with SSE streaming",
  "Chrome MV3 dual execution context"
];

const domainTerms = [
  {
    name: "Pet",
    desc: "The interactive DOM element injected into the page, with a role image, color theme gradient, and configurable size"
  },
  {
    name: "Role",
    desc: "The pet's occupational identity — Teacher, Doctor, Pastry Chef, Police Officer (4 roles). Determines appearance"
  },
  { name: "Popup", desc: "The action.default_popup page — a React 15 settings panel. Short-lived, closes on outside click" },
  {
    name: "Content Script",
    desc: "Declared in manifest.json. Runs in ISOLATED world at document_end. Has chrome.runtime.* APIs but can't see page JS globals"
  },
  {
    name: "MAIN World",
    desc: "The page's own JS execution context. After bootstrap self-injects, window.YiPet is accessible from DevTools"
  },
  {
    name: "ISOLATED World",
    desc: "Default content script environment. Shares page DOM but not JS globals. Uses chrome.tabs.sendMessage for communication"
  },
  {
    name: "CDN Catalog",
    desc: "Resource manifest in catalog.ts — maps short keys (vue, react, gsap) to local file paths under cdn/vendor/. All local, no remote CDN"
  },
  {
    name: "Bootstrap",
    desc: "src/content/bootstrap.ts — the dual-world entry that self-injects into MAIN world and sets up window.YiPet with YiPet.help() and YiPet.list()"
  }
];

const permissions = [
  { name: "storage", desc: "Persist user preferences, locale, and timezone" },
  { name: "tabs", desc: "Access active tab for message relay between popup and content script" },
  { name: "scripting", desc: "Programmatic content script injection" },
  { name: "webRequest", desc: "Network request observation" },
  { name: "host_permissions", desc: "<all_urls> — content script runs on every page" }
];

const techStack = [
  "TypeScript",
  "Vite 5",
  "React 15.6.1",
  "Chrome MV3",
  "Bootstrap 5.2.3",
  "chrome.i18n",
  "chrome.storage",
  "FastAPI (YiAi)",
  "MongoDB (Motor)"
];
</script>

<style lang="scss" scoped>
.card {
  .title {
    margin: 0 0 15px;
    font-size: 17px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
  .text {
    font-size: 15px;
    line-height: 25px;
    color: var(--el-text-color-regular);
    code {
      font-size: 13px;
      background: var(--el-fill-color-light);
      padding: 1px 5px;
      border-radius: 3px;
    }
  }
}

.feature-item {
  margin-bottom: 8px;
}

.feature-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 22px;

  &::before {
    content: "•";
    margin-right: 6px;
    color: var(--el-color-primary);
    font-weight: bold;
  }
}

.arch-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.arch-arrow {
  font-size: 20px;
  color: var(--el-text-color-secondary);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 0;
}

.term-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
</style>
