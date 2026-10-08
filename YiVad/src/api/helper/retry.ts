/**
 * Exponential-backoff retry for transient failures.
 * Only retries on server-side errors (502/503/504), timeouts, and network errors by default.
 */

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  retryOnStatus?: number[];
  retryOnMessage?: RegExp;
  onRetry?: (attempt: number, error: any) => void;
}

export async function withRetry<T>(requestFn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
  const {
    maxRetries = 2,
    retryDelay = 800,
    backoffMultiplier = 1.6,
    retryOnStatus = [502, 503, 504],
    retryOnMessage = /timeout|network|ECONNRESET|ETIMEDOUT|aborted/i,
    onRetry
  } = config;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const status = (error as any)?.response?.status;
      const msg = (error as any)?.message ?? "";
      const code = (error as any)?.code ?? "";
      const name = (error as any)?.name ?? "";
      // Abort/cancel means caller intentionally ended the request (route switch,
      // component unmount, or business timeout handled by upper layer). Retrying
      // these only extends user-visible latency and creates noisy duplicate work.
      const isAbortLike =
        code === "ERR_CANCELED" ||
        /AbortError|aborted|canceled|cancelled/i.test(String(msg)) ||
        /AbortError|CanceledError/i.test(String(name));
      if (isAbortLike) {
        // Return rejected promise instead of throwing, so caller can catch it
        // via try-catch around await. Throwing here would bypass caller's catch.
        return Promise.reject(error);
      }
      const shouldRetryByStatus = status ? retryOnStatus.includes(status) : false;
      const shouldRetryByMessage = retryOnMessage.test(msg);
      if (!shouldRetryByStatus && !shouldRetryByMessage) {
        throw error;
      }
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        onRetry?.(attempt + 1, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
