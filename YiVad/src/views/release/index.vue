<template>
  <div class="releases">
    <div class="releases__head">
      <div class="releases__head-left">
        <h1 class="releases__title">Releases</h1>
        <el-tag size="small" type="info">{{ store.total }} releases</el-tag>
      </div>
      <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 200px; margin-right: 10px" @change="loadData">
        <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
      </el-select>
      <el-button type="primary" :icon="Plus" @click="openCreate">New Release</el-button>
    </div>

    <div v-loading="store.loading" class="releases__body">
      <div v-if="store.releases.length" class="releases__list">
        <div v-for="r in store.releases" :key="r.key" class="release-card" @click="goDetail(r.key)">
          <div class="release-card__status-bar" :style="{ background: statusColor(r.status) }" />
          <div class="release-card__body">
            <div class="release-card__top">
              <span class="release-card__version">{{ r.version }}</span>
              <el-tag :type="statusTagType(r.status)" size="small">{{ statusLabel(r.status) }}</el-tag>
            </div>
            <div class="release-card__name">{{ r.name }}</div>
            <div v-if="r.notes" class="release-card__notes">{{ r.notes }}</div>
            <div class="release-card__meta">
              <span>{{ r.issue_keys?.length || 0 }} issues</span>
              <span v-if="r.release_date">Released: {{ formatDate(r.release_date) }}</span>
              <span v-else>Target: {{ formatDate(r.target_date || '') }}</span>
            </div>
            <el-progress
              v-if="r.issue_keys?.length"
              :percentage="r.status === 'released' ? 100 : progressPct(r)"
              :stroke-width="4"
              :show-text="false"
              style="margin-top: 8px"
            />
          </div>
          <div class="release-card__actions">
            <el-button size="small" :icon="Edit" @click="openEdit(r)" />
            <el-button size="small" :icon="Delete" @click="handleDelete(r)" />
          </div>
        </div>
      </div>
      <el-empty v-else description="No releases yet" :image-size="60">
        <el-button type="primary" @click="openCreate">Create your first release</el-button>
      </el-empty>
    </div>

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Release' : 'New Release'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Version" prop="version">
          <el-input v-model="dialog.form.version" placeholder="e.g. v1.2.0" maxlength="30" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Release name" maxlength="100" />
        </el-form-item>
        <el-form-item label="Notes">
          <el-input v-model="dialog.form.notes" type="textarea" :rows="3" placeholder="Release notes (Markdown)" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in RELEASE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Target Date">
              <el-date-picker v-model="dialog.form.target_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!projectFilter" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="releaseManagement">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useReleaseStore } from "@/stores/modules/release";
import { formatDate } from "@/utils/datetime";
import { useProjectStore } from "@/stores/modules/project";
import { RELEASE_STATUS_MAP } from "@/api/modules/releaseService";
import type { ReleaseStatus, Release } from "@/api/modules/releaseService";

const store = useReleaseStore();
const projectStore = useProjectStore();
const router = useRouter();

const projectFilter = ref("");
const formRef = ref<FormInstance>();
const projects = ref<{ key: string; name: string }[]>([]);

const rules: FormRules = {
  version: [{ required: true, message: "Version is required", trigger: "blur" }],
  name: [{ required: true, message: "Name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    version: "", name: "", notes: "", status: "planned" as ReleaseStatus,
    target_date: "", project_key: "", issue_keys: [] as string[]
  }
});

async function loadData() {
  await store.fetchReleases({ project_key: projectFilter.value || undefined, pageSize: 100 });
}

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { version: "", name: "", notes: "", status: "planned" as ReleaseStatus, target_date: "", project_key: projectFilter.value || "", issue_keys: [] };
  dialog.visible = true;
}

function openEdit(r: any) {
  dialog.isEdit = true; dialog.editKey = r.key;
  dialog.form = { version: r.version, name: r.name, notes: r.notes || "", status: r.status, target_date: r.target_date || "", project_key: r.project_key, issue_keys: r.issue_keys || [] };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const data = {
      version: dialog.form.version, name: dialog.form.name,
      notes: dialog.form.notes, status: dialog.form.status,
      target_date: dialog.form.target_date,
      project_key: dialog.form.project_key || projectFilter.value || "",
      issue_keys: dialog.form.issue_keys
    };
    if (dialog.isEdit) {
      await store.editRelease(dialog.editKey, data);
      ElMessage.success("Release updated");
    } else {
      const key = `REL-${Date.now().toString(36).toUpperCase()}`;
      await store.addRelease({ key, ...data });
      ElMessage.success("Release created");
    }
    dialog.visible = false;
  } finally { dialog.submitting = false; }
}

async function handleDelete(r: any) {
  try {
    await ElMessageBox.confirm(`Delete release "${r.version}"?`, "Delete", { type: "error" });
    await store.removeRelease(r.key, projectFilter.value || undefined);
    ElMessage.success("Release deleted");
  } catch { /* cancelled */ }
}

function statusLabel(s: ReleaseStatus) { return RELEASE_STATUS_MAP[s] || s; }
function statusColor(s: ReleaseStatus) { const m: Record<ReleaseStatus, string> = { planned: "#909399", in_progress: "#409eff", released: "#67c23a" }; return m[s] || "#909399"; }
function statusTagType(s: ReleaseStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<ReleaseStatus, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", released: "success" };
  return m[s] || "info";
}
function progressPct(r: Release) { return r.status === "in_progress" ? 50 : 0; }
function goDetail(key: string) { router.push(`/release/${key}`); }
onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects({ pageSize: 100 }),
    store.fetchReleases({ project_key: projectFilter.value || undefined, pageSize: 100 })
  ]);
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
});
</script>

<style scoped lang="scss">
.releases {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.releases__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.releases__head-left { display: flex; align-items: center; gap: 12px; }
.releases__title { margin: 0; font-size: 20px; font-weight: 600; }
.releases__list { max-width: 600px; display: flex; flex-direction: column; gap: 8px; }
.release-card {
  display: flex; overflow: hidden; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter); border-radius: 8px; cursor: pointer;
  &:hover { border-color: var(--el-color-primary-light-5); }
}
.release-card__status-bar { width: 3px; flex-shrink: 0; }
.release-card__body { flex: 1; padding: 14px 16px; }
.release-card__top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.release-card__version { font-size: 14px; font-weight: 700; font-family: monospace; }
.release-card__name { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
.release-card__notes { font-size: 12px; color: var(--el-text-color-secondary); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 6px; }
.release-card__meta { display: flex; gap: 12px; font-size: 12px; color: var(--el-text-color-placeholder); }
.release-card__actions { display: flex; gap: 4px; padding: 14px 8px; flex-shrink: 0; }
</style>