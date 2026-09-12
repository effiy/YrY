/**
 * YiPet Chat — Expand/collapse composable.
 * SessionStorage-backed expand/collapse state for long errors and content.
 * Extracted from MessageBubble.vue.
 */
import { ref } from 'vue';

const ERROR_COLLAPSE_THRESHOLD = 200;
const CONTENT_COLLAPSE_THRESHOLD = 400;
const EXPANDED_ERRORS_KEY = 'yipet.chat.expandedErrors';
const EXPANDED_CONTENTS_KEY = 'yipet.chat.expandedContents';

function loadExpandedSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter((x: unknown) => typeof x === 'string')) : new Set();
  } catch { return new Set(); }
}

function persistExpandedSet(key: string, set: Set<string>): void {
  try { sessionStorage.setItem(key, JSON.stringify([...set])); } catch { /* ignore */ }
}

export function useExpandCollapse(ts: number | string) {
  const expandedErrors = ref<Set<string>>(loadExpandedSet(EXPANDED_ERRORS_KEY));
  const expandedContents = ref<Set<string>>(loadExpandedSet(EXPANDED_CONTENTS_KEY));

  function expandKey(idx: number): string {
    return `${ts}:${idx}`;
  }

  function toggleErrorExpand(idx: number): void {
    const next = new Set(expandedErrors.value);
    const k = expandKey(idx);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    expandedErrors.value = next;
    persistExpandedSet(EXPANDED_ERRORS_KEY, next);
  }

  function isErrorLong(err: string): boolean { return err.length > ERROR_COLLAPSE_THRESHOLD; }
  function isErrorExpanded(idx: number): boolean { return expandedErrors.value.has(expandKey(idx)); }

  function toggleContentExpand(idx: number): void {
    const next = new Set(expandedContents.value);
    const k = expandKey(idx);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    expandedContents.value = next;
    persistExpandedSet(EXPANDED_CONTENTS_KEY, next);
  }

  function isContentLong(s: string): boolean { return s.length > CONTENT_COLLAPSE_THRESHOLD; }
  function isContentExpanded(idx: number): boolean { return expandedContents.value.has(expandKey(idx)); }

  return {
    toggleErrorExpand, isErrorLong, isErrorExpanded,
    toggleContentExpand, isContentLong, isContentExpanded,
  };
}

/** Format duration in ms to human-readable string. */
export function formatDuration(ms?: number): string {
  if (ms == null) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Truncate content for preview. */
export function previewContent(content?: string, max = 120): string {
  if (!content) return '';
  return content.length > max ? content.slice(0, max) + '...' : content;
}

/** Slow / very-slow call latency level. */
export function callLatencyLevel(ms: number | undefined | null): '' | 'slow' | 'very-slow' {
  if (ms == null) return '';
  if (ms >= 5000) return 'very-slow';
  if (ms >= 1000) return 'slow';
  return '';
}