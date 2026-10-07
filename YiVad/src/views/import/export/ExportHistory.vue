<template>
  <div class="export-history-page page">
    <PageHeaderCard
      :icon="Download"
      icon-bg="linear-gradient(135deg, #67c23a, #059669)"
      :title="$t('common.export.title')"
      description="View and download past exports"
    >
      <template #title-tags>
        <el-button type="primary" size="small" :icon="Plus" @click="$router.push('/export/wizard')">{{ $t("common.export.title") }}</el-button>
      </template>
    </PageHeaderCard>

    <el-card shadow="never">
      <el-table :data="tasks" v-loading="loading" stripe empty-text="No exports yet">
        <el-table-column prop="file_name" :label="$t('common.export.title')" min-width="200" />
        <el-table-column prop="cname" label="Collection" width="140" />
        <el-table-column prop="format" :label="$t('common.export.encoding')" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.format?.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="row_count" :label="$t('common.rows')" width="80" />
        <el-table-column prop="status" :label="$t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="$t('common.createTime')" width="160">
          <template #default="{ row }">{{ row.created_at?.slice(0, 16)?.replace("T", " ") }}</template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" width="100">
          <template #default="{ row }">
            <el-button v-if="row.status === 'completed'" link type="primary" size="small" @click="downloadExport(row as any)">
              {{ $t("common.download") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="exportHistory">
import { ref, onMounted } from "vue";
import { Plus, Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { listExportHistory, getExportStatus } from "@/api/modules/exportService";
import type { ExportTask } from "@/types/analytics";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";

const loading = ref(false);
const tasks = ref<ExportTask[]>([]);

async function fetchHistory() {
  loading.value = true;
  try {
    const res = await listExportHistory({ limit: 50 });
    if (res.code === 0) tasks.value = res.data.tasks;
  } finally {
    loading.value = false;
  }
}

async function downloadExport(task: ExportTask) {
  if (task.file_content) {
    const blob = new Blob([task.file_content], { type: task.format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = task.file_name ?? "export";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  const res = await getExportStatus(task.task_id);
  if (res.code === 0 && res.data.file_content) {
    task.file_content = res.data.file_content;
    downloadExport(task);
  } else {
    ElMessage.warning("File content no longer available");
  }
}

onMounted(() => fetchHistory());
</script>

<style scoped lang="scss">
.export-history-page {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  h1 { margin: 0 0 4px; font-size: 22px; }
}
.text-muted {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>