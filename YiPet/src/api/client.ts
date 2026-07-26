/**
 * HTTP API Client — base fetch wrapper with error handling, retry, and streaming.
 *
 * Layer 1 of the API stack: consumed by all domain services.
 * Configured via createApiClient(baseUrl, options).
 */

import { logger } from '../shared/log';

// ── Types ──────────────────────────────────────────────────────────────

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: { maxRetries: number; baseMs: number };
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

export interface StreamChunk<T = unknown> {
  done: boolean;
  data?: T;
  error?: string;
}

// ── Client Factory ─────────────────────────────────────────────────────

export interface ApiClient {
  get<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  post<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  put<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  delete<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  stream(path: string, body?: unknown, signal?: AbortSignal): AsyncGenerator<StreamChunk>;
  /** Build a full URL from a path (for external use, e.g. constructing iframe src). */
  url(path: string): string;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const { baseUrl, timeout = 30000, headers = {}, retry } = config;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  // ── Internal helpers ────────────────────────────────────────────────

  function resolveUrl(path: string): string {
    const base = baseUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : '/' + path;
    return base + p;
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<ApiResponse<T>> {
    const url = resolveUrl(path);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge external signal
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    const tryRequest = async (attempt: number): Promise<ApiResponse<T>> => {
      try {
        const init: RequestInit = {
          method,
          headers: defaultHeaders,
          signal: controller.signal,
        };
        if (body !== undefined && method !== 'GET') {
          init.body = JSON.stringify(body);
        }

        const response = await fetch(url, init);
        clearTimeout(timeoutId);

        // Parse response
        let data: T;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json() as T;
        } else {
          data = (await response.text()) as unknown as T;
        }

        const result: ApiResponse<T> = {
          ok: response.ok,
          status: response.status,
          data,
        };

        if (!response.ok) {
          result.error = typeof data === 'object' && data !== null
            ? (data as Record<string, unknown>).detail as string || `HTTP ${response.status}`
            : `HTTP ${response.status}`;
          logger.warn(`API ${method} ${path} → ${response.status}`, result.error);
        }

        return result;
      } catch (err) {
        clearTimeout(timeoutId);

        if ((err as Error).name === 'AbortError') {
          return { ok: false, status: 0, data: null as T, error: 'Request timed out or was aborted' };
        }

        // Retry on network errors
        if (retry && attempt < retry.maxRetries) {
          logger.debug(`API retry ${attempt + 1}/${retry.maxRetries} for ${method} ${path}`);
          await new Promise(r => setTimeout(r, retry.baseMs * (attempt + 1)));
          return tryRequest(attempt + 1);
        }

        return {
          ok: false,
          status: 0,
          data: null as T,
          error: (err as Error).message || 'Network error',
        };
      }
    };

    return tryRequest(0);
  }

  // ── Streaming ───────────────────────────────────────────────────────

  async function* stream(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    const url = resolveUrl(path);
    const controller = new AbortController();
    if (signal) signal.addEventListener('abort', () => controller.abort());

    try {
      const init: RequestInit = {
        method: 'POST',
        headers: { ...defaultHeaders, 'Accept': 'text/event-stream' },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      };

      const response = await fetch(url, init);
      if (!response.ok || !response.body) {
        yield { done: true, error: `HTTP ${response.status}` };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue; // comment / heartbeat

          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') {
              yield { done: true };
              return;
            }
            try {
              yield { done: false, data: JSON.parse(jsonStr) };
            } catch {
              yield { done: false, data: jsonStr };
            }
          } else if (trimmed.startsWith('event: error')) {
            yield { done: true, error: 'Stream error' };
            return;
          }
        }
      }
      yield { done: true };
    } catch (err) {
      yield { done: true, error: (err as Error).message || 'Stream error' };
    }
  }

  return {
    get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
    post: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>('POST', path, body, signal),
    put: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>('PUT', path, body, signal),
    delete: <T>(path: string, signal?: AbortSignal) => request<T>('DELETE', path, undefined, signal),
    stream,
    url: resolveUrl,
  };
}
