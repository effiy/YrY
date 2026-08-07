<template>
  <el-drawer
    v-model="drawerVisible"
    :title="`${drawerProps.title} Bug`"
    size="560px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-form
      ref="formRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
      @keydown.meta.s.prevent="handleSubmit"
      @keydown.ctrl.s.prevent="handleSubmit"
    >
      <!-- Identification -->
      <el-divider content-position="left">Identification</el-divider>
      <el-form-item label="Title" prop="title">
        <el-input v-model="drawerProps.row.title" placeholder="Concise summary of the defect" clearable></el-input>
      </el-form-item>
      <el-form-item label="Project" prop="project">
        <el-select v-model="drawerProps.row.project" placeholder="Owning project" clearable filterable>
          <el-option v-for="p in projects" :key="p.value" :label="p.label" :value="p.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Module" prop="module">
        <el-input v-model="drawerProps.row.module" placeholder="Affected module / component" clearable></el-input>
      </el-form-item>
      <el-form-item label="Iteration" prop="iteration">
        <el-input v-model="drawerProps.row.iteration" placeholder="Sprint / iteration name (e.g. 2026S1)" clearable></el-input>
      </el-form-item>
      <el-form-item label="Defect URL" prop="defectUrl">
        <el-input v-model="drawerProps.row.defectUrl" placeholder="Agile-platform defect link" clearable></el-input>
      </el-form-item>

      <!-- Classification -->
      <el-divider content-position="left">Classification</el-divider>
      <el-form-item label="Severity" prop="severity">
        <el-select v-model="drawerProps.row.severity" placeholder="Impact on the system" clearable>
          <el-option v-for="s in severityOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Priority" prop="priority">
        <el-select v-model="drawerProps.row.priority" placeholder="Fix urgency" clearable>
          <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select v-model="drawerProps.row.status" placeholder="Workflow state" clearable>
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Type" prop="type">
        <el-select v-model="drawerProps.row.type" placeholder="Defect category" clearable>
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>

      <!-- Ownership -->
      <el-divider content-position="left">Ownership</el-divider>
      <el-form-item label="Assignee" prop="assignee">
        <el-input v-model="drawerProps.row.assignee" placeholder="Engineer responsible for the fix" clearable></el-input>
      </el-form-item>
      <el-form-item label="Reporter" prop="reporter">
        <el-input v-model="drawerProps.row.reporter" placeholder="Who reported the defect" clearable></el-input>
      </el-form-item>
      <el-form-item label="Due Date" prop="dueDate">
        <el-date-picker
          v-model="drawerProps.row.dueDate"
          type="date"
          value-format="x"
          placeholder="Target fix date"
          clearable
        />
      </el-form-item>

      <!-- Environment & Versions -->
      <el-divider content-position="left">Environment & Versions</el-divider>
      <el-form-item label="Environment" prop="environment">
        <el-input
          v-model="drawerProps.row.environment"
          placeholder="e.g. Chrome 120 / macOS 14 / staging"
          clearable
        />
      </el-form-item>
      <el-form-item label="Affected Ver." prop="affectedVersion">
        <el-input v-model="drawerProps.row.affectedVersion" placeholder="Build / release where observed" clearable></el-input>
      </el-form-item>
      <el-form-item label="Fixed Ver." prop="fixedVersion">
        <el-input v-model="drawerProps.row.fixedVersion" placeholder="Build / release containing the fix" clearable></el-input>
      </el-form-item>

      <!-- Reproduction -->
      <el-divider content-position="left">Reproduction</el-divider>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="drawerProps.row.description"
          type="textarea"
          :rows="3"
          placeholder="What is wrong? Include context and impact."
        />
      </el-form-item>
      <el-form-item label="Steps" prop="stepsToReproduce">
        <el-input
          v-model="drawerProps.row.stepsToReproduce"
          type="textarea"
          :rows="6"
          placeholder="Numbered reproduction steps, one per line"
        />
      </el-form-item>
      <el-form-item label="Expected" prop="expectedResult">
        <el-input v-model="drawerProps.row.expectedResult" type="textarea" :rows="2" placeholder="Expected behavior" />
      </el-form-item>
      <el-form-item label="Actual" prop="actualResult">
        <el-input v-model="drawerProps.row.actualResult" type="textarea" :rows="2" placeholder="Observed behavior" />
      </el-form-item>
      <el-form-item label="Frequency" prop="frequency">
        <el-select v-model="drawerProps.row.frequency" placeholder="How often it reproduces" clearable>
          <el-option v-for="f in frequencyOptions" :key="f.value" :label="f.label" :value="f.value" />
        </el-select>
      </el-form-item>

      <!-- Resolution (filled when status → resolved / rejected) -->
      <el-divider content-position="left">Resolution</el-divider>
      <el-form-item label="Cause" prop="causeProblem">
        <el-input
          v-model="drawerProps.row.causeProblem"
          type="textarea"
          :rows="3"
          placeholder="Technical root cause — not a restatement of the symptom. e.g. 'parseMarkdownBody regex m-flag matched end-of-line'"
        />
      </el-form-item>
      <el-form-item label="Solution" prop="solution">
        <el-input
          v-model="drawerProps.row.solution"
          type="textarea"
          :rows="3"
          placeholder="What was changed. e.g. 'Replaced regex split with line-by-line section parser'"
        />
      </el-form-item>

      <!-- Tags -->
      <el-form-item label="Tags" prop="tags">
        <div class="tag-input">
          <el-tag
            v-for="(tag, idx) in drawerProps.row.tags"
            :key="idx"
            closable
            :disable-transitions="false"
            @close="drawerProps.row.tags!.splice(idx, 1)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            size="small"
            class="tag-input__field"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-button v-else size="small" @click="showInput">+ Tag</el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span v-if="!drawerProps.isView" class="bd-kbd-hint"><kbd>⌘/Ctrl</kbd>+<kbd>S</kbd> save</span>
      <div>
        <el-button @click="drawerVisible = false">Cancel</el-button>
        <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">Confirm</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="BugDrawer">
import { ref, reactive, nextTick } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { PROJECTS, PROJECT_LABELS } from "@/config";
import type { BugDocument, BugSeverity, BugPriority, BugStatus, BugType, BugFrequency } from "@/api/modules/bug";

const projects = PROJECTS.map(p => ({ label: PROJECT_LABELS[p] ?? p, value: p }));

const severityOptions: { label: string; value: BugSeverity }[] = [
  { label: "Critical — blocks production", value: "critical" },
  { label: "Major — key feature broken", value: "major" },
  { label: "Minor — workaround exists", value: "minor" },
  { label: "Trivial — cosmetic", value: "trivial" }
];
const priorityOptions: { label: string; value: BugPriority }[] = [
  { label: "P0 — Fix now", value: "p0" },
  { label: "P1 — Fix this sprint", value: "p1" },
  { label: "P2 — Fix this quarter", value: "p2" },
  { label: "P3 — Backlog", value: "p3" }
];
const statusOptions: { label: string; value: BugStatus }[] = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" },
  { label: "Reopened", value: "reopened" }
];
const typeOptions: { label: string; value: BugType }[] = [
  { label: "Functional", value: "functional" },
  { label: "Performance", value: "performance" },
  { label: "UI / UX", value: "ui" },
  { label: "Security", value: "security" },
  { label: "Compatibility", value: "compatibility" },
  { label: "Regression", value: "regression" },
  { label: "Data", value: "data" },
  { label: "Other", value: "other" }
];
const frequencyOptions: { label: string; value: BugFrequency }[] = [
  { label: "Always", value: "always" },
  { label: "Sometimes", value: "sometimes" },
  { label: "Rarely", value: "rarely" },
  { label: "Once", value: "once" },
  { label: "Unable to reproduce", value: "unable" }
];

interface DrawerProps {
  title: string;
  isView: boolean;
  // Metadata fields come from BugDocument; long-form fields (description,
  // stepsToReproduce, expectedResult, actualResult, causeProblem, solution)
  // live only in the drawer form and are persisted to the markdown body, not
  // MongoDB.
  row: Omit<
    Partial<BugDocument>,
    "stepsToReproduce" | "dueDate" | "contentPath" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt"
  > & {
    stepsToReproduce?: string;
    description?: string;
    expectedResult?: string;
    actualResult?: string;
    causeProblem?: string;
    solution?: string;
    dueDate: number | null;
  };
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: { dueDate: null }
});

const rules = reactive({
  title: [{ required: true, message: "Please enter a title" }],
  project: [{ required: true, message: "Please select a project" }],
  severity: [{ required: true, message: "Please select a severity" }],
  priority: [{ required: true, message: "Please select a priority" }],
  status: [{ required: true, message: "Please select a status" }],
  type: [{ required: true, message: "Please select a type" }]
});

const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const formRef = ref<FormInstance>();
const handleSubmit = () => {
  formRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title} bug successfully!` });
      drawerProps.value.getTableList?.();
      drawerVisible.value = false;
    } catch (e: any) {
      ElMessage.error(e?.message || "Save failed");
    }
  });
};

// Tag input
const inputVisible = ref(false);
const inputValue = ref("");
const inputRef = ref<any>();
function showInput() {
  inputVisible.value = true;
  nextTick(() => inputRef.value?.focus?.());
}
function addTag() {
  const v = inputValue.value.trim();
  if (v && !drawerProps.value.row.tags!.includes(v)) {
    drawerProps.value.row.tags!.push(v);
  }
  inputVisible.value = false;
  inputValue.value = "";
}

defineExpose({ acceptParams });
</script>

<style scoped lang="scss">
.tag-input {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  &__field {
    width: 120px;
  }
}
:deep(.el-divider__text) {
  font-weight: 600;
}
:deep(.el-drawer__footer) {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bd-kbd-hint {
  margin-right: auto;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  kbd {
    display: inline-block;
    min-width: 16px;
    padding: 1px 5px;
    font-family: "SF Mono", "Menlo", monospace;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 3px;
  }
}
</style>
