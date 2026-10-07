import { ref, type Ref } from 'vue';
import type { CompactionEntry, Message, SessionItem } from '../types';

const COMPACTION_THRESHOLD_TOKENS = 6000;
const CHARS_PER_TOKEN = 4;
const MAX_COMPACTION_LOG = 5;

export interface ConversationCompactDeps {
  activeConversation: Ref<SessionItem | null>;
  setActiveMessages: (msgs: Message[]) => void;
  persistActive: () => Promise<void> | void;
  /** RPC call function — routes through the API client for auth + base URL. */
  rpcCall?: <T>(module: string, method: string, params?: Record<string, unknown>) => Promise<{ ok: boolean; data: T; error?: string }>;
}

function estimateTokens(messages: Message[]): number {
  let totalChars = 0;
  for (const m of messages) {
    totalChars += (m.content || '').length;
  }
  const overhead = messages.length * 4;
  return overhead + Math.floor(totalChars / CHARS_PER_TOKEN);
}

async function callCompactApi(
  messages: Message[],
  rpcCall?: ConversationCompactDeps['rpcCall'],
  signal?: AbortSignal,
): Promise<Message[] | null> {
  try {
    const params = {
      messages: messages.map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content || '',
        timestamp: m.timestamp,
      })),
    };

    let result: Record<string, unknown> | null = null;

    if (rpcCall) {
      const res = await rpcCall<{ messages?: Array<{ role: string; content: string }> }>(
        'services.ai.chat_service',
        'compactConversation',
        params,
      );
      if (res.ok && res.data) {
        result = res.data as Record<string, unknown>;
      }
    }
    if (!result) return null;
    const compacted = Array.isArray(result?.messages) ? result.messages : Array.isArray(result) ? result : null;
    if (!compacted) return null;
    return compacted.map((m: Record<string, unknown>, idx: number) => ({
      type: (m.role === 'user' ? 'user' : 'pet') as 'user' | 'pet',
      content: typeof m.content === 'string' ? m.content : '',
      timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now() - (compacted.length - idx) * 1000,
    }));
  } catch {
    return null;
  }
}

export function useConversationCompact(deps: ConversationCompactDeps) {
  const compactionLog = ref<CompactionEntry[]>([]);
  const isCompacting = ref(false);

  function appendLog(entry: CompactionEntry) {
    compactionLog.value = [...compactionLog.value, entry].slice(-MAX_COMPACTION_LOG);
  }

  async function maybeCompact(currentMessages: Message[]): Promise<Message[]> {
    if (isCompacting.value) return currentMessages;
    if (!deps.activeConversation.value) return currentMessages;
    const estimated = estimateTokens(currentMessages);
    if (estimated < COMPACTION_THRESHOLD_TOKENS) return currentMessages;

    isCompacting.value = true;
    const before = estimated;
    const beforeCount = currentMessages.length;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      const compacted = await callCompactApi(currentMessages, deps.rpcCall, controller.signal);
      clearTimeout(timer);

      if (Array.isArray(compacted) && compacted.length > 0 && compacted.length < beforeCount) {
        const after = estimateTokens(compacted);
        if (after < before) {
          appendLog({
            sessionKey: deps.activeConversation.value.id,
            timestamp: Date.now(),
            before,
            after,
            saved: before - after,
          });
          deps.setActiveMessages(compacted);
          await deps.persistActive();
          return compacted;
        }
      }
    } catch { /* ignore */
    } finally {
      isCompacting.value = false;
    }

    return currentMessages;
  }

  return {
    compactionLog,
    isCompacting,
    maybeCompact,
    estimateTokens,
  };
}
