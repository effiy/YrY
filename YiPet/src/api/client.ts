/**
 * HTTP API Client — extension wrapper around the CDN base client.
 *
 * Layer 1 of the API stack: consumed by all domain services.
 * Configured via createApiClient(baseUrl, options).
 *
 * Builds on public/cdn/utils/api-client.ts and adds:
 *   - Logger integration (wired to the shared dev-gated logger)
 *   - SSE streaming support (StreamChunk / AsyncGenerator)
 */

import { logger } from '@/utils/log';
import {
  type ApiClientConfig,
  type ApiResponse,
  createApiClient as createBaseClient,
} from '../../public/cdn/utils/api-client';

// ── Re-export base types ───────────────────────────────────────────────

export type { ApiClientConfig, ApiResponse };

// ── Streaming types (extension-only feature) ───────────────────────────

export interface StreamChunk<T = unknown> {
  done: boolean;
  data?: T;
  error?: string;
}

// ── Extended client interface ──────────────────────────────────────────

export interface ApiClient {
  get<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  post<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  put<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  delete<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  stream(path: string, body?: unknown, signal?: AbortSignal): AsyncGenerator<StreamChunk>;
  url(path: string): string;
}

// ── Factory ────────────────────────────────────────────────────────────

export function createApiClient(config: ApiClientConfig): ApiClient {
  // Inject the extension's dev-gated logger into the base client
  const base = createBaseClient({ ...config, logger });

  const { baseUrl, headers = {} } = config;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, application/json',
    ...headers,
  };

  function resolveUrl(path: string): string {
    const b = baseUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : '/' + path;
    return b + p;
  }

  // ── SSE Streaming ────────────────────────────────────────────────────

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
        headers: { ...defaultHeaders, Accept: 'text/event-stream' },
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
    ...base,
    stream,
    url: resolveUrl,
  };
}
