import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { warn } from 'tauri-plugin-log-api';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { invoke } from '@tauri-apps/api/tauri';
import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Updater from './window/Updater';
import Config from './window/Config';
import { useConfig } from './hooks';
import './style.css';
import './i18n';

const windowMap = {
    translate: <Translate />,
    screenshot: <Screenshot />,
    recognize: <Recognize />,
    config: <Config />,
    updater: <Updater />,
};

// 哪些 ctrl+function keys 白名单：避免在窗口里不小心触发浏览器默认菜单/编辑
const buildGlobalKeyHandler = (devMode) => async (e) => {
    const allowKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
    if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    const isFKey = e.key.startsWith('F') && e.key.length > 1;
    if (isFKey) {
        e.preventDefault();
        if (devMode && e.key === 'F12') await invoke('open_devtools');
    }
    if (e.key === 'Escape' && !devMode) await appWindow.close();
};

const SYSTEM_THEME_MEDIA = '(prefers-color-scheme: dark)';

export default function App() {
    const [devMode] = useConfig('dev_mode', false);
    const [appTheme] = useConfig('app_theme', 'system');
    const [appLanguage] = useConfig('app_language', 'en');
    const [appFont] = useConfig('app_font', 'default');
    const [appFallbackFont] = useConfig('app_fallback_font', 'default');
    const [appFontSize] = useConfig('app_font_size', 16);
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    // 全局 keydown：单份绑定（devMode 切换时重新绑定，unlisten 旧监听，避免多次叠加
    useEffect(() => {
        const handler = buildGlobalKeyHandler(Boolean(devMode));
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [devMode]);

    // 主题：system 模式下跟随系统，并提供 cleanup 移除监听
    useEffect(() => {
        if (appTheme === null) return;
        if (appTheme !== 'system') {
            setTheme(appTheme);
            return;
        }
        const apply = (dark) => setTheme(dark ? 'dark' : 'light');
        try {
            const mql = window.matchMedia(SYSTEM_THEME_MEDIA);
            apply(mql.matches);
            const onChange = (e) => apply(e.matches);
            mql.addEventListener?.('change', onChange);
            return () => mql.removeEventListener?.('change', onChange);
        } catch {
            warn("Can't detect system theme.");
        }
    }, [appTheme]);

    useEffect(() => {
        if (appLanguage !== null) {
            i18n.changeLanguage(appLanguage);
        }
    }, [appLanguage]);

    useEffect(() => {
        if (appFont === null || appFallbackFont === null) return;
        const pick = (name) => (name === 'default' ? 'sans-serif' : name);
        document.documentElement.style.fontFamily = `"${pick(appFont)}","${pick(appFallbackFont)}"`;
        if (appFontSize !== null) {
            document.documentElement.style.fontSize = `${appFontSize}px`;
        }
    }, [appFont, appFallbackFont, appFontSize]);

    return <BrowserRouter>{windowMap[appWindow.label]}</BrowserRouter>;
}
