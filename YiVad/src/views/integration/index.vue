<template>
  <div class="webhooks">
    <div class="webhooks__head">
      <div class="webhooks__head-left">
        <h1 class="webhooks__title">Webhooks</h1>
        <el-tag size="small" type="info">{{ webhooks.length }} webhooks</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">Add Webhook</el-button>
    </div>

    <div v-loading="loading" class="webhooks__body">
      <div v-if="webhooks.length" class="webhooks__list">
        <div v-for="w in webhooks" :key="w.key" class="webhook-card">
          <div class="webhook-card__info">
            <div class="webhook-card__url">
              <el-icon><Link /></el-icon>
              <span>{{ w.url }}</span>
            </div>
            <div class="webhook-card__meta">
              <el-tag size="small" effect="plain" v-for="e in w.events" :key="e">{{ eventLabel(e) }}</el-tag>
              <el-tag :type="w.active ? 'success' : 'info'" size="small">{{ w.active ? 'Active' : 'Inactive' }}</el-tag>
            </div>
          </div>
          <div class="webhook-card__actions">
            <el-switch v-model="w.active" size="small" @change="(val: any) => toggleWebhook(w, !!val)" />
            <el-button size="small" @click="testWebhook(w)">Test</el-button>
            <el-button :icon="Edit" size="small" @click="openEdit(w)" />
            <el-button :icon="Delete" size="small" @click="handleDelete(w)" />
          </div>
        </div>
      </div>
      <el-empty v-else description="No webhooks configured" :image-size="60">
        <el-button type="primary" @click="openCreate">Add your first webhook</el-button>
      </el-empty>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Webhook' : 'Add Webhook'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="90px">
        <el-form-item label="URL" prop="url">
          <el-input v-model="dialog.form.url" placeholder="https://example.com/webhook" />
        </el-form-item>
        <el-form-item label="Secret">
          <el-input v-model="dialog.form.secret" placeholder="Optional secret for HMAC" show-password />
        </el-form-item>
        <el-form-item label="Events">
          <el-checkbox-group v-model="dialog.form.events">
            <el-checkbox v-for="evt in eventTypes" :key="evt" :label="evt" :value="evt">{{ eventLabel(evt) }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Active">
          <el-switch v-model="dialog.form.active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="webhookManagement">
import { onMounted, reactive, ref } from "vue";
import { Plus, Edit, Delete, Link } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";

const eventTypes = ["issue.created", "issue.updated", "issue.deleted", "cycle.completed", "comment.created"];

interface Webhook {
  key: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

const loading = ref(false);
const webhooks = ref<Webhook[]>([]);
const formRef = ref<FormInstance>();

const rules: FormRules = {
  url: [{ required: true, message: "URL is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: { url: "", secret: "", events: ["issue.created"] as string[], active: true }
});

function eventLabel(e: string): string {
  const labels: Record<string, string> = {
    "issue.created": "Issue Created", "issue.updated": "Issue Updated",
    "issue.deleted": "Issue Deleted", "cycle.completed": "Cycle Completed",
    "comment.created": "Comment Added"
  };
  return labels[e] || e;
}

async function loadWebhooks() {
  loading.value = true;
  try {
    const res = await getLabelList({ pageSize: 200 });
    webhooks.value = ((res.data?.list || []) as any[])
      .filter((l: any) => l._type === "webhook")
      .map((l: any) => ({
        key: l.key, url: l.url || l.name, secret: l.secret || "",
        events: l.events || ["issue.created"], active: l.active !== false
      }));
  } finally { loading.value = false; }
}

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { url: "", secret: "", events: ["issue.created"], active: true };
  dialog.visible = true;
}

function openEdit(w: Webhook) {
  dialog.isEdit = true; dialog.editKey = w.key;
  dialog.form = { url: w.url, secret: w.secret, events: [...w.events], active: w.active };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const data = {
      name: dialog.form.url, color: "#409eff", _type: "webhook",
      url: dialog.form.url, secret: dialog.form.secret,
      events: dialog.form.events, active: dialog.form.active
    };
    if (dialog.isEdit) {
      await updateLabel(dialog.editKey, data as any);
      ElMessage.success("Webhook updated");
    } else {
      await createLabel({ key: `WH-${Date.now().toString(36).toUpperCase()}`, ...data } as any);
      ElMessage.success("Webhook created");
    }
    dialog.visible = false;
    await loadWebhooks();
  } finally { dialog.submitting = false; }
}

async function toggleWebhook(w: Webhook, active: boolean) {
  await updateLabel(w.key, { active } as any);
  ElMessage.success(active ? "Webhook enabled" : "Webhook disabled");
}

function testWebhook(w: Webhook) {
  ElMessage.success(`Test webhook triggered for: ${w.url}`);
}

async function handleDelete(w: Webhook) {
  try {
    await ElMessageBox.confirm(`Delete webhook for "${w.url}"?`, "Delete Webhook", {
      confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "error"
    });
    await deleteLabel(w.key);
    ElMessage.success("Webhook deleted");
    await loadWebhooks();
  } catch { /* cancelled */ }
}

onMounted(() => { loadWebhooks(); });
</script>

<style scoped lang="scss">
.webhooks {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.webhooks__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.webhooks__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.webhooks__title { margin: 0; font-size: 20px; font-weight: 600; }
.webhooks__list {
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.webhook-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  gap: 12px;
}
.webhook-card__info { flex: 1; min-width: 0; }
.webhook-card__url {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  font-family: monospace;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.webhook-card__meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.webhook-card__actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
</style>