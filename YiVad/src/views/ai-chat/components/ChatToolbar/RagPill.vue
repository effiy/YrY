<script setup lang="ts">
/**
 * YiVad aiChat — RagConsole
 * Compact RAG settings button for the chat header (gear icon + popover).
 * The toggle switch lives in the toolbar's ct-right pills; this is the config panel.
 * References YiPet's RagPill.vue settings popover pattern.
 */
import { ref, computed, onMounted } from "vue";
import { Tools } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const store = useAiChatStore();

// ── RAG index status ──────────────────────────────────────────────────

const ragIndexStatus = ref<{ built: boolean; num_docs: number; last_built_at: string; error?: string } | null>(null);
onMounted(async () => {
  try {
    const { ragStatus } = await import("@/api/modules/ragService");
    const data = await ragStatus();
    ragIndexStatus.value = { built: data.built, num_docs: data.num_docs, last_built_at: data.last_built_at ?? "", error: (data as any).error };
  } catch { /* best-effort */ }
});

const ragHealthDot = computed<"green" | "orange" | "red">(() => {
  if (!ragIndexStatus.value) return "red";
  if (ragIndexStatus.value.error) return "orange";
  if (ragIndexStatus.value.built && ragIndexStatus.value.num_docs > 0) return "green";
  if (ragIndexStatus.value.built) return "orange";
  return "red";
});

const ragIndexAvailable = computed(() => ragIndexStatus.value?.built && ragIndexStatus.value.num_docs > 0);

// ── Derived scope from context files ──────────────────────────────────

const derivedScope = computed(() => {
  const tags = store.activeConversation?.tags ?? [];
  const ctxPaths = tags
    .filter(t => typeof t === "string" && t.startsWith("ctx:"))
    .map(t => (t as string).slice(4));
  if (!ctxPaths.length) return null;
  if (ctxPaths.length === 1) return { label: ctxPaths[0], count: 1 };
  const parts = ctxPaths.map(p => p.split("/"));
  const minLen = Math.min(...parts.map(p => p.length));
  const common: string[] = [];
  for (let i = 0; i < minLen; i++) {
    if (parts.every(p => p[i] === parts[0][i])) common.push(parts[0][i]);
    else break;
  }
  return { label: common.join("/") || "mixed roles", count: ctxPaths.length };
});
</script>

<template>
  <el-popover
    placement="bottom-end"
    :width="260"
    trigger="click"
    :teleported="true"
    popper-class="ct-rag-console-pop"
  >
    <template #reference>
      <el-button size="small" text title="RAG Console" class="ai-chat-box__model-btn">
        <span class="ct-rag-dot" :class="ragHealthDot" style="margin-right:4px" />
        <el-icon :size="14"><Tools /></el-icon>
        <span>RAG</span>
      </el-button>
    </template>
    <div class="ct-rag-pop">
      <div class="ct-rag-pop-head">
        <span class="ct-rag-pop-title">
          <span class="ct-rag-dot ct-rag-dot--lg" :class="ragHealthDot" />
          RAG Settings
        </span>
        <span v-if="ragIndexStatus?.num_docs" class="ct-rag-pop-docs">{{ ragIndexStatus.num_docs }} docs indexed</span>
        <span v-else class="ct-rag-pop-docs ct-rag-pop-docs--warn">Index not built</span>
      </div>

      <div v-if="!ragIndexAvailable" class="ct-rag-pop-section">
        <div class="ct-rag-pop-empty">
          The knowledge index has not been built yet. Run a build from the RAG dashboard or use <code>python -m scripts.build_index</code> on the server.
        </div>
      </div>

      <template v-if="store.ragEnabled || ragIndexAvailable">
        <div class="ct-rag-pop-section">
          <div class="ct-rag-pop-section-title">Quick Settings</div>

          <div v-if="derivedScope" class="ct-rag-scope-bar">
            <span class="ct-rag-scope-bar-icon">ctx</span>
            <span class="ct-rag-scope-bar-label">{{ derivedScope.label }}</span>
            <span class="ct-rag-scope-bar-count">{{ derivedScope.count }} file{{ derivedScope.count !== 1 ? 's' : '' }}</span>
          </div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>Chat Mode</span>
              <el-tooltip content="How conversation history is used for retrieval" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-select
              :model-value="store.ragChatMode ?? 'condense_plus_context'"
              size="small"
              class="ct-rag-select"
              @change="store.ragChatMode = ($event as string)"
              @click.stop
            >
              <el-option label="Condense (LLM)" value="condense" />
              <el-option label="Heuristic" value="condense_plus_context" />
              <el-option label="Context (all)" value="context" />
              <el-option label="Simple" value="simple" />
            </el-select>
          </div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>Fast Mode</span>
              <el-tooltip content="Skip retrieval — direct answer for fast response" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-switch :model-value="store.ragFast" size="small" @update:model-value="store.ragFast = !store.ragFast" @click.stop />
          </div>
        </div>

        <div class="ct-rag-pop-section">
          <div class="ct-rag-pop-section-title">Advanced</div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>Query Variants</span>
              <el-tooltip content="Number of query variations for fusion retrieval (1 = no expansion)" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-select
              :model-value="store.ragNumQueries ?? 0"
              size="small"
              class="ct-rag-select"
              @change="store.ragNumQueries = Number($event)"
              @click.stop
            >
              <el-option label="Default (1)" :value="0" />
              <el-option label="1 (no expansion)" :value="1" />
              <el-option label="3 (balanced)" :value="3" />
              <el-option label="5 (thorough)" :value="5" />
            </el-select>
          </div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>Hybrid (BM25+Vector)</span>
              <el-tooltip content="Combine keyword and semantic search for better recall" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-switch :model-value="store.ragHybrid" size="small" @update:model-value="store.ragHybrid = !store.ragHybrid" @click.stop />
          </div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>Rerank (LLM)</span>
              <el-tooltip content="Re-rank chunks with LLM cross-encoder (~8 LLM calls/query)" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-switch :model-value="store.ragRerank" size="small" @update:model-value="store.ragRerank = !store.ragRerank" @click.stop />
          </div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>HyDE</span>
              <el-tooltip content="Generate hypothetical answer first to improve retrieval" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-switch :model-value="store.ragHyde" size="small" @update:model-value="store.ragHyde = !store.ragHyde" @click.stop />
          </div>

          <div class="ct-rag-row">
            <div class="ct-rag-row-label">
              <span>Citations [N]</span>
              <el-tooltip content="Prefix chunks with [Source N] in LLM prompt for traceable answers" placement="top">
                <span class="ct-rag-info">?</span>
              </el-tooltip>
            </div>
            <el-switch :model-value="store.ragCitations" size="small" @update:model-value="store.ragCitations = !store.ragCitations" @click.stop />
          </div>
        </div>
      </template>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.ct-rag-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  &.green { background: var(--el-color-success); }
  &.orange { background: var(--el-color-warning); }
  &.red { background: var(--el-color-danger); }
  &--lg { width: 8px; height: 8px; }
}
</style>