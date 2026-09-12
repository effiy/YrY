<template>
  <div class="view-switcher">
    <el-radio-group :model-value="modelValue" size="small" @change="handleChange">
      <el-radio-button v-for="v in availableViews" :key="v.key" :value="v.key" :title="v.label">
        <el-icon><component :is="v.icon" /></el-icon>
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { List, Postcard, Grid, Calendar, PictureFilled, Location } from "@element-plus/icons-vue";
import type { ViewType } from "@/hooks/useTableView";

defineProps<{ modelValue: ViewType }>();
const emit = defineEmits<{ "update:modelValue": [value: ViewType] }>();

const handleChange = (val: string | number | boolean | undefined) => emit("update:modelValue", val as ViewType);

const availableViews = [
  { key: "table" as ViewType, label: "Table", icon: List },
  { key: "card" as ViewType, label: "Card", icon: Postcard },
  { key: "kanban" as ViewType, label: "Kanban", icon: Grid },
  { key: "calendar" as ViewType, label: "Calendar", icon: Calendar },
  { key: "gallery" as ViewType, label: "Gallery", icon: PictureFilled },
  { key: "map" as ViewType, label: "Map", icon: Location },
];
</script>