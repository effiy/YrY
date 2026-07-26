<template>
  <div>
    <div class="card mb10">
      <h4 class="title">Introduction</h4>
      <span class="text">
        YiVad is an open-source admin management framework built with Vue 3.4, TypeScript, Vite 5, Pinia, and Element Plus. It
        provides a powerful ProTable component that greatly improves development efficiency, along with commonly used components,
        hooks, directives, dynamic routing, button-level permission control, and more.
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
        YiVad follows a componentization architecture with four layout modes (vertical, classic, transverse, columns) and dynamic
        role-based routing. The ProTable component centralizes table logic — search, pagination, sorting — into a declarative
        columns-configuration pattern. Auth is button-level via the <code>v-auth</code> directive, decoupled from route guards.
        Pages are cached through KeepAlive with multi-level nested route support.
      </span>
      <div class="arch-diagram">
        <el-tag type="primary" size="large">Layout (4 Modes)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="success" size="large">Router (Dynamic)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="warning" size="large">ProTable (Columns)</el-tag>
        <span class="arch-arrow">→</span>
        <el-tag type="danger" size="large">Auth (v-auth)</el-tag>
      </div>
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
          <el-tag>Vue 3.4 + Composition API (script setup)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="State Management" label-align="left">
          <el-tag>Pinia 2 (persistedstate plugin)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="UI Library" label-align="left">
          <el-tag>Element Plus 2.7</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Charts" label-align="left">
          <el-tag>ECharts 5</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Router" label-align="left">
          <el-tag>Vue Router 4 (hash mode, dynamic routes)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="HTTP" label-align="left">
          <el-tag>Axios (RequestHttp wrapper with interceptors)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="i18n" label-align="left">
          <el-tag>Vue-i18n 9 (zh + en)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Build Tool" label-align="left">
          <el-tag>Vite 5 (gzip/brotli, TSX, CORS proxy)</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Code Quality" label-align="left">
          <el-tag>ESLint + Prettier + Stylelint + Husky</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Commits" label-align="left">
          <el-tag>Conventional Commits (commitlint + cz-git)</el-tag>
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
      <h4 class="title">Production Dependencies</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in dependencies" :key="key" width="400px" :label="key">
          <el-tag type="info">{{ value }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card mb10">
      <h4 class="title">Development Dependencies</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in devDependencies" :key="key" width="400px" :label="key">
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

<script setup lang="ts" name="aboutYivad">
const { pkg, lastBuildTime } = __APP_INFO__;
const { dependencies, devDependencies, version } = pkg;

const features = [
  "Vue 3.4 + TypeScript, single-file components with script setup",
  "Vite 5 build tooling (gzip/brotli, TSX, CORS proxy)",
  "Pinia state management with persistedstate plugin",
  "Full Axios wrapper with request interception & cancellation",
  "ProTable — declarative table driven by column configuration",
  "Element Plus: size switching, multi-theme, dark mode, i18n",
  "Dynamic role-based routing with permission guards",
  "KeepAlive page caching with multi-level nested routes",
  "Custom directives: auth, copy, watermark, drag, debounce, longpress",
  "ESLint + Prettier + Stylelint with pre-commit hooks (husky)",
  "Conventional commits enforced by commitlint + cz-git",
  "Browser support: Chrome, Edge, Firefox, Safari (last 2 versions)"
];

const domainTerms = [
  {
    name: "ProTable",
    desc: "Declarative table built on el-table, driven by a columns config array for search, pagination, sorting — eliminating repetitive table markup"
  },
  {
    name: "Dynamic Router",
    desc: "Fetches permission menu tree from backend API at runtime, flattens it, and registers routes via router.addRoute() based on user permissions"
  },
  {
    name: "AuthButton (v-auth)",
    desc: "Button-level permission control directive that hides elements when the user lacks the required operation permission string"
  },
  {
    name: "Pinia Persist",
    desc: "pinia-plugin-persistedstate auto-syncs global/user/tabs stores to localStorage so state survives page refresh"
  },
  {
    name: "Layout Mode",
    desc: "Four switchable page-level structures: vertical (sidebar), classic, transverse (top nav), columns (split) — controlled via globalStore.layout"
  }
];

const techStack = [
  "Vue 3.4",
  "TypeScript",
  "Vite 5",
  "Pinia 2",
  "Element Plus 2.7",
  "Vue Router 4",
  "ECharts 5",
  "Axios",
  "Vue-i18n 9",
  "Sass/SCSS",
  "ESLint",
  "Prettier",
  "Stylelint",
  "Husky",
  "commitlint",
  "cz-git"
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

.term-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 0;
}
</style>
