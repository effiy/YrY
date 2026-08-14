/**
 * Toast notification controller — thin wrapper over antd `message` static API.
 * Toast lifetime is managed by antd internally; dismiss() is a no-op kept
 * for interface compatibility.
 */
import { message as antdMessage } from 'antd';

export interface NotifyController {
  show(message: string, type?: 'success' | 'error' | 'info' | 'warning'): void;
  dismiss(): void;
}

export function createNotifyController(): NotifyController {
  return {
    show(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
      antdMessage[type](msg);
    },
    dismiss(): void {
      /* no-op — antd message auto-dismisses */
    },
  };
}
