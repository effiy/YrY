import { ref, computed, type Ref } from "vue";
import { compactConversation } from "@/api/modules/searchService";
import type { ChatMessage } from "@/api/interface/yiAi";

interface CompactionEntry {
  sessionKey: string;
  timestamp: number;
  before: number;
  after: number;
  saved: number;
}

const COMPACTION_THRESHOLD_TOKENS = 6000;
const MAX_COMPACTION_LOG = 5;

interface CompactDeps {
  activeConversation: Ref<any>;
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  persistActive: () => Promise<boolean>;
}

export function useConversationCompact(deps: CompactDeps) {
  const { activeConversation, setActiveMessages, persistActive } = deps;

  const compactionLog = ref<CompactionEntry[]>([]);
  const lastCompaction = computed<CompactionEntry | null>(() => {
    if (!compactionLog.value.length) return null;
    return compactionLog.value[compactionLog.value.length - 1];
  });

  async function maybeCompact() {
    const s = activeConversation.value;
    if (!s?.messages?.length) return;

    const totalChars = s.messages.reduce(
      (sum: number, m: ChatMessage) => sum + (m.message?.length ?? 0), 0
    );
    const estimatedTokens = Math.ceil(totalChars / 4);
    if (estimatedTokens < COMPACTION_THRESHOLD_TOKENS) return;

    try {
      const msgs = s.messages.map((m: ChatMessage) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.message ?? "",
      }));
      const result = await compactConversation(msgs, 4);

      if (result.error) return;

      const compacted: ChatMessage[] = result.messages.map((m: any) => ({
        type: m.role === "user" ? "user" : "pet",
        message: m.content,
        timestamp: Date.now(),
      }));

      setActiveMessages(() => compacted);
      await persistActive();

      const entry: CompactionEntry = {
        sessionKey: s.key,
        timestamp: Date.now(),
        before: result.original_count,
        after: result.compacted_count,
        saved: Math.max(0, result.original_count - result.compacted_count),
      };
      compactionLog.value = [...compactionLog.value.slice(-(MAX_COMPACTION_LOG - 1)), entry];
    } catch {
      // Silently fail — compaction is best-effort
    }
  }

  return { compactionLog, lastCompaction, maybeCompact };
}