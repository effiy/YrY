<script setup lang="ts" name="aiChatTemplatePicker">
import { ref, computed } from "vue";
import {
  Collection,
  Search,
  Document,
  Tickets,
  EditPen,
  DataAnalysis,
  Plus,
  Delete,
  Check
} from "@element-plus/icons-vue";
import { useAiChatStore } from "@/stores/modules/aiChat";

const store = useAiChatStore();

const visible = ref(false);
const search = ref("");
const activeCategory = ref<string | null>(null);

// ── Built-in templates ──
interface Template {
  name: string;
  category: string;
  icon: string;
  content: string;
  variables: string[];
}

const CATEGORIES = [
  { key: "code", label: "Code", icon: "💻" },
  { key: "docs", label: "Documents", icon: "📄" },
  { key: "qa", label: "Q&A", icon: "❓" },
  { key: "analysis", label: "Analysis", icon: "📊" },
];

const BUILTIN_TEMPLATES: Template[] = [
  {
    name: "Code Review",
    category: "code",
    icon: "🔍",
    content: "Review the following code for bugs, performance issues, and best practices. For each issue found, explain why it's a problem and suggest a fix.\n\n```\n{{code}}\n```",
    variables: ["code"],
  },
  {
    name: "Bug Analysis",
    category: "code",
    icon: "🐛",
    content: "Analyze this bug report and suggest root causes and fixes.\n\n**Bug description:** {{description}}\n**Error message:** {{error}}\n**Environment:** {{env}}",
    variables: ["description", "error", "env"],
  },
  {
    name: "Write PRD",
    category: "docs",
    icon: "📝",
    content: "Write a product requirements document for the following feature. Include: background, user stories, acceptance criteria, and non-functional requirements.\n\n**Feature:** {{feature}}\n**Target users:** {{users}}",
    variables: ["feature", "users"],
  },
  {
    name: "API Documentation",
    category: "docs",
    icon: "📋",
    content: "Generate API documentation for the following endpoint. Include: method, path, parameters, request/response examples, and error codes.\n\n**Endpoint:** {{endpoint}}\n**Method:** {{method}}",
    variables: ["endpoint", "method"],
  },
  {
    name: "Knowledge Q&A",
    category: "qa",
    icon: "📚",
    content: "Answer the following question using the knowledge base context files attached.\n\n**Question:** {{question}}\n\nPlease cite specific sources using [N] notation.",
    variables: ["question"],
  },
  {
    name: "Explain Concept",
    category: "qa",
    icon: "💡",
    content: "Explain {{concept}} in simple terms. Include:\n- A one-sentence summary\n- A detailed explanation with examples\n- Common misconceptions\n- When to use this concept",
    variables: ["concept"],
  },
  {
    name: "Data Analysis",
    category: "analysis",
    icon: "📈",
    content: "Analyze the following data and provide insights. Include trends, outliers, and recommendations.\n\n**Data:**\n```\n{{data}}\n```\n\n**Analysis goals:** {{goals}}",
    variables: ["data", "goals"],
  },
  {
    name: "Summarize Content",
    category: "analysis",
    icon: "📊",
    content: "Summarize the following content in {{format}}. Focus on key points and actionable insights.\n\n**Content:**\n{{content}}",
    variables: ["content", "format"],
  },
];

const templates = computed(() => {
  const all = [...BUILTIN_TEMPLATES, ...store.promptTemplates.map(t => ({
    name: t.name,
    category: "custom",
    icon: "✨",
    content: t.content,
    variables: extractVariables(t.content),
  }))];
  let filtered = all;
  if (activeCategory.value) {
    filtered = filtered.filter(t => t.category === activeCategory.value);
  }
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q));
  }
  return filtered;
});

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -2)))];
}

// ── Selected template + variable filling ──
const selected = ref<Template | null>(null);
const varValues = ref<Record<string, string>>({});
const preview = computed(() => {
  if (!selected.value) return "";
  let text = selected.value.content;
  for (const [key, val] of Object.entries(varValues.value)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || `{{${key}}}`);
  }
  return text;
});

function selectTemplate(t: Template) {
  selected.value = t;
  varValues.value = {};
  for (const v of t.variables) {
    varValues.value[v] = "";
  }
}

function applyTemplate() {
  if (!selected.value) return;
  let text = selected.value.content;
  for (const [key, val] of Object.entries(varValues.value)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || `{{${key}}}`);
  }
  store.input = text;
  visible.value = false;
  selected.value = null;
}

function onOpen() {
  search.value = "";
  activeCategory.value = null;
  selected.value = null;
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    :width="480"
    trigger="click"
    :teleported="true"
    popper-class="tp-pop"
    @show="onOpen"
  >
    <template #reference>
      <el-button circle size="default" :icon="Collection" title="Templates" />
    </template>

    <div class="tp-panel">
      <!-- Search -->
      <div class="tp-search">
        <el-input v-model="search" size="small" placeholder="Search templates..." :prefix-icon="Search" clearable />
      </div>

      <!-- Category tabs -->
      <div class="tp-cats">
        <button
          class="tp-cat"
          :class="{ active: !activeCategory }"
          @click="activeCategory = null"
        >All</button>
        <button
          v-for="cat in CATEGORIES"
          :key="cat.key"
          class="tp-cat"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <!-- Template list -->
      <div v-if="!selected" class="tp-list">
        <button
          v-for="t in templates"
          :key="t.name"
          class="tp-card"
          @click="selectTemplate(t)"
        >
          <span class="tp-card-icon">{{ t.icon }}</span>
          <div class="tp-card-body">
            <span class="tp-card-name">{{ t.name }}</span>
            <span class="tp-card-vars">{{ t.variables.length ? t.variables.join(", ") : "No parameters" }}</span>
          </div>
          <span class="tp-card-cat">{{ t.category }}</span>
        </button>
        <div v-if="!templates.length" class="tp-empty">
          <span>No templates match your search</span>
        </div>
      </div>

      <!-- Variable form -->
      <div v-else class="tp-form">
        <div class="tp-form-back">
          <el-button size="small" text @click="selected = null">← Back to templates</el-button>
        </div>
        <div class="tp-form-header">
          <span class="tp-form-icon">{{ selected.icon }}</span>
          <span class="tp-form-name">{{ selected.name }}</span>
        </div>

        <!-- Variables -->
        <div v-for="v in selected.variables" :key="v" class="tp-form-field">
          <label>{{ v }}</label>
          <el-input v-model="varValues[v]" size="small" :placeholder="`Enter ${v}...`" />
        </div>

        <!-- Preview -->
        <div v-if="preview" class="tp-form-preview">
          <div class="tp-form-preview-label">Preview</div>
          <pre class="tp-form-preview-text">{{ preview }}</pre>
        </div>

        <!-- Actions -->
        <div class="tp-form-actions">
          <el-button @click="selected = null">Cancel</el-button>
          <el-button type="primary" :icon="Check" @click="applyTemplate">Apply</el-button>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.tp-panel {
  display: flex;
  flex-direction: column;
  max-height: 480px;
  overflow: hidden;
}
.tp-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.tp-cats {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  overflow-x: auto;
}
.tp-cat {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: none;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  transition: all var(--transition-fast);
  white-space: nowrap;
  &:hover { color: var(--el-color-primary); border-color: var(--el-color-primary-light-5); }
  &.active {
    color: var(--el-color-white);
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}
.tp-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  overflow-y: auto;
  max-height: 320px;
}
.tp-card {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  text-align: left;
  transition: background var(--transition-fast);
  &:hover { background: var(--el-fill-color-lighter); }
}
.tp-card-icon { font-size: 18px; flex-shrink: 0; }
.tp-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tp-card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.tp-card-vars {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tp-card-cat {
  flex-shrink: 0;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: var(--radius-xs);
}
.tp-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
// ── Form ──
.tp-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 12px 12px;
  overflow-y: auto;
  max-height: 400px;
}
.tp-form-back { margin-bottom: 4px; }
.tp-form-header {
  display: flex;
  gap: 8px;
  align-items: center;
}
.tp-form-icon { font-size: 20px; }
.tp-form-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.tp-form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: capitalize;
  }
}
.tp-form-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tp-form-preview-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tp-form-preview-text {
  padding: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  background: var(--el-fill-color-lighter);
  border-radius: var(--radius-sm);
  max-height: 160px;
  overflow-y: auto;
  margin: 0;
}
.tp-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>