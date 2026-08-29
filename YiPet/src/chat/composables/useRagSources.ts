/**
 * YiPet Chat — RAG sources composable.
 * Extracted from MessageBubble.vue: RAG provenance badge, source expansion,
 * file icons, score formatting.
 */
import { computed, nextTick, ref, type Ref } from 'vue';
import { useChatStore } from '../stores/chat';
import type { Message } from '../types';

export function useRagSources(
  msg: Message,
  isUser: boolean,
  isLastPet: boolean,
  streaming: Ref<boolean>,
) {
  const store = useChatStore();
  const s = store.state;

  function formatLatency(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  const retrievalGrade = computed<{ letter: string; top: number } | null>(() => {
    const sources = msg.sources ?? (isLastPet ? s.ragSources : []);
    if (!sources.length) return null;
    const scores = sources.map((src) => src.score ?? 0).filter(Boolean);
    if (!scores.length) return null;
    const top = Math.max(...scores);
    const letter = top >= 0.85 ? 'A' : top >= 0.70 ? 'B' : top >= 0.50 ? 'C' : 'D';
    return { letter, top };
  });

  function scoreBarWidth(score?: number): string {
    if (score == null) return '0%';
    return `${Math.min(100, Math.round(score * 100))}%`;
  }

  function scoreColor(score?: number): string {
    if (score == null) return 'var(--text-secondary, #d4d0e8)';
    if (score >= 0.85) return '#22c55e';
    if (score >= 0.70) return '#6366f1';
    if (score >= 0.50) return '#eab308';
    return '#ef4444';
  }

  function fileIcon(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      md: '\u{1F4DD}', py: '\u{1F40D}', ts: '\u{1F4E6}', vue: '\u{1F3A8}',
      js: '\u{1F4C4}', json: '\u{1F4CB}', yaml: '\u{2699}', yml: '\u{2699}',
      css: '\u{1F3A8}', scss: '\u{1F3A8}', html: '\u{1F310}', txt: '\u{1F4C4}',
      svg: '\u{1F5BC}', png: '\u{1F5BC}', jpg: '\u{1F5BC}',
    };
    return icons[ext || ''] || '\u{1F4C4}';
  }

  function sourceIsContextFile(path: string): boolean {
    const ses = s.sessions.find((x) => x.id === s.currentSessionId);
    if (!ses?.tags) return false;
    return ses.tags.some((t) => typeof t === 'string' && t.startsWith('ctx:') && t.slice(4) === path);
  }

  const hasRagMeta = computed(() =>
    !isUser && (!!msg.ragMeta || retrievalGrade.value || msg.firstTokenLatencyMs != null),
  );

  const isRagStreaming = computed(() => !isUser && streaming.value && s.knowledgeGrounded);
  const liveSourceCount = computed(() => {
    if (!isRagStreaming.value) return 0;
    return s.ragSources.length;
  });

  // ── Source expansion ──
  const expandedSourceIdx = ref<number | null>(null);
  const flashSourceIdx = ref<number | null>(null);
  const sourceRefs = ref<Array<HTMLElement | null>>([]);

  function toggleSourceExpand(idx: number) {
    expandedSourceIdx.value = expandedSourceIdx.value === idx ? null : idx;
  }

  function focusSource(idx: number) {
    const sources = msg.sources?.length ? msg.sources : s.ragSources;
    if (idx < 0 || idx >= sources.length) return;
    expandedSourceIdx.value = idx;
    flashSourceIdx.value = idx;
    nextTick(() => {
      sourceRefs.value[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    setTimeout(() => {
      if (flashSourceIdx.value === idx) flashSourceIdx.value = null;
    }, 1600);
  }

  return {
    formatLatency,
    retrievalGrade,
    scoreBarWidth,
    scoreColor,
    fileIcon,
    sourceIsContextFile,
    hasRagMeta,
    isRagStreaming,
    liveSourceCount,
    expandedSourceIdx,
    flashSourceIdx,
    sourceRefs,
    toggleSourceExpand,
    focusSource,
  };
}