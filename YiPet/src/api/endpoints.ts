/**
 * API endpoint path constants — organised by domain, matching YiAi's actual routes.
 *
 * Layer 2: consumed by service modules to build request paths.
 * All paths exclude the base URL (handled by the client layer).
 */

// ── Execution module (JSON-RPC) ────────────────────────────────────────

/** YiAi's generic module execution engine. POST {module_name, method_name, parameters}. */
export const EXECUTION = {
  ROOT: '/',
} as const;

// ── Auth ──────────────────────────────────────────────────────────────

export const AUTH = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
} as const;

// ── Files ─────────────────────────────────────────────────────────────

export const FILES = {
  READ: '/read-file',
  WRITE: '/write-file',
  DELETE: '/delete-file',
  DELETE_FOLDER: '/delete-folder',
  RENAME: '/rename-file',
  RENAME_FOLDER: '/rename-folder',
  UPLOAD_IMAGE: '/upload-image-to-oss',
} as const;

// ── State Store ───────────────────────────────────────────────────────

export const STATE = {
  RECORDS: '/state/records',
  RECORD: (key: string) => `/state/records/${encodeURIComponent(key)}`,
} as const;

// ── WeCom Bot Webhook ───────────────────────────────────────────

export const WEWORK = {
  SEND_MESSAGE: '/wework/send-message',
} as const;
