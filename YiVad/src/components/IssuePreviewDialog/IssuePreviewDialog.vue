<template>
  <el-dialog
    v-model="visible"
    width="100vw"
    top="0"
    :close-on-click-modal="true"
    :show-close="false"
    append-to-body
    class="ipd-dialog"
    @close="close"
  >
    <!-- Toolbar -->
    <div class="ipd-toolbar">
      <div class="ipd-toolbar__left">
        <el-button link :icon="ArrowLeft" v-if="navHistory.length" @click="goBack" />
        <code class="ipd-toolbar__key">{{ issue?.key }}</code>
        <span class="ipd-toolbar__title">{{ issue?.title || "—" }}</span>
      </div>
      <div class="ipd-toolbar__right">
        <el-button size="small" :icon="FullScreen" @click="router.push('/issue/' + issueKey)">{{ t("home.today.viewIssue") }}</el-button>
        <el-button size="small" :icon="Close" link @click="close" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ipd-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>Loading…</span>
    </div>

    <!-- Body -->
    <div v-else-if="issue" class="ipd-body">
      <!-- Metadata chips -->
      <div class="ipd-meta">
        <el-tag :type="statusTag(issue.status)" size="small" effect="dark">{{ statusLabel(issue.status) }}</el-tag>
        <el-tag :type="priorityTag(issue.priority)" size="small" effect="plain">{{ priorityLabel(issue.priority) }}</el-tag>
        <el-tag type="info" size="small" effect="plain">{{ typeLabel(issue.issue_type) }}</el-tag>
        <span v-if="issue.project_key" class="ipd-meta__item">
          <el-icon :size="13"><Folder /></el-icon>{{ issue.project_key }}
        </span>
        <span v-if="issue.assignee" class="ipd-meta__item">
          <el-icon :size="13"><User /></el-icon>{{ issue.assignee }}
        </span>
        <span v-if="issue.due_date" class="ipd-meta__item" :class="{ 'ipd-meta__item--overdue': isOverdue }">
          <el-icon :size="13"><Clock /></el-icon>{{ issue.due_date }}
        </span>
        <span v-if="issue.story_points != null" class="ipd-meta__item">
          <el-icon :size="13"><Coin /></el-icon>{{ issue.story_points }}pt
        </span>
        <span v-if="issue.labels?.length" class="ipd-meta__labels">
          <el-tag v-for="l in issue.labels" :key="l" size="small" class="ipd-meta__label">{{ l }}</el-tag>
        </span>
      </div>

      <!-- Blocked warning -->
      <el-alert
        v-if="issue.blocked_by?.length"
        :title="'Blocked by: ' + issue.blocked_by.join(', ')"
        type="warning"
        :closable="false"
        show-icon
        class="ipd-blocked"
      />

      <!-- Description -->
      <div class="ipd-body__section">
        <div class="ipd-body__section-head">
          <span class="ipd-body__section-title">{{ t("issue.dialog.description") }}</span>
          <el-button v-if="issue.description" link size="small" :icon="editMode ? View : Edit" @click="editMode = !editMode" />
        </div>
        <el-input
          v-if="editMode"
          v-model="editContent"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 40 }"
          class="ipd-editor"
          placeholder="Markdown description…"
        />
        <div
          v-else-if="issue.description"
          ref="previewRef"
          class="ipd-preview markdown-body"
          v-html="displayHtml"
        />
        <div v-else class="ipd-empty">No description</div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts" name="IssuePreviewDialog">
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeft, Edit, Close, Loading, Folder, User, Clock, Coin, View, FullScreen } from "@element-plus/icons-vue";
import { useMarkdown, runMermaid } from "@/hooks/useMarkdown";
import { getIssue, type Issue, issueStatusLabel, issueStatusTag, typeLabel, ISSUE_PRIORITY_MAP } from "@/api/modules/issueService";
import type { TagType } from "@/api/modules/issueService";

const { t } = useI18n();
const router = useRouter();
const { renderWithHtml } = useMarkdown();

const visible = ref(false);
const loading = ref(false);
const issueKey = ref("");
const issue = ref<Issue | null>(null);
const editMode = ref(false);
const editContent = ref("");
const navHistory = ref<string[]>([]);
const previewRef = ref<HTMLElement | null>(null);

const todayLocal = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
const isOverdue = computed(() => !!(issue.value?.due_date && issue.value.due_date < todayLocal && issue.value.status !== "done" && issue.value.status !== "cancelled"));

const displayHtml = computed(() => renderWithHtml(issue.value?.description || ""));

function statusLabel(s: string): string { return issueStatusLabel(s as any); }
function statusTag(s: string): TagType { return issueStatusTag(s as any); }
function priorityLabel(p: string): string { return ISSUE_PRIORITY_MAP[p as keyof typeof ISSUE_PRIORITY_MAP] || p || "None"; }
function priorityTag(p: string): TagType { const m: Record<string, TagType> = { urgent: "danger", high: "warning", medium: "primary" }; return m[p] || "info"; }

async function loadIssue(key: string) {
  loading.value = true;
  issueKey.value = key;
  try {
    const res = await getIssue(key);
    issue.value = (res.data?.list?.[0] || null) as Issue | null;
    editContent.value = issue.value?.description || "";
    editMode.value = false;
  } finally {
    loading.value = false;
  }
}

function open(key: string) {
  visible.value = true;
  navHistory.value = [];
  loadIssue(key);
}

function close() {
  visible.value = false;
  editMode.value = false;
  issue.value = null;
}

function goBack() {
  const prev = navHistory.value.pop();
  if (prev) loadIssue(prev);
}

// Mermaid rendering after preview updates
watch([displayHtml, () => previewRef.value], async () => {
  if (!previewRef.value || editMode.value) return;
  await nextTick();
  await runMermaid(previewRef.value);
}, { flush: "post" });

defineExpose({ open });
</script>

<style scoped lang="scss">
.ipd-dialog {
  :deep(.el-dialog__body) { padding: 0; }
  :deep(.el-dialog__header) { display: none; }
}

.ipd-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  .ipd-toolbar__left { display: flex; gap: 10px; align-items: center; min-width: 0; flex: 1; }
  .ipd-toolbar__right { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
  .ipd-toolbar__key {
    flex-shrink: 0; font-size: 12px; font-family: "SF Mono", monospace;
    color: var(--el-text-color-secondary); background: var(--el-fill-color-light);
    padding: 3px 8px; border-radius: 5px;
  }
  .ipd-toolbar__title {
    font-size: 15px; font-weight: 600; color: var(--el-text-color-primary);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
}

.ipd-loading {
  display: flex; gap: 8px; align-items: center; justify-content: center;
  padding: 60px 0; color: var(--el-text-color-secondary);
}

.ipd-body { padding: 0 20px 24px; max-width: 900px; margin: 0 auto; }

.ipd-meta {
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  padding: 14px 0; border-bottom: 1px solid var(--el-border-color-lighter);
  .ipd-meta__item {
    display: inline-flex; gap: 4px; align-items: center;
    font-size: 12px; color: var(--el-text-color-secondary);
    &--overdue { color: var(--el-color-danger); font-weight: 600; }
  }
  .ipd-meta__labels { display: flex; gap: 4px; flex-wrap: wrap; margin-left: 4px; }
  .ipd-meta__label { font-size: 11px; }
}

.ipd-blocked { margin-top: 12px; }

.ipd-body__section { margin-top: 16px; }
.ipd-body__section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.ipd-body__section-title {
  font-size: 13px; font-weight: 600; color: var(--el-text-color-primary);
}
.ipd-editor {
  :deep(textarea) {
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 13px; line-height: 1.6;
  }
}
.ipd-preview {
  min-height: 200px; padding: 16px 20px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.ipd-empty {
  display: flex; align-items: center; justify-content: center;
  padding: 40px; color: var(--el-text-color-placeholder); font-size: 13px;
}
</style>