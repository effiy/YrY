import { describe, it, expect } from 'vitest';
import { connect, type ConnectDeps } from '../../../src/popup/services/connect';

describe('connect', () => {
  it('calls onConnected when ping succeeds immediately', async () => {
    const onConnected = vi.fn();
    const onFailed = vi.fn();
    const sendMessage = vi.fn(() => Promise.resolve({ success: true }));
    const loadState = vi.fn(() => Promise.resolve({ size: 260 }));

    connect({ sendMessage, loadState, onConnected, onFailed }, 3, 10);

    // Wait for async promises to resolve
    await vi.waitFor(() => expect(onConnected).toHaveBeenCalled());
    expect(sendMessage).toHaveBeenCalledWith({ action: 'ping' });
    expect(loadState).toHaveBeenCalled();
    expect(onConnected).toHaveBeenCalledWith({ size: 260 });
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('calls onFailed after max retries exhausted', async () => {
    const onConnected = vi.fn();
    const onFailed = vi.fn();
    const sendMessage = vi.fn(() => Promise.resolve(null));
    const loadState = vi.fn();

    connect({ sendMessage, loadState, onConnected, onFailed }, 2, 5);

    // Wait for retries + failure
    await vi.waitFor(() => expect(onFailed).toHaveBeenCalled(), { timeout: 2000 });
    expect(sendMessage).toHaveBeenCalledTimes(3); // initial + 2 retries
    expect(onConnected).not.toHaveBeenCalled();
  });
});
