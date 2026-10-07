<script setup lang="ts">
import { ref, computed } from "vue";
import { Search, Clock, DocumentCopy, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { usePromptHistory, clearPromptHistory, removePromptHistoryAt } from "@/hooks/usePromptHistory";

defineProps<{
  /** Function to split text into [match, non-match] segments for highlighting search terms */
  highlightSegments: (text: string, query: string) => { text: string; match: boolean }[];
}>();

const store = useAiChatStore();
const { promptHistory } = usePromptHistory();
const historyPopoverVisible = ref(false);
const historyQuery = ref("");
const historyList = computed<{ text: string; realIdx: number }[]>(() => {
  const q = historyQuery.value.trim().toLowerCase();
  const all = promptHistory.value;
  const indexed = all.map((text, realIdx) => ({ text, realIdx }));
  const filtered = q ? indexed.filter(x => x.text.toLowerCase().includes(q)) : indexed;
  return filtered.reverse();
});
function trigrams(s: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i <= s.length - 3; i++) set.add(s.slice(i, i + 3));
  return set;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}
const similarPrompts = computed<{ text: string; score: number }[]>(() => {
  const q = historyQuery.value.trim();
  if (!q) return [];
  if (historyList.value.length > 0) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  return promptHistory.value
    .map(text => ({ text, score: jaccard(qt, trigrams(text)) }))
    .filter(x => x.score >= 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});
const recentPromptChips = computed<string[]>(() => {
  if (historyQuery.value.trim()) return [];
  return promptHistory.value.slice(-3).reverse();
});
function truncatePrompt(s: string, max = 40): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "\u2026";
}
function useHistoryPrompt(s: string) {
  store.input = s;
  historyPopoverVisible.value = false;
}
function copyHistoryPrompt(s: string) {
  navigator.clipboard?.writeText(s).then(
    () => ElMessage.success("Prompt copied"),
    () => ElMessage.error("Copy failed")
  );
}
function removeHistoryPrompt(realIdx: number) {
  removePromptHistoryAt(realIdx);
}
async function confirmClearHistory() {
  if (!promptHistory.value.length) return;
  const ok = await confirm(
    `Clear all ${promptHistory.value.length} prompt(s)? This cannot be undone.`,
    "Clear prompt history"
  );
  if (!ok) return;
  clearPromptHistory();
  ElMessage.success("Prompt history cleared");
}
</script>

<template>
  <!-- Prompt history (Pi-inspired: recent prompts browser) -->
  <el-popover
    v-model:visible="historyPopoverVisible"
    placement="bottom"
    :width="420"
    trigger="click"
    :title="`Prompt history · ${promptHistory.length}`"
    @show="historyQuery = ''"
  >
    <template #reference>
      <el-button circle size="default" :icon="Clock" title="Prompt history" />
    </template>
    <div class="ct-history-pop">
      <div v-if="recentPromptChips.length" class="ct-history-recent">
        <span class="ct-history-recent-label">Recent:</span>
        <span v-for="(p, i) in recentPromptChips" :key="`recent-${i}`" class="ct-history-chip">
          <span class="ct-history-chip-text" :title="`${p} — click to insert into input`" @click="useHistoryPrompt(p)">{{
            truncatePrompt(p)
          }}</span>
          <el-button
            class="ct-history-chip-copy"
            size="small"
            text
            :icon="DocumentCopy"
            title="Copy prompt"
            @click.stop="copyHistoryPrompt(p)"
          />
        </span>
      </div>
      <el-input
        v-model="historyQuery"
        size="small"
        clearable
        :prefix-icon="Search"
        placeholder="Search prompts\u2026"
        class="ct-history-search"
      />
      <div v-if="!historyList.length" class="ct-history-empty">
        {{
          historyQuery
            ? "No prompts match your filter."
            : "No prompts yet. Type a prompt and press Enter — it will show up here."
        }}
      </div>
      <div v-if="similarPrompts.length" class="ct-history-similar">
        <span class="ct-history-similar-label">Did you mean:</span>
        <span
          v-for="(p, i) in similarPrompts"
          :key="`sim-${i}`"
          class="ct-history-chip-text"
          :title="`${p.text} — similarity ${(p.score * 100).toFixed(0)}% · click to insert into input`"
          @click="useHistoryPrompt(p.text)"
          >{{ truncatePrompt(p.text, 60) }}
          <span class="ct-history-similar-score">{{ (p.score * 100).toFixed(0) }}%</span></span
        >
      </div>
      <div class="ct-history-rows">
        <div v-for="(p, i) in historyList" :key="`${p.realIdx}-${i}`" class="ct-history-row">
          <span class="ct-history-idx">{{ promptHistory.length - p.realIdx }}</span>
          <span class="ct-history-text" :title="p.text" @click="useHistoryPrompt(p.text)">
            <template v-for="(seg, si) in highlightSegments(p.text, historyQuery)" :key="si">
              <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
              <template v-else>{{ seg.text }}</template>
            </template>
          </span>
          <div class="ct-history-actions">
            <el-button size="small" text :icon="DocumentCopy" @click="copyHistoryPrompt(p.text)" />
            <el-button size="small" text :icon="Delete" @click="removeHistoryPrompt(p.realIdx)" />
          </div>
        </div>
      </div>
      <div v-if="promptHistory.length" class="ct-history-footer">
        <el-button size="small" type="danger" text :icon="Delete" @click="confirmClearHistory"
          >Clear all ({{ promptHistory.length }})</el-button
        >
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
// Prompt history panel (Pi-inspired)
.ct-history-pop {
  max-height: 360px;
  overflow-y: auto;
  font-size: 12px;
}
.ct-history-recent {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding-bottom: 6px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ct-history-recent-label {
  margin-right: 2px;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}
.ct-history-chip {
  display: inline-flex;
  align-items: center;
  max-width: 200px;
  padding: 1px 4px 1px 8px;
  font-size: 11px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    .ct-history-chip-copy {
      opacity: 1;
    }
    .ct-history-chip-text {
      color: var(--el-color-primary);
    }
  }
}
.ct-history-chip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ct-history-chip-copy {
  height: 16px;
  min-height: 16px;
  padding: 0 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  &:hover {
    opacity: 1;
  }
}
.ct-history-search {
  margin-bottom: 8px;
}
.ct-history-empty {
  padding: 16px 8px;
  font-style: italic;
  line-height: 1.5;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.ct-history-similar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ct-history-similar-label {
  font-size: 11px;
  font-style: italic;
  color: var(--el-text-color-secondary);
}
.ct-history-similar .ct-history-chip-text {
  padding: 2px 8px;
  font-size: 12px;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
  }
}
.ct-history-similar-score {
  margin-left: 4px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
}
.ct-history-row {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  &:last-child {
    border-bottom: 0;
  }
}
.ct-history-idx {
  flex: 0 0 24px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder);
  text-align: right;
}
.ct-history-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: var(--el-color-primary);
  }
}
.ct-history-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.ct-history-row:hover .ct-history-actions {
  opacity: 1;
}
.ct-history-rows {
  max-height: 280px;
  overflow-y: auto;
}
.ct-history-footer {
  position: sticky;
  bottom: 0;
  padding: 8px 0 0;
  margin-top: 8px;
  text-align: right;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>