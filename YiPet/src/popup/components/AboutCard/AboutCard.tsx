import './AboutCard.css';
import { t } from '@/shared/i18n/index';

export function AboutCard() {
  return (
    <section className="card">
      <h2 className="card-title">{t('aboutTitle')}</h2>
      <div className="setting-list">
        {/* Tagline */}
        <p className="about-tagline">{t('aboutTagline')}</p>

        {/* Description */}
        <div className="about-description">
          <p>{t('aboutDescription')}</p>
        </div>

        {/* Feature Highlights */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutFeaturesTitle')}</h3>
          <ul className="about-feature-list">
            <li className="about-feature-item">
              <span className="about-feature-icon">🐾</span>
              <span className="about-feature-text">{t('aboutFeaturePet')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">💬</span>
              <span className="about-feature-text">{t('aboutFeatureChat')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">🌐</span>
              <span className="about-feature-text">{t('aboutFeatureI18n')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">🕐</span>
              <span className="about-feature-text">{t('aboutFeatureTimezone')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">📦</span>
              <span className="about-feature-text">{t('aboutFeatureCDN')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">🔌</span>
              <span className="about-feature-text">{t('aboutFeatureApi')}</span>
            </li>
          </ul>
        </div>

        {/* Production Dependencies */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutProdDepsTitle')}</h3>
          <ul className="about-dep-list">
            <li className="about-dep-item">
              <span className="about-dep-name">react</span>
              <span className="about-dep-ver">15.6.1</span>
              <span className="about-dep-src">CDN</span>
            </li>
            <li className="about-dep-item">
              <span className="about-dep-name">react-dom</span>
              <span className="about-dep-ver">15.6.1</span>
              <span className="about-dep-src">CDN</span>
            </li>
            <li className="about-dep-item">
              <span className="about-dep-name">bootstrap</span>
              <span className="about-dep-ver">5.2.3</span>
              <span className="about-dep-src">CDN</span>
            </li>
          </ul>
        </div>

        {/* Development Dependencies */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutDevDepsTitle')}</h3>
          <ul className="about-dep-list">
            <li className="about-dep-item">
              <span className="about-dep-name">typescript</span>
              <span className="about-dep-ver">^5.5</span>
            </li>
            <li className="about-dep-item">
              <span className="about-dep-name">vite</span>
              <span className="about-dep-ver">^5.4</span>
            </li>
            <li className="about-dep-item">
              <span className="about-dep-name">vitest</span>
              <span className="about-dep-ver">^2.0</span>
            </li>
            <li className="about-dep-item">
              <span className="about-dep-name">@types/chrome</span>
              <span className="about-dep-ver">^0.0.270</span>
            </li>
            <li className="about-dep-item">
              <span className="about-dep-name">jsdom</span>
              <span className="about-dep-ver">^29.1</span>
            </li>
          </ul>
        </div>

        {/* Backend Connection */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutBackendTitle')}</h3>
          <p className="about-backend-desc">{t('aboutBackendDesc')}</p>
        </div>

        {/* Meta */}
        <div className="about-meta">
          <span className="about-version">{t('aboutVersion')}</span>
          <span className="about-tech">{t('aboutTechStack')}</span>
        </div>
      </div>
    </section>
  );
}
