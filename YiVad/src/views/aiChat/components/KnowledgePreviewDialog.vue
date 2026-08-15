<script setup lang="ts" name="aiChatKnowledgePreviewDialog">
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ElInput, ElMessage } from "element-plus";
import { ArrowLeft, ChatDotRound, Close, Download, Loading, FolderOpened } from "@element-plus/icons-vue";
import { useMarkdown, runMermaid } from "@/hooks/useMarkdown";
import { useResizable } from "@/hooks/useResizable";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { streamChat } from "@/api/modules/chatService";
import type { KnowledgeMeta } from "@/api/interface/yiweb";
import KnowledgeChatPanel from "./KnowledgeChatPanel.vue";
import KnowledgeMetaStrip from "@/components/KnowledgeMetaStrip.vue";

const { renderWithHtml } = useMarkdown();
const { openInAiChat } = useAiChatBridge();
const router = useRouter();

const visible = ref(false);
const title = ref("");
const loading = ref(false);
const saving = ref(false);
const currentPath = ref("");

/** Parsed frontmatter for the current file — surfaced as badges + related links. */
const meta = ref<KnowledgeMeta>({});

/** Saved content from the server — shown in "preview" mode. */
const rawContent = ref("");

/** Working draft — shown in the editor (edit/split modes). */
const editContent = ref("");

const mode = ref<"preview" | "edit" | "split">("preview");

/** Chat panel toggle — when on, the body splits left (preview/edit) + right (chat). */
const showChat = ref(false);

/** Navigation history for internal-link clicks inside the preview. */
const navHistory = ref<string[]>([]);

/** Translation state */
const translating = ref(false);
const translationAbort = ref<(() => void) | null>(null);
/** Backup of the original content before translation — used to restore via "Show Original". */
const originalContent = ref("");

const displayHtml = computed(() => renderWithHtml(rawContent.value));

/** Ref to the standard-mode preview pane — used for TOC scroll + ID injection. */
const previewRef = ref<HTMLElement | null>(null);

/** Ref to the el-input(textarea) component — used for sync-scroll in split mode. */
const editorRef = ref<InstanceType<typeof ElInput> | null>(null);

// ── Split-mode sync scroll ──

/** Guard flag to prevent recursive scroll events during sync. */
let syncScrolling = false;
/** Cleanup functions for imperatively-attached scroll listeners. */
let editorScrollCleanup: (() => void) | null = null;
let previewScrollCleanup: (() => void) | null = null;

/** Get the native <textarea> from the el-input component ref. */
function getEditorTextarea(): HTMLTextAreaElement | null {
  return (editorRef.value?.textarea as HTMLTextAreaElement | null) ?? null;
}

/** Attach scroll listeners to editor textarea + preview pane for bidirectional sync. */
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

  editor.addEventListener("scroll", onEditorScroll, { passive: true });
  preview.addEventListener("scroll", onPreviewScroll, { passive: true });
  editorScrollCleanup = () => editor.removeEventListener("scroll", onEditorScroll);
  previewScrollCleanup = () => preview.removeEventListener("scroll", onPreviewScroll);
}

/** Detach scroll listeners (called when leaving split mode or unmounting). */
function teardownSyncScroll() {
  editorScrollCleanup?.();
  previewScrollCleanup?.();
  editorScrollCleanup = null;
  previewScrollCleanup = null;
}

// Attach / detach scroll sync when entering / leaving split mode.
watch(() => mode.value, (next, prev) => {
  if (next === "split" && prev !== "split") {
    nextTick(() => setupSyncScroll());
  } else if (next !== "split" && prev === "split") {
    teardownSyncScroll();
  }
});

onBeforeUnmount(() => teardownSyncScroll());

/** TOC entries parsed from the rendered markdown — populated after render. */
const toc = ref<{ level: number; text: string; id: string }[]>([]);

/** Whether the TOC sidebar is collapsed. */
const tocCollapsed = ref(false);

/** System prompt fed to the embedded chat — the knowledge file content. */
const chatSystemPrompt = computed(() => {
  if (!showChat.value || !rawContent.value) return "";
  return `You are analyzing the following knowledge file: ${currentPath.value}\n\n---\n${rawContent.value}\n---\n\nAnswer questions about this file.`;
});

const previewHtml = computed(() => renderWithHtml(editContent.value));
const savedPreviewHtml = computed(() => renderWithHtml(rawContent.value));

const hasMeta = computed(() => {
  const m = meta.value;
  return Boolean(
    m.status ||
      m.lifecycle ||
      m.review_cycle ||
      m.type ||
      m.roles?.length ||
      m.tags?.length ||
      m.related?.length ||
      (m as KnowledgeMeta).benefit ||
      (m as KnowledgeMeta).acceptance_criteria?.length
  );
});

const showToc = computed(() => mode.value === "preview" && !showChat.value && toc.value.length >= 3);

/** Classification path derived from the file path: category → module → sub_module. */
const classificationPath = computed(() => {
  const p = currentPath.value;
  if (!p) return [] as { label: string; value: string }[];
  const parts = p.split("/");
  const result: { label: string; value: string }[] = [];
  if (parts.length > 0) result.push({ label: parts[0], value: parts[0] });
  if (parts.length > 1 && !parts[1].endsWith(".md")) {
    result.push({ label: parts[1], value: `${parts[0]}/${parts[1]}` });
  }
  if (parts.length > 2 && !parts[2].endsWith(".md")) {
    result.push({ label: parts[2], value: `${parts[0]}/${parts[1]}/${parts[2]}` });
  }
  return result;
});

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function scrollToHeading(id: string) {
  if (!previewRef.value || !id) return;
  const el = previewRef.value.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null;
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function navigateToRelated(path: string) {
  if (!path || path === currentPath.value) return;
  if (mode.value !== "preview" && editContent.value !== rawContent.value) return;
  navigateTo(path);
}

// ── Chat panel width (draggable) ──

const {
  width: chatWidth,
  isResizing: isChatResizing,
  startResize: startChatResize
} = useResizable(600, 320, 900, "aiChat.knowledgeChatW", true);

function loadDoc(path: string) {
  currentPath.value = path;
  title.value = (path.split("/").pop() || path).replace(/\.md$/, "");
  mode.value = "preview";
  showChat.value = false;
  translationAbort.value?.();
  translationAbort.value = null;
  originalContent.value = "";
  loading.value = true;
  rawContent.value = "";
  editContent.value = "";
  meta.value = {};
  toc.value = [];
  readKnowledgeFile(path)
    .then(res => {
      rawContent.value = res.content || "";
      meta.value = res.meta || {};
    })
    .catch((err: any) => {
      rawContent.value = `*Failed to load content: ${err?.message || "unknown error"}*`;
    })
    .finally(() => {
      loading.value = false;
    });
}

function open(path: string) {
  visible.value = true;
  navHistory.value = [];
  loadDoc(path);
}

function close() {
  visible.value = false;
  mode.value = "preview";
  showChat.value = false;
  translationAbort.value?.();
  translationAbort.value = null;
  originalContent.value = "";
}

async function discussInAiChat() {
  if (!currentPath.value) return;
  const tags = [`ctx:${currentPath.value}`, `file:${currentPath.value}`, "knowledge"];
  const metaEntries = meta.value ? Object.entries(meta.value) : [];
  const frontmatter = metaEntries.length
    ? ["", "## Frontmatter", "", ...metaEntries.map(([k, v]) => `- **${k}:** ${String(v)}`)].join("\n")
    : "";
  await openInAiChat({
    title: title.value || currentPath.value.split("/").pop() || "Knowledge file",
    pageContent: `# ${title.value || currentPath.value}\n\nPath: \`${currentPath.value}\`${frontmatter}\n\n${rawContent.value}`,
    tags,
    sourceUrl: undefined
  });
  close();
}

/**
 * Resolve a YiKnowledge path to its source-domain detail route, when the path
 * matches a known pattern (brd/<role>/<key>.md, code-review/<topic>/<key>.md,
 * leader/<topic>/<key>.md, stories/<project>/<key>/..., rss/<...>).
 * Returns null for paths outside these patterns (e.g. notes/…).
 */
function resolveSourceRoute(path: string): { path: string; query?: Record<string, string> } | null {
  if (!path) return null;
  const clean = path.replace(/\.md$/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  // leader/<topic>/<key>
  if (parts[0] === "leader" && parts.length >= 3) {
    return { path: `/leader/${parts[1]}/detail/${parts.slice(2).join("/")}`, query: { mode: "view" } };
  }
  // stories/<project>/<key>(/<file>)
  if (parts[0] === "stories" && parts.length >= 3) {
    return { path: "/story", query: { project: parts[1] ?? "", story: parts[2] ?? "" } };
  }
  // rss/<...>
  if (parts[0] === "rss") {
    return { path: "/rss" };
  }
  return null;
}

const sourceRoute = computed(() => resolveSourceRoute(currentPath.value));

function openInSourcePage() {
  const r = sourceRoute.value;
  if (!r) return;
  close();
  router.push(r);
}

/** Resolve a relative href from the rendered markdown against the current path. */
function resolvePath(href: string): string | null {
  if (!href) return null;
  // Skip external links, anchors, and non-http schemes
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(href)) return null;
  // Strip query/hash
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return null;
  const base = currentPath.value.includes("/")
    ? currentPath.value.replace(/\/[^/]*$/, "")
    : "";
  const segments = (base + "/" + clean).split("/");
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(seg);
  }
  let out = resolved.join("/");
  // Directory link (trailing slash, no .md) → resolve to README.md inside it.
  if (href.endsWith("/") && !out.endsWith(".md")) {
    out = out ? `${out}/README.md` : "README.md";
  }
  return out;
}

function navigateTo(path: string) {
  if (!path || path === currentPath.value) return;
  navHistory.value.push(currentPath.value);
  loadDoc(path);
}

function goBack() {
  const prev = navHistory.value.pop();
  if (prev) loadDoc(prev);
}

function handlePreviewClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.getAttribute("href") || "";
  const resolved = resolvePath(href);
  if (!resolved) return; // external or anchor link → default behavior
  e.preventDefault();
  // If in an unsaved edit, switching docs would discard edits silently.
  if (mode.value !== "preview" && editContent.value !== rawContent.value) return;
  navigateTo(resolved);
}

// Seed the editor from saved content when switching away from preview
watch(mode, (_new, old) => {
  if (old === "preview" && _new !== "preview") {
    editContent.value = rawContent.value;
  }
});

// ── Mermaid rendering ──
// Runs AFTER Vue has patched the DOM (flush: 'post') so previewRef and the
// v-html innerHTML are guaranteed to be in place. Watches loading so we don't
// try to render while the preview div hasn't been created yet (it's inside
// <template v-else>).
//
// We deliberately watch displayHtml AND previewHtml so mermaid re-renders
// in split mode as the user types (mermaid.run() is idempotent on already-
// rendered elements, so re-rendering the same diagram is a no-op).
watch(
  [displayHtml, previewHtml, () => previewRef.value, mode, showChat, loading],
  async ([_dh, _ph, _ref, _mode, _chat, _loading]) => {
    if (_loading) return; // preview div not in DOM yet (loading spinner shown)
    // Skip DOM query when no mermaid blocks exist (streaming optimization)
    if (!savedPreviewHtml.value.includes('class="mermaid"')) return;
    // The mermaid elements live inside the preview pane. In chat mode the
    // preview div doesn't carry a template ref — query it by class instead.
    let container: HTMLElement | null = null;
    if (_chat) {
      container = document.querySelector(".kpd-body--chat .kpd-preview") as HTMLElement | null;
    } else if (_mode === "preview" || _mode === "split") {
      container = _ref as HTMLElement | null;
    }
    if (!container) return;
    // Wait one more tick so v-html innerHTML is fully applied before mermaid
    // queries for <pre class="mermaid"> children.
    await nextTick();
    await runMermaid(container);
  },
  { flush: "post" }
);

// After preview HTML renders, inject heading IDs + populate TOC.
// Scoped to preview-only mode (split/chat modes skip TOC for layout simplicity).
watch(
  [savedPreviewHtml, () => previewRef.value, mode, showChat, loading],
  () => {
    if (mode.value !== "preview" || showChat.value || loading.value) {
      toc.value = [];
      return;
    }
    nextTick(() => {
      if (!previewRef.value) {
        toc.value = [];
        return;
      }
      const nodes = previewRef.value.querySelectorAll("h2, h3");
      const items: { level: number; text: string; id: string }[] = [];
      nodes.forEach((node, i) => {
        const text = (node.textContent || "").trim();
        if (!text) return;
        const id = `toc-h-${i}-${slugify(text)}`;
        node.id = id;
        items.push({ level: node.tagName === "H2" ? 2 : 3, text, id });
      });
      toc.value = items.length >= 3 ? items : [];
    });
  },
  { flush: "post" }
);

async function save() {
  if (saving.value || !currentPath.value) return;
  saving.value = true;
  try {
    await writeKnowledgeFile(currentPath.value, editContent.value, meta.value);
    rawContent.value = editContent.value;
    mode.value = "preview";
    ElMessage.success("Saved");
  } catch (e: any) {
    ElMessage.error(e?.message || "Failed to save");
  } finally {
    saving.value = false;
  }
}

function cancelEdit() {
  mode.value = "preview";
}

function toggleChat() {
  showChat.value = !showChat.value;
  // In chat mode, force preview so the LLM sees the saved content
  if (showChat.value && mode.value !== "preview") {
    mode.value = "preview";
  }
}

function downloadFile() {
  if (!rawContent.value || !currentPath.value) return;
  const blob = new Blob([rawContent.value], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentPath.value.split("/").pop() || "file.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function translateTo(targetLang: "zh" | "en", bilingual = false) {
  if (translating.value || !rawContent.value) return;

  const langName = targetLang === "zh" ? "Simplified Chinese" : "English";
  const source = rawContent.value;
  translating.value = true;
  let buffer = "";

  const { abort } = streamChat(
    {
      model: "qwen3.5:4b",
      messages: [{ type: "user", message: source, timestamp: Date.now() }],
      system: `You are a professional translator. Translate the following markdown content to ${langName}. Preserve all markdown formatting, code blocks, links, and structure exactly. Only output the translated content, nothing else.`
    },
    (chunk) => {
      buffer += chunk;
      rawContent.value = bilingual ? source + "\n\n---\n\n" + buffer : buffer;
    },
    () => {
      originalContent.value = source;
      rawContent.value = bilingual ? source + "\n\n---\n\n" + buffer : buffer;
      translating.value = false;
      translationAbort.value = null;
    },
    (err) => {
      rawContent.value = source;
      translating.value = false;
      translationAbort.value = null;
      originalContent.value = "";
      ElMessage.error(err?.message || "Translation failed");
    }
  );

  translationAbort.value = abort;
}

function resetTranslation() {
  translationAbort.value?.();
  translationAbort.value = null;
  if (originalContent.value) {
    rawContent.value = originalContent.value;
    originalContent.value = "";
  }
}

defineExpose({ open });
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
    @close="close"
  >
    <!-- Toolbar: mode switch + actions -->
    <div class="kpd-toolbar">
      <div class="kpd-nav">
        <el-button
          v-if="navHistory.length && mode === 'preview' && !showChat"
          size="small"
          text
          :title="`Back to ${navHistory[navHistory.length - 1]}`"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="kpd-path" :title="currentPath">{{ currentPath }}</span>
      </div>
      <el-radio-group v-model="mode" size="small" :disabled="showChat">
        <el-radio-button value="edit">Edit</el-radio-button>
        <el-radio-button value="split">Split</el-radio-button>
        <el-radio-button value="preview">Preview</el-radio-button>
      </el-radio-group>
      <div class="kpd-actions">
        <template v-if="mode === 'preview' && !loading && rawContent">
          <span v-if="translating" class="kpd-translating">Translating...</span>
          <template v-if="!translating && !originalContent">
            <el-button size="small" text @click="translateTo('zh')">译中</el-button>
            <el-button size="small" text @click="translateTo('en')">译英</el-button>
            <el-button size="small" text @click="translateTo('zh', true)">中英双语</el-button>
          </template>
          <el-button
            v-if="!translating && originalContent"
            size="small"
            text
            @click="resetTranslation"
          >Show Original</el-button>
        </template>
        <el-button
          v-if="mode === 'edit' || mode === 'split'"
          size="small"
          text
          @click="cancelEdit"
        >Cancel</el-button>
        <el-button
          v-if="mode === 'edit' || mode === 'split'"
          type="primary"
          size="small"
          :loading="saving"
          @click="save"
        >Save</el-button>
        <el-button
          v-if="sourceRoute"
          size="small"
          text
          :icon="FolderOpened"
          title="Open in source page"
          @click="openInSourcePage"
        />
        <el-button
          size="small"
          text
          :icon="Download"
          title="Download file"
          @click="downloadFile"
        />
        <el-button
          :type="showChat ? 'primary' : 'default'"
          :icon="ChatDotRound"
          size="small"
          text
          :title="showChat ? 'Hide chat' : 'Chat about this file'"
          @click="toggleChat"
        />
        <el-button
          size="small"
          text
          :icon="Close"
          title="Close"
          @click="close"
        />
      </div>
    </div>

    <!-- Frontmatter strip — shown only in preview mode when meta has badges/related -->
    <div v-if="mode === 'preview' && !loading && hasMeta" class="kpd-meta">
      <KnowledgeMetaStrip :meta="meta" :current-path="currentPath" @navigate-related="navigateToRelated" />
    </div>

    <!-- Classification breadcrumbs -->
    <div class="kpd-classification" v-if="classificationPath.length > 0">
      <span class="kpd-cl-label">Classification:</span>
      <span
        v-for="(seg, i) in classificationPath" :key="seg.value"
        class="kpd-cl-seg"
      >
        <span v-if="i > 0" class="kpd-cl-sep">/</span>
        <span class="kpd-cl-chip">{{ seg.label }}</span>
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="kpd-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>Loading...</span>
    </div>

    <!-- Body -->
    <template v-else>
      <!-- Chat mode: left panel (preview) + resizer + chat panel -->
      <div v-if="showChat" class="kpd-body kpd-body--chat" :class="{ 'is-resizing': isChatResizing }">
        <div class="kpd-left">
          <div class="kpd-preview" v-html="displayHtml" @click="handlePreviewClick" />
        </div>
        <div
          class="kpd-resizer"
          :class="{ 'is-active': isChatResizing }"
          @pointerdown="startChatResize"
        />
        <div class="kpd-right" :style="{ width: chatWidth + 'px' }">
          <KnowledgeChatPanel
            :file-path="currentPath"
            :system-prompt="chatSystemPrompt"
            :rag-scope="currentPath"
          />
        </div>
      </div>

      <!-- Standard mode: optional TOC sidebar + (editor / preview) -->
      <div v-else class="kpd-body" :class="`kpd-body--${mode}`">
        <!-- TOC sidebar (preview mode only, ≥3 headings) -->
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
        <!-- Editor pane (edit + split modes) -->
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
          v-html="mode === 'preview' ? displayHtml : previewHtml"
          @click="handlePreviewClick"
        />
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.kpd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.kpd-meta {
  margin-bottom: 8px;
  padding: 8px 10px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}
.kpd-classification {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 8px;
  font-size: 11px;
}
.kpd-cl-label {
  color: #909399;
  font-weight: 600;
  margin-right: 4px;
  font-size: 10px;
  flex-shrink: 0;
}
.kpd-cl-seg {
  display: flex;
  align-items: center;
}
.kpd-cl-sep {
  color: #dcdfe6;
  margin: 0 2px;
}
.kpd-cl-chip {
  display: inline-block;
  padding: 0 6px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
  font-size: 10px;
  line-height: 18px;
}
.kpd-nav {
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 0;
}
.kpd-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 30vw;
}
.kpd-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.kpd-translating {
  font-size: 12px;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "";
    width: 12px;
    height: 12px;
    border: 2px solid var(--el-color-primary-light-5);
    border-top-color: var(--el-color-primary);
    border-radius: 50%;
    animation: kpd-spin 0.6s linear infinite;
  }
}

@keyframes kpd-spin {
  to { transform: rotate(360deg); }
}

.kpd-loading {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.kpd-body {
  display: flex;
  gap: 8px;
  flex: 1;
  min-height: 0;

  // Hide editor in preview-only mode
  &--preview .kpd-editor {
    display: none;
  }
  // Hide preview in edit-only mode
  &--edit .kpd-preview {
    display: none;
  }
  // Edit mode: hide TOC (TOC only useful in preview)
  &--edit .kpd-toc {
    display: none;
  }
}

// ── Chat layout ──

.kpd-body--chat {
  gap: 0;

  &.is-resizing {
    user-select: none;
  }
}

.kpd-left {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kpd-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kpd-resizer {
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: var(--el-border-color-lighter);
  transition: background 0.15s;

  &:hover,
  &.is-active {
    background: var(--el-color-primary-light-7);
  }
}

.kpd-editor {
  flex: 1;
  min-height: 0;

  :deep(.el-textarea__inner) {
    height: 100% !important;
    resize: none;
  }
}

.kpd-toc {
  flex-shrink: 0;
  width: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px 8px 0;
  border-right: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
  line-height: 1.5;
  transition: width 0.2s ease;

  &.is-collapsed {
    width: 36px;
    padding: 8px 4px 8px 0;

    .kpd-toc-title {
      justify-content: center;
    }
    .kpd-toc-title-text {
      display: none;
    }
    .kpd-toc-toggle {
      margin-left: 0;
    }
    .kpd-toc-full {
      display: none;
    }
    .kpd-toc-initial {
      display: inline;
    }
    .kpd-toc-list a {
      justify-content: center;
      padding: 4px 2px;
      border-radius: 4px;
    }
    .kpd-toc-item--h3 a {
      padding-left: 2px;
    }
  }
}
.kpd-toc-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
  margin-bottom: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  &:hover {
    color: var(--el-color-primary);
  }
}
.kpd-toc-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpd-toc-toggle {
  flex-shrink: 0;
  font-size: 10px;
  margin-left: 4px;
  transition: transform 0.2s ease;
}
.kpd-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.kpd-toc-list li {
  margin: 0;
}
.kpd-toc-list a {
  display: flex;
  padding: 2px 4px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  border-radius: 3px;
  transition: background 0.1s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}
.kpd-toc-full {
  display: inline;
}
.kpd-toc-initial {
  display: none;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}
.kpd-toc-item--h3 a {
  padding-left: 12px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.kpd-preview {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin: 1em 0 0.5em;
  }
  :deep(h1) { font-size: 1.5em; }
  :deep(h2) { font-size: 1.3em; }
  :deep(h3) { font-size: 1.15em; }
  :deep(p) { margin: 0.5em 0; }
  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: 6px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 0.9em;
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 4px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
  :deep(table) {
    border-collapse: collapse;
  }
  :deep(th), :deep(td) {
    padding: 6px 12px;
    border: 1px solid var(--el-border-color-lighter);
  }

  // Mermaid diagrams — <pre class="mermaid"> rendered by mermaid.run()
  :deep(pre.mermaid) {
    all: unset;
    display: block;
    overflow-x: auto;
    margin: 12px 0;

    // After mermaid.run() renders, the element contains an SVG
    svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }
}
</style>

<style lang="scss">
// Dialog sizing — non-scoped because el-dialog uses append-to-body,
// which teleports the dialog outside the component DOM tree.
.kpd-dialog {
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding-top: 16px;
  }
}
</style>
