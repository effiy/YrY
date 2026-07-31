<script setup lang="ts" name="aicrDashboard">
import { onMounted, onBeforeUnmount, onActivated, watch, computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";
import { useAicrUiStore } from "@/stores/modules/aicr/ui";
import { useAicrModelStore } from "@/stores/modules/aicr/models";
import { useAicrFilterStore } from "@/stores/modules/aicr/filters";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { syncKnowledge } from "@/api/modules/knowledgeService";
import { useAicrKnowledgeStore } from "@/stores/modules/aicr/knowledge";
import { useResizable } from "@/hooks/useResizable";
import KnowledgeTree from "./components/KnowledgeTree.vue";
import FileTree from "./components/FileTree.vue";
import FilterBar from "./components/FilterBar.vue";
import CodeViewer from "./components/CodeViewer.vue";
import ChatPanel from "./components/ChatPanel.vue";
import SessionEditDialog from "./components/modals/SessionEditDialog.vue";
import PageContextEditor from "./components/modals/PageContextEditor.vue";
import MessageEditor from "./components/modals/MessageEditor.vue";
import FaqManager from "./components/modals/FaqManager.vue";
import AiSettings from "./components/modals/AiSettings.vue";
import WeChatSettings from "./components/modals/WeChatSettings.vue";
import TagManager from "./components/modals/TagManager.vue";
import KeyboardShortcutsHelp from "./components/modals/KeyboardShortcutsHelp.vue";

const uiStore = useAicrUiStore();
const modelStore = useAicrModelStore();
const filterStore = useAicrFilterStore();
const fileTreeStore = useAicrFileTreeStore();
const knowledgeStore = useAicrKnowledgeStore();
const modalStore = useAicrModalStore();
const chatStore = useAicrChatStore();
const aiChatStore = useAiChatStore();
const route = useRoute();
const router = useRouter();

// ── Story/scenario origin context ──
// When the user clicks "Code Review" on a story or scenario card, the story
// page routes here with `?source=story|scenario&storyKey=&storyName=&...`.
// We surface a chip in the header so the user knows which card they're
// reviewing, and feed the same context to the chat as a system prompt so
// the LLM reviews files against the actual requirements.
const reviewOrigin = ref<{
  kind: "story" | "scenario";
  storyName?: string;
  scenarioName?: string;
} | null>(null);

function readOriginFromUrl(): "story" | "scenario" | null {
  // Hash-mode router: query params live in `route.query`, not
  // `window.location.search` (which is empty in hash mode).
  const source = (route.query.source as string | undefined) ?? null;
  if (source !== "story" && source !== "scenario") return null;
  const storyName = (route.query.storyName as string | undefined) ?? undefined;
  const scenarioName = (route.query.scenarioName as string | undefined) ?? undefined;
  reviewOrigin.value = { kind: source, storyName, scenarioName };

  // Build the system prompt. Prefer the rich context (BRD / scenario steps /
  // acceptance criteria) stashed in sessionStorage by the story page — fall
  // back to a names-only summary if sessionStorage is empty (refresh, deep
  // link from outside, etc.).
  const ctxKey = (route.query._ctx as string | undefined) ?? null;
  let richContext: string | null = null;
  if (ctxKey) {
    try {
      // Keep the entry — refresh on the aicr page should still resolve the
      // rich context. Different story keys map to different sessionStorage
      // keys, so cross-story stale reads aren't a concern.
      richContext = sessionStorage.getItem("aicr_review_context:" + ctxKey);
    } catch {
      richContext = null;
    }
  }
  const lines: string[] = richContext
    ? [richContext]
    : [
        "You are a senior code reviewer. The user arrived from a story/scenario card to review the files in the sidebar against the requirements below.",
        "Cite line numbers when calling out risks. Be concise. If the files don't match the requirements, say so explicitly."
      ];
  if (!richContext) {
    if (source === "story") {
      if (storyName) lines.push(`Story: ${storyName}`);
    } else {
      if (scenarioName) lines.push(`Scenario: ${scenarioName}`);
      if (storyName) lines.push(`From story: ${storyName}`);
    }
  }
  aiChatStore.setSystemPrompt(lines.join("\n"));
  return source;
}

function clearOrigin() {
  reviewOrigin.value = null;
  aiChatStore.setSystemPrompt("");
  // Drop the persistent review filter so the sidebar returns to the full
  // knowledge tree on the next render. Re-running loadFileTree isn't needed
  // — the v-if on `reviewOrigin` already switches the rendered component
  // back to <KnowledgeTree />.
  fileTreeStore.clearReviewFilter();
  // Strip the origin query params so a refresh doesn't silently re-enter
  // review mode after the user has dismissed the chip.
  if (route.query.source || route.query._ctx) {
    router.replace({ query: {} });
  }
}

// Wire file selection → chat session load. Both FileTree variants
// (Tree / Cards) call `fileTreeStore.selectFile(key)` on click;
// the chat panel needs `chatStore.selectSession(key)` to populate
// `activeSession`. Without this watcher, the chat panel stays stuck on
// "Select a session to start chatting" forever.
watch(
  () => fileTreeStore.selectedKey,
  key => {
    if (key && key !== chatStore.activeSession?.key) {
      chatStore.selectSession(key);
    }
  }
);

// Mirror the file-tree watcher for knowledge files: when a knowledge
// file is selected (via KnowledgeTree click or pendingSelectPath from
// the public Knowledge detail page), sync the chat session so the
// ChatPanel pulls the file's pageContent as system context.
watch(
  () => knowledgeStore.selectedPath,
  async key => {
    if (!key || key === chatStore.activeSession?.key) return;
    const content = knowledgeStore.currentFile?.content ?? "";
    if (content) {
      await knowledgeStore.ensureKnowledgeSession(key, content, {
        title: knowledgeStore.currentFile?.meta?.title,
        tags: knowledgeStore.currentFile?.meta?.tags as string[] | undefined
      });
    }
    chatStore.selectSession(key);
  }
);

const codeViewerRef = ref<InstanceType<typeof CodeViewer> | null>(null);

const { width: sidebarW, startResize: startSidebarResize } = useResizable(320, 200, 600, "aicr_sidebar_width");

watch(sidebarW, v => {
  uiStore.sidebarWidth = v;
});

const viewModeLabels = [
  { label: "Tree", value: "tree" as const },
  { label: "Cards", value: "cards" as const }
];

const timeOptions = [
  { label: "All", value: "all" as const },
  { label: "This Week", value: "week" as const },
  { label: "This Month", value: "month" as const },
  { label: "This Quarter", value: "quarter" as const },
  { label: "Custom", value: "custom" as const }
];

const fileCount = computed(() => knowledgeStore.flatFiles.length);

const syncing = ref(false);
async function onSyncKnowledge() {
  if (syncing.value) return;
  syncing.value = true;
  try {
    const res = await syncKnowledge();
    ElMessage.success(`YiKnowledge synced: ${res.synced} upserted, ${res.deleted} deleted`);
    if (knowledgeStore.categories.length > 0) {
      knowledgeStore.loadAll();
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "YiKnowledge sync failed");
  } finally {
    syncing.value = false;
  }
}

function onTimeRangeChange(r: any) {
  filterStore.setTimeRange(r);
  fileTreeStore.loadFileTree(true);
}

function onCustomDateChange() {
  fileTreeStore.loadFileTree(true);
}

onMounted(async () => {
  uiStore.loadWidths();
  const sessionStore = useAicrSessionStore();
  sessionStore.loadSessions().then(() => filterStore.refreshTagUniverse());
  knowledgeStore.loadAll();
  // Capture pendingFilterPaths before loadFileTree clears it — we need the
  // path list below to expand every card file's folders, not just the
  // selected one. Without this, files deep in collapsed folders stay
  // invisible and the user can't click them.
  const pendingFilterPaths = fileTreeStore.pendingFilterPaths;
  fileTreeStore.loadFileTree(true);
  modelStore.fetchModels();

  // URL params: ?key= / ?tag= / ?startLine=&endLine=
  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");
  const tag = params.get("tag");
  const startLine = params.get("startLine");
  const endLine = params.get("endLine");

  if (tag) {
    filterStore.selectedProjectTags = [tag];
  }
  const pendingKey = fileTreeStore.consumePendingSelectKey();
  if (key) {
    // Legacy ?key= URL param: collapse side panels so the code is front
    // and center.
    uiStore.sidebarCollapsed = true;
    uiStore.chatPanelCollapsed = true;
    fileTreeStore.expandPathToFile(key);
    fileTreeStore.selectFile(key);
  } else if (pendingKey) {
    // From story card "Code Review" navigation: keep panels expanded so
    // the user can see and click between the card's files. Expand every
    // file's folder path, not just the auto-selected one.
    if (pendingFilterPaths) {
      for (const p of pendingFilterPaths) fileTreeStore.expandPathToFile(p);
    }
    fileTreeStore.expandPathToFile(pendingKey);
    fileTreeStore.selectFile(pendingKey);
  }
  if ((key || pendingKey) && startLine) {
    const start = parseInt(startLine, 10);
    const end = endLine ? parseInt(endLine, 10) : start;
    const unwatch = watch(
      () => fileTreeStore.fileLoading,
      loading => {
        if (!loading) {
          codeViewerRef.value?.setHighlight(isNaN(start) ? null : start, isNaN(end) ? null : end);
          unwatch();
        }
      }
    );
  }

  // Keyboard shortcuts: `?` toggles help, Escape clears search/filters.
  window.addEventListener("keydown", onGlobalKeydown);

  // Story/scenario context (from Code Review navigation). Reads URL params so
  // refresh/deep-link still works. Set after fileTree setup so the chat's
  // system prompt is in place before any message is sent.
  readOriginFromUrl();

  // External pages (Knowledge detail "Ask in aicr") stage a knowledge
  // file path via `knowledgeStore.setPendingSelectPath`. Select it so
  // the KnowledgeTree highlights the file, CodeViewer renders content,
  // and the watcher above syncs chat context.
  const pendingKnowledgePath = knowledgeStore.consumePendingSelectPath();
  if (pendingKnowledgePath) {
    await knowledgeStore.selectFile(pendingKnowledgePath);
  }
});

// KeepAlive re-activation: onMounted only fires the first time aicr is
// visited. If the user navigates away and back (story card → aicr), the
// component is cached and only onActivated fires. When an external page
// staged a path filter (fileTreeStore.setPendingFilter) before routing
// here, re-run loadFileTree to apply it. Also consume any pending select
// key so the file content is loaded into the CodeViewer.
onActivated(() => {
  const pendingFilterPaths = fileTreeStore.pendingFilterPaths;
  if (pendingFilterPaths) {
    fileTreeStore.loadFileTree(true);
    // Expand every card file's folder path so all files are visible &
    // clickable, not just the auto-selected one.
    for (const p of pendingFilterPaths) fileTreeStore.expandPathToFile(p);
  }
  const pendingKey = fileTreeStore.consumePendingSelectKey();
  if (pendingKey) {
    // Keep panels expanded — user should be able to click between the
    // card's files in the sidebar.
    fileTreeStore.expandPathToFile(pendingKey);
    fileTreeStore.selectFile(pendingKey);
  }
  // Same pattern for knowledge files (Knowledge detail → Ask in aicr).
  const pendingKnowledgePath = knowledgeStore.consumePendingSelectPath();
  if (pendingKnowledgePath) {
    knowledgeStore.selectFile(pendingKnowledgePath);
  }
  // Story/scenario context re-application on KeepAlive re-entry.
  readOriginFromUrl();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
  // Drop the story/scenario system prompt so it doesn't bleed into the next
  // session opened from /aiChat or elsewhere.
  clearOrigin();
});

function onGlobalKeydown(e: KeyboardEvent) {
  // Ignore when typing in inputs/textareas (unless it's Escape).
  const target = e.target as HTMLElement;
  const inEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

  if (e.key === "Escape") {
    if (inEditable) return; // let the field's own Escape handler run
    fileTreeStore.searchQuery = "";
    filterStore.clearAll();
    return;
  }
  if (e.key === "?" && !inEditable) {
    e.preventDefault();
    modalStore.toggleShortcutHelp();
  }
}
</script>

<template>
  <div class="aicr-app">
    <!-- Header -->
    <div class="aicr-hdr">
      <div class="aicr-hdr-l">
        <h2 class="aicr-title">Code Review</h2>
        <span class="aicr-count">{{ fileCount }} files</span>
        <el-tag
          v-if="reviewOrigin"
          :type="reviewOrigin.kind === 'story' ? 'success' : 'warning'"
          size="small"
          effect="plain"
          closable
          @close="clearOrigin"
        >
          {{ reviewOrigin.kind === "story" ? reviewOrigin.storyName : `${reviewOrigin.scenarioName} · ${reviewOrigin.storyName}` }}
        </el-tag>
      </div>
      <div class="aicr-hdr-r">
        <el-button
          size="small"
          :loading="syncing"
          title="Sync ~/YiKnowledge metadata into the database"
          @click="onSyncKnowledge"
        >
          Sync Knowledge
        </el-button>
        <el-segmented
          :model-value="uiStore.viewMode"
          @update:model-value="(v: any) => uiStore.setViewMode(v)"
          :options="viewModeLabels"
        />
        <div class="aicr-dim">
          <span class="aicr-dim-lbl">Time</span>
          <el-select :model-value="filterStore.timeRange" size="small" style="width: 140px" @change="onTimeRangeChange">
            <el-option v-for="o in timeOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
          <template v-if="filterStore.timeRange === 'custom'">
            <el-date-picker
              v-model="filterStore.customStart"
              type="date"
              placeholder="Start"
              size="small"
              style="width: 130px"
              @change="onCustomDateChange"
            />
            <span class="aicr-sep">-</span>
            <el-date-picker
              v-model="filterStore.customEnd"
              type="date"
              placeholder="End"
              size="small"
              style="width: 130px"
              @change="onCustomDateChange"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- Tag filters -->
    <FilterBar />

    <!-- Main content -->
    <main
      class="aicr-main"
      :class="{ 'is-cards': uiStore.viewMode === 'cards', 'is-center-collapsed': uiStore.centerCollapsed }"
    >
      <aside
        class="aicr-sidebar"
        :class="{ collapsed: uiStore.sidebarCollapsed || uiStore.viewMode === 'cards' }"
        :style="{ width: uiStore.sidebarCollapsed || uiStore.viewMode === 'cards' ? '0px' : sidebarW + 'px' }"
      >
        <div v-show="!uiStore.sidebarCollapsed && uiStore.viewMode !== 'cards'" class="aicr-sidebar-inner">
          <!-- When the user arrived from a story/scenario Code Review, the
               fileTreeStore's tree is already scoped to that card's files via
               setPendingFilter — render that filtered session tree so the
               sidebar shows exactly the files under review. Otherwise fall
               back to the YiKnowledge tree. -->
          <FileTree v-if="reviewOrigin" />
          <KnowledgeTree v-else />
        </div>
        <div v-show="!uiStore.sidebarCollapsed && uiStore.viewMode !== 'cards'" class="aicr-resizer aicr-resizer--left" @pointerdown="startSidebarResize" />
      </aside>
      <button
        v-show="uiStore.sidebarCollapsed && uiStore.viewMode !== 'cards'"
        class="aicr-expand-btn aicr-expand-btn--left"
        @click="uiStore.toggleSidebar()"
        title="Expand sidebar"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
      <button
        v-show="!uiStore.sidebarCollapsed && !uiStore.centerCollapsed && uiStore.viewMode === 'tree'"
        class="aicr-collapse-btn aicr-collapse-btn--sidebar"
        :style="{ left: sidebarW + 'px' }"
        @click="uiStore.toggleSidebar()"
        title="Collapse sidebar"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>

      <section class="aicr-center" :class="{ collapsed: uiStore.centerCollapsed }">
        <CodeViewer v-if="uiStore.viewMode === 'tree'" ref="codeViewerRef" />
        <!-- Cards view: render FileTree (which delegates to FileTreeCards
             when viewMode==='cards') full-width in the center. Without this,
             the "Cards" toggle showed <KnowledgeTree/> — a tree, not cards —
             and the FileTreeCards component was never mounted anywhere. -->
        <FileTree v-else full-width />
      </section>

      <aside class="aicr-chat">
        <ChatPanel />
      </aside>
    </main>

    <!-- All modals (mounted once at page root for proper overlay z-index) -->
    <SessionEditDialog />
    <PageContextEditor />
    <MessageEditor />
    <FaqManager />
    <AiSettings />
    <WeChatSettings />
    <TagManager />
    <KeyboardShortcutsHelp />
  </div>
</template>

<style scoped lang="scss">
.aicr-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

// Header — matches sb-hdr
.aicr-hdr {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.aicr-hdr-l {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.aicr-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.aicr-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.aicr-hdr-r {
  display: flex;
  gap: 10px;
  align-items: center;
}
.aicr-dim {
  display: flex;
  gap: 8px;
  align-items: center;
}
.aicr-dim-lbl {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.aicr-sep {
  color: var(--el-text-color-placeholder);
}

// Main
.aicr-main {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
}
.aicr-main.is-cards .aicr-center {
  flex: 1;
}
.aicr-main.is-center-collapsed {
  justify-content: space-between;
}
.aicr-main.is-center-collapsed .aicr-chat {
  flex: 1 1 0;
}
.aicr-center.collapsed {
  display: none;
}
.aicr-sidebar {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.15s;
}
.aicr-sidebar.collapsed {
  border-right: none;
}
.aicr-sidebar-inner {
  height: 100%;
  padding: 8px;
  overflow-y: auto;
}
.aicr-chat {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.aicr-center {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.aicr-resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
  width: 4px;
  cursor: col-resize;
}
.aicr-resizer:hover {
  background: var(--el-color-primary);
}
.aicr-resizer--left {
  right: 0;
}
.aicr-resizer--right {
  left: 0;
}
.aicr-collapse-btn {
  position: absolute;
  top: 50%;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 48px;
  padding: 0;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
  transform: translateY(-50%);
  transition: left 0.15s, right 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
}
.aicr-collapse-btn:hover {
  color: #ffffff;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}
.aicr-collapse-btn:active {
  transform: translateY(-50%) scale(0.96);
}
.aicr-collapse-btn--sidebar {
  left: 320px;
}
.aicr-collapse-btn--chat {
  right: 420px;
}
.aicr-expand-btn {
  position: absolute;
  top: 50%;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 48px;
  padding: 0;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  transform: translateY(-50%);
}
.aicr-expand-btn:hover {
  background: var(--el-fill-color-light);
}
.aicr-expand-btn--left {
  left: 0;
  border-radius: 0 4px 4px 0;
}
.aicr-expand-btn--right {
  right: 0;
  border-radius: 4px 0 0 4px;
}
</style>
