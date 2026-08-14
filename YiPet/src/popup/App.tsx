/**
 * YiPet Popup — Root Component (function component + hooks).
 * Wraps content in antd ConfigProvider so color theme changes apply live.
 *
 * Layout (top → bottom): gradient AppHeader → PetPreview (live) → Pet Settings
 * card (visibility / size / role / color / model / language) → collapsible
 * AboutCard → AppFooter.
 */

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  App as AntApp,
  Card,
  ConfigProvider,
  Form,
  Layout,
  Segmented,
  Select,
  Slider,
  Switch,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from '@/shared/i18n/index';
import type { SupportedLocale } from '@/shared/i18n/locale';
import { applyLocale, setUserLocale } from '@/shared/i18n/locale';
import { validateRole } from '@/shared/roles';
import { applyThemeColors, getAntdTheme } from '@/shared/theme';
import { AboutCard } from './components/AboutCard/AboutCard';
import { AppFooter } from './components/AppFooter/AppFooter';
import { AppHeader } from './components/AppHeader/AppHeader';
import { ColorPicker } from './components/ColorPicker/ColorPicker';
import { PetPreview } from './components/PetPreview/PetPreview';
import { RolePicker } from './components/RolePicker/RolePicker';
import { COLOR_OPTIONS, MODELS, POPUP_CONFIG } from './data';
import type { ChromeService } from './services/chrome';
import { createChromeService } from './services/chrome';
import { connect } from './services/connection';
import type { PopupState } from './types';

const { Content, Footer } = Layout;
const { useApp: useAntApp } = AntApp;

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

export function PopupApp() {
  const [state, setState] = useState<PopupState>(buildInitialState);
  const tabRef = useRef<chrome.tabs.Tab | null>(null);
  const chromeSvcRef = useRef<ChromeService | null>(null);
  const { message } = useAntApp();

  if (!chromeSvcRef.current) {
    chromeSvcRef.current = createChromeService(tabRef, POPUP_CONFIG.STORAGE_KEY);
  }

  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Actions ──────────────────────────────────────────────────────

  const send = useCallback(
    (opts: {
      msg: Record<string, unknown>;
      okMsg: string;
      optimistic?: Partial<PopupState>;
      onOk?: (response: Record<string, unknown>) => Partial<PopupState>;
    }) => {
      const chrome = chromeSvcRef.current;
      if (!chrome) return;
      if (opts.optimistic) {
        setState((s) => ({ ...s, ...opts.optimistic }));
      }
      chrome.sendMessage(opts.msg).then(
        (response: unknown) => {
          const r = response as Record<string, unknown> | null;
          if (!r || r.success === false) {
            message.error(t('errorOperationFailed'));
            return;
          }
          if (opts.onOk) {
            const patch = opts.onOk(r as Record<string, unknown>);
            setState((s) => ({ ...s, ...patch }));
          }
          chrome.saveState(stateRef.current as unknown as Record<string, unknown>);
          message.success(opts.okMsg);
        },
        (err: unknown) => {
          // Rejection: extension context invalidated, content script port closed, etc.
          const errMessage = err instanceof Error ? err.message : String(err);
          console.error('[YiPet Popup] sendMessage rejected:', errMessage);
          message.error(t('errorOperationFailed'));
        },
      );
    },
    [message],
  );

  const toggleVisibility = useCallback(() => {
    const visible = stateRef.current.visible;
    send({
      msg: { action: 'toggleVisibility' },
      okMsg: visible ? t('notifyHidden') : t('notifyShown'),
      onOk(response) {
        const next = response.visible !== undefined ? response.visible : !visible;
        return { visible: next as boolean };
      },
    });
  }, [send]);

  const previewSize = useCallback((v: number) => {
    setState((s) => ({ ...s, displaySize: v }));
  }, []);

  const updateSize = useCallback(
    (v: number | [number, number]) => {
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
    },
    [send],
  );

  const updateRole = useCallback(
    (role: string) => {
      const validated = validateRole(role);
      if (!validated) {
        console.warn('[YiPet Popup] Invalid role rejected:', role);
        return;
      }
      const chrome = chromeSvcRef.current;
      send({
        msg: { action: 'setRole', role: validated },
        okMsg: t('notifyRoleChanged', validated),
        optimistic: { role: validated },
        onOk(response) {
          if (chrome) {
            chrome.saveRolePreference(validated).catch(() => {});
          }
          return { role: (response.role || validated) as string };
        },
      });
    },
    [send],
  );

  const updateColor = useCallback(
    (idx: number) => {
      send({
        msg: { action: 'setColor', color: idx },
        okMsg: t('notifyColorSet'),
        optimistic: { color: idx },
      });
    },
    [send],
  );

  const updateModel = useCallback(
    (model: string) => {
      setState((s) => ({ ...s, model }));
      // Model has no content-script action; persist directly to global state.
      const chrome = chromeSvcRef.current;
      if (chrome) chrome.saveState({ ...stateRef.current, model });
      message.success(t('notifyModelUpdated'));
    },
    [message],
  );

  const changeLanguage = useCallback(
    (locale: SupportedLocale) => {
      setUserLocale(locale)
        .then(() => applyLocale(locale))
        .then(() => {
          setState((s) => ({ ...s, locale }));
          message.success(t('notifyLanguageChanged'));
        })
        .catch((err: Error) => {
          console.error('[YiPet Popup] applyLocale failed on switch:', err.message);
          setState((s) => ({ ...s, locale }));
        });
    },
    [message],
  );

  // ── Lifecycle ────────────────────────────────────────────────────

  useEffect(() => {
    const chromeSvc = chromeSvcRef.current;

    if (!chromeSvc) {
      setState((s) => ({
        ...s,
        controlsEnabled: true,
        hintText: t('popupStatusReadyOffline'),
      }));
      return;
    }

    let cancelled = false;

    chromeSvc
      .getActiveTab()
      .then((tab) => {
        if (cancelled) return;
        if (!tab) {
          message.error(t('errorTabNotFound'));
          setState((s) => ({
            ...s,
            controlsEnabled: true,
            hintText: t('popupStatusReadyOffline'),
          }));
          return;
        }
        connect({
          sendMessage: (msg) => chromeSvc.sendMessage(msg),
          loadState: () => chromeSvc.loadState(),
          onConnected(stored) {
            if (cancelled) return;
            setState((s) => {
              const next = { ...s };
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
              return next;
            });
            chromeSvc
              .sendMessage({ action: 'setVisibility', visible: stateRef.current.visible })
              .catch(() => {});
            chromeSvc
              .sendMessage({ action: 'changeSize', size: stateRef.current.size })
              .catch(() => {});
            if (!stateRef.current.role || stateRef.current.role === POPUP_CONFIG.DEFAULTS.ROLE) {
              chromeSvc
                .loadRolePreference()
                .then((savedRole) => {
                  if (savedRole && validateRole(savedRole) && savedRole !== stateRef.current.role) {
                    setState((s) => ({ ...s, role: savedRole }));
                    chromeSvc.sendMessage({ action: 'setRole', role: savedRole }).catch(() => {});
                  }
                })
                .catch(() => {});
            }
          },
          onFailed() {
            if (cancelled) return;
            message.error(t('errorContentScriptNotReady'));
            setState((s) => ({
              ...s,
              controlsEnabled: true,
              hintText: t('popupStatusReadyOffline'),
            }));
          },
        });
      })
      .catch((err: Error) => {
        console.error('[YiPet Popup] chrome.tabs.query failed:', err.message);
        message.error(t('errorInitFailed'));
        setState((s) => ({
          ...s,
          controlsEnabled: true,
          hintText: t('popupStatusReadyOffline'),
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [message]);

  // ── Render ───────────────────────────────────────────────────────

  // Inject CSS variables onto :root so popup's own CSS (var(--bg-primary), etc.)
  // follows the active color theme — including None (light palette, black text).
  useEffect(() => {
    applyThemeColors(document.documentElement, state.color);
  }, [state.color]);

  const theme = useMemo(() => getAntdTheme(state.color), [state.color]);
  const disabled = !state.controlsEnabled;

  const colorLabel = useMemo(
    () => COLOR_OPTIONS.find((c) => c.value === state.color)?.label ?? '',
    [state.color],
  );

  return (
    <ConfigProvider theme={theme}>
      <Layout className="popup-layout">
        <AppHeader
          visible={state.visible}
          statusText={state.visible ? t('popupStatusActive') : t('popupStatusHidden')}
        />
        <Content className="popup-content">
          <PetPreview
            role={state.role}
            size={state.displaySize}
            colorLabel={colorLabel}
            disabled={disabled}
          />

          <Card title={t('popupSettingsTitle')} size="small" className="popup-card">
            <Form layout="vertical" disabled={disabled}>
              <Form.Item label={t('popupSwitchLabel')} tooltip={t('popupSwitchDesc')}>
                <Switch
                  checked={state.visible}
                  onChange={toggleVisibility}
                  checkedChildren={<EyeOutlined />}
                  unCheckedChildren={<EyeInvisibleOutlined />}
                />
              </Form.Item>

              <Form.Item label={t('popupSizeLabel')}>
                <Slider
                  min={POPUP_CONFIG.SIZE.MIN}
                  max={POPUP_CONFIG.SIZE.MAX}
                  step={POPUP_CONFIG.SIZE.STEP}
                  marks={POPUP_CONFIG.SIZE.MARKS}
                  value={state.displaySize}
                  onChange={previewSize}
                  onChangeComplete={(v) => updateSize(v as number)}
                />
                <Typography.Text type="secondary">
                  {state.displaySize}
                  {t('popupSizeUnit')}
                </Typography.Text>
              </Form.Item>

              <Form.Item label={t('popupRoleLabel')}>
                <RolePicker value={state.role} onChange={updateRole} disabled={disabled} />
              </Form.Item>

              <Form.Item label={t('popupColorLabel')}>
                <ColorPicker value={state.color} onChange={updateColor} disabled={disabled} />
              </Form.Item>

              <Form.Item label={t('popupModelLabel')}>
                <Select
                  value={state.model}
                  onChange={(v) => updateModel(v as string)}
                  options={MODELS.map((m) => ({ value: m, label: m }))}
                />
              </Form.Item>

              <Form.Item label={t('popupLanguageLabel')}>
                <Segmented
                  value={state.locale}
                  onChange={(v) => changeLanguage(v as SupportedLocale)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'zh_CN', label: 'Simplified Chinese' },
                  ]}
                />
              </Form.Item>
            </Form>
          </Card>

          <AboutCard />
        </Content>
        <Footer className="popup-footer">
          <AppFooter
            hintText={state.hintText}
            version={t('popupVersion', POPUP_CONFIG.DEFAULTS.VERSION)}
          />
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
