import { ref, onMounted, onUnmounted } from "vue";

export function useSearchShortcut(emit: (e: "update:search", v: string) => void) {
  const searchInputRef = ref<any>(null);
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  function onSearchInput(v: string | number) {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => emit("update:search", String(v ?? "")), 350);
  }

  function onSearchClear() {
    emit("update:search", "");
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
      e.preventDefault();
      searchInputRef.value?.focus();
    }
  }

  onMounted(() => document.addEventListener("keydown", onKeydown));
  onUnmounted(() => {
    document.removeEventListener("keydown", onKeydown);
    if (searchTimer) clearTimeout(searchTimer);
  });

  return { searchInputRef, onSearchInput, onSearchClear };
}
