/**
 * API endpoint path constants — organised by domain.
 *
 * Layer 2: consumed by service modules to build request paths.
 * All paths exclude the base URL (handled by the client layer).
 */

export const BASE = {
  API: '/api',
  V1: '/api/v1',
  V2: '/api/v2',
} as const;

// ── Auth ──────────────────────────────────────────────────────────────

export const AUTH = {
  LOGIN:    '/auth/login',
  LOGOUT:   '/auth/logout',
  REFRESH:  '/auth/refresh',
  PROFILE:  '/auth/profile',
  VALIDATE: '/auth/validate',
} as const;

// ── Sessions ──────────────────────────────────────────────────────────

export const SESSIONS = {
  LIST:         '/sessions',
  CREATE:       '/sessions',
  GET:          (id: string) => `/sessions/${encodeURIComponent(id)}`,
  UPDATE:       (id: string) => `/sessions/${encodeURIComponent(id)}`,
  DELETE:       (id: string) => `/sessions/${encodeURIComponent(id)}`,
  BATCH_DELETE: '/sessions/batch',
  SEARCH:       '/sessions/search',
  FAVORITES:    '/sessions/favorites',
  EXPORT:       '/sessions/export',
  IMPORT:       '/sessions/import',
} as const;

// ── Chat / Prompt ─────────────────────────────────────────────────────

export const CHAT = {
  STREAM:  '/prompt',
  PROMPT:  '/prompt/',
} as const;

// ── FAQ ───────────────────────────────────────────────────────────────

export const FAQ = {
  LIST:         '/faqs',
  CREATE:       '/faqs',
  GET:          (id: string) => `/faqs/${encodeURIComponent(id)}`,
  UPDATE:       (id: string) => `/faqs/${encodeURIComponent(id)}`,
  DELETE:       (id: string) => `/faqs/${encodeURIComponent(id)}`,
  BATCH_UPDATE: '/faqs/batch',
  REORDER:      '/faqs/reorder',
} as const;

// ── Config ────────────────────────────────────────────────────────────

export const CONFIG = {
  GET:    '/config',
  UPDATE: '/config',
  RESET:  '/config/reset',
} as const;

// ── Database ──────────────────────────────────────────────────────────

export const DATABASE = {
  QUERY:  '/database/query',
  CREATE: '/database/create',
  UPDATE: '/database/update',
  DELETE: '/database/delete',
  BATCH:  '/database/batch',
} as const;
