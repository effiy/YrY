/**
 * Chat API service — JSON-RPC style fetch to YiAi backend from MAIN world.
 *
 * API pattern (matching Pet project):
 *   POST {baseUrl}/
 *   {
 *     "module_name": "services.ai.chat_service" | "services.database.data_service",
 *     "method_name": "chat" | "create_document" | "query_documents" | ...,
 *     "parameters": { ... }
 *   }
 *
 * YiAi wraps all responses in a standard envelope:
 *   { "code": 0, "message": "success", "data": <actual_payload> }
 *
 * SSE streaming format from YiAi:
 *   data: {"data": {"message": "token_text"}}
 *   data: {"done": true}
 */

const DEFAULT_BASE = 'http://localhost:10086';

export interface ChatApiConfig {
  baseUrl?: string;
  timeout?: number;
}

export interface SessionRecord {
  key: string;
  url: string;
  title: string;
  pageDescription?: string;
  pageContent?: string;
  messages?: ChatMessage[];
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  lastAccessTime?: number;
}

export interface ChatMessage {
  type: 'user' | 'pet';
  content: string;
  /** Backward-compat: some stored messages use "message" instead of "content". */
  message?: string;
  timestamp: number;
  imageDataUrl?: string;
  error?: boolean;
  aborted?: boolean;
}

/** YiAi standard response envelope. */
interface YiAiEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export function createChatApi(config?: ChatApiConfig) {
  const baseUrl = (config?.baseUrl || DEFAULT_BASE).replace(/\/+$/, '');
  const API_URL = `${baseUrl}/`;
  const timeout = config?.timeout ?? 30000;

  /** Unwrap YiAi's standard response envelope, returning just the data payload. */
  function unwrap<T>(envelope: YiAiEnvelope<T>): T {
    if (envelope && typeof envelope === 'object' && 'code' in envelope && 'data' in envelope) {
      return (envelope as YiAiEnvelope<T>).data;
    }
    return envelope as unknown as T;
  }

  /** Generic JSON-RPC request. Returns unwrapped data payload. */
  async function rpc<T>(
    moduleName: string,
    methodName: string,
    parameters: Record<string, unknown> = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_name: moduleName, method_name: methodName, parameters }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
      }
      const envelope = (await res.json()) as YiAiEnvelope<T>;
      return unwrap(envelope);
    } finally {
      clearTimeout(timer);
    }
  }

  // ── AI Chat ──────────────────────────────────────────────────────

  /**
   * SSE streaming prompt.
   * YiAi SSE format: data: {"data": {"message": "token"}}
   *                    data: {"done": true}
   */
  async function streamPrompt(
    prompt: string,
    sessionId: string,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const body = JSON.stringify({
      module_name: 'services.ai.chat_service',
      method_name: 'chat',
      parameters: {
        user: prompt,
        stream: true,
        conversation_id: sessionId,
      },
    });

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Stream ${res.status}: ${text || res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              // Check for done marker
              if (parsed.done) break;
              // YiAi format: {"data": {"message": "token"}}
              const token =
                parsed.data?.message ||
                parsed.data?.content ||
                parsed.token ||
                parsed.content ||
                '';
              if (token) {
                fullText += token;
                onToken(token);
              }
            } catch {
              // Non-JSON SSE data — treat as plain text token
              if (data && data !== '[DONE]') {
                fullText += data;
                onToken(data);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  }

  /** Non-streaming prompt. */
  async function prompt(promptText: string, sessionId: string): Promise<string> {
    const res = await rpc<{ success?: boolean; response?: string; content?: string; message?: string }>(
      'services.ai.chat_service',
      'chat',
      { user: promptText, stream: false, conversation_id: sessionId },
    );
    return res.message || res.response || res.content || '';
  }

  // ── Sessions (database service) ──────────────────────────────────

  const DB_MODULE = 'services.database.data_service';
  const COLLECTION = 'sessions';

  /** YiAi query_documents returns { list: [...], total, pageNum, pageSize, totalPages } */
  interface QueryResult<T> {
    list?: T[];
    documents?: T[];
    result?: T[];
    total?: number;
  }

  async function listSessions(): Promise<SessionRecord[]> {
    try {
      const data = await rpc<SessionRecord[] | QueryResult<SessionRecord>>(
        DB_MODULE,
        'query_documents',
        { cname: COLLECTION, query: {} },
      );
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') {
        const qr = data as QueryResult<SessionRecord>;
        if (Array.isArray(qr.list)) return qr.list;
        if (Array.isArray(qr.documents)) return qr.documents;
        if (Array.isArray(qr.result)) return qr.result;
      }
      return [];
    } catch {
      return [];
    }
  }

  async function createSession(doc: Record<string, unknown>): Promise<SessionRecord | null> {
    try {
      // YiAi returns { key: "uuid" } from create_document
      const result = await rpc<{ key?: string }>(DB_MODULE, 'create_document', {
        cname: COLLECTION,
        data: doc,
      });
      if (result?.key) {
        return { key: result.key, ...doc } as SessionRecord;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function updateSession(
    id: string,
    update: Record<string, unknown>,
  ): Promise<SessionRecord | null> {
    try {
      // YiAi returns { query: {...}, updated: true } from update_document
      await rpc<{ query?: unknown; updated?: boolean }>(DB_MODULE, 'update_document', {
        cname: COLLECTION,
        key: id,
        data: { key: id, ...update, updatedAt: Date.now() },
      });
      return { key: id, ...update } as SessionRecord;
    } catch {
      return null;
    }
  }

  async function getSession(id: string): Promise<SessionRecord | null> {
    try {
      // YiAi query_documents returns { list: [...] }
      const result = await rpc<QueryResult<SessionRecord>>(
        DB_MODULE,
        'query_documents',
        { cname: COLLECTION, query: { key: id } },
      );
      const docs: SessionRecord[] | undefined =
        result?.list || result?.documents || result?.result;
      if (Array.isArray(docs) && docs.length > 0) return docs[0];
      return null;
    } catch {
      return null;
    }
  }

  async function deleteSession(id: string): Promise<boolean> {
    try {
      // YiAi returns { key: "...", deleted: true }
      const result = await rpc<{ key?: string; deleted?: boolean }>(
        DB_MODULE,
        'delete_document',
        { cname: COLLECTION, key: id },
      );
      return result?.deleted === true;
    } catch {
      return false;
    }
  }

  return {
    baseUrl,
    streamPrompt,
    prompt,
    listSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
  };
}

export type ChatApi = ReturnType<typeof createChatApi>;
