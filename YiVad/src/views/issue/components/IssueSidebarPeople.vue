<template>
  <div class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><User /></el-icon>
      <span>People</span>
      <button v-if="!editing" type="button" class="id-sb-edit" title="Edit assignee" @click="startEdit">
        <el-icon><Edit /></el-icon>
      </button>
    </div>
    <div class="id-sb-group__body">
      <template v-if="editing">
        <div class="id-sb-edit-row">
          <el-input v-model="assigneeEdit" size="small" placeholder="Assignee" @keyup.enter="save" />
          <el-button size="small" type="primary" :loading="saving" @click="save">Save</el-button>
          <el-button size="small" @click="editing = false">Cancel</el-button>
        </div>
      </template>
      <div v-else class="id-sb-row">
        <span class="id-sb-row__label">Assignee</span>
        <span class="id-sb-row__value" :class="{ 'id-sb-row__value--empty': !issue.assignee }">
          {{ issue.assignee || 'Unassigned' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarPeople">
import { ref } from "vue";
import { Edit, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import type { Issue } from "@/api/modules/issueService";

const props = defineProps<{ issue: Issue }>();
const store = useIssueStore();

const editing = ref(false);
const saving = ref(false);
const assigneeEdit = ref("");

function startEdit() {
  assigneeEdit.value = props.issue.assignee || "";
  editing.value = true;
}

async function save() {
  saving.value = true;
  try {
    await store.editIssue(props.issue.key, { assignee: assigneeEdit.value || undefined } as any);
    ElMessage.success("Assignee updated");
    editing.value = false;
  } finally { saving.value = false; }
}
</script>