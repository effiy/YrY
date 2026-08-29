<script setup lang="ts">
/**
 * RagSourcesPanel — RAG source list with expand/collapse and flash highlight.
 * Extracted from MessageBubble.vue.
 */
defineProps<{
  sources: Array<{ path: string; score?: number; snippet?: string }>;
  expandedIdx: number | null;
  flashIdx: number | null;
  fileIcon: (path: string) => string;
  scoreColor: (score?: number) => string;
  scoreBarWidth: (score?: number) => string;
  sourceIsContextFile: (path: string) => boolean;
}>();

const emit = defineEmits<{
  toggleExpand: [idx: number];
  sourceRef: [idx: number, el: any];
}>();
</script>

<template>
  <div class="mb-sources" role="list" aria-label="RAG sources">
    <div class="mb-sources__title">
      <span>Sources</span>
      <span class="mb-sources__count">{{ sources.length }}</span>
    </div>
    <ul class="mb-sources__list">
      <li
        v-for="(src, i) in sources"
        :key="`src-${i}-${src.path}`"
        :ref="(el: any) => emit('sourceRef', i, el)"
        class="mb-sources__item"
        :class="{ 'mb-sources__item--flash': flashIdx === i, 'mb-sources__item--expanded': expandedIdx === i }"
      >
        <div class="mb-sources__head" @click="emit('toggleExpand', i)">
          <span class="mb-sources__idx">{{ i + 1 }}</span>
          <span class="mb-sources__icon">{{ fileIcon(src.path) }}</span>
          <span class="mb-sources__path" :title="src.path">{{ src.path }}</span>
          <span
            v-if="sourceIsContextFile(src.path)"
            class="mb-sources__ctx-badge"
            title="Session context file"
          >ctx</span>
          <span class="mb-sources__score-bar">
            <span
              class="mb-sources__score-fill"
              :style="{ width: scoreBarWidth(src.score), background: scoreColor(src.score) }"
            />
          </span>
          <span v-if="typeof src.score === 'number'" class="mb-sources__score" :style="{ color: scoreColor(src.score) }">{{ src.score.toFixed(3) }}</span>
          <span class="mb-sources__toggle">{{ expandedIdx === i ? '▾' : '▸' }}</span>
        </div>
        <div v-if="expandedIdx === i && src.snippet" class="mb-sources__snippet">
          <div class="mb-sources__snippet-label">Snippet</div>
          {{ src.snippet }}
        </div>
      </li>
    </ul>
  </div>
</template>