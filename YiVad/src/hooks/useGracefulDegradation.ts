import { ref, onBeforeUnmount } from "vue";
import { reportError } from "@/utils/errorReporter";

interface DegradationOptions {
  fallbackComponent?: string;
  autoRetry?: boolean;
  retryInterval?: number;
  maxRetries?: number;
}

export function useGracefulDegradation(options: DegradationOptions = {}) {
  const { autoRetry = false, retryInterval = 5000, maxRetries = 3 } = options;

  const degraded = ref(false);
  const error = ref<Error | null>(null);
  const retryCount = ref(0);
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  function handleError(err: Error) {
    error.value = err;
    degraded.value = true;

    reportError({
      type: "RENDER",
      error: err,
      componentName: options.fallbackComponent || "unknown",
      timestamp: Date.now(),
    });

    if (autoRetry && retryCount.value < maxRetries) {
      retryTimer = setTimeout(
        () => {
          retryCount.value++;
          retry();
        },
        retryInterval * Math.pow(2, retryCount.value),
      );
    }
  }

  function retry() {
    degraded.value = false;
    error.value = null;
  }

  function reset() {
    degraded.value = false;
    error.value = null;
    retryCount.value = 0;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  onBeforeUnmount(() => {
    if (retryTimer) clearTimeout(retryTimer);
  });

  return {
    degraded,
    error,
    retryCount,
    handleError,
    retry,
    reset,
  };
}