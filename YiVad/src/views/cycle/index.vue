<template>
  <div class="cycle-list">
    <div class="cycle-list__head">
      <div class="cycle-list__head-left">
        <h1 class="cycle-list__title">Cycles</h1>
        <el-tag size="small" type="info">{{ store.total }} cycles</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">New Cycle</el-button>
    </div>

    <div v-loading="store.loading" class="cycle-list__grid">
      <el-card
        v-for="cycle in store.cycles"
        :key="cycle.key"
        class="cycle-card"
        shadow="hover"
        :class="{ 'cycle-card--active': cycle.status === 'active' }"
        @click="openPlanning(cycle)"
      >
        <div class="cycle-card__status-bar" :style="{ background: statusColor(cycle.status) }" />
        <div class="cycle-card__body">
          <div class="cycle-card__name">{{ cycle.name }}</div>
          <el-tag :type="statusTagType(cycle.status)" size="small">{{ statusLabel(cycle.status) }}</el-tag>
          <div v-if="cycle.goal" class="cycle-card__goal">{{ cycle.goal }}</div>
          <div class="cycle-card__dates">
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(cycle.start_date) }} — {{ formatDate(cycle.end_date) }}</span>
          </div>
          <div class="cycle-card__footer">
            <span>{{ cycle.issue_keys?.length || 0 }} issues</span>
            <el-progress
              v-if="cycle.issue_keys?.length"
              :percentage="progressPct(cycle)"
              :stroke-width="4"
              :show-text="false"
              style="width: 100px"
            />
          </div>
        </div>
      </el-card>

      <div v-if="!store.loading && !store.cycles.length" class="cycle-list__empty">
        <el-empty description="No cycles yet">
          <el-button type="primary" @click="openCreate">Create your first cycle</el-button>
        </el-empty>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Cycle' : 'New Cycle'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="e.g. Sprint 1" maxlength="100" />
        </el-form-item>
        <el-form-item label="Goal">
          <el-input v-model="dialog.form.goal" type="textarea" :rows="2" placeholder="Cycle goal" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Start Date" prop="start_date">
              <el-date-picker v-model="dialog.form.start_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="End Date" prop="end_date">
              <el-date-picker v-model="dialog.form.end_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Status">
          <el-radio-group v-model="dialog.form.status">
            <el-radio v-for="(label, val) in CYCLE_STATUS_MAP" :key="val" :value="val">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!props.projectKey" label="Project" prop="project_key">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>

    <IssuePlanningPanel v-model="planningVisible" :cycle="planningCycle" @closed="store.fetchCycles({ project_key: props.projectKey })" />
  </div>
</template>

<script setup lang="ts" name="cycleList">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Calendar } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useCycleStore } from "@/stores/modules/cycle";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import type { Cycle, CycleStatus } from "@/api/modules/cycleService";
import IssuePlanningPanel from "./components/IssuePlanningPanel.vue";

const props = defineProps<{ projectKey?: string }>();

const router = useRouter();
const store = useCycleStore();
const formRef = ref<FormInstance>();

const planningVisible = ref(false);
const planningCycle = ref<Cycle | null>(null);

const rules: FormRules = {
  name: [{ required: true, message: "Cycle name is required", trigger: "blur" }],
  start_date: [{ required: true, message: "Start date is required", trigger: "change" }],
  end_date: [{ required: true, message: "End date is required", trigger: "change" }]
};

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "upcoming" as CycleStatus,
    project_key: props.projectKey || "",
    issue_keys: [] as string[]
  }
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = {
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "upcoming",
    project_key: props.projectKey || "",
    issue_keys: []
  };
  dialog.visible = true;
}

function openEdit(cycle: Cycle) {
  dialog.isEdit = true;
  dialog.editKey = cycle.key;
  dialog.form = {
    name: cycle.name,
    goal: cycle.goal || "",
    start_date: cycle.start_date,
    end_date: cycle.end_date,
    status: cycle.status,
    project_key: cycle.project_key,
    issue_keys: cycle.issue_keys || []
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editCycle(dialog.editKey, {
        name: dialog.form.name,
        goal: dialog.form.goal,
        start_date: dialog.form.start_date,
        end_date: dialog.form.end_date,
        status: dialog.form.status
      });
      ElMessage.success("Cycle updated");
    } else {
      const key = `CYC-${Date.now().toString(36).toUpperCase()}`;
      await store.addCycle({
        key,
        project_key: dialog.form.project_key || props.projectKey || "",
        name: dialog.form.name,
        goal: dialog.form.goal,
        start_date: dialog.form.start_date,
        end_date: dialog.form.end_date,
        status: dialog.form.status,
        issue_keys: []
      });
      ElMessage.success("Cycle created");
    }
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

function openPlanning(cycle: Cycle) {
  planningCycle.value = cycle;
  planningVisible.value = true;
}

function statusLabel(s: CycleStatus) { return CYCLE_STATUS_MAP[s] || s; }
function statusTagType(s: CycleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<CycleStatus, "success" | "warning" | "info" | "primary" | "danger"> = { upcoming: "info", active: "primary", completed: "success" };
  return m[s] || "info";
}
function statusColor(s: CycleStatus) {
  const m: Record<CycleStatus, string> = { upcoming: "#909399", active: "#409eff", completed: "#67c23a" };
  return m[s] || "#909399";
}
function progressPct(cycle: Cycle) {
  const total = cycle.issue_keys?.length || 0;
  if (!total) return 0;
  // placeholder — actual progress calculation would need issue status data
  return cycle.status === "completed" ? 100 : cycle.status === "active" ? 30 : 0;
}
function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

onMounted(() => {
  store.fetchCycles({ project_key: props.projectKey });
});
</script>

<style scoped lang="scss">
.cycle-list {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.cycle-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.cycle-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cycle-list__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.cycle-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.cycle-card {
  cursor: pointer;
  overflow: hidden;
  :deep(.el-card__body) { padding: 0; }
  &:hover { transform: translateY(-2px); transition: transform 0.15s; }
}
.cycle-card--active {
  border-color: var(--el-color-primary);
}
.cycle-card__status-bar {
  height: 3px;
}
.cycle-card__body {
  padding: 16px;
}
.cycle-card__name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.cycle-card__goal {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cycle-card__dates {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.cycle-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.cycle-list__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>