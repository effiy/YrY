<script setup lang="ts" name="aicrCodeViewer">
import { computed } from "vue";
import { useAicrFileTreeStore } from "@/stores/modules/aicr/fileTree";
import { useAicrSessionStore } from "@/stores/modules/aicr/sessions";

const fileTreeStore = useAicrFileTreeStore();
const sessionStore = useAicrSessionStore();

const selectedFileName = computed(() => {
  const key = fileTreeStore.selectedKey;
  if (!key) return null;
  return key.split("/").pop() || key;
});

const contentLines = computed(() => {
  const c = fileTreeStore.currentFileContent;
  return c ? c.split("\n") : [];
});

function handleCreateSession() {
  if (!fileTreeStore.selectedKey) return;
  sessionStore.createSession({
    key: `session_${Date.now()}`,
    title: selectedFileName.value || "Untitled",
    file_path: fileTreeStore.selectedKey,
    pageDescription: `File: ${fileTreeStore.selectedKey}`
  });
}
</script>

<template>
  <div class="aicr-code-viewer">
    <div v-if="!fileTreeStore.selectedKey" class="cv-empty">
      <el-empty description="Select a file from the tree" />
    </div>
    <div v-else-if="fileTreeStore.fileLoading" class="cv-loading">
      <el-skeleton :rows="8" animated />
    </div>
    <div v-else class="cv-content">
      <div class="cv-header">
        <span class="cv-file-name">{{ selectedFileName }}</span>
        <span class="cv-file-path">{{ fileTreeStore.selectedKey }}</span>
        <el-button size="small" type="primary" @click="handleCreateSession">Create Session</el-button>
      </div>
      <div class="cv-code">
        <pre><code><span v-for="(line, idx) in contentLines" :key="idx" class="cv-line"><span class="cv-line-num">{{ idx + 1 }}</span>{{ line }}\n</span></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aicr-code-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cv-empty,
.cv-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.cv-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cv-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}
.cv-file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.cv-file-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cv-code {
  flex: 1;
  overflow: auto;
  background: var(--el-fill-color-lighter);
}
.cv-code pre {
  margin: 0;
  padding: 12px;
  font-family: "SF Mono", "Menlo", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.6;
  min-height: 100%;
}
.cv-code code {
  color: var(--el-text-color-primary);
}
.cv-line {
  display: block;
}
.cv-line:hover {
  background: var(--el-fill-color-light);
}
.cv-line-num {
  display: inline-block;
  width: 40px;
  text-align: right;
  margin-right: 16px;
  color: var(--el-text-color-placeholder);
  user-select: none;
}
</style>
