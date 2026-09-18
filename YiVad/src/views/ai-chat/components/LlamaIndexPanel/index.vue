<script setup lang="ts" name="aiChatLlamaIndexPanel">
/**
 * RAG Console — thin orchestration layer over 4 tab components.
 *
 * Manages tab switching (with KeepAlive state preservation), scope via
 * useRagScope, shared file-preview dialog, and cross-tab data flow:
 * History tab exposes its records → Index tab renders aggregate analytics.
 */
import { ref, computed } from "vue";
import { Search, Files, Scissor, Clock } from "@element-plus/icons-vue";
import { ragStatus } from "@/api/modules/ragService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useRagScope } from "./useRagScope";
import { useRagAnalytics, defaultFilter } from "./useRagAnalytics";
import type { RagQueryRecord, RagChatTurnRecord } from "@/api/interface/rag";
import RagQueryTab from "./RagQueryTab.vue";
import RagIndexTab from "./RagIndexTab.vue";
import RagDecomposeTab from "./RagDecomposeTab.vue";
import RagHistoryTab from "./RagHistoryTab.vue";

const props = withDefaults(defineProps<{ scopeFiles?: string[]; scopeTitle?: string }>(), {
  scopeFiles: () => [],
  scopeTitle: ""
});
const emit = defineEmits<{ (e: "close"): void }>();

// ── Scope (composable) ──
const scopeFilesRef = computed(() => props.scopeFiles);
const { hasScope, derivedScope, scopeFileInfos, scopeFileGroups } = useRagScope(scopeFilesRef);

// ── Tabs (KeepAlive preserves component state across switches) ──
type Tab = "query" | "index" | "decompose" | "history";
const activeTab = ref<Tab>("query");
const queryTabRef = ref<InstanceType<typeof RagQueryTab> | null>(null);
const historyTabRef = ref<InstanceType<typeof RagHistoryTab> | null>(null);

const activeComponent = computed(() => {
  const map: Record<Tab, unknown> = {
    query: RagQueryTab,
    decompose: RagDecomposeTab,
    index: RagIndexTab,
    history: RagHistoryTab
  };
  return map[activeTab.value];
});

function setActiveTabRef(el: unknown) {
  if (activeTab.value === "query") queryTabRef.value = el as InstanceType<typeof RagQueryTab>;
  else if (activeTab.value === "history") historyTabRef.value = el as InstanceType<typeof RagHistoryTab>;
}

// ── Cross-tab data: History → Index analytics ──
// History tab exposes historyRecords + chatTurns via defineExpose.
// We read them reactively; Index tab receives analytics computed from them.
const sharedHistoryRecords = computed(() => historyTabRef.value?.historyRecords ?? []);
const sharedChatTurns = computed(() => historyTabRef.value?.chatTurns ?? []);
const sharedFilter = defaultFilter();
const sharedAnalytics = useRagAnalytics(sharedHistoryRecords, sharedChatTurns, sharedFilter);

// ── Seed query overrides from backend config ──
let overridesSeeded = false;
async function seedQueryOverrides() {
  if (overridesSeeded) return;
  try {
    const status = await ragStatus();
    if (status?.config) {
      queryTabRef.value?.seedOverrides(status.config);
      overridesSeeded = true;
    }
  } catch {
    /* */
  }
}
seedQueryOverrides();

// ── File preview (shared across all tabs) ──
const { render } = useMarkdown();
const fp = ref({ visible: false, title: "", loading: false, html: "" });
async function preview(path: string) {
  fp.value = { visible: true, title: path.split("/").pop() || path, loading: true, html: "" };
  try {
    const r = await readKnowledgeFile(path);
    fp.value.html = render(r.content || "");
  } catch {
    fp.value.html = "<p style='color:var(--el-color-danger)'>Failed to load.</p>";
  } finally {
    fp.value.loading = false;
  }
}

function handleSwitchToQuery(_question: string) {
  activeTab.value = "query";
}
</script>

<template>
  <el-dialog
    :model-value="true"
    :title="scopeTitle ? `RAG — ${scopeTitle}` : 'RAG Console'"
    width="920px"
    top="2vh"
    append-to-body
    :close-on-click-modal="false"
    @close="emit('close')"
  >
    <!-- Context bar — shows attached files with click-to-preview -->
    <div class="rc-ctx" :class="{ 'rc-ctx--on': hasScope }">
      <div class="rc-ctx-top">
        <span class="rc-ctx-icon">📚</span>
        <span class="rc-ctx-n">{{ scopeFiles.length }} context file(s)</span>
        <code v-if="hasScope" class="rc-ctx-scope">{{ derivedScope || "mixed" }}</code>
        <span v-else class="rc-ctx-empty-tag">No context files attached</span>
      </div>
      <div v-if="hasScope" class="rc-ctx-list">
        <template v-for="[dir, files] in scopeFileGroups" :key="dir">
          <span class="rc-ctx-dir">{{ dir }}/</span>
          <span v-for="f in files" :key="f.path" class="rc-ctx-file" @click="preview(f.path)" :title="f.path">{{ f.name }}</span>
        </template>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rc-tabs">
      <button class="rc-tab" :class="{ on: activeTab === 'query' }" @click="activeTab = 'query'">
        <el-icon><Search /></el-icon> Query
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'decompose' }" @click="activeTab = 'decompose'">
        <el-icon><Scissor /></el-icon> Decompose
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'index' }" @click="activeTab = 'index'">
        <el-icon><Files /></el-icon> Index
      </button>
      <button class="rc-tab" :class="{ on: activeTab === 'history' }" @click="activeTab = 'history'">
        <el-icon><Clock /></el-icon> History
      </button>
    </div>

    <!-- Tab panels — KeepAlive preserves component state across switches -->
    <KeepAlive>
      <component
        :is="activeComponent"
        :ref="setActiveTabRef"
        :scope-files="scopeFiles"
        :derived-scope="derivedScope"
        :has-scope="hasScope"
        :scope-file-infos="scopeFileInfos"
        :scope-file-groups="scopeFileGroups"
        :scope-popularity="sharedAnalytics.scopePopularity.value"
        :top-repeated-questions="sharedAnalytics.topRepeatedQuestions.value"
        :top-stale-files="sharedAnalytics.topStaleFiles.value"
        :top-scoring-files="sharedAnalytics.topScoringFiles.value"
        :coverage-gap="sharedAnalytics.computeCoverageGap(scopeFiles)"
        @open-file="preview"
        @switch-to-query="handleSwitchToQuery"
      />
    </KeepAlive>

    <!-- File preview dialog (shared across all tabs) -->
    <el-dialog v-model="fp.visible" :title="fp.title" width="800px" top="5vh" append-to-body :close-on-click-modal="true">
      <div v-if="fp.loading" class="rc-fp-loading">Loading…</div>
      <div v-else class="rc-fp-body" v-html="fp.html" />
    </el-dialog>
  </el-dialog>
</template>

<style scoped lang="scss">
// ── Context bar ──
.rc-ctx {
  padding: 12px 16px;
  margin-bottom: 14px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: background 0.2s;
}
.rc-ctx--on {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}
.rc-ctx-top {
  display: flex;
  gap: 8px;
  align-items: center;
}
.rc-ctx-icon {
  font-size: 16px;
}
.rc-ctx-n {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.rc-ctx-scope {
  padding: 1px 8px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-7);
  border-radius: 3px;
}
.rc-ctx-empty-tag {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.rc-ctx-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  align-items: baseline;
  margin-top: 10px;
}
.rc-ctx-dir {
  font-family: "SF Mono", Menlo, monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.rc-ctx-file {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-color-primary-light-8);
  border-radius: 4px;
  transition: background 0.1s;
  &:hover {
    color: #ffffff;
    background: var(--el-color-primary-light-6);
  }
}

// ── Tabs ──
.rc-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 18px;
  border-bottom: 2px solid var(--el-border-color-lighter);
}
.rc-tab {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 22px;
  margin-bottom: -2px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.rc-tab:hover {
  color: var(--el-text-color-primary);
}
.rc-tab.on {
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
}

// ── File preview ──
.rc-fp-loading {
  padding: 32px 0;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.rc-fp-body {
  max-height: 70vh;
  overflow-y: auto;
  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 13px;
  }
}
</style>
