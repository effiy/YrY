<script setup lang="ts">
import { ref, computed } from "vue";
import type { UploadUserFile } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import FilePreview from "./FilePreview.vue";

interface FileItem {
  uid: string;
  name: string;
  url: string;
  size: number;
  type: string;
  tags: string[];
  uploadDate: string;
}

const props = withDefaults(defineProps<{
  files: FileItem[];
  viewMode?: "card" | "list";
  selectable?: boolean;
}>(), {
  viewMode: "card",
  selectable: false,
});

const emit = defineEmits<{
  (e: "delete", file: FileItem): void;
  (e: "rename", file: FileItem, newName: string): void;
  (e: "download", file: FileItem): void;
  (e: "tag-add", file: FileItem, tag: string): void;
  (e: "tag-remove", file: FileItem, tag: string): void;
}>();

const previewVisible = ref(false);
const previewFile = ref<FileItem | null>(null);
const selectedIds = ref<Set<string>>(new Set());
const searchQuery = ref("");

const filteredFiles = computed(() => {
  if (!searchQuery.value) return props.files;
  const q = searchQuery.value.toLowerCase();
  return props.files.filter((f) => f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)));
});

function openPreview(file: FileItem) {
  previewFile.value = file;
  previewVisible.value = true;
}

function toggleSelect(uid: string) {
  const next = new Set(selectedIds.value);
  if (next.has(uid)) next.delete(uid);
  else next.add(uid);
  selectedIds.value = next;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="file-manager">
    <!-- Toolbar -->
    <div class="file-manager__toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文件..."
        :prefix-icon="Search"
        clearable
        style="width: 240px"
      />
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button value="card">
          <el-icon><Grid /></el-icon>
        </el-radio-button>
        <el-radio-button value="list">
          <el-icon><List /></el-icon>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- Card view -->
    <div v-if="viewMode === 'card'" class="file-manager__grid">
      <div
        v-for="file in filteredFiles"
        :key="file.uid"
        class="file-manager__card"
        :class="{ selected: selectable && selectedIds.has(file.uid) }"
        @click="selectable && toggleSelect(file.uid)"
      >
        <div class="file-manager__card-preview" @dblclick="openPreview(file)">
          <img v-if="file.type?.startsWith('image/')" :src="file.url" :alt="file.name" />
          <el-icon v-else :size="40"><Document /></el-icon>
        </div>
        <div class="file-manager__card-info">
          <span class="file-manager__card-name" :title="file.name">{{ file.name }}</span>
          <span class="file-manager__card-size">{{ formatSize(file.size) }}</span>
        </div>
        <div class="file-manager__card-actions">
          <el-button text size="small" @click.stop="emit('download', file)">下载</el-button>
          <el-button text size="small" type="danger" @click.stop="emit('delete', file)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- List view -->
    <el-table v-else :data="filteredFiles" style="width: 100%">
      <el-table-column v-if="selectable" width="40">
        <template #default="{ row }">
          <el-checkbox :model-value="selectedIds.has(row.uid)" @change="toggleSelect(row.uid)" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="文件名" min-width="200" />
      <el-table-column label="大小" width="100">
        <template #default="{ row }">{{ formatSize(row.size) }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="uploadDate" label="上传日期" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" @click="openPreview(row as FileItem)">预览</el-button>
          <el-button text size="small" @click="emit('download', row as FileItem)">下载</el-button>
          <el-button text size="small" type="danger" @click="emit('delete', row as FileItem)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="filteredFiles.length === 0" description="暂无文件" />

    <!-- Preview dialog -->
    <FilePreview
      v-if="previewFile"
      :visible="previewVisible"
      :url="previewFile.url"
      :file-name="previewFile.name"
      :file-type="previewFile.type"
      @update:visible="previewVisible = $event"
    />
  </div>
</template>

<style scoped lang="scss">
.file-manager {
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  &__card {
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.2s;

    &:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
    &.selected { border-color: var(--el-color-primary); }
  }

  &__card-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 140px;
    background: var(--el-fill-color-light);
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__card-info {
    padding: 8px 10px 4px;
  }

  &__card-name {
    display: block;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-size {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__card-actions {
    display: flex;
    justify-content: space-between;
    padding: 4px 6px 8px;
  }
}
</style>