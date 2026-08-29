<script setup lang="ts" name="aiChatWeChatSettingsDialog">
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { loadRobots, saveRobots, sendWeChatMessage, type WeChatRobot } from "@/api/modules/weChatService";

const store = useAiChatStore();

const visible = computed(() => store.weChatVisible);
const draft = ref<WeChatRobot[]>([]);
const saving = ref(false);
const sendingIdx = ref<number | null>(null);
const testContent = ref("");

watch(visible, v => {
  if (v) {
    draft.value = loadRobots().map(r => ({ ...r }));
    testContent.value = "";
  }
});

function onClose() {
  store.closeWeChat();
}

function add() {
  draft.value.push({ name: `Bot ${draft.value.length + 1}`, webhook: "", enabled: true, autoForward: false });
}

async function remove(idx: number) {
  const r = draft.value[idx];
  const label = r.name || `#${idx + 1}`;
  try {
    await ElMessageBox.confirm(`Delete bot "${label}"?`, "Notice", {
      type: "warning",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      center: false
    });
  } catch {
    return;
  }
  draft.value.splice(idx, 1);
}

async function save() {
  const invalid = draft.value.find(r => r.enabled && !r.webhook.trim());
  if (invalid) {
    ElMessage.warning(`Bot "${invalid.name || "Untitled"}" is enabled but has no webhook`);
    return;
  }
  saving.value = true;
  try {
    saveRobots(draft.value);
    ElMessage.success("Saved");
    store.closeWeChat();
  } finally {
    saving.value = false;
  }
}

async function sendTest(idx: number) {
  const r = draft.value[idx];
  if (!r?.webhook) {
    ElMessage.warning("Please fill in the webhook first");
    return;
  }
  const content = testContent.value.trim() || `[${r.name || "Test"}] This is a WeCom bot test message from aiChat`;
  sendingIdx.value = idx;
  try {
    await sendWeChatMessage(r.webhook, content);
    ElMessage.success("Sent");
  } catch (e: any) {
    ElMessage.error(e?.message || "Send failed");
  } finally {
    sendingIdx.value = null;
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="WeCom bot settings"
    width="680px"
    top="8vh"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @update:model-value="v => !v && onClose()"
  >
    <div class="wc-head">
      <span class="wc-hint"
        >After configuring multiple bots, AI replies will be auto-forwarded to all "enabled + auto-forward" bots</span
      >
    </div>
    <div class="wc-rows">
      <div v-for="(r, idx) in draft" :key="idx" class="wc-row">
        <el-input v-model="r.name" placeholder="Bot name" size="default" class="wc-name" />
        <el-input
          v-model="r.webhook"
          placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
          size="default"
          class="wc-webhook"
        />
        <el-checkbox v-model="r.enabled">Enabled</el-checkbox>
        <el-checkbox v-model="r.autoForward">Auto-forward</el-checkbox>
        <el-button text type="danger" :icon="Delete" @click="remove(idx)" />
      </div>
      <div v-if="!draft.length" class="wc-empty">
        <span>No bots configured yet</span>
      </div>
      <el-button :icon="Plus" plain @click="add">Add bot</el-button>
    </div>
    <el-divider content-position="left">
      <span class="wc-divider">Test send</span>
    </el-divider>
    <div class="wc-test">
      <el-input
        v-model="testContent"
        placeholder="Test message content (leave empty to send default text)"
        clearable
        class="wc-test-input"
      />
      <div class="wc-test-buttons">
        <el-button
          v-for="(r, idx) in draft"
          :key="`test-${idx}`"
          :disabled="!r.webhook"
          :loading="sendingIdx === idx"
          size="small"
          @click="sendTest(idx)"
        >
          Send to "{{ r.name || `#${idx + 1}` }}"
        </el-button>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">Cancel</el-button>
      <el-button type="primary" :loading="saving" @click="save">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.wc-head {
  margin-bottom: 12px;
}
.wc-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.wc-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  padding: 2px;
  overflow-y: auto;
}
.wc-row {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.wc-name {
  flex-shrink: 0;
  width: 130px;
}
.wc-webhook {
  flex: 1;
  min-width: 0;
  :deep(input) {
    font-family: var(--el-font-family-mono, monospace);
    font-size: 12px;
  }
}
.wc-empty {
  display: flex;
  justify-content: center;
  padding: 16px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
.wc-divider {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.wc-test {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wc-test-input {
  width: 100%;
}
.wc-test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
