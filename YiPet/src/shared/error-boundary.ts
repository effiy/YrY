/**
 * Error Boundary & Graceful Degradation — YP-09-41.
 *
 * Provides a Vue error boundary component and a centralized error
 * fallback strategy for YiPet's chat window, content script, and popup.
 */
import { defineComponent, ref, onErrorCaptured, type Component } from 'vue';

export interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
  errorCount: number;
}

/** Create an error boundary component that wraps children with error recovery. */
export function createErrorBoundary(fallbackComponent?: Component, onError?: (err: Error) => void) {
  return defineComponent({
    name: 'ErrorBoundary',
    setup(_props, { slots }) {
      const error = ref<Error | null>(null);
      const errorCount = ref(0);

      onErrorCaptured((err: Error, _instance, _info) => {
        error.value = err;
        errorCount.value++;
        onError?.(err);
        return false; // prevent propagation
      });

      function reset() {
        error.value = null;
      }

      return () => {
        if (error.value) {
          if (fallbackComponent) {
            return { component: fallbackComponent, props: { error: error.value, reset, count: errorCount.value } };
          }
          return null;
        }
        return slots.default?.();
      };
    },
  });
}

/** Error severity classification for logging/triage. */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: string;
  timestamp: number;
}

class ErrorReporter {
  private _reports: ErrorReport[] = [];
  private _maxReports = 100;

  report(err: Error, context: string, severity: ErrorSeverity = 'medium') {
    const report: ErrorReport = {
      message: err.message,
      stack: err.stack,
      severity,
      context,
      timestamp: Date.now(),
    };
    this._reports.push(report);
    if (this._reports.length > this._maxReports) {
      this._reports.shift();
    }
    console.error(`[YiPet:${context}] ${err.message}`);
  }

  getRecent(limit = 20): ErrorReport[] {
    return this._reports.slice(-limit);
  }

  clear() {
    this._reports = [];
  }
}

export const errorReporter = new ErrorReporter();

/** Wrap a function with error catching and reporting. */
export function withErrorReporting<T extends (...args: any[]) => any>(
  fn: T,
  context: string,
  severity: ErrorSeverity = 'medium',
  fallback?: ReturnType<T>,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (err) {
      errorReporter.report(err instanceof Error ? err : new Error(String(err)), context, severity);
      return fallback as ReturnType<T>;
    }
  };
}