/**
 * YiPet Chat — Tool performance composable.
 * Extracted from ChatToolbar.vue: running tools label, recent tool calls,
 * and tool performance aggregate.
 */
import { computed } from 'vue';
import { useChatStore } from '../../stores/chat';

const TOOL_SLOW_MS = 2000;
const TOOL_VERY_SLOW_MS = 5000;

export function useToolPerformance() {
  const store = useChatStore();
  const s = store.state;

  /** Label for currently-running tools displayed in the toolbar pill. */
  const runningToolsLabel = computed(() => {
    const evs = s.toolEvents ?? [];
    const running = new Map<string, string>();
    for (const e of evs) {
      if (e.phase === 'start') running.set(e.name, e.label);
      else running.delete(e.name);
    }
    if (!running.size) return (evs[evs.length - 1]?.label) || 'Running tools...';
    const labels = Array.from(running.values());
    return labels.length <= 2 ? labels.join(', ') : labels.slice(0, 2).join(', ') + ` +${labels.length - 2}`;
  });

  /** Last 5 completed tool calls with speed tier classification. */
  const recentToolCalls = computed(() =>
    (s.toolEvents ?? [])
      .filter((event) => event.phase === 'end')
      .slice(-5)
      .reverse()
      .map((event) => {
        const ms = typeof event.durationMs === 'number' ? event.durationMs : undefined;
        let speedTier: 'fast' | 'ok' | 'slow' | 'very-slow' | 'idle' = 'idle';
        let speedLabel = '';
        if (ms != null) {
          if (ms >= TOOL_VERY_SLOW_MS) { speedTier = 'very-slow'; speedLabel = 'very slow'; }
          else if (ms >= TOOL_SLOW_MS) { speedTier = 'slow'; speedLabel = 'slow'; }
          else if (ms < 300) { speedTier = 'fast'; speedLabel = 'fast'; }
          else { speedTier = 'ok'; speedLabel = 'ok'; }
        }
        return {
          key: `${event.name}-${event.timestamp}`,
          label: event.label,
          name: event.name,
          error: event.error || '',
          durationMs: ms,
          durationText: ms == null ? '' : (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`),
          speedTier,
          speedLabel,
          preview: (event.error || event.content || '').trim(),
        };
      }),
  );

  /** Aggregate stats over the last 20 tool executions. */
  const toolperfAggregate = computed(() => {
    const events = s.toolEvents ?? [];
    const recent = events.filter((e) => e.phase === 'end').slice(-20);
    const total = recent.length;
    const errors = recent.filter((e) => !!e.error).length;
    const slowCount = recent.filter(
      (e) => typeof e.durationMs === 'number' && e.durationMs >= TOOL_SLOW_MS,
    ).length;
    const verySlowCount = recent.filter(
      (e) => typeof e.durationMs === 'number' && e.durationMs >= TOOL_VERY_SLOW_MS,
    ).length;
    const withDurations = recent
      .map((e) => e.durationMs as number)
      .filter((v) => typeof v === 'number');
    const avgMs = withDurations.length
      ? Math.round(withDurations.reduce((a, b) => a + b, 0) / withDurations.length)
      : 0;
    return { total, errors, slowCount, verySlowCount, avgMs };
  });

  return { runningToolsLabel, recentToolCalls, toolperfAggregate };
}