<script setup lang="ts" name="knowledgeChatPanel">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { Promotion, CircleClose, CopyDocument, Edit, Delete, RefreshRight, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useMermaidRender } from "@/hooks/useMermaidRender";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { useAiChatStore } from "@/stores/modules/aiChat";
import { streamChat, probeChatService, getChatTransportStatus, type ChatTransportStatus } from "@/api/modules/chatService";
import { streamRagChat } from "@/api/modules/ragService";
import { webSearch, formatSearchResults } from "@/api/modules/searchService";
import { getFaqs } from "@/api/modules/faqService";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import ChatToolbar from "./ChatToolbar/index.vue";
import DraftImageList from "./DraftImageList.vue";
import RagSources from "@/components/RagSources/RagSources.vue";
import type { ChatMessage, FaqDocument } from "@/api/interface/yiAi";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";

const props = withDefaults(
  defineProps<{
    filePath: string;
    systemPrompt: string;
    ragScope?: string;
  }>(),
  { ragScope: "" }
);

const { t } = useI18n();
const { render } = useMarkdown();
const { openInAiChat } = useAiChatBridge();
const store = useAiChatStore();

// ── Constants ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "kchat:msgs:";
const STORAGE_TAGS_PREFIX = "kchat:tags:";
const STORAGE_SETTINGS_PREFIX = "kchat:cfg:";
const STORAGE_MODEL_PREFIX = "kchat:model:";
const DEFAULT_MODEL = "qwen3.5:4b";
const MAX_IMAGES = 4;
/** Max total characters (messages + system) before trimming to avoid oversized requests. */
const MAX_CONTEXT_CHARS = 24_000;

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

// ── Mermaid rendering ────────────────────────────────────────────────────
const messageContents = computed(() => messages.value.map(m => m.message).join("\n"));
const { render: renderMermaid, dispose: disposeMermaid } = useMermaidRender({
  html: messageContents,
  containerRef
});
onBeforeUnmount(() => disposeMermaid());

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

// ── RAG availability (best-effort check against real index status) ────────
interface RagIndexStatus {
  built: boolean;
  num_docs: number;
  last_built_at?: string;
  error?: string;
}
const ragIndexStatus = ref<RagIndexStatus | null>(null);
const ragAvailable = computed<boolean>(() => {
  const s = ragIndexStatus.value;
  if (!s) return false;
  if (s.error) return false;
  return s.built && s.num_docs > 0;
});

// ── Model selection ─────────────────────────────────────────────────────────
//
// Sync with the shared aiChat store's model list when available. This has
// three benefits:
//   1. Model popover shows real models (fetched from the backend), not just
//      a hardcoded default.
//   2. Model changes made in the preview dialog propagate to the main chat.
//   3. If the saved model is no longer in the list (e.g. old Ollama not
//      started), we fall back to the first available or DEFAULT_MODEL.

const availableModels = computed(() => store.availableModels);
const modelsLoading = computed(() => store.modelsLoading);
const selectedModel = ref<string>(DEFAULT_MODEL);
const modelKey = computed(() => `${STORAGE_MODEL_PREFIX}${props.filePath}`);

function loadModel() {
  let chosen: string | null = null;
  try {
    const raw = localStorage.getItem(modelKey.value);
    if (raw) chosen = raw;
  } catch {
    /* ignore */
  }
  if (!chosen) {
    try {
      const g = localStorage.getItem("aiChat.selectedModel");
      if (g) chosen = g;
    } catch {
      /* ignore */
    }
  }
  // Validate the chosen candidate against the currently available list.
  // If the list isn't loaded yet, accept it as-is and a later watcher will
  // correct it once `fetchModels()` resolves.
  if (chosen) {
    if (availableModels.value.length === 0 || availableModels.value.includes(chosen)) {
      selectedModel.value = chosen;
    }
  }
  saveModel();
}
function saveModel() {
  try {
    localStorage.setItem(modelKey.value, selectedModel.value);
  } catch {
    /* ignore */
  }
}
watch(selectedModel, v => {
  saveModel();
  // Also update the global storage so newly-opened main chat sessions pick
  // up the last-selected preview model.
  try { localStorage.setItem("aiChat.selectedModel", v); } catch { /* ignore */ }
});
// When the store's available list is populated for the first time, make sure
// our selected model is valid — otherwise the server will return 400.
watch(
  availableModels,
  list => {
    if (!list.length) return;
    if (!list.includes(selectedModel.value)) {
      selectedModel.value = list.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : list[0];
    }
  },
  { immediate: true }
);

interface PanelSettings {
  ragEnabled: boolean;
  webSearchEnabled: boolean;
}
const settingsKey = computed(() => `${STORAGE_SETTINGS_PREFIX}${props.filePath}`);

function loadSettings() {
  try {
    const raw = localStorage.getItem(settingsKey.value);
    if (raw) {
      const s: PanelSettings = JSON.parse(raw);
      ragEnabled.value = s.ragEnabled ?? false;
      webSearchEnabled.value = s.webSearchEnabled ?? false;
    }
  } catch {
    /* ignore */
  }
}
function saveSettings() {
  try {
    localStorage.setItem(
      settingsKey.value,
      JSON.stringify({
        ragEnabled: ragEnabled.value,
        webSearchEnabled: webSearchEnabled.value
      })
    );
  } catch {
    /* ignore */
  }
}
watch([ragEnabled, webSearchEnabled], () => saveSettings());

// ── Tags / context ────────────────────────────────────────────────────────

const tags = ref<string[]>([]);
const tagsKey = computed(() => `${STORAGE_TAGS_PREFIX}${props.filePath}`);

function loadTags() {
  try {
    const raw = localStorage.getItem(tagsKey.value);
    if (raw) tags.value = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  ensureCurrentFileInContext();
}
function saveTags() {
  try {
    localStorage.setItem(tagsKey.value, JSON.stringify(tags.value));
  } catch {
    /* ignore */
  }
}
/** Auto-add the current preview file as a ctx: tag so it appears in the context indicator. */
function ensureCurrentFileInContext() {
  if (!props.filePath) return;
  const ctxTag = `ctx:${props.filePath}`;
  if (!tags.value.includes(ctxTag)) {
    tags.value.push(ctxTag);
    saveTags();
  }
}
function addTag(tag: string) {
  if (!tags.value.includes(tag)) {
    tags.value.push(tag);
    saveTags();
  }
}
function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag);
  saveTags();
}

const contextFiles = computed(() => {
  const CTX = "ctx:";
  return tags.value.filter(t => t.startsWith(CTX)).map(t => t.slice(CTX.length));
});

// ── Draft images ──────────────────────────────────────────────────────────

const draftImages = ref<string[]>([]);
const imageInput = ref<HTMLInputElement | null>(null);

function pickImage() {
  imageInput.value?.click();
}

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

function removeDraftImage(idx: number) {
  draftImages.value.splice(idx, 1);
}
function clearDraftImages() {
  draftImages.value = [];
}

// ── FAQ ───────────────────────────────────────────────────────────────────

const faqs = ref<FaqDocument[]>([]);
const faqVisible = ref(false);
const faqSearch = ref("");
const faqLoading = ref(false);
let faqLoaded = false;

async function loadFaqs() {
  if (faqLoading.value) return;
  faqLoading.value = true;
  try {
    faqs.value = await getFaqs();
    faqLoaded = true;
  } catch {
    /* ignore */
  } finally {
    faqLoading.value = false;
  }
}

function toggleFaq() {
  faqVisible.value = !faqVisible.value;
  if (faqVisible.value && !faqLoaded) loadFaqs();
}

const filteredFaqs = computed(() => {
  const q = faqSearch.value.trim().toLowerCase();
  if (!q) return faqs.value;
  return faqs.value.filter(f => (f.title || "").toLowerCase().includes(q) || (f.prompt || "").toLowerCase().includes(q));
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

function openTagManager() {
  tagManagerVisible.value = true;
  newTagInput.value = "";
}
function addNewTag() {
  const t = newTagInput.value.trim();
  if (t) addTag(t);
  newTagInput.value = "";
}
function toggleTagManager() {
  tagManagerVisible.value = !tagManagerVisible.value;
}

// ── Web search ────────────────────────────────────────────────────────────

async function doWebSearch(query: string): Promise<string> {
  if (!webSearchEnabled.value) return "";
  webSearching.value = true;
  try {
    const res = await webSearch(query, 5);
    return res.results?.length ? formatSearchResults(res.results) : "";
  } catch {
    return "";
  } finally {
    webSearching.value = false;
  }
}

// ── Persistence ───────────────────────────────────────────────────────────

const msgKey = computed(() => `${STORAGE_PREFIX}${props.filePath}`);

function loadMessages() {
  try {
    const raw = localStorage.getItem(msgKey.value);
    if (raw) messages.value = JSON.parse(raw);
  } catch {
    /* ignore */
  }
}
function saveMessages() {
  try {
    localStorage.setItem(msgKey.value, JSON.stringify(messages.value));
  } catch {
    /* ignore */
  }
}

watch(
  () => props.filePath,
  () => {
    loadMessages();
    loadTags();
    loadModel();
    input.value = "";
    draftImages.value = [];
  }
);

// ── Transport health (3-tier failover indicator) ──────────────────────────

const transportStatus = ref<ChatTransportStatus>(getChatTransportStatus());
let transportRefreshTimer: ReturnType<typeof setInterval> | null = null;
function refreshTransportStatus() {
  transportStatus.value = getChatTransportStatus();
}
const transportLabel = computed(() => {
  const s = transportStatus.value;
  if (s.forcedFallback && s.selected) {
    const map: Record<string, string> = {
      yiAiRpc: "YiAi RPC",
      yiAiOpenAi: "YiAi · OpenAI",
      ollama: "Ollama (direct)"
    };
    return `Fallback · ${map[s.selected] ?? s.selected}`;
  }
  return "";
});
const transportSeverity = computed<"info" | "warning" | "success" | "danger">(() => {
  const s = transportStatus.value;
  const up = (s.yiAiRpc ? 1 : 0) + (s.yiAiOpenAi ? 1 : 0) + (s.ollama ? 1 : 0);
  if (up === 0) return "danger";
  if (s.forcedFallback) return "warning";
  if (up >= 2) return "success";
  return "info";
});

onMounted(async () => {
  loadMessages();
  loadTags();
  loadSettings();
  loadModel();
  // Probe chat transport availability *before* the user can send — this is
  // what makes RPC-outage transparent: if YiAi RPC module import is broken,
  // we silently mark it down and route requests via /v1/chat/completions or
  // raw Ollama instead.
  try {
    await probeChatService();
    refreshTransportStatus();
  } catch {
    /* best-effort */
  }
  transportRefreshTimer = setInterval(refreshTransportStatus, 4000);

  // Fetch real models and RAG index status so the UI makes informed choices
  // (avoids sending requests for models that don't exist, or enabling RAG on
  // an unbuilt index — both of which result in HTTP 400).
  try {
    if (!store.availableModels.length || store.modelsLoading) {
      await store.fetchModels();
    }
  } catch {
    /* best-effort */
  }
  try {
    const { ragStatus } = await import("@/api/modules/ragService");
    const data = await ragStatus();
    ragIndexStatus.value = {
      built: !!data.built,
      num_docs: Number(data.num_docs) || 0,
      last_built_at: data.last_built_at ?? "",
      error: (data as any).error
    };
  } catch {
    ragIndexStatus.value = { built: false, num_docs: 0, error: "unreachable" };
  }
  // Mermaid rendering handled by useMermaidRender composable (immediate watcher)
});
onBeforeUnmount(() => {
  if (transportRefreshTimer) {
    clearInterval(transportRefreshTimer);
    transportRefreshTimer = null;
  }
});

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
watch(
  () => messages.value.length,
  () => scrollToBottom(),
  { flush: "post" }
);
// Auto-scroll during streaming — scrollTick is incremented by onChunk callbacks
watch(scrollTick, () => scrollToBottom());

// ── Mermaid rendering (non-streaming updates) ──────────────────────────
watch(
  () => messages.value.length,
  () => {
    if (sending.value) return;
    renderMermaid();
  }
);

// ── Send / Stop ───────────────────────────────────────────────────────────

async function send() {
  const text = input.value.trim();
  if (!text && !draftImages.value.length) return;
  if (sending.value) return;

  sending.value = true;
  streamingText.value = "";

  const images = [...draftImages.value];
  const userMsg: LocalMessage = {
    type: "user",
    message: text,
    timestamp: Date.now(),
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

  // Build system prompt — pass undefined when empty so services skip the field
  const baseSystem = (props.systemPrompt || "").trim();
  const systemRaw = searchContext
    ? `${baseSystem}\n\n[Web search results]:\n${searchContext}`.trim()
    : baseSystem;
  const system = systemRaw ? systemRaw : undefined;

  // ── Context trimming (match useStreaming.ts) to avoid oversized payloads ──
  const rawHistory = messages.value.slice(0, -1).filter(m =>
    (m.type === "user" || m.type === "pet") && (m.message ?? "").trim().length > 0
  );
  let totalChars = system?.length ?? 0;
  const trimmed: typeof rawHistory = [];
  for (let i = rawHistory.length - 1; i >= 0; i--) {
    const msgChars = (rawHistory[i].message ?? "").length;
    if (totalChars + msgChars > MAX_CONTEXT_CHARS && trimmed.length >= 2) break;
    totalChars += msgChars;
    trimmed.unshift(rawHistory[i]);
  }

  if (ragEnabled.value && ragAvailable.value) {
    // ── RAG streaming ── pass model + context_notes (system prompt) explicitly
    const ragPayload = {
      messages: trimmed.map(m => ({
        role: m.type === "user" ? ("user" as const) : ("assistant" as const),
        content: m.message
      })),
      stream: true as const,
      model: selectedModel.value,
      scope: props.ragScope || undefined,
      ...(system ? { context_notes: system } : {})
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
    // ── Standard LLM streaming ── pass system only when non-empty
    const history: ChatMessage[] = trimmed.map(m => ({
      type: m.type,
      message: m.message,
      timestamp: m.timestamp
    }));

    const { abort } = streamChat(
      {
        model: selectedModel.value,
        messages: history,
        ...(system ? { system } : {}),
        ...(images.length ? { images } : {})
      },
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
  // Render mermaid diagrams in the completed message
  renderMermaid();
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

/** Compact relative-time label (e.g. "12s", "2m", "5h") for fallback timeline. */
function formatRelativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return `${Math.max(1, Math.round(diff / 1000))}s`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h`;
  return `${Math.round(diff / 86_400_000)}d`;
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
  const history = messages.value
    .slice(0, idx + 1)
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
  } catch {
    return;
  }
  const next = (res?.value ?? "").trim();
  if (!next) return;
  messages.value[idx] = { ...msg, message: next };
  saveMessages();
}

async function deleteMessage(idx: number) {
  const msg = messages.value[idx];
  if (!msg) return;
  const ok = await confirm(t("aiChat.deleteMessageConfirm"), t("aiChat.confirm"));
  if (!ok) return;

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
    if (sending.value) {
      stopSending();
      e.preventDefault();
      return;
    }
    if (input.value.trim() || draftImages.value.length) {
      clearInput();
      e.preventDefault();
      return;
    }
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
const isStreaming = (msg: LocalMessage, idx: number) => sending.value && idx === messages.value.length - 1 && msg.type === "pet";

function ragSummary(msg: LocalMessage) {
  if (!msg.sources?.length) return null;
  const top = msg.sources[0];
  const title = top.metadata?.title || top.file_path?.split("/").pop()?.replace(/\.md$/, "") || "";
  const count = msg.sources.length;
  const files = new Set(msg.sources.map(s => s.file_path)).size;
  const preview = (top.text || "").replace(/\n+/g, " ").trim().slice(0, 120);
  const category = top.metadata?.category || "";
  const type = top.metadata?.type || "";
  const funcDesc = [category, type].filter(Boolean).join(" · ");
  return { title, count, files, preview, funcDesc };
}
</script>

<script lang="ts">
/**
 * Explicit named export for TypeScript consumers that use
 * `import { KnowledgeChatPanel } from "..."` instead of the default export
 * that `<script setup>` provides at runtime via the SFC compiler. This keeps
 * vue-tsc strict mode happy when the component is referenced from other TS
 * modules.
 */
export const KnowledgeChatPanel = defineComponent({ name: "KnowledgeChatPanel" });
</script>

<template>
  <div class="kcp-root">
    <!-- ── Transport / health banner ── -->
    <div
      v-if="transportLabel || transportSeverity === 'danger'"
      class="kcp-transport-banner"
      :class="`is-${transportSeverity}"
    >
      <el-icon :size="14">
        <component
          :is="transportSeverity === 'danger' ? CircleClose : transportSeverity === 'warning' ? Promotion : RefreshRight"
        />
      </el-icon>
      <span class="kcp-transport-label">
        {{ transportSeverity === 'danger'
          ? 'All LLM transports offline — responses disabled'
          : transportLabel }}
      </span>
      <el-popover
        v-if="transportStatus.lastFallbacks?.length"
        placement="bottom-end"
        :width="360"
        trigger="click"
      >
        <template #reference>
          <el-button size="small" text class="kcp-transport-details">Details</el-button>
        </template>
        <div class="kcp-fallback-list">
          <div v-for="(f, i) in transportStatus.lastFallbacks" :key="i" class="kcp-fallback-item">
            <span class="kcp-fallback-kind">
              {{ { yiAiRpc: 'YiAi RPC', yiAiOpenAi: 'YiAi · OpenAI', ollama: 'Ollama (direct)' }[f.kind] ?? f.kind }}
            </span>
            <span class="kcp-fallback-time">{{ formatRelativeTime(f.at) }}</span>
            <div class="kcp-fallback-error">{{ f.error }}</div>
          </div>
        </div>
      </el-popover>
    </div>
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
        <div v-if="msg.searchContext && msg.type === 'user'" class="kcp-msg-web-badge">🌐 Web search results used</div>
        <div v-if="isStreaming(msg, idx) && !msg.message?.trim() && !msg.error" class="kcp-msg-typing">...</div>
        <div v-else-if="msg.type === 'pet'" class="kcp-msg-body" v-html="render(msg.message || '')" />
        <div v-else class="kcp-msg-body kcp-msg-body--plain">{{ msg.message }}</div>
        <div v-if="msg.error" class="kcp-msg-error-tag">Generation failed</div>
        <div v-else-if="msg.aborted" class="kcp-msg-aborted-tag">Stopped</div>
        <div v-if="ragSummary(msg)" class="kcp-rag-summary">
          <span class="kcp-rag-summary-text">
            检索到 <strong>{{ ragSummary(msg)?.files }}</strong> 个文件中的 <strong>{{ ragSummary(msg)?.count }}</strong> 个片段
            <template v-if="ragSummary(msg)?.title"
              >，最佳匹配：<em>{{ ragSummary(msg)?.title }}</em></template
            >
            <template v-if="ragSummary(msg)?.funcDesc"
              ><span class="kcp-rag-summary-func">{{ ragSummary(msg)?.funcDesc }}</span></template
            >
          </span>
          <span v-if="ragSummary(msg)?.preview" class="kcp-rag-summary-preview">{{ ragSummary(msg)?.preview }}</span>
        </div>
        <RagSources v-if="msg.sources?.length" :sources="dedupSources(msg.sources)" />
        <!-- Actions (matches MessageBubble) -->
        <div class="kcp-msg-meta">
          <div class="kcp-msg-actions">
            <template v-if="msg.type === 'pet'">
              <el-button size="small" text :icon="CopyDocument" :disabled="sending" @click="copyMessage(msg)">
                {{ copyFeedback[String(msg.timestamp)] || "Copy" }}
              </el-button>
              <el-button size="small" text :icon="Edit" :disabled="sending" @click="editMessage(idx)">Edit</el-button>
              <el-button size="small" text :icon="RefreshRight" :disabled="sending" @click="regenerateMessage(idx)">
                {{ msg.error || msg.aborted ? "Retry" : "Regenerate" }}
              </el-button>
              <el-button
                size="small"
                text
                :icon="Promotion"
                title="Promote this conversation to a standalone AI Chat session"
                @click="promoteToStandaloneSession(idx)"
                >Promote</el-button
              >
              <el-button size="small" text :icon="Delete" :disabled="sending" @click="deleteMessage(idx)">Delete</el-button>
            </template>
            <template v-else>
              <el-button size="small" text :icon="Edit" :disabled="sending" @click="editMessage(idx)">Edit</el-button>
              <el-button size="small" text :icon="Promotion" :disabled="sending" @click="resendMessage(idx)">Resend</el-button>
              <el-button
                v-if="!msg.searchContext"
                size="small"
                text
                :icon="Search"
                :disabled="sending"
                :type="webSearchEnabled ? 'primary' : ''"
                @click="searchWebResend(idx)"
                >Search Web</el-button
              >
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
          <el-input
            v-model="faqSearch"
            size="small"
            clearable
            placeholder="Search FAQs..."
            @keydown.escape="faqVisible = false"
          />
        </div>
        <div v-if="!filteredFaqs.length" class="kcp-faq-empty">
          {{ faqLoading ? "Loading..." : "No FAQs found" }}
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
            <el-input
              v-model="newTagInput"
              size="small"
              placeholder="Add tag (e.g. ctx:path/to/file)"
              @keydown.enter="addNewTag"
            />
            <el-button size="small" @click="addNewTag">Add</el-button>
          </div>
          <div v-if="tags.length" class="kcp-tag-list">
            <el-tag
              v-for="t in tags"
              :key="t"
              size="small"
              closable
              :type="t.startsWith('ctx:') ? 'success' : undefined"
              @close="removeTag(t)"
              >{{ t }}</el-tag
            >
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
            :placeholder="
              sending ? 'AI responding...' : webSearching ? 'Searching web...' : 'Ask anything (Enter send, Shift+Enter newline)'
            "
            :disabled="sending"
            resize="none"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            @keydown="(e: Event) => onKeydown(e as KeyboardEvent)"
          />
        </div>
        <el-tooltip content="Clear input" placement="bottom">
          <el-button
            v-show="input.trim().length > 0 || draftImages.length > 0"
            circle
            size="default"
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
@use "../../../styles/KnowledgeChatPanel.scss";
</style>
