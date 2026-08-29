<template>
  <div class="trash">
    <div class="trash__head">
      <div class="trash__head-left">
        <h1 class="trash__title">Trash</h1>
        <el-tag size="small" type="warning">{{ trashedIssues.length }} items</el-tag>
      </div>
      <div class="trash__head-right">
        <el-button text size="small" type="danger" :disabled="!trashedIssues.length" @click="emptyTrash">Empty Trash</el-button>
      </div>
    </div>

    <div v-loading="loading" class="trash__body">
      <el-alert
        v-if="trashedIssues.length"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        Items in trash are automatically deleted after 30 days.
      </el-alert>

      <div v-if="trashedIssues.length" class="trash__list">
        <div v-for="issue in trashedIssues" :key="issue.key" class="trash__item">
          <div class="trash__item-icon" style="background: #909399">
            <el-icon><Delete /></el-icon>
          </div>
          <div class="trash__item-info">
            <span class="trash__item-title">{{ issue.title }}</span>
            <span class="trash__item-meta">
              {{ issue.project_key }} · {{ issue.issue_type }} ·
              Deleted {{ formatDate(issue.updated_at) }}
            </span>
          </div>
          <div class="trash__item-actions">
            <el-button size="small" type="primary" @click="restoreIssue(issue)">Restore</el-button>
            <el-button size="small" type="danger" @click="permanentDelete(issue)">Delete Forever</el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="Trash is empty" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts" name="trashBin">
import { onMounted, ref } from "vue";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getIssueList, updateIssue, deleteIssue } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";

const loading = ref(false);
const trashedIssues = ref<Issue[]>([]);

async function loadTrash() {
  loading.value = true;
  try {
    const res = await getIssueList({ status: "cancelled", pageSize: 200, orderBy: "updated_at", orderType: "desc" });
    trashedIssues.value = (res.data?.list as Issue[]) ?? [];
  } finally { loading.value = false; }
}

async function restoreIssue(issue: Issue) {
  await updateIssue(issue.key, { status: "todo" });
  ElMessage.success(`"${issue.title}" restored`);
  await loadTrash();
}

async function permanentDelete(issue: Issue) {
  try {
    await ElMessageBox.confirm(`Permanently delete "${issue.title}"?`, "Delete Forever", { type: "error" });
    await deleteIssue(issue.key);
    ElMessage.success("Permanently deleted");
    await loadTrash();
  } catch { /* cancelled */ }
}

async function emptyTrash() {
  try {
    await ElMessageBox.confirm("Permanently delete ALL items in trash?", "Empty Trash", { type: "error" });
    for (const issue of trashedIssues.value) {
      try { await deleteIssue(issue.key); } catch { /* continue */ }
    }
    ElMessage.success("Trash emptied");
    await loadTrash();
  } catch { /* cancelled */ }
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

onMounted(() => { loadTrash(); });
</script>

<style scoped lang="scss">
.trash {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.trash__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.trash__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.trash__title { margin: 0; font-size: 20px; font-weight: 600; }
.trash__list {
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.trash__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.trash__item-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.trash__item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.trash__item-title { font-size: 14px; font-weight: 500; }
.trash__item-meta { font-size: 12px; color: var(--el-text-color-placeholder); }
.trash__item-actions { display: flex; gap: 6px; flex-shrink: 0; }
</style>