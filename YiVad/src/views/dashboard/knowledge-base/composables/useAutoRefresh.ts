import { ref, onMounted, onUnmounted, watch } from "vue";

/**
 * Auto-refresh composable with visibility-aware pause/resume.
 * Pauses polling when the browser tab is hidden, resumes + immediately fetches on return.
 */
export function useAutoRefresh(fetchFn: () => Promise<void>, intervalMs = 60_000) {
  const isActive = ref(true);
  const lastFetchTime = ref(Date.now());
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (timer !== null) return;
    timer = setInterval(async () => {
      if (isActive.value) {
        await fetchFn();
        lastFetchTime.value = Date.now();
      }
    }, intervalMs);
  }

  function stop() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      fetchFn().then(() => {
        lastFetchTime.value = Date.now();
      });
      if (isActive.value) start();
    }
  }

  onMounted(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (isActive.value) start();
  });

  onUnmounted(() => {
    stop();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  });

  watch(isActive, active => {
    if (active) start();
    else stop();
  });

  return { isActive, lastFetchTime };
}