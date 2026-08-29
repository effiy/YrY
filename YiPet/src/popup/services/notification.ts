/**
 * Toast notification controller — thin wrapper over Element Plus ElMessage.
 */
import { ElMessage } from 'element-plus';

export interface NotifyController {
  show(message: string, type?: 'success' | 'error' | 'info' | 'warning'): void;
  dismiss(): void;
}

export function createNotifyController(): NotifyController {
  return {
    show(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
      ElMessage[type](msg);
    },
    dismiss(): void {
      ElMessage.closeAll();
    },
  };
}
