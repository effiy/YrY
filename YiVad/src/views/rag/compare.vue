<template>
  <div class="rag-compare">
    <header class="rag-compare__header">
      <div>
        <h1>RAG vs Baseline Comparison</h1>
        <p>Submit the same question to both the RAG pipeline (YiKnowledge-grounded) and the plain LLM (no retrieval). Compare quality, sourcing, and hallucination side by side.</p>
      </div>
    </header>

    <el-card shadow="hover" class="rag-compare__query">
      <div class="query-form">
        <el-input
          v-model="compareInput"
          type="textarea"
          :rows="2"
          placeholder="Enter a question to compare RAG-grounded vs plain LLM answers…"
          @keyup.enter.ctrl="runCompare"
          :disabled="compareRunning"
        />
        <div class="query-controls">
          <div class="scope-row">
            <span class="param-label">Scope:</span>
            <el-input v-model="compareScope" placeholder="Full KB" size="small" clearable style="width: 180px" :disabled="compareRunning" />
          </div>
          <div class="action-row">
            <el-button v-if="compareRunning" type="danger" plain size="small" @click="stopCompare">
              <el-icon><Close /></el-icon> Stop
            </el-button>
            <el-button type="primary" :loading="compareRunning" @click="runCompare" :disabled="!compareInput.trim() || compareRunning">
              <el-icon><Switch /></el-icon> {{ compareRunning ? "Comparing…" : "Compare" }}
            </el-button>
            <el-button text size="small" @click="clearCompare" :disabled="compareRunning">Clear</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Side-by-Side Results -->
    <div v-if="compareRagAnswer || comparePlainAnswer || compareRunning" class="rag-compare__results">
      <!-- RAG Column -->
      <el-card shadow="hover" class="compare-panel compare-panel--rag">
        <template #header>
          <div class="panel-header">
            <div>
              <el-tag type="success" size="small" effect="dark">RAG</el-tag>
              <span class="panel-label">Retrieval-Augmented</span>
            </div>
            <div class="panel-meta">
              <span v-if="compareRagStreaming" class="streaming-badge">
                <el-icon class="is-loading"><Loading /></el-icon> Streaming
              </span>
              <el-tag v-if="compareRagSources.length" size="small" type="info" effect="plain">
                {{ compareRagSources.length }} source{{ compareRagSources.length > 1 ? "s" : "" }}
              </el-tag>
            </div>
          </div>
        </template>
        <div v-if="compareRagError" class="panel-error">
          <el-alert :title="compareRagError" type="error" :closable="false" />
        </div>
        <div v-else-if="compareRagAnswer" class="panel-answer" v-html="renderAnswer(compareRagAnswer)"></div>
        <div v-else-if="compareRagStreaming" class="panel-waiting">Waiting for response…</div>
        <div v-else class="panel-empty">No response yet.</div>

        <!-- RAG Sources -->
        <div v-if="compareRagSources.length" class="panel-sources">
          <div class="sources-title">
            <el-icon><Document /></el-icon> Retrieved Sources
          </div>
          <SourceChip
            v-for="(s, si) in compareRagSources"
            :key="si"
            :source="s"
            :index="si"
          />
        </div>
      </el-card>

      <!-- Plain LLM Column -->
      <el-card shadow="hover" class="compare-panel compare-panel--plain">
        <template #header>
          <div class="panel-header">
            <div>
              <el-tag type="warning" size="small" effect="dark">Baseline</el-tag>
              <span class="panel-label">Plain LLM (no retrieval)</span>
            </div>
            <div class="panel-meta">
              <span v-if="comparePlainStreaming" class="streaming-badge">
                <el-icon class="is-loading"><Loading /></el-icon> Streaming
              </span>
            </div>
          </div>
        </template>
        <div v-if="comparePlainError" class="panel-error">
          <el-alert :title="comparePlainError" type="error" :closable="false" />
        </div>
        <div v-else-if="comparePlainAnswer" class="panel-answer" v-html="renderAnswer(comparePlainAnswer)"></div>
        <div v-else-if="comparePlainStreaming" class="panel-waiting">Waiting for response…</div>
        <div v-else class="panel-empty">No response yet.</div>

        <div class="panel-note">
          <el-icon><WarningFilled /></el-icon>
          Answers may hallucinate — no knowledge base grounding.
        </div>
      </el-card>
    </div>

    <!-- Comparison Summary -->
    <el-card v-if="compareRagAnswer && comparePlainAnswer" shadow="hover" class="rag-compare__summary">
      <template #header>
        <span><el-icon><DataAnalysis /></el-icon> Comparison Metrics</span>
      </template>
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="RAG Response Length">{{ compareRagAnswer.length }} chars</el-descriptions-item>
        <el-descriptions-item label="Baseline Response Length">{{ comparePlainAnswer.length }} chars</el-descriptions-item>
        <el-descriptions-item label="Length Ratio">{{ (compareRagAnswer.length / Math.max(1, comparePlainAnswer.length)).toFixed(2) }}x</el-descriptions-item>
        <el-descriptions-item label="RAG Sources Used">{{ compareRagSources.length }}</el-descriptions-item>
        <el-descriptions-item label="Best Source Score">
          <span :style="{ color: scoreColor(bestRagSourceScore), fontWeight: 600 }">
            {{ scoreLabel(bestRagSourceScore) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="RAG Errors">
          <span :class="compareRagError ? 'text-danger' : 'text-success'">
            {{ compareRagError ? "1 error" : "None" }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="ragCompareMode">
import { ref, computed, onBeforeUnmount } from "vue";
import { Close, Switch, Loading, Document, WarningFilled, DataAnalysis } from "@element-plus/icons-vue";
import { streamRagChat } from "@/api/modules/ragService";
import { streamChat } from "@/api/modules/chatService";
import { scorePercent, scoreLabel, scoreColor, renderAnswer } from "@/views/rag/constants";
import ScoreBar from "./components/ScoreBar.vue";
import SourceChip from "./components/SourceChip.vue";
import type { RagSource } from "@/api/interface/rag";

const compareInput = ref("");
const compareScope = ref("");
const compareRunning = ref(false);

const compareRagAnswer = ref("");
const comparePlainAnswer = ref("");
const compareRagSources = ref<RagSource[]>([]);
const compareRagStreaming = ref(false);
const comparePlainStreaming = ref(false);
const compareRagError = ref("");
const comparePlainError = ref("");

let ragAbort: (() => void) | null = null;
let plainAbort: (() => void) | null = null;

const bestRagSourceScore = computed(() => {
  if (!compareRagSources.value.length) return 0;
  return Math.max(...compareRagSources.value.map((s) => s.score ?? 0));
});

async function runCompare() {
  const q = compareInput.value.trim();
  if (!q || compareRunning.value) return;

  compareRunning.value = true;
  compareRagAnswer.value = "";
  comparePlainAnswer.value = "";
  compareRagSources.value = [];
  compareRagError.value = "";
  comparePlainError.value = "";
  compareRagStreaming.value = true;
  comparePlainStreaming.value = true;

  const ollamaMessages = [{ role: "user" as const, content: q }];
  const chatShape = [{ type: "user" as const, message: q, timestamp: Date.now() }];

  ragAbort = streamRagChat(
    { messages: ollamaMessages, scope: compareScope.value || undefined },
    {
      onChunk: (t) => { compareRagAnswer.value += t; },
      onSources: (s) => { compareRagSources.value = s; },
      onDone: () => { compareRagStreaming.value = false; ragAbort = null; if (!comparePlainStreaming.value) compareRunning.value = false; },
      onError: (e) => { compareRagStreaming.value = false; compareRagError.value = e.message; ragAbort = null; if (!comparePlainStreaming.value) compareRunning.value = false; },
    }
  ).abort;

  plainAbort = streamChat(
    { messages: chatShape },
    (t) => { comparePlainAnswer.value += t; },
    () => { comparePlainStreaming.value = false; plainAbort = null; if (!compareRagStreaming.value) compareRunning.value = false; },
    (e) => { comparePlainStreaming.value = false; comparePlainError.value = e.message; plainAbort = null; if (!compareRagStreaming.value) compareRunning.value = false; }
  ).abort;
}

function stopCompare() {
  ragAbort?.();
  plainAbort?.();
  ragAbort = null;
  plainAbort = null;
  compareRagStreaming.value = false;
  comparePlainStreaming.value = false;
  compareRunning.value = false;
}

function clearCompare() {
  stopCompare();
  compareRagAnswer.value = "";
  comparePlainAnswer.value = "";
  compareRagSources.value = [];
  compareRagError.value = "";
  comparePlainError.value = "";
  compareInput.value = "";
}

onBeforeUnmount(() => { stopCompare(); });
</script>

<style scoped lang="scss">
.rag-compare {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;

  &__header {
    margin-bottom: 20px;
    h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; }
    p { margin: 0; color: var(--el-text-color-secondary); font-size: 14px; }
  }

  &__query {
    margin-bottom: 20px;
  }

  &__results {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__summary {
    margin-bottom: 20px;
  }
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.query-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.scope-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.param-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}
.action-row {
  display: flex;
  gap: 8px;
}

// Panels
.compare-panel {
  min-height: 200px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .panel-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-left: 8px;
    }

    .panel-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .streaming-badge {
    font-size: 12px;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .panel-error { margin-bottom: 8px; }

  .panel-answer {
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--el-text-color-primary);

    :deep(.citation) {
      color: var(--el-color-primary);
      font-weight: 600;
      font-size: 11px;
      vertical-align: super;
    }
  }

  .panel-waiting, .panel-empty {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }

  .panel-note {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
    font-size: 12px;
    color: var(--el-color-warning);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .panel-sources {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .sources-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

.text-danger { color: var(--el-color-danger); font-weight: 500; }
.text-success { color: var(--el-color-success); font-weight: 500; }
</style>
