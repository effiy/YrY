/**
 * useOrchestration — Core message orchestration for the AI chat store.
 * Handles sendMessage, regenerate, retry, resend, and deepenSearch.
 */
import type { Ref } from "vue";
import type { ChatMessage } from "@/api/interface/yiAi";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";
import type { AiChatStreamingType } from "@/views/ai-chat/types";

export interface OrchestrationDeps {
  sending: Ref<boolean>;
  draftImages: Ref<string[]>;
  webSearchResults: Ref<WebSearchResult[]>;
  webSearchImages: Ref<WebImageResult[]>;
  searchTimingMs: Ref<number>;
  lastSearchQuery: Ref<string>;
  activeConversation: Ref<{ key: string; messages: ChatMessage[]; tags: string[]; updatedAt: number } | null>;
  input: Ref<string>;
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  toolEvents: Ref<unknown[]>;
  toolAbortController: Ref<AbortController | null>;
  scrollTick: Ref<number>;
  executePreStreamTools: (query: string, signal: AbortSignal, timestamp: number) => Promise<{
    initialContext: string;
    searchQuery: string;
    timingMs: number;
    pendingSearch: any;
  }>;
  runStream: (prevLen: number, ts: number, type: AiChatStreamingType, ctx: string, contextText: string) => Promise<void>;
  injectLateSearch: (pending: any, count: number, type: AiChatStreamingType) => Promise<void>;
  attachTurnToolCalls: (ts: number, startIdx: number) => void;
  attachSearchResults: (ts: number, query: string) => void;
  loadContextText: () => Promise<string>;
  handleCommand: (cmd: string) => Promise<boolean>;
  createConversation: () => Promise<any>;
  persistActive: () => Promise<boolean>;
}

export function useOrchestration(deps: OrchestrationDeps) {
  const {
    sending, draftImages, webSearchResults, webSearchImages, searchTimingMs,
    lastSearchQuery, activeConversation, input, setActiveMessages, toolEvents,
    toolAbortController, scrollTick, executePreStreamTools, runStream,
    injectLateSearch, attachTurnToolCalls, attachSearchResults,
    loadContextText, handleCommand, createConversation, persistActive
  } = deps;

  async function sendMessage(text?: string) {
    const content = (text ?? input.value).trim();
    const hasImages = draftImages.value.length > 0;

    if (!content && !hasImages && !sending.value) return;

    webSearchResults.value = [];
    webSearchImages.value = [];
    searchTimingMs.value = 0;
    lastSearchQuery.value = "";

    if (sending.value) return;

    if (content.startsWith("/") && !hasImages) {
      const handled = await handleCommand(content);
      if (handled) {
        input.value = "";
        return;
      }
    }
    if (!activeConversation.value) {
      await createConversation();
    }
    if (!activeConversation.value) return;

    const now = Date.now();
    const images = [...draftImages.value];
    const userMsg: ChatMessage = {
      type: "user",
      message: content,
      timestamp: now,
      ...(images.length ? { imageDataUrls: images } : {})
    };
    const petMsg: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    setActiveMessages(msgs => [...msgs, userMsg, petMsg]);
    input.value = "";
    draftImages.value = [];

    const toolEventsStartIdx = (toolEvents.value as any[]).length;

    const toolSignal = new AbortController();
    toolAbortController.value = toolSignal;

    const [toolResult, contextText] = await Promise.all([
      executePreStreamTools(content, toolSignal.signal, now),
      loadContextText()
    ]);
    const { initialContext, searchQuery, timingMs, pendingSearch } = toolResult;

    if (searchQuery) lastSearchQuery.value = searchQuery;
    if (timingMs > 0) searchTimingMs.value = timingMs;

    await runStream((activeConversation.value?.messages?.length ?? 0) - 2, petMsg.timestamp, "send", initialContext, contextText);

    await injectLateSearch(pendingSearch, (activeConversation.value?.messages?.length ?? 0), "send");

    attachTurnToolCalls(petMsg.timestamp, toolEventsStartIdx);

    attachSearchResults(petMsg.timestamp, lastSearchQuery.value);
  }

  async function regenerateMessage(idx: number) {
    if (sending.value) return;
    const s: any = activeConversation.value;
    if (!s) return;
    const messages: ChatMessage[] = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const pet = messages[i];
    if (!pet || pet.type !== "pet") return;

    let userIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j] && messages[j].type !== "pet") {
        userIdx = j;
        break;
      }
    }
    if (userIdx < 0) return;
    const userMsg = messages[userIdx];
    const text = String(userMsg.message ?? "").trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const petTimestamp = typeof pet.timestamp === "number" ? pet.timestamp : now;
    const resetMessages = [...messages];
    resetMessages[i] = {
      ...pet,
      type: "pet",
      timestamp: petTimestamp,
      message: "",
      error: false,
      aborted: false
    };
    (activeConversation as any).value = { ...s, messages: resetMessages, updatedAt: now };
    scrollTick.value++;
    const contextText = await loadContextText();
    await runStream(userIdx, petTimestamp, "regenerate", "", contextText);
  }

  async function retryLastMessage() {
    if (sending.value) return;
    const s: any = activeConversation.value;
    if (!s) return;
    const messages: ChatMessage[] = Array.isArray(s.messages) ? s.messages : [];
    if (messages.length === 0) return;

    let petIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].type === "pet") {
        petIdx = i;
        break;
      }
    }
    if (petIdx < 0) return;
    const pet = messages[petIdx];
    if (!pet || (!pet.error && !pet.aborted)) return;

    await regenerateMessage(petIdx);
  }

  async function deepenSearch() {
    if (sending.value) return;
    const s: any = activeConversation.value;
    if (!s) return;
    const messages: ChatMessage[] = Array.isArray(s.messages) ? s.messages : [];
    let userIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i] && messages[i].type === "user") {
        userIdx = i;
        break;
      }
    }
    if (userIdx < 0) return;
    deps.webSearchResults.value = [];
    // Enable web search before resending
    (deps as any).webSearchEnabled = true;
    await resendMessage(userIdx);
  }

  async function resendMessage(idx: number) {
    if (sending.value) return;
    const s: any = activeConversation.value;
    if (!s) return;
    const messages: ChatMessage[] = Array.isArray(s.messages) ? s.messages : [];
    const i = Number(idx);
    if (!Number.isFinite(i) || i < 0 || i >= messages.length) return;
    const userMsg = messages[i];
    if (!userMsg || userMsg.type === "pet") return;
    const text = String(userMsg.message ?? "").trim();
    const images = Array.isArray(userMsg.imageDataUrls) ? userMsg.imageDataUrls.filter(Boolean) : [];
    if (!text && images.length === 0) return;

    const now = Date.now();
    const insertedPet: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    const nextMessages = [...messages];
    nextMessages.splice(i + 1, 0, insertedPet);
    const userTimestamp = typeof userMsg.timestamp === "number" ? userMsg.timestamp : now;
    (activeConversation as any).value = { ...s, messages: nextMessages, updatedAt: now };
    scrollTick.value++;

    const toolSignal = new AbortController();
    toolAbortController.value = toolSignal;
    const toolEventsStartIdx = (toolEvents.value as any[]).length;

    const [toolResult, contextText] = await Promise.all([
      executePreStreamTools(text, toolSignal.signal, userTimestamp),
      loadContextText()
    ]);
    const { initialContext, searchQuery, timingMs, pendingSearch } = toolResult;

    if (searchQuery) lastSearchQuery.value = searchQuery;
    if (timingMs > 0) searchTimingMs.value = timingMs;

    await runStream(i, insertedPet.timestamp, "resend", initialContext, contextText);

    await injectLateSearch(pendingSearch, (activeConversation.value as any)?.messages?.length ?? 0, "resend");

    attachTurnToolCalls(insertedPet.timestamp, toolEventsStartIdx);

    attachSearchResults(insertedPet.timestamp, lastSearchQuery.value);
  }

  return { sendMessage, regenerateMessage, retryLastMessage, deepenSearch, resendMessage };
}