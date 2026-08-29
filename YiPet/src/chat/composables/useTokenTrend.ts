/**
 * YiPet Chat — Token trend composable.
 * Extracted from MessageBubble.vue: token estimation, trend comparison,
 * scroll-to-previous message.
 */
import { computed, type Ref } from 'vue';
import { useChatStore } from '../stores/chat';
import type { Message } from '../types';

export function useTokenTrend(msg: Message, index: Ref<number>) {
  const store = useChatStore();
  const s = store.state;

  const tokenEstimate = computed(() => Math.ceil((msg.content || '').length / 4));
  const charCount = computed(() => (msg.content || '').length);
  const wordCount = computed(() => {
    const text = (msg.content || '').trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  });
  const lineCount = computed(() => {
    const text = msg.content || '';
    if (!text) return 0;
    return text.split('\n').length;
  });

  const prevRoleMessage = computed<{ tokens: number; snippet: string; idx: number } | null>(() => {
    const msgs = s.messages ?? [];
    const myIdx = index.value;
    if (myIdx < 1) return null;
    for (let j = myIdx - 1; j >= 0; j--) {
      if (msgs[j].type === msg.type) {
        const text = msgs[j].content || '';
        const snippet = text.length > 80 ? text.slice(0, 79) + '...' : text;
        return { tokens: Math.ceil(text.length / 4), snippet: snippet.replace(/\s+/g, ' '), idx: j };
      }
    }
    return null;
  });

  const prevTokenEstimate = computed(() => prevRoleMessage.value?.tokens ?? null);

  const trend = computed<{ arrow: string; delta: number; sign: string; cls: string } | null>(() => {
    const prev = prevTokenEstimate.value;
    if (prev == null) return null;
    const delta = tokenEstimate.value - prev;
    if (delta === 0) return { arrow: '\u2192', delta: 0, sign: '\u00b1', cls: 'mb-tokens-trend--flat' };
    if (delta > 0) return { arrow: '\u2191', delta, sign: '+', cls: 'mb-tokens-trend--up' };
    return { arrow: '\u2193', delta: -delta, sign: '-', cls: 'mb-tokens-trend--down' };
  });

  function scrollToPrevRoleMessage(): void {
    const idx = prevRoleMessage.value?.idx;
    if (idx == null) return;
    const el = document.querySelector<HTMLElement>(`[data-chat-idx="${String(idx)}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('mb-bubble--flash');
    window.setTimeout(() => el.classList.remove('mb-bubble--flash'), 2000);
  }

  return {
    tokenEstimate, charCount, wordCount, lineCount,
    prevRoleMessage, prevTokenEstimate, trend, scrollToPrevRoleMessage,
  };
}