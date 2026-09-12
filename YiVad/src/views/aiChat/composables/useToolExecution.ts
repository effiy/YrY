import type { Ref } from "vue";
import { extractUrls } from "@/api/modules/searchService";
import type { ChatMessage } from "@/api/interface/yiAi";
import type { AiChatStreamingType } from "@/views/aiChat/types";

interface ToolExecutionDeps {
  webSearchEnabled: Ref<boolean>;
  webSearchResults: Ref<any[]>;
  webSearching: Ref<boolean>;
  streamingPhase: Ref<string>;
  executeTool: (name: string, args: any, signal?: AbortSignal) => Promise<any>;
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  activeConversation: Ref<any>;
  persistActive: () => Promise<boolean>;
  runStream: (upToIdx: number, petTimestamp: number, type: AiChatStreamingType, searchContext?: string) => Promise<void>;
}

export function useToolExecution(deps: ToolExecutionDeps) {
  const { webSearchEnabled, webSearchResults, webSearching, streamingPhase,
    executeTool, setActiveMessages, activeConversation, persistActive, runStream } = deps;

  /**
   * Execute pre-stream tools (web_fetch for URLs in user message).
   * Returns the search context string to inject into the initial stream.
   */
  async function executePreStreamTools(
    userQuery: string,
    toolSignal: AbortSignal,
    userTimestamp: number
  ): Promise<string> {
    if (!webSearchEnabled.value || !userQuery) return "";

    const urls = extractUrls(userQuery);
    if (!urls.length) return "";

    streamingPhase.value = "fetching";
    webSearching.value = true;
    let context = "";

    for (const url of urls) {
      const result = await executeTool("web_fetch", { url }, toolSignal);
      if (result?.content) {
        context = context ? `${context}\n\n${result.content}` : result.content;
      }
    }
    webSearching.value = false;

    if (context) {
      setActiveMessages(msgs => {
        const idx = msgs.findIndex(m => m.timestamp === userTimestamp);
        if (idx < 0) return msgs;
        const next = [...msgs];
        next[idx] = { ...next[idx], searchContext: context };
        return next;
      });
    }
    return context;
  }

  /**
   * Launch background web search (fire-and-forget).
   * Injects a follow-up message when search results arrive.
   */
  function launchBackgroundSearch(
    userQuery: string,
    toolSignal: AbortSignal,
    streamPromise: Promise<void>
  ): void {
    if (!webSearchEnabled.value) {
      webSearchResults.value = [];
      return;
    }

    let pendingContext = "";
    Promise.resolve(
      executeTool("web_search", { query: userQuery, maxResults: 6 }, toolSignal)
        .then(async (result) => {
          webSearching.value = false;
          if (result?.content) {
            const resultUrls = extractUrls(result.content);
            if (resultUrls.length) {
              const extras = await Promise.all(
                resultUrls.slice(0, 3).map(u =>
                  executeTool("web_fetch", { url: u }, toolSignal).then(r => r?.content ?? "")
                )
              );
              pendingContext = [...extras.filter(Boolean), result.content].join("\n\n");
            } else {
              pendingContext = result.content;
            }
          }
        })
        .catch(() => {
          webSearching.value = false;
          webSearchResults.value = [];
        })
    ).finally(async () => {
      await streamPromise;
      if (!pendingContext) return;
      await persistActive();
      const s = activeConversation.value;
      if (!s) return;
      const followUpPet: ChatMessage = { type: "pet", message: "", timestamp: Date.now() + 1 };
      const prev = (s.messages ?? []).length;
      setActiveMessages(m => [...m, followUpPet]);
      await runStream(prev, followUpPet.timestamp, "send", pendingContext);
    });
  }

  /** KB intent detection regex — matches knowledge:save patterns. */
  const KB_INTENT_RE = /(?:save|store|keep|persist|remember|write|add|create|put)\s+(?:this|the|that|my|our)\s+(?:to|in|into|for)\s+(?:the\s+)?(?:knowledge\s*(?:base|library)?)/i;

  function detectKBIntent(text: string): { path: string } | null {
    if (!text) return null;
    const match = KB_INTENT_RE.exec(text);
    if (!match) return null;
    return { path: "" };
  }

  function autoWrapKnowledgeBlock(petText: string, kbPath: string): string {
    const path = kbPath || "knowledge/chat-save.md";
    return petText + `\n\n\`\`\`knowledge:save path="${path}"\n\`\`\``;
  }

  function detectAndWrapKBIntent(userQuery: string, petTimestamp: number): boolean {
    const kbIntent = detectKBIntent(userQuery);
    if (!kbIntent) return false;

    const s = activeConversation.value;
    if (!s?.messages) return false;

    const petIdx = (s.messages as ChatMessage[]).findIndex((m: ChatMessage) => m.timestamp === petTimestamp);
    if (petIdx < 0) return false;

    const petMsg = s.messages[petIdx];
    const petText = petMsg.message ?? "";
    if (petText && !/```knowledge:save/.test(petText)) {
      const wrapped = autoWrapKnowledgeBlock(petText, kbIntent.path);
      setActiveMessages(msgs => {
        const next = [...msgs];
        next[petIdx] = { ...next[petIdx], message: wrapped };
        return next;
      });
      return true;
    }
    return false;
  }

  return { executePreStreamTools, launchBackgroundSearch, detectKBIntent, autoWrapKnowledgeBlock, detectAndWrapKBIntent };
}