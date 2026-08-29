/**
 * YiPet Chat — Skills/Tools panel composable.
 * Extracted from ChatToolbar.vue: agent tools listing, search, keyboard nav.
 */
import { computed, ref } from 'vue';
import { useChatStore } from '../stores/chat';
import { highlightSegments, fuzzySearch } from './useTextSearch';

export function useSkillsPanel() {
  const store = useChatStore();
  const s = store.state;

  const filter = ref('');
  const selectedIdx = ref(-1);

  const allTools = computed(() => {
    const tools = s.agentTools ?? [];
    return tools.map((t: any) => ({
      name: t.name || t,
      label: t.label || t.name || t,
      description: t.description || '',
      enabled: t.enabled !== false,
    }));
  });

  const activeCount = computed(() => allTools.value.filter((t) => t.enabled).length);

  const visibleTools = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return allTools.value;
    return allTools.value.filter((t) => {
      const name = (t.name ?? '').toLowerCase();
      const desc = (t.description ?? '').toLowerCase();
      const label = (t.label ?? '').toLowerCase();
      return name.includes(q) || desc.includes(q) || label.includes(q);
    });
  });

  const similarTools = computed<{ name: string; score: number }[]>(() => {
    const q = filter.value.trim();
    if (!q || visibleTools.value.length > 0) return [];
    return fuzzySearch(q, allTools.value, (t) => t.name).map((r) => ({ name: r.item.name, score: r.score }));
  });

  function onKeydown(e: KeyboardEvent) {
    if (!visibleTools.value.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx.value = (selectedIdx.value + 1) % visibleTools.value.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx.value = selectedIdx.value <= 0
        ? visibleTools.value.length - 1
        : selectedIdx.value - 1;
    } else if (e.key === 'Enter' && selectedIdx.value >= 0) {
      e.preventDefault();
      const tool = visibleTools.value[selectedIdx.value];
      if (tool) filter.value = tool.name;
      selectedIdx.value = -1;
    } else if (e.key === 'Escape') {
      selectedIdx.value = -1;
    }
  }

  return {
    filter,
    selectedIdx,
    allTools,
    activeCount,
    visibleTools,
    similarTools,
    onKeydown,
    highlightSegments,
  };
}