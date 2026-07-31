import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('antd', () => {
  const message = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };
  return { message };
});

import { message as antdMessage } from 'antd';
import { createNotifyController } from '../../../src/popup/services/notification';

describe('notify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('show() delegates to antd message with the given type', () => {
    const controller = createNotifyController();
    controller.show('Size Updated', 'success');
    expect(antdMessage.success).toHaveBeenCalledWith('Size Updated');
  });

  it('show() defaults type to info', () => {
    const controller = createNotifyController();
    controller.show('Test');
    expect(antdMessage.info).toHaveBeenCalledWith('Test');
  });

  it('show() routes error type to antd message.error', () => {
    const controller = createNotifyController();
    controller.show('Boom', 'error');
    expect(antdMessage.error).toHaveBeenCalledWith('Boom');
  });

  it('dismiss() is a no-op (antd manages toast lifetime)', () => {
    const controller = createNotifyController();
    expect(() => controller.dismiss()).not.toThrow();
  });
});
