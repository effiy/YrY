/**
 * YiPetApi — CDN HTTP client (built as IIFE, attaches window.YiPetApi).
 *
 * Provides the same fetch-based API client used internally by the extension,
 * available as a global for MAIN-world scripts and DevTools console usage.
 *
 * Importable as ES module:  import { createApiClient } from '../cdn/api-client';
 * CDN global:              const client = YiPetApi.createClient({ baseUrl: '...' });
 */

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

export interface ApiClient {
  get<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  post<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  put<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>>;
  delete<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>>;
  url(path: string): string;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const { baseUrl, timeout = 30000, headers = {}, retry } = config;
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
    if (signal) signal.addEventListener('abort', () => controller.abort());

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

      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === 'AbortError') {
        return { ok: false, status: 0, data: null as T, error: 'Timeout' };
      }
      if (retry && attempt < retry.maxRetries) {
        await new Promise((r) => setTimeout(r, retry.baseMs * (attempt + 1)));
        return request<T>(method, path, body, signal, attempt + 1);
      }
      return { ok: false, status: 0, data: null as T, error: (err as Error).message };
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

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).YiPetApi = YiPetApi;
}
