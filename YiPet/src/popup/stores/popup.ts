/**
 * YiPet Popup — Pinia store.
 * Ported from the React useState/useCallback state in App.tsx.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { t } from '@/shared/i18n/index';
import type { SupportedLocale } from '@/shared/i18n/locale';
import { applyLocale, setUserLocale } from '@/shared/i18n/locale';
import { validateRole } from '@/shared/roles';
import { applyThemeColors } from '@/shared/theme';
import { COLOR_OPTIONS, MODELS, POPUP_CONFIG } from '../data';
import type { ChromeService } from '../services/chrome';
import { createChromeService } from '../services/chrome';
import { connect } from '../services/connection';
import type { PopupState } from '../types';
import { ElMessage } from 'element-plus';

function buildInitialState(): PopupState {
  const D = POPUP_CONFIG;
  return {
    visible: D.DEFAULTS.VISIBLE,
    size: D.DEFAULTS.SIZE,
    role: D.DEFAULTS.ROLE,
    color: D.DEFAULTS.COLOR,
    model: D.DEFAULTS.MODEL,
    displaySize: D.DEFAULTS.SIZE,
    controlsEnabled: false,
    hintText: t('popupStatusConnecting'),
    notification: { visible: false, message: '', type: 'info' },
    locale: 'en' as SupportedLocale,
  };
}

export const usePopupStore = defineStore('popup', () => {
  const state = ref<PopupState>(buildInitialState());
  const tabRef = ref<chrome.tabs.Tab | null>(null);
  let chromeSvc: ChromeService | null = null;

  const disabled = computed(() => !state.value.controlsEnabled);
  const colorLabel = computed(
    () => COLOR_OPTIONS.find((c) => c.value === state.value.color)?.label ?? '',
  );

  function getChrome(): ChromeService | null {
    if (!chromeSvc) {
      chromeSvc = createChromeService(
        {
          get current() { return tabRef.value; },
          set current(v: chrome.tabs.Tab | null) { tabRef.value = v; },
        },
        POPUP_CONFIG.STORAGE_KEY,
      );
    }
    return chromeSvc;
  }

  function send(opts: {
    msg: Record<string, unknown>;
    okMsg: string;
    optimistic?: Partial<PopupState>;
    onOk?: (response: Record<string, unknown>) => Partial<PopupState>;
  }) {
    const svc = getChrome();
    if (!svc) return;
    if (opts.optimistic) {
      state.value = { ...state.value, ...opts.optimistic };
    }
    svc.sendMessage(opts.msg).then(
      (response: unknown) => {
        const r = response as Record<string, unknown> | null;
        if (!r || r.success === false) {
          ElMessage.error(t('errorOperationFailed'));
          return;
        }
        if (opts.onOk) {
          const patch = opts.onOk(r as Record<string, unknown>);
          state.value = { ...state.value, ...patch };
        }
        svc!.saveState(state.value as unknown as Record<string, unknown>);
        ElMessage.success(opts.okMsg);
      },
      (err: unknown) => {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error('[YiPet Popup] sendMessage rejected:', errMsg);
        ElMessage.error(t('errorOperationFailed'));
      },
    );
  }

  function setVisibility(visible: boolean) {
    send({
      msg: { action: 'setVisibility', visible },
      okMsg: visible ? t('notifyShown') : t('notifyHidden'),
      optimistic: { visible },
      onOk(response) {
        return { visible: (response.visible !== undefined ? response.visible : visible) as boolean };
      },
    });
  }

  function previewSize(v: number) {
    state.value = { ...state.value, displaySize: v };
  }

  function updateSize(v: number | [number, number]) {
    const raw = Array.isArray(v) ? v[0] : v;
    const clamped = Math.max(
      POPUP_CONFIG.SIZE.MIN,
      Math.min(POPUP_CONFIG.SIZE.MAX, Number.isNaN(raw) ? POPUP_CONFIG.SIZE.MIN : raw),
    );
    send({
      msg: { action: 'changeSize', size: clamped },
      okMsg: t('notifySizeUpdated'),
      optimistic: { displaySize: clamped },
      onOk(response) {
        return { size: (response.size !== undefined ? response.size : clamped) as number };
      },
    });
  }

  function updateRole(role: string) {
    const validated = validateRole(role);
    if (!validated) {
      console.warn('[YiPet Popup] Invalid role rejected:', role);
      return;
    }
    send({
      msg: { action: 'setRole', role: validated },
      okMsg: t('notifyRoleChanged', validated),
      optimistic: { role: validated },
      onOk(response) {
        getChrome()?.saveRolePreference(validated).catch(() => {});
        return { role: (response.role || validated) as string };
      },
    });
  }

  function updateColor(idx: number) {
    send({
      msg: { action: 'setColor', color: idx },
      okMsg: t('notifyColorSet'),
      optimistic: { color: idx },
    });
  }

  function updateModel(model: string) {
    state.value = { ...state.value, model };
    const svc = getChrome();
    if (svc) svc.saveState({ ...state.value, model });
    ElMessage.success(t('notifyModelUpdated'));
  }

  function changeLanguage(locale: SupportedLocale) {
    setUserLocale(locale)
      .then(() => applyLocale(locale))
      .then(() => {
        state.value = { ...state.value, locale };
        ElMessage.success(t('notifyLanguageChanged'));
      })
      .catch((err: Error) => {
        console.error('[YiPet Popup] applyLocale failed on switch:', err.message);
        state.value = { ...state.value, locale };
      });
  }

  async function init() {
    const svc = getChrome();
    if (!svc) {
      state.value = {
        ...state.value,
        controlsEnabled: true,
        hintText: t('popupStatusReadyOffline'),
      };
      return;
    }

    try {
      const tab = await svc.getActiveTab();
      if (!tab) {
        ElMessage.error(t('errorTabNotFound'));
        state.value = {
          ...state.value,
          controlsEnabled: true,
          hintText: t('popupStatusReadyOffline'),
        };
        return;
      }
      connect({
        sendMessage: (msg) => svc.sendMessage(msg),
        loadState: () => svc.loadState(),
        onConnected(stored) {
          const next = { ...state.value };
          if (stored) {
            const KEYS = ['visible', 'size', 'role', 'color', 'model'] as const;
            for (const k of KEYS) {
              if (stored[k] !== undefined) {
                (next as Record<string, unknown>)[k] = stored[k];
              }
            }
            if ('size' in stored) next.displaySize = stored.size as number;
          }
          next.controlsEnabled = true;
          next.hintText = t('popupStatusReady');
          state.value = next;

          // Sync all state to content script so popup and pet stay in lockstep
          const s = state.value;
          svc.sendMessage({ action: 'setVisibility', visible: s.visible }).catch(() => {});
          svc.sendMessage({ action: 'changeSize', size: s.size }).catch(() => {});
          svc.sendMessage({ action: 'setColor', color: s.color }).catch(() => {});
          svc.sendMessage({ action: 'setRole', role: s.role }).catch(() => {});
        },
        onFailed() {
          ElMessage.error(t('errorContentScriptNotReady'));
          state.value = {
            ...state.value,
            controlsEnabled: true,
            hintText: t('popupStatusReadyOffline'),
          };
        },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[YiPet Popup] chrome.tabs.query failed:', errMsg);
      ElMessage.error(t('errorInitFailed'));
      state.value = {
        ...state.value,
        controlsEnabled: true,
        hintText: t('popupStatusReadyOffline'),
      };
    }
  }

  return {
    state,
    disabled,
    colorLabel,
    init,
    setVisibility,
    previewSize,
    updateSize,
    updateRole,
    updateColor,
    updateModel,
    changeLanguage,
  };
});