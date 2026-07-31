/**
 * YiPetApi — CDN HTTP client (built as IIFE, attaches window.YiPetApi).
 *
 * Provides the same fetch-based API client used internally by the extension,
 * available as a global for MAIN-world scripts and DevTools console usage.
 *
 * Importable as ES module:  import { createApiClient } from '../cdn/api-client';
 * CDN global:              const client = YiPetApi.createClient({ baseUrl: '...' });
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: { maxRetries: number; baseMs: number };
  /** Optional logger — when provided, non-ok responses and retries are logged. */
  logger?: {
    warn?(...args: unknown[]): void;
    debug?(...args: unknown[]): void;
  };
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

export interface ApiClient {
  get<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  post<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  put<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  delete<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  url(path: string): string;
}

// ── Factory ────────────────────────────────────────────────────────────

export function createApiClient(config: ApiClientConfig): ApiClient {
  const { baseUrl, timeout = 30000, headers = {}, retry, logger } = config;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

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
    attempt = 0,
  ): Promise<ApiResponse<T>> {
    const url = resolveUrl(path);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const onAbort = () => controller.abort();
    if (signal) signal.addEventListener('abort', onAbort);

    try {
      const init: RequestInit = { method, headers: defaultHeaders, signal: controller.signal };
      if (body !== undefined && method !== 'GET') {
        init.body = JSON.stringify(body);
      }

      const response = await fetch(url, init);
      clearTimeout(timeoutId);

      let data: T;
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
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
        logger?.warn?.(`API ${method} ${path} → ${response.status}`, result.error);
      }

      return result;
    } catch (err) {
      clearTimeout(timeoutId);

      if ((err as Error).name === 'AbortError') {
        return { ok: false, status: 0, data: null as T, error: 'Request timed out or was aborted' };
      }

      // Retry on network errors
      if (retry && attempt < retry.maxRetries) {
        logger?.debug?.(`API retry ${attempt + 1}/${retry.maxRetries} for ${method} ${path}`);
        await new Promise((r) => setTimeout(r, retry.baseMs * (attempt + 1)));
        return request<T>(method, path, body, signal, attempt + 1);
      }

      return {
        ok: false,
        status: 0,
        data: null as T,
        error: (err as Error).message || 'Network error',
      };
    } finally {
      if (signal) signal.removeEventListener('abort', onAbort);
    }
  }

  return {
    get: <T>(path: string, signal?: AbortSignal)    => request<T>('GET', path, undefined, signal),
    post: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>('POST', path, body, signal),
    put: <T>(path: string, body?: unknown, signal?: AbortSignal)  => request<T>('PUT', path, body, signal),
    delete: <T>(path: string, signal?: AbortSignal) => request<T>('DELETE', path, undefined, signal),
    url: resolveUrl,
  };
}

/* ── Global attachment (for CDN/IIFE build) ────────────────────────── */

const YiPetApi = { createClient: createApiClient };
export default YiPetApi;
