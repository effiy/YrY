/**
 * YiPet Popup — AppHeader
 * Branded gradient header (theme-following) with the extension icon, name,
 * tagline, and a live status pill (Active / Hidden).
 */

import { Typography } from 'antd';
import { t } from '@/shared/i18n';
import './AppHeader.css';

export interface AppHeaderProps {
  visible: boolean;
  statusText: string;
}

export function AppHeader(props: AppHeaderProps) {
  return (
    <header className="popup-header">
      <div className="popup-header-logo">
        <img
          className="popup-header-icon"
          src={chrome.runtime.getURL('assets/icons/icon.png')}
          alt="YiPet"
        />
        <div className="popup-header-brand">
          <Typography.Title level={4} className="popup-header-title">
            {t('extName')}
          </Typography.Title>
          <Typography.Text className="popup-header-sub">{t('popupSubtitle')}</Typography.Text>
        </div>
      </div>
      <span className={`popup-status-pill${props.visible ? ' is-active' : ' is-hidden'}`}>
        <span className="popup-status-dot" aria-hidden="true" />
        {props.statusText}
      </span>
    </header>
  );
}
