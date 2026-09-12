/**
 * Exponential-backoff retry for transient failures.
 * Only retries on server-side errors (502/503/504) by default.
 */

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  retryOnStatus?: number[];
  onRetry?: (attempt: number, error: any) => void;
}

export async function withRetry<T>(
  requestFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    retryOnStatus = [502, 503, 504],
  } = config;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const status = (error as any)?.response?.status;
      if (status && !retryOnStatus.includes(status)) throw error;
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        config.onRetry?.(attempt + 1, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}