/**
 * YiPet Chat — @-mention detection composable.
 * Extracted from ChatInput.vue: detects @file mentions in the input text.
 */
import { ref, watch, type Ref } from 'vue';

export function useMentionDetection(inputValue: Ref<string>) {
  const query = ref('');
  const visible = ref(false);
  const atIdx = ref(-1);

  function update() {
    const text = inputValue.value;
    const lastAt = text.lastIndexOf('@');
    if (lastAt < 0) {
      visible.value = false;
      query.value = '';
      atIdx.value = -1;
      return;
    }
    if (lastAt > 0 && !/\s/.test(text[lastAt - 1])) {
      visible.value = false;
      query.value = '';
      atIdx.value = -1;
      return;
    }
    const after = text.slice(lastAt + 1);
    if (after.includes(' ')) {
      visible.value = false;
      query.value = '';
      atIdx.value = -1;
      return;
    }
    visible.value = true;
    query.value = after;
    atIdx.value = lastAt;
  }

  watch(inputValue, update);

  return { query, visible, atIdx, update };
}