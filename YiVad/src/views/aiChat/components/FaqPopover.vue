<script setup lang="ts" name="aiChatFaqPopover">
import { computed, ref, watch } from "vue";
import { Search, Refresh, Close } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import type { FaqDocument } from "@/api/interface/yiweb";

const store = useAiChatStore();

const visible = computed<boolean>({
  get: () => store.faqVisible,
  set: v => {
    if (!v) store.closeFaq();
  }
});

const filtered = computed<FaqDocument[]>(() => {
  const q = store.faqSearch.trim().toLowerCase();
  if (!q) return store.faqs;
  return store.faqs.filter(f => {
    const title = (f.title || "").toLowerCase();
    const prompt = (f.prompt || "").toLowerCase();
    const tags = (f.tags || []).join(" ").toLowerCase();
    return title.includes(q) || prompt.includes(q) || tags.includes(q);
  });
});

const activeIndex = ref(-1);
watch(
  () => [filtered.value.length, store.faqSearch] as const,
  () => {
    activeIndex.value = filtered.value.length ? 0 : -1;
  },
  { immediate: true }
);

function isActive(idx: number): boolean {
  return idx === activeIndex.value;
}

function pick(item: FaqDocument | undefined) {
  if (!item) return;
  store.applyFaq(item);
}

function sendNow(item: FaqDocument) {
  store.sendMessage(item.prompt);
  store.closeFaq();
}

function copyPrompt(item: FaqDocument) {
  if (!item.prompt) return;
  navigator.clipboard.writeText(item.prompt).catch(() => {});
}

function onTableKeydown(e: Event | KeyboardEvent) {
  if (!(e instanceof KeyboardEvent)) return;
  const n = filtered.value.length;
  if (!n) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % n;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + n) % n;
  } else if (e.key === "Enter") {
    e.preventDefault();
    pick(filtered.value[activeIndex.value]);
  } else if (e.key === "Escape") {
    e.preventDefault();
    store.closeFaq();
  }
}

function rowClasses({ rowIndex }: { row: FaqDocument; rowIndex: number }) {
  return rowIndex === activeIndex.value ? "is-active" : "";
}
</script>

<template>
  <el-dialog v-model="visible" title="FAQ" width="720px" top="8vh" append-to-body :close-on-click-modal="false" class="fp-dialog">
    <div class="fp-toolbar">
      <el-input
        v-model="store.faqSearch"
        size="default"
        clearable
        :prefix-icon="Search"
        placeholder="Search title / content / tags"
        class="fp-search"
        @keydown="onTableKeydown"
      />
      <el-tooltip content="Refresh" placement="top">
        <el-button circle size="default" :icon="Refresh" :loading="store.faqLoading" @click="store.loadFaqs(true)" />
      </el-tooltip>
    </div>

    <el-table
      :data="filtered"
      size="small"
      max-height="380"
      highlight-current-row
      :row-class-name="rowClasses"
      @keydown="onTableKeydown"
      empty-text="No FAQs yet — create them in YiWeb aicr first"
      class="fp-table"
    >
      <el-table-column label="#" width="48" type="index" />
      <el-table-column label="Title" min-width="140">
        <template #default="{ row }">
          <div class="fp-title">{{ row.title || "—" }}</div>
          <div v-if="row.tags?.length" class="fp-tags-cell">
            <el-tag v-for="t in row.tags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Content" min-width="260">
        <template #default="{ row }">
          <div class="fp-prompt">{{ row.prompt }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="220" align="right">
        <template #default="{ row, $index }">
          <el-button size="small" text @click="copyPrompt(row as FaqDocument)">Copy</el-button>
          <el-button size="small" text type="primary" @click="pick(row as FaqDocument)">Apply</el-button>
          <el-button size="small" text type="success" @click="sendNow(row as FaqDocument)">Send now</el-button>
          <el-button v-show="isActive($index)" size="small" text :icon="Close" class="fp-row-close" @click="store.closeFaq()" />
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="fp-footer">
        <el-radio-group v-model="store.faqApplyMode" size="small">
          <el-radio-button value="append">Append to input</el-radio-button>
          <el-radio-button value="insert">Replace input</el-radio-button>
        </el-radio-group>
        <div class="fp-footer-right">
          <span class="fp-hint">↑↓ select · Enter apply · Esc close</span>
          <el-button @click="store.closeFaq()">Close</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.fp-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
  padding-bottom: 4px;
}
.fp-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.fp-search {
  flex: 1;
}
.fp-table {
  :deep(.el-table__row) {
    cursor: pointer;
  }
  :deep(.el-table__row.is-active) {
    background: var(--el-fill-color-light);
  }
}
.fp-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.fp-tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.fp-prompt {
  max-height: 60px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.fp-row-close {
  margin-left: 4px;
}
.fp-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.fp-footer-right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.fp-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
