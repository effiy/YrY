<template>
  <el-dialog
    :model-value="visible"
    :title="$t('brdGenerate.title')"
    width="960px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="$emit('update:visible', $event)"
  >
    <div class="brd-gen" v-loading="scanning">
      <!-- ── Top: Knowledge selector + Description ──────────────────────── -->
      <div class="brd-gen__top">
        <!-- Knowledge Base Selector -->
        <div class="brd-gen__kb">
          <div class="brd-gen__kb-header">
            <h4>{{ $t("brdGenerate.knowledgeBase") }}</h4>
            <span class="brd-gen__kb-count">{{ checkedFiles.length }} / {{ flatFiles.length }} {{ $t("brdGenerate.filesSelected") }}</span>
          </div>
          <div class="brd-gen__kb-tree">
            <el-tree
              ref="treeRef"
              :data="treeData"
              show-checkbox
              node-key="id"
              :props="{ label: 'label', children: 'children' }"
              @check="onTreeCheck"
            >
              <template #default="{ node, data }">
                <span class="brd-gen__tree-node" :title="data.path || data.label">
                  <el-icon v-if="!data.children"><Document /></el-icon>
                  <el-icon v-else><Folder /></el-icon>
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>

        <!-- Description -->
        <div class="brd-gen__desc">
          <h4>{{ $t("brdGenerate.description") }}</h4>
          <el-input
            v-model="description"
            type="textarea"
            :rows="10"
            :placeholder="$t('brdGenerate.descriptionPlaceholder')"
            class="brd-gen__desc-input"
          />
          <!-- Selected files chips -->
          <div v-if="checkedFiles.length" class="brd-gen__chips">
            <el-tag
              v-for="f in checkedFiles"
              :key="f.path"
              size="small"
              closable
              @close="removeFile(f)"
            >
              {{ f.path }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- ── Generate button ────────────────────────────────────────── -->
      <div class="brd-gen__actions">
        <el-button
          type="primary"
          :icon="MagicStick"
          :loading="generating"
          :disabled="!canGenerate"
          @click="handleGenerate"
        >
          {{ generating ? $t("brdGenerate.generating") : $t("brdGenerate.generate") }}
        </el-button>
      </div>

      <!-- ── Error ──────────────────────────────────────────────────── -->
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        closable
        class="brd-gen__error"
        @close="error = ''"
      />

      <!-- ── Preview ────────────────────────────────────────────────── -->
      <div v-if="generatedData" class="brd-gen__preview">
        <el-divider content-position="left">
          <span class="brd-gen__preview-divider">{{ $t("brdGenerate.preview") }}</span>
        </el-divider>

        <!-- Title -->
        <div class="brd-gen__preview-title">
          <label>{{ $t("brdGenerate.generatedTitle") }}</label>
          <el-input v-model="generatedData.title" />
        </div>

        <!-- Meta summary -->
        <div class="brd-gen__preview-meta">
          <label>{{ $t("brdGenerate.metaSummary") }}</label>
          <table class="brd-gen__meta-table">
            <tbody>
              <tr v-for="kv in keyMetaFields" :key="kv.key">
                <th>{{ kv.label }}</th>
                <td>{{ kv.value || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Content preview -->
        <el-collapse v-model="previewCollapse">
          <el-collapse-item name="content" :title="$t('brdGenerate.contentPreview')">
            <div class="brd-gen__md" v-html="contentHtml" />
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">{{ $t("brdGenerate.cancel") }}</el-button>
      <el-button
        type="primary"
        :disabled="!generatedData"
        @click="handleConfirm"
      >
        {{ $t("brdGenerate.confirmCreate") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="BrdGenerateDialog">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { MagicStick, Document, Folder } from "@element-plus/icons-vue";
import type { ElTree } from "element-plus";
import { scanKnowledge, readKnowledgeFile } from "@/api/modules/knowledgeService";
import { chat } from "@/api/modules/chatService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { brdMetaSchemas } from "@/views/brd/meta-schemas";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";

const { t } = useI18n();
const { render } = useMarkdown();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "confirm", data: { title: string; meta: Record<string, any>; content: string; tags: string[] }): void;
}>();

// ── Knowledge base tree ────────────────────────────────────────────────────

interface TreeNode {
  id: string;
  label: string;
  path?: string;
  children?: TreeNode[];
}

const treeRef = ref<InstanceType<typeof ElTree>>();
const scanning = ref(false);
const treeData = ref<TreeNode[]>([]);
const flatFiles = ref<KnowledgeFileEntry[]>([]);
const checkedFiles = ref<KnowledgeFileEntry[]>([]);

// Map flat file IDs to entries
const fileMap = computed<Record<string, KnowledgeFileEntry>>(() => {
  const m: Record<string, KnowledgeFileEntry> = {};
  for (const f of flatFiles.value) {
    m[f.path] = f;
  }
  return m;
});

async function loadKnowledgeTree() {
  scanning.value = true;
  try {
    const res = await scanKnowledge();
    flatFiles.value = [];
    const nodes: TreeNode[] = [];

    for (const cat of res.categories ?? []) {
      const children: TreeNode[] = [];
      for (const f of cat.files ?? []) {
        flatFiles.value.push(f);
        children.push({
          id: f.path,
          label: f.name,
          path: f.path
        });
      }
      nodes.push({
        id: `cat:${cat.category}`,
        label: cat.category,
        children
      });
    }
    treeData.value = nodes;
  } catch (err: any) {
    // Knowledge scan failed — tree stays empty; user can still use description-only mode
    treeData.value = [];
  } finally {
    scanning.value = false;
  }
}

function onTreeCheck(_: any, checked: { checkedNodes: TreeNode[] }) {
  checkedFiles.value = checked.checkedNodes
    .filter(n => n.path && fileMap.value[n.path])
    .map(n => fileMap.value[n.path]);
}

function removeFile(f: KnowledgeFileEntry) {
  checkedFiles.value = checkedFiles.value.filter(x => x.path !== f.path);
  treeRef.value?.setChecked(f.path, false, false);
}

// ── Description ────────────────────────────────────────────────────────────

const description = ref("");

const canGenerate = computed(() => description.value.trim().length > 0);

// ── Generation ─────────────────────────────────────────────────────────────

const generating = ref(false);
const error = ref("");
const generatedData = ref<{ title: string; meta: Record<string, any>; content: string } | null>(null);
const previewCollapse = ref<string[]>([]);

const contentHtml = computed(() => {
  if (!generatedData.value?.content) return "";
  return render(generatedData.value.content);
});

// Extract key meta fields for the summary table
const keyMetaFields = computed(() => {
  if (!generatedData.value?.meta) return [];
  const schema = brdMetaSchemas["brd-documents"]?.metaFields ?? [];
  const keyKeys = new Set([
    "document_id", "version", "priority", "status",
    "primary_domain", "country", "department", "urgency_level"
  ]);
  // First show key fields from schema order, then remaining non-empty fields
  const seen = new Set<string>();
  const rows: { key: string; label: string; value: string }[] = [];

  // Key fields in schema order
  for (const f of schema) {
    if (keyKeys.has(f.key) && generatedData.value.meta[f.key]) {
      seen.add(f.key);
      rows.push({ key: f.key, label: f.label, value: String(generatedData.value.meta[f.key]) });
    }
  }
  // Remaining non-empty fields
  for (const [k, v] of Object.entries(generatedData.value.meta)) {
    if (!seen.has(k) && v) {
      rows.push({ key: k, label: k, value: String(v) });
    }
  }
  return rows.slice(0, 12); // Limit preview rows
});

function buildSystemPrompt(): string {
  const schema = brdMetaSchemas["brd-documents"];
  const fieldDefs = (schema.metaFields ?? []).map(f =>
    `  - ${f.key} (${f.type}${f.required ? ", required" : ""}): ${f.label}`
  ).join("\n");

  return `You are a BRD (Business Requirements Document) generator. Output ONLY a single valid JSON object (no markdown fences, no extra text) with this schema:

{
  "title": "Concise, descriptive BRD title",
  "meta": {
    "document_id": "BRD-YYYY-NNN format",
    "title": "Same as top-level title",
    "version": "1.0",
    "version_date": "YYYY-MM-DD",
    "change_summary": "Initial draft — AI generated",
    "business_owner_name": "Full name",
    "business_owner_title": "Title / Role",
    "business_owner_dept": "Department name",
    "author": "Name — Role",
    "department": "department value",
    "priority": "p0|p1|p2|p3",
    "status": "draft",
    "primary_domain": "domain value",
    "secondary_domain": "domain value or empty",
    "primary_country": "country code",
    "secondary_country": "country code or empty",
    "brand": "Brand name(s)",
    "expected_golive": "YYYY-MM-DD or empty",
    "related_brds": "Related BRD references or empty",
    "created_date": "YYYY-MM-DD",
    "last_reviewed_date": "YYYY-MM-DD",
    "regulatory_context": "Applicable regulations summary",
    "executive_summary": "3-5 sentence executive overview",
    "business_background": "Market/organisational context with metrics",
    "current_state": "As-is process description with pain points",
    "business_problem": "Problem statement with quantified impact",
    "proposed_solution": "High-level solution description",
    "expected_outcomes": "3-5 quantified outcomes",
    "constraints": "Hard constraints (budget, timeline, tech, regulatory)",
    "assumptions": "Key assumptions with fallback notes",
    "dependencies": "External dependencies with owners and delivery dates",
    "budget_info": "Budget information or TBC",
    "urgency_level": "p0|p1|p2|p3",
    "estimated_effort": "Estimated person-months or TBC",
    "risk_summary": "Top 3-5 risks with mitigations",
    "affected_teams": "Affected teams / user groups",
    "affected_systems": "Affected systems / integrations",
    "affected_processes": "Affected business processes",
    "training_requirements": "Training & communication needs",
    "migration_effort": "Data migration & cutover effort",
    "attachment_links": [],
    "glossary_terms": []
  },
  "content": "# Business Requirements Document\\n\\n...(full 12-section markdown body, 3000-5000 words, following standard BRD structure: Document Control, Executive Summary, Business Context & Problem Statement, Project Scope, Stakeholder Analysis, Requirements Overview, Business Rules Summary, Constraints/Assumptions/Dependencies, Change Impact Assessment, Business Objectives & Success Metrics, Risk Assessment, Milestone Plan, Glossary & References)"
}

Available meta fields:
${fieldDefs}

Rules:
1. Use concrete, quantified data. Avoid filler phrases.
2. If user input lacks information, write "[TBC]" instead of fabricating critical facts.
3. All dates use YYYY-MM-DD format.
4. Set status to "draft", version to "1.0".
5. Generate realistic, domain-appropriate content based on the provided knowledge base files.
6. The content field must contain the full markdown body — NOT a placeholder.`;
}

async function handleGenerate() {
  if (!canGenerate.value) return;
  generating.value = true;
  error.value = "";
  generatedData.value = null;

  try {
    // Fetch selected knowledge file contents
    const fileContents: string[] = [];
    for (const f of checkedFiles.value) {
      try {
        const file = await readKnowledgeFile(f.path);
        if (file.content) {
          fileContents.push(`### ${f.path}\n\n${file.content}`);
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Build user prompt
    let userPrompt = `Generate a BRD document entry based on the following description:\n\n${description.value}`;

    if (fileContents.length > 0) {
      // Truncate each file to ~3000 chars to keep prompt manageable
      const truncated = fileContents.map(c => c.length > 3000 ? c.slice(0, 3000) + "\n\n...(truncated)" : c);
      userPrompt += `\n\nReference knowledge base files:\n\n${truncated.join("\n\n---\n\n")}`;
    }

    // Call AI
    const response = await chat({
      model: "qwen3.5",
      messages: [
        { type: "user", message: userPrompt }
      ],
      system: buildSystemPrompt()
    });

    // Parse JSON from response
    let jsonStr = response.trim();

    // Strip markdown code fences if present
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    // Try to find JSON object boundaries
    const objStart = jsonStr.indexOf("{");
    const objEnd = jsonStr.lastIndexOf("}");
    if (objStart >= 0 && objEnd > objStart) {
      jsonStr = jsonStr.slice(objStart, objEnd + 1);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      error.value = t("brdGenerate.parseError", { msg: String(parseErr) });
      console.error("BRD generation parse error. Raw response:", response);
      return;
    }

    if (!parsed.title || !parsed.content) {
      error.value = t("brdGenerate.incompleteData");
      return;
    }

    generatedData.value = {
      title: parsed.title,
      meta: parsed.meta ?? {},
      content: parsed.content
    };
  } catch (err: any) {
    error.value = t("brdGenerate.generateError", { msg: err.message || String(err) });
  } finally {
    generating.value = false;
  }
}

function handleConfirm() {
  if (!generatedData.value) return;
  emit("confirm", {
    title: generatedData.value.title,
    meta: generatedData.value.meta,
    content: generatedData.value.content,
    tags: []
  });
}

function handleCancel() {
  emit("update:visible", false);
}

// Reset state when dialog opens
watch(() => props.visible, (v) => {
  if (v) {
    if (treeData.value.length === 0) {
      loadKnowledgeTree();
    }
    description.value = "";
    checkedFiles.value = [];
    generatedData.value = null;
    error.value = "";
    previewCollapse.value = [];
  }
});
</script>

<style scoped lang="scss">
.brd-gen {
  min-height: 400px;
}

// ── Top: side-by-side layout ─────────────────────────────────────────────

.brd-gen__top {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.brd-gen__kb {
  flex: 0 0 380px;
  min-width: 0;
}

.brd-gen__kb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
}

.brd-gen__kb-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.brd-gen__kb-tree {
  max-height: 340px;
  overflow: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 8px;
  background: var(--el-bg-color);
}

.brd-gen__tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .el-icon {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }
}

// ── Description ──────────────────────────────────────────────────────────

.brd-gen__desc {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
  }
}

.brd-gen__desc-input {
  flex: 1;

  :deep(.el-textarea__inner) {
    height: 100%;
    min-height: 200px;
    resize: none;
  }
}

.brd-gen__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

// ── Actions ──────────────────────────────────────────────────────────────

.brd-gen__actions {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.brd-gen__error {
  margin-bottom: 16px;
}

// ── Preview ──────────────────────────────────────────────────────────────

.brd-gen__preview {
  margin-top: 8px;
}

.brd-gen__preview-divider {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.brd-gen__preview-title {
  margin-bottom: 12px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }
}

.brd-gen__preview-meta {
  margin-bottom: 12px;

  > label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }
}

.brd-gen__meta-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th, td {
    padding: 4px 10px;
    border: 1px solid var(--el-border-color-lighter);
    text-align: left;
  }

  th {
    background: var(--el-fill-color);
    font-weight: 500;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    width: 140px;
  }

  td {
    color: var(--el-text-color-primary);
    word-break: break-word;
  }
}

// ── Markdown preview ───────────────────────────────────────────────────

.brd-gen__md {
  max-height: 360px;
  overflow: auto;
  padding: 16px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-primary);

  :deep(h1), :deep(h2), :deep(h3) {
    margin: 1em 0 0.4em;
    color: var(--el-text-color-primary);
  }
  :deep(h1) { font-size: 1.4em; border-bottom: 1px solid var(--el-border-color-lighter); padding-bottom: 0.3em; }
  :deep(h2) { font-size: 1.15em; }
  :deep(h3) { font-size: 1em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(ul), :deep(ol) { padding-left: 1.5em; }
  :deep(code) {
    padding: 1px 5px;
    background: var(--el-color-primary-light-9);
    border-radius: 3px;
    font-size: 0.88em;
  }
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 0.5em 0;
    th, td {
      padding: 4px 8px;
      border: 1px solid var(--el-border-color-lighter);
      text-align: left;
      font-size: 11px;
    }
    th {
      background: var(--el-fill-color);
      font-weight: 600;
    }
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 8px 14px;
    border-left: 3px solid var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
</style>
