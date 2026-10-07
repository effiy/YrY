/**
 * watchSync — Bidirectional watch sync helpers.
 * Replaces verbose watch() boilerplate with declarative one-liners.
 */
import { watch, type Ref } from 'vue';

/** One-way: source ref → setter. Use for simple value copies. */
export function syncTo<T>(source: Ref<T> | (() => T), setter: (v: T) => void): void {
  watch(source, v => setter(v), { flush: 'post' });
}

/** One-way with immediate: source ref → setter, fires on init too. */
export function syncToImmediate<T>(source: Ref<T> | (() => T), setter: (v: T) => void): void {
  watch(source, v => setter(v), { immediate: true, flush: 'post' });
}

/** Two-way with equality guard: ref A ↔ setter B; ref B ↔ setter A.
 *  Guards against infinite loops by checking equality before setting. */
export function syncBidirectional<T>(a: Ref<T>, b: Ref<T>): void {
  watch(a, v => { if (b.value !== v) b.value = v; }, { immediate: true, flush: 'post' });
  watch(b, v => { if (a.value !== v) a.value = v; }, { flush: 'post' });
}

/** Array copy sync: source ref → array copy setter. Avoids shared reference mutation. */
export function syncArrayCopy<T>(source: Ref<T[]> | (() => T[]), setter: (v: T[]) => void): void {
  watch(source, v => setter([...v]), { flush: 'post' });
}