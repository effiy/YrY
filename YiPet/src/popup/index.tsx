/**
 * YiPet Popup — Entry Point.
 * Initializes locale/timezone, then mounts <PopupApp /> via createRoot.
 */
import '@/shared/globals';
import { App as AntApp, ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import { applyLocale, resolveLocale } from '@/shared/i18n/locale';
import { getAntdTheme } from '@/shared/theme';
import { PopupApp } from './App';
import { POPUP_CONFIG } from './data';
import './index.css';

function Root() {
  return (
    <ConfigProvider theme={getAntdTheme(POPUP_CONFIG.DEFAULTS.COLOR)}>
      <AntApp>
        <PopupApp />
      </AntApp>
    </ConfigProvider>
  );
}

const rootEl = document.getElementById('app');
if (!rootEl) {
  console.error('[YiPet Popup] #app mount point not found');
} else {
  const root = createRoot(rootEl);
  resolveLocale()
    .then(({ locale }) => applyLocale(locale))
    .catch((err: Error) => {
      console.error('[YiPet Popup] applyLocale failed:', err.message);
    })
    .finally(() => {
      root.render(<Root />);
    });
}
