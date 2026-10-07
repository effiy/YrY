/**
 * useStreaming — SSE streaming composable for the AI chat store.
 *
 * Extracted from `aiChat.ts`. Manages `runStream`, `stopSending`, chunk
 * handling (`onChunk`, `onDone`, `onError`, `onSources`, `onPhase`), and
 * post-stream search injection.
 */
import { ref, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { streamChat } from "@/api/modules/chatService";
import { streamRagChat } from "@/api/modules/ragService";
import { loadRobots, sendWeChatMessage } from "@/api/modules/weChatService";
import { getStorageQuota } from "@/utils/storage";
import type { SessionDocument, ChatMessage, FaqDocument } from "@/api/interface/yiAi";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";
import type { AiChatStreamingType } from "@/views/ai-chat/types";

type StreamingPhase = "idle" | "fetching" | "preparing" | "thinking" | "retrieving" | "streaming" | "done";

const SCROLL_THROTTLE_MS = 80;

export interface StreamingDeps {
  // ── Core state (owned by main store) ──
  activeConversation: Ref<SessionDocument | null>;
  sending: Ref<boolean>;
  abortController: Ref<{ abort: () => void } | null>;
  streamingTargetTimestamp: Ref<number | null>;
  streamingType: Ref<AiChatStreamingType>;
  thinkingStartTs: Ref<number | null>;
  streamingPhase: Ref<StreamingPhase>;
  scrollTick: Ref<number>;

  // ── Main store primitives ──
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  persistActive: () => Promise<boolean>;

  // ── RAG settings ──
  ragEnabled: Ref<boolean>;
  ragActive: Ref<boolean>;
  ragHybrid: Ref<boolean>;
  ragRerank: Ref<boolean>;
  ragCitations: Ref<boolean>;
  ragHyde: Ref<boolean>;
  ragFast: Ref<boolean>;
  ragScope: Ref<string>;
  ragNumQueries: Ref<number>;
  ragChatMode: Ref<string>;

  // ── RAG response feedback ──
  lastRagSourceCount: Ref<number>;
  lastRagTopScore: Ref<number>;

  // ── Web search ──
  webSearchEnabled: Ref<boolean>;
  webSearchResults: Ref<WebSearchResult[]>;
  webSearchImages: Ref<WebImageResult[]>;
  searchTimingMs: Ref<number>;

  // ── Model ──
  selectedModel: Ref<string>;

  // ── Prompt ──
  systemPrompt: Ref<string>;
  getToolsForSystemPrompt: () => string;

  // ── Compaction ──
  maybeCompact: () => Promise<void>;

  // ── Context loading ──
  loadContextText: () => Promise<string>;

  // ── WeChat forwarding ──
  forwardReplyToWeCom: (content: string) => Promise<void>;
}

export function useStreaming(deps: StreamingDeps) {
  const {
    activeConversation,
    sending,
    abortController,
    streamingTargetTimestamp,
    streamingType,
    thinkingStartTs,
    streamingPhase,
    scrollTick,
    setActiveMessages,
    persistActive,
    ragEnabled,
    ragActive,
    ragHybrid,
    ragRerank,
    ragCitations,
    ragHyde,
    ragFast,
    ragScope,
    ragNumQueries,
    ragChatMode,
    lastRagSourceCount,
    lastRagTopScore,
    webSearchEnabled,
    webSearchResults,
    webSearchImages,
    searchTimingMs,
    selectedModel,
    systemPrompt,
    getToolsForSystemPrompt,
    maybeCompact,
    loadContextText,
    forwardReplyToWeCom
  } = deps;

  // ── Private helpers ──

  function _attachSearchResults(petTimestamp: number, lastSearchQuery: string): void {
    if (!lastSearchQuery && !webSearchResults.value.length) return;
    setActiveMessages(msgs => {
      const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
      if (idx < 0) return msgs;
      const next = [...msgs];
      next[idx] = {
        ...next[idx],
        searchResults: [...webSearchResults.value],
        ...(webSearchImages.value.length ? { searchImages: [...webSearchImages.value] } : {})
      };
      return next;
    });
  }

  async function _injectLateSearch(
    pendingSearch: Promise<{ context: string; results: WebSearchResult[]; timingMs: number } | null>,
    insertAt: number,
    streamType: AiChatStreamingType
  ): Promise<void> {
    const late = await pendingSearch;
    if (!late?.context || !late.results.length) return;
    searchTimingMs.value = late.timingMs;

    if (ragEnabled.value && ragActive.value) {
      setActiveMessages(msgs => {
        const lastPet = [...msgs].reverse().find(m => m.type === "pet");
        if (!lastPet) return msgs;
        const idx = msgs.indexOf(lastPet);
        const next = [...msgs];
        next[idx] = {
          ...next[idx],
          searchResults: [...late.results],
          ...(webSearchImages.value.length ? { searchImages: [...webSearchImages.value] } : {}),
          searchGrounded: true
        };
        return next;
      });
      return;
    }

    const now = Date.now();
    const um: ChatMessage = { type: "user", message: late.context, timestamp: now };
    const pm: ChatMessage = { type: "pet", message: "", timestamp: now + 1 };
    setActiveMessages(msgs => [...msgs, um, pm]);
    setActiveMessages(msgs => {
      const idx = msgs.findIndex(m => m.timestamp === pm.timestamp);
      if (idx < 0) return msgs;
      const next = [...msgs];
      next[idx] = {
        ...next[idx],
        searchResults: [...late.results],
        ...(webSearchImages.value.length ? { searchImages: [...webSearchImages.value] } : {})
      };
      return next;
    });
    const contextText = await loadContextText();
    await runStream(insertAt, pm.timestamp, streamType, "", contextText);
  }

  // ── Core streaming ──

  /**
   * Shared streaming helper. Sends filtered messages to the chat service
   * and writes streamed chunks into the pet message identified by petTimestamp.
   */
  async function runStream(
    upToIdxInclusive: number,
    petTimestamp: number,
    type: AiChatStreamingType,
    searchContext = "",
    contextText = ""
  ) {
    if (!activeConversation.value) return;
    const session = activeConversation.value;
    const slice = (session.messages ?? []).slice(0, upToIdxInclusive + 1);
    let aiMessages = slice
      .filter(m => m.type === "user" || (m.type === "pet" && !!m.message))
      .map(m => ({ type: m.type, message: m.message, timestamp: m.timestamp }));

    // ── Context trimming — keep only recent messages within ~6K tokens ──
    const MAX_CONTEXT_CHARS = 24_000;
    let totalChars = 0;
    const trimmed: typeof aiMessages = [];
    for (let i = aiMessages.length - 1; i >= 0; i--) {
      const msgChars = (aiMessages[i].message?.length ?? 0) + (searchContext.length || 0);
      if (totalChars + msgChars > MAX_CONTEXT_CHARS && trimmed.length >= 2) break;
      totalChars += msgChars;
      trimmed.unshift(aiMessages[i]);
    }
    aiMessages = trimmed;

    // Inject context text into the last user message
    if (contextText && aiMessages.length > 0) {
      const last = aiMessages[aiMessages.length - 1];
      if (last.type === "user") {
        const ref = contextText
          .split("\n\n---\n\n")
          .filter(Boolean)
          .map(s => s.replace(/^## /, "").trim())
          .join("\n\n");
        last.message = `${last.message}\n\n---\nReference files:\n\n${ref}`;
      }
    }

    // Mark pet message as search-grounded when search context is present
    if (searchContext) {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], searchGrounded: true };
        return next;
      });
    }

    const lastUserMsg = [...slice].reverse().find(m => m.type === "user");
    const images = lastUserMsg?.imageDataUrls ?? [];

    let streamed = "";
    let lastScrollAt = 0;
    let firstTokenAt = 0;
    const streamStartAt = Date.now();
    sending.value = true;
    streamingTargetTimestamp.value = petTimestamp;
    streamingType.value = type;
    streamingPhase.value = "thinking";
    thinkingStartTs.value = Date.now();
    lastRagSourceCount.value = 0;
    lastRagTopScore.value = 0;

    let resolveStream!: () => void;
    const streamFinished = new Promise<void>(resolve => {
      resolveStream = resolve;
    });

    const onPhase = (phase: string) => {
      if (streamingPhase.value !== "thinking" && streamingPhase.value !== "retrieving" && streamingPhase.value !== "preparing") return;
      if (phase === "retrieving") streamingPhase.value = "retrieving";
      else if (phase === "preparing") streamingPhase.value = "preparing";
    };
    const onChunk = (chunk: string) => {
      if (streamingPhase.value === "thinking" || streamingPhase.value === "retrieving" || streamingPhase.value === "preparing")
        streamingPhase.value = "streaming";
      streamed += chunk;
      if (!firstTokenAt) {
        firstTokenAt = Date.now();
        const latencyMs = firstTokenAt - streamStartAt;
        setActiveMessages(msgs => {
          const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
          if (idx < 0) return msgs;
          const next = [...msgs];
          next[idx] = { ...next[idx], firstTokenLatencyMs: latencyMs };
          return next;
        });
      }
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], message: streamed, error: false, aborted: false };
        return next;
      });
      const now = Date.now();
      if (now - lastScrollAt > SCROLL_THROTTLE_MS) {
        lastScrollAt = now;
        scrollTick.value++;
      }
    };
    const onSources = (sources: RagSource[]) => {
      lastRagSourceCount.value = sources.length;
      if (sources.length > 0) {
        const scores = sources.map(s => s.score);
        lastRagTopScore.value = Math.max(...scores);
      }
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], sources };
        return next;
      });
    };
    const onDone = () => {
      if (import.meta.env.DEV) console.log("[aiChat onDone] called. streamed len:", streamed.length, "petTs:", petTimestamp);
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      streamingPhase.value = "idle";
      thinkingStartTs.value = null;
      abortController.value = null;

      // Auto-generate title from first user message on first exchange
      const msgs = activeConversation.value?.messages ?? [];
      const userCount = msgs.filter(m => m.type === "user").length;
      if (userCount === 1 && activeConversation.value?.title === "New chat") {
        const firstUser = msgs.find(m => m.type === "user");
        if (firstUser?.message) {
          const title = firstUser.message.trim().slice(0, 50);
          activeConversation.value.title = title.length < firstUser.message.trim().length ? title + "…" : title;
        }
      }

      persistActive();
      const idx = activeConversation.value?.messages?.findIndex(m => m.timestamp === petTimestamp) ?? -1;
      const petMsg = idx >= 0 ? activeConversation.value?.messages?.[idx] : null;
      if (petMsg && !petMsg.aborted && !petMsg.error && streamed.trim()) {
        forwardReplyToWeCom(streamed);
      }
      maybeCompact();
      resolveStream();
    };
    const onError = (err: Error) => {
      console.warn("[aiChat onError] called. err:", err.message, "streamed len:", streamed.length, "petTs:", petTimestamp);
      sending.value = false;
      streamingTargetTimestamp.value = null;
      streamingType.value = "";
      streamingPhase.value = "idle";
      thinkingStartTs.value = null;
      abortController.value = null;
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = {
          ...next[idx],
          error: true,
          message: streamed || `Error: ${err.message}`
        };
        return next;
      });
      persistActive();
      resolveStream();
    };

    let abort: () => void;
    if (ragEnabled.value && ragActive.value) {
      const ctxFilePaths: string[] = (session.tags ?? [])
        .filter((t: string) => t.startsWith("ctx:"))
        .map((t: string) => t.slice(4));

      const ragMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

      if (contextText && ctxFilePaths.length > 0) {
        const ctxRef = contextText
          .split("\n\n---\n\n")
          .filter(Boolean)
          .map(s => s.replace(/^## /, "").trim())
          .join("\n\n");
        ragMessages.push({
          role: "system",
          content:
            `The following documents are in the user's current context. ` +
            `Retrieved excerpts from these files should be prioritized:\n\n${ctxRef}`
        });
      }

      if (searchContext && webSearchEnabled.value) {
        ragMessages.push({
          role: "system",
          content:
            searchContext +
            "\n\n---\n" +
            "Cite KB excerpts as [N], web sources as [title](url). " +
            "Distinguish sources: 'KB [1] shows...' vs 'Web [title](url) reports...'. " +
            "If KB and web conflict, prefer more recent information."
        });
      }
      ragMessages.push(
        ...aiMessages
          .filter(m => (m.message ?? "").trim().length > 0)
          .map(m => ({ role: m.type === "user" ? ("user" as const) : ("assistant" as const), content: m.message }))
      );
      const handlers: RagStreamHandlers = { onChunk, onSources, onPhase, onDone, onError };
      const ragMeta = {
        chatMode: ragChatMode.value as "condense" | "condense_plus_context" | "context" | "simple",
        hybrid: ragHybrid.value,
        rerank: ragRerank.value,
        citations: ragCitations.value,
        hyde: ragHyde.value,
        ...(ctxFilePaths.length > 0 ? { filePaths: ctxFilePaths } : {}),
        ...(searchContext && webSearchEnabled.value ? { webSearch: true } : {})
      };
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === petTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], ragMeta };
        return next;
      });
      abort = streamRagChat(
        {
          messages: ragMessages,
          model: selectedModel.value,
          hybrid: ragHybrid.value,
          rerank: ragRerank.value,
          citations: ragCitations.value,
          hyde_enabled: ragHyde.value,
          fast: ragFast.value,
          chat_mode: ragChatMode.value as "condense" | "condense_plus_context" | "context" | "simple",
          ...(ragScope.value ? { scope: ragScope.value } : {}),
          ...(ctxFilePaths.length > 0 ? { file_paths: ctxFilePaths } : {}),
          ...(ragNumQueries.value > 0 ? { num_queries: ragNumQueries.value } : {})
        },
        handlers
      ).abort;
    } else {
      const defaultSystem =
        "You are a professional AI assistant. Be concise, accurate, and helpful. " +
        "Use markdown for structure. Prefer facts over speculation. " +
        "When uncertain, acknowledge the limits of your knowledge.";
      const toolPrompt = getToolsForSystemPrompt();
      const searchSystemNote =
        webSearchEnabled.value && searchContext
          ? [
              "## Authoritative Context (Web Search Results)",
              "The following is real-time information from web search. " +
                "You MUST base your response on these facts. " +
                "Do NOT say you lack real-time access — the data is provided below.",
              "",
              searchContext,
              "",
              "Citation rules:",
              "- Cite sources as numbered links: `[1](url)`, `[2](url)`.",
              "- Place citations directly after each claim they support.",
              "- If the search results fully answer the question, respond based on them.",
              "- Only if results are truly insufficient, explain what's missing."
            ].join("\n")
          : "";
      const sysParts = [systemPrompt.value || defaultSystem, toolPrompt, searchSystemNote]
        .map(s => s.trim()).filter(Boolean);
      const system = sysParts.length ? sysParts.join("\n\n") : undefined;
      const result = streamChat(
        {
          messages: aiMessages,
          model: selectedModel.value,
          images,
          ...(system ? { system } : {})
        },
        onChunk,
        onDone,
        onError
      );
      abort = result.abort;
    }

    abortController.value = { abort };
    await streamFinished;
  }

  return {
    runStream,
    _attachSearchResults,
    _injectLateSearch
  };
}