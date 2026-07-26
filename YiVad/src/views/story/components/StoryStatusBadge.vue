<script setup lang="ts" name="storyStatusBadge">
defineProps<{
  status: string;
}>();

const statusMap: Record<string, { label: string; type: "success" | "warning" | "info" | "danger" | "primary" }> = {
  planning: { label: "规划", type: "info" },
  design: { label: "设计", type: "warning" },
  develop: { label: "开发", type: "primary" },
  testing: { label: "测试", type: "danger" },
  operations: { label: "运营", type: "success" },
  unknown: { label: "未知", type: "info" }
};
</script>

<template>
  <el-tag :type="statusMap[status]?.type ?? 'info'" size="small">
    {{ statusMap[status]?.label ?? status }}
  </el-tag>
</template>
