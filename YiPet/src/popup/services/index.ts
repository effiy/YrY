/**
 * Popup service aggregator — creates all services with shared context.
 */

import type { TabRef } from './chrome';
import { createChromeService } from './chrome';
import { createNotifyController } from './notify';

export interface PopupServices {
  chrome: ReturnType<typeof createChromeService> | null;
  notify: ReturnType<typeof createNotifyController> | null;
}

export function createPopupServices(ctx: {
  tabRef: TabRef;
  timerRef: { current: ReturnType<typeof setTimeout> | null };
  storageKey: string;
  duration: number;
  setState: (patch: Record<string, unknown>) => void;
}): PopupServices {
  return {
    chrome: createChromeService(ctx.tabRef, ctx.storageKey),
    notify: createNotifyController(ctx.setState, ctx.timerRef, ctx.duration),
  };
}
