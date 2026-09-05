<template>
  <div>
    <div class="dm-head">
      <span class="dm-count">{{ $t("project.members.count", { n: project.members?.length || 0 }) }}</span>
      <el-button size="small" type="primary" :icon="Plus" @click="openAddMember">{{ $t("project.members.addMember") }}</el-button>
    </div>
    <div v-if="project.members?.length" class="dm-list">
      <div v-for="m in project.members" :key="m.user_id" class="dm-item">
        <el-avatar :size="32" :src="m.avatar">{{ m.username.charAt(0).toUpperCase() }}</el-avatar>
        <div class="dm-info">
          <span class="dm-name">{{ m.username }}</span>
          <span class="dm-id">{{ m.user_id }}</span>
        </div>
        <el-tag size="small" :type="roleTagType(m.role)">{{ m.role }}</el-tag>
        <el-button
          v-if="m.role !== 'owner'"
          link
          size="small"
          type="danger"
          :icon="Close"
          :title="$t('project.members.remove')"
          @click="handleRemove(m)"
        />
      </div>
    </div>
    <el-empty v-else :description="$t('project.members.empty')" :image-size="60" />

    <el-dialog v-model="dialog.visible" :title="$t('project.members.addTitle')" width="420px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item :label="$t('project.members.username')">
          <el-input v-model="dialog.username" :placeholder="$t('project.members.usernamePlaceholder')" maxlength="40" @keyup.enter="submitAddMember" />
        </el-form-item>
        <el-form-item :label="$t('project.members.role')">
          <el-select v-model="dialog.role" style="width: 100%">
            <el-option :label="$t('project.members.roleOwner')" value="owner" />
            <el-option :label="$t('project.members.roleAdmin')" value="admin" />
            <el-option :label="$t('project.members.roleMember')" value="member" />
            <el-option :label="$t('project.members.roleViewer')" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('project.members.cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submitAddMember">{{ $t('project.members.add') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Plus, Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import type { Project, ProjectMember } from "@/api/modules/projectService";
import { roleTagType } from "@/utils/role";

const props = defineProps<{ project: Project }>();
const emit = defineEmits<{ "update:members": [members: ProjectMember[]] }>();

const store = useProjectStore();

const dialog = reactive({
  visible: false,
  submitting: false,
  username: "",
  role: "member" as ProjectMember["role"]
});

function openAddMember() {
  dialog.username = "";
  dialog.role = "member";
  dialog.visible = true;
}

async function submitAddMember() {
  const username = dialog.username.trim();
  if (!username || !props.project) return;
  dialog.submitting = true;
  try {
    const member: ProjectMember = {
      user_id: `mem-${Date.now().toString(36)}`,
      username,
      role: dialog.role
    };
    const updated = [...(props.project.members || []), member];
    await store.editProject(props.project.key, { members: updated });
    emit("update:members", updated);
    ElMessage.success("Added " + username);
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

async function handleRemove(m: ProjectMember) {
  const updated = (props.project.members || []).filter(x => x.user_id !== m.user_id);
  await store.editProject(props.project.key, { members: updated });
  emit("update:members", updated);
  ElMessage.success("Removed " + m.username);
}
</script>

<style scoped lang="scss">
.dm-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.dm-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.dm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dm-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.dm-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.dm-name {
  font-weight: 500;
}
.dm-id {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>