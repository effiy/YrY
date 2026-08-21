<template>
  <el-tag size="small" type="primary" effect="light" :class="{ 'is-clickable': clickable }" @click="clickable && $emit('open')">{{ label }}</el-tag>
</template>

<script setup lang="ts" name="SkillTag">
import { computed } from "vue";
import { skillLabel } from "../format";

const props = defineProps<{ skill: string; clickable?: boolean }>();
defineEmits<{ open: [] }>();

const label = computed(() => skillLabel(props.skill));
</script>

<style scoped>
.is-clickable { cursor: pointer; }
.is-clickable:hover { opacity: 0.8; }
</style>