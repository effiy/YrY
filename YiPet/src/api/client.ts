/**
 * HTTP API Client — extension wrapper around the CDN base client.
 *
 * Layer 1 of the API stack: consumed by all domain services.
 * Configured via createApiClient(baseUrl, options).
 *
 * Builds on public/cdn/utils/api-client.ts and adds:
 *   - Logger integration (wired to the shared dev-gated logger)
 *   - SSE streaming support (StreamChunk / AsyncGenerator)
 *   - YiAi JSON-RPC support (rpc method for execution module)
 *   - YiAi response envelope unwrapping ({code, message, data} → ApiResponse)
 */

import { logger } from '@/utils/log';
import {
  type ApiClientConfig,
  type ApiResponse,
  createApiClient as createBaseClient,
} from '../../public/cdn/utils/api-client';

// ── Re-export base types ───────────────────────────────────────────────

export type { ApiClientConfig, ApiResponse };

// ── YiAi types ─────────────────────────────────────────────────────────

/** YiAi standard response envelope. */
export interface YiAiEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

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
  /** JSON-RPC call via YiAi execution module. Unwraps {code, message, data} envelope. */
  rpc<T = unknown>(
    moduleName: string,
    methodName: string,
    parameters?: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<ApiResponse<T>>;
  stream(path: string, body?: unknown, signal?: AbortSignal): AsyncGenerator<StreamChunk>;
  url(path: string): string;
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Convert YiAi's {code, message, data} envelope to ApiResponse. */
function unwrapEnvelope<T>(json: unknown, httpStatus: number): ApiResponse<T> {
  if (json && typeof json === 'object' && 'code' in json) {
    const envelope = json as YiAiEnvelope<T>;
    return {
      ok: envelope.code === 0,
      status: httpStatus,
      data: envelope.data as T,
      error: envelope.code !== 0 ? envelope.message : undefined,
    };
  }
  // Not a YiAi envelope — pass through as-is
  return {
    ok: httpStatus >= 200 && httpStatus < 300,
    status: httpStatus,
    data: json as T,
  };
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

  // ── JSON-RPC (YiAi execution module) ──────────────────────────────────

  async function rpc<T>(
    moduleName: string,
    methodName: string,
    parameters: Record<string, unknown> = {},
    signal?: AbortSignal,
  ): Promise<ApiResponse<T>> {
    const url = resolveUrl('/');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? 30000);
    if (signal) signal.addEventListener('abort', () => controller.abort());

    try {
      const init: RequestInit = {
        method: 'POST',
        headers: { ...defaultHeaders, Accept: 'application/json' },
        body: JSON.stringify({ module_name: moduleName, method_name: methodName, parameters }),
        signal: controller.signal,
      };

      const response = await fetch(url, init);
      clearTimeout(timeoutId);

      const ct = response.headers.get('content-type') || '';
      let json: unknown;
      if (ct.includes('application/json')) {
        json = await response.json();
      } else {
        const text = await response.text();
        return { ok: false, status: response.status, data: null as T, error: text || `HTTP ${response.status}` };
      }

      const result = unwrapEnvelope<T>(json, response.status);
      if (!result.ok) {
        logger?.warn?.(`RPC ${moduleName}:${methodName} → ${result.error}`);
      }
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === 'AbortError') {
        return { ok: false, status: 0, data: null as T, error: 'Request timed out or was aborted' };
      }
      return { ok: false, status: 0, data: null as T, error: (err as Error).message || 'Network error' };
    }
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
              const parsed = JSON.parse(jsonStr);
              // YiAi SSE format: {"done": true} or {"data": {"message": "token"}}
              if (parsed.done) {
                yield { done: true };
                return;
              }
              // Unwrap YiAi's nested data envelope for streaming
              yield { done: false, data: parsed.data ?? parsed };
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
    rpc,
    stream,
    url: resolveUrl,
  };
}
