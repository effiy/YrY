import './AppHeader.css';
import { t } from '@/shared/i18n/index';

export interface AppHeaderProps {
  model: string | null;
  visible: boolean;
  statusText: string;
}

export function AppHeader(props: AppHeaderProps) {
  const dotColor = props.visible ? '#22c55e' : '#f59e0b';

  return (
    <header className="header">
      <div className="logo" data-icon={'💕'}>
        <div className="brand">
          <h1>{t('extName')}</h1>
          <span className="brand-sub">{t('popupModelPrefix', props.model || '-')}</span>
        </div>
      </div>
      <div
        className="status-indicator"
        role="status"
        aria-live="polite"
        style={{ '--status-dot-color': dotColor } as Record<string, string>}
      >
        <span className="status-text">{props.statusText}</span>
      </div>
    </header>
  );
}
