<template>
  <div class="label-mgmt">
    <div class="label-mgmt__head">
      <div class="label-mgmt__head-left">
        <h1 class="label-mgmt__title">Labels</h1>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
      </div>
      <div class="label-mgmt__head-actions">
        <el-input
          v-model="searchText"
          class="label-mgmt__search"
          size="small"
          clearable
          placeholder="Search labels…"
          :prefix-icon="Search"
        />
        <el-select v-model="sortBy" class="label-mgmt__sort" size="small">
          <el-option label="Name" value="name" />
          <el-option label="Most used" value="usage" />
        </el-select>
        <el-button type="primary" :icon="Plus" @click="openCreate">New Label</el-button>
      </div>
    </div>

    <div class="label-mgmt__summary">
      <div class="label-summary__tile label-summary__tile--clickable" @click="clearUsage">
        <span class="label-summary__value">{{ labels.length }}</span>
        <span class="label-summary__label">Labels</span>
        <span class="label-summary__sub">{{ inUseCount }} of {{ labels.length }} used</span>
      </div>
      <div class="label-summary__tile label-summary__tile--used label-summary__tile--clickable" :class="{ 'label-summary__tile--active': usageFilter === 'used' }" @click="toggleUsage('used')">
        <span class="label-summary__value">{{ inUseCount }}</span>
        <span class="label-summary__label">In Use</span>
        <span class="label-summary__sub">{{ pctLabel(inUseCount) }}</span>
      </div>
      <div class="label-summary__tile label-summary__tile--unused label-summary__tile--clickable" :class="{ 'label-summary__tile--active': usageFilter === 'unused' }" @click="toggleUsage('unused')">
        <span class="label-summary__value">{{ unusedCount }}</span>
        <span class="label-summary__label">Unused</span>
        <span class="label-summary__sub">{{ pctLabel(unusedCount) }}</span>
      </div>
      <div class="label-summary__tile label-summary__tile--tagged label-summary__tile--clickable" @click="goIssues">
        <span class="label-summary__value">{{ totalTaggings }}</span>
        <span class="label-summary__label">Issue Tagged</span>
        <span class="label-summary__sub">across {{ inUseCount }} labels</span>
      </div>
    </div>

    <div v-loading="loading" class="label-mgmt__body">
      <div v-if="displayedLabels.length" class="label-mgmt__grid">
        <div
          v-for="label in displayedLabels"
          :key="label.key"
          class="label-card"
          :style="{ borderLeftColor: label.color }"
          :class="{ 'label-card--unused': usage(label) === 0 }"
        >
          <div class="label-card__body">
            <div class="label-card__head">
              <el-tag :color="label.color" effect="dark" round size="large" class="label-card__chip" style="cursor:pointer" title="View issues with this label" @click="goLabel(label.name)">
                {{ label.name }}
              </el-tag>
              <span class="label-card__usage">{{ usageText(label) }}</span>
            </div>
            <div v-if="label.description" class="label-card__desc">{{ label.description }}</div>
            <div class="label-card__hex" @click="copyColor(label)">{{ label.color }}</div>
            <span class="label-card__updated">Updated {{ formatRelativeTime(label.updated_at) }}</span>
          </div>
          <div class="label-card__actions">
            <el-button link :icon="View" size="small" title="View issues with this label" @click="goLabel(label.name)" />
            <el-button link :icon="CopyDocument" size="small" @click="copyColor(label)" />
            <el-button link :icon="Edit" size="small" @click="openEdit(label)" />
            <el-button link :icon="Delete" size="small" @click="handleDelete(label)" />
          </div>
        </div>
      </div>
      <el-empty v-else-if="!loading && !displayedLabels.length && labels.length" description="No matching labels" :image-size="60" />
      <el-empty v-else-if="!loading" description="No labels yet" :image-size="60">
        <el-button type="primary" @click="openCreate">Create your first label</el-button>
      </el-empty>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Label' : 'New Label'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Label name" maxlength="30" />
        </el-form-item>
        <el-form-item label="Color" prop="color">
          <div class="label-mgmt__color-pick">
            <el-color-picker v-model="dialog.form.color" show-alpha />
            <el-input v-model="dialog.form.color" placeholder="#hex" size="small" style="width: 120px" />
          </div>
          <div class="label-mgmt__presets">
            <span
              v-for="c in presetColors"
              :key="c"
              class="label-mgmt__preset"
              :class="{ 'label-mgmt__preset--active': dialog.form.color === c }"
              :style="{ background: c }"
              @click="dialog.form.color = c"
            />
          </div>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="dialog.form.description" placeholder="Optional description" maxlength="100" />
        </el-form-item>
        <el-form-item label="Preview">
          <el-tag :color="dialog.form.color" effect="dark" size="large" round>
            {{ dialog.form.name || 'Label' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="labelManagement">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Plus, Edit, Delete, Search, CopyDocument, View } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";
import type { Label } from "@/api/modules/labelService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { formatRelativeTime } from "@/utils/datetime";

const loading = ref(false);
const labels = ref<Label[]>([]);
const formRef = ref<FormInstance>();
const searchText = ref("");
const sortBy = ref<"name" | "usage">("name");
const usageFilter = ref<"" | "used" | "unused">("");
const router = useRouter();

// ── Usage: how many issues carry each label (case-insensitive name match) ───
const usageByLabel = ref<Map<string, number>>(new Map());

async function loadUsage() {
  try {
    const res = await getIssueList({ pageSize: 1000 });
    const issues = (res.data?.list as Issue[]) ?? [];
    const map = new Map<string, number>();
    for (const i of issues) {
      for (const l of i.labels || []) {
        const k = l.trim().toLowerCase();
        map.set(k, (map.get(k) || 0) + 1);
      }
    }
    usageByLabel.value = map;
  } catch {
    // usage is best-effort
  }
}

function usage(label: Label): number {
  return usageByLabel.value.get(label.name.trim().toLowerCase()) || 0;
}

function usageText(label: Label): string {
  const n = usage(label);
  return n ? `${n} issue${n > 1 ? "s" : ""}` : "Unused";
}

const displayedLabels = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  let list = labels.value;
  if (q) {
    list = list.filter(l => l.name.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q));
  }
  if (usageFilter.value === "used") list = list.filter(l => usage(l) > 0);
  else if (usageFilter.value === "unused") list = list.filter(l => usage(l) === 0);
  const sorted = [...list];
  if (sortBy.value === "usage") {
    sorted.sort((a, b) => usage(b) - usage(a) || a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
});

const inUseCount = computed(() => labels.value.filter(l => usage(l) > 0).length);
const unusedCount = computed(() => labels.value.filter(l => usage(l) === 0).length);
const totalTaggings = computed(() => labels.value.reduce((s, l) => s + usage(l), 0));
function pctLabel(count: number): string {
  if (!labels.value.length) return "";
  return `${Math.round((count / labels.value.length) * 100)}% of all`;
}
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim();
  return isFiltered ? `${displayedLabels.value.length} of ${labels.value.length} labels` : `${labels.value.length} labels`;
});

const rules: FormRules = {
  name: [{ required: true, message: "Label name is required", trigger: "blur" }],
  color: [{ required: true, message: "Color is required", trigger: "blur" }]
};

const presetColors = [
  "#ff6b6b", "#f06595", "#cc5de8", "#845ef7", "#5c7cfa",
  "#339af0", "#22b8cf", "#20c997", "#51cf66", "#94d82d",
  "#fcc419", "#ff922b", "#ff6b35", "#adb5bd", "#495057"
];

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: { name: "", color: "#5c7cfa", description: "" }
});

async function loadLabels() {
  loading.value = true;
  try {
    const res = await getLabelList();
    labels.value = (res.data?.list as Label[]) ?? [];
  } finally { loading.value = false; }
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", color: "#5c7cfa", description: "" };
  dialog.visible = true;
}

function openEdit(label: Label) {
  dialog.isEdit = true;
  dialog.editKey = label.key;
  dialog.form = { name: label.name, color: label.color, description: label.description || "" };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await updateLabel(dialog.editKey, { name: dialog.form.name, color: dialog.form.color, description: dialog.form.description });
      ElMessage.success("Label updated");
    } else {
      await createLabel({ key: `LBL-${Date.now().toString(36).toUpperCase()}`, name: dialog.form.name, color: dialog.form.color, description: dialog.form.description });
      ElMessage.success("Label created");
    }
    dialog.visible = false;
    await loadLabels();
  } finally { dialog.submitting = false; }
}

async function handleDelete(label: Label) {
  try {
    await ElMessageBox.confirm(`Delete label "${label.name}"?`, "Delete Label", {
      confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error"
    });
    await deleteLabel(label.key);
    ElMessage.success("Label deleted");
    await loadLabels();
  } catch { /* cancelled */ }
}

async function copyColor(label: Label) {
  try {
    await navigator.clipboard.writeText(label.color);
    ElMessage.success(`Copied ${label.color}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

function toggleUsage(v: "used" | "unused") {
  usageFilter.value = usageFilter.value === v ? "" : v;
}
function clearUsage() { usageFilter.value = ""; }
function goIssues() { router.push("/issue"); }
function goLabel(name: string) { router.push(`/issue?label=${encodeURIComponent(name)}`); }

onMounted(() => { loadLabels(); loadUsage(); });
</script>

<style scoped lang="scss">
.label-mgmt {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.label-mgmt__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.label-mgmt__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label-mgmt__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.label-mgmt__title { margin: 0; font-size: 20px; font-weight: 600; }
.label-mgmt__search { width: 190px; }
.label-mgmt__sort { width: 130px; }
.label-mgmt__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.label-summary__tile {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label-summary__tile--clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
    transform: translateY(-2px);
  }
}
.label-summary__tile--active {
  border-color: var(--el-color-primary);
}
.label-summary__value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--el-text-color-primary);
}
.label-summary__label { font-size: 12px; color: var(--el-text-color-secondary); }
.label-summary__sub { font-size: 11px; color: var(--el-text-color-placeholder); }
.label-summary__tile--used .label-summary__value { color: var(--el-color-success); }
.label-summary__tile--unused .label-summary__value { color: var(--el-color-info); }
.label-summary__tile--tagged .label-summary__value { color: var(--el-color-primary); }
.label-mgmt__body { max-width: 100%; }
.label-mgmt__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.label-card {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid transparent;
  border-radius: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
  }
  &--unused {
    opacity: 0.72;
  }
}
.label-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.label-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.label-card__chip {
  font-size: 13px;
}
.label-card__usage {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.label-card__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}
.label-card__updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.label-card__hex {
  font-size: 11px;
  font-family: monospace;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  align-self: flex-start;
  padding: 1px 6px;
  border-radius: 4px;
  &:hover { color: var(--el-color-primary); background: var(--el-fill-color-light); }
}
.label-card__actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  flex-shrink: 0;
}
.label-mgmt__color-pick {
  display: flex;
  gap: 10px;
  align-items: center;
}
.label-mgmt__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.label-mgmt__preset {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  &--active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px #fff inset;
  }
}
</style>
