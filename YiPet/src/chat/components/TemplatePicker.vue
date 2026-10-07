<script setup lang="ts">
/**
 * YiPet TemplatePicker — 8 built-in prompt templates + custom user templates.
 * Mirrors YiVad aiChat TemplatePicker: category tabs, search, variable form, preview,
 * custom template add/delete.
 */
import { ref, computed } from 'vue';
import { Collection, Search, Check, Plus, Delete } from '@element-plus/icons-vue';
import { useChatStore } from '../stores/chat';

const store = useChatStore();

const visible = ref(false);
const search = ref('');
const activeCategory = ref<string | null>(null);

interface Template {
  name: string; category: string; icon: string; content: string; variables: string[];
}

const CATEGORIES = [
  { key: 'code', label: 'Code', icon: '💻' },
  { key: 'docs', label: 'Documents', icon: '📄' },
  { key: 'qa', label: 'Q&A', icon: '❓' },
  { key: 'analysis', label: 'Analysis', icon: '📊' },
];

const BUILTIN_TEMPLATES: Template[] = [
  {
    name: 'Code Review', category: 'code', icon: '🔍',
    content: 'Review the following code for bugs, performance issues, and best practices. For each issue found, explain why it\'s a problem and suggest a fix.\n\n```\n{{code}}\n```',
    variables: ['code'],
  },
  {
    name: 'Bug Analysis', category: 'code', icon: '🐛',
    content: 'Analyze this bug report and suggest root causes and fixes.\n\n**Bug description:** {{description}}\n**Error message:** {{error}}\n**Environment:** {{env}}',
    variables: ['description', 'error', 'env'],
  },
  {
    name: 'Write PRD', category: 'docs', icon: '📝',
    content: 'Write a product requirements document for the following feature. Include: background, user stories, acceptance criteria, and non-functional requirements.\n\n**Feature:** {{feature}}\n**Target users:** {{users}}',
    variables: ['feature', 'users'],
  },
  {
    name: 'API Documentation', category: 'docs', icon: '📋',
    content: 'Generate API documentation for the following endpoint. Include: method, path, parameters, request/response examples, and error codes.\n\n**Endpoint:** {{endpoint}}\n**Method:** {{method}}',
    variables: ['endpoint', 'method'],
  },
  {
    name: 'Knowledge Q&A', category: 'qa', icon: '📚',
    content: 'Answer the following question using the knowledge base context files attached.\n\n**Question:** {{question}}\n\nPlease cite specific sources using [N] notation.',
    variables: ['question'],
  },
  {
    name: 'Explain Concept', category: 'qa', icon: '💡',
    content: 'Explain {{concept}} in simple terms. Include:\n- A one-sentence summary\n- A detailed explanation with examples\n- Common misconceptions\n- When to use this concept',
    variables: ['concept'],
  },
  {
    name: 'Data Analysis', category: 'analysis', icon: '📈',
    content: 'Analyze the following data and provide insights. Include trends, outliers, and recommendations.\n\n**Data:**\n```\n{{data}}\n```\n\n**Analysis goals:** {{goals}}',
    variables: ['data', 'goals'],
  },
  {
    name: 'Summarize Content', category: 'analysis', icon: '📊',
    content: 'Summarize the following content in {{format}}. Focus on key points and actionable insights.\n\n**Content:**\n{{content}}',
    variables: ['content', 'format'],
  },
];

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -2)))];
}

const templates = computed(() => {
  const all = [...BUILTIN_TEMPLATES, ...store.state.promptTemplates.map(t => ({
    name: t.name,
    category: 'custom',
    icon: '✨',
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

// ── Selected template + variable filling ──
const selected = ref<Template | null>(null);
const varValues = ref<Record<string, string>>({});
const preview = computed(() => {
  if (!selected.value) return '';
  let text = selected.value.content;
  for (const [key, val] of Object.entries(varValues.value)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`);
  }
  return text;
});

function selectTemplate(t: Template) {
  selected.value = t;
  varValues.value = {};
  for (const v of t.variables) varValues.value[v] = '';
}

function applyTemplate() {
  if (!selected.value) return;
  let text = selected.value.content;
  for (const [key, val] of Object.entries(varValues.value)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`);
  }
  store.state.inputText = text;
  visible.value = false;
  selected.value = null;
}

function onOpen() {
  search.value = '';
  activeCategory.value = null;
  selected.value = null;
}

// ── Custom template form ──
const showAddForm = ref(false);
const newTemplateName = ref('');
const newTemplateContent = ref('');
const addError = ref('');

function openAddForm() {
  newTemplateName.value = '';
  newTemplateContent.value = '';
  addError.value = '';
  showAddForm.value = true;
}

function confirmAddTemplate() {
  const name = newTemplateName.value.trim();
  const content = newTemplateContent.value.trim();
  if (!name) { addError.value = 'Name is required'; return; }
  if (!content) { addError.value = 'Content is required'; return; }
  if (!store.addPromptTemplate(name, content)) {
    addError.value = `Template "${name}" already exists`;
    return;
  }
  showAddForm.value = false;
  newTemplateName.value = '';
  newTemplateContent.value = '';
  addError.value = '';
}

function deleteCustomTemplate(name: string) {
  store.removePromptTemplate(name);
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-start"
    :width="420"
    trigger="click"
    :teleported="true"
    popper-class="tp-pop"
    @show="onOpen"
  >
    <template #reference>
      <el-button circle size="default" :icon="Collection" title="Prompt templates" />
    </template>

    <div class="tp-panel">
      <!-- Search -->
      <div class="tp-search">
        <el-input v-model="search" size="small" placeholder="Search templates..." :prefix-icon="Search" clearable />
      </div>

      <!-- Category tabs -->
      <div class="tp-cats">
        <button class="tp-cat" :class="{ active: !activeCategory }" @click="activeCategory = null">All</button>
        <button v-for="cat in CATEGORIES" :key="cat.key" class="tp-cat" :class="{ active: activeCategory === cat.key }" @click="activeCategory = cat.key">{{ cat.icon }} {{ cat.label }}</button>
      </div>

      <!-- Template list -->
      <div v-if="!selected && !showAddForm" class="tp-list">
        <button v-for="t in templates" :key="t.name" class="tp-card" @click="selectTemplate(t)">
          <span class="tp-card-icon">{{ t.icon }}</span>
          <div class="tp-card-body">
            <span class="tp-card-name">{{ t.name }}</span>
            <span class="tp-card-vars">{{ t.variables.length ? t.variables.join(', ') : 'No parameters' }}</span>
          </div>
          <span class="tp-card-cat">{{ t.category }}</span>
          <button
            v-if="t.category === 'custom'"
            class="tp-card-del"
            title="Delete custom template"
            @click.stop="deleteCustomTemplate(t.name)"
          >
            <el-icon :size="12"><Delete /></el-icon>
          </button>
        </button>
        <div v-if="!templates.length" class="tp-empty">No templates match your search</div>

        <!-- Add custom template button -->
        <button class="tp-card tp-card--add" @click="openAddForm">
          <el-icon :size="16"><Plus /></el-icon>
          <span class="tp-card-name">Create custom template</span>
        </button>
      </div>

      <!-- Add custom template form -->
      <div v-else-if="showAddForm && !selected" class="tp-form">
        <div class="tp-form-back">
          <el-button size="small" text @click="showAddForm = false">&larr; Back to templates</el-button>
        </div>
        <div class="tp-form-header">
          <span class="tp-form-name">New Custom Template</span>
        </div>
        <div class="tp-form-field">
          <label>Name</label>
          <el-input v-model="newTemplateName" size="small" placeholder="Template name..." />
        </div>
        <div class="tp-form-field">
          <label>Content (wrap variables in curly braces: { '{' }name, age{ '}' })</label>
          <el-input v-model="newTemplateContent" type="textarea" :rows="5" size="small" placeholder="Write your template content with {{placeholders}}..." />
        </div>
        <div v-if="addError" class="tp-form-error">{{ addError }}</div>
        <div class="tp-form-actions">
          <el-button size="small" @click="showAddForm = false">Cancel</el-button>
          <el-button size="small" type="primary" :icon="Plus" @click="confirmAddTemplate">Add</el-button>
        </div>
      </div>

      <!-- Variable form -->
      <div v-else-if="selected" class="tp-form">
        <div class="tp-form-back">
          <el-button size="small" text @click="selected = null">&larr; Back to templates</el-button>
        </div>
        <div class="tp-form-header">
          <span class="tp-form-icon">{{ selected.icon }}</span>
          <span class="tp-form-name">{{ selected.name }}</span>
        </div>
        <div v-for="v in selected.variables" :key="v" class="tp-form-field">
          <label>{{ v }}</label>
          <el-input v-model="varValues[v]" size="small" :placeholder="`Enter ${v}...`" />
        </div>
        <div v-if="preview" class="tp-form-preview">
          <div class="tp-form-preview-label">Preview</div>
          <pre class="tp-form-preview-text">{{ preview }}</pre>
        </div>
        <div class="tp-form-actions">
          <el-button size="small" @click="selected = null">Cancel</el-button>
          <el-button size="small" type="primary" :icon="Check" @click="applyTemplate">Apply</el-button>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.tp-panel { display: flex; flex-direction: column; max-height: 420px; overflow: hidden; }
.tp-search { padding: 8px 10px; border-bottom: 1px solid var(--yp-border-subtle, #e4e7ed); }
.tp-cats { display: flex; gap: 4px; padding: 6px 10px; border-bottom: 1px solid var(--yp-border-subtle, #e4e7ed); overflow-x: auto; }
.tp-cat {
  flex-shrink: 0; padding: 3px 8px; font-size: 11px; color: var(--yp-text-secondary, #909399);
  cursor: pointer; background: none; border: 1px solid var(--yp-border-subtle, #e4e7ed);
  border-radius: 10px; transition: all 0.15s; white-space: nowrap;
}
.tp-cat:hover { color: var(--yp-color-primary, #a78bfa); border-color: var(--yp-border-focus, #a78bfa); }
.tp-cat.active { color: #fff; background: var(--yp-color-primary, #a78bfa); border-color: var(--yp-color-primary, #a78bfa); }
.tp-list { display: flex; flex-direction: column; gap: 1px; padding: 4px; overflow-y: auto; max-height: 280px; }
.tp-card {
  display: flex; gap: 8px; align-items: center; width: 100%; padding: 8px 10px;
  cursor: pointer; background: none; border: none; border-radius: 6px; text-align: left;
  transition: background 0.12s;
}
.tp-card:hover { background: var(--yp-surface-raised, #f5f7fa); }
.tp-card--add {
  justify-content: center; padding: 10px; margin-top: 4px; color: var(--yp-color-primary, #a78bfa);
  border: 1px dashed var(--yp-border-subtle, #e4e7ed); gap: 6px;
}
.tp-card--add:hover { background: var(--yp-surface-raised, #f5f7fa); border-color: var(--yp-color-primary, #a78bfa); }
.tp-card-icon { font-size: 16px; flex-shrink: 0; }
.tp-card-body { display: flex; flex: 1; flex-direction: column; gap: 1px; min-width: 0; }
.tp-card-name { font-size: 12px; font-weight: 600; color: var(--yp-text-primary, #303133); }
.tp-card-vars { font-size: 10px; color: var(--yp-text-placeholder, #c0c4cc); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tp-card-cat { flex-shrink: 0; padding: 1px 5px; font-size: 9px; font-weight: 500; color: var(--yp-text-placeholder, #c0c4cc); background: var(--yp-surface-sunken, #f0f2f5); border-radius: 3px; }
.tp-card-del {
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; padding: 0; cursor: pointer; background: none; border: none;
  border-radius: 4px; color: var(--yp-text-placeholder, #c0c4cc); transition: all 0.12s;
}
.tp-card-del:hover { color: var(--el-color-danger, #f56c6c); background: var(--el-color-danger-light-9, #fef0f0); }
.tp-empty { padding: 20px; text-align: center; font-size: 12px; color: var(--yp-text-placeholder, #c0c4cc); }
.tp-form { display: flex; flex-direction: column; gap: 8px; padding: 6px 10px 10px; overflow-y: auto; max-height: 340px; }
.tp-form-back { margin-bottom: 2px; }
.tp-form-header { display: flex; gap: 6px; align-items: center; }
.tp-form-icon { font-size: 18px; }
.tp-form-name { font-size: 14px; font-weight: 700; color: var(--yp-text-primary, #303133); }
.tp-form-field { display: flex; flex-direction: column; gap: 3px; }
.tp-form-field label { font-size: 11px; font-weight: 600; color: var(--yp-text-secondary, #909399); text-transform: capitalize; }
.tp-form-error { font-size: 11px; color: var(--el-color-danger, #f56c6c); padding: 2px 0; }
.tp-form-preview { display: flex; flex-direction: column; gap: 3px; }
.tp-form-preview-label { font-size: 10px; font-weight: 600; color: var(--yp-text-placeholder, #c0c4cc); text-transform: uppercase; letter-spacing: 0.4px; }
.tp-form-preview-text {
  padding: 8px; font-size: 11px; line-height: 1.5; color: var(--yp-text-regular, #606266);
  white-space: pre-wrap; background: var(--yp-surface-sunken, #f0f2f5); border-radius: 4px;
  max-height: 120px; overflow-y: auto; margin: 0;
}
.tp-form-actions { display: flex; gap: 6px; justify-content: flex-end; padding-top: 6px; border-top: 1px solid var(--yp-border-subtle, #e4e7ed); }
</style>