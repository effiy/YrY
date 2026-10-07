<script setup lang="ts" name="aiChatModelSelector">
import { ref, computed } from "vue";
import { Search, Check, Cpu, Loading } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const store = useAiChatStore();

const visible = ref(false);
const search = ref("");

function onOpen() {
  if (!store.availableModels.length) store.fetchModels();
}

const MODEL_TAGS: Record<string, { label: string; color: string }> = {
  vision: { label: "vision", color: "#8b5cf6" },
  vl: { label: "vision", color: "#8b5cf6" },
  think: { label: "reasoning", color: "#f59e0b" },
  reason: { label: "reasoning", color: "#f59e0b" },
  large: { label: "large", color: "#ef4444" },
  small: { label: "compact", color: "#10b981" },
  tiny: { label: "compact", color: "#10b981" },
  mini: { label: "compact", color: "#10b981" },
};

function modelTag(name: string): { label: string; color: string } {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(MODEL_TAGS)) {
    if (lower.includes(key)) return val;
  }
  if (/\b(70|72|405)b\b/.test(lower)) return { label: "large", color: "#ef4444" };
  if (/\b(7|8|13)b\b/.test(lower)) return { label: "compact", color: "#10b981" };
  return { label: "general", color: "#6366f1" };
}

const MODEL_WINDOWS: Record<string, number> = {
  "qwen2.5:1.5b": 32768,
  "qwen2.5:7b": 32768,
  "qwen2.5:14b": 32768,
  "qwen2.5:32b": 32768,
  "qwen2.5:72b": 32768,
};

const filteredModels = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return store.availableModels;
  return store.availableModels.filter(m => m.toLowerCase().includes(q));
});

function selectModel(m: string) {
  store.selectedModel = m;
  visible.value = false;
  search.value = "";
  try { localStorage.setItem("aiChat.selectedModel", m); } catch { /* ignore */ }
}

// Restore persisted model on mount
try {
  const saved = localStorage.getItem("aiChat.selectedModel");
  if (saved && store.availableModels.includes(saved)) {
    store.selectedModel = saved;
  }
} catch { /* ignore */ }
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-end"
    :width="280"
    trigger="click"
    :teleported="true"
    popper-class="ai-chat-box__model-pop"
    @show="onOpen"
  >
    <template #reference>
      <span class="ms-pill" :title="`Model: ${store.selectedModel}`">
        <el-icon :size="14"><Cpu /></el-icon>
        <span class="ms-pill-label">{{ store.selectedModel }}</span>
      </span>
    </template>
    <div class="ms-panel">
      <div class="ms-search">
        <el-input
          v-model="search"
          size="small"
          placeholder="Filter models..."
          :prefix-icon="Search"
          clearable
        />
      </div>
      <!-- Loading skeleton -->
      <div v-if="store.modelsLoading" class="ms-loading">
        <div v-for="i in 3" :key="i" class="ms-skel">
          <span class="ms-skel-name" />
          <span class="ms-skel-tag" />
        </div>
      </div>
      <!-- Empty -->
      <div v-else-if="!store.availableModels.length" class="ms-empty">
        <span class="ms-empty-icon">📡</span>
        <span>No models available</span>
        <el-button size="small" text type="primary" @click="store.fetchModels()">Retry</el-button>
      </div>
      <!-- No match -->
      <div v-else-if="!filteredModels.length" class="ms-empty">
        <span class="ms-empty-icon">🔍</span>
        <span>No models match "{{ search }}"</span>
      </div>
      <!-- Model list -->
      <div v-else class="ms-items">
        <button
          v-for="m in filteredModels"
          :key="m"
          class="ms-card"
          :class="{ 'is-selected': m === store.selectedModel }"
          @click="selectModel(m)"
        >
          <div class="ms-card-left">
            <span class="ms-card-name">{{ m }}</span>
            <div class="ms-card-meta">
              <span
                class="ms-card-tag"
                :style="{ color: modelTag(m).color, background: modelTag(m).color + '18' }"
              >
                {{ modelTag(m).label }}
              </span>
              <span v-if="MODEL_WINDOWS[m]" class="ms-card-ctx">
                {{ (MODEL_WINDOWS[m] / 1000).toFixed(0) }}k ctx
              </span>
            </div>
          </div>
          <el-icon v-if="m === store.selectedModel" class="ms-card-check" :size="16">
            <Check />
          </el-icon>
        </button>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.ms-pill {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 14px;
  transition: all var(--transition-fast);
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
}
.ms-pill-label {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ms-panel {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: hidden;
}
.ms-search {
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.ms-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  overflow-y: auto;
}
.ms-card {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  &:hover { background: var(--el-fill-color-lighter); }
  &.is-selected { background: var(--el-color-primary-light-9); }
}
.ms-card-left {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.ms-card-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.ms-card-meta {
  display: flex;
  gap: 6px;
  align-items: center;
}
.ms-card-tag {
  flex-shrink: 0;
  padding: 1px 6px;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  border-radius: var(--radius-xs);
}
.ms-card-ctx {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.ms-card-check {
  flex-shrink: 0;
  color: var(--el-color-primary);
}
.ms-loading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}
.ms-skel {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
}
.ms-skel-name {
  flex: 1;
  height: 14px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.ms-skel-tag {
  width: 48px;
  height: 16px;
  background: var(--el-fill-color-light);
  border-radius: var(--radius-xs);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
.ms-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 24px 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.ms-empty-icon {
  font-size: 28px;
  line-height: 1;
}
</style>