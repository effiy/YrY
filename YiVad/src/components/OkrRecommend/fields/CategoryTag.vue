<template>
  <el-tag size="small" effect="light" round :type="tagType">{{ icon }} {{ label }}</el-tag>
</template>

<script setup lang="ts" name="CategoryTag">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { categoryTagType, categoryIcon } from "../format";
import type { OkrListType } from "../okrRecommend";

const { t } = useI18n();
const props = defineProps<{ listType: OkrListType }>();

const tagType = computed(() => categoryTagType(props.listType));
const icon = computed(() => categoryIcon(props.listType));
const label = computed(() => t(`home.aiRecommend.lists.${props.listType}`));
</script>
