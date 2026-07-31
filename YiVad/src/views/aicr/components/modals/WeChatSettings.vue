<script setup lang="ts" name="aicrWeChatSettings">
import { computed, ref, watch } from "vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrWeChatStore, type WeChatRobot } from "@/stores/modules/aicr/weChat";

const modalStore = useAicrModalStore();
const weChatStore = useAicrWeChatStore();

const visible = computed({
  get: () => modalStore.weChatVisible,
  set: v => {
    if (!v) modalStore.toggleWeChat();
  }
});

const draft = ref<WeChatRobot[]>([]);

watch(visible, v => {
  if (v) draft.value = weChatStore.robots.map(r => ({ ...r }));
});

function add() {
  draft.value.push({ name: "New bot", webhook: "", enabled: true, autoForward: false });
}

function remove(idx: number) {
  draft.value.splice(idx, 1);
}

function save() {
  weChatStore.robots.splice(0, weChatStore.robots.length, ...draft.value.map(r => ({ ...r })));
  // Persist via store reactivity — write through to localStorage.
  // weChatStore's addRobot/updateRobot/removeRobot persist; bulk replace needs a direct save.
  localStorage.setItem("aicr_wechat_robots", JSON.stringify(weChatStore.robots));
  modalStore.toggleWeChat();
}
</script>

<template>
  <el-dialog v-model="visible" title="WeChat Robots" width="640px" :close-on-click-modal="false">
    <div class="wc-rows">
      <div v-for="(r, idx) in draft" :key="idx" class="wc-row">
        <el-input v-model="r.name" placeholder="Name" style="width: 120px" />
        <el-input v-model="r.webhook" placeholder="Webhook URL" style="flex: 1" />
        <el-checkbox v-model="r.enabled">Enabled</el-checkbox>
        <el-checkbox v-model="r.autoForward">Auto</el-checkbox>
        <el-button text type="danger" @click="remove(idx)">×</el-button>
      </div>
      <el-button @click="add">+ Add Robot</el-button>
      <p v-if="draft.length === 0" class="wc-empty">No robots configured.</p>
    </div>
    <template #footer>
      <el-button @click="modalStore.toggleWeChat()">Cancel</el-button>
      <el-button type="primary" @click="save">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.wc-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wc-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.wc-empty {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
