<template>
  <div class="invite-page">
    <div class="invite-page__head">
      <div class="invite-page__head-left">
        <h1 class="invite-page__title">Members</h1>
        <el-tag size="small" type="info">{{ invitations.length + members.length }} total</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openInvite">Invite Member</el-button>
    </div>

    <div class="invite-page__body">
      <!-- Invite Form -->
      <el-dialog v-model="inviteDialog.visible" title="Invite Member" width="480px" destroy-on-close>
        <el-form ref="inviteFormRef" :model="inviteDialog.form" :rules="inviteRules" label-width="80px">
          <el-form-item label="Email" prop="email">
            <el-input v-model="inviteDialog.form.email" placeholder="member@example.com" />
          </el-form-item>
          <el-form-item label="Role">
            <el-select v-model="inviteDialog.form.role" style="width: 100%">
              <el-option label="Admin" value="admin" />
              <el-option label="Member" value="member" />
              <el-option label="Viewer" value="viewer" />
            </el-select>
          </el-form-item>
          <el-form-item label="Project">
            <el-select v-model="inviteDialog.form.project" style="width: 100%" clearable>
              <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="inviteDialog.visible = false">Cancel</el-button>
          <el-button type="primary" :loading="inviteDialog.submitting" @click="sendInvite">Send Invitation</el-button>
        </template>
      </el-dialog>

      <!-- Current Members -->
      <div v-if="members.length" class="invite-page__section">
        <h3>Members ({{ members.length }})</h3>
        <div class="invite-page__list">
          <div v-for="m in members" :key="m.key" class="invite-page__card">
            <el-avatar :size="36">{{ m.name.charAt(0) }}</el-avatar>
            <div class="invite-page__card-info">
              <span class="invite-page__card-name">{{ m.name }}</span>
              <span class="invite-page__card-email">{{ m.email }}</span>
            </div>
            <el-tag :type="roleTagType(m.role)" size="small">{{ m.role }}</el-tag>
            <el-button link type="danger" size="small" :icon="Delete" @click="removeMember(m)" />
          </div>
        </div>
      </div>

      <!-- Pending Invitations -->
      <div v-if="invitations.length" class="invite-page__section">
        <h3>Pending Invitations ({{ invitations.length }})</h3>
        <div class="invite-page__list">
          <div v-for="inv in invitations" :key="inv.key" class="invite-page__card invite-page__card--pending">
            <el-avatar :size="36" :icon="User" />
            <div class="invite-page__card-info">
              <span class="invite-page__card-name">{{ inv.email }}</span>
              <span class="invite-page__card-email">Invited {{ formatDate(inv.invited_at) }}</span>
            </div>
            <el-tag type="warning" size="small">Pending</el-tag>
            <el-button link type="danger" size="small" @click="cancelInvite(inv)">Cancel</el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!members.length && !invitations.length" description="No members yet">
        <el-button type="primary" @click="openInvite">Invite your first member</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts" name="memberInvitations">
import { onMounted, reactive, ref } from "vue";
import { Plus, Delete, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";

const projectStore = useProjectStore();

interface Member {
  key: string;
  name: string;
  email: string;
  role: string;
}

interface Invitation {
  key: string;
  email: string;
  role: string;
  project: string;
  invited_at: string;
}

const members = ref<Member[]>([]);
const invitations = ref<Invitation[]>([]);
const projects = ref<{ key: string; name: string }[]>([]);
const inviteFormRef = ref<FormInstance>();

const inviteRules: FormRules = {
  email: [
    { required: true, message: "Email is required", trigger: "blur" },
    { type: "email", message: "Valid email required", trigger: "blur" }
  ]
};

const inviteDialog = reactive({
  visible: false,
  submitting: false,
  form: { email: "", role: "member", project: "" }
});

async function loadData() {
  try {
    const res = await getLabelList({ pageSize: 200 });
    const all = (res.data?.list || []) as any[];
    members.value = all.filter((l: any) => l._type === "member").map((l: any) => ({
      key: l.key, name: l.name, email: l.email || l.name, role: l.role || "member"
    }));
    invitations.value = all.filter((l: any) => l._type === "invitation").map((l: any) => ({
      key: l.key, email: l.email || l.name, role: l.role || "member",
      project: l.project || "", invited_at: l.invited_at || new Date().toISOString()
    }));
    projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  } catch { /* ignore */ }
}

function openInvite() {
  inviteDialog.form = { email: "", role: "member", project: "" };
  inviteDialog.visible = true;
}

async function sendInvite() {
  const valid = await inviteFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  inviteDialog.submitting = true;
  try {
    await createLabel({
      key: `INV-${Date.now().toString(36).toUpperCase()}`,
      name: inviteDialog.form.email, email: inviteDialog.form.email,
      color: "#e6a23c", _type: "invitation",
      role: inviteDialog.form.role, project: inviteDialog.form.project,
      invited_at: new Date().toISOString()
    } as any);
    ElMessage.success(`Invitation sent to ${inviteDialog.form.email}`);
    inviteDialog.visible = false;
    await loadData();
  } finally { inviteDialog.submitting = false; }
}

async function cancelInvite(inv: Invitation) {
  await deleteLabel(inv.key);
  ElMessage.success("Invitation cancelled");
  await loadData();
}

async function removeMember(m: Member) {
  await deleteLabel(m.key);
  ElMessage.success(`${m.name} removed`);
  await loadData();
}

function roleTagType(role: string): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<string, "success" | "warning" | "info" | "primary" | "danger"> = { admin: "danger", member: "primary", viewer: "info" };
  return m[role] || "info";
}

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  await loadData();
});
</script>

<style scoped lang="scss">
.invite-page {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.invite-page__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.invite-page__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.invite-page__title { margin: 0; font-size: 20px; font-weight: 600; }
.invite-page__section {
  margin-bottom: 28px;
  h3 { margin: 0 0 12px; font-size: 15px; }
}
.invite-page__list {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.invite-page__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  &--pending { border-style: dashed; }
}
.invite-page__card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.invite-page__card-name { font-size: 14px; font-weight: 500; }
.invite-page__card-email { font-size: 12px; color: var(--el-text-color-placeholder); }
</style>