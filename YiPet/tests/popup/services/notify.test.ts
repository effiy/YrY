import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNotifyController } from '../../../src/popup/services/notification';

describe('notify', () => {
  let setState: ReturnType<typeof vi.fn>;
  let timerRef: { current: ReturnType<typeof setTimeout> | null };

  beforeEach(() => {
    vi.useFakeTimers();
    setState = vi.fn();
    timerRef = { current: null };
  });

  it('show() sets notification state and auto-dismisses', () => {
    const controller = createNotifyController(setState, timerRef, 3000);

    controller.show('Size Updated', 'success');
    expect(setState).toHaveBeenCalledWith({
      notification: { visible: true, message: 'Size Updated', type: 'success' },
    });

    // Timer should be set
    expect(timerRef.current).not.toBeNull();

    // After 3 seconds, auto-dismiss
    vi.advanceTimersByTime(3000);
    expect(setState).toHaveBeenCalledWith({
      notification: { visible: false, message: '', type: 'info' },
    });
    expect(timerRef.current).toBeNull();
  });

  it('dismiss() clears timer and hides notification', () => {
    const controller = createNotifyController(setState, timerRef, 3000);

    controller.show('Hello', 'info');
    expect(timerRef.current).not.toBeNull();

    controller.dismiss();
    expect(timerRef.current).toBeNull();
    expect(setState).toHaveBeenCalledWith({
      notification: { visible: false, message: '', type: 'info' },
    });
  });

  it('show() replaces previous timer', () => {
    const controller = createNotifyController(setState, timerRef, 3000);

    controller.show('First', 'info');
    const firstTimer = timerRef.current;

    controller.show('Second', 'error');
    const secondTimer = timerRef.current;

    // First timer should be cleared
    expect(secondTimer).not.toBe(firstTimer);

    // Advance time — only the second notification should fire
    vi.advanceTimersByTime(3000);
    // The last setState call should be the dismiss from the second timer
    const calls = setState.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toEqual({
      notification: { visible: false, message: '', type: 'info' },
    });
  });

  it('defaults type to info', () => {
    const controller = createNotifyController(setState, timerRef, 1000);
    controller.show('Test');
    expect(setState).toHaveBeenCalledWith({
      notification: { visible: true, message: 'Test', type: 'info' },
    });
  });
});
