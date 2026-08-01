<template>
  <div class="claude-skill-detail" v-loading="loading">
    <!-- Header bar -->
    <header class="claude-skill-detail__header">
      <div class="claude-skill-detail__breadcrumb">
        <el-button link :icon="ArrowLeft" @click="back">Claude Skills</el-button>
        <span class="claude-skill-detail__sep">/</span>
        <span class="claude-skill-detail__name">{{ skill.name || 'New Skill' }}</span>
      </div>
      <div class="claude-skill-detail__actions">
        <template v-if="!isEditing">
          <el-button :icon="Edit" type="primary" @click="startEdit">Edit</el-button>
        </template>
        <template v-else>
          <el-button @click="cancelEdit">Cancel</el-button>
          <el-button type="primary" :icon="Check" @click="saveEdit" :loading="saving">Save</el-button>
        </template>
        <el-button :icon="Delete" type="danger" @click="confirmDelete" v-if="!isNew">Delete</el-button>
      </div>
    </header>

    <el-divider />

    <div class="claude-skill-detail__body">
      <!-- Metadata sidebar -->
      <aside class="claude-skill-detail__sidebar">
        <el-card shadow="never">
          <template #header><strong>Metadata</strong></template>
          <dl class="claude-skill-detail__meta">
            <dt>Name</dt>
            <dd><code>{{ skill.name }}</code></dd>

            <dt>Category</dt>
            <dd><el-tag size="small" :type="categoryTagType(skill.category)">{{ skill.category }}</el-tag></dd>

            <dt>File</dt>
            <dd class="claude-skill-detail__path"><code>{{ skill.filePath }}</code></dd>

            <dt v-if="skill.size">Size</dt>
            <dd v-if="skill.size">{{ formatSize(skill.size) }}</dd>

            <template v-if="skill.frontmatter">
              <dt>Lifecycle</dt>
              <dd>{{ skill.frontmatter.lifecycle || '—' }}</dd>

              <dt>User Invocable</dt>
              <dd>{{ skill.frontmatter.user_invocable ? '✓ Yes (/' + skill.name + ')' : '—' }}</dd>
            </template>
          </dl>
        </el-card>

        <!-- Usage stats (placeholder) -->
        <el-card shadow="never" class="claude-skill-detail__usage">
          <template #header><strong>Usage</strong></template>
          <p v-if="usageRefs.length === 0" class="claude-skill-detail__usage-empty">
            Usage statistics require server-side code search.<br />
            Check manually: <code>grep -r "{{ skill.name }}" src/</code>
          </p>
          <ul v-else class="claude-skill-detail__usage-list">
            <li v-for="ref in usageRefs" :key="`${ref.file}:${ref.line}`">
              <span class="claude-skill-detail__usage-file">{{ ref.file }}:{{ ref.line }}</span>
              <code class="claude-skill-detail__usage-snippet">{{ ref.snippet }}</code>
            </li>
          </ul>
        </el-card>
      </aside>

      <!-- Main content area -->
      <main class="claude-skill-detail__content">
        <!-- Edit mode: raw editor -->
        <div v-if="isEditing" class="claude-skill-detail__editor">
          <el-input
            v-model="editContent"
            type="textarea"
            :rows="Math.max(30, Math.ceil(editContent.split('\n').length * 1.1))"
            placeholder="Write SKILL.md content here..."
            class="claude-skill-detail__textarea"
          />
        </div>

        <!-- View mode: rendered markdown -->
        <div v-else class="claude-skill-detail__preview">
          <div class="claude-skill-detail__markdown" v-html="renderedMarkdown" v-if="renderedMarkdown" />
          <el-empty v-else description="No content" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts" name="claudeSkillsDetail">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Edit, Check, Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { marked } from "marked";
import {
  readClaudeSkill,
  writeClaudeSkill,
  deleteClaudeSkill,
  getClaudeSkillUsage,
  type ClaudeSkillMeta,
  type SkillUsageRef
} from "@/api/modules/claudeService";

const router = useRouter();
const route = useRoute();

// ── State ──────────────────────────────────────────────────────────────────
const skill = ref<ClaudeSkillMeta>({
  name: "",
  description: "",
  category: "other",
  filePath: ".claude/skills/"
});
const loading = ref(false);
const isEditing = ref(false);
const editContent = ref("");
const saving = ref(false);
const usageRefs = ref<SkillUsageRef[]>([]);

const isNew = computed(() => !route.params.name || route.params.name === "new");
const skillName = computed(() => (route.params.name as string) || "");

// ── Markdown rendering ──────────────────────────────────────────────────────
const renderedMarkdown = computed(() => {
  if (!skill.value.body) return "";
  try {
    return marked.parse(skill.value.body) as string;
  } catch {
    return `<pre>${skill.value.body}</pre>`;
  }
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function categoryTagType(cat: string): "" | "success" | "warning" | "info" | "danger" {
  const types: Record<string, string> = { code: "success", tools: "warning", init: "danger", other: "info" };
  return (types[cat] || "info") as any;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function back() {
  router.push("/brd/claude");
}

// ── Edit mode ──────────────────────────────────────────────────────────────
function startEdit() {
  editContent.value = skill.value.content || "";
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = "";
}

async function saveEdit() {
  saving.value = true;
  try {
    await writeClaudeSkill(skillName.value, editContent.value);
    isEditing.value = false;
    ElMessage.success("Skill saved successfully");
    // Reload to refresh the preview
    await loadSkill();
  } catch (err: any) {
    ElMessage.error(`Failed to save: ${err.message}`);
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  try {
    await ElMessageBox.confirm(
      `Delete skill "${skillName.value}"? This removes the entire directory:\n\n.claude/skills/${skillName.value}/`,
      "Delete Skill",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    );
    await deleteClaudeSkill(skillName.value);
    ElMessage.success(`Deleted: ${skillName.value}`);
    router.push("/brd/claude");
  } catch {
    // cancelled
  }
}

// ── Load ────────────────────────────────────────────────────────────────────
async function loadSkill() {
  loading.value = true;
  try {
    skill.value = await readClaudeSkill(skillName.value);
    // Check if edit mode requested
    if (route.query.edit === "1") {
      startEdit();
    }
  } catch (err: any) {
    ElMessage.error(`Failed to load skill: ${err.message}`);
  } finally {
    loading.value = false;
  }
}

async function loadUsage() {
  try {
    usageRefs.value = await getClaudeSkillUsage(skillName.value);
  } catch {
    usageRefs.value = [];
  }
}

watch(
  () => route.params.name,
  (newName) => {
    if (newName && newName !== "new") {
      loadSkill();
      loadUsage();
    }
  }
);

onMounted(() => {
  if (!isNew.value) {
    loadSkill();
    loadUsage();
  }
});
</script>

<style scoped lang="scss">
.claude-skill-detail {
  height: 100%;
  padding: 20px;
  overflow: auto;
  background: var(--el-bg-color-page);
}

.claude-skill-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.claude-skill-detail__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.claude-skill-detail__sep {
  color: var(--el-text-color-placeholder);
}

.claude-skill-detail__name {
  font-weight: 600;
  font-family: "SF Mono", "Fira Code", monospace;
}

.claude-skill-detail__actions {
  display: flex;
  gap: 8px;
}

.claude-skill-detail__body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.claude-skill-detail__sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 0;
}

.claude-skill-detail__meta {
  margin: 0;
  dt {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 8px;
  }
  dd {
    margin: 2px 0 0;
    font-size: 13px;
    code {
      font-size: 12px;
    }
  }
}

.claude-skill-detail__path {
  word-break: break-all;
  code {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }
}

.claude-skill-detail__usage {
  .el-card__body {
    font-size: 12px;
  }
}

.claude-skill-detail__usage-empty {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  code {
    font-size: 11px;
    background: var(--el-fill-color);
    padding: 1px 4px;
    border-radius: 2px;
  }
}

.claude-skill-detail__content {
  flex: 1;
  min-width: 0;
}

.claude-skill-detail__editor {
  .claude-skill-detail__textarea {
    font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}

.claude-skill-detail__preview {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 24px;
  min-height: 400px;
}

.claude-skill-detail__markdown {
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);

  :deep(h1) { font-size: 22px; margin: 0 0 12px; }
  :deep(h2) { font-size: 18px; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--el-border-color-lighter); }
  :deep(h3) { font-size: 15px; margin: 16px 0 6px; }
  :deep(p) { margin: 0 0 8px; }
  :deep(code) {
    font-size: 12px;
    background: var(--el-fill-color);
    padding: 1px 5px;
    border-radius: 3px;
  }
  :deep(pre) {
    background: var(--el-fill-color);
    padding: 12px 16px;
    border-radius: 6px;
    overflow-x: auto;
    code { background: none; padding: 0; }
  }
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    th, td {
      border: 1px solid var(--el-border-color-lighter);
      padding: 6px 12px;
      text-align: left;
      font-size: 13px;
    }
    th { background: var(--el-fill-color); font-weight: 600; }
  }
  :deep(blockquote) {
    margin: 8px 0;
    padding: 4px 16px;
    border-left: 3px solid var(--el-color-primary);
    color: var(--el-text-color-secondary);
  }
  :deep(ul), :deep(ol) {
    padding-left: 20px;
    li { margin-bottom: 4px; }
  }
  :deep(a) {
    color: var(--el-color-primary);
  }
}
</style>
