import { t } from '../../../shared/i18n';

export function AboutCard() {
  return (
    <section className="card">
      <h2 className="card-title">{t('aboutTitle')}</h2>
      <div className="setting-list">
        <div className="about-description">
          <p>{t('aboutDescription')}</p>
        </div>
        <div className="about-meta">
          <span className="about-version">{t('aboutVersion')}</span>
          <span className="about-tech">{t('aboutTechStack')}</span>
        </div>
      </div>
    </section>
  );
}
