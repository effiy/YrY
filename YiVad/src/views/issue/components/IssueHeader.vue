<template>
  <div class="id-header">
    <div class="id-header__top">
      <h1 class="id-header__title">{{ issue.title }}</h1>
      <div class="id-header__actions">
        <el-tooltip :content="focusMode ? 'Show sidebar' : 'Focus mode'" placement="bottom">
          <el-button size="small" :icon="focusMode ? Rank : FullScreen" @click="emit('toggleFocus')" />
        </el-tooltip>
        <el-select
          :model-value="issue.status"
          placeholder="Status"
          size="small"
          @change="emit('changeStatus', $event)"
          style="width: 130px"
        >
          <el-option
            v-for="(label, val) in ISSUE_STATUS_MAP"
            :key="val"
            :label="label"
            :value="val"
          />
        </el-select>
        <el-dropdown trigger="click">
          <el-button :icon="MoreFilled" size="small" />
          <template #dropdown>
            <el-dropdown-item :icon="CopyDocument" @click="emit('clone')">Clone</el-dropdown-item>
            <el-dropdown-item :icon="Switch" @click="emit('move')">Move to Project</el-dropdown-item>
            <el-dropdown-item :icon="Delete" divided @click="emit('delete')">Delete</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueHeader">
import { CopyDocument, Delete, FullScreen, MoreFilled, Rank, Switch } from "@element-plus/icons-vue";
import { ISSUE_STATUS_MAP } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";

defineProps<{ issue: Issue; focusMode: boolean }>();
const emit = defineEmits<{
  (e: "toggleFocus"): void;
  (e: "changeStatus", status: string): void;
  (e: "clone"): void;
  (e: "move"): void;
  (e: "delete"): void;
}>();
</script>