import './SettingsCard.css';
import { t } from '@/shared/i18n/index';

export function SettingsCard(props: { children?: unknown }) {
  return (
    <section className="card">
      <h2 className="card-title">{t('popupSettingsTitle')}</h2>
      <div className="setting-list">{props.children}</div>
    </section>
  );
}
