#!/usr/bin/env node

/**
 * Data migration: Split BRD-2026-005 and BRD-2026-006 bundled sub-items
 * into individual brd-documents entries.
 *
 * Usage:
 *   API_URL=http://localhost:10086 TOKEN=<your-jwt> node YiVad/scripts/split-brd-entries.mjs
 *   # Add --delete to remove the original parent documents after splitting
 *
 * Each sub-item (Agent, Command, Rule, Skill) becomes its own brd-documents
 * record with appropriate meta fields and markdown content.
 */

const API_URL = process.env.API_URL || "http://localhost:10086";
const TOKEN = process.env.TOKEN;
const SHOULD_DELETE = process.argv.includes("--delete");

if (!TOKEN) {
  console.error("❌ TOKEN env var is required. Get it from localStorage 'yivad-user' → token");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`
};

async function rpc(module, method, params = {}) {
  const res = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ module_name: module, method_name: method, parameters: params })
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(`RPC ${module}.${method} failed: ${json.message || JSON.stringify(json)}`);
  return json;
}

// ── Entry definitions ─────────────────────────────────────────────────────────

const ENTRIES = [
  // ── Agents (from BRD-2026-005) ──────────────────────────────────────────
  {
    title: "component-extractor Agent",
    tags: ["yivad", "agent", "component-extraction", "vue3"],
    meta: {
      document_id: "BRD-2026-005-AG-001",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Extracts reusable Vue 3 components, composables, and directives from existing YiVad code into correct directories (src/components/, src/hooks/, src/directives/)."
    },
    content: `# component-extractor Agent

## Executive Summary

The component-extractor agent is responsible for extracting reusable Vue 3 components, composables, and directives from existing YiVad code. It identifies reusable patterns and moves them into the correct directory structure under src/components/, src/hooks/, and src/directives/.

## Purpose

Extracts reusable Vue 3 components, composables, and directives from existing code into correct directories.

## Scope

- **Directories**: src/components/, src/hooks/, src/directives/
- **Framework**: Vue 3 Composition API + TypeScript
- **Project**: YiVad admin dashboard

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },
  {
    title: "page-builder Agent",
    tags: ["yivad", "agent", "page-generation", "vue3"],
    meta: {
      document_id: "BRD-2026-005-AG-002",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Builds new YiVad pages following conventions: ProTable + SearchForm + API integration + route registration."
    },
    content: `# page-builder Agent

## Executive Summary

The page-builder agent builds new YiVad pages following established conventions. It generates pages that integrate ProTable, SearchForm, API service modules, and route registration.

## Purpose

Builds new YiVad pages following conventions: ProTable + SearchForm + API integration + route registration.

## Conventions

- **Table**: ProTable as canonical table component
- **Search**: SearchForm auto-generated from column configs
- **API**: API modules under src/api/modules/
- **Routes**: Dynamic routes registered via router config

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },

  // ── Commands (from BRD-2026-005) ────────────────────────────────────────
  {
    title: "build Command",
    tags: ["yivad", "command", "build", "rsbuild"],
    meta: {
      document_id: "BRD-2026-005-CMD-001",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Rsbuild production/dev build with mode selection. Defined in YiVad's .claude/ commands."
    },
    content: `# build Command

## Action

Rsbuild production/dev build with mode selection.

## Usage

\`\`\`bash
pnpm build
# or
pnpm build:dev
\`\`\`

## Details

Performs a bundled build of the YiVad admin dashboard using Rsbuild. Supports production and development modes with appropriate optimizations.

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },
  {
    title: "dev Command",
    tags: ["yivad", "command", "dev", "rsbuild"],
    meta: {
      document_id: "BRD-2026-005-CMD-002",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Start Rsbuild dev server on port 8848 with hot module replacement."
    },
    content: `# dev Command

## Action

Start Rsbuild dev server on port 8848.

## Usage

\`\`\`bash
pnpm dev
\`\`\`

## Details

Launches the Rsbuild development server with HMR (Hot Module Replacement) enabled. The dev server listens on port 8848 by default.

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },
  {
    title: "lint Command",
    tags: ["yivad", "command", "lint", "eslint", "prettier"],
    meta: {
      document_id: "BRD-2026-005-CMD-003",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "ESLint + Prettier + Stylelint with auto-fix. Enforces code quality standards."
    },
    content: `# lint Command

## Action

ESLint + Prettier + Stylelint with auto-fix.

## Usage

\`\`\`bash
pnpm lint
\`\`\`

## Details

Runs the full linting pipeline:
- **ESLint** — JavaScript/TypeScript static analysis
- **Prettier** — Code formatting
- **Stylelint** — SCSS/CSS linting

All tools run with auto-fix enabled where supported.

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },
  {
    title: "typecheck Command",
    tags: ["yivad", "command", "typecheck", "typescript"],
    meta: {
      document_id: "BRD-2026-005-CMD-004",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "vue-tsc --noEmit --skipLibCheck. Verifies TypeScript type safety across the entire project."
    },
    content: `# typecheck Command

## Action

vue-tsc --noEmit --skipLibCheck

## Usage

\`\`\`bash
pnpm type:check
\`\`\`

## Details

Runs the Vue TypeScript compiler in check-only mode (no emit). Verifies that all TypeScript types, Vue SFC type annotations, and template type checks pass across the entire YiVad project.

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },

  // ── Rules (from BRD-2026-005) ───────────────────────────────────────────
  {
    title: "API Request Layer Rule",
    tags: ["yivad", "rule", "api", "axios", "http"],
    meta: {
      document_id: "BRD-2026-005-RL-001",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Defines HTTP request layer conventions: Axios RequestHttp class, interceptor chain, error handling, and request cancellation."
    },
    content: `# API Request Layer Rule

## Scope

\`src/api/**\`, \`src/utils/**\`

## Key Directives

- **RequestHttp class** — All HTTP requests go through the Axios wrapper in \`src/api/index.ts\`
- **Interceptor chain** — Request/response interceptors handle token attachment, loading states, and error mapping
- **Error handling** — \`checkStatus.ts\` maps HTTP status codes to user-facing messages; 401 redirects to login
- **Cancellation** — \`axiosCancel.ts\` manages \`AbortController\` map by request key; cancels duplicate requests

## Rule File

\`.claude/rules/api-request-layer.md\`

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },
  {
    title: "ProTable Patterns Rule",
    tags: ["yivad", "rule", "protable", "table", "component"],
    meta: {
      document_id: "BRD-2026-005-RL-002",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Establishes ProTable as the canonical table pattern. All new table pages must use ProTable with SearchForm integration and requestApi contract."
    },
    content: `# ProTable Patterns Rule

## Scope

All table pages in YiVad.

## Key Directives

- **ProTable as canonical table** — Don't use raw \`el-table\`; ProTable integrates search, pagination, selection, and column settings
- **SearchForm integration** — Search form auto-generates from column \`search\` configs
- **requestApi contract** — API calls through \`src/api/\`; \`requestApi\` receives \`{ pageNum, pageSize, ...searchParams }\`
- **Columns defined in page component** — Or extracted to a \`columns.ts\` alongside the page
- **Selection** — Enable \`:selection="true"\`; access selected rows via \`ref\` handle

## Rule File

\`.claude/rules/protable-patterns.md\`

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },
  {
    title: "Vue Component Patterns Rule",
    tags: ["yivad", "rule", "vue3", "components", "sfc"],
    meta: {
      document_id: "BRD-2026-005-RL-003",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005",
      executive_summary: "Defines Vue 3 SFC conventions: script setup + TypeScript, defineProps/Emits generics, scoped SCSS, and Pinia setup stores."
    },
    content: `# Vue Component Patterns Rule

## Scope

All Vue SFCs in YiVad.

## Key Directives

- **\`<script setup lang="ts">\`** — Always use script setup + TypeScript; no Options API
- **Props/Emits** — \`defineProps<{...}>()\` and \`defineEmits<{...}>()\` with type generics
- **Scoped SCSS** — Styles are scoped, variables from \`src/styles/\`, no inline styles except dynamic values
- **Pinia setup stores** — Use \`defineStore\` with setup-function syntax (not options API)
- **Element Plus** — Use \`el-\` prefix; follow Element Plus 2.14 API
- **Composables** — Extract reusable logic into \`useXxx\` functions in \`src/hooks/\`

## Rule File

\`.claude/rules/vue-component-patterns.md\`

## Parent BRD

BRD-2026-005: YiVad Development Standards & Component Library
`
  },

  // ── Skills (from BRD-2026-005 + BRD-2026-006, merged) ──────────────────
  {
    title: "Vite Framework Skill",
    tags: ["yivad", "skill", "vite", "framework", "build"],
    meta: {
      document_id: "BRD-2026-005-SK-001",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005, BRD-2026-006",
      executive_summary: "Curated Vite.js ecosystem navigator — pulls Vite starters, plugin registries, framework integrations, SSR tools, backend integrations, and showcase projects."
    },
    content: `# Vite Framework Skill

## Domain

Vite.js ecosystem navigator — starters, plugins, integrations, SSR, showcases.

## Description

The Vite skill provides curated guidance for the Vite.js ecosystem. It indexes vitejs/awesome-vite and recommends the right template, plugin, or example app for a given task.

## Capabilities

- **Starters**: React, Vue 3, Svelte, Solid, Electron, Tauri, and more
- **Plugins**: PWA, legacy browser support, SVG sprites, module federation, Windi/Tailwind, MDX, image optimization, compression, and more
- **SSR**: Vike, vite-ssr-boost, Vinxi, Rakkas, and more
- **Backend integrations**: Craft CMS, Django, Flask, Rails, Laravel, WordPress, Go, Rust, Node.js, ASP.NET Core, and more
- **Showcase projects**: VitePress, Slidev, Astro, Ladle, IslandJS, Vituum

## Parent BRDs

- BRD-2026-005: YiVad Development Standards & Component Library
- BRD-2026-006: YiVad Framework Skills
`
  },
  {
    title: "Vue 3 Framework Skill",
    tags: ["yivad", "skill", "vue3", "framework"],
    meta: {
      document_id: "BRD-2026-005-SK-002",
      version: "1.0",
      author: "Claude",
      department: "it",
      domain: "data",
      priority: "p1",
      status: "approved",
      related_brds: "BRD-2026-005, BRD-2026-006",
      executive_summary: "Vue 3 best-practices reference for Composition API, TypeScript, Pinia state management, Vue Router, Element Plus UI, custom directives, composables, and SFC conventions."
    },
    content: `# Vue 3 Framework Skill

## Domain

Vue 3 best practices — Composition API, TypeScript, Pinia, Vue Router, Element Plus, directives, composables.

## Description

The Vue skill provides best-practice guidance, ecosystem knowledge, and architectural patterns for building YiVad with Vue 3. It covers the Composition API, TypeScript integration, and the broader Vue ecosystem.

## Capabilities

- **Composition API**: ref, reactive, computed, watch, provide/inject
- **TypeScript**: Props/Emits generics, type-safe stores, SFC type checking
- **Pinia**: Setup-function stores, persisted state, store composition
- **Vue Router**: Hash mode, dynamic routes, navigation guards
- **Element Plus**: el-table, ProTable, el-form, el-dialog, and all UI components
- **Custom directives**: v-auth, v-copy, v-watermark, v-debounce, v-throttle, v-longpress
- **Composables**: useTable, useTheme, useAuthButtons, useSelection, and more

## Parent BRDs

- BRD-2026-005: YiVad Development Standards & Component Library
- BRD-2026-006: YiVad Framework Skills
`
  }
];

// ── The two parent documents to optionally delete after splitting ────────────

const PARENT_KEYS = [
  "brd_brd-documents_claude002",       // BRD-2026-005
  "brd_brd-documents_1785553794h02n4q" // BRD-2026-006
];

const CNAME = "brd_brd-documents";
const TOPIC = "brd-documents";
const TREE = "brd";

function makeKey() {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `brd_${TOPIC}_${stamp}${rand}`;
}

function contentPathFor(key) {
  return `${TREE}/${TOPIC}/${key}.md`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🔗 API: ${API_URL}`);
  console.log(`📦 Creating ${ENTRIES.length} entries in "${CNAME}"...\n`);

  for (const entry of ENTRIES) {
    try {
      const key = makeKey();
      const cpath = contentPathFor(key);
      const now = Date.now();

      // 1. Write markdown content to YiKnowledge
      await rpc(
        "services.knowledge.knowledge_service",
        "write_entry_markdown",
        {
          rel_path: cpath,
          content: entry.content,
          meta: {
            title: entry.title,
            key,
            tags: entry.tags,
            ...entry.meta
          }
        }
      );

      // 2. Create MongoDB document (lean, contentPath only)
      await rpc(
        "services.database.data_service",
        "create_document",
        {
          cname: CNAME,
          data: {
            key,
            topic: TOPIC,
            title: entry.title,
            content: "",
            contentPath: cpath,
            tags: entry.tags,
            meta: entry.meta,
            createdAt: now,
            updatedAt: now
          }
        }
      );

      console.log(`✅ ${entry.meta.document_id} — ${entry.title}`);
    } catch (err) {
      console.error(`❌ ${entry.meta.document_id}: ${err.message}`);
    }
  }

  // 3. Optionally delete parent documents
  if (SHOULD_DELETE) {
    console.log("\n🗑️  Deleting parent documents...");
    for (const key of PARENT_KEYS) {
      try {
        // Delete YiKnowledge file first (best-effort)
        try {
          await rpc(
            "services.knowledge.knowledge_service",
            "delete_entry_markdown",
            { rel_path: contentPathFor(key) }
          );
        } catch {
          // best-effort
        }

        await rpc(
          "services.database.data_service",
          "delete_document",
          { cname: CNAME, key }
        );
        console.log(`✅ Deleted parent: ${key}`);
      } catch (err) {
        console.error(`❌ Failed to delete ${key}: ${err.message}`);
      }
    }
  } else {
    console.log("\n💡 Parent documents preserved. Re-run with --delete to remove them.");
  }

  // 4. Optionally create the code-review bug entry for the sed build error
  if (SHOULD_CREATE_BUG) {
    console.log("\n🐛 Creating bug entry for sed/build error...");
    try {
      const bugKey = "bug_metaschemas_sed_deletion_20260801";
      const bugContentPath = `lessons/failures/bugs/${bugKey}.md`;
      const now = Date.now();
      await rpc(
        "services.knowledge.knowledge_service",
        "write_entry_markdown",
        {
          rel_path: bugContentPath,
          content: BUG_CONTENT,
          meta: BUG_META
        }
      );
      await rpc(
        "services.database.data_service",
        "create_document",
        {
          cname: "bugs",
          data: {
            ...BUG_DOC,
            contentPath: bugContentPath,
            createdAt: now,
            updatedAt: now
          }
        }
      );
      console.log(`✅ Bug created: ${bugKey}`);
    } catch (err) {
      console.error(`❌ Bug creation failed: ${err.message}`);
    }
  } else {
    console.log("\n💡 Bug entry not created. Re-run with --create-bug to register the sed/build error.");
  }

  console.log("\n🎉 Done.");
}

// ── Bug entry: sed deletion of metaColumns line ───────────────────────────

const SHOULD_CREATE_BUG = process.argv.includes("--create-bug");

const BUG_META = {
  title: "sed deletion accidentally removed metaColumns array declaration in meta-schemas.ts",
  key: "bug_metaschemas_sed_deletion_20260801",
  tags: ["sed", "syntax-error", "build", "meta-schemas", "indentation"],
  category: "lessons/failures/bugs",
  created: "2026-08-01",
  updated: "2026-08-01",
  source: "internal",
  type: "bug",
  status: "resolved",
  severity: "major",
  priority: "p1",
  project: "YiVad",
  module: "src/views/brd/meta-schemas.ts",
  iteration: "",
  defectUrl: "",
  assignee: "Claude",
  reporter: "Claude",
  environment: "macOS / zsh",
  affectedVersion: "main (2026-08-01)",
  fixedVersion: "main (post-fix 2026-08-01)",
  frequency: "once"
};

const BUG_DOC = {
  key: BUG_META.key,
  title: BUG_META.title,
  project: BUG_META.project,
  module: BUG_META.module,
  iteration: BUG_META.iteration,
  defectUrl: BUG_META.defectUrl,
  severity: BUG_META.severity,
  priority: BUG_META.priority,
  status: BUG_META.status,
  type: BUG_META.type,
  frequency: BUG_META.frequency,
  assignee: BUG_META.assignee,
  reporter: BUG_META.reporter,
  environment: BUG_META.environment,
  affectedVersion: BUG_META.affectedVersion,
  fixedVersion: BUG_META.fixedVersion,
  tags: BUG_META.tags,
  dueDate: null,
  resolvedAt: null,
  closedAt: null
};

const BUG_CONTENT = [
  "## Description",
  "",
  "When using `sed` to remove two array elements (`document_id` and `title`) from `brd-documents.metaColumns` in `meta-schemas.ts`, subsequent `sed` operations that attempted to insert a comment overwrote the `metaColumns: [` array declaration line. This left the array elements directly inside the object literal without the `metaColumns` key, causing a SWC parser syntax error:",
  "",
  "```",
  "× Unexpected token `{`. Expected identifier, string literal, numeric literal or [ for the computed key",
  "```",
  "",
  "The `swc-loader` (Rsbuild's default bundler) failed to parse the file because the object `\"brd-documents\": {` was immediately followed by `{ key: \"version\", ...` without a property key — the parser expected a property key (like `metaColumns:`) before the opening `{`.",
  "",
  "## Steps to Reproduce",
  "",
  "1. Edit `YiVad/src/views/brd/meta-schemas.ts` — remove `metaColumns: [` line from inside `\"brd-documents\"` object",
  "2. Run `pnpm dev` or `rsbuild dev`",
  "3. Observe SWC build error at the first `{` that should have been preceded by `metaColumns: [`",
  "",
  "## Expected Result",
  "",
  "Build succeeds — `metaColumns` array has fewer entries but the array declaration itself is intact.",
  "",
  "## Actual Result",
  "",
  "Build fails with `× Module build failed (from builtin:swc-loader)` — SWC cannot parse the malformed object literal.",
  "",
  "## Cause",
  "",
  "Root cause: **Chained `sed` operations without verifying intermediate state.**",
  "",
  "The fix involved three `sed` operations:",
  "1. Delete the two meta column entries (lines 218-219) — correct",
  "2. Insert a code comment after line 217 — overwrote `metaColumns: [` because `sed -i '' '217a\\...'` inserted AFTER line 217, but the comment contained escape characters that mangled the original line",
  "3. Delete the remnant duplicate comment line — further mangled the indentation",
  "",
  "The cumulative effect: `metaColumns: [` was lost, and the remaining array elements became orphaned inside the object literal with no property key.",
  "",
  "## Solution",
  "",
  "Restored the missing `metaColumns: [` line via `sed -i '' '216a\\...'`, then split the concatenated `metaColumns: [      { key: \"version\"` onto two separate lines. Final verification: `rsbuild dev` starts successfully on port 8849 and returns HTTP 200.",
  "",
  "**Prevention**: When editing TypeScript files with `sed`, prefer the `Edit` tool which does exact string matching, or use `git diff` to verify intermediate state between operations.",
  ""
].join("\n");

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
