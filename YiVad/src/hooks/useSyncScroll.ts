/**
 * YiVad — Bidirectional sync-scroll composable.
 * Extracted from KnowledgePreviewDialog.vue: editor↔preview scroll sync.
 * Attaches/detaches scroll listeners on editor textarea and preview pane.
 */
import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue';

export function useSyncScroll(
  mode: Ref<string>,
  getEditor: () => HTMLTextAreaElement | null,
  getPreview: () => HTMLElement | null,
) {
  let syncScrolling = false;
  let editorCleanup: (() => void) | null = null;
  let previewCleanup: (() => void) | null = null;

  function setup() {
    const editor = getEditor();
    const preview = getPreview();
    if (!editor || !preview) return;

    function onEditorScroll() {
      if (syncScrolling) return;
      syncScrolling = true;
      const maxE = editor!.scrollHeight - editor!.clientHeight;
      const maxP = preview!.scrollHeight - preview!.clientHeight;
      if (maxE > 0 && maxP > 0) {
        preview!.scrollTop = (editor!.scrollTop / maxE) * maxP;
      }
      requestAnimationFrame(() => { syncScrolling = false; });
    }

    function onPreviewScroll() {
      if (syncScrolling) return;
      syncScrolling = true;
      const maxE = editor!.scrollHeight - editor!.clientHeight;
      const maxP = preview!.scrollHeight - preview!.clientHeight;
      if (maxP > 0 && maxE > 0) {
        editor!.scrollTop = (preview!.scrollTop / maxP) * maxE;
      }
      requestAnimationFrame(() => { syncScrolling = false; });
    }

    editor.addEventListener('scroll', onEditorScroll, { passive: true });
    preview.addEventListener('scroll', onPreviewScroll, { passive: true });
    editorCleanup = () => editor.removeEventListener('scroll', onEditorScroll);
    previewCleanup = () => preview.removeEventListener('scroll', onPreviewScroll);
  }

  function teardown() {
    editorCleanup?.();
    previewCleanup?.();
    editorCleanup = null;
    previewCleanup = null;
  }

  watch(() => mode.value, (next, prev) => {
    if (next === 'split' && prev !== 'split') {
      nextTick(() => setup());
    } else if (next !== 'split' && prev === 'split') {
      teardown();
    }
  });

  onBeforeUnmount(() => teardown());

  return { setup, teardown };
}