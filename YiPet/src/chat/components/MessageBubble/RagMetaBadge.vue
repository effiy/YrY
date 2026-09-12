<script setup lang="ts">
/**
 * RagMetaBadge — RAG provenance badge showing retrieval quality metadata.
 * Extracted from MessageBubble.vue.
 */
defineProps<{
  ragMeta: {
    chatMode?: string;
    hybrid?: boolean;
    rerank?: boolean;
    citations?: boolean;
    numQueries?: number;
    category?: string;
    tags?: string[];
    scope?: string;
  } | null;
  retrievalGrade: { letter: string; top: number } | null;
  firstTokenLatencyMs: number | null | undefined;
  formatLatency: (ms: number) => string;
}>();
</script>

<template>
  <div v-if="ragMeta" class="mb-rag-meta">
    <span
      v-if="retrievalGrade"
      class="mb-rag-meta-grade"
      :class="`mb-rag-meta-grade--${retrievalGrade.letter}`"
      :title="`Retrieval grade ${retrievalGrade.letter} — top cosine score ${(retrievalGrade.top * 100).toFixed(0)}% (A>=85, B>=70, C>=50, D<50)`"
    >{{ retrievalGrade.letter }}</span>
    <span v-if="ragMeta.chatMode" class="mb-rag-meta-mode" :title="`ChatEngine: ${ragMeta.chatMode}`">{{ ragMeta.chatMode }}</span>
    <span v-if="ragMeta.hybrid" class="mb-rag-meta-chip mb-rag-meta-chip--on">hybrid</span>
    <span v-if="ragMeta.rerank" class="mb-rag-meta-chip mb-rag-meta-chip--on">rerank</span>
    <span v-if="ragMeta.citations" class="mb-rag-meta-chip mb-rag-meta-chip--on">citations</span>
    <span v-if="ragMeta.numQueries && ragMeta.numQueries > 1" class="mb-rag-meta-chip">Q×{{ ragMeta.numQueries }}</span>
    <span v-if="ragMeta.category" class="mb-rag-meta-chip mb-rag-meta-chip--filter" :title="`MetadataFilter: category='${ragMeta.category}'`">cat:{{ ragMeta.category }}</span>
    <span
      v-for="t in (ragMeta.tags ?? [])"
      :key="t"
      class="mb-rag-meta-chip mb-rag-meta-chip--filter"
      :title="`MetadataFilter: tags includes '${t}'`"
    >#{{ t }}</span>
    <code v-if="ragMeta.scope" class="mb-rag-meta-scope">{{ ragMeta.scope }}</code>
    <span
      v-if="firstTokenLatencyMs != null"
      class="mb-rag-meta-chip mb-rag-meta-chip--latency"
      :title="`Time-to-first-token: ${firstTokenLatencyMs}ms`"
    >{{ formatLatency(firstTokenLatencyMs) }}</span>
  </div>
  <div
    v-else
    class="mb-rag-meta mb-rag-meta--bare"
    :title="`${retrievalGrade ? 'Retrieval grade ' + retrievalGrade.letter + ' · top ' + (retrievalGrade.top * 100).toFixed(0) + '%' : ''}${firstTokenLatencyMs != null ? ' · TTFT ' + firstTokenLatencyMs + 'ms' : ''}`"
  >
    <span
      v-if="retrievalGrade"
      class="mb-rag-meta-grade"
      :class="`mb-rag-meta-grade--${retrievalGrade.letter}`"
    >{{ retrievalGrade.letter }}</span>
    <span v-if="firstTokenLatencyMs != null" class="mb-rag-meta-chip mb-rag-meta-chip--latency">{{ formatLatency(firstTokenLatencyMs) }}</span>
  </div>
</template>