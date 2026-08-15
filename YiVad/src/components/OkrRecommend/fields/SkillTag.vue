<template>
  <el-tag size="small" type="primary" effect="light">{{ label }}</el-tag>
</template>

<script setup lang="ts" name="SkillTag">
import { computed } from "vue";
import { skillLabel } from "../format";

const props = defineProps<{ skill: string }>();

const label = computed(() => skillLabel(props.skill));
</script>
