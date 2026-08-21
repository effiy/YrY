<template>
  <div class="api-tokens">
    <div class="api-tokens__head">
      <div class="api-tokens__head-left">
        <h1 class="api-tokens__title">API Tokens</h1>
        <el-tag size="small" type="info">{{ tokens.length }} tokens</el-tag>
      </div>
      <el-button type="primary" :icon="Plus" @click="generateToken">Generate Token</el-button>
    </div>

    <div v-loading="loading" class="api-tokens__body">
      <div v-if="tokens.length" class="api-tokens__list">
        <div v-for="t in tokens" :key="t.key" class="token-card">
          <div class="token-card__info">
            <div class="token-card__name">
              <el-icon><Key /></el-icon>
              <span>{{ t.name }}</span>
            </div>
            <div class="token-card__token">
              <code>{{ t.masked }}</code>
              <el-button link size="small" :icon="CopyDocument" @click="copyToken(t)" />
            </div>
            <div class="token-card__meta">
              <span>Created: {{ formatDate(t.created_at) }}</span>
              <span v-if="t.last_used">Last used: {{ formatDate(t.last_used) }}</span>
              <el-tag :type="t.expired ? 'danger' : 'success'" size="small">
                {{ t.expired ? 'Expired' : 'Active' }}
              </el-tag>
            </div>
          </div>
          <el-button :icon="Delete" size="small" type="danger" plain @click="revokeToken(t)" />
        </div>
      </div>
      <el-empty v-else description="No API tokens">
        <el-button type="primary" @click="generateToken">Generate your first token</el-button>
      </el-empty>
    </div>

    <!-- New Token Display -->
    <el-dialog v-model="newTokenDialog.visible" title="API Token Generated" width="520px" destroy-on-close>
      <el-alert type="warning" title="Copy this token now. You won't be able to see it again." :closable="false" show-icon />
      <div class="api-tokens__new-token">
        <code>{{ newTokenDialog.token }}</code>
        <el-button type="primary" size="small" :icon="CopyDocument" @click="copyNewToken">Copy</el-button>
      </div>
      <template #footer>
        <el-button type="primary" @click="newTokenDialog.visible = false">Done</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="apiTokens">
import { onMounted, reactive, ref } from "vue";
import { Plus, Delete, Key, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getLabelList, createLabel, updateLabel, deleteLabel } from "@/api/modules/labelService";

interface Token {
  key: string;
  name: string;
  masked: string;
  token: string;
  created_at: string;
  last_used?: string;
  expired: boolean;
}

const loading = ref(false);
const tokens = ref<Token[]>([]);

const newTokenDialog = reactive({
  visible: false,
  token: ""
});

async function loadTokens() {
  loading.value = true;
  try {
    const res = await getLabelList({ pageSize: 200 });
    tokens.value = ((res.data?.list || []) as any[])
      .filter((l: any) => l._type === "api_token")
      .map((l: any) => ({
        key: l.key, name: l.name, masked: l.masked || "****" + l.key.slice(-8),
        token: l.token || "", created_at: l.created_at || "",
        last_used: l.last_used, expired: l.expired || false
      }));
  } finally { loading.value = false; }
}

async function generateToken() {
  const token = "yv_" + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");
  const name = `Token ${tokens.value.length + 1}`;
  const masked = "yv_" + "*".repeat(24) + token.slice(-8);
  await createLabel({
    key: `TOK-${Date.now().toString(36).toUpperCase()}`,
    name, color: "#409eff", _type: "api_token",
    token, masked, created_at: new Date().toISOString(), expired: false
  } as any);
  newTokenDialog.token = token;
  newTokenDialog.visible = true;
  await loadTokens();
}

function copyNewToken() {
  navigator.clipboard.writeText(newTokenDialog.token);
  ElMessage.success("Token copied to clipboard");
}

function copyToken(t: Token) {
  navigator.clipboard.writeText(t.token || "");
  ElMessage.success("Token copied to clipboard");
}

async function revokeToken(t: Token) {
  try {
    await ElMessageBox.confirm(`Revoke token "${t.name}"?`, "Revoke Token", {
      confirmButtonText: "Revoke", cancelButtonText: "Cancel", type: "error"
    });
    await updateLabel(t.key, { expired: true } as any);
    ElMessage.success("Token revoked");
    await loadTokens();
  } catch { /* cancelled */ }
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

onMounted(() => { loadTokens(); });
</script>

<style scoped lang="scss">
.api-tokens {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.api-tokens__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.api-tokens__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.api-tokens__title { margin: 0; font-size: 20px; font-weight: 600; }
.api-tokens__list {
  max-width: 650px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.token-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  gap: 12px;
}
.token-card__info { flex: 1; }
.token-card__name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 4px;
}
.token-card__token {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  code {
    font-size: 12px;
    background: var(--el-fill-color-lighter);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: monospace;
  }
}
.token-card__meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.api-tokens__new-token {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  code {
    flex: 1;
    font-size: 13px;
    background: var(--el-fill-color-lighter);
    padding: 10px 14px;
    border-radius: 6px;
    font-family: monospace;
    word-break: break-all;
  }
}
</style>