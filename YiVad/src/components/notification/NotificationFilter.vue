<template>
  <div class="notif-filter">
    <el-radio-group v-model="model" size="small">
      <el-radio-button value="all">
        全部
        <span class="notif-filter__count">({{ counts.all ?? 0 }})</span>
      </el-radio-button>
      <el-radio-button value="system">
        系统
        <span class="notif-filter__count">({{ counts.system ?? 0 }})</span>
      </el-radio-button>
      <el-radio-button value="user_action">
        协作
        <span class="notif-filter__count">({{ counts.user_action ?? 0 }})</span>
      </el-radio-button>
      <el-radio-button value="ai">
        AI
        <span class="notif-filter__count">({{ counts.ai ?? 0 }})</span>
      </el-radio-button>
      <el-radio-button value="error">
        告警
        <span class="notif-filter__count">({{ counts.error ?? 0 }})</span>
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { NotificationType } from "@/stores/modules/notification";

const props = defineProps<{
  modelValue: NotificationType | "all";
  counts: Record<string, number>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: NotificationType | "all"];
}>();

const model = computed({
  get: () => props.modelValue,
  set: (v: NotificationType | "all") => emit("update:modelValue", v),
});
</script>

<style scoped lang="scss">
.notif-filter {
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  :deep(.el-radio-button__inner) {
    padding: 4px 10px;
    font-size: 12px;
  }
}

.notif-filter__count {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 2px;
}
</style>