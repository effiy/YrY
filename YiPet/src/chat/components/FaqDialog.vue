<script setup lang="ts">
import { computed } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const s = store.state;

const visible = computed<boolean>({
  get: () => s.faqVisible,
  set: (v) => { if (!v) store.toggleFaq(); },
});
</script>

<template>
  <el-dialog
    v-model="visible"
    title="FAQ"
    width="720px"
    top="8vh"
    :z-index="2147483647"
    append-to-body
    :close-on-click-modal="false"
    class="fp-dialog"
  >
    <div class="fp-toolbar">
      <el-input
        v-model="s.faqSearch"
        size="default"
        clearable
        :prefix-icon="Search"
        placeholder="Search title / content / tags"
        class="fp-search"
      />
      <el-tooltip content="Refresh" placement="top">
        <el-button circle size="default" :icon="Refresh" />
      </el-tooltip>
    </div>

    <div class="fp-empty">
      FAQ — port in progress. FAQs will appear here once the backend integration is complete.
    </div>

    <template #footer>
      <div class="fp-footer">
        <el-radio-group v-model="s.faqApplyMode" size="small">
          <el-radio-button value="append">Append to input</el-radio-button>
          <el-radio-button value="insert">Replace input</el-radio-button>
        </el-radio-group>
        <el-button @click="store.toggleFaq()">Close</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
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
.fp-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  line-height: 1.6;
}
.fp-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
</style>

<style lang="scss">
// FAQ dialog must render above the chat window (z-index: 2147483646)
// el-dialog + el-overlay are teleported to body as siblings
.el-overlay:has(+ .fp-dialog),
.fp-dialog {
  z-index: 2147483647 !important;
}
</style>