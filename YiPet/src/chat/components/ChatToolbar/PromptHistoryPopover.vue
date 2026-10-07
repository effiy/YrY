<script setup lang="ts">
/**
 * Prompt history popover — shows recent prompts, search, fuzzy find, copy, clear.
 */
import { computed, ref } from 'vue';
import { Clock, Search, DocumentCopy, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useChatStore } from '../../stores/chat';
import { t } from '@/shared/i18n';
import { truncatePrompt, highlightSegments, trigrams, jaccard } from '../../composables/useTextSearch';

const store = useChatStore();
const s = store.state;

const visible = ref(false);
const query = ref('');

const recentChips = computed(() => {
  if (query.value.trim()) return [];
  return s.promptHistory.slice(-3).reverse();
});

const list = computed(() => {
  const q = query.value.trim().toLowerCase();
  const indexed = s.promptHistory.map((text, i) => ({ text, realIdx: i }));
  const filtered = q ? indexed.filter((x) => x.text.toLowerCase().includes(q)) : indexed;
  return filtered.reverse();
});

const similar = computed<{ text: string; score: number }[]>(() => {
  const q = query.value.trim();
  if (!q) return [];
  if (list.value.length > 0) return [];
  const qt = trigrams(q);
  if (!qt.size) return [];
  return s.promptHistory
    .map((text) => ({ text, score: jaccard(qt, trigrams(text)) }))
    .filter((x) => x.score >= 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});

function useHistory(text: string) {
  store.invokePromptHistory?.(s.promptHistory.indexOf(text));
  visible.value = false;
}

function copyPrompt(text: string) {
  navigator.clipboard?.writeText(text).then(
    () => ElMessage.success('Prompt copied'),
    () => ElMessage.error('Copy failed'),
  );
}

function removePrompt(idx: number) {
  store.removePromptHistoryAt?.(idx);
}

async function confirmClear() {
  if (!s.promptHistory.length) return;
  try {
    await ElMessageBox.confirm(
      `Clear all ${s.promptHistory.length} prompt(s)? This cannot be undone.`,
      'Clear prompt history',
      { type: 'warning', confirmButtonText: 'Clear', cancelButtonText: 'Cancel' },
    );
  } catch { return; }
  store.clearPromptHistory?.();
  visible.value = false;
  ElMessage.success('Prompt history cleared');
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    popper-class="ct-tb-popper"
    placement="bottom"
    :width="420"
    trigger="click"
    :title="t('chatPromptHistoryCount', String(s.promptHistory.length))"
    @show="query = ''"
  >
    <template #reference>
      <el-button circle :icon="Clock" :title="t('chatPromptHistory')" />
    </template>
    <div class="ct-history-pop">
      <div v-if="recentChips.length" class="ct-history-recent">
        <span class="ct-history-recent-label">Recent:</span>
        <span v-for="(p, i) in recentChips" :key="`recent-${i}`" class="ct-history-chip">
          <span class="ct-history-chip-text" :title="`${p} — click to insert into input`" @click="useHistory(p)">{{ truncatePrompt(p) }}</span>
          <el-button class="ct-history-chip-copy" size="small" text :icon="DocumentCopy" title="Copy prompt" @click.stop="copyPrompt(p)" />
        </span>
      </div>
      <el-input v-model="query" size="small" clearable :prefix-icon="Search" placeholder="Search prompts..." class="ct-history-search" />
      <div v-if="!list.length && !similar.length" class="ct-history-empty">
        {{ query ? 'No prompts match your filter.' : 'No prompts yet. Type a prompt and press Enter — it will show up here.' }}
      </div>
      <div v-if="similar.length" class="ct-history-similar">
        <span class="ct-history-similar-label">Did you mean:</span>
        <span v-for="(p, i) in similar" :key="`sim-${i}`" class="ct-history-chip-text ct-history-chip-text--sim" :title="`${p.text} — similarity ${(p.score * 100).toFixed(0)}% · click to insert into input`" @click="useHistory(p.text)">{{ truncatePrompt(p.text, 60) }} <span class="ct-history-similar-score">{{ (p.score * 100).toFixed(0) }}%</span></span>
      </div>
      <div class="ct-history-rows">
        <div v-for="(p, i) in list" :key="`${p.realIdx}-${i}`" class="ct-history-row">
          <span class="ct-history-idx">{{ s.promptHistory.length - p.realIdx }}</span>
          <span class="ct-history-text" :title="p.text" @click="useHistory(p.text)">
            <template v-for="(seg, si) in highlightSegments(p.text, query)" :key="si">
              <mark v-if="seg.match" class="ct-skill-match">{{ seg.text }}</mark>
              <template v-else>{{ seg.text }}</template>
            </template>
          </span>
          <div class="ct-history-actions">
            <el-button size="small" text :icon="DocumentCopy" @click="copyPrompt(p.text)" />
            <el-button size="small" text :icon="Delete" @click="removePrompt(p.realIdx)" />
          </div>
        </div>
      </div>
      <div v-if="s.promptHistory.length" class="ct-history-footer">
        <el-button size="small" type="danger" text :icon="Delete" @click="confirmClear()">Clear all ({{ s.promptHistory.length }})</el-button>
      </div>
    </div>
  </el-popover>
</template>