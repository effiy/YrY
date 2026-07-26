/**
 * Global type declarations for CDN-provided utility libraries.
 * React 15.6.1 types are in src/types/react-cdn.d.ts — don't duplicate here.
 */

declare global {
  // CDN utility globals (from public/cdn/utils/url.js and log.js)
  const UrlBuilder: {
    buildUrl(baseUrl: string, endpoint: string, params?: Record<string, unknown>): string;
    buildQueryParams(params: Record<string, unknown>): string;
    buildDatabaseUrl(baseUrl: string, methodName: string, parameters?: Record<string, unknown>): string;
  };

  const LoggerUtils: {
    initMuteLogger(storageKey?: string, fallback?: boolean, opts?: { buffer?: boolean }): Promise<unknown>;
    log(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    debug(...args: unknown[]): void;
  };
}

export {};
