import { describe, expect, it, vi } from 'vitest';
import { localizeDOM, type MessageKey, t } from '../../src/shared/i18n';

describe('i18n', () => {
  describe('t()', () => {
    it('returns the translated string from chrome.i18n.getMessage', () => {
      vi.mocked(chrome.i18n.getMessage).mockReturnValueOnce('Show Pet');
      expect(t('popupSwitchLabel')).toBe('Show Pet');
    });

    it('falls back to the key when no translation is found', () => {
      vi.mocked(chrome.i18n.getMessage).mockReturnValueOnce('');
      expect(t('popupSwitchLabel')).toBe('popupSwitchLabel');
    });

    it('passes substitutions to chrome.i18n.getMessage', () => {
      const spy = vi.mocked(chrome.i18n.getMessage).mockReturnValueOnce('Model: GPT-4');
      expect(t('popupModelPrefix', 'GPT-4')).toBe('Model: GPT-4');
      expect(spy).toHaveBeenCalledWith('popupModelPrefix', 'GPT-4');
    });

    it('passes array substitutions', () => {
      vi.mocked(chrome.i18n.getMessage).mockReturnValueOnce('v1.2.0');
      expect(t('popupVersion', ['1.2.0'])).toBe('v1.2.0');
    });

    it('handles all known message keys without crashing', () => {
      vi.mocked(chrome.i18n.getMessage).mockReturnValue('ok');
      const keys: MessageKey[] = [
        'extName',
        'extDescription',
        'extDefaultTitle',
        'cmdTogglePet',
        'cmdOpenChat',
        'popupSwitchLabel',
        'popupSizeLabel',
        'popupRoleLabel',
        'popupColorLabel',
        'popupSettingsTitle',
        'popupModelPrefix',
        'popupStatusConnecting',
        'popupStatusReady',
        'popupStatusReadyOffline',
        'popupStatusActive',
        'popupStatusHidden',
        'notifyShown',
        'notifyHidden',
        'notifySizeUpdated',
        'notifyRoleChanged',
        'notifyColorSet',
        'errorOperationFailed',
        'errorTabNotFound',
        'errorInitFailed',
        'errorContentScriptNotReady',
        'popupSizeUnit',
        'popupVersion',
      ];
      for (const key of keys) {
        expect(() => t(key)).not.toThrow();
      }
    });
  });

  describe('localizeDOM()', () => {
    it('replaces text content of [data-i18n] elements', () => {
      vi.mocked(chrome.i18n.getMessage).mockImplementation((key) => {
        const m: Record<string, string> = {
          popupSwitchLabel: 'Show Pet',
          popupSizeLabel: 'Size',
        };
        return m[key as string] || '';
      });

      document.body.innerHTML = `
        <span data-i18n="popupSwitchLabel">__MSG_popupSwitchLabel__</span>
        <span data-i18n="popupSizeLabel">__MSG_popupSizeLabel__</span>
      `;
      localizeDOM(document.body);
      const spans = document.querySelectorAll('span');
      expect(spans[0].textContent).toBe('Show Pet');
      expect(spans[1].textContent).toBe('Size');
    });

    it('replaces [data-i18n-title] attributes', () => {
      vi.mocked(chrome.i18n.getMessage).mockImplementation((key) => {
        return key === 'extDefaultTitle' ? 'Control Panel' : '';
      });

      document.body.innerHTML = '<button data-i18n-title="extDefaultTitle">Click</button>';
      localizeDOM(document.body);
      expect(document.querySelector('button')?.title).toBe('Control Panel');
    });

    it('replaces [data-i18n-placeholder] on input elements', () => {
      vi.mocked(chrome.i18n.getMessage).mockImplementation((key) => {
        return key === 'chatInputPlaceholder' ? 'Type here…' : '';
      });

      document.body.innerHTML = '<input data-i18n-placeholder="chatInputPlaceholder" />';
      localizeDOM(document.body);
      expect((document.querySelector('input') as HTMLInputElement)?.placeholder).toBe('Type here…');
    });

    it('handles empty DOM without errors', () => {
      document.body.innerHTML = '';
      expect(() => localizeDOM(document.body)).not.toThrow();
    });
  });
});
