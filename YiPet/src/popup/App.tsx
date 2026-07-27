/**
 * YiPet Popup — Root Component (React 15 class component).
 * Extracted from popup.tsx for separation of concerns.
 */

import { t } from '@/shared/i18n/index';
import type { SupportedLocale } from '@/shared/i18n/locale';
import { applyLocale, setUserLocale } from '@/shared/i18n/locale';
import { validateRole } from '@/shared/roles';
import { applyThemeColors } from '@/shared/theme/colors';
import {
  AboutCard,
  AppFooter,
  AppHeader,
  LangSwitch,
  Notification,
  SelectRow,
  SettingsCard,
  SliderRow,
  SwitchRow,
} from './components';
import { POPUP_CONFIG } from './data';
import { createPopupServices } from './services';
import { connect } from './services/connection';

// CSS imports — only popup-level layout; component styles are co-located with each component
import './index.css';

// Types — co-located following Ant Design Pro data.d.ts pattern
import type { PopupState } from './types';

// ── Component ──────────────────────────────────────────────────────────

export class PopupComponent {
  state: PopupState;
  private _tabRef = { current: null as chrome.tabs.Tab | null };
  private _timerRef = { current: null as ReturnType<typeof setTimeout> | null };
  private _chrome: ReturnType<typeof createPopupServices>['chrome'] = null;
  private _notify: ReturnType<typeof createPopupServices>['notify'] = null;

  constructor() {
    const D = POPUP_CONFIG;
    this.state = {
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

    const svc = createPopupServices({
      tabRef: this._tabRef,
      timerRef: this._timerRef,
      storageKey: D.STORAGE_KEY,
      duration: D.TIMING.NOTIFICATION_DURATION,
      setState: (patch: Record<string, unknown>) => {
        Object.assign(this.state, patch);
        this._render();
      },
    });
    this._chrome = svc.chrome;
    this._notify = svc.notify;
  }

  // ── Actions ──────────────────────────────────────────────────────

  private _send(opts: {
    msg: Record<string, unknown>;
    okMsg: string;
    optimistic?: Record<string, unknown>;
    onOk?: (response: Record<string, unknown>) => Record<string, unknown>;
  }) {
    if (!this._chrome) return;
    if (opts.optimistic)
      Object.assign(this.state as unknown as Record<string, unknown>, opts.optimistic);

    this._chrome.sendMessage(opts.msg).then((response: unknown) => {
      const r = response as Record<string, unknown> | null;
      if (!r || r.success === false) {
        if (this._notify) this._notify.show(t('errorOperationFailed'), 'error');
        return;
      }
      if (opts.onOk) {
        const patch = opts.onOk(r as Record<string, unknown>);
        if (patch) Object.assign(this.state as unknown as Record<string, unknown>, patch);
      }
      if (this._chrome) this._chrome.saveState(this.state as unknown as Record<string, unknown>);
      if (this._notify) this._notify.show(opts.okMsg, 'success');
      if (opts.msg.action === 'setColor') {
        applyThemeColors(document.documentElement, this.state.color);
      }
      this._render();
    });
  }

  private _toggleVisibility() {
    const self = this;
    this._send({
      msg: { action: 'toggleVisibility' },
      okMsg: self.state.visible ? t('notifyHidden') : t('notifyShown'),
      onOk(response: Record<string, unknown>) {
        const next = response.visible !== undefined ? response.visible : !self.state.visible;
        return { visible: next };
      },
    });
  }

  private _previewSize(e: { target: { value: string } }) {
    const v = parseInt(e.target.value, 10);
    if (!Number.isNaN(v)) {
      this.state.displaySize = v;
      this._render();
    }
  }

  private _updateSize(e: { target: { value: string } }) {
    const v = Math.max(
      POPUP_CONFIG.SIZE.MIN,
      Math.min(POPUP_CONFIG.SIZE.MAX, parseInt(e.target.value, 10) || POPUP_CONFIG.SIZE.MIN),
    );
    this._send({
      msg: { action: 'changeSize', size: v },
      okMsg: t('notifySizeUpdated'),
      optimistic: { displaySize: v },
      onOk(response: Record<string, unknown>) {
        return { size: response.size !== undefined ? response.size : v };
      },
    });
  }

  private _updateRole(e: { target: { value: string } }) {
    const raw = String(e.target.value || POPUP_CONFIG.DEFAULTS.ROLE).trim();
    const role = validateRole(raw);
    if (!role) {
      console.warn('[YiPet Popup] Invalid role rejected:', raw);
      return;
    }
    const chromeSvc = this._chrome;
    this._send({
      msg: { action: 'setRole', role },
      okMsg: t('notifyRoleChanged', role),
      optimistic: { role },
      onOk(response: Record<string, unknown>) {
        if (chromeSvc) {
          chromeSvc.saveRolePreference(role).catch(() => {});
        }
        return { role: response.role || role };
      },
    });
  }

  private _updateColor(e: { target: { value: string } }) {
    const idx = parseInt(e.target.value, 10);
    if (Number.isNaN(idx)) return;
    this._send({
      msg: { action: 'setColor', color: idx },
      okMsg: t('notifyColorSet'),
      optimistic: { color: idx },
    });
  }

  // ── Language ────────────────────────────────────────────────────

  private _changeLanguage(locale: SupportedLocale) {
    setUserLocale(locale).then(() => {
      applyLocale(locale)
        .then(() => {
          this.state.locale = locale;
          this._render();
          if (this._notify) {
            this._notify.show(t('notifyLanguageChanged'), 'success');
          }
        })
        .catch((err: Error) => {
          console.error('[YiPet Popup] applyLocale failed on switch:', err.message);
          this.state.locale = locale;
          this._render();
        });
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  mount() {
    const self = this;

    this._render();

    if (!this._chrome) {
      self.state.controlsEnabled = true;
      self.state.hintText = t('popupStatusReadyOffline');
      self._render();
      return;
    }

    this._chrome
      .getActiveTab()
      .then((tab) => {
        if (!tab) {
          if (self._notify) self._notify.show(t('errorTabNotFound'), 'error');
          self.state.controlsEnabled = true;
          self.state.hintText = t('popupStatusReadyOffline');
          self._render();
          return;
        }

        connect({
          sendMessage: (msg: unknown) => self._chrome!.sendMessage(msg),
          loadState: () => self._chrome!.loadState(),
          onConnected(stored: Record<string, unknown> | null) {
            if (stored) {
              const KEYS = ['visible', 'size', 'role', 'color', 'model'];
              const st = self.state as unknown as Record<string, unknown>;
              for (const k of KEYS) {
                if (stored[k] !== undefined) st[k] = stored[k];
              }
              if ('size' in stored) st.displaySize = stored.size;
            }
            if (!self.state.role || self.state.role === POPUP_CONFIG.DEFAULTS.ROLE) {
              self
                ._chrome!.loadRolePreference()
                .then((savedRole) => {
                  if (savedRole && validateRole(savedRole) && savedRole !== self.state.role) {
                    self.state.role = savedRole;
                    self
                      ._chrome!.sendMessage({ action: 'setRole', role: savedRole })
                      .catch(() => {});
                    self._render();
                  }
                })
                .catch(() => {});
            }
            self.state.controlsEnabled = true;
            self.state.hintText = t('popupStatusReady');
            self._render();

            applyThemeColors(document.documentElement, self.state.color);

            self
              ._chrome!.sendMessage({
                action: 'setVisibility',
                visible: self.state.visible,
              })
              .catch(() => {});
          },
          onFailed() {
            if (self._notify) self._notify.show(t('errorContentScriptNotReady'), 'error');
            self.state.controlsEnabled = true;
            self.state.hintText = t('popupStatusReadyOffline');
            self._render();
          },
        });
      })
      .catch((err: Error) => {
        console.error('[YiPet Popup] chrome.tabs.query failed:', err.message);
        if (self._notify) self._notify.show(t('errorInitFailed'), 'error');
        self.state.controlsEnabled = true;
        self.state.hintText = t('popupStatusReadyOffline');
        self._render();
      });
  }

  unmount() {
    if (this._timerRef.current) {
      clearTimeout(this._timerRef.current);
      this._timerRef.current = null;
    }
  }

  // ── Render ───────────────────────────────────────────────────────

  private _render() {
    const rootEl = document.getElementById('app');
    if (!rootEl) return;
    const state = this.state;
    const disabled = !state.controlsEnabled;

    const c = React.createElement as (...args: unknown[]) => unknown;

    const el = c(
      'div',
      { className: 'popup-container' },
      c(AppHeader, {
        model: state.model,
        visible: state.visible,
        statusText: state.visible ? t('popupStatusActive') : t('popupStatusHidden'),
      }),
      c(
        'main',
        { className: 'main-content' + (disabled ? ' popup-controls-disabled' : '') },
        c(
          SettingsCard,
          null,
          c(SwitchRow, {
            label: t('popupSwitchLabel'),
            desc: t('popupSwitchDesc'),
            checked: state.visible,
            disabled,
            onChange: () => this._toggleVisibility(),
          }),
          c(SliderRow, {
            label: t('popupSizeLabel'),
            id: 'sizeSlider',
            value: state.displaySize,
            min: POPUP_CONFIG.SIZE.MIN,
            max: POPUP_CONFIG.SIZE.MAX,
            step: POPUP_CONFIG.SIZE.STEP,
            disabled,
            onInput: (e: { target: { value: string } }) => this._previewSize(e),
            onChange: (e: { target: { value: string } }) => this._updateSize(e),
          }),
          c(SelectRow, {
            label: t('popupRoleLabel'),
            id: 'roleSelect',
            value: state.role,
            disabled,
            onChange: (e: { target: { value: string } }) => this._updateRole(e),
            options: POPUP_CONFIG.ROLES.map((r: string) => ({ value: r, label: r })),
          }),
          c(SelectRow, {
            label: t('popupColorLabel'),
            id: 'colorSelect',
            value: state.color,
            disabled,
            onChange: (e: { target: { value: string } }) => this._updateColor(e),
            options: POPUP_CONFIG.COLORS,
          }),
          c(LangSwitch, {
            value: state.locale,
            disabled,
            onChange: (loc: SupportedLocale) => this._changeLanguage(loc),
          }),
        ),
        c(AboutCard, null),
      ),
      ...[
        c(AppFooter, {
          hintText: state.hintText,
          version: t('popupVersion', POPUP_CONFIG.DEFAULTS.VERSION),
        }),
        c(Notification, {
          visible: state.notification.visible,
          message: state.notification.message,
          type: state.notification.type,
        }),
      ],
    );

    (ReactDOM as unknown as { render: (e: unknown, c: HTMLElement) => void }).render(el, rootEl);
  }
}
