import { describe, it, expect } from 'vitest';
import { createPopupConfig } from '../../src/popup/data';
import { createConfig } from '../../src/config/config';

describe('popup data adapter', () => {
  const appConfig = createConfig('production', 'http://localhost:10086');
  const popupConfig = createPopupConfig(appConfig);

  describe('createPopupConfig()', () => {
    it('exports ROLES array', () => {
      expect(popupConfig.ROLES).toEqual([
        'Teacher', 'Doctor', 'Pastry Chef', 'Police Officer',
      ]);
    });

    it('exports COLORS array with values and labels', () => {
      expect(popupConfig.COLORS).toHaveLength(6);
      expect(popupConfig.COLORS[0]).toEqual({ value: -1, label: 'None' });
      expect(popupConfig.COLORS[1]).toEqual({ value: 0, label: 'Quantum Violet' });
      expect(popupConfig.COLORS[5]).toEqual({ value: 4, label: 'Quantum Sunset' });
    });

    it('exports SIZE limits', () => {
      expect(popupConfig.SIZE.MIN).toBe(80);
      expect(popupConfig.SIZE.MAX).toBe(400);
      expect(popupConfig.SIZE.STEP).toBe(10);
    });

    it('exports STORAGE_KEY', () => {
      expect(popupConfig.STORAGE_KEY).toBe('pet_global_state');
    });

    it('exports TIMING constants', () => {
      expect(popupConfig.TIMING.NOTIFICATION_DURATION).toBe(3000);
      expect(popupConfig.TIMING.CONNECT_RETRY_MAX).toBe(3);
      expect(popupConfig.TIMING.CONNECT_RETRY_BASE_MS).toBe(500);
    });

    it('exports STATUS_DOT colors', () => {
      expect(popupConfig.STATUS_DOT.ACTIVE).toBe('#22c55e');
      expect(popupConfig.STATUS_DOT.INACTIVE).toBe('#f59e0b');
    });

    it('exports MSG table with fallback strings', () => {
      expect(popupConfig.MSG.CONNECTING).toBe('Connecting…');
      expect(popupConfig.MSG.READY).toBe('Ready');
      expect(popupConfig.MSG.READY_OFFLINE).toBe('Ready (Offline)');
      expect(popupConfig.MSG.ACTIVE).toBe('Active');
      expect(popupConfig.MSG.HIDDEN).toBe('Hidden');
      expect(popupConfig.MSG.SHOWN).toBe('Shown');
      expect(popupConfig.MSG.OP_FAILED).toBe('Operation failed');
    });

    it('exports DEFAULTS', () => {
      expect(popupConfig.DEFAULTS.VISIBLE).toBe(false);
      expect(popupConfig.DEFAULTS.SIZE).toBe(260);
      expect(popupConfig.DEFAULTS.ROLE).toBe('Teacher');
      expect(popupConfig.DEFAULTS.COLOR).toBe(0);
      expect(popupConfig.DEFAULTS.MODEL).toBeNull();
      expect(popupConfig.DEFAULTS.VERSION).toBe('1.1.2');
    });
  });
});
