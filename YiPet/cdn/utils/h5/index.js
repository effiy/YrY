/**
 * YrY · H5 Utilities — utility functions for h5/ vanilla JS components
 *
 * Migration: Originally at YiH5/utils/index.js, now consolidated in CDN.
 * Aggregates shared helpers: date handling, string processing, HTML escaping,
 * URL validation, platform detection, logging, and re-exports from msg.js.
 */

export { escapeHtml, formatDate } from '/cdn/utils/index.js';

/* ── Date Utilities ─────────────────────────────────────────────────────── */
export const dateUtil = {
  formatYMD(d) {
    if (!d) return '—';
    if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },
  parseYMD(ymd) {
    if (!ymd) return null;
    try {
      const parts = String(ymd).split(/[-/]/);
      if (!parts || !Array.isArray(parts) || parts.length !== 3) return null;
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
      const dt = new Date(y, m - 1, d);
      if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
      return dt;
    } catch (_) { return null; }
  },
  addDaysYMD(ymd, delta) {
    const base = this.parseYMD(ymd) || new Date();
    base.setDate(base.getDate() + delta);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, '0');
    const day = String(base.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },
  todayYMD() {
    return this.formatYMD(new Date());
  }
};

/* ── String Utilities ───────────────────────────────────────────────────── */
export const cssEscape = (s) => {
  const str = String(s ?? '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(str);
  return str.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
};

/* ── URL Validation ─────────────────────────────────────────────────────── */
export const isSafeUrl = (href) => {
  const s = String(href || '').trim();
  if (!s) return false;
  if (s.startsWith('http://') || s.startsWith('https://')) return true;
  if (s.startsWith('data:')) return true;
  return false;
};

/* ── Formatting Utilities ────────────────────────────────────────────────── */
export const fmt = {
  time(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },
  compact(n) {
    if (n <= 0) return '';
    if (n < 100) return String(n);
    return '99+';
  }
};

/* ── Date Validation ────────────────────────────────────────────────────── */
export const isValidYMD = (ymd) => {
  if (!ymd) return false;
  return dateUtil.parseYMD(ymd) !== null;
};

/* ── Platform Detection ─────────────────────────────────────────────────── */
export const isIOS = () => /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
export const isInWeChat = () => /MicroMessenger/i.test(navigator.userAgent || '');

/* ── Logger ─────────────────────────────────────────────────────────────── */
const _pad = (n, w = 2) => String(n).padStart(w, '0');
const _formatDateTime = (d) => {
  const y = d.getFullYear();
  const m = _pad(d.getMonth() + 1);
  const day = _pad(d.getDate());
  const hh = _pad(d.getHours());
  const mm = _pad(d.getMinutes());
  const ss = _pad(d.getSeconds());
  const ms = _pad(d.getMilliseconds(), 3);
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}.${ms}`;
};

export const createLogger = (scope = 'app') => {
  const base = `[YiH5][${scope}]`;
  return {
    debug: (...args) => console.debug(`${base}[DEBUG] ${_formatDateTime(new Date())}`, ...args),
    info: (...args) => console.info(`${base}[INFO] ${_formatDateTime(new Date())}`, ...args),
    warn: (...args) => console.warn(`${base}[WARN] ${_formatDateTime(new Date())}`, ...args),
    error: (...args) => console.error(`${base}[ERROR] ${_formatDateTime(new Date())}`, ...args)
  };
};

export const logger = createLogger('app');

/* ── Message Helpers ────────────────────────────────────────────────────── */
export { normalizeRole, normalizeText } from './msg.js';
