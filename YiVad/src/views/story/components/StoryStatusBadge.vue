<script setup lang="ts" name="storyStatusBadge">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  status: string;
}>();

const { t } = useI18n();

const statusTypeMap: Record<string, "success" | "warning" | "info" | "primary" | "danger" | undefined> = {
  planning: "info",
  design: "warning",
  develop: "primary",
  testing: "danger",
  operations: "success",
  archived: undefined
};

const label = computed(() => {
  const i18nKey = `story.${props.status}`;
  const translated = t(i18nKey);
  return translated !== i18nKey ? translated : props.status;
});

const tagType = computed(() => statusTypeMap[props.status] ?? "info");
</script>

<template>
  <el-tag :type="tagType" size="small">
    {{ label }}
  </el-tag>
</template>
