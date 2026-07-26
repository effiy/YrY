<script setup lang="ts" name="cardListToggle">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  modelValue: "cards" | "list";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: "cards" | "list"): void;
}>();

const { t } = useI18n();

const localValue = computed({
  get: () => props.modelValue,
  set: (val: "cards" | "list") => emit("update:modelValue", val)
});

const options = computed(() => [
  { label: t("story.cards"), value: "cards" as const },
  { label: t("story.list"), value: "list" as const }
]);
</script>

<template>
  <el-segmented v-model="localValue" :options="options" />
</template>
