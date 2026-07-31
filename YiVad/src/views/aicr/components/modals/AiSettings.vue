<script setup lang="ts" name="aicrAiSettings">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { useAicrModalStore } from "@/stores/modules/aicr/modals";
import { useAicrChatStore } from "@/stores/modules/aicr/chat";
import { useAicrModelStore } from "@/stores/modules/aicr/models";

const DEFAULT_MODEL = "qwen3.5";

const modalStore = useAicrModalStore();
const chatStore = useAicrChatStore();
const modelStore = useAicrModelStore();

const visible = computed({
  get: () => modalStore.settingsVisible,
  set: v => {
    modalStore.settingsVisible = v;
  }
});

function close() {
  visible.value = false;
}

const localModel = ref(DEFAULT_MODEL);

const isDirty = computed(() => localModel.value !== chatStore.model);
const modelListLoading = computed(() => modelStore.loading);
const modelListError = computed(() => modelStore.error);
const canSave = computed(() => isDirty.value && localModel.value.trim() !== "");

watch(visible, v => {
  if (v) {
    localModel.value = chatStore.model || DEFAULT_MODEL;
    if (modelStore.availableModels.length === 0) modelStore.fetchModels();
  }
});

function refreshModels() {
  modelStore.fetchModels();
}

function restoreDefaults() {
  localModel.value = DEFAULT_MODEL;
}

function save() {
  if (!canSave.value) return;
  const model = localModel.value.trim();
  if (!model) {
    ElMessage.warning("Model name cannot be empty");
    return;
  }
  chatStore.model = model;
  ElMessage.success("AI settings saved");
  close();
}
</script>

<template>
  <el-dialog v-model="visible" title="AI Settings" width="480px" :close-on-click-modal="false">
    <el-form label-position="top">
      <el-form-item label="Model">
        <div class="as-model-row">
          <el-select
            v-model="localModel"
            :loading="modelListLoading"
            placeholder="Select model"
            filterable
            allow-create
            default-first-option
            style="width: 260px"
          >
            <el-option
              v-for="m in modelStore.availableModels"
              :key="m.name"
              :label="m.name"
              :value="m.name"
            >
              <span style="float: left">{{ m.name }}</span>
              <span v-if="m.sizeFormatted" class="as-opt-size">{{ m.sizeFormatted }}</span>
            </el-option>
          </el-select>
          <el-tooltip content="Refresh model list" placement="top">
            <el-button :icon="Refresh" circle @click="refreshModels" :loading="modelListLoading" />
          </el-tooltip>
        </div>
        <div v-if="modelListError" class="as-model-err">
          Failed to load models: {{ modelListError }}
          <el-button size="small" text type="primary" @click="refreshModels">Retry</el-button>
        </div>
        <div v-else-if="modelStore.availableModels.length === 0 && !modelListLoading" class="as-model-hint">
          No models loaded — type a name or refresh.
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button text @click="restoreDefaults">Restore Defaults</el-button>
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" :disabled="!canSave" @click="save">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.as-model-row {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.as-opt-size {
  float: right;
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.as-model-err {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-color-danger);
}
.as-model-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
