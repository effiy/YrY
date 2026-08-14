<script setup lang="ts" name="aiChatAgentSessionLog">
/**
 * AgentSessionLogDialog — dsh "append-only session log" made visible.
 *
 * Fetches the persisted agent run trajectory for the active conversation via
 * `/agent/session` and renders the raw agent_messages (role/name/tool_call_id)
 * so the user can inspect the exact tool-call chain — including tool_results
 * and the injected [TASK]/[CONTINUE]/[BUDGET]/[RESUME] notes — and export it
 * as Markdown or JSON for audit / handoff.
 */
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { CopyDocument, Download, Loading } from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { getAgentSession, type AgentSessionMessage } from "@/api/modules/agentService";

const store = useAiChatStore();

const messages = ref<AgentSessionMessage[]>([]);
const loading = ref(false);
const loadedKey = ref("");
const sessionId = ref("");

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  assistant: "Assistant",
  tool_result: "Tool result",
  tool: "Tool call",
  system: "System",
};

function roleClass(role: string): string {
  return `asl__role--${role.replace(/_/g, "-")}`;
}

async function load() {
  const key = store.activeConversation?.key;
  if (!key) {
    messages.value = [];
    sessionId.value = "";
    loadedKey.value = "";
    return;
  }
  sessionId.value = key;
  if (loadedKey.value === key) return;
  loading.value = true;
  const data = await getAgentSession(key);
  messages.value = data ?? [];
  loadedKey.value = key;
  loading.value = false;
  if (data === null) {
    ElMessage.info("No persisted trajectory for this session (expired or never saved).");
  }
}

watch(
  () => store.agentSessionLogVisible,
  visible => {
    if (visible) void load();
  }
);

function exportMarkdown(): string {
  const lines: string[] = [`# Agent session log — ${sessionId.value}`, ""];
  for (const m of messages.value) {
    const label = ROLE_LABELS[m.role] ?? m.role;
    const name = m.name ? ` \`${m.name}\`` : "";
    lines.push(`## ${label}${name}`);
    lines.push("");
    lines.push("```text");
    lines.push(m.content ?? "");
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

function exportJson(): string {
  return JSON.stringify(messages.value, null, 2);
}

function download(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadMarkdown() {
  download(`agent-session-${sessionId.value || "log"}.md`, exportMarkdown());
}

function downloadJson() {
  download(`agent-session-${sessionId.value || "log"}.json`, exportJson(), "application/json");
}

async function copyMarkdown() {
  try {
    await navigator.clipboard.writeText(exportMarkdown());
    ElMessage.success("Copied as Markdown");
  } catch {
    ElMessage.error("Copy failed");
  }
}
</script>

<template>
  <el-dialog
    :model-value="store.agentSessionLogVisible"
    title="Agent session log"
    width="720px"
    :close-on-click-modal="false"
    @update:model-value="v => (v ? store.openAgentSessionLog() : store.closeAgentSessionLog())"
  >
    <div class="asl">
      <div class="asl__bar">
        <span class="asl__meta">
          Session: <code>{{ sessionId || "—" }}</code> · {{ messages.length }} messages
        </span>
        <div class="asl__actions">
          <el-button size="small" text :icon="CopyDocument" :disabled="!messages.length" @click="copyMarkdown">
            Copy MD
          </el-button>
          <el-button size="small" text :icon="Download" :disabled="!messages.length" @click="downloadMarkdown">
            Export MD
          </el-button>
          <el-button size="small" text :icon="Download" :disabled="!messages.length" @click="downloadJson">
            Export JSON
          </el-button>
        </div>
      </div>

      <div v-if="loading" class="asl__loading">
        <el-icon class="asl__spin"><Loading /></el-icon>
        Loading trajectory…
      </div>

      <el-empty
        v-else-if="!messages.length"
        description="No persisted trajectory — run an agent task first, then view its log."
      />

      <div v-else class="asl__list">
        <div v-for="(m, i) in messages" :key="i" class="asl__msg">
          <div class="asl__msg-head">
            <span class="asl__role" :class="roleClass(m.role)">{{ ROLE_LABELS[m.role] ?? m.role }}</span>
            <span v-if="m.name" class="asl__name">{{ m.name }}</span>
            <span v-if="m.tool_call_id" class="asl__call-id">{{ m.tool_call_id }}</span>
          </div>
          <pre class="asl__content">{{ m.content }}</pre>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="store.closeAgentSessionLog()">Close</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.asl {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asl__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.asl__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);

  code {
    font-family: "SF Mono", "Fira Code", monospace;
    color: var(--el-text-color-primary);
  }
}

.asl__actions {
  display: flex;
  gap: 4px;
}

.asl__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.asl__spin {
  animation: asl-spin 1s linear infinite;
}
@keyframes asl-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.asl__list {
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asl__msg {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.asl__msg-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.asl__role {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--user { color: var(--el-color-primary); }
  &--assistant { color: var(--el-color-success); }
  &--tool-result { color: var(--el-color-warning); }
  &--tool { color: var(--el-color-info); }
  &--system { color: var(--el-text-color-secondary); }
}

.asl__name {
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 11px;
  color: var(--el-text-color-primary);
}

.asl__call-id {
  margin-left: auto;
  font-family: monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

.asl__content {
  margin: 0;
  padding: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}
</style>
