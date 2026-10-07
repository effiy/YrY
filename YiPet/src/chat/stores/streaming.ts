/**
 * Streaming Store — SSE streaming state and abort management.
 * The actual _runStream orchestration lives in the main chat store
 * since it crosses all domains (messages, sessions, knowledge, tools).
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WebImageResult, WebSearchResult, RagSource } from '@/api/types';

export const useStreamingStore = defineStore('streaming', () => {
  const isProcessing = ref(false);
  const streamingTargetTimestamp = ref<number | null>(null);
  const streamingType = ref<'' | 'send' | 'regenerate' | 'resend'>('');
  const streamingPhase = ref<'' | 'fetching' | 'preparing' | 'thinking' | 'retrieving' | 'streaming'>('');
  const thinkingStartTs = ref<number | null>(null);
  const webSearchResults = ref<WebSearchResult[]>([]);
  const webSearchImages = ref<WebImageResult[]>([]);
  const webSearching = ref(false);
  const searchTimingMs = ref(0);
  const lastSearchQuery = ref('');

  let _abortController: AbortController | null = null;

  function getAbortController(): AbortController | null {
    return _abortController;
  }

  function createAbortController(): AbortController {
    _abortController = new AbortController();
    return _abortController;
  }

  function stopSending() {
    _abortController?.abort();
    _abortController = null;
    isProcessing.value = false;
    streamingType.value = '';
    streamingPhase.value = '';
    thinkingStartTs.value = null;
    streamingTargetTimestamp.value = null;
  }

  function resetForNewStream(type: 'send' | 'regenerate' | 'resend', petTimestamp: number, knowledgeGrounded: boolean) {
    streamingTargetTimestamp.value = petTimestamp;
    streamingType.value = type;
    isProcessing.value = true;
    streamingPhase.value = knowledgeGrounded ? 'retrieving' : 'thinking';
    thinkingStartTs.value = Date.now();
    webSearching.value = false;
    searchTimingMs.value = 0;
    lastSearchQuery.value = '';
    webSearchResults.value = [];
    webSearchImages.value = [];
    _abortController = new AbortController();
    return _abortController.signal;
  }

  function finishStream() {
    isProcessing.value = false;
    streamingType.value = '';
    streamingPhase.value = '';
    thinkingStartTs.value = null;
    streamingTargetTimestamp.value = null;
    _abortController = null;
  }

  return {
    // State
    isProcessing, streamingTargetTimestamp, streamingType, streamingPhase,
    thinkingStartTs, webSearchResults, webSearchImages,
    webSearching, searchTimingMs, lastSearchQuery,

    // Actions
    getAbortController, createAbortController,
    stopSending, resetForNewStream, finishStream,
  };
});