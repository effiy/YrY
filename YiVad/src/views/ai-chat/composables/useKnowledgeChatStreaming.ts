/**
 * useKnowledgeChatStreaming — Send/stop streaming logic for KnowledgeChatPanel.
 */
import { type Ref } from "vue";
import { streamChat } from "@/api/modules/chatService";
import { streamRagChat } from "@/api/modules/ragService";
import type { ChatMessage } from "@/api/interface/yiAi";
import type { RagSource, RagStreamHandlers } from "@/api/interface/rag";
import type { LocalMessage } from "./useKnowledgeChatMessages";

export interface StreamingDeps {
  filePath: Ref<string>;
  messages: Ref<LocalMessage[]>;
  streamingText: Ref<string>;
  abortRef: Ref<{ abort: () => void } | null>;
  scrollTick: Ref<number>;
  sending: Ref<boolean>;
  input: Ref<string>;
  draftImages: Ref<string[]>;
  ragEnabled: Ref<boolean>;
  ragAvailable: Ref<boolean>;
  ragScope: Ref<string>;
  ragFast: Ref<boolean>;
  systemPrompt: Ref<string>;
  selectedModel: Ref<string>;
  webSearchEnabled: Ref<boolean>;
  doWebSearch: (query: string) => Promise<string>;
  finishSend: (idx: number) => void;
  handleSendError: (idx: number, err: Error) => void;
  saveMessages: () => void;
}

export function useKnowledgeChatStreaming(deps: StreamingDeps) {
  const {
    messages, streamingText, abortRef, scrollTick, sending, input, draftImages,
    ragEnabled, ragAvailable, ragScope, ragFast, systemPrompt, selectedModel,
    webSearchEnabled, doWebSearch, finishSend, handleSendError, saveMessages
  } = deps;

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

    let searchContext = "";
    if (webSearchEnabled.value && text) {
      searchContext = await doWebSearch(text);
      if (searchContext) {
        messages.value[messages.value.length - 1] = { ...userMsg, searchContext };
      }
    }

    const petMsg: LocalMessage = { type: "pet", message: "", timestamp: Date.now() };
    messages.value.push(petMsg);
    const petIdx = messages.value.length - 1;
    scrollTick.value++;

    const system = searchContext ? `${systemPrompt.value}\n\n[Web search results]:\n${searchContext}` : systemPrompt.value;

    if (ragEnabled.value && ragAvailable.value) {
      const ragPayload = {
        messages: messages.value.slice(0, -1).map(m => ({
          role: m.type === "user" ? ("user" as const) : ("assistant" as const),
          content: m.message
        })),
        stream: true as const,
        scope: ragScope.value || undefined,
        fast: ragFast.value || undefined
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

  return { send, stopSending };
}