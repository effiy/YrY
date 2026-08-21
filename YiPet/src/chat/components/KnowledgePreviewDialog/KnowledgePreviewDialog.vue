<script setup lang="ts">
/**
 * YiPet Chat — KnowledgePreviewDialog (Vue 3 SFC)
 * Full-screen knowledge-file preview, mirroring YiVad aiChat's
 * KnowledgePreviewDialog: toolbar (back / path / Edit-Split-Preview / download
 * / close), frontmatter meta strip, classification breadcrumbs, markdown
 * preview with a TOC sidebar, edit + save, split sync-scroll, and internal-link
 * navigation. Plain HTML/CSS (no Element Plus), markdown via `renderMarkdown`.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useChatStore } from '../../stores/chat';
import { addCodeCopyButtons, renderMarkdown, runMermaid } from '../../utils';
import type { KnowledgeFrontmatter } from '@/api/types';

const store = useChatStore();
const s = store.state;

type Mode = 'preview' | 'edit' | 'split';

const mode = ref<Mode>('preview');
const editContent = ref('');
const navHistory = ref<string[]>([]);
const tocCollapsed = ref(false);
const saving = ref(false);
const toc = ref<{ level: number; text: string; id: string }[]>([]);
const previewRef = ref<HTMLElement | null>(null);
const editorRef = ref<HTMLTextAreaElement | null>(null);

/** Path we navigated to ourselves (back/related) — suppresses history reset. */
let pendingPath: string | null = null;

const path = computed(() => s.knowledgePreviewData?.path ?? s.knowledgePreviewPath);
const rawContent = computed(() => s.knowledgePreviewData?.content ?? '');
const metaObj = computed(() => (s.knowledgePreviewData?.meta ?? {}) as KnowledgeFrontmatter);

const displayHtml = computed(() => renderMarkdown(rawContent.value));
const previewHtml = computed(() => renderMarkdown(editContent.value));
const showToc = computed(() => mode.value === 'preview' && toc.value.length >= 3);

// ── Frontmatter meta strip ──

const benefit = computed(() =>
  typeof metaObj.value.benefit === 'string' ? metaObj.value.benefit.trim() : '',
);
const tacitStatement = computed(() =>
  typeof metaObj.value.tacit === 'string' ? metaObj.value.tacit.trim() : '',
);
const criteria = computed<string[]>(() =>
  Array.isArray(metaObj.value.acceptance_criteria)
    ? metaObj.value.acceptance_criteria.map(String)
    : [],
);
const roles = computed<string[]>(() =>
  Array.isArray(metaObj.value.roles) ? metaObj.value.roles.map(String) : [],
);
const tags = computed<string[]>(() =>
  Array.isArray(metaObj.value.tags) ? metaObj.value.tags.map(String) : [],
);

type Badge = { label: string; value: string; tone: 'success' | 'warning' | 'info' };
const badges = computed<Badge[]>(() => {
  const m = metaObj.value;
  const out: Badge[] = [];
  if (m.status) out.push({ label: 'status', value: String(m.status), tone: m.status === 'stable' ? 'success' : 'info' });
  if (m.lifecycle) out.push({ label: 'lifecycle', value: String(m.lifecycle), tone: m.lifecycle === 'active' ? 'success' : 'warning' });
  if (m.review_cycle) out.push({ label: 'review', value: String(m.review_cycle), tone: 'info' });
  if (m.tacit === true) out.push({ label: 'tacit', value: 'yes', tone: 'warning' });
  if (m.type) out.push({ label: 'type', value: String(m.type), tone: 'info' });
  if (criteria.value.length) out.push({ label: 'criteria', value: String(criteria.value.length), tone: 'info' });
  return out;
});

const related = computed(() => {
  const r = metaObj.value.related;
  if (!Array.isArray(r) || !r.length) return [] as { raw: string; path: string | null; href: string | null }[];
  return r.map((raw) => {
    const str = String(raw);
    const isExternal = /^(https?:|mailto:|tel:)/i.test(str);
    return { raw: str, path: resolvePath(str), href: isExternal ? str : null };
  });
});

const hasMeta = computed(
  () =>
    !!benefit.value ||
    !!tacitStatement.value ||
    !!badges.value.length ||
    !!roles.value.length ||
    !!tags.value.length ||
    !!related.value.length,
);

const criteriaTip = computed(() => criteria.value.join('\n'));

// ── Classification breadcrumbs ──

const classificationPath = computed(() => {
  const p = path.value;
  if (!p) return [] as { label: string; value: string }[];
  const parts = p.split('/');
  const result: { label: string; value: string }[] = [];
  if (parts.length > 0) result.push({ label: parts[0], value: parts[0] });
  if (parts.length > 1 && !parts[1].endsWith('.md')) result.push({ label: parts[1], value: `${parts[0]}/${parts[1]}` });
  if (parts.length > 2 && !parts[2].endsWith('.md')) result.push({ label: parts[2], value: `${parts[0]}/${parts[1]}/${parts[2]}` });
  return result;
});

// ── Path / navigation ──

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
}

/** Resolve a relative href from rendered markdown against the current path. */
function resolvePath(href: string): string | null {
  if (!href) return null;
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = path.value.includes('/') ? path.value.replace(/\/[^/]*$/, '') : '';
  const segments = (base + '/' + clean).split('/');
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { resolved.pop(); continue; }
    resolved.push(seg);
  }
  let out = resolved.join('/');
  if (href.endsWith('/') && !out.endsWith('.md')) out = out ? `${out}/README.md` : 'README.md';
  return out;
}

function navigateTo(next: string) {
  if (!next || next === path.value) return;
  navHistory.value.push(path.value);
  pendingPath = next;
  store.openKnowledgePreview(next);
}

function goBack() {
  const prev = navHistory.value.pop();
  if (!prev) return;
  pendingPath = prev;
  store.openKnowledgePreview(prev);
}

function onClickRelated(r: { path: string | null; href: string | null }) {
  if (r.path) navigateTo(r.path);
  else if (r.href) window.open(r.href, '_blank', 'noopener,noreferrer');
}

function handlePreviewClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  const anchor = target?.closest?.('a') as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.getAttribute('href') || '';
  const resolved = resolvePath(href);
  if (!resolved) return;
  e.preventDefault();
  if (mode.value !== 'preview' && editContent.value !== rawContent.value) return;
  navigateTo(resolved);
}

// Reset local UI state when a fresh file is opened (vs our own navigation).
watch(
  () => s.knowledgePreviewPath,
  (next) => {
    if (pendingPath === next) {
      pendingPath = null;
    } else {
      navHistory.value = [];
    }
    mode.value = 'preview';
    editContent.value = '';
    toc.value = [];
    tocCollapsed.value = false;
  },
);

// Seed editor when leaving preview mode.
watch(mode, (next, prev) => {
  if (prev === 'preview' && next !== 'preview') editContent.value = rawContent.value;
});

// ── Markdown render + TOC + mermaid + code copy ──

function buildToc(container: HTMLElement) {
  const nodes = container.querySelectorAll('h2, h3');
  const items: { level: number; text: string; id: string }[] = [];
  nodes.forEach((node, i) => {
    const text = (node.textContent || '').trim();
    if (!text) return;
    const id = `toc-h-${i}-${slugify(text)}`;
    (node as HTMLElement).id = id;
    items.push({ level: node.tagName === 'H2' ? 2 : 3, text, id });
  });
  toc.value = items.length >= 3 ? items : [];
}

watch(
  [displayHtml, previewHtml, () => mode.value, () => s.knowledgePreviewLoading],
  async () => {
    if (s.knowledgePreviewLoading) return;
    await nextTick();
    const container = previewRef.value;
    if (!container) { toc.value = []; return; }
    if (mode.value === 'preview') buildToc(container);
    else toc.value = [];
    addCodeCopyButtons(container);
    await runMermaid(container);
  },
  { flush: 'post' },
);

function scrollToHeading(id: string) {
  const el = previewRef.value?.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Split-mode sync scroll ──

let syncScrolling = false;
let syncCleanup: (() => void) | null = null;

function setupSyncScroll() {
  const editor = editorRef.value;
  const preview = previewRef.value;
  if (!editor || !preview) return;
  const onEditor = () => {
    if (syncScrolling) return;
    syncScrolling = true;
    const me = editor.scrollHeight - editor.clientHeight;
    const mp = preview.scrollHeight - preview.clientHeight;
    if (me > 0 && mp > 0) preview.scrollTop = (editor.scrollTop / me) * mp;
    requestAnimationFrame(() => { syncScrolling = false; });
  };
  const onPreview = () => {
    if (syncScrolling) return;
    syncScrolling = true;
    const me = editor.scrollHeight - editor.clientHeight;
    const mp = preview.scrollHeight - preview.clientHeight;
    if (mp > 0 && me > 0) editor.scrollTop = (preview.scrollTop / mp) * me;
    requestAnimationFrame(() => { syncScrolling = false; });
  };
  editor.addEventListener('scroll', onEditor, { passive: true });
  preview.addEventListener('scroll', onPreview, { passive: true });
  syncCleanup = () => {
    editor.removeEventListener('scroll', onEditor);
    preview.removeEventListener('scroll', onPreview);
  };
}

function teardownSyncScroll() {
  syncCleanup?.();
  syncCleanup = null;
}

watch(
  () => mode.value,
  (next, prev) => {
    if (next === 'split' && prev !== 'split') nextTick(setupSyncScroll);
    else if (next !== 'split' && prev === 'split') teardownSyncScroll();
  },
);

onBeforeUnmount(teardownSyncScroll);

// ── Actions ──

async function save() {
  if (saving.value || !path.value) return;
  saving.value = true;
  try {
    const res = await store.saveContextToKnowledge(
      path.value,
      editContent.value,
      metaObj.value as Record<string, unknown>,
    );
    if (res) {
      if (s.knowledgePreviewData) s.knowledgePreviewData.content = editContent.value;
      mode.value = 'preview';
    }
  } finally {
    saving.value = false;
  }
}

function cancelEdit() {
  mode.value = 'preview';
}

function downloadFile() {
  if (!rawContent.value || !path.value) return;
  const blob = new Blob([rawContent.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = path.value.split('/').pop() || 'file.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function close() {
  store.closeKnowledgePreview();
}
</script>

<template>
  <div v-if="s.knowledgePreviewVisible" class="kpd-overlay" @click.self="close">
    <div class="kpd-dialog">
      <!-- Toolbar -->
      <div class="kpd-toolbar">
        <div class="kpd-nav">
          <button
            v-if="navHistory.length && mode === 'preview'"
            class="kpd-btn"
            :title="`Back to ${navHistory[navHistory.length - 1]}`"
            @click="goBack"
          >←</button>
          <span class="kpd-path" :title="path">{{ path }}</span>
        </div>
        <div class="kpd-modes">
          <button :class="{ active: mode === 'edit' }" @click="mode = 'edit'">Edit</button>
          <button :class="{ active: mode === 'split' }" @click="mode = 'split'">Split</button>
          <button :class="{ active: mode === 'preview' }" @click="mode = 'preview'">Preview</button>
        </div>
        <div class="kpd-actions">
          <button v-if="mode !== 'preview'" class="kpd-btn" @click="cancelEdit">Cancel</button>
          <button v-if="mode !== 'preview'" class="kpd-btn kpd-btn--primary" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <button class="kpd-btn" title="Download file" @click="downloadFile">↓</button>
          <button class="kpd-btn" title="Close" @click="close">✕</button>
        </div>
      </div>

      <!-- Frontmatter meta strip -->
      <div v-if="mode === 'preview' && !s.knowledgePreviewLoading && hasMeta" class="kpd-meta">
        <p v-if="benefit" class="kpd-benefit" :title="benefit">{{ benefit }}</p>
        <p v-if="tacitStatement" class="kpd-tacit" :title="tacitStatement">
          <span class="kpd-tacit-label">tacit</span>
          <span class="kpd-tacit-text">{{ tacitStatement }}</span>
        </p>
        <div class="kpd-meta-row">
          <span v-for="b in badges" :key="b.label + b.value" class="kpd-badge" :class="`kpd-badge--${b.tone}`">
            <span class="kpd-badge-label">{{ b.label }}</span>
            <span class="kpd-badge-value">{{ b.value }}</span>
          </span>
          <template v-if="roles.length">
            <span class="kpd-label">roles</span>
            <span v-for="r in roles" :key="r" class="kpd-chip">{{ r }}</span>
          </template>
          <template v-if="tags.length">
            <span class="kpd-label">tags</span>
            <span v-for="t in tags" :key="t" class="kpd-chip">{{ t }}</span>
          </template>
          <template v-if="related.length">
            <span class="kpd-label">related</span>
            <span
              v-for="r in related"
              :key="r.raw"
              class="kpd-chip kpd-chip--link"
              @click="onClickRelated(r)"
            >{{ r.raw }}</span>
          </template>
          <span v-if="criteria.length" class="kpd-criteria" :title="criteriaTip">criteria · {{ criteria.length }}</span>
        </div>
      </div>

      <!-- Classification breadcrumbs -->
      <div v-if="classificationPath.length" class="kpd-classification">
        <span class="kpd-cl-label">Classification:</span>
        <span v-for="(seg, i) in classificationPath" :key="seg.value" class="kpd-cl-seg">
          <span v-if="i > 0" class="kpd-cl-sep">/</span>
          <span class="kpd-cl-chip">{{ seg.label }}</span>
        </span>
      </div>

      <!-- Loading -->
      <div v-if="s.knowledgePreviewLoading" class="kpd-loading">
        <span class="kpd-spinner" />
        <span>Loading…</span>
      </div>

      <!-- Body -->
      <div v-else class="kpd-body" :class="`kpd-body--${mode}`">
        <aside v-if="showToc" class="kpd-toc" :class="{ 'is-collapsed': tocCollapsed }">
          <div class="kpd-toc-title" @click="tocCollapsed = !tocCollapsed">
            <span class="kpd-toc-title-text">Contents</span>
            <span class="kpd-toc-toggle">{{ tocCollapsed ? '▶' : '◀' }}</span>
          </div>
          <ul class="kpd-toc-list">
            <li
              v-for="item in toc"
              :key="item.id"
              :class="`kpd-toc-item--h${item.level}`"
              :title="tocCollapsed ? item.text : ''"
            >
              <a href="#" @click.prevent="scrollToHeading(item.id)">
                <span class="kpd-toc-full">{{ item.text }}</span>
                <span class="kpd-toc-initial">{{ item.text.charAt(0) }}</span>
              </a>
            </li>
          </ul>
        </aside>

        <textarea
          v-if="mode === 'edit' || mode === 'split'"
          ref="editorRef"
          v-model="editContent"
          class="kpd-editor"
          placeholder="Markdown content"
        />

        <div
          v-if="mode === 'split' || mode === 'preview'"
          ref="previewRef"
          class="kpd-preview"
          v-html="mode === 'preview' ? displayHtml : previewHtml"
          @click="handlePreviewClick"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kpd-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  border: none;
}

.kpd-dialog {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: 0;
  background: var(--bg-elevated, #1e1a3b);
  color: var(--text-primary, #f5f3ff);
}

.kpd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  flex-shrink: 0;
}

.kpd-nav {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.kpd-path {
  font-size: 12px;
  color: var(--text-secondary, #d4d0e8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 32vw;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
}

.kpd-modes {
  display: flex;
  gap: 2px;
  background: var(--bg-secondary, #13122a);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.25);
  border-radius: 6px;
  padding: 2px;
  flex-shrink: 0;
}

.kpd-modes button {
  border: none;
  background: transparent;
  color: var(--text-secondary, #d4d0e8);
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;

  &.active {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.25);
    color: var(--text-primary, #f5f3ff);
  }
}

.kpd-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.kpd-btn {
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  background: transparent;
  color: var(--text-secondary, #d4d0e8);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.15); }

  &--primary {
    border-color: var(--primary-light, #818cf8);
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.35);
    color: var(--text-primary, #f5f3ff);

    &:disabled { opacity: 0.5; cursor: default; }
  }
}

.kpd-meta {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.kpd-benefit {
  margin: 0;
  color: var(--text-secondary, #d4d0e8);
  font-style: italic;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kpd-tacit {
  margin: 0;
  padding: 4px 8px;
  border-left: 3px solid var(--warning, #f59e0b);
  background: rgba(245, 158, 11, 0.12);
  border-radius: 2px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kpd-tacit-label {
  color: var(--warning, #f59e0b);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 6px;
}

.kpd-tacit-text { font-style: italic; color: var(--text-primary, #f5f3ff); }

.kpd-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
}

.kpd-label {
  color: var(--text-secondary, #d4d0e8);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-left: 4px;
}

.kpd-label:first-child { margin-left: 0; }

.kpd-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 18px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  background: transparent;
}

.kpd-badge-label { color: var(--text-secondary, #d4d0e8); }
.kpd-badge-value { font-weight: 500; color: var(--text-primary, #f5f3ff); }

.kpd-badge--success { border-color: rgba(34, 197, 94, 0.5); background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.kpd-badge--warning { border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.kpd-badge--info { border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.4); background: rgba(var(--primary-rgb, 99, 102, 241), 0.12); }

.kpd-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  line-height: 18px;
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  background: transparent;
  color: var(--text-primary, #f5f3ff);

  &--link { cursor: pointer; border-color: var(--primary-light, #818cf8); }
}

.kpd-criteria {
  color: var(--primary-light, #818cf8);
  cursor: help;
  font-size: 11px;
  text-decoration: underline dotted;
}

.kpd-classification {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  font-size: 11px;
  flex-shrink: 0;
}

.kpd-cl-label {
  color: var(--text-secondary, #d4d0e8);
  font-weight: 600;
  margin-right: 4px;
  font-size: 10px;
}

.kpd-cl-sep { color: var(--text-secondary, #d4d0e8); margin: 0 2px; opacity: 0.6; }

.kpd-cl-chip {
  display: inline-block;
  padding: 0 6px;
  border-radius: 3px;
  background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
  color: var(--primary-light, #818cf8);
  font-weight: 500;
  font-size: 10px;
  line-height: 18px;
}

.kpd-loading {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  font-size: 14px;
  color: var(--text-secondary, #d4d0e8);
}

.kpd-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  border-top-color: var(--primary-light, #818cf8);
  border-radius: 50%;
  animation: kpd-spin 0.8s linear infinite;
  will-change: transform;
}

@keyframes kpd-spin { to { transform: rotate(360deg) translateZ(0); } }

.kpd-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 8px;
  overflow: hidden;
}

.kpd-toc {
  flex-shrink: 0;
  width: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px 8px 0;
  border-right: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  font-size: 12px;
  line-height: 1.5;
  transition: width 0.2s ease;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 4px;
  }

  &.is-collapsed {
    width: 36px;
    padding: 8px 4px 8px 0;

    .kpd-toc-title { justify-content: center; }
    .kpd-toc-title-text { display: none; }
    .kpd-toc-toggle { margin-left: 0; }
    .kpd-toc-full { display: none; }
    .kpd-toc-initial { display: inline; }
    .kpd-toc-list a { justify-content: center; padding: 4px 2px; border-radius: 4px; }
    .kpd-toc-item--h3 a { padding-left: 2px; }
  }
}

.kpd-toc-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-secondary, #d4d0e8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
  margin-bottom: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  &:hover { color: var(--primary-light, #818cf8); }
}

.kpd-toc-toggle { font-size: 10px; margin-left: 4px; }

.kpd-toc-list { list-style: none; margin: 0; padding: 0; }
.kpd-toc-list li { margin: 0; }

.kpd-toc-list a {
  display: flex;
  padding: 2px 4px;
  color: var(--text-secondary, #d4d0e8);
  text-decoration: none;
  border-radius: 3px;
  transition: background 0.1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.15); color: var(--primary-light, #818cf8); }
}

.kpd-toc-full { display: inline; }
.kpd-toc-initial { display: none; font-weight: 600; font-size: 13px; text-transform: uppercase; }
.kpd-toc-item--h3 a { padding-left: 12px; font-size: 11px; color: var(--text-secondary, #d4d0e8); }

.kpd-editor {
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 12px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  background: var(--bg-primary, #13122a);
  color: var(--text-primary, #f5f3ff);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 6px;
}

.kpd-preview {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary, #f5f3ff);
  background: var(--bg-primary, #13122a);
  border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3);
  border-radius: 6px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
    border-radius: 5px;
    &:hover { background: rgba(var(--primary-rgb, 99, 102, 241), 0.4); }
  }

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) { margin: 1em 0 0.5em; }
  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.15em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--bg-secondary, #1e1a3b);
    border-radius: 6px;
  }
  :deep(code) { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.9em; }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--primary-light, #818cf8);
    color: var(--text-secondary, #d4d0e8);
  }
  :deep(table) { border-collapse: collapse; }
  :deep(th), :deep(td) { padding: 6px 12px; border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.3); }
  :deep(a) { color: var(--primary-light, #818cf8); }
  :deep(pre.mermaid) {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;
    svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
  }
}
</style>
