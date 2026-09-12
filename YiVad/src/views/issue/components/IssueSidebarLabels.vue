<template>
  <div class="id-sb-group">
    <div class="id-sb-group__title">
      <el-icon><PriceTag /></el-icon>
      <span>Labels</span>
      <button v-if="!editing" type="button" class="id-sb-edit" title="Edit labels" @click="startEdit">
        <el-icon><Edit /></el-icon>
      </button>
    </div>
    <div class="id-sb-group__body">
      <template v-if="editing">
        <div class="id-sb-edit-row">
          <el-select
            v-model="labelsEdit"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Add labels"
            style="width:100%"
            size="small"
          />
        </div>
        <div class="id-sb-edit-actions">
          <el-button size="small" type="primary" :loading="saving" @click="save">Save</el-button>
          <el-button size="small" @click="editing = false">Cancel</el-button>
        </div>
      </template>
      <div v-else-if="issue.labels?.length" class="id-sb-labels">
        <el-tag
          v-for="label in issue.labels"
          :key="label"
          size="small"
          round
          class="id-sb-label"
          @click="goLabel(label)"
        >{{ label }}</el-tag>
      </div>
      <div v-else class="id-sb-row__value--empty" style="padding:4px 0;font-size:12px">No labels</div>
    </div>
  </div>
</template>

<script setup lang="ts" name="IssueSidebarLabels">
import { ref } from "vue";
import { Edit, PriceTag } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useIssueStore } from "@/stores/modules/issue";
import type { Issue } from "@/api/modules/issueService";

const props = defineProps<{ issue: Issue }>();
const store = useIssueStore();
const router = useRouter();

const editing = ref(false);
const saving = ref(false);
const labelsEdit = ref<string[]>([]);

function startEdit() {
  labelsEdit.value = [...(props.issue.labels || [])];
  editing.value = true;
}

async function save() {
  saving.value = true;
  try {
    await store.editIssue(props.issue.key, { labels: labelsEdit.value } as any);
    ElMessage.success("Labels updated");
    editing.value = false;
  } finally { saving.value = false; }
}

function goLabel(name: string) {
  router.push(`/issue?label=${encodeURIComponent(name)}`);
}
</script>