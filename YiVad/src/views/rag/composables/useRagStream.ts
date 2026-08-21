import { ref, nextTick, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { streamRagChat } from "@/api/modules/ragService";
import type { RagChatPayload } from "@/api/interface/rag";
import type { RagSource } from "@/api/interface/rag";

export interface RagStreamMessage {
  role: "user" | "assistant";
  content: string;
  sources?: RagSource[];
  streaming?: boolean;
  ragMeta?: Record<string, unknown>;
  firstTokenLatencyMs?: number;
  error?: boolean;
}

export interface RagStreamState {
  messages: Ref<RagStreamMessage[]>;
  sending: Ref<boolean>;
  streamingPhase: Ref<"idle" | "thinking" | "retrieving" | "streaming">;
  streamElapsed: Ref<number>;
  abortFn: Ref<(() => void) | null>;
  userScrolledUp: Ref<boolean>;
  scrollToBottom: (force?: boolean) => void;
  currentRagMeta: () => Record<string, unknown>;
  buildStreamPayload: () => RagChatPayload;
}

export function useRagStream(state: RagStreamState) {
  const { messages, sending, streamingPhase, streamElapsed, abortFn, userScrolledUp, scrollToBottom, currentRagMeta, buildStreamPayload } = state;

  let streamStartAt = 0;
  let streamElapsedTimer = 0;

  function startStreamTimers() {
    streamStartAt = Date.now();
    streamElapsed.value = 0;
    clearInterval(streamElapsedTimer);
    streamElapsedTimer = window.setInterval(() => {
      streamElapsed.value = Math.round((Date.now() - streamStartAt) / 1000);
    }, 1000);
  }

  function clearStreamTimers() {
    clearInterval(streamElapsedTimer);
  }

  function appendAssistantMessage(): RagStreamMessage {
    const msg: RagStreamMessage = { role: "assistant", content: "", sources: [], streaming: true };
    messages.value.push(msg);
    sending.value = true;
    streamingPhase.value = "thinking";
    startStreamTimers();
    nextTick().then(() => scrollToBottom());
    return msg;
  }

  function getLastAssistant(): RagStreamMessage | undefined {
    const last = messages.value[messages.value.length - 1];
    return last?.role === "assistant" ? last : undefined;
  }

  function onStreamDone() {
    sending.value = false;
    streamingPhase.value = "idle";
    abortFn.value = null;
    clearStreamTimers();
    const last = getLastAssistant();
    if (last) last.streaming = false;
  }

  function onStreamError(err: Error) {
    sending.value = false;
    streamingPhase.value = "idle";
    abortFn.value = null;
    clearStreamTimers();
    const last = getLastAssistant();
    if (last) {
      last.streaming = false;
      last.error = true;
      if (!last.content) last.content = `Error: ${err.message}`;
    }
    ElMessage.error(err.message);
  }

  async function runStream(payload?: RagChatPayload): Promise<void> {
    const p = payload ?? buildStreamPayload();
    appendAssistantMessage();

    let firstTokenAt = 0;

    const { abort } = streamRagChat(p, {
      onPhase: (phase: string) => {
        if (streamingPhase.value === "thinking" && phase === "retrieving") {
          streamingPhase.value = "retrieving";
        }
      },
      onChunk: (text: string) => {
        if (streamingPhase.value === "thinking" || streamingPhase.value === "retrieving") {
          streamingPhase.value = "streaming";
        }
        if (!firstTokenAt) {
          firstTokenAt = Date.now();
          const last = getLastAssistant();
          if (last) last.firstTokenLatencyMs = firstTokenAt - streamStartAt;
        }
        const last = getLastAssistant();
        if (last) last.content += text;
        scrollToBottom();
      },
      onSources: (sources: RagSource[]) => {
        const last = getLastAssistant();
        if (last) {
          last.sources = sources;
          last.ragMeta = currentRagMeta();
        }
      },
      onDone: onStreamDone,
      onError: onStreamError,
    });

    abortFn.value = abort;
  }

  function stopStream() {
    abortFn.value?.();
    abortFn.value = null;
    sending.value = false;
    streamingPhase.value = "idle";
    clearStreamTimers();
    const last = getLastAssistant();
    if (last?.streaming) {
      last.streaming = false;
      if (!last.content) last.content = "_(Stopped)_";
    }
  }

  return { runStream, stopStream, appendAssistantMessage, getLastAssistant, onStreamDone, onStreamError, startStreamTimers, clearStreamTimers };
}