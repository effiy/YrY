import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('element-plus', () => {
  const ElMessage = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    closeAll: vi.fn(),
  };
  return { ElMessage };
});

import { ElMessage } from 'element-plus';
import { createNotifyController } from '../../../src/popup/services/notification';

describe('notify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('show() delegates to ElMessage with the given type', () => {
    const controller = createNotifyController();
    controller.show('Size Updated', 'success');
    expect(ElMessage.success).toHaveBeenCalledWith('Size Updated');
  });

  it('show() defaults type to info', () => {
    const controller = createNotifyController();
    controller.show('Test');
    expect(ElMessage.info).toHaveBeenCalledWith('Test');
  });

  it('show() routes error type to ElMessage.error', () => {
    const controller = createNotifyController();
    controller.show('Boom', 'error');
    expect(ElMessage.error).toHaveBeenCalledWith('Boom');
  });

  it('dismiss() closes all ElMessage instances', () => {
    const controller = createNotifyController();
    controller.dismiss();
    expect(ElMessage.closeAll).toHaveBeenCalled();
  });
});