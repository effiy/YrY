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
  timestamp: number;
  imageDataUrl?: string;
  error?: boolean;
  aborted?: boolean;
}

export function createChatApi(config?: ChatApiConfig) {
  const baseUrl = (config?.baseUrl || DEFAULT_BASE).replace(/\/+$/, '');
  const API_URL = `${baseUrl}/`;
  const timeout = config?.timeout ?? 30000;

  /** Generic JSON-RPC request. */
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
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  // ── AI Chat ──────────────────────────────────────────────────────

  /** SSE streaming prompt. */
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
              const token = parsed.token || parsed.content || '';
              if (token) {
                fullText += token;
                onToken(token);
              }
            } catch {
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
    const res = await rpc<{ response?: string; content?: string }>(
      'services.ai.chat_service',
      'chat',
      { user: promptText, stream: false, conversation_id: sessionId },
    );
    return res.response || res.content || '';
  }

  // ── Sessions (database service) ──────────────────────────────────

  const DB_MODULE = 'services.database.data_service';
  const COLLECTION = 'sessions';

  async function listSessions(): Promise<SessionRecord[]> {
    try {
      const data = await rpc<
        SessionRecord[] | { documents?: SessionRecord[]; result?: SessionRecord[] }
      >(DB_MODULE, 'query_documents', { cname: COLLECTION, query: {} });
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as { documents?: SessionRecord[] }).documents))
        return (data as { documents: SessionRecord[] }).documents;
      if (Array.isArray((data as { result?: SessionRecord[] }).result))
        return (data as { result: SessionRecord[] }).result;
      return [];
    } catch {
      return [];
    }
  }

  async function createSession(doc: Record<string, unknown>): Promise<SessionRecord | null> {
    try {
      return await rpc<SessionRecord>(DB_MODULE, 'create_document', {
        cname: COLLECTION,
        data: doc,
      });
    } catch {
      return null;
    }
  }

  async function updateSession(
    id: string,
    update: Record<string, unknown>,
  ): Promise<SessionRecord | null> {
    try {
      return await rpc<SessionRecord>(DB_MODULE, 'update_document', {
        cname: COLLECTION,
        key: id,
        data: { key: id, ...update, updatedAt: Date.now() },
      });
    } catch {
      return null;
    }
  }

  async function getSession(id: string): Promise<SessionRecord | null> {
    try {
      const result = await rpc<{ documents?: SessionRecord[]; result?: SessionRecord[] }>(
        DB_MODULE,
        'query_documents',
        { cname: COLLECTION, query: { key: id } },
      );
      const docs = Array.isArray(result)
        ? result
        : result.documents || result.result || [];
      return docs.length > 0 ? docs[0] : null;
    } catch {
      return null;
    }
  }

  async function deleteSession(id: string): Promise<boolean> {
    try {
      await rpc<unknown>(DB_MODULE, 'delete_document', { cname: COLLECTION, key: id });
      return true;
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
