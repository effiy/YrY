<template>
  <div class="id-card">
    <div class="id-card__head">
      <el-icon class="id-card__icon"><Document /></el-icon>
      <span>Description</span>
      <code v-if="descFilePath" class="id-desc-path" :title="descFilePath" @click.stop="emit('view')">{{ descFilePath }}</code>
      <div class="id-card__head-right">
        <el-button link size="small" type="primary" :icon="FolderOpened" title="Open in file viewer" @click="emit('view')">View</el-button>
        <el-button v-if="descContent" link size="small" type="primary" :icon="Edit" @click="emit('edit')">Edit</el-button>
        <el-button v-else link size="small" type="primary" @click="emit('edit')">Add description</el-button>
      </div>
    </div>
    <div class="id-card__body" :class="{ 'id-card__body--clickable': descContent }" @click="emit('view')">
      <div v-if="descContent" class="id-desc-preview markdown-body" v-html="descHtml" />
      <div v-else class="id-empty">
        <el-icon class="id-empty__icon"><Document /></el-icon>
        <p class="id-empty__text">No description yet</p>
        <p class="id-empty__hint">Add a description to help others understand this issue</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueDescription">
import { Document, Edit, FolderOpened } from "@element-plus/icons-vue";

defineProps<{ descContent: string; descFilePath: string; descHtml: string }>();
const emit = defineEmits<{ (e: "view"): void; (e: "edit"): void }>();
</script>