import { ref, onBeforeUnmount } from "vue";

/**
 * Rich text editor controller — tracks dirty state, word count, and auto-save integration.
 */
export const useRichText = (options?: { autoSaveFn?: (content: string) => void; autoSaveDelay?: number }) => {
  const { autoSaveFn, autoSaveDelay = 2000 } = options || {};

  const content = ref("");
  const wordCount = ref(0);
  const isDirty = ref(false);
  const mode = ref<"wysiwyg" | "markdown">("wysiwyg");
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  function updateContent(newContent: string) {
    content.value = newContent;
    wordCount.value = newContent.replace(/<[^>]*>/g, "").replace(/\s+/g, "").length;
    isDirty.value = true;

    if (autoSaveFn) {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        autoSaveFn(newContent);
        isDirty.value = false;
      }, autoSaveDelay);
    }
  }

  function toggleMode() {
    mode.value = mode.value === "wysiwyg" ? "markdown" : "wysiwyg";
  }

  function sanitize(html: string): string {
    // Basic XSS sanitization — strip script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
      .replace(/javascript\s*:/gi, "");
  }

  onBeforeUnmount(() => {
    if (saveTimer) clearTimeout(saveTimer);
  });

  return {
    content,
    wordCount,
    isDirty,
    mode,
    updateContent,
    toggleMode,
    sanitize,
  };
};