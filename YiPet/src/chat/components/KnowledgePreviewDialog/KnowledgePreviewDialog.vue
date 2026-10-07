<script setup lang="ts">
/**
 * YiPet Chat — KnowledgePreviewDialog (Vue 3 SFC)
 * Full-screen modal for previewing and editing markdown knowledge files.
 * Features: extracted KnowledgeToolbar + KnowledgeTocSidebar sub-components,
 * edit/preview/split modes, sync scrolling, frontmatter metadata, internal
 * navigation, and professional markdown typography.
 * Mirrors YiVad's KnowledgePreviewDialog.
 */
import { computed, watch, nextTick, ref, onBeforeUnmount } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { ElInput, ElMessage } from 'element-plus';
import { useChatStore } from '../../stores/chat';
import { renderMarkdown, runMermaid, addCodeCopyButtons } from '../../utils';
import KnowledgeTocSidebar from './KnowledgeTocSidebar.vue';
import KnowledgeToolbar, { type KbMode } from './KnowledgeToolbar.vue';
import KnowledgeMetaStrip from './KnowledgeMetaStrip.vue';

const store = useChatStore();
const s = store.state;

const visible = computed({
  get: () => s.knowledgePreviewVisible,
  set: (v) => { if (!v) store.closeKnowledgePreview?.(); },
});

const content = computed(() => s.knowledgePreviewData?.content || '');

/** Saved content rendered as HTML — used for preview pane in all modes. */
const savedPreviewHtml = computed(() => {
  const src = mode.value === 'preview' ? content.value : editContent.value;
  return renderMarkdown(src);
});

const meta = computed(() => (s.knowledgePreviewData?.meta || {}) as Record<string, unknown>);

const hasMeta = computed(() => {
  const m = meta.value;
  return Boolean(
    m.status ||
    m.lifecycle ||
    m.review_cycle ||
    m.type ||
    (Array.isArray(m.roles) && m.roles.length) ||
    (Array.isArray(m.tags) && m.tags.length) ||
    (Array.isArray(m.related) && m.related.length) ||
    (typeof m.benefit === 'string' && m.benefit.trim()) ||
    (m.tacit === true || typeof m.tacit === 'string') ||
    (Array.isArray(m.acceptance_criteria) && m.acceptance_criteria.length),
  );
});

// ── Mode ──

const mode = ref<KbMode>('preview');
const editContent = ref('');
const saving = ref(false);

function cancelEdit() {
  editContent.value = '';
  mode.value = 'preview';
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  try {
    const ok = await store.saveKnowledgePreview?.(editContent.value);
    if (ok) {
      await store.navigateKnowledgePreview?.(s.knowledgePreviewPath);
      mode.value = 'preview';
      ElMessage.success('Saved');
    }
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : 'Failed to save');
  } finally {
    saving.value = false;
  }
}

// ── Split mode sync scroll ──

let syncScrolling = false;
let editorScrollCleanup: (() => void) | null = null;
let previewScrollCleanup: (() => void) | null = null;

const editorRef = ref<InstanceType<typeof ElInput> | null>(null);
const previewRef = ref<HTMLElement | null>(null);

function getEditorTextarea(): HTMLTextAreaElement | null {
  return (editorRef.value?.textarea as HTMLTextAreaElement | null) ?? null;
}

function setupSyncScroll() {
  const editor = getEditorTextarea();
  const preview = previewRef.value;
  if (!editor || !preview) return;

  function onEditorScroll() {
    if (syncScrolling) return;
    syncScrolling = true;
    const maxE = editor!.scrollHeight - editor!.clientHeight;
    const maxP = preview!.scrollHeight - preview!.clientHeight;
    if (maxE > 0 && maxP > 0) {
      preview!.scrollTop = (editor!.scrollTop / maxE) * maxP;
    }
    requestAnimationFrame(() => { syncScrolling = false; });
  }

  function onPreviewScroll() {
    if (syncScrolling) return;
    syncScrolling = true;
    const maxE = editor!.scrollHeight - editor!.clientHeight;
    const maxP = preview!.scrollHeight - preview!.clientHeight;
    if (maxP > 0 && maxE > 0) {
      editor!.scrollTop = (preview!.scrollTop / maxP) * maxE;
    }
    requestAnimationFrame(() => { syncScrolling = false; });
  }

  editor.addEventListener('scroll', onEditorScroll, { passive: true });
  preview.addEventListener('scroll', onPreviewScroll, { passive: true });
  editorScrollCleanup = () => editor.removeEventListener('scroll', onEditorScroll);
  previewScrollCleanup = () => preview.removeEventListener('scroll', onPreviewScroll);
}

function teardownSyncScroll() {
  editorScrollCleanup?.();
  previewScrollCleanup?.();
  editorScrollCleanup = null;
  previewScrollCleanup = null;
}

// Attach/detach sync scroll when entering/leaving split mode
watch(
  () => mode.value,
  (next, prev) => {
    if (next === 'split' && prev !== 'split') {
      nextTick(() => setupSyncScroll());
    } else if (next !== 'split' && prev === 'split') {
      teardownSyncScroll();
    }
  },
);

onBeforeUnmount(() => teardownSyncScroll());

// Seed the editor from saved content when switching away from preview
watch(mode, (_new, old) => {
  if (old === 'preview' && _new !== 'preview') {
    editContent.value = content.value;
  }
});

function onToolbarModeChange(value: KbMode) {
  const VALID: readonly KbMode[] = ['preview', 'edit', 'split'];
  mode.value = VALID.includes(value) ? value : 'preview';
}

// ── Document stats ──

const docStats = computed(() => {
  const text = content.value || '';
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingMin = Math.max(1, Math.ceil(words / 200));
  return { chars, words, readingMin };
});

// ── Classification breadcrumbs ──

const classificationPath = computed(() => {
  const p = s.knowledgePreviewPath;
  if (!p) return [] as { label: string }[];
  const parts = p.split('/');
  const result: { label: string }[] = [];
  if (parts.length > 0) result.push({ label: parts[0] });
  if (parts.length > 1 && !parts[1].endsWith('.md')) result.push({ label: parts[1] });
  if (parts.length > 2 && !parts[2].endsWith('.md')) result.push({ label: parts[2] });
  return result;
});

// ── TOC ──

interface TocItem { level: number; text: string; id: string }

const toc = ref<TocItem[]>([]);
const tocCollapsed = ref(false);

const showToc = computed(() => mode.value === 'preview' && toc.value.length >= 3);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
}

function scrollToHeading(id: string) {
  if (!previewRef.value || !id) return;
  const el = previewRef.value.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// After markdown renders: inject heading IDs, populate TOC, render mermaid, add copy btns
watch([savedPreviewHtml, () => s.knowledgePreviewLoading, mode], async ([_html, loading]) => {
  if (loading) { toc.value = []; return; }
  await nextTick();
  const container = previewRef.value;
  if (!container) { toc.value = []; return; }
  // TOC only for preview mode
  if (mode.value !== 'preview') { toc.value = []; return; }
  const nodes = container.querySelectorAll('h2, h3');
  const items: TocItem[] = [];
  nodes.forEach((node, i) => {
    const text = (node.textContent || '').trim();
    if (!text) return;
    const id = `toc-h-${i}-${slugify(text)}`;
    node.id = id;
    items.push({ level: node.tagName === 'H2' ? 2 : 3, text, id });
  });
  toc.value = items.length >= 3 ? items : [];
  await runMermaid(container);
  addCodeCopyButtons(container);
}, { flush: 'post' });

// ── Mermaid re-render (for split mode where preview content changes with keystrokes) ──

watch(
  [savedPreviewHtml, () => previewRef.value, mode, () => s.knowledgePreviewLoading],
  async ([_html, _ref, _mode, _loading]) => {
    if (_loading) return;
    if (!savedPreviewHtml.value.includes('class="mermaid"')) return;
    let container: HTMLElement | null = null;
    if (_mode === 'preview' || _mode === 'split') {
      container = _ref as HTMLElement | null;
    }
    if (!container) return;
    await nextTick();
    await runMermaid(container);
  },
  { flush: 'post' },
);

// ── Navigation history ──

const navHistory = ref<string[]>([]);

function navigateTo(path: string) {
  if (!path || path === s.knowledgePreviewPath) return;
  navHistory.value.push(s.knowledgePreviewPath);
  store.navigateKnowledgePreview?.(path);
}

function goBack() {
  const prev = navHistory.value.pop();
  if (prev) store.navigateKnowledgePreview?.(prev);
}

/** Navigate via meta-strip related link — guards against unsaved edits. */
function navigateToRelated(path: string) {
  if (!path || path === s.knowledgePreviewPath) return;
  if (mode.value !== 'preview' && editContent.value !== content.value) return;
  navigateTo(path);
}

// ── Internal link resolution ──

function resolvePath(href: string): string | null {
  if (!href) return null;
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) return null;
  let clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  try { clean = decodeURI(clean); } catch { /* keep as-is */ }
  const base = s.knowledgePreviewPath.includes('/')
    ? s.knowledgePreviewPath.replace(/\/[^/]*$/, '')
    : '';
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

function onPreviewClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  const anchor = target?.closest?.('a') as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.getAttribute('href') || '';
  const resolved = resolvePath(href);
  if (!resolved) return;
  // If in unsaved edit, switching docs would discard edits silently
  if (mode.value !== 'preview' && editContent.value !== content.value) return;
  e.preventDefault();
  navigateTo(resolved);
}

// ── Download ──

function downloadFile() {
  if (!content.value || !s.knowledgePreviewPath) return;
  const blob = new Blob([content.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = s.knowledgePreviewPath.split('/').pop() || 'file.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Refresh ──

function refresh() {
  if (s.knowledgePreviewPath) store.navigateKnowledgePreview?.(s.knowledgePreviewPath);
}

// ── Keyboard ──

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) {
    if (mode.value === 'edit' || mode.value === 'split') cancelEdit();
    else store.closeKnowledgePreview?.();
  }
}

watch(visible, async (v) => {
  if (v) {
    document.addEventListener('keydown', onKeydown);
    await nextTick();
    const dialogEl = document.querySelector('.kpd-dialog') as HTMLElement | null;
    if (dialogEl) {
      dialogEl.style.setProperty('z-index', '2147483647', 'important');
      const overlay = dialogEl.closest('.el-overlay') as HTMLElement | null;
      if (overlay) overlay.style.setProperty('z-index', '2147483647', 'important');
    }
  } else {
    document.removeEventListener('keydown', onKeydown);
    navHistory.value = [];
    toc.value = [];
    tocCollapsed.value = false;
    mode.value = 'preview';
    editContent.value = '';
  }
});
</script>

<template>
  <el-dialog
    v-model="visible"
    width="100vw"
    top="0"
    :close-on-click-modal="true"
    :show-close="false"
    append-to-body
    class="kpd-dialog"
    @close="store.closeKnowledgePreview?.()"
  >
    <!-- Toolbar: matches YiVad KnowledgeToolbar layout -->
    <KnowledgeToolbar
      :current-path="s.knowledgePreviewPath"
      :mode="mode"
      :loading="s.knowledgePreviewLoading"
      :has-content="!!content"
      :saving="saving"
      :doc-stats="docStats"
      :nav-history-length="navHistory.length"
      @update:mode="onToolbarModeChange"
      @go-back="goBack"
      @cancel-edit="cancelEdit"
      @save="save"
      @download-file="downloadFile"
      @refresh="refresh"
      @close="store.closeKnowledgePreview?.()"
    />

    <!-- Classification breadcrumbs -->
    <div v-if="classificationPath.length" class="kpd-classification">
      <span class="kpd-cl-label">Classification:</span>
      <span v-for="(seg, i) in classificationPath" :key="seg.label" class="kpd-cl-seg">
        <span v-if="i > 0" class="kpd-cl-sep">/</span>
        <span class="kpd-cl-chip">{{ seg.label }}</span>
      </span>
    </div>

    <!-- Loading -->
    <div v-if="s.knowledgePreviewLoading" class="kpd-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>Loading...</span>
    </div>

    <template v-else>
      <!-- Metadata strip (preview only) -->
      <div v-if="mode === 'preview' && !s.knowledgePreviewLoading && hasMeta" class="kpd-meta">
        <KnowledgeMetaStrip :meta="meta" :current-path="s.knowledgePreviewPath" @navigate-related="navigateToRelated" />
      </div>

      <!-- Error state -->
      <div v-if="!content" class="kpd-loading">
        <span>Failed to load content for "{{ s.knowledgePreviewPath }}"</span>
      </div>

      <!-- Body -->
      <div v-else class="kpd-body" :class="`kpd-body--${mode}`">
        <!-- TOC sidebar (preview mode only, ≥3 headings) -->
        <KnowledgeTocSidebar
          v-if="showToc"
          :items="toc"
          :collapsed="tocCollapsed"
          @toggle-collapse="tocCollapsed = !tocCollapsed"
          @scroll-to="scrollToHeading"
        />

        <!-- Editor (edit + split modes) -->
        <el-input
          v-if="mode === 'edit' || mode === 'split'"
          ref="editorRef"
          v-model="editContent"
          type="textarea"
          class="kpd-editor"
          placeholder="Markdown content"
        />

        <!-- Preview pane (split + preview modes) -->
        <div
          v-if="mode === 'split' || mode === 'preview'"
          ref="previewRef"
          class="kpd-preview"
          v-html="savedPreviewHtml"
          @click="onPreviewClick"
        />
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
@use "./styles/dialog.scss";
</style>
<style lang="scss">
@use "./styles/global.scss";
</style>