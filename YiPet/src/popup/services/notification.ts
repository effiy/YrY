/**
 * Toast notification controller — auto-dismissing popup toasts.
 */

export interface NotifyController {
  show(message: string, type?: 'success' | 'error' | 'info'): void;
  dismiss(): void;
}

export function createNotifyController(
  setState: (patch: Record<string, unknown>) => void,
  timerRef: { current: ReturnType<typeof setTimeout> | null },
  duration = 3000,
): NotifyController {
  return {
    show(message: string, type: 'success' | 'error' | 'info' = 'info') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setState({ notification: { visible: true, message, type } });
      timerRef.current = setTimeout(() => {
        setState({ notification: { visible: false, message: '', type: 'info' } });
        timerRef.current = null;
      }, duration);
    },

    dismiss() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setState({ notification: { visible: false, message: '', type: 'info' } });
    },
  };
}
