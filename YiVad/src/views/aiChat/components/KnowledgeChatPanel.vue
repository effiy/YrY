<script setup lang="ts" name="knowledgeChatPanel">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import {
  Promotion, CircleClose, CopyDocument, Edit, Delete,
  RefreshRight, Search
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { streamChat } from "@/api/modules/chatService";
import { streamRagChat } from "@/api/modules/ragService";
import { webSearch, formatSearchResults } from "@/api/modules/searchService";
import { getFaqs } from "@/api/modules/faqService";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import ChatToolbar from "./ChatToolbar.vue";
import DraftImageList from "./DraftImageList.vue";
import RagSources from "@/components/RagSources.vue";
import type { ChatMessage, FaqDocument } from "@/api/interface/yiweb";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";

const props = withDefaults(
  defineProps<{
    filePath: string;
    systemPrompt: string;
    ragScope?: string;
  }>(),
  { ragScope: "" }
);

const { render } = useMarkdown();
const { openInAiChat } = useAiChatBridge();
const store = useAiChatStore();

// ── Constants ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "kchat:msgs:";
const STORAGE_TAGS_PREFIX = "kchat:tags:";
const STORAGE_SETTINGS_PREFIX = "kchat:cfg:";
const STORAGE_MODEL_PREFIX = "kchat:model:";
const DEFAULT_MODEL = "qwen3.5";
const MAX_IMAGES = 4;

interface LocalMessage {
  type: "user" | "pet";
  message: string;
  timestamp: number;
  imageDataUrls?: string[];
  error?: boolean;
  aborted?: boolean;
  sources?: RagSource[];
  searchContext?: string;
}

// ── Core state ────────────────────────────────────────────────────────────

const messages = ref<LocalMessage[]>([]);
const input = ref("");
const sending = ref(false);
const streamingText = ref("");
const abortRef = ref<{ abort: () => void } | null>(null);
const containerRef = ref<HTMLDivElement>();
const scrollTick = ref(0);

// ── IME composition ────────────────────────────────────────────────────────

const isComposing = ref(false);
const compositionEndTime = ref(0);
const COMPOSITION_END_DELAY = 160;

function onCompositionStart() {
  isComposing.value = true;
  compositionEndTime.value = 0;
}

function onCompositionEnd() {
  isComposing.value = false;
  compositionEndTime.value = Date.now();
}

// ── Toggles ───────────────────────────────────────────────────────────────

const ragEnabled = ref(false);
const webSearchEnabled = ref(false);
const webSearching = ref(false);
const ragAvailable = ref(true);

// ── Model selection ─────────────────────────────────────────────────────────

const selectedModel = ref(DEFAULT_MODEL);
const modelKey = computed(() => `${STORAGE_MODEL_PREFIX}${props.filePath}`);

function loadModel() {
  try {
    const raw = localStorage.getItem(modelKey.value);
    if (raw) selectedModel.value = raw;
  } catch { /* ignore */ }
}
function saveModel() {
  try { localStorage.setItem(modelKey.value, selectedModel.value); } catch { /* ignore */ }
}
watch(selectedModel, () => saveModel());

interface PanelSettings { ragEnabled: boolean; webSearchEnabled: boolean; }
const settingsKey = computed(() => `${STORAGE_SETTINGS_PREFIX}${props.filePath}`);

function loadSettings() {
  try {
    const raw = localStorage.getItem(settingsKey.value);
    if (raw) {
      const s: PanelSettings = JSON.parse(raw);
      ragEnabled.value = s.ragEnabled ?? false;
      webSearchEnabled.value = s.webSearchEnabled ?? false;
    }
  } catch { /* ignore */ }
}
function saveSettings() {
  try {
    localStorage.setItem(settingsKey.value, JSON.stringify({
      ragEnabled: ragEnabled.value,
      webSearchEnabled: webSearchEnabled.value
    }));
  } catch { /* ignore */ }
}
watch([ragEnabled, webSearchEnabled], () => saveSettings(), { deep: true });

// ── Tags / context ────────────────────────────────────────────────────────

const tags = ref<string[]>([]);
const tagsKey = computed(() => `${STORAGE_TAGS_PREFIX}${props.filePath}`);

function loadTags() {
  try {
    const raw = localStorage.getItem(tagsKey.value);
    if (raw) tags.value = JSON.parse(raw);
  } catch { /* ignore */ }
}
function saveTags() {
  try { localStorage.setItem(tagsKey.value, JSON.stringify(tags.value)); } catch { /* ignore */ }
}
function addTag(tag: string) {
  if (!tags.value.includes(tag)) { tags.value.push(tag); saveTags(); }
}
function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag);
  saveTags();
}

const contextFiles = computed(() => {
  const CTX = "ctx:";
  return tags.value
    .filter(t => t.startsWith(CTX))
    .map(t => t.slice(CTX.length));
});

// ── Draft images ──────────────────────────────────────────────────────────

const draftImages = ref<string[]>([]);
const imageInput = ref<HTMLInputElement | null>(null);

function pickImage() { imageInput.value?.click(); }

async function onImageChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  const remaining = MAX_IMAGES - draftImages.value.length;
  if (remaining <= 0) return;
  for (const f of Array.from(files).slice(0, remaining)) {
    const url = await readAsDataUrl(f);
    if (url) draftImages.value.push(url);
  }
  (e.target as HTMLInputElement).value = "";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").trim());
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function removeDraftImage(idx: number) { draftImages.value.splice(idx, 1); }
function clearDraftImages() { draftImages.value = []; }

// ── FAQ ───────────────────────────────────────────────────────────────────

const faqs = ref<FaqDocument[]>([]);
const faqVisible = ref(false);
const faqSearch = ref("");
const faqLoading = ref(false);
let faqLoaded = false;

async function loadFaqs() {
  if (faqLoading.value) return;
  faqLoading.value = true;
  try { faqs.value = await getFaqs(); faqLoaded = true; }
  catch { /* ignore */ }
  finally { faqLoading.value = false; }
}

function toggleFaq() {
  faqVisible.value = !faqVisible.value;
  if (faqVisible.value && !faqLoaded) loadFaqs();
}

const filteredFaqs = computed(() => {
  const q = faqSearch.value.trim().toLowerCase();
  if (!q) return faqs.value;
  return faqs.value.filter(f =>
    (f.title || "").toLowerCase().includes(q) ||
    (f.prompt || "").toLowerCase().includes(q)
  );
});

function applyFaq(item: FaqDocument) {
  const text = item.prompt || "";
  if (input.value && !input.value.endsWith("\n")) input.value += "\n";
  input.value += text;
  faqVisible.value = false;
}

function sendNow(item: FaqDocument) {
  input.value = item.prompt || "";
  faqVisible.value = false;
  send();
}

// ── WeChat ────────────────────────────────────────────────────────────────

const wechatVisible = ref(false);
const wechatRobots = ref<Array<{ name: string; webhook: string; enabled: boolean; autoForward: boolean }>>([]);

function openWechat() {
  wechatRobots.value = loadRobots().filter(r => r?.enabled);
  wechatVisible.value = true;
}

async function forwardToWechat(text: string) {
  const targets = wechatRobots.value.filter(r => r.enabled && r.autoForward && r.webhook);
  if (!targets.length) return;
  await Promise.all(targets.map(r => sendWeChatMessage(r.webhook, text).catch(() => {})));
}

// ── Tag management ────────────────────────────────────────────────────────

const tagManagerVisible = ref(false);
const newTagInput = ref("");

function openTagManager() { tagManagerVisible.value = true; newTagInput.value = ""; }
function addNewTag() {
  const t = newTagInput.value.trim();
  if (t) addTag(t);
  newTagInput.value = "";
}
function toggleTagManager() { tagManagerVisible.value = !tagManagerVisible.value; }

// ── Web search ────────────────────────────────────────────────────────────

async function doWebSearch(query: string): Promise<string> {
  if (!webSearchEnabled.value) return "";
  webSearching.value = true;
  try {
    const res = await webSearch(query, 5);
    return res.results?.length ? formatSearchResults(res.results) : "";
  } catch { return ""; }
  finally { webSearching.value = false; }
}

// ── Persistence ───────────────────────────────────────────────────────────

const msgKey = computed(() => `${STORAGE_PREFIX}${props.filePath}`);

function loadMessages() {
  try {
    const raw = localStorage.getItem(msgKey.value);
    if (raw) messages.value = JSON.parse(raw);
  } catch { /* ignore */ }
}
function saveMessages() {
  try { localStorage.setItem(msgKey.value, JSON.stringify(messages.value)); } catch { /* ignore */ }
}

watch(() => props.filePath, () => {
  loadMessages();
  loadTags();
  loadModel();
  input.value = "";
  draftImages.value = [];
});

onMounted(() => { loadMessages(); loadTags(); loadSettings(); loadModel(); });

// ── Streaming type ────────────────────────────────────────────────────────

const streamingType = computed<"" | "send" | "regenerate" | "resend">(() => "send");

// ── Scrolling ─────────────────────────────────────────────────────────────

function scrollToBottom() {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  });
}
watch(() => messages.value.length, () => scrollToBottom(), { flush: "post" });
// Auto-scroll during streaming — scrollTick is incremented by onChunk callbacks
watch(scrollTick, () => scrollToBottom());

// ── Send / Stop ───────────────────────────────────────────────────────────

async function send() {
  const text = input.value.trim();
  if (!text && !draftImages.value.length) return;
  if (sending.value) return;

  sending.value = true;
  streamingText.value = "";

  const images = [...draftImages.value];
  const userMsg: LocalMessage = {
    type: "user", message: text, timestamp: Date.now(),
    imageDataUrls: images.length ? images : undefined
  };
  messages.value.push(userMsg);
  input.value = "";
  draftImages.value = [];
  saveMessages();
  scrollToBottom();

  // Web search (pre-stream)
  let searchContext = "";
  if (webSearchEnabled.value && text) {
    searchContext = await doWebSearch(text);
    if (searchContext) {
      messages.value[messages.value.length - 1] = { ...userMsg, searchContext };
    }
  }

  // Placeholder pet message
  const petMsg: LocalMessage = { type: "pet", message: "", timestamp: Date.now() };
  messages.value.push(petMsg);
  const petIdx = messages.value.length - 1;
  scrollTick.value++;

  // Build system prompt with search context if available
  const system = searchContext
    ? `${props.systemPrompt}\n\n[Web search results]:\n${searchContext}`
    : props.systemPrompt;

  if (ragEnabled.value && ragAvailable.value) {
    // ── RAG streaming ──
    const ragPayload = {
      messages: messages.value.slice(0, -1).map(m => ({
        role: m.type === "user" ? "user" as const : "assistant" as const,
        content: m.message
      })),
      stream: true as const,
      scope: props.ragScope || undefined
    };

    const handlers: RagStreamHandlers = {
      onChunk: (chunk: string) => {
        streamingText.value += chunk;
        messages.value[petIdx] = { ...messages.value[petIdx], message: streamingText.value };
        scrollTick.value++;
      },
      onSources: (sources: RagSource[]) => {
        messages.value[petIdx] = { ...messages.value[petIdx], sources };
      },
      onDone: () => finishSend(petIdx),
      onError: (err: Error) => handleSendError(petIdx, err)
    };
    abortRef.value = streamRagChat(ragPayload as any, handlers);
  } else {
    // ── Standard LLM streaming ──
    const history: ChatMessage[] = messages.value.slice(0, -1).map(m => ({
      type: m.type, message: m.message, timestamp: m.timestamp
    }));

    const { abort } = streamChat(
      { model: selectedModel.value, messages: history, system, ...(images.length ? { images } : {}) },
      (chunk: string) => {
        streamingText.value += chunk;
        messages.value[petIdx] = { ...messages.value[petIdx], message: streamingText.value };
        scrollTick.value++;
      },
      () => finishSend(petIdx),
      (err: Error) => handleSendError(petIdx, err)
    );
    abortRef.value = { abort };
  }
}

function finishSend(petIdx: number) {
  sending.value = false;
  streamingText.value = "";
  abortRef.value = null;
  saveMessages();
  // Auto-forward to WeChat
  const petText = messages.value[petIdx]?.message;
  if (petText) forwardToWechat(petText);
}

function handleSendError(petIdx: number, err: Error) {
  sending.value = false;
  streamingText.value = "";
  abortRef.value = null;
  messages.value[petIdx] = {
    ...messages.value[petIdx],
    message: messages.value[petIdx].message || `Error: ${err.message}`,
    error: true
  };
  saveMessages();
}

function stopSending() {
  abortRef.value?.abort();
  if (messages.value.length) {
    const last = messages.value[messages.value.length - 1];
    if (last.type === "pet") {
      messages.value[messages.value.length - 1] = { ...last, aborted: true };
    }
  }
  sending.value = false;
  abortRef.value = null;
  saveMessages();
}

function clearInput() {
  input.value = "";
  draftImages.value = [];
}

// ── Message actions ────────────────────────────────────────────────────────

const copyFeedback = ref<Record<string, string>>({});

function timeLabel(ts: number) {
  return new Date(ts).toLocaleString();
}

/** Deduplicate sources by file_path, keeping the highest score. */
function dedupSources(sources: RagSource[]): RagSource[] {
  const seen = new Map<string, RagSource>();
  for (const s of sources) {
    const existing = seen.get(s.file_path);
    if (!existing || s.score > existing.score) {
      seen.set(s.file_path, s);
    }
  }
  return [...seen.values()].sort((a, b) => b.score - a.score);
}

async function copyMessage(msg: LocalMessage) {
  const text = msg.message ?? "";
  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.value = { ...copyFeedback.value, [String(msg.timestamp)]: "Copied!" };
    setTimeout(() => {
      copyFeedback.value = { ...copyFeedback.value, [String(msg.timestamp)]: "" };
    }, 2000);
  } catch {
    /* ignore */
  }
}

async function promoteToStandaloneSession(idx: number) {
  const history = messages.value.slice(0, idx + 1)
    .filter(m => (m.message ?? "").trim())
    .map(m => `**${m.type === "user" ? "User" : "Assistant"}:** ${m.message ?? ""}`);
  const transcript = history.length ? ["", "## Conversation so far", "", ...history].join("\n") : "";
  const fp = props.filePath;
  const pageContent = [
    `# Knowledge file chat: \`${fp}\``,
    "",
    `**File:** \`${fp}\``,
    ...(props.ragScope ? [`**RAG scope:** \`${props.ragScope}\``] : []),
    transcript
  ].join("\n");
  const tags = [`ctx:${fp}`, `file:${fp}`, "knowledge", "knowledge-chat"];
  await openInAiChat({
    title: `Knowledge chat: ${fp.split("/").pop() || fp}`,
    pageContent,
    tags
  });
}

async function editMessage(idx: number) {
  const msg = messages.value[idx];
  if (!msg) return;
  let res: { value?: string } | null = null;
  try {
    res = await ElMessageBox.prompt("Enter new content", "Edit message", {
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValue: msg.message ?? ""
    });
  } catch { return; }
  const next = (res?.value ?? "").trim();
  if (!next) return;
  messages.value[idx] = { ...msg, message: next };
  saveMessages();
}

async function deleteMessage(idx: number) {
  try {
    await ElMessageBox.confirm("Delete this message?", "Confirm delete", {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning"
    });
  } catch { return; }
  messages.value.splice(idx, 1);
  saveMessages();
}

/** Regenerate: remove last pet message and re-send the preceding user message. */
async function regenerateMessage(petIdx: number) {
  if (sending.value) return;
  // Find the preceding user message
  const userIdx = petIdx - 1;
  if (userIdx < 0 || messages.value[userIdx]?.type !== "user") return;
  const userMsg = messages.value[userIdx];
  // Remove the pet message
  messages.value.splice(petIdx, 1);
  saveMessages();
  // Re-send
  input.value = userMsg.message;
  if (userMsg.imageDataUrls?.length) {
    draftImages.value = [...userMsg.imageDataUrls];
  }
  await send();
}

/** Resend: resend a specific user message (removing everything after it). */
async function resendMessage(idx: number) {
  if (sending.value) return;
  const msg = messages.value[idx];
  if (!msg || msg.type !== "user") return;
  // Remove this message and everything after it
  messages.value.splice(idx);
  saveMessages();
  input.value = msg.message;
  if (msg.imageDataUrls?.length) {
    draftImages.value = [...msg.imageDataUrls];
  }
  await send();
}

/** Search web: enable web search and resend from this user message. */
async function searchWebResend(idx: number) {
  webSearchEnabled.value = true;
  await resendMessage(idx);
}

// ── Keyboard ──────────────────────────────────────────────────────────────

function onKeydown(e: KeyboardEvent) {
  if (isComposing.value) return;
  const mod = e.metaKey || e.ctrlKey;

  // Escape
  if (e.key === "Escape") {
    if (sending.value) { stopSending(); e.preventDefault(); return; }
    if (input.value.trim() || draftImages.value.length) { clearInput(); e.preventDefault(); return; }
  }
  // Ctrl+K / Cmd+K: clear conversation
  if (mod && e.key === "k" && !sending.value) {
    e.preventDefault();
    messages.value = [];
    saveMessages();
    return;
  }
  // Ctrl+L / Cmd+L: clear input
  if (mod && e.key === "l" && !sending.value) {
    e.preventDefault();
    clearInput();
    return;
  }
  // Enter: send (IME-aware)
  if (e.key === "Enter" && !e.shiftKey) {
    if (e.isComposing) return;
    const elapsed = Date.now() - compositionEndTime.value;
    if (compositionEndTime.value > 0 && elapsed < COMPOSITION_END_DELAY) return;
    e.preventDefault();
    compositionEndTime.value = 0;
    send();
  }
}

// ── Computed ──────────────────────────────────────────────────────────────

const hasMessages = computed(() => messages.value.length > 0);
const isStreaming = (msg: LocalMessage, idx: number) =>
  sending.value && idx === messages.value.length - 1 && msg.type === "pet";
</script>

<template>
  <div class="kcp-root">
    <!-- ── Messages ── -->
    <div ref="containerRef" class="kcp-messages">
      <div v-if="!hasMessages" class="kcp-center">
        <el-empty description="Ask questions about this file." :image-size="60" />
      </div>
      <div
        v-for="(msg, idx) in messages"
        :key="msg.timestamp"
        class="kcp-msg"
        :class="{
          'kcp-msg--user': msg.type === 'user',
          'kcp-msg--pet': msg.type === 'pet',
          'kcp-msg--error': msg.error
        }"
      >
        <div v-if="msg.imageDataUrls?.length" class="kcp-msg-images">
          <img v-for="(src, i) in msg.imageDataUrls" :key="i" :src="src" class="kcp-msg-img" alt="" />
        </div>
        <div v-if="msg.searchContext && msg.type === 'user'" class="kcp-msg-web-badge">
          🌐 Web search results used
        </div>
        <div v-if="isStreaming(msg, idx) && !msg.message?.trim() && !msg.error" class="kcp-msg-typing">...</div>
        <div
          v-else-if="msg.type === 'pet'"
          class="kcp-msg-body"
          v-html="render(msg.message || '')"
        />
        <div v-else class="kcp-msg-body kcp-msg-body--plain">{{ msg.message }}</div>
        <div v-if="msg.error" class="kcp-msg-error-tag">Generation failed</div>
        <div v-else-if="msg.aborted" class="kcp-msg-aborted-tag">Stopped</div>
        <RagSources v-if="msg.sources?.length" :sources="dedupSources(msg.sources)" />
        <!-- Actions (matches MessageBubble) -->
        <div class="kcp-msg-meta">
          <div class="kcp-msg-actions">
            <template v-if="msg.type === 'pet'">
              <el-button size="small" text :icon="CopyDocument" :disabled="sending" @click="copyMessage(msg)">
                {{ copyFeedback[String(msg.timestamp)] || 'Copy' }}
              </el-button>
              <el-button size="small" text :icon="Edit" :disabled="sending" @click="editMessage(idx)">Edit</el-button>
              <el-button size="small" text :icon="RefreshRight" :disabled="sending" @click="regenerateMessage(idx)">
                {{ msg.error || msg.aborted ? 'Retry' : 'Regenerate' }}
              </el-button>
              <el-button
                size="small"
                text
                :icon="Promotion"
                title="Promote this conversation to a standalone AI Chat session"
                @click="promoteToStandaloneSession(idx)"
              >Promote</el-button>
              <el-button size="small" text :icon="Delete" :disabled="sending" @click="deleteMessage(idx)">Delete</el-button>
            </template>
            <template v-else>
              <el-button size="small" text :icon="Edit" :disabled="sending" @click="editMessage(idx)">Edit</el-button>
              <el-button size="small" text :icon="Promotion" :disabled="sending" @click="resendMessage(idx)">Resend</el-button>
              <el-button
                v-if="!msg.searchContext"
                size="small" text :icon="Search"
                :disabled="sending"
                :type="webSearchEnabled ? 'primary' : ''"
                @click="searchWebResend(idx)"
              >Search Web</el-button>
              <el-button size="small" text :icon="Delete" :disabled="sending" @click="deleteMessage(idx)">Delete</el-button>
            </template>
          </div>
          <span class="kcp-msg-time">{{ timeLabel(msg.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- ── Input area (toolbar + input — matches ChatInput layout) ── -->
    <div class="kcp-input-area">
      <ChatToolbar
        :faq-active="faqVisible"
        :sending="sending"
        :streaming-type="streamingType"
        :rag-toggle="ragEnabled"
        :rag-available="ragAvailable"
        :web-search-toggle="webSearchEnabled"
        :context-files="contextFiles"
        :selected-model="selectedModel"
        :available-models="store.availableModels"
        @toggle-faq="toggleFaq"
        @pick-image="pickImage"
        @manage-tags="openTagManager"
        @open-wechat="openWechat"
        @toggle-rag="ragEnabled = !ragEnabled"
        @toggle-web-search="webSearchEnabled = !webSearchEnabled"
        @update-selected-model="selectedModel = $event"
        @stop="stopSending"
        @remove-context-file="removeTag('ctx:' + $event)"
      />
      <input ref="imageInput" type="file" accept="image/*" multiple class="kcp-file-input" @change="onImageChange" />

      <!-- FAQ popover -->
      <div v-if="faqVisible" class="kcp-faq-drop">
        <div class="kcp-faq-search">
          <el-input v-model="faqSearch" size="small" clearable placeholder="Search FAQs..." @keydown.escape="faqVisible = false" />
        </div>
        <div v-if="!filteredFaqs.length" class="kcp-faq-empty">
          {{ faqLoading ? 'Loading...' : 'No FAQs found' }}
        </div>
        <div class="kcp-faq-list">
          <div v-for="item in filteredFaqs" :key="item.key" class="kcp-faq-item">
            <div class="kcp-faq-item-title">{{ item.title || "—" }}</div>
            <div class="kcp-faq-item-prompt">{{ item.prompt }}</div>
            <div class="kcp-faq-item-actions">
              <el-button size="small" text @click="applyFaq(item as FaqDocument)">Apply</el-button>
              <el-button size="small" text type="success" @click="sendNow(item as FaqDocument)">Send</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tag manager -->
      <div v-if="tagManagerVisible" class="kcp-tag-manager">
        <div class="kcp-tag-manager-header">
          <span class="kcp-tag-manager-title">Manage Tags</span>
          <el-button size="small" text @click="tagManagerVisible = false">✕</el-button>
        </div>
        <div class="kcp-tag-manager-body">
          <div class="kcp-tag-manager-row">
            <el-input v-model="newTagInput" size="small" placeholder="Add tag (e.g. ctx:path/to/file)" @keydown.enter="addNewTag" />
            <el-button size="small" @click="addNewTag">Add</el-button>
          </div>
          <div v-if="tags.length" class="kcp-tag-list">
            <el-tag
              v-for="t in tags" :key="t"
              size="small" closable
              :type="t.startsWith('ctx:') ? 'success' : undefined"
              @close="removeTag(t)"
            >{{ t }}</el-tag>
          </div>
          <div v-else class="kcp-tag-empty">No tags. Add <code>ctx:path/to/file</code> to include context files.</div>
        </div>
      </div>

      <DraftImageList :images="draftImages" @remove="removeDraftImage" @clear="clearDraftImages" />
      <div class="kcp-input-row">
        <div class="kcp-textarea-wrap">
          <el-input
            v-model="input"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 6 }"
            :placeholder="sending ? 'AI responding...' : webSearching ? 'Searching web...' : 'Ask anything (Enter send, Shift+Enter newline)'"
            :disabled="sending"
            resize="none"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            @keydown="e => onKeydown(e as KeyboardEvent)"
          />
        </div>
        <el-tooltip content="Clear input" placement="bottom">
          <el-button
            v-show="input.trim().length > 0 || draftImages.length > 0"
            circle size="default"
            :icon="CircleClose"
            @click="clearInput()"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- WeChat dialog (portal — outside the flex layout) -->
    <el-dialog v-model="wechatVisible" title="WeCom Bot Forwarding" width="400px" append-to-body>
      <div v-if="!wechatRobots.length" class="kcp-wechat-empty">
        No WeCom bots configured. Add bots in YiWeb → WeChat Settings.
      </div>
      <div v-for="r in wechatRobots" :key="r.name" class="kcp-wechat-row">
        <el-icon :size="16"><Promotion /></el-icon>
        <span>{{ r.name }}</span>
        <el-tag v-if="r.autoForward" size="small" type="success">auto-forward</el-tag>
      </div>
      <template #footer>
        <el-button @click="wechatVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
// ── Root ──

.kcp-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--el-bg-color);
}

// ── File input (hidden) ──

.kcp-file-input {
  display: none;
}

// ── FAQ dropdown ──

.kcp-faq-drop {
  max-height: 260px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.kcp-faq-search { padding: 6px 10px; }
.kcp-faq-empty {
  padding: 12px 10px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}
.kcp-faq-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 6px;
}
.kcp-faq-item {
  padding: 6px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  &:first-child { border-top: none; }
}
.kcp-faq-item-title { font-size: 12px; font-weight: 600; color: var(--el-text-color-primary); }
.kcp-faq-item-prompt {
  max-height: 40px;
  margin-top: 2px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kcp-faq-item-actions { display: flex; gap: 2px; justify-content: flex-end; margin-top: 2px; }

// ── Tag manager ──

.kcp-tag-manager {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 8px 10px;
}
.kcp-tag-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.kcp-tag-manager-title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.kcp-tag-manager-body { display: flex; flex-direction: column; gap: 6px; }
.kcp-tag-manager-row { display: flex; gap: 6px; align-items: center; }
.kcp-tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
.kcp-tag-empty { font-size: 12px; color: var(--el-text-color-placeholder); }

// ── WeChat dialog ──

.kcp-wechat-empty { font-size: 13px; color: var(--el-text-color-placeholder); text-align: center; padding: 16px 0; }
.kcp-wechat-row { display: flex; gap: 8px; align-items: center; padding: 6px 0; font-size: 13px; }

// ── Messages (matches MessageBubble styles) ──

.kcp-messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 12px;
  overflow-y: auto;
}
.kcp-center {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.kcp-msg {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 12px;

  &--user {
    align-self: flex-end;
    background: var(--el-color-primary-light-9);
    border-radius: 12px 12px 4px;
  }
  &--pet {
    align-self: flex-start;
    background: var(--el-fill-color-light);
    border-radius: 12px 12px 12px 4px;
  }
  &--error {
    border: 1px solid var(--el-color-danger);
  }
}

.kcp-msg-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.kcp-msg-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.kcp-msg-web-badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border-radius: 10px;
}

.kcp-msg-typing {
  font-style: italic;
  color: var(--el-text-color-secondary);
  animation: kcp-blink 1s infinite;
}
@keyframes kcp-blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.kcp-msg-body {
  overflow-wrap: anywhere;

  &--plain { white-space: pre-wrap; }

  :deep(p) { margin: 0 0 4px; }
  :deep(pre) {
    padding: 8px;
    overflow-x: auto;
    font-size: 12px;
    background: var(--el-fill-color);
    border-radius: 6px;
  }
  :deep(code) {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 12px;
  }
  :deep(ol), :deep(ul) { padding-left: 1.5em; }
  :deep(blockquote) {
    margin: 0.25em 0;
    padding: 2px 10px;
    border-left: 3px solid var(--el-color-primary-light-5);
    color: var(--el-text-color-secondary);
  }
}

.kcp-msg-error-tag {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-danger);
}
.kcp-msg-aborted-tag {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.kcp-msg-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.kcp-msg-actions {
  display: flex;
  gap: 2px;
}
.kcp-msg-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

// ── Input area (matches ChatInput styles) ──

.kcp-input-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 8px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
}
.kcp-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 0 12px;
}
.kcp-textarea-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  :deep(.el-textarea__inner) {
    padding-right: 8px;
  }
}
</style>
